import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore } from "@/store/useAppStore";
import { Fonts } from "@/constants/Typography";
import { SectionHeader } from "@/components/section-header";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Svg, {
  Path,
  Line,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

// Generate sample weight data over 12 weeks
function generateSampleWeightData() {
  const data: { date: string; weight: number; bmi: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    // Simulate a gradual decrease from ~78 to ~73 with some noise
    const base = 78 - (11 - i) * 0.45;
    const noise = Math.sin(i * 1.5) * 0.8;
    const weight = Math.round((base + noise) * 10) / 10;
    const bmi = Math.round((weight / (1.79 * 1.79)) * 10) / 10;
    data.push({
      date: date.toISOString().split("T")[0],
      weight,
      bmi,
    });
  }
  return data;
}

// Generate sample heatmap data (5 weeks x 7 days)
function generateSampleHeatmap(): number[][] {
  const weeks: number[][] = [];
  for (let w = 0; w < 5; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Random activity: 0 = none, 1 = light, 2 = moderate, 3 = intense
      const rand = Math.random();
      if (rand < 0.3) week.push(0);
      else if (rand < 0.55) week.push(1);
      else if (rand < 0.8) week.push(2);
      else week.push(3);
    }
    weeks.push(week);
  }
  return weeks;
}

const personalRecords = [
  { label: "Max Bench Press", value: "90kg" },
  { label: "Fastest 5K", value: "22:15" },
  { label: "Longest Run", value: "12.5km" },
  { label: "Max Deadlift", value: "140kg" },
];

