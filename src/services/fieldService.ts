import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

// Simple field operations - no offline complexity, no ownership verification
export const createField = async (field: any) => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .insert(field)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Field created");
    return { data, error: null };
  } catch (error: any) {
    toast.error("Failed to create field");
    return { data: null, error: error.message };
  }
};

export const getAllFields = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};

export const updateField = async (field: any) => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .update(field)
      .eq('id', field.id)
      .select()
      .single();
      
    if (error) throw error;
    
    toast.success("Field updated");
    return { data, error: null };
  } catch (error: any) {
    toast.error("Failed to update field");
    return { data: null, error: error.message };
  }
};

export const deleteField = async (fieldId: string) => {
  try {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', fieldId);
      
    if (error) throw error;
    
    toast.success("Field deleted");
    return { error: null };
  } catch (error: any) {
    toast.error("Failed to delete field");
    return { error: error.message };
  }
};

export const getFieldById = async (fieldId: string) => {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('id', fieldId)
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};
