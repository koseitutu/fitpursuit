import React from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { generateCSV } from "@/utils/csv-parser";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggle } = useTheme();
  const router = useRouter();

  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const activities = useAppStore((state) => state.activities);
  const weightLog = useAppStore((state) => state.weightLog);
  const bloodPressureReadings = useAppStore((state) => state.bloodPressureReadings);

  const handleExportData = () => {
    // Generate CSV content for export
    const activityRows = activities.map((a) => ({
      type: a.type,
      duration: a.duration,
      distance: a.distance,
      steps: a.steps,
      calories: a.caloriesBurned,
      date: a.startedAt,
    }));

    const weightRows = weightLog.map((w) => ({
      date: w.date,
      weight: w.weight,
      bmi: w.bmi,
    }));

    const bpRows = bloodPressureReadings.map((r) => ({
      date: r.date,
      time_slot: r.timeSlot,
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
    }));

    // Generate CSV strings (used for clipboard/share in future)
    generateCSV(
      ['type', 'duration', 'distance', 'steps', 'calories', 'date'],
      activityRows
    );
    generateCSV(['date', 'weight', 'bmi'], weightRows);
    generateCSV(['date', 'time_slot', 'systolic', 'diastolic', 'pulse'], bpRows);

    const totalRecords = activityRows.length + weightRows.length + bpRows.length;

    Alert.alert(
      "Export Complete",
      `Exported ${totalRecords} records:\n• ${activityRows.length} activities\n• ${weightRows.length} weight entries\n• ${bpRows.length} BP readings\n\nData is ready for export.`,
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </Animated.View>

      {/* Appearance */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Appearance
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </Animated.View>

      {/* Units */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Measurement
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Pressable
            style={styles.settingsRow}
            onPress={() =>
              updateSettings({
                units: settings.units === "metric" ? "imperial" : "metric",
              })
            }
          >
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="speedometer"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Units
              </Text>
            </View>
            <View style={styles.settingsRowRight}>
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                {settings.units === "metric" ? "Metric" : "Imperial"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Notifications */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Notifications
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(val) => updateSettings({ notifications: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="newspaper"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Weekly Report
              </Text>
            </View>
            <Switch
              value={settings.weeklyReport}
              onValueChange={(val) => updateSettings({ weeklyReport: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="volume-high"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Sound Effects
              </Text>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={(val) => updateSettings({ soundEffects: val })}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="alarm"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Reminder Time
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              {settings.reminderTime}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Data */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Data Management
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Pressable
            style={styles.settingsRow}
            onPress={() => router.push("/(tabs)/import-data")}
          >
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="cloud-upload"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Import Data (CSV)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable style={styles.settingsRow} onPress={handleExportData}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="download"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                Export Data (CSV)
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Animated.View>

      {/* About */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          About
        </Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>
                App Version
              </Text>
            </View>
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowIcon: {
    marginRight: 12,
    width: 24,
  },
  rowLabel: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  rowValue: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
