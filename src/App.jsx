import { useState, useEffect, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dumbbell, Search, User, Settings, MessageCircle, TrendingUp, CalendarDays, Plus, X, Check, ChevronLeft, Trash2, Edit3, Send, LogOut, Lock } from "lucide-react";
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
const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso) => new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });

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
];

const MUSCLES = ["All", ...Array.from(new Set(SEED_EXERCISES.map(e => e.muscle)))];
const EQUIPMENT = ["All", ...Array.from(new Set(SEED_EXERCISES.map(e => e.equipment)))];

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

function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 18, ...style }}>
      {children}
    </div>
  );
}

// ============================================================
export default function App() {
  const [phase, setPhase] = useState("loading"); // loading | login | client | trainerGate | trainer
  const [clients, setClients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [trainerPin, setTrainerPin] = useState(null);
  const [currentClient, setCurrentClient] = useState(null);
  const [clientData, setClientData] = useState(null); // {program, logs, messages}

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
      setPhase("login");
    })();
  }, []);

  const loadClientData = async (clientId) => {
    const data = await sGet(`client:${clientId}`, { program: { days: [] }, logs: [], messages: [] });
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
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!selected) return;
    if ((selected.pin || "") !== pin) {
      setError("Incorrect PIN");
      return;
    }
    setError("");
    onClientLogin(selected);
  };

  return (
    <div style={{ ...pageBase, padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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

        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {clients.length === 0 && (
              <Card style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
                No clients set up yet. Your trainer needs to add you first.
              </Card>
            )}
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  ...inputStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "14px 14px",
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 999, background: COLORS.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User size={16} color={COLORS.textMuted} />
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15 }}>{c.name}</span>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => { setSelected(null); setPin(""); setError(""); }} style={{ background: "none", border: "none", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 6, marginBottom: 16, cursor: "pointer", fontSize: 13, padding: 0 }}>
              <ChevronLeft size={16} /> Back
            </button>
            <Card>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 17, marginBottom: 14 }}>
                Hey {selected.name.split(" ")[0]} 👋
              </div>
              <Field label="Enter your PIN">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  style={inputStyle}
                  placeholder="••••"
                  autoFocus
                />
              </Field>
              {error && <div style={{ color: COLORS.danger, fontSize: 12, marginBottom: 12 }}>{error}</div>}
              <Btn onClick={handleLogin} style={{ width: "100%" }}>Log in</Btn>
            </Card>
          </div>
        )}

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
function TrainerGate({ hasPin, onSetPin, onUnlock, onBack }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  return (
    <div style={{ ...pageBase, padding: "40px 20px", display: "flex", justifyContent: "center" }}>
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
  const tabs = [
    { id: "clients", label: "Clients", icon: User },
    { id: "library", label: "Library", icon: Dumbbell },
    { id: "programs", label: "Programs", icon: CalendarDays },
    { id: "messages", label: "Messages", icon: MessageCircle },
  ];

  return (
    <div style={{ ...pageBase, display: "flex", flexDirection: "column" }}>
      <style>{FONT_STACK}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17 }}>Trainer Console</div>
        <button onClick={onExit} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <LogOut size={15} /> Exit
        </button>
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
        {tab === "programs" && <ProgramsTab clients={clients} exercises={exercises} />}
        {tab === "messages" && <MessagesTab clients={clients} />}
      </div>
    </div>
  );
}

