// Bobbi — 12-week program, 2x/week full-body (postpartum return to training,
// experienced lifter getting back into consistency). Three 4-week blocks.
// Assign Block 1 now via "Start now", then use "Add to schedule" for Blocks
// 2 and 3 so they queue up automatically as each one ends.

export const BOBBI_TEMPLATES = [
  {
    id: "tpl-bobbi-block1",
    name: "Bobbi — Block 1: Foundation (Wks 1-4)",
    level: "Intermediate",
    description: "Weeks 1-4 of Bobbi's program. Full-body 2x/week to rebuild consistency and reintroduce load. Moderate weights, RPE 6-7. Core work is bracing/stability-focused (dead bug, plank, side plank) rather than loaded flexion, appropriate for a postpartum return. Confirm she's been medically cleared for exercise if that hasn't already happened. Update her Nutrition tab targets to 1890 cal / 180g protein / 169g carbs / 55g fat for this block — note if she's breastfeeding, don't drop calories further than this without her doctor's input.",
    days: [
      {
        name: "Day 1 — Full Body A",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10 (light-moderate)" },
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Full Body B",
        exercises: [
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
        ],
      },
    ],
  },
  {
    id: "tpl-bobbi-block2",
    name: "Bobbi — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of Bobbi's program. Heavier compound loading now that consistency and movement quality are back, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for her last Block 1 sessions before starting this. Update her Nutrition tab targets to 1800 cal / 190g protein / 147g carbs / 50g fat for this block.",
    days: [
      {
        name: "Day 1 — Full Body A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "8 (moderate)" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Day 2 — Full Body B",
        exercises: [
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Sumo Deadlift", sets: 3, reps: "8" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
        ],
      },
    ],
  },
  {
    id: "tpl-bobbi-block3",
    name: "Bobbi — Block 3: Strength & Fat Loss Push (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of Bobbi's program, the final block. Heavier compounds plus a short conditioning finisher each day to push fat loss. RPE 8. Give a deload (drop 1 set, ~20% less load) for her last Block 2 sessions before starting this. Update her Nutrition tab targets to 1950 cal / 195g protein / 169g carbs / 55g fat for this block.",
    days: [
      {
        name: "Day 1 — Full Body A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "6-8" },
          { exerciseName: "Barbell Row", sets: 4, reps: "8" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "10" },
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "8" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
        ],
      },
      {
        name: "Day 2 — Full Body B",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6-8" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "8" },
          { exerciseName: "Bulgarian Split Squat", sets: 4, reps: "8 per leg" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 4, reps: "8" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15" },
        ],
      },
    ],
  },
];
