import type { BPCategory, BloodPressureReading } from '@/store/types';

export function getBPCategory(systolic: number, diastolic: number): BPCategory {
  if (systolic >= 180 || diastolic >= 120) return 'crisis';
  if (systolic >= 140 || diastolic >= 90) return 'high_stage2';
  if (systolic >= 130 || diastolic >= 80) return 'high_stage1';
  if (systolic >= 120 && diastolic < 80) return 'elevated';
  return 'normal';
}

export function getBPCategoryLabel(category: BPCategory): string {
  switch (category) {
    case 'normal': return 'Normal';
    case 'elevated': return 'Elevated';
    case 'high_stage1': return 'High (Stage 1)';
    case 'high_stage2': return 'High (Stage 2)';
    case 'crisis': return 'Crisis';
  }
}

export function getBPCategoryColor(category: BPCategory): string {
  switch (category) {
    case 'normal': return '#00C896';
    case 'elevated': return '#FFD93D';
    case 'high_stage1': return '#FF6B35';
    case 'high_stage2': return '#FF4757';
    case 'crisis': return '#D63031';
  }
}

export interface BPStats {
  avgSystolic: number;
  avgDiastolic: number;
  avgPulse: number;
  minSystolic: number;
  maxSystolic: number;
  minDiastolic: number;
  maxDiastolic: number;
  minPulse: number;
  maxPulse: number;
}

export function calculateBPStats(readings: BloodPressureReading[]): BPStats | null {
  if (readings.length === 0) return null;

  const systolics = readings.map((r) => r.systolic);
  const diastolics = readings.map((r) => r.diastolic);
  const pulses = readings.map((r) => r.pulse);

  return {
    avgSystolic: Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length),
    avgDiastolic: Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length),
    avgPulse: Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length),
    minSystolic: Math.min(...systolics),
    maxSystolic: Math.max(...systolics),
    minDiastolic: Math.min(...diastolics),
    maxDiastolic: Math.max(...diastolics),
    minPulse: Math.min(...pulses),
    maxPulse: Math.max(...pulses),
  };
}
