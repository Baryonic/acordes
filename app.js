// Global variables
let songs = [];
let currentSongId = null;

// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const menuContainer = document.getElementById('menuContainer');
const songList = document.getElementById('songList');
const searchInput = document.getElementById('searchInput');
const songContainer = document.getElementById('songContainer');
const mainContent = document.getElementById('mainContent');

// Auto-scroll variables
let autoscrollInterval = null;
let isAutoscrolling = false;

// Initialize the app
async function init() {
    await loadSongs();
    renderSongList();
    setupEventListeners();
    setupAutoscroll();
}

// Load songs from JSON
async function loadSongs() {
    try {
        const response = await fetch('songs.json');
        songs = await response.json();
        console.log('Songs loaded:', songs.length);
    } catch (error) {
        console.error('Error loading songs:', error);
        songContainer.innerHTML = '<p>Error loading songs. Please try again later.</p>';
    }
}

// Render the song list in the menu
function renderSongList(filteredSongs = null) {
    const songsToRender = filteredSongs || songs;
    songList.innerHTML = '';
    
    songsToRender.forEach(song => {
        const li = document.createElement('li');
        li.className = 'song-item';
        li.textContent = `${song.title} - ${song.artist}`;
        li.dataset.songId = song.id;
        li.addEventListener('click', () => loadSong(song.id));
        songList.appendChild(li);
    });
}

// Load and display a song
function loadSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;
    
    currentSongId = songId;
    
    // Hide welcome message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
    
    // Build song HTML
    let songHTML = `
        <div class="song-header">
            <h2 class="song-title">${song.title}</h2>
            <p class="song-artist">${song.artist}</p>
        </div>
    `;
    
    // Add lyrics sections
    song.lyrics.forEach(section => {
        songHTML += `<div class="section">`;
        songHTML += `<div class="section-type">${section.type}</div>`;
        
        section.lines.forEach(line => {
            songHTML += `
                <div class="lyric-line">
                    <span class="chord">${line.chord}</span>
                    <span class="lyric">${line.lyric}</span>
                </div>
            `;
        });
        
        songHTML += `</div>`;
    });
    
    // Display the song
    songContainer.innerHTML = songHTML;
    songContainer.classList.add('active');
    
    // Close the menu after selecting a song
    menuContainer.classList.remove('open');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup event listeners
function setupEventListeners() {
    // Menu toggle
    menuToggle.addEventListener('click', () => {
        menuContainer.classList.toggle('open');
    });
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            renderSongList();
            return;
        }
        
        const filteredSongs = songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm)
        );
        
        renderSongList(filteredSongs);
        
        // Auto-open menu when searching
        if (filteredSongs.length > 0 && !menuContainer.classList.contains('open')) {
            menuContainer.classList.add('open');
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            // Don't close if clicking inside navbar
            return;
        }
        
        // Close menu if clicking on navbar but not on menu items
        if (e.target.closest('.menu-toggle') || e.target.closest('.song-item')) {
            return;
        }
    });
}

// Setup auto-scroll controls
function setupAutoscroll() {
    const autoscrollBtn = document.getElementById('autoscrollBtn');
    const scrollSpeedSlider = document.getElementById('scrollSpeed');
    if (!autoscrollBtn || !scrollSpeedSlider) return;

    autoscrollBtn.addEventListener('click', () => {
        if (isAutoscrolling) {
            stopAutoscroll();
        } else {
            startAutoscroll();
        }
    });

    scrollSpeedSlider.addEventListener('input', () => {
        if (isAutoscrolling) {
            stopAutoscroll();
            startAutoscroll();
        }
    });
}

function startAutoscroll() {
    const autoscrollBtn = document.getElementById('autoscrollBtn');
    const scrollSpeedSlider = document.getElementById('scrollSpeed');
    if (!autoscrollBtn || !scrollSpeedSlider) return;
    isAutoscrolling = true;
    autoscrollBtn.textContent = 'Stop Scroll';
    const speed = 21 - parseInt(scrollSpeedSlider.value, 40); // 1 (fastest) to 10 (slowest)
    const step = 2 + (speed * 2); // px per interval
    const interval = 20 + (speed * 4); // ms per interval
    autoscrollInterval = setInterval(() => {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        if (window.scrollY >= maxScroll - 2) {
            stopAutoscroll();
            return;
        }
        window.scrollBy(0, step);
    }, interval);
}

function stopAutoscroll() {
    const autoscrollBtn = document.getElementById('autoscrollBtn');
    if (autoscrollInterval) {
        clearInterval(autoscrollInterval);
        autoscrollInterval = null;
    }
    isAutoscrolling = false;
    if (autoscrollBtn) autoscrollBtn.textContent = 'Auto Scroll';
}

// Stop autoscroll if user scrolls manually or resizes
window.addEventListener('wheel', stopAutoscroll, { passive: true });
window.addEventListener('touchmove', stopAutoscroll, { passive: true });
window.addEventListener('resize', stopAutoscroll);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
