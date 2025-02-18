import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import SignUp from '../components/SignUp.vue'
import QuestionDetails from '../components/QuestionDetails.vue'
import Recover from '../components/Recover.vue'
import Reset from '../components/Reset.vue'
import PasswordReset from '../components/PasswordReset.vue'

const routes = [
  { path: '/', component: Login }, // Default route
  { path: '/dashboard', component: Dashboard }, // Dashboard route
  { path: '/signup', component: SignUp }, // Signup Route
  { path: '/recover', component: Recover }, // Recover route
  { path: '/question/:id', component: QuestionDetails }, // Question details route
  { path: '/reset', component: Reset }, // Reset password route
  { path: '/passwordreset', component: PasswordReset }, // Password reset route
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
