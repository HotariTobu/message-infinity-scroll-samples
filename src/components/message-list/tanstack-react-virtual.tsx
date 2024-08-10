import { useMessages } from '@/hooks/useMessages'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { MessageCard } from '../message-card'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'

export const TanstackReactVirtual = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const ref = useRef({
    scrollArea: null as Element | null,
    header: null as Element | null,
    footer: null as Element | null,
    nearBottom: false,
  })

  useEffect(() => {
    const { scrollArea, header, footer } = ref.current
    if (scrollArea === null || header === null || footer === null) {
      return
    }

    const handleIntersection = async (entry: IntersectionObserverEntry) => {
      if (entry.target === footer) {
        ref.current.nearBottom = entry.isIntersecting
      } else if (entry.target === header) {
        if (entry.isIntersecting) {
          loadMore()
        }
      }
    }

    const observer = new IntersectionObserver(
      entries => entries.forEach(handleIntersection),
      {
        root: scrollArea,
      }
    )

    observer.observe(header)
    observer.observe(footer)

    return () => observer.disconnect()
  }, [loadMore])

  const totalMessages = messages.concat(lastLoadedMessages)

  const virtualizer = useVirtualizer({
    count: totalMessages.length,
    getScrollElement: () => ref.current.scrollArea,
    estimateSize: () => 100,
  })

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    virtualizer.scrollToIndex(lastLoadedMessages.length, { align: 'start' })
  }, [lastLoadedMessages, virtualizer])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const { scrollArea, nearBottom } = ref.current
    if (scrollArea === null || !nearBottom) {
      return
    }

    scrollArea.scrollTo({
      top: totalSize,
      behavior: 'smooth',
    })
  }, [totalSize])

  // Scroll to the bottom at first.
  useEffect(() => {
    const { scrollArea } = ref.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: virtualizer.getTotalSize(),
    })
  }, [virtualizer])

  return (
    <div
      className="h-full overflow-auto contain-strict"
      ref={element => (ref.current.scrollArea = element)}
    >
      <div
        className="relative"
        style={{
          height: totalSize,
        }}
      >
        <div
          className="pb-2 absolute inset-x-0"
          style={{
            top: virtualItems.at(0)?.start,
          }}
        >
          {virtualItems.map(virtualItem => {
            const message = totalMessages.at(-virtualItem.index - 1)
            if (typeof message === 'undefined') {
              return
            }

            return (
              <MessageCard
                className="px-2 pt-2"
                message={message}
                key={message.messageId}
                data-index={virtualItem.index}
                ref={virtualItem.measureElement}
              />
            )
          })}
        </div>

        <LoadingTrigger
          isLoading={isLoading}
          hasMore={hasMore}
          ref={element => (ref.current.header = element)}
          onClick={loadMore}
        />
        <FollowingTrigger ref={element => (ref.current.footer = element)} />
      </div>
    </div>
  )
}
