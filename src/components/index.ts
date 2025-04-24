/**
 * Main router configuration file for the Security Knowledge Management System (SKMS)
 * This file defines all application routes and imports their associated components
 */

// Import Vue Router library components
import { createRouter, createWebHistory } from 'vue-router'

// Authentication and user management components
import Login from '../components/Login.vue'
import SignUp from '../components/SignUp.vue'
import Recover from '../components/Recover.vue'
import Reset from '../components/Reset.vue'
import PasswordReset from '../components/PasswordReset.vue'
import Profile from './Profile.vue'

// Core application components
import Dashboard from '../components/Dashboard.vue'
import QuestionDetails from '../components/QuestionDetails.vue'
import QuestionComponent from './QuestionCategory.vue'
import DirectMessages from './DirectMessages.vue'
import Meetings from './Meetings.vue'

// Administrative components
import AdminPanel from './AdminPanel.vue'
import Staff from './Staff.vue'

// Knowledge resources components
import Learn from '../components/Learn.vue'
import Policies from './Policies.vue'

/**
 * Application routes configuration
 * Each route maps a URL path to a specific component and optionally passes props
 */
const routes = [
  // Authentication routes
  { path: '/', component: Login }, // Default route
  { path: '/signup', component: SignUp }, // Signup Route
  { path: '/recover', component: Recover }, // Recover route
  { path: '/reset', component: Reset }, // Reset password route
  { path: '/password-reset', component: PasswordReset }, // Password reset route

  // Main application routes
  { path: '/dashboard', component: Dashboard }, // Dashboard route
  { path: '/question/:id', component: QuestionDetails }, // Question details route with dynamic parameter
  { path: '/direct-messages', component: DirectMessages }, // Direct Messages route
  { path: '/meetings', component: Meetings }, // Meetings page route
  { path: '/profile', component: Profile }, // Profile page route

  // Category-specific question routes
  // These routes all use the same component with different category props
  { path: '/asset', component: QuestionComponent, props: { category: 'Asset' } }, // Asset route
  { path: '/threat', component: QuestionComponent, props: { category: 'Threat' } }, // Threat route
  { path: '/security-goal', component: QuestionComponent, props: { category: 'Security Goal' } }, // Security Goal route
  { path: '/countermeasure', component: QuestionComponent, props: { category: 'Countermeasure' } }, // Countermeasure route
  { path: '/defense-strategy', component: QuestionComponent, props: { category: 'Defense Strategy' } }, // Defense Strategy route
  { path: '/vulnerability', component: QuestionComponent, props: { category: 'Vulnerability' } }, // Vulnerability route

  // Administrative and resource routes
  { path: '/admin-panel', component: AdminPanel }, // Admin panel route
  { path: '/learn', component: Learn }, // Learn page route
  { path: '/staff', component: Staff }, // Administration page route
  { path: '/policies', component: Policies }, // Policies page route
]

/**
 * Create and configure the Vue Router instance
 * - Uses HTML5 history mode for cleaner URLs without hash fragments
 * - Applies the routes defined above
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Export the router instance for use in the main application
export default router
