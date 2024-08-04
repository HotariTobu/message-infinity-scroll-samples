import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { useMessagesStore } from '@/stores/messages'
import { useUserStore } from '@/stores/user'
import { FormEvent } from 'react'

export const ChatFooter = () => {
  const { user } = useUserStore()
  const addMessage = useMessagesStore(state => state.addRecentMessage)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    form.reset()

    const messageBody = formData.get('message.body')
    if (typeof messageBody !== 'string' || messageBody.length === 0) {
      return
    }

    addMessage(user.userId, messageBody)
  }

  return (
    <form
      className="bg-background p-4 shadow flex items-center gap-2"
      onSubmit={handleSubmit}
    >
      <Input
        name="message.body"
        type="text"
        placeholder="Type your message..."
        autoComplete="off"
      />
      <Button>
        <PaperPlaneIcon className="w-5 h-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  )
}
