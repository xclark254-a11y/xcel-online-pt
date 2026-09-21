// Boot Camp program: Mon (Upper) / Wed (Lower) / Sat (Full Body), supersets + finisher.
// Block A = Weeks 1-2 exercises, Block B = Weeks 3-4 exercises.
// Exercises that aren't in the library yet get added automatically the next time the app loads.

export const BOOTCAMP_EXERCISES = [
  { name: "Dumbbell Bench Press", muscle: "Chest", equipment: "Dumbbell", instructions: "Lie on a bench with a dumbbell in each hand at chest level, press up until the arms are straight, lower with control." },
  { name: "Dumbbell Curl", muscle: "Arms", equipment: "Dumbbell", instructions: "Stand tall with a dumbbell in each hand, curl up without swinging the body, lower slowly." },
  { name: "Plank Shoulder Tap", muscle: "Core", equipment: "Bodyweight", instructions: "From a high plank with feet wide, tap one shoulder with the opposite hand while keeping the hips square, alternate sides." },
  { name: "Dumbbell Romanian Deadlift", muscle: "Legs", equipment: "Dumbbell", instructions: "Soft knees, hinge at the hips pushing them back with the dumbbells sliding down the thighs, feel the hamstrings stretch, drive hips forward to stand." },
  { name: "Dumbbell Reverse Lunge", muscle: "Legs", equipment: "Dumbbell", instructions: "Holding dumbbells at your sides, step one foot back and lower until both knees are about 90 degrees, drive through the front heel to stand." },
  { name: "Dumbbell Sumo Squat", muscle: "Legs", equipment: "Dumbbell", instructions: "Wide stance with toes turned out, hold one dumbbell between the legs, squat down keeping the chest up, stand and squeeze the glutes." },
  { name: "Slider Hamstring Curl", muscle: "Legs", equipment: "Bodyweight", instructions: "Lie on your back with heels on sliders or towels, lift the hips, slide the heels out and curl them back in keeping the hips high." },
  { name: "Wall Sit", muscle: "Legs", equipment: "Bodyweight", instructions: "Back flat against a wall, slide down until the knees are at 90 degrees, hold for time with the weight through the heels." },
  { name: "Squat Jump", muscle: "Legs", equipment: "Bodyweight", instructions: "Squat down, explode upward into a jump, land softly back into the next squat." },
  { name: "Bent-Over Dumbbell Row", muscle: "Back", equipment: "Dumbbell", instructions: "Hinge forward with a flat back, dumbbells hanging, row both to the ribs squeezing the shoulder blades, lower with control." },
  { name: "Dumbbell Thruster", muscle: "Full Body", equipment: "Dumbbell", instructions: "Hold dumbbells at the shoulders, squat down, then drive up and press the weights overhead in one smooth motion." },
  { name: "Renegade Row", muscle: "Back", equipment: "Dumbbell", instructions: "High plank with hands on dumbbells and feet wide, row one dumbbell to the ribs without rotating the hips, alternate sides." },
  { name: "Dumbbell Push Press", muscle: "Shoulders", equipment: "Dumbbell", instructions: "Dumbbells at the shoulders, dip slightly at the knees, then drive up with the legs and press the weights overhead." },
  { name: "Bicycle Crunch", muscle: "Core", equipment: "Bodyweight", instructions: "Lying on your back with hands behind the head, bring opposite elbow to knee while extending the other leg, alternate in a pedaling motion." },
  { name: "Burpee", muscle: "Full Body", equipment: "Bodyweight", instructions: "Drop hands to the floor, kick the feet back to a plank, do a push-up, jump the feet in and finish with a jump." },
  { name: "Decline Push-Up", muscle: "Chest", equipment: "Bodyweight", instructions: "Feet elevated on a bench or box, hands under the shoulders, lower the chest to the floor keeping the body in a straight line, press back up. Slow the lowering for a tempo version." },
  { name: "Plank Up-Down", muscle: "Core", equipment: "Bodyweight", instructions: "From a forearm plank, press up onto one hand then the other into a high plank, lower back down one arm at a time, switch the lead arm each rep." },
  { name: "Dumbbell Hip Thrust", muscle: "Glutes", equipment: "Dumbbell", instructions: "Upper back against a bench with a dumbbell across the hips, drive the hips up squeezing the glutes at the top, lower with control." },
  { name: "Dumbbell Stiff-Leg Deadlift", muscle: "Legs", equipment: "Dumbbell", instructions: "Legs nearly straight, hinge at the hips lowering the dumbbells along the legs until you feel a deep hamstring stretch, stand tall." },
  { name: "Dumbbell Lateral Lunge", muscle: "Legs", equipment: "Dumbbell", instructions: "Step wide to one side, sit back into that hip keeping the other leg straight, push off to return to standing, alternate sides." },
  { name: "Kettlebell Sumo Deadlift", muscle: "Legs", equipment: "Kettlebell", instructions: "Wide stance with toes out, kettlebell between the feet, keep the chest tall and stand by driving through the floor." },
  { name: "Dumbbell Front Squat", muscle: "Legs", equipment: "Dumbbell", instructions: "Hold dumbbells at the shoulders with elbows forward, squat to at least parallel keeping the torso upright, drive back up." },
  { name: "Glute Bridge March", muscle: "Glutes", equipment: "Bodyweight", instructions: "Hold a glute bridge at the top and alternate lifting one knee toward the chest without letting the hips drop." },
  { name: "Single-Leg Calf Raise", muscle: "Legs", equipment: "Bodyweight", instructions: "Stand on one foot holding a wall for balance, rise as high as possible onto the toes, lower for a full stretch." },
  { name: "Skater Hop", muscle: "Legs", equipment: "Bodyweight", instructions: "Leap sideways from one foot to the other, landing softly on a bent knee with the trailing leg swinging behind." },
  { name: "Dumbbell Clean and Press", muscle: "Full Body", equipment: "Dumbbell", instructions: "Dumbbells at the thighs, explosively pull them to the shoulders, then press overhead, lower back down with control." },
  { name: "Goblet Reverse Lunge", muscle: "Legs", equipment: "Dumbbell", instructions: "Hold one dumbbell at the chest, step back into a lunge keeping the torso upright, drive through the front heel to stand." },
  { name: "Single-Arm Kettlebell Swing", muscle: "Full Body", equipment: "Kettlebell", instructions: "Hinge at the hips and swing the kettlebell with one hand to chest height using a hip snap, keep the core tight, switch hands as prescribed." },
  { name: "Dumbbell Squat to Row", muscle: "Full Body", equipment: "Dumbbell", instructions: "Hold dumbbells and squat down, as you stand hinge slightly and row both weights to the ribs, reset and repeat." },
  { name: "Plank Drag", muscle: "Core", equipment: "Bodyweight", instructions: "High plank with a light weight or towel beside one hand, drag it across the floor under the body with the opposite hand while keeping the hips still." },
  { name: "Dumbbell Step-Up to Curl", muscle: "Full Body", equipment: "Dumbbell", instructions: "Step up onto a box or bench, curl the dumbbells as you reach the top, lower the weights and step back down." },
  { name: "Tricep Kickback", muscle: "Arms", equipment: "Dumbbell", instructions: "Hinge forward with the upper arms pinned to the sides, extend the elbows straight back squeezing the triceps, lower with control." },
  { name: "Lying Leg Raise", muscle: "Core", equipment: "Bodyweight", instructions: "Lie on your back with legs straight, lift them to vertical keeping the lower back pressed down, lower slowly without touching the floor." },
];

