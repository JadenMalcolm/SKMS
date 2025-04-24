import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a user in the system
 */
export interface User {
  id: number
  email: string
  role?: string
}

/**
 * Interface for users categorized by role
 */
export interface CategorizedUsers {
  admins: User[]
  experts: User[]
  employees: User[]
}

/**
 * Composable for managing users and user-related functionality.
 * Provides functions for fetching users, searching users, and staff management.
 *
 * @param currentUser - Reference to the current user object
 * @returns User management methods and reactive state variables
 */
export default function useUsers(currentUser: Ref<User | null>) {
  const { getBaseUrl, getSecretKey } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const apiKey = getSecretKey()

  // Create request headers with API key
  const authHeaders = {
    'X-API-Key': apiKey,
  }

  const users = ref<User[]>([])
  const allUsers = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const searchQuery = ref('')
  const newChatSearchQuery = ref('')

  /**
   * Fetches users who have messaged with the current user
   * Used in messaging interfaces to show recent contacts
   */
  const fetchMessagedUsers = async () => {
    if (currentUser.value) {
      try {
        const response = await axios.get(`${apiBaseUrl}/users/${currentUser.value.id}`, {
          headers: authHeaders,
        })
        users.value = response.data
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
  }

  /**
   * Fetches all users in the system
   * Excludes the current user from the returned list
   */
  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/users/all`, { headers: authHeaders })
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

  /**
   * Selects a user for operations that require a target user
   * @param user - User to select or null to clear selection
   */
  const selectUser = (user: User | null) => {
    selectedUser.value = user
  }

  /**
   * Computed property to filter messaged users based on search query
   */
  const filteredUsers = computed(() => {
    return users.value.filter(
      (user) =>
        user.id !== currentUser.value?.id &&
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  /**
   * Computed property to filter all users based on search query
   */
  const filteredAllUsers = computed(() => {
    return allUsers.value.filter(
      (user) =>
        user.id !== currentUser.value?.id &&
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  /**
   * Computed property to filter all users based on new chat search query
   * Used specifically for starting new conversations
   */
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

  /**
   * Fetches users categorized by their roles
   * Used in staff management interfaces
   */
  const fetchUsersByRole = async () => {
    try {
      isLoadingStaff.value = true

      const [adminsResponse, expertsResponse, employeesResponse] = await Promise.all([
        axios.get(`${apiBaseUrl}/users/admins`, { headers: authHeaders }),
        axios.get(`${apiBaseUrl}/users/experts`, { headers: authHeaders }),
        axios.get(`${apiBaseUrl}/users/employees`, { headers: authHeaders }),
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

  /**
   * Formats expert role for display
   * Removes the 'expert-' prefix and capitalizes the domain
   * @param role - Role string to format
   * @returns Formatted role string
   */
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
