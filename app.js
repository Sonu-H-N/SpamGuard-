/* ═══════════════════════════════════════════════════════════
   SPAMGUARD — APPLICATION LOGIC
   Radar gauge · Particle BG · All views · History · Stats
═══════════════════════════════════════════════════════════ */

'use strict';

// ── APP STATE ─────────────────────────────────────────────────────────
const State = {
  history:          [],
  classifiedCount:  0,
  correctionCount:  0,
  lastResult:       null,
  currentLabel:     'spam',
  historyFilter:    'all',
  confusionMatrix:  { tp:0, fp:0, fn:0, tn:0 },
  trainLabel:       'spam',
};

// ── EXAMPLE EMAILS ────────────────────────────────────────────────────
const EXAMPLES = {
  spam: {
    subject: "URGENT: You've WON $5,000,000 — Claim NOW Before It Expires!!",
    sender:  "noreply@prize-winner-notification-xyz.com",
    body: `Dear Lucky Winner,

CONGRATULATIONS!!! Your email address has been SELECTED as the GRAND PRIZE WINNER of our 2025 International Email Lottery Sweepstakes!

You have won the sum of FIVE MILLION DOLLARS ($5,000,000.00 USD)!!!

To CLAIM YOUR PRIZE immediately, you must:
1. Click the link below RIGHT NOW
2. Send your FULL NAME, ADDRESS and BANK DETAILS
3. Pay a small processing fee of $99.99 (refundable)

⚠️ WARNING: This offer EXPIRES in 24 HOURS. If you do not act immediately, your prize will be forfeited and given to another winner.

FREE FREE FREE — Act NOW — URGENT URGENT URGENT

Click here to claim: http://prize-claim-now-xyz-scam.com/winner

Yours sincerely,
Dr. Robert Williams
International Lottery Commission
Tel: +1-800-PRIZE-WIN`
  },
  ham: {
    subject: "Re: Q4 Budget Review — Action Required by Friday",
    sender:  "sarah.johnson@company.com",
    body: `Hi,

Thanks for sending over the Q4 projections yesterday. I've had a chance to review them with the finance team and we have a few points to discuss.

The marketing spend looks slightly high compared to last quarter — could you walk us through the reasoning behind the increase? I want to make sure we have solid justification before presenting to the board next week.

Also, a couple of items to flag:
- The travel budget needs to be updated to reflect the new company policy (maximum £500 per trip)
- Please add the IT infrastructure costs that were missed from the initial draft

Could you update the spreadsheet and send me a revised version by Thursday afternoon? That gives us a day to review before the Friday deadline.

If you want to jump on a quick call tomorrow to run through it, I'm free between 10am and noon.

Thanks,
Sarah

Sarah Johnson
Head of Finance
Direct: +44 20 7946 0234`
  }
};

