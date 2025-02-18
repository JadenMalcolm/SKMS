import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import SignUp from '../components/SignUp.vue'
import QuestionDetails from '../components/QuestionDetails.vue'
import Recover from '../components/Recover.vue'

const routes = [
  { path: '/', component: Login }, // Default route
  { path: '/dashboard', component: Dashboard }, // Dashboard route
  { path: '/signup', component: SignUp }, // Signup Route
  { path: '/recover', component: Recover }, //Recover
  { path: '/question/:id', component: QuestionDetails }, // Question details route
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
