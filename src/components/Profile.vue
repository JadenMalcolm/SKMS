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
            <span>{{ user?.email }}</span>
          </div>
          <div class="info-item">
            <label>Role:</label>
            <span>{{ user?.role }}</span>
          </div>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="profile-section">
        <div class="section-header">
          <h2>Change Password</h2>
        </div>
        <form @submit.prevent="changePassword" class="password-form">
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
      <div v-if="message" :class="{ 'success-message': !isError, 'error-message': isError }" class="feedback-message">
        {{ message }}
      </div>
    </div>
    <SidebarMenu />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface User {
  id: number
  email: string
  role: string
}

const router = useRouter()
const user = ref<User | null>(null)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const message = ref('')
const isError = ref(false)
const peakCurrentPassword = ref(false)
const peakNewPassword = ref(false)
const peakConfirmPassword = ref(false)

// Toggle password visibility functions
const togglePeakCurrentPassword = () => {
  peakCurrentPassword.value = !peakCurrentPassword.value
}

const togglePeakNewPassword = () => {
  peakNewPassword.value = !peakNewPassword.value
}

const togglePeakConfirmPassword = () => {
  peakConfirmPassword.value = !peakConfirmPassword.value
}

// Change password function
const changePassword = async () => {
  // Reset message
  message.value = ''
  isError.value = false

  // Validate passwords
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'New passwords do not match'
    isError.value = true
    return
  }

  try {
    const response = await axios.post('http://localhost:5000/change-password', {
      userId: user.value?.id,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })

    message.value = response.data.message || 'Password changed successfully'
    isError.value = false

    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    // Display proper error message from the server if available
    message.value = error.response?.data?.error || 'Failed to change password'
    isError.value = true
  }
}

onMounted(() => {
  // Load user from session storage
  const userString = sessionStorage.getItem('user')

  if (userString) {
    user.value = JSON.parse(userString)
  } else {
    router.push('/')
  }
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