// [exercise name, superset label] pairs. Each day = 5 superset pairs + a finisher.
// Finisher = { name, sets, reps } (fixed across weeks).
const BLOCKS = {
  A: [
    {
      name: "Monday — Upper Body A",
      pairs: [
        ["Dumbbell Bench Press", "Single-Arm Dumbbell Row"],
        ["Dumbbell Shoulder Press", "Band Pull-Apart"],
        ["Push-Up", "Inverted Row"],
        ["Dumbbell Curl", "Overhead Tricep Extension"],
        ["Lateral Raise", "Plank Shoulder Tap"],
      ],
      finisher: { name: "Mountain Climber", sets: 3, reps: "30 sec" },
    },
    {
      name: "Wednesday — Lower Body A",
      pairs: [
        ["Goblet Squat", "Glute Bridge"],
        ["Dumbbell Romanian Deadlift", "Dumbbell Reverse Lunge"],
        ["Dumbbell Step-Up", "Kettlebell Swing"],
        ["Dumbbell Sumo Squat", "Slider Hamstring Curl"],
        ["Standing Calf Raise", "Wall Sit"],
      ],
      finisher: { name: "Squat Jump", sets: 3, reps: "30 sec" },
    },
    {
      name: "Saturday — Full Body A",
      pairs: [
        ["Kettlebell Swing", "Push-Up"],
        ["Goblet Squat", "Bent-Over Dumbbell Row"],
        ["Dumbbell Thruster", "Renegade Row"],
        ["Dumbbell Reverse Lunge", "Dumbbell Push Press"],
        ["Dead Bug", "Bicycle Crunch"],
      ],
      finisher: { name: "Burpee", sets: 1, reps: "5 min AMRAP: 5 burpees + 10 air squats" },
    },
  ],
  B: [
    {
      name: "Monday — Upper Body B",
      pairs: [
        ["Incline Dumbbell Press", "Bent-Over Dumbbell Row"],
        ["Arnold Press", "Band Face Pull"],
        ["Decline Push-Up", "Renegade Row"],
        ["Hammer Curl", "Bench Dip"],
        ["Rear Delt Fly", "Plank Up-Down"],
      ],
      finisher: { name: "Battle Ropes", sets: 3, reps: "30 sec" },
    },
    {
      name: "Wednesday — Lower Body B",
      pairs: [
        ["Bulgarian Split Squat", "Dumbbell Hip Thrust"],
        ["Dumbbell Stiff-Leg Deadlift", "Dumbbell Lateral Lunge"],
        ["Curtsy Lunge", "Kettlebell Sumo Deadlift"],
        ["Dumbbell Front Squat", "Glute Bridge March"],
        ["Single-Leg Calf Raise", "Side Plank"],
      ],
      finisher: { name: "Skater Hop", sets: 3, reps: "30 sec" },
    },
    {
      name: "Saturday — Full Body B",
      pairs: [
        ["Dumbbell Clean and Press", "Goblet Reverse Lunge"],
        ["Push-Up", "Single-Arm Kettlebell Swing"],
        ["Dumbbell Squat to Row", "Plank Drag"],
        ["Dumbbell Step-Up to Curl", "Tricep Kickback"],
        ["Russian Twist", "Lying Leg Raise"],
      ],
      finisher: { name: "Kettlebell Swing", sets: 1, reps: "5 min AMRAP: 10 swings + 5 push-ups" },
    },
  ],
};

