import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCropRecords,
  createCropRecord,
  deleteCropRecord,
  type CreateCropRecordData,
} from "@/services/cropService";

// Fetch list of crops (optionally by fieldId)
export function useCrops(fieldId?: string) {
  return useQuery({
    queryKey: ["crops", fieldId ?? "all"],
    queryFn: () => getCropRecords(fieldId),
  });
}

// Create a crop record
export function useCreateCrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCropRecordData) => createCropRecord(data),
    onSuccess: (_created, variables) => {
      // Invalidate relevant crop lists
      qc.invalidateQueries({ queryKey: ["crops", variables.field_id ?? "all"] });
      qc.invalidateQueries({ queryKey: ["crops", "all"] });
    },
  });
}

// Delete a crop record
export function useDeleteCrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCropRecord(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crops"] });
    },
  });
}
