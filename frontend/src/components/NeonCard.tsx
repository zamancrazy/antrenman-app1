import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';

interface NeonCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({ children, style, glowColor = colors.neonGreen }) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={colors.gradient.card}
        style={styles.gradient}
      >
        <View style={[styles.border, { shadowColor: glowColor }]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    padding: 2,
  },
  border: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
});