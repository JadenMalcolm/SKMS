<template>
  <header class="page-header"><h1>Reset Your Password</h1></header>
  <div class="reset-container">
    <div class="reset-box container">
      <p class="email-display">Email: {{ email }}</p>

      <!-- New password input -->
      <div class="password-wrapper mb-20">
        <input
          :type="peakNewPassword ? 'text' : 'password'"
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

      <!-- Confirm password input -->
      <div class="password-wrapper mb-20">
        <input
          :type="peakConfirmPassword ? 'text' : 'password'"
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

      <button class="button button-success full-width" @click="resetPassword">Reset Password</button>

      <p v-if="message" :class="isError ? 'error-message' : 'success-message'">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset'

const { email, newPassword, confirmPassword, message, isError, peakNewPassword,
        peakConfirmPassword, togglePeakNewPassword, togglePeakConfirmPassword,
        resetPassword, checkAuth } = usePasswordReset()

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

.mb-20 {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}
</style>
