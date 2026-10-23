// Jody — 12-week program, 3x/week, tone up + lean muscle gain. Training
// with her sister Lori on the same program — 5'5", ~130 lbs, naturally
// petite. Moderate rep ranges and a full-body-leaning split to build lean
// muscle across the whole body rather than chasing heavy top-end strength.
// Three 4-week blocks. Assign Block 1 now via "Start now", then use "Add
// to schedule" for Blocks 2 and 3 so they queue up automatically as each
// one ends.

export const JODY_TEMPLATES = [
  {
    id: "tpl-jody-block1",
    name: "Jody — Block 1: Foundation (Wks 1-4)",
    level: "Beginner-Intermediate",
    description: "Weeks 1-4 of Jody's program. 3x/week, lean muscle gain, RPE 6-7, moderate reps (10-15) to build work capacity and technique. This is a calorie surplus, not a cut — the goal is steady, healthy muscle gain. Set her Nutrition tab targets to 2050 cal / 105g protein / 261g carbs / 65g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Glutes",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "12" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "15" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Push & Pull)",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "12" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Lateral Raise", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
        ],
      },
      {
        name: "Day 3 — Full Body & Glute/Core Finisher",
        exercises: [
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15" },
        ],
      },
    ],
  },
  {
    id: "tpl-jody-block2",
    name: "Jody — Block 2: Build (Wks 5-8)",
    level: "Beginner-Intermediate",
    description: "Weeks 5-8 of Jody's program. Slightly heavier loads and more volume as her strength builds, RPE 7. Update her Nutrition tab targets to 2100 cal / 110g protein / 265g carbs / 67g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Glutes",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 4, reps: "12" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "12" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Push & Pull)",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "12" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Lateral Raise", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
        ],
      },
      {
        name: "Day 3 — Full Body & Glute/Core Finisher",
        exercises: [
          { exerciseName: "Bulgarian Split Squat", sets: 4, reps: "10 per leg" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
        ],
      },
    ],
  },
  {
    id: "tpl-jody-block3",
    name: "Jody — Block 3: Lean Muscle Push (Wks 9-12)",
    level: "Beginner-Intermediate",
    description: "Weeks 9-12 of Jody's program, the final block. A bit more load and volume to keep driving lean muscle gain, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for her last Block 2 sessions before starting this. Update her Nutrition tab targets to 2150 cal / 112g protein / 270g carbs / 70g fat for this block, and reassess her weight/progress photos again once it ends.",
    days: [
      {
        name: "Day 1 — Lower Body & Glutes",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 4, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "12" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Push & Pull)",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 4, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Lateral Raise", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "25" },
        ],
      },
      {
        name: "Day 3 — Full Body & Glute/Core Finisher",
        exercises: [
          { exerciseName: "Bulgarian Split Squat", sets: 4, reps: "10 per leg" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Cable Kickback", sets: 4, reps: "15 per leg" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
        ],
      },
    ],
  },
];
