import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import { Svg, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface FarmFutureOrbProps {
  profitPotential: number;
  healthScore: number;
  onOptimize: () => void;
}

export const FarmFutureOrb: React.FC<FarmFutureOrbProps> = ({ 
  profitPotential, 
  healthScore, 
  onOptimize 
}) => {
  const [isPulsing, setIsPulsing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const getOrbColor = () => {
    if (healthScore >= 90) return ['#00FF88', '#00CC66'];
    if (healthScore >= 75) return ['#FFD700', '#FFA500'];
    if (healthScore >= 60) return ['#FF6B35', '#FF4500'];
    return ['#FF4444', '#CC0000'];
  };

  const getOrbIntensity = () => {
    if (profitPotential > 10000) return 'maximum';
    if (profitPotential > 5000) return 'high';
    if (profitPotential > 1000) return 'medium';
    return 'low';
  };

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    rotateAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.orbContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Background Glow */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowAnim,
              backgroundColor: getOrbColor()[0],
            },
          ]}
        />

        {/* Orb Background */}
        <LinearGradient
          colors={getOrbColor()}
          style={styles.orbBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Inner Energy Rings */}
          <Animated.View
            style={[
              styles.innerRing,
              {
                transform: [{ rotate: rotateInterpolate }],
              },
            ]}
          >
            <Svg width="200" height="200" viewBox="0 0 200 200">
              <Circle
                cx="100"
                cy="100"
                r="90"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                fill="none"
              />
              <Circle
                cx="100"
                cy="100"
                r="70"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1"
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Floating Elements */}
          <View style={styles.floatingElements}>
            <Animated.View style={[styles.element, { top: 20, left: 40 }]} >
              <Text style={styles.elementText}>🌱</Text>
            </Animated.View>
            <Animated.View style={[styles.element, { top: 60, right: 30 }]} >
              <Text style={styles.elementText}>💰</Text>
            </Animated.View>
            <Animated.View style={[styles.element, { bottom: 40, left: 50 }]} >
              <Text style={styles.elementText}>📈</Text>
            </Animated.View>
          </View>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <Text style={styles.profitLabel}>Profit Potential</Text>
            <Text style={styles.profitAmount}>{formatCurrency(profitPotential)}</Text>
            <Text style={styles.healthIndicator}>Health: {healthScore}%</Text>
            <Text style={styles.intensityLabel}>{getOrbIntensity()} potential</Text>
          </View>

          {/* Optimize Button */}
          <TouchableOpacity style={styles.optimizeButton} onPress={onOptimize}>
            <BlurView intensity={20} tint="light" style={styles.optimizeButtonContent}>
              <Text style={styles.optimizeButtonText}>⚡ Optimize Now</Text>
            </BlurView>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  orbContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 130,
    opacity: 0.3,
  },
  orbBackground: {
    flex: 1,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  innerRing: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  element: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementText: {
    fontSize: 16,
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  profitLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '300',
    marginBottom: 5,
  },
  profitAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  healthIndicator: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 3,
  },
  intensityLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  optimizeButton: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  optimizeButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});