// Weekly progression. Block A is used in weeks 1-2, Block B in weeks 3-4.
const WEEKS = [
  { week: 1, block: "A", sets: 3, reps: "12", label: "Foundation", tip: "Moderate weight, focus on form." },
  { week: 2, block: "A", sets: 3, reps: "10-12", label: "Add Weight", tip: "Go up in weight from Week 1." },
  { week: 3, block: "B", sets: 4, reps: "8-10", label: "Heavier", tip: "Heavier weight, one extra round." },
  { week: 4, block: "B", sets: 4, reps: "10", label: "Finish Strong", tip: "Push the last round to near failure." },
];

const LETTERS = ["A", "B", "C", "D", "E"];

function buildWeek({ week, block, sets, reps, label, tip }) {
  return {
    id: `tpl-bootcamp-w${week}`,
    name: `Boot Camp — Week ${week}: ${label} (Block ${block})`,
    level: "All levels",
    description: `Boot Camp week ${week} of 4. Mon upper, Wed lower, Sat full body. Each exercise pair is a superset: do the two back to back (A1 then A2), rest 45-60 sec, repeat for all rounds. ${tip}`,
    days: BLOCKS[block].map((day) => ({
      name: day.name,
      exercises: [
        ...day.pairs.flatMap((pair, i) =>
          pair.map((exerciseName, j) => ({
            exerciseName,
            sets,
            reps: `${reps} (${LETTERS[i]}${j + 1})`,
          }))
        ),
        { exerciseName: day.finisher.name, sets: day.finisher.sets, reps: `Finisher: ${day.finisher.reps}` },
      ],
    })),
  };
}

export const BOOTCAMP_TEMPLATES = WEEKS.map(buildWeek);
