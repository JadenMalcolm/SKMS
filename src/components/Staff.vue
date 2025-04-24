<template>
  <!-- Main container for staff directory -->
  <div class="admin-container">
    <header class="page-header"><h1>Staff</h1></header>

    <!-- Loading indicator when staff data is being fetched -->
    <div v-if="isLoadingStaff" class="loading-indicator">
      <p>Loading user data...</p>
    </div>

    <!-- Staff categories display grid -->
    <div v-else class="user-categories">
      <!-- Iterate through each staff category -->
      <div v-for="category in staffCategories" :key="category.id" class="container">
        <div class="subsection-header">{{ category.label }}</div>

        <!-- Empty state when no users in category -->
        <div v-if="!categorizedUsers[category.id]?.length" class="empty-state">
          No {{ category.label.toLowerCase() }} found
        </div>

        <!-- List of users in this category -->
        <ul v-else class="user-list">
          <li v-for="user in categorizedUsers[category.id]" :key="user.id">
            {{ user.email }}
            <!-- Role badge with special formatting for experts -->
            <span class="role-badge">
              {{ category.id === 'experts' && user.role ? formatExpertRole(user.role) : category.badgeText }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <!-- Global navigation components -->
  <FloatingChat />
  <SidebarMenu />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import FloatingChat from './FloatingChat.vue'
import SidebarMenu from './SidebarMenu.vue'
import useCurrentUser from '../composables/useCurrentUser'
import useUsers from '../composables/useUsers'

// Define type for staff category configuration
interface StaffCategory {
  id: keyof typeof categorizedUsers.value;
  label: string;
  badgeText: string;
}

// Initialize composables
const { currentUser, loadCurrentUser } = useCurrentUser()
const { categorizedUsers, isLoadingStaff, fetchUsersByRole, formatExpertRole } = useUsers(currentUser)

// Define staff categories for template iteration with labels and badge text
const staffCategories: StaffCategory[] = [
  { id: 'admins', label: 'Administrators', badgeText: 'Admin' },
  { id: 'experts', label: 'Experts', badgeText: '' },
  { id: 'employees', label: 'Employees', badgeText: 'Employee' }
]

// Load user data on component mount
onMounted(async () => {
  await loadCurrentUser()  // Ensure current user is loaded
  await fetchUsersByRole() // Fetch and categorize all users by role
})
</script>

<style scoped>
/* Main container with maximum width */
.admin-container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Grid layout for staff categories */
.user-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Loading indicator styling */
.loading-indicator { text-align: center; padding: 20px; color: #666; }

/* Empty state styling when a category has no users */
.empty-state {
  padding: 15px;
  text-align: center;
  color: #888;
  font-style: italic;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 10px 0;
}

/* Role badge styling for user list items */
.role-badge {
  margin-left: auto;
  font-size: 0.8rem;
  background-color: rgba(76, 149, 232, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  color: #1976d2;
}
</style>
