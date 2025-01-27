<template>
  <div class="login-container">
    <div class="login-box">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Enter your email" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            id="password"
            v-model="password2"
            placeholder="Re-Enter your password"
            required
          />
        </div>
        <button type="submit" class="login-button">Create Account</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const password2 = ref('')
const router = useRouter()

const handleLogin = async () => {
  // Simulate authentication
  if (password.value !== password2.value) {
    alert('Passwords do not match!')
    return
  }
  try {
    await axios.post('http://localhost:5000/signup', {
      email: email.value,
      password: password.value,
    })
    alert('New Account Created!')
    router.push('/')
  } catch (error) {
    alert('Signup failed')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}
.login-box {
  width: 300px;
  padding: 20px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.login-button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.login-button:hover {
  background-color: #218838;
}

</style>
