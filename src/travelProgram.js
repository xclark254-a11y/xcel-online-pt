// No-equipment travel program — for clients without gym access (e.g. a trip).
// 4 rotating bodyweight days, hotel-room/park friendly. Meant to be cycled
// loosely rather than tied to specific calendar days — good for travel where
// the daily schedule isn't predictable. Pair with the "Anterior Pelvic Tilt
// Correction" and "Low Back Relief for Desk Sitters" routines from the
// Mobility tab (already built in) for daily stretching — no code needed for
// those, just assign them to each client from the Mobility tab.

export const TRAVEL_TEMPLATES = [
  {
    id: "tpl-travel-nogym",
    name: "Travel — No-Gym Bodyweight Program (13 Days)",
    level: "All levels",
    description: "For clients without gym access while traveling. 4 rotating bodyweight days, no equipment, hotel-room or park friendly. Cycle through the 4 days in whatever order fits the trip — aim for 4-6 sessions across 13 days, resting or walking the rest (sightseeing usually covers plenty of daily activity). Kept low-impact and core/glute-focused given tight hip flexors and lower back pain from desk work. Also assign the \"Anterior Pelvic Tilt Correction\" and \"Low Back Relief for Desk Sitters\" routines from the Mobility tab for daily stretching alongside this.",
    days: [
      {
        name: "Day A — Full Body Bodyweight I",
        exercises: [
          { exerciseName: "Push-Up", sets: 3, reps: "10-12" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
          { exerciseName: "Glute Bridge", sets: 3, reps: "15" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
        ],
      },
      {
        name: "Day B — Full Body Bodyweight II",
        exercises: [
          { exerciseName: "Incline Push-Up", sets: 3, reps: "10-12" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg (use a bed/chair edge)" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
          { exerciseName: "Wall Sit", sets: 3, reps: "30 sec" },
          { exerciseName: "Bicycle Crunch", sets: 3, reps: "20 total" },
        ],
      },
      {
        name: "Day C — Core & Glute Focus (Back-Friendly)",
        exercises: [
          { exerciseName: "Glute Bridge", sets: 3, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Side Plank", sets: 3, reps: "20 sec each side" },
          { exerciseName: "Glute Bridge March", sets: 3, reps: "10 per side" },
          { exerciseName: "Lying Leg Raise", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Day D — Bodyweight Conditioning",
        exercises: [
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Push-Up", sets: 3, reps: "10-12" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
          { exerciseName: "Skater Hop", sets: 3, reps: "10 per side (skip if the back feels tight that day)" },
        ],
      },
    ],
  },
];
