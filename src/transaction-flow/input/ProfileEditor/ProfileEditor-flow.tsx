/* eslint-disable no-nested-ternary */
import { useCallback, useEffect, useState } from 'react'
import { Control, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { Button, Dialog, PlusSVG, ScrollBox, mq } from '@ensdomains/thorin'

import { AvatarViewManager } from '@app/components/@molecules/ProfileEditor/Avatar/AvatarViewManager'
import { CustomProfileRecordInput } from '@app/components/pages/profile/[name]/registration/steps/Profile/CustomProfileRecordInput'
import { ProfileRecordInput } from '@app/components/pages/profile/[name]/registration/steps/Profile/ProfileRecordInput'
import { ProfileRecordTextarea } from '@app/components/pages/profile/[name]/registration/steps/Profile/ProfileRecordTextarea'
import { useBasicName } from '@app/hooks/useBasicName'
import { useContractAddress } from '@app/hooks/useContractAddress'
import { useProfile } from '@app/hooks/useProfile'
import { useResolverStatus } from '@app/hooks/useResolverStatus'
import TransactionLoader from '@app/transaction-flow/TransactionLoader'
import { makeIntroItem } from '@app/transaction-flow/intro'
import { TransactionItem, makeTransactionItem } from '@app/transaction-flow/transaction'
import type { TransactionDialogPassthrough } from '@app/transaction-flow/types'

import { AddProfileRecordView } from '../../../components/pages/profile/[name]/registration/steps/Profile/AddProfileRecordView'
import {
  getProfileRecordsDiff,
  profileEditorFormToProfileRecords,
  profileToProfileRecords,
} from '../../../components/pages/profile/[name]/registration/steps/Profile/profileRecordUtils'
import { ProfileRecord } from '../../../constants/profileRecordOptions'
import { ProfileEditorForm, useProfileEditorForm } from '../../../hooks/useProfileEditorForm'
import ResolverWarningOverlay from './ResolverWarningOverlay'
import { WrappedAvatarButton } from './WrappedAvatarButton'

const Container = styled.form(({ theme }) => [
  css`
    width: 100%;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    gap: ${theme.space['4']};
  `,
  mq.sm.min(css`
    width: 520px;
  `),
])

const AvatarWrapper = styled.div(
  () => css`
    display: flex;
    justify-content: center;
  `,
)

const StyledScrollBox = styled(ScrollBox)(
  ({ theme }) => css`
    margin-right: -${theme.space['2']};
    flex: 1;
  `,
)

const ScrollContentContainer = styled.div(
  ({ theme }) => css`
    display: flex;
    position: relative;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
    gap: ${theme.space['4']};
    padding-right: ${theme.space['1']};
    padding-bottom: ${theme.space['4']};
  `,
)

const Divider = styled.div(
  ({ theme }) => css`
    width: ${theme.space.full};
    height: ${theme.space.px};
    background: ${theme.colors.border};

    /* stylelint-disable-next-line value-no-vendor-prefix */
    position: -webkit-sticky;
    position: sticky;
    bottom: 0;
  `,
)

const ButtonContainer = styled.div(
  () => css`
    display: flex;
    justify-content: center;
  `,
)

const ButtonWrapper = styled.div(({ theme }) => [
  css`
    width: ${theme.space.full};
  `,
  mq.xs.min(css`
    width: max-content;
  `),
])

type Data = {
  name?: string
  resumable?: boolean
}

export type Props = {
  name?: string
  data?: Data
  onDismiss?: () => void
} & TransactionDialogPassthrough

const SubmitButton = ({
  control,
  previousRecords,
  disabled: _disabled,
}: {
  control: Control<ProfileEditorForm>
  previousRecords: ProfileRecord[]
  disabled: boolean
}) => {
  const { t } = useTranslation('common')

  // Precompute the records that will be submitted
  const form = useWatch({ control }) as ProfileEditorForm
  const currentRecords = profileEditorFormToProfileRecords(form)
  const recordsDiff = getProfileRecordsDiff(currentRecords, previousRecords)

  const disabled = _disabled || recordsDiff.length === 0

  return (
    <Button type="submit" disabled={disabled} data-testid="profile-submit-button">
      {t('action.next')}
    </Button>
  )
}
const ProfileEditor = ({ data = {}, transactions = [], dispatch, onDismiss }: Props) => {
  const { t } = useTranslation('register')

  const [view, setView] = useState<'editor' | 'upload' | 'nft' | 'add-record' | 'warning'>('editor')

  const { name = '', resumable = false } = data

  const { profile, loading: profileLoading } = useProfile(name, name !== '')
  const { isWrapped } = useBasicName(name, true)
  const existingRecords = profileToProfileRecords(profile)
  const {
    records: profileRecords,
    register,
    trigger,
    control,
    handleSubmit,
    addRecords,
    updateRecord,
    removeRecordAtIndex,
    removeRecordByGroupAndKey,
    setAvatar,
    labelForRecord,
    secondaryLabelForRecord,
    placeholderForRecord,
    validatorForRecord,
    errorForRecordAtIndex,
    isDirtyForRecordAtIndex,
    hasErrors,
  } = useProfileEditorForm(existingRecords)

  // Update profile records if transaction data exists
  const [isRecordsUpdated, setIsRecordsUpdated] = useState(false)
  useEffect(() => {
    const updateProfileRecordsWithTransactionData = () => {
      const transaction = transactions.find(
        (item: TransactionItem) => item.name === 'updateProfileRecords',
      )
      if (!transaction) return
      const updatedRecords: ProfileRecord[] = transaction?.data?.records || []
      updatedRecords.forEach((record) => {
        if (record.key === 'avatar' && record.group === 'media') {
          setAvatar(record.value)
        } else {
          updateRecord(record)
        }
      })
      existingRecords.forEach((record) => {
        const updatedRecord = updatedRecords.find(
          (r) => r.group === record.group && r.key === record.key,
        )
        if (!updatedRecord) {
          removeRecordByGroupAndKey(record.group, record.key)
        }
      })
    }
    if (!profileLoading) {
      updateProfileRecordsWithTransactionData()
      setIsRecordsUpdated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoading, transactions, setIsRecordsUpdated, isRecordsUpdated])

  const resolverAddress = useContractAddress('PublicResolver')

  const { status, loading: statusLoading } = useResolverStatus(name, profileLoading, {
    skipCompare: resumable,
  })

  const handleCreateTransaction = useCallback(
    async (form: ProfileEditorForm) => {
      if (!profile?.resolverAddress || !resolverAddress) return
      if (status?.hasLatestResolver) {
        const records = profileEditorFormToProfileRecords(form)
        dispatch({
          name: 'setTransactions',
          payload: [
            makeTransactionItem('updateProfileRecords', {
              name,
              resolver: profile.resolverAddress,
              records,
              previousRecords: existingRecords,
              clearRecords: false,
            }),
          ],
        })
        dispatch({ name: 'setFlowStage', payload: 'transaction' })
        return
      }

      dispatch({
        name: 'startFlow',
        key: `edit-profile-flow-${name}`,
        payload: {
          intro: {
            title: 'Action Required',
            content: makeIntroItem('MigrateAndUpdateResolver', { name }),
          },
          transactions: [
            makeTransactionItem('updateProfileRecords', {
              name,
              records: form.records,
              resolver: resolverAddress,
              clearRecords: false,
            }),
            makeTransactionItem('updateResolver', {
              name,
              resolver: resolverAddress,
              oldResolver: profile!.resolverAddress!,
              contract: isWrapped ? 'nameWrapper' : 'registry',
            }),
          ],
          resumable: true,
        },
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profile, status, resolverAddress],
  )

  const [avatarSrc, setAvatarSrc] = useState<string | undefined>()
  const [avatarFile, setAvatarFile] = useState<File | undefined>()

  useEffect(() => {
    if ((!statusLoading && !status?.hasLatestResolver) || resumable) {
      setView('warning')
    }
  }, [status, statusLoading, resumable])

  const handleDeleteRecord = (record: ProfileRecord, index: number) => {
    removeRecordAtIndex(index)
  }

  const handleShowAddRecordModal = () => {
    setView('add-record')
  }

  if (profileLoading || statusLoading || !isRecordsUpdated) return <TransactionLoader />
  return (
    <Container
      style={{ maxHeight: '600px', display: 'flex', flexDirection: 'column' }}
      onSubmit={handleSubmit((_data, event) => {
        event?.preventDefault()
        handleCreateTransaction(_data)
      })}
    >
      {view === 'editor' ? (
        <>
          <Dialog.Heading title="Edit your profile" />
          <StyledScrollBox hideDividers={{ bottom: true }}>
            <ScrollContentContainer>
              <AvatarWrapper>
                <WrappedAvatarButton
                  name={name}
                  control={control}
                  src={avatarSrc}
                  onSelectOption={(option) => setView(option)}
                  onAvatarChange={(avatar) => setAvatar(avatar)}
                  onAvatarFileChange={(file) => setAvatarFile(file)}
                  onAvatarSrcChange={(src) => setAvatarSrc(src)}
                />
              </AvatarWrapper>
              {profileRecords.map((field, index) =>
                field.group === 'custom' ? (
                  <CustomProfileRecordInput
                    key={field.id}
                    register={register}
                    trigger={trigger}
                    index={index}
                    validator={validatorForRecord(field)}
                    validated={isDirtyForRecordAtIndex(index)}
                    error={errorForRecordAtIndex(index, 'key')}
                    onDelete={() => handleDeleteRecord(field, index)}
                  />
                ) : field.key === 'description' ? (
                  <ProfileRecordTextarea
                    key={field.id}
                    recordKey={field.key}
                    label={labelForRecord(field)}
                    secondaryLabel={secondaryLabelForRecord(field)}
                    placeholder={placeholderForRecord(field)}
                    error={errorForRecordAtIndex(index)}
                    validated={isDirtyForRecordAtIndex(index)}
                    onDelete={() => handleDeleteRecord(field, index)}
                    {...register(`records.${index}.value`, {
                      validate: validatorForRecord(field),
                    })}
                  />
                ) : (
                  <ProfileRecordInput
                    key={field.id}
                    recordKey={field.key}
                    group={field.group}
                    label={labelForRecord(field)}
                    secondaryLabel={secondaryLabelForRecord(field)}
                    placeholder={placeholderForRecord(field)}
                    error={errorForRecordAtIndex(index)}
                    validated={isDirtyForRecordAtIndex(index)}
                    onDelete={() => handleDeleteRecord(field, index)}
                    {...register(`records.${index}.value`, {
                      validate: validatorForRecord(field),
                    })}
                  />
                ),
              )}
              <ButtonContainer>
                <ButtonWrapper>
                  <Button
                    size="medium"
                    onClick={handleShowAddRecordModal}
                    data-testid="show-add-profile-records-modal-button"
                    prefix={<PlusSVG />}
                  >
                    {t('steps.profile.addMore')}
                  </Button>
                </ButtonWrapper>
              </ButtonContainer>
            </ScrollContentContainer>
            <Divider />
          </StyledScrollBox>
          <Dialog.Footer
            leading={
              <Button
                id="profile-back-button"
                type="button"
                colorStyle="accentSecondary"
                data-testid="profile-back-button"
                onClick={() => {
                  dispatch({ name: 'stopFlow' })
                }}
              >
                {t('action.cancel', { ns: 'common' })}
              </Button>
            }
            trailing={
              <SubmitButton
                control={control}
                disabled={hasErrors}
                previousRecords={existingRecords}
              />
            }
          />
        </>
      ) : view === 'add-record' ? (
        <AddProfileRecordView
          control={control}
          onAdd={(newRecords) => {
            addRecords(newRecords)
            setView('editor')
          }}
          onClose={() => setView('editor')}
        />
      ) : view === 'warning' ? (
        <ResolverWarningOverlay
          name={name}
          isWrapped={isWrapped}
          hasOldRegistry={!profile?.isMigrated}
          resumable={resumable}
          hasNoResolver={!status?.hasResolver}
          hasMigratedProfile={status?.hasMigratedProfile}
          latestResolver={resolverAddress!}
          oldResolver={profile?.resolverAddress!}
          dispatch={dispatch}
          onDismiss={onDismiss}
          onDismissOverlay={() => setView('editor')}
        />
      ) : view === 'upload' || view === 'nft' ? (
        <AvatarViewManager
          name={name}
          avatarFile={avatarFile}
          handleCancel={() => setView('editor')}
          type={view}
          handleSubmit={(type: 'upload' | 'nft', uri: string, display?: string) => {
            if (type === 'nft') {
              setAvatar(uri)
              setAvatarSrc(display)
            } else {
              setAvatar(`${uri}?timestamp=${Date.now()}`)
              setAvatarSrc(display)
            }
            setView('editor')
            trigger()
          }}
        />
      ) : null}
    </Container>
  )
}

export default ProfileEditor
