export const useToast = () => {
  const show = useState('toast:show', () => false)
  const message = useState('toast:message', () => '')
  const color = useState('toast:color', () => 'success')
  const icon = useState('toast:icon', () => 'mdi-check-circle')

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success', iconName?: string) => {
    message.value = msg
    color.value = type === 'success' ? 'green' : 'red'
    icon.value = iconName ?? (type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle')
    show.value = true
  }

  return {
    show,
    message,
    color,
    icon,
    triggerToast
  }
}