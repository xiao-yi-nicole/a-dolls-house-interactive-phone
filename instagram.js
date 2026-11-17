/* Instagram app: Nora profile, post cards, detail view and Christmas-tree audio. */
(() => {
  'use strict';

  const data = window.INSTAGRAM_DATA;
  if (!data) return;
  const appLayer = document.getElementById('appLayer');
  const MUSIC_ID = 'inst-music';
  let activeScreen = 'profile';
  let activePost = null;
  let savedFeedScroll = 0;

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

  function pinIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6l-1 6 3 3v2h-5v7l-1 1-1-1v-7H5v-2l3-3-1-6z"/></svg>`;
  }

  function multiIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="12" height="12" rx="1.5"/><rect x="9" y="9" width="12" height="12" rx="1.5"/></svg>`;
  }

  function avatar(extra = '') {
    return `<span class="igx-avatar ${extra}" aria-hidden="true"></span>`;
  }

  function musicLine(post) {
    return post.music ? `<div class="igx-music">${esc(post.music)}</div>` : '';
  }

  function postHeader() {
    return `
      <header class="igx-post-head">
        ${avatar('igx-post-avatar')}
        <span class="igx-post-user">norahelmer</span>
        <span class="igx-post-more" aria-hidden="true">•••</span>
      </header>`;
  }

  function likesHTML(post) {
    if (!post.showLikes) return '';
    const names = post.likedBy.map(name => `<strong>${esc(name)}</strong>`);
    let text = '';
    if (names.length === 1) {
      text = `${names[0]} and <strong>${esc(post.likesCount)}</strong> others`;
    } else if (names.length === 2) {
      text = `${names[0]}, ${names[1]}, and <strong>${esc(post.likesCount)}</strong> others`;
    } else {
      text = names.join(', ');
    }
    return `<div class="igx-likes">Liked by ${text}</div>`;
  }

  function actionsHTML(detail = false) {
    return `
      <div class="igx-actions${detail ? ' igx-detail-actions' : ''}" aria-hidden="true">
        <span class="igx-action">${icon('i-heart')}</span>
        <span class="igx-action">${icon('i-comment')}</span>
        <span class="igx-action">${icon('i-send')}</span>
        <span class="igx-action igx-save">${icon('i-bookmark')}</span>
      </div>`;
  }

  function captionHTML(post) {
    return `<div class="igx-caption"><strong>norahelmer</strong>${post.caption ? ` ${esc(post.caption)}` : ''}</div>`;
  }

  function singleMedia(post) {
    const key = post.images[0];
    return `<div class="igx-detail-media igx-img-${esc(key)}" role="img" aria-label="${esc(post.alt)}"></div>`;
  }

  function profileTile(post) {
    const pinned = post.pinned
      ? `<span class="igx-grid-pin" title="Pinned" aria-label="Pinned">${pinIcon()}</span>`
      : '';
    const multi = post.images.length > 1
      ? `<span class="igx-grid-multi" title="Multiple photos" aria-label="Multiple photos">${multiIcon()}</span>`
      : '';
    return `
      <button class="igx-grid-tile igx-img-${esc(post.images[0])}" type="button"
        data-ig-post="${esc(post.id)}" data-ig-image-index="0"
        aria-label="Open post: ${esc(post.alt)}">
        ${pinned}
        ${multi}
      </button>`;
  }

  function carouselHTML(post) {
    const track = post.images.map((key, index) => `
      <div class="igx-slide igx-img-${esc(key)}" role="img"
        aria-label="${esc(post.alt)} — photo ${index + 1}"></div>`).join('');
    return `
      <div class="igx-carousel" data-ig-carousel>
        <div class="igx-carousel-track">
          ${track}
        </div>
        <button class="igx-carousel-arrow igx-carousel-prev" type="button" data-ig-prev aria-label="Previous photo">
          ${icon('i-chevron-left')}
        </button>
        <button class="igx-carousel-arrow igx-carousel-next" type="button" data-ig-next aria-label="Next photo">
          <span style="display:inline-block;transform:rotate(180deg)">${icon('i-chevron-left')}</span>
        </button>
        <span class="igx-carousel-counter">${post.images.length} photos</span>
      </div>`;
  }

  function detailHTML(post) {
    const play = post.music
      ? `<button class="igx-play" type="button" data-ig-play hidden>▶ Play Music</button>`
      : '';
    return `
      <div class="igx-post igx-detail-post" data-ig-detail-post="${esc(post.id)}">
        ${play}
        ${postHeader()}
        ${musicLine(post)}
        ${post.images.length > 1 ? carouselHTML(post) : singleMedia(post, true)}
        ${actionsHTML(true)}
        ${likesHTML(post)}
        ${captionHTML(post)}
        <div class="igx-time igx-detail-time">${esc(post.time)}</div>
      </div>`;
  }

  function profileScreen() {
    const profile = data.profile;
    return `
      <section class="igx-screen is-active" data-ig-screen="profile">
        <header class="igx-topbar">
          <span class="igx-topbar-username">@${esc(profile.username)}</span>
          <button class="igx-topbar-button" type="button" data-home aria-label="Back to home screen">${icon('i-gear')}</button>
        </header>
        <div class="ig-feed" data-ig-feed>
          <div class="igx-profile-head">
            ${avatar('igx-profile-avatar')}
            <div class="igx-stats">
              <div class="igx-stat"><strong>${esc(profile.posts)}</strong><span>posts</span></div>
              <div class="igx-stat"><strong>${esc(profile.followers)}</strong><span>followers</span></div>
              <div class="igx-stat"><strong>${esc(profile.following)}</strong><span>following</span></div>
            </div>
          </div>
          <div class="igx-profile-name">${esc(profile.displayName)}</div>
          <div class="igx-bio">
            <div class="igx-bio-line">🤍 Wife of <span class="igx-link">@torvaldhelmer</span></div>
            <div class="igx-bio-line">🎎 Mama to Ivar, Bob &amp; Emmy</div>
          </div>
          <div class="igx-profile-posts">
            ${data.posts.map(profileTile).join('')}
          </div>
        </div>
      </section>`;
  }

  function root() {
    activeScreen = 'profile';
    activePost = null;
    stopAudio();
    return `
      <div class="app-view igx-app" data-ig-app>
        ${statusBar()}
        <div class="igx-screens">
          ${profileScreen()}
          <section class="igx-screen" data-ig-screen="detail">
            <header class="igx-topbar igx-detail-topbar">
              <button class="igx-detail-back" type="button" data-ig-back aria-label="Back to profile">${icon('i-chevron-left')}</button>
              <span class="igx-detail-title">Post</span>
            </header>
            <div class="ig-detail" data-ig-detail></div>
          </section>
        </div>
      </div>`;
  }

  function statusBar() {
    return `
      <div class="status-bar app-status">
        <span class="status-time">3:30</span>
        ${STATUS_RIGHT}
      </div>`;
  }

  function setScreen(name) {
    const rootElement = document.querySelector('.igx-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('[data-ig-screen]').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.igScreen === name);
    });
    activeScreen = name;
  }

  function getAudio() {
    return document.getElementById(MUSIC_ID);
  }

  function getPlayButton() {
    return document.querySelector('.igx-detail [data-ig-play]');
  }

  function attemptAudio() {
    const audio = getAudio();
    const button = getPlayButton();
    if (!audio) {
      if (button) button.hidden = false;
      return;
    }
    try {
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(() => {
          if (button) button.hidden = true;
        }).catch(() => {
          if (button) button.hidden = false;
        });
      }
    } catch (error) {
      if (button) button.hidden = false;
    }
  }

  function stopAudio() {
    const audio = getAudio();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    const button = getPlayButton();
    if (button) button.hidden = true;
  }

  function openPost(id, imageIndex = 0) {
    const post = data.posts.find(item => item.id === id);
    if (!post) return;
    const feed = document.querySelector('[data-ig-feed]');
    savedFeedScroll = feed ? feed.scrollTop : 0;
    activePost = post;
    const detail = document.querySelector('[data-ig-detail]');
    if (!detail) return;
    detail.innerHTML = detailHTML(post);
    setScreen('detail');
    detail.scrollTop = 0;

    if (post.images.length > 1) {
      const track = detail.querySelector('.igx-carousel-track');
      if (track) {
        requestAnimationFrame(() => {
          track.scrollLeft = track.clientWidth * Math.max(0, Math.min(imageIndex, post.images.length - 1));
        });
      }
    }

    if (post.music) {
      attemptAudio();
    } else {
      stopAudio();
    }
  }

  function showProfile() {
    setScreen('profile');
    const feed = document.querySelector('[data-ig-feed]');
    if (feed) feed.scrollTop = savedFeedScroll;
  }

  function back() {
    if (activeScreen === 'detail') {
      stopAudio();
      showProfile();
      return true;
    }
    return false;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.igx-app');
      if (!app) return;

      const image = event.target.closest('[data-ig-post]');
      if (image) {
        openPost(image.dataset.igPost, Number(image.dataset.igImageIndex || 0));
        return;
      }

      if (event.target.closest('[data-ig-back]')) {
        stopAudio();
        showProfile();
        return;
      }

      if (event.target.closest('[data-ig-play]')) {
        attemptAudio();
        return;
      }

      const arrow = event.target.closest('[data-ig-prev], [data-ig-next]');
      if (arrow) {
        const carousel = arrow.closest('.igx-carousel');
        const track = carousel ? carousel.querySelector('.igx-carousel-track') : null;
        if (!track) return;
        const direction = arrow.hasAttribute('data-ig-next') ? 1 : -1;
        track.scrollLeft += direction * track.clientWidth;
      }
    });
  }

  window.InstagramUI = { root, back, stopAudio };
})();
