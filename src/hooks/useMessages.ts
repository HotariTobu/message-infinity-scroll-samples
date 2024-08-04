import { useMessagesStore } from '@/stores/messages'
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

export const useMessages = (pageSize = 10) => {
  const { pastMessages, recentMessages } = useMessagesStore()
  const [pageCount, setPageCount] = useState(1)

  const selectedMessages = pastMessages.slice(0, pageSize * pageCount)
  const [isLoading, setIsLoading] = useState(false)
  const hasMore = pastMessages.length > selectedMessages.length
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

  const messages = recentMessages.concat(selectedMessages)

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
  }
}