// ─────────────────────────────────────────────────────────────────────
//  PARTICLE BACKGROUND
// ─────────────────────────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      vx:   (Math.random() - 0.5) * 0.3,
      vy:   (Math.random() - 0.5) * 0.3,
      r:    Math.random() * 1.5 + 0.3,
      a:    Math.random(),
      color: Math.random() > 0.5 ? '99,102,241' : '139,92,246',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 120 }, makeParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - d/130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.a += 0.008;
      const alpha = 0.2 + 0.3 * Math.abs(Math.sin(p.a));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${alpha})`;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  draw();
})();

// ─────────────────────────────────────────────────────────────────────
//  RADAR GAUGE (signature visual element)
// ─────────────────────────────────────────────────────────────────────
const Gauge = (function() {
  const canvas   = document.getElementById('radar-gauge');
  const ctx      = canvas.getContext('2d');
  const cx       = 130, cy = 130, R = 110;
  let   _spamPct = 0;
  let   _target  = 0;
  let   _animId  = null;
  let   _sweepAngle = 0;

  function _lerp(a, b, t) { return a + (b - a) * t; }

  function drawFrame(spamPct) {
    ctx.clearRect(0, 0, 260, 260);

    const isSpam    = spamPct > 0.5;
    const fillColor = spamPct > 0.5
      ? `rgba(239,68,68,${0.15 + spamPct * 0.5})`
      : `rgba(34,197,94,${0.1 + (1-spamPct) * 0.4})`;
    const arcColor  = spamPct > 0.5
      ? `rgba(239,68,68,0.85)`
      : `rgba(34,197,94,0.85)`;
    const glowColor = spamPct > 0.5
      ? 'rgba(239,68,68,0.25)'
      : 'rgba(34,197,94,0.25)';

    // Outer glow ring
    const grad = ctx.createRadialGradient(cx, cy, R*0.6, cx, cy, R*1.1);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, glowColor);
    ctx.beginPath();
    ctx.arc(cx, cy, R*1.1, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Track ring (background)
    ctx.beginPath();
    ctx.arc(cx, cy, R, -Math.PI/2, Math.PI*2 - Math.PI/2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Grid rings
    for (let r = R*0.3; r < R; r += R*0.25) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Radial grid lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Filled arc (spam probability)
    const fillAngle = spamPct * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R - 7, -Math.PI/2, -Math.PI/2 + fillAngle);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Progress arc border
    if (spamPct > 0.01) {
      ctx.beginPath();
      ctx.arc(cx, cy, R, -Math.PI/2, -Math.PI/2 + fillAngle);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = arcColor;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineCap = 'butt';
    }

    // Sweep line (radar effect)
    _sweepAngle += 0.025;
    const sweepX = cx + R * 0.95 * Math.cos(_sweepAngle - Math.PI/2);
    const sweepY = cy + R * 0.95 * Math.sin(_sweepAngle - Math.PI/2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = `rgba(${isSpam ? '239,68,68' : '34,197,94'},0.4)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sweep dot
    ctx.beginPath();
    ctx.arc(sweepX, sweepY, 3, 0, Math.PI*2);
    ctx.fillStyle = isSpam ? '#ef4444' : '#22c55e';
    ctx.shadowBlur = 8;
    ctx.shadowColor = isSpam ? '#ef4444' : '#22c55e';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Tick marks around ring
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 - Math.PI/2;
      const inner = R + 4;
      const outer = R + (i % 5 === 0 ? 12 : 7);
      ctx.beginPath();
      ctx.moveTo(cx + inner * Math.cos(angle), cy + inner * Math.sin(angle));
      ctx.lineTo(cx + outer * Math.cos(angle), cy + outer * Math.sin(angle));
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Percentage labels
    const labels = ['25%','50%','75%','100%'];
    labels.forEach((lbl, i) => {
      const r = R * ((i+1) * 0.25);
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, cx + r, cy + 3);
    });
  }

  function animate() {
    _spamPct = _lerp(_spamPct, _target, 0.08);
    drawFrame(_spamPct);
    _animId = requestAnimationFrame(animate);
  }

  function set(spamProb) {
    _target = Math.max(0, Math.min(1, spamProb));
  }

  function start() {
    if (_animId) cancelAnimationFrame(_animId);
    animate();
  }

  return { set, start };
})();

Gauge.start();

// ─────────────────────────────────────────────────────────────────────
//  VIEW NAVIGATION
// ─────────────────────────────────────────────────────────────────────
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const view = document.getElementById(`view-${name}`);
  if (view) view.classList.add('active');
  const link = document.querySelector(`[data-view="${name}"]`);
  if (link) link.classList.add('active');
  document.getElementById('navLinks')?.classList.remove('open');

  if (name === 'stats')   refreshStats();
  if (name === 'history') renderHistory();
  if (name === 'train')   refreshTrainOverview();
  if (name === 'about')   updateAboutCounts();
}

function toggleMenu() {
  document.getElementById('navbar').querySelector('.nav-links').classList.toggle('open');
}

// ─────────────────────────────────────────────────────────────────────
//  CLASSIFY
// ─────────────────────────────────────────────────────────────────────
let _liveTimer = null;
function liveClassify() {
  updateCharCount();
  clearTimeout(_liveTimer);
  _liveTimer = setTimeout(classifyNow, 400);
}

