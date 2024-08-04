import { Message } from '@/types/message'
import { create } from 'zustand'

export const useMessagesStore = create<{
  messages: Message[]
  addMessage: (userId: string, body: string) => void
}>(set => ({
  messages: [] as Message[],
  addMessage: (userId, body) => {
    const newMessage: Message = {
      messageId: crypto.randomUUID(),
      userId,
      body,
      timestamp: new Date(),
    }
    set(state => ({ messages: [newMessage, ...state.messages] }))
  },
}))
