import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/useAppStore';
import { Fonts } from '@/constants/Typography';
import { ActionButton } from '@/components/action-button';
import type { FitnessGoal, UserProfile } from '@/store/types';

const BACKGROUND = '#0A0E1A';
const SURFACE = '#141824';
const PRIMARY = '#00E5FF';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8A8FA8';
const BORDER = '#1E2438';

const TOTAL_STEPS = 4;

const FITNESS_GOALS: { key: FitnessGoal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'lose_weight', label: 'Lose Weight', icon: 'flame-outline' },
  { key: 'build_muscle', label: 'Build Muscle', icon: 'barbell-outline' },
  { key: 'improve_endurance', label: 'Improve Endurance', icon: 'heart-outline' },
  { key: 'increase_flexibility', label: 'Increase Flexibility', icon: 'body-outline' },
  { key: 'maintain_fitness', label: 'Maintain Fitness', icon: 'shield-checkmark-outline' },
  { key: 'gain_strength', label: 'Gain Strength', icon: 'trending-up-outline' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUserProfile, loadSampleData, completeOnboarding } = useAppStore();

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>([]);
  const [stepGoal, setStepGoal] = useState(8000);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [waterGoal, setWaterGoal] = useState(2500);

  const handleFinish = useCallback(() => {
    const now = new Date().toISOString();
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim() || 'User',
      age: parseInt(age, 10) || 25,
      gender: 'prefer_not_to_say',
      height: 170,
      weight: 70,
      fitnessLevel: 'beginner',
      fitnessGoals: selectedGoals.length > 0 ? selectedGoals : ['maintain_fitness'],
      dailyCalorieTarget: calorieTarget,
      dailyStepGoal: stepGoal,
      dailyWaterGoal: waterGoal,
      avatarUri: null,
      createdAt: now,
      updatedAt: now,
    };

    setUserProfile(profile);
    loadSampleData();
    completeOnboarding();
    router.replace('/(tabs)');
  }, [name, age, selectedGoals, calorieTarget, stepGoal, waterGoal, setUserProfile, loadSampleData, completeOnboarding, router]);

  const handleContinue = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [step, handleFinish]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  const toggleGoal = (goal: FitnessGoal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const renderStepDots = () => (
    <View style={styles.dotsContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === step ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderWelcome = () => (
    <Animated.View
      key="welcome"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(200)}
      style={styles.stepContent}
    >
      <View style={styles.welcomeIconContainer}>
        <Ionicons name="fitness-outline" size={96} color={PRIMARY} />
      </View>
      <Text style={styles.welcomeTitle}>Welcome to FitTrack Pro</Text>
      <Text style={styles.welcomeSubtitle}>
        Your personal fitness companion. Track workouts, set goals, and achieve your best self.
      </Text>
    </Animated.View>
  );

  const renderPersonalInfo = () => (
    <Animated.View
      key="personal"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(200)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Personal Info</Text>
      <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Your name"
          placeholderTextColor={TEXT_SECONDARY}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Age</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Your age"
          placeholderTextColor={TEXT_SECONDARY}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
        />
      </View>
    </Animated.View>
  );

  const renderFitnessGoals = () => (
    <Animated.View
      key="goals"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(200)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Fitness Goals</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      <View style={styles.goalsGrid}>
        {FITNESS_GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.key);
          return (
            <Pressable
              key={goal.key}
              onPress={() => toggleGoal(goal.key)}
              style={[
                styles.goalCard,
                isSelected && styles.goalCardSelected,
              ]}
            >
              <Ionicons
                name={goal.icon}
                size={28}
                color={isSelected ? PRIMARY : TEXT_SECONDARY}
              />
              <Text
                style={[
                  styles.goalLabel,
                  isSelected && styles.goalLabelSelected,
                ]}
              >
                {goal.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );

  const renderTargetRow = (
    label: string,
    value: number,
    unit: string,
    increment: number,
    onDecrease: () => void,
    onIncrease: () => void
  ) => (
    <View style={styles.targetRow}>
      <Text style={styles.targetLabel}>{label}</Text>
      <View style={styles.targetControls}>
        <Pressable
          onPress={onDecrease}
          style={styles.targetButton}
          hitSlop={8}
        >
          <Ionicons name="remove" size={22} color={TEXT_PRIMARY} />
        </Pressable>
        <View style={styles.targetValueContainer}>
          <Text style={styles.targetValue}>{value.toLocaleString()}</Text>
          <Text style={styles.targetUnit}>{unit}</Text>
        </View>
        <Pressable
          onPress={onIncrease}
          style={styles.targetButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={22} color={TEXT_PRIMARY} />
        </Pressable>
      </View>
    </View>
  );

  const renderDailyTargets = () => (
    <Animated.View
      key="targets"
      entering={FadeInRight.duration(300)}
      exiting={FadeOutLeft.duration(200)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Daily Targets</Text>
      <Text style={styles.stepSubtitle}>Set your daily fitness targets</Text>
      <View style={styles.targetsContainer}>
        {renderTargetRow(
          'Step Goal',
          stepGoal,
          'steps',
          1000,
          () => setStepGoal((v) => Math.max(1000, v - 1000)),
          () => setStepGoal((v) => v + 1000)
        )}
        {renderTargetRow(
          'Calorie Target',
          calorieTarget,
          'kcal',
          100,
          () => setCalorieTarget((v) => Math.max(500, v - 100)),
          () => setCalorieTarget((v) => v + 100)
        )}
        {renderTargetRow(
          'Water Goal',
          waterGoal,
          'ml',
          250,
          () => setWaterGoal((v) => Math.max(500, v - 250)),
          () => setWaterGoal((v) => v + 250)
        )}
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return renderWelcome();
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderFitnessGoals();
      case 3:
        return renderDailyTargets();
      default:
        return null;
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          {renderStepDots()}
          <Pressable onPress={handleSkip} style={styles.skipButton} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.footer}>
          <ActionButton
            title={isLastStep ? 'Get Started' : 'Continue'}
            onPress={handleContinue}
            variant="primary"
            icon={isLastStep ? 'rocket-outline' : 'arrow-forward-outline'}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderCurve: 'continuous',
  },
  dotActive: {
    backgroundColor: PRIMARY,
    width: 24,
  },
  dotInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  skipButton: {
    position: 'absolute',
    right: 24,
    top: 16,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  // Welcome step
  welcomeIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderCurve: 'continuous',
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  // Step titles
  stepTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  // Personal Info
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    height: 52,
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 16,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  // Fitness Goals
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  goalCard: {
    width: '47%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  goalCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  goalLabel: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: PRIMARY,
  },
  // Daily Targets
  targetsContainer: {
    width: '100%',
    gap: 24,
  },
  targetRow: {
    width: '100%',
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderCurve: 'continuous',
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  targetLabel: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  targetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  targetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetValueContainer: {
    alignItems: 'center',
    minWidth: 100,
  },
  targetValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: PRIMARY,
  },
  targetUnit: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
});
