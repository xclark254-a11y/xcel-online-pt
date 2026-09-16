import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dumbbell, Search, User, Settings, MessageCircle, TrendingUp, CalendarDays, Plus, X, Check, ChevronLeft, Trash2, Edit3, Send, LogOut, Lock, Layers, Apple, FileText, Flame, Star, ScanLine, Activity, Users, Megaphone, Bell, BellOff, Clock, Image as ImageIcon, CreditCard, RefreshCw, Video, Paperclip } from "lucide-react";
import { USDA_API_KEY } from "./nutritionConfig";
import { sGet, sSet } from "./firebase";

const uid = () => Math.random().toString(36).slice(2, 10);
function toYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = "";
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.includes("/shorts/")) id = u.pathname.split("/shorts/")[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}
function exerciseSearchUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent((name || "") + " exercise proper form")}`;
}

function mobilitySearchUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent((name || "") + " stretch mobility how to")}`;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function sendPush(subscriptions, title, body, url) {
  const subs = (subscriptions || []).filter((s) => s && s.endpoint);
  if (subs.length === 0) return;
  try {
    await fetch("/api/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptions: subs, title, body, url }),
    });
  } catch (e) {
    // best-effort — a failed push shouldn't block the message/post from saving
  }
}

function compressImage(file, maxDim = 1280, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file, ownerId, folder = "progress-photos") {
  const { IMAGEKIT_PUBLIC_KEY } = await import("./imagekitConfig.js");
  if (!IMAGEKIT_PUBLIC_KEY || IMAGEKIT_PUBLIC_KEY.startsWith("YOUR_")) {
    throw new Error("Photo storage isn't set up yet — ask your trainer to finish the ImageKit setup.");
  }
  const compressed = await compressImage(file);
  const authRes = await fetch("/api/imagekit-auth");
  if (!authRes.ok) throw new Error("Couldn't get upload authorization.");
  const auth = await authRes.json();

  const formData = new FormData();
  formData.append("file", compressed, `${folder}_${ownerId}_${Date.now()}.jpg`);
  formData.append("fileName", `${folder}_${ownerId}_${Date.now()}.jpg`);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("signature", auth.signature);
  formData.append("token", auth.token);
  formData.append("expire", auth.expire);
  formData.append("folder", `/${folder}`);

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("Upload failed.");
  const uploaded = await uploadRes.json();
  return { url: uploaded.url, fileId: uploaded.fileId };
}

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

