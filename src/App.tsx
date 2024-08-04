import { ChatHeader } from './components/chat-header'
import { Normal } from './components/message-list/normal'
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

const messageListComponentMap = {
  normal: Normal,
} as const
type MessageListComponentKey = keyof typeof messageListComponentMap

export default function App() {
  useMessagesFaker()

  const [messageListComponentKey, setMessageListComponentKey] =
    useState<MessageListComponentKey>('normal')
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
