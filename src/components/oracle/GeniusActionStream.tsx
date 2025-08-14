import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Vibration
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface Action {
  id: string;
  type: 'proactive' | 'reactive' | 'market' | 'weather' | 'profit';
  title: string;
  description: string;
  impact: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timeRemaining?: string;
  emoji: string;
  actionText: string;
  estimatedProfit: number;
}

interface GeniusActionStreamProps {
  farmId: string;
  onActionSelect: (action: Action) => void;
}

export const GeniusActionStream: React.FC<GeniusActionStreamProps> = ({ 
  farmId, 
  onActionSelect 
}) => {
  const [actions, setActions] = useState<Action[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate AI-generated actions
    const mockActions: Action[] = [
      {
        id: '1',
        type: 'proactive',
        title: 'Optimal Planting Window',
        description: 'Maize in Field 2. AI projects +$500 profit if planted today.',
        impact: 500,
        urgency: 'high',
        timeRemaining: '12 hours',
        emoji: '🌱',
        actionText: 'Start Planting',
        estimatedProfit: 500,
      },
      {
        id: '2',
        type: 'reactive',
        title: 'Disease Alert',
        description: 'Early Blight detected in Field 1. Immediate action required.',
        impact: 300,
        urgency: 'critical',
        timeRemaining: '6 hours',
        emoji: '⚠️',
        actionText: 'Treat Disease',
        estimatedProfit: 300,
      },
      {
        id: '3',
        type: 'market',
        title: 'Sell Opportunity',
        description: 'Maize at peak price in local market. Sell 70% for +$1,200.',
        impact: 1200,
        urgency: 'medium',
        timeRemaining: '2 days',
        emoji: '📈',
        actionText: 'List for Sale',
        estimatedProfit: 1200,
      },
      {
        id: '4',
        type: 'weather',
        title: 'Rain Forecast',
        description: 'Heavy rain expected tomorrow. Ideal for natural irrigation.',
        impact: 200,
        urgency: 'low',
        timeRemaining: '24 hours',
        emoji: '🌧️',
        actionText: 'Prepare Fields',
        estimatedProfit: 200,
      },
      {
        id: '5',
        type: 'profit',
        title: 'Yield Optimization',
        description: 'AI recommends nitrogen boost for +15% yield increase.',
        impact: 800,
        urgency: 'medium',
        timeRemaining: '3 days',
        emoji: '💰',
        actionText: 'Apply Fertilizer',
        estimatedProfit: 800,
      },
    ];

    setActions(mockActions);

    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [farmId]);

  const getActionColor = (type: Action['type']) => {
    switch (type) {
      case 'proactive': return ['#00FF88', '#00CC66'];
      case 'reactive': return ['#FF4444', '#CC0000'];
      case 'market': return ['#FFD700', '#FFA500'];
      case 'weather': return ['#4A90E2', '#357ABD'];
      case 'profit': return ['#9B59B6', '#8E44AD'];
      default: return ['#FFFFFF', '#CCCCCC'];
    }
  };

  const getUrgencyColor = (urgency: Action['urgency']) => {
    switch (urgency) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFD700';
      case 'low': return '#00FF88';
      default: return '#CCCCCC';
    }
  };

  const handleActionPress = (action: Action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Vibration.vibrate(50);
    setSelectedAction(action.id);
    setTimeout(() => {
      onActionSelect(action);
      setSelectedAction(null);
    }, 300);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Genius Actions</Text>
        <Text style={styles.subtitle}>AI-powered insights for maximum profit</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {actions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={[
              styles.actionContainer,
              {
                opacity: fadeInAnim,
                transform: [
                  {
                    translateY: fadeInAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionCard,
                selectedAction === action.id && styles.selectedAction,
              ]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} tint="dark" style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.emoji}>{action.emoji}</Text>
                  <View style={styles.titleContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(action.urgency) }]}>
                      <Text style={styles.urgencyText}>{action.urgency.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.description}>{action.description}</Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detail}>
                    <Text style={styles.detailLabel}>Est. Profit</Text>
                    <Text style={styles.detailValue}>{formatCurrency(action.estimatedProfit)}</Text>
                  </View>
                  
                  {action.timeRemaining && (
                    <View style={styles.detail}>
                      <Text style={styles.detailLabel}>Time Left</Text>
                      <Text style={styles.detailValue}>{action.timeRemaining}</Text>
                    </View>
                  )}
                </View>

                <LinearGradient
                  colors={getActionColor(action.type)}
                  style={styles.actionButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionButtonText}>{action.actionText}</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Ask CropGenius Button */}
      <TouchableOpacity style={styles.askButton}>
        <BlurView intensity={60} tint="dark" style={styles.askButtonContent}>
          <Text style={styles.askButtonText}>💬 Ask CropGenius Anything</Text>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  actionContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  actionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedAction: {
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 15,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButton: {
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  askButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  askButtonContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  askButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});