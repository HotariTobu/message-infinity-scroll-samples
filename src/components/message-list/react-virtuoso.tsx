import { LoadingHeader } from '@/components/loading-header'
import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

type Context = {
  isLoading: boolean
  hasMore: boolean
}

const Header = (props: { context?: Context }) =>
  typeof props.context === 'undefined' ||
  props.context.hasMore || <LoadingHeader {...props.context} />

export const ReactVirtuoso = () => {
  const { messages, loadMore, ...context } = useMessages()

  const ref = useRef({
    virtuoso: null as VirtuosoHandle | null,
    endIndex: 0,
  })

  const handleAtTop = async (atTop: boolean) => {
    const { virtuoso } = ref.current
    if (virtuoso === null) {
      return
    }

    if (!atTop) {
      return
    }

    if (await loadMore()) {
      virtuoso.scrollToIndex(10)
    }
  }

  useEffect(() => {
    const { virtuoso, endIndex } = ref.current
    if (virtuoso === null) {
      return
    }

    if (endIndex < messages.length - 3) {
      return
    }

    setTimeout(() => {
      virtuoso.scrollToIndex({ index: 'LAST', behavior: 'smooth' })
    })
  }, [messages])

  useEffect(() => {
    const { virtuoso } = ref.current
    if (virtuoso === null) {
      return
    }

    setTimeout(() => {
      virtuoso.scrollToIndex({ index: 'LAST' })
    }, 300)
  }, [])

  return (
    <Virtuoso
      ref={virtuoso => (ref.current.virtuoso = virtuoso)}
      data={messages.toReversed()}
      initialTopMostItemIndex={{ index: 'LAST' }}
      context={context}
      components={{ Header }}
      followOutput={false}
      atTopStateChange={handleAtTop}
      rangeChanged={range => (ref.current.endIndex = range.endIndex)}
      computeItemKey={(_, message) => message.messageId}
      itemContent={(_, message) => (
        <MessageCard
          className="px-2 py-1 first:pt-2 last:pb-2"
          message={message}
        />
      )}
    />
  )
}
