import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import SignUp from '../components/SignUp.vue'
import QuestionDetails from '../components/QuestionDetails.vue'
import Recover from '../components/Recover.vue'
import Reset from '../components/Reset.vue'
import PasswordReset from '../components/PasswordReset.vue'
import QuestionComponent from './QuestionCategory.vue'
import DirectMessages from './DirectMessages.vue'


const routes = [
  { path: '/', component: Login }, // Default route
  { path: '/dashboard', component: Dashboard }, // Dashboard route
  { path: '/signup', component: SignUp }, // Signup Route
  { path: '/recover', component: Recover }, // Recover route
  { path: '/question/:id', component: QuestionDetails }, // Question details route
  { path: '/reset', component: Reset }, // Reset password route
  { path: '/password-reset', component: PasswordReset }, // Password reset route
  { path: '/asset', component: QuestionComponent, props: { category: 'Asset' } }, // Asset route
  { path: '/threat', component: QuestionComponent, props: { category: 'Threat' } }, // Threat route
  { path: '/security-goal', component: QuestionComponent, props: { category: 'Security Goal' } }, // Security Goal route
  { path: '/countermeasure', component: QuestionComponent, props: { category: 'Countermeasure' } }, // Countermeasure route
  { path: '/defense-strategy',component: QuestionComponent,props: { category: 'Defense Strategy' },}, // Defense Strategy route
  { path: '/vulnerability', component: QuestionComponent, props: { category: 'Vulnerability' } }, // Vulnerability route
  { path: '/direct-messages',component: DirectMessages,}, // Direct Messages route
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
