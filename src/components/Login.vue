<template>
  <div class="header">Log In</div>
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
        <button type="submit" class="login-button">Login</button>
      </form>

      <p class="signup-link">
        Don’t have an account? <a href="/signup" @click.prevent="navigateToSignup">Sign up</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/login', {
      email: email.value,
      password: password.value,
    })

    const user = response.data.user // Extract user data from the server response
    sessionStorage.setItem('user', JSON.stringify(user)) // Store user data temporarily
    alert('Login successful!')
    router.push('/dashboard') // Navigate to the dashboard
  } catch (error) {
    alert('Login failed')
  }
}

const navigateToSignup = () => {
  router.push('/signup') // Navigate to the Sign-up page
}
</script>

<style scoped>
.header {
  font-size: 2rem;
  text-align: center;
  margin-top: 20px;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
.login-box {
  width: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
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
  box-sizing: border-box;
}
.login-button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.signup-link {
  text-align: center;
  margin-top: 10px;
}

</style>
