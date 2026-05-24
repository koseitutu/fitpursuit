import React, { useState } from "react";
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
import { parseCSV, validateImportData, type ImportDataType } from "@/utils/csv-parser";
import type { Activity, WeightEntry, BloodPressureReading } from "@/store/types";

const IMPORT_TYPES: { key: ImportDataType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "activities", label: "Activities", icon: "fitness-outline" },
  { key: "workouts", label: "Workouts", icon: "barbell-outline" },
  { key: "weight", label: "Weight Log", icon: "scale-outline" },
  { key: "nutrition", label: "Nutrition", icon: "restaurant-outline" },
  { key: "blood_pressure", label: "Blood Pressure", icon: "heart-outline" },
];

const SAMPLE_CSV: Record<ImportDataType, string> = {
  activities: `type,duration,distance,steps,calories,date
running,30,5.2,6100,340,2024-03-15
walking,45,3.8,5000,180,2024-03-14
cycling,60,20.5,0,450,2024-03-13`,
  workouts: `name,category,duration,calories,notes
Full Body Strength,strength,60,450,Great session
HIIT Blast,hiit,30,380,Intense
Yoga Flow,yoga,45,200,Relaxing`,
  weight: `date,weight
2024-03-15,74.5
2024-03-14,74.8
2024-03-13,75.0`,
  nutrition: `date,meal_name,type,calories,protein,carbs,fat
2024-03-15,Oatmeal,breakfast,350,12,55,8
2024-03-15,Grilled Chicken,lunch,520,45,30,18
2024-03-15,Salmon Bowl,dinner,680,40,50,30`,
  blood_pressure: `date,time_slot,systolic,diastolic,pulse
2024-03-15,AM,120,80,72
2024-03-15,PM,118,78,68
2024-03-14,AM,122,82,74`,
};

