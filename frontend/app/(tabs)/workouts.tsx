import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { NeonCard } from '@/src/components/NeonCard';
import { getDatabase } from '@/src/database/db';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface WorkoutProgram {
  id: number;
  name_tr: string;
  difficulty: string;
  description_tr: string;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<any>({});

  const loadPrograms = async () => {
    try {
      const db = getDatabase();
      const result: any = await db.getAllAsync(
        'SELECT * FROM workout_programs ORDER BY difficulty'
      );
      setPrograms(result);

      // Load weekly plans for each program
      for (const program of result) {
        const plans: any = await db.getAllAsync(
          'SELECT * FROM weekly_plans WHERE program_id = ? AND week_number = 1 ORDER BY day_number',
          [program.id]
        );
        setWeeklyPlans((prev: any) => ({ ...prev, [program.id]: plans }));
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const filteredPrograms =
    selectedDifficulty === 'all'
      ? programs
      : programs.filter((p) => p.difficulty === selectedDifficulty);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return colors.easy;
      case 'medium':
        return colors.medium;
      case 'hard':
        return colors.hard;
      default:
        return colors.neonGreen;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Kolay';
      case 'medium':
        return 'Orta';
      case 'hard':
        return 'Zor';
      default:
        return difficulty;
    }
  };

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Programları</Text>
          <Text style={styles.subtitle}>Sana uygun programı seç ve başla!</Text>
        </View>

        {/* Difficulty Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDifficulty === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty('all')}
          >
            <Text
              style={[
                styles.filterText,
                selectedDifficulty === 'all' && styles.filterTextActive,
              ]}
            >
              Tümü
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDifficulty === 'easy' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty('easy')}
          >
            <Text
              style={[
                styles.filterText,
                selectedDifficulty === 'easy' && styles.filterTextActive,
              ]}
            >
              🟢 Kolay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDifficulty === 'medium' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty('medium')}
          >
            <Text
              style={[
                styles.filterText,
                selectedDifficulty === 'medium' && styles.filterTextActive,
              ]}
            >
              🟡 Orta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedDifficulty === 'hard' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedDifficulty('hard')}
          >
            <Text
              style={[
                styles.filterText,
                selectedDifficulty === 'hard' && styles.filterTextActive,
              ]}
            >
              🔴 Zor
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Programs List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neonGreen}
            />
          }
        >
          {filteredPrograms.map((program) => (
            <NeonCard key={program.id} style={styles.programCard}>
              <TouchableOpacity
                onPress={() =>
                  setExpandedProgram(expandedProgram === program.id ? null : program.id)
                }
              >
                <View style={styles.programHeader}>
                  <View style={styles.programInfo}>
                    <Text style={styles.programName}>{program.name_tr}</Text>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(program.difficulty) },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {getDifficultyLabel(program.difficulty)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={expandedProgram === program.id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.neonGreen}
                  />
                </View>

                <Text style={styles.programDescription}>{program.description_tr}</Text>
              </TouchableOpacity>

              {expandedProgram === program.id && weeklyPlans[program.id] && (
                <View style={styles.weeklyPlan}>
                  <Text style={styles.weeklyPlanTitle}>Haftalık Plan</Text>
                  {weeklyPlans[program.id].map((day: any) => (
                    <View key={day.id} style={styles.dayRow}>
                      <View style={styles.dayInfo}>
                        <Text style={styles.dayName}>{day.day_name_tr}</Text>
                        {day.is_rest_day ? (
                          <Text style={styles.restLabel}>Dinlenme Günü</Text>
                        ) : (
                          <Text style={styles.workoutLabel}>Antrenman Günü</Text>
                        )}
                      </View>
                      {day.is_rest_day ? (
                        <Ionicons name="bed" size={24} color={colors.textSecondary} />
                      ) : (
                        <Ionicons name="fitness" size={24} color={colors.neonGreen} />
                      )}
                    </View>
                  ))}
                </View>
              )}
            </NeonCard>
          ))}

          {filteredPrograms.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Bu seviyede program bulunamadı</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  programCard: {
    marginBottom: 16,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  programDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  weeklyPlan: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weeklyPlanTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neonGreen,
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  restLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  workoutLabel: {
    fontSize: 12,
    color: colors.neonGreen,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textTertiary,
    marginTop: 16,
  },
});