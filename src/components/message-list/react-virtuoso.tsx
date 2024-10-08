import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { LoadingTrigger } from '../loading-trigger'

type Context = {
  isLoading: boolean
  hasMore: boolean
}

const Header = (props: { context?: Context }) =>
  typeof props.context === 'undefined' || <LoadingTrigger {...props.context} />

const Footer = () => <div className="h-2" />

export const ReactVirtuoso = () => {
  const { lastLoadedMessages, messages, loadMore, ...context } = useMessages()

  const virtuosoRef = useRef<VirtuosoHandle | null>(null)

  const ref = useRef({
    nearBottom: false,
  })

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    const virtuoso = virtuosoRef.current
    if (virtuoso === null) {
      return
    }

    virtuoso.scrollToIndex(lastLoadedMessages.length)
  }, [lastLoadedMessages])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const virtuoso = virtuosoRef.current
    const { nearBottom } = ref.current
    if (virtuoso === null || !nearBottom) {
      return
    }

    setTimeout(() => {
      virtuoso.scrollToIndex({
        index: 'LAST',
        behavior: 'smooth',
      })
    })
  }, [messages])

  // Scroll to the bottom at first.
  useEffect(() => {
    const virtuoso = virtuosoRef.current
    if (virtuoso === null) {
      return
    }

    virtuoso.scrollToIndex({
      index: 'LAST',
    })
  }, [])

  const totalMessages = messages.concat(lastLoadedMessages)

  const handleAtTop = (atTop: boolean) => {
    if (atTop) {
      loadMore()
    }
  }

  const handleAtBottom = (atBottom: boolean) => {
    ref.current.nearBottom = atBottom
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      followOutput={false}
      atTopThreshold={64}
      atTopStateChange={handleAtTop}
      atBottomThreshold={128}
      atBottomStateChange={handleAtBottom}
      data={totalMessages.toReversed()}
      context={context}
      components={{ Header, Footer }}
      computeItemKey={(_, message) => message.messageId}
      itemContent={(_, message) => (
        <MessageCard className="px-2 pt-2" message={message} />
      )}
    />
  )
}
