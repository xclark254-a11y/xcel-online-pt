// Diana — 12-week program: overall fat loss, waist slimming, glute growth.
// Three 4-week blocks, all 3 days supervised. Assign Block 1 now via
// "Start now", then use "Add to schedule" for Blocks 2 and 3 so they queue
// up automatically as each one ends.

export const DIANA_TEMPLATES = [
  {
    id: "tpl-diana-block1",
    name: "Diana — Block 1: Foundation (Wks 1-4)",
    level: "Beginner",
    description: "Weeks 1-4 of Diana's program. Full-body 3x/week with a glute emphasis, moderate loads, RPE 6-7, core work biased toward anti-rotation/stability rather than loaded twisting (better for waist appearance than heavy oblique loading). Update her Nutrition tab targets to 1550 cal / 175g protein / 110g carbs / 45g fat for this block.",
    days: [
      {
        name: "Day 1 — Glute & Lower Focus",
        exercises: [
          { exerciseName: "Glute Bridge", sets: 3, reps: "15" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "12 per leg" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10 (light)" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "10 min easy" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Core",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20 (light)" },
        ],
      },
      {
        name: "Day 3 — Full Body & Glutes",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 3, reps: "15" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Push-Up", sets: 3, reps: "8-10" },
          { exerciseName: "Inverted Row", sets: 3, reps: "10" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
          { exerciseName: "Assault Bike", sets: 5, reps: "30 sec hard / 90 sec easy" },
        ],
      },
    ],
  },
  {
    id: "tpl-diana-block2",
    name: "Diana — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of Diana's program. More glute volume and isolation work, heavier loads, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for her last Block 1 sessions before starting this. Update her Nutrition tab targets to 1645 cal / 180g protein / 130g carbs / 45g fat for this block.",
    days: [
      {
        name: "Day 1 — Glute & Hamstring Focus",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 4, reps: "12" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10" },
          { exerciseName: "Curtsy Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Frog Pump", sets: 3, reps: "20" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Waist Core",
        exercises: [
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Cable Fly", sets: 3, reps: "12" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
          { exerciseName: "Cable Woodchop", sets: 3, reps: "12 per side" },
        ],
      },
      {
        name: "Day 3 — Glute & Full Body Conditioning",
        exercises: [
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Push-Up", sets: 3, reps: "10-12" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "10 min intervals" },
        ],
      },
    ],
  },
  {
    id: "tpl-diana-block3",
    name: "Diana — Block 3: Strength & Definition (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of Diana's program, the final block. Heavier glute-focused strength work and more conditioning to finish leaning out. RPE 8. Give a deload (drop 1 set, ~20% less load) for her last Block 2 sessions before starting this. Update her Nutrition tab targets to 1750 cal / 185g protein / 140g carbs / 50g fat for this block.",
    days: [
      {
        name: "Day 1 — Glute Strength",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 4, reps: "8-10" },
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Bulgarian Split Squat", sets: 4, reps: "8 per leg" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Frog Pump", sets: 3, reps: "20" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Day 2 — Upper Strength & Core",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "8" },
          { exerciseName: "Barbell Row", sets: 4, reps: "8" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Plank", sets: 3, reps: "60 sec" },
          { exerciseName: "Cable Woodchop", sets: 3, reps: "12 per side" },
        ],
      },
      {
        name: "Day 3 — Glutes & Conditioning Finisher",
        exercises: [
          { exerciseName: "Curtsy Lunge", sets: 4, reps: "10 per leg" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "12" },
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
          { exerciseName: "Farmer's Carry", sets: 3, reps: "40 yd" },
          { exerciseName: "Assault Bike", sets: 1, reps: "15 min intervals" },
        ],
      },
    ],
  },
];
