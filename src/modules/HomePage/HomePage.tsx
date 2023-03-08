import ChatPreview from '@/components/chats/ChatPreview'
import {
  getPostIdsBySpaceIdQuery,
  getPostQuery,
} from '@/services/subsocial/posts'
import { getSpaceId } from '@/utils/env/client'
import { getIpfsContentUrl } from '@/utils/ipfs'
import { createPostSlug } from '@subsocial/utils/slugify'
import dynamic from 'next/dynamic'

const WelcomeModal = dynamic(() => import('./WelcomeModal'), { ssr: false })

export default function HomePage() {
  const { data } = getPostIdsBySpaceIdQuery.useQuery(getSpaceId())

  return (
    <>
      <WelcomeModal />
      <div className='flex flex-col'>
        {(data?.postIds ?? []).map((postId) => (
          <ChatPreviewContainer postId={postId} key={postId} />
        ))}
      </div>
    </>
  )
}

function ChatPreviewContainer({ postId }: { postId: string }) {
  const { data } = getPostQuery.useQuery(postId)
  const content = data?.content
  return (
    <ChatPreview
      key={postId}
      asContainer
      asLink={{
        href: {
          pathname: '/chats/[topic]',
          query: {
            topic: createPostSlug(postId, { title: data?.content?.title }),
          },
        },
      }}
      image={content?.image ? getIpfsContentUrl(content.image) : ''}
      title={data?.content?.title ?? ''}
      description={data?.content?.body ?? ''}
      postId={postId}
      withUnreadCount
    />
  )
}
