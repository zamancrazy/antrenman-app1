import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { NeonCard } from '@/src/components/NeonCard';
import { NeonButton } from '@/src/components/NeonButton';
import { getDatabase } from '@/src/database/db';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercises, setExercises] = useState<any[]>([]);
  const [dayInfo, setDayInfo] = useState<any>(null);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const loadExercises = async () => {
    try {
      const db = getDatabase();
      const planId = parseInt(id || '0');

      // Get day info
      const day: any = await db.getFirstAsync(
        `SELECT wp.*, prog.name_tr as program_name, prog.difficulty
         FROM weekly_plans wp
         JOIN workout_programs prog ON wp.program_id = prog.id
         WHERE wp.id = ?`,
        [planId]
      );
      setDayInfo(day);

      // Get exercises for this day
      const result: any = await db.getAllAsync(
        `SELECT e.*, pe.sets, pe.reps, pe.rest_seconds, pe.order_index, pe.id as plan_exercise_id
         FROM plan_exercises pe
         JOIN exercises e ON pe.exercise_id = e.id
         WHERE pe.plan_id = ?
         ORDER BY pe.order_index`,
        [planId]
      );
      setExercises(result || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [id]);

  const toggleExerciseComplete = (exerciseId: number) => {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const completeWorkout = async () => {
    if (completedExercises.length < exercises.length) {
      Alert.alert(
        'Antrenmanı Bitir',
        `${exercises.length - completedExercises.length} egzersiz daha kaldı. Yine de bitirmek istiyor musunuz?`,
        [
          { text: 'Devam Et', style: 'cancel' },
          { text: 'Bitir', onPress: () => saveWorkoutCompletion() },
        ]
      );
    } else {
      saveWorkoutCompletion();
    }
  };

  const saveWorkoutCompletion = async () => {
    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');

      await db.runAsync(
        'INSERT INTO workout_completions (plan_id, completed_date, duration_minutes) VALUES (?, ?, ?)',
        [parseInt(id || '0'), today, exercises.length * 5]
      );

      Alert.alert(
        '🎉 Tebrikler!',
        'Antrenmanı başarıyla tamamladın!',
        [{ text: 'Harika!', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error completing workout:', error);
      Alert.alert('Hata', 'Antrenman kaydedilirken bir hata oluştu');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return colors.easy;
      case 'medium': return colors.medium;
      case 'hard': return colors.hard;
      default: return colors.neonGreen;
    }
  };

  if (selectedExercise) {
    return (
      <LinearGradient colors={colors.gradient.primary} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.detailContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedExercise(null)}>
              <Ionicons name="chevron-back" size={28} color={colors.neonGreen} />
              <Text style={styles.backText}>Geri Dön</Text>
            </TouchableOpacity>

            {/* Exercise Hero */}
            <NeonCard style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroEmoji}>{selectedExercise.emoji}</Text>
              </View>
              <Text style={styles.heroTitle}>{selectedExercise.name_tr}</Text>
              <Text style={styles.heroMuscle}>{selectedExercise.muscle_group_tr}</Text>
              
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{selectedExercise.sets}</Text>
                  <Text style={styles.heroStatLabel}>Set</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{selectedExercise.reps}</Text>
                  <Text style={styles.heroStatLabel}>Tekrar</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{selectedExercise.rest_seconds}s</Text>
                  <Text style={styles.heroStatLabel}>Dinlenme</Text>
                </View>
              </View>
            </NeonCard>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Açıklama</Text>
              <NeonCard>
                <Text style={styles.descriptionText}>{selectedExercise.description_tr}</Text>
              </NeonCard>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Nasıl Yapılır?</Text>
              <NeonCard>
                <Text style={styles.instructionsText}>{selectedExercise.instructions_tr}</Text>
              </NeonCard>
            </View>

            {/* Safety Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Güvenlik İpuçları</Text>
              <NeonCard>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.neonGreen} />
                  <Text style={styles.tipText}>Egzersiz öncesi mutlaka ısının</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.neonGreen} />
                  <Text style={styles.tipText}>Doğru formu koru, hızdan önce form gelir</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.neonGreen} />
                  <Text style={styles.tipText}>Nefes düzeninize dikkat edin</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.neonGreen} />
                  <Text style={styles.tipText}>Ağrı hissederseniz hemen durun</Text>
                </View>
              </NeonCard>
            </View>

            <NeonButton
              title="✓ Tamamlandı"
              onPress={() => {
                toggleExerciseComplete(selectedExercise.id);
                setSelectedExercise(null);
              }}
              style={styles.completeBtn}
            />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.neonGreen} />
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>

          {dayInfo && (
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{dayInfo.day_name_tr}</Text>
              <Text style={styles.dayProgram}>{dayInfo.program_name}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(dayInfo.difficulty) }]}>
                <Text style={styles.difficultyText}>
                  {dayInfo.difficulty === 'easy' ? 'Kolay' : dayInfo.difficulty === 'medium' ? 'Orta' : 'Zor'}
                </Text>
              </View>
            </View>
          )}

          {/* Progress */}
          <NeonCard style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>İlerleme</Text>
              <Text style={styles.progressCount}>
                {completedExercises.length} / {exercises.length}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(completedExercises.length / Math.max(exercises.length, 1)) * 100}%` },
                ]}
              />
            </View>
          </NeonCard>

          {/* Exercise Cards */}
          <Text style={styles.sectionTitle}>💪 Egzersizler</Text>
          
          {exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            return (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => setSelectedExercise(exercise)}
                activeOpacity={0.8}
                style={styles.exerciseCardWrapper}
              >
                <LinearGradient
                  colors={isCompleted ? ['#003315', '#001a0a'] : ['#1a1a1a', '#0a0a0a']}
                  style={[
                    styles.exerciseCard,
                    { borderColor: isCompleted ? colors.neonGreen : colors.border }
                  ]}
                >
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>

                  <View style={styles.exerciseIconContainer}>
                    <Text style={styles.exerciseEmoji}>{exercise.emoji || '💪'}</Text>
                  </View>

                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name_tr}</Text>
                    <Text style={styles.exerciseMuscle}>{exercise.muscle_group_tr}</Text>
                    <View style={styles.exerciseStats}>
                      <View style={styles.statChip}>
                        <MaterialCommunityIcons name="repeat" size={12} color={colors.neonGreen} />
                        <Text style={styles.statChipText}>{exercise.sets} × {exercise.reps}</Text>
                      </View>
                      <View style={styles.statChip}>
                        <Ionicons name="time-outline" size={12} color={colors.yellow} />
                        <Text style={styles.statChipText}>{exercise.rest_seconds}s dinlenme</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleExerciseComplete(exercise.id);
                    }}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark-circle" size={32} color={colors.neonGreen} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={32} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          {/* Complete Workout Button */}
          {exercises.length > 0 && (
            <NeonButton
              title="🏆 Antrenmanı Bitir"
              onPress={completeWorkout}
              style={styles.finishButton}
            />
          )}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyText}>Bu güne ait egzersiz bulunamadı</Text>
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
  scrollContent: { padding: 16, paddingBottom: 32 },
  detailContent: { padding: 16, paddingBottom: 32 },
  backButton: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
  },
  backText: { fontSize: 16, color: colors.neonGreen, fontWeight: '600', marginLeft: 4 },
  dayHeader: { marginBottom: 24 },
  dayTitle: { fontSize: 32, fontWeight: '700', color: colors.textPrimary },
  dayProgram: { fontSize: 16, color: colors.textSecondary, marginTop: 4, marginBottom: 8 },
  difficultyBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  difficultyText: { fontSize: 12, fontWeight: '700', color: colors.background },
  progressCard: { marginBottom: 24 },
  progressInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  progressLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  progressCount: { fontSize: 24, fontWeight: '700', color: colors.neonGreen },
  progressBar: {
    height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.neonGreen },
  sectionTitle: {
    fontSize: 20, fontWeight: '700', color: colors.textPrimary,
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1,
  },
  exerciseCardWrapper: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  exerciseCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderWidth: 1, borderRadius: 16,
  },
  exerciseNumber: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.neonGreen, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: { fontSize: 14, fontWeight: '700', color: colors.background },
  exerciseIconContainer: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, borderWidth: 1, borderColor: colors.neonGreen,
  },
  exerciseEmoji: { fontSize: 28 },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  exerciseMuscle: { fontSize: 11, color: colors.textTertiary, marginBottom: 6 },
  exerciseStats: { flexDirection: 'row', flexWrap: 'wrap' },
  statChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, marginRight: 6, marginTop: 4,
  },
  statChipText: { fontSize: 10, color: colors.textSecondary, marginLeft: 4, fontWeight: '600' },
  checkButton: { padding: 4 },
  finishButton: { marginTop: 16, marginBottom: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: colors.textTertiary, marginTop: 16 },
  
  // Detail view styles
  heroCard: { alignItems: 'center', marginBottom: 24, paddingVertical: 24 },
  heroIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.neonGreen, marginBottom: 16,
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  heroMuscle: { fontSize: 14, color: colors.neonGreen, marginBottom: 20 },
  heroStats: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    width: '100%', marginTop: 8,
  },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatValue: { fontSize: 24, fontWeight: '700', color: colors.neonGreen },
  heroStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  heroDivider: { width: 1, height: 40, backgroundColor: colors.border },
  section: { marginBottom: 20 },
  descriptionText: { fontSize: 14, color: colors.textPrimary, lineHeight: 22 },
  instructionsText: { fontSize: 14, color: colors.textPrimary, lineHeight: 26 },
  tipRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 6,
  },
  tipText: { fontSize: 13, color: colors.textPrimary, marginLeft: 12, flex: 1 },
  completeBtn: { marginTop: 8 },
});