function classifyNow() {
  const subject = document.getElementById('email-subject').value.trim();
  const sender  = document.getElementById('email-sender').value.trim();
  const body    = document.getElementById('email-body').value.trim();

  updateCharCount();

  if (!subject && !body) {
    resetGaugeUI();
    return;
  }

  // Combine all fields; weight subject 3× (it's very discriminative)
  const fullText = [subject, subject, subject, sender, body].join(' ');
  const result   = classifier.classify(fullText);
  if (!result) return;

  State.lastResult = { result, subject, sender, body, ts: Date.now() };
  State.classifiedCount++;
  document.getElementById('classified-count').textContent = State.classifiedCount;

  updateGaugeUI(result);
  updateProbBars(result);
  updateVerdictCard(result);
  updateTriggerWords(result);
  updateConfidenceBreakdown(result, subject, body);
  document.getElementById('result-actions').style.display = 'flex';
}

function updateCharCount() {
  const subject = document.getElementById('email-subject').value;
  const body    = document.getElementById('email-body').value;
  const all     = (subject + ' ' + body).trim();
  const words   = all ? all.split(/\s+/).filter(Boolean).length : 0;
  document.getElementById('word-count').textContent = `${words} words`;
  document.getElementById('char-count').textContent = `${all.length} chars`;
}

function updateGaugeUI(result) {
  Gauge.set(result.spamProb);

  const verdictEl = document.getElementById('gauge-verdict');
  const pctEl     = document.getElementById('gauge-pct');
  const labelEl   = document.getElementById('gauge-label');

  const isSpam    = result.verdict === 'spam';
  verdictEl.textContent   = isSpam ? 'SPAM' : 'HAM';
  verdictEl.style.color   = isSpam ? '#ef4444' : '#22c55e';
  pctEl.textContent       = `${Math.round(result.spamProb * 100)}%`;
  labelEl.textContent     = isSpam ? 'Spam Probability' : 'Safe Probability';
  pctEl.style.color       = isSpam ? '#fca5a5' : '#86efac';
}

function resetGaugeUI() {
  Gauge.set(0.5);
  document.getElementById('gauge-verdict').textContent  = '?';
  document.getElementById('gauge-verdict').style.color  = 'var(--text3)';
  document.getElementById('gauge-pct').textContent      = '—';
  document.getElementById('gauge-label').textContent    = 'Awaiting input';
  document.getElementById('spam-fill').style.width      = '0%';
  document.getElementById('ham-fill').style.width       = '0%';
  document.getElementById('spam-pct-val').textContent   = '0%';
  document.getElementById('ham-pct-val').textContent    = '0%';
  const vc = document.getElementById('verdict-card');
  vc.className = 'verdict-card';
  document.getElementById('verdict-icon').textContent  = '📭';
  document.getElementById('verdict-main').textContent  = 'Waiting for email…';
  document.getElementById('verdict-sub').textContent   = 'Enter subject and body to begin analysis';
  document.getElementById('triggers-grid').innerHTML   = '<p class="triggers-empty">Classify an email to see signal words</p>';
  document.getElementById('conf-rows').innerHTML       = '';
  document.getElementById('result-actions').style.display = 'none';
}

function updateProbBars(result) {
  const sp = Math.round(result.spamProb * 100);
  const hp = Math.round(result.hamProb  * 100);
  document.getElementById('spam-fill').style.width     = `${sp}%`;
  document.getElementById('ham-fill').style.width      = `${hp}%`;
  document.getElementById('spam-pct-val').textContent  = `${sp}%`;
  document.getElementById('ham-pct-val').textContent   = `${hp}%`;
}

