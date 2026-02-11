/* ═══════════════════════════════════════════════════
   FMR Music — App Logic
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ──── State ────
    const state = {
        isPlaying: false,
        progress: 35,
        volume: 70,
        currentTrack: {
            name: 'Neon Dreams',
            artist: 'DJ Pulse',
            duration: '3:42',
            gradient: 'linear-gradient(135deg, #e94560, #6c5ce7)'
        },
        liked: false,
        shuffle: false,
        repeat: false
    };

    // ──── DOM Elements ────
    const pages = document.querySelectorAll('.page');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item[data-page]');
    const seeAllLinks = document.querySelectorAll('.see-all-link[data-page]');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playerProgress = document.getElementById('playerProgress');
    const progressWrapper = document.getElementById('progressWrapper');
    const playerTrackName = document.getElementById('playerTrackName');
    const playerArtistName = document.getElementById('playerArtistName');
    const playerCover = document.getElementById('playerCover');
    const playerLikeBtn = document.getElementById('playerLikeBtn');
    const playerTime = document.getElementById('playerTime');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeLevel = document.getElementById('volumeLevel');
    const volumeSlider = document.getElementById('volumeSlider');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');

    // ──── Track Database (mock) ────
    const tracks = [
        { id: 1, name: 'Мой микс #1', artist: 'FMR Mix', duration: '∞', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
        { id: 2, name: 'Любимые треки', artist: 'Коллекция', duration: '∞', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
        { id: 3, name: 'Чилл вечер', artist: 'FMR Mix', duration: '∞', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
        { id: 4, name: 'Топ за неделю', artist: 'FMR Charts', duration: '∞', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
        { id: 5, name: 'Для работы', artist: 'FMR Focus', duration: '∞', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
        { id: 6, name: 'Ночной драйв', artist: 'FMR Vibes', duration: '∞', gradient: 'linear-gradient(135deg, #13547a, #80d0c7)' },
        { id: 7, name: 'Neon Dreams', artist: 'DJ Pulse', duration: '3:42', gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' },
        { id: 8, name: 'Midnight City', artist: 'Luna Wave', duration: '4:15', gradient: 'linear-gradient(135deg, #a29bfe, #6c5ce7)' },
        { id: 9, name: 'Розовый закат', artist: 'АИГЕЛ', duration: '3:58', gradient: 'linear-gradient(135deg, #fd79a8, #e84393)' },
        { id: 10, name: 'Ocean Waves', artist: 'Synthex', duration: '5:03', gradient: 'linear-gradient(135deg, #00cec9, #0984e3)' },
        { id: 11, name: 'Golden Hour', artist: 'SunBeam', duration: '3:21', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)' },
        { id: 12, name: 'Forest Rain', artist: 'NatureSound', duration: '4:47', gradient: 'linear-gradient(135deg, #55efc4, #00b894)' },
    ];

    // ──── SPA Navigation ────
    function showPage(pageName) {
        pages.forEach(p => p.classList.remove('active'));
        const target = document.querySelector(`.page[data-page="${pageName}"]`);
        if (target) {
            target.classList.add('active');
            // Animate cards on page enter
            const cards = target.querySelectorAll('.card-3d');
            cards.forEach((card, i) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 60);
            });
        }

        // Update sidebar active state
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
        // Update mobile nav active state
        mobileNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // Mobile bottom nav
    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(item.dataset.page);
        });
    });

    // "See all" links
    seeAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
        });
    });

    // ──── Player Controls ────
    function togglePlay() {
        state.isPlaying = !state.isPlaying;
        if (state.isPlaying) {
            playIcon.className = 'bi bi-pause-fill';
            startProgress();
        } else {
            playIcon.className = 'bi bi-play-fill';
            stopProgress();
        }
    }

    let progressInterval;
    function startProgress() {
        stopProgress();
        progressInterval = setInterval(() => {
            state.progress += 0.15;
            if (state.progress >= 100) {
                state.progress = 0;
                if (!state.repeat) nextTrack();
            }
            playerProgress.style.width = state.progress + '%';
            updateTimeDisplay();
        }, 100);
    }

    function stopProgress() {
        if (progressInterval) clearInterval(progressInterval);
    }

    function updateTimeDisplay() {
        if (!playerTime) return;
        const parts = state.currentTrack.duration.split(':');
        if (parts.length !== 2) { playerTime.textContent = `0:00 / ${state.currentTrack.duration}`; return; }
        const totalSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        const currentSec = Math.floor(totalSec * state.progress / 100);
        const curMin = Math.floor(currentSec / 60);
        const curSec = (currentSec % 60).toString().padStart(2, '0');
        playerTime.textContent = `${curMin}:${curSec} / ${state.currentTrack.duration}`;
    }

    function loadTrack(trackId) {
        const track = tracks.find(t => t.id === parseInt(trackId));
        if (!track) return;
        state.currentTrack = track;
        state.progress = 0;
        playerTrackName.textContent = track.name;
        playerArtistName.textContent = track.artist;
        playerCover.style.background = track.gradient;
        playerProgress.style.width = '0%';
        state.isPlaying = true;
        playIcon.className = 'bi bi-pause-fill';
        startProgress();
        // Pulse animation on cover
        playerCover.style.animation = 'none';
        void playerCover.offsetHeight;
        playerCover.style.animation = 'cover-glow 3s ease-in-out infinite alternate';
    }

    function nextTrack() {
        const currentIdx = tracks.findIndex(t => t.name === state.currentTrack.name);
        const nextIdx = (currentIdx + 1) % tracks.length;
        loadTrack(tracks[nextIdx].id);
    }

    function prevTrack() {
        const currentIdx = tracks.findIndex(t => t.name === state.currentTrack.name);
        const prevIdx = (currentIdx - 1 + tracks.length) % tracks.length;
        loadTrack(tracks[prevIdx].id);
    }

    playPauseBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);

    // Progress bar click
    progressWrapper.addEventListener('click', (e) => {
        const rect = progressWrapper.getBoundingClientRect();
        state.progress = ((e.clientX - rect.left) / rect.width) * 100;
        playerProgress.style.width = state.progress + '%';
        updateTimeDisplay();
    });

    // Like button
    playerLikeBtn.addEventListener('click', () => {
        state.liked = !state.liked;
        const icon = playerLikeBtn.querySelector('i');
        icon.className = state.liked ? 'bi bi-heart-fill' : 'bi bi-heart';
        playerLikeBtn.classList.toggle('active', state.liked);
        // Pulse animation
        playerLikeBtn.style.transform = 'scale(1.3)';
        setTimeout(() => { playerLikeBtn.style.transform = 'scale(1)'; }, 200);
    });

    // Volume
    if (volumeSlider) {
        volumeSlider.addEventListener('click', (e) => {
            const rect = volumeSlider.getBoundingClientRect();
            state.volume = Math.round(((e.clientX - rect.left) / rect.width) * 100);
            volumeLevel.style.width = state.volume + '%';
            updateVolumeIcon();
        });
    }

    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            state.volume = state.volume > 0 ? 0 : 70;
            volumeLevel.style.width = state.volume + '%';
            updateVolumeIcon();
        });
    }

    function updateVolumeIcon() {
        if (!volumeBtn) return;
        const icon = volumeBtn.querySelector('i');
        if (state.volume === 0) icon.className = 'bi bi-volume-mute-fill';
        else if (state.volume < 50) icon.className = 'bi bi-volume-down-fill';
        else icon.className = 'bi bi-volume-up-fill';
    }

    // Shuffle & Repeat
    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            state.shuffle = !state.shuffle;
            shuffleBtn.style.color = state.shuffle ? 'var(--accent)' : '';
        });
    }
    if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
            state.repeat = !state.repeat;
            repeatBtn.style.color = state.repeat ? 'var(--accent)' : '';
        });
    }

    // ──── Track Item & Card Clicks ────
    // ──── Track Options Dropdown ────
    let activeDropdown = null;

    function createDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'track-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-item"><i class="bi bi-collection-play"></i> Добавить в плейлист</div>
            <div class="dropdown-item"><i class="bi bi-info-circle"></i> О треке</div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item"><i class="bi bi-download"></i> Скачать</div>
            <div class="dropdown-item"><i class="bi bi-share"></i> Поделиться</div>
        `;
        document.body.appendChild(dropdown);
        return dropdown;
    }

    const trackDropdown = createDropdown();

    document.addEventListener('click', (e) => {
        // Quick cards with page navigation
        const quickCard = e.target.closest('.quick-card[data-page]');
        if (quickCard) {
            showPage(quickCard.dataset.page);
            return;
        }

        // Generic page navigation (Header profile, Sidebar footer, etc.)
        const navTarget = e.target.closest('[data-page]:not(.page):not(.sidebar-link):not(.mobile-nav-item):not(.see-all-link):not(.quick-card)');
        if (navTarget) {
            showPage(navTarget.dataset.page);
            return;
        }

        // Track Options Button
        const optionsBtn = e.target.closest('.track-options-btn');
        if (optionsBtn) {
            e.stopPropagation();
            const rect = optionsBtn.getBoundingClientRect();
            trackDropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;

            // Check if dropdown goes off screen (right side)
            if (rect.left + 200 > window.innerWidth) {
                trackDropdown.style.left = `${rect.right - 200}px`;
            } else {
                trackDropdown.style.left = `${rect.left}px`;
            }

            trackDropdown.classList.add('active');
            activeDropdown = trackDropdown;
            return;
        }

        // Close dropdown on outside click
        if (activeDropdown && !e.target.closest('.track-dropdown')) {
            activeDropdown.classList.remove('active');
            activeDropdown = null;
        }

        // Music cards with track loading
        const card = e.target.closest('[data-track]');
        if (card && !e.target.closest('.track-action-btn') && !e.target.closest('.track-options-btn')) {
            const trackId = card.dataset.track;
            loadTrack(trackId);
        }

        // Filter chips
        const chip = e.target.closest('.filter-chip');
        if (chip) {
            const parent = chip.parentElement;
            parent.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        }

        // Track like buttons
        const likeBtn = e.target.closest('.track-action-btn');
        if (likeBtn) {
            const icon = likeBtn.querySelector('i');
            if (icon && icon.classList.contains('bi-heart')) {
                icon.className = 'bi bi-heart-fill text-accent';
                likeBtn.style.transform = 'scale(1.3)';
                setTimeout(() => { likeBtn.style.transform = 'scale(1)'; }, 200);
            } else if (icon && icon.classList.contains('bi-heart-fill')) {
                icon.className = 'bi bi-heart';
                icon.classList.remove('text-accent');
            }
        }
    });

    // ──── 3D Tilt Effect on Cards ────
    document.querySelectorAll('.card-3d').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ──── Mobile Search ────
    if (searchToggle && searchOverlay && searchClose) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            const input = document.getElementById('searchOverlayInput');
            if (input) setTimeout(() => input.focus(), 100);
        });
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }

    // ──── Touch Swipe for Mobile Navigation ────
    let touchStartX = 0;
    let touchEndX = 0;
    const pageOrder = ['home', 'tracks', 'genres', 'favorites', 'playlists'];

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) < 80) return; // minimum swipe distance
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        const currentPage = activePage.dataset.page;
        const currentIdx = pageOrder.indexOf(currentPage);
        if (currentIdx === -1) return;
        if (diff > 0 && currentIdx < pageOrder.length - 1) {
            showPage(pageOrder[currentIdx + 1]);
        } else if (diff < 0 && currentIdx > 0) {
            showPage(pageOrder[currentIdx - 1]);
        }
    }

    // ──── Keyboard Shortcuts ────
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                if (e.shiftKey) nextTrack();
                else { state.progress = Math.min(100, state.progress + 5); playerProgress.style.width = state.progress + '%'; }
                break;
            case 'ArrowLeft':
                if (e.shiftKey) prevTrack();
                else { state.progress = Math.max(0, state.progress - 5); playerProgress.style.width = state.progress + '%'; }
                break;
        }
    });

    // ──── Initial state ────
    updateTimeDisplay();
    volumeLevel && (volumeLevel.style.width = state.volume + '%');
});
