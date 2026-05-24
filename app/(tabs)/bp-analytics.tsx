import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import {
  getBPCategory,
  getBPCategoryLabel,
  getBPCategoryColor,
  calculateBPStats,
} from "@/utils/blood-pressure";

type TimeRange = "7d" | "30d" | "all";

function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const cpx1 = current.x + (next.x - current.x) * 0.4;
    const cpy1 = current.y;
    const cpx2 = next.x - (next.x - current.x) * 0.4;
    const cpy2 = next.y;
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${next.x} ${next.y}`;
  }
  return path;
}

export default function BPAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();

  const bloodPressureReadings = useAppStore((state) => state.bloodPressureReadings);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  const filteredReadings = useMemo(() => {
    const now = new Date();
    let cutoff: Date;
    switch (timeRange) {
      case "7d":
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(0);
    }
    return bloodPressureReadings
      .filter((r) => new Date(r.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  }, [bloodPressureReadings, timeRange]);

  const stats = calculateBPStats(filteredReadings);

  // Chart calculations
  const chartPadding = 16;
  const chartWidth = screenWidth - 40 - chartPadding * 2;
  const chartHeight = 180;
  const yAxisWidth = 32;
  const graphWidth = chartWidth - yAxisWidth;
  const graphHeight = chartHeight - 24;

  const systolicPoints = useMemo(() => {
    if (filteredReadings.length < 2) return [];
    const values = filteredReadings.map((r) => r.systolic);
    const min = Math.min(...values) - 10;
    const max = Math.max(...values) + 10;
    const range = max - min || 1;
    return filteredReadings.map((_, i) => ({
      x: yAxisWidth + (i / (filteredReadings.length - 1)) * graphWidth,
      y: graphHeight - ((values[i] - min) / range) * graphHeight + 4,
    }));
  }, [filteredReadings, graphWidth, graphHeight, yAxisWidth]);

  const diastolicPoints = useMemo(() => {
    if (filteredReadings.length < 2) return [];
    const values = filteredReadings.map((r) => r.diastolic);
    const min = Math.min(...values) - 10;
    const max = Math.max(...values) + 10;
    const range = max - min || 1;
    return filteredReadings.map((_, i) => ({
      x: yAxisWidth + (i / (filteredReadings.length - 1)) * graphWidth,
      y: graphHeight - ((values[i] - min) / range) * graphHeight + 4,
    }));
  }, [filteredReadings, graphWidth, graphHeight, yAxisWidth]);

  const pulsePoints = useMemo(() => {
    if (filteredReadings.length < 2) return [];
    const values = filteredReadings.map((r) => r.pulse);
    const min = Math.min(...values) - 10;
    const max = Math.max(...values) + 10;
    const range = max - min || 1;
    return filteredReadings.map((_, i) => ({
      x: yAxisWidth + (i / (filteredReadings.length - 1)) * graphWidth,
      y: graphHeight - ((values[i] - min) / range) * graphHeight + 4,
    }));
  }, [filteredReadings, graphWidth, graphHeight, yAxisWidth]);

  const systolicPath = systolicPoints.length >= 2 ? createSmoothPath(systolicPoints) : "";
  const diastolicPath = diastolicPoints.length >= 2 ? createSmoothPath(diastolicPoints) : "";
  const pulsePath = pulsePoints.length >= 2 ? createSmoothPath(pulsePoints) : "";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          BP Analytics
        </Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Time Range Selector */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.timeRangeRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {(["7d", "30d", "all"] as TimeRange[]).map((range) => (
          <Pressable
            key={range}
            onPress={() => setTimeRange(range)}
            style={[
              styles.timeRangeBtn,
              timeRange === range && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.timeRangeText,
                {
                  color: timeRange === range ? "#0A0E1A" : colors.textSecondary,
                  fontFamily: timeRange === range ? Fonts.semiBold : Fonts.medium,
                },
              ]}
            >
              {range === "7d" ? "Week" : range === "30d" ? "Month" : "All"}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {filteredReadings.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="analytics-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No data for this time range
          </Text>
        </Animated.View>
      ) : (
        <>
          {/* Systolic & Diastolic Chart */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Blood Pressure
              </Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Systolic</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Diastolic</Text>
                </View>
              </View>
            </View>

            {systolicPath ? (
              <Svg width={chartWidth} height={chartHeight + 10} style={{ marginTop: 8 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                  <Line
                    key={`grid-bp-${i}`}
                    x1={yAxisWidth}
                    y1={frac * graphHeight + 4}
                    x2={yAxisWidth + graphWidth}
                    y2={frac * graphHeight + 4}
                    stroke={colors.border}
                    strokeWidth={0.5}
                    strokeDasharray="4,4"
                  />
                ))}
                {/* Systolic line */}
                <Path
                  d={systolicPath}
                  fill="none"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {/* Diastolic line */}
                <Path
                  d={diastolicPath}
                  fill="none"
                  stroke={colors.success}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {/* End dots */}
                {systolicPoints.length > 0 && (
                  <Circle
                    cx={systolicPoints[systolicPoints.length - 1].x}
                    cy={systolicPoints[systolicPoints.length - 1].y}
                    r={4}
                    fill={colors.primary}
                  />
                )}
                {diastolicPoints.length > 0 && (
                  <Circle
                    cx={diastolicPoints[diastolicPoints.length - 1].x}
                    cy={diastolicPoints[diastolicPoints.length - 1].y}
                    r={4}
                    fill={colors.success}
                  />
                )}
              </Svg>
            ) : (
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                Need at least 2 readings to show chart
              </Text>
            )}
          </Animated.View>

          {/* Pulse Chart */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
                Heart Rate
              </Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Pulse</Text>
                </View>
              </View>
            </View>

            {pulsePath ? (
              <Svg width={chartWidth} height={chartHeight + 10} style={{ marginTop: 8 }}>
                {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
                  <Line
                    key={`grid-pulse-${i}`}
                    x1={yAxisWidth}
                    y1={frac * graphHeight + 4}
                    x2={yAxisWidth + graphWidth}
                    y2={frac * graphHeight + 4}
                    stroke={colors.border}
                    strokeWidth={0.5}
                    strokeDasharray="4,4"
                  />
                ))}
                <Path
                  d={pulsePath}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                {pulsePoints.length > 0 && (
                  <Circle
                    cx={pulsePoints[pulsePoints.length - 1].x}
                    cy={pulsePoints[pulsePoints.length - 1].y}
                    r={4}
                    fill={colors.accent}
                  />
                )}
              </Svg>
            ) : (
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                Need at least 2 readings to show chart
              </Text>
            )}
          </Animated.View>

          {/* Stats */}
          {stats && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.chartTitle, { color: colors.textPrimary, marginBottom: 16 }]}>
                Statistics
              </Text>

              <View style={styles.statsTable}>
                <View style={[styles.statsTableRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.statsTableHeader, { color: colors.textSecondary }]} />
                  <Text style={[styles.statsTableHeader, { color: colors.textSecondary }]}>Avg</Text>
                  <Text style={[styles.statsTableHeader, { color: colors.textSecondary }]}>Min</Text>
                  <Text style={[styles.statsTableHeader, { color: colors.textSecondary }]}>Max</Text>
                </View>
                <View style={[styles.statsTableRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.statsTableLabel, { color: colors.primary }]}>Systolic</Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.avgSystolic}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.minSystolic}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.maxSystolic}
                  </Text>
                </View>
                <View style={[styles.statsTableRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.statsTableLabel, { color: colors.success }]}>Diastolic</Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.avgDiastolic}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.minDiastolic}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.maxDiastolic}
                  </Text>
                </View>
                <View style={styles.statsTableRow}>
                  <Text style={[styles.statsTableLabel, { color: colors.accent }]}>Pulse</Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.avgPulse}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.minPulse}
                  </Text>
                  <Text style={[styles.statsTableValue, { color: colors.textPrimary }]}>
                    {stats.maxPulse}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Category Distribution */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.chartTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
              Reading Categories
            </Text>
            {(() => {
              const categories = filteredReadings.map((r) =>
                getBPCategory(r.systolic, r.diastolic)
              );
              const counts: Record<string, number> = {};
              categories.forEach((c) => {
                counts[c] = (counts[c] || 0) + 1;
              });
              const total = categories.length;

              return Object.entries(counts).map(([cat, count]) => {
                const pct = Math.round((count / total) * 100);
                const color = getBPCategoryColor(cat as any);
                return (
                  <View key={cat} style={styles.categoryRow}>
                    <View style={styles.categoryRowLeft}>
                      <View style={[styles.catDot, { backgroundColor: color }]} />
                      <Text style={[styles.categoryRowLabel, { color: colors.textPrimary }]}>
                        {getBPCategoryLabel(cat as any)}
                      </Text>
                    </View>
                    <View style={styles.categoryBarContainer}>
                      <View
                        style={[
                          styles.categoryBar,
                          { backgroundColor: color, width: `${pct}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.categoryRowValue, { color: colors.textSecondary }]}>
                      {pct}%
                    </Text>
                  </View>
                );
              });
            })()}
          </Animated.View>
        </>
      )}
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
  timeRangeRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 9,
    borderCurve: "continuous",
  },
  timeRangeText: {
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  chartCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  legendRow: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  noDataText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },
  statsCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  statsTable: {
    gap: 0,
  },
  statsTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsTableHeader: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    textAlign: "center",
  },
  statsTableLabel: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  statsTableValue: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  categoryRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 100,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryRowLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  categoryBar: {
    height: "100%",
    borderRadius: 4,
  },
  categoryRowValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    width: 36,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});
