// Rock — 12-week program, 4x/week, weight loss. 46 yrs old, 5'7", 250 lbs.
// Same workout structure as Shay's program (they're training together),
// with macros calculated for his own body stats. Day 1 is the in-person
// session with the trainer on weekends — the other 3 days are self-guided,
// so those lean on safer, lower-skill machine/dumbbell/kettlebell work
// rather than anything heavy or technical that needs coaching to do safely.
// Three 4-week blocks. Assign Block 1 now via "Start now", then use
// "Add to schedule" for Blocks 2 and 3 so they queue up automatically as
// each one ends.

export const ROCK_TEMPLATES = [
  {
    id: "tpl-rock-block1",
    name: "Rock — Block 1: Foundation (Wks 1-4)",
    level: "Beginner-Intermediate",
    description: "Weeks 1-4 of Rock's program. 4x/week, weight-loss priority, RPE 6-7. Day 1 is his in-person weekend session with you — that's where the Sumo Deadlift gets coached. Days 2-4 are self-guided and stick to machines/dumbbells/kettlebells so he's not loading anything technical without supervision. Set his Nutrition tab targets to 2150 cal / 195g protein / 207g carbs / 60g fat for this block.",
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
    id: "tpl-rock-block2",
    name: "Rock — Block 2: Build (Wks 5-8)",
    level: "Beginner-Intermediate",
    description: "Weeks 5-8 of Rock's program. Slightly heavier loads and more volume, RPE 7, as conditioning and movement quality improve. Give a deload (drop 1 set, ~20% less load) for his last Block 1 sessions before starting this. Update his Nutrition tab targets to 2100 cal / 190g protein / 200g carbs / 58g fat for this block.",
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
    id: "tpl-rock-block3",
    name: "Rock — Block 3: Fat-Loss Push (Wks 9-12)",
    level: "Beginner-Intermediate",
    description: "Weeks 9-12 of Rock's program, the final block. Heavier top sets and longer conditioning to close out the cut, RPE 7-8. Give a deload (drop 1 set, ~20% less load) for his last Block 2 sessions before starting this. Update his Nutrition tab targets to 2050 cal / 185g protein / 195g carbs / 56g fat for this block, and reassess his weight and macros again once it ends.",
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
