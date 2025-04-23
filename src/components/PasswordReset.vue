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
            <img
              v-if="!peakNewPassword"
              src="../assets/eye.svg"
              alt="Show password"
              width="16"
              height="16"
            />
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
            <img
              v-if="!peakConfirmPassword"
              src="../assets/eye.svg"
              alt="Show password"
              width="16"
              height="16"
            />
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
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset'

// Use the password reset composable
const {
  email,
  newPassword,
  confirmPassword,
  message,
  isError,
  peakNewPassword,
  peakConfirmPassword,
  togglePeakNewPassword,
  togglePeakConfirmPassword,
  resetPassword,
  checkAuth,
} = usePasswordReset()

onMounted(checkAuth)
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

.full-width {
  width: 100%;
  margin-top: 10px;
}
</style>
