import useRandomColor from '@/hooks/useRandomColor'
import { getProfileQuery } from '@/services/mainnet-squid/query'
import { getAccountDataQuery } from '@/services/subsocial/evmAddresses'
import { cx } from '@/utils/class-names'
import { getIpfsContentUrl } from '@/utils/ipfs'
import * as bottts from '@dicebear/bottts'
import { createAvatar } from '@dicebear/core'
import Image from 'next/image'
import {
  ComponentProps,
  forwardRef,
  useCallback,
  useMemo,
  useState,
} from 'react'

export const resolveEnsAvatarSrc = (ensName: string) =>
  `https://metadata.ens.domains/mainnet/avatar/${ensName}`

export type AddressAvatarProps = ComponentProps<'div'> & {
  address: string
}

const AddressAvatar = forwardRef<HTMLDivElement, AddressAvatarProps>(
  function AddressAvatar({ address, ...props }: AddressAvatarProps, ref) {
    const backgroundColor = useRandomColor(address, {
      isAddress: true,
      theme: 'dark',
    })

    const [isEnsAvatarError, setIsEnsAvatarError] = useState(false)
    const [isProfileAvatarError, setIsProfileAvatarError] = useState(false)

    const onProfileImageError = useCallback(
      () => setIsProfileAvatarError(true),
      []
    )
    const onEnsImageError = useCallback(() => setIsEnsAvatarError(true), [])

    const { data: accountData, isLoading } =
      getAccountDataQuery.useQuery(address)

    const { data: profile } = getProfileQuery.useQuery(address)

    const { ensName } = accountData || {}

    const avatar = useMemo(() => {
      return createAvatar(bottts, {
        size: 128,
        seed: address,
      }).toDataUriSync()
    }, [address])

    if (isLoading) {
      return (
        <div
          className={cx(
            'relative flex flex-shrink-0 animate-pulse items-stretch gap-2.5 overflow-hidden outline-none'
          )}
        >
          <div
            style={{ backgroundClip: 'padding-box' }}
            className={cx(
              'bg-background-light',
              'rounded-full',
              'h-9 w-9 self-center',
              props.className
            )}
          ></div>
        </div>
      )
    }

    let profileAvatar = profile?.profileSpace?.image

    return (
      <div
        {...props}
        ref={ref}
        className={cx(
          'relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-background-lightest',
          props.className
        )}
        style={{ backgroundColor }}
      >
        {ensName && (
          <div
            className={cx(
              'absolute inset-0 h-full w-full transition-opacity',
              !isEnsAvatarError ? 'z-10 opacity-100' : '-z-10 opacity-0'
            )}
          >
            <div className='relative h-full w-full'>
              <Image
                sizes='5rem'
                className='relative rounded-full'
                fill
                src={resolveEnsAvatarSrc(ensName)}
                onError={onEnsImageError}
                alt='avatar'
              />
            </div>
          </div>
        )}

        {profileAvatar && (
          <div
            className={cx(
              'absolute inset-0 h-full w-full transition-opacity',
              !isProfileAvatarError ? 'z-10 opacity-100' : '-z-10 opacity-0'
            )}
          >
            <div className='relative h-full w-full'>
              <Image
                sizes='5rem'
                className='relative rounded-full'
                fill
                src={getIpfsContentUrl(profileAvatar)}
                onError={onProfileImageError}
                alt='avatar'
              />
            </div>
          </div>
        )}

        <div className={cx('relative h-full w-full p-[7.5%]')}>
          <div className='relative h-full w-full'>
            <Image
              sizes='5rem'
              className='relative rounded-full'
              fill
              src={avatar}
              alt='avatar'
            />
          </div>
        </div>
      </div>
    )
  }
)

export default AddressAvatar
