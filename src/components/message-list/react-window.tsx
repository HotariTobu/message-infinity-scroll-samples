import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { Message } from '@/types/message'
import {
  createContext,
  forwardRef,
  HTMLAttributes,
  MutableRefObject,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AutoSizer } from 'react-virtualized'
import {
  ListChildComponentProps,
  ListOnItemsRenderedProps,
  VariableSizeList,
} from 'react-window'
import { LoadingTrigger } from '../loading-trigger'
import { FollowingTrigger } from '../following-trigger'

type Context = {
  isLoading: boolean
  hasMore: boolean
  headerRef: MutableRefObject<HTMLDivElement | null>
  footerRef: MutableRefObject<HTMLDivElement | null>
}

const Context = createContext<Context>({
  isLoading: false,
  hasMore: false,
  headerRef: { current: null },
  footerRef: { current: null },
})

type Data = Message[]

const Inner = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => {
    const context = useContext(Context)

    return (
      <div className="mb-2 relative" {...props} ref={ref}>
        {children}

        <LoadingTrigger
          isLoading={context.isLoading}
          hasMore={context.hasMore}
          ref={context.headerRef}
        />
        <FollowingTrigger className="-bottom-2" ref={context.footerRef} />
      </div>
    )
  }
)

const Item = (props: ListChildComponentProps<Data>) => {
  const totalMessages = props.data
  const message = totalMessages.at(-props.index - 1)
  if (typeof message === 'undefined') {
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { height, ...style } = props.style

  return <MessageCard className="px-2 pt-2" style={style} message={message} />
}

export const ReactWindow = () => {
  const { lastLoadedMessages, messages, isLoading, hasMore, loadMore } =
    useMessages()

  const variableSizeListRef = useRef<VariableSizeList | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const itemsContainerRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const ref = useRef({
    itemSizes: [] as number[],
    nearBottom: false,
  })

  const [overscanStartIndex, setOverscanStartIndex] = useState(NaN)
  const [overscanStopIndex, setOverscanStopIndex] = useState(NaN)

  // Measure item sizes and apply them to the list component.
  useLayoutEffect(() => {
    const variableSizeList = variableSizeListRef.current
    const itemsContainer = itemsContainerRef.current
    const { itemSizes } = ref.current
    if (variableSizeList === null || itemsContainer === null) {
      return
    }

    const { children } = itemsContainer

    let resetFrom: number | null = null

    for (let index = overscanStartIndex; index <= overscanStopIndex; index++) {
      const size = itemSizes.at(index)
      if (typeof size === 'number') {
        continue
      }

      if (resetFrom === null) {
        resetFrom = index
      }

      const childIndex = index - overscanStartIndex
      const child = children.item(childIndex)
      if (child === null) {
        continue
      }

      itemSizes[index] = child.clientHeight
    }

    if (resetFrom === null) {
      return
    }

    variableSizeList.resetAfterIndex(resetFrom, false)

    // Fix the scroll value based on the difference between initial and actual item sizes.
    // You can remove this block if you do not mind flickering by the difference.
    {
      const scrollArea = scrollAreaRef.current
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

      const preferredHeight = itemSizes
        .slice(overscanStartIndex, overscanStopIndex)
        .reduce((sum, size) => sum + size, 0)

      scrollArea.scrollBy({
        top: preferredHeight - currentHeight,
      })
    }
  }, [overscanStartIndex, overscanStopIndex])

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
    const variableSizeList = variableSizeListRef.current
    const scrollArea = scrollAreaRef.current
    const { itemSizes } = ref.current
    if (variableSizeList === null || scrollArea === null) {
      return
    }

    const { length } = lastLoadedMessages
    if (length === 0) {
      return
    }

    const additionalItemSizes = new Array(length)
    ref.current.itemSizes = additionalItemSizes.concat(itemSizes)

    const top = itemSizes.slice(0, length).reduce((sum, size) => sum + size, 0)
    scrollArea.scrollTo({
      top,
    })

    setTimeout(() => {
      variableSizeList.scrollToItem(length, 'start')
    }, 100)
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
  }, [])

  const totalMessages = messages.concat(lastLoadedMessages)

  const context: Context = {
    isLoading,
    hasMore,
    headerRef,
    footerRef,
  }

  const getItemKey = (index: number) => {
    const message = totalMessages.at(-index - 1)
    if (typeof message === 'undefined') {
      return index
    } else {
      return message.messageId
    }
  }

  const getItemSize = (index: number) => {
    const { itemSizes } = ref.current
    const size = itemSizes.at(index)
    if (typeof size === 'undefined') {
      return 100
    } else {
      return size
    }
  }

  const handleItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
  }: ListOnItemsRenderedProps) => {
    setOverscanStartIndex(overscanStartIndex)
    setOverscanStopIndex(overscanStopIndex)
  }

  return (
    <AutoSizer disableWidth>
      {({ width, height }) => (
        <Context.Provider value={context}>
          <VariableSizeList<Data>
            width={width}
            height={height}
            ref={variableSizeListRef}
            outerRef={scrollAreaRef}
            innerRef={itemsContainerRef}
            itemData={totalMessages}
            itemCount={totalMessages.length}
            itemKey={getItemKey}
            itemSize={getItemSize}
            estimatedItemSize={100}
            onItemsRendered={handleItemsRendered}
            innerElementType={Inner}
          >
            {Item}
          </VariableSizeList>
        </Context.Provider>
      )}
    </AutoSizer>
  )
}
