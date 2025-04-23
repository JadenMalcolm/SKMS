import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import usePeakPassword from './usePeakPassword'

export default function useAuth() {
  const router = useRouter()
  const { usePasswordVisibility } = usePeakPassword()

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

  // Handle signup
  const handleSignUp = async () => {
    if (password.value !== confirmPassword.value) {
      signupMessage.value = 'Passwords do not match!'
      return
    }
    try {
      await axios.post('http://localhost:5000/signup', {
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
