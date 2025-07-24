export default defineNuxtRouteMiddleware((to, from) => {
const { user } = storeToRefs(useMyAuthStore());
//@ts-ignore
if (!user.value || user.value?.account_type !== 'staff') {
    return navigateTo('/admin')
}
})
