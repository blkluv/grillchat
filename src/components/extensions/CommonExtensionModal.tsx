import { cx } from '@/utils/class-names'
import ChatForm from '../chats/ChatForm'
import Modal, { ModalProps } from '../modals/Modal'

export type CommonExtensionModalProps = ModalProps & {
  chatId: string
  sendButtonText?: string
  disableSendButton?: boolean
}

export default function CommonExtensionModal({
  chatId,
  sendButtonText,
  disableSendButton,
  ...props
}: CommonExtensionModalProps) {
  const commonClassName = cx('px-5 md:px-6')

  const isUsingBigButton = !!sendButtonText

  return (
    <Modal
      {...props}
      withCloseButton
      contentClassName='pb-0 px-0'
      titleClassName={commonClassName}
      descriptionClassName={commonClassName}
    >
      <div className={cx(commonClassName, 'border-b border-border-gray pb-6')}>
        {props.children}
      </div>
      <ChatForm
        chatId={chatId}
        className={cx('p-1', isUsingBigButton && 'pb-5 md:pb-6')}
        inputProps={{
          className: cx(
            'rounded-none bg-transparent pl-4 md:pl-5 py-4 pr-20',
            !isUsingBigButton && 'rounded-b-2xl',
            isUsingBigButton && '!ring-0'
          ),
        }}
        sendButtonProps={{
          disabled: disableSendButton,
          className: cx(!isUsingBigButton ? 'mr-4' : 'mx-5 md:px-6'),
        }}
      />
    </Modal>
  )
}