// Create smooth bezier path from points
function createSmoothPath(
  points: { x: number; y: number }[]
): string {
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

export default function ProgressScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const weightLog = useAppStore((state) => state.weightLog);

  const weightData = useMemo(() => {
    if (weightLog.length >= 4) return weightLog.slice(-12);
    return generateSampleWeightData();
  }, [weightLog]);

  const heatmapData = useMemo(() => generateSampleHeatmap(), []);

  const latestBmi = weightData[weightData.length - 1]?.bmi ?? 23.5;
  const bmiCategory =
    latestBmi < 18.5
      ? "Underweight"
      : latestBmi < 25
        ? "Normal"
        : latestBmi < 30
          ? "Overweight"
          : "Obese";

  // Chart dimensions
  const chartPadding = 20;
  const chartWidth = screenWidth - 32 - chartPadding * 2; // card padding - chart internal padding
  const chartHeight = 160;
  const yAxisWidth = 36;
  const graphWidth = chartWidth - yAxisWidth;
  const graphHeight = chartHeight - 24; // room for bottom labels

  // Calculate chart points
  const weights = weightData.map((d) => d.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  const weightRange = maxWeight - minWeight;

  const points = weightData.map((d, i) => ({
    x: yAxisWidth + (i / (weightData.length - 1)) * graphWidth,
    y: graphHeight - ((d.weight - minWeight) / weightRange) * graphHeight + 4,
  }));

  const linePath = createSmoothPath(points);

  // Create fill path (area under curve)
  const fillPath =
    linePath +
    ` L ${points[points.length - 1].x} ${graphHeight + 4} L ${points[0].x} ${graphHeight + 4} Z`;

  // Y-axis labels
  const yLabels = [maxWeight, Math.round((maxWeight + minWeight) / 2), minWeight];

  // Heatmap colors
  const getHeatmapColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return { backgroundColor: colors.primary, opacity: 0.08 };
      case 1:
        return { backgroundColor: colors.primary, opacity: 0.3 };
      case 2:
        return { backgroundColor: colors.primary, opacity: 0.6 };
      case 3:
        return { backgroundColor: colors.primary, opacity: 1.0 };
      default:
        return { backgroundColor: colors.primary, opacity: 0.08 };
    }
  };

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Animated.View entering={FadeInDown.duration(400).delay(0)}>
        <Text
          style={[
            styles.title,
            { color: colors.textPrimary, fontFamily: Fonts.bold },
          ]}
        >
          Progress
        </Text>
      </Animated.View>

      {/* Weight Progress Chart */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.chartHeader}>
          <Text
            style={[
              styles.chartTitle,
              { color: colors.textPrimary, fontFamily: Fonts.semiBold },
            ]}
          >
            Weight Progress
          </Text>
          <View style={[styles.pill, { backgroundColor: colors.border }]}>
            <Text
              style={[
                styles.pillText,
                { color: colors.textSecondary, fontFamily: Fonts.medium },
              ]}
            >
              Last 3 Months
            </Text>
          </View>
        </View>

        <Svg
          width={chartWidth}
          height={chartHeight + 20}
          style={{ marginTop: 12 }}
        >
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.3} />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity={0.0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {yLabels.map((_, i) => {
            const y = (i / (yLabels.length - 1)) * graphHeight + 4;
            return (
              <Line
                key={`grid-${i}`}
                x1={yAxisWidth}
                y1={y}
                x2={yAxisWidth + graphWidth}
                y2={y}
                stroke={colors.border}
                strokeWidth={0.5}
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Y-axis labels */}
          {yLabels.map((label, i) => {
            const y = (i / (yLabels.length - 1)) * graphHeight + 8;
            return (
              <SvgText
                key={`ylabel-${i}`}
                x={0}
                y={y}
                fill={colors.textSecondary}
                fontSize={10}
                fontFamily={Fonts.regular}
              >
                {label}
              </SvgText>
            );
          })}

          {/* Gradient fill */}
          <Path d={fillPath} fill="url(#chartGradient)" />

          {/* Line */}
          <Path
            d={linePath}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <Circle
              key={`dot-${i}`}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={colors.primary}
              stroke={colors.surface}
              strokeWidth={1.5}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* BMI Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        style={[styles.bmiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text
          style={[
            styles.bmiText,
            { color: colors.textPrimary, fontFamily: Fonts.semiBold },
          ]}
        >
          BMI:{" "}
          <Text style={{ fontVariant: ["tabular-nums"] }}>
            {latestBmi.toFixed(1)}
          </Text>{" "}
          <Text style={{ color: colors.success }}>({bmiCategory})</Text>
        </Text>
      </Animated.View>

      {/* Workout Consistency */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <SectionHeader title="Workout Consistency" style={{ marginBottom: 12 }} />

        {/* Day labels */}
        <View style={styles.heatmapDayLabels}>
          {dayLabels.map((day, i) => (
            <Text
              key={`day-${i}`}
              style={[
                styles.dayLabel,
                { color: colors.textSecondary, fontFamily: Fonts.medium },
              ]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Heatmap grid */}
        <View style={styles.heatmapContainer}>
          {heatmapData.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.heatmapRow}>
              {week.map((intensity, dayIndex) => {
                const colorStyle = getHeatmapColor(intensity);
                return (
                  <View
                    key={`cell-${weekIndex}-${dayIndex}`}
                    style={[
                      styles.heatmapCell,
                      {
                        backgroundColor: colorStyle.backgroundColor,
                        opacity: colorStyle.opacity,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: Fonts.regular }]}>
            Less
          </Text>
          {[0, 1, 2, 3].map((level) => {
            const colorStyle = getHeatmapColor(level);
            return (
              <View
                key={`legend-${level}`}
                style={[
                  styles.legendCell,
                  {
                    backgroundColor: colorStyle.backgroundColor,
                    opacity: colorStyle.opacity,
                  },
                ]}
              />
            );
          })}
          <Text style={[styles.legendText, { color: colors.textSecondary, fontFamily: Fonts.regular }]}>
            More
          </Text>
        </View>
      </Animated.View>

      {/* Personal Records */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(400)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <SectionHeader title="Personal Records" style={{ marginBottom: 12 }} />

        {personalRecords.map((record, i) => (
          <View
            key={`record-${i}`}
            style={[
              styles.recordRow,
              i < personalRecords.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={styles.recordLeft}>
              <Ionicons
                name="trophy"
                size={18}
                color={colors.warning}
                style={{ marginRight: 10 }}
              />
              <Text
                style={[
                  styles.recordLabel,
                  { color: colors.textPrimary, fontFamily: Fonts.medium },
                ]}
              >
                {record.label}
              </Text>
            </View>
            <Text
              style={[
                styles.recordValue,
                { color: colors.primary, fontFamily: Fonts.semiBold, fontVariant: ["tabular-nums"] },
              ]}
            >
              {record.value}
            </Text>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
  },
  bmiCard: {
    borderRadius: 16,
    borderCurve: "continuous",
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  bmiText: {
    fontSize: 18,
    fontVariant: ["tabular-nums"],
  },
  heatmapDayLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 11,
    width: 28,
    textAlign: "center",
  },
  heatmapContainer: {
    gap: 4,
  },
  heatmapRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 4,
  },
  heatmapCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    borderCurve: "continuous",
    maxWidth: 36,
    maxHeight: 36,
  },
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 4,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  recordLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordLabel: {
    fontSize: 14,
  },
  recordValue: {
    fontSize: 14,
  },
});
