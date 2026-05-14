const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = -200, my = -200;
let rx = -200, ry = -200;
let hovering = false;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function animCursor() {
  cur.style.left = mx + 'px';
  cur.style.top = my + 'px';
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('button, a').forEach(el => {
  el.addEventListener('mouseenter', () => {
    hovering = true;
    cur.style.transform = 'translate(-50%,-50%) scale(2.2)';
    cur.style.background = 'var(--gold-lt)';
    ring.style.width = '44px';
    ring.style.height = '44px';
    ring.style.borderColor = 'rgba(201,168,76,0.8)';
  });
  el.addEventListener('mouseleave', () => {
    hovering = false;
    cur.style.transform  = 'translate(-50%,-50%) scale(1)';
    cur.style.background = '#fff';
    ring.style.width = '32px';
    ring.style.height = '32px';
    ring.style.borderColor = 'rgba(201,168,76,0.55)';
  });
});

document.addEventListener('mousedown', () => {
  cur.style.transform = 'translate(-50%,-50%) scale(0.4)';
});
document.addEventListener('mouseup', () => {
  cur.style.transform = hovering
    ? 'translate(-50%,-50%) scale(2.2)'
    : 'translate(-50%,-50%) scale(1)';
});

const pCvs = document.getElementById('particles-canvas');
const pCtx = pCvs.getContext('2d');
pCvs.width = window.innerWidth;
pCvs.height = window.innerHeight;
window.addEventListener('resize', () => {
  pCvs.width = window.innerWidth;
  pCvs.height = window.innerHeight;
});

let particles = [];

function spawnParticles(x, y) {
  const count = 10 + Math.floor(Math.random() * 8);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
    const speed = 1.2 + Math.random() * 3;
    const gold  = Math.random() < 0.6;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.025 + Math.random() * 0.025,
      r: 1 + Math.random() * 2.5,
      color: gold ? 'rgba(201,168,76,A)' : 'rgba(240,236,228,A)'
    });
  }
}

document.addEventListener('click', e => spawnParticles(e.clientX, e.clientY));

(function animParticles() {
  pCtx.clearRect(0, 0, pCvs.width, pCvs.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= p.decay;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    pCtx.fillStyle = p.color.replace('A', p.life.toFixed(2));
    pCtx.beginPath();
    pCtx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
    pCtx.fill();
  }
  requestAnimationFrame(animParticles);
})();

