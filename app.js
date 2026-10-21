/**
 * THE DAILY ROAST (TDR) - Core Application Logic
 * Behavioral Psychology, Habit Replacement & Gamification Engine
 * Inspired by the six2eight editorial illustration aesthetic
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
    activeBagName: "Ethiopia Yirgacheffe (Washed)",
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
// 3D ILLUSTRATED CAROUSEL CONTROLLER (Matching the reference aesthetic)
// ==========================================================================
let currentCardIndex = 1; // Default to card 2 (The girl walking with giant cup)
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

  // Calculate horizontal offset so current card is dead center
  if (track) {
    // Card width (460) + gap (32) = 492
    const cardWidthWithGap = window.innerWidth <= 768 ? 340 : 492;
    // We center the active card relative to index 1 (center)
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

  // Tactile burr grinder crunch
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

  // Precision Digital Scale Tare Beep
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

  // Coffee Bloom Sizzle / Pour
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

  // Calming Zen Bell for Panic Brew
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

  // Profile
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

  // Caffeine Meter
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

  // Bean Replenishment Status Bar
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

  // Render Badges
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

// --- Logging a Cup ---
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

// --- Just-In-Time Refill Modal Simulation ---
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

// --- Panic Brew Flow (Emergency Craving Intervention) ---
let panicInterval = null;
let panicSecondsLeft = 180; // 3 minutes

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

// --- Gamified Mood & Taste Scan ---
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

// --- Cart Simulation ---
function addToCart(kitName, price) {
  sounds.playScaleTare();
  appState.cart.push({ kitName, price });
  showToast("Added to Ritual Order", `${kitName} ($${price}) added to bag.`, "🛍️");
}

// --- Initialize Event Listeners on DOM Load ---
document.addEventListener("DOMContentLoaded", () => {
  updateDashboardUI();
  initCarousel();

  // Soundboard Buttons
  document.getElementById("btnSoundGrind")?.addEventListener("click", () => sounds.playGrinderCrunch());
  document.getElementById("btnSoundScale")?.addEventListener("click", () => sounds.playScaleTare());
  document.getElementById("btnSoundBloom")?.addEventListener("click", () => sounds.playBloomSizzle());

  // Carousel touch / swipe listener
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
