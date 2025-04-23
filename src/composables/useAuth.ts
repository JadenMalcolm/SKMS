import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default function useAuth() {
  const router = useRouter()

  // Form inputs
  const email = ref('')
  const password = ref('')
  const peakPassword = ref(false)

  // Status and messages
  const loginMessage = ref('')
  const isError = ref(false)

  // Toggle password visibility
  const togglePeakPassword = () => {
    peakPassword.value = !peakPassword.value
  }

  // Handle login
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email: email.value.toLowerCase(), // Convert email to lowercase
        password: password.value,
      })

      const user = response.data.user
      // storing user session
      sessionStorage.setItem('user', JSON.stringify(user))

      // Show success message
      loginMessage.value = 'Login successful! Redirecting...'
      isError.value = false

      setTimeout(() => {
        router.push('/dashboard') // Redirect after a short delay
      }, 1500)
    } catch (error) {
      // Show error message
      loginMessage.value = 'Login failed. Please check your credentials.'
      isError.value = true
    }
  }

  // Navigation functions
  const navigateToSignup = () => {
    router.push('/signup')
  }

  const navigateToRecover = () => {
    router.push('/recover')
  }

  // Check if user is already logged in
  const checkAuth = () => {
    const user = sessionStorage.getItem('user')
    if (user) {
      return JSON.parse(user)
    }
    return null
  }

  return {
    email,
    password,
    peakPassword,
    loginMessage,
    isError,
    togglePeakPassword,
    handleLogin,
    navigateToSignup,
    navigateToRecover,
    checkAuth,
  }
}
