import { useMessagesStore } from '@/stores/messages'
import { faker } from '@faker-js/faker'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useMessagesFaker = (initialMessageCount = 1000) => {
  const addMessage = useMessagesStore(state => state.addMessage)
  const ref = useRef({
    userId: crypto.randomUUID(),
  })

  const addFakeMessage = useCallback(() => {
    const { userId } = ref.current
    const messageBody = faker.lorem.lines({ min: 1, max: 3 })
    addMessage(userId, messageBody)
  }, [addMessage])

  useEffect(() => {
    new Array(initialMessageCount).fill(0).forEach(addFakeMessage)
    const timerId = setInterval(() => {
      if (Math.random() < 0.7) {
        return
      }

      addFakeMessage()
    }, 500)
    return () => clearInterval(timerId)
  }, [initialMessageCount, addFakeMessage])
}

export const useMessages = (pageSize = 10) => {
  const allMessages = useMessagesStore(state => state.messages)
  const [pageCount, setPageCount] = useState(1)

  const messages = allMessages.slice(0, pageSize * pageCount)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = allMessages.length > messages.length
  const loadMore = useCallback(async () => {
    if (hasMore) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 200))
      setPageCount(prevPageCount => prevPageCount + 1)
      setIsLoading(false)
      return true
    } else {
      return false
    }
  }, [hasMore])

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
  }
}
