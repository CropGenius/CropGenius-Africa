import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface HealthGlowOverlayProps {
  healthScore: number;
  fieldBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const HealthGlowOverlay: React.FC<HealthGlowOverlayProps> = ({ 
  healthScore, 
  fieldBounds 
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000 + (100 - healthScore) * 20,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000 + (100 - healthScore) * 20,
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    opacityAnimation.start();

    return () => {
      pulseAnimation.stop();
      opacityAnimation.stop();
    };
  }, [healthScore]);

  const getGlowColor = () => {
    if (healthScore >= 85) return '#00FF88'; // Healthy green
    if (healthScore >= 70) return '#FFD700'; // Warning yellow
    if (healthScore >= 50) return '#FF8800'; // Caution orange
    return '#FF4444'; // Critical red
  };

  const getGlowIntensity = () => {
    return Math.max(0.3, healthScore / 100);
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: getGlowColor(),
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [getGlowIntensity() * 0.3, getGlowIntensity()],
          }),
          transform: [{ scale: pulseScale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    zIndex: 1,
  },
});