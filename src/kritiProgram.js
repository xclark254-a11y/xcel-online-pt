// Kriti — 12-week program, 3x/week, lean weight gain + continued strength
// (111 lbs, up from 100 lbs over the last 3 months — keep that trend going).
// 29 yrs old, 5'4", 22.9% body fat at last check. A year out from elbow/wrist
// surgery for carpal tunnel-type issues, with upper back posture issues on
// top of a desk job that flares her elbow. Exercise selection avoids direct
// elbow-isolation work and anything that loads the wrist in a fully extended
// position under load (no barbell curls, skull crushers, close-grip bench,
// dips, or flat-hand push-ups) — presses route through machines/dumbbells
// with a more neutral wrist, and pulling work leans on handles/neutral grips
// over a straight bar. Posture work (rows, face pulls, band pull-aparts) is
// in every session. Three 4-week blocks. Assign Block 1 now via "Start now",
// then use "Add to schedule" for Blocks 2 and 3 so they queue up automatically
// as each one ends.
//
// If her elbow flares from a day at the desk, scale that session's pressing
// load down and lean harder on the machine-supported options (Machine Chest
// Press over anything free-weight) rather than pushing through it.

export const KRITI_TEMPLATES = [
  {
    id: "tpl-kriti-block1",
    name: "Kriti — Block 1: Foundation (Wks 1-4)",
    level: "Intermediate",
    description: "Weeks 1-4 of Kriti's program. 3x/week, lean weight gain + strength, RPE 6-7. No direct elbow isolation (no curls, skull crushers, close-grip bench, dips) and no flat-hand push-ups — presses go through machines/dumbbells, pulling work uses handles/neutral grips. Posture work (rows, face pulls, band pull-aparts) is built into every session. If her elbow irritation flares from desk work that day, drop the load on pressing and lean on Machine Chest Press over anything free-weight. Set her Nutrition tab targets to 1950 cal / 105g protein / 230g carbs / 65g fat for this block — this is a surplus, the goal is continued healthy weight gain.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Leg Press", sets: 3, reps: "12" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Elbow/Wrist-Friendly)",
        exercises: [
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Machine Chest Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10 (light-moderate)" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
        ],
      },
      {
        name: "Day 3 — Full Body & Core",
        exercises: [
          { exerciseName: "Kettlebell Deadlift", sets: 3, reps: "10" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15 (light)" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
        ],
      },
    ],
  },
  {
    id: "tpl-kriti-block2",
    name: "Kriti — Block 2: Build (Wks 5-8)",
    level: "Intermediate",
    description: "Weeks 5-8 of Kriti's program. Slightly heavier loads as weight and strength continue to build, RPE 7. Same elbow/wrist-friendly exercise selection as Block 1 — still no curls, skull crushers, close-grip bench, dips, or flat-hand push-ups. Keep checking in on her elbow before adding load to pressing. Update her Nutrition tab targets to 2000 cal / 108g protein / 235g carbs / 67g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 4, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8-10" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Leg Press", sets: 3, reps: "10" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Elbow/Wrist-Friendly)",
        exercises: [
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Machine Chest Press", sets: 4, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec" },
        ],
      },
      {
        name: "Day 3 — Full Body & Core",
        exercises: [
          { exerciseName: "Kettlebell Deadlift", sets: 4, reps: "10" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "12 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "25 sec each side" },
        ],
      },
    ],
  },
  {
    id: "tpl-kriti-block3",
    name: "Kriti — Block 3: Strength Push (Wks 9-12)",
    level: "Intermediate",
    description: "Weeks 9-12 of Kriti's program, the final block. Pushes strength a bit further while keeping the same elbow/wrist-safe exercise list, RPE 7-8. Reassess her weight and body fat % at the end of this block to recalibrate macros for the next phase. Update her Nutrition tab targets to 2050 cal / 112g protein / 240g carbs / 68g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body & Posture",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 4, reps: "8-10" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "10" },
          { exerciseName: "Leg Press", sets: 4, reps: "10" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Upper Body (Elbow/Wrist-Friendly)",
        exercises: [
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Machine Chest Press", sets: 4, reps: "8-10" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8-10" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
        ],
      },
      {
        name: "Day 3 — Full Body & Core",
        exercises: [
          { exerciseName: "Kettlebell Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Rear Delt Fly", sets: 3, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "12 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
        ],
      },
    ],
  },
];
