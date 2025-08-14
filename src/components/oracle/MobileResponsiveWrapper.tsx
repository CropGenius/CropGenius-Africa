import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Platform, 
  StatusBar, 
  SafeAreaView,
  useWindowDimensions
} from 'react-native';
import { OracleDashboard } from './OracleDashboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MobileResponsiveWrapperProps {
  farmId: string;
}

export const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({ farmId }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [orientation, setOrientation] = useState(
    width > height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [width, height]);

  const getResponsiveStyles = () => {
    const isTablet = width >= 768;
    const isLargeScreen = width >= 1024;
    
    return {
      container: {
        flex: 1,
        backgroundColor: '#000',
        paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight,
      },
      content: {
        flex: 1,
        paddingHorizontal: isTablet ? 40 : 20,
        paddingBottom: insets.bottom + 20,
      },
      orbSize: isLargeScreen ? 280 : isTablet ? 240 : 220,
      fontSize: {
        title: isLargeScreen ? 28 : isTablet ? 24 : 22,
        subtitle: isLargeScreen ? 16 : isTablet ? 14 : 12,
        body: isLargeScreen ? 18 : isTablet ? 16 : 14,
      },
      spacing: {
        small: isLargeScreen ? 12 : isTablet ? 10 : 8,
        medium: isLargeScreen ? 20 : isTablet ? 16 : 12,
        large: isLargeScreen ? 30 : isTablet ? 24 : 20,
      },
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={responsiveStyles.container}>
      <View style={responsiveStyles.content}>
        <OracleDashboard 
          farmId={farmId} 
          responsiveStyles={responsiveStyles}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
});