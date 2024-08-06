import { useMessagesStore } from '@/stores/messages'
import { Message } from '@/types/message'
import { sleep } from '@/utils/sleep'
import { faker } from '@faker-js/faker'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useMessagesFaker = (initialMessageCount = 1000) => {
  const { setPastMessages, addRecentMessage } = useMessagesStore()
  const ref = useRef({
    userId: crypto.randomUUID(),
  })

  useEffect(() => {
    const { userId } = ref.current
    const getNewMessageBody = () => faker.lorem.lines({ min: 1, max: 3 })

    setPastMessages(
      userId,
      new Array(initialMessageCount).fill(0).map(getNewMessageBody)
    )

    const timerId = setInterval(() => {
      if (Math.random() < 0.7) {
        return
      }

      const messageBody = getNewMessageBody()
      addRecentMessage(userId, messageBody)
    }, 500)
    return () => clearInterval(timerId)
  }, [initialMessageCount, setPastMessages, addRecentMessage])
}

export const useMessages = () => {
  const { recentMessages, fetchPastMessages } = useMessagesStore()

  const [pastMessages, setPastMessages] = useState<Message[]>([])
  const [lastLoadedMessages, setLastLoadedMessages] = useState<Message[]>([])
  const [cursor, setCursor] = useState<number | null | undefined>()

  const messages = recentMessages.concat(pastMessages)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = cursor !== null

  const loadMore = useCallback(async () => {
    if (cursor === null) {
      return
    }

    setIsLoading(true)

    const { messages, nextCursor } = fetchPastMessages(cursor)

    await sleep(200)

    setPastMessages(pastMessages.concat(lastLoadedMessages))
    setLastLoadedMessages(messages)
    setCursor(nextCursor)

    setIsLoading(false)
  }, [fetchPastMessages, pastMessages, lastLoadedMessages, cursor])

  return {
    lastLoadedMessages,
    messages,
    isLoading,
    hasMore,
    loadMore,
  }
}
