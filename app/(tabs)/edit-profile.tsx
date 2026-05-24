import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import type { Gender, FitnessLevel, FitnessGoal } from "@/store/types";

const GENDERS: { key: Gender; label: string }[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "other", label: "Other" },
  { key: "prefer_not_to_say", label: "Prefer not to say" },
];

const FITNESS_LEVELS: { key: FitnessLevel; label: string }[] = [
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
  { key: "elite", label: "Elite" },
];

const FITNESS_GOALS: { key: FitnessGoal; label: string }[] = [
  { key: "lose_weight", label: "Lose Weight" },
  { key: "build_muscle", label: "Build Muscle" },
  { key: "improve_endurance", label: "Endurance" },
  { key: "increase_flexibility", label: "Flexibility" },
  { key: "maintain_fitness", label: "Maintain" },
  { key: "gain_strength", label: "Strength" },
];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const userProfile = useAppStore((state) => state.userProfile);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);
  const setUserProfile = useAppStore((state) => state.setUserProfile);
  const addWeightEntry = useAppStore((state) => state.addWeightEntry);

  const [name, setName] = useState(userProfile?.name ?? "");
  const [age, setAge] = useState(String(userProfile?.age ?? ""));
  const [gender, setGender] = useState<Gender>(userProfile?.gender ?? "prefer_not_to_say");
  const [height, setHeight] = useState(String(userProfile?.height ?? ""));
  const [weight, setWeight] = useState(String(userProfile?.weight ?? ""));
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(
    userProfile?.fitnessLevel ?? "intermediate"
  );
  const [fitnessGoals, setFitnessGoals] = useState<FitnessGoal[]>(
    userProfile?.fitnessGoals ?? []
  );
  const [dailyCalories, setDailyCalories] = useState(
    String(userProfile?.dailyCalorieTarget ?? "2200")
  );
  const [dailySteps, setDailySteps] = useState(
    String(userProfile?.dailyStepGoal ?? "10000")
  );
  const [dailyWater, setDailyWater] = useState(
    String(userProfile?.dailyWaterGoal ?? "2500")
  );
  const [newWeightEntry, setNewWeightEntry] = useState("");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAge(String(userProfile.age));
      setGender(userProfile.gender);
      setHeight(String(userProfile.height));
      setWeight(String(userProfile.weight));
      setFitnessLevel(userProfile.fitnessLevel);
      setFitnessGoals(userProfile.fitnessGoals);
      setDailyCalories(String(userProfile.dailyCalorieTarget));
      setDailySteps(String(userProfile.dailyStepGoal));
      setDailyWater(String(userProfile.dailyWaterGoal));
    }
  }, [userProfile]);

  const toggleGoal = (goal: FitnessGoal) => {
    setFitnessGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const calculateBMI = (h: number, w: number) => {
    if (h <= 0 || w <= 0) return 0;
    const heightM = h / 100;
    return Math.round((w / (heightM * heightM)) * 10) / 10;
  };

  const currentBMI = calculateBMI(Number(height), Number(weight));

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    const profileData = {
      id: userProfile?.id ?? `user-${Date.now()}`,
      name: name.trim(),
      age: Number(age) || 25,
      gender,
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      fitnessLevel,
      fitnessGoals,
      dailyCalorieTarget: Number(dailyCalories) || 2200,
      dailyStepGoal: Number(dailySteps) || 10000,
      dailyWaterGoal: Number(dailyWater) || 2500,
      avatarUri: userProfile?.avatarUri ?? null,
      createdAt: userProfile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (userProfile) {
      updateUserProfile(profileData);
    } else {
      setUserProfile(profileData);
    }

    Alert.alert("Success", "Profile saved successfully", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleLogWeight = () => {
    const w = Number(newWeightEntry);
    if (!w || w <= 0) {
      Alert.alert("Error", "Enter a valid weight");
      return;
    }
    const h = Number(height) || 170;
    const bmi = calculateBMI(h, w);
    const today = new Date().toISOString().split("T")[0];

    addWeightEntry({ date: today, weight: w, bmi });
    setWeight(String(w));
    setNewWeightEntry("");
    Alert.alert("Success", `Weight logged: ${w} kg (BMI: ${bmi})`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              Edit Profile
            </Text>
            <Pressable onPress={handleSave} hitSlop={8}>
              <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* BMI Display */}
        {currentBMI > 0 && (
          <Animated.View
            entering={FadeInDown.delay(50).duration(400)}
            style={[styles.bmiCard, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.bmiCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.bmiValue, { color: colors.primary }]}>
                {currentBMI}
              </Text>
              <Text style={[styles.bmiLabel, { color: colors.textSecondary }]}>
                BMI
              </Text>
            </View>
            <Text style={[styles.bmiCategory, { color: colors.textPrimary }]}>
              {currentBMI < 18.5
                ? "Underweight"
                : currentBMI < 25
                  ? "Normal"
                  : currentBMI < 30
                    ? "Overweight"
                    : "Obese"}
            </Text>
          </Animated.View>
        )}

        {/* Personal Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Personal Information
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <InputRow
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InputRow
              label="Age"
              value={age}
              onChangeText={setAge}
              placeholder="25"
              keyboardType="numeric"
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InputRow
              label="Height (cm)"
              value={height}
              onChangeText={setHeight}
              placeholder="170"
              keyboardType="numeric"
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InputRow
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Gender */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Gender
          </Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <Pressable
                key={g.key}
                onPress={() => setGender(g.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      gender === g.key ? colors.primary : colors.surface,
                    borderColor:
                      gender === g.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: gender === g.key ? "#0A0E1A" : colors.textSecondary,
                      fontFamily:
                        gender === g.key ? Fonts.semiBold : Fonts.medium,
                    },
                  ]}
                >
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Fitness Level */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Fitness Level
          </Text>
          <View style={styles.chipRow}>
            {FITNESS_LEVELS.map((fl) => (
              <Pressable
                key={fl.key}
                onPress={() => setFitnessLevel(fl.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      fitnessLevel === fl.key ? colors.primary : colors.surface,
                    borderColor:
                      fitnessLevel === fl.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        fitnessLevel === fl.key ? "#0A0E1A" : colors.textSecondary,
                      fontFamily:
                        fitnessLevel === fl.key ? Fonts.semiBold : Fonts.medium,
                    },
                  ]}
                >
                  {fl.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Fitness Goals */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Fitness Goals
          </Text>
          <View style={styles.chipRow}>
            {FITNESS_GOALS.map((fg) => {
              const selected = fitnessGoals.includes(fg.key);
              return (
                <Pressable
                  key={fg.key}
                  onPress={() => toggleGoal(fg.key)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surface,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selected ? "#0A0E1A" : colors.textSecondary,
                        fontFamily: selected ? Fonts.semiBold : Fonts.medium,
                      },
                    ]}
                  >
                    {fg.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Daily Goals */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Daily Goals
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <InputRow
              label="Step Goal"
              value={dailySteps}
              onChangeText={setDailySteps}
              placeholder="10000"
              keyboardType="numeric"
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InputRow
              label="Calorie Target"
              value={dailyCalories}
              onChangeText={setDailyCalories}
              placeholder="2200"
              keyboardType="numeric"
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <InputRow
              label="Water (ml)"
              value={dailyWater}
              onChangeText={setDailyWater}
              placeholder="2500"
              keyboardType="numeric"
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Log Weight */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Log New Weight
          </Text>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.weightLogRow}>
              <TextInput
                style={[
                  styles.weightInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                value={newWeightEntry}
                onChangeText={setNewWeightEntry}
                placeholder="Enter weight (kg)"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Pressable
                onPress={handleLogWeight}
                style={[styles.logButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.logButtonText}>Log</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Pressable
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="checkmark" size={20} color="#0A0E1A" />
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  colors: ReturnType<typeof useTheme>["colors"];
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  colors,
}: InputRowProps) {
  return (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary + "80"}
        keyboardType={keyboardType}
      />
    </View>
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
    marginBottom: 20,
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
  saveText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  bmiCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 20,
    alignItems: "center",
    marginBottom: 8,
  },
  bmiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  bmiValue: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
  },
  bmiLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  bmiCategory: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    flex: 1,
  },
  input: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlign: "right",
    flex: 1,
    paddingVertical: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  weightLogRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  weightInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.regular,
    fontSize: 15,
  },
  logButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  logButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: "#0A0E1A",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderCurve: "continuous",
    marginTop: 28,
  },
  saveButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#0A0E1A",
  },
});
