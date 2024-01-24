import { useMemo } from 'react'
import type { Address } from 'viem'

import { getCoderByCoinName, getCoderByCoinType } from '@ensdomains/address-encoder'

import { supportedAddresses } from '@app/constants/supportedAddresses'
import { supportedGeneralRecordKeys } from '@app/constants/supportedGeneralRecordKeys'
import { supportedSocialRecordKeys } from '@app/constants/supportedSocialRecordKeys'

import { useRecords } from './ensjs/public/useRecords'
import { useDecodedName } from './ensjs/subgraph/useDecodedName'
import { useSubgraphRecords } from './ensjs/subgraph/useSubgraphRecords'

type UseProfileParameters = {
  name?: string
  enabled?: boolean
  resolverAddress?: Address
  subgraphEnabled?: boolean
}

export const useProfile = ({
  name,
  resolverAddress,
  subgraphEnabled = true,
  enabled = true,
}: UseProfileParameters) => {
  const {
    data: subgraphRecords,
    isLoading: isSubgraphRecordsLoading,
    isCachedData: isSubgraphRecordsCachedData,
    isFetching: isSubgraphRecordsFetching,
  } = useSubgraphRecords({ name, resolverAddress, enabled: enabled && subgraphEnabled })

  const {
    data: profile,
    isLoading: isProfileLoading,
    isCachedData: isProfileCachedData,
    isFetching: isProfileFetching,
  } = useRecords({
    name,
    resolver: resolverAddress
      ? {
          address: resolverAddress,
          fallbackOnly: false,
        }
      : undefined,
    texts: [
      ...new Set([
        ...supportedSocialRecordKeys,
        ...supportedGeneralRecordKeys,
        ...(subgraphRecords?.texts || []),
      ]),
    ],
    coins: [
      ...new Set([
        ...supportedAddresses.map((coinName) => getCoderByCoinName(coinName).coinType),
        ...(subgraphRecords?.coins
          .map((coinId) => parseInt(coinId))
          .filter((coinId) => !!getCoderByCoinType(coinId)) || []),
      ]),
    ],
    abi: true,
    contentHash: true,
    enabled: enabled && !!name,
  })

  const { data: decodedName } = useDecodedName({
    name,
    allowIncomplete: true,
    enabled: enabled && !!name && !!profile,
  })

  const returnProfile = useMemo(() => {
    if (!profile) return undefined
    return {
      ...profile,
      ...(decodedName
        ? {
            decodedName,
          }
        : {}),
      isMigrated: subgraphRecords?.isMigrated,
      createdAt: subgraphRecords?.createdAt,
      address: profile.coins.find((x) => x.id === 60)?.value as Address | undefined,
    }
  }, [profile, subgraphRecords, decodedName])

  return {
    data: returnProfile,
    isLoading: isSubgraphRecordsLoading || isProfileLoading,
    isCachedData: isSubgraphRecordsCachedData && isProfileCachedData,
    isFetching: isSubgraphRecordsFetching || isProfileFetching,
  }
}
