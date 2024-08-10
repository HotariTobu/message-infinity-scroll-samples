import { useUserStore } from '@/stores/user'
import { Message } from '@/types/message'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/mergeClassName'
import { forwardRef, HTMLAttributes } from 'react'

export const MessageCard = forwardRef<
  HTMLDivElement,
  Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    message: Message
  }
>(({ message, className, ...props }, ref) => {
  const { body, timestamp } = message
  const timeString = timestamp.toLocaleTimeString(void 0, {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  })

  const { user } = useUserStore()

  if (message.userId === user.userId) {
    return (
      <div
        className={cn(className, 'flex items-start gap-4 justify-end')}
        {...props}
        ref={ref}
      >
        <div className="bg-primary rounded-lg p-3 max-w-[80%] text-primary-foreground">
          <p className="whitespace-break-spaces">{body}</p>
          <div className="text-xs text-primary-foreground/80 mt-1 text-end">
            {timeString}
          </div>
        </div>
        <Avatar className="w-8 h-8">
          <AvatarImage src="/avatar.png" alt="Avatar" />
        </Avatar>
      </div>
    )
  } else {
    return (
      <div
        className={cn(className, 'flex items-start gap-4')}
        {...props}
        ref={ref}
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src="/avatar.png" alt="Avatar" />
        </Avatar>
        <div className="bg-muted rounded-lg p-3 max-w-[80%]">
          <p className="whitespace-break-spaces">{body}</p>
          <div className="text-xs text-muted-foreground mt-1">{timeString}</div>
        </div>
      </div>
    )
  }
})
MessageCard.displayName = 'MessageCard'
