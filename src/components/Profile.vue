<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>My Profile</h1>
    </div>

    <div class="profile-content">
      <!-- User Information Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>User Information</h2>
        </div>
        <div class="user-info">
          <div class="info-item">
            <label>Email:</label>
            <span>{{ currentUser?.email }}</span>
          </div>
          <div class="info-item">
            <label>Role:</label>
            <span>{{ currentUser?.role }}</span>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Change Password</h2>
        </div>
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <div class="password-wrapper">
              <input
                :type="peakCurrentPassword ? 'text' : 'password'"
                id="currentPassword"
                v-model="currentPassword"
                placeholder="Enter current password"
                class="input"
                required
              />
              <span class="toggle-password" @click="togglePeakCurrentPassword">
                <img
                  v-if="!peakCurrentPassword"
                  src="../assets/eye.svg"
                  alt="Show password"
                  width="16"
                  height="16"
                />
                <img
                  v-else
                  src="../assets/eye-off.svg"
                  alt="Hide password"
                  width="16"
                  height="16"
                />
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
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
                <img
                  v-else
                  src="../assets/eye-off.svg"
                  alt="Hide password"
                  width="16"
                  height="16"
                />
              </span>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
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
                <img
                  v-else
                  src="../assets/eye-off.svg"
                  alt="Hide password"
                  width="16"
                  height="16"
                />
              </span>
            </div>
          </div>

          <button type="submit" class="button button-primary">Change Password</button>
        </form>
      </div>

      <!-- Feedback Message -->
      <div
        v-if="message"
        :class="{ 'success-message': !isError, 'error-message': isError }"
        class="feedback-message"
      >
        {{ message }}
      </div>
    </div>
    <floating-chat />
    <sidebar-menu />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import useCurrentUser from '../composables/useCurrentUser'
import usePasswordReset from '../composables/usePasswordReset'
import type { User } from '../composables/useUsers'

// Get current user
const { currentUser, loadCurrentUser } = useCurrentUser()

// Use password reset functionality
const {
  currentPassword,
  newPassword,
  confirmPassword,
  message,
  isError,
  peakCurrentPassword,
  peakNewPassword,
  peakConfirmPassword,
  togglePeakCurrentPassword,
  togglePeakNewPassword,
  togglePeakConfirmPassword,
  changePassword,
} = usePasswordReset()

// Wrapper for changePassword that provides the user ID
const handleChangePassword = () => {
  if (currentUser.value && currentUser.value.id) {
    changePassword(currentUser.value.id)
  }
}

onMounted(() => {
  // Load user data
  loadCurrentUser()
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.profile-section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.user-info {
  margin-top: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item label {
  width: 100px;
  font-weight: 600;
  color: #555;
}

.info-item span {
  flex: 1;
  color: #333;
}

.password-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.feedback-message {
  margin-top: 20px;
  padding: 12px 15px;
  border-radius: 8px;
  text-align: center;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
}

@media (max-width: 600px) {
  .info-item {
    flex-direction: column;
    gap: 5px;
  }

  .info-item label {
    width: 100%;
  }
}
</style>
