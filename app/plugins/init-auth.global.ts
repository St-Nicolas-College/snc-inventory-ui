import { storeToRefs } from "pinia"
import { useMyAuthStore } from '~/stores/auth';
export default defineNuxtPlugin(async () => {
    const { fetchUser } = useMyAuthStore();
    //const auth = useMyAuthStore()
    console.log("Plugin on load")
    await fetchUser()
})
