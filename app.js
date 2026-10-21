/**
 * THE DAILY ROAST (TDR) - Core Application Logic
 * Behavioral Psychology, Habit Replacement & Gamification Engine
 * Inspired by the six2eight editorial illustration & Daniel Tan's Jupiter 3D Warping Vessel
 */

// --- Global State & Persistence ---
const DEFAULT_STATE = {
  user: {
    name: "Alex",
    archetype: "Pour-Over Paladin",
    level: 1,
    streakDays: 14,
    cravingsDiverted: 42,
    ritualMinutesEarned: 210,
    beansRemainingGrams: 70, // 250g initial
    cupsBrewedFromBag: 12,
    totalBagCups: 16,
    activeBagName: "IO Volcanic — Ethiopia Yirgacheffe",
  },
  dailyCaffeineMg: 210,
  maxDailyCaffeineMg: 350,
  bedtimeHour: 22.5, // 10:30 PM
  caffeineHalfLifeHours: 5,
  badges: [
    { id: "grind", title: "First Fresh Grind", desc: "Engaged manual burrs", icon: "⚙️", unlocked: true },
    { id: "bloom", title: "The Golden Bloom", desc: "Witnessed CO2 expansion", icon: "✨", unlocked: true },
    { id: "streak3", title: "3-Day Clean Streak", desc: "3 vice cravings swapped", icon: "🛡️", unlocked: true },
    { id: "circadian", title: "Circadian Guardian", desc: "Cut off caffeine by 2 PM", icon: "☀️", unlocked: true },
    { id: "sommelier", title: "Sensory Sommelier", desc: "Identified 3 flavor notes", icon: "☕", unlocked: false },
    { id: "streak14", title: "14-Day Reset Champ", desc: "Rewired 50% habit loop", icon: "🏆", unlocked: true },
    { id: "panic_master", title: "Panic Hero", desc: "Defeated craving with Panic Brew", icon: "🧘", unlocked: false },
    { id: "nightcap_swap", title: "Nightcap Neutralizer", desc: "Brewed decaf over evening drink", icon: "🌙", unlocked: false }
  ],
  cart: []
};

let appState = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem("tdr_app_state");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Local storage error:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function saveState() {
  try {
    localStorage.setItem("tdr_app_state", JSON.stringify(appState));
  } catch (e) {
    console.error("Save error:", e);
  }
}

// ==========================================================================
// JUPITER MOTION EFFECT: 3D INTERACTIVE VESSEL & WARPING ENGINE
// ==========================================================================

