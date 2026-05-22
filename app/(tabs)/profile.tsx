import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { SectionHeader } from "@/components/section-header";
import { AchievementBadge } from "@/components/achievement-badge";

const SAMPLE_BADGES = [
  { id: "1", title: "First Steps", icon: "footsteps" as const, isUnlocked: true, description: "Complete your first walk" },
  { id: "2", title: "Iron Will", icon: "barbell" as const, isUnlocked: true, description: "10 workouts completed" },
  { id: "3", title: "Speed Demon", icon: "flash" as const, isUnlocked: true, description: "Run under 5 min/km" },
  { id: "4", title: "Hydrated", icon: "water" as const, isUnlocked: false, description: "7-day water streak" },
  { id: "5", title: "Early Bird", icon: "sunny" as const, isUnlocked: false, description: "5 morning workouts" },
  { id: "6", title: "Marathon", icon: "trophy" as const, isUnlocked: false, description: "Run 42 km total" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggle } = useTheme();
  const userProfile = useAppStore((state) => state.userProfile);
  const workouts = useAppStore((state) => state.workouts);
  const activities = useAppStore((state) => state.activities);
  const streaks = useAppStore((state) => state.streaks);
  const achievements = useAppStore((state) => state.achievements);

  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [notifications, setNotifications] = useState(true);

  const name = userProfile?.name ?? "Alex Johnson";
  const fitnessLevel = userProfile?.fitnessLevel ?? "intermediate";
  const stepGoal = userProfile?.dailyStepGoal ?? 10000;
  const calorieTarget = userProfile?.dailyCalorieTarget ?? 2200;
  const waterGoal = userProfile?.dailyWaterGoal ?? 2500;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalWorkouts = workouts.length;
  const totalDistance = activities.reduce((sum, a) => sum + (a.distance ?? 0), 0);
  const bestStreak = streaks.longestStreak;

  const displayBadges =
    achievements.length > 0
      ? achievements.slice(0, 6)
      : SAMPLE_BADGES;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        style={styles.avatarSection}
      >
        <View
          style={[
            styles.avatarOuter,
            {
              borderColor: colors.primary,
            },
          ]}
        >
          <View
            style={[
              styles.avatarInner,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: colors.primary, fontFamily: Fonts.bold },
              ]}
            >
              {initials}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.nameText,
            { color: colors.textPrimary, fontFamily: Fonts.bold },
          ]}
        >
          {name}
        </Text>

        <View
          style={[
            styles.badge,
            { backgroundColor: colors.primary + "1A", borderColor: colors.primary + "40" },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: colors.primary, fontFamily: Fonts.semiBold },
            ]}
          >
            {fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)}
          </Text>
        </View>
      </Animated.View>

      {/* Stats Row */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.statsCard, { backgroundColor: colors.surface }]}
      >
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: colors.textPrimary, fontFamily: Fonts.bold },
            ]}
          >
            {totalWorkouts}
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: colors.textSecondary, fontFamily: Fonts.regular },
            ]}
          >
            Workouts
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: colors.textPrimary, fontFamily: Fonts.bold },
            ]}
          >
            {totalDistance.toFixed(1)} km
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: colors.textSecondary, fontFamily: Fonts.regular },
            ]}
          >
            Distance
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text
            style={[
              styles.statValue,
              { color: colors.textPrimary, fontFamily: Fonts.bold },
            ]}
          >
            {bestStreak} days
          </Text>
          <Text
            style={[
              styles.statLabel,
              { color: colors.textSecondary, fontFamily: Fonts.regular },
            ]}
          >
            Best Streak
          </Text>
        </View>
      </Animated.View>

      {/* Daily Goals Section */}
      <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
        <SectionHeader title="Daily Goals" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <SettingsRow
            icon="footsteps"
            label="Step Goal"
            value={stepGoal.toLocaleString()}
            colors={colors}
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="flame"
            label="Calorie Target"
            value={`${calorieTarget.toLocaleString()} kcal`}
            colors={colors}
          />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <SettingsRow
            icon="water"
            label="Water Goal"
            value={`${waterGoal} ml`}
            colors={colors}
          />
        </View>
      </Animated.View>

      {/* Preferences Section */}
      <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
        <SectionHeader title="Preferences" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: colors.textPrimary, fontFamily: Fonts.medium },
                ]}
              >
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

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          <Pressable
            style={styles.settingsRow}
            onPress={() => setUnits(units === "metric" ? "imperial" : "metric")}
            android_ripple={{ color: colors.primary + "20" }}
          >
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="speedometer"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: colors.textPrimary, fontFamily: Fonts.medium },
                ]}
              >
                Units
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                { color: colors.textSecondary, fontFamily: Fonts.regular },
              ]}
            >
              {units === "metric" ? "Metric" : "Imperial"}
            </Text>
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          <View style={styles.settingsRow}>
            <View style={styles.settingsRowLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color={colors.primary}
                style={styles.rowIcon}
              />
              <Text
                style={[
                  styles.rowLabel,
                  { color: colors.textPrimary, fontFamily: Fonts.medium },
                ]}
              >
                Notifications
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </Animated.View>

      {/* Account Section */}
      <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
        <SectionHeader title="Account" />
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <AccountRow icon="person" label="Edit Profile" colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <AccountRow icon="download" label="Export Data" colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />
          <AccountRow icon="information-circle" label="About" colors={colors} />
        </View>
      </Animated.View>

      {/* Achievement Badges */}
      <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.section}>
        <SectionHeader title="Achievements" onSeeAll={() => {}} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesContainer}
          style={{ flexGrow: 0 }}
        >
          {displayBadges.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <AchievementBadge
                title={badge.title}
                icon={badge.icon as keyof typeof Ionicons.glyphMap}
                isUnlocked={badge.isUnlocked}
                description={badge.description}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Version Info */}
      <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.versionSection}>
        <Text
          style={[
            styles.versionText,
            { color: colors.textSecondary, fontFamily: Fonts.regular },
          ]}
        >
          FitTrack Pro v1.0.0
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}

function SettingsRow({ icon, label, value, colors }: SettingsRowProps) {
  return (
    <View style={styles.settingsRow}>
      <View style={styles.settingsRowLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
          style={styles.rowIcon}
        />
        <Text
          style={[
            styles.rowLabel,
            { color: colors.textPrimary, fontFamily: Fonts.medium },
          ]}
        >
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.rowValue,
          { color: colors.textSecondary, fontFamily: Fonts.regular },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

interface AccountRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
}

function AccountRow({ icon, label, colors }: AccountRowProps) {
  return (
    <Pressable
      style={styles.settingsRow}
      android_ripple={{ color: colors.primary + "20" }}
    >
      <View style={styles.settingsRowLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
          style={styles.rowIcon}
        />
        <Text
          style={[
            styles.rowLabel,
            { color: colors.textPrimary, fontFamily: Fonts.medium },
          ]}
        >
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
  },
  nameText: {
    fontSize: 22,
    marginTop: 14,
  },
  badge: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderCurve: "continuous",
  },
  badgeText: {
    fontSize: 13,
  },
  statsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  card: {
    marginTop: 12,
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
  rowIcon: {
    marginRight: 12,
    width: 24,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 14,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  badgesContainer: {
    paddingTop: 12,
    paddingHorizontal: 4,
    gap: 10,
  },
  badgeItem: {
    marginRight: 0,
  },
  versionSection: {
    alignItems: "center",
    marginTop: 32,
  },
  versionText: {
    fontSize: 12,
  },
});
