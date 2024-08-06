import { LoadingHeader } from '@/components/loading-header'
import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'

export const Normal = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const ref = useRef({
    scrollArea: null as Element | null,
    lastLoadedArea: null as Element | null,
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

  useEffect(() => {
    const { scrollArea, lastLoadedArea } = ref.current
    if (scrollArea === null || lastLoadedArea === null) {
      return
    }

    const { height } = lastLoadedArea.getBoundingClientRect()
    scrollArea.scrollTo({
      top: height,
    })
  }, [lastLoadedMessages])

  useEffect(() => {
    const { footer, nearBottom } = ref.current
    if (footer === null || !nearBottom) {
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
      className="h-full overflow-auto relative"
      ref={element => (ref.current.scrollArea = element)}
    >
      <div className="absolute inset-x-0">
        <div
          className="p-2 pb-0 gap-2 flex flex-col-reverse"
          ref={element => (ref.current.lastLoadedArea = element)}
        >
          {lastLoadedMessages.map(message => (
            <MessageCard message={message} key={message.messageId} />
          ))}
        </div>
        <div className="p-2 gap-2 flex flex-col-reverse">
          {messages.map(message => (
            <MessageCard message={message} key={message.messageId} />
          ))}
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
