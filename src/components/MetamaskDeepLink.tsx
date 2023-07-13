import { ACCOUNT_SECRET_KEY_URL_PARAMS } from '@/pages/account'
import { useMyAccount } from '@/stores/my-account'
import { getCurrentUrlOrigin } from '@/utils/links'
import { useRouter } from 'next/router'
import urlJoin from 'url-join'
import Button, { ButtonProps } from './Button'

export type MetamaskDeeplinkProps = ButtonProps & {
  customDeeplinkReturnUrl?: (currentUrl: string) => string
}

export function isInsideMetamaskBrowser() {
  return (
    typeof window === 'undefined' ||
    // !isTouchDevice() ||
    (window as any).ethereum
  )
}

export default function MetamaskDeepLink({
  customDeeplinkReturnUrl,
  ...props
}: MetamaskDeeplinkProps) {
  const router = useRouter()
  const encodedSecretKey = useMyAccount((state) => state.encodedSecretKey)

  const shareSessionUrl = urlJoin(
    getCurrentUrlOrigin(),
    `/account?${ACCOUNT_SECRET_KEY_URL_PARAMS}=${encodedSecretKey}&returnUrl=${encodeURIComponent(
      customDeeplinkReturnUrl?.(router.asPath) ?? router.asPath
    )}`
  )

  return (
    <Button
      {...props}
      href={`https://metamask.app.link/dapp/${shareSessionUrl.replace(
        /^https:\/\/w?w?w?\.?/,
        ''
      )}`}
    />
  )
}
