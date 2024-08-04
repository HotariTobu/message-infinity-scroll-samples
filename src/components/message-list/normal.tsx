import { LoadingHeader } from '@/components/loading-header'
import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'

export const Normal = () => {
  const { messages, isLoading, hasMore, loadMore } = useMessages()

  const ref = useRef({
    scrollArea: null as Element | null,
    header: null as Element | null,
    footer: null as Element | null,
    atBottom: false,
  })

  useEffect(() => {
    const { scrollArea, header, footer } = ref.current
    if (scrollArea === null || header === null || footer === null) {
      return
    }

    const handleIntersection = async (entry: IntersectionObserverEntry) => {
      if (entry.target === footer) {
        ref.current.atBottom = entry.isIntersecting
      } else if (entry.target === header) {
        if (!entry.isIntersecting) {
          return
        }

        if (await loadMore()) {
          scrollArea.scroll(0, 500)
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

  useEffect(() => {
    const { footer, atBottom } = ref.current
    if (footer === null) {
      return
    }

    if (!atBottom) {
      return
    }

    footer.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages])

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
      className="relative h-full overflow-auto"
      ref={element => (ref.current.scrollArea = element)}
    >
      <div className="p-2 gap-2 flex flex-col-reverse absolute left-0 right-0">
        <div ref={element => (ref.current.footer = element)} />
        {messages.map(message => (
          <MessageCard message={message} key={message.messageId} />
        ))}
        <LoadingHeader
          isLoading={isLoading}
          hasMore={hasMore}
          ref={element => (ref.current.header = element)}
          onClick={loadMore}
        />
      </div>
    </div>
  )
}
