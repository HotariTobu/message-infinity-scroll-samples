import { useMessages } from '@/hooks/useMessages'
import useInfiniteScroll from 'react-easy-infinite-scroll-hook'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'
import { useEffect, useRef } from 'react'
import { MessageCard } from '../message-card'

export const ReactEasyInfiniteScrollHook = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const infiniteScrollRef = useInfiniteScroll<HTMLDivElement>({
    next: loadMore,
    rowCount: messages.length + lastLoadedMessages.length,
    hasMore: { up: hasMore },
    initialScroll: { top: Infinity },
    scrollThreshold: '64px',
  })

  const lastLoadedAreaRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const ref = useRef({
    nearBottom: false,
  })

  useEffect(() => {
    const scrollArea = infiniteScrollRef.current
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
  }, [infiniteScrollRef])

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    const scrollArea = infiniteScrollRef.current
    const lastLoadedArea = lastLoadedAreaRef.current
    if (scrollArea === null || lastLoadedArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: lastLoadedArea.clientHeight,
    })
  }, [infiniteScrollRef, lastLoadedMessages])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const scrollArea = infiniteScrollRef.current
    const { nearBottom } = ref.current
    if (scrollArea === null || !nearBottom) {
      return
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: 'smooth',
    })
  }, [infiniteScrollRef, messages])

  // Scroll to the bottom at first.
  useEffect(() => {
    const scrollArea = infiniteScrollRef.current
    if (scrollArea === null) {
      return
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
    })
  }, [infiniteScrollRef])

  return (
    <div
      className="h-full overflow-auto contain-strict"
      ref={infiniteScrollRef}
    >
      <div className="relative">
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

        <LoadingTrigger isLoading={isLoading} hasMore={hasMore} />
        <FollowingTrigger ref={footerRef} />
      </div>
    </div>
  )
}
