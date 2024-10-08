import { ChatHeader } from './components/chat-header'
import { ChatFooter } from './components/chat-footer'
import { useMessagesFaker } from './hooks/useMessages'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Normal } from './components/message-list/normal'
import { ReactVirtuoso } from './components/message-list/react-virtuoso'
import { TanstackReactVirtual } from './components/message-list/tanstack-react-virtual'
import { ReactWindow } from './components/message-list/react-window'
import { ReactEasyInfiniteScrollHook } from './components/message-list/react-easy-infinite-scroll-hook'
import { ReactInfiniteScrollHook } from './components/message-list/react-infinite-scroll-hook'
import { ReactVirtualized } from './components/message-list/react-virtualized'
import { ReactInfiniteScroller } from './components/message-list/react-infinite-scroller'

const messageListComponentMap = {
  Normal,
  ReactVirtuoso,
  TanstackReactVirtual,
  ReactWindow,
  ReactEasyInfiniteScrollHook,
  ReactInfiniteScrollHook,
  ReactVirtualized,
  ReactInfiniteScroller,
} as const
type MessageListComponentKey = keyof typeof messageListComponentMap

export default function App() {
  useMessagesFaker()

  const [messageListComponentKey, setMessageListComponentKey] =
    useState<MessageListComponentKey>('Normal')
  const handleSelectChange = (value: string) => {
    setMessageListComponentKey(value as MessageListComponentKey)
  }

  const MessageListComponent = messageListComponentMap[messageListComponentKey]

  return (
    <div className="flex flex-col h-screen">
      <ChatHeader>
        <Select
          value={messageListComponentKey}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(messageListComponentMap).map(key => (
              <SelectItem value={key} key={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ChatHeader>
      <div className="flex-1">
        <MessageListComponent />
      </div>
      <ChatFooter />
    </div>
  )
}
