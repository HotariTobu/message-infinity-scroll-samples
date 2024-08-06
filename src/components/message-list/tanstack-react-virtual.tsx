import { useMessages } from '@/hooks/useMessages'
import { useVirtualizer, Virtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { MessageCard } from '../message-card'
import { LoadingHeader } from '../loading-header'

export const TanstackReactVirtual = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const ref = useRef({
    virtualizer: null as Virtualizer<Element, Element> | null,
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
    onChange: virtualizer => (ref.current.virtualizer = virtualizer),
  })

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  useEffect(() => {
    const { virtualizer, scrollArea } = ref.current
    if (virtualizer === null || scrollArea === null) {
      return
    }

    virtualizer.scrollToIndex(lastLoadedMessages.length, { align: 'start' })
  }, [lastLoadedMessages])

  useEffect(() => {
    const { scrollArea, nearBottom } = ref.current
    if (scrollArea === null || !nearBottom) {
      return
    }

    scrollArea.scrollTo({ top: totalSize, behavior: 'smooth' })
  }, [totalSize])

  useEffect(() => {
    const { footer } = ref.current
    if (footer === null) {
      return
    }

    footer.scrollIntoView({
      block: 'end',
    })
  }, [])

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
              <div
                key={message.messageId}
                data-index={virtualItem.index}
                ref={virtualItem.measureElement}
              >
                <MessageCard className="px-2 pt-2" message={message} />
              </div>
            )
          })}
        </div>

        <LoadingHeader
          isLoading={isLoading}
          hasMore={hasMore}
          ref={element => (ref.current.header = element)}
          onClick={loadMore}
        />
        <div
          className="h-32 absolute bottom-0"
          ref={element => (ref.current.footer = element)}
        />
      </div>
    </div>
  )
}
