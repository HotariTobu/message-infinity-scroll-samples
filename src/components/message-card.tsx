import { useUserStore } from '@/stores/user'
import { Message } from '@/types/message'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/mergeClassName'

export const MessageCard = (props: {
  className?: string | undefined
  message: Message
}) => {
  const { body, timestamp } = props.message
  const timeString = timestamp.toLocaleTimeString(void 0, {
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  })

  const { user } = useUserStore()

  if (props.message.userId === user.userId) {
    return (
      <div
        className={cn(props.className, 'flex items-start gap-4 justify-end')}
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
      <div className={cn(props.className, 'flex items-start gap-4')}>
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
}
