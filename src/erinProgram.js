// Erin — 12-week program, 4x/week, fat loss priority (193 lbs -> 173 lbs
// first target). 39 yrs old, 5'7", advanced lifter who competed in
// weightlifting — technique is not a limiting factor, but she has
// longstanding knee pain from years of heavy competition squatting/lunging.
// Lower-body days are built around hip-hinge and machine-supported patterns
// (RDL, hip thrust, leg press, cable work) instead of deep loaded knee
// flexion (back squats, lunges, box jumps, step-ups) to keep volume high
// without flaring her knees. Three 4-week blocks. Assign Block 1 now via
// "Start now", then use "Add to schedule" for Blocks 2 and 3 so they queue
// up automatically as each one ends.
//
// Flag to Erin before Day 1/Day 3: any knee pinching or sharp pain on leg
// press/RDL means stop that exercise for the session and swap in more
// Cable Kickback / Glute Bridge / Seated Leg Curl volume instead.

export const ERIN_TEMPLATES = [
  {
    id: "tpl-erin-block1",
    name: "Erin — Block 1: Foundation (Wks 1-4)",
    level: "Advanced",
    description: "Weeks 1-4 of Erin's program. 4x/week, fat-loss priority, RPE 6-7. Lower-body days lean on hip-hinge and machine-supported patterns (RDL, hip thrust, leg press, cable kickback) to keep her knees happy while still training hard — no deep loaded knee flexion (no back squats, lunges, step-ups, or jump work) this block. She's an experienced lifter so load/tempo cues aren't needed, just watch for any knee pinching on Leg Press or RDL and swap toward Hip Thrust/Cable Kickback/Glute Bridge volume if it shows up. Set her Nutrition tab targets to 1750 cal / 180g protein / 135g carbs / 55g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body (Posterior Chain)",
        exercises: [
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "10" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "12" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec each side" },
        ],
      },
      {
        name: "Day 2 — Upper Body Push & Core",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8-10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12" },
          { exerciseName: "Cable Woodchop", sets: 3, reps: "12 per side" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Day 3 — Lower Body (Quad/Glute, Knee-Friendly) & Conditioning",
        exercises: [
          { exerciseName: "Leg Press", sets: 4, reps: "12 (moderate depth, controlled)" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Pull-Through", sets: 3, reps: "15" },
          { exerciseName: "Machine Hip Abduction", sets: 3, reps: "15" },
          { exerciseName: "Frog Pump", sets: 3, reps: "20" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "10 min easy-moderate" },
        ],
      },
      {
        name: "Day 4 — Upper Body Pull & Conditioning",
        exercises: [
          { exerciseName: "Lat Pulldown", sets: 4, reps: "10" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
          { exerciseName: "Assault Bike", sets: 5, reps: "30 sec hard / 90 sec easy" },
        ],
      },
    ],
  },
  {
    id: "tpl-erin-block2",
    name: "Erin — Block 2: Build (Wks 5-8)",
    level: "Advanced",
    description: "Weeks 5-8 of Erin's program. Heavier loads and a bit more density now that the lower-body patterning is dialed in, RPE 7-8. Sumo Deadlift is introduced (hip-dominant hinge, much less knee flexion than a conventional or back squat) — cue her to sit back into it rather than down. Give a deload (drop 1 set, ~20% less load) for her last Block 1 sessions before starting this. Recheck in with her on knees before adding Sumo Deadlift load. Update her Nutrition tab targets to 1700 cal / 175g protein / 128g carbs / 54g fat for this block.",
    days: [
      {
        name: "Day 1 — Lower Body (Posterior Chain)",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "10" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
          { exerciseName: "Side Plank", sets: 3, reps: "40 sec each side" },
        ],
      },
      {
        name: "Day 2 — Upper Body Push & Core",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10" },
          { exerciseName: "Cable Fly", sets: 3, reps: "12" },
          { exerciseName: "Overhead Tricep Extension", sets: 3, reps: "12" },
          { exerciseName: "Cable Woodchop", sets: 3, reps: "12 per side" },
          { exerciseName: "Ab Wheel Rollout", sets: 3, reps: "10" },
        ],
      },
      {
        name: "Day 3 — Lower Body (Quad/Glute, Knee-Friendly) & Conditioning",
        exercises: [
          { exerciseName: "Leg Press", sets: 4, reps: "10 (moderate depth, controlled)" },
          { exerciseName: "Cable Pull-Through", sets: 4, reps: "15" },
          { exerciseName: "Machine Hip Abduction", sets: 3, reps: "15" },
          { exerciseName: "Frog Pump", sets: 3, reps: "20" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12" },
          { exerciseName: "Kettlebell Swing", sets: 5, reps: "20" },
        ],
      },
      {
        name: "Day 4 — Upper Body Pull & Conditioning",
        exercises: [
          { exerciseName: "Pull-Up", sets: 4, reps: "6-8 (assist if needed)" },
          { exerciseName: "T-Bar Row", sets: 4, reps: "10" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "12" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "12 min intervals" },
        ],
      },
    ],
  },
  {
    id: "tpl-erin-block3",
    name: "Erin — Block 3: Intensity & Conditioning Push (Wks 9-12)",
    level: "Advanced",
    description: "Weeks 9-12 of Erin's program, the final block before reassessing toward her 173 lb target. Heavier top sets plus a conditioning finisher each lower day to push the fat-loss phase, RPE 8. Give a deload (drop 1 set, ~20% less load) for her last Block 2 sessions before starting this. Keep checking in on her knees as sumo deadlift load climbs — pull it back to RDL/hip thrust volume on any bad days. Update her Nutrition tab targets to 1650 cal / 170g protein / 125g carbs / 52g fat for this block, and reassess her weight/macros again once this block ends.",
    days: [
      {
        name: "Day 1 — Lower Body (Posterior Chain)",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6-8" },
          { exerciseName: "Hip Thrust", sets: 4, reps: "8-10" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "15 per leg" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15" },
          { exerciseName: "Plank", sets: 3, reps: "60 sec" },
        ],
      },
      {
        name: "Day 2 — Upper Body Push & Core",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { exerciseName: "Arnold Press", sets: 4, reps: "8-10" },
          { exerciseName: "Cable Fly", sets: 3, reps: "12" },
          { exerciseName: "Dip", sets: 3, reps: "10-12" },
          { exerciseName: "Ab Wheel Rollout", sets: 3, reps: "12" },
          { exerciseName: "Assault Bike", sets: 6, reps: "30 sec hard / 60 sec easy" },
        ],
      },
      {
        name: "Day 3 — Lower Body (Quad/Glute, Knee-Friendly) & Conditioning",
        exercises: [
          { exerciseName: "Leg Press", sets: 4, reps: "10 (moderate depth, controlled)" },
          { exerciseName: "Cable Pull-Through", sets: 4, reps: "15" },
          { exerciseName: "Machine Hip Abduction", sets: 3, reps: "15" },
          { exerciseName: "Frog Pump", sets: 3, reps: "20" },
          { exerciseName: "Kettlebell Swing", sets: 6, reps: "20" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "15 min intervals" },
        ],
      },
      {
        name: "Day 4 — Upper Body Pull & Conditioning",
        exercises: [
          { exerciseName: "Pull-Up", sets: 4, reps: "8-10 (assist if needed)" },
          { exerciseName: "T-Bar Row", sets: 4, reps: "8-10" },
          { exerciseName: "Chest-Supported Row", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "15" },
          { exerciseName: "Battle Ropes", sets: 6, reps: "30 sec" },
        ],
      },
    ],
  },
];
