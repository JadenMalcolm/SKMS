import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import usePeakPassword from './usePeakPassword'
import useApiUrl from './useApiUrl'

/**
 * Authentication composable that handles user login, signup, and authentication state.
 * Provides functions for login, signup, password management, and session verification.
 * @returns Authentication related methods and reactive state variables
 */
export default function useAuth() {
  const router = useRouter()
  const { usePasswordVisibility } = usePeakPassword()
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  // Form inputs
  const email = ref('')
  const password = ref('')
  const { visible: peakPassword, toggle: togglePeakPassword } = usePasswordVisibility()

  // Sign up form inputs
  const confirmPassword = ref('')
  const securityChoice = ref('')
  const securityQuestionAnswer = ref('')
  const { visible: peakConfirmPassword, toggle: togglePeakConfirmPassword } =
    usePasswordVisibility()

  // Status and messages
  const loginMessage = ref('')
  const signupMessage = ref('')
  const isError = ref(false)

  /**
   * Handles user login submission.
   * Validates credentials with the backend, stores user session and token upon success,
   * and redirects to dashboard.
   */
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/login`, {
        email: email.value.toLowerCase(), // Convert email to lowercase
        password: password.value,
      })

      const user = response.data.user
      const token = response.data.token

      // Storing user session and token
      sessionStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('token', token)

      // Set default Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

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

  /**
   * Handles user signup submission.
   * Validates that passwords match, sends signup data to backend,
   * and redirects to login page on success.
   */
  const handleSignUp = async () => {
    if (password.value !== confirmPassword.value) {
      signupMessage.value = 'Passwords do not match!'
      return
    }
    try {
      await axios.post(`${apiBaseUrl}/signup`, {
        email: email.value.toLowerCase(), // Convert email to lowercase
        password: password.value,
        securityQuestion: securityChoice.value,
        securityQuestionAnswer: securityQuestionAnswer.value,
      })

      signupMessage.value = 'New Account Created!'
      router.push('/')
    } catch (error) {
      // Handle error response from the backend
      if (
        (error as any).response &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        signupMessage.value = (error as any).response.data.error // Display backend error message
      } else {
        signupMessage.value = 'Signup failed'
      }
    }
  }

  /**
   * Navigates to the signup page
   */
  const navigateToSignup = () => {
    router.push('/signup')
  }

  /**
   * Navigates to the password recovery page
   */
  const navigateToRecover = () => {
    router.push('/recover')
  }

  /**
   * Checks if user is already logged in by verifying session storage
   * and sets the Authorization header if token exists.
   * @returns User object if logged in, null otherwise
   */
  const checkAuth = () => {
    const user = sessionStorage.getItem('user')
    const token = sessionStorage.getItem('token')

    if (user && token) {
      // Set default Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
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

    // Added for signup functionality
    confirmPassword,
    securityChoice,
    securityQuestionAnswer,
    peakConfirmPassword,
    signupMessage,
    togglePeakConfirmPassword,
    handleSignUp,
  }
}
