import { ref } from 'vue'

export default function usePeakPassword() {
  // Creates a password visibility ref and toggle function
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
