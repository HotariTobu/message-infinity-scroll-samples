import { LoadingHeader } from '@/components/loading-header'
import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'

export const Normal = () => {
  const { messages, isLoading, hasMore, loadMore } = useMessages()

  const ref = useRef({
    scrollAreaElement: null as Element | null,
    loadingTriggerElement: null as Element | null,
  })

  const setScrollAreaRef = (element: Element | null) => {
    ref.current.scrollAreaElement = element
  }

  const setLoadingTriggerRef = (element: Element | null) => {
    ref.current.loadingTriggerElement = element
  }

  useEffect(() => {
    const { scrollAreaElement, loadingTriggerElement } = ref.current
    if (scrollAreaElement === null || loadingTriggerElement === null) {
      return
    }

    const observer = new IntersectionObserver(
      async entries => {
        const [entry] = entries
        if (!entry.isIntersecting) {
          return
        }

        if (await loadMore()) {
          scrollAreaElement.scroll(0, 500)
        }
      },
      {
        root: scrollAreaElement,
      }
    )

    observer.observe(loadingTriggerElement)

    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="relative h-full overflow-auto" ref={setScrollAreaRef}>
      <div className="p-2 gap-2 flex flex-col-reverse absolute left-0 right-0">
        {messages.map(message => (
          <MessageCard message={message} key={message.messageId} />
        ))}
        <LoadingHeader
          isLoading={isLoading}
          hasMore={hasMore}
          ref={setLoadingTriggerRef}
          onClick={loadMore}
        />
      </div>
    </div>
  )
}
