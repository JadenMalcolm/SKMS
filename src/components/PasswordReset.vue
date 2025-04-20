<template>
  <div class="page-header">
    <h1>Reset Your Password</h1>
  </div>
  <div class="reset-container">
    <div class="reset-box container">
      <p class="email-display">Email: {{ email }}</p>

      <div class="form-group">
        <div class="password-wrapper">
          <input
            :type="peakNewPassword ? 'text' : 'password'"
            id="newPassword"
            v-model="newPassword"
            placeholder="Enter new password"
            class="input"
            required
          />
          <span class="toggle-password" @click="togglePeakNewPassword">
            <img v-if="!peakNewPassword" src="../assets/eye.svg" alt="Show password" width="16" height="16" />
            <img v-else src="../assets/eye-off.svg" alt="Hide password" width="16" height="16" />
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
            class="input"
            required
          />
          <span class="toggle-password" @click="togglePeakConfirmPassword">
            <img v-if="!peakConfirmPassword" src="../assets/eye.svg" alt="Show password" width="16" height="16" />
            <img v-else src="../assets/eye-off.svg" alt="Hide password" width="16" height="16" />
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
.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.reset-box {
  width: 400px;
  padding: 30px;
}

.email-display {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9fbff;
  border-radius: 8px;
  font-weight: 500;
  border-left: 3px solid #4c95e8;
}

.form-group {
  margin: 1rem 0 0.5rem;
  width: 100%;
}

.success-message,
.error-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}

.full-width {
  width: 100%;
  margin-top: 10px;
}
</style>
