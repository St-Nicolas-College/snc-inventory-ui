import { ref } from 'vue'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
  id: number
  title: string
  message: string
  type: AlertType
  icon: string
  duration?: number
  progress?: number
  timer?: ReturnType<typeof setInterval> | null
}

const alerts = ref<Alert[]>([])

const icons: Record<AlertType, string> = {
  success: 'mdi-check-circle-outline',
  error: 'mdi-alert-circle-outline',
  warning: 'mdi-alert-outline',
  info: 'mdi-information-outline',
}

export const useAlerts = () => {
  const showAlert = ({
    title,
    message,
    type = 'info',
    duration = 3000,
  }: {
    title: string
    message: string
    type?: AlertType
    duration?: number
  }) => {
    const id = Date.now() + Math.random()
    const icon = icons[type]

    alerts.value.push({
      id,
      title,
      message,
      type,
      icon,
      duration,
      progress: 100,
      timer: null,
    })
  }

  const success = (message: string, title = 'Success', duration = 3000) =>
    showAlert({ title, message, type: 'success', duration })

  const error = (message: string, title = 'Error', duration = 3000) =>
    showAlert({ title, message, type: 'error', duration })

  const warning = (message: string, title = 'Warning', duration = 3000) =>
    showAlert({ title, message, type: 'warning', duration })

  const info = (message: string, title = 'Info', duration = 3000) =>
    showAlert({ title, message, type: 'info', duration })

  return { alerts, showAlert, success, error, warning, info }
}
