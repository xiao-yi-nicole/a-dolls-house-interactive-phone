/* Photos — iOS-style library grid and black photo viewer. */
(() => {
  'use strict';

  const PHOTOS = [
    { date: 'April 7, 2024', clock: '15:20', image: 8 },
    { date: 'April 7, 2024', clock: '15:38', image: 7 },
    { date: 'April 7, 2024', clock: '15:42', image: 6 },
    { date: 'April 7, 2024', clock: '15:51', image: 5 },
    { date: 'October 15, 2024', clock: '20:38', image: 4 },
    { date: 'October 15, 2024', clock: '21:46', image: 3 },
    { date: 'November 26, 2024', clock: '23:48', image: 2 },
    { date: 'November 27, 2024', clock: '01:25', image: 1 }
  ];

  const appLayer = document.getElementById('appLayer');
  let currentIndex = 0;
  let savedLibraryScroll = 0;
  let activeScreen = 'library';

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
      <div class="status-bar app-status">
        <span class="status-time">3:30</span>
        ${STATUS_RIGHT}
      </div>`;
  }

  function libraryGrid() {
    return PHOTOS.map((photo, index) => `
      <button class="phx-grid-item phx-img-${photo.image}" type="button"
        data-phx-photo="${index}" aria-label="Open photo from ${esc(photo.date)} ${esc(photo.clock)}"></button>
    `).join('');
  }

  function filmstrip() {
    return PHOTOS.map((photo, index) => `
      <button class="phx-thumb phx-img-${photo.image}${index === currentIndex ? ' is-current' : ''}"
        type="button" data-phx-thumb="${index}" aria-label="View photo ${index + 1}"></button>
    `).join('');
  }

  function root() {
    activeScreen = 'library';
    currentIndex = 0;
    return `
      <div class="app-view phx-app" data-phx-app>
        ${statusBar()}
        <div class="phx-screens">
          <section class="phx-screen is-active" data-phx-screen="library">
            <header class="phx-library-topbar">
              <button class="phx-library-back" type="button" data-back aria-label="Back to home screen">${icon('i-chevron-left')}</button>
              <h1 class="phx-library-title">Library</h1>
              <div class="phx-library-actions">
                <span class="phx-select">Select</span>
                <span class="phx-action-icon">${icon('i-search')}</span>
                <span class="phx-action-icon">${icon('i-more')}</span>
              </div>
            </header>
            <div class="phx-library" data-phx-library>
              <div class="phx-grid">${libraryGrid()}</div>
            </div>
            <nav class="phx-tabs" aria-hidden="true">
              <span>Years</span>
              <span>Months</span>
              <span class="is-active">All</span>
            </nav>
          </section>
          <section class="phx-screen phx-viewer" data-phx-screen="detail">
            <header class="phx-viewer-topbar">
              <button class="phx-viewer-back" type="button" data-phx-back aria-label="Back to Library">${icon('i-chevron-left')}</button>
              <span class="phx-viewer-time" data-phx-time>
                <span class="phx-viewer-date" data-phx-date>${esc(PHOTOS[0].date)}</span>
                <span class="phx-viewer-clock" data-phx-clock>${esc(PHOTOS[0].clock)}</span>
              </span>
              <div class="phx-viewer-actions">
                <span class="phx-edit">Edit</span>
                <span class="phx-viewer-more">${icon('i-more')}</span>
              </div>
            </header>
            <div class="phx-stage" data-phx-stage>
              <span class="phx-photo phx-img-${PHOTOS[0].image}" data-phx-photo-image role="img" aria-label="${esc(PHOTOS[0].date)} ${esc(PHOTOS[0].clock)}"></span>
              <button class="phx-arrow phx-prev" type="button" data-phx-prev aria-label="Previous photo">${icon('i-chevron-left')}</button>
              <button class="phx-arrow phx-next" type="button" data-phx-next aria-label="Next photo">${icon('i-chevron-right')}</button>
            </div>
            <div class="phx-filmstrip" data-phx-filmstrip>${filmstrip()}</div>
            <div class="phx-actions" aria-hidden="true">
              <span class="phx-bottom-icon">${icon('i-share')}</span>
              <span class="phx-bottom-icon phx-heart">${icon('i-heart')}</span>
              <span class="phx-bottom-icon">${icon('i-info')}</span>
              <span class="phx-bottom-icon">${icon('i-trash')}</span>
            </div>
          </section>
        </div>
      </div>`;
  }

  function setScreen(name) {
    const rootElement = document.querySelector('.phx-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('[data-phx-screen]').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.phxScreen === name);
    });
    rootElement.classList.toggle('is-detail', name === 'detail');
    activeScreen = name;
  }

  function syncDetails(index) {
    currentIndex = index;
    const rootElement = document.querySelector('.phx-app');
    if (!rootElement) return;
    const photo = PHOTOS[index];
    const image = rootElement.querySelector('[data-phx-photo-image]');
    const time = rootElement.querySelector('[data-phx-time]');
    const date = rootElement.querySelector('[data-phx-date]');
    const clock = rootElement.querySelector('[data-phx-clock]');
    const prev = rootElement.querySelector('[data-phx-prev]');
    const next = rootElement.querySelector('[data-phx-next]');
    if (image) {
      image.className = `phx-photo phx-img-${photo.image}`;
      image.setAttribute('aria-label', `${photo.date} ${photo.clock}`);
    }
    if (time) time.setAttribute('aria-label', `${photo.date} ${photo.clock}`);
    if (date) date.textContent = photo.date;
    if (clock) clock.textContent = photo.clock;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === PHOTOS.length - 1;
    rootElement.querySelectorAll('[data-phx-thumb]').forEach(thumb => {
      thumb.classList.toggle('is-current', Number(thumb.dataset.phxThumb) === index);
    });
    const filmstrip = rootElement.querySelector('[data-phx-filmstrip]');
    const current = filmstrip ? filmstrip.querySelector(`[data-phx-thumb="${index}"]`) : null;
    if (filmstrip && current) {
      filmstrip.scrollLeft = current.offsetLeft - (filmstrip.clientWidth - current.offsetWidth) / 2;
    }
  }

  function openPhoto(index) {
    const library = document.querySelector('[data-phx-library]');
    savedLibraryScroll = library ? library.scrollTop : 0;
    setScreen('detail');
    syncDetails(index);
  }

  function showLibrary() {
    setScreen('library');
    const library = document.querySelector('[data-phx-library]');
    if (library) library.scrollTop = savedLibraryScroll;
  }

  function step(direction) {
    const nextIndex = Math.max(0, Math.min(PHOTOS.length - 1, currentIndex + direction));
    if (nextIndex !== currentIndex) syncDetails(nextIndex);
  }

  function back() {
    if (activeScreen === 'detail') {
      showLibrary();
      return true;
    }
    return false;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.phx-app');
      if (!app) return;
      const gridPhoto = event.target.closest('[data-phx-photo]');
      if (gridPhoto) {
        openPhoto(Number(gridPhoto.dataset.phxPhoto));
        return;
      }
      const thumb = event.target.closest('[data-phx-thumb]');
      if (thumb) {
        const thumbStrip = thumb.closest('[data-phx-filmstrip]');
        if (thumbStrip && thumbStrip.dataset.justDragged === '1') {
          thumbStrip.dataset.justDragged = '0';
          return;
        }
        syncDetails(Number(thumb.dataset.phxThumb));
        return;
      }
      if (event.target.closest('[data-phx-back]')) {
        showLibrary();
        return;
      }
      if (event.target.closest('[data-phx-prev]')) {
        step(-1);
        return;
      }
      if (event.target.closest('[data-phx-next]')) {
        step(1);
      }
    });
  }

  if (appLayer) {
    let stageTracking = false;
    let stageStartX = 0;
    let stageStartY = 0;
    let stripDrag = null;

    appLayer.addEventListener('pointerdown', event => {
      if (!event.target.closest('.phx-app')) return;
      const stage = event.target.closest('[data-phx-stage]');
      if (stage && !event.target.closest('[data-phx-prev], [data-phx-next]')) {
        stageTracking = true;
        stageStartX = event.clientX;
        stageStartY = event.clientY;
        try { stage.setPointerCapture(event.pointerId); } catch (error) { /* no-op */ }
        return;
      }
      const strip = event.target.closest('[data-phx-filmstrip]');
      if (strip) {
        stripDrag = {
          strip,
          startX: event.clientX,
          startScroll: strip.scrollLeft,
          moved: false
        };
        try { strip.setPointerCapture(event.pointerId); } catch (error) { /* no-op */ }
      }
    });

    appLayer.addEventListener('pointermove', event => {
      if (!stripDrag) return;
      const dx = event.clientX - stripDrag.startX;
      if (Math.abs(dx) > 4) stripDrag.moved = true;
      stripDrag.strip.scrollLeft = stripDrag.startScroll - dx;
    });

    appLayer.addEventListener('pointerup', event => {
      if (stageTracking) {
        stageTracking = false;
        const dx = event.clientX - stageStartX;
        const dy = event.clientY - stageStartY;
        if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
          step(dx < 0 ? 1 : -1);
        }
      }
      if (stripDrag) {
        const { strip, moved } = stripDrag;
        stripDrag = null;
        if (moved) {
          strip.dataset.justDragged = '1';
          window.setTimeout(() => { strip.dataset.justDragged = '0'; }, 180);
        }
      }
    });

    appLayer.addEventListener('pointercancel', () => {
      stageTracking = false;
      stripDrag = null;
    });
  }

  window.PhotosUI = { root, back };
})();
