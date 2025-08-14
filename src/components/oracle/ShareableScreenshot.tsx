import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import * as Haptics from 'expo-haptics';

interface ShareableScreenshotProps {
  children: React.ReactNode;
  farmData: {
    farmerName: string;
    profitPotential: number;
    healthScore: number;
    cropType: string;
    fieldName: string;
  };
}

export const ShareableScreenshot: React.FC<ShareableScreenshotProps> = ({ 
  children, 
  farmData 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const viewRef = useRef<View>(null);

  const captureAndShare = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 0.9,
        result: 'tmpfile',
      });

      const shareOptions = {
        title: 'My Farm Success with CropGenius',
        message: `🌾 Amazing! My ${farmData.cropType} field "${farmData.fieldName}" is thriving with ${farmData.healthScore}% health and ${farmData.profitPotential.toLocaleString()} profit potential! Thanks to CropGenius AI! 🚀`,
        url: uri,
        type: 'image/png',
        subject: 'CropGenius Farm Success',
      };

      const ShareResponse = await Share.open(shareOptions);
      
      if (ShareResponse.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Track share event for analytics
        console.log('Share successful:', {
          platform: ShareResponse.app || 'unknown',
          shared: true,
          farmName: farmData.fieldName,
          profitPotential: farmData.profitPotential,
          healthScore: farmData.healthScore,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        'Share Failed',
        'Unable to share your farm success. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const quickShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const shareMessage = `🌾 My ${farmData.cropType} field is thriving! 💰 ${farmData.profitPotential.toLocaleString()} profit potential with ${farmData.healthScore}% health! 🚀 #CropGenius #FarmingSuccess`;
    
    try {
      await Share.open({
        message: shareMessage,
        title: 'CropGenius Farm Success',
      });
    } catch (error) {
      console.error('Quick share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View ref={viewRef} collapsable={false}>
        {children}
      </View>
      
      <View style={styles.shareButtons}>
        <TouchableOpacity 
          style={[styles.shareButton, styles.primaryShare]} 
          onPress={captureAndShare}
          disabled={isCapturing}
        >
          <Text style={styles.shareButtonText}>
            {isCapturing ? '📸 Capturing...' : '📱 Share Screenshot'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.shareButton, styles.secondaryShare]} 
          onPress={quickShare}
          disabled={isCapturing}
        >
          <Text style={styles.shareButtonText}>
            💬 Quick Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shareButtons: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'column',
    gap: 8,
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryShare: {
    backgroundColor: 'rgba(0, 255, 136, 0.9)',
  },
  secondaryShare: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});