function ClientsTab({ clients, onRefresh }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [editing, setEditing] = useState(null);

  const addClient = async () => {
    if (!name.trim() || !pin.trim()) return;
    const list = await sGet("app:clients", []);
    list.push({ id: uid(), name: name.trim(), pin: pin.trim() });
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16 }}>Clients ({clients.length})</div>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {clients.map((c) => (
          <Card key={c.id} style={{ padding: 14 }}>
            {editing === c.id ? (
              <EditClientRow client={c} onSave={(patch) => updateClient(c.id, patch)} onCancel={() => setEditing(null)} />
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>PIN: {c.pin}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setEditing(c.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><Edit3 size={16} /></button>
                  <button onClick={() => removeClient(c.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function EditClientRow({ client, onSave, onCancel }) {
  const [name, setName] = useState(client.name);
  const [pin, setPin] = useState(client.pin);
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 120 }}>
        <Field label="Name"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      </div>
      <div style={{ width: 100 }}>
        <Field label="PIN"><input style={inputStyle} value={pin} onChange={(e) => setPin(e.target.value)} /></Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Btn onClick={() => onSave({ name, pin })}><Check size={15} /></Btn>
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

  const addDay = () => persist({ days: [...program.days, { id: uid(), name: `Day ${program.days.length + 1}`, exercises: [] }] });
  const removeDay = (dayId) => persist({ days: program.days.filter((d) => d.id !== dayId) });
  const renameDay = (dayId, name) => persist({ days: program.days.map((d) => (d.id === dayId ? { ...d, name } : d)) });
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <input style={{ ...inputStyle, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", maxWidth: 200 }} value={day.name} onChange={(e) => renameDay(day.id, e.target.value)} />
                <button onClick={() => removeDay(day.id)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer" }}><Trash2 size={16} /></button>
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

  useEffect(() => {
    if (!selectedClientId) return;
    (async () => {
      const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
      setMessages(data.messages || []);
    })();
  }, [selectedClientId]);

  const send = async () => {
    if (!text.trim()) return;
    const data = await sGet(`client:${selectedClientId}`, { program: { days: [] }, logs: [], messages: [] });
    const next = [...(data.messages || []), { id: uid(), from: "trainer", text: text.trim(), date: new Date().toISOString() }];
    await sSet(`client:${selectedClientId}`, { ...data, messages: next });
    setMessages(next);
    setText("");
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
            <div>{m.text}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{new Date(m.date).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input style={inputStyle} placeholder="Write a note to your client…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Btn onClick={send}><Send size={15} /></Btn>
      </div>
    </div>
  );
}

// ============================================================
function ClientApp({ client, exercises, data, onSave, onLogout }) {
  const [tab, setTab] = useState("today");
  const tabs = [
    { id: "today", label: "Today", icon: CalendarDays },
    { id: "library", label: "Library", icon: Dumbbell },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "messages", label: "Messages", icon: MessageCircle },
  ];

  return (
    <div style={{ ...pageBase, display: "flex", flexDirection: "column", minHeight: 600 }}>
      <style>{FONT_STACK}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo-mark.png" alt="" style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 8 }} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>Hey, {client.name.split(" ")[0]}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Xcel Online PT</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer" }}><LogOut size={18} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20, paddingBottom: 90 }}>
        {tab === "today" && <TodayTab data={data} exercises={exercises} onSave={onSave} />}
        {tab === "library" && <ClientLibrary exercises={exercises} />}
        {tab === "progress" && <ProgressTab data={data} exercises={exercises} />}
        {tab === "messages" && <ClientMessages data={data} onSave={onSave} client={client} />}
      </div>

      <div style={{ position: "sticky", bottom: 0, display: "flex", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
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

function TodayTab({ data, exercises, onSave }) {
  const days = data.program?.days || [];
  const [dayIdx, setDayIdx] = useState(0);
  const day = days[dayIdx];
  const todayLog = useMemo(() => data.logs.find((l) => l.date === todayISO() && l.dayId === day?.id), [data.logs, day]);
  const [entries, setEntries] = useState(() => todayLog?.entries || []);

  useEffect(() => {
    setEntries(todayLog?.entries || []);
  }, [dayIdx, todayLog]);

  if (days.length === 0) {
    return (
      <Card style={{ textAlign: "center", color: COLORS.textMuted }}>
        Your trainer hasn't assigned a program yet. Check back soon, or see a note in Messages.
      </Card>
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
  };

  return (
    <div>
      {days.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          {days.map((d, i) => (
            <button key={d.id} onClick={() => setDayIdx(i)} style={{
              padding: "8px 14px", borderRadius: 20, border: `1px solid ${i === dayIdx ? COLORS.accent : COLORS.border}`,
              background: i === dayIdx ? COLORS.accentDim : "transparent", color: i === dayIdx ? COLORS.accent : COLORS.textMuted,
              fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
            }}>{d.name}</button>
          ))}
        </div>
      )}

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 19, marginBottom: 4 }}>{day.name}</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>{fmtDate(todayISO())} · {day.exercises.length} exercises</div>

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
    </div>
  );
}

function ClientLibrary({ exercises }) {
  const [muscleFilter, setMuscleFilter] = useState("All");
  const [equipFilter, setEquipFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = exercises.filter((e) =>
    (muscleFilter === "All" || e.muscle === muscleFilter) &&
    (equipFilter === "All" || e.equipment === equipFilter) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={15} color={COLORS.textMuted} style={{ position: "absolute", left: 12, top: 12 }} />
        <input style={{ ...inputStyle, paddingLeft: 34 }} placeholder="Search exercises…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select style={inputStyle} value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)}>
          {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select style={inputStyle} value={equipFilter} onChange={(e) => setEquipFilter(e.target.value)}>
          {EQUIPMENT.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((e) => (
          <Card key={e.id} style={{ padding: 14, cursor: "pointer" }} onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", fontSize: 14 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: COLORS.accent }}>{e.muscle}</div>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{e.equipment}</div>
            {expanded === e.id && (
              <div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 10, lineHeight: 1.5 }}>{e.instructions}</div>
                {e.videoUrl && toYouTubeEmbed(e.videoUrl) ? (
                  <div style={{ marginTop: 10, borderRadius: 8, overflow: "hidden" }}>
                    <iframe
                      width="100%"
                      height="200"
                      src={toYouTubeEmbed(e.videoUrl)}
                      title={e.name}
                      style={{ border: "none" }}
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
        ))}
        {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>No exercises match.</div>}
      </div>
    </div>
  );
}

function ProgressTab({ data, exercises }) {
  const exIdsLogged = useMemo(() => {
    const ids = new Set();
    data.logs.forEach((l) => l.entries.forEach((e) => {
      const day = (data.program.days || []).find((d) => d.id === l.dayId);
      const dayEx = day?.exercises.find((de) => de.id === e.dayExId);
      if (dayEx) ids.add(dayEx.exerciseId);
    }));
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

  if (exIdsLogged.length === 0) {
    return <Card style={{ textAlign: "center", color: COLORS.textMuted }}>Log a few workouts on the Today tab and your progress will show up here.</Card>;
  }

  const exName = (id) => exercises.find((e) => e.id === id)?.name || "Exercise";

  return (
    <div>
      <select style={{ ...inputStyle, marginBottom: 18 }} value={selectedExId} onChange={(e) => setSelectedExId(e.target.value)}>
        {exIdsLogged.map((id) => <option key={id} value={id}>{exName(id)}</option>)}
      </select>

      <Card>
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
    </div>
  );
}

function ClientMessages({ data, onSave, client }) {
  const [text, setText] = useState("");
  const messages = data.messages || [];

  const send = async () => {
    if (!text.trim()) return;
    const next = [...messages, { id: uid(), from: "client", text: text.trim(), date: new Date().toISOString() }];
    await onSave({ ...data, messages: next });
    fetch("https://ntfy.sh/xcel-pt-messages2026", {
      method: "POST",
      body: `${client?.name || "A client"}: ${text.trim()}`,
      headers: { Title: `New message from ${client?.name || "a client"}`, Priority: "high" },
    }).catch(() => {});
    setText("");
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
            <div>{m.text}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{new Date(m.date).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input style={inputStyle} placeholder="Message your trainer…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <Btn onClick={send}><Send size={15} /></Btn>
      </div>
    </div>
  );
}