async function uploadVideo(file, ownerId, folder = "message-videos") {
  const { IMAGEKIT_PUBLIC_KEY } = await import("./imagekitConfig.js");
  if (!IMAGEKIT_PUBLIC_KEY || IMAGEKIT_PUBLIC_KEY.startsWith("YOUR_")) {
    throw new Error("Video storage isn't set up yet — ask your trainer to finish the ImageKit setup.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("That video is too large (20MB max) — try a shorter clip.");
  }
  const authRes = await fetch("/api/imagekit-auth");
  if (!authRes.ok) throw new Error("Couldn't get upload authorization.");
  const auth = await authRes.json();

  const fileName = `${folder}_${ownerId}_${Date.now()}.mp4`;
  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("fileName", fileName);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("signature", auth.signature);
  formData.append("token", auth.token);
  formData.append("expire", auth.expire);
  formData.append("folder", `/${folder}`);

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("Video upload failed.");
  const uploaded = await uploadRes.json();
  return { url: uploaded.url, fileId: uploaded.fileId };
}

async function deleteImageKitFile(fileId) {
  if (!fileId) return;
  try {
    await fetch("/api/imagekit-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
  } catch (e) {
    // best-effort — don't block the UI if this fails
  }
}

const OZ_TO_G = 28.3495;

async function searchFoods(query) {
  if (!query.trim() || !USDA_API_KEY || USDA_API_KEY === "YOUR_USDA_API_KEY") return [];
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&pageSize=8&dataType=Foundation,SR%20Legacy,Branded`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.foods || []).map((f) => {
      const per100g = {};
      (f.foodNutrients || []).forEach((n) => {
        const name = (n.nutrientName || "").toLowerCase();
        if (name.includes("energy")) per100g.calories = n.value;
        else if (name.includes("protein")) per100g.protein = n.value;
        else if (name.includes("carbohydrate")) per100g.carbs = n.value;
        else if (name.includes("total lipid") || name.includes("fat")) per100g.fat = n.value;
      });
      return { fdcId: f.fdcId, name: f.description, per100g };
    }).filter((f) => f.per100g.calories !== undefined);
  } catch (e) {
    return [];
  }
}

async function lookupBarcode(code) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;
    const n = data.product.nutriments || {};
    const per100g = {
      calories: n["energy-kcal_100g"] ?? n["energy-kcal"],
      protein: n["proteins_100g"],
      carbs: n["carbohydrates_100g"],
      fat: n["fat_100g"],
    };
    if (per100g.calories === undefined || per100g.calories === null) return null;
    return { name: data.product.product_name || data.product.generic_name || "Scanned item", per100g };
  } catch (e) {
    return null;
  }
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const BURN_ACTIVITY_OPTIONS = ["Workout", "Walk", "Run", "Treadmill", "Bike", "Swim", "Sports", "Hike", "Other"];

const DAILY_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "" },
  { text: "Small steps every day add up to big results.", author: "" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The pain you feel today will be the strength you feel tomorrow.", author: "" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It never gets easier, you just get stronger.", author: "" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "A one-hour workout is 4% of your day. No excuses.", author: "" },
  { text: "Progress, not perfection.", author: "" },
  { text: "The hardest lift is lifting yourself off the couch.", author: "" },
  { text: "You don't have to be extreme, just consistent.", author: "" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "What seems impossible today will one day become your warm-up.", author: "" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
  { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  { text: "Every workout counts, even the ones that feel small.", author: "" },
  { text: "You are one workout away from a good mood.", author: "" },
  { text: "The best project you'll ever work on is you.", author: "" },
  { text: "Sweat is just fat crying.", author: "" },
  { text: "Fall in love with taking care of yourself.", author: "" },
  { text: "Nothing changes if nothing changes.", author: "" },
  { text: "Consistency is what transforms average into excellence.", author: "" },
  { text: "The difference between try and triumph is a little umph.", author: "" },
  { text: "Energy and persistence conquer all things.", author: "Benjamin Franklin" },
  { text: "You are stronger than you think.", author: "" },
  { text: "Focus on progress, not perfection.", author: "" },
  { text: "Today's actions are tomorrow's results.", author: "" },
];

function todaysQuote() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

const MEAL_OPTIONS = {
  breakfast: [
    { name: "Egg whites, oats & banana", calories: 380, protein: 28, carbs: 52, fat: 6, ingredients: ["6 egg whites", "1/2 cup dry oats", "1 medium banana"] },
    { name: "Greek yogurt, berries & granola", calories: 320, protein: 24, carbs: 42, fat: 6, ingredients: ["1 cup nonfat Greek yogurt", "1/2 cup mixed berries", "1/4 cup granola"] },
    { name: "3 whole eggs & whole wheat toast", calories: 420, protein: 26, carbs: 34, fat: 20, ingredients: ["3 whole eggs", "2 slices whole wheat toast", "1 tsp butter"] },
    { name: "Protein oatmeal with peanut butter", calories: 480, protein: 32, carbs: 50, fat: 16, ingredients: ["1 cup dry oats", "1 scoop protein powder", "1 tbsp peanut butter"] },
    { name: "Turkey bacon, eggs & avocado toast", calories: 460, protein: 30, carbs: 30, fat: 24, ingredients: ["3 slices turkey bacon", "2 whole eggs", "1 slice whole wheat toast", "1/4 avocado"] },
    { name: "Protein smoothie (whey, banana, milk)", calories: 350, protein: 35, carbs: 40, fat: 6, ingredients: ["1 scoop whey protein", "1 medium banana", "1 cup skim milk"] },
    { name: "Cottage cheese, pineapple & almonds", calories: 300, protein: 26, carbs: 28, fat: 10, ingredients: ["1 cup low-fat cottage cheese", "1/2 cup pineapple chunks", "10 almonds"] },
    { name: "Breakfast burrito (eggs, black beans, salsa)", calories: 500, protein: 28, carbs: 48, fat: 20, ingredients: ["3 whole eggs", "1 large whole wheat tortilla", "1/2 cup black beans", "2 tbsp salsa"] },
    { name: "Overnight oats with chia & almond milk", calories: 340, protein: 14, carbs: 52, fat: 10, ingredients: ["1/2 cup dry oats", "1 tbsp chia seeds", "1 cup almond milk", "1 tsp honey"] },
    { name: "Egg & veggie scramble with cheese", calories: 360, protein: 26, carbs: 12, fat: 24, ingredients: ["3 whole eggs", "1/2 cup mixed vegetables", "1/4 cup shredded cheese"] },
    { name: "Bagel with lox & cream cheese", calories: 440, protein: 24, carbs: 50, fat: 16, ingredients: ["1 whole wheat bagel", "2 oz smoked salmon", "2 tbsp cream cheese"] },
    { name: "Protein pancakes with syrup", calories: 400, protein: 30, carbs: 46, fat: 10, ingredients: ["1 scoop protein powder", "1/2 cup oat flour pancake mix", "2 tbsp light syrup"] },
  ],
  lunch: [
    { name: "Grilled chicken, rice & broccoli", calories: 520, protein: 45, carbs: 55, fat: 10, ingredients: ["6 oz grilled chicken breast", "1 cup cooked white rice", "1 cup steamed broccoli"] },
    { name: "Turkey wrap with veggies & hummus", calories: 460, protein: 32, carbs: 44, fat: 16, ingredients: ["5 oz sliced turkey breast", "1 large whole wheat wrap", "2 tbsp hummus", "mixed veggies"] },
    { name: "Tuna salad over greens", calories: 380, protein: 38, carbs: 14, fat: 18, ingredients: ["6 oz canned tuna", "2 tbsp light mayo", "2 cups mixed greens"] },
    { name: "Chicken burrito bowl (rice, beans, salsa)", calories: 620, protein: 42, carbs: 68, fat: 16, ingredients: ["6 oz grilled chicken", "1 cup cooked rice", "1/2 cup black beans", "2 tbsp salsa"] },
    { name: "Salmon, quinoa & asparagus", calories: 560, protein: 40, carbs: 42, fat: 22, ingredients: ["6 oz baked salmon", "3/4 cup cooked quinoa", "1 cup asparagus"] },
    { name: "Turkey chili with cornbread", calories: 540, protein: 36, carbs: 52, fat: 18, ingredients: ["6 oz ground turkey", "1/2 cup kidney beans", "1 small slice cornbread"] },
    { name: "Steak & sweet potato", calories: 600, protein: 44, carbs: 46, fat: 22, ingredients: ["6 oz sirloin steak", "1 medium sweet potato", "1 tsp olive oil"] },
    { name: "Chicken Caesar salad (light dressing)", calories: 450, protein: 38, carbs: 18, fat: 24, ingredients: ["6 oz grilled chicken", "2 cups romaine lettuce", "2 tbsp light Caesar dressing", "1 tbsp parmesan"] },
    { name: "Shrimp stir-fry with brown rice", calories: 500, protein: 34, carbs: 58, fat: 12, ingredients: ["6 oz shrimp", "1 cup cooked brown rice", "1 cup mixed stir-fry vegetables"] },
    { name: "Turkey sandwich, whole grain bread", calories: 420, protein: 28, carbs: 46, fat: 12, ingredients: ["4 oz sliced turkey", "2 slices whole grain bread", "1 tsp mustard", "lettuce & tomato"] },
    { name: "Beef & veggie stir-fry", calories: 540, protein: 38, carbs: 40, fat: 22, ingredients: ["6 oz lean beef strips", "1.5 cups mixed vegetables", "1 tbsp sesame oil"] },
    { name: "Lentil soup with whole grain roll", calories: 400, protein: 20, carbs: 60, fat: 8, ingredients: ["1.5 cups lentil soup", "1 small whole grain roll"] },
  ],
  dinner: [
    { name: "Baked chicken breast, rice & green beans", calories: 550, protein: 46, carbs: 50, fat: 12, ingredients: ["7 oz baked chicken breast", "1 cup cooked rice", "1 cup green beans"] },
    { name: "Grilled salmon, sweet potato & spinach", calories: 580, protein: 40, carbs: 44, fat: 22, ingredients: ["6 oz grilled salmon", "1 medium sweet potato", "1 cup sautéed spinach"] },
    { name: "Lean ground beef tacos (corn tortillas)", calories: 600, protein: 38, carbs: 50, fat: 24, ingredients: ["6 oz lean ground beef (93/7)", "3 corn tortillas", "1/4 cup shredded cheese", "salsa"] },
    { name: "Turkey meatballs with whole wheat pasta", calories: 620, protein: 42, carbs: 60, fat: 18, ingredients: ["6 oz turkey meatballs", "1.5 cups whole wheat pasta", "1/2 cup marinara sauce"] },
    { name: "Grilled shrimp skewers & couscous", calories: 480, protein: 36, carbs: 46, fat: 12, ingredients: ["6 oz grilled shrimp", "1 cup cooked couscous", "grilled vegetables"] },
    { name: "Pork tenderloin, roasted potatoes & carrots", calories: 560, protein: 40, carbs: 44, fat: 18, ingredients: ["6 oz pork tenderloin", "1 cup roasted potatoes", "1 cup carrots"] },
    { name: "Chicken stir-fry with mixed vegetables", calories: 500, protein: 40, carbs: 38, fat: 16, ingredients: ["6 oz chicken breast", "2 cups mixed stir-fry vegetables", "1 tbsp stir-fry sauce"] },
    { name: "Baked cod, quinoa & roasted vegetables", calories: 460, protein: 36, carbs: 40, fat: 12, ingredients: ["7 oz baked cod", "3/4 cup cooked quinoa", "1 cup roasted vegetables"] },
    { name: "Turkey burger (no bun) with side salad", calories: 440, protein: 38, carbs: 16, fat: 24, ingredients: ["7 oz turkey burger patty", "2 cups side salad", "1 tbsp olive oil dressing"] },
    { name: "Beef & broccoli over rice", calories: 580, protein: 38, carbs: 54, fat: 18, ingredients: ["6 oz lean beef strips", "1 cup steamed broccoli", "1 cup cooked rice"] },
    { name: "Grilled chicken fajitas (peppers & onions)", calories: 520, protein: 40, carbs: 42, fat: 18, ingredients: ["6 oz grilled chicken", "2 whole wheat tortillas", "1 cup peppers & onions"] },
    { name: "Stuffed bell peppers (turkey & rice)", calories: 480, protein: 32, carbs: 44, fat: 16, ingredients: ["2 bell peppers", "5 oz ground turkey", "1/2 cup cooked rice"] },
  ],
  snack: [
    { name: "Protein shake", calories: 160, protein: 25, carbs: 6, fat: 3, ingredients: ["1 scoop whey protein", "1 cup water or almond milk"] },
    { name: "Apple with peanut butter", calories: 220, protein: 6, carbs: 28, fat: 10, ingredients: ["1 medium apple", "1 tbsp peanut butter"] },
    { name: "Greek yogurt cup", calories: 140, protein: 15, carbs: 12, fat: 3, ingredients: ["1 cup nonfat Greek yogurt"] },
    { name: "Handful of almonds", calories: 170, protein: 6, carbs: 6, fat: 15, ingredients: ["1 oz almonds (about 23)"] },
    { name: "Rice cakes with almond butter", calories: 200, protein: 6, carbs: 24, fat: 9, ingredients: ["2 rice cakes", "1 tbsp almond butter"] },
    { name: "Cottage cheese with berries", calories: 160, protein: 18, carbs: 12, fat: 4, ingredients: ["3/4 cup low-fat cottage cheese", "1/4 cup berries"] },
    { name: "Protein bar", calories: 210, protein: 20, carbs: 22, fat: 7, ingredients: ["1 protein bar"] },
    { name: "Hard-boiled eggs (2)", calories: 140, protein: 12, carbs: 1, fat: 10, ingredients: ["2 hard-boiled eggs"] },
    { name: "Beef jerky", calories: 120, protein: 14, carbs: 4, fat: 5, ingredients: ["1 oz beef jerky"] },
    { name: "Baby carrots with hummus", calories: 150, protein: 5, carbs: 18, fat: 7, ingredients: ["1 cup baby carrots", "2 tbsp hummus"] },
  ],
};

function generateMealPlan(targets) {
  const cal = Number(targets.calories) || 2000;
  const slots = [
    { key: "breakfast", label: "Breakfast", share: 0.25 },
    { key: "lunch", label: "Lunch", share: 0.3 },
    { key: "dinner", label: "Dinner", share: 0.35 },
    { key: "snack", label: "Snack", share: 0.1 },
  ];
  const meals = slots.map((slot) => {
    const target = cal * slot.share;
    const options = [...MEAL_OPTIONS[slot.key]].sort((a, b) => Math.abs(a.calories - target) - Math.abs(b.calories - target));
    const closest = options.slice(0, 4);
    const pick = closest[Math.floor(Math.random() * closest.length)];
    return { ...pick, slot: slot.label };
  });
  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + m.calories,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return { meals, totals };
}

function macrosForOz(per100g, oz) {
  const grams = (Number(oz) || 0) * OZ_TO_G;
  const scale = grams / 100;
  return {
    calories: Math.round((per100g.calories || 0) * scale),
    protein: Math.round((per100g.protein || 0) * scale),
    carbs: Math.round((per100g.carbs || 0) * scale),
    fat: Math.round((per100g.fat || 0) * scale),
  };
}
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

function mondayOf(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function computeConsistency(logs) {
  const weekKeys = new Set((logs || []).map((l) => mondayOf(l.date)));
  let cursor = mondayOf(todayISO());
  if (!weekKeys.has(cursor)) {
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  let streak = 0;
  while (weekKeys.has(cursor)) {
    streak++;
    const d = new Date(cursor + "T00:00:00");
    d.setDate(d.getDate() - 7);
    cursor = d.toISOString().slice(0, 10);
  }
  const total = (logs || []).length;
  const milestones = [1, 5, 10, 25, 50, 100, 200];
  const achieved = milestones.filter((m) => total >= m).pop() || 0;
  const next = milestones.find((m) => total < m) || null;
  return { weeklyStreak: streak, totalWorkouts: total, achievedMilestone: achieved, nextMilestone: next };
}

function computeBMI(weightLb, heightIn) {
  if (!weightLb || !heightIn) return null;
  let h = Number(heightIn);
  if (h > 100) h = h / 2.54; // guard against someone entering height in centimeters
  return (703 * Number(weightLb)) / (h * h);
}

function bmiCategory(bmi) {
  if (bmi === null) return "";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function computeBMR(weightLb, heightIn, age, gender) {
  if (!weightLb || !heightIn || !age) return null;
  let h = Number(heightIn);
  if (h > 100) h = h / 2.54; // guard against centimeters
  const kg = Number(weightLb) * 0.453592;
  const cm = h * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * Number(age);
  if (gender === "Male") return Math.round(base + 5);
  if (gender === "Female") return Math.round(base - 161);
  return Math.round(base - 78); // average estimate when gender isn't specified
}

// ---------- seed data ----------
const SEED_EXERCISES = [
  { id: uid(), name: "Barbell Back Squat", muscle: "Legs", equipment: "Barbell", instructions: "Bar on upper traps, feet shoulder-width. Break at hips and knees together, descend to at least parallel, drive up through the whole foot." },
  { id: uid(), name: "Romanian Deadlift", muscle: "Legs", equipment: "Barbell", instructions: "Soft knees, hinge at the hips keeping the bar close to your legs. Lower until you feel a stretch in the hamstrings, drive hips forward to stand." },
  { id: uid(), name: "Walking Lunge", muscle: "Legs", equipment: "Dumbbell", instructions: "Step forward into a lunge, back knee toward the floor, push through the front heel to step into the next rep." },
  { id: uid(), name: "Leg Press", muscle: "Legs", equipment: "Machine", instructions: "Feet shoulder-width on the platform. Lower until knees hit ~90°, press through heels without locking out hard." },
  { id: uid(), name: "Hip Thrust", muscle: "Glutes", equipment: "Barbell", instructions: "Upper back on a bench, bar over hips. Drive through heels, squeeze glutes hard at the top, lower with control." },
  { id: uid(), name: "Cable Kickback", muscle: "Glutes", equipment: "Cable", instructions: "Ankle cuff attached, hinge slightly forward. Kick the leg back and up, squeezing the glute, avoid arching the low back." },
  { id: uid(), name: "Bulgarian Split Squat", muscle: "Glutes", equipment: "Dumbbell", instructions: "Rear foot elevated on a bench. Lower straight down, front knee tracking over toes, drive up through the front heel." },
  { id: uid(), name: "Glute Bridge", muscle: "Glutes", equipment: "Bodyweight", instructions: "Lie on your back, knees bent. Squeeze glutes to lift hips, pause at the top, lower slowly." },
  { id: uid(), name: "Barbell Bench Press", muscle: "Chest", equipment: "Barbell", instructions: "Grip just outside shoulder width, lower bar to mid-chest, elbows ~45° from torso, press up and slightly back." },
  { id: uid(), name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell", instructions: "Bench at 30-45°. Press dumbbells up and slightly in, control the descent to chest level." },
  { id: uid(), name: "Push-Up", muscle: "Chest", equipment: "Bodyweight", instructions: "Hands under shoulders, body in a straight line. Lower chest to the floor, press back up without flaring elbows too wide." },
  { id: uid(), name: "Cable Fly", muscle: "Chest", equipment: "Cable", instructions: "Slight forward lean, soft elbow bend. Bring hands together in front of chest, squeeze, control the return." },
  { id: uid(), name: "Pull-Up", muscle: "Back", equipment: "Bodyweight", instructions: "Full hang start, pull until chin clears the bar, lead with the chest, lower under control." },
  { id: uid(), name: "Barbell Row", muscle: "Back", equipment: "Barbell", instructions: "Hinge to ~45°, flat back. Pull the bar to your lower ribs, squeeze shoulder blades, lower with control." },
  { id: uid(), name: "Lat Pulldown", muscle: "Back", equipment: "Machine", instructions: "Grip slightly wider than shoulders, pull bar to upper chest driving elbows down, avoid leaning back excessively." },
  { id: uid(), name: "Seated Cable Row", muscle: "Back", equipment: "Cable", instructions: "Chest up, pull handle to torso keeping elbows close, squeeze shoulder blades together at the finish." },
  { id: uid(), name: "Dumbbell Shoulder Press", muscle: "Shoulders", equipment: "Dumbbell", instructions: "Press dumbbells overhead from shoulder height, avoid excessive arch in the low back, lower with control." },
  { id: uid(), name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell", instructions: "Slight elbow bend, raise arms to shoulder height leading with the elbows, lower slowly." },
  { id: uid(), name: "Face Pull", muscle: "Shoulders", equipment: "Cable", instructions: "Rope at upper-chest height, pull toward the face flaring elbows out, squeeze rear delts at the finish." },
  { id: uid(), name: "Barbell Overhead Press", muscle: "Shoulders", equipment: "Barbell", instructions: "Bar at collarbone, brace the core, press straight overhead, head moves through at the top." },
  { id: uid(), name: "Barbell Curl", muscle: "Arms", equipment: "Barbell", instructions: "Elbows pinned to sides, curl the bar up without swinging, squeeze at the top, lower fully." },
  { id: uid(), name: "Hammer Curl", muscle: "Arms", equipment: "Dumbbell", instructions: "Neutral grip, curl keeping elbows fixed, control the negative all the way down." },
  { id: uid(), name: "Tricep Pushdown", muscle: "Arms", equipment: "Cable", instructions: "Elbows pinned at sides, extend down fully, squeeze triceps, control the return to 90°." },
  { id: uid(), name: "Dip", muscle: "Arms", equipment: "Bodyweight", instructions: "Lower until shoulders are near elbow height, lean forward slightly for chest or stay upright for triceps, press back up." },
  { id: uid(), name: "Plank", muscle: "Core", equipment: "Bodyweight", instructions: "Forearms and toes on the floor, straight line from head to heels, brace the core and glutes." },
  { id: uid(), name: "Hanging Knee Raise", muscle: "Core", equipment: "Bodyweight", instructions: "Hang from a bar, raise knees toward chest using the abs, lower with control without swinging." },
  { id: uid(), name: "Cable Woodchop", muscle: "Core", equipment: "Cable", instructions: "Rotate the torso to pull the cable diagonally across the body, control the return, keep hips mostly square." },
  { id: uid(), name: "Kettlebell Swing", muscle: "Full Body", equipment: "Kettlebell", instructions: "Hinge at the hips, snap them forward to swing the bell to chest height, let it fall back between the legs." },
  { id: uid(), name: "Goblet Squat", muscle: "Legs", equipment: "Kettlebell", instructions: "Hold the bell at your chest, squat between the knees keeping the torso upright, drive up through the heels." },
  { id: uid(), name: "Farmer's Carry", muscle: "Full Body", equipment: "Dumbbell", instructions: "Heavy dumbbells at your sides, walk with tall posture and braced core, controlled steps." },
  { id: uid(), name: "Treadmill Intervals", muscle: "Cardio", equipment: "Machine", instructions: "Alternate 30-60s hard effort with 60-90s easy pace, repeat for the prescribed number of rounds." },
  { id: uid(), name: "Rowing Machine", muscle: "Cardio", equipment: "Machine", instructions: "Drive with the legs first, then lean back and pull the handle to the ribs, reverse the sequence smoothly." },
  { id: uid(), name: "Front Squat", muscle: "Legs", equipment: "Barbell", instructions: "Bar rests on front delts, elbows high. Squat down keeping the torso upright, drive up through the heels." },
  { id: uid(), name: "Sumo Deadlift", muscle: "Legs", equipment: "Barbell", instructions: "Wide stance, toes turned out, grip inside the knees. Drive through the floor keeping the chest up and bar close." },
  { id: uid(), name: "Leg Extension", muscle: "Legs", equipment: "Machine", instructions: "Adjust pad above the ankles, extend knees fully without swinging the torso, control the lowering." },
  { id: uid(), name: "Seated Leg Curl", muscle: "Legs", equipment: "Machine", instructions: "Pad behind the ankles, curl the legs down and back, squeeze the hamstrings, control the return." },
  { id: uid(), name: "Standing Calf Raise", muscle: "Legs", equipment: "Machine", instructions: "Balls of feet on the platform, rise onto toes as high as possible, lower until you feel a stretch." },
  { id: uid(), name: "Dumbbell Step-Up", muscle: "Legs", equipment: "Dumbbell", instructions: "Step fully onto a bench or box, drive through the lead heel to stand, control the step back down." },
  { id: uid(), name: "Box Squat", muscle: "Legs", equipment: "Barbell", instructions: "Squat down until you lightly touch a box behind you, keep tension, drive back up without collapsing." },
  { id: uid(), name: "Zercher Squat", muscle: "Legs", equipment: "Barbell", instructions: "Bar cradled in the crooks of the elbows, squat down keeping the torso as upright as possible." },
  { id: uid(), name: "Single-Leg RDL", muscle: "Glutes", equipment: "Dumbbell", instructions: "Balance on one leg, hinge forward reaching the dumbbell toward the floor while the back leg extends behind you." },
  { id: uid(), name: "Cable Pull-Through", muscle: "Glutes", equipment: "Cable", instructions: "Face away from the stack, hinge forward letting the rope pull between your legs, drive hips forward to stand." },
  { id: uid(), name: "Frog Pump", muscle: "Glutes", equipment: "Bodyweight", instructions: "Soles of the feet together, knees out. Drive hips up squeezing the glutes hard at the top." },
  { id: uid(), name: "Curtsy Lunge", muscle: "Glutes", equipment: "Dumbbell", instructions: "Step one leg diagonally behind the other, lower into a lunge, drive through the front heel to return." },
  { id: uid(), name: "Banded Lateral Walk", muscle: "Glutes", equipment: "Bodyweight", instructions: "Band around the ankles or knees, sit into a slight squat, step sideways keeping tension on the band." },
  { id: uid(), name: "Machine Hip Abduction", muscle: "Glutes", equipment: "Machine", instructions: "Seated with pads on the outer thighs, push the legs apart against resistance, control the return." },
  { id: uid(), name: "Dumbbell Fly", muscle: "Chest", equipment: "Dumbbell", instructions: "Flat bench, slight elbow bend, lower dumbbells out to the sides until a stretch is felt, bring back together." },
  { id: uid(), name: "Decline Barbell Press", muscle: "Chest", equipment: "Barbell", instructions: "Bench angled down, lower the bar to the lower chest, press up and slightly back." },
  { id: uid(), name: "Machine Chest Press", muscle: "Chest", equipment: "Machine", instructions: "Handles at chest height, press forward without locking elbows hard, control the return." },
  { id: uid(), name: "Incline Push-Up", muscle: "Chest", equipment: "Bodyweight", instructions: "Hands on an elevated surface, lower chest toward it keeping the body straight, press back up." },
  { id: uid(), name: "Landmine Press", muscle: "Chest", equipment: "Barbell", instructions: "Barbell end in a landmine or corner, press it up and away from the shoulder, control the descent." },
  { id: uid(), name: "Chest-Supported Row", muscle: "Back", equipment: "Dumbbell", instructions: "Chest on an incline bench, row dumbbells up toward the hips squeezing the shoulder blades together." },
  { id: uid(), name: "T-Bar Row", muscle: "Back", equipment: "Barbell", instructions: "Hinge over the bar, pull it to the chest keeping elbows close, squeeze at the top, lower with control." },
  { id: uid(), name: "Straight-Arm Pulldown", muscle: "Back", equipment: "Cable", instructions: "Arms straight, pull the bar down toward the thighs using the lats, control the return without bending elbows much." },
  { id: uid(), name: "Inverted Row", muscle: "Back", equipment: "Bodyweight", instructions: "Body straight under a bar, pull the chest up to the bar, lower with control keeping the core braced." },
  { id: uid(), name: "Rack Pull", muscle: "Back", equipment: "Barbell", instructions: "Bar set at knee height in a rack, deadlift the bar from there focusing on a strong lockout." },
  { id: uid(), name: "Wide-Grip Lat Pulldown", muscle: "Back", equipment: "Machine", instructions: "Wide overhand grip, pull the bar to the upper chest driving the elbows down and back." },
  { id: uid(), name: "Arnold Press", muscle: "Shoulders", equipment: "Dumbbell", instructions: "Start with palms facing you, rotate outward while pressing overhead, reverse the rotation on the way down." },
  { id: uid(), name: "Cable Lateral Raise", muscle: "Shoulders", equipment: "Cable", instructions: "Cable at the low pulley, raise the arm out to the side to shoulder height, control the return." },
  { id: uid(), name: "Rear Delt Fly", muscle: "Shoulders", equipment: "Dumbbell", instructions: "Hinge forward, raise dumbbells out to the sides squeezing the rear delts, lower with control." },
  { id: uid(), name: "Landmine Shoulder Press", muscle: "Shoulders", equipment: "Barbell", instructions: "One end of the barbell in a landmine, press it up and forward from shoulder height, control the descent." },
  { id: uid(), name: "Upright Row", muscle: "Shoulders", equipment: "Cable", instructions: "Pull the bar up along the body to chest height leading with the elbows, lower with control." },
  { id: uid(), name: "Machine Shoulder Press", muscle: "Shoulders", equipment: "Machine", instructions: "Handles at shoulder height, press straight overhead without locking out hard, control the return." },
  { id: uid(), name: "Preacher Curl", muscle: "Arms", equipment: "Barbell", instructions: "Arms braced on a preacher pad, curl up fully, control the lowering for a full stretch at the bottom." },
  { id: uid(), name: "Incline Dumbbell Curl", muscle: "Arms", equipment: "Dumbbell", instructions: "Seated on an incline bench, arms hanging, curl the dumbbells up keeping elbows back, lower fully." },
  { id: uid(), name: "Cable Curl", muscle: "Arms", equipment: "Cable", instructions: "Elbows at sides, curl the bar or handle up, squeeze at the top, control the return." },
  { id: uid(), name: "Overhead Tricep Extension", muscle: "Arms", equipment: "Dumbbell", instructions: "Dumbbell held overhead with both hands, lower behind the head bending only at the elbow, extend back up." },
  { id: uid(), name: "Skull Crusher", muscle: "Arms", equipment: "Barbell", instructions: "Lying on a bench, lower the bar toward the forehead bending only the elbows, extend back to start." },
  { id: uid(), name: "Close-Grip Bench Press", muscle: "Arms", equipment: "Barbell", instructions: "Hands shoulder-width or slightly closer, lower the bar to the chest keeping elbows tucked, press up." },
  { id: uid(), name: "Bench Dip", muscle: "Arms", equipment: "Bodyweight", instructions: "Hands on a bench behind you, lower the hips toward the floor bending the elbows, press back up." },
  { id: uid(), name: "Cable Crunch", muscle: "Core", equipment: "Cable", instructions: "Kneel below a high pulley, curl the torso down toward the knees using the abs, control the return." },
  { id: uid(), name: "Russian Twist", muscle: "Core", equipment: "Bodyweight", instructions: "Seated with feet lifted or grounded, rotate the torso side to side, keep the movement controlled." },
  { id: uid(), name: "Ab Wheel Rollout", muscle: "Core", equipment: "Bodyweight", instructions: "Kneeling, roll the wheel forward keeping the core braced and back flat, pull back to start." },
  { id: uid(), name: "Side Plank", muscle: "Core", equipment: "Bodyweight", instructions: "Balance on one forearm and the side of the foot, keep the body in a straight line, hold." },
  { id: uid(), name: "Mountain Climber", muscle: "Core", equipment: "Bodyweight", instructions: "Plank position, drive knees toward the chest alternating quickly while keeping the hips level." },
  { id: uid(), name: "Dead Bug", muscle: "Core", equipment: "Bodyweight", instructions: "On your back, arms and legs up, lower opposite arm and leg toward the floor keeping the low back flat." },
  { id: uid(), name: "Battle Ropes", muscle: "Cardio", equipment: "Bodyweight", instructions: "Alternate slamming the ropes up and down as fast as possible while keeping a stable athletic stance." },
  { id: uid(), name: "Jump Rope", muscle: "Cardio", equipment: "Bodyweight", instructions: "Small hops on the balls of the feet, wrists doing most of the rope turning, keep a steady rhythm." },
  { id: uid(), name: "Assault Bike", muscle: "Cardio", equipment: "Machine", instructions: "Push and pull the handles while pedaling, alternate high-effort intervals with easier recovery pace." },
  { id: uid(), name: "Kettlebell Clean and Press", muscle: "Full Body", equipment: "Kettlebell", instructions: "Clean the bell to the rack position in one motion, then press it overhead, lower back to the rack and down." },
  { id: uid(), name: "Sled Push", muscle: "Full Body", equipment: "Machine", instructions: "Low athletic stance, drive through the legs pushing the sled forward in controlled, powerful steps." },
  { id: uid(), name: "Turkish Get-Up", muscle: "Full Body", equipment: "Kettlebell", instructions: "From lying down to standing while keeping a kettlebell locked out overhead the entire time, then reverse." },
  { id: uid(), name: "Slam Ball Slam", muscle: "Full Body", equipment: "Slam Ball", instructions: "Lift the ball overhead and slam it down as hard as possible, squatting to catch the bounce, repeat explosively." },
  { id: uid(), name: "Rotational Slam", muscle: "Core", equipment: "Slam Ball", instructions: "Rotate the torso and slam the ball down to one side, alternating sides with an explosive twisting motion." },
  { id: uid(), name: "Overhead Slam to Squat", muscle: "Full Body", equipment: "Slam Ball", instructions: "Slam the ball down then immediately drop into a squat to scoop it back up before repeating." },
  { id: uid(), name: "Slam Ball Chest Pass", muscle: "Chest", equipment: "Slam Ball", instructions: "Hold the ball at the chest and throw it explosively into a wall or the floor in front of you, catching the rebound." },
  { id: uid(), name: "Slam Ball Sit-Up Toss", muscle: "Core", equipment: "Slam Ball", instructions: "Lying down, toss the ball up on the sit-up, catch it at the top, and control it back down." },
  { id: uid(), name: "Single-Arm Slam", muscle: "Shoulders", equipment: "Slam Ball", instructions: "Slam the ball down to one side using a single-arm motion, alternating arms each rep." },
  { id: uid(), name: "Slam Ball Lunge with Twist", muscle: "Legs", equipment: "Slam Ball", instructions: "Hold the ball at the chest, lunge forward, and twist toward the front leg before returning to standing." },
  { id: uid(), name: "Slam Ball Squat Throw", muscle: "Legs", equipment: "Slam Ball", instructions: "Squat down holding the ball, then explosively stand and throw it overhead or to a partner." },
  { id: uid(), name: "Kettlebell Snatch", muscle: "Full Body", equipment: "Kettlebell", instructions: "Swing the bell between the legs then explosively pull and punch the hand through to lockout overhead in one motion." },
  { id: uid(), name: "Kettlebell High Pull", muscle: "Shoulders", equipment: "Kettlebell", instructions: "Swing the bell up, pulling the elbow high toward chin height, then let it swing back down." },
  { id: uid(), name: "Single-Arm Kettlebell Row", muscle: "Back", equipment: "Kettlebell", instructions: "Hinge forward with one hand on a bench, row the bell to the hip keeping the elbow close, lower with control." },
  { id: uid(), name: "Kettlebell Halo", muscle: "Shoulders", equipment: "Kettlebell", instructions: "Circle the kettlebell around the head, keeping the core braced and the movement slow and controlled." },
  { id: uid(), name: "Kettlebell Windmill", muscle: "Core", equipment: "Kettlebell", instructions: "Press the bell overhead, hinge sideways at the hips reaching the free hand toward the floor while keeping the arm locked out." },
  { id: uid(), name: "Kettlebell Figure-8", muscle: "Core", equipment: "Kettlebell", instructions: "Pass the kettlebell between and around the legs in a figure-8 pattern, keeping the knees soft." },
  { id: uid(), name: "Kettlebell Deadlift", muscle: "Legs", equipment: "Kettlebell", instructions: "Stand over the bell, hinge down to grip it, drive through the heels to stand tall, squeeze the glutes at the top." },
  { id: uid(), name: "Kettlebell Single-Arm Overhead Press", muscle: "Shoulders", equipment: "Kettlebell", instructions: "Press the bell from the rack position straight overhead, keeping the core braced, lower with control." },
  { id: uid(), name: "Kettlebell Reverse Lunge", muscle: "Legs", equipment: "Kettlebell", instructions: "Hold the bell at the chest or side, step back into a lunge, drive through the front heel to return to standing." },
  { id: uid(), name: "Band Pull-Apart", muscle: "Shoulders", equipment: "Resistance Band", instructions: "Hold the band at shoulder height with arms extended, pull it apart by squeezing the shoulder blades together, control the return." },
  { id: uid(), name: "Band Face Pull", muscle: "Shoulders", equipment: "Resistance Band", instructions: "Anchor the band at face height, pull toward the face flaring the elbows out, squeeze the rear delts." },
  { id: uid(), name: "Banded Squat", muscle: "Legs", equipment: "Resistance Band", instructions: "Band anchored low behind you or under the feet, squat down against the resistance, drive up through the heels." },
  { id: uid(), name: "Band Bicep Curl", muscle: "Arms", equipment: "Resistance Band", instructions: "Stand on the band, curl the handles up keeping the elbows pinned at the sides, lower with control." },
  { id: uid(), name: "Band Tricep Pushdown", muscle: "Arms", equipment: "Resistance Band", instructions: "Anchor the band overhead, push the handles down extending the elbows fully, control the return." },
  { id: uid(), name: "Band Deadlift", muscle: "Legs", equipment: "Resistance Band", instructions: "Stand on the band with feet shoulder-width, hinge down to grip the handles, drive the hips forward to stand." },
  { id: uid(), name: "Band Row", muscle: "Back", equipment: "Resistance Band", instructions: "Anchor the band in front of you, pull the handles to the ribs squeezing the shoulder blades together." },
  { id: uid(), name: "Band Chest Press", muscle: "Chest", equipment: "Resistance Band", instructions: "Anchor the band behind you, press the handles forward at chest height, control the return." },
  { id: uid(), name: "Band Overhead Press", muscle: "Shoulders", equipment: "Resistance Band", instructions: "Stand on the band, press the handles straight overhead, lower with control." },
  { id: uid(), name: "Band Woodchop", muscle: "Core", equipment: "Resistance Band", instructions: "Anchor the band to the side, pull it diagonally across the body rotating the torso, control the return." },
  { id: uid(), name: "Band-Assisted Pull-Up", muscle: "Back", equipment: "Power Band", instructions: "Loop a heavy power band over the bar and under a knee or foot, use it to assist through the hardest part of the pull-up." },
  { id: uid(), name: "Band-Resisted Push-Up", muscle: "Chest", equipment: "Power Band", instructions: "Loop the band across the upper back and under the hands, press up against the added resistance." },
  { id: uid(), name: "Band Good Morning", muscle: "Legs", equipment: "Power Band", instructions: "Stand on the band with it looped over the shoulders, hinge forward at the hips keeping a flat back, return to standing." },
  { id: uid(), name: "Band Hip Thrust", muscle: "Glutes", equipment: "Power Band", instructions: "Loop the band across the hips and anchor it under the feet, drive the hips up against the resistance, squeeze at the top." },
  { id: uid(), name: "Band Shoulder Dislocate", muscle: "Shoulders", equipment: "Power Band", instructions: "Hold the band wide with both hands, raise it overhead and behind the back keeping the arms straight, reverse the motion." },
  { id: uid(), name: "Band-Resisted Sprint Start", muscle: "Full Body", equipment: "Power Band", instructions: "Band anchored behind you around the waist, drive forward into a sprint start against the resistance for a few steps." },
  { id: uid(), name: "Single-Arm Dumbbell Snatch", muscle: "Full Body", equipment: "Dumbbell", instructions: "Swing the dumbbell between the legs then explosively pull it overhead to lockout in one motion, alternate arms." },
  { id: uid(), name: "Single-Arm Dumbbell Clean", muscle: "Full Body", equipment: "Dumbbell", instructions: "Pull the dumbbell from the floor to the shoulder in one explosive motion, alternate arms each set." },
  { id: uid(), name: "Single-Arm Overhead Carry", muscle: "Core", equipment: "Dumbbell", instructions: "Press one dumbbell overhead and walk a set distance while keeping the arm locked and the torso stable." },
  { id: uid(), name: "Single-Arm Floor Press", muscle: "Chest", equipment: "Dumbbell", instructions: "Lying on the floor, press one dumbbell straight up from chest level, keeping the non-working side braced." },
  { id: uid(), name: "Single-Arm Dumbbell Row", muscle: "Back", equipment: "Dumbbell", instructions: "One hand and knee on a bench, row the dumbbell to the hip keeping the elbow close, lower with control." },
  { id: uid(), name: "Single-Arm Dumbbell Swing", muscle: "Full Body", equipment: "Dumbbell", instructions: "Hinge at the hips and swing one dumbbell between the legs and up to chest height, alternate arms as prescribed." },
  { id: uid(), name: "Single-Arm Thruster", muscle: "Full Body", equipment: "Dumbbell", instructions: "Hold one dumbbell at the shoulder, squat down then drive up explosively pressing it overhead." },
  { id: uid(), name: "Suitcase Carry", muscle: "Core", equipment: "Dumbbell", instructions: "Hold one heavy dumbbell at your side and walk a set distance without letting the torso lean, switch sides." },
  { id: uid(), name: "Box Jump", muscle: "Legs", equipment: "Plyo Box", instructions: "Stand facing the box, swing the arms and jump onto it landing softly with bent knees, step back down." },
  { id: uid(), name: "Depth Jump", muscle: "Legs", equipment: "Plyo Box", instructions: "Step off the box, land softly, and immediately explode upward into a vertical jump." },
  { id: uid(), name: "Lateral Box Jump", muscle: "Legs", equipment: "Plyo Box", instructions: "Stand beside the box and jump sideways onto it, landing softly, step down and repeat facing the other direction." },
  { id: uid(), name: "Box Jump-Over", muscle: "Legs", equipment: "Plyo Box", instructions: "Jump onto the box then immediately jump off the other side, landing softly and resetting for the next rep." },
  { id: uid(), name: "Single-Leg Box Step-Up", muscle: "Legs", equipment: "Plyo Box", instructions: "Step up onto the box with one leg, driving through the heel, step back down with control." },
  { id: uid(), name: "Box Pike Push-Up", muscle: "Shoulders", equipment: "Plyo Box", instructions: "Feet elevated on the box in a pike position, lower the head toward the floor bending at the shoulders, press back up." },
  { id: uid(), name: "Box Dip", muscle: "Arms", equipment: "Plyo Box", instructions: "Hands on the edge of the box behind you, lower the hips down bending the elbows, press back up." },
  { id: uid(), name: "Box Plyo Push-Up", muscle: "Chest", equipment: "Plyo Box", instructions: "Hands on the box, lower into a push-up then push explosively so the hands leave the box, land softly and repeat." },
  { id: uid(), name: "Smith Machine Squat", muscle: "Legs", equipment: "Smith Machine", instructions: "Bar on the upper traps, squat down to at least parallel keeping the torso upright, drive back up." },
  { id: uid(), name: "Smith Machine Bench Press", muscle: "Chest", equipment: "Smith Machine", instructions: "Lie on a bench under the bar, lower it to the chest, press back up along the fixed track." },
  { id: uid(), name: "Smith Machine Shoulder Press", muscle: "Shoulders", equipment: "Smith Machine", instructions: "Bar at shoulder height, press it straight overhead, lower with control." },
  { id: uid(), name: "Smith Machine Inverted Row", muscle: "Back", equipment: "Smith Machine", instructions: "Set the bar at waist height, hang underneath it and row your chest up to the bar, lower with control." },
  { id: uid(), name: "Smith Machine Lunge", muscle: "Legs", equipment: "Smith Machine", instructions: "Bar on the upper back, step into a lunge position and drive through the front heel to stand." },
  { id: uid(), name: "Smith Machine Romanian Deadlift", muscle: "Legs", equipment: "Smith Machine", instructions: "Bar at hip height, hinge forward keeping a flat back, feel the hamstring stretch, drive hips forward to stand." },
  { id: uid(), name: "Smith Machine Calf Raise", muscle: "Legs", equipment: "Smith Machine", instructions: "Balls of the feet on a small platform under the bar, rise onto the toes, lower for a full stretch." },
  { id: uid(), name: "Smith Machine Hip Thrust", muscle: "Glutes", equipment: "Smith Machine", instructions: "Upper back against a bench under the bar, drive the hips up squeezing the glutes at the top." },
  { id: uid(), name: "Plate Squat to Press", muscle: "Full Body", equipment: "Weight Plate", instructions: "Hold a plate at the chest, squat down, then stand and press the plate overhead." },
  { id: uid(), name: "Plate Russian Twist", muscle: "Core", equipment: "Weight Plate", instructions: "Seated holding the plate, rotate side to side keeping the movement controlled." },
  { id: uid(), name: "Plate Front Raise", muscle: "Shoulders", equipment: "Weight Plate", instructions: "Hold the plate with both hands, raise it straight in front to shoulder height, lower with control." },
  { id: uid(), name: "Plate Halo", muscle: "Shoulders", equipment: "Weight Plate", instructions: "Circle the plate around the head keeping the core braced, alternate direction each set." },
  { id: uid(), name: "Plate Overhead Carry", muscle: "Core", equipment: "Weight Plate", instructions: "Press the plate overhead with both hands and walk a set distance keeping the arms locked out." },
  { id: uid(), name: "Plate Pinch Hold", muscle: "Arms", equipment: "Weight Plate", instructions: "Pinch a plate between the fingers and thumb and hold for time to build grip strength." },
  { id: uid(), name: "Sled Drag (Forward)", muscle: "Legs", equipment: "Sled", instructions: "Attach a harness or rope to the sled, walk forward driving through the legs to pull it across the floor." },
  { id: uid(), name: "Sled Drag (Backward)", muscle: "Legs", equipment: "Sled", instructions: "Face the sled and walk backward pulling it toward you, keeping the steps controlled." },
  { id: uid(), name: "Sled Row Pull", muscle: "Back", equipment: "Sled", instructions: "Facing the sled, pull the rope hand over hand walking backward, rowing the sled toward you." },
  { id: uid(), name: "Sled Lateral Drag", muscle: "Legs", equipment: "Sled", instructions: "Attach the sled to your side and walk laterally, dragging it across the floor with controlled steps." },
  { id: uid(), name: "Sled Sprint Push", muscle: "Full Body", equipment: "Sled", instructions: "Hands on the sled handles, drive through the legs pushing the sled forward as fast as possible for a short distance." },
];

const MUSCLES = ["All", ...Array.from(new Set(SEED_EXERCISES.map(e => e.muscle)))];
const EQUIPMENT = ["All", ...Array.from(new Set(SEED_EXERCISES.map(e => e.equipment)))];

const TEMPLATE_PROGRAMS = [
  {
    id: "tpl-beginner-4wk",
    name: "Beginner Weight Loss — 4 Week Kickstart",
    level: "Beginner",
    description: "3 full-body days per week using approachable equipment, with a short cardio finisher each day. Great for someone new to structured training.",
    days: [
      {
        name: "Day A — Full Body",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12-15" },
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12-15" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 2, reps: "10-12" },
          { exerciseName: "Plank", sets: 3, reps: "30-45 sec" },
          { exerciseName: "Jump Rope", sets: 1, reps: "5 min" },
        ],
      },
      {
        name: "Day B — Full Body",
        exercises: [
          { exerciseName: "Leg Press", sets: 3, reps: "12-15" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Push-Up", sets: 3, reps: "8-12" },
          { exerciseName: "Lateral Raise", sets: 2, reps: "12-15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20 total" },
          { exerciseName: "Rowing Machine", sets: 1, reps: "5 min" },
        ],
      },
      {
        name: "Day C — Full Body",
        exercises: [
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Inverted Row", sets: 3, reps: "8-12" },
          { exerciseName: "Machine Chest Press", sets: 3, reps: "10-12" },
          { exerciseName: "Face Pull", sets: 2, reps: "15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
          { exerciseName: "Assault Bike", sets: 1, reps: "5 min" },
        ],
      },
    ],
  },
  {
    id: "tpl-alllevels-4wk",
    name: "All-Levels Weight Loss Program",
    level: "All levels",
    description: "4 days per week combining compound strength work with conditioning finishers. Scales up or down easily based on the weight a client uses.",
    days: [
      {
        name: "Day 1 — Lower + Core",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "8-10" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10-12" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "10-15" },
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "15-20" },
        ],
      },
      {
        name: "Day 2 — Upper Push/Pull",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8-10" },
          { exerciseName: "Barbell Row", sets: 4, reps: "8-10" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Tricep Pushdown", sets: 2, reps: "12-15" },
          { exerciseName: "Face Pull", sets: 2, reps: "15" },
        ],
      },
      {
        name: "Day 3 — Conditioning",
        exercises: [
          { exerciseName: "Kettlebell Clean and Press", sets: 4, reps: "8 per side" },
          { exerciseName: "Battle Ropes", sets: 4, reps: "30 sec" },
          { exerciseName: "Assault Bike", sets: 4, reps: "1 min hard / 1 min easy" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Day 4 — Full Body",
        exercises: [
          { exerciseName: "Sumo Deadlift", sets: 4, reps: "6-8" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "10-12" },
          { exerciseName: "Push-Up", sets: 3, reps: "10-15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20 total" },
          { exerciseName: "Treadmill Intervals", sets: 1, reps: "10 min" },
        ],
      },
    ],
  },
  {
    id: "tpl-muscle-upperlower",
    name: "Muscle Building — Upper/Lower Split",
    level: "Intermediate",
    description: "4 days per week alternating upper and lower body, with hypertrophy rep ranges to build size and strength.",
    days: [
      {
        name: "Upper A",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8-12" },
          { exerciseName: "Barbell Row", sets: 4, reps: "8-12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Dumbbell Fly", sets: 2, reps: "12-15" },
          { exerciseName: "Tricep Pushdown", sets: 3, reps: "12-15" },
          { exerciseName: "Barbell Curl", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Lower A",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "8-10" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10-12" },
          { exerciseName: "Leg Press", sets: 3, reps: "12-15" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "12-15" },
          { exerciseName: "Standing Calf Raise", sets: 4, reps: "15-20" },
        ],
      },
      {
        name: "Upper B",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "8-12" },
          { exerciseName: "Seated Cable Row", sets: 4, reps: "10-12" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10-12" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Cable Fly", sets: 2, reps: "12-15" },
          { exerciseName: "Skull Crusher", sets: 3, reps: "10-12" },
          { exerciseName: "Hammer Curl", sets: 3, reps: "10-12" },
        ],
      },
      {
        name: "Lower B",
        exercises: [
          { exerciseName: "Smith Machine Squat", sets: 4, reps: "8-10" },
          { exerciseName: "Sumo Deadlift", sets: 3, reps: "8-10" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Leg Extension", sets: 3, reps: "12-15" },
          { exerciseName: "Smith Machine Calf Raise", sets: 4, reps: "15-20" },
        ],
      },
    ],
  },
  {
    id: "tpl-home-bands-dumbbells",
    name: "Home Workout — Bands & Dumbbells Only",
    level: "All levels",
    description: "3 full-body days using only a resistance band, a kettlebell or dumbbell, and bodyweight — perfect for clients training at home.",
    days: [
      {
        name: "Day A",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12-15" },
          { exerciseName: "Band Row", sets: 3, reps: "15" },
          { exerciseName: "Push-Up", sets: 3, reps: "8-15" },
          { exerciseName: "Band Overhead Press", sets: 3, reps: "12-15" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20 total" },
        ],
      },
      {
        name: "Day B",
        exercises: [
          { exerciseName: "Kettlebell Deadlift", sets: 3, reps: "12-15" },
          { exerciseName: "Single-Arm Dumbbell Row", sets: 3, reps: "10-12 per side" },
          { exerciseName: "Band Chest Press", sets: 3, reps: "15" },
          { exerciseName: "Band Bicep Curl", sets: 3, reps: "12-15" },
          { exerciseName: "Plank", sets: 3, reps: "30-45 sec" },
        ],
      },
      {
        name: "Day C",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 4, reps: "15-20" },
          { exerciseName: "Single-Arm Thruster", sets: 3, reps: "10 per side" },
          { exerciseName: "Band Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Band Tricep Pushdown", sets: 3, reps: "12-15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "10 per side" },
        ],
      },
    ],
  },
  {
    id: "tpl-athletic-power",
    name: "Athletic Power & Conditioning",
    level: "Intermediate/Advanced",
    description: "3 days combining explosive power work, heavy compound strength, and hard conditioning — best suited for clients with some training background.",
    days: [
      {
        name: "Day 1 — Power",
        exercises: [
          { exerciseName: "Box Jump", sets: 4, reps: "5" },
          { exerciseName: "Kettlebell Snatch", sets: 4, reps: "6 per side" },
          { exerciseName: "Slam Ball Slam", sets: 4, reps: "10" },
          { exerciseName: "Sled Sprint Push", sets: 4, reps: "20 yards" },
          { exerciseName: "Plank", sets: 3, reps: "45 sec" },
        ],
      },
      {
        name: "Day 2 — Strength",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 5, reps: "5" },
          { exerciseName: "Barbell Bench Press", sets: 5, reps: "5" },
          { exerciseName: "Barbell Row", sets: 4, reps: "6-8" },
          { exerciseName: "Kettlebell Deadlift", sets: 3, reps: "10" },
        ],
      },
      {
        name: "Day 3 — Conditioning",
        exercises: [
          { exerciseName: "Battle Ropes", sets: 5, reps: "30 sec" },
          { exerciseName: "Slam Ball Squat Throw", sets: 4, reps: "12" },
          { exerciseName: "Sled Drag (Forward)", sets: 4, reps: "20 yards" },
          { exerciseName: "Assault Bike", sets: 5, reps: "1 min hard / 1 min easy" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "30 sec" },
        ],
      },
    ],
  },
  {
    id: "tpl-beginner-strength",
    name: "Beginner Strength Foundations",
    level: "Beginner",
    description: "3 machine and Smith Machine based days for someone new to lifting who wants a safe, guided way to build foundational strength.",
    days: [
      {
        name: "Day 1",
        exercises: [
          { exerciseName: "Smith Machine Squat", sets: 3, reps: "10-12" },
          { exerciseName: "Machine Chest Press", sets: 3, reps: "10-12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Leg Extension", sets: 2, reps: "12-15" },
          { exerciseName: "Plank", sets: 3, reps: "20-30 sec" },
        ],
      },
      {
        name: "Day 2",
        exercises: [
          { exerciseName: "Smith Machine Romanian Deadlift", sets: 3, reps: "10-12" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "10-12" },
          { exerciseName: "Machine Shoulder Press", sets: 3, reps: "10-12" },
          { exerciseName: "Seated Leg Curl", sets: 2, reps: "12-15" },
          { exerciseName: "Dead Bug", sets: 3, reps: "8 per side" },
        ],
      },
      {
        name: "Day 3",
        exercises: [
          { exerciseName: "Leg Press", sets: 3, reps: "10-12" },
          { exerciseName: "Smith Machine Bench Press", sets: 3, reps: "10-12" },
          { exerciseName: "Wide-Grip Lat Pulldown", sets: 3, reps: "10-12" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15-20" },
          { exerciseName: "Russian Twist", sets: 3, reps: "16 total" },
        ],
      },
    ],
  },
  {
    id: "tpl-8wk-fatloss-p1",
    name: "8-Week Fat Loss — Phase 1: Foundation (Wks 1-2)",
    level: "All levels",
    description: "Part 1 of 4 in the 8-Week Fat Loss Program. Moderate weight, higher reps, building work capacity and technique. Assign Phase 2 after 2 weeks.",
    days: [
      {
        name: "Day 1 — Upper Body Strength",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 3, reps: "12" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "12" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "12" },
          { exerciseName: "Lateral Raise", sets: 2, reps: "15" },
          { exerciseName: "Tricep Pushdown", sets: 2, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Lower Body Strength",
        exercises: [
          { exerciseName: "Goblet Squat", sets: 3, reps: "12" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "12" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Leg Press", sets: 3, reps: "12" },
          { exerciseName: "Standing Calf Raise", sets: 2, reps: "15" },
          { exerciseName: "Plank", sets: 2, reps: "30 sec" },
        ],
      },
      {
        name: "Day 3 — Full Body Metabolic Circuit",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 3, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Push-Up", sets: 3, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Goblet Squat", sets: 3, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Barbell Row", sets: 3, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Mountain Climber", sets: 3, reps: "45 sec work / 15 sec rest" },
        ],
      },
      {
        name: "Day 4 — Glutes & Core",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 3, reps: "12" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
          { exerciseName: "Russian Twist", sets: 2, reps: "15" },
          { exerciseName: "Dead Bug", sets: 2, reps: "15" },
        ],
      },
    ],
  },
  {
    id: "tpl-8wk-fatloss-p2",
    name: "8-Week Fat Loss — Phase 2: Build (Wks 3-4)",
    level: "All levels",
    description: "Part 2 of 4. Slightly heavier, more supersets, shorter rest. Assign after Phase 1, then move to Phase 3 after these 2 weeks.",
    days: [
      {
        name: "Day 1 — Upper Body Push/Pull Superset",
        exercises: [
          { exerciseName: "Incline Dumbbell Press", sets: 4, reps: "10" },
          { exerciseName: "Barbell Row", sets: 4, reps: "10" },
          { exerciseName: "Arnold Press", sets: 3, reps: "10" },
          { exerciseName: "Lat Pulldown", sets: 3, reps: "10" },
          { exerciseName: "Cable Fly", sets: 3, reps: "12" },
          { exerciseName: "Face Pull", sets: 3, reps: "12" },
        ],
      },
      {
        name: "Day 2 — Lower Body Strength",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "10" },
          { exerciseName: "Romanian Deadlift", sets: 3, reps: "10" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10 per leg" },
          { exerciseName: "Leg Extension", sets: 3, reps: "15" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 3 — Full Body Metabolic Circuit",
        exercises: [
          { exerciseName: "Kettlebell Clean and Press", sets: 4, reps: "40 sec work / 20 sec rest" },
          { exerciseName: "Box Jump", sets: 4, reps: "40 sec work / 20 sec rest" },
          { exerciseName: "Single-Arm Dumbbell Row", sets: 4, reps: "40 sec work / 20 sec rest" },
          { exerciseName: "Battle Ropes", sets: 4, reps: "40 sec work / 20 sec rest" },
          { exerciseName: "Side Plank", sets: 4, reps: "40 sec work / 20 sec rest" },
        ],
      },
      {
        name: "Day 4 — Glutes & Core Focus",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 4, reps: "10" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "12 per leg" },
          { exerciseName: "Curtsy Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Hanging Knee Raise", sets: 3, reps: "12" },
          { exerciseName: "Side Plank", sets: 3, reps: "30 sec" },
        ],
      },
    ],
  },
  {
    id: "tpl-8wk-fatloss-p3",
    name: "8-Week Fat Loss — Phase 3: Intensify (Wks 5-6)",
    level: "All levels",
    description: "Part 3 of 4. Heavier strength work and harder conditioning. Assign after Phase 2, then move to Phase 4 (the final phase) after these 2 weeks.",
    days: [
      {
        name: "Day 1 — Upper Body Strength + Finisher",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "8" },
          { exerciseName: "Barbell Row", sets: 4, reps: "8" },
          { exerciseName: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
          { exerciseName: "Push-Up", sets: 3, reps: "to failure" },
          { exerciseName: "Band Pull-Apart", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Lower Body Strength",
        exercises: [
          { exerciseName: "Front Squat", sets: 4, reps: "8" },
          { exerciseName: "Sumo Deadlift", sets: 3, reps: "8" },
          { exerciseName: "Walking Lunge", sets: 3, reps: "12 per leg" },
          { exerciseName: "Leg Press", sets: 3, reps: "15" },
          { exerciseName: "Standing Calf Raise", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 3 — Full Body Metabolic Circuit",
        exercises: [
          { exerciseName: "Kettlebell Swing", sets: 5, reps: "40 sec work / 15 sec rest" },
          { exerciseName: "Slam Ball Slam", sets: 5, reps: "40 sec work / 15 sec rest" },
          { exerciseName: "Single-Arm Dumbbell Row", sets: 5, reps: "40 sec work / 15 sec rest" },
          { exerciseName: "Box Jump", sets: 5, reps: "40 sec work / 15 sec rest" },
          { exerciseName: "Battle Ropes", sets: 5, reps: "40 sec work / 15 sec rest" },
        ],
      },
      {
        name: "Day 4 — Glutes & Core",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 4, reps: "8" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Pull-Through", sets: 3, reps: "12" },
          { exerciseName: "Russian Twist", sets: 3, reps: "12" },
          { exerciseName: "Plank", sets: 3, reps: "30 sec" },
        ],
      },
    ],
  },
  {
    id: "tpl-8wk-fatloss-p4",
    name: "8-Week Fat Loss — Phase 4: Peak (Wks 7-8)",
    level: "All levels",
    description: "Part 4 of 4, the final phase. Have them try to beat their Week 1 numbers on the main lifts — a great way to show them how far they've come.",
    days: [
      {
        name: "Day 1 — Upper Body Strength Test",
        exercises: [
          { exerciseName: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { exerciseName: "Barbell Row", sets: 4, reps: "6-8" },
          { exerciseName: "Incline Dumbbell Press", sets: 3, reps: "10" },
          { exerciseName: "Seated Cable Row", sets: 3, reps: "10" },
          { exerciseName: "Lateral Raise", sets: 3, reps: "15" },
          { exerciseName: "Face Pull", sets: 3, reps: "15" },
        ],
      },
      {
        name: "Day 2 — Lower Body Strength Test",
        exercises: [
          { exerciseName: "Barbell Back Squat", sets: 4, reps: "6-8" },
          { exerciseName: "Romanian Deadlift", sets: 4, reps: "8" },
          { exerciseName: "Bulgarian Split Squat", sets: 3, reps: "10" },
          { exerciseName: "Seated Leg Curl", sets: 3, reps: "10" },
        ],
      },
      {
        name: "Day 3 — Metabolic Finisher Challenge",
        exercises: [
          { exerciseName: "Kettlebell Clean and Press", sets: 6, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Slam Ball Slam", sets: 6, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Single-Arm Dumbbell Row", sets: 6, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Box Jump", sets: 6, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Mountain Climber", sets: 6, reps: "45 sec work / 15 sec rest" },
          { exerciseName: "Battle Ropes", sets: 6, reps: "45 sec work / 15 sec rest" },
        ],
      },
      {
        name: "Day 4 — Glutes, Core & Retest",
        exercises: [
          { exerciseName: "Hip Thrust", sets: 4, reps: "8" },
          { exerciseName: "Curtsy Lunge", sets: 3, reps: "10 per leg" },
          { exerciseName: "Cable Kickback", sets: 3, reps: "10 per leg" },
          { exerciseName: "Single-Leg RDL", sets: 3, reps: "10 per leg" },
          { exerciseName: "Plank", sets: 3, reps: "max time" },
          { exerciseName: "Russian Twist", sets: 3, reps: "20" },
        ],
      },
    ],
  },
];

const MOBILITY_ROUTINES = [
  {
    id: "mob-hip-flexors",
    name: "Hip Flexor Mobility",
    targetArea: "Hips",
    description: "For tight hip flexors from sitting or heavy lower-body training.",
    exercises: [
      { id: uid(), name: "Kneeling Hip Flexor Stretch", instructions: "Half-kneeling, tuck your pelvis under and lean forward gently until you feel a stretch at the front of the hip on the back leg.", prescription: "2 sets × 30 sec each side" },
      { id: uid(), name: "Couch Stretch", instructions: "Back shin against a couch or wall, back knee bent, front foot forward. Squeeze the glute on the back leg and lean upright.", prescription: "2 sets × 30-45 sec each side" },
      { id: uid(), name: "World's Greatest Stretch", instructions: "From a lunge position, drop the back knee down, then rotate your torso and reach the same-side arm toward the ceiling.", prescription: "2 sets × 5 reps each side" },
      { id: uid(), name: "Standing Quad Stretch", instructions: "Standing on one leg, pull the opposite heel toward your glutes, keeping knees close together.", prescription: "2 sets × 20-30 sec each side" },
    ],
  },
  {
    id: "mob-glutes",
    name: "Glute Activation & Mobility",
    targetArea: "Glutes",
    description: "Wakes up underactive glutes and improves hip mobility.",
    exercises: [
      { id: uid(), name: "Glute Bridge", instructions: "Lie on your back, knees bent. Drive through your heels and squeeze your glutes at the top, pause, lower slowly.", prescription: "3 sets × 15 reps" },
      { id: uid(), name: "Fire Hydrant", instructions: "On hands and knees, lift one bent knee out to the side, keeping the hips level.", prescription: "2 sets × 12 reps each side" },
      { id: uid(), name: "Pigeon Pose Stretch", instructions: "Front shin angled in front of you, back leg extended behind. Fold forward gently over the front leg.", prescription: "2 sets × 30-45 sec each side" },
      { id: uid(), name: "Banded Lateral Walk", instructions: "Band around the ankles or knees, sit into a slight squat and step sideways keeping tension on the band.", prescription: "2 sets × 15 steps each direction" },
    ],
  },
  {
    id: "mob-shoulders",
    name: "Shoulder Mobility & Posture",
    targetArea: "Shoulders",
    description: "Opens up tight shoulders and supports better upper-body posture.",
    exercises: [
      { id: uid(), name: "Band Pull-Apart", instructions: "Hold a light band at shoulder height, arms extended. Pull it apart by squeezing your shoulder blades together.", prescription: "3 sets × 15 reps" },
      { id: uid(), name: "Wall Slides", instructions: "Back against a wall, arms in a goalpost position touching the wall. Slide arms overhead while keeping contact with the wall.", prescription: "2 sets × 12 reps" },
      { id: uid(), name: "Cross-Body Shoulder Stretch", instructions: "Pull one arm across your chest with the opposite hand, keeping the shoulder relaxed.", prescription: "2 sets × 20-30 sec each side" },
      { id: uid(), name: "Thread the Needle", instructions: "On hands and knees, thread one arm under your body and rotate through the upper back.", prescription: "2 sets × 8 reps each side" },
    ],
  },
  {
    id: "mob-apt",
    name: "Anterior Pelvic Tilt Correction",
    targetArea: "Pelvis (forward tilt)",
    description: "Targets the common pattern of tight hip flexors and low back paired with a weaker core and glutes.",
    exercises: [
      { id: uid(), name: "Kneeling Hip Flexor Stretch", instructions: "Half-kneeling, tuck your pelvis under and lean forward gently until you feel a stretch at the front of the hip on the back leg.", prescription: "2 sets × 30 sec each side" },
      { id: uid(), name: "Dead Bug", instructions: "On your back, arms and legs up. Lower opposite arm and leg toward the floor while keeping your low back flat against the ground.", prescription: "3 sets × 10 reps each side" },
      { id: uid(), name: "Glute Bridge", instructions: "Lie on your back, knees bent. Drive through your heels and squeeze your glutes at the top.", prescription: "3 sets × 15 reps" },
      { id: uid(), name: "Posterior Pelvic Tilt Hold", instructions: "Lying on your back, flatten your low back into the floor by gently tucking your hips, and hold.", prescription: "2 sets × 20 sec hold" },
    ],
  },
  {
    id: "mob-ppt",
    name: "Posterior Pelvic Tilt Correction",
    targetArea: "Pelvis (backward tilt)",
    description: "Targets a flattened lower back pattern, often paired with tight hamstrings and glutes.",
    exercises: [
      { id: uid(), name: "Standing Quad Stretch", instructions: "Standing on one leg, pull the opposite heel toward your glutes, keeping knees close together.", prescription: "2 sets × 20-30 sec each side" },
      { id: uid(), name: "Hamstring Stretch", instructions: "Sitting or standing, hinge forward from the hips with a long spine until you feel a stretch behind the thigh.", prescription: "2 sets × 30 sec each side" },
      { id: uid(), name: "Superman Hold", instructions: "Lying face down, lift your arms and legs slightly off the ground and hold, squeezing the lower back and glutes.", prescription: "3 sets × 10 sec hold" },
      { id: uid(), name: "Cat-Cow", instructions: "On hands and knees, alternate between arching and rounding your back slowly with your breath.", prescription: "2 sets × 10 reps" },
    ],
  },
  {
    id: "mob-upper-back",
    name: "Upper Back & Thoracic Mobility",
    targetArea: "Upper back / posture",
    description: "For rounded shoulders and stiffness from long hours at a desk.",
    exercises: [
      { id: uid(), name: "Thoracic Extension on Foam Roller", instructions: "Foam roller placed under your upper back, hands behind your head, gently arch back over the roller.", prescription: "2 sets × 10 reps" },
      { id: uid(), name: "Wall Angels", instructions: "Back against a wall, arms in a goalpost position. Slide arms up and down while keeping contact with the wall.", prescription: "2 sets × 12 reps" },
      { id: uid(), name: "Doorway Chest Stretch", instructions: "Forearm on a doorframe, step forward gently until you feel a stretch across the chest.", prescription: "2 sets × 20-30 sec each side" },
      { id: uid(), name: "Prone Y-T-W Raises", instructions: "Lying face down, raise your arms into a Y, then a T, then a W shape, squeezing the upper back each time.", prescription: "2 sets × 10 reps each letter" },
    ],
  },
  {
    id: "mob-low-back-desk",
    name: "Low Back Relief for Desk Sitters",
    targetArea: "Low back",
    description: "Gentle mobility and core work to ease stiffness from long periods of sitting.",
    exercises: [
      { id: uid(), name: "Cat-Cow", instructions: "On hands and knees, alternate between arching and rounding your back slowly with your breath.", prescription: "2 sets × 10 reps" },
      { id: uid(), name: "Child's Pose", instructions: "Kneel and sit back onto your heels, reaching your arms forward and relaxing your low back.", prescription: "2 sets × 30-45 sec hold" },
      { id: uid(), name: "Knee-to-Chest Stretch", instructions: "Lying on your back, pull one knee toward your chest, keeping the other leg extended or bent.", prescription: "2 sets × 20-30 sec each side" },
      { id: uid(), name: "Bird Dog", instructions: "On hands and knees, extend one arm and the opposite leg while keeping your core braced and back flat.", prescription: "3 sets × 10 reps each side" },
    ],
  },
];

const FONT_STACK = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
`;

const COLORS = {
  bg: "#0E1013",
  surface: "#181B20",
  surfaceAlt: "#20242B",
  border: "#2A2F38",
  text: "#F2F3F5",
  textMuted: "#8D93A0",
  accent: "#FF4E24",
  accentDim: "#3A2018",
  lime: "#C6FF3D",
  danger: "#FF6B6B",
};

function Btn({ children, onClick, variant = "primary", style = {}, disabled, type = "button" }) {
  const base = {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    padding: "11px 18px",
    borderRadius: 10,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "transform 0.08s ease",
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}` },
    subtle: { background: COLORS.surfaceAlt, color: COLORS.text },
    danger: { background: "transparent", color: COLORS.danger, border: `1px solid ${COLORS.danger}55` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: COLORS.surfaceAlt,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "10px 12px",
  color: COLORS.text,
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  );
}

// ============================================================
export function PullToRefresh({ children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const distanceRef = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
      } else {
        pullingRef.current = false;
      }
    };
    const handleTouchMove = (e) => {
      if (!pullingRef.current) return;
      const diff = e.touches[0].clientY - startYRef.current;
      if (diff > 0 && window.scrollY === 0) {
        const d = Math.min(diff * 0.5, 90);
        distanceRef.current = d;
        setPullDistance(d);
      }
    };
    const handleTouchEnd = () => {
      if (distanceRef.current > 60) {
        window.location.reload();
      } else {
        distanceRef.current = 0;
        setPullDistance(0);
      }
      pullingRef.current = false;
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <>
      {pullDistance > 0 && (
        <div
          style={{
            position: "fixed",
            top: "calc(8px + env(safe-area-inset-top))",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            zIndex: 200,
            pointerEvents: "none",
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <div style={{ background: "#181B20", borderRadius: 999, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #2A2F38" }}>
            <RefreshCw size={16} color="#FF4E24" style={{ transform: `rotate(${pullDistance * 4}deg)` }} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}

export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | login | client | trainerGate | trainer
  const [clients, setClients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [trainerPin, setTrainerPin] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientData, setClientData] = useState(null); // {program, logs, messages}
  const [pendingInvite, setPendingInvite] = useState(null);

  useEffect(() => {
    (async () => {
      let ex = await sGet("app:exercises", null);
      if (!ex) {
        ex = SEED_EXERCISES;
        await sSet("app:exercises", ex);
      } else {
        const existingNames = new Set(ex.map((e) => e.name));
        const missing = SEED_EXERCISES.filter((se) => !existingNames.has(se.name));
        if (missing.length) {
          ex = [...ex, ...missing];
          await sSet("app:exercises", ex);
        }
      }
      const cl = await sGet("app:clients", []);
      const pin = await sGet("app:trainerPin", null);
      setExercises(ex);
      setClients(cl);
      setTrainerPin(pin);

      const inviteCode = new URLSearchParams(window.location.search).get("invite");
      if (inviteCode) {
        const invites = await sGet("app:invites", []);
        const invite = invites.find((i) => i.code === inviteCode && i.status !== "claimed");
        if (invite) {
          setPendingInvite(invite);
          setPhase("invite");
          return;
        }
      }
      setPhase("login");
    })();
  }, []);

  const completeInvite = async ({ name, pin }) => {
    const newClient = { id: uid(), name, pin };
    const list = await sGet("app:clients", []);
    await sSet("app:clients", [...list, newClient]);
    setClients([...list, newClient]);

    const invites = await sGet("app:invites", []);
    await sSet("app:invites", invites.map((i) => (i.id === pendingInvite.id ? { ...i, status: "claimed" } : i)));

    window.history.replaceState({}, "", window.location.pathname);
    setCurrentClient(newClient);
    await loadClientData(newClient.id);
    setPhase("client");
  };

  const loadClientData = async (clientId) => {
    const data = await sGet(`client:${clientId}`, { program: { days: [] }, logs: [], messages: [], nutrition: {} });
    setClientData(data);
  };

  const saveClientData = async (clientId, data) => {
    setClientData(data);
    await sSet(`client:${clientId}`, data);
  };

  const refreshClients = async () => {
    const cl = await sGet("app:clients", []);
    setClients(cl);
  };
  const refreshExercises = async () => {
    const ex = await sGet("app:exercises", []);
    setExercises(ex);
  };

  if (phase === "loading") {
    return (
      <div style={{ ...pageBase, alignItems: "center", justifyContent: "center", display: "flex" }}>
        <style>{FONT_STACK}</style>
        <div style={{ color: COLORS.textMuted, fontFamily: "'Space Grotesk', sans-serif" }}>Loading…</div>
      </div>
    );
  }

  if (phase === "invite" && pendingInvite) {
    return <InviteSignup invite={pendingInvite} onComplete={completeInvite} />;
  }

  if (phase === "login") {
    return (
      <LoginScreen
        clients={clients}
        onClientLogin={async (client) => {
          setCurrentClient(client);
          await loadClientData(client.id);
          setPhase("client");
        }}
        onTrainerClick={() => setPhase("trainerGate")}
      />
    );
  }

  if (phase === "trainerGate") {
    return (
      <TrainerGate
        hasPin={!!trainerPin}
        onSetPin={async (pin) => {
          await sSet("app:trainerPin", pin);
          setTrainerPin(pin);
          setPhase("trainer");
        }}
        onUnlock={(pin) => {
          if (pin === trainerPin) setPhase("trainer");
          else return false;
          return true;
        }}
        onBack={() => setPhase("login")}
      />
    );
  }

  if (phase === "trainer") {
    return (
      <TrainerConsole
        clients={clients}
        exercises={exercises}
        onRefreshClients={refreshClients}
        onRefreshExercises={refreshExercises}
        onExit={() => setPhase("login")}
      />
    );
  }

  if (phase === "client" && currentClient && clientData) {
    return (
      <ClientApp
        client={currentClient}
        exercises={exercises}
        data={clientData}
        onSave={(d) => saveClientData(currentClient.id, d)}
        onLogout={() => {
          setCurrentClient(null);
          setClientData(null);
          setPhase("login");
        }}
      />
    );
  }

  return null;
}

const pageBase = {
  minHeight: 560,
  background: COLORS.bg,
  color: COLORS.text,
  fontFamily: "'Inter', sans-serif",
};

// ============================================================
function LoginScreen({ clients, onClientLogin, onTrainerClick }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const quote = useMemo(() => todaysQuote(), []);

  const handleLogin = () => {
    const match = clients.find(
      (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase() && (c.pin || "") === pin
    );
    if (!match) {
      setError("Name or PIN not recognized");
      return;
    }
    if (match.status === "paused") {
      setError("Your account is currently paused. Please contact your trainer.");
      return;
    }
    setError("");
    onClientLogin(match);
  };

  return (
    <div style={{ ...pageBase, padding: "40px 20px", paddingTop: "calc(40px + env(safe-area-inset-top))", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{FONT_STACK}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <img src="/logo-mark.png" alt="Xcel Online PT" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            Xcel Online PT
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>Sign in to see your workouts</p>
        </div>

        <div style={{ textAlign: "center", marginBottom: 24, padding: "0 10px" }}>
          <p style={{ fontSize: 13, fontStyle: "italic", color: COLORS.text, lineHeight: 1.5, margin: 0 }}>"{quote.text}"</p>
          {quote.author && (
            <p style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>— {quote.author}</p>
          )}
        </div>

        <Card>
          <Field label="Your name">
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Full name"
              autoFocus
            />
          </Field>
          <Field label="PIN">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={inputStyle}
              placeholder="••••"
            />
          </Field>
          {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <Btn onClick={handleLogin} style={{ width: "100%" }}>Log in</Btn>
        </Card>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button onClick={onTrainerClick} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Settings size={13} /> Trainer access
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ============================================================
function InviteSignup({ invite, onComplete }) {
  const [name, setName] = useState(invite.name || "");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError("Enter your name.");
    if (pin.length < 3) return setError("Choose a PIN with at least 3 digits.");
    if (pin !== confirmPin) return setError("PINs don't match.");
    setError("");
    setSaving(true);
    await onComplete({ name: name.trim(), pin });
    setSaving(false);
  };

  return (
    <div style={{ ...pageBase, padding: "40px 20px", paddingTop: "calc(40px + env(safe-area-inset-top))", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{FONT_STACK}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <img src="/logo-mark.png" alt="Xcel Online PT" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            Welcome to Xcel Online PT
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>Your trainer invited you — set up your account below.</p>
        </div>
        <Card>
          <Field label="Your name">
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field label="Choose a PIN">
            <input type="password" inputMode="numeric" style={inputStyle} value={pin} onChange={(e) => setPin(e.target.value)} />
          </Field>
          <Field label="Confirm PIN">
            <input type="password" inputMode="numeric" style={inputStyle} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} />
          </Field>
          {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <Btn onClick={submit} disabled={saving} style={{ width: "100%" }}>{saving ? "Setting up…" : "Create my account"}</Btn>
        </Card>
      </div>
    </div>
  );
}

function TrainerGate({ hasPin, onSetPin, onUnlock, onBack }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ ...pageBase, padding: "40px 20px", paddingTop: "calc(40px + env(safe-area-inset-top))", display: "flex", justifyContent: "center" }}>
      <style>{FONT_STACK}</style>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 6, marginBottom: 20, cursor: "pointer", fontSize: 13, padding: 0 }}>
          <ChevronLeft size={16} /> Back
        </button>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Lock size={18} color={COLORS.accent} />
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17 }}>
              {hasPin ? "Trainer login" : "Set up your trainer PIN"}
            </div>
          </div>
          <Field label={hasPin ? "PIN" : "Choose a PIN"}>
            <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} style={inputStyle} autoFocus />
          </Field>
          {!hasPin && (
            <Field label="Confirm PIN">
              <input type="password" inputMode="numeric" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} style={inputStyle} />
            </Field>
          )}
          {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <Btn
            style={{ width: "100%" }}
            onClick={() => {
              if (!hasPin) {
                if (pin.length < 3) return setError("PIN should be at least 3 digits.");
                if (pin !== confirmPin) return setError("PINs don't match.");
                onSetPin(pin);
              } else {
                const ok = onUnlock(pin);
                if (!ok) setError("Incorrect PIN.");
              }
            }}
          >
            {hasPin ? "Unlock" : "Save & continue"}
          </Btn>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
function TrainerConsole({ clients, exercises, onRefreshClients, onRefreshExercises, onExit }) {
  const [tab, setTab] = useState("clients");
  const [trainerSubscribed, setTrainerSubscribed] = useState(false);
  const [notifBusy, setNotifBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const sub = await sGet("app:trainerPushSubscription", null);
      setTrainerSubscribed(!!sub);
    })();
  }, []);

  const enableTrainerNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported in this browser.");
      return;
    }
    setNotifBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifBusy(false);
        return;
      }
      const { VAPID_PUBLIC_KEY } = await import("./pushConfig.js");
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
      await sSet("app:trainerPushSubscription", sub.toJSON());
      setTrainerSubscribed(true);
    } catch (e) {
      console.error(e);
    }
    setNotifBusy(false);
  };

  const tabs = [
    { id: "clients", label: "Clients", icon: User },
    { id: "library", label: "Library", icon: Dumbbell },
    { id: "templates", label: "Templates", icon: Layers },
    { id: "mobility", label: "Mobility", icon: Activity },
    { id: "programs", label: "Programs", icon: CalendarDays },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "community", label: "Community", icon: Users },
  ];

  return (
    <div style={{ ...pageBase, display: "flex", flexDirection: "column" }}>
      <style>{FONT_STACK}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", paddingTop: "calc(16px + env(safe-area-inset-top))", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>Trainer Console</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={enableTrainerNotifications} disabled={notifBusy} title={trainerSubscribed ? "Notifications on" : "Enable notifications"} style={{ background: "none", border: "none", color: trainerSubscribed ? COLORS.lime : COLORS.textMuted, cursor: "pointer" }}>
            {trainerSubscribed ? <Bell size={17} /> : <BellOff size={17} />}
          </button>
          <button onClick={onExit} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, padding: "0 12px", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              border: "none",
              padding: "12px 14px",
              color: tab === t.id ? COLORS.accent : COLORS.textMuted,
              borderBottom: tab === t.id ? `2px solid ${COLORS.accent}` : "2px solid transparent",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
        {tab === "clients" && <ClientsTab clients={clients} onRefresh={onRefreshClients} />}
        {tab === "library" && <LibraryTab exercises={exercises} onRefresh={onRefreshExercises} />}
        {tab === "templates" && <TemplatesTab clients={clients} exercises={exercises} />}
        {tab === "mobility" && <MobilityTab clients={clients} />}
        {tab === "programs" && <ProgramsTab clients={clients} exercises={exercises} />}
        {tab === "nutrition" && <NutritionTargetsTab clients={clients} />}
        {tab === "messages" && <MessagesTab clients={clients} />}
        {tab === "community" && <CommunityBoard isTrainer clients={clients} />}
      </div>
    </div>
  );
}

function InviteByEmail({ onSent }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const send = async () => {
    if (!name.trim() || !email.trim()) return;
    setSending(true);
    setStatus("");
    try {
      const code = uid() + uid();
      const invites = await sGet("app:invites", []);
      const invite = { id: uid(), code, name: name.trim(), email: email.trim(), status: "pending", createdAt: new Date().toISOString() };
      await sSet("app:invites", [...invites, invite]);

      const link = `${window.location.origin}${window.location.pathname}?invite=${code}`;
      const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } = await import("./emailConfig.js");

      if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID.startsWith("YOUR_")) {
        setStatus(`Invite saved! Email sending isn't set up yet — share this link with them yourself: ${link}`);
      } else {
        const emailjs = (await import("@emailjs/browser")).default;
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          { to_name: name.trim(), to_email: email.trim(), invite_link: link },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        setStatus(`Invite emailed to ${email.trim()}!`);
      }
      setName("");
      setEmail("");
      onSent();
    } catch (e) {
      setStatus("Invite was saved, but sending the email failed — check your EmailJS setup or share the link manually.");
    }
    setSending(false);
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Invite a new client by email</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Field label="Email"><input type="email" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
      </div>
      <Btn onClick={send} disabled={sending || !name.trim() || !email.trim()}>{sending ? "Sending…" : "Send invite"}</Btn>
      {status && <div style={{ fontSize: 11, color: status.startsWith("Invite emailed") ? COLORS.lime : COLORS.textMuted, marginTop: 8, wordBreak: "break-all" }}>{status}</div>}
    </Card>
  );
}