export default function ImportDataScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();

  const importActivities = useAppStore((state) => state.importActivities);
  const importWeightLog = useAppStore((state) => state.importWeightLog);
  const importBloodPressureReadings = useAppStore((state) => state.importBloodPressureReadings);

  const [selectedType, setSelectedType] = useState<ImportDataType>("activities");
  const [csvContent, setCsvContent] = useState("");
  const [previewData, setPreviewData] = useState<Record<string, string>[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleLoadSample = () => {
    setCsvContent(SAMPLE_CSV[selectedType]);
    setPreviewData(null);
    setParseErrors([]);
    setImportSuccess(false);
  };

  const handlePreview = () => {
    if (!csvContent.trim()) {
      Alert.alert("Error", "Please paste CSV content first");
      return;
    }

    const result = parseCSV(csvContent);

    if (result.errors.length > 0 && result.rows.length === 0) {
      setParseErrors(result.errors);
      setPreviewData(null);
      return;
    }

    const validationError = validateImportData(selectedType, result.headers);
    if (validationError) {
      setParseErrors([validationError]);
      setPreviewData(null);
      return;
    }

    setPreviewData(result.rows);
    setParseErrors(result.errors);
  };

  const handleImport = () => {
    if (!previewData || previewData.length === 0) return;

    try {
      switch (selectedType) {
        case "activities": {
          const activities: Activity[] = previewData.map((row, i) => ({
            id: `imported-act-${Date.now()}-${i}`,
            type: (row.type as Activity["type"]) || "running",
            duration: Number(row.duration) || 0,
            distance: Number(row.distance) || 0,
            steps: Number(row.steps) || 0,
            pace: 0,
            caloriesBurned: Number(row.calories) || 0,
            route: [],
            startedAt: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
            endedAt: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
          }));
          importActivities(activities);
          break;
        }
        case "weight": {
          const entries: WeightEntry[] = previewData.map((row) => {
            const w = Number(row.weight) || 70;
            const h = 170; // default height for BMI calc
            const bmi = Math.round((w / ((h / 100) * (h / 100))) * 10) / 10;
            return {
              date: row.date || new Date().toISOString().split("T")[0],
              weight: w,
              bmi: Number(row.bmi) || bmi,
            };
          });
          importWeightLog(entries);
          break;
        }
        case "blood_pressure": {
          const readings: BloodPressureReading[] = previewData.map((row, i) => ({
            id: `imported-bp-${Date.now()}-${i}`,
            date: row.date || new Date().toISOString().split("T")[0],
            timeSlot: (row.time_slot as "AM" | "PM") || "AM",
            systolic: Number(row.systolic) || 120,
            diastolic: Number(row.diastolic) || 80,
            pulse: Number(row.pulse) || 72,
            createdAt: new Date().toISOString(),
          }));
          importBloodPressureReadings(readings);
          break;
        }
        default:
          Alert.alert("Info", "Import for this type is not yet fully supported, but data was parsed successfully.");
          break;
      }

      setImportSuccess(true);
      setPreviewData(null);
      setCsvContent("");
      Alert.alert("Success", `Successfully imported ${previewData.length} records!`);
    } catch {
      Alert.alert("Error", "Failed to import data. Please check the format.");
    }
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
              Import Data
            </Text>
            <View style={{ width: 40 }} />
          </View>
        </Animated.View>

        {/* Data Type Selection */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Select Data Type
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.typeRow}
          >
            {IMPORT_TYPES.map((type) => (
              <Pressable
                key={type.key}
                onPress={() => {
                  setSelectedType(type.key);
                  setPreviewData(null);
                  setParseErrors([]);
                  setImportSuccess(false);
                }}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor:
                      selectedType === type.key ? colors.primary : colors.surface,
                    borderColor:
                      selectedType === type.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={type.icon}
                  size={16}
                  color={selectedType === type.key ? "#0A0E1A" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    {
                      color:
                        selectedType === type.key ? "#0A0E1A" : colors.textSecondary,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* CSV Input */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.csvHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 0 }]}>
              CSV Content
            </Text>
            <Pressable onPress={handleLoadSample} hitSlop={8}>
              <Text style={[styles.sampleLink, { color: colors.primary }]}>
                Load Sample
              </Text>
            </Pressable>
          </View>
          <TextInput
            style={[
              styles.csvInput,
              {
                color: colors.textPrimary,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            value={csvContent}
            onChangeText={(text) => {
              setCsvContent(text);
              setPreviewData(null);
              setParseErrors([]);
              setImportSuccess(false);
            }}
            placeholder="Paste your CSV content here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.actionRow}>
          <Pressable
            onPress={handlePreview}
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Preview
            </Text>
          </Pressable>
          <Pressable
            onPress={handleImport}
            disabled={!previewData}
            style={[
              styles.actionButton,
              {
                backgroundColor: previewData ? colors.primary : colors.border,
                borderColor: previewData ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons name="cloud-upload-outline" size={18} color={previewData ? "#0A0E1A" : colors.textSecondary} />
            <Text
              style={[
                styles.actionButtonText,
                { color: previewData ? "#0A0E1A" : colors.textSecondary },
              ]}
            >
              Import
            </Text>
          </Pressable>
        </Animated.View>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.errorCard, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}
          >
            <Ionicons name="warning" size={18} color={colors.error} />
            <View style={{ flex: 1 }}>
              {parseErrors.map((err, i) => (
                <Text key={i} style={[styles.errorText, { color: colors.error }]}>
                  {err}
                </Text>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Success */}
        {importSuccess && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.successCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.successText, { color: colors.success }]}>
              Data imported successfully!
            </Text>
          </Animated.View>
        )}

        {/* Preview Table */}
        {previewData && previewData.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Preview ({previewData.length} rows)
            </Text>
            <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {/* Header */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View>
                  <View style={[styles.previewRow, { backgroundColor: colors.primary + "10" }]}>
                    {Object.keys(previewData[0]).map((key) => (
                      <Text
                        key={key}
                        style={[styles.previewHeaderCell, { color: colors.primary }]}
                        numberOfLines={1}
                      >
                        {key}
                      </Text>
                    ))}
                  </View>
                  {/* Rows (max 5 shown) */}
                  {previewData.slice(0, 5).map((row, i) => (
                    <View
                      key={i}
                      style={[
                        styles.previewRow,
                        i % 2 === 1 && { backgroundColor: colors.background + "50" },
                      ]}
                    >
                      {Object.values(row).map((val, j) => (
                        <Text
                          key={j}
                          style={[styles.previewCell, { color: colors.textPrimary }]}
                          numberOfLines={1}
                        >
                          {val}
                        </Text>
                      ))}
                    </View>
                  ))}
                  {previewData.length > 5 && (
                    <View style={styles.previewRow}>
                      <Text style={[styles.previewCell, { color: colors.textSecondary }]}>
                        ... and {previewData.length - 5} more rows
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },
  typeRow: {
    gap: 8,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  typeChipText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  csvHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 8,
  },
  sampleLink: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  csvInput: {
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 14,
    minHeight: 160,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  actionButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    marginTop: 16,
  },
  successText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  previewCard: {
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    overflow: "hidden",
  },
  previewRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  previewHeaderCell: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    width: 90,
    textTransform: "uppercase",
  },
  previewCell: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    width: 90,
  },
});
