// David — 12-week return-to-training program (returning after a long layoff).
// Three 4-week blocks: assign Block 1 now via "Start now", then use "Add to
// schedule" for Blocks 2 and 3 so they queue up automatically as each one ends.
// Tue/Thu are supervised sessions; the third day is his solo gym day.

export const DAVID_TEMPLATES = [
  {
    id: "tpl-david-block1",
    name: "David — Block 1: Foundation (Wks 1-4)",
    level: "Beginner",
    description: "Weeks 1-4 of David's return-to-training program. Full-body 3x/week to rebuild movement patterns and conditioning after his layoff. Moderate loads, RPE 6-7. Tue/Thu supervised, third day solo. Update his Nutrition tab targets to 2200 cal / 205g protein / 185g carbs / 70g fat for this block.",
    days: [
      {
        name: "Tuesday — Full Body A",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
          { exerciseName: "Treadmill Intervals", sets: 1, reps: "10 min easy" },
        ],
      },
      {
        name: "Thursday — Full Body B",
        exercises: [
          { exerciseName: "Leg Press", sets: 3, reps: "12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10 (light)" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "10 min easy" },
        ],
      },
      {
        name: "Solo Day — Conditioning",
        exercises: [
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Push-Up", sets: 3, reps: "8-10" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
          { exerciseName: "Treadmill Intervals", sets: 1, reps: "15-20 min steady incline walk" },
        ],
      },
    ],
  },
  {
    id: "tpl-david-block2",
    name: "David — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of David's return-to-training program. Moves to an upper/lower split now that his base is built. Heavier loads, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for his last Block 1 sessions before starting this. Update his Nutrition tab targets to 2100 cal / 210g protein / 165g carbs / 65g fat for this block.",
    days: [
      {
        name: "Tuesday — Upper",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Thursday — Lower",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "8 (light-moderate)" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Leg Extension", sets: 3, reps: "12" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Solo Day — Full Body Conditioning",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15" },
          { exerciseName: "Push-Up", sets: 3, reps: "10-12" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Inverted Row", sets: 3, reps: "10" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
          { exerciseName: "Assault Bike", sets: 5, reps: "30 sec hard / 90 sec easy" },
        ],
      },
    ],
  },
  {
    id: "tpl-david-block3",
    name: "David — Block 3: Strength & Conditioning (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of David's return-to-training program, the final block. Heavier compounds and unilateral work, RPE 8. Give a deload (drop 1 set, ~20% less load) for his last Block 2 sessions before starting this. Update his Nutrition tab targets to 2300 cal / 210g protein / 215g carbs / 65g fat for this block.",
    days: [
      {
        name: "Tuesday — Upper Strength",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { exerciseName: "Barbell Row", sets: 4, reps: "6-8" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Cable Fly", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Thursday — Lower Strength",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "6-8" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "10" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Solo Day — Conditioning & Core",
        exercises: [
          { exerciseName: "Farmer's Carry", sets: 4, reps: "40 yd" },
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "15 min intervals" },
        ],
      },
    ],
  },
];
