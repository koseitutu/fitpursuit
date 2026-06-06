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

// --- FinPulse Home Gym Custom Exercises (Strength) ---

const chestPressExercise: Exercise = {
  id: 'ex-chest-press',
  name: 'Chest Press',
  sets: [
    { setNumber: 1, reps: 12, weight: 40, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 50, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 50, isCompleted: false },
    { setNumber: 4, reps: 12, weight: 40, isCompleted: false },
  ],
  restTime: 90,
};

const pecFlyExercise: Exercise = {
  id: 'ex-pec-fly',
  name: 'Pec Fly',
  sets: [
    { setNumber: 1, reps: 15, weight: 20, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 25, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 25, isCompleted: false },
  ],
  restTime: 60,
};

const overheadTricepExercise: Exercise = {
  id: 'ex-overhead-tricep',
  name: 'Seated Overhead Tricep Extension',
  sets: [
    { setNumber: 1, reps: 12, weight: 15, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 20, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 20, isCompleted: false },
  ],
  restTime: 60,
};

const tricepPushdownExercise: Exercise = {
  id: 'ex-tricep-pushdown',
  name: 'Tricep Pushdowns',
  sets: [
    { setNumber: 1, reps: 15, weight: 20, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 25, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 25, isCompleted: false },
  ],
  restTime: 60,
};

const latPulldownExercise: Exercise = {
  id: 'ex-lat-pulldown',
  name: 'Wide-Grip Lat Pulldown',
  sets: [
    { setNumber: 1, reps: 12, weight: 40, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 50, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 50, isCompleted: false },
    { setNumber: 4, reps: 12, weight: 40, isCompleted: false },
  ],
  restTime: 90,
};

const seatedRowExercise: Exercise = {
  id: 'ex-seated-row',
  name: 'Seated Low Row',
  sets: [
    { setNumber: 1, reps: 12, weight: 35, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 45, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 45, isCompleted: false },
    { setNumber: 4, reps: 12, weight: 35, isCompleted: false },
  ],
  restTime: 90,
};

const straightArmPulldownExercise: Exercise = {
  id: 'ex-straight-arm-pulldown',
  name: 'Straight-Arm Pulldown',
  sets: [
    { setNumber: 1, reps: 12, weight: 20, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 25, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 25, isCompleted: false },
  ],
  restTime: 60,
};

const bicepCurlExercise: Exercise = {
  id: 'ex-cable-bicep-curl',
  name: 'Cable Bicep Curls',
  sets: [
    { setNumber: 1, reps: 12, weight: 15, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 20, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 20, isCompleted: false },
    { setNumber: 4, reps: 12, weight: 15, isCompleted: false },
  ],
  restTime: 60,
};

const legPressExercise: Exercise = {
  id: 'ex-leg-press',
  name: 'Seated Leg Press',
  sets: [
    { setNumber: 1, reps: 15, weight: 80, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 100, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 100, isCompleted: false },
    { setNumber: 4, reps: 15, weight: 80, isCompleted: false },
  ],
  restTime: 90,
};

const legExtensionExercise: Exercise = {
  id: 'ex-leg-extension',
  name: 'Leg Extensions',
  sets: [
    { setNumber: 1, reps: 15, weight: 30, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 40, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 40, isCompleted: false },
  ],
  restTime: 60,
};

const legCurlExercise: Exercise = {
  id: 'ex-leg-curl',
  name: 'Seated Leg Curls',
  sets: [
    { setNumber: 1, reps: 12, weight: 25, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 30, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 30, isCompleted: false },
  ],
  restTime: 60,
};

const cableCrunchExercise: Exercise = {
  id: 'ex-cable-crunch',
  name: 'Cable Crunch',
  sets: [
    { setNumber: 1, reps: 20, weight: 30, isCompleted: false },
    { setNumber: 2, reps: 15, weight: 40, isCompleted: false },
    { setNumber: 3, reps: 15, weight: 40, isCompleted: false },
  ],
  restTime: 60,
};

const shoulderPressExercise: Exercise = {
  id: 'ex-shoulder-press',
  name: 'Seated Shoulder Press',
  sets: [
    { setNumber: 1, reps: 12, weight: 20, isCompleted: false },
    { setNumber: 2, reps: 10, weight: 25, isCompleted: false },
    { setNumber: 3, reps: 10, weight: 25, isCompleted: false },
    { setNumber: 4, reps: 12, weight: 20, isCompleted: false },
  ],
  restTime: 90,
};

const lateralRaiseExercise: Exercise = {
  id: 'ex-lateral-raise',
  name: 'Cable Lateral Raises',
  sets: [
    { setNumber: 1, reps: 15, weight: 7.5, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 10, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 10, isCompleted: false },
  ],
  restTime: 60,
};

