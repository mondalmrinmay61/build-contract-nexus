
import { toast } from "@/components/ui/toast";
import { useToast as useToastUI } from "@/components/ui/use-toast";

// Re-export the toast utilities using our custom hook
export const useToast = useToastUI;
export { toast };
