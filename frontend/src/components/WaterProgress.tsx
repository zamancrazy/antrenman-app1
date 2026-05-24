import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors } from '@/src/theme/colors';

interface WaterProgressProps {
  current: number;
  goal: number;
  size?: number;
}

export const WaterProgress: React.FC<WaterProgressProps> = ({ current, goal, size = 150 }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  
  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={size}
        width={12}
        fill={percentage}
        tintColor={colors.neonGreen}
        backgroundColor={colors.surface}
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.innerContent}>
            <Text style={styles.currentText}>{current}</Text>
            <Text style={styles.unitText}>ml</Text>
            <Text style={styles.goalText}>/ {goal} ml</Text>
            <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neonGreen,
  },
  unitText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -4,
  },
  goalText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  percentageText: {
    fontSize: 14,
    color: colors.yellow,
    fontWeight: '600',
    marginTop: 4,
  },
});