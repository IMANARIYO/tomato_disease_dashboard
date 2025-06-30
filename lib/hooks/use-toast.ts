import { toast } from "react-hot-toast"

export const useToast = () => {
  return {
    toast: (message: string) => toast(message),
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
  }
}