const JUPITER_ORIGINS = [
  {
    id: "io",
    num: "01",
    code: "IO VOLCANIC",
    title: "IO • Volcanic Anaerobic",
    origin: "Ethiopia Yirgacheffe • Micro-Lot 2,150m",
    notes: "Peach Nectar, Wild Jasmine, Meyer Lemon Zest, Golden Honey",
    bodyDesc: "High floral aromatics engineered to stun the olfactory cortex during intense morning nicotine cravings.",
    altitude: "2,150m",
    process: "Anaerobic Washed",
    caffeine: "105mg / cup",
    dopamine: "Immediate • High Focus",
    primaryColor: "#e6a756",
    glowColor: "rgba(230, 167, 86, 0.32)",
    liquidColor: "#7d421b",
    tag1: "Habit Swap: Morning Cigarette",
    tag2: "Notes: Peach & Jasmine",
    tag3: "Altitude: 2,150m"
  },
  {
    id: "europa",
    num: "02",
    code: "EUROPA GLACIAL",
    title: "EUROPA • Glacial Cold Wash",
    origin: "Colombia Huila • Thermal Shock 1,950m",
    notes: "Crisp Green Apple, Raw Cacao Nibs, Cane Sugar, Silky Malic Acidity",
    bodyDesc: "Electric, punchy acidity designed to shatter afternoon brain fog without synthetic energy drink crashes.",
    altitude: "1,950m",
    process: "Cold Fermentation",
    caffeine: "95mg / cup",
    dopamine: "Sustained • Flow State",
    primaryColor: "#48bb78",
    glowColor: "rgba(72, 187, 120, 0.30)",
    liquidColor: "#57351c",
    tag1: "Habit Swap: 3 PM Work Smoke",
    tag2: "Notes: Green Apple & Cacao",
    tag3: "Process: Cold Wash"
  },
  {
    id: "ganymede",
    num: "03",
    code: "GANYMEDE OBSIDIAN",
    title: "GANYMEDE • Obsidian Honey",
    origin: "Guatemala Huehuetenango • High Grown 1,850m",
    notes: "85% Dark Chocolate, Toasted Pecan, Molasses, Velvety Mouthfeel",
    bodyDesc: "Dense, heavy mouthfeel that satisfies oral motor cravings with deep, comforting roasted caramel tones.",
    altitude: "1,850m",
    process: "Black Honey",
    caffeine: "115mg / cup",
    dopamine: "Grounding • High Body",
    primaryColor: "#ed8936",
    glowColor: "rgba(237, 137, 54, 0.32)",
    liquidColor: "#3d1e11",
    tag1: "Habit Swap: Fidgety Hands",
    tag2: "Notes: Dark Choc & Pecan",
    tag3: "Body: Heavy Velvet"
  },
  {
    id: "callisto",
    num: "04",
    code: "CALLISTO DECAF",
    title: "CALLISTO • Midnight Decaf",
    origin: "Swiss-Water Colombia • 99.9% Caffeine-Free",
    notes: "Roasted Hazelnut, Brown Sugar, Lavender Bud, Chamomile Finish",
    bodyDesc: "The ultimate nightcap neutralizer. Deep comforting warmth to replace evening whiskey and beer decompression.",
    altitude: "1,750m",
    process: "Swiss-Water Organic",
    caffeine: "2mg / cup",
    dopamine: "Calming • REM Safe",
    primaryColor: "#b794f4",
    glowColor: "rgba(183, 148, 244, 0.30)",
    liquidColor: "#432517",
    tag1: "Habit Swap: 8 PM Wine / Beer",
    tag2: "Notes: Hazelnut & Lavender",
    tag3: "Sleep: 100% REM Safe"
  }
];

let activeOriginIndex = 0;
let vesselRotX = 0;
let vesselRotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let dragStartX = 0;
let isDraggingVessel = false;
let dragCurrentRotY = 0;

function initJupiterVessel() {
  const container = document.getElementById("jupiterShowcase");
  const vessel = document.getElementById("vesselCylinder");
  const wrapper = document.getElementById("vessel3DWrapper");

  if (!container || !vessel) return;

  // Initialize Canvas Liquid
  initLiquidCanvas();

  // Mouse Parallax movement
  container.addEventListener("mousemove", (e) => {
    if (isDraggingVessel) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Smooth angle bounds
    targetRotY = (x / (rect.width / 2)) * 22;
    targetRotX = -(y / (rect.height / 2)) * 16;
  });

  container.addEventListener("mouseleave", () => {
    if (isDraggingVessel) return;
    targetRotX = 0;
    targetRotY = 0;
  });

  // Drag-to-rotate physics
  wrapper.addEventListener("mousedown", (e) => {
    isDraggingVessel = true;
    dragStartX = e.clientX;
    dragCurrentRotY = targetRotY;
    wrapper.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingVessel) return;
    const deltaX = e.clientX - dragStartX;
    targetRotY = dragCurrentRotY + (deltaX * 0.45);
  });

  window.addEventListener("mouseup", () => {
    if (isDraggingVessel) {
      isDraggingVessel = false;
      wrapper.style.cursor = "grab";
    }
  });

  // Animation Loop for Inertia and Specular Light Sweep
  requestAnimationFrame(vesselRenderLoop);
}

