import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Generic toggle function similar to useAuth's togglePeakPassword
const togglePasswordVisibility = (passwordRef: { value: boolean }): void => {
  passwordRef.value = !passwordRef.value
}

export default function usePasswordReset() {
  const router = useRouter()

  // State variables
  const email = ref(sessionStorage.getItem('recoverEmail') || '')
  const currentPassword = ref('')
  const newPassword = ref('')
  const confirmPassword = ref('')
  const message = ref('')
  const isError = ref(false)

  // Password visibility toggles
  const peakCurrentPassword = ref(false)
  const peakNewPassword = ref(false)
  const peakConfirmPassword = ref(false)

  // Toggle functions
  const togglePeakCurrentPassword = () => togglePasswordVisibility(peakCurrentPassword)
  const togglePeakNewPassword = () => togglePasswordVisibility(peakNewPassword)
  const togglePeakConfirmPassword = () => togglePasswordVisibility(peakConfirmPassword)

  // Function to reset password (for password recovery)
  const resetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
      message.value = 'Passwords do not match!'
      isError.value = true
      return
    }

    try {
      await axios.post('http://localhost:5000/reset_password', {
        email: email.value,
        newPassword: newPassword.value,
      })

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

  // Function to change password (for logged-in users)
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
      const response = await axios.post('http://localhost:5000/change-password', {
        userId: userId,
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      })

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

  // Function to log out user
  const logout = () => {
    sessionStorage.removeItem('user')
    message.value = 'Session expired. Please log in again.'
    isError.value = true

    setTimeout(() => {
      router.replace('/')
    }, 1500)
  }

  // Check authentication on mount
  const checkAuth = () => {
    const storedUser = sessionStorage.getItem('user')
    if (!storedUser) {
      logout()
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
  }
}
