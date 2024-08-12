import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useRef } from 'react'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'
import InfiniteScroll from 'react-infinite-scroller'

export const ReactInfiniteScroller = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const lastLoadedAreaRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const ref = useRef({
    nearBottom: false,
  })

  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    const footer = footerRef.current
    if (scrollArea === null || footer === null) {
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        ref.current.nearBottom = entry.isIntersecting
      },
      {
        root: scrollArea,
      }
    )

    observer.observe(footer)

    return () => observer.disconnect()
  }, [])

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    const lastLoadedArea = lastLoadedAreaRef.current
    if (scrollArea === null || lastLoadedArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: lastLoadedArea.clientHeight,
    })
  }, [lastLoadedMessages])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    const { nearBottom } = ref.current
    if (scrollArea === null || !nearBottom) {
      return
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  // Scroll to the bottom at first.
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
    })

    // Trigger initial load-more.
    if (scrollArea.scrollTop === 0) {
      const scrollEvent = new Event('scroll')
      scrollArea.dispatchEvent(scrollEvent)
    }
  }, [])

  return (
    <div className="h-full overflow-auto contain-strict" ref={scrollAreaRef}>
      <InfiniteScroll
        className="relative"
        hasMore={hasMore}
        loadMore={loadMore}
        initialLoad={false}
        isReverse={true}
        threshold={64}
        loader={
          <div className="contents" key="loader">
            <LoadingTrigger isLoading={isLoading} hasMore={hasMore} />
            <FollowingTrigger ref={footerRef} />
          </div>
        }
        useWindow={false}
      >
        <div
          className="p-2 empty:pt-0 pb-0 gap-2 flex flex-col-reverse"
          ref={lastLoadedAreaRef}
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
      </InfiniteScroll>
    </div>
  )
}
