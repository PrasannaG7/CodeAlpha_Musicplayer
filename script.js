/*
  Music Player - Vanilla JS
  Features: play/pause, next, prev, shuffle, repeat, progress, seek, volume, mute,
  playlist, keyboard shortcuts, animations, responsive.
*/

const songs = [
  { title: "I wanna be yours", artist: "Artist 1", src: "songs/song1.mp3", cover: "images/cover1.jpeg" },
  { title: "Bad guy", artist: "Billie Eilish", src: "songs/song2.mp3", cover: "images/cover2.jpeg" },
  { title: "Can't help falling in love", artist: "Artist 3", src: "songs/song3.mp3", cover: "images/cover3.jpeg" },
  { title: "Shape of you", artist: "Ed sheeran", src: "songs/song4.mp3", cover: "images/cover4.jpeg" },
  { title: "I think they call this love", artist: "Artist 5", src: "songs/song5.mp3", cover: "images/cover5.jpeg" },
  { title: "vandinathai Summa", artist: "Ram charan , kajal , M .M Keeravani", src: "songs/song6.mp3", cover: "images/cover6.jpeg" },
  { title: "Raavana Mavanda", artist: "Thalapathy Vijay , Anirudh Ravichander", src: "songs/song7.mp3", cover: "images/cover7.jpeg" },
  { title: "Nangaai", artist: "Harris Jeyaraj", src: "songs/song8.mp3", cover: "images/cover8.jpeg" },
   { title: "Azhage Azhage", artist: "Harris Jeyaraj", src: "songs/song9.mp3", cover: "images/cover9.jpeg" },
  { title: "Mun Andhi", artist: "Suriya , Sruthi , Harris jeyaraj", src: "songs/song10.mp3", cover: "images/cover10.jpeg" }
];

// DOM
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const muteBtn = document.getElementById('mute');
const volumeSlider = document.getElementById('volume');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const coverImg = document.getElementById('cover');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const currentTimeEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const playlistEl = document.getElementById('playlist');
const eq = document.getElementById('eq');
const loadingEl = document.getElementById('loading');

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let isMuted = false;
let updateInterval = null;

// Initialize
function init(){
  buildPlaylist();
  loadSong(currentIndex);
  audio.volume = parseFloat(volumeSlider.value);
  attachEvents();
}

function buildPlaylist(){
  playlistEl.innerHTML = '';
  songs.forEach((s, i)=>{
    const li = document.createElement('li');
    li.dataset.index = i;
    li.innerHTML = `
      <img src="${s.cover}" alt="cover" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=44 height=44%3E%3Crect width=100%25 height=100%25 fill=%27%230b1216%27/%3E%3Ctext x=50%25 y=50%25 fill=%27%239aa6b2%27 font-size=10 text-anchor=middle dy=.3em%3ENo%20Cover%3C/text%3E%3C/svg%3E'" />
      <div class="song-meta">
        <div class="song-title">${s.title}</div>
        <div class="song-artist">${s.artist}</div>
      </div>
    `;
    li.addEventListener('click', ()=>{selectSong(i)});
    playlistEl.appendChild(li);
  });
  highlightPlaylist();
}

function loadSong(index){
  const s = songs[index];
  showLoading(true);
  audio.src = s.src;
  titleEl.textContent = s.title;
  artistEl.textContent = s.artist;
  coverImg.src = s.cover;
  highlightPlaylist();
  // wait for metadata to load
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
}

function onLoadedMetadata(){
  audio.removeEventListener('loadedmetadata', onLoadedMetadata);
  durationEl.textContent = formatTime(audio.duration || 0);
  showLoading(false);
  if(isPlaying) audio.play();
}

function play(){
  audio.play();
  isPlaying = true;
  playBtn.textContent = '⏸️';
  startEQ(true);
}
function pause(){
  audio.pause();
  isPlaying = false;
  playBtn.textContent = '▶️';
  startEQ(false);
}
function togglePlay(){
  if(isPlaying) pause(); else play();
}

