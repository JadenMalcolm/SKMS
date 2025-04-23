<template>
  <div class="admin-container">
    <header class="page-header"><h1>Staff</h1></header>
    <div v-if="isLoadingStaff" class="loading-indicator">
      <p>Loading user data...</p>
    </div>

    <div v-else class="user-categories">
      <div v-for="category in staffCategories" :key="category.id" class="container">
        <div class="subsection-header">{{ category.label }}</div>
        <div v-if="!categorizedUsers[category.id]?.length" class="empty-state">
          No {{ category.label.toLowerCase() }} found
        </div>
        <ul v-else class="user-list">
          <li v-for="user in categorizedUsers[category.id]" :key="user.id">
            {{ user.email }}
            <span class="role-badge">
              {{ category.id === 'experts' && user.role ? formatExpertRole(user.role) : category.badgeText }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import FloatingChat from './FloatingChat.vue'
import SidebarMenu from './SidebarMenu.vue'
import useCurrentUser from '../composables/useCurrentUser'
import useUsers from '../composables/useUsers'

// Define staff category interface
interface StaffCategory {
  id: keyof typeof categorizedUsers.value;
  label: string;
  badgeText: string;
}

// Get current user
const { currentUser, loadCurrentUser } = useCurrentUser()
const { categorizedUsers, isLoadingStaff, fetchUsersByRole, formatExpertRole } = useUsers(currentUser)

// Define staff categories for template iteration
const staffCategories: StaffCategory[] = [
  { id: 'admins', label: 'Administrators', badgeText: 'Admin' },
  { id: 'experts', label: 'Experts', badgeText: '' },
  { id: 'employees', label: 'Employees', badgeText: 'Employee' }
]

// Load data on mount
onMounted(async () => {
  await loadCurrentUser()
  await fetchUsersByRole()
})
</script>

<style scoped>
.admin-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.loading-indicator { text-align: center; padding: 20px; color: #666; }

.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 10px 0;
}

.role-badge {
  margin-left: auto;
  font-size: 0.8rem;
  background-color: rgba(76, 149, 232, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  color: #1976d2;
}
</style>
