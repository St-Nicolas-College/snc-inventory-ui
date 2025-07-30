export const useToast = () => {
  const show = useState('toast:show', () => false)
  const message = useState('toast:message', () => '')
  const color = useState('toast:color', () => 'success')

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    message.value = msg
    color.value = type === 'success' ? 'green' : 'red'
    show.value = true
  }

  return {
    show,
    message,
    color,
    triggerToast
  }
}