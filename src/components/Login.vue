<template>
  <div class="header">Security Knowledge Management System</div>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Login</h1>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <div class="password-wrapper">
            <input :type="peakPassword ? 'text' : 'password'" id="password" v-model="password" placeholder="Enter your password" required />
            <span class="toggle-password" @click="togglePeakPassword">
              <img v-if="!peakPassword" :src="eyeIcon" alt="Show password" width="16" height="16" />
              <img v-else :src="eyeOffIcon" alt="Hide password" width="16" height="16" />
            </span>
          </div>
        </div>
        <button type="submit" class="button button-success full-width">Login</button>
      </form>

      <!-- Message Box for Login Status -->
      <p v-if="loginMessage" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ loginMessage }}
      </p>

      <p class="signup-link">
        Don't have an account? <a href="/signup" @click.prevent="navigateToSignup">Sign up</a>
      </p>
      <p class="recover-link">
        Forgot Password? <a href="/recover" @click.prevent="navigateToRecover">Reset Password</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// imports
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import eyeIcon from '../assets/eye.svg'
import eyeOffIcon from '../assets/eye-off.svg'

// variables
const email = ref('')
const password = ref('')
const peakPassword = ref(false) // renamed from showPassword
const router = useRouter()

// New reactive properties for messages
const loginMessage = ref('')
const isError = ref(false)

// function to toggle password visibility
const togglePeakPassword = () => {
  peakPassword.value = !peakPassword.value
}

// function to handle login
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

// function to navigate to signup page
const navigateToSignup = () => {
  router.push('/signup')
}

// function to navigate to recover password page
const navigateToRecover = () => {
  router.push('/recover')
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

.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.login-box {
  width: 350px;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.login-header {
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: #000;
  padding-bottom: 1rem;
}
.form-group {
  overflow: hidden;
  border-radius: 8px;
  background-color: #fff;
  margin: 1rem 0 0.5rem;
  width: 100%;
}

.form-group input {
  outline: none;
  border: 1px solid #e5e7eb;
  margin: 3px 0;
  background-color: #fff;
  padding: 1rem;
  padding-right: 3rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-group button {
  width: 100%;
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

.signup-link,
.recover-link {
  text-align: center;
  margin-top: 10px;
  color: #555;
}

.signup-link a,
.recover-link a {
  color: #007bff;
  text-decoration: none;
}

.signup-link a:hover,
.recover-link a:hover {
  text-decoration: underline;
}

.full-width {
  width: 100%;
}
</style>
