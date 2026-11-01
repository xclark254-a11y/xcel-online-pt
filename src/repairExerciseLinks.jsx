// repairExerciseLinks.jsx
// One-time tool that re-links exercise names for programs and workout logs
// whose exercise IDs no longer match the exercise library (the "Exercise"
// placeholder bug).
//
// How it recovers names: each client's program remembers the template it came
// from (program.name) and the order of its days/exercises. Lining that up with
// the template tells us which exercise each old, orphaned ID used to be. Every
// log entry using that same old ID is then fixed too. It also converts the
// whole library to permanent name-based IDs so this can't happen again.
//
// Safety: "Scan" changes nothing. "Apply" saves a backup of every client record
// it touches (under "backup:repair:<clientId>") before writing anything.

import { useState } from "react";
import { sGet, sSet } from "./firebase";

const norm = (s) => String(s || "").trim().toLowerCase();
const stableId = (name) =>
  "ex-" + norm(name).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Line a client's program up against its template. Returns [{ oldId, name }].
function alignProgram(program, templates) {
  if (!program || !program.name || !Array.isArray(program.days)) return [];
  const tpl = templates.find((t) => norm(t.name) === norm(program.name));
  if (!tpl) return [];
  const out = [];
  program.days.forEach((pd, di) => {
    const td =
      tpl.days.find((d) => norm(d.name) === norm(pd.name)) ||
      (tpl.days.length === program.days.length ? tpl.days[di] : null);
    if (!td) return;
    const pe = pd.exercises || [];
    const te = td.exercises || [];
    const same = (p, t) => String(p.sets) === String(t.sets) && String(p.reps) === String(t.reps);
    if (pe.length === te.length) {
      pe.forEach((p, i) => {
        if (p.exerciseId && same(p, te[i])) out.push({ oldId: p.exerciseId, name: te[i].exerciseName });
      });
    } else if (pe.length < te.length) {
      // Some template exercises were dropped at assignment time (not in the
      // library then). Match what's left in order, only if every slot fits.
      let ti = 0;
      const picked = [];
      for (const p of pe) {
        while (ti < te.length && !same(p, te[ti])) ti++;
        if (ti >= te.length) { picked.length = 0; break; }
        picked.push({ oldId: p.exerciseId, name: te[ti].exerciseName });
        ti++;
      }
      picked.forEach((x) => x.oldId && out.push(x));
    }
  });
  return out;
}

function programsOf(data) {
  const list = [];
  if (data.program) list.push(data.program);
  (data.programQueue || []).forEach((q) => list.push(q));
  if (data.bootcampProgram) list.push(data.bootcampProgram);
  return list;
}

// Returns a changed copy of the client record plus counts.
function fixClientData(data, fixId) {
  const counts = { fixed: 0, unrecoverable: 0 };
  const fixEx = (ex) => {
    if (!ex || !ex.exerciseId) return ex;
    const res = fixId(ex.exerciseId);
    if (res.status === "bad") counts.unrecoverable++;
    if (res.id === ex.exerciseId) return ex;
    counts.fixed++;
    return { ...ex, exerciseId: res.id };
  };
  const fixProgram = (p) =>
    p && Array.isArray(p.days)
      ? { ...p, days: p.days.map((d) => ({ ...d, exercises: (d.exercises || []).map(fixEx) })) }
      : p;
  const fixLogs = (logs) =>
    (logs || []).map((l) => ({ ...l, entries: (l.entries || []).map(fixEx) }));

  const next = { ...data };
  if (data.program) next.program = fixProgram(data.program);
  if (data.programQueue) next.programQueue = data.programQueue.map(fixProgram);
  if (data.bootcampProgram) next.bootcampProgram = fixProgram(data.bootcampProgram);
  if (data.logs) next.logs = fixLogs(data.logs);
  if (data.bootcampLogs) next.bootcampLogs = fixLogs(data.bootcampLogs);
  return { next, counts };
}

