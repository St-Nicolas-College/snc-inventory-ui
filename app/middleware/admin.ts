export default defineNuxtRouteMiddleware((to, from) => {
const { user } = storeToRefs(useMyAuthStore());
 const userStore = useMyAuthStore();
//@ts-ignore

console.log("Admin middleware")
if (!user.value || user.value?.account_type !== 'admin') {
    return navigateTo('/')
}

  if (userStore.user?.account_type === 'admin' && to.path === "/") {
    return navigateTo("/admin")
  }
})
