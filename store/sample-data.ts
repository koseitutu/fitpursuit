import type {
  Achievement,
  Activity,
  DailyStats,
  Exercise,
  WorkoutTemplate,
} from './types';

// Helper to generate dates relative to today
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function daysAgoISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// --- Workout Template Exercises ---

const benchPressExercise: Exercise = {
  id: 'ex-bench-press',
  name: 'Bench Press',
  sets: [
    { setNumber: 1, reps: 12, weight: 60, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 70, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 80, isCompleted: false },
  ],
  restTime: 90,
};

const squatExercise: Exercise = {
  id: 'ex-squat',
  name: 'Barbell Squat',
  sets: [
    { setNumber: 1, reps: 12, weight: 80, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 90, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 100, isCompleted: false },
  ],
  restTime: 120,
};

const deadliftExercise: Exercise = {
  id: 'ex-deadlift',
  name: 'Deadlift',
  sets: [
    { setNumber: 1, reps: 10, weight: 100, isCompleted: false },
    { setNumber: 2, reps: 8, weight: 110, isCompleted: false },
    { setNumber: 3, reps: 6, weight: 120, isCompleted: false },
  ],
  restTime: 120,
};

const pullUpExercise: Exercise = {
  id: 'ex-pull-up',
  name: 'Pull-Ups',
  sets: [
    { setNumber: 1, reps: 10, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 8, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 6, weight: 0, isCompleted: false },
  ],
  restTime: 90,
};

const overheadPressExercise: Exercise = {
  id: 'ex-overhead-press',
  name: 'Overhead Press',
  sets: [
    { setNumber: 1, reps: 12, weight: 40, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 45, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 50, isCompleted: false },
  ],
  restTime: 90,
};

const bicepCurlExercise: Exercise = {
  id: 'ex-bicep-curl',
  name: 'Bicep Curls',
  sets: [
    { setNumber: 1, reps: 12, weight: 15, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 17.5, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 20, isCompleted: false },
  ],
  restTime: 60,
};

const lungeExercise: Exercise = {
  id: 'ex-lunge',
  name: 'Walking Lunges',
  sets: [
    { setNumber: 1, reps: 12, weight: 20, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 25, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 30, isCompleted: false },
  ],
  restTime: 60,
};

const plankExercise: Exercise = {
  id: 'ex-plank',
  name: 'Plank Hold',
  sets: [
    { setNumber: 1, reps: 1, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 1, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 1, weight: 0, isCompleted: false },
  ],
  restTime: 45,
};

const burpeeExercise: Exercise = {
  id: 'ex-burpee',
  name: 'Burpees',
  sets: [
    { setNumber: 1, reps: 15, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 0, isCompleted: false },
  ],
  restTime: 60,
};

const mountainClimberExercise: Exercise = {
  id: 'ex-mountain-climber',
  name: 'Mountain Climbers',
  sets: [
    { setNumber: 1, reps: 20, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 20, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 20, weight: 0, isCompleted: false },
  ],
  restTime: 45,
};

const downwardDogExercise: Exercise = {
  id: 'ex-downward-dog',
  name: 'Downward Dog',
  sets: [{ setNumber: 1, reps: 1, weight: 0, isCompleted: false }],
  restTime: 30,
};

const warriorPoseExercise: Exercise = {
  id: 'ex-warrior-pose',
  name: 'Warrior Pose',
  sets: [{ setNumber: 1, reps: 1, weight: 0, isCompleted: false }],
  restTime: 30,
};

const legPressExercise: Exercise = {
  id: 'ex-leg-press',
  name: 'Leg Press',
  sets: [
    { setNumber: 1, reps: 12, weight: 120, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 140, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 160, isCompleted: false },
  ],
  restTime: 90,
};

const tricepDipExercise: Exercise = {
  id: 'ex-tricep-dip',
  name: 'Tricep Dips',
  sets: [
    { setNumber: 1, reps: 12, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 0, isCompleted: false },
  ],
  restTime: 60,
};

const boxJumpExercise: Exercise = {
  id: 'ex-box-jump',
  name: 'Box Jumps',
  sets: [
    { setNumber: 1, reps: 10, weight: 0, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 0, isCompleted: false },
    { setNumber: 3, reps: 8, weight: 0, isCompleted: false },
  ],
  restTime: 60,
};

