import { CommonEVMLoginErrorContent } from '@/components/auth/CommonModalContent'
import { ContentProps } from '@/components/auth/ProfileModal/types'

function EvmLoginError({ setCurrentState, evmAddress }: ContentProps) {
  return (
    <CommonEVMLoginErrorContent
      setModalStep={() => setCurrentState('link-evm-address')}
      onError={() => setCurrentState('evm-linking-error')}
      signAndLinkOnConnect={!evmAddress}
    />
  )
}

export default EvmLoginError