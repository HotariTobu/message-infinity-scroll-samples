import { User } from '@/types/user'
import { create } from 'zustand'

export const useUserStore = create(() => ({
  user: {
    userId: crypto.randomUUID(),
    name: 'John Doe',
  } satisfies User,
}))
