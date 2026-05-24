import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import {
  getBPCategory,
  getBPCategoryLabel,
  getBPCategoryColor,
  calculateBPStats,
} from "@/utils/blood-pressure";
import type { BPTimeSlot, BloodPressureReading } from "@/store/types";

export default function HealthVitalsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const bloodPressureReadings = useAppStore((state) => state.bloodPressureReadings);
  const addBloodPressureReading = useAppStore((state) => state.addBloodPressureReading);
  const updateBloodPressureReading = useAppStore((state) => state.updateBloodPressureReading);
  const deleteBloodPressureReading = useAppStore((state) => state.deleteBloodPressureReading);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReading, setEditingReading] = useState<BloodPressureReading | null>(null);
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [timeSlot, setTimeSlot] = useState<BPTimeSlot>("AM");
  const [notes, setNotes] = useState("");

  const stats = calculateBPStats(bloodPressureReadings);

  const resetForm = () => {
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setTimeSlot("AM");
    setNotes("");
    setEditingReading(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (reading: BloodPressureReading) => {
    setEditingReading(reading);
    setSystolic(String(reading.systolic));
    setDiastolic(String(reading.diastolic));
    setPulse(String(reading.pulse));
    setTimeSlot(reading.timeSlot);
    setNotes(reading.notes ?? "");
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Reading", "Are you sure you want to delete this reading?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteBloodPressureReading(id),
      },
    ]);
  };

  const handleSave = () => {
    const sys = Number(systolic);
    const dia = Number(diastolic);
    const pul = Number(pulse);

    if (!sys || sys < 60 || sys > 250) {
      Alert.alert("Error", "Enter a valid systolic value (60-250)");
      return;
    }
    if (!dia || dia < 40 || dia > 150) {
      Alert.alert("Error", "Enter a valid diastolic value (40-150)");
      return;
    }
    if (!pul || pul < 30 || pul > 200) {
      Alert.alert("Error", "Enter a valid pulse value (30-200)");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (editingReading) {
      updateBloodPressureReading(editingReading.id, {
        systolic: sys,
        diastolic: dia,
        pulse: pul,
        timeSlot,
        notes: notes.trim() || undefined,
      });
    } else {
      const reading: BloodPressureReading = {
        id: `bp-${Date.now()}`,
        date: today,
        timeSlot,
        systolic: sys,
        diastolic: dia,
        pulse: pul,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      addBloodPressureReading(reading);
    }

    setShowAddModal(false);
    resetForm();
  };

  const latestReading = bloodPressureReadings[0];
  const latestCategory = latestReading
    ? getBPCategory(latestReading.systolic, latestReading.diastolic)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
            Health Vitals
          </Text>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={() => router.push("/(tabs)/bp-analytics")}
              style={[styles.headerBtn, { backgroundColor: colors.surface }]}
              hitSlop={8}
            >
              <Ionicons name="analytics" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={handleAdd}
              style={[styles.headerBtn, { backgroundColor: colors.primary }]}
              hitSlop={8}
            >
              <Ionicons name="add" size={20} color="#0A0E1A" />
            </Pressable>
          </View>
        </View>

        {/* Latest Reading Card */}
        {latestReading ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.latestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.latestHeader}>
              <Text style={[styles.latestTitle, { color: colors.textPrimary }]}>
                Latest Reading
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: getBPCategoryColor(latestCategory!) + "20" },
                ]}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getBPCategoryColor(latestCategory!) },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: getBPCategoryColor(latestCategory!) },
                  ]}
                >
                  {getBPCategoryLabel(latestCategory!)}
                </Text>
              </View>
            </View>

            <View style={styles.readingValues}>
              <View style={styles.readingItem}>
                <Text style={[styles.readingLabel, { color: colors.textSecondary }]}>
                  Systolic
                </Text>
                <Text style={[styles.readingValue, { color: colors.textPrimary }]}>
                  {latestReading.systolic}
                </Text>
                <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>
                  mmHg
                </Text>
              </View>
              <View style={[styles.readingDivider, { backgroundColor: colors.border }]} />
              <View style={styles.readingItem}>
                <Text style={[styles.readingLabel, { color: colors.textSecondary }]}>
                  Diastolic
                </Text>
                <Text style={[styles.readingValue, { color: colors.textPrimary }]}>
                  {latestReading.diastolic}
                </Text>
                <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>
                  mmHg
                </Text>
              </View>
              <View style={[styles.readingDivider, { backgroundColor: colors.border }]} />
              <View style={styles.readingItem}>
                <Text style={[styles.readingLabel, { color: colors.textSecondary }]}>
                  Pulse
                </Text>
                <Text style={[styles.readingValue, { color: colors.accent }]}>
                  {latestReading.pulse}
                </Text>
                <Text style={[styles.readingUnit, { color: colors.textSecondary }]}>
                  bpm
                </Text>
              </View>
            </View>

            <Text style={[styles.readingMeta, { color: colors.textSecondary }]}>
              {latestReading.date} · {latestReading.timeSlot}
            </Text>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="heart-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No Readings Yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap + to record your first blood pressure reading
            </Text>
          </Animated.View>
        )}

        {/* Stats Summary */}
        {stats && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>
              Averages
            </Text>
            <View style={styles.statsGrid}>
              <StatBox
                label="Systolic"
                value={`${stats.avgSystolic}`}
                subtext={`${stats.minSystolic}-${stats.maxSystolic}`}
                color={colors.primary}
                colors={colors}
              />
              <StatBox
                label="Diastolic"
                value={`${stats.avgDiastolic}`}
                subtext={`${stats.minDiastolic}-${stats.maxDiastolic}`}
                color={colors.success}
                colors={colors}
              />
              <StatBox
                label="Pulse"
                value={`${stats.avgPulse}`}
                subtext={`${stats.minPulse}-${stats.maxPulse}`}
                color={colors.accent}
                colors={colors}
              />
            </View>
          </Animated.View>
        )}

        {/* History */}
        {bloodPressureReadings.length > 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>
                History
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/bp-analytics")} hitSlop={8}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  Analytics
                </Text>
              </Pressable>
            </View>

            {bloodPressureReadings.slice(0, 10).map((reading, index) => {
              const cat = getBPCategory(reading.systolic, reading.diastolic);
              const catColor = getBPCategoryColor(cat);
              return (
                <Animated.View
                  key={reading.id}
                  entering={FadeInDown.delay(350 + index * 50).duration(300)}
                >
                  <Pressable
                    onPress={() => handleEdit(reading)}
                    onLongPress={() => handleDelete(reading.id)}
                    style={[
                      styles.historyRow,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.historyDot, { backgroundColor: catColor }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.historyValues, { color: colors.textPrimary }]}>
                        {reading.systolic}/{reading.diastolic}{" "}
                        <Text style={{ color: colors.accent }}>{reading.pulse} bpm</Text>
                      </Text>
                      <Text style={[styles.historyDate, { color: colors.textSecondary }]}>
                        {reading.date} · {reading.timeSlot}
                        {reading.notes ? ` · ${reading.notes}` : ""}
                      </Text>
                    </View>
                    <View style={styles.historyActions}>
                      <Pressable
                        onPress={() => handleEdit(reading)}
                        hitSlop={8}
                        style={styles.historyActionBtn}
                      >
                        <Ionicons name="pencil" size={14} color={colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(reading.id)}
                        hitSlop={8}
                        style={styles.historyActionBtn}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.error} />
                      </Pressable>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)} />
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
              {editingReading ? "Edit Reading" : "New Reading"}
            </Text>

            {/* Time Slot */}
            <View style={styles.timeSlotRow}>
              {(["AM", "PM"] as BPTimeSlot[]).map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setTimeSlot(slot)}
                  style={[
                    styles.timeSlotBtn,
                    {
                      backgroundColor: timeSlot === slot ? colors.primary : colors.surface,
                      borderColor: timeSlot === slot ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      { color: timeSlot === slot ? "#0A0E1A" : colors.textSecondary },
                    ]}
                  >
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Inputs */}
            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Systolic
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  value={systolic}
                  onChangeText={setSystolic}
                  placeholder="120"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Diastolic
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  value={diastolic}
                  onChangeText={setDiastolic}
                  placeholder="80"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Pulse
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  value={pulse}
                  onChangeText={setPulse}
                  placeholder="72"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Notes */}
            <TextInput
              style={[
                styles.notesInput,
                { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notes (optional)"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Preview category */}
            {systolic.length > 0 && diastolic.length > 0 && Number(systolic) > 0 && Number(diastolic) > 0 ? (
              <View style={styles.previewCategory}>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        getBPCategoryColor(getBPCategory(Number(systolic), Number(diastolic))) + "20",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor: getBPCategoryColor(
                          getBPCategory(Number(systolic), Number(diastolic))
                        ),
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: getBPCategoryColor(
                          getBPCategory(Number(systolic), Number(diastolic))
                        ),
                      },
                    ]}
                  >
                    {getBPCategoryLabel(getBPCategory(Number(systolic), Number(diastolic)))}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Save Button */}
            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.saveButtonText}>
                {editingReading ? "Update Reading" : "Save Reading"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  subtext: string;
  color: string;
  colors: ReturnType<typeof useTheme>["colors"];
}

function StatBox({ label, value, subtext, color, colors }: StatBoxProps) {
  return (
    <View style={[styles.statBox, { borderColor: colors.border }]}>
      <Text style={[styles.statBoxLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
      <Text style={[styles.statBoxSubtext, { color: colors.textSecondary }]}>
        {subtext}
      </Text>
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
  screenTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  latestCard: {
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  latestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  latestTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  readingValues: {
    flexDirection: "row",
    alignItems: "center",
  },
  readingItem: {
    flex: 1,
    alignItems: "center",
  },
  readingLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 4,
  },
  readingValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
  },
  readingUnit: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    marginTop: 2,
  },
  readingDivider: {
    width: 1,
    height: 40,
  },
  readingMeta: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  emptyCard: {
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    marginTop: 12,
  },
  emptySubtext: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  statsCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  statsTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  statBoxLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    marginBottom: 4,
  },
  statBoxValue: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  statBoxSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    marginTop: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
  },
  seeAllText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyValues: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontVariant: ["tabular-nums"],
  },
  historyDate: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  historyActions: {
    flexDirection: "row",
    gap: 8,
  },
  historyActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  // Modal
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
  timeSlotRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  timeSlotBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeSlotText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  inputGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    textAlign: "center",
  },
  notesInput: {
    height: 44,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginBottom: 14,
  },
  previewCategory: {
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: "#0A0E1A",
  },
});
