import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import usePeakPassword from './usePeakPassword'
import useApiUrl from './useApiUrl'

/**
 * Composable for handling password reset and recovery flows.
 * Provides functions for password recovery, security question verification,
 * and password reset functionality.
 *
 * @returns Password reset methods and reactive state variables
 */
export default function usePasswordReset() {
  const router = useRouter()
  const { usePasswordVisibility } = usePeakPassword()
  const { getBaseUrl } = useApiUrl()
  const apiBaseUrl = getBaseUrl()

  // State variables
  const email = ref(sessionStorage.getItem('recoverEmail') || '')
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const message = ref('')
  const isError = ref(false)

  // Security question related state
  const securityQuestion = ref<string>('')
  const answer = ref<string>('')
  const errorMessage = ref<string>('')
  const successMessage = ref<string>('')

  // Password visibility toggles
  const { visible: peakCurrentPassword, toggle: togglePeakCurrentPassword } =
    usePasswordVisibility()
  const { visible: peakNewPassword, toggle: togglePeakNewPassword } = usePasswordVisibility()
  const { visible: peakConfirmPassword, toggle: togglePeakConfirmPassword } =
    usePasswordVisibility()

  /**
   * Resets the password for a user during the recovery flow
   * Validates matching passwords and sends reset request to the server
   */
  const resetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
      message.value = 'Passwords do not match!'
      isError.value = true
      return
    }

    try {
      const token = sessionStorage.getItem('token')
      await axios.post(
        `${apiBaseUrl}/reset_password`,
        {
          email: email.value,
          newPassword: newPassword.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Show success message
      message.value = 'Password reset successfully! Redirecting...'
      isError.value = false

      setTimeout(() => {
        sessionStorage.removeItem('user') // Log out the user
        router.replace('/')
      }, 1500)
    } catch (error) {
      if ((error as any).response?.data?.error) {
        message.value = (error as any).response.data.error
      } else {
        message.value = 'Failed to reset password.'
      }
      isError.value = true
    }
  }

  /**
   * Changes password for a logged-in user
   * Validates current password and ensures new passwords match
   * @param userId - ID of the user changing their password
   */
  const changePassword = async (userId: number) => {
    // Reset message
    message.value = ''
    isError.value = false

    // Validate passwords
    if (newPassword.value !== confirmPassword.value) {
      message.value = 'New passwords do not match'
      isError.value = true
      return
    }

    try {
      const token = sessionStorage.getItem('token')
      const response = await axios.post(
        `${apiBaseUrl}/change-password`,
        {
          userId: userId,
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      message.value = response.data.message || 'Password changed successfully'
      isError.value = false

      // Clear form
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } catch (error: any) {
      // Display proper error message from the server if available
      message.value = error.response?.data?.error || 'Failed to change password'
      isError.value = true
    }
  }

  /**
   * Logs out the current user by clearing session storage
   * Redirects to login page after a short delay
   */
  const logout = () => {
    sessionStorage.removeItem('user')
    message.value = 'Session expired. Please log in again.'
    isError.value = true

    setTimeout(() => {
      router.replace('/')
    }, 1500)
  }

  /**
   * Checks if the user is authenticated
   * Logs out if not authenticated
   */
  const checkAuth = () => {
    const storedUser = sessionStorage.getItem('user')
    if (!storedUser) {
      logout()
    }
  }

  /**
   * Initiates the password recovery process
   * Sends recovery request to server and redirects to reset page if successful
   * @param emailValue - Email address for recovery
   */
  const handleRecover = async (emailValue: string) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/recover`, {
        email: emailValue.toLowerCase(), // Convert email to lowercase
      })

      if (response.data.securityQuestion) {
        sessionStorage.setItem('recoverEmail', emailValue)
        sessionStorage.setItem('user', JSON.stringify({ email: emailValue })) // Store user session

        message.value = 'Recovery email sent. Redirecting...'
        isError.value = false

        setTimeout(() => {
          router.push('/reset')
        }, 1500)
      } else {
        message.value = 'Recovery failed. Please check your email.'
        isError.value = true
      }
    } catch (error) {
      message.value = 'Error: Unable to process recovery request.'
      isError.value = true
    }
  }

  /**
   * Fetches the security question associated with the user's email
   */
  const fetchSecurityQuestion = async () => {
    try {
      const response = await axios.post(`${apiBaseUrl}/recover`, {
        email: email.value,
      })
      // Check if the response contains a security question
      securityQuestion.value = response.data.securityQuestion
    } catch (error) {
      if (
        (error as any).response &&
        (error as any).response.data &&
        (error as any).response.data.error
      ) {
        errorMessage.value = (error as any).response.data.error
      } else {
        errorMessage.value = 'Failed to fetch security question.'
      }
    }
  }

  /**
   * Verifies the answer to the security question
   * Redirects to password reset page if answer is correct
   */
  const checkAnswer = async () => {
    try {
      // Check if the answer is correct
      const response = await axios.post(`${apiBaseUrl}/verify_answer`, {
        email: email.value,
        securityQuestionAnswer: answer.value,
      })
      // Push user to password reset if answer is correct
      if (response.data.message === 'Answer is correct') {
        successMessage.value = 'Answer is correct. You can reset your password.'
        sessionStorage.setItem('user', JSON.stringify({ email: email.value })) // Store user session
        router.replace('/password-reset') // Redirect to password reset page
      } else {
        errorMessage.value = 'Incorrect answer. Please try again.'
      }
    } catch (error) {
      errorMessage.value = 'Failed to verify answer.'
    }
  }

  return {
    email,
    currentPassword,
    newPassword,
    confirmPassword,
    message,
    isError,
    peakCurrentPassword,
    peakNewPassword,
    peakConfirmPassword,
    togglePeakCurrentPassword,
    togglePeakNewPassword,
    togglePeakConfirmPassword,
    resetPassword,
    changePassword,
    logout,
    checkAuth,
    handleRecover,
    // Security question related fields and functions
    securityQuestion,
    answer,
    errorMessage,
    successMessage,
    fetchSecurityQuestion,
    checkAnswer,
  }
}
