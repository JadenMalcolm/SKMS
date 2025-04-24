import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'
import useApiUrl from './useApiUrl'

/**
 * Interface representing a meeting between users
 */
export interface Meeting {
  id?: number
  user_id: number
  target_user_id: number
  date: string
  time: string
  meeting_type: string
  status: string
  user_email?: string
  target_user_email?: string
  category?: string
}

/**
 * Interface representing a meeting request
 */
export interface MeetingRequest {
  id: number
  user_email: string
  user_id: number
  date: string
  time: string
  meeting_type: string
}

/**
 * Composable for managing meetings between users.
 * Provides functionality to schedule, accept, reject, and manage meetings.
 *
 * @param currentUser - Reference to the current user object
 * @returns Meeting management methods and reactive state variables
 */
export default function useMeetings(currentUser: Ref<User | null>) {
  const { getBaseUrl, getSecretKey } = useApiUrl()
  const apiBaseUrl = getBaseUrl()
  const apiKey = getSecretKey()

  // Create request headers with API key
  const authHeaders = {
    'X-API-Key': apiKey
  }

  // State
  const myMeetings = ref<Meeting[]>([])
  const meetingRequests = ref<MeetingRequest[]>([])
  const selectedDate = ref('')
  const selectedTime = ref('')
  const selectedMeetingType = ref('in-person')
  const feedbackMessage = ref('')

  /**
   * Fetches all meetings for the current user
   */
  const fetchMeetings = async () => {
    if (!currentUser.value) return

    try {
      const endpoint = `${apiBaseUrl}/meetings/${currentUser.value.id}`
      const response = await axios.get(endpoint, { headers: authHeaders })
      myMeetings.value = response.data
    } catch (error) {
      console.error('Error fetching meetings:', error)
      feedbackMessage.value = 'Failed to load meetings. Please try again later.'
    }
  }

  /**
   * Fetches all meeting requests for the current user
   */
  const fetchMeetingRequests = async () => {
    if (!currentUser.value) return

    try {
      const response = await axios.get(`${apiBaseUrl}/meeting-requests/${currentUser.value.id}`, { headers: authHeaders })
      meetingRequests.value = response.data
    } catch (error) {
      console.error('Error fetching meeting requests:', error)
    }
  }

  /**
   * Schedules a new meeting with another user
   * @param targetUserId - ID of the user to schedule meeting with
   */
  const scheduleMeeting = async (targetUserId: number) => {
    if (!selectedDate.value || !selectedTime.value || !selectedMeetingType.value) {
      feedbackMessage.value = 'Please fill out all fields.'
      return
    }

    try {
      const response = await axios.post(`${apiBaseUrl}/schedule-meeting`, {
        user_id: currentUser.value?.id,
        target_user_id: targetUserId,
        date: selectedDate.value,
        time: selectedTime.value,
        meeting_type: selectedMeetingType.value,
      }, { headers: authHeaders })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to schedule meeting. Please try again.'
    }
  }

  /**
   * Accepts a meeting request
   * @param meetingId - ID of the meeting to accept
   */
  const acceptMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/accept-meeting`, {
        meeting_id: meetingId,
      }, { headers: authHeaders })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to accept meeting. Please try again.'
    }
  }

  /**
   * Rejects a meeting request
   * @param meetingId - ID of the meeting to reject
   */
  const rejectMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/reject-meeting`, {
        meeting_id: meetingId,
      }, { headers: authHeaders })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to reject meeting. Please try again.'
    }
  }

  /**
   * Initiates the rescheduling process for a meeting
   * @param request - Meeting request to reschedule
   * @returns Boolean indicating success or failure
   */
  const rescheduleMeeting = async (request: MeetingRequest) => {
    try {
      // Delete the original meeting request
      await axios.post(`${apiBaseUrl}/delete-meeting`, { meeting_id: request.id }, { headers: authHeaders })
      feedbackMessage.value = `Please select ${request.user_email} to reschedule the meeting and set a new date and time.`
      await fetchMeetingRequests()
      await fetchMeetings()
      return true // Return success to notify component
    } catch (error) {
      feedbackMessage.value = 'Failed to reschedule meeting. Please try again.'
      return false
    }
  }

  /**
   * Deletes or cancels a meeting
   * @param meetingId - ID of the meeting to delete
   */
  const deleteMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/delete-meeting`, {
        meeting_id: meetingId,
      }, { headers: authHeaders })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to process meeting action. Please try again.'
    }
  }

  return {
    myMeetings,
    meetingRequests,
    selectedDate,
    selectedTime,
    selectedMeetingType,
    feedbackMessage,
    fetchMeetings,
    fetchMeetingRequests,
    scheduleMeeting,
    acceptMeeting,
    rejectMeeting,
    rescheduleMeeting,
    deleteMeeting,
  }
}
