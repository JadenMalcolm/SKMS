<template>
  <!-- Application header with system title -->
  <header class="page-header">
    <h1>Security Knowledge Management System</h1>
  </header>

  <!-- Main login container -->
  <div class="login-container">
    <div class="login-box container">
      <!-- Login form header -->
      <div class="section-header"><h2>Login</h2></div>

      <!-- Login form with email and password inputs -->
      <form @submit.prevent="handleLogin">
        <!-- Email input field -->
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
          class="input mb-20"
        />

        <!-- Password input field with toggle visibility functionality -->
        <div class="password-wrapper">
          <input
            :type="peakPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Enter your password"
            required
            class="input"
          />
          <!-- Toggle password visibility button -->
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

        <!-- Submit button -->
        <button type="submit" class="button button-success full-width">Login</button>
      </form>

      <!-- Status message display (success or error) -->
      <p v-if="loginMessage" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ loginMessage }}
      </p>

      <!-- Navigation links for user account management -->
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
import useAuth from '../composables/useAuth' // Import authentication composable

// Extract authentication state and methods from the auth composable
const { email, password, peakPassword, loginMessage, isError, togglePeakPassword,
        handleLogin, navigateToSignup, navigateToRecover, checkAuth } = useAuth()

// Check for existing authentication on component mount
// Redirect to dashboard if user is already logged in
onMounted(() => {
  const user = checkAuth()
  if (user) window.location.href = '/dashboard'
})
</script>

<style scoped>
/* Main container styling with flex layout */
.login-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

/* Login form box styling */
.login-box {
  width: 400px;
  padding: 30px;
}

/* Button spacing */
.button{
  margin-top: 20px;
}

/* Utility classes */
.mb-20 { margin-bottom: 20px; } /* Add bottom margin of 20px */
.full-width { width: 100%; } /* Make element take full available width */

/* Authentication link styling (Sign up & Reset Password) */
.auth-link {
  text-align: center;
  margin-top: 15px;
  color: #555;
}

/* Link styling */
.auth-link a {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
}

/* Link hover state */
.auth-link a:hover {
  color: #0056b3;
  text-decoration: underline;
}
</style>
