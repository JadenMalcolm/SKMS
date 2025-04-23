<template>
  <header class="page-header">
    <h1>Security Knowledge Management System</h1>
  </header>
  <div class="login-container">
    <div class="login-box container">
      <div class="section-header"><h2>Login</h2></div>
      <form @submit.prevent="handleLogin">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
          class="input mb-20"
        />
        <div class="password-wrapper">
          <input
            :type="peakPassword ? 'text' : 'password'"
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
        <button type="submit" class="button button-success full-width">Login</button>
      </form>

      <p v-if="loginMessage" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ loginMessage }}
      </p>

      <p class="auth-link">
        Don't have an account? <a href="/signup" @click.prevent="navigateToSignup">Sign up</a>
      </p>
      <p class="auth-link">
        Forgot Password? <a href="/recover" @click.prevent="navigateToRecover">Reset Password</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import useAuth from '../composables/useAuth'

const { email, password, peakPassword, loginMessage, isError, togglePeakPassword,
        handleLogin, navigateToSignup, navigateToRecover, checkAuth } = useAuth()

onMounted(() => {
  const user = checkAuth()
  if (user) window.location.href = '/dashboard'
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

.button{
  margin-top: 20px;
}

.mb-20 { margin-bottom: 20px; }
.full-width { width: 100%; }

.auth-link {
  text-align: center;
  margin-top: 15px;
  color: #555;
}

.auth-link a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

.auth-link a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
