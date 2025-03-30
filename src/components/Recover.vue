<template>
  <div class="header">Recover Password</div>
  <div class="recover-container">
    <div class="recover-box">
      <form @submit.prevent="handleRecover">
        <div class="form-group">
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <button type="submit" class="button button-success full-width">Submit</button>
      </form>

      <!-- Message Display -->
      <p v-if="message" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const message = ref('')
const isError = ref(false)
const router = useRouter()

const handleRecover = async () => {
  try {
    const response = await axios.post('http://localhost:5000/recover', {
      email: email.value,
    })

    if (response.data.securityQuestion) {
      sessionStorage.setItem('recoverEmail', email.value)
      sessionStorage.setItem('user', JSON.stringify({ email: email.value })) // Store user session

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
</script>

<style scoped>
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 30px;
  color: #333;
  background-color: #f0f0f0;
}

.recover-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.recover-box {
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
