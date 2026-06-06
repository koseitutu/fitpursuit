import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import Animated, { FadeInDown } from "react-native-reanimated";
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

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

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
  
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getDaysInMonth(year: number, month: number) {
  const date = new Date(year, month, 1);
  const days = [];
  const startDay = date.getDay();
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // --- Store Streams ---
  const activities = useAppStore((state) => state.activities);
  const loggedWorkouts = useAppStore((state) => state.workouts);
  const activeActivity = useAppStore((state) => state.activeActivity);
  const startActivity = useAppStore((state) => state.startActivity);
  const endActivity = useAppStore((state) => state.endActivity);
  const addActivity = useAppStore((state) => state.addActivity);
  const updateActivity = useAppStore((state) => state.updateActivity);
  const deleteActivity = useAppStore((state) => state.deleteActivity);
  const addWorkout = useAppStore((state) => state.addWorkout);
  
  const deleteWorkout = useAppStore((state) => state.deleteWorkout ?? ((id: string) => {}));
  const updateWorkout = useAppStore((state) => (state as any).updateWorkout ?? ((id: string, updates: any) => {
    // Safety check fallback implementation context if type action is omitted
    const wIndex = loggedWorkouts.findIndex(w => w.id === id);
    if (wIndex !== -1) {
      loggedWorkouts[wIndex] = { ...loggedWorkouts[wIndex], ...updates };
    }
  }));

  const [selectedType, setSelectedType] = useState<ActivityType>("running");
  const [selectedMode, setSelectedMode] = useState<typeof MODE_TABS[number]>("Outdoor Run");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal / UI Expansion states
  const [showModal, setShowModal] = useState(false);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  
  // Tracking structural contexts during edits
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);

  // Form states
  const [formType, setFormType] = useState<ActivityType>("running");
  const [formDuration, setFormDuration] = useState("");
  const [formDistance, setFormDistance] = useState("");
  const [formSteps, setFormSteps] = useState("");
  const [formCalories, setFormCalories] = useState("");
  
  const [formWorkoutName, setFormWorkoutName] = useState("");
  const [formWorkoutDate, setFormWorkoutDate] = useState(new Date().toISOString().split("T")[0]);

  // Mini-Calendar Picker Month Coordinates
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // --- Chronological Unified Timeline Feed ---
  const unifiedTimelineFeed = useMemo(() => {
    const cardioItems = activities.map((act) => ({
      ...act,
      feedType: "cardio" as const,
      sortDate: new Date(act.startedAt).getTime(),
    }));

    const strengthItems = loggedWorkouts.map((w: any) => ({
      ...w,
      feedType: "strength" as const,
      sortDate: new Date(w.completedAt ? w.completedAt : w.date ? w.date + "T12:00:00.000Z" : Date.now()).getTime(),
    }));

    return [...cardioItems, ...strengthItems].sort((a, b) => b.sortDate - a.sortDate);
  }, [activities, loggedWorkouts]);

  // Capped window array depending on viewing expansion state toggles
  const visibleTimelineFeed = useMemo(() => {
    if (isExpandedView) return unifiedTimelineFeed;
    return unifiedTimelineFeed.slice(0, 5);
  }, [unifiedTimelineFeed, isExpandedView]);

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

  const handleOpenAddCardio = () => {
    setIsLoggingWorkout(false);
    setEditingActivity(null);
    setEditingWorkoutId(null);
    setFormType("running");
    setFormDuration("");
    setFormDistance("");
    setFormSteps("");
    setFormCalories("");
    setShowModal(true);
  };

  const handleOpenAddStrength = () => {
    setIsLoggingWorkout(true);
    setEditingActivity(null);
    setEditingWorkoutId(null);
    setFormWorkoutName("");
    setFormDuration("45");
    setFormWorkoutDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const handleOpenEdit = (item: any) => {
    if (item.feedType === "strength") {
      setIsLoggingWorkout(true);
      setEditingActivity(null);
      setEditingWorkoutId(item.id);
      setFormWorkoutName(item.name);
      setFormDuration(String(item.duration));
      
      const rawDate = item.completedAt ? item.completedAt : item.date;
      setFormWorkoutDate(rawDate.split("T")[0]);
    } else {
      setIsLoggingWorkout(false);
      setEditingWorkoutId(null);
      setEditingActivity(item);
      setFormType(item.type);
      setFormDuration(String(item.duration));
      setFormDistance(String(item.distance));
      setFormSteps(String(item.steps));
      setFormCalories(String(item.caloriesBurned));
    }
    setShowModal(true);
  };

  const handleDeleteItem = (item: any) => {
    if (item.feedType === "strength") {
      Alert.alert("Delete Workout Log", "Are you sure you want to delete this workout log from your history?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => useAppStore.getState().deleteWorkout?.(item.id) },
      ]);
    } else {
      Alert.alert("Delete Activity", "Are you sure you want to delete this activity?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteActivity(item.id) },
      ]);
    }
  };

  const handleSaveData = () => {
    const duration = Number(formDuration) || 0;
    if (duration <= 0) {
      Alert.alert("Error", "Duration must be greater than 0");
      return;
    }

    if (isLoggingWorkout) {
      if (!formWorkoutName.trim()) {
        Alert.alert("Error", "Please provide a Routine Name");
        return;
      }

      const isoFormattedDateTimeString = new Date(formWorkoutDate + "T12:00:00.000Z").toISOString();

      if (editingWorkoutId) {
        // Workout item edit action map payload save execution
        updateWorkout(editingWorkoutId, {
          name: formWorkoutName.trim(),
          duration,
          completedAt: isoFormattedDateTimeString,
          date: formWorkoutDate,
        });
      } else {
        const payload = {
          id: `manual_workout_${Date.now()}`,
          templateId: "custom-entry",
          name: formWorkoutName.trim(),
          completedAt: isoFormattedDateTimeString,
          duration,
          exercises: [],
          isFavorite: false,
        };
        addWorkout(payload);
      }
    } else {
      const distance = Number(formDistance) || 0;
      const steps = Number(formSteps) || 0;
      const calories = Number(formCalories) || 0;

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
    }

    setShowModal(false);
  };

  const monthDays = useMemo(() => getDaysInMonth(calendarYear, calendarMonth), [calendarYear, calendarMonth]);
  const currentMonthLabel = new Date(calendarYear, calendarMonth).toLocaleString(undefined, { month: "long", year: "numeric" });

  const changeMonth = (direction: number) => {
    let nextMonth = calendarMonth + direction;
    let nextYear = calendarYear;
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    setCalendarMonth(nextMonth);
    setCalendarYear(nextYear);
  };

  const liveDistance = (elapsedSeconds * 0.0022).toFixed(2);
  const liveCalories = Math.round(elapsedSeconds * 0.15);
  const livePaceMinPerKm = elapsedSeconds > 10 ? (elapsedSeconds / 60) / parseFloat(liveDistance || "1") : 0;
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
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>{selectedLabel}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={handleOpenAddStrength} style={[styles.addBtn, { backgroundColor: colors.accent + "20" }]} hitSlop={8}>
              <Ionicons name="barbell-outline" size={20} color={colors.accent} />
            </Pressable>
            <Pressable onPress={handleOpenAddCardio} style={[styles.addBtn, { backgroundColor: colors.primary }]} hitSlop={8}>
              <Ionicons name="add" size={20} color="#0A0E1A" />
            </Pressable>
          </View>
        </View>

        {/* Mode Tabs */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.modeTabsContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {MODE_TABS.map((mode) => (
            <Pressable key={mode} onPress={() => setSelectedMode(mode)} style={[styles.modeTab, selectedMode === mode && { backgroundColor: colors.primary }]}>
              <Text style={[styles.modeTabText, { color: selectedMode === mode ? "#0A0E1A" : colors.textSecondary, fontFamily: selectedMode === mode ? Fonts.semiBold : Fonts.medium }]}>{mode}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* Activity Type Pills */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll} contentContainerStyle={styles.pillsContent}>
            {ACTIVITY_TYPES.map((type) => {
              const isActive = selectedType === type.key;
              return (
                <Pressable key={type.key} onPress={() => { if (!activeActivity) setSelectedType(type.key); }} style={[styles.pill, { backgroundColor: isActive ? colors.primary : colors.surface, borderColor: isActive ? colors.primary : colors.border }]}>
                  <Ionicons name={type.icon} size={16} color={isActive ? "#0A0E1A" : colors.textSecondary} />
                  <Text style={[styles.pillText, { color: isActive ? "#0A0E1A" : colors.textSecondary, fontFamily: isActive ? Fonts.semiBold : Fonts.medium }]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Map Placeholder Graphic */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={[styles.mapCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Svg width="100%" height={160} viewBox="0 0 320 160">
            <Path d="M 30 130 C 60 110, 80 40, 120 60 S 180 120, 220 80 S 260 20, 290 50" stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={30} cy={130} r={5} fill={colors.primary} />
            <Circle cx={290} cy={50} r={6} fill={colors.accent} />
          </Svg>
        </Animated.View>

        {/* Live Active Tracker Module Dashboard */}
        {activeActivity ? (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.statsSection}>
            <View style={styles.distanceContainer}>
              <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>Distance</Text>
              <Text style={[styles.distanceValue, { color: colors.textPrimary }]}>{liveDistance}<Text style={styles.distanceUnit}> km</Text></Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pace</Text><Text style={[styles.statValue, { color: colors.textPrimary }]}>{livePaceMinPerKm > 0 ? formatPace(livePaceMinPerKm) : "--'--\""}</Text></View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}><Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duration</Text><Text style={[styles.statValue, { color: colors.textPrimary }]}>{formatDuration(elapsedSeconds)}</Text></View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}><Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calories</Text><Text style={[styles.statValue, { color: colors.accent }]}>{liveCalories}</Text></View>
            </View>
            <ActionButton title="Stop" icon="stop-circle-outline" variant="primary" onPress={handleStop} style={{ flex: 1 }} />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.startSection}>
            <Pressable onPress={handleStart} style={styles.startButton}>
              <Ionicons name="play" size={32} color="#0A0E1A" />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Unified Fitness Log Chronological Feed Area */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.recentSection}>
          <SectionHeader title="Unified Fitness Log" style={{ marginBottom: 12 }} />

          {visibleTimelineFeed.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="fitness-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No fitness records saved</Text>
            </View>
          ) : (
            <View style={styles.activityList}>
              {visibleTimelineFeed.map((item: any, index) => {
                if (item.feedType === "strength") {
                  const dateStr = item.completedAt ? item.completedAt : item.date;
                  return (
                    <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 40).duration(300)} style={styles.cardContainer}>
                      <Pressable onPress={() => handleOpenEdit(item)} style={[styles.strengthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.strengthIconFrame, { backgroundColor: colors.accent + "1C" }]}>
                          <Ionicons name="barbell" size={20} color={colors.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.cardHeaderRow}>
                            <Text style={[styles.strengthTitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.strengthDate, { color: colors.textSecondary }]}>{formatRelativeDate(dateStr)}</Text>
                          </View>
                          <Text style={[styles.strengthMeta, { color: colors.textSecondary }]}>
                            Strength Workout · <Ionicons name="time-outline" size={12} /> {item.duration} mins
                          </Text>
                        </View>
                      </Pressable>
                      <View style={styles.activityActions}>
                        <Pressable onPress={() => handleOpenEdit(item)} hitSlop={8} style={[styles.activityActionBtn, { backgroundColor: colors.background }]}>
                          <Ionicons name="pencil" size={12} color={colors.primary} />
                        </Pressable>
                        <Pressable onPress={() => handleDeleteItem(item)} hitSlop={8} style={[styles.activityActionBtn, { backgroundColor: colors.background }]}>
                          <Ionicons name="trash-outline" size={12} color={colors.error} />
                        </Pressable>
                      </View>
                    </Animated.View>
                  );
                }

                const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
                return (
                  <Animated.View key={item.id} entering={FadeInDown.delay(100 + index * 40).duration(300)} style={styles.cardContainer}>
                    <ActivityCard
                      type={typeLabel}
                      duration={item.duration}
                      distance={item.distance}
                      calories={item.caloriesBurned}
                      date={formatRelativeDate(item.startedAt)}
                      onPress={() => handleOpenEdit(item)}
                    />
                    <View style={styles.activityActions}>
                      <Pressable onPress={() => handleOpenEdit(item)} hitSlop={8} style={[styles.activityActionBtn, { backgroundColor: colors.background }]}>
                        <Ionicons name="pencil" size={12} color={colors.primary} />
                      </Pressable>
                      <Pressable onPress={() => handleDeleteItem(item)} hitSlop={8} style={[styles.activityActionBtn, { backgroundColor: colors.background }]}>
                        <Ionicons name="trash-outline" size={12} color={colors.error} />
                      </Pressable>
                    </View>
                  </Animated.View>
                );
              })}

              {/* View More History Expansion Toggles */}
              {unifiedTimelineFeed.length > 5 && (
                <Pressable
                  onPress={() => setIsExpandedView(!isExpandedView)}
                  style={[styles.viewAllToggleBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.viewAllToggleText, { color: colors.primary }]}>
                    {isExpandedView ? "Show Less" : `View Rest (${unifiedTimelineFeed.length - 5} items)`}
                  </Text>
                  <Ionicons 
                    name={isExpandedView ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={colors.primary} 
                  />
                </Pressable>
              )}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Global Entry Modal Context Form */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => { if(showCalendarPicker){setShowCalendarPicker(false)}else{setShowModal(false)} }}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle}><View style={[styles.handleBar, { backgroundColor: colors.border }]} /></View>

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {isLoggingWorkout 
                ? (editingWorkoutId ? "Edit Strength Workout" : "Log Strength Workout") 
                : (editingActivity ? "Edit Activity" : "Add Activity")}
            </Text>

            {isLoggingWorkout ? (
              <View style={{ gap: 14, marginBottom: 16 }}>
                <View>
                  <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Routine Name</Text>
                  <TextInput
                    style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                    value={formWorkoutName}
                    onChangeText={setFormWorkoutName}
                    placeholder="e.g., Push Day Split I"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.modalFormGrid}>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Duration (min)</Text>
                    <TextInput
                      style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]}
                      value={formDuration}
                      onChangeText={setFormDuration}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Date</Text>
                    <Pressable
                      onPress={() => setShowCalendarPicker(!showCalendarPicker)}
                      style={[styles.calendarTriggerField, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <Text style={{ color: colors.textPrimary, fontFamily: Fonts.regular, fontSize: 15 }}>
                        {formWorkoutDate}
                      </Text>
                      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>

                {/* Inline Mini Calendar Module */}
                {showCalendarPicker && (
                  <Animated.View entering={FadeInDown.duration(250)} style={[styles.calendarEmbedContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.calendarControlHeader}>
                      <Pressable onPress={() => changeMonth(-1)} hitSlop={8}>
                        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                      </Pressable>
                      <Text style={[styles.calendarMonthTitle, { color: colors.textPrimary }]}>{currentMonthLabel}</Text>
                      <Pressable onPress={() => changeMonth(1)} hitSlop={8}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
                      </Pressable>
                    </View>

                    <View style={styles.calendarWeekdayRow}>
                      {WEEKDAYS.map((day, idx) => (
                        <Text key={idx} style={[styles.calendarWeekdayLabel, { color: colors.textSecondary }]}>{day}</Text>
                      ))}
                    </View>

                    <View style={styles.calendarGrid}>
                      {monthDays.map((dayObj, idx) => {
                        if (!dayObj) return <View key={`empty-${idx}`} style={styles.calendarDayCell} />;
                        
                        const dateStringIso = dayObj.toISOString().split("T")[0];
                        const isSelected = formWorkoutDate === dateStringIso;

                        return (
                          <Pressable
                            key={dateStringIso}
                            onPress={() => {
                              setFormWorkoutDate(dateStringIso);
                              setShowCalendarPicker(false);
                            }}
                            style={[
                              styles.calendarDayCell,
                              isSelected && { backgroundColor: colors.primary, borderRadius: 8 },
                            ]}
                          >
                            <Text style={[styles.calendarDayText, { 
                              color: isSelected ? "#0A0E1A" : colors.textPrimary,
                              fontFamily: isSelected ? Fonts.bold : Fonts.regular 
                            }]}>
                              {dayObj.getDate()}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </Animated.View>
                )}
              </View>
            ) : (
              <View>
                <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 16 }} contentContainerStyle={{ gap: 8 }}>
                  {ACTIVITY_TYPES.map((type) => (
                    <Pressable key={type.key} onPress={() => setFormType(type.key)} style={[styles.modalTypeChip, { backgroundColor: formType === type.key ? colors.primary : colors.surface, borderColor: formType === type.key ? colors.primary : colors.border }]}>
                      <Ionicons name={type.icon} size={14} color={formType === type.key ? "#0A0E1A" : colors.textSecondary} />
                      <Text style={{ fontFamily: formType === type.key ? Fonts.semiBold : Fonts.medium, fontSize: 12, color: formType === type.key ? "#0A0E1A" : colors.textSecondary }}>{type.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <View style={styles.modalFormGrid}>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Duration (min)</Text>
                    <TextInput style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} value={formDuration} onChangeText={setFormDuration} keyboardType="numeric" />
                  </View>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Distance (km)</Text>
                    <TextInput style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} value={formDistance} onChangeText={setFormDistance} keyboardType="numeric" />
                  </View>
                </View>

                <View style={styles.modalFormGrid}>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Steps</Text>
                    <TextInput style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} value={formSteps} onChangeText={setFormSteps} keyboardType="numeric" />
                  </View>
                  <View style={styles.modalFormCol}>
                    <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Calories</Text>
                    <TextInput style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border }]} value={formCalories} onChangeText={setFormCalories} keyboardType="numeric" />
                  </View>
                </View>
              </View>
            )}

            <Pressable onPress={handleSaveData} style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.modalSaveBtnText}>
                {isLoggingWorkout 
                  ? (editingWorkoutId ? "Update Log" : "Log Workout") 
                  : (editingActivity ? "Update Activity" : "Add Activity")}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  screenTitle: { fontFamily: Fonts.bold, fontSize: 28 },
  addBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modeTabsContainer: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, marginBottom: 16 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 9 },
  modeTabText: { fontSize: 14 },
  pillsScroll: { flexGrow: 0, marginBottom: 20 },
  pillsContent: { gap: 10, paddingRight: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1 },
  pillText: { fontSize: 13 },
  mapCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24, overflow: "hidden" },
  statsSection: { marginBottom: 32 },
  distanceContainer: { alignItems: "center", marginBottom: 20 },
  distanceLabel: { fontFamily: Fonts.medium, fontSize: 14, marginBottom: 4 },
  distanceValue: { fontFamily: Fonts.bold, fontSize: 48 },
  distanceUnit: { fontSize: 20, fontFamily: Fonts.medium },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 24 },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: { fontFamily: Fonts.medium, fontSize: 12, marginBottom: 4 },
  statValue: { fontFamily: Fonts.bold, fontSize: 18 },
  statDivider: { width: 1, height: 36 },
  recentSection: { marginTop: 4 },
  activityList: { gap: 12 },
  cardContainer: { position: "relative" },
  strengthCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, gap: 14 },
  strengthIconFrame: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", flex: 1, paddingRight: 64 },
  strengthTitle: { fontFamily: Fonts.bold, fontSize: 15, flex: 1, marginRight: 8 },
  strengthDate: { fontFamily: Fonts.medium, fontSize: 12 },
  strengthMeta: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 4, alignItems: 'center' },
  activityActions: { position: "absolute", top: 24, right: 12, flexDirection: "row", gap: 4 },
  activityActionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(128,128,128,0.15)" },
  viewAllToggleBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 4, borderStyle: "dashed" },
  viewAllToggleText: { fontFamily: Fonts.semiBold, fontSize: 14 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40, borderRadius: 16, borderWidth: 1 },
  emptyText: { fontFamily: Fonts.semiBold, fontSize: 16, marginTop: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  modalHandle: { alignItems: "center", marginBottom: 16 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  modalTitle: { fontFamily: Fonts.bold, fontSize: 20, marginBottom: 20, textAlign: "center" },
  modalLabel: { fontFamily: Fonts.medium, fontSize: 12, marginBottom: 6 },
  modalTypeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1 },
  modalFormGrid: { flexDirection: "row", gap: 12, marginBottom: 14 },
  modalFormCol: { flex: 1 },
  modalInput: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontFamily: Fonts.regular, fontSize: 15 },
  calendarTriggerField: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calendarEmbedContainer: { borderWidth: 1, borderRadius: 16, padding: 12, marginTop: -4, marginBottom: 10, gap: 10 },
  calendarControlHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4 },
  calendarMonthTitle: { fontFamily: Fonts.semiBold, fontSize: 14 },
  calendarWeekdayRow: { flexDirection: "row", justifyContent: "space-around" },
  calendarWeekdayLabel: { fontFamily: Fonts.medium, fontSize: 11, width: 32, textAlign: "center" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 6 },
  calendarDayCell: { width: `${100 / 7}%`, height: 32, alignItems: "center", justifyContent: "center" },
  calendarDayText: { fontSize: 13 },
  modalSaveBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 10 },
  modalSaveBtnText: { fontFamily: Fonts.semiBold, fontSize: 16, color: "#0A0E1A" },
});