function vesselRenderLoop() {
  // Smooth spring easing
  vesselRotX += (targetRotX - vesselRotX) * 0.08;
  vesselRotY += (targetRotY - vesselRotY) * 0.08;

  const vessel = document.getElementById("vesselCylinder");
  const specular = document.getElementById("vesselSpecular");
  const label = document.getElementById("vesselLabel");
  const tag1 = document.getElementById("orbitalTag1");
  const tag2 = document.getElementById("orbitalTag2");
  const tag3 = document.getElementById("orbitalTag3");

  if (vessel) {
    vessel.style.transform = `perspective(1200px) rotateY(${vesselRotY}deg) rotateX(${vesselRotX}deg)`;
  }

  // Specular light sweep shifts in opposite direction of angle
  if (specular) {
    const sweepOffset = -vesselRotY * 3.5;
    specular.style.transform = `translateX(${sweepOffset}px)`;
  }

  // Cylindrical label wrap effect
  if (label) {
    const labelTilt = vesselRotY * 0.6;
    label.style.transform = `rotateY(${labelTilt}deg) translateZ(4px)`;
  }

  // Floating orbital tags in multi-plane parallax depth
  if (tag1) tag1.style.transform = `translateZ(70px) translate(${-vesselRotY * 1.2}px, ${-vesselRotX * 0.8}px)`;
  if (tag2) tag2.style.transform = `translateZ(90px) translate(${vesselRotY * 1.4}px, ${-vesselRotX * 0.9}px)`;
  if (tag3) tag3.style.transform = `translateZ(60px) translate(${-vesselRotY * 0.9}px, ${vesselRotX * 0.7}px)`;

  // Render liquid canvas physics
  drawLiquidWave(vesselRotY, vesselRotX);

  requestAnimationFrame(vesselRenderLoop);
}

// --- Liquid Slosh Canvas Physics ---
let waveTime = 0;
function initLiquidCanvas() {
  const canvas = document.getElementById("liquidCanvas");
  if (!canvas) return;
  canvas.width = 184 * window.devicePixelRatio || 184;
  canvas.height = 310 * window.devicePixelRatio || 310;
}

function drawLiquidWave(rotY, rotX) {
  const canvas = document.getElementById("liquidCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  waveTime += 0.035;

  ctx.clearRect(0, 0, w, h);

  const origin = JUPITER_ORIGINS[activeOriginIndex];
  const color = origin ? origin.liquidColor : "#7d421b";

  // Liquid height based on container fill (approx 68% full)
  const baseY = h * 0.32;
  const tiltSlope = (rotY / 22) * (h * 0.12);
  const waveAmp = 6 + Math.abs(rotY) * 0.3;

  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, baseY - tiltSlope);

  // Bezier slosh wave curve
  for (let x = 0; x <= w; x += 10) {
    const wave = Math.sin((x / w) * Math.PI * 2 + waveTime) * waveAmp;
    const currentSlope = baseY + ((x - w / 2) / (w / 2)) * tiltSlope;
    ctx.lineTo(x, currentSlope + wave);
  }

  ctx.lineTo(w, h);
  ctx.closePath();

  // Rich gradient
  const grad = ctx.createLinearGradient(0, baseY, 0, h);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "#180a04");
  ctx.fillStyle = grad;
  ctx.fill();

  // Surface meniscus foam line
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 235, 210, 0.25)";
  ctx.stroke();
}

