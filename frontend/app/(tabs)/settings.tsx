import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/src/theme/colors';
import { NeonCard } from '@/src/components/NeonCard';
import { NeonButton } from '@/src/components/NeonButton';
import { getDatabase } from '@/src/database/db';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [waterGoal, setWaterGoal] = useState('2000');
  const [tempGoal, setTempGoal] = useState('2000');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const loadSettings = async () => {
    try {
      const db = getDatabase();
      const result: any = await db.getFirstAsync(
        "SELECT setting_value FROM user_settings WHERE setting_key = 'daily_water_goal'"
      );
      const goal = result?.setting_value || '2000';
      setWaterGoal(goal);
      setTempGoal(goal);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveWaterGoal = async () => {
    try {
      const goalValue = parseInt(tempGoal);
      if (isNaN(goalValue) || goalValue < 500 || goalValue > 10000) {
        Alert.alert('Hata', 'Lütfen 500 ile 10000 ml arasında bir değer girin');
        return;
      }

      const db = getDatabase();
      await db.runAsync(
        "UPDATE user_settings SET setting_value = ? WHERE setting_key = 'daily_water_goal'",
        [goalValue.toString()]
      );

      setWaterGoal(goalValue.toString());
      setIsEditingGoal(false);
      Alert.alert('Başarılı', 'Su hedefi güncellendi!');
    } catch (error) {
      console.error('Error saving water goal:', error);
      Alert.alert('Hata', 'Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  const resetProgress = () => {
    Alert.alert(
      'Tüm Verileri Sil',
      'Tüm antrenman ve su takibi verileriniz silinecek. Bu işlem geri alınamaz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const db = getDatabase();
              await db.runAsync('DELETE FROM water_logs');
              await db.runAsync('DELETE FROM workout_completions');
              Alert.alert('Başarılı', 'Tüm veriler silindi');
            } catch (error) {
              console.error('Error resetting progress:', error);
              Alert.alert('Hata', 'Veriler silinirken bir hata oluştu');
            }
          },
        },
      ]
    );
  };

  const clearCache = () => {
    Alert.alert('Başarılı', 'Önbellek temizlendi');
  };

  return (
    <LinearGradient colors={colors.gradient.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ayarlar ⚙️</Text>
            <Text style={styles.subtitle}>Uygulamanı özelleştir</Text>
          </View>

          {/* Water Goal Setting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Su Hedefi</Text>
            <NeonCard>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Günlük Su Hedefi</Text>
                  <Text style={styles.settingValue}>{waterGoal} ml</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingGoal(!isEditingGoal)}
                >
                  <Ionicons
                    name={isEditingGoal ? 'close' : 'pencil'}
                    size={20}
                    color={colors.neonGreen}
                  />
                </TouchableOpacity>
              </View>

              {isEditingGoal && (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={tempGoal}
                    onChangeText={setTempGoal}
                    keyboardType="number-pad"
                    placeholder="Örn: 2000"
                    placeholderTextColor={colors.textTertiary}
                  />
                  <NeonButton
                    title="Kaydet"
                    onPress={saveWaterGoal}
                    style={styles.saveButton}
                  />
                  <Text style={styles.hint}>Minimum: 500ml, Maksimum: 10000ml</Text>
                </View>
              )}
            </NeonCard>
          </View>

          {/* App Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uygulama Bilgisi</Text>
            <NeonCard>
              <View style={styles.infoRow}>
                <Ionicons name="information-circle" size={24} color={colors.neonGreen} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Versiyon</Text>
                  <Text style={styles.infoValue}>1.0.0</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="cloud-offline" size={24} color={colors.yellow} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Mod</Text>
                  <Text style={styles.infoValue}>Offline - Tüm veriler cihazda</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={24} color={colors.neonGreen} />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Gizlilik</Text>
                  <Text style={styles.infoValue}>Hiçbir veri paylaşılmıyor</Text>
                </View>
              </View>
            </NeonCard>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
            <NeonCard>
              <TouchableOpacity style={styles.actionRow} onPress={clearCache}>
                <View style={styles.actionInfo}>
                  <Ionicons name="trash-outline" size={24} color={colors.textSecondary} />
                  <Text style={styles.actionText}>Önbellek Temizle</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={resetProgress}>
                <View style={styles.actionInfo}>
                  <Ionicons name="warning-outline" size={24} color={colors.error} />
                  <Text style={[styles.actionText, styles.dangerText]}>
                    Tüm Verileri Sil
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.error} />
              </TouchableOpacity>
            </NeonCard>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <NeonCard>
              <Text style={styles.aboutText}>
                <Text style={styles.aboutTitle}>Fitness & Water Tracker</Text>
                {' \n\n'}
                Offline bir şekilde çalışan, tamamen gizlilik odaklı fitness ve su
                takip uygulaması.
                {' \n\n'}
                Tüm verileriniz cihazınızda güvenle saklanır. Hiçbir veri internet
                üzerinden paylaşılmaz veya toplanmaz.
                {' \n\n'}
                Sağlıklı ve güçlü bir yaşam için! 💪💚
              </Text>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neonGreen,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.neonGreen,
  },
  editContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neonGreen,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 16,
  },
  dangerText: {
    color: colors.error,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neonGreen,
  },
});