function updateVerdictCard(result) {
  const vc       = document.getElementById('verdict-card');
  const isSpam   = result.verdict === 'spam';
  const sp       = Math.round(result.spamProb * 100);
  const hp       = Math.round(result.hamProb  * 100);
  vc.className   = `verdict-card ${isSpam ? 'is-spam' : 'is-ham'}`;

  let icon, main, sub;
  if (isSpam) {
    if (sp >= 95) {
      icon = '🚨'; main = 'Almost certainly SPAM';
      sub  = `${sp}% spam probability — extremely high confidence. Do not click any links.`;
    } else if (sp >= 80) {
      icon = '⚠️'; main = 'Very likely SPAM';
      sub  = `${sp}% spam probability — strong spam signals detected in this email.`;
    } else if (sp >= 65) {
      icon = '🔶'; main = 'Probably SPAM';
      sub  = `${sp}% spam probability — multiple spam indicators found. Treat with caution.`;
    } else {
      icon = '🟡'; main = 'Possibly SPAM';
      sub  = `${sp}% spam probability — marginal call. Review the signal words below.`;
    }
  } else {
    if (hp >= 95) {
      icon = '✅'; main = 'Almost certainly legitimate';
      sub  = `${hp}% ham probability — very high confidence this email is safe.`;
    } else if (hp >= 80) {
      icon = '🟢'; main = 'Likely legitimate';
      sub  = `${hp}% ham probability — strong legitimate signals detected.`;
    } else {
      icon = '🔵'; main = 'Probably legitimate';
      sub  = `${hp}% ham probability — leans legitimate but worth double-checking.`;
    }
  }

  document.getElementById('verdict-icon').textContent = icon;
  document.getElementById('verdict-main').textContent = main;
  document.getElementById('verdict-sub').textContent  = sub;

  // Update buttons
  const markWrong = document.getElementById('mark-wrong-btn');
  markWrong.textContent = isSpam
    ? '👎 Wrong — It\'s Ham'
    : '👎 Wrong — It\'s Spam';
}

function updateTriggerWords(result) {
  const grid = document.getElementById('triggers-grid');
  if (!result.wordScores || result.wordScores.length === 0) {
    grid.innerHTML = '<p class="triggers-empty">No significant signal words found</p>';
    return;
  }

  const top = result.wordScores.slice(0, 16);
  grid.innerHTML = top.map(ws => {
    const isSpamWord = ws.diff > 0;
    const strength   = Math.min(Math.abs(ws.diff), 5) / 5;
    const cls        = isSpamWord ? 'trigger-spam' : 'trigger-ham';
    const opacity    = 0.5 + strength * 0.5;
    const fontSize   = 0.68 + strength * 0.14;
    return `<span class="trigger-word ${cls}" 
              style="opacity:${opacity};font-size:${fontSize}rem"
              title="${isSpamWord ? 'Spam' : 'Ham'} indicator (score: ${ws.diff.toFixed(2)})"
            >${ws.word}</span>`;
  }).join('');
}

function updateConfidenceBreakdown(result, subject, body) {
  const rows = document.getElementById('conf-rows');
  const sp   = (result.spamProb * 100).toFixed(1);
  const hp   = (result.hamProb  * 100).toFixed(1);
  const wc   = result.tokens.length;
  const uniqueWords = new Set(result.tokens).size;

  const topSpamWord = result.wordScores.find(w => w.diff > 0);
  const topHamWord  = result.wordScores.find(w => w.diff < 0);

  const items = [
    ['Spam Probability',     `${sp}%`],
    ['Ham Probability',      `${hp}%`],
    ['Tokens Analysed',      `${wc}`],
    ['Unique Tokens',        `${uniqueWords}`],
    ['Log-Score (Spam)',     result.logSpam.toFixed(2)],
    ['Log-Score (Ham)',      result.logHam.toFixed(2)],
    ['Prior P(Spam)',        `${(result.priorSpam * 100).toFixed(1)}%`],
    ['Prior P(Ham)',         `${(result.priorHam  * 100).toFixed(1)}%`],
    ['Top Spam Word',        topSpamWord ? topSpamWord.word : '—'],
    ['Top Ham Word',         topHamWord  ? topHamWord.word  : '—'],
    ['Model Vocab Size',     classifier.vocabulary.size.toLocaleString()],
    ['Training Docs',        (classifier.spamDocCount + classifier.hamDocCount).toLocaleString()],
  ];

  rows.innerHTML = items.map(([k, v]) =>
    `<div class="conf-row"><span class="conf-key">${k}</span><span class="conf-val">${v}</span></div>`
  ).join('');
}

// ── EXAMPLES ─────────────────────────────────────────────────────────
function loadExample(type) {
  const ex = EXAMPLES[type];
  document.getElementById('email-subject').value = ex.subject;
  document.getElementById('email-sender').value  = ex.sender;
  document.getElementById('email-body').value    = ex.body;
  classifyNow();
  toast(`Loaded ${type.toUpperCase()} example`, 'info');
}

