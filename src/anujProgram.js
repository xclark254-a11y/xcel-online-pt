// Anuj — 12-week fat-loss program, 4x/week upper/lower split. Built as
// supersets (A1/A2, B1/B2, etc.) to keep each session to about 45-50
// minutes — do the pair back to back, rest 45-60 sec, repeat for all
// rounds. Reps stay in the 10-15 range throughout; progression comes from
// adding weight each block, not changing the rep target. Three 4-week
// blocks — assign Block 1 now via "Start now", then use "Add to schedule"
// for Blocks 2 and 3 so they queue up automatically as each one ends.

export const ANUJ_TEMPLATES = [
  {
    id: "tpl-anuj-block1",
    name: "Anuj — Block 1: Foundation (Wks 1-4)",
    level: "Intermediate",
    description: "Weeks 1-4 of Anuj's program. Upper/lower split, 4x/week, built as supersets to fit a 45-50 min session. Moderate loads, RPE 6-7, reps 10-15 throughout. Do each lettered pair back to back (A1 then A2), rest 45-60 sec, repeat for all rounds. Update his Nutrition tab targets to 2300 cal / 220g protein / 208g carbs / 65g fat for this block.",
    days: [
      {
        name: "Day 1 — Upper A",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "12 (A1)" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12 (A2)" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "12 (B1)" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12 (B2)" },
          { exerciseName: "Cable Fly", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Face Pull", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec (E1)" },
          { exerciseName: "Russian Twist", sets: 3, reps: "15 (E2)" },
        ],
      },
      {
        name: "Day 2 — Lower A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 3, reps: "12 (A1, moderate)" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "12 (A2)" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg (B1)" },
          { exerciseName: "Leg Press", sets: 3, reps: "15 (B2)" },
          { exerciseName: "Leg Extension", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "15 (D1)" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15 (D2)" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side (E1)" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side (E2)" },
        ],
      },
      {
        name: "Day 3 — Upper B",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 3, reps: "12 (A1)" },
          { exerciseName: "Barbell Row", sets: 3, reps: "12 (A2)" },
          { exerciseName: "Arnold Press", sets: 3, reps: "12 (B1)" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "12 (B2)" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Preacher Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Skull Crusher", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Cable Crunch", sets: 3, reps: "15 (E1)" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec (E2)" },
        ],
      },
      {
        name: "Day 4 — Lower B",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 3, reps: "12 (A1)" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "12 per leg (A2)" },
          { exerciseName: "Leg Press", sets: 3, reps: "15 (B1)" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15 (B2)" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg (C1)" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec (D1)" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12 (D2)" },
        ],
      },
    ],
  },
  {
    id: "tpl-anuj-block2",
    name: "Anuj — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of Anuj's program. Same superset format, heavier loads, still 10-15 reps. RPE 7-8. Give a deload (drop 1 set, ~20% less load) for his last Block 1 sessions before starting this. Update his Nutrition tab targets to 2150 cal / 225g protein / 178g carbs / 60g fat for this block.",
    days: [
      {
        name: "Day 1 — Upper A",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10-12 (A1)" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10-12 (A2)" },
          { exerciseName: "Arnold Press", sets: 3, reps: "12 (B1)" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "12 (B2)" },
          { exerciseName: "Cable Fly", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Face Pull", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec (E1)" },
          { exerciseName: "Russian Twist", sets: 3, reps: "15 (E2)" },
        ],
      },
      {
        name: "Day 2 — Lower A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10 (A2)" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg (B1)" },
          { exerciseName: "Leg Press", sets: 3, reps: "15 (B2)" },
          { exerciseName: "Leg Extension", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15 (D2)" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side (E1)" },
          { exerciseName: "Side Plank", sets: 3, reps: "25 sec each side (E2)" },
        ],
      },
      {
        name: "Day 3 — Upper B",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Barbell Row", sets: 4, reps: "10 (A2)" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "12 (B1)" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12 (B2)" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Preacher Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Skull Crusher", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Cable Crunch", sets: 3, reps: "15 (E1)" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "40 sec (E2)" },
        ],
      },
      {
        name: "Day 4 — Lower B",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg (A2)" },
          { exerciseName: "Leg Press", sets: 3, reps: "15 (B1)" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15 (B2)" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg (C1)" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec (D1)" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15 (D2)" },
        ],
      },
    ],
  },
  {
    id: "tpl-anuj-block3",
    name: "Anuj — Block 3: Fat Loss Push (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of Anuj's program, the final block. Heaviest loads of the program at the lower end of the 10-15 rep window, plus a short finisher each day to push fat loss. RPE 8. Give a deload (drop 1 set, ~20% less load) for his last Block 2 sessions before starting this. Update his Nutrition tab targets to 2050 cal / 230g protein / 159g carbs / 55g fat for this block.",
    days: [
      {
        name: "Day 1 — Upper A",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10 (A2)" },
          { exerciseName: "Arnold Press", sets: 4, reps: "10 (B1)" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 4, reps: "10 (B2)" },
          { exerciseName: "Cable Fly", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Face Pull", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "40 sec (Finisher)" },
        ],
      },
      {
        name: "Day 2 — Lower A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10 (A2)" },
          { exerciseName: "Walking Lunge", sets: 4, reps: "12 per leg (B1)" },
          { exerciseName: "Leg Press", sets: 4, reps: "12 (B2)" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12 (C1)" },
          { exerciseName: "Leg Extension", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Dead Bug", sets: 3, reps: "12 per side (D1)" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side (D2)" },
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15 (Finisher)" },
        ],
      },
      {
        name: "Day 3 — Upper B",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Barbell Row", sets: 4, reps: "10 (A2)" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 4, reps: "10 (B1)" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10 (B2)" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "15 (C1)" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Preacher Curl", sets: 3, reps: "12 (D1)" },
          { exerciseName: "Skull Crusher", sets: 3, reps: "12 (D2)" },
          { exerciseName: "Cable Crunch", sets: 3, reps: "15 (Finisher)" },
        ],
      },
      {
        name: "Day 4 — Lower B",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "10 (A1)" },
          { exerciseName: "Bulgarian Split Squat", sets: 4, reps: "10 per leg (A2)" },
          { exerciseName: "Leg Press", sets: 4, reps: "12 (B1)" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15 (B2)" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg (C1)" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15 (C2)" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "40 sec (Finisher)" },
        ],
      },
    ],
  },
];