// --- 10 Workout Templates ---

export const sampleWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'template-1',
    name: 'Full Body Strength',
    category: 'strength',
    exercises: [squatExercise, benchPressExercise, deadliftExercise, pullUpExercise],
    estimatedDuration: 60,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-2',
    name: 'Upper Body Push',
    category: 'strength',
    exercises: [benchPressExercise, overheadPressExercise, tricepDipExercise],
    estimatedDuration: 45,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-3',
    name: 'Lower Body Power',
    category: 'strength',
    exercises: [squatExercise, legPressExercise, lungeExercise],
    estimatedDuration: 50,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-4',
    name: 'HIIT Blast',
    category: 'hiit',
    exercises: [burpeeExercise, mountainClimberExercise, boxJumpExercise],
    estimatedDuration: 30,
    difficulty: 'extreme',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-5',
    name: 'Morning Yoga Flow',
    category: 'yoga',
    exercises: [downwardDogExercise, warriorPoseExercise, plankExercise],
    estimatedDuration: 30,
    difficulty: 'easy',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-6',
    name: 'Pull Day',
    category: 'strength',
    exercises: [pullUpExercise, deadliftExercise, bicepCurlExercise],
    estimatedDuration: 50,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-7',
    name: 'Core Crusher',
    category: 'strength',
    exercises: [plankExercise, mountainClimberExercise, burpeeExercise],
    estimatedDuration: 25,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-8',
    name: 'Cardio Circuit',
    category: 'cardio',
    exercises: [burpeeExercise, boxJumpExercise, mountainClimberExercise],
    estimatedDuration: 35,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-9',
    name: 'Arms & Shoulders',
    category: 'strength',
    exercises: [overheadPressExercise, bicepCurlExercise, tricepDipExercise],
    estimatedDuration: 40,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-10',
    name: 'CrossFit WOD',
    category: 'crossfit',
    exercises: [deadliftExercise, pullUpExercise, boxJumpExercise, burpeeExercise],
    estimatedDuration: 45,
    difficulty: 'extreme',
    isCustom: false,
    isFavorite: true,
  },
];

// --- 12 Achievement Badges ---

export const sampleAchievements: Achievement[] = [
  {
    id: 'achievement-1',
    title: 'First Steps',
    description: 'Complete your first workout',
    icon: 'trophy',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-2',
    title: 'Week Warrior',
    description: 'Work out every day for a week',
    icon: 'flame',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-3',
    title: 'Step Master',
    description: 'Reach 10,000 steps in a single day',
    icon: 'footprints',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-4',
    title: 'Iron Will',
    description: 'Complete 50 workouts',
    icon: 'dumbbell',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-5',
    title: 'Marathon Mindset',
    description: 'Run a total of 42.2 km',
    icon: 'running',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-6',
    title: 'Hydration Hero',
    description: 'Meet your water goal for 7 consecutive days',
    icon: 'droplet',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-7',
    title: 'Early Bird',
    description: 'Complete a workout before 7 AM',
    icon: 'sunrise',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-8',
    title: 'Calorie Crusher',
    description: 'Burn 1,000 calories in a single day',
    icon: 'fire',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-9',
    title: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: 'crown',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-10',
    title: 'Weight Watcher',
    description: 'Log your weight for 30 consecutive days',
    icon: 'scale',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-11',
    title: 'Flex Master',
    description: 'Complete 20 flexibility workouts',
    icon: 'stretch',
    unlockedAt: null,
    isUnlocked: false,
  },
  {
    id: 'achievement-12',
    title: 'Century Club',
    description: 'Log 100 total workouts',
    icon: 'star',
    unlockedAt: null,
    isUnlocked: false,
  },
];

// --- Sample Weekly Activity Data (7 days for charts) ---