const frameWrap = document.getElementById('frame-wrap');
document.addEventListener('mousemove', e => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  frameWrap.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg)`;
});


const bgCvs = document.getElementById('dots-canvas');
const bgCtx = bgCvs.getContext('2d');

function resizeBg() {
  bgCvs.width  = window.innerWidth;
  bgCvs.height = window.innerHeight;
}
window.addEventListener('resize', resizeBg);
resizeBg();

function makeDot(fromBottom) {
  const rand = Math.random();
  let color;
  if (rand < 0.10) color = `rgba(201,168,76,${0.4 + Math.random() * 0.4})`;
  else if (rand < 0.15) color = `rgba(160,220,255,${0.3 + Math.random() * 0.3})`;
  else color = `rgba(240,236,228,${0.5 + Math.random() * 0.45})`;
  return {
    x: Math.random() * bgCvs.width,
    y: fromBottom ? bgCvs.height + Math.random() * 60 : Math.random() * bgCvs.height,
    r: 0.3 + Math.random() * 1.2,
    speed: 0.25 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.25,
    twinklePhase: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.02 + Math.random() * 0.04,
    color
  };
}

let dots = Array.from({ length: 140 }, () => makeDot(false));
let shooters = [];

setInterval(() => {
  shooters.push({
    x: Math.random() * bgCvs.width * 1.2,
    y: -10,
    vx: -2.5 - Math.random() * 3,
    vy: 1.5  + Math.random() * 2,
    life: 1,
    decay: 0.012 + Math.random() * 0.012,
    len: 60    + Math.random() * 80
  });
}, 4200);

(function animDots() {
  const W = bgCvs.width, H = bgCvs.height;
  bgCtx.fillStyle = 'rgba(5,4,10,1)';
  bgCtx.fillRect(0, 0, W, H);

  const nebulae = [
    { x: W * 0.2, y: H * 0.3, r: W * 0.28, c: 'rgba(30,15,60,0.35)' },
    { x: W * 0.8, y: H * 0.7, r: W * 0.22, c: 'rgba(10,30,50,0.3)'  },
    { x: W * 0.5, y: H * 0.5, r: W * 0.35, c: 'rgba(20,10,40,0.25)' }
  ];
  for (const n of nebulae) {
    const g = bgCtx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    g.addColorStop(0, n.c);
    g.addColorStop(1, 'transparent');
    bgCtx.fillStyle = g;
    bgCtx.fillRect(0, 0, W, H);
  }

  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.life -= s.decay;
    if (s.life <= 0) { shooters.splice(i, 1); continue; }
    const mag = Math.hypot(s.vx, s.vy);
    const dx = s.vx / mag;
    const dy = s.vy / mag;
    const grad = bgCtx.createLinearGradient(s.x, s.y, s.x - dx * s.len, s.y - dy * s.len);
    grad.addColorStop(0, `rgba(255,248,230,${s.life * 0.9})`);
    grad.addColorStop(1, 'transparent');
    bgCtx.strokeStyle = grad;
    bgCtx.lineWidth   = 1.4;
    bgCtx.beginPath();
    bgCtx.moveTo(s.x, s.y);
    bgCtx.lineTo(s.x - dx * s.len, s.y - dy * s.len);
    bgCtx.stroke();
    s.x += s.vx;
    s.y += s.vy;
  }

  for (const d of dots) {
    d.y -= d.speed;
    d.x += d.drift;
    d.twinklePhase += d.twinkleSpeed;
    if (d.y + d.r < 0)    Object.assign(d, makeDot(true));
    if (d.x < -d.r)       d.x = W + d.r;
    if (d.x > W + d.r)    d.x = -d.r;
    const twinkle = 0.75 + 0.25 * Math.sin(d.twinklePhase);
    bgCtx.globalAlpha = twinkle;
    bgCtx.fillStyle   = d.color;
    bgCtx.beginPath();
    bgCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    bgCtx.fill();
  }
  bgCtx.globalAlpha = 1;
  requestAnimationFrame(animDots);
})();


const PLAYLIST = ['.songs/Delroy1.ogg', '.songs/Delroy2.ogg'];

const audioA = document.getElementById('bg-music-a');
const audioB = document.getElementById('bg-music-b');
const btnPrev = document.getElementById('btn-prev');
const btnMute = document.getElementById('btn-mute');
const btnNext = document.getElementById('btn-next');
const songLabel = document.getElementById('song-name');
const trackToast = document.getElementById('track-toast');

let trackIdx = 0, muted = false;
let activeAudio   = audioA;
let inactiveAudio = audioB;
const TARGET_VOL = 0.55;
const FADE_DUR   = 1400;
activeAudio.volume   = TARGET_VOL;
inactiveAudio.volume = 0;

function fileName(p) {
  return p.split('/').pop().replace(/\.[^.]+$/, '');
}

function showToast(name) {
  trackToast.textContent = '♪  ' + name.toUpperCase();
  trackToast.classList.add('show');
  setTimeout(() => trackToast.classList.remove('show'), 2600);
}

function crossfadeTo(idx, play) {
  if (!PLAYLIST.length) return;
  trackIdx = ((idx % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
  const name = fileName(PLAYLIST[trackIdx]);

  songLabel.style.opacity = '0';
  setTimeout(() => { songLabel.textContent = name; songLabel.style.opacity = '1'; }, 300);
  showToast(name);

  inactiveAudio.src    = PLAYLIST[trackIdx];
  inactiveAudio.muted  = muted;
  inactiveAudio.load();

  if (play) {
    inactiveAudio.play().catch(() => {});
    let start = null;
    const fromVol = activeAudio.volume;
    function doFade(ts) {
      if (!start) start = ts;
      const t     = Math.min((ts - start) / FADE_DUR, 1);
      const ease  = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      activeAudio.volume   = fromVol * (1 - ease);
      inactiveAudio.volume = TARGET_VOL * ease;
      if (t < 1) {
        requestAnimationFrame(doFade);
      } else {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio.volume = 0;
        const tmp = activeAudio;
        activeAudio = inactiveAudio;
        inactiveAudio = tmp;
      }
    }
    requestAnimationFrame(doFade);
  }
}

function onTrackEnded() { crossfadeTo(trackIdx + 1, true); }
audioA.addEventListener('ended', onTrackEnded);
audioB.addEventListener('ended', onTrackEnded);

btnPrev.addEventListener('click', e => { e.stopPropagation(); crossfadeTo(trackIdx - 1, true); });
btnNext.addEventListener('click', e => { e.stopPropagation(); crossfadeTo(trackIdx + 1, true); });
btnMute.addEventListener('click', e => {
  e.stopPropagation();
  muted = !muted;
  activeAudio.muted   = muted;
  inactiveAudio.muted = muted;
  btnMute.textContent = muted ? '✕' : '♪';
  btnMute.classList.toggle('muted', muted);
});

function startPlayback() {
  if (PLAYLIST.length) {
    songLabel.textContent = fileName(PLAYLIST[0]);
    activeAudio.src = PLAYLIST[0];
    activeAudio.load();
    activeAudio.play().catch(() => {});
  }
}

function onFirstInteraction() {
  activeAudio.play().catch(() => {});
  document.removeEventListener('click',     onFirstInteraction);
  document.removeEventListener('keydown',   onFirstInteraction);
  document.removeEventListener('touchstart',onFirstInteraction);
}

if (PLAYLIST.length) {
  songLabel.textContent = fileName(PLAYLIST[0]);
  activeAudio.src = PLAYLIST[0];
  activeAudio.load();
  activeAudio.play().catch(() => {
    document.addEventListener('click',      onFirstInteraction);
    document.addEventListener('keydown',    onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
  });
}

const IMAGE_PATHS = [
  '.backgrounds/Delroy1.png',
  '.backgrounds/Delroy2.png',
  '.backgrounds/Delroy3.png',
  '.backgrounds/Delroy4.png',
  '.backgrounds/Delroy5.png'
];
const ROTATE_MS = 15000;
const FADE_MS   = 1200;
const FRAME_PAD = 10;

const imgCvs = document.getElementById('img-canvas');
const imgCtx = imgCvs.getContext('2d');
const imgs = IMAGE_PATHS.map(src => {
  const img = new Image();
  img.src = src;
  return img;
});

let currentIdx = 0, nextIdx = null, fadeStart = null;

function sizeFrame(img) {
  if (!img || !img.naturalWidth) return;
  const titleEl = document.querySelector('.title');
  const bioEl = document.querySelector('.bio');
  const ornEl = document.querySelector('.ornament');
  const titleH = (titleEl ? titleEl.offsetHeight + 16 : 60) + (ornEl ? ornEl.offsetHeight + 8 : 0);
  const bioH = bioEl ? bioEl.offsetHeight + 20 : 80;
  const maxW = window.innerWidth  - 56;
  const maxH = window.innerHeight - titleH - bioH - 80;
  const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
  const dispW = Math.round(img.naturalWidth  * scale);
  const dispH = Math.round(img.naturalHeight * scale);
  imgCvs.width = dispW;
  imgCvs.height = dispH;
  imgCvs.style.width = dispW + 'px';
  imgCvs.style.height = dispH + 'px';
  frameWrap.style.width = (dispW + FRAME_PAD * 2) + 'px';
  frameWrap.style.height = (dispH + FRAME_PAD * 2) + 'px';
}

(function drawImages(now) {
  const W = imgCvs.width, H = imgCvs.height;
  imgCtx.clearRect(0, 0, W, H);
  let curAlpha = 1, nxtAlpha = 0;

  if (fadeStart !== null) {
    const t = Math.min((now - fadeStart) / FADE_MS, 1);
    const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    curAlpha = 1 - eased;
    nxtAlpha = eased;
    if (t >= 1) {
      currentIdx = nextIdx;
      nextIdx = null;
      fadeStart = null;
      curAlpha = 1;
      nxtAlpha = 0;
      sizeFrame(imgs[currentIdx]);
    }
  }

  if (nextIdx !== null && imgs[nextIdx].complete) {
    imgCtx.globalAlpha = nxtAlpha;
    imgCtx.drawImage(imgs[nextIdx], 0, 0, W, H);
  }
  if (imgs[currentIdx].complete) {
    imgCtx.globalAlpha = curAlpha;
    imgCtx.drawImage(imgs[currentIdx], 0, 0, W, H);
  }
  imgCtx.globalAlpha = 1;
  requestAnimationFrame(drawImages);
})();

setInterval(() => {
  nextIdx = (currentIdx + 1) % imgs.length;
  fadeStart = performance.now();
}, ROTATE_MS);

function init() {
  const f = imgs[0];
  if (f.complete && f.naturalWidth) {
    sizeFrame(f);
  } else {
    f.onload = () => sizeFrame(f);
  }
}

window.addEventListener('resize', () => sizeFrame(imgs[currentIdx]));
window.addEventListener('load', init);
setTimeout(init, 100);