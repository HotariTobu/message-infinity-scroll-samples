import { useMessages } from '@/hooks/useMessages'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef } from 'react'
import { MessageCard } from '../message-card'
import { LoadingHeader } from '../loading-header'

export const TanstackReactVirtual = () => {
  const { messages, isLoading, hasMore, loadMore } = useMessages()

  const ref = useRef({
    scrollArea: null as Element | null,
  })

  const virtualizer = useVirtualizer({
    count: messages.length + 1,
    getScrollElement: () => ref.current.scrollArea,
    estimateSize: () => 100,
  })

  const totalSize = virtualizer.getTotalSize()
  const virtualItems = virtualizer.getVirtualItems()

  const firstVirtualItem = virtualItems.at(0)
  const lastVirtualItem = virtualItems.at(-1)

  const nearTop = firstVirtualItem?.index === 0
  const nearBottom = lastVirtualItem?.index === messages.length

  const handleScroll = async () => {
    const { scrollArea } = ref.current
    if (scrollArea === null) {
      return
    }

    const atTop = scrollArea.scrollTop === 0
    if (!atTop) {
      return
    }

    if (await loadMore()) {
      virtualizer.scrollToIndex(10 + 1, { align: 'start' })
    }
  }

  useEffect(() => {
    const { scrollArea } = ref.current
    if (scrollArea === null) {
      return
    }

    if (nearBottom) {
      scrollArea.scroll({ top: totalSize, behavior: 'smooth' })
    }
  }, [nearBottom, totalSize])

  useEffect(() => {
    const { scrollArea } = ref.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scroll({ top: scrollArea.scrollHeight })
  }, [])

  return (
    <div
      className="h-full overflow-auto contain-strict"
      ref={element => (ref.current.scrollArea = element)}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{
          height: totalSize,
        }}
      >
        <div
          className="absolute left-0 right-0"
          style={{
            top: firstVirtualItem?.start,
          }}
        >
          {nearTop && (
            <div data-index={0} ref={firstVirtualItem.measureElement}>
              <LoadingHeader isLoading={isLoading} hasMore={hasMore} />
            </div>
          )}
          {virtualItems.slice(nearTop ? 1 : 0).map(virtualItem => {
            const message = messages[messages.length - virtualItem.index]
            return (
              <div
                key={message.messageId}
                data-index={virtualItem.index}
                ref={virtualItem.measureElement}
              >
                <MessageCard className="px-2 py-1" message={message} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
