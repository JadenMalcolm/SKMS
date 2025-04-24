<template>
  <!-- Page header -->
  <header class="page-header"><h1>Reset Your Password</h1></header>

  <!-- Main container for the password reset form -->
  <div class="reset-container">
    <div class="reset-box container">
      <!-- Display the email address that is being reset -->
      <p class="email-display">Email: {{ email }}</p>

      <!-- New password input field with visibility toggle -->
      <div class="password-wrapper mb-20">
        <input
          :type="peakNewPassword ? 'text' : 'password'"
          v-model="newPassword"
          placeholder="Enter new password"
          class="input"
          required
        />
        <!-- Password visibility toggle button -->
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

      <!-- Confirm password input field with visibility toggle -->
      <div class="password-wrapper mb-20">
        <input
          :type="peakConfirmPassword ? 'text' : 'password'"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          class="input"
          required
        />
        <!-- Password visibility toggle button -->
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

      <!-- Submit button to complete password reset -->
      <button class="button button-success full-width" @click="resetPassword">Reset Password</button>

      <!-- Status message display (error or success) -->
      <p v-if="message" :class="isError ? 'error-message' : 'success-message'">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import usePasswordReset from '../composables/usePasswordReset' // Import password reset composable

// Extract state and methods from the password reset composable
const {
  email,                  // Email address from URL parameter
  newPassword,            // New password input field
  confirmPassword,        // Confirm password input field
  message,                // Status message for user feedback
  isError,                // Flag to determine if message is an error
  peakNewPassword,        // Toggle visibility for new password
  peakConfirmPassword,    // Toggle visibility for confirm password
  togglePeakNewPassword,  // Method to toggle new password visibility
  togglePeakConfirmPassword, // Method to toggle confirm password visibility
  resetPassword,          // Method to submit password reset
  checkAuth               // Method to validate token on component mount
} = usePasswordReset()

// Validate the reset token when component is mounted
onMounted(checkAuth)
</script>

<style scoped>
/* Layout container for centering the form */
.reset-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

/* Form container styling */
.reset-box {
  width: 400px;
  padding: 30px;
}

/* Email display styling with left accent border */
.email-display {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9fbff;
  border-radius: 8px;
  font-weight: 500;
  border-left: 3px solid #4c95e8;
}

/* Utility class for bottom margin */
.mb-20 {
  margin-bottom: 20px;
}

/* Utility class for full width elements */
.full-width {
  width: 100%;
}
</style>
