export default defineNuxtPlugin((nuxtApp) => {
  const { isLoading } = useLoader()
  const router = useRouter()

  console.log("✅ Loader plugin active")

    // Track when loader was shown
  let startTime: number | null = null
  const minDuration = 300 // 👈 minimum 1 second

  // Initial app load
  nuxtApp.hook('app:mounted', () => {
    isLoading.value = false
  })

// Navigation start
  router.beforeEach((to, from, next) => {
    console.log("➡️ Navigation started:", to.fullPath)
    startTime = Date.now()
    isLoading.value = true
    next()
  })

  // Navigation finish
  router.afterEach((to) => {
    console.log("✅ Navigation finished:", to.fullPath)
   const elapsed = Date.now() - (startTime ?? 0)
    const remaining = minDuration - elapsed

    // Wait until minimum duration is reached
    setTimeout(() => {
      isLoading.value = false
      startTime = null
    }, remaining > 0 ? remaining : 0)
  })
})