function clearInput() {
  document.getElementById('email-subject').value = '';
  document.getElementById('email-sender').value  = '';
  document.getElementById('email-body').value    = '';
  updateCharCount();
  resetGaugeUI();
}

// ── FEEDBACK ─────────────────────────────────────────────────────────
function markCorrect() {
  if (!State.lastResult) return;
  const { result, subject, body, sender } = State.lastResult;
  const label = result.verdict; // Current verdict is correct
  addToHistory(subject, sender, body, result, true);
  updateConfusion(result.verdict, result.verdict);
  toast(`✅ Marked as correct ${label.toUpperCase()}. Thanks!`, 'success');
  State.correctionCount++;
  document.getElementById('corrections-count').textContent = State.correctionCount;
}

function markWrong() {
  if (!State.lastResult) return;
  const { result, subject, sender, body } = State.lastResult;
  const correctLabel = result.verdict === 'spam' ? 'ham' : 'spam';

  // Teach the model
  const fullText = [subject, subject, subject, sender, body].join(' ');
  classifier.addCustom(fullText, correctLabel);

  updateConfusion(result.verdict, correctLabel);
  addToHistory(subject, sender, body, result, false, correctLabel);
  State.correctionCount++;
  document.getElementById('corrections-count').textContent = State.correctionCount;

  toast(`📚 Taught model: this is ${correctLabel.toUpperCase()}. Rerunning…`, 'info');
  setTimeout(classifyNow, 300);
  refreshTrainOverview();
}

function updateConfusion(predicted, actual) {
  const cm = State.confusionMatrix;
  if (predicted === 'spam' && actual === 'spam') cm.tp++;
  else if (predicted === 'spam' && actual === 'ham') cm.fp++;
  else if (predicted === 'ham'  && actual === 'spam') cm.fn++;
  else if (predicted === 'ham'  && actual === 'ham') cm.tn++;
}

function copyResult() {
  if (!State.lastResult) return;
  const { result, subject } = State.lastResult;
  const sp = Math.round(result.spamProb * 100);
  const text = `SpamGuard Classification Report
══════════════════════════════
Subject:  ${subject || '(none)'}
Verdict:  ${result.verdict.toUpperCase()}
Spam:     ${sp}%  |  Ham: ${100-sp}%
Tokens:   ${result.tokens.length}
Top signals: ${result.wordScores.slice(0,5).map(w=>w.word).join(', ')}
══════════════════════════════
Classified by SpamGuard — Naive Bayes Classifier`;
  navigator.clipboard.writeText(text).then(() => toast('📋 Report copied!', 'success'));
}

// ─────────────────────────────────────────────────────────────────────
//  HISTORY
// ─────────────────────────────────────────────────────────────────────
function addToHistory(subject, sender, body, result, correct, correctedTo = null) {
  State.history.unshift({
    id:          Date.now(),
    subject:     subject || '(no subject)',
    sender:      sender  || '(no sender)',
    preview:     (body || '').slice(0, 120),
    verdict:     result.verdict,
    spamProb:    result.spamProb,
    hamProb:     result.hamProb,
    correct,
    correctedTo,
    ts:          new Date().toLocaleTimeString(),
  });
  if (State.history.length > 200) State.history.pop();
}

