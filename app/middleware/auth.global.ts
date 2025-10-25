import { useMyAuthStore } from "~/stores/auth";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { authenticated } = storeToRefs(useMyAuthStore());
  const { user } = storeToRefs(useMyAuthStore());
  const userStore = useMyAuthStore();
  const token = useCookie("token");

  if (!userStore.user) {
    await userStore.fetchUser();
  }
  //@ts-ignore
  //console.log("User data: ", userStore.user?.account_type);

  if (!userStore.user && to.path !== "/auth/login") {
    return navigateTo("/auth/login");
  }

  if (userStore.user && to.path === "/auth/login") {
    return navigateTo("/");
  }

  // Redirect to admin page if path is not equal to "/admin"
  if (userStore.user?.account_type === 'admin' && !to.path.startsWith("/admin")) {
    return navigateTo("/admin")
  }

  // Redirect to login if not authenticated
  //   if (!userStore.user && to.path !== "/auth/login") {
  //     return navigateTo("/auth/login");
  //   }

  //   if (token.value && to.path === "/auth/login") {
  //     return navigateTo("/");
  //   }

  // Role-based access control
  const requiredRole = to.meta.requiredRole;
  // @ts-ignore
  const actualRole = userStore.user?.account_type;

  //console.log('Required Role: ', requiredRole)

  // if (requiredRole && actualRole !== requiredRole) {
  //   if (actualRole === "admin") return navigateTo("/admin");
  //   if (actualRole === "staff") return navigateTo("/");
  //   if (actualRole === "custodian") return navigateTo("/");
  //   return navigateTo("/");
  // }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    if (!allowedRoles.includes(actualRole)) {
      // Redirect based on actial role
      if (actualRole === "admin") return navigateTo("/admin");
      if (actualRole === "staff") return navigateTo("/");
      if (actualRole === "custodian") return navigateTo("/");
      return navigateTo("/");
    }
  }
});
