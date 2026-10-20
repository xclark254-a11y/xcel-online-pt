// Rohan — 12-week program, 3x/week, fat loss + lean muscle (195 lbs at
// 27.4% body fat, up from 187 lbs/26.8% over the last 3 months — that gain
// came with a body fat increase too, so this phase targets a cut rather
// than continued bulking). Goal: lose at least 15 lbs (195 -> 180 or
// lower). 30 yrs old, 5'9". Upper back posture issues and hip tightness
// from a desk-heavy job — rows/face pulls/rear delt work are in every
// session for posture, and pairing this with the "Anterior Pelvic Tilt
// Correction" and "Low Back Relief for Desk Sitters" routines from the
// Mobility tab for daily hip-flexor stretching (no code needed for those,
// just assign them to him from the Mobility tab) is worth doing alongside
// this program. Three 4-week blocks. Assign Block 1 now via "Start now",
// then use "Add to schedule" for Blocks 2 and 3 so they queue up
// automatically as each one ends.

export const ROHAN_TEMPLATES = [
  {
    id: "tpl-rohan-block1",
    name: "Rohan — Block 1: Foundation (Wks 1-4)",
    level: "Intermediate",
    description: "Weeks 1-4 of Rohan's program. 3x/week, fat-loss priority with strength maintained, RPE 6-7. Heavy posture emphasis (face pulls, rows, band pull-aparts) given his desk job, and pair this with daily hip-flexor stretching from the Mobility tab. Set his Nutrition tab targets to 2100 cal / 185g protein / 194g carbs / 65g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "8" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Posture",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Day 3 — Full Body & Conditioning",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Barbell Row", sets: 3, reps: "10" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15" },
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
          { exerciseName: "Assault Bike", sets: 1, reps: "10 min intervals" },
        ],
      },
    ],
  },
  {
    id: "tpl-rohan-block2",
    name: "Rohan — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of Rohan's program. Heavier top sets, RPE 7-8, with conditioning volume ticking up to keep the fat-loss trend moving. Give a deload (drop 1 set, ~20% less load) for his last Block 1 sessions before starting this. Keep the posture and hip-flexor work going. Update his Nutrition tab targets to 2050 cal / 180g protein / 190g carbs / 63g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "6-8" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Posture",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { exerciseName: "Pull-Up", sets: 4, reps: "6-8 (assist if needed)" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8-10" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 3 — Full Body & Conditioning",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6-8" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Barbell Row", sets: 3, reps: "8-10" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15" },
          { exerciseName: "Kettlebell Swing", sets: 5, reps: "15" },
          { exerciseName: "Assault Bike", sets: 1, reps: "12 min intervals" },
        ],
      },
    ],
  },
  {
    id: "tpl-rohan-block3",
    name: "Rohan — Block 3: Fat-Loss Push (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of Rohan's program, the final block before reassessing toward his 180 lb target. Heavier top sets plus a longer conditioning finisher to close out the cut, RPE 8. Give a deload (drop 1 set, ~20% less load) for his last Block 2 sessions before starting this. Update his Nutrition tab targets to 2000 cal / 175g protein / 180g carbs / 60g fat for this block, and reassess his weight/body fat % and macros again once it ends.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "6" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "60 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Posture",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "6" },
          { exerciseName: "Pull-Up", sets: 4, reps: "8-10 (assist if needed)" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 3 — Full Body & Conditioning",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Barbell Row", sets: 3, reps: "8" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15" },
          { exerciseName: "Kettlebell Swing", sets: 6, reps: "15" },
          { exerciseName: "Assault Bike", sets: 1, reps: "15 min intervals" },
        ],
      },
    ],
  },
];
