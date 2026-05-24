import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { NeonCard } from '@/src/components/NeonCard';
import { getDatabase } from '@/src/database/db';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    currentStreak: 0,
    totalWater: 0,
    weeklyWorkouts: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  const loadProgress = async () => {
    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');

      // Total workouts
      const totalWorkouts: any = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM workout_completions'
      );

      // Weekly workouts (last 7 days)
      const weeklyWorkouts: any = await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM workout_completions 
         WHERE completed_date >= date('now', '-7 days')`
      );

      // Total water (all time)
      const totalWater: any = await db.getFirstAsync(
        'SELECT SUM(amount_ml) as total FROM water_logs'
      );

      // Calculate streak
      const completions: any = await db.getAllAsync(
        `SELECT completed_date FROM workout_completions 
         ORDER BY completed_date DESC 
         LIMIT 30`
      );

      let currentStreak = 0;
      const dates = completions.map((c: any) => c.completed_date);
      for (let i = 0; i < 30; i++) {
        const checkDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (dates.includes(checkDate)) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }

      setStats({
        totalWorkouts: totalWorkouts?.count || 0,
        currentStreak,
        totalWater: totalWater?.total || 0,
        weeklyWorkouts: weeklyWorkouts?.count || 0,
      });

      // Get last 7 days data
      const weekly = [];
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        const dayName = format(subDays(new Date(), i), 'EEE');

        const workoutDone: any = await db.getFirstAsync(
          'SELECT COUNT(*) as count FROM workout_completions WHERE completed_date = ?',
          [date]
        );

        const waterAmount: any = await db.getFirstAsync(
          'SELECT SUM(amount_ml) as total FROM water_logs WHERE date = ?',
          [date]
        );

        weekly.push({
          date,
          dayName,
          workoutDone: workoutDone?.count > 0,
          waterAmount: waterAmount?.total || 0,
        });
      }

      setWeeklyData(weekly);
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>İlerleme Raporu 📊</Text>
            <Text style={styles.subtitle}>Başarılarını takip et!</Text>
          </View>

          {/* Main Stats */}
          <View style={styles.statsGrid}>
            <NeonCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="barbell" size={32} color={colors.neonGreen} />
              </View>
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Toplam Antrenman</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="flame" size={32} color={colors.yellow} />
              </View>
              <Text style={styles.statValue}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Gün Serisi</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="water" size={32} color={colors.neonGreen} />
              </View>
              <Text style={styles.statValue}>{(stats.totalWater / 1000).toFixed(1)}L</Text>
              <Text style={styles.statLabel}>Toplam Su</Text>
            </NeonCard>

            <NeonCard style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="calendar" size={32} color={colors.yellow} />
              </View>
              <Text style={styles.statValue}>{stats.weeklyWorkouts}</Text>
              <Text style={styles.statLabel}>Bu Hafta</Text>
            </NeonCard>
          </View>

          {/* Weekly Activity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son 7 Gün</Text>
            <NeonCard>
              <View style={styles.weeklyActivity}>
                {weeklyData.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <View
                      style={[
                        styles.dayIndicator,
                        day.workoutDone && styles.dayIndicatorActive,
                      ]}
                    >
                      {day.workoutDone ? (
                        <Ionicons name="checkmark" size={16} color={colors.background} />
                      ) : (
                        <View style={styles.dayIndicatorDot} />
                      )}
                    </View>
                    <Text style={styles.dayLabel}>{day.dayName}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.weeklyNote}>
                ✅ = Antrenman tamamlandı
              </Text>
            </NeonCard>
          </View>

          {/* Weekly Water Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Haftalık Su Tüketimi</Text>
            <NeonCard>
              <View style={styles.waterChart}>
                {weeklyData.map((day, index) => {
                  const maxWater = Math.max(...weeklyData.map((d) => d.waterAmount));
                  const height = maxWater > 0 ? (day.waterAmount / maxWater) * 120 : 0;

                  return (
                    <View key={index} style={styles.waterBar}>
                      <View style={styles.waterBarContainer}>
                        <View
                          style={[
                            styles.waterBarFill,
                            {
                              height: height || 4,
                              backgroundColor:
                                day.waterAmount >= 2000 ? colors.neonGreen : colors.yellow,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.waterAmount}>
                        {(day.waterAmount / 1000).toFixed(1)}
                      </Text>
                      <Text style={styles.waterDay}>{day.dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </NeonCard>
          </View>

          {/* Achievements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Başarılar</Text>
            <NeonCard>
              {stats.totalWorkouts >= 1 && (
                <View style={styles.achievement}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name="star" size={24} color={colors.yellow} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>İlk Adım</Text>
                    <Text style={styles.achievementDesc}>İlk antrenmanını tamamla</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                </View>
              )}

              {stats.currentStreak >= 3 && (
                <View style={styles.achievement}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name="flame" size={24} color={colors.yellow} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>Ateş Böceği</Text>
                    <Text style={styles.achievementDesc}>3 gün üst üste antrenman</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                </View>
              )}

              {stats.currentStreak >= 7 && (
                <View style={styles.achievement}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name="trophy" size={24} color={colors.yellow} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>Bir Hafta Kahramanı</Text>
                    <Text style={styles.achievementDesc}>7 gün üst üste antrenman</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                </View>
              )}

              {stats.totalWater >= 10000 && (
                <View style={styles.achievement}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name="water" size={24} color={colors.neonGreen} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>Su Şampiyonu</Text>
                    <Text style={styles.achievementDesc}>10 litre su iç</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                </View>
              )}

              {stats.totalWorkouts === 0 &&
                stats.currentStreak === 0 &&
                stats.totalWater === 0 && (
                  <View style={styles.noAchievements}>
                    <Ionicons name="medal-outline" size={48} color={colors.textTertiary} />
                    <Text style={styles.noAchievementsText}>
                      Başarı kazanmak için antrenman yapmaya başla!
                    </Text>
                  </View>
                )}
            </NeonCard>
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
  },
  header: {
    marginBottom: 24,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neonGreen,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weeklyActivity: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayIndicatorActive: {
    backgroundColor: colors.neonGreen,
    borderColor: colors.neonGreen,
  },
  dayIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  weeklyNote: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  waterChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingVertical: 16,
  },
  waterBar: {
    alignItems: 'center',
  },
  waterBarContainer: {
    width: 32,
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  waterBarFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  waterAmount: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  waterDay: {
    fontSize: 10,
    color: colors.textTertiary,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noAchievements: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noAchievementsText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 12,
    textAlign: 'center',
  },
});