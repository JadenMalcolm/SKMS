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
import { onMounted } from 'vue'
import useAuth from '../composables/useAuth'

const {
  email,
  password,
  peakPassword,
  loginMessage,
  isError,
  togglePeakPassword,
  handleLogin,
  navigateToSignup,
  navigateToRecover,
  checkAuth,
} = useAuth()

// Check if already logged in
onMounted(() => {
  const user = checkAuth()
  if (user) {
    // User is already logged in, redirect to dashboard
    window.location.href = '/dashboard'
  }
})
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
