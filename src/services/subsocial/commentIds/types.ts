import { PostContent } from '@subsocial/api/types'

export type SendMessageParams = {
  message?: string
  chatId: string
  replyTo?: string
  extensions?: PostContent['extensions']
}
export type OptimisticMessageIdData = {
  address: string
  messageData: PostContent
}
