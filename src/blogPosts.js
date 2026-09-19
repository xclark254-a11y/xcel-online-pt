// Starter articles for the Learn / Blog tab.
// These show up until the trainer saves any change to the blog, after which the list lives in Firestore (key: app:blogPosts).

export const BLOG_CATEGORIES = ["Training", "Nutrition", "Fat Loss", "Recovery", "Mindset"];

export const DEFAULT_BLOG_POSTS = [
  {
    "id": "starter-1",
    "title": "Can You Lose Belly Fat? What Actually Works",
    "category": "Fat Loss",
    "excerpt": "The number one question I get: how do I lose my belly? Short answer: crunches won't do it. Here's what will.",
    "date": "2026-09-19",
    "body": "Every new client asks me the same thing: \"How do I get rid of my belly?\" Let's clear this up.\n\n**You can't pick where fat comes off**\n\nSit-ups and crunches build the muscle under your belly. They don't burn the fat on top of it. Your abs are in there, they're just shy. Your body decides where fat leaves first and where it leaves last, and the belly is often last. Rude, I know.\n\n**What actually works**\n\n1. **Eat a little less than you burn.** Aim for about 300 to 500 calories under. Small and steady beats extreme every time.\n2. **Lift weights 2 to 4 days a week.** You keep your muscle and lose the fat, so you end up leaner, not just smaller.\n3. **Eat your protein.** It keeps you full and protects your muscle.\n4. **Walk every day.** 7,000 to 10,000 steps. Free, easy, and it adds up.\n5. **Sleep.** 7 to 9 hours. Bad sleep makes you hungry and makes junk food look real good.\n6. **Watch your drinks.** Sodas, sweet coffees, and alcohol add up fast. I'm not saying never enjoy one, I'm saying count them.\n\n**Be patient**\n\nBelly fat goes down when your overall body fat goes down. Don't judge it off one day on the scale. Watch the weekly trend, your waist, and how your clothes fit.\n\n**Bottom line:** Skip the ab-only workouts and the belly fat teas. Train, eat right, walk, sleep, repeat.\n\n*Educational content only, not medical advice. Talk to your doctor before starting a new diet or exercise program.*"
  },
  {
    "id": "starter-2",
    "title": "How Much Protein Do You Really Need?",
    "category": "Nutrition",
    "excerpt": "How much protein you actually need, and how to hit it without eating chicken at every single meal.",
    "date": "2026-09-19",
    "body": "Protein is the one everybody's talking about, and for good reason. It helps you build muscle, recover from workouts, and stay full so you're not raiding the pantry at 10 p.m.\n\n**How much do you need?**\n\nIf you train and want to build muscle or lose fat, aim for about 0.7 to 1 gram of protein per pound of body weight, per day.\n\nExample: at 180 lbs, that's around 125 to 180 grams a day. If you have a lot of weight to lose, use your goal weight instead.\n\n**How to hit it**\n\n- Spread it over 3 to 5 meals, about 25 to 40 grams each.\n- Build each meal around a protein: chicken, turkey, lean beef, fish, eggs, Greek yogurt, cottage cheese, tofu, or beans.\n- Shakes are fine. They're a shortcut, not a requirement.\n- Track it for a week or two. Most people are shocked at how low they are.\n\n**Quick answers**\n\n*Is more better?* Nope. Past about 1 gram per pound you're mostly just buying expensive groceries.\n\n*Is it bad for your kidneys?* Not for healthy people. If you have kidney issues or any medical condition, ask your doctor first.\n\n*Do I need it right after my workout?* Not really. Your total for the day matters way more than the timing. No need to sprint to the shaker bottle.\n\n**Bottom line:** Pick your number, build your meals around protein, and stay consistent.\n\n*Educational content only, not medical advice. Talk to your doctor before making major changes to your diet.*"
  },
  {
    "id": "starter-3",
    "title": "How to Build Muscle: A Beginner's Guide",
    "category": "Training",
    "excerpt": "It's not complicated, it's just not fast. Here's what actually builds muscle.",
    "date": "2026-09-19",
    "body": "Building muscle isn't complicated. It's just not fast, and that's where most people quit. Here's what actually matters.\n\n**1. Lift more over time**\n\nYour muscles grow when you ask for more than they're used to. That could be more weight, more reps, or an extra set. Write your workouts down so you know what to beat next time. That's what the workout log in the app is for.\n\n**2. Hit each muscle about twice a week**\n\nFull-body workouts 3 days a week or upper/lower 4 days a week both work great for beginners.\n\n**3. Do enough hard sets**\n\nShoot for about 10 to 20 tough sets per muscle per week. A set is \"hard\" when you finish with only 1 to 3 reps left in the tank. If you could've done 10 more, that was a warm-up.\n\n**4. Stick to the big moves**\n\nSquats or leg press, deadlift variations, presses, rows, and pull-downs give you the most bang for your buck. Then add curls, lateral raises, and calves for the fun stuff.\n\n**5. Eat like you mean it**\n\n- Protein: about 0.7 to 1 gram per pound of body weight.\n- A small bump in calories (200 to 300 a day) helps, but beginners can often build muscle eating around maintenance.\n\n**6. Recover**\n\nYou grow while you rest, not while you lift. Sleep 7 to 9 hours and take your rest days. Yes, they're mandatory.\n\n**Be patient**\n\nBeginners can see real changes in the first 3 to 6 months. It slows down after that, and that's normal.\n\n**Bottom line:** Lift consistently, add a little more over time, eat your protein, and sleep.\n\n*Educational content only, not medical advice. Talk to your doctor before starting a new exercise program.*"
  },
  {
    "id": "starter-4",
    "title": "How Many Calories Should You Eat to Lose Weight?",
    "category": "Fat Loss",
    "excerpt": "How to figure out your calories and cut just enough without being hangry all day.",
    "date": "2026-09-19",
    "body": "To lose fat, you have to eat fewer calories than you burn. The trick is picking a number you can actually live with.\n\n**Step 1: Guess your maintenance calories**\n\nThat's what you eat to stay the same weight. Here's a quick estimate:\n\n**Body weight (lbs) x 14 to 16**\n\nUse the low end if you don't move much and the high end if you're on your feet all day or train a lot. Example: a 200 lb person who trains 3 to 4 days a week starts around 2,800 to 3,000.\n\n**Step 2: Cut a little**\n\nTake off about 300 to 500 calories. For most people that's about 0.5 to 1 pound a week. Faster isn't better. Crash diets leave you hungry, tired, cranky, and losing muscle.\n\n**Step 3: Don't go too low**\n\nTry not to go below about 1,200 calories (women) or 1,500 calories (men) unless a medical professional is guiding you.\n\n**Step 4: Track and adjust**\n\n- Weigh in a few mornings a week and use the weekly average. One day's number means nothing. Water and salt will mess with it.\n- No change after 2 to 3 weeks? Lower calories a little or add some steps.\n- Losing faster than 1% of your body weight a week? Eat a bit more.\n\n**Make it easier**\n\n- Lean on protein and fiber to stay full.\n- Lift weights to keep your muscle.\n- Plan one flexible meal a week. Pizza night can live here.\n\n**Bottom line:** Estimate, cut a little, watch the trend, adjust. Calculators are just estimates. Your real results are the truth.\n\n*Educational content only, not medical advice. Talk to your doctor or a registered dietitian before starting a weight-loss diet, especially if you have a medical condition.*"
  },
  {
    "id": "starter-5",
    "title": "How to Start Working Out: A Simple Beginner's Plan",
    "category": "Training",
    "excerpt": "New to the gym? Here's a simple plan so you don't stare at the machines like they're a puzzle.",
    "date": "2026-09-19",
    "body": "Starting is the hardest part. Here's a simple plan so you know exactly what to do when you walk in.\n\n**Start small**\n\n3 days a week with a rest day in between. 30 to 45 minutes is plenty. Showing up consistently beats going all out for one week and disappearing.\n\n**Build your workout around 5 moves**\n\n1. **Squat:** goblet squat or leg press\n2. **Hinge:** Romanian deadlift or hip thrust\n3. **Push:** push-up or dumbbell press\n4. **Pull:** row or lat pull-down\n5. **Carry or core:** farmer's carry or plank\n\nDo 2 to 3 sets of 8 to 12 reps of each. Pick a weight that's challenging but lets you keep good form.\n\n**Warm up**\n\n5 to 10 minutes of light cardio and easy versions of your first exercises.\n\n**Form before weight**\n\nGo light until the move feels smooth. Not sure? Ask a trainer to check you. A few sessions early on can save you from a lot of ouch later.\n\n**Add walking**\n\n20 to 30 minutes on your off days. It helps recovery and builds the habit.\n\n**Make it stick**\n\n- Schedule workouts like appointments.\n- Log every session so you can see your progress.\n- Expect some soreness the first couple of weeks. Yes, even walking down stairs will feel weird. It fades.\n- Focus on showing up, not on perfect workouts.\n\n**Level up**\n\nWhen you can do all your sets and reps with good form, add a little weight next time.\n\n**Bottom line:** 3 full-body days a week, learn the form, log your workouts, and build from there.\n\n*Educational content only, not medical advice. If you have a health condition or haven't exercised in a long time, check with your doctor before starting.*"
  }
];
