<template>
  <div class="header">Security Knowledge Management System</div>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Login</h1>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" class="login-button">Login</button>
      </form>

      <!-- Message Box for Login Status -->
      <p v-if="loginMessage" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ loginMessage }}
      </p>

      <p class="signup-link">
        Don’t have an account? <a href="/signup" @click.prevent="navigateToSignup">Sign up</a>
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
const router = useRouter()

// New reactive properties for messages
const loginMessage = ref('')
const isError = ref(false)

// function to handle login
const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/login', {
      email: email.value,
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
  font-size: 1rem;
  color: #333;
  font-weight: bold;
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

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.login-button:hover {
  background-color: #45a049;
}

/* Login message styles */
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
</style>