function renderHistory(filter = State.historyFilter, search = '') {
  const list = document.getElementById('history-list');
  let items  = State.history;

  if (filter !== 'all') items = items.filter(h => h.verdict === filter);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(h =>
      h.subject.toLowerCase().includes(q) ||
      h.preview.toLowerCase().includes(q) ||
      h.sender.toLowerCase().includes(q));
  }

  if (items.length === 0) {
    list.innerHTML = `<div class="history-empty">
      <div class="history-empty-icon">📭</div>
      <p>${State.history.length === 0
          ? 'No emails classified yet. Go to <strong>Classify</strong> to begin.'
          : 'No results match your filter.'}</p>
    </div>`;
    return;
  }

  list.innerHTML = items.map(h => {
    const sp = Math.round(h.spamProb * 100);
    return `<div class="history-item ${h.verdict}-item" onclick="reloadHistoryItem(${h.id})">
      <span class="hi-verdict hi-${h.verdict}">${h.verdict.toUpperCase()}</span>
      <div class="hi-content">
        <div class="hi-subject">${escHtml(h.subject)}</div>
        <div class="hi-preview">${escHtml(h.preview)}</div>
      </div>
      <div class="hi-meta">
        <span class="hi-pct ${h.verdict}-pct">${sp}%</span>
        <span>${h.ts}</span>
        ${h.correctedTo ? `<br/><span style="color:var(--yellow);font-size:0.65rem">✎ corrected</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

function filterHistory(query) {
  renderHistory(State.historyFilter, query);
}

function filterHistoryType(type, btn) {
  State.historyFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory(type, document.getElementById('history-search').value);
}

function clearHistory() {
  if (!confirm('Clear all classification history?')) return;
  State.history = [];
  renderHistory();
  toast('History cleared', 'info');
}

function exportHistory() {
  if (State.history.length === 0) { toast('No history to export', 'error'); return; }
  const rows = [
    ['timestamp','verdict','spam_prob','ham_prob','subject','sender','preview','corrected_to'],
    ...State.history.map(h => [
      h.ts, h.verdict, h.spamProb.toFixed(4), h.hamProb.toFixed(4),
      `"${h.subject.replace(/"/g,'""')}"`,
      `"${h.sender.replace(/"/g,'""')}"`,
      `"${h.preview.slice(0,80).replace(/"/g,'""')}"`,
      h.correctedTo || '',
    ])
  ];
  const csv  = rows.map(r => r.join(',')).join('\n');
  downloadFile('spamguard_history.csv', csv, 'text/csv');
  toast('History exported as CSV', 'success');
}

function reloadHistoryItem(id) {
  const item = State.history.find(h => h.id === id);
  if (!item) return;
  document.getElementById('email-subject').value = item.subject;
  document.getElementById('email-sender').value  = item.sender;
  document.getElementById('email-body').value    = item.preview;
  showView('classify');
  classifyNow();
}

// ─────────────────────────────────────────────────────────────────────
//  TRAINING VIEW
// ─────────────────────────────────────────────────────────────────────
function setTrainLabel(label, btn) {
  State.trainLabel = label;
  document.querySelectorAll('.train-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  btn.classList.add(label === 'spam' ? 'spam-tab' : 'ham-tab');
  const other = document.querySelector('.train-tab:not(.active)');
  if (other) { other.classList.remove('spam-tab','ham-tab'); }

  const dot  = document.querySelector('.tli-dot');
  dot.className = `tli-dot ${label === 'spam' ? 'spam-dot' : 'ham-dot'}`;
  document.getElementById('tli-text').textContent = label.toUpperCase();
  document.getElementById('train-label-ind').style.color =
    label === 'spam' ? 'var(--red)' : 'var(--green)';
}

function addTrainingEmail() {
  const subject = document.getElementById('train-subject').value.trim();
  const body    = document.getElementById('train-body').value.trim();
  if (!subject && !body) { toast('Please enter some text to train on', 'error'); return; }

  const fullText = [subject, subject, body].join(' ');
  classifier.addCustom(fullText, State.trainLabel);

  document.getElementById('train-subject').value = '';
  document.getElementById('train-body').value    = '';
  refreshTrainOverview();
  toast(`✅ Added to ${State.trainLabel.toUpperCase()} training set`, 'success');
}

function bulkTrainFromCSV() {
  document.getElementById('csv-file-input').click();
}

function handleCSVUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').filter(Boolean);
    let added = 0, skipped = 0;
    for (const line of lines.slice(1)) { // skip header
      const parts = parseCSVLine(line);
      if (parts.length < 2) { skipped++; continue; }
      const label = parts[0].toLowerCase().trim();
      if (label !== 'spam' && label !== 'ham') { skipped++; continue; }
      const text = (parts.slice(1).join(' ')).replace(/^"|"$/g, '');
      classifier.addCustom(text, label);
      added++;
    }
    refreshTrainOverview();
    toast(`Imported ${added} emails${skipped ? `, skipped ${skipped}` : ''}`, 'success');
    input.value = '';
  };
  reader.readAsText(file);
}

function parseCSVLine(line) {
  const parts = []; let cur = ''; let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { parts.push(cur); cur = ''; }
    else { cur += ch; }
  }
  parts.push(cur);
  return parts;
}