// --- Origin Switching with 3D Warp Transition ---
function switchJupiterOrigin(index) {
  if (index === activeOriginIndex) return;
  activeOriginIndex = index;
  const origin = JUPITER_ORIGINS[index];
  if (!origin) return;

  sounds.playScaleTare();

  // 3D Flip & Warp the Vessel
  const vessel = document.getElementById("vesselCylinder");
  if (vessel) {
    vessel.style.transition = "transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)";
    targetRotY += 360; // 360 degree spin warp
    setTimeout(() => {
      vessel.style.transition = "transform 0.15s cubic-bezier(0.1, 0.9, 0.2, 1)";
    }, 450);
  }

  // Update Dynamic Theme Colors (Aura & Glow)
  document.documentElement.style.setProperty("--origin-primary", origin.primaryColor);
  document.documentElement.style.setProperty("--origin-glow", origin.glowColor);

  // Update Background Title
  const bgTitle = document.getElementById("jupiterBgTitle");
  if (bgTitle) {
    bgTitle.style.opacity = "0";
    bgTitle.style.transform = "translate(-50%, -58%) scale(0.96)";
    setTimeout(() => {
      bgTitle.textContent = origin.code;
      bgTitle.style.opacity = "1";
      bgTitle.style.transform = "translate(-50%, -58%) scale(1)";
    }, 250);
  }

  // Update Left Information Column
  const originName = document.getElementById("jupiterOriginName");
  const originNotes = document.getElementById("jupiterOriginNotes");
  const originAltitude = document.getElementById("jupiterAltitude");
  const originProcess = document.getElementById("jupiterProcess");
  const originCaffeine = document.getElementById("jupiterCaffeine");
  const originDopamine = document.getElementById("jupiterDopamine");

  if (originName) originName.textContent = origin.title;
  if (originNotes) originNotes.textContent = origin.notes;
  if (originAltitude) originAltitude.textContent = origin.altitude;
  if (originProcess) originProcess.textContent = origin.process;
  if (originCaffeine) originCaffeine.textContent = origin.caffeine;
  if (originDopamine) originDopamine.textContent = origin.dopamine;

  // Update Vessel Label Typography
  const labelTitle = document.getElementById("labelOriginTitle");
  const labelSub = document.getElementById("labelOriginSub");
  const labelAltitude = document.getElementById("labelAltitudeVal");

  if (labelTitle) labelTitle.textContent = origin.code;
  if (labelSub) labelSub.textContent = origin.process;
  if (labelAltitude) labelAltitude.textContent = origin.altitude;

  // Update Orbital Tags
  const tag1Text = document.getElementById("tag1Text");
  const tag2Text = document.getElementById("tag2Text");
  const tag3Text = document.getElementById("tag3Text");

  if (tag1Text) tag1Text.textContent = origin.tag1;
  if (tag2Text) tag2Text.textContent = origin.tag2;
  if (tag3Text) tag3Text.textContent = origin.tag3;

  // Update Selector Buttons active state
  document.querySelectorAll(".origin-selector-btn").forEach((btn, idx) => {
    btn.classList.toggle("active", idx === index);
  });

  // Update User Active Bag
  appState.user.activeBagName = `${origin.title} (${origin.process})`;
  saveState();
  updateDashboardUI();

  showToast("Origin Selected", `${origin.title} loaded into your extraction queue.`, "☕");
}

// ==========================================================================
// 3D ILLUSTRATED CAROUSEL CONTROLLER (six2eight editorial stories)
// ==========================================================================
let currentCardIndex = 1;
const TOTAL_CARDS = 4;

function initCarousel() {
  updateCarouselView();
}

function setCarouselCard(index) {
  sounds.playGrinderCrunch();
  currentCardIndex = (index + TOTAL_CARDS) % TOTAL_CARDS;
  updateCarouselView();
}

function nextCarouselCard() {
  setCarouselCard(currentCardIndex + 1);
}

function prevCarouselCard() {
  setCarouselCard(currentCardIndex - 1);
}

function updateCarouselView() {
  const cards = document.querySelectorAll(".illustrated-card");
  const dots = document.querySelectorAll(".carousel-dot");
  const track = document.getElementById("carouselTrack");

  cards.forEach((card, idx) => {
    card.classList.remove("active", "inactive");
    if (idx === currentCardIndex) {
      card.classList.add("active");
    } else {
      card.classList.add("inactive");
    }
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentCardIndex);
  });

  if (track) {
    const cardWidthWithGap = window.innerWidth <= 768 ? 340 : 492;
    const offset = -(currentCardIndex - 1) * cardWidthWithGap;
    track.style.transform = `translateX(${offset}px)`;
  }
}

// --- Web Audio Synthesizer (Haptic / Acoustic Feedback) ---
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playGrinderCrunch() {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.12);
    noise.stop(now + 0.12);
  }

  playScaleTare() {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playBloomSizzle() {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const duration = 0.8;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(400, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  playZenChime() {
    this.init();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const freqs = [528, 1056, 1584];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      const amp = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.5);
    });
  }
}

const sounds = new SoundEngine();

