import { Message } from '@/types/message'
import { create } from 'zustand'

export const useMessagesStore = create<{
  pastMessages: Message[]
  recentMessages: Message[]
  setPastMessages: (userId: string, bodies: string[]) => void
  addRecentMessage: (userId: string, body: string) => void
}>(set => ({
  pastMessages: [],
  recentMessages: [],
  setPastMessages: (userId, bodies) => {
    const newMessages = bodies.map<Message>((body, index) => ({
      messageId: index.toString(),
      userId,
      body,
      timestamp: new Date(Date.now() - index * 1000),
    }))
    set(() => ({ pastMessages: newMessages }))
  },
  addRecentMessage: (userId, body) => {
    const newMessage: Message = {
      messageId: crypto.randomUUID(),
      userId,
      body,
      timestamp: new Date(),
    }
    set(state => ({ recentMessages: [newMessage, ...state.recentMessages] }))
  },
}))