async function buildPlan(clients, exercises, templates, seedExercises) {
  const libById = new Map(exercises.map((e) => [e.id, e]));
  const libByName = new Map();
  exercises.forEach((e) => { if (!libByName.has(norm(e.name))) libByName.set(norm(e.name), e); });
  const seedNames = new Set((seedExercises || []).map((s) => norm(s.name)));

  // The id each library exercise should end up with (permanent id for built-in
  // exercises, unchanged for ones the trainer added by hand).
  const targetIdFor = (lib) => (seedNames.has(norm(lib.name)) ? stableId(lib.name) : lib.id);

  const records = [];
  for (const c of clients) {
    const data = await sGet(`client:${c.id}`, null);
    if (data) records.push({ client: c, data });
  }
  const globalBC = await sGet("app:bootcampProgram", null);

  // Vote: which exercise name does each orphaned id belong to?
  const votes = new Map();
  const vote = (oldId, name) => {
    if (!oldId || !name) return;
    const m = votes.get(oldId) || new Map();
    m.set(norm(name), (m.get(norm(name)) || 0) + 1);
    votes.set(oldId, m);
  };
  const allPrograms = [];
  records.forEach(({ data }) => programsOf(data).forEach((p) => allPrograms.push(p)));
  if (globalBC) allPrograms.push(globalBC);
  allPrograms.forEach((p) => alignProgram(p, templates).forEach((x) => vote(x.oldId, x.name)));

  // Log entries that point at a slot of a still-existing program also tell us the name.
  records.forEach(({ data }) => {
    const slotName = new Map();
    programsOf(data).forEach((p) => {
      const tpl = templates.find((t) => norm(t.name) === norm(p.name));
      if (!tpl) return;
      const aligned = alignProgram(p, templates);
      const byOld = new Map(aligned.map((a) => [a.oldId, a.name]));
      (p.days || []).forEach((d) => (d.exercises || []).forEach((e) => {
        if (byOld.has(e.exerciseId)) slotName.set(e.id, byOld.get(e.exerciseId));
      }));
    });
    [...(data.logs || []), ...(data.bootcampLogs || [])].forEach((l) =>
      (l.entries || []).forEach((en) => {
        if (en.dayExId && slotName.has(en.dayExId)) vote(en.exerciseId, slotName.get(en.dayExId));
      })
    );
  });

  const recovered = new Map(); // oldId -> library exercise
  votes.forEach((m, oldId) => {
    if (libById.has(oldId)) return;
    const ranked = [...m.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return; // tie: don't guess
    const lib = libByName.get(ranked[0][0]);
    if (lib) recovered.set(oldId, lib);
  });

  const fixId = (id) => {
    if (libById.has(id)) return { id: targetIdFor(libById.get(id)), status: "ok" };
    if (recovered.has(id)) return { id: targetIdFor(recovered.get(id)), status: "recovered" };
    return { id, status: "bad" };
  };

  const changes = [];
  let totalFixed = 0, totalBad = 0;
  records.forEach(({ client, data }) => {
    const { next, counts } = fixClientData(data, fixId);
    totalBad += counts.unrecoverable;
    if (counts.fixed > 0) { changes.push({ client, next, data, counts }); totalFixed += counts.fixed; }
  });

  // Same treatment for the shared Boot Camp program record.
  let nextGlobalBC = null;
  if (globalBC) {
    const { next, counts } = fixClientData({ program: globalBC }, fixId);
    if (counts.fixed > 0) nextGlobalBC = next.program;
  }

  const nextLibrary = exercises.map((e) => ({ ...e, id: targetIdFor(e) }));
  const libraryChanged = nextLibrary.some((e, i) => e.id !== exercises[i].id);

  return {
    changes, nextGlobalBC, nextLibrary, libraryChanged,
    summary: {
      clientsScanned: records.length,
      clientsToUpdate: changes.length,
      linksToFix: totalFixed,
      recoveredIds: recovered.size,
      stillUnrecoverable: totalBad,
      libraryChanged,
    },
  };
}

export default function RepairExerciseLinks({ clients, exercises, templates, seedExercises, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState(null);
  const [msg, setMsg] = useState("");

  const scan = async () => {
    setBusy(true); setMsg(""); setPlan(null);
    try {
      setPlan(await buildPlan(clients, exercises, templates, seedExercises));
    } catch (e) {
      setMsg("Scan failed: " + (e?.message || e));
    }
    setBusy(false);
  };

  const apply = async () => {
    if (!plan) return;
    if (!window.confirm("Apply the repair? A backup of every client record it changes is saved first.")) return;
    setBusy(true); setMsg("");
    try {
      for (const ch of plan.changes) {
        await sSet(`backup:repair:${ch.client.id}`, ch.data);
        await sSet(`client:${ch.client.id}`, ch.next);
      }
      if (plan.nextGlobalBC) await sSet("app:bootcampProgram", plan.nextGlobalBC);
      if (plan.libraryChanged) {
        await sSet("backup:repair:exercises", exercises);
        await sSet("app:exercises", plan.nextLibrary);
      }
      setMsg("Repair applied. Reload the app to see the names back.");
      setPlan(null);
      onRefresh && onRefresh();
    } catch (e) {
      setMsg("Repair failed part-way: " + (e?.message || e) + " — backups are saved under backup:repair:*");
    }
    setBusy(false);
  };

  const btn = (primary) => ({
    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, padding: "10px 16px",
    borderRadius: 10, border: primary ? "none" : "1px solid #2A2F38", cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.5 : 1, background: primary ? "#FF4E24" : "transparent", color: "#F2F3F5",
  });
  const s = plan?.summary;

  return (
    <div style={{ background: "#181B20", border: "1px solid #2A2F38", borderRadius: 14, padding: 16, marginBottom: 16, color: "#F2F3F5" }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Repair missing exercise names</div>
      <div style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
        Re-links programs and workout history that show "Exercise" instead of a name. Scan first — nothing changes until you press Apply.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button style={btn(false)} disabled={busy} onClick={scan}>{busy && !plan ? "Working…" : "Scan"}</button>
        {plan && (s.linksToFix > 0 || s.libraryChanged) && <button style={btn(true)} disabled={busy} onClick={apply}>Apply repair</button>}
      </div>
      {s && (
        <div style={{ fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>
          <div>Clients scanned: {s.clientsScanned}</div>
          <div>Clients that will be updated: {s.clientsToUpdate}</div>
          <div>Exercise links to fix: {s.linksToFix}</div>
          <div>Old IDs recovered by name: {s.recoveredIds}</div>
          <div>Library converted to permanent IDs: {s.libraryChanged ? "yes" : "already done"}</div>
          <div style={{ color: s.stillUnrecoverable ? "#FF6B6B" : "#F2F3F5" }}>
            Links that can't be recovered (custom programs): {s.stillUnrecoverable}
          </div>
          {s.linksToFix === 0 && !s.libraryChanged && <div>Nothing to fix.</div>}
        </div>
      )}
      {msg && <div style={{ fontSize: 13, marginTop: 10 }}>{msg}</div>}
    </div>
  );
}
