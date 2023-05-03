import useWrapInRef from '@/hooks/useWrapInRef'
import { useIsAnyQueriesLoading } from '@/subsocial-query'
import { generateManuallyTriggeredPromise } from '@/utils/promise'
import { PostData } from '@subsocial/api/types'
import { UseQueryResult } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { getMessageElementId } from '../../helpers'

// TODO: refactor this hook to have better readability
export default function useGetMessageElement({
  messageIds,
  messageQueries,
  loadMore,
  loadedMessageQueries,
}: {
  messageIds: string[]
  messageQueries: UseQueryResult<PostData | null, unknown>[]
  loadedMessageQueries: UseQueryResult<PostData | null, unknown>[]
  loadMore: () => void
}) {
  const waitAllMessagesLoaded = useWaitMessagesLoading(messageQueries)

  const waitAllMessagesLoadedRef = useWrapInRef(waitAllMessagesLoaded)
  const messageIdsRef = useWrapInRef(messageIds)

  const promiseRef = useRef<{
    resolvers: Map<string, VoidFunction[]>
    waitingMessageIds: Set<string>
  }>({ resolvers: new Map(), waitingMessageIds: new Set() })

  const loadedMessageIds = useMemo(() => {
    const ids: string[] = []
    loadedMessageQueries.forEach((message) => {
      if (message.data?.id) {
        ids.push(message.data.id)
      }
    })
    return ids
  }, [loadedMessageQueries])

  const awaitableLoadMore = useAwaitableLoadMore(
    loadMore,
    loadedMessageIds.length
  )

  useEffect(() => {
    const { waitingMessageIds } = promiseRef.current
    waitingMessageIds.forEach((messageId) => {
      if (loadedMessageIds.includes(messageId)) {
        const resolvers = promiseRef.current.resolvers.get(messageId)
        resolvers?.forEach((resolve) => resolve())
        promiseRef.current.resolvers.delete(messageId)
        waitingMessageIds.delete(messageId)
      }
    })
  }, [loadedMessageIds])

  const loadMoreUntilMessageIsLoaded = async (messageId: string) => {
    const isMessageIdIncluded = messageIdsRef.current.includes(messageId)
    if (isMessageIdIncluded) return
    await awaitableLoadMore()
    await loadMoreUntilMessageIsLoaded(messageId)
  }

  const getChatElement = async (messageId: string) => {
    const { getPromise, getResolver } = generateManuallyTriggeredPromise()
    const elementId = getMessageElementId(messageId)
    const element = document.getElementById(elementId)
    if (element) return element

    const isMessageIdIncluded = messageIds.includes(messageId)
    if (!isMessageIdIncluded) {
      await loadMoreUntilMessageIsLoaded(messageId)
    }
    const { resolvers, waitingMessageIds } = promiseRef.current
    if (!resolvers.get(messageId)) {
      resolvers.set(messageId, [])
    }
    resolvers.get(messageId)?.push(getResolver())
    waitingMessageIds.add(messageId)
    await getPromise()
    await waitAllMessagesLoadedRef.current()

    return document.getElementById(elementId)
  }

  return getChatElement
}

function useAwaitableLoadMore(
  loadMore: () => void,
  loadedMessagesCount: number
) {
  const resolverRef = useRef<VoidFunction[]>([])

  useEffect(() => {
    const resolvers = resolverRef.current
    resolvers.forEach((resolve) => resolve())
    resolverRef.current = []
  }, [loadedMessagesCount])

  return async () => {
    const { getResolver, getPromise } = generateManuallyTriggeredPromise()
    loadMore()
    resolverRef.current.push(getResolver())
    await getPromise()
  }
}

function useWaitMessagesLoading(
  messagesQuery: UseQueryResult<PostData | null, unknown>[]
) {
  const resolverRef = useRef<VoidFunction[]>([])
  const isLoading = useIsAnyQueriesLoading(messagesQuery)

  useEffect(() => {
    if (!isLoading) {
      const resolvers = resolverRef.current
      resolvers.forEach((resolve) => resolve())
      resolverRef.current = []
    }
  }, [isLoading])

  return async () => {
    const { getResolver, getPromise } = generateManuallyTriggeredPromise()
    resolverRef.current.push(getResolver())
    if (isLoading) {
      await getPromise()
    }
  }
}
