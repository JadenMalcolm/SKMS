import { ref } from 'vue'

/**
 * Composable for toggling password visibility in password input fields.
 * Used to show/hide password text in the UI.
 * @returns Object containing the usePasswordVisibility function
 */
export default function usePeakPassword() {
  /**
   * Creates and returns a password visibility toggle state and function.
   * @returns Object with visible state and toggle function
   */
  const usePasswordVisibility = () => {
    const visible = ref(false)
    const toggle = () => {
      visible.value = !visible.value
    }
    return { visible, toggle }
  }

  return {
    usePasswordVisibility,
  }
}