function refreshTrainOverview() {
  const stats = classifier.stats();
  const custom = classifier.exportCustom();
  const customSpam = custom.filter(c => c.label === 'spam').length;
  const customHam  = custom.filter(c => c.label === 'ham').length;

  document.getElementById('train-overview-grid').innerHTML = `
    <div class="overview-card">
      <div class="ov-num" style="color:var(--red)">${stats.spamDocCount}</div>
      <div class="ov-label">Total Spam Docs</div>
    </div>
    <div class="overview-card">
      <div class="ov-num" style="color:var(--green)">${stats.hamDocCount}</div>
      <div class="ov-label">Total Ham Docs</div>
    </div>
    <div class="overview-card">
      <div class="ov-num" style="color:var(--indigo2)">${stats.vocabularySize.toLocaleString()}</div>
      <div class="ov-label">Vocabulary Size</div>
    </div>
    <div class="overview-card">
      <div class="ov-num" style="color:var(--yellow)">${custom.length}</div>
      <div class="ov-label">Custom Additions</div>
    </div>`;

  const recent = document.getElementById('recent-train-list');
  if (custom.length === 0) {
    recent.innerHTML = '<p class="empty-msg">No custom training data yet</p>';
    return;
  }
  recent.innerHTML = [...custom].reverse().slice(0, 10).map(c => `
    <div class="recent-item">
      <span class="ri-badge ${c.label === 'spam' ? 'ri-spam' : 'ri-ham'}">${c.label.toUpperCase()}</span>
      <span class="ri-text">${escHtml(c.text.slice(0, 80))}</span>
    </div>`).join('');
}

function retrain() {
  classifier.resetCustom();
  for (const c of classifier.exportCustom()) {
    classifier.addCustom(c.text, c.label);
  }
  refreshTrainOverview();
  toast('🔄 Model retrained from scratch', 'success');
}

function resetCustomTraining() {
  if (!confirm('Reset all custom training data? Built-in data is kept.')) return;
  classifier.resetCustom();
  refreshTrainOverview();
  toast('Custom training data reset', 'info');
}

function exportTrainingData() {
  const custom = classifier.exportCustom();
  if (custom.length === 0) { toast('No custom data to export', 'error'); return; }
  const rows = [['label','text'], ...custom.map(c => [c.label, `"${c.text.replace(/"/g,'""')}"`])];
  downloadFile('spamguard_training.csv', rows.map(r=>r.join(',')).join('\n'), 'text/csv');
  toast('Training data exported', 'success');
}

