import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  AutoSizer,
  defaultCellRangeRenderer,
  List,
  OverscanIndexRange,
} from 'react-virtualized'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'

export const ReactVirtualized = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const listRef = useRef<List | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const ref = useRef({
    rowHeights: [] as number[],
    nearBottom: false,
  })

  const [initialized, setInitialized] = useState(false)

  const [overscanStartIndex, setOverscanStartIndex] = useState(NaN)
  const [overscanStopIndex, setOverscanStopIndex] = useState(NaN)

  // Measure item sizes and apply them to the list component.
  useLayoutEffect(() => {
    const list = listRef.current
    const itemsContainer = headerRef.current?.parentNode
    const { rowHeights } = ref.current
    if (
      list === null ||
      itemsContainer === null ||
      typeof itemsContainer === 'undefined'
    ) {
      return
    }

    const { children } = itemsContainer

    let recomputeFrom: number | null = null

    for (let index = overscanStartIndex; index <= overscanStopIndex; index++) {
      const size = rowHeights.at(index)
      if (typeof size === 'number') {
        continue
      }

      if (recomputeFrom === null) {
        recomputeFrom = index
      }

      const childIndex = index - overscanStartIndex
      const child = children.item(childIndex)
      if (child === null) {
        continue
      }

      rowHeights[index] = child.clientHeight
    }

    if (recomputeFrom === null) {
      return
    }

    list.recomputeRowHeights(recomputeFrom)

    // Fix the scroll value based on the difference between initial and actual item sizes.
    // You can remove this block if you do not mind flickering by the difference.
    {
      const scrollArea = itemsContainer.parentElement
      if (scrollArea === null) {
        return
      }

      const firstChild = children.item(0)
      const lastChild = children.item(overscanStopIndex - overscanStartIndex)
      if (firstChild === null || lastChild === null) {
        return
      }

      const { top: firstChildTop } = firstChild.getBoundingClientRect()
      const { top: lastChildTop } = lastChild.getBoundingClientRect()
      const currentHeight = lastChildTop - firstChildTop

      const preferredHeight = rowHeights
        .slice(overscanStartIndex, overscanStopIndex)
        .reduce((sum, size) => sum + size, 0)

      scrollArea.scrollBy({
        top: preferredHeight - currentHeight,
      })
    }
  }, [overscanStartIndex, overscanStopIndex])

  useEffect(() => {
    setTimeout(setInitialized, 0, true)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    const footer = footerRef.current
    const itemsContainer = header?.parentNode
    const scrollArea = itemsContainer?.parentElement
    if (
      header === null ||
      footer === null ||
      scrollArea === null ||
      typeof scrollArea === 'undefined'
    ) {
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
  }, [loadMore, initialized])

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    const list = listRef.current
    const itemsContainer = headerRef.current?.parentNode
    const scrollArea = itemsContainer?.parentElement
    const { rowHeights } = ref.current
    if (
      list === null ||
      scrollArea === null ||
      typeof scrollArea === 'undefined'
    ) {
      return
    }

    const { length } = lastLoadedMessages
    if (length === 0) {
      return
    }

    const additionalRowHeights = new Array(length)
    ref.current.rowHeights = additionalRowHeights.concat(rowHeights)

    const top = rowHeights.slice(0, length).reduce((sum, size) => sum + size, 0)
    scrollArea.scrollTo({
      top,
    })

    setTimeout(() => {
      const top = list.getOffsetForRow({
        alignment: 'start',
        index: length,
      })
      scrollArea.scrollTo({
        top,
      })
    }, 100)
  }, [lastLoadedMessages])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const footer = footerRef.current
    const { nearBottom } = ref.current
    if (footer === null || !nearBottom) {
      return
    }

    footer.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
    })
  }, [messages])

  // Scroll to the bottom at first.
  useEffect(() => {
    const footer = footerRef.current
    if (footer === null) {
      return
    }

    footer.scrollIntoView({
      block: 'end',
    })
  }, [initialized])

  const totalMessages = messages.concat(lastLoadedMessages)

  const getRowHeight = (props: { index: number }) => {
    const { rowHeights } = ref.current
    const height = rowHeights.at(props.index)
    if (typeof height === 'undefined') {
      return 100
    } else {
      return height
    }
  }

  const handleRowsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
  }: OverscanIndexRange) => {
    setOverscanStartIndex(overscanStartIndex)
    setOverscanStopIndex(overscanStopIndex)
  }

  return (
    <>
      <AutoSizer>
        {({ width, height }) => (
          <List
            width={width}
            height={height}
            ref={listRef}
            rowCount={totalMessages.length}
            rowHeight={getRowHeight}
            estimatedRowSize={100}
            onRowsRendered={handleRowsRendered}
            cellRangeRenderer={props => {
              const children = defaultCellRangeRenderer({
                ...props,
                cellCache: {},
              })

              children.push(
                <LoadingTrigger
                  isLoading={isLoading}
                  hasMore={hasMore}
                  ref={headerRef}
                  key="loading-trigger"
                />
              )
              children.push(
                <FollowingTrigger
                  className="-bottom-2"
                  ref={footerRef}
                  key="following-trigger"
                />
              )

              return children
            }}
            rowRenderer={props => {
              const message = totalMessages.at(-props.index - 1)
              if (typeof message === 'undefined') {
                return
              }

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { height, ...style } = props.style

              return (
                <MessageCard
                  className="px-2 pt-2"
                  style={style}
                  message={message}
                  key={message.messageId}
                />
              )
            }}
          />
        )}
      </AutoSizer>
      <style>{`
        .ReactVirtualized__Grid__innerScrollContainer {
          margin-bottom: 0.5rem;
          overflow: unset !important;
        }
      `}</style>
    </>
  )
}
