import { defineStore } from "pinia";

interface UserPayloadInterface {
  identifier: string;
  password: string;
}

export const useMyAuthStore = defineStore("myAuthStore", {
  state: () => ({
    authenticated: false,
    loading: false,
    userInfo: {},
    errorLogin: false,
    errorMessage: "",
    user: null as null | { username: string; account_type: string },
    // user: null
  }),
  getters: {
    role: (state) => state.user?.account_type || "guest",
    isAdmin: (state) => state.user?.account_type === "admin",
    isCustodian: (state) => state.user?.account_type === 'custodian',
    isStaff: (state) => state.user?.account_type === "staff",
    isAuthenticated: (state) => state.authenticated,
  },
  actions: {
    // Login function
    async authenticateUser({ identifier, password }: UserPayloadInterface) {
      const baseUrl = useRuntimeConfig().public.strapiBaseURL;
      const { data, pending, error }: any = await useFetch(
        `${baseUrl}/api/auth/local`,
        {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: {
            identifier,
            password,
          },
        }
      );
      //this.loading = pending
      if (data.value) {
        let userRole = data?.value.user.account_type;
        if (userRole !== "admin" && userRole !== "staff" && userRole !== 'custodian') {
          this.errorLogin = true;
          return error;
        }

        await this.fetchUser();
        //console.log("User Fetched")
        //localStorage.setItem("user-info", JSON.stringify(data.value));
        const token = useCookie("token");
        token.value = data?.value?.jwt;
        this.authenticated = true;
        this.errorLogin = false;
      } else {
        this.errorLogin = true;
        this.errorMessage = error.value.data.error.message;
      }
    },

    // async fetchUser() {
    //   const baseUrl = useRuntimeConfig().public.strapiBaseURL;
    //   const token = useCookie('token');
    //   //console.log("Token:", token)
    //   if (!token.value) {
    //     this.user = null
    //     return;
    //   }

    //   const { data, error } = await useFetch(`${baseUrl}/api/users/me`, {
    //     headers: {
    //       Authorization: `Bearer ${token.value}`
    //     }
    //   })

    //   if (error.value ) {
    //     this.user = null
    //   } else {
    //     // @ts-ignore
    //     this.user = data.value
    //   }
    // },

    async fetchUser() {
      const baseUrl = useRuntimeConfig().public.strapiBaseURL;
      const token = useCookie("token");
      //console.log("Token:", token)

      this.loading = true;
      this.errorLogin = false;

      if (!token.value) {
        this.user = null;
        this.authenticated = false;
        this.loading = false;
        return;
      }

      try {
        const { data, error } = await useFetch(`${baseUrl}/api/users/me?populate=*`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        if (error.value || !data.value) {
          this.user = null;
          this.authenticated = false;
        } else {
          // @ts-ignore
          this.user = data.value;
          this.authenticated = true;
        }
      } catch (err: any) {
        this.user = null;
        this.authenticated = false;
        this.errorLogin = true;
        this.errorMessage = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Logout Function
    logUserOut() {
      const token = useCookie("token");
      token.value = null;
      this.authenticated = false;
      this.user = null;
      this.userInfo = {};
      //localStorage.removeItem("user-info");
    },
  },
});
