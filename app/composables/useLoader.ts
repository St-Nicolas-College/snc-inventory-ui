const isLoading = ref(true)
const isFirstLoad = ref(true)
export const useLoader = () => {
  return {
    isLoading, isFirstLoad
  }
}
