// Shay — 12-week program, 4x/week, weight loss. 47 yrs old, 5'5", 215 lbs.
// Same workout structure as Rock's program (they're training together),
// with macros calculated for her own body stats. Day 1 is the in-person
// session with the trainer on weekends — the other 3 days are self-guided,
// so those lean on safer, lower-skill machine/dumbbell/kettlebell work
// rather than anything heavy or technical that needs coaching to do safely.
// Three 4-week blocks. Assign Block 1 now via "Start now", then use
// "Add to schedule" for Blocks 2 and 3 so they queue up automatically as
// each one ends.

export const SHAY_TEMPLATES = [
  {
    id: "tpl-shay-block1",
    name: "Shay — Block 1: Foundation (Wks 1-4)",
    level: "Beginner-Intermediate",
    description: "Weeks 1-4 of Shay's program. 4x/week, weight-loss priority, RPE 6-7. Day 1 is her in-person weekend session with you — that's where the Sumo Deadlift gets coached. Days 2-4 are self-guided and stick to machines/dumbbells/kettlebells so she's not loading anything technical without supervision. Set her Nutrition tab targets to 1700 cal / 150g protein / 151g carbs / 55g fat for this block.",
    days: [
      {
        name: "Day 1 — Full Body Strength (In-Person, Weekend)",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 3, reps: "8 (light-moderate, technique-focused)" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
        ],
      },
      {
        name: "Day 2 — Lower Body & Core (Self-Guided)",
        exercises: [
          { exerciseName: "Leg Press", sets: 3, reps: "12" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
        ],
      },
      {
        name: "Day 3 — Upper Body (Self-Guided)",
        exercises: [
          { exerciseName: "Machine Chest Press", sets: 3, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
        ],
      },
      {
        name: "Day 4 — Full Body & Conditioning (Self-Guided)",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "10 min intervals" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
        ],
      },
    ],
  },
  {
    id: "tpl-shay-block2",
    name: "Shay — Block 2: Build (Wks 5-8)",
    level: "Beginner-Intermediate",
    description: "Weeks 5-8 of Shay's program. Slightly heavier loads and more volume, RPE 7, as conditioning and movement quality improve. Give a deload (drop 1 set, ~20% less load) for her last Block 1 sessions before starting this. Update her Nutrition tab targets to 1650 cal / 145g protein / 145g carbs / 53g fat for this block.",
    days: [
      {
        name: "Day 1 — Full Body Strength (In-Person, Weekend)",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Goblet Squat", sets: 4, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec" },
        ],
      },
      {
        name: "Day 2 — Lower Body & Core (Self-Guided)",
        exercises: [
          { exerciseName: "Leg Press", sets: 4, reps: "12" },
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "12 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "25 sec each side" },
        ],
      },
      {
        name: "Day 3 — Upper Body (Self-Guided)",
        exercises: [
          { exerciseName: "Machine Chest Press", sets: 4, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
        ],
      },
      {
        name: "Day 4 — Full Body & Conditioning (Self-Guided)",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "12 min intervals" },
          { exerciseName: "Plank", sets: 3, reps: "40 sec" },
        ],
      },
    ],
  },
  {
    id: "tpl-shay-block3",
    name: "Shay — Block 3: Fat-Loss Push (Wks 9-12)",
    level: "Beginner-Intermediate",
    description: "Weeks 9-12 of Shay's program, the final block. Heavier top sets and longer conditioning to close out the cut, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for her last Block 2 sessions before starting this. Update her Nutrition tab targets to 1600 cal / 140g protein / 140g carbs / 51g fat for this block, and reassess her weight and macros again once it ends.",
    days: [
      {
        name: "Day 1 — Full Body Strength (In-Person, Weekend)",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6-8" },
          { exerciseName: "Goblet Squat", sets: 4, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8-10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
        ],
      },
      {
        name: "Day 2 — Lower Body & Core (Self-Guided)",
        exercises: [
          { exerciseName: "Leg Press", sets: 4, reps: "10-12" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "10" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "12 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
        ],
      },
      {
        name: "Day 3 — Upper Body (Self-Guided)",
        exercises: [
          { exerciseName: "Machine Chest Press", sets: 4, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "8-10" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "25" },
        ],
      },
      {
        name: "Day 4 — Full Body & Conditioning (Self-Guided)",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 5, reps: "15" },
          { exerciseName: "Goblet Squat", sets: 4, reps: "12" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "15 min intervals" },
          { exerciseName: "Plank", sets: 3, reps: "50 sec" },
        ],
      },
    ],
  },
];
