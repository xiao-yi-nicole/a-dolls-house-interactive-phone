/* Spotify — Liked Songs playlist with sequential audio playback. */
(() => {
  'use strict';

  const TRACKS = [
    {
      title: 'Barbie Girl',
      artist: 'Aqua',
      cover: 'aquarium',
      // Whyp source page: https://whyp.it/tracks/aqua-barbie-girl-awfqx0ggxjs-MI7PMxEG2jeL
      audio: 'https://mp3tourl.com/audio/1794899247727-f0625d31-b686-43c6-9671-35075d34d491.mp3'
    },
    {
      title: 'Money, Money, Money',
      artist: 'ABBA',
      cover: 'abba',
      // Whyp source page: https://whyp.it/tracks/abba-money-money-money-official-lyric-video-zqcf1r-COl7c20NPkot
      audio: 'https://mp3tourl.com/audio/1794899302962-40e92ee9-dd30-4bb0-b763-a36fd72bb35c.mp3'
    },
    {
      title: 'Heart of Stone',
      artist: 'SIX, Abby Mueller',
      cover: 'six',
      // Whyp source page: https://whyp.it/tracks/six-featuring-abby-mueller-heart-of-stone-lek-wkp3-GLIVDnFnOYQD
      audio: 'https://mp3tourl.com/audio/1794899333740-9f54a4f6-448a-4bdb-8a48-3405e666cdd9.mp3'
    },
    {
      title: "Merry Christmas, Please Don't Call",
      artist: 'Bleachers',
      cover: 'merry',
      audio: 'https://mp3tourl.com/audio/1794753168912-6e4fa0a1-c4a2-4ae9-9c8f-75e8dc309be1.mp3'
    },
    {
      title: "I Know It's Over - 2011 Remaster",
      artist: 'The Smiths',
      cover: 'queen',
      // Whyp source page: https://whyp.it/tracks/the-smiths-i-know-its-over-official-audio-m6o1sej0-d1MeucqWzLt2
      audio: 'https://mp3tourl.com/audio/1794899364378-68e058e8-1859-45da-8db1-2f034e8e0c11.mp3'
    },
    {
      title: 'Dance The Night',
      artist: 'Dua Lipa',
      cover: 'barbie',
      // Whyp source page: https://whyp.it/tracks/dua-lipa-dance-the-night-from-barbie-the-album-off-qxiK0wGRGEQO
      audio: 'https://mp3tourl.com/audio/1794899416385-6d9d6551-9003-4447-bf76-30e2207363e7.mp3'
    },
    {
      title: 'Burn',
      artist: 'Phillipa Soo',
      cover: 'hamilton',
      audio: 'https://mp3tourl.com/audio/1794745170655-5c5078bf-4569-4ca5-8fdc-a7600e18c034.mp3'
    },
    {
      title: 'Goodbye',
      artist: 'Sabrina Carpenter',
      cover: 'goodbye',
      // Whyp source page: https://whyp.it/tracks/sabrina-carpenter-goodbye-official-lyric-video-uv-J7neasOfEtb3
      audio: 'https://mp3tourl.com/audio/1794899450889-f9ca3c41-08fb-4440-bb98-340424450a4b.mp3'
    },
    {
      title: 'What Was I Made For? [From The Motion Picture "Barbie"]',
      artist: 'Billie Eilish',
      cover: 'what',
      // Whyp source page: https://whyp.it/tracks/billie-eilish-what-was-i-made-for-official-lyric-v-nANc9QzplMTG
      audio: 'https://mp3tourl.com/audio/1794899479570-1e7ae86c-a42a-4780-a99a-99618f234bc8.mp3'
    }
  ];

  const appLayer = document.getElementById('appLayer');
  let currentIndex = -1;
  let isPlaying = false;

  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const icon = id => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

  const STATUS_RIGHT = `
    <div class="status-right" aria-hidden="true">
      <span class="signal-bars"><i></i><i></i><i></i><i></i></span>
      <svg class="status-icon wifi-icon"><use href="#i-wifi"></use></svg>
      <span class="battery-icon"><span class="battery-fill"></span></span>
    </div>`;

  function statusBar() {
    return `
      <div class="status-bar app-status is-light">
        <span class="status-time">3:30</span>
        ${STATUS_RIGHT}
      </div>`;
  }

  function globeIcon() {
    return `
      <svg class="spx-globe" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.2"/>
        <path d="M3.8 12h16.4M12 3.8c2.2 2.3 3.4 5.1 3.4 8.2s-1.2 5.9-3.4 8.2M12 3.8c-2.2 2.3-3.4 5.1-3.4 8.2s1.2 5.9 3.4 8.2"/>
      </svg>`;
  }

  function moreIcon() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="1.5"/>
        <circle cx="12" cy="12" r="1.5"/>
        <circle cx="12" cy="19" r="1.5"/>
      </svg>`;
  }

  function trackMarkup(track, index) {
    return `
      <button class="spx-track" type="button" data-spx-track="${index}">
        <span class="spx-track-cover${track.cover ? ` spx-cover-${track.cover}` : ' is-empty'}" aria-hidden="true"></span>
        <span class="spx-track-copy">
          <span class="spx-track-title">${esc(track.title)}</span>
          <span class="spx-track-artist">${esc(track.artist)}</span>
        </span>
        <span class="spx-track-more" aria-hidden="true">${moreIcon()}</span>
      </button>`;
  }

  function root() {
    stop();
    currentIndex = -1;
    isPlaying = false;
    return `
      <div class="app-view spx-app" data-spx-app>
        ${statusBar()}
        <div class="spx-gradient" aria-hidden="true"></div>
        <header class="spx-topbar">
          <button class="spx-back" type="button" data-back aria-label="Back to home screen">${icon('i-chevron-left')}</button>
          <span class="spx-topbar-title">Liked Songs</span>
        </header>
        <section class="spx-hero">
          <span class="spx-playlist-cover" aria-hidden="true"></span>
          <h1 class="spx-playlist-title">Liked Songs</h1>
          <div class="spx-meta-row">
            <div class="spx-meta">
              ${globeIcon()}
              <span>35 minutes</span>
            </div>
            <button class="spx-play" type="button" data-spx-toggle aria-label="Play Liked Songs">${icon('i-play')}</button>
          </div>
        </section>
        <div class="spx-list" data-spx-list>
          ${TRACKS.map(trackMarkup).join('')}
        </div>
      </div>`;
  }

  function audio() {
    return document.getElementById('spotify-audio');
  }

  function syncUI() {
    const rootElement = document.querySelector('.spx-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('[data-spx-track]').forEach(row => {
      row.classList.toggle('is-playing', Number(row.dataset.spxTrack) === currentIndex);
    });
    const toggle = rootElement.querySelector('[data-spx-toggle]');
    if (toggle) {
      toggle.innerHTML = isPlaying ? icon('i-pause') : icon('i-play');
      toggle.setAttribute('aria-label', isPlaying ? 'Pause Liked Songs' : 'Play Liked Songs');
    }
  }

  function playTrack(index, restart = true) {
    const player = audio();
    const track = TRACKS[index];
    if (!player || !track) return;
    currentIndex = index;
    isPlaying = true;
    if (player.getAttribute('src') !== track.audio) {
      player.src = track.audio;
    } else if (restart) {
      player.currentTime = 0;
    }
    syncUI();
    const promise = player.play();
    if (promise && typeof promise.then === 'function') {
      promise.catch(() => {
        isPlaying = false;
        syncUI();
      });
    }
  }

  function pause() {
    const player = audio();
    if (player) player.pause();
    isPlaying = false;
    syncUI();
  }

  function resume() {
    const player = audio();
    if (!player || currentIndex < 0) {
      playTrack(0);
      return;
    }
    isPlaying = true;
    syncUI();
    const promise = player.play();
    if (promise && typeof promise.then === 'function') {
      promise.catch(() => {
        isPlaying = false;
        syncUI();
      });
    }
  }

  function stop() {
    const player = audio();
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.currentTime = 0;
    }
    isPlaying = false;
    syncUI();
  }

  const player = audio();
  if (player) {
    player.addEventListener('ended', () => {
      if (currentIndex >= 0 && currentIndex < TRACKS.length - 1) {
        playTrack(currentIndex + 1);
      } else {
        currentIndex = -1;
        isPlaying = false;
        syncUI();
      }
    });
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.spx-app');
      if (!app) return;
      const row = event.target.closest('[data-spx-track]');
      if (row) {
        playTrack(Number(row.dataset.spxTrack));
        return;
      }
      if (event.target.closest('[data-spx-toggle]')) {
        const player = audio();
        if (player && !player.paused) pause();
        else resume();
      }
    });
  }

  window.SpotifyUI = { root, stop };
})();
