const form = document.querySelector('#rsvp-form');
const toast = document.querySelector('#toast');
const soundButton = document.querySelector('#sound-button');
const cardModal = document.querySelector('#guest-card-modal');
const cardName = document.querySelector('#card-name');
const cardCode = document.querySelector('#card-code');
const pages = [...document.querySelectorAll('[data-page-content]')];
const envelope = document.querySelector('#envelope-toggle');
let musicContext;
let musicTimer;

function startCelebrationMusic() {
  if (musicTimer) return;
  musicContext = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 1046.5];
  let note = 0;
  const playNote = () => {
    const oscillator = musicContext.createOscillator();
    const gain = musicContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = notes[note++ % notes.length];
    gain.gain.setValueAtTime(.0001, musicContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.055, musicContext.currentTime + .06);
    gain.gain.exponentialRampToValueAtTime(.0001, musicContext.currentTime + .62);
    oscillator.connect(gain).connect(musicContext.destination); oscillator.start(); oscillator.stop(musicContext.currentTime + .65);
  };
  playNote(); musicTimer = setInterval(playNote, 720);
  soundButton.classList.add('playing'); soundButton.querySelector('i').textContent = 'Music on';
}

function stopCelebrationMusic() {
  clearInterval(musicTimer); musicTimer = null;
  if (musicContext) musicContext.close(); musicContext = null;
  soundButton.classList.remove('playing'); soundButton.querySelector('i').textContent = 'Music off';
}

envelope.addEventListener('click', () => {
  const opened = envelope.classList.toggle('open');
  envelope.setAttribute('aria-expanded', String(opened));
  document.querySelector('#envelope-reveal').classList.toggle('visible', opened);
  if (opened) startCelebrationMusic();
});

function updateCountdown() {
  const target = new Date('2026-11-21T11:00:00+03:00').getTime();
  const remaining = Math.max(0, target - Date.now());
  const parts = [Math.floor(remaining / 86400000), Math.floor(remaining / 3600000) % 24, Math.floor(remaining / 60000) % 60, Math.floor(remaining / 1000) % 60];
  document.querySelectorAll('#countdown-timer b').forEach((item, index) => { item.textContent = String(parts[index]).padStart(2, '0'); });
}
updateCountdown();
setInterval(updateCountdown, 1000);

function showPage(number) {
  pages.forEach(page => page.classList.toggle('active', page.dataset.pageContent === String(number)));
  document.querySelectorAll('[data-page]').forEach(button => button.classList.toggle('active', button.dataset.page === String(number)));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-page], .page-next, .page-prev').forEach(button => button.addEventListener('click', () => {
  showPage(button.dataset.page || button.dataset.next || button.dataset.prev);
}));

function addImage(inputId, imageId, wrapperSelector) {
  const input = document.querySelector(inputId);
  const image = document.querySelector(imageId);
  input.addEventListener('change', () => {
    const [file] = input.files;
    if (!file) return;
    image.src = URL.createObjectURL(file);
    input.closest(wrapperSelector).classList.add('has-photo');
  });
}
addImage('#cover-upload', '#cover-preview', '.cover-image');

function personalizePass() {
  const params = new URLSearchParams(window.location.search);
  let savedGuest;
  try { savedGuest = JSON.parse(localStorage.getItem('simon-esther-guests') || '[]').at(-1); } catch (_) { savedGuest = null; }
  const name = params.get('guest') || savedGuest?.name;
  const guests = params.get('guests') || savedGuest?.guests;
  if (name) document.querySelector('#pass-guest-name').textContent = name;
  if (guests) document.querySelector('#pass-guests').textContent = guests;
}
personalizePass();

document.querySelector('#gallery-input').addEventListener('change', event => {
  const files = [...event.target.files].filter(file => file.type.startsWith('image/'));
  if (!files.length) return;
  const grid = document.querySelector('#gallery-grid');
  grid.innerHTML = '';
  files.forEach(file => {
    const image = document.createElement('img');
    image.src = URL.createObjectURL(file);
    image.alt = 'Simon and Esther gallery photo';
    grid.append(image);
  });
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const response = Object.fromEntries(new FormData(form));
  const guest = {
    name: response.name.trim(),
    email: response.email.trim(),
    phone: response.phone.trim(),
    guests: response.guests,
    attendance: response.attendance,
    dietary: response.dietary.trim(),
    message: response.message.trim(),
    contribution: response.contribution.trim(),
    code: `SE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    respondedAt: new Date().toISOString()
  };
  const guests = JSON.parse(localStorage.getItem('simon-esther-guests') || '[]');
  guests.push(guest);
  localStorage.setItem('simon-esther-guests', JSON.stringify(guests));
  cardName.textContent = guest.name;
  cardCode.textContent = guest.code;
  cardModal.classList.add('open');
  cardModal.setAttribute('aria-hidden', 'false');
  try {
    await fetch('/api/notify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guest)
    });
  } catch (_) {
    // The guest card still works when the notification server is not running.
  }
  form.reset();
});

soundButton.addEventListener('click', () => {
  if (musicTimer) { stopCelebrationMusic(); showToast('Music paused.'); }
  else { startCelebrationMusic(); showToast('Celebration music is playing.'); }
});

document.querySelector('#close-card').addEventListener('click', () => {
  cardModal.classList.remove('open');
  cardModal.setAttribute('aria-hidden', 'true');
});
document.querySelector('#download-card').addEventListener('click', () => window.print());
