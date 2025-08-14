import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface GrowthTrailsProps {
  cropStage: 'planting' | 'growing' | 'flowering' | 'fruiting' | 'harvest';
  fieldBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export const GrowthTrails: React.FC<GrowthTrailsProps> = ({ 
  cropStage, 
  fieldBounds 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const progressAnimation = Animated.timing(progressAnim, {
      toValue: getProgressForStage(cropStage),
      duration: 3000,
      useNativeDriver: true,
    });

    const flowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    progressAnimation.start();
    flowAnimation.start();

    return () => {
      progressAnimation.stop();
      flowAnimation.stop();
    };
  }, [cropStage]);

  const getProgressForStage = (stage: string) => {
    switch (stage) {
      case 'planting': return 0.1;
      case 'growing': return 0.4;
      case 'flowering': return 0.7;
      case 'fruiting': return 0.9;
      case 'harvest': return 1.0;
      default: return 0.5;
    }
  };

  const getTrailColor = (stage: string) => {
    switch (stage) {
      case 'planting': return '#8BC34A';
      case 'growing': return '#4CAF50';
      case 'flowering': return '#FF9800';
      case 'fruiting': return '#FF5722';
      case 'harvest': return '#FFC107';
      default: return '#4CAF50';
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const flowOpacity = flowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {/* Growth Progress Bar */}
      <Animated.View 
        style={[
          styles.progressBar,
          {
            width: progressWidth,
            backgroundColor: getTrailColor(cropStage),
          },
        ]}
      />
      
      {/* Flowing Particles */}
      {[...Array(5)].map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: `${index * 20}%`,
              backgroundColor: getTrailColor(cropStage),
              opacity: flowOpacity,
              transform: [
                {
                  translateY: flowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  progressBar: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    height: 4,
    borderRadius: 2,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    bottom: 10,
    zIndex: 2,
  },
});