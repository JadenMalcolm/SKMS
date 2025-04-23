<template>
  <div class="page-header">
    <h1>Recover Password</h1>
  </div>
  <div class="recover-container">
    <div class="recover-box container">
      <form @submit.prevent="submitRecover">
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
        <button type="submit" class="button button-success full-width">Submit</button>
      </form>

      <!-- Message Display -->
      <p v-if="message" :class="{ 'error-message': isError, 'success-message': !isError }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import usePasswordReset from '../composables/usePasswordReset'

const email = ref('')
const { handleRecover, message, isError } = usePasswordReset()

const submitRecover = () => {
  handleRecover(email.value)
}
</script>

<style scoped>
.recover-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 70vh;
  padding-top: 30px;
  background-color: #f0f0f0;
}

.recover-box {
  width: 400px;
  padding: 30px;
  text-align: center;
}
.full-width {
  width: 100%;
}

.form-group {
  margin: 1rem 0 1.5rem;
}


.error-message {
  background-color: #ffebee;
  color: #c62828;
}
</style>
