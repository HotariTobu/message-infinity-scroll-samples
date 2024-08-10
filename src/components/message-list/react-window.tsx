import { MessageCard } from '@/components/message-card'
import { useMessages } from '@/hooks/useMessages'
import { Message } from '@/types/message'
import {
  createContext,
  forwardRef,
  HTMLAttributes,
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

type Context = {
  isLoading: boolean
  hasMore: boolean
  headerRef: (element: Element | null) => void
  footerRef: (element: Element | null) => void
}

const Context = createContext<Context>({
  isLoading: false,
  hasMore: false,
  headerRef: () => {},
  footerRef: () => {},
})

type Data = {
  totalMessages: Message[]
}

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
        <div className="h-32 absolute -bottom-2" ref={context.footerRef} />
      </div>
    )
  }
)

const Item = (props: ListChildComponentProps<Data>) => {
  const { totalMessages } = props.data
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

  const ref = useRef({
    list: null as VariableSizeList | null,
    scrollArea: null as Element | null,
    itemsContainer: null as Element | null,
    itemSizes: [] as number[],
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

  const context: Context = {
    isLoading,
    hasMore,
    headerRef: element => (ref.current.header = element),
    footerRef: element => (ref.current.footer = element),
  }

  const data: Data = {
    totalMessages,
  }

  // Scroll into the previous top message when past messages are loaded.
  useEffect(() => {
    const { list, scrollArea, itemSizes } = ref.current
    if (list === null || scrollArea === null) {
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
      list.scrollToItem(length, 'start')
    }, 100)
  }, [lastLoadedMessages])

  // Scroll to the bottom when a new message comes.
  useEffect(() => {
    const { scrollArea, nearBottom } = ref.current
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
    const { footer } = ref.current
    if (footer === null) {
      return
    }

    footer.scrollIntoView({
      block: 'end',
    })
  }, [])

  const getItemKey = (index: number) => {
    const message = totalMessages.at(-index - 1)
    if (typeof message === 'undefined') {
      return index
    } else {
      return message.messageId
    }
  }

  const [overscanStartIndex, setOverscanStartIndex] = useState(NaN)
  const [overscanStopIndex, setOverscanStopIndex] = useState(NaN)

  const handleItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
  }: ListOnItemsRenderedProps) => {
    setOverscanStartIndex(overscanStartIndex)
    setOverscanStopIndex(overscanStopIndex)
  }

  // Measure item sizes and apply them to the list component.
  useLayoutEffect(() => {
    const { list, itemsContainer, itemSizes } = ref.current
    if (list === null || itemsContainer === null) {
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

    list.resetAfterIndex(resetFrom, false)

    // Fix the scroll value based on the difference between initial and actual item sizes.
    // You can remove this block if you do not mind flickering by the difference.
    {
      const { scrollArea } = ref.current
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

  return (
    <AutoSizer disableWidth>
      {({ width, height }) => (
        <Context.Provider value={context}>
          <VariableSizeList<Data>
            width={width}
            height={height}
            ref={list => (ref.current.list = list)}
            outerRef={element => (ref.current.scrollArea = element)}
            innerRef={element => (ref.current.itemsContainer = element)}
            itemData={data}
            itemCount={totalMessages.length}
            itemKey={getItemKey}
            itemSize={index => ref.current.itemSizes.at(index) ?? 100}
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
