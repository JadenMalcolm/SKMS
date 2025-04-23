import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'

export interface User {
  id: number
  email: string
  role?: string
}

export interface CategorizedUsers {
  admins: User[]
  experts: User[]
  employees: User[]
}

export default function useUsers(currentUser: Ref<User | null>) {
  const users = ref<User[]>([])
  const allUsers = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const searchQuery = ref('')
  const newChatSearchQuery = ref('')

  // Fetch users who have messaged the current user
  const fetchMessagedUsers = async () => {
    if (currentUser.value) {
      try {
        const response = await axios.get(`http://localhost:5000/users/${currentUser.value.id}`)
        users.value = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
  }

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/all-users')
      // Filter out the current user from the list
      if (currentUser.value) {
        allUsers.value = response.data.filter((user: User) => user.id !== currentUser.value?.id)
      } else {
        allUsers.value = response.data
      }
    } catch (error) {
      console.error('Error fetching all users:', error)
    }
  }

  // Select a user
  const selectUser = (user: User | null) => {
    selectedUser.value = user
  }

  // Computed property to filter users based on search query
  const filteredUsers = computed(() => {
    return users.value.filter(
      (user) =>
        user.id !== currentUser.value?.id &&
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  // Computed property to filter ALL users based on search query
  // This is needed for components like Meetings that need to search all users
  const filteredAllUsers = computed(() => {
    return allUsers.value.filter(
      (user) =>
        user.id !== currentUser.value?.id &&
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  // Computed property to filter all users based on new chat search query
  const newChatFilteredUsers = computed(() => {
    return allUsers.value.filter(
      (user) =>
        user.id !== currentUser.value?.id &&
        user.email.toLowerCase().includes(newChatSearchQuery.value.toLowerCase()),
    )
  })

  // Staff management
  const categorizedUsers = ref<CategorizedUsers>({
    admins: [],
    experts: [],
    employees: [],
  })
  const isLoadingStaff = ref(false)

  // Fetch users by role categories (for Staff.vue)
  const fetchUsersByRole = async () => {
    try {
      isLoadingStaff.value = true

      const [adminsResponse, expertsResponse, employeesResponse] = await Promise.all([
        axios.get('http://localhost:5000/users/admins'),
        axios.get('http://localhost:5000/users/experts'),
        axios.get('http://localhost:5000/users/employees'),
      ])

      categorizedUsers.value = {
        admins: adminsResponse.data,
        experts: expertsResponse.data,
        employees: employeesResponse.data,
      }
    } catch (error) {
      console.error('Error fetching user data by roles:', error)
    } finally {
      isLoadingStaff.value = false
    }
  }

  // Format expert role for display (remove prefix and capitalize)
  const formatExpertRole = (role: string): string => {
    if (!role.startsWith('expert-')) return role

    // Remove 'expert-' prefix and capitalize
    const domain = role.substring(7)
    return domain.charAt(0).toUpperCase() + domain.slice(1)
  }

  return {
    users,
    allUsers,
    selectedUser,
    searchQuery,
    newChatSearchQuery,
    filteredUsers,
    filteredAllUsers,
    newChatFilteredUsers,
    fetchMessagedUsers,
    fetchAllUsers,
    selectUser,
    categorizedUsers,
    isLoadingStaff,
    fetchUsersByRole,
    formatExpertRole,
  }
}
