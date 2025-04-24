<template>
  <!-- Modal popup container - only visible when showPopup prop is true -->
  <div v-if="showPopup" class="popup-container">
    <div class="popup container">
      <!-- Feedback form header -->
      <div class="section-header"><h2>Give Feedback</h2></div>

      <!-- Feedback type selection (voice or report) -->
      <div class="form-group">
        <label>Feedback Type:</label>
        <div class="radio-group">
          <label><input type="radio" v-model="feedbackType" value="voice" /> Voice</label>
          <label><input type="radio" v-model="feedbackType" value="report" /> Report</label>
        </div>
      </div>

      <!-- Feedback content text area -->
      <div class="form-group">
        <label for="feedbackText">Your Feedback:</label>
        <textarea
          v-model="feedbackText"
          id="feedbackText"
          class="input textarea"
          rows="5"
          placeholder="Please share your thoughts with us..."
        ></textarea>
      </div>

      <!-- Anonymous/identified submission selection -->
      <div class="form-group">
        <label>Submission Type:</label>
        <div class="radio-group">
          <label><input type="radio" v-model="isAnonymous" :value="true" /> Anonymous</label>
          <label><input type="radio" v-model="isAnonymous" :value="false" /> Identified</label>
        </div>
      </div>

      <!-- Form action buttons -->
      <div class="popup-actions">
        <button @click="submitFeedback" class="button button-success">Submit</button>
        <button @click="emit('close')" class="button button-danger">Cancel</button>
      </div>

      <!-- Feedback message display (success/error messages) -->
      <p v-if="feedbackMessage" class="feedback-message">{{ feedbackMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import useFeedback from '../composables/useFeedback'  // Import custom feedback composable

// Component props and emits
const props = defineProps({ showPopup: Boolean })  // Controls visibility of popup
const emit = defineEmits(['close'])  // Event to close the popup

// Use the feedback composable with a callback that closes the popup on successful submission
const { feedbackType, feedbackText, isAnonymous, feedbackMessage, submitFeedback } =
  useFeedback(() => emit('close'))
</script>

<style scoped>
/* Full-screen semi-transparent overlay for modal popup */
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal popup box styling */
.popup {
  width: 500px;
  padding: 25px;
}

/* Form group container styling */
.form-group {
  margin: 1rem 0 1.5rem;
  text-align: left;
}

/* Form label styling */
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #444;
}

/* Radio button group layout */
.radio-group {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

/* Individual radio button label styling */
.radio-group label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* Radio button input spacing */
.radio-group input {
  margin-right: 8px;
}

/* Button container layout */
.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* Feedback message styling for success/error notifications */
.feedback-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  text-align: center;
}
</style>
