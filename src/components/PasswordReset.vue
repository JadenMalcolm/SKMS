<template>
  <div>
    <h1>Reset Your Password</h1>
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
    <button @click="resetPassword">Reset Password</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref<string>(sessionStorage.getItem('recoverEmail') || '')
const newPassword = ref<string>('')
const confirmPassword = ref<string>('')
const errorMessage = ref<string>('')
const router = useRouter()

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
    router.push('/')
  } catch (error) {
    errorMessage.value = 'Failed to reset password.'
  }
}
</script>

<style scoped>
/* Add your styles here */
</style>