function PendingInvites({ refreshKey }) {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await sGet("app:invites", []);
      setInvites(list.filter((i) => i.status !== "claimed").sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setLoading(false);
    })();
  }, [refreshKey]);

  const cancelInvite = async (id) => {
    const list = await sGet("app:invites", []);
    await sSet("app:invites", list.filter((i) => i.id !== id));
    setInvites(invites.filter((i) => i.id !== id));
  };

  if (loading || invites.length === 0) return null;

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Pending invites</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {invites.map((i) => (
          <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 10px" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{i.email}</div>
            </div>
            <button onClick={() => cancelInvite(i.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ClientsTab({ clients, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [editing, setEditing] = useState(null);
  const [showPaused, setShowPaused] = useState(false);

  const addClient = async () => {
    if (!name.trim() || !pin.trim()) return;
    const list = await sGet("app:clients", []);
    list.push({ id: uid(), name: name.trim(), pin: pin.trim(), status: "active" });
    await sSet("app:clients", list);
    setName(""); setPin(""); setAdding(false);
    onRefresh();
  };

  const removeClient = async (id) => {
    const list = await sGet("app:clients", []);
    await sSet("app:clients", list.filter((c) => c.id !== id));
    onRefresh();
  };

  const updateClient = async (id, patch) => {
    const list = await sGet("app:clients", []);
    const next = list.map((c) => (c.id === id ? { ...c, ...patch } : c));
    await sSet("app:clients", next);
    setEditing(null);
    onRefresh();
  };

  const setStatus = async (id, status) => {
    await updateClient(id, { status });
  };

  const [inviteRefresh, setInviteRefresh] = useState(0);

  const activeClients = clients.filter((c) => c.status !== "paused");
  const pausedClients = clients.filter((c) => c.status === "paused");
  const visibleClients = showPaused ? pausedClients : activeClients;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>Clients ({activeClients.length})</div>
        <Btn onClick={() => setAdding(!adding)} variant={adding ? "ghost" : "primary"}>
          {adding ? <X size={15} /> : <Plus size={15} />} {adding ? "Cancel" : "Add client"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            </div>
            <div style={{ width: 120 }}>
              <Field label="PIN"><input style={inputStyle} value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
            </div>
          </div>
          <Btn onClick={addClient}>Save client</Btn>
        </Card>
      )}

      <InviteByEmail onSent={() => setInviteRefresh((n) => n + 1)} />
      <PendingInvites refreshKey={inviteRefresh} />

      {pausedClients.length > 0 && (
        <button onClick={() => setShowPaused(!showPaused)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 14 }}>
          {showPaused ? "← Back to active clients" : `Show paused clients (${pausedClients.length})`}
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visibleClients.length === 0 && (
          <div style={{ color: COLORS.textMuted, fontSize: 13 }}>{showPaused ? "No paused clients." : "No active clients yet."}</div>
        )}
        {visibleClients.map((c) => (
          <Card key={c.id} style={{ padding: 14 }}>
            {editing === c.id ? (
              <EditClientRow client={c} onSave={(patch) => updateClient(c.id, patch)} onCancel={() => setEditing(null)} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</div>
                    {c.status === "paused" && (
                      <span style={{ fontSize: 10, color: COLORS.textMuted, background: COLORS.surfaceAlt, borderRadius: 6, padding: "2px 6px" }}>Paused</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>PIN: {c.pin}</div>
                  {c.stripeLink && (
                    <a href={c.stripeLink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: COLORS.lime, display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <CreditCard size={11} /> Payment link set
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {c.status === "paused" ? (
                    <button onClick={() => setStatus(c.id, "active")} title="Reactivate" style={{ background: "none", border: "none", color: COLORS.lime, cursor: "pointer" }}><Check size={16} /></button>
                  ) : (
                    <button onClick={() => setStatus(c.id, "paused")} title="Pause client" style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Clock size={16} /></button>
                  )}
                  <button onClick={() => setEditing(c.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Edit3 size={16} /></button>
                  <button onClick={() => removeClient(c.id)} title="Delete permanently" style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
              </div>
            )}
            <IntakeViewer clientId={c.id} />
            <NutritionViewer clientId={c.id} />
            <ProgressPhotosViewer clientId={c.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function IntakeViewer({ clientId }) {
  const [open, setOpen] = useState(false);
  const [intake, setIntake] = useState(null);
  const [waiver, setWaiver] = useState(null);
  const [latestStats, setLatestStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!open && intake === null) {
      setLoading(true);
      const data = await sGet(`client:${clientId}`, {});
      setIntake(data.intake || false);
      setWaiver(data.waiver || false);
      const stats = (data.bodyStats || []).slice().sort((a, b) => a.date.localeCompare(b.date));
      setLatestStats(stats[stats.length - 1] || null);
      setLoading(false);
    }
    setOpen(!open);
  };

  const bmi = latestStats && intake?.heightIn ? computeBMI(latestStats.weight, intake.heightIn) : null;

  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      <button onClick={toggle} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 11, cursor: "pointer", padding: 0 }}>
        {open ? "Hide intake info" : "View intake info"}
      </button>
      {open && (
        loading ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Loading…</div> :
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.6 }}>
          {waiver ? (
            <div style={{ marginBottom: 8, padding: 8, background: waiver.hasFlags ? COLORS.accentDim : COLORS.surfaceAlt, borderRadius: 6 }}>
              <strong style={{ color: COLORS.text }}>Waiver:</strong> Signed by {waiver.signatureName} on {new Date(waiver.agreedAt).toLocaleDateString()}
              {waiver.hasFlags && <div style={{ color: COLORS.accent, marginTop: 4 }}>⚠ Flagged a "Yes" on the health screening — doctor clearance recommended.</div>}
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}><strong style={{ color: COLORS.text }}>Waiver:</strong> Not signed yet.</div>
          )}
          {!intake ? (
            <div>This client hasn't filled out their intake form yet.</div>
          ) : (
            <>
              <div><strong style={{ color: COLORS.text }}>Goal:</strong> {intake.goal || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Experience:</strong> {intake.experience || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Age / height / gender:</strong> {intake.age || "—"} / {intake.heightIn ? `${Math.floor(intake.heightIn / 12)}'${intake.heightIn % 12}"` : "—"} / {intake.gender || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Equipment:</strong> {intake.equipment || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Injuries/limitations:</strong> {intake.injuries || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Medications:</strong> {intake.medications || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Physician:</strong> {intake.physicianName || "—"}</div>
              <div><strong style={{ color: COLORS.text }}>Emergency contact:</strong> {intake.emergencyContactName || "—"} {intake.emergencyContactPhone ? `(${intake.emergencyContactPhone})` : ""}</div>
              {latestStats && (
                <div style={{ marginTop: 6 }}>
                  <strong style={{ color: COLORS.text }}>Latest stats ({fmtDate(latestStats.date)}):</strong> {latestStats.weight} lbs{latestStats.bodyFat != null ? `, ${latestStats.bodyFat}% BF` : ""}{bmi ? `, BMI ${bmi.toFixed(1)} (${bmiCategory(bmi)})` : ""}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NutritionViewer({ clientId }) {
  const [open, setOpen] = useState(false);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!open && nutrition === null) {
      setLoading(true);
      const data = await sGet(`client:${clientId}`, {});
      setNutrition(data.nutrition || {});
      setLoading(false);
    }
    setOpen(!open);
  };

  const targets = nutrition?.targets || {};
  const hasTargets = targets.calories || targets.protein || targets.carbs || targets.fat;
  const logs = useMemo(
    () => [...(nutrition?.logs || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7),
    [nutrition]
  );

  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      <button onClick={toggle} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 11, cursor: "pointer", padding: 0 }}>
        {open ? "Hide nutrition log" : "View nutrition log"}
      </button>
      {open && (
        loading ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Loading…</div> :
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 10 }}>
            <strong style={{ color: COLORS.text }}>Daily targets:</strong>{" "}
            {hasTargets ? `${targets.calories || "—"} cal · ${targets.protein || "—"}g P · ${targets.carbs || "—"}g C · ${targets.fat || "—"}g F` : "Not set yet"}
          </div>
          {logs.length === 0 ? (
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>This client hasn't logged any food yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.map((l) => {
                const totals = (l.entries || []).reduce((acc, e) => ({
                  calories: acc.calories + (e.calories || 0),
                  protein: acc.protein + (e.protein || 0),
                  carbs: acc.carbs + (e.carbs || 0),
                  fat: acc.fat + (e.fat || 0),
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
                return (
                  <div key={l.date} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                      <span>{fmtDate(l.date)}</span>
                      <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>
                        {totals.calories} cal · {totals.protein}g P · {totals.carbs}g C · {totals.fat}g F
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6 }}>
                      {(l.entries || []).map((e) => e.name).join(", ") || "No items logged"}
                    </div>
                    {(l.burned || []).length > 0 && (
                      <div style={{ fontSize: 11, color: COLORS.lime, marginTop: 4 }}>
                        Burned: {l.burned.reduce((s, b) => s + (Number(b.calories) || 0), 0)} cal ({l.burned.map((b) => b.label).join(", ")}) · Net: {totals.calories - l.burned.reduce((s, b) => s + (Number(b.calories) || 0), 0)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressPhotosViewer({ clientId }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState(null);

  const toggle = async () => {
    if (!open && photos === null) {
      setLoading(true);
      const data = await sGet(`client:${clientId}`, {});
      setPhotos([...(data.progressPhotos || [])].sort((a, b) => b.date.localeCompare(a.date)));
      setLoading(false);
    }
    setOpen(!open);
  };

  return (
    <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
      <button onClick={toggle} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 11, cursor: "pointer", padding: 0 }}>
        {open ? "Hide progress photos" : "View progress photos"}
      </button>
      {open && (
        loading ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>Loading…</div> :
        !photos || photos.length === 0 ? <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>This client hasn't uploaded any progress photos yet.</div> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 6, marginTop: 8 }}>
          {photos.map((p) => (
            <div key={p.id} onClick={() => setViewing(p)} style={{ aspectRatio: "1 / 1", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: COLORS.surfaceAlt }}>
              <img src={p.url} alt={fmtDate(p.date)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}
      {viewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewing(null)}>
          <img src={viewing.url} alt="" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          <div style={{ color: "#fff", fontSize: 13, marginTop: 14 }}>{fmtDate(viewing.date)}</div>
        </div>
      )}
    </div>
  );
}


function EditClientRow({ client, onSave, onCancel }) {
  const [name, setName] = useState(client.name);
  const [pin, setPin] = useState(client.pin);
  const [stripeLink, setStripeLink] = useState(client.stripeLink || "");
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        </div>
        <div style={{ width: 100 }}>
          <Field label="PIN"><input style={inputStyle} value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
        </div>
      </div>
      <Field label="Stripe Payment Link (optional)">
        <input style={inputStyle} placeholder="https://buy.stripe.com/..." value={stripeLink} onChange={(e) => setStripeLink(e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Btn onClick={() => onSave({ name, pin, stripeLink: stripeLink.trim() })}><Check size={15} /></Btn>
        <Btn variant="ghost" onClick={onCancel}><X size={15} /></Btn>
      </div>
    </div>
  );
}

function LibraryTab({ exercises, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", muscle: "Legs", equipment: "Barbell", instructions: "", videoUrl: "" });
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [query, setQuery] = useState("");

  const addExercise = async () => {
    if (!form.name.trim()) return;
    const list = await sGet("app:exercises", []);
    list.push({ id: uid(), ...form, name: form.name.trim() });
    await sSet("app:exercises", list);
    setForm({ name: "", muscle: "Legs", equipment: "Barbell", instructions: "", videoUrl: "" });
    setAdding(false);
    onRefresh();
  };

  const removeExercise = async (id) => {
    const list = await sGet("app:exercises", []);
    await sSet("app:exercises", list.filter((e) => e.id !== id));
    onRefresh();
  };

  const filtered = exercises.filter((e) => (muscleFilter === "All" || e.muscle === muscleFilter) && e.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>Exercise Library ({exercises.length})</div>
        <Btn onClick={() => setAdding(!adding)} variant={adding ? "ghost" : "primary"}>
          {adding ? <X size={15} /> : <Plus size={15} />} {adding ? "Cancel" : "Add exercise"}
        </Btn>
      </div>

      {adding && (
        <Card style={{ marginBottom: 16 }}>
          <Field label="Name"><input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Muscle group">
                <input style={inputStyle} value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })} list="muscle-list" />
                <datalist id="muscle-list">{MUSCLES.filter(m=>m!=="All").map(m => <option key={m} value={m} />)}</datalist>
              </Field>
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Equipment">
                <input style={inputStyle} value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} list="equip-list" />
                <datalist id="equip-list">{EQUIPMENT.filter(m=>m!=="All").map(m => <option key={m} value={m} />)}</datalist>
              </Field>
            </div>
          </div>
          <Field label="Instructions">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
          </Field>
          <Field label="Video URL (optional, YouTube link)">
            <input style={inputStyle} placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </Field>
          <Btn onClick={addExercise}>Save exercise</Btn>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input style={{ ...inputStyle, maxWidth: 220 }} placeholder="Search exercises…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select style={{ ...inputStyle, maxWidth: 160 }} value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}>
          {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {filtered.map((e) => (
          <Card key={e.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>{e.name}</div>
              <button onClick={() => removeExercise(e.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
            </div>
            <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 4 }}>{e.muscle} · {e.equipment}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 8, lineHeight: 1.5 }}>{e.instructions}</div>
            <VideoLinkEditor exercise={e} onSaved={onRefresh} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function VideoLinkEditor({ exercise, onSaved }) {
  const [url, setUrl] = useState(exercise.videoUrl || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    const list = await sGet("app:exercises", []);
    const next = list.map((ex) => (ex.id === exercise.id ? { ...ex, videoUrl: url.trim() } : ex));
    await sSet("app:exercises", next);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
      <input
        style={{ ...inputStyle, fontSize: 12, padding: "6px 10px" }}
        placeholder="Paste a YouTube link…"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Btn variant="subtle" style={{ padding: "6px 12px", fontSize: 12 }} onClick={save}>{saved ? <Check size={13} /> : "Save"}</Btn>
    </div>
  );
}

function TemplatesTab({ clients, exercises }) {
  const [expandedId, setExpandedId] = useState(null);
  const [assignTarget, setAssignTarget] = useState({}); // templateId -> clientId
  const [confirming, setConfirming] = useState(null); // templateId awaiting confirm
  const [status, setStatus] = useState({}); // templateId -> "done" | "missing:name1,name2"

  const resolveDays = (template) => {
    const missing = [];
    const days = template.days.map((day) => ({
      id: uid(),
      name: day.name,
      exercises: day.exercises.map((ex) => {
        const found = exercises.find((e) => e.name.toLowerCase() === ex.exerciseName.toLowerCase());
        if (!found) missing.push(ex.exerciseName);
        return { id: uid(), exerciseId: found?.id || null, sets: ex.sets, reps: ex.reps, notes: "" };
      }).filter((ex) => ex.exerciseId),
    }));
    return { days, missing };
  };

  const assign = async (template) => {
    const clientId = assignTarget[template.id];
    if (!clientId) return;
    const { days, missing } = resolveDays(template);
    const data = await sGet(`client:${clientId}`, { program: { days: [] }, logs: [], messages: [] });
    await sSet(`client:${clientId}`, { ...data, program: { days } });
    setStatus({ ...status, [template.id]: missing.length ? `Assigned — couldn't find: ${missing.join(", ")}` : "Assigned successfully" });
    setConfirming(null);
    setTimeout(() => setStatus((s) => ({ ...s, [template.id]: null })), 4000);
  };

  if (clients.length === 0) {
    return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Add a client first, then come back here to assign them a program.</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Program templates</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>Assigning a template replaces that client's current program.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TEMPLATE_PROGRAMS.map((t) => (
          <Card key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>{t.level} · {t.days.length} days/week</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.5 }}>{t.description}</div>
              </div>
              <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", padding: "6px 10px", fontSize: 11, flexShrink: 0 }}>
                {expandedId === t.id ? "Hide" : "Preview"}
              </button>
            </div>

            {expandedId === t.id && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {t.days.map((day, i) => (
                  <div key={i} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{day.name}</div>
                    {day.exercises.map((ex, j) => (
                      <div key={j} style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                        <span>{ex.exerciseName}</span>
                        <span>{ex.sets} × {ex.reps}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
              <select
                style={{ ...inputStyle, maxWidth: 200 }}
                value={assignTarget[t.id] || ""}
                onChange={(e) => setAssignTarget({ ...assignTarget, [t.id]: e.target.value })}
              >
                <option value="">Choose a client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {confirming === t.id ? (
                <>
                  <span style={{ fontSize: 11, color: COLORS.danger }}>Replace their current program?</span>
                  <Btn style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => assign(t)}>Yes, assign</Btn>
                  <Btn variant="ghost" style={{ padding: "8px 12px", fontSize: 12 }} onClick={() => setConfirming(null)}>Cancel</Btn>
                </>
              ) : (
                <Btn
                  style={{ padding: "8px 12px", fontSize: 12 }}
                  disabled={!assignTarget[t.id]}
                  onClick={() => setConfirming(t.id)}
                >
                  Assign to client
                </Btn>
              )}
            </div>
            {status[t.id] && <div style={{ fontSize: 11, color: status[t.id].startsWith("Assigned success") ? COLORS.lime : COLORS.danger, marginTop: 8 }}>{status[t.id]}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function MobilityTab({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      setLoading(true);
      const data = await sGet(`client:${selectedClientId}`, {});
      setAssigned(data.mobility?.routines || []);
      setLoading(false);
    })();
  }, [selectedClientId]);

  const assignRoutine = async (routine) => {
    if (assigned.some((r) => r.routineId === routine.id)) return;
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    const nextRoutines = [...(data.mobility?.routines || []), { id: uid(), routineId: routine.id, name: routine.name, targetArea: routine.targetArea, exercises: routine.exercises }];
    await sSet(`client:${selectedClientId}`, { ...data, mobility: { ...(data.mobility || {}), routines: nextRoutines } });
    setAssigned(nextRoutines);
    setStatus(`Assigned "${routine.name}"`);
    setTimeout(() => setStatus(""), 2500);
  };

  const unassignRoutine = async (id) => {
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    const nextRoutines = (data.mobility?.routines || []).filter((r) => r.id !== id);
    await sSet(`client:${selectedClientId}`, { ...data, mobility: { ...(data.mobility || {}), routines: nextRoutines } });
    setAssigned(nextRoutines);
  };

  if (clients.length === 0) {
    return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Add a client first, then come back here to assign mobility work.</div>;
  }

  return (
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Mobility & flexibility routines</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>
        These stack alongside a client's regular program — assigning one adds it to their Mobility tab without touching their workouts.
      </div>

      <select style={{ ...inputStyle, maxWidth: 260, marginBottom: 16 }} value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : (
        <>
          {assigned.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Currently assigned</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {assigned.map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 10px" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.accent }}>{r.targetArea}</div>
                    </div>
                    <button onClick={() => unassignRoutine(r.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {status && <div style={{ fontSize: 12, color: COLORS.lime, marginBottom: 12 }}>{status}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOBILITY_ROUTINES.map((r) => {
              const isAssigned = assigned.some((a) => a.routineId === r.id);
              return (
                <Card key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>{r.targetArea}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.5 }}>{r.description}</div>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", padding: "6px 10px", fontSize: 11, flexShrink: 0 }}>
                      {expandedId === r.id ? "Hide" : "Preview"}
                    </button>
                  </div>

                  {expandedId === r.id && (
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                      {r.exercises.map((ex, i) => (
                        <div key={i} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{ex.name}</div>
                          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{ex.prescription}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Btn
                    style={{ marginTop: 14, padding: "8px 12px", fontSize: 12 }}
                    variant={isAssigned ? "ghost" : "primary"}
                    disabled={isAssigned}
                    onClick={() => assignRoutine(r)}
                  >
                    {isAssigned ? "Already assigned" : "Assign to client"}
                  </Btn>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


function NutritionTargetsTab({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [targets, setTargets] = useState({ calories: "", protein: "", carbs: "", fat: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      setLoading(true);
      const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [], nutrition: {} });
      setTargets(data.nutrition?.targets || { calories: "", protein: "", carbs: "", fat: "" });
      setLoading(false);
    })();
  }, [selectedClientId]);

  const save = async () => {
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [], nutrition: {} });
    const nutrition = { ...(data.nutrition || {}), targets };
    await sSet(`client:${selectedClientId}`, { ...data, nutrition });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (clients.length === 0) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Add a client first to set their nutrition goals.</div>;

  return (
    <div>
      <select style={{ ...inputStyle, maxWidth: 260, marginBottom: 16 }} value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      {loading ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : (
        <Card>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Daily targets</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
            <Field label="Calories">
              <input type="number" style={inputStyle} value={targets.calories} onChange={(e) => setTargets({ ...targets, calories: e.target.value })} />
            </Field>
            <Field label="Protein (g)">
              <input type="number" style={inputStyle} value={targets.protein} onChange={(e) => setTargets({ ...targets, protein: e.target.value })} />
            </Field>
            <Field label="Carbs (g)">
              <input type="number" style={inputStyle} value={targets.carbs} onChange={(e) => setTargets({ ...targets, carbs: e.target.value })} />
            </Field>
            <Field label="Fat (g)">
              <input type="number" style={inputStyle} value={targets.fat} onChange={(e) => setTargets({ ...targets, fat: e.target.value })} />
            </Field>
          </div>
          <Btn onClick={save} style={{ marginTop: 6 }}>{saved ? <Check size={15} /> : "Save targets"}</Btn>
        </Card>
      )}
    </div>
  );
}

function ProgramsTab({ clients, exercises }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [program, setProgram] = useState({ days: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      setLoading(true);
      const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
      setProgram(data.program || { days: [] });
      setLoading(false);
    })();
  }, [selectedClientId]);

  const persist = async (nextProgram) => {
    setProgram(nextProgram);
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    await sSet(`client:${selectedClientId}`, { ...data, program: nextProgram });
  };

  const addDay = () => persist({ days: [...program.days, { id: uid(), name: `Day ${program.days.length + 1}`, dayOfWeek: "", exercises: [] }] });
  const removeDay = (dayId) => persist({ days: program.days.filter((d) => d.id !== dayId) });
  const renameDay = (dayId, name) => persist({ days: program.days.map((d) => (d.id === dayId ? { ...d, name } : d)) });
  const setDayOfWeek = (dayId, dayOfWeek) => persist({ days: program.days.map((d) => (d.id === dayId ? { ...d, dayOfWeek } : d)) });
  const addExerciseToDay = (dayId, exerciseId) => {
    if (!exerciseId) return;
    persist({
      days: program.days.map((d) => d.id === dayId ? { ...d, exercises: [...d.exercises, { id: uid(), exerciseId, sets: 3, reps: "10", notes: "" }] } : d),
    });
  };
  const updateDayExercise = (dayId, exId, patch) => {
    persist({
      days: program.days.map((d) => d.id === dayId ? { ...d, exercises: d.exercises.map((ex) => ex.id === exId ? { ...ex, ...patch } : ex) } : d),
    });
  };
  const removeDayExercise = (dayId, exId) => {
    persist({ days: program.days.map((d) => d.id === dayId ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) } : d) });
  };

  if (clients.length === 0) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Add a client first to build a program.</div>;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <select style={{ ...inputStyle, maxWidth: 260 }} value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {program.days.map((day) => (
            <Card key={day.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" }}>
                <input style={{ ...inputStyle, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", maxWidth: 200 }} value={day.name} onChange={(e) => renameDay(day.id, e.target.value)} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <select style={{ ...inputStyle, width: 130 }} value={day.dayOfWeek || ""} onChange={(e) => setDayOfWeek(day.id, e.target.value)}>
                    <option value="">No fixed day</option>
                    {WEEK_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button onClick={() => removeDay(day.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                {day.exercises.map((ex) => {
                  const exDef = exercises.find((e) => e.id === ex.exerciseId);
                  return (
                    <div key={ex.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", background: COLORS.surfaceAlt, padding: 10, borderRadius: 8 }}>
                      <div style={{ flex: 1, minWidth: 140, fontSize: 13, fontWeight: 600 }}>{exDef?.name || "Unknown"}</div>
                      <input type="number" style={{ ...inputStyle, width: 60 }} value={ex.sets} onChange={(e) => updateDayExercise(day.id, ex.id, { sets: e.target.value })} title="Sets" />
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>sets ×</span>
                      <input style={{ ...inputStyle, width: 70 }} value={ex.reps} onChange={(e) => updateDayExercise(day.id, ex.id, { reps: e.target.value })} title="Reps" />
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>reps</span>
                      <button onClick={() => removeDayExercise(day.id, ex.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><X size={15} /></button>
                    </div>
                  );
                })}
              </div>

              <select
                style={inputStyle}
                value=""
                onChange={(e) => addExerciseToDay(day.id, e.target.value)}
              >
                <option value="">+ Add exercise…</option>
                {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </Card>
          ))}
          <Btn variant="subtle" onClick={addDay}><Plus size={15} /> Add workout day</Btn>
        </div>
      )}
    </div>
  );
}

function MessagesTab({ clients }) {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaFileId, setMediaFileId] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const mediaInputRef = useRef(null);

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
      setMessages(data.messages || []);
    })();
  }, [selectedClientId]);

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setMediaUploading(true);
    setMediaError("");
    try {
      const { url, fileId } = isVideo
        ? await uploadVideo(file, selectedClientId, "message-media")
        : await uploadImage(file, selectedClientId, "message-media");
      setMediaUrl(url);
      setMediaFileId(fileId);
      setMediaType(isVideo ? "video" : "image");
    } catch (err) {
      setMediaError(err.message || "Upload failed.");
    }
    setMediaUploading(false);
  };

  const cancelMedia = () => {
    deleteImageKitFile(mediaFileId);
    setMediaUrl(null);
    setMediaFileId(null);
    setMediaType(null);
  };

  const send = async () => {
    if (!text.trim() && !mediaUrl) return;
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    const next = [...(data.messages || []), { id: uid(), from: "trainer", text: text.trim(), mediaUrl: mediaUrl || null, mediaFileId: mediaFileId || null, mediaType: mediaType || null, date: new Date().toISOString() }];
    await sSet(`client:${selectedClientId}`, { ...data, messages: next });
    setMessages(next);
    sendPush([data.pushSubscription], "New message from your trainer", text.trim() ? text.trim().slice(0, 120) : mediaType === "video" ? "Sent a video" : "Sent a photo");
    setText("");
    setMediaUrl(null);
    setMediaFileId(null);
    setMediaType(null);
  };

  const removeMessage = async (id) => {
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    const target = (data.messages || []).find((m) => m.id === id);
    const next = (data.messages || []).filter((m) => m.id !== id);
    await sSet(`client:${selectedClientId}`, { ...data, messages: next });
    setMessages(next);
    deleteImageKitFile(target?.mediaFileId);
  };

  if (clients.length === 0) return <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Add a client first.</div>;

  return (
    <div>
      <select style={{ ...inputStyle, maxWidth: 260, marginBottom: 16 }} value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 320, overflowY: "auto" }}>
        {messages.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No messages yet.</div>}
        {messages.map((m) => (
          <div key={m.id} style={{
            alignSelf: m.from === "trainer" ? "flex-end" : "flex-start",
            background: m.from === "trainer" ? COLORS.accentDim : COLORS.surfaceAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "8px 12px",
            maxWidth: "80%",
            fontSize: 13,
          }}>
            {m.text && <div>{m.text}</div>}
            {m.mediaUrl && m.mediaType === "video" && (
              <video controls src={m.mediaUrl} style={{ width: "100%", maxWidth: 220, borderRadius: 8, marginTop: m.text ? 6 : 0, display: "block" }} />
            )}
            {m.mediaUrl && m.mediaType !== "video" && (
              <img src={m.mediaUrl} alt="" style={{ width: "100%", maxWidth: 220, borderRadius: 8, marginTop: m.text ? 6 : 0, display: "block" }} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, gap: 8 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>{new Date(m.date).toLocaleString()}</div>
              {m.mediaUrl && (
                <button onClick={() => removeMessage(m.id)} title="Delete to free up storage" style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Trash2 size={12} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {mediaError && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 10 }}>{mediaError}</div>}

      {mediaUrl && (
        <div style={{ position: "relative", marginBottom: 10, maxWidth: 160 }}>
          {mediaType === "video" ? (
            <video src={mediaUrl} style={{ width: "100%", borderRadius: 8, display: "block" }} />
          ) : (
            <img src={mediaUrl} alt="" style={{ width: "100%", borderRadius: 8, display: "block" }} />
          )}
          <button onClick={cancelMedia} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 999, color: "#fff", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={12} />
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input style={inputStyle} placeholder="Write a note to your client…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Btn variant="subtle" onClick={() => mediaInputRef.current?.click()} disabled={mediaUploading}>
          {mediaUploading ? "…" : <Paperclip size={15} />}
        </Btn>
        <input ref={mediaInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleMediaSelect} />
        <Btn onClick={send}><Send size={15} /></Btn>
      </div>
    </div>
  );
}

// ============================================================
function CommunityBoard({ isTrainer, authorName, clients, clientId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFileId, setPhotoFileId] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [viewing, setViewing] = useState(null);
  const photoInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const list = await sGet("app:communityPosts", []);
    setPosts([...list].sort((a, b) => b.date.localeCompare(a.date)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError("");
    try {
      const { url, fileId } = await uploadImage(file, clientId || "trainer", "community-photos");
      setPhotoUrl(url);
      setPhotoFileId(fileId);
    } catch (err) {
      setPhotoError(err.message || "Photo upload failed.");
    }
    setPhotoUploading(false);
  };

  const notifyEveryone = async (title, body) => {
    const clientsList = await sGet("app:clients", []);
    const clientSubs = await Promise.all(
      clientsList
        .filter((c) => c.id !== clientId)
        .map(async (c) => {
          const d = await sGet(`client:${c.id}`, {});
          return d.pushSubscription;
        })
    );
    const subs = [...clientSubs];
    if (!isTrainer) {
      const trainerSub = await sGet("app:trainerPushSubscription", null);
      if (trainerSub) subs.push(trainerSub);
    }
    sendPush(subs, title, body);
  };

  const post = async () => {
    if (!text.trim() && !photoUrl) return;
    setSending(true);
    const list = await sGet("app:communityPosts", []);
    const newPost = {
      id: uid(),
      authorName: isTrainer ? "Your trainer" : authorName,
      authorType: isTrainer ? "trainer" : "client",
      text: text.trim(),
      photoUrl: photoUrl || null,
      photoFileId: photoFileId || null,
      date: new Date().toISOString(),
    };
    const next = [...list, newPost].slice(-300);
    await sSet("app:communityPosts", next);
    setPosts([...next].sort((a, b) => b.date.localeCompare(a.date)));
    setText("");
    setPhotoUrl(null);
    setPhotoFileId(null);
    setSending(false);

    const title = isTrainer ? "Announcement from your trainer" : `New post from ${authorName}`;
    const body = newPost.text ? newPost.text.slice(0, 120) : "Shared a photo on the community wall";
    notifyEveryone(title, body);
  };

  const removePost = async (id) => {
    const list = await sGet("app:communityPosts", []);
    const target = list.find((p) => p.id === id);
    const next = list.filter((p) => p.id !== id);
    await sSet("app:communityPosts", next);
    setPosts(next.sort((a, b) => b.date.localeCompare(a.date)));
    deleteImageKitFile(target?.photoFileId);
  };

  const cancelPendingPhoto = () => {
    deleteImageKitFile(photoFileId);
    setPhotoUrl(null);
    setPhotoFileId(null);
  };

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Field label={isTrainer ? "Post an announcement to everyone" : "Share an update, milestone, or question"}>
          <textarea
            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            placeholder={isTrainer ? "e.g. Gym closed this Friday for the holiday…" : "e.g. Hit a new PR on squats today! 💪"}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>

        {photoError && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 10 }}>{photoError}</div>}

        {photoUrl && (
          <div style={{ position: "relative", width: 90, height: 90, marginBottom: 12, borderRadius: 8, overflow: "hidden" }}>
            <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              onClick={cancelPendingPhoto}
              style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 999, color: "#fff", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={post} disabled={sending || (!text.trim() && !photoUrl)}>
            {isTrainer ? <><Megaphone size={15} /> Post announcement</> : <><Send size={15} /> Post</>}
          </Btn>
          <Btn variant="subtle" onClick={() => photoInputRef.current?.click()} disabled={photoUploading}>
            {photoUploading ? "Uploading…" : <ImageIcon size={15} />}
          </Btn>
          <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoSelect} />
        </div>
      </Card>

      {loading ? (
        <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Loading…</div>
      ) : posts.length === 0 ? (
        <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No posts yet — be the first to share something!</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {posts.map((p) => (
            <Card
              key={p.id}
              style={p.authorType === "trainer" ? { borderColor: COLORS.accent, background: COLORS.accentDim } : {}}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {p.authorType === "trainer" && <Megaphone size={14} color={COLORS.accent} />}
                  <span style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>{p.authorName}</span>
                </div>
                {isTrainer && (
                  <button onClick={() => removePost(p.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Trash2 size={13} /></button>
                )}
              </div>
              {p.text && <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{p.text}</div>}
              {p.photoUrl && (
                <div onClick={() => setViewing(p.photoUrl)} style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", cursor: "pointer", maxWidth: 200 }}>
                  <img src={p.photoUrl} alt="" style={{ width: "100%", display: "block" }} />
                </div>
              )}
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 8 }}>{new Date(p.date).toLocaleString()}</div>
            </Card>
          ))}
        </div>
      )}

      {viewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewing(null)}>
          <img src={viewing} alt="" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}


const PARQ_QUESTIONS = [
  "Has a doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?",
  "Do you feel pain in your chest when you do physical activity?",
  "In the past month, have you had chest pain when you were not doing physical activity?",
  "Do you lose your balance because of dizziness, or have you lost consciousness in the past 12 months?",
  "Do you have a bone or joint problem that could be made worse by a change in your physical activity?",
  "Is your doctor currently prescribing medication for your blood pressure or a heart condition?",
  "Do you know of any other reason why you should not do physical activity?",
];

function WaiverForm({ data, onSave }) {
  const [answers, setAnswers] = useState(Array(PARQ_QUESTIONS.length).fill(null));
  const [signatureName, setSignatureName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = answers.every((a) => a !== null);
  const hasFlags = answers.some((a) => a === true);
  const canSubmit = allAnswered && agreed && signatureName.trim().length > 1;

  const submit = async () => {
    if (!allAnswered) return setError("Please answer every question above.");
    if (!signatureName.trim()) return setError("Please type your full name as your signature.");
    if (!agreed) return setError("Please check the box to agree before continuing.");
    setError("");
    setSaving(true);
    const waiver = {
      parqAnswers: answers,
      hasFlags,
      signatureName: signatureName.trim(),
      agreedAt: new Date().toISOString(),
      version: "1.0",
    };
    await onSave({ ...data, waiver });
    setSaving(false);
  };

  return (
    <div style={{ ...pageBase, padding: "24px 20px", paddingTop: "calc(24px + env(safe-area-inset-top))", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{FONT_STACK}</style>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
            <img src="/logo-mark.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, margin: 0 }}>Before we get started</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>A quick health screening and waiver — required once before you can use the app.</p>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Physical activity readiness questions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PARQ_QUESTIONS.map((q, i) => (
              <div key={i}>
                <div style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.4 }}>{q}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    variant={answers[i] === true ? "primary" : "ghost"}
                    style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
                    onClick={() => setAnswers(answers.map((a, idx) => (idx === i ? true : a)))}
                  >
                    Yes
                  </Btn>
                  <Btn
                    variant={answers[i] === false ? "primary" : "ghost"}
                    style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
                    onClick={() => setAnswers(answers.map((a, idx) => (idx === i ? false : a)))}
                  >
                    No
                  </Btn>
                </div>
              </div>
            ))}
          </div>
          {hasFlags && (
            <div style={{ marginTop: 16, padding: 12, background: COLORS.accentDim, borderRadius: 8, fontSize: 12, color: COLORS.text, lineHeight: 1.5 }}>
              Based on your answers, it's recommended you check with a doctor before starting or continuing an exercise program. Your trainer will see this so they can plan around it — you can still continue below.
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Liability waiver & release</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, maxHeight: 180, overflowY: "auto", padding: 10, background: COLORS.surfaceAlt, borderRadius: 8 }}>
            I acknowledge that participation in personal training sessions and fitness activities offered through Xcel Online PT involves inherent risks of injury, including but not limited to muscle strains, sprains, fractures, cardiovascular events, and in rare cases, serious injury or death. I voluntarily assume all such risks.
            <br /><br />
            I certify that I have answered the questions above truthfully and am voluntarily participating with full knowledge of the risks involved. If I answered "Yes" to any question above, I understand it is recommended that I consult a physician before beginning or continuing an exercise program, and I take full responsibility for that decision.
            <br /><br />
            I release Xcel Online PT, its owner, trainers, and staff from any and all liability, claims, or causes of action arising from my participation in training sessions, to the fullest extent permitted by law.
            <br /><br />
            By typing my name below and checking the box, I agree that this constitutes my electronic signature and acknowledgment of the above.
          </div>

          <Field label="Type your full legal name as your signature">
            <input style={{ ...inputStyle, marginTop: 12 }} placeholder="Full name" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} />
          </Field>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: COLORS.textMuted, cursor: "pointer", marginTop: 6 }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
            I have read and agree to the waiver above.
          </label>
        </Card>

        {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <Btn onClick={submit} disabled={!canSubmit || saving} style={{ width: "100%" }}>
          {saving ? "Saving…" : "Agree & continue"}
        </Btn>
      </div>
    </div>
  );
}

function IntakeForm({ data, onSave, onClose }) {
  const existing = data.intake || {};
  const existingTotalIn = Number(existing.heightIn) || 0;
  const [form, setForm] = useState({
    goal: existing.goal || "",
    experience: existing.experience || "Beginner",
    equipment: existing.equipment || "",
    injuries: existing.injuries || "",
    medications: existing.medications || "",
    physicianName: existing.physicianName || "",
    emergencyContactName: existing.emergencyContactName || "",
    emergencyContactPhone: existing.emergencyContactPhone || "",
    age: existing.age || "",
    heightFt: existingTotalIn ? Math.floor(existingTotalIn / 12) : "",
    heightInRem: existingTotalIn ? existingTotalIn % 12 : "",
    gender: existing.gender || "Prefer not to say",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const heightIn = (Number(form.heightFt) || 0) * 12 + (Number(form.heightInRem) || 0);
    const { heightFt, heightInRem, ...rest } = form;
    await onSave({ ...data, intake: { ...rest, heightIn: heightIn || "", submittedAt: new Date().toISOString() } });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: COLORS.bg, borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", border: `1px solid ${COLORS.border}`, borderBottom: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>Tell us about you</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 18 }}>This helps your trainer build the right program for you.</div>

        <Field label="What's your main goal?">
          <input style={inputStyle} placeholder="e.g. lose weight, build strength, tone up" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
        </Field>
        <Field label="Training experience">
          <select style={inputStyle} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          <Field label="Age">
            <input type="number" style={inputStyle} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </Field>
          <Field label="Gender">
            <select style={inputStyle} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
          </Field>
          <Field label="Height — feet">
            <input type="number" style={inputStyle} placeholder="5" value={form.heightFt} onChange={(e) => setForm({ ...form, heightFt: e.target.value })} />
          </Field>
          <Field label="Height — inches">
            <input type="number" style={inputStyle} placeholder="8" value={form.heightInRem} onChange={(e) => setForm({ ...form, heightInRem: e.target.value })} />
          </Field>
        </div>

        <Field label="What equipment do you have access to?">
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="e.g. full gym, home dumbbells only, bodyweight only" value={form.equipment} onChange={(e) => setForm({ ...form, equipment: e.target.value })} />
        </Field>
        <Field label="Any injuries or limitations we should know about?">
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="e.g. lower back sensitivity, knee issue — or 'none'" value={form.injuries} onChange={(e) => setForm({ ...form, injuries: e.target.value })} />
        </Field>
        <Field label="Any medications you're currently taking? (optional)">
          <textarea style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} placeholder="e.g. blood pressure medication — or 'none'" value={form.medications} onChange={(e) => setForm({ ...form, medications: e.target.value })} />
        </Field>
        <Field label="Physician's name (optional)">
          <input style={inputStyle} placeholder="Dr. Smith" value={form.physicianName} onChange={(e) => setForm({ ...form, physicianName: e.target.value })} />
        </Field>

        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, marginTop: 4, marginBottom: 10 }}>Emergency contact</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          <Field label="Contact name">
            <input style={inputStyle} value={form.emergencyContactName} onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
          </Field>
          <Field label="Contact phone">
            <input type="tel" style={inputStyle} value={form.emergencyContactPhone} onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
          </Field>
        </div>

        <Btn onClick={save} disabled={saving} style={{ width: "100%", marginTop: 4 }}>{saving ? "Saving…" : "Save"}</Btn>
      </div>
    </div>
  );
}

function ClientApp({ client, exercises, data, onSave, onLogout }) {
  const [tab, setTab] = useState("today");
  const [showIntake, setShowIntake] = useState(false);
  const [autoPromptShown, setAutoPromptShown] = useState(false);
  const tabs = [
    { id: "today", label: "Today", icon: CalendarDays },
    { id: "mobility", label: "Mobility", icon: Activity },
    { id: "library", label: "Library", icon: Dumbbell },
    { id: "nutrition", label: "Nutrition", icon: Apple },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "community", label: "Community", icon: Users },
  ];

  useEffect(() => {
    if (data.waiver && !data.intake && !autoPromptShown) {
      setShowIntake(true);
      setAutoPromptShown(true);
    }
  }, [data.waiver, data.intake, autoPromptShown]);

  const [notifBusy, setNotifBusy] = useState(false);

  const enableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported in this browser. On iPhone, add this app to your Home Screen first, then try again from there.");
      return;
    }
    setNotifBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifBusy(false);
        return;
      }
      const { VAPID_PUBLIC_KEY } = await import("./pushConfig.js");
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing || (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
      await onSave({ ...data, pushSubscription: sub.toJSON() });
    } catch (e) {
      console.error(e);
    }
    setNotifBusy(false);
  };

  if (!data.waiver) {
    return <WaiverForm data={data} onSave={onSave} />;
  }

  return (
    <div style={{ ...pageBase, display: "flex", flexDirection: "column", minHeight: 600 }}>
      <style>{FONT_STACK}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", paddingTop: "calc(16px + env(safe-area-inset-top))", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo-mark.png" alt="" style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 8 }} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Hey, {client.name.split(" ")[0]}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Xcel Online PT</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {client.stripeLink && (
            <a href={client.stripeLink} target="_blank" rel="noreferrer" title="Manage membership" style={{ color: COLORS.textMuted, display: "flex" }}>
              <CreditCard size={18} />
            </a>
          )}
          <button onClick={enableNotifications} disabled={notifBusy} title={data.pushSubscription ? "Notifications on" : "Enable notifications"} style={{ background: "none", border: "none", color: data.pushSubscription ? COLORS.lime : COLORS.textMuted, cursor: "pointer" }}>
            {data.pushSubscription ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
          <button onClick={() => setShowIntake(true)} title="Edit your profile" style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><FileText size={18} /></button>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><LogOut size={18} /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, paddingBottom: 90 }}>
        {tab === "today" && <TodayTab data={data} exercises={exercises} onSave={onSave} clientName={client.name} />}
        {tab === "mobility" && <ClientMobility data={data} onSave={onSave} />}
        {tab === "library" && <ClientLibrary exercises={exercises} />}
        {tab === "nutrition" && <ClientNutrition data={data} onSave={onSave} />}
        {tab === "progress" && <ProgressTab data={data} exercises={exercises} clientId={client.id} onSave={onSave} />}
        {tab === "messages" && <ClientMessages data={data} onSave={onSave} client={client} />}
        {tab === "community" && <CommunityBoard isTrainer={false} authorName={client.name} clientId={client.id} />}
      </div>

      {showIntake && (
        <IntakeForm data={data} onSave={onSave} onClose={() => setShowIntake(false)} />
      )}

      <div style={{ position: "sticky", bottom: 0, display: "flex", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              padding: "12px 4px",
              color: tab === t.id ? COLORS.accent : COLORS.textMuted,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FreeformWorkoutForm({ exercises, onSave, onCancel }) {
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState([]);
  const [pickId, setPickId] = useState("");

  const grouped = useMemo(() => {
    const byGroup = {};
    exercises.forEach((e) => {
      const g = e.muscle || "Other";
      (byGroup[g] = byGroup[g] || []).push(e);
    });
    return byGroup;
  }, [exercises]);

  const addExercise = () => {
    if (!pickId || items.some((it) => it.exerciseId === pickId)) { setPickId(""); return; }
    setItems([...items, { id: uid(), exerciseId: pickId, sets: [{ reps: "", weight: "" }] }]);
    setPickId("");
  };

  const removeExercise = (id) => setItems(items.filter((it) => it.id !== id));
  const addSet = (id) => setItems(items.map((it) => (it.id === id ? { ...it, sets: [...it.sets, { reps: "", weight: "" }] } : it)));
  const removeSet = (id, idx) => setItems(items.map((it) => (it.id === id ? { ...it, sets: it.sets.filter((_, i) => i !== idx) } : it)));
  const updateSet = (id, idx, field, value) =>
    setItems(items.map((it) => (it.id === id ? { ...it, sets: it.sets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) } : it)));

  const canSave = !!date && items.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: uid(),
      date,
      freeform: true,
      dayName: "Custom workout",
      entries: items.map((it) => ({ exerciseId: it.exerciseId, sets: it.sets })),
    });
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Log a workout on your own</div>

      <Field label="Date">
        <input type="date" style={inputStyle} value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="Add an exercise">
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...inputStyle, flex: 1 }} value={pickId} onChange={(e) => setPickId(e.target.value)}>
            <option value="">Choose from library…</option>
            {Object.entries(grouped).map(([group, list]) => (
              <optgroup key={group} label={group}>
                {list.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <Btn variant="subtle" onClick={addExercise}><Plus size={15} /> Add</Btn>
        </div>
      </Field>

      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
          {items.map((it) => {
            const exDef = exercises.find((e) => e.id === it.exerciseId);
            return (
              <div key={it.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 13 }}>{exDef?.name || "Exercise"}</div>
                  <button onClick={() => removeExercise(it.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                  {it.sets.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: COLORS.textMuted, width: 42 }}>Set {i + 1}</span>
                      <input placeholder="reps" style={{ ...inputStyle, width: 70 }} value={s.reps} onChange={(e) => updateSet(it.id, i, "reps", e.target.value)} />
                      <input placeholder="lbs" style={{ ...inputStyle, width: 70 }} value={s.weight} onChange={(e) => updateSet(it.id, i, "weight", e.target.value)} />
                      {it.sets.length > 1 && (
                        <button onClick={() => removeSet(it.id, i)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(it.id)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, cursor: "pointer", padding: 0 }}>
                  + Add set
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={handleSave} disabled={!canSave} style={{ flex: 1 }}><Check size={16} /> Save workout</Btn>
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      </div>
    </Card>
  );
}

function FreeformHistory({ logs, exercises, onDelete }) {
  const items = useMemo(
    () => [...logs].filter((l) => l.freeform).sort((a, b) => b.date.localeCompare(a.date)),
    [logs]
  );
  if (items.length === 0) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>
        Your logged workouts
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((l) => (
          <Card key={l.id} style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{fmtDate(l.date)}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                  {l.entries.map((e) => exercises.find((ex) => ex.id === e.exerciseId)?.name || "Exercise").join(", ")}
                </div>
              </div>
              <button onClick={() => onDelete(l.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}>
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WeekCalendar({ days, scheduleOverrides, dayIdx, onSelectDay, onMoveDay }) {
  const [movingDayId, setMovingDayId] = useState(null);
  const todayDow = WEEK_DAYS[new Date().getDay()];

  const effectiveDow = (day) => scheduleOverrides[day.id] || day.dayOfWeek || null;

  const withIdx = days.map((d, i) => ({ ...d, idx: i }));
  const scheduled = WEEK_DAYS.map((dow) => ({
    dow,
    dayItems: withIdx.filter((d) => effectiveDow(d) === dow),
  }));
  const flexible = withIdx.filter((d) => !effectiveDow(d));
  const activeDay = days[dayIdx];

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: flexible.length ? 12 : 0 }}>
        {scheduled.map(({ dow, dayItems }) => (
          <div key={dow} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: dow === todayDow ? COLORS.accent : COLORS.textMuted, fontWeight: 600, marginBottom: 6 }}>{dow}</div>
            {dayItems.length === 0 ? (
              <div style={{ height: 46, borderRadius: 8, border: `1px dashed ${COLORS.border}` }} />
            ) : (
              dayItems.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDay(d.idx)}
                  style={{
                    width: "100%", minHeight: 46, borderRadius: 8, marginBottom: 4, padding: "6px 4px",
                    border: `1px solid ${d.idx === dayIdx ? COLORS.accent : COLORS.border}`,
                    background: d.idx === dayIdx ? COLORS.accentDim : COLORS.surfaceAlt,
                    color: d.idx === dayIdx ? COLORS.accent : COLORS.text,
                    fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", lineHeight: 1.2,
                  }}
                >
                  {d.name}
                </button>
              ))
            )}
          </div>
        ))}
      </div>

      {flexible.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>Flexible (no fixed day)</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {flexible.map((d) => (
              <button key={d.id} onClick={() => onSelectDay(d.idx)} style={{
                padding: "8px 14px", borderRadius: 20, border: `1px solid ${d.idx === dayIdx ? COLORS.accent : COLORS.border}`,
                background: d.idx === dayIdx ? COLORS.accentDim : "transparent", color: d.idx === dayIdx ? COLORS.accent : COLORS.textMuted,
                fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
              }}>{d.name}</button>
            ))}
          </div>
        </div>
      )}

      {activeDay && (
        <button onClick={() => setMovingDayId(activeDay.id)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 11, cursor: "pointer", padding: 0, marginTop: 12 }}>
          Can't do {activeDay.name} today? Move it →
        </button>
      )}

      {movingDayId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 55 }} onClick={() => setMovingDayId(null)}>
          <div style={{ background: COLORS.bg, borderRadius: "16px 16px 0 0", padding: 20, width: "100%", maxWidth: 420, border: `1px solid ${COLORS.border}`, borderBottom: "none" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Move to a different day</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
              {WEEK_DAYS.map((dow) => (
                <Btn key={dow} variant="subtle" style={{ fontSize: 12, padding: "10px 4px" }} onClick={() => { onMoveDay(movingDayId, dow); setMovingDayId(null); }}>
                  {dow}
                </Btn>
              ))}
            </div>
            <Btn variant="ghost" style={{ width: "100%" }} onClick={() => { onMoveDay(movingDayId, null); setMovingDayId(null); }}>Make it flexible (no fixed day)</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function TodayTab({ data, exercises, onSave, clientName }) {
  const days = data.program?.days || [];
  const [dayIdx, setDayIdx] = useState(0);
  const day = days[dayIdx];
  const todayLog = useMemo(() => data.logs.find((l) => l.date === todayISO() && l.dayId === day?.id), [data.logs, day]);
  const [entries, setEntries] = useState(() => todayLog?.entries || []);
  const [showFreeform, setShowFreeform] = useState(false);

  useEffect(() => {
    setEntries(todayLog?.entries || []);
  }, [dayIdx, todayLog]);

  const notifyTrainer = async (workoutLabel) => {
    const trainerSub = await sGet("app:trainerPushSubscription", null);
    if (trainerSub) sendPush([trainerSub], "Workout logged", `${clientName} just logged: ${workoutLabel}`);
  };

  const saveFreeform = async (log) => {
    await onSave({ ...data, logs: [...data.logs, log] });
    setShowFreeform(false);
    notifyTrainer(log.dayName || "Custom workout");
  };

  const deleteFreeform = async (id) => {
    await onSave({ ...data, logs: data.logs.filter((l) => l.id !== id) });
  };

  if (days.length === 0) {
    return (
      <div>
        <Card style={{ textAlign: "center", color: COLORS.textMuted, marginBottom: 16 }}>
          Your trainer hasn't assigned a program yet. Check back soon, or see a note in Messages.
        </Card>
        {showFreeform ? (
          <FreeformWorkoutForm exercises={exercises} onSave={saveFreeform} onCancel={() => setShowFreeform(false)} />
        ) : (
          <Btn variant="subtle" onClick={() => setShowFreeform(true)} style={{ width: "100%", marginBottom: 16 }}>
            <Plus size={16} /> Log a workout on your own
          </Btn>
        )}
        <FreeformHistory logs={data.logs} exercises={exercises} onDelete={deleteFreeform} />
      </div>
    );
  }

  const getSetsFor = (dayExId, defaultSets) => {
    const found = entries.find((e) => e.dayExId === dayExId);
    if (found) return found.sets;
    return Array.from({ length: Number(defaultSets) || 1 }, () => ({ reps: "", weight: "" }));
  };

  const updateSet = (dayExId, defaultSets, setIdx, field, value) => {
    const current = getSetsFor(dayExId, defaultSets);
    const nextSets = current.map((s, i) => (i === setIdx ? { ...s, [field]: value } : s));
    const others = entries.filter((e) => e.dayExId !== dayExId);
    setEntries([...others, { dayExId, sets: nextSets }]);
  };

  const saveWorkout = async () => {
    const logs = data.logs.filter((l) => !(l.date === todayISO() && l.dayId === day.id));
    logs.push({ date: todayISO(), dayId: day.id, dayName: day.name, entries });
    await onSave({ ...data, logs });
    notifyTrainer(day.name);
  };

  return (
    <div>
      <WeekCalendar
        days={days}
        scheduleOverrides={data.scheduleOverrides || {}}
        dayIdx={dayIdx}
        onSelectDay={setDayIdx}
        onMoveDay={async (dayId, newDow) => {
          const nextOverrides = { ...(data.scheduleOverrides || {}) };
          if (newDow) nextOverrides[dayId] = newDow;
          else delete nextOverrides[dayId];
          await onSave({ ...data, scheduleOverrides: nextOverrides });
        }}
      />

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, marginBottom: 4 }}>{day.name}</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>
        {(data.scheduleOverrides?.[day.id] || day.dayOfWeek) ? `${data.scheduleOverrides?.[day.id] || day.dayOfWeek} · ` : ""}{day.exercises.length} exercises
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {day.exercises.map((ex) => {
          const exDef = exercises.find((e) => e.id === ex.exerciseId);
          const sets = getSetsFor(ex.id, ex.sets);
          return (
            <Card key={ex.id}>
              <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>{exDef?.name || "Exercise"}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Target: {ex.sets} × {ex.reps}</div>
              <a
                href={exDef?.videoUrl && toYouTubeEmbed(exDef.videoUrl) ? exDef.videoUrl : exerciseSearchUrl(exDef?.name)}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: COLORS.accent, marginBottom: 10, display: "inline-block" }}
              >
                Watch example ↗
              </a>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sets.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, width: 42 }}>Set {i + 1}</span>
                    <input placeholder="reps" style={{ ...inputStyle, width: 70 }} value={s.reps} onChange={(e) => updateSet(ex.id, ex.sets, i, "reps", e.target.value)} />
                    <input placeholder="lbs" style={{ ...inputStyle, width: 70 }} value={s.weight} onChange={(e) => updateSet(ex.id, ex.sets, i, "weight", e.target.value)} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Btn onClick={saveWorkout} style={{ width: "100%", marginTop: 16 }}><Check size={16} /> Save today's workout</Btn>

      <div style={{ marginTop: 28, borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
        {showFreeform ? (
          <FreeformWorkoutForm exercises={exercises} onSave={saveFreeform} onCancel={() => setShowFreeform(false)} />
        ) : (
          <Btn variant="subtle" onClick={() => setShowFreeform(true)} style={{ width: "100%", marginBottom: 16 }}>
            <Plus size={16} /> Log a workout on your own
          </Btn>
        )}
        <FreeformHistory logs={data.logs} exercises={exercises} onDelete={deleteFreeform} />
      </div>
    </div>
  );
}

function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let controlsRef = null;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result && active) {
              active = false;
              controls.stop();
              onDetected(result.getText());
            }
          }
        );
        controlsRef = controls;
      } catch (e) {
        setError("Couldn't access your camera. Check that this site has camera permission in your browser settings, then try again.");
      }
    })();

    return () => {
      active = false;
      if (controlsRef) controlsRef.stop();
    };
  }, [onDetected]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={26} /></button>
      {error ? (
        <div style={{ color: COLORS.danger, textAlign: "center", maxWidth: 300, fontSize: 13 }}>{error}</div>
      ) : (
        <>
          <video ref={videoRef} style={{ width: "100%", maxWidth: 420, borderRadius: 12, background: "#000" }} muted playsInline />
          <div style={{ color: "#fff", fontSize: 13, marginTop: 14 }}>Point your camera at a barcode</div>
        </>
      )}
    </div>
  );
}

function ClientNutrition({ data, onSave }) {
  const targets = data.nutrition?.targets || {};
  const hasTargets = targets.calories || targets.protein || targets.carbs || targets.fat;
  const todayLog = (data.nutrition?.logs || []).find((l) => l.date === todayISO());
  const entries = todayLog?.entries || [];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState(null); // food result awaiting a quantity
  const [oz, setOz] = useState("4");
  const [manual, setManual] = useState(null); // { name, calories, protein, carbs, fat }
  const [mealPlan, setMealPlan] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [barcodeError, setBarcodeError] = useState("");

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await searchFoods(query);
      setResults(r);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const burnedEntries = todayLog?.burned || [];
  const totalBurned = burnedEntries.reduce((sum, b) => sum + (Number(b.calories) || 0), 0);

  const [burnActivity, setBurnActivity] = useState("Workout");
  const [burnCustomLabel, setBurnCustomLabel] = useState("");
  const [burnCals, setBurnCals] = useState("");

  const totals = entries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const saveEntries = async (nextEntries) => {
    const logs = (data.nutrition?.logs || []).filter((l) => l.date !== todayISO());
    logs.push({ date: todayISO(), entries: nextEntries, burned: burnedEntries });
    await onSave({ ...data, nutrition: { ...(data.nutrition || {}), logs } });
  };

  const saveBurned = async (nextBurned) => {
    const logs = (data.nutrition?.logs || []).filter((l) => l.date !== todayISO());
    logs.push({ date: todayISO(), entries, burned: nextBurned });
    await onSave({ ...data, nutrition: { ...(data.nutrition || {}), logs } });
  };

  const addBurned = async () => {
    if (!burnCals || Number(burnCals) <= 0) return;
    const label = burnActivity === "Other" ? (burnCustomLabel.trim() || "Other") : burnActivity;
    const entry = { id: uid(), label, calories: Number(burnCals) };
    await saveBurned([...burnedEntries, entry]);
    setBurnActivity("Workout");
    setBurnCustomLabel("");
    setBurnCals("");
  };

  const removeBurned = async (id) => {
    await saveBurned(burnedEntries.filter((b) => b.id !== id));
  };

  const addFromSearch = async () => {
    if (!picked) return;
    const macros = macrosForOz(picked.per100g, oz);
    const entry = { id: uid(), name: picked.name, oz: Number(oz) || 0, ...macros };
    await saveEntries([...entries, entry]);
    setPicked(null);
    setQuery("");
    setResults([]);
    setOz("4");
  };

  const addManual = async () => {
    if (!manual?.name?.trim()) return;
    const entry = {
      id: uid(),
      name: manual.name.trim(),
      oz: Number(manual.oz) || 0,
      calories: Number(manual.calories) || 0,
      protein: Number(manual.protein) || 0,
      carbs: Number(manual.carbs) || 0,
      fat: Number(manual.fat) || 0,
    };
    await saveEntries([...entries, entry]);
    setManual(null);
  };

  const logMealPlan = async () => {
    if (!mealPlan) return;
    const newEntries = mealPlan.meals.map((m) => ({
      id: uid(),
      name: `${m.slot}: ${m.name}`,
      oz: 0,
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
    }));
    await saveEntries([...entries, ...newEntries]);
    setMealPlan(null);
  };

  const removeEntry = async (id) => {
    await saveEntries(entries.filter((e) => e.id !== id));
  };

  const favorites = data.nutrition?.favorites || [];

  const saveFavoriteList = async (nextFavorites) => {
    await onSave({ ...data, nutrition: { ...(data.nutrition || {}), favorites: nextFavorites } });
  };

  const addFavorite = async (entry) => {
    if (favorites.some((f) => f.name === entry.name && f.oz === entry.oz)) return;
    const fav = { id: uid(), name: entry.name, oz: entry.oz, calories: entry.calories, protein: entry.protein, carbs: entry.carbs, fat: entry.fat };
    await saveFavoriteList([...favorites, fav]);
  };

  const removeFavorite = async (id) => {
    await saveFavoriteList(favorites.filter((f) => f.id !== id));
  };

  const logFavorite = async (fav) => {
    const entry = { id: uid(), name: fav.name, oz: fav.oz, calories: fav.calories, protein: fav.protein, carbs: fav.carbs, fat: fav.fat };
    await saveEntries([...entries, entry]);
  };

  const handleBarcodeDetected = async (code) => {
    setScanning(false);
    setBarcodeError("");
    const result = await lookupBarcode(code);
    if (!result) {
      setBarcodeError("Couldn't find that product in the barcode database — try searching by name instead.");
      return;
    }
    setPicked(result);
    setQuery(result.name);
  };

  const Meter = ({ label, value, goal, unit }) => {
    const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>
          <span>{label}</span>
          <span>{value}{unit} {goal ? `/ ${goal}${unit}` : ""}</span>
        </div>
        <div style={{ height: 6, background: COLORS.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: COLORS.accent, borderRadius: 4 }} />
        </div>
      </div>
    );
  };

  return (
    <div>
      {!hasTargets ? (
        <Card style={{ textAlign: "center", color: COLORS.textMuted, marginBottom: 16 }}>
          Your trainer hasn't set your nutrition goals yet. Check back soon or ask in Messages.
        </Card>
      ) : (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Today's totals</div>
          <Meter label="Calories" value={totals.calories} goal={Number(targets.calories) || 0} unit="" />
          <Meter label="Protein" value={totals.protein} goal={Number(targets.protein) || 0} unit="g" />
          <Meter label="Carbs" value={totals.carbs} goal={Number(targets.carbs) || 0} unit="g" />
          <Meter label="Fat" value={totals.fat} goal={Number(targets.fat) || 0} unit="g" />
          {totalBurned > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
                <span>Calories burned (workouts)</span>
                <span>{totalBurned}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600 }}>
                <span>Net calories</span>
                <span>{totals.calories - totalBurned}{targets.calories ? ` / ${targets.calories}` : ""}</span>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Calories burned</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 12 }}>Check your watch or gym equipment after a workout and log it here.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <select
            style={{ ...inputStyle, flex: 1, minWidth: 110 }}
            value={burnActivity}
            onChange={(e) => setBurnActivity(e.target.value)}
          >
            {BURN_ACTIVITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <input
            type="number"
            style={{ ...inputStyle, width: 100 }}
            placeholder="Calories"
            value={burnCals}
            onChange={(e) => setBurnCals(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addBurned()}
          />
          <Btn onClick={addBurned}><Plus size={14} /> Add</Btn>
        </div>
        {burnActivity === "Other" && (
          <input
            style={{ ...inputStyle, marginBottom: 12 }}
            placeholder="What was it?"
            value={burnCustomLabel}
            onChange={(e) => setBurnCustomLabel(e.target.value)}
          />
        )}
        {burnedEntries.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {burnedEntries.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 13 }}>{b.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>{b.calories} cal</span>
                  <button onClick={() => removeBurned(b.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {hasTargets && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mealPlan ? 12 : 0 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14 }}>Example meal plan</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Simple meal ideas sized to your daily goals — a reference, not exact tracking.</div>
            </div>
          </div>
          <Btn variant={mealPlan ? "subtle" : "primary"} style={{ marginTop: 12 }} onClick={() => setMealPlan(generateMealPlan(targets))}>
            {mealPlan ? "Shuffle meals" : "Generate example meals"}
          </Btn>

          {mealPlan && (
            <div style={{ marginTop: 14 }}>
              {mealPlan.meals.map((m, i) => (
                <div key={i} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>{m.slot}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{m.name}</div>
                  {m.ingredients && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6 }}>
                      {m.ingredients.map((ing, j) => <li key={j}>{ing}</li>)}
                    </ul>
                  )}
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{m.calories} cal · {m.protein}g P · {m.carbs}g C · {m.fat}g F</div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, marginBottom: 12 }}>
                Day total: {mealPlan.totals.calories} cal · {mealPlan.totals.protein}g P · {mealPlan.totals.carbs}g C · {mealPlan.totals.fat}g F (target: {targets.calories || "—"} cal)
              </div>
              <Btn onClick={logMealPlan}><Plus size={14} /> Log these to today</Btn>
            </div>
          )}
        </Card>
      )}

      {favorites.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Your saved foods</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {favorites.map((f) => (
              <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 10px" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                    {f.oz ? `${f.oz} oz · ` : ""}{f.calories} cal · {f.protein}g P · {f.carbs}g C · {f.fat}g F
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn variant="subtle" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => logFavorite(f)}><Plus size={13} /> Add</Btn>
                  <button onClick={() => removeFavorite(f.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color={COLORS.textMuted} style={{ position: "absolute", left: 12, top: 12 }} />
          <input
            style={{ ...inputStyle, paddingLeft: 34 }}
            placeholder="Search a food (e.g. grilled chicken breast)…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPicked(null); }}
          />
        </div>
        <Btn variant="subtle" onClick={() => { setBarcodeError(""); setScanning(true); }}><ScanLine size={16} /></Btn>
      </div>
      {barcodeError && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 10 }}>{barcodeError}</div>}
      {scanning && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setScanning(false)} />
      )}

      {searching && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>Searching…</div>}

      {!picked && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          {results.map((r) => (
            <button
              key={r.fdcId}
              onClick={() => setPicked(r)}
              style={{ ...inputStyle, textAlign: "left", cursor: "pointer", fontSize: 12 }}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}

      {picked && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>{picked.name}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="number" style={{ ...inputStyle, width: 80 }} value={oz} onChange={(e) => setOz(e.target.value)} />
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>oz</span>
            <Btn style={{ marginLeft: "auto" }} onClick={addFromSearch}><Plus size={14} /> Add</Btn>
            <Btn variant="ghost" onClick={() => setPicked(null)}><X size={14} /></Btn>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8 }}>
            ≈ {macrosForOz(picked.per100g, oz).calories} cal · {macrosForOz(picked.per100g, oz).protein}g protein · {macrosForOz(picked.per100g, oz).carbs}g carbs · {macrosForOz(picked.per100g, oz).fat}g fat
          </div>
        </Card>
      )}

      {!manual ? (
        <button
          onClick={() => setManual({ name: "", oz: "", calories: "", protein: "", carbs: "", fat: "" })}
          style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 16 }}
        >
          + Add manually instead
        </button>
      ) : (
        <Card style={{ marginBottom: 16 }}>
          <Field label="Food name">
            <input style={inputStyle} value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value })} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
            <Field label="Calories"><input type="number" style={inputStyle} value={manual.calories} onChange={(e) => setManual({ ...manual, calories: e.target.value })} /></Field>
            <Field label="Protein (g)"><input type="number" style={inputStyle} value={manual.protein} onChange={(e) => setManual({ ...manual, protein: e.target.value })} /></Field>
            <Field label="Carbs (g)"><input type="number" style={inputStyle} value={manual.carbs} onChange={(e) => setManual({ ...manual, carbs: e.target.value })} /></Field>
            <Field label="Fat (g)"><input type="number" style={inputStyle} value={manual.fat} onChange={(e) => setManual({ ...manual, fat: e.target.value })} /></Field>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <Btn onClick={addManual}>Add</Btn>
            <Btn variant="ghost" onClick={() => setManual(null)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Today's food</div>
      {entries.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 12 }}>Nothing logged yet today.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((e) => (
          <Card key={e.id} style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
                  {e.oz ? `${e.oz} oz · ` : ""}{e.calories} cal · {e.protein}g P · {e.carbs}g C · {e.fat}g F
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => addFavorite(e)}
                  title="Save as a favorite for quick re-logging"
                  style={{ background: "none", border: "none", color: favorites.some((f) => f.name === e.name && f.oz === e.oz) ? COLORS.lime : COLORS.textMuted, cursor: "pointer" }}
                >
                  <Star size={15} fill={favorites.some((f) => f.name === e.name && f.oz === e.oz) ? COLORS.lime : "none"} />
                </button>
                <button onClick={() => removeEntry(e.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ClientMobility({ data, onSave }) {
  const routines = data.mobility?.routines || [];
  const logs = data.mobility?.logs || [];
  const [expandedId, setExpandedId] = useState(null);

  const lastDoneFor = (routineId) => {
    const done = logs.filter((l) => l.routineId === routineId).sort((a, b) => b.date.localeCompare(a.date));
    return done[0]?.date || null;
  };

  const doneToday = (routineId) => logs.some((l) => l.routineId === routineId && l.date === todayISO());

  const markDone = async (routineId) => {
    if (doneToday(routineId)) return;
    const nextLogs = [...logs, { id: uid(), date: todayISO(), routineId }];
    await onSave({ ...data, mobility: { ...(data.mobility || {}), logs: nextLogs } });
  };

  if (routines.length === 0) {
    return (
      <Card style={{ textAlign: "center", color: COLORS.textMuted }}>
        Your trainer hasn't assigned any mobility routines yet. Check back soon, or see a note in Messages.
      </Card>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>
        A few minutes on these each day can go a long way — general mobility guidance, not physical therapy. Check with a doctor if pain persists.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {routines.map((r) => {
          const done = doneToday(r.id);
          const last = lastDoneFor(r.id);
          return (
            <Card key={r.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>{r.targetArea}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
                    {last ? `Last done ${fmtDate(last)}` : "Not done yet"}
                  </div>
                </div>
                <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.textMuted, cursor: "pointer", padding: "6px 10px", fontSize: 11, flexShrink: 0 }}>
                  {expandedId === r.id ? "Hide" : "View"}
                </button>
              </div>

              {expandedId === r.id && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {r.exercises.map((ex) => (
                    <div key={ex.id} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>{ex.prescription}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.5 }}>{ex.instructions}</div>
                      <a
                        href={mobilitySearchUrl(ex.name)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 11, color: COLORS.accent, marginTop: 8, display: "inline-block" }}
                      >
                        Watch example ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <Btn
                style={{ marginTop: 14, width: "100%" }}
                variant={done ? "ghost" : "primary"}
                disabled={done}
                onClick={() => markDone(r.id)}
              >
                {done ? <><Check size={15} /> Done today</> : "Mark today's session complete"}
              </Btn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MuscleIcon({ muscle, size = 44 }) {
  const off = COLORS.surfaceAlt;
  const on = COLORS.accent;
  const border = COLORS.border;
  const isBack = muscle === "Back" || muscle === "Glutes";

  if (muscle === "Full Body" || muscle === "Cardio") {
    const IconEl = muscle === "Cardio" ? Flame : Activity;
    return (
      <div style={{ width: size, height: Math.round(size * (270 / 140)), display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.surfaceAlt, borderRadius: 10 }}>
        <IconEl size={Math.round(size * 0.5)} color={COLORS.accent} />
      </div>
    );
  }

  const fillFor = (region) => {
    if (isBack) {
      if (region === "shoulders") return muscle === "Shoulders" ? on : off;
      if (region === "arms") return muscle === "Arms" ? on : off;
      if (region === "torsoUpper") return muscle === "Back" ? on : off;
      if (region === "torsoLower") return muscle === "Glutes" ? on : off;
      if (region === "legs") return muscle === "Legs" ? on : off;
    } else {
      if (region === "shoulders") return muscle === "Shoulders" ? on : off;
      if (region === "arms") return muscle === "Arms" ? on : off;
      if (region === "torsoUpper") return muscle === "Chest" ? on : off;
      if (region === "torsoLower") return muscle === "Core" ? on : off;
      if (region === "legs") return muscle === "Legs" ? on : off;
    }
    return off;
  };

  return (
    <svg viewBox="0 0 140 270" width={size} height={Math.round(size * (270 / 140))}>
      <ellipse cx="70" cy="17" rx="13" ry="15" fill={COLORS.surface} stroke={border} strokeWidth="1.2" />
      <path d="M62,30 Q70,34 78,30 L78,42 Q70,46 62,42 Z" fill={COLORS.surface} />
      <circle cx="41" cy="52" r="13" fill={fillFor("shoulders")} stroke={border} strokeWidth="1.2" />
      <circle cx="99" cy="52" r="13" fill={fillFor("shoulders")} stroke={border} strokeWidth="1.2" />
      <path d="M27,56 Q23,95 28,132 L40,132 Q43,95 41,56 Z" fill={fillFor("arms")} stroke={border} strokeWidth="1.2" />
      <path d="M113,56 Q117,95 112,132 L100,132 Q97,95 99,56 Z" fill={fillFor("arms")} stroke={border} strokeWidth="1.2" />
      <path d="M41,44 Q38,50 40,58 Q35,80 51,103 L89,103 Q105,80 100,58 Q102,50 99,44 Q86,52 70,52 Q54,52 41,44 Z" fill={fillFor("torsoUpper")} stroke={border} strokeWidth="1.2" />
      <path d="M51,103 Q45,128 45,152 Q45,160 50,163 L90,163 Q95,160 95,152 Q95,128 89,103 Z" fill={fillFor("torsoLower")} stroke={border} strokeWidth="1.2" />
      <path d="M46,160 Q40,180 44,206 L65,206 Q68,180 65,160 Z" fill={fillFor("legs")} stroke={border} strokeWidth="1.2" />
      <path d="M94,160 Q100,180 96,206 L75,206 Q72,180 75,160 Z" fill={fillFor("legs")} stroke={border} strokeWidth="1.2" />
      <path d="M45,209 Q41,232 45,256 L63,256 Q66,232 64,209 Z" fill={fillFor("legs")} stroke={border} strokeWidth="1.2" />
      <path d="M95,209 Q99,232 95,256 L77,256 Q74,232 76,209 Z" fill={fillFor("legs")} stroke={border} strokeWidth="1.2" />
    </svg>
  );
}

function ClientLibrary({ exercises }) {
  const [equipFilter, setEquipFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [viewMode, setViewMode] = useState("diagram");

  const filtered = exercises.filter((e) =>
    (equipFilter === "All" || e.equipment === equipFilter) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const key = e.muscle || "Other";
      (map[key] = map[key] || []).push(e);
    });
    return map;
  }, [filtered]);

  const categoryOrder = MUSCLES.filter((m) => m !== "All" && grouped[m]?.length);
  const searching = query.trim().length > 0;
  const isOpen = (cat) => searching || !!openSections[cat];
  const toggleSection = (cat) => setOpenSections((s) => ({ ...s, [cat]: !s[cat] }));

  const exerciseCard = (e, showMuscleTag) => (
    <Card key={e.id} style={{ padding: 14, cursor: "pointer" }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>{e.name}</div>
        <div style={{ fontSize: 11, color: showMuscleTag ? COLORS.accent : COLORS.textMuted }}>{showMuscleTag ? e.muscle : e.equipment}</div>
      </div>
      {showMuscleTag && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{e.equipment}</div>}
      {expanded === e.id && (
        <div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 10, lineHeight: 1.5 }}>{e.instructions}</div>
          {e.videoUrl && toYouTubeEmbed(e.videoUrl) ? (
            <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden", maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
              <iframe
                width="100%"
                style={{ border: "none", aspectRatio: "9 / 16", display: "block" }}
                src={toYouTubeEmbed(e.videoUrl)}
                title={e.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={exerciseSearchUrl(e.name)}
              target="_blank"
              rel="noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              style={{ fontSize: 12, color: COLORS.accent, marginTop: 10, display: "inline-block" }}
            >
              Watch an example ↗
            </a>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} color={COLORS.textMuted} style={{ position: "absolute", left: 12, top: 12 }} />
        <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search exercises…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", flex: 1, background: COLORS.surfaceAlt, borderRadius: 10, padding: 3 }}>
          <button
            onClick={() => setViewMode("diagram")}
            style={{
              flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
              background: viewMode === "diagram" ? COLORS.accent : "transparent",
              color: viewMode === "diagram" ? "#fff" : COLORS.textMuted,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12,
            }}
          >
            Diagram
          </button>
          <button
            onClick={() => setViewMode("list")}
            style={{
              flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
              background: viewMode === "list" ? COLORS.accent : "transparent",
              color: viewMode === "list" ? "#fff" : COLORS.textMuted,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12,
            }}
          >
            List
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <select style={inputStyle} value={equipFilter} onChange={(e) => setEquipFilter(e.target.value)}>
          {EQUIPMENT.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {viewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No exercises match.</div>}
          {filtered.map((e) => exerciseCard(e, true))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {categoryOrder.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No exercises match.</div>
          )}
          {categoryOrder.map((cat) => {
            const items = grouped[cat];
            const open = isOpen(cat);
            return (
              <div key={cat}>
                <Card onClick={() => toggleSection(cat)} style={{ padding: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
                  <MuscleIcon muscle={cat} size={40} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>{cat}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{items.length} exercise{items.length === 1 ? "" : "s"}</div>
                  </div>
                  <ChevronLeft size={16} color={COLORS.textMuted} style={{ transform: open ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                </Card>

                {open && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, paddingLeft: 8 }}>
                    {items.map((e) => exerciseCard(e, false))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProgressTab({ data, exercises, clientId, onSave }) {
  const exIdsLogged = useMemo(() => {
    const ids = new Set();
    data.logs.forEach((l) => {
      if (l.freeform) {
        l.entries.forEach((e) => e.exerciseId && ids.add(e.exerciseId));
        return;
      }
      l.entries.forEach((e) => {
        const day = (data.program.days || []).find((d) => d.id === l.dayId);
        const dayEx = day?.exercises.find((de) => de.id === e.dayExId);
        if (dayEx) ids.add(dayEx.exerciseId);
      });
    });
    return Array.from(ids);
  }, [data]);

  const [selectedExId, setSelectedExId] = useState(exIdsLogged[0] || "");

  useEffect(() => {
    if (!selectedExId && exIdsLogged.length) setSelectedExId(exIdsLogged[0]);
  }, [exIdsLogged, selectedExId]);

  const chartData = useMemo(() => {
    if (!selectedExId) return [];
    const points = [];
    data.logs.forEach((l) => {
      if (l.freeform) {
        const entry = l.entries.find((e) => e.exerciseId === selectedExId);
        if (!entry) return;
        const maxWeight = Math.max(0, ...entry.sets.map((s) => Number(s.weight) || 0));
        if (maxWeight > 0) points.push({ date: fmtDate(l.date), weight: maxWeight, raw: l.date });
        return;
      }
      const day = (data.program.days || []).find((d) => d.id === l.dayId);
      const dayEx = day?.exercises.find((de) => de.exerciseId === selectedExId);
      if (!dayEx) return;
      const entry = l.entries.find((e) => e.dayExId === dayEx.id);
      if (!entry) return;
      const maxWeight = Math.max(0, ...entry.sets.map((s) => Number(s.weight) || 0));
      if (maxWeight > 0) points.push({ date: fmtDate(l.date), weight: maxWeight, raw: l.date });
    });
    return points.sort((a, b) => a.raw.localeCompare(b.raw));
  }, [data, selectedExId]);

  const exName = (id) => exercises.find((e) => e.id === id)?.name || "Exercise";
  const consistency = computeConsistency(data.logs);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: consistency.nextMilestone ? 12 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={18} color={COLORS.accent} />
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>{consistency.weeklyStreak} week{consistency.weeklyStreak === 1 ? "" : "s"}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>current streak</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>{consistency.totalWorkouts}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>workouts logged</div>
          </div>
        </div>
        {consistency.nextMilestone && (
          <div>
            <div style={{ height: 6, background: COLORS.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.round((consistency.totalWorkouts / consistency.nextMilestone) * 100))}%`, height: "100%", background: COLORS.lime, borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>{consistency.nextMilestone - consistency.totalWorkouts} workouts to your next milestone ({consistency.nextMilestone})</div>
          </div>
        )}
      </Card>

      <BodyStats data={data} onSave={onSave} />

      <ProgressPhotos data={data} onSave={onSave} clientId={clientId} />

      {exIdsLogged.length === 0 ? (
        <Card style={{ textAlign: "center", color: COLORS.textMuted, marginBottom: 16 }}>Log a few workouts on the Today tab and your strength progress will show up here.</Card>
      ) : (
        <>
          <select style={{ ...inputStyle, marginBottom: 18 }} value={selectedExId} onChange={(e) => setSelectedExId(e.target.value)}>
            {exIdsLogged.map((id) => <option key={id} value={id}>{exName(id)}</option>)}
          </select>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Top set weight over time</div>
            {chartData.length < 2 ? (
              <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Log at least 2 sessions with weight to see a trend line.</div>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={11} />
                    <YAxis stroke={COLORS.textMuted} fontSize={11} />
                    <Tooltip contentStyle={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="weight" stroke={COLORS.lime} strokeWidth={2} dot={{ r: 3, fill: COLORS.lime }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function ProgressPhotos({ data, onSave, clientId }) {
  const photos = useMemo(
    () => [...(data.progressPhotos || [])].sort((a, b) => b.date.localeCompare(a.date)),
    [data.progressPhotos]
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url, fileId } = await uploadImage(file, clientId, "progress-photos");
      const next = [...(data.progressPhotos || []), { id: uid(), url, fileId, date: todayISO() }];
      await onSave({ ...data, progressPhotos: next });
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
    }
    setUploading(false);
  };

  const removePhoto = async (id) => {
    const target = (data.progressPhotos || []).find((p) => p.id === id);
    const next = (data.progressPhotos || []).filter((p) => p.id !== id);
    await onSave({ ...data, progressPhotos: next });
    setViewing(null);
    deleteImageKitFile(target?.fileId);
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14 }}>Progress photos</div>
        <Btn variant="subtle" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading…" : <><Plus size={14} /> Add photo</>}
        </Btn>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 10 }}>{error}</div>}

      {photos.length === 0 ? (
        <div style={{ color: COLORS.textMuted, fontSize: 12 }}>No photos yet — only you and your trainer can see these.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
          {photos.map((p) => (
            <div
              key={p.id}
              onClick={() => setViewing(p)}
              style={{ aspectRatio: "1 / 1", borderRadius: 8, overflow: "hidden", cursor: "pointer", background: COLORS.surfaceAlt }}
            >
              <img src={p.url} alt={fmtDate(p.date)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      {viewing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewing(null)}>
          <img src={viewing.url} alt="" style={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 10 }} onClick={(e) => e.stopPropagation()} />
          <div style={{ color: "#fff", fontSize: 13, marginTop: 14 }}>{fmtDate(viewing.date)}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Btn variant="danger" onClick={(e) => { e.stopPropagation(); removePhoto(viewing.id); }}><Trash2 size={14} /> Delete</Btn>
            <Btn variant="ghost" onClick={(e) => { e.stopPropagation(); setViewing(null); }}>Close</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

function BodyStats({ data, onSave }) {
  const intake = data.intake || {};
  const entries = useMemo(() => [...(data.bodyStats || [])].sort((a, b) => a.date.localeCompare(b.date)), [data.bodyStats]);
  const latest = entries[entries.length - 1];

  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [saving, setSaving] = useState(false);

  const bmi = latest ? computeBMI(latest.weight, intake.heightIn) : null;
  const bmr = latest ? computeBMR(latest.weight, intake.heightIn, intake.age, intake.gender) : null;
  const leanMass = latest?.bodyFat ? (Number(latest.weight) * (1 - Number(latest.bodyFat) / 100)).toFixed(1) : null;
  const fatMass = latest?.bodyFat ? (Number(latest.weight) * (Number(latest.bodyFat) / 100)).toFixed(1) : null;

  const addEntry = async () => {
    if (!weight.trim()) return;
    setSaving(true);
    const others = entries.filter((e) => e.date !== todayISO());
    const next = [...others, { id: uid(), date: todayISO(), weight: Number(weight), bodyFat: bodyFat ? Number(bodyFat) : null }];
    await onSave({ ...data, bodyStats: next });
    setWeight("");
    setBodyFat("");
    setSaving(false);
  };

  const removeEntry = async (id) => {
    await onSave({ ...data, bodyStats: entries.filter((e) => e.id !== id) });
  };

  const weightChart = entries.filter((e) => e.weight).map((e) => ({ date: fmtDate(e.date), value: e.weight, raw: e.date }));
  const fatChart = entries.filter((e) => e.bodyFat != null).map((e) => ({ date: fmtDate(e.date), value: e.bodyFat, raw: e.date }));

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Weekly stats</div>

      {!intake.heightIn && (
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 10 }}>Add your height in your profile (the file icon up top) to see BMI calculated automatically.</div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input type="number" style={{ ...inputStyle, width: 110 }} placeholder="Weight (lbs)" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input type="number" style={{ ...inputStyle, width: 130 }} placeholder="Body fat % (optional)" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
        <Btn onClick={addEntry} disabled={saving}>{saving ? "Saving…" : "Log"}</Btn>
      </div>

      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: 16 }}>
          {bmi && (
            <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>BMI</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{bmi.toFixed(1)}</div>
              <div style={{ fontSize: 10, color: COLORS.accent }}>{bmiCategory(bmi)}</div>
            </div>
          )}
          {bmr && (
            <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>Est. BMR</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{bmr}</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>cal/day at rest</div>
            </div>
          )}
          {leanMass && (
            <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>Lean mass</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{leanMass} lbs</div>
            </div>
          )}
          {fatMass && (
            <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>Fat mass</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{fatMass} lbs</div>
            </div>
          )}
        </div>
      )}

      {weightChart.length >= 2 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Weight over time</div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={weightChart}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={10} />
                <YAxis stroke={COLORS.textMuted} fontSize={10} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.lime} strokeWidth={2} dot={{ r: 3, fill: COLORS.lime }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {fatChart.length >= 2 && (
        <div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Body fat % over time</div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <LineChart data={fatChart}>
                <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={10} />
                <YAxis stroke={COLORS.textMuted} fontSize={10} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={{ r: 3, fill: COLORS.accent }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {[...entries].reverse().slice(0, 6).map((e) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{fmtDate(e.date)} — {e.weight} lbs{e.bodyFat != null ? ` · ${e.bodyFat}% BF` : ""}</div>
              <button onClick={() => removeEntry(e.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ClientMessages({ data, onSave, client }) {
  const [text, setText] = useState("");
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaFileId, setMediaFileId] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const mediaInputRef = useRef(null);
  const messages = data.messages || [];

  const handleMediaSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setMediaUploading(true);
    setMediaError("");
    try {
      const { url, fileId } = isVideo
        ? await uploadVideo(file, client?.id || "client", "message-media")
        : await uploadImage(file, client?.id || "client", "message-media");
      setMediaUrl(url);
      setMediaFileId(fileId);
      setMediaType(isVideo ? "video" : "image");
    } catch (err) {
      setMediaError(err.message || "Upload failed.");
    }
    setMediaUploading(false);
  };

  const cancelMedia = () => {
    deleteImageKitFile(mediaFileId);
    setMediaUrl(null);
    setMediaFileId(null);
    setMediaType(null);
  };

  const send = async () => {
    if (!text.trim() && !mediaUrl) return;
    const next = [...messages, { id: uid(), from: "client", text: text.trim(), mediaUrl: mediaUrl || null, mediaFileId: mediaFileId || null, mediaType: mediaType || null, date: new Date().toISOString() }];
    await onSave({ ...data, messages: next });
    fetch("https://ntfy.sh/xcel-pt-messages2026", {
      method: "POST",
      body: text.trim() ? `${client?.name || "A client"}: ${text.trim()}` : `${client?.name || "A client"} sent a ${mediaType === "video" ? "video" : "photo"}`,
      headers: { Title: `New message from ${client?.name || "a client"}`, Priority: "high" },
    }).catch(() => {});
    setText("");
    setMediaUrl(null);
    setMediaFileId(null);
    setMediaType(null);
  };

  const removeMessage = async (id) => {
    const target = messages.find((m) => m.id === id);
    const next = messages.filter((m) => m.id !== id);
    await onSave({ ...data, messages: next });
    deleteImageKitFile(target?.mediaFileId);
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {messages.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No messages yet. Say hi to your trainer!</div>}
        {messages.map((m) => (
          <div key={m.id} style={{
            alignSelf: m.from === "client" ? "flex-end" : "flex-start",
            background: m.from === "client" ? COLORS.accentDim : COLORS.surfaceAlt,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "8px 12px",
            maxWidth: "80%",
            fontSize: 13,
          }}>
            {m.text && <div>{m.text}</div>}
            {m.mediaUrl && m.mediaType === "video" && (
              <video controls src={m.mediaUrl} style={{ width: "100%", maxWidth: 220, borderRadius: 8, marginTop: m.text ? 6 : 0, display: "block" }} />
            )}
            {m.mediaUrl && m.mediaType !== "video" && (
              <img src={m.mediaUrl} alt="" style={{ width: "100%", maxWidth: 220, borderRadius: 8, marginTop: m.text ? 6 : 0, display: "block" }} />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, gap: 8 }}>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>{new Date(m.date).toLocaleString()}</div>
              {m.mediaUrl && m.from === "client" && (
                <button onClick={() => removeMessage(m.id)} title="Delete to free up storage" style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Trash2 size={12} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      {mediaError && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 10 }}>{mediaError}</div>}

      {mediaUrl && (
        <div style={{ position: "relative", marginBottom: 10, maxWidth: 160 }}>
          {mediaType === "video" ? (
            <video src={mediaUrl} style={{ width: "100%", borderRadius: 8, display: "block" }} />
          ) : (
            <img src={mediaUrl} alt="" style={{ width: "100%", borderRadius: 8, display: "block" }} />
          )}
          <button onClick={cancelMedia} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 999, color: "#fff", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={12} />
          </button>
        </div>
      )}

      <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>Got a form check question? Attach a photo or short video (20MB max) and ask below.</div>

      <div style={{ display: "flex", gap: 8 }}>
        <input style={inputStyle} placeholder="Message your trainer…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Btn variant="subtle" onClick={() => mediaInputRef.current?.click()} disabled={mediaUploading}>
          {mediaUploading ? "…" : <Paperclip size={15} />}
        </Btn>
        <input ref={mediaInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleMediaSelect} />
        <Btn onClick={send}><Send size={15} /></Btn>
      </div>
    </div>
  );
}