function prev(){
  if(audio.currentTime>3){
    audio.currentTime = 0;
  } else {
    currentIndex = (currentIndex -1 + songs.length) % songs.length;
    loadSong(currentIndex);
    if(isPlaying) play();
  }
}
function next(){
  if(isShuffle){
    currentIndex = Math.floor(Math.random()*songs.length);
  } else {
    currentIndex = (currentIndex+1) % songs.length;
  }
  loadSong(currentIndex);
  if(isPlaying) play();
}

function selectSong(index){
  currentIndex = index;
  loadSong(index);
  play();
}

function highlightPlaylist(){
  Array.from(playlistEl.children).forEach(li=>{
    li.classList.toggle('active', parseInt(li.dataset.index,10)===currentIndex);
  });
}

function updateProgress(){
  const current = audio.currentTime || 0;
  const duration = audio.duration || 0;
  const percent = duration ? (current/duration)*100 : 0;
  progressBar.style.width = percent+'%';
  currentTimeEl.textContent = formatTime(current);
}

function seek(e){
  const rect = progressContainer.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const percent = Math.max(0, Math.min(1, x / rect.width));
  audio.currentTime = percent * (audio.duration || 0);
  updateProgress();
}

function formatTime(t){
  if(!t || isNaN(t)) return '0:00';
  const m = Math.floor(t/60);
  const s = Math.floor(t%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

function toggleShuffle(){
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? '#1db954' : '';
}
function toggleRepeat(){
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? '#1db954' : '';
}

function toggleMute(){
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.textContent = isMuted?'🔈':'🔊';
}

function changeVolume(v){
  audio.volume = v;
  if(audio.volume === 0) { audio.muted = true; isMuted = true; muteBtn.textContent='🔈'; }
  else { audio.muted = false; isMuted = false; muteBtn.textContent='🔊'; }
}

function showLoading(state){
  if(state) loadingEl.classList.add('loading'); else loadingEl.classList.remove('loading');
}

function startEQ(play){
  const bars = eq.querySelectorAll('span');
  if(play){
    Array.from(bars).forEach((b,i)=>{
      b.style.animation = `eqAnim ${0.25 + i*0.05}s infinite`;
    });
  } else {
    Array.from(bars).forEach(b=>{b.style.animation = 'none'; b.style.height='8px'});
  }
}

function attachEvents(){
  playBtn.addEventListener('click', togglePlay);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', toggleRepeat);
  muteBtn.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', (e)=>changeVolume(e.target.value));

  progressContainer.addEventListener('click', seek);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('ended', ()=>{
    if(isRepeat) { audio.currentTime = 0; play(); }
    else next();
  });

  // keyboard
  window.addEventListener('keydown',(e)=>{
    if(e.code==='Space'){ e.preventDefault(); togglePlay(); }
    if(e.code==='ArrowLeft'){ prev(); }
    if(e.code==='ArrowRight'){ next(); }
    if(e.code==='ArrowUp'){ e.preventDefault(); changeVolume(Math.min(1, audio.volume+0.05)); volumeSlider.value = audio.volume; }
    if(e.code==='ArrowDown'){ e.preventDefault(); changeVolume(Math.max(0, audio.volume-0.05)); volumeSlider.value = audio.volume; }
  });

  // search filter
  const search = document.getElementById('search');
  search.addEventListener('input', (e)=>{
    const q = e.target.value.toLowerCase();
    Array.from(playlistEl.children).forEach(li=>{
      const title = li.querySelector('.song-title').textContent.toLowerCase();
      const artist = li.querySelector('.song-artist').textContent.toLowerCase();
      li.style.display = (title.includes(q) || artist.includes(q)) ? '' : 'none';
    });
  });
}

// Click-to-seek support for touch and mouse
progressContainer.addEventListener('pointerdown', (e)=>{
  seek(e);
});

// CSS animation injection for EQ
const style = document.createElement('style');
style.textContent = `@keyframes eqAnim { 0% {height:6px} 50% {height:30px} 100% {height:6px} }`;
document.head.appendChild(style);

// start
init();

// Expose for debugging
window.__MusicPlayer = { songs };
