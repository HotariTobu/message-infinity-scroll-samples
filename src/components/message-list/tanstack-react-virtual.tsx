import { useMessages } from '@/hooks/useMessages'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { MessageCard } from '../message-card'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'

export const TanstackReactVirtual = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const ref = useRef({
    nearBottom: false,
  })

  const totalMessages = messages.concat(lastLoadedMessages)

  const virtualizer = useVirtualizer({
    count: totalMessages.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 100,
  })

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    const header = headerRef.current
    const footer = footerRef.current
    if (scrollArea === null || header === null || footer === null) {
      return
    }

    const handleIntersection = async (entry: IntersectionObserverEntry) => {
      if (entry.target === header) {
        if (entry.isIntersecting) {
          loadMore()
        }
      } else if (entry.target === footer) {
        ref.current.nearBottom = entry.isIntersecting
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

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    virtualizer.scrollToIndex(lastLoadedMessages.length, { align: 'start' })
  }, [lastLoadedMessages, virtualizer])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    const { nearBottom } = ref.current
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
    const scrollArea = scrollAreaRef.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: virtualizer.getTotalSize(),
    })
  }, [virtualizer])

  return (
    <div className="h-full overflow-auto contain-strict" ref={scrollAreaRef}>
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
          ref={headerRef}
        />
        <FollowingTrigger ref={footerRef} />
      </div>
    </div>
  )
}
