<template>
  <header class="page-header"><h1>Recover Password</h1></header>
  <div class="recover-container">
    <div class="recover-box container">
      <form @submit.prevent="handleRecover(email)">
        <input
          type="email"
          v-model="email"
          placeholder="Enter your email"
          required
          class="input mb-20"
        />
        <button type="submit" class="button button-success full-width">Submit</button>
      </form>
      <p v-if="message" :class="isError ? 'error-message' : 'success-message'">
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

.mb-20 {
  margin-bottom: 20px;
}

.full-width {
  width: 100%;
}
</style>
