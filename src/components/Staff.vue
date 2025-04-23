<template>
  <div class="admin-container">
    <header class="page-header">
      <h1>Staff</h1>
    </header>
    <div v-if="isLoadingStaff" class="loading-indicator">
      <p>Loading user data...</p>
    </div>

    <div v-else class="user-categories">
      <!-- Admins -->
      <div class="container">
        <div class="subsection-header">Administrators</div>
        <div v-if="categorizedUsers.admins.length === 0" class="empty-state">
          No administrators found
        </div>
        <ul v-else class="user-list">
          <li v-for="user in categorizedUsers.admins" :key="user.id">
            {{ user.email }}
            <span class="role-badge">Admin</span>
          </li>
        </ul>
      </div>

      <!-- Experts -->
      <div class="container">
        <div class="subsection-header">Experts</div>
        <div v-if="categorizedUsers.experts.length === 0" class="empty-state">No experts found</div>
        <ul v-else class="user-list">
          <li v-for="user in categorizedUsers.experts" :key="user.id">
            {{ user.email }}
            <span class="role-badge">{{ formatExpertRole(user.role || 'Unknown') }}</span>
          </li>
        </ul>
      </div>

      <!-- Employees -->
      <div class="container">
        <div class="subsection-header">Employees</div>
        <div v-if="categorizedUsers.employees.length === 0" class="empty-state">
          No employees found
        </div>
        <ul v-else class="user-list">
          <li v-for="user in categorizedUsers.employees" :key="user.id">
            {{ user.email }}
            <span class="role-badge">Employee</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <floating-chat />
  <sidebar-menu />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import useCurrentUser from '../composables/useCurrentUser'
import useUsers from '../composables/useUsers'

// Get current user
const { currentUser, loadCurrentUser } = useCurrentUser()

// Use the users composable
const { categorizedUsers, isLoadingStaff, fetchUsersByRole, formatExpertRole } =
  useUsers(currentUser)

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

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

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
