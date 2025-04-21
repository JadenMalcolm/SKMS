<template>
  <div class="page-header">
    <h1>Security Knowledge Management System</h1>
  </div>
  <div class="login-container">
    <div class="login-box container">
      <div class="section-header">
        <h2>Login</h2>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter your email"
            required
            class="input"
          />
        </div>
        <div class="form-group">
          <div class="password-wrapper">
            <input
              :type="peakPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              placeholder="Enter your password"
              required
              class="input"
            />
            <span class="toggle-password" @click="togglePeakPassword">
              <img
                v-if="!peakPassword"
                src="../assets/eye.svg"
                alt="Show password"
                width="16"
                height="16"
              />
              <img v-else src="../assets/eye-off.svg" alt="Hide password" width="16" height="16" />
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.login-box {
  width: 400px;
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}
.section-header h2 {
  font-size: 2rem;
}

.signup-link,
.recover-link {
  text-align: center;
  margin-top: 15px;
  color: #555;
}

.signup-link a,
.recover-link a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.signup-link a:hover,
.recover-link a:hover {
  color: #0056b3;
  text-decoration: underline;
}


</style>
