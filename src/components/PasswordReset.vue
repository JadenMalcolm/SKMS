<template>
  <div class="header">Reset Your Password</div>
  <div class="reset-container">
    <div class="reset-box">
      <p>Email: {{ email }}</p>

      <div class="form-group">
        <div class="password-wrapper">
          <input
            :type="peakNewPassword ? 'text' : 'password'"
            id="newPassword"
            v-model="newPassword"
            placeholder="Enter new password"
            required
          />
          <span class="toggle-password" @click="togglePeakNewPassword">
            <img v-if="!peakNewPassword" :src="eyeIcon" alt="Show password" width="16" height="16" />
            <img v-else :src="eyeOffIcon" alt="Hide password" width="16" height="16" />
          </span>
        </div>
      </div>

      <div class="form-group">
        <div class="password-wrapper">
          <input
            :type="peakConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            v-model="confirmPassword"
            placeholder="Confirm new password"
            required
          />
          <span class="toggle-password" @click="togglePeakConfirmPassword">
            <img v-if="!peakConfirmPassword" :src="eyeIcon" alt="Show password" width="16" height="16" />
            <img v-else :src="eyeOffIcon" alt="Hide password" width="16" height="16" />
          </span>
        </div>
      </div>

      <button class="button button-success full-width" @click="resetPassword">
        Reset Password
      </button>

      <!-- Display Messages -->
      <p v-if="message" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// imports
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import eyeIcon from '../assets/eye.svg'
import eyeOffIcon from '../assets/eye-off.svg'

// variables
const email = ref<string>(sessionStorage.getItem('recoverEmail') || '')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')
const message = ref<string>('')
const isError = ref<boolean>(false)
const router = useRouter()
const peakNewPassword = ref(false)
const peakConfirmPassword = ref(false)

// functions to toggle password visibility
const togglePeakNewPassword = () => {
  peakNewPassword.value = !peakNewPassword.value
}

const togglePeakConfirmPassword = () => {
  peakConfirmPassword.value = !peakConfirmPassword.value
}

// function to reset password
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

// function to log out user
const logout = () => {
  sessionStorage.removeItem('user')
  message.value = 'Session expired. Please log in again.'
  isError.value = true

  setTimeout(() => {
    router.replace('/')
  }, 1500)
}

onMounted(() => {
  // Check if user session exists
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    logout()
  }
})
</script>

<style scoped>
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 30px;
  color: #333;
  background-color: #f0f0f0;
}

.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.reset-box {
  width: 350px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-group {
  overflow: hidden;
  border-radius: 8px;
  background-color: #fff;
  margin: 1rem 0 0.5rem;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

.form-group input {
  outline: none;
  border: 1px solid #e5e7eb;
  margin: 3px 0;
  background-color: #fff;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.password-wrapper {
  position: relative;
}

.success-message,
.error-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-size: 14px;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.full-width {
  width: 100%;
}
</style>