// --- Toast Notifications ---
function showToast(title, message, icon = "☕") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span style="font-size: 1.4rem;">${icon}</span>
    <div>
      <strong style="display:block; font-size:0.92rem; color: var(--ink-espresso); font-family:var(--font-serif);">${title}</strong>
      <span style="font-size:0.8rem; color: var(--text-muted-on-cream);">${message}</span>
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// --- Dashboard UI Renderers ---
function updateDashboardUI() {
  const { user, dailyCaffeineMg, maxDailyCaffeineMg } = appState;

  const profileName = document.getElementById("profileName");
  const profileArchetype = document.getElementById("profileArchetype");
  const streakCount = document.getElementById("streakCount");
  const cravingsCount = document.getElementById("cravingsCount");
  const ritualMinutes = document.getElementById("ritualMinutes");
  
  if (profileName) profileName.textContent = user.name;
  if (profileArchetype) profileArchetype.textContent = user.archetype;
  if (streakCount) streakCount.textContent = user.streakDays;
  if (cravingsCount) cravingsCount.textContent = user.cravingsDiverted;
  if (ritualMinutes) ritualMinutes.textContent = `${user.ritualMinutesEarned}m`;

  const caffeineCurrent = document.getElementById("caffeineCurrent");
  const gaugeFill = document.getElementById("caffeineGaugeFill");
  const meterStatusPill = document.getElementById("meterStatusPill");
  
  if (caffeineCurrent) caffeineCurrent.textContent = `${dailyCaffeineMg}mg`;
  
  const pct = Math.min(100, Math.round((dailyCaffeineMg / maxDailyCaffeineMg) * 100));
  if (gaugeFill) gaugeFill.style.width = `${pct}%`;

  if (meterStatusPill) {
    if (dailyCaffeineMg <= 250) {
      meterStatusPill.className = "meter-status-pill status-optimal";
      meterStatusPill.textContent = "Optimal Flow State";
    } else if (dailyCaffeineMg <= 350) {
      meterStatusPill.className = "meter-status-pill status-warning";
      meterStatusPill.textContent = "Plateau Zone";
    } else {
      meterStatusPill.className = "meter-status-pill status-danger";
      meterStatusPill.textContent = "Jitter Cap Reached";
    }
  }

  const repBagName = document.getElementById("repBagName");
  const repCupsBrewed = document.getElementById("repCupsBrewed");
  const repProgressFill = document.getElementById("repProgressFill");
  const repStatusNotice = document.getElementById("repStatusNotice");

  if (repBagName) repBagName.textContent = user.activeBagName;
  if (repCupsBrewed) repCupsBrewed.textContent = `${user.cupsBrewedFromBag} / ${user.totalBagCups} cups brewed`;
  
  const bagPct = Math.round((user.cupsBrewedFromBag / user.totalBagCups) * 100);
  if (repProgressFill) repProgressFill.style.width = `${bagPct}%`;

  const cupsLeft = user.totalBagCups - user.cupsBrewedFromBag;
  if (repStatusNotice) {
    if (cupsLeft <= 4) {
      repStatusNotice.innerHTML = `⚠️ <strong style="color:var(--accent-amber);">Low Supply:</strong> ${cupsLeft} cups left (~2 days). Smart Refill is armed!`;
    } else {
      repStatusNotice.innerHTML = `✨ Supply Healthy: ~${cupsLeft} cups remaining in your current batch.`;
    }
  }

  renderBadges();
}

