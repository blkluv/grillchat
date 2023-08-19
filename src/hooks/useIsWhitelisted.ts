import { getWhitelistedAddressesInChatId } from '@/constants/chat'
import { getAccountDataQuery } from '@/services/subsocial/evmAddresses'
import { useMyAccount } from '@/stores/my-account'

export default function useIsWhitelisted(chatId: string) {
  const myAddress = useMyAccount((state) => state.address)

  const { data: accountData } = getAccountDataQuery.useQuery(myAddress ?? '')
  const myEvmAddress = accountData?.evmAddress

  const whitelistedAddresses = getWhitelistedAddressesInChatId(chatId)

  const isWhitelisted =
    whitelistedAddresses?.includes(myAddress ?? '') ||
    whitelistedAddresses?.includes(myEvmAddress?.toLowerCase() ?? '')

  if (whitelistedAddresses && (!myAddress || !isWhitelisted)) {
    return false
  }
  return true
}