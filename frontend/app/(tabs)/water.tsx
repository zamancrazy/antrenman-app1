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
import { WaterProgress } from '@/src/components/WaterProgress';
import { getDatabase } from '@/src/database/db';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function WaterScreen() {
  const [waterToday, setWaterToday] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [history, setHistory] = useState<any[]>([]);

  const loadWaterData = async () => {
    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get today's water total
      const result: any = await db.getFirstAsync(
        'SELECT SUM(amount_ml) as total FROM water_logs WHERE date = ?',
        [today]
      );
      setWaterToday(result?.total || 0);

      // Get water goal
      const goalResult: any = await db.getFirstAsync(
        "SELECT setting_value FROM user_settings WHERE setting_key = 'daily_water_goal'"
      );
      setWaterGoal(parseInt(goalResult?.setting_value || '2000'));

      // Get last 7 days history
      const historyResult: any = await db.getAllAsync(
        `SELECT date, SUM(amount_ml) as total 
         FROM water_logs 
         WHERE date >= date('now', '-7 days')
         GROUP BY date 
         ORDER BY date DESC 
         LIMIT 7`
      );
      setHistory(historyResult);
    } catch (error) {
      console.error('Error loading water data:', error);
    }
  };

  useEffect(() => {
    loadWaterData();
  }, []);

  const addWater = async (amount: number) => {
    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');
      const timestamp = new Date().toISOString();

      await db.runAsync(
        'INSERT INTO water_logs (date, amount_ml, timestamp) VALUES (?, ?, ?)',
        [today, amount, timestamp]
      );

      await loadWaterData();
    } catch (error) {
      console.error('Error adding water:', error);
      Alert.alert('Hata', 'Su eklenirken bir hata oluştu');
    }
  };

  const removeWater = async () => {
    if (waterToday <= 0) return;

    try {
      const db = getDatabase();
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get the last water log entry
      const lastLog: any = await db.getFirstAsync(
        'SELECT * FROM water_logs WHERE date = ? ORDER BY timestamp DESC LIMIT 1',
        [today]
      );

      if (lastLog) {
        await db.runAsync('DELETE FROM water_logs WHERE id = ?', [lastLog.id]);
        await loadWaterData();
      }
    } catch (error) {
      console.error('Error removing water:', error);
      Alert.alert('Hata', 'Su çıkarılırken bir hata oluştu');
    }
  };

  const percentage = Math.min((waterToday / waterGoal) * 100, 100);

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Su Takibi 💧</Text>
            <Text style={styles.subtitle}>Günlük hedefine ulaşmak için su iç!</Text>
          </View>

          {/* Water Progress Circle */}
          <NeonCard style={styles.progressCard}>
            <WaterProgress current={waterToday} goal={waterGoal} size={200} />
            
            {percentage >= 100 && (
              <View style={styles.congratsContainer}>
                <Ionicons name="trophy" size={32} color={colors.yellow} />
                <Text style={styles.congratsText}>Tebrikler! Hedefine ulaştın! 🎉</Text>
              </View>
            )}
          </NeonCard>

          {/* Quick Add Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
            <View style={styles.quickAddGrid}>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addWater(250)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickAddGradient}
                >
                  <Ionicons name="water" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickAddAmount}>250ml</Text>
                  <Text style={styles.quickAddLabel}>Bardak</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addWater(500)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickAddGradient}
                >
                  <Ionicons name="water" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickAddAmount}>500ml</Text>
                  <Text style={styles.quickAddLabel}>Şişe</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addWater(750)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickAddGradient}
                >
                  <Ionicons name="water" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickAddAmount}>750ml</Text>
                  <Text style={styles.quickAddLabel}>Büyük Şişe</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addWater(1000)}
              >
                <LinearGradient
                  colors={['#1a1a1a', '#0a0a0a']}
                  style={styles.quickAddGradient}
                >
                  <Ionicons name="water" size={32} color={colors.neonGreen} />
                  <Text style={styles.quickAddAmount}>1000ml</Text>
                  <Text style={styles.quickAddLabel}>1 Litre</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <NeonButton
              title="Son Eklemeyi Geri Al"
              onPress={removeWater}
              variant="outline"
              style={styles.undoButton}
              disabled={waterToday <= 0}
            />
          </View>

          {/* History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son 7 Gün</Text>
            <NeonCard>
              {history.length > 0 ? (
                history.map((day, index) => {
                  const dayPercentage = Math.min((day.total / waterGoal) * 100, 100);
                  return (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyDate}>
                          {format(new Date(day.date), 'dd MMM yyyy')}
                        </Text>
                        <Text style={styles.historyAmount}>{day.total} ml</Text>
                      </View>
                      <View style={styles.historyBar}>
                        <View
                          style={[
                            styles.historyBarFill,
                            { width: `${dayPercentage}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.historyPercentage}>{Math.round(dayPercentage)}%</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyHistory}>
                  <Ionicons name="water-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyText}>Henüz veri yok</Text>
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
  progressCard: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 32,
  },
  congratsContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.yellow,
    marginTop: 8,
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
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAddButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neonGreen,
  },
  quickAddGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickAddAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neonGreen,
    marginTop: 8,
  },
  quickAddLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  undoButton: {
    marginTop: 8,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  historyAmount: {
    fontSize: 14,
    color: colors.neonGreen,
    fontWeight: '700',
  },
  historyBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  historyBarFill: {
    height: '100%',
    backgroundColor: colors.neonGreen,
  },
  historyPercentage: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: 12,
  },
});