// ─────────────────────────────────────────────────────────────────────
//  STATS VIEW
// ─────────────────────────────────────────────────────────────────────
function refreshStats() {
  const stats = classifier.stats();
  document.getElementById('vocab-size').textContent      = stats.vocabularySize.toLocaleString();
  document.getElementById('spam-doc-count').textContent  = stats.spamDocCount;
  document.getElementById('ham-doc-count').textContent   = stats.hamDocCount;
  document.getElementById('classified-count').textContent= State.classifiedCount;
  document.getElementById('corrections-count').textContent = State.correctionCount;

  const total = State.confusionMatrix.tp + State.confusionMatrix.tn +
                State.confusionMatrix.fp + State.confusionMatrix.fn;
  const acc = total > 0
    ? ((State.confusionMatrix.tp + State.confusionMatrix.tn) / total * 100).toFixed(1) + '%'
    : '—';
  document.getElementById('accuracy-val').textContent = acc;

  // Word clouds
  renderWordCloud('spam-word-cloud', classifier.topWords('spam', 30), 'spam');
  renderWordCloud('ham-word-cloud',  classifier.topWords('ham',  30), 'ham');

  // Confusion matrix
  const cm = State.confusionMatrix;
  document.getElementById('confusion-matrix').innerHTML = `
    <div class="cm-header"></div>
    <div class="cm-header">Predicted SPAM</div>
    <div class="cm-header">Predicted HAM</div>
    <div class="cm-label">Actual SPAM</div>
    <div class="cm-cell cm-tp" title="True Positive">${cm.tp}<br/><small>TP</small></div>
    <div class="cm-cell cm-fn" title="False Negative">${cm.fn}<br/><small>FN</small></div>
    <div class="cm-label">Actual HAM</div>
    <div class="cm-cell cm-fp" title="False Positive">${cm.fp}<br/><small>FP</small></div>
    <div class="cm-cell cm-tn" title="True Negative">${cm.tn}<br/><small>TN</small></div>`;

  // Prior bars
  document.getElementById('prior-bars').innerHTML = `
    <div class="prior-row">
      <span class="prior-name" style="color:var(--red)">SPAM</span>
      <div class="prior-track"><div class="prior-fill-spam" style="width:${(stats.priorSpam*100).toFixed(1)}%"></div></div>
      <span class="prior-val">${(stats.priorSpam*100).toFixed(1)}%</span>
    </div>
    <div class="prior-row">
      <span class="prior-name" style="color:var(--green)">HAM</span>
      <div class="prior-track"><div class="prior-fill-ham" style="width:${(stats.priorHam*100).toFixed(1)}%"></div></div>
      <span class="prior-val">${(stats.priorHam*100).toFixed(1)}%</span>
    </div>`;

  // Discriminative words
  const disc = classifier.discriminativeWords(12);
  const discEl = document.getElementById('discriminative-list');
  const combined = [
    ...disc.topSpam.slice(0,6).map(d => ({ ...d, type:'spam' })),
    ...disc.topHam.slice(0,6).map(d  => ({ ...d, type:'ham'  })),
  ].sort((a,b) => {
    const ra = a.type==='spam' ? a.ratio : 1/a.ratio;
    const rb = b.type==='spam' ? b.ratio : 1/b.ratio;
    return rb - ra;
  });
  discEl.innerHTML = combined.map(d => `
    <div class="disc-item">
      <span class="disc-word">${d.word}</span>
      <span class="disc-ratio disc-${d.type}">${d.type.toUpperCase()} ×${Math.min(d.ratio,99).toFixed(1)}</span>
    </div>`).join('');
}

function renderWordCloud(containerId, words, type) {
  const el = document.getElementById(containerId);
  if (!words.length) { el.innerHTML = '<p class="triggers-empty">No data</p>'; return; }
  const maxCount = words[0].count;
  el.innerHTML = words.map(({ word, count }) => {
    const pct   = count / maxCount;
    const size  = 0.65 + pct * 0.8;
    const opacity = 0.45 + pct * 0.55;
    const color = type === 'spam'
      ? `rgba(239,68,68,${opacity})`
      : `rgba(34,197,94,${opacity})`;
    const bg = type === 'spam'
      ? `rgba(239,68,68,${opacity * 0.1})`
      : `rgba(34,197,94,${opacity * 0.08})`;
    const border = type === 'spam'
      ? `rgba(239,68,68,${opacity * 0.3})`
      : `rgba(34,197,94,${opacity * 0.25})`;
    return `<span class="wc-word" style="font-size:${size}rem;color:${color};
              background:${bg};border:1px solid ${border};
              padding:0.2rem 0.5rem;border-radius:100px;"
              title="${count} occurrences">${word}</span>`;
  }).join('');
}

// ─────────────────────────────────────────────────────────────────────
//  ABOUT
// ─────────────────────────────────────────────────────────────────────
function updateAboutCounts() {
  const total = classifier.spamDocCount + classifier.hamDocCount;
  const el = document.getElementById('about-training-count');
  if (el) el.textContent = `${total} labelled emails`;
}

// ─────────────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, 3200);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────
//  KEYBOARD SHORTCUTS
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    classifyNow();
    e.preventDefault();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    clearInput();
    e.preventDefault();
  }
});

// ─────────────────────────────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────────────────────────────
(function init() {
  refreshTrainOverview();
  refreshStats();
  updateAboutCounts();

  // Update model status badge
  const stats = classifier.stats();
  document.getElementById('nav-model-status').textContent =
    `${stats.totalDocs} docs · ${stats.vocabularySize.toLocaleString()} words`;

  console.log('[SpamGuard] App initialised. Shortcuts: Ctrl+Enter = Classify, Ctrl+K = Clear');
})();
