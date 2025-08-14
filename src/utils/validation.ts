/**
 * 🛡️ MINIMAL INPUT VALIDATION - ZERO BLOAT
 */

export const validateCropType = (cropType: string): string => {
  return cropType.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').substring(0, 50);
};

export const validateImageFile = (file: File): boolean => {
  return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024;
};

export const sanitizeText = (text: string): string => {
  return text.trim().replace(/[<>]/g, '').substring(0, 1000);
};