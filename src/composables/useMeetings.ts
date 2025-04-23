import { ref } from 'vue'
import type { Ref } from 'vue'
import axios from 'axios'
import type { User } from './useUsers'

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

export interface MeetingRequest {
  id: number
  user_email: string
  user_id: number
  date: string
  time: string
  meeting_type: string
}

export default function useMeetings(currentUser: Ref<User | null>) {
  // State
  const myMeetings = ref<Meeting[]>([])
  const meetingRequests = ref<MeetingRequest[]>([])
  const selectedDate = ref('')
  const selectedTime = ref('')
  const selectedMeetingType = ref('in-person')
  const feedbackMessage = ref('')

  // Fetch user meetings
  const fetchMeetings = async () => {
    if (!currentUser.value) return

    try {
      const endpoint = `http://localhost:5000/meetings/${currentUser.value.id}`
      const response = await axios.get(endpoint)
      myMeetings.value = response.data
    } catch (error) {
      console.error('Error fetching meetings:', error)
      feedbackMessage.value = 'Failed to load meetings. Please try again later.'
    }
  }

  // Fetch meeting requests
  const fetchMeetingRequests = async () => {
    if (!currentUser.value) return

    try {
      const response = await axios.get(
        `http://localhost:5000/meeting-requests/${currentUser.value.id}`,
      )
      meetingRequests.value = response.data
    } catch (error) {
      console.error('Error fetching meeting requests:', error)
    }
  }

  // Schedule a new meeting
  const scheduleMeeting = async (targetUserId: number) => {
    if (!selectedDate.value || !selectedTime.value || !selectedMeetingType.value) {
      feedbackMessage.value = 'Please fill out all fields.'
      return
    }

    try {
      const response = await axios.post('http://localhost:5000/schedule-meeting', {
        user_id: currentUser.value?.id,
        target_user_id: targetUserId,
        date: selectedDate.value,
        time: selectedTime.value,
        meeting_type: selectedMeetingType.value,
      })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to schedule meeting. Please try again.'
    }
  }

  // Accept a meeting request
  const acceptMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post('http://localhost:5000/accept-meeting', {
        meeting_id: meetingId,
      })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to accept meeting. Please try again.'
    }
  }

  // Reject a meeting request
  const rejectMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post('http://localhost:5000/reject-meeting', {
        meeting_id: meetingId,
      })
      feedbackMessage.value = response.data.message
      await fetchMeetingRequests()
      await fetchMeetings()
    } catch (error) {
      feedbackMessage.value = 'Failed to reject meeting. Please try again.'
    }
  }

  // Reschedule a meeting
  const rescheduleMeeting = async (request: MeetingRequest) => {
    try {
      // Delete the original meeting request
      await axios.post('http://localhost:5000/delete-meeting', { meeting_id: request.id })
      feedbackMessage.value = `Please select ${request.user_email} to reschedule the meeting and set a new date and time.`
      await fetchMeetingRequests()
      await fetchMeetings()
      return true // Return success to notify component
    } catch (error) {
      feedbackMessage.value = 'Failed to reschedule meeting. Please try again.'
      return false
    }
  }

  // Delete or cancel a meeting
  const deleteMeeting = async (meetingId: number) => {
    try {
      const response = await axios.post('http://localhost:5000/delete-meeting', {
        meeting_id: meetingId,
      })
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
