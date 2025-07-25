export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useMyAuthStore();

    const allowedRoles = to.meta.allowedRoles as string[] | undefined
    const currentRole = userStore.role

    // If no roles defined, allow everyone
    if (!allowedRoles || allowedRoles.length === 0) return

    // If role is not allowed, redirect to home or error page
    if (!allowedRoles.includes(currentRole)) {
        return navigateTo('/') // or '/unauthorized
    }
})
