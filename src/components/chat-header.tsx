import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { useUserStore } from '@/stores/user'
import { PropsWithChildren } from 'react'

export const ChatHeader = (props: PropsWithChildren) => {
  const { user } = useUserStore()
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow">
      <div className="container flex items-center justify-between">
        <h1 className="text-xl font-bold">Chat Room</h1>
        {props.children}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/avatar.png" alt="Avatar" />
          </Avatar>
          <span className="text-sm">{user.name}</span>
        </div>
      </div>
    </header>
  )
}
