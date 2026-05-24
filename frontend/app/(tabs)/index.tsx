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
import { NeonButton } from '@/src/components/NeonButton';
import { getDatabase } from '@/src/database/db';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [waterToday, setWaterToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const motivationalQuotes = [
    'Bugün dünden daha güçlüsün! 💪',
    'Her adım bir başarıdır! 🔥',
    'Sınırların sadece hayal gücünde! ⚡',
    'Hedefine odaklan, başarı seninle! 🎯',
    'Vazgeçmek yok, sadece başarmak var! 🏆',
  ];

  const loadData = async () => {
    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');
      const dayOfWeek = new Date().getDay();
      const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;

      // Get today's workout plan
      const workoutPlan: any = await db.getFirstAsync(
        `SELECT wp.*, prog.name_tr as program_name, prog.difficulty 
         FROM weekly_plans wp
         JOIN workout_programs prog ON wp.program_id = prog.id
         WHERE wp.day_number = ? AND wp.is_rest_day = 0
         LIMIT 1`,
        [dayNumber]
      );

      if (workoutPlan) {
        const exercises: any = await db.getAllAsync(
          `SELECT e.name_tr, pe.sets, pe.reps
           FROM plan_exercises pe
           JOIN exercises e ON pe.exercise_id = e.id
           WHERE pe.plan_id = ?
           ORDER BY pe.order_index`,
          [workoutPlan.id]
        );
        setTodayWorkout({ ...workoutPlan, exercises });
      } else {
        setTodayWorkout(null);
      }

      // Get water consumption today
      const waterResult: any = await db.getFirstAsync(
        'SELECT SUM(amount_ml) as total FROM water_logs WHERE date = ?',
        [today]
      );
      setWaterToday(waterResult?.total || 0);

      // Get water goal
      const goalResult: any = await db.getFirstAsync(
        "SELECT setting_value FROM user_settings WHERE setting_key = 'daily_water_goal'"
      );
      setWaterGoal(parseInt(goalResult?.setting_value || '2000'));

      // Calculate streak
      const completions: any = await db.getAllAsync(
        `SELECT completed_date FROM workout_completions 
         ORDER BY completed_date DESC N         LIMIT 30`
      );
      
      let currentStreak = 0;
      const dates = completions.map((c: any) => c.completed_date);
      for (let i = 0; i < 30; i++) {
        const checkDate = format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        if (dates.includes(checkDate)) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const waterPercentage = Math.min((waterToday / waterGoal) * 100, 100);

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hoş Geldin! 👋</Text>
              <Text style={styles.date}>{format(new Date(), 'dd MMMM yyyy, EEEE')}</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={24} color={colors.yellow} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          </View>

          {/* Motivational Quote */}
          <NeonCard style={styles.quoteCard}>
            <View style={styles.quoteContent}>
              <Ionicons name="sparkles" size={32} color={colors.neonGreen} />
              <Text style={styles.quoteText}>{randomQuote}</Text>
            </View>
          </NeonCard>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <NeonCard style={styles.statCard}>
              <Ionicons name="water" size={32} color={colors.neonGreen} />
              <Text style={styles.statValue}>{Math.round(waterPercentage)}%</Text>
              <Text style={styles.statLabel}>Su Hedefi</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <Ionicons name="barbell" size={32} color={colors.yellow} />
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Gün Serisi</Text>
            </NeonCard>
          </View>

          {/* Today's Workout */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünün Antrenmanı</Text>
            {todayWorkout ? (
              <NeonCard>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutTitle}>{todayWorkout.program_name}</Text>
                    <Text style={styles.workoutDay}>{todayWorkout.day_name_tr}</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      {
                        backgroundColor:
                          todayWorkout.difficulty === 'easy'
                            ? colors.easy
                            : todayWorkout.difficulty === 'medium'
                            ? colors.medium
                            : colors.hard,
                      },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {todayWorkout.difficulty === 'easy'
                        ? 'Kolay'
                        : todayWorkout.difficulty === 'medium'
                        ? 'Orta'
                        : 'Zor'}
                    </Text>
                  </View>
                </View>

                <View style={styles.exerciseList}>
                  {todayWorkout.exercises?.map((ex: any, index: number) => (
                    <View key={index} style={styles.exerciseItem}>
                      <Ionicons name="fitness" size={20} color={colors.neonGreen} />
                      <Text style={styles.exerciseName}>{ex.name_tr}</Text>
                      <Text style={styles.exerciseReps}>
                        {ex.sets} × {ex.reps}
                      </Text>
                    </View>
                  ))}
                </View>

                <NeonButton
                  title="Antrenmanı Başlat"
                  onPress={() => router.push('/workouts')}
                  style={styles.startButton}
                />
              </NeonCard>
            ) : (
              <NeonCard>
                <View style={styles.restDay}>
                  <Ionicons name="bed" size={48} color={colors.textSecondary} />
                  <Text style={styles.restDayText}>Bugün Dinlenme Günü</Text>
                  <Text style={styles.restDaySubtext}>
                    Vücudunun toparlanması için dinlen! 😌
                  </Text>
                </View>
              </NeonCard>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => router.push('/water')}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="water" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickActionText}>Su Ekle</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => router.push('/workouts')}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="barbell" size={32} color={colors.yellow} />
                  <Text style={styles.quickActionText}>Antrenmanlar</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => router.push('/progress')}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickActionGradient}
                >
                  <Ionicons name="stats-chart" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickActionText}>İlerleme</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.yellow,
  },
  streakText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.yellow,
    marginLeft: 8,
  },
  quoteCard: {
    marginBottom: 24,
  },
  quoteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neonGreen,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  workoutDay: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 12,
  },
  exerciseReps: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  startButton: {
    marginTop: 8,
  },
  restDay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  restDayText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  restDaySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neonGreen,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});