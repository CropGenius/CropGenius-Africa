/**
 * 📳 HAPTIC FEEDBACK - Production Ready
 * Tactile feedback for mobile interactions
 */

export const useHapticFeedback = () => {
  const triggerLight = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const triggerMedium = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const triggerHeavy = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  const triggerSuccess = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  const triggerError = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 100, 100]);
    }
  };

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError
  };
};