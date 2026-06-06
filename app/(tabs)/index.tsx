import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { ProgressRing } from "@/components/progress-ring";
import { SectionHeader } from "@/components/section-header";
import { ActionButton } from "@/components/action-button";

// Helper to get formatted string YYYY-MM-DD safely in local timezone
function formatDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // --- Store Subscriptions ---
  const userProfile = useAppStore((state) => state.userProfile);
  const dailyStats = useAppStore((state) => state.dailyStats);
  const streaks = useAppStore((state) => state.streaks);
  const workoutTemplates = useAppStore((state) => state.workoutTemplates);
  const loggedWorkouts = useAppStore((state) => state.workouts); // Reads permanent history
  const addWorkout = useAppStore((state) => state.addWorkout);
  const loadSampleData = useAppStore((state) => state.loadSampleData);

  // Fallback state update hook modifier context for tracking water consumption records
  const updateWaterIntake = useAppStore((state) => (state as any).updateWaterIntake ?? ((amount: number) => {
    const todayRecord = dailyStats.find((s) => s.date === todayString);
    if (todayRecord) {
      todayRecord.waterIntake = Math.max(0, (todayRecord.waterIntake ?? 0) + amount);
    }
  }));

  // --- Local Date/Calendar State ---
  const todayString = useMemo(() => formatDateString(new Date()), []);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayString);

  useEffect(() => {
    if (dailyStats.length === 0) {
      loadSampleData();
    }
  }, [dailyStats.length, loadSampleData]);

  // --- Profile Setup ---
  const userName = userProfile?.name ?? "Kwaku";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const todayStats = useMemo(
    () => dailyStats.find((s) => s.date === todayString),
    [dailyStats, todayString]
  );

  // Vitals & Ring Values
  const stepGoal = userProfile?.dailyStepGoal ?? 8000;
  const calorieGoal = userProfile?.dailyCalorieTarget ?? 2000;
  const activeMinGoal = 60;
  const waterGoal = userProfile?.dailyWaterGoal ?? 2500;

  const steps = todayStats?.steps ?? 0;
  const calories = todayStats?.caloriesBurned ?? 0;
  const activeMin = todayStats?.activeMinutes ?? 0;
  const water = todayStats?.waterIntake ?? 0;

  const stepsProgress = Math.min((steps / stepGoal) * 100, 100);
  const caloriesProgress = Math.min((calories / calorieGoal) * 100, 100);
  const activeMinProgress = Math.min((activeMin / activeMinGoal) * 100, 100);
  const waterProgress = Math.min((water / waterGoal) * 100, 100);

  // --- Generate 7-Day Week Horizon (Mon-Sun) based on current week ---
  const weekDays = useMemo(() => {
    const current = new Date();
    const currentDayIdx = current.getDay(); // 0 is Sun, 1 is Mon...
    // Adjust to make Monday index 0
    const distanceToMonday = currentDayIdx === 0 ? -6 : 1 - currentDayIdx;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = formatDateString(d);
      
      // Map index to templates safely: Monday=0, Tuesday=1 ... Friday=4.
      // Weekend dates default back to full body rest or generic template structures.
      const routineTemplate = workoutTemplates[idx] ?? workoutTemplates[0];

      // Check the persistent database list to see if a workout was logged for this date string
      const isCompleted = loggedWorkouts.some((w: any) => {
        const wDate = w.completedAt ? w.completedAt.split("T")[0] : w.date;
        return wDate === dateStr;
      });

      return {
        dateString: dateStr,
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue...
        dayNumber: d.getDate(),
        routineName: routineTemplate?.name ?? "Rest Day",
        template: routineTemplate,
        isCompleted,
      };
    });
  }, [workoutTemplates, loggedWorkouts]);

  // Determine the active routine for the highlighted date tab
  const activeCalendarDay = useMemo(() => {
    return weekDays.find((d) => d.dateString === selectedDateStr) ?? weekDays[3];
  }, [weekDays, selectedDateStr]);

  // --- Trigger Action: Complete or Backdate Selected Day ---
  const handleToggleDayCompletion = () => {
    if (activeCalendarDay.isCompleted) {
      Alert.alert("Already Logged", "This day's workout training is already saved in your history logs.");
      return;
    }

    // Creating entry mapping directly to persistent storage specifications
    const trackingPayload = {
      id: `workout_${Date.now()}`,
      templateId: activeCalendarDay.template?.id ?? "custom",
      name: activeCalendarDay.routineName,
      completedAt: new Date(selectedDateStr + "T12:00:00.000Z").toISOString(),
      duration: activeCalendarDay.template?.estimatedDuration ?? 60,
      exercises: activeCalendarDay.template?.exercises ?? [],
      isFavorite: false,
    };

    addWorkout(trackingPayload);
    Alert.alert("Workout Saved!", `Successfully marked ${activeCalendarDay.routineName} as complete for ${selectedDateStr}.`);
  };

  // --- Water Logger Subroutines ---
  const handleLogWater = (amount: number) => {
    updateWaterIntake(amount);
  };

  const handleResetWater = () => {
    Alert.alert("Reset Intake", "Are you sure you want to clear today's water intake record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => updateWaterIntake(-water) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 20,
        }}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.name, { color: colors.textPrimary }]}>
              {userName}!
            </Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "26" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
        </Animated.View>

        {/* Streak Badge */}
        {streaks.currentStreak > 0 && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={[
              styles.streakBadge,
              { backgroundColor: colors.accent + "1A", borderColor: colors.accent + "33" },
            ]}
          >
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={[styles.streakText, { color: colors.accent }]}>
              {streaks.currentStreak} Day Streak - Keep it up!
            </Text>
          </Animated.View>
        )}

        {/* New Training Calendar Tracker Strip */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <SectionHeader title="Training Schedule" style={{ marginBottom: 14 }} />
          <View style={[styles.calendarStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.daysRow}>
              {weekDays.map((day) => {
                const isSelected = day.dateString === selectedDateStr;
                const isToday = day.dateString === todayString;

                return (
                  <Pressable
                    key={day.dateString}
                    onPress={() => setSelectedDateStr(day.dateString)}
                    style={[
                      styles.dayButton,
                      isSelected && { backgroundColor: colors.primary },
                      !isSelected && isToday && { borderColor: colors.primary, borderWidth: 1.5 },
                    ]}
                  >
                    <Text style={[styles.dayLabelText, { color: isSelected ? "#FFFFFF" : colors.textSecondary }]}>
                      {day.dayLabel}
                    </Text>
                    <Text style={[styles.dayNumberText, { color: isSelected ? "#FFFFFF" : colors.textPrimary }]}>
                      {day.dayNumber}
                    </Text>
                    
                    {/* Visual Checkmark indicator if database confirms entry */}
                    {day.isCompleted && (
                      <View style={[styles.dotCheck, { backgroundColor: isSelected ? "#FFFFFF" : colors.success }]}>
                        <Ionicons name="checkmark" size={8} color={isSelected ? colors.primary : "#FFFFFF"} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Context details for the selected day */}
            <View style={[styles.selectedDayDetail, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scheduleSub, { color: colors.textSecondary }]}>
                  {selectedDateStr === todayString ? "Today's Schedule" : `Schedule for ${selectedDateStr}`}
                </Text>
                <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>
                  {activeCalendarDay.routineName}
                </Text>
              </View>
              
              <Pressable
                onPress={handleToggleDayCompletion}
                style={[
                  styles.checkButton,
                  { backgroundColor: activeCalendarDay.isCompleted ? colors.success + "20" : colors.primary },
                ]}
              >
                <Ionicons
                  name={activeCalendarDay.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                  size={20}
                  color={activeCalendarDay.isCompleted ? colors.success : "#FFFFFF"}
                />
                <Text style={[styles.checkButtonText, { color: activeCalendarDay.isCompleted ? colors.success : "#FFFFFF" }]}>
                  {activeCalendarDay.isCompleted ? "Logged" : "Log Day"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Progress Metrics Rings */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SectionHeader title="Today's Metrics" style={{ marginTop: 24, marginBottom: 14 }} />
          <View style={styles.statsRow}>
            <StatRingItem label="Steps" value={steps.toLocaleString()} progress={stepsProgress} color={colors.primary} bgColor={colors.surface} borderColor={colors.border} textColor={colors.textPrimary} subColor={colors.textSecondary} />
            <StatRingItem label="Calories" value={`${calories}`} progress={caloriesProgress} color={colors.accent} bgColor={colors.surface} borderColor={colors.border} textColor={colors.textPrimary} subColor={colors.textSecondary} />
            <StatRingItem label="Active Min" value={`${activeMin}`} progress={activeMinProgress} color={colors.success} bgColor={colors.surface} borderColor={colors.border} textColor={colors.textPrimary} subColor={colors.textSecondary} />
            <StatRingItem label="Water" value={`${(water / 1000).toFixed(1)}L`} progress={waterProgress} color="#2F80ED" bgColor={colors.surface} borderColor={colors.border} textColor={colors.textPrimary} subColor={colors.textSecondary} />
          </View>
        </Animated.View>

        {/* Interactive Hydration Tracker Input Card */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <SectionHeader title="Hydration Tracker" style={{ marginTop: 28, marginBottom: 14 }} />
          <View style={[styles.waterCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.waterHeaderRow}>
              <View style={[styles.waterIconFrame, { backgroundColor: "#2F80ED" + "1A" }]}>
                <Ionicons name="water" size={22} color="#2F80ED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.waterTitle, { color: colors.textPrimary }]}>Water Balance</Text>
                <Text style={[styles.waterMeta, { color: colors.textSecondary }]}>
                  {water} ml / <Text style={{ fontFamily: Fonts.semiBold }}>{waterGoal} ml</Text>
                </Text>
              </View>
              {water > 0 && (
                <Pressable onPress={handleResetWater} hitSlop={8} style={styles.waterResetBtn}>
                  <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            {/* Visual Progress Bar Track */}
            <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    backgroundColor: "#2F80ED", 
                    width: `${Math.min(1, water / waterGoal) * 100}%` 
                  }
                ]} 
              />
            </View>

            {/* Incremental Logging Pill Buttons */}
            <View style={styles.waterActionGrid}>
              <Pressable 
                onPress={() => handleLogWater(250)} 
                style={[styles.waterPillBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Ionicons name="add" size={14} color="#2F80ED" />
                <Text style={[styles.waterPillText, { color: colors.textPrimary }]}>250ml</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => handleLogWater(500)} 
                style={[styles.waterPillBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Ionicons name="add" size={14} color="#2F80ED" />
                <Text style={[styles.waterPillText, { color: colors.textPrimary }]}>500ml</Text>
              </Pressable>

              <Pressable 
                onPress={() => handleLogWater(750)} 
                style={[styles.waterPillBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              >
                <Ionicons name="add" size={14} color="#2F80ED" />
                <Text style={[styles.waterPillText, { color: colors.textPrimary }]}>750ml</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Goal Card Context Target */}
        {activeCalendarDay.template && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <SectionHeader title="Target Blueprint Details" style={{ marginTop: 28, marginBottom: 14 }} />
            <Pressable
              onPress={() => router.push("/(tabs)/workouts")}
              style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.goalIconContainer, { backgroundColor: colors.primary + "1A" }]}>
                <Ionicons name="fitness" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, { color: colors.textPrimary }]}>
                  {activeCalendarDay.template.name}
                </Text>
                <Text style={[styles.goalMeta, { color: colors.textSecondary }]}>
                  {activeCalendarDay.template.estimatedDuration} min · {activeCalendarDay.template.difficulty} · {activeCalendarDay.template.exercises.length} targeting moves
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}

        {/* Completion Overview Breakdown */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <View style={[styles.completionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.completionLabel, { color: colors.textSecondary }]}>Vitals & Goals Completion Rate</Text>
              <Text style={[styles.completionValue, { color: colors.textPrimary }]}>{todayStats?.goalCompletionRate ?? 0}%</Text>
            </View>
            <ProgressRing progress={todayStats?.goalCompletionRate ?? 0} size={56} strokeWidth={6} color={colors.success} backgroundColor={colors.border}>
              <Ionicons name="analytics" size={18} color={colors.success} />
            </ProgressRing>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={[styles.fabContainer, { paddingBottom: insets.bottom + 16 }]}>
        <ActionButton title="Launch Exercise Module" icon="barbell" onPress={() => router.push("/(tabs)/workouts")} style={styles.fab} />
      </View>
    </View>
  );
}

// --- Mini stat ring helper ---
interface StatRingItemProps {
  label: string;
  value: string;
  progress: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  subColor: string;
}

function StatRingItem({ label, value, progress, color, bgColor, borderColor, textColor, subColor }: StatRingItemProps) {
  return (
    <View style={[styles.statItem, { backgroundColor: bgColor, borderColor }]}>
      <ProgressRing progress={progress} size={52} strokeWidth={5} color={color} backgroundColor={borderColor}>
        <Text style={[styles.statPercentage, { color }]}>{Math.round(progress)}%</Text>
      </ProgressRing>
      <Text style={[styles.statValue, { color: textColor }]} numberOfLines={1}>{value}</Text>
      <Text style={[styles.statLabel, { color: subColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: Fonts.regular, fontSize: 15, marginBottom: 2 },
  name: { fontFamily: Fonts.bold, fontSize: 26 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.semiBold, fontSize: 18 },
  streakBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginBottom: 24, gap: 6 },
  streakEmoji: { fontSize: 16 },
  streakText: { fontFamily: Fonts.semiBold, fontSize: 13 },
  calendarStrip: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  daysRow: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  dayButton: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 12, gap: 6, minHeight: 64, justifyContent: 'center' },
  dayLabelText: { fontFamily: Fonts.medium, fontSize: 11 },
  dayNumberText: { fontFamily: Fonts.bold, fontSize: 14 },
  dotCheck: { position: "absolute", bottom: -4, width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  selectedDayDetail: { flexDirection: "row", alignItems: "center", paddingTop: 14, borderWidth: 0, borderTopWidth: 1, gap: 12 },
  scheduleSub: { fontFamily: Fonts.regular, fontSize: 11, marginBottom: 2 },
  scheduleTitle: { fontFamily: Fonts.bold, fontSize: 15 },
  checkButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  checkButtonText: { fontFamily: Fonts.semiBold, fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 8 },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 2, borderRadius: 16, borderWidth: 1, gap: 6 },
  statPercentage: { fontFamily: Fonts.semiBold, fontSize: 9 },
  statValue: { fontFamily: Fonts.bold, fontSize: 12 },
  statLabel: { fontFamily: Fonts.regular, fontSize: 10 },
  goalCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 14 },
  goalIconContainer: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  goalTitle: { fontFamily: Fonts.semiBold, fontSize: 15, marginBottom: 3 },
  goalMeta: { fontFamily: Fonts.regular, fontSize: 12 },
  completionCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 24 },
  completionLabel: { fontFamily: Fonts.regular, fontSize: 13, marginBottom: 4 },
  completionValue: { fontFamily: Fonts.bold, fontSize: 28 },
  fabContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, pointerEvents: "box-none" },
  fab: { borderRadius: 16 },

  // Water Card Layout Structures
  waterCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  waterHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  waterIconFrame: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  waterTitle: { fontFamily: Fonts.bold, fontSize: 15, marginBottom: 2 },
  waterMeta: { fontFamily: Fonts.regular, fontSize: 13 },
  waterResetBtn: { padding: 4 },
  progressBarTrack: { height: 8, borderRadius: 4, width: "100%", overflow: "hidden", marginBottom: 16 },
  progressBarFill: { height: "100%", borderRadius: 4 },
  waterActionGrid: { flexDirection: "row", gap: 10 },
  waterPillBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 38, borderRadius: 10, borderWidth: 1 },
  waterPillText: { fontFamily: Fonts.medium, fontSize: 12 },
});