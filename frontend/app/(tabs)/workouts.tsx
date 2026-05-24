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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface WorkoutProgram {
  id: number;
  name_tr: string;
  difficulty: string;
  description_tr: string;
  icon: string;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProgram, setExpandedProgram] = useState<number | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<any>({});
  const [planExercises, setPlanExercises] = useState<any>({});

  const loadPrograms = async () => {
    try {
      const db = getDatabase();
      const result: any = await db.getAllAsync(
        'SELECT * FROM workout_programs ORDER BY id'
      );
      setPrograms(result || []);

      // Load weekly plans for each program
      const allPlans: any = {};
      for (const program of result || []) {
        const plans: any = await db.getAllAsync(
          'SELECT * FROM weekly_plans WHERE program_id = ? AND week_number = 1 ORDER BY day_number',
          [program.id]
        );
        allPlans[program.id] = plans || [];
      }
      setWeeklyPlans(allPlans);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadDayExercises = async (planId: number) => {
    if (planExercises[planId]) return;
    
    try {
      const db = getDatabase();
      const exercises: any = await db.getAllAsync(
        `SELECT e.*, pe.sets, pe.reps, pe.rest_seconds, pe.order_index
         FROM plan_exercises pe
         JOIN exercises e ON pe.exercise_id = e.id
         WHERE pe.plan_id = ?
         ORDER BY pe.order_index`,
        [planId]
      );
      setPlanExercises((prev: any) => ({ ...prev, [planId]: exercises || [] }));
    } catch (error) {
      console.error('Error loading exercises:', error);
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
      case 'easy': return colors.easy;
      case 'medium': return colors.medium;
      case 'hard': return colors.hard;
      default: return colors.neonGreen;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return difficulty;
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer} contentContainerStyle={styles.filterContent}>
          {[
            { key: 'all', label: 'Tümü', emoji: '🎯' },
            { key: 'easy', label: 'Kolay', emoji: '🟢' },
            { key: 'medium', label: 'Orta', emoji: '🟡' },
            { key: 'hard', label: 'Zor', emoji: '🔴' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedDifficulty === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedDifficulty(filter.key)}
            >
              <Text style={[styles.filterText, selectedDifficulty === filter.key && styles.filterTextActive]}>
                {filter.emoji} {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Programs List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neonGreen} />
          }
        >
          {filteredPrograms.map((program) => (
            <View key={program.id} style={styles.programWrapper}>
              <NeonCard style={styles.programCard}>
                <TouchableOpacity
                  onPress={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.programHeader}>
                    <View style={styles.programIcon}>
                      <Text style={styles.programEmoji}>{program.icon || '💪'}</Text>
                    </View>
                    <View style={styles.programInfo}>
                      <Text style={styles.programName}>{program.name_tr}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(program.difficulty) }]}>
                        <Text style={styles.difficultyText}>{getDifficultyLabel(program.difficulty)}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={expandedProgram === program.id ? 'chevron-up' : 'chevron-down'}
                      size={28}
                      color={colors.neonGreen}
                    />
                  </View>

                  <Text style={styles.programDescription}>{program.description_tr}</Text>
                </TouchableOpacity>

                {expandedProgram === program.id && weeklyPlans[program.id] && (
                  <View style={styles.weeklyPlan}>
                    <Text style={styles.weeklyPlanTitle}>📅 Haftalık Plan</Text>
                    {weeklyPlans[program.id].map((day: any) => (
                      <TouchableOpacity
                        key={day.id}
                        style={styles.dayCard}
                        onPress={() => {
                          if (!day.is_rest_day) {
                            loadDayExercises(day.id);
                            router.push(`/exercise/${day.id}`);
                          }
                        }}
                        disabled={day.is_rest_day === 1}
                      >
                        <View style={styles.dayRow}>
                          <View style={styles.dayLeft}>
                            <View style={[
                              styles.dayIconCircle,
                              { backgroundColor: day.is_rest_day ? colors.surface : colors.neonGreen + '30' }
                            ]}>
                              {day.is_rest_day ? (
                                <Ionicons name="bed" size={20} color={colors.textSecondary} />
                              ) : (
                                <MaterialCommunityIcons name="dumbbell" size={20} color={colors.neonGreen} />
                              )}
                            </View>
                            <View>
                              <Text style={styles.dayName}>{day.day_name_tr}</Text>
                              <Text style={day.is_rest_day ? styles.restLabel : styles.workoutLabel}>
                                {day.is_rest_day ? '😴 Dinlenme Günü' : '💪 Antrenman Günü'}
                              </Text>
                            </View>
                          </View>
                          {!day.is_rest_day && (
                            <Ionicons name="chevron-forward" size={20} color={colors.neonGreen} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </NeonCard>
            </View>
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { padding: 16, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16, maxHeight: 50 },
  filterContent: { paddingRight: 16 },
  filterButton: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
    backgroundColor: colors.surface, marginRight: 12, borderWidth: 1, borderColor: colors.border,
  },
  filterButtonActive: { backgroundColor: colors.neonGreen, borderColor: colors.neonGreen },
  filterText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.background },
  scrollContent: { padding: 16, paddingTop: 0, paddingBottom: 32 },
  programWrapper: { marginBottom: 16 },
  programCard: {},
  programHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
  },
  programIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.neonGreen, marginRight: 12,
  },
  programEmoji: { fontSize: 28 },
  programInfo: { flex: 1 },
  programName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  difficultyText: { fontSize: 11, fontWeight: '700', color: colors.background },
  programDescription: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  weeklyPlan: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  weeklyPlanTitle: { fontSize: 16, fontWeight: '700', color: colors.neonGreen, marginBottom: 12 },
  dayCard: { marginBottom: 8 },
  dayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12, backgroundColor: colors.surfaceLight,
    borderRadius: 12,
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dayIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  dayName: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  restLabel: { fontSize: 12, color: colors.textTertiary },
  workoutLabel: { fontSize: 12, color: colors.neonGreen, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: colors.textTertiary, marginTop: 16 },
});
