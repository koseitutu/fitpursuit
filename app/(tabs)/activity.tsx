import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { ActionButton } from "@/components/action-button";
import { ActivityCard } from "@/components/activity-card";
import { SectionHeader } from "@/components/section-header";
import type { Activity, ActivityType } from "@/store/types";

const ACTIVITY_TYPES: { key: ActivityType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "running", label: "Running", icon: "footsteps-outline" },
  { key: "walking", label: "Walking", icon: "walk-outline" },
  { key: "cycling", label: "Cycling", icon: "bicycle-outline" },
  { key: "hiking", label: "Hiking", icon: "trail-sign-outline" },
];

const MODE_TABS = ["Outdoor Run", "Real Time"] as const;

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatPace(paceMinPerKm: number): string {
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, "0")}"`;
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const activities = useAppStore((state) => state.activities);
  const activeActivity = useAppStore((state) => state.activeActivity);
  const startActivity = useAppStore((state) => state.startActivity);
  const endActivity = useAppStore((state) => state.endActivity);
  const addActivity = useAppStore((state) => state.addActivity);
  const updateActivity = useAppStore((state) => state.updateActivity);
  const deleteActivity = useAppStore((state) => state.deleteActivity);

  const [selectedType, setSelectedType] = useState<ActivityType>("running");
  const [selectedMode, setSelectedMode] = useState<typeof MODE_TABS[number]>("Outdoor Run");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formType, setFormType] = useState<ActivityType>("running");
  const [formDuration, setFormDuration] = useState("");
  const [formDistance, setFormDistance] = useState("");
  const [formSteps, setFormSteps] = useState("");
  const [formCalories, setFormCalories] = useState("");

  // Timer logic
  useEffect(() => {
    if (activeActivity) {
      const startTime = new Date(activeActivity.startedAt).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - startTime) / 1000));

      intervalRef.current = setInterval(() => {
        const current = Date.now();
        setElapsedSeconds(Math.floor((current - startTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeActivity]);

  const handleStart = useCallback(() => {
    const id = `activity-${Date.now()}`;
    startActivity({
      id,
      type: selectedType,
      duration: 0,
      distance: 0,
      steps: 0,
      pace: 0,
      caloriesBurned: 0,
      route: [],
      startedAt: new Date().toISOString(),
    });
  }, [selectedType, startActivity]);

  const handleStop = useCallback(() => {
    if (!activeActivity) return;
    const durationMin = Math.round(elapsedSeconds / 60);
    const distance = parseFloat((elapsedSeconds * 0.0022).toFixed(2));
    const calories = Math.round(elapsedSeconds * 0.15);
    const pace = distance > 0 ? parseFloat(((durationMin / distance)).toFixed(2)) : 0;

    endActivity(activeActivity.id, {
      duration: durationMin,
      distance,
      caloriesBurned: calories,
      pace,
      steps: Math.round(elapsedSeconds * 2.5),
    });
  }, [activeActivity, elapsedSeconds, endActivity]);

  // Add/Edit Modal
  const handleOpenAdd = () => {
    setEditingActivity(null);
    setFormType("running");
    setFormDuration("");
    setFormDistance("");
    setFormSteps("");
    setFormCalories("");
    setShowModal(true);
  };

  const handleOpenEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setFormType(activity.type);
    setFormDuration(String(activity.duration));
    setFormDistance(String(activity.distance));
    setFormSteps(String(activity.steps));
    setFormCalories(String(activity.caloriesBurned));
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Activity", "Are you sure you want to delete this activity?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteActivity(id),
      },
    ]);
  };

  const handleSaveActivity = () => {
    const duration = Number(formDuration) || 0;
    const distance = Number(formDistance) || 0;
    const steps = Number(formSteps) || 0;
    const calories = Number(formCalories) || 0;

    if (duration <= 0) {
      Alert.alert("Error", "Duration must be greater than 0");
      return;
    }

    if (editingActivity) {
      updateActivity(editingActivity.id, {
        type: formType,
        duration,
        distance,
        steps,
        caloriesBurned: calories,
        pace: distance > 0 ? Math.round((duration / distance) * 100) / 100 : 0,
      });
    } else {
      const newActivity: Activity = {
        id: `activity-manual-${Date.now()}`,
        type: formType,
        duration,
        distance,
        steps,
        pace: distance > 0 ? Math.round((duration / distance) * 100) / 100 : 0,
        caloriesBurned: calories,
        route: [],
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
      };
      addActivity(newActivity);
    }

    setShowModal(false);
  };

  // Simulated live stats
  const liveDistance = (elapsedSeconds * 0.0022).toFixed(2);
  const liveCalories = Math.round(elapsedSeconds * 0.15);
  const livePaceMinPerKm = elapsedSeconds > 10
    ? (elapsedSeconds / 60) / parseFloat(liveDistance || "1")
    : 0;

  const selectedLabel = ACTIVITY_TYPES.find((t) => t.key === selectedType)?.label ?? "Running";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            {selectedLabel}
          </Text>
          <Pressable
            onPress={handleOpenAdd}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            hitSlop={8}
          >
            <Ionicons name="add" size={20} color="#0A0E1A" />
          </Pressable>
        </Animated.View>

        {/* Mode Tabs */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.modeTabsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          {MODE_TABS.map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setSelectedMode(mode)}
              style={[
                styles.modeTab,
                selectedMode === mode && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.modeTabText,
                  {
                    color: selectedMode === mode ? "#0A0E1A" : colors.textSecondary,
                    fontFamily: selectedMode === mode ? Fonts.semiBold : Fonts.medium,
                  },
                ]}
              >
                {mode}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Activity Type Pills */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.pillsScroll}
            contentContainerStyle={styles.pillsContent}
          >
            {ACTIVITY_TYPES.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <Pressable
                  key={type.key}
                  onPress={() => {
                    if (!activeActivity) setSelectedType(type.key);
                  }}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isActive ? colors.primary : colors.surface,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={isActive ? "#0A0E1A" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      {
                        color: isActive ? "#0A0E1A" : colors.textSecondary,
                        fontFamily: isActive ? Fonts.semiBold : Fonts.medium,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Map Placeholder / Route Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Svg width="100%" height={160} viewBox="0 0 320 160">
            <Path
              d="M 30 130 C 60 110, 80 40, 120 60 S 180 120, 220 80 S 260 20, 290 50"
              stroke={colors.primary}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={30} cy={130} r={5} fill={colors.primary} />
            <Circle cx={120} cy={60} r={4} fill={colors.primary} opacity={0.7} />
            <Circle cx={220} cy={80} r={4} fill={colors.primary} opacity={0.7} />
            <Circle cx={290} cy={50} r={6} fill={colors.accent} />
            <Circle cx={75} cy={55} r={2} fill={colors.primary} opacity={0.3} />
            <Circle cx={150} cy={100} r={2} fill={colors.primary} opacity={0.3} />
            <Circle cx={255} cy={35} r={2} fill={colors.primary} opacity={0.3} />
          </Svg>
        </Animated.View>

        {/* Active Activity Stats or Start Button */}
        {activeActivity ? (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.statsSection}>
            <View style={styles.distanceContainer}>
              <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
                Distance
              </Text>
              <Text style={[styles.distanceValue, { color: colors.textPrimary }]}>
                {liveDistance}
                <Text style={styles.distanceUnit}> km</Text>
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pace</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {livePaceMinPerKm > 0 ? formatPace(livePaceMinPerKm) : "--'--\""}
                </Text>
                <Text style={[styles.statUnit, { color: colors.textSecondary }]}>/km</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text>
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                  {formatDuration(elapsedSeconds)}
                </Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calories</Text>
                <Text style={[styles.statValue, { color: colors.accent }]}>{liveCalories}</Text>
                <Text style={[styles.statUnit, { color: colors.textSecondary }]}>kcal</Text>
              </View>
            </View>

            <View style={styles.controlButtons}>
              <ActionButton
                title="Stop"
                icon="stop-circle-outline"
                variant="primary"
                onPress={handleStop}
                style={{ flex: 1 }}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.startSection}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Ionicons name="play" size={32} color="#0A0E1A" />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Recent Activities */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.recentSection}>
          <SectionHeader title="Recent Activities" style={{ marginBottom: 12 }} />

          {activities.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="fitness-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No activities yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Start your first activity to see it here
              </Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {activities.slice(0, 10).map((activity, index) => {
                const typeLabel =
                  activity.type.charAt(0).toUpperCase() + activity.type.slice(1);
                return (
                  <Animated.View
                    key={activity.id}
                    entering={FadeInDown.delay(400 + index * 80).duration(300)}
                  >
                    <ActivityCard
                      type={typeLabel}
                      duration={activity.duration}
                      distance={activity.distance}
                      calories={activity.caloriesBurned}
                      date={formatRelativeDate(activity.startedAt)}
                      onPress={() => handleOpenEdit(activity)}
                    />
                    {/* Action overlay */}
                    <View style={styles.activityActions}>
                      <Pressable
                        onPress={() => handleOpenEdit(activity)}
                        hitSlop={8}
                        style={[styles.activityActionBtn, { backgroundColor: colors.surface }]}
                      >
                        <Ionicons name="pencil" size={12} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(activity.id)}
                        hitSlop={8}
                        style={[styles.activityActionBtn, { backgroundColor: colors.surface }]}
                      >
                        <Ionicons name="trash-outline" size={12} color={colors.error} />
                      </Pressable>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Add/Edit Activity Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)} />
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={styles.modalHandle}>
              <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {editingActivity ? "Edit Activity" : "Add Activity"}
            </Text>

            {/* Activity Type */}
            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginBottom: 16 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {ACTIVITY_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  onPress={() => setFormType(type.key)}
                  style={[
                    styles.modalTypeChip,
                    {
                      backgroundColor: formType === type.key ? colors.primary : colors.surface,
                      borderColor: formType === type.key ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={14}
                    color={formType === type.key ? "#0A0E1A" : colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontFamily: formType === type.key ? Fonts.semiBold : Fonts.medium,
                      fontSize: 12,
                      color: formType === type.key ? "#0A0E1A" : colors.textSecondary,
                    }}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Form Fields */}
            <View style={styles.modalFormGrid}>
              <View style={styles.modalFormCol}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                  Duration (min)
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  value={formDuration}
                  onChangeText={setFormDuration}
                  placeholder="30"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFormCol}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>
                  Distance (km)
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  value={formDistance}
                  onChangeText={setFormDistance}
                  placeholder="5.0"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalFormGrid}>
              <View style={styles.modalFormCol}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Steps</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  value={formSteps}
                  onChangeText={setFormSteps}
                  placeholder="6000"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFormCol}>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Calories</Text>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                  value={formCalories}
                  onChangeText={setFormCalories}
                  placeholder="300"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Save Button */}
            <Pressable
              onPress={handleSaveActivity}
              style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalSaveBtnText}>
                {editingActivity ? "Update Activity" : "Add Activity"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabsContainer: {
    flexDirection: "row",
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
    borderCurve: "continuous",
  },
  modeTabText: {
    fontSize: 14,
  },
  pillsScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  pillsContent: {
    gap: 10,
    paddingRight: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
  },
  mapCard: {
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    overflow: "hidden",
  },
  statsSection: {
    marginBottom: 32,
  },
  distanceContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  distanceLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginBottom: 4,
  },
  distanceValue: {
    fontFamily: Fonts.bold,
    fontSize: 48,
    ...Platform.select({
      ios: { fontVariant: ["tabular-nums"] },
      android: {},
    }),
  },
  distanceUnit: {
    fontSize: 20,
    fontFamily: Fonts.medium,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    ...Platform.select({
      ios: { fontVariant: ["tabular-nums"] },
      android: {},
    }),
  },
  statUnit: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  controlButtons: {
    flexDirection: "row",
    gap: 12,
  },
  startSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 16,
  },
  startButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#00E5FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#0A0E1A",
    marginTop: 6,
  },
  recentSection: {
    marginTop: 4,
  },
  activityList: {
    gap: 12,
  },
  activityActions: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
  },
  activityActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  emptyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtext: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    alignItems: "center",
    marginBottom: 16,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  modalLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 6,
  },
  modalTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  modalFormGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  modalFormCol: {
    flex: 1,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  modalSaveBtn: {
    height: 52,
    borderRadius: 14,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  modalSaveBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#0A0E1A",
  },
});