export const sampleWeeklyStats: DailyStats[] = [
  {
    date: daysAgo(6),
    steps: 8432,
    caloriesBurned: 420,
    activeMinutes: 45,
    waterIntake: 2200,
    distanceTraveled: 6.1,
    goalCompletionRate: 72,
  },
  {
    date: daysAgo(5),
    steps: 12050,
    caloriesBurned: 580,
    activeMinutes: 62,
    waterIntake: 2800,
    distanceTraveled: 8.7,
    goalCompletionRate: 91,
  },
  {
    date: daysAgo(4),
    steps: 6200,
    caloriesBurned: 310,
    activeMinutes: 30,
    waterIntake: 1800,
    distanceTraveled: 4.5,
    goalCompletionRate: 55,
  },
  {
    date: daysAgo(3),
    steps: 10800,
    caloriesBurned: 520,
    activeMinutes: 55,
    waterIntake: 2500,
    distanceTraveled: 7.8,
    goalCompletionRate: 85,
  },
  {
    date: daysAgo(2),
    steps: 9200,
    caloriesBurned: 460,
    activeMinutes: 48,
    waterIntake: 2400,
    distanceTraveled: 6.6,
    goalCompletionRate: 78,
  },
  {
    date: daysAgo(1),
    steps: 11500,
    caloriesBurned: 550,
    activeMinutes: 58,
    waterIntake: 2600,
    distanceTraveled: 8.3,
    goalCompletionRate: 88,
  },
  {
    date: daysAgo(0),
    steps: 4500,
    caloriesBurned: 220,
    activeMinutes: 22,
    waterIntake: 1200,
    distanceTraveled: 3.2,
    goalCompletionRate: 35,
  },
];

// --- Sample Weekly Activities (for map/chart views) ---

export const sampleWeeklyActivities: Activity[] = [
  {
    id: 'activity-sample-1',
    type: 'running',
    duration: 32,
    distance: 5.2,
    steps: 6100,
    pace: 6.15,
    caloriesBurned: 340,
    route: [
      { latitude: 40.7128, longitude: -74.006, timestamp: daysAgoISO(5) },
      { latitude: 40.7138, longitude: -74.005, timestamp: daysAgoISO(5) },
      { latitude: 40.7148, longitude: -74.004, timestamp: daysAgoISO(5) },
    ],
    startedAt: daysAgoISO(5),
    endedAt: daysAgoISO(5),
  },
  {
    id: 'activity-sample-2',
    type: 'cycling',
    duration: 45,
    distance: 15.3,
    steps: 0,
    pace: 2.94,
    caloriesBurned: 420,
    route: [
      { latitude: 40.7128, longitude: -74.006, timestamp: daysAgoISO(4) },
      { latitude: 40.7228, longitude: -74.016, timestamp: daysAgoISO(4) },
      { latitude: 40.7328, longitude: -74.026, timestamp: daysAgoISO(4) },
    ],
    startedAt: daysAgoISO(4),
    endedAt: daysAgoISO(4),
  },
  {
    id: 'activity-sample-3',
    type: 'walking',
    duration: 55,
    distance: 4.1,
    steps: 5400,
    pace: 13.41,
    caloriesBurned: 180,
    route: [
      { latitude: 40.7589, longitude: -73.9851, timestamp: daysAgoISO(3) },
      { latitude: 40.7599, longitude: -73.9841, timestamp: daysAgoISO(3) },
    ],
    startedAt: daysAgoISO(3),
    endedAt: daysAgoISO(3),
  },
  {
    id: 'activity-sample-4',
    type: 'running',
    duration: 28,
    distance: 4.8,
    steps: 5600,
    pace: 5.83,
    caloriesBurned: 310,
    route: [
      { latitude: 40.7831, longitude: -73.9712, timestamp: daysAgoISO(2) },
      { latitude: 40.7841, longitude: -73.9702, timestamp: daysAgoISO(2) },
      { latitude: 40.7851, longitude: -73.9692, timestamp: daysAgoISO(2) },
    ],
    startedAt: daysAgoISO(2),
    endedAt: daysAgoISO(2),
  },
  {
    id: 'activity-sample-5',
    type: 'hiking',
    duration: 90,
    distance: 8.5,
    steps: 11200,
    pace: 10.59,
    caloriesBurned: 520,
    route: [
      { latitude: 40.7934, longitude: -73.9531, timestamp: daysAgoISO(1) },
      { latitude: 40.7944, longitude: -73.9521, timestamp: daysAgoISO(1) },
      { latitude: 40.7954, longitude: -73.9511, timestamp: daysAgoISO(1) },
      { latitude: 40.7964, longitude: -73.9501, timestamp: daysAgoISO(1) },
    ],
    startedAt: daysAgoISO(1),
    endedAt: daysAgoISO(1),
  },
];
