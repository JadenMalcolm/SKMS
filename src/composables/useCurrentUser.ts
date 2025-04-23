import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from './useUsers'

export default function useCurrentUser() {
  const currentUser = ref<User | null>(null)
  const router = useRouter()
  const isLoading = ref(true)

  const loadCurrentUser = async () => {
    isLoading.value = true
    // Check if user session exists
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      try {
        // Parse the stored user data
        currentUser.value = JSON.parse(storedUser)
        isLoading.value = false
        return currentUser.value
      } catch (error) {
        console.error('Error parsing user from session storage:', error)
        router.push('/')
        isLoading.value = false
        return null
      }
    } else {
      router.push('/')
      isLoading.value = false
      return null
    }
  }

  return {
    currentUser,
    loadCurrentUser,
    isLoading,
  }
}
