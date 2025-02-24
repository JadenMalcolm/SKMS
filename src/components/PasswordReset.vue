<template>
  <div class="header">Reset Your Password</div>
  <div class="reset-container">
    <div class="reset-box">
      <p>Email: {{ email }}</p>
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input
          type="password"
          id="newPassword"
          v-model="newPassword"
          placeholder="Enter new password"
          required
        />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          required
        />
      </div>
      <button class="reset-button" @click="resetPassword">Reset Password</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
const errorMessage = ref<string>('')
const router = useRouter()

// function to reset password
const resetPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match!'
    return
  }

  try {
    await axios.post('http://localhost:5000/reset_password', {
      email: email.value,
      newPassword: newPassword.value,
    })
    alert('Password reset successfully!')
    // Clear session storage
    sessionStorage.removeItem('user')
    router.replace('/')
  } catch (error) {
    // Handle error response from the backend
    if (
      (error as any).response &&
      (error as any).response.data &&
      (error as any).response.data.error
    ) {
      errorMessage.value = (error as any).response.data.error
    } else {
      errorMessage.value = 'Failed to reset password.'
    }
  }
}

// function to log out user
const logout = () => {
  sessionStorage.removeItem('user')
  alert('Session expired. Please log in again.')
  router.replace('/')
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
  margin-bottom: 20px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}
.form-group input {
  width: 95%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.reset-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}
.reset-button:hover {
  background-color: #45a049;
}
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
