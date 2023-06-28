import ProfilePreview from '@/components/ProfilePreview'
import { useExtensionModalState } from '@/stores/extension'
import { cx } from '@/utils/class-names'
import { useEffect, useState } from 'react'
import { ExtensionModalsProps } from '..'
import CommonExtensionModal from '../CommonExtensionModal'

export default function SecretBoxModal(props: ExtensionModalsProps) {
  const { closeModal, isOpen, initialData } = useExtensionModalState(
    'subsocial-secret-box'
  )

  const [recipient, setRecipient] = useState('')
  const initialRecipient = initialData.recipient
  useEffect(() => {
    if (initialRecipient) setRecipient(initialRecipient)
  }, [initialRecipient])

  return (
    <CommonExtensionModal
      title='📦 Secret Box'
      isOpen={isOpen}
      closeModal={closeModal}
      {...props}
    >
      <div className='mb-2 flex justify-between text-sm font-normal leading-4 text-gray-400'>
        Recipient
      </div>
      <div className={cx('mb-6 mt-2 rounded-2xl bg-background-lighter p-4')}>
        <ProfilePreview address={recipient} avatarClassName='h-12 w-12' />
      </div>
    </CommonExtensionModal>
  )
}