function renderBadges() {
  const badgeGrid = document.getElementById("badgeGrid");
  if (!badgeGrid) return;
  badgeGrid.innerHTML = "";

  appState.badges.forEach(b => {
    const card = document.createElement("div");
    card.className = `badge-item ${b.unlocked ? "unlocked" : "locked"}`;
    card.onclick = () => {
      showToast(
        b.unlocked ? `Unlocked: ${b.title}` : `Locked: ${b.title}`,
        b.desc,
        b.icon
      );
    };
    card.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-title">${b.title}</div>
      <div class="badge-desc">${b.unlocked ? "Completed" : b.desc}</div>
    `;
    badgeGrid.appendChild(card);
  });
}

function logCup(method, doseGrams, caffeineEstimateMg, cravingTag) {
  sounds.playBloomSizzle();

  appState.dailyCaffeineMg += caffeineEstimateMg;
  appState.user.cupsBrewedFromBag += 1;
  appState.user.beansRemainingGrams = Math.max(0, appState.user.beansRemainingGrams - doseGrams);
  appState.user.cravingsDiverted += 1;
  appState.user.ritualMinutesEarned += 5;

  if (appState.user.cupsBrewedFromBag >= 1) {
    unlockBadge("grind");
    unlockBadge("bloom");
  }
  if (cravingTag.includes("Evening") || cravingTag.includes("Drink")) {
    unlockBadge("nightcap_swap");
  }

  saveState();
  updateDashboardUI();

  showToast(
    `Cup Logged: ${method}`,
    `Replaced "${cravingTag}" • +5m Tactile Ritual • Caffeine +${caffeineEstimateMg}mg`,
    "☕"
  );

  const cupsLeft = appState.user.totalBagCups - appState.user.cupsBrewedFromBag;
  if (cupsLeft <= 4) {
    setTimeout(() => {
      showRefillModal();
    }, 1200);
  }
}

function unlockBadge(badgeId) {
  const badge = appState.badges.find(b => b.id === badgeId);
  if (badge && !badge.unlocked) {
    badge.unlocked = true;
    saveState();
    showToast(`Achievement Unlocked!`, badge.title, badge.icon);
    sounds.playScaleTare();
  }
}

function showRefillModal() {
  const modal = document.getElementById("refillModal");
  if (!modal) return;
  modal.classList.add("active");
  sounds.playScaleTare();
}

function hideRefillModal() {
  const modal = document.getElementById("refillModal");
  if (modal) modal.classList.remove("active");
}

function confirmSmartRefill() {
  sounds.playScaleTare();
  hideRefillModal();
  showToast(
    "Fresh Batch Dispatched!",
    "Your next curated origin (Colombia Huila Single Origin) will arrive in 48 hours.",
    "📦"
  );
  appState.user.activeBagName = "Colombia Huila (Specialty Washed)";
  appState.user.cupsBrewedFromBag = 0;
  appState.user.beansRemainingGrams = 250;
  saveState();
  updateDashboardUI();
}

let panicInterval = null;
let panicSecondsLeft = 180;

const PANIC_STEPS = [
  { at: 180, text: "Step 1: Grab your manual grinder. Feel the cool knurled aluminum in your hands." },
  { at: 150, text: "Step 2: Weigh 15g of whole beans. Listen to the rattle into the hopper." },
  { at: 120, text: "Step 3: Begin grinding. Focus solely on the rhythmic crunch of each burr rotation." },
  { at: 75, text: "Step 4: Unscrew the catch cup. Inhale the dry aromatic bloom deeply through your nose." },
  { at: 40, text: "Step 5: Slow 45-second spiral pour. Watch the carbon dioxide rise. The craving has passed." }
];

function openPanicBrewModal() {
  sounds.playZenChime();
  const modal = document.getElementById("panicModal");
  if (!modal) return;
  modal.classList.add("active");

  panicSecondsLeft = 180;
  updatePanicTimerUI();

  if (panicInterval) clearInterval(panicInterval);
  panicInterval = setInterval(() => {
    panicSecondsLeft--;
    updatePanicTimerUI();
    if (panicSecondsLeft <= 0) {
      clearInterval(panicInterval);
      unlockBadge("panic_master");
      showToast("Craving Conquered!", "You successfully grounded your nervous system.", "🧘");
      hidePanicBrewModal();
    }
  }, 1000);
}

function hidePanicBrewModal() {
  const modal = document.getElementById("panicModal");
  if (modal) modal.classList.remove("active");
  if (panicInterval) clearInterval(panicInterval);
}

function updatePanicTimerUI() {
  const timerDisplay = document.getElementById("panicTimerDisplay");
  const instructionDisplay = document.getElementById("panicStepInstruction");

  if (timerDisplay) {
    const mins = Math.floor(panicSecondsLeft / 60);
    const secs = panicSecondsLeft % 60;
    timerDisplay.textContent = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  if (instructionDisplay) {
    const currentStep = PANIC_STEPS.find(s => panicSecondsLeft >= s.at - 30) || PANIC_STEPS[PANIC_STEPS.length - 1];
    instructionDisplay.textContent = currentStep.text;
  }
}

let currentQuizStep = 1;
const quizAnswers = {
  vibe: null,
  palate: null,
  trigger: null
};

function openQuizModal() {
  sounds.playScaleTare();
  const modal = document.getElementById("quizModal");
  if (!modal) return;
  currentQuizStep = 1;
  renderQuizStep();
  modal.classList.add("active");
}

function hideQuizModal() {
  const modal = document.getElementById("quizModal");
  if (modal) modal.classList.remove("active");
}

function renderQuizStep() {
  const steps = document.querySelectorAll(".quiz-step");
  steps.forEach((el, index) => {
    el.classList.toggle("active", index + 1 === currentQuizStep);
  });

  const progressBar = document.getElementById("quizProgressFill");
  if (progressBar) {
    const pct = (currentQuizStep / 4) * 100;
    progressBar.style.width = `${pct}%`;
  }
}

function selectQuizOption(stepKey, value, el) {
  sounds.playGrinderCrunch();
  quizAnswers[stepKey] = value;

  const parent = el.closest(".quiz-options");
  if (parent) {
    parent.querySelectorAll(".quiz-option-card").forEach(c => c.classList.remove("selected"));
  }
  el.classList.add("selected");

  setTimeout(() => {
    currentQuizStep++;
    if (currentQuizStep === 4) {
      calculateArchetypeResult();
    }
    renderQuizStep();
  }, 250);
}

function calculateArchetypeResult() {
  sounds.playZenChime();

  let archetype = "Pour-Over Paladin";
  let trait = "Rhythmic, Patient, Bilateral Focus";
  let kitRecommendation = "Tactile Pour-Over Starter Ritual Kit";
  let description = "Your hands seek rhythmic kinetic movement. The 4-minute slow spiral pour and precision burr grinding replace the physical motor vacuum of smoking breaks.";

  if (quizAnswers.vibe === "restless") {
    archetype = "Aeropress Alchemist";
    trait = "Kinetic, Dynamic, High-Friction";
    kitRecommendation = "Aeropress Kinetic Ritual Bundle";
    description = "You hold tension directly in your hands. The deliberate physical pressure of the manual plunge discharges physical restlessness better than any fidget toy or cigarette.";
  } else if (quizAnswers.trigger === "evening") {
    archetype = "French Press Philosopher";
    trait = "Grounded, Sensory, Heavy-Bodied";
    kitRecommendation = "Artisanal French Press & Decaf Single Origin";
    description = "Your biggest vulnerability is the evening decompression drink. A rich, heavy-bodied single origin or Swiss-Water decaf gives your palate deep comfort without sleep disruption.";
  }

  appState.user.archetype = archetype;
  saveState();
  updateDashboardUI();

  const resultTitle = document.getElementById("archetypeResultTitle");
  const resultTrait = document.getElementById("archetypeResultTrait");
  const resultDesc = document.getElementById("archetypeResultDesc");
  const resultKitRec = document.getElementById("archetypeKitRec");

  if (resultTitle) resultTitle.textContent = archetype;
  if (resultTrait) resultTrait.textContent = trait;
  if (resultDesc) resultDesc.textContent = description;
  if (resultKitRec) resultKitRec.textContent = kitRecommendation;
}

function addToCart(kitName, price) {
  sounds.playScaleTare();
  appState.cart.push({ kitName, price });
  showToast("Added to Ritual Order", `${kitName} ($${price}) added to bag.`, "🛍️");
}

document.addEventListener("DOMContentLoaded", () => {
  updateDashboardUI();
  initJupiterVessel();
  initCarousel();

  document.getElementById("btnSoundGrind")?.addEventListener("click", () => sounds.playGrinderCrunch());
  document.getElementById("btnSoundScale")?.addEventListener("click", () => sounds.playScaleTare());
  document.getElementById("btnSoundBloom")?.addEventListener("click", () => sounds.playBloomSizzle());

  let touchStartX = 0;
  const track = document.getElementById("carouselTrack");
  track?.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track?.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) {
      nextCarouselCard();
    } else if (touchEndX - touchStartX > 50) {
      prevCarouselCard();
    }
  }, { passive: true });
});
