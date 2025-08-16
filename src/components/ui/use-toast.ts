import { toast as sonnerToast } from "sonner";

// Re-export sonner toast for compatibility with existing imports
export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};

export { sonnerToast as toast };