import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  AppState,
  AppStateStatus,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { ActionButton } from "@/components/action-button";
import { WorkoutCard } from "@/components/workout-card";
import { ProgressRing } from "@/components/progress-ring";
import { SectionHeader } from "@/components/section-header";
import type { ExerciseSet, Difficulty } from "@/store/types";

type CategoryFilter = "all" | "strength" | "cardio" | "hiit" | "yoga" | "stretching";

const CATEGORY_FILTERS: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Strength", value: "strength" },
  { label: "Cardio", value: "cardio" },
  { label: "HIIT", value: "hiit" },
  { label: "Yoga", value: "yoga" },
  { label: "Stretching", value: "stretching" },
];

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function mapDifficulty(difficulty: Difficulty): "Beginner" | "Intermediate" | "Advanced" {
  switch (difficulty) {
    case "easy": return "Beginner";
    case "medium": return "Intermediate";
    case "hard":
    case "extreme": return "Advanced";
  }
}

interface SetCompletion {
  [exerciseIndex: number]: {
    [setIndex: number]: boolean;
  };
}

export default function WorkoutsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const workoutTemplates = useAppStore((state) => state.workoutTemplates);
  const addWorkout = useAppStore((state) => state.addWorkout);

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [setCompletions, setSetCompletions] = useState<SetCompletion>({});
  const [repsInput, setRepsInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  const workoutIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const soundObjectRef = useRef<Audio.Sound | null>(null);
  const restEndTimeRef = useRef<number | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const activeTemplate = activeWorkoutId
    ? workoutTemplates.find((t) => t.id === activeWorkoutId) ?? null
    : null;

  const currentExercise = activeTemplate
    ? activeTemplate.exercises[currentExerciseIndex] ?? null
    : null;

  async function playTimerEndSound() {
    try {
      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
      }

      // @ts-ignore - Direct inline override bypassing declaration file requirements
      const localSoundAsset = require("@/assets/sounds/timer-beep.mp3");

      const { sound } = await Audio.Sound.createAsync(localSoundAsset);
      soundObjectRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.log("Error handling workout timer audio:", error);
    }
  }

  useEffect(() => {
    return () => {
      if (soundObjectRef.current) {
        soundObjectRef.current.unloadAsync();
      }
    };
  }, []);

  // Workout duration timer
  useEffect(() => {
    if (activeWorkoutId) {
      workoutIntervalRef.current = setInterval(() => {
        setWorkoutDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (workoutIntervalRef.current) {
        clearInterval(workoutIntervalRef.current);
        workoutIntervalRef.current = null;
      }
    };
  }, [activeWorkoutId]);

  // Rest timer countdown tracking via Delta Timestamps
  useEffect(() => {
    if (restTimerActive && restTimeRemaining > 0) {
      if (!restEndTimeRef.current) {
        restEndTimeRef.current = Date.now() + restTimeRemaining * 1000;
      }

      restIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const distance = restEndTimeRef.current! - now;
        const calculatedSecondsLeft = Math.ceil(distance / 1000);

        if (calculatedSecondsLeft <= 0) {
          setRestTimerActive(false);
          setRestTimeRemaining(0);
          restEndTimeRef.current = null;
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          playTimerEndSound();
        } else {
          setRestTimeRemaining(calculatedSecondsLeft);
        }
      }, 1000);
    }
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    };
  }, [restTimerActive, restTimeRemaining]);

  // Foreground app cycle re-synchronization state hook
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        if (restTimerActive && restEndTimeRef.current) {
          const now = Date.now();
          const distance = restEndTimeRef.current - now;
          const remaining = Math.ceil(distance / 1000);

          if (remaining <= 0) {
            setRestTimeRemaining(0);
            setRestTimerActive(false);
            restEndTimeRef.current = null;
            playTimerEndSound();
          } else {
            setRestTimeRemaining(remaining);
          }
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [restTimerActive]);

  // Handle runtime micro-adjustments to the active rest clock
  const adjustRestTime = useCallback((amountInSeconds: number) => {
    if (!restTimerActive) return;

    setRestTimeRemaining((prev) => {
      const newTime = Math.max(0, prev + amountInSeconds);
      
      if (newTime === 0) {
        restEndTimeRef.current = null;
        setRestTimerActive(false);
      } else {
        restEndTimeRef.current = Date.now() + newTime * 1000;
      }
      
      return newTime;
    });
  }, [restTimerActive]);

  const startWorkout = useCallback((templateId: string) => {
    setActiveWorkoutId(templateId);
    setCurrentExerciseIndex(0);
    setWorkoutDuration(0);
    setRestTimerActive(false);
    setRestTimeRemaining(0);
    restEndTimeRef.current = null;
    setSetCompletions({});
    setRepsInput("");
    setWeightInput("");
  }, []);

  const finishWorkout = useCallback(() => {
    if (!activeTemplate) return;

    const totalCalories = Math.round(workoutDuration / 60) * 8;

    addWorkout({
      id: `workout-${Date.now()}`,
      name: activeTemplate.name,
      category: activeTemplate.category,
      duration: Math.round(workoutDuration / 60),
      exercises: activeTemplate.exercises,
      caloriesBurned: totalCalories,
      notes: "",
      isFavorite: false,
      completedAt: new Date().toISOString(),
    });

    setActiveWorkoutId(null);
    setCurrentExerciseIndex(0);
    setWorkoutDuration(0);
    setRestTimerActive(false);
    setRestTimeRemaining(0);
    restEndTimeRef.current = null;
    setSetCompletions({});
  }, [activeTemplate, workoutDuration, addWorkout]);

  const completeSet = useCallback(() => {
    if (!currentExercise) return;

    const nextIncompleteSet = currentExercise.sets.findIndex(
      (_, idx) => !setCompletions[currentExerciseIndex]?.[idx]
    );

    if (nextIncompleteSet === -1) return;

    setSetCompletions((prev) => ({
      ...prev,
      [currentExerciseIndex]: {
        ...(prev[currentExerciseIndex] ?? {}),
        [nextIncompleteSet]: true,
      },
    }));

    if (currentExercise.restTime > 0) {
      restEndTimeRef.current = Date.now() + currentExercise.restTime * 1000;
      setRestTimeRemaining(currentExercise.restTime);
      setRestTimerActive(true);
    }

    setRepsInput("");
    setWeightInput("");
  }, [currentExercise, currentExerciseIndex, setCompletions]);

  const goToPreviousExercise = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setRestTimerActive(false);
      setRestTimeRemaining(0);
      restEndTimeRef.current = null;
    }
  }, [currentExerciseIndex]);

  const goToNextExercise = useCallback(() => {
    if (activeTemplate && currentExerciseIndex < activeTemplate.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      setRestTimerActive(false);
      setRestTimeRemaining(0);
      restEndTimeRef.current = null;
    }
  }, [activeTemplate, currentExerciseIndex]);

  const filteredTemplates = workoutTemplates.filter((template) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "stretching") {
      return template.category === "flexibility" || template.category === "pilates";
    }
    return template.category === selectedCategory;
  });

  // --- Active Workout View Render Block ---
  if (activeTemplate && currentExercise) {
    const totalRestTime = currentExercise.restTime;
    const restProgress = totalRestTime > 0 ? ((totalRestTime - restTimeRemaining) / totalRestTime) * 100 : 0;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Workout Title */}
          <Animated.View entering={FadeInDown.delay(0).duration(400)} style={{ alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontFamily: Fonts.bold, fontSize: 22, color: colors.textPrimary, textAlign: "center" }}>
              {activeTemplate.name}
            </Text>
          </Animated.View>

          {/* Total Duration */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 36, color: colors.primary, fontVariant: ["tabular-nums"] }}>
              {formatTime(workoutDuration)}
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
              Total Duration
            </Text>
          </Animated.View>

          {/* Current Exercise */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + "1A", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Ionicons name="barbell" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.semiBold, fontSize: 18, color: colors.textPrimary }}>
                  {currentExercise.name}
                </Text>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  Exercise {currentExerciseIndex + 1} of {activeTemplate.exercises.length}
                </Text>
              </View>
            </View>

            {/* Sets List */}
            {currentExercise.sets.map((set: ExerciseSet, idx: number) => {
              const isCompleted = setCompletions[currentExerciseIndex]?.[idx] ?? false;
              return (
                <View
                  key={`set-${idx}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    borderTopWidth: idx === 0 ? 1 : 0,
                    borderBottomWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.medium,
                        fontSize: 14,
                        color: isCompleted ? colors.success : colors.textPrimary,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      Set {set.setNumber}: {set.reps} reps{set.weight > 0 ? ` @ ${set.weight}kg` : ""}
                    </Text>
                  </View>
                  {isCompleted && <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
                </View>
              );
            })}

            {/* Input Row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                  Reps
                </Text>
                <TextInput
                  value={repsInput}
                  onChangeText={setRepsInput}
                  placeholder="12"
                  placeholderTextColor={colors.textSecondary + "80"}
                  keyboardType="number-pad"
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: Fonts.medium,
                    fontSize: 16,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    fontVariant: ["tabular-nums"],
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.regular, fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                  Weight (kg)
                </Text>
                <TextInput
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="80"
                  placeholderTextColor={colors.textSecondary + "80"}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: Fonts.medium,
                    fontSize: 16,
                    color: colors.textPrimary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    fontVariant: ["tabular-nums"],
                  }}
                />
              </View>
              <Pressable
                onPress={completeSet}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: colors.success,
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-end",
                }}
              >
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Rest Timer Module with Inline Stepper Row */}
          {restTimerActive && restTimeRemaining > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ alignItems: "center", marginBottom: 24, paddingVertical: 20 }}>
              <Text style={{ fontFamily: Fonts.semiBold, fontSize: 14, color: colors.textSecondary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                Rest Timer
              </Text>
              
              <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
                {/* Decrement Rest Button */}
                <Pressable
                  onPress={() => adjustRestTime(-15)}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="remove" size={20} color={colors.textPrimary} />
                </Pressable>

                <ProgressRing progress={restProgress} size={160} strokeWidth={12} color={colors.accent} backgroundColor={colors.border}>
                  <Text style={{ fontFamily: Fonts.bold, fontSize: 32, color: colors.accent, fontVariant: ["tabular-nums"] }}>
                    {formatTime(restTimeRemaining)}
                  </Text>
                </ProgressRing>

                {/* Increment Rest Button */}
                <Pressable
                  onPress={() => adjustRestTime(15)}
                  style={({ pressed }) => ({
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="add" size={20} color={colors.textPrimary} />
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  setRestTimerActive(false);
                  setRestTimeRemaining(0);
                  restEndTimeRef.current = null;
                }}
                style={{ marginTop: 16 }}
              >
                <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.primary }}>
                  Skip Rest
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Exercise Navigation */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
            <Pressable
              onPress={goToPreviousExercise}
              disabled={currentExerciseIndex === 0}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: currentExerciseIndex === 0 ? 0.4 : pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.textPrimary }}>
                Previous
              </Text>
            </Pressable>
            <Pressable
              onPress={goToNextExercise}
              disabled={currentExerciseIndex === activeTemplate.exercises.length - 1}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: currentExerciseIndex === activeTemplate.exercises.length - 1 ? 0.4 : pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontFamily: Fonts.medium, fontSize: 14, color: colors.textPrimary }}>
                Next
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* Finish Workout Action */}
          <ActionButton title="Finish Workout" icon="checkmark-done" variant="primary" onPress={finishWorkout} />
        </ScrollView>
      </View>
    );
  }

  // --- Master Workouts Directory Template Feed View ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader title="Workout Routines" style={{ marginBottom: 16 }} />

        {/* Category Filters Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20, mx: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = selectedCategory === filter.value;
            return (
              <Pressable
                key={filter.value}
                onPress={() => setSelectedCategory(filter.value)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontFamily: isActive ? Fonts.semiBold : Fonts.medium, fontSize: 13, color: isActive ? "#0A0E1A" : colors.textSecondary }}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredTemplates.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ paddingVertical: 40, alignItems: "center" }}>
            <Ionicons name="clipboard-outline" size={48} color={colors.textSecondary} />
            <Text style={{ fontFamily: Fonts.semiBold, fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: "center" }}>
              No workouts in this category
            </Text>
            <Text style={{ fontFamily: Fonts.regular, fontSize: 14, color: colors.textSecondary, marginTop: 4, textAlign: "center" }}>
              Try selecting a different filter
            </Text>
          </Animated.View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredTemplates.map((template, index) => (
              <Animated.View key={template.id} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
                <WorkoutCard
                  name={template.name}
                  category={template.category}
                  duration={template.estimatedDuration}
                  exercises={template.exercises.length}
                  difficulty={mapDifficulty(template.difficulty)}
                  isFavorite={template.isFavorite}
                  onPress={() => startWorkout(template.id)}
                />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});