const frontRaiseExercise: Exercise = {
  id: 'ex-front-raise',
  name: 'Cable Front Raises',
  sets: [
    { setNumber: 1, reps: 12, weight: 10, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 12.5, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 12.5, isCompleted: false },
  ],
  restTime: 60,
};

const shrugsExercise: Exercise = {
  id: 'ex-shrugs',
  name: 'Cable Shrugs',
  sets: [
    { setNumber: 1, reps: 15, weight: 40, isCompleted: false },
    { setNumber: 2, reps: 15, weight: 50, isCompleted: false },
    { setNumber: 3, reps: 15, weight: 50, isCompleted: false },
  ],
  restTime: 60,
};

const legPressBurnoutExercise: Exercise = {
  id: 'ex-leg-press-burnout',
  name: 'Seated Leg Press (Burnout)',
  sets: [
    { setNumber: 1, reps: 15, weight: 60, isCompleted: false },
    { setNumber: 2, reps: 15, weight: 60, isCompleted: false },
    { setNumber: 3, reps: 15, weight: 60, isCompleted: false },
  ],
  restTime: 60,
};

const closeGripLatPulldownExercise: Exercise = {
  id: 'ex-close-grip-pulldown',
  name: 'Close-Grip Lat Pulldown',
  sets: [
    { setNumber: 1, reps: 12, weight: 35, isCompleted: false },
    { setNumber: 2, reps: 12, weight: 45, isCompleted: false },
    { setNumber: 3, reps: 12, weight: 45, isCompleted: false },
  ],
  restTime: 60,
};

const woodchopperExercise: Exercise = {
  id: 'ex-woodchoppers',
  name: 'Woodchoppers',
  sets: [
    { setNumber: 1, reps: 15, weight: 15, isCompleted: false },
    { setNumber: 2, reps: 15, weight: 20, isCompleted: false },
    { setNumber: 3, reps: 15, weight: 20, isCompleted: false },
  ],
  restTime: 60,
};

// --- Retained Original Non-Strength Exercises ---

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


// --- The Blended 9 Workout Templates ---

export const sampleWorkoutTemplates: WorkoutTemplate[] = [
  // Your Custom Strength Templates
  {
    id: 'template-1',
    name: 'Monday: Push I (Chest/Triceps)',
    category: 'strength',
    exercises: [chestPressExercise, pecFlyExercise, overheadTricepExercise, tricepPushdownExercise],
    estimatedDuration: 60,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-2',
    name: 'Tuesday: Pull I (Back/Biceps)',
    category: 'strength',
    exercises: [latPulldownExercise, seatedRowExercise, straightArmPulldownExercise, bicepCurlExercise],
    estimatedDuration: 60,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-3',
    name: 'Wednesday: Legs & Core',
    category: 'strength',
    exercises: [legPressExercise, legExtensionExercise, legCurlExercise, cableCrunchExercise],
    estimatedDuration: 60,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-4',
    name: 'Thursday: Shoulders & Traps',
    category: 'strength',
    exercises: [shoulderPressExercise, lateralRaiseExercise, frontRaiseExercise, shrugsExercise],
    estimatedDuration: 60,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: true,
  },
  {
    id: 'template-5',
    name: 'Friday: Full Body Finisher',
    category: 'strength',
    exercises: [legPressBurnoutExercise, closeGripLatPulldownExercise, tricepPushdownExercise, bicepCurlExercise, woodchopperExercise],
    estimatedDuration: 60,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: true,
  },
  // Retained Original Framework Specialty Routines
  {
    id: 'template-6',
    name: 'HIIT Blast',
    category: 'hiit',
    exercises: [burpeeExercise, mountainClimberExercise, boxJumpExercise],
    estimatedDuration: 30,
    difficulty: 'extreme',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-7',
    name: 'Morning Yoga Flow',
    category: 'yoga',
    exercises: [downwardDogExercise, warriorPoseExercise, plankExercise],
    estimatedDuration: 30,
    difficulty: 'easy',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-8',
    name: 'Core Crusher',
    category: 'hiit',
    exercises: [plankExercise, mountainClimberExercise, burpeeExercise],
    estimatedDuration: 25,
    difficulty: 'medium',
    isCustom: false,
    isFavorite: false,
  },
  {
    id: 'template-9',
    name: 'Cardio Circuit',
    category: 'cardio',
    exercises: [burpeeExercise, boxJumpExercise, mountainClimberExercise],
    estimatedDuration: 35,
    difficulty: 'hard',
    isCustom: false,
    isFavorite: false,
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
];