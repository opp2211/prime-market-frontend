import { useState } from 'react'
import Button from '../../shared/ui/Button'

export default function OrderChatComposer({
  copy,
  disabled,
  isSending,
  error,
  onSend,
  onClearError,
}) {
  const [body, setBody] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const sent = await onSend(body)
    if (sent) {
      setBody('')
    }
  }

  function handleChange(event) {
    setBody(event.target.value)
    if (error) {
      onClearError()
    }
  }

  return (
    <form className="order-chat-composer" onSubmit={handleSubmit}>
      <label className="order-chat-composer__label" htmlFor="order-chat-message">
        {copy.composer.label}
      </label>
      <textarea
        id="order-chat-message"
        className="input order-chat-composer__input"
        value={body}
        rows={3}
        placeholder={copy.composer.placeholder}
        disabled={disabled || isSending}
        onChange={handleChange}
      />
      <div className="order-chat-composer__footer">
        <div className="order-chat-composer__feedback">
          {error ? <span className="field__error">{error}</span> : copy.composer.hint}
        </div>
        <Button type="submit" variant="primary" disabled={disabled || isSending}>
          {isSending ? copy.composer.sending : copy.composer.send}
        </Button>
      </div>
    </form>
  )
}
