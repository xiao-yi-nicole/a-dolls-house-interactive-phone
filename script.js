(() => {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Element references and small helpers                                */
  /* ------------------------------------------------------------------ */

  const screen = document.getElementById('screen');
  const lockScreen = document.getElementById('lockScreen');
  const homeScreen = document.getElementById('homeScreen');
  const appLayer = document.getElementById('appLayer');
  const appGrid = document.getElementById('appGrid');
  const dock = document.getElementById('dock');
  const toast = document.getElementById('toast');
  const phoneSlot = document.getElementById('phoneSlot');
  const phone = document.getElementById('phone');
  const homeButton = document.getElementById('homeButton');
  const pageHint = document.getElementById('pageHint');
  const flashlightButton = document.getElementById('flashlightButton');
  const lockCameraButton = document.getElementById('lockCameraButton');
  const unlockCue = document.getElementById('unlockCue');

  const STATUS_TIME = '3:30';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function svg(id, className = '') {
    return `<svg class="${className}" aria-hidden="true"><use href="#${id}"></use></svg>`;
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1900);
  }

  function setPageHint(mode) {
    if (!pageHint) return;
    const hints = {
      lock: 'Swipe up to unlock <span>·</span> Home button locks',
      home: 'Tap an app <span>·</span> Home button locks',
      app: 'Back returns <span>·</span> Home exits'
    };
    pageHint.innerHTML = hints[mode] || hints.lock;
  }

  const STATUS_RIGHT = `
    <div class="status-right" aria-hidden="true">
      <span class="signal-bars"><i></i><i></i><i></i><i></i></span>
      <svg class="status-icon wifi-icon"><use href="#i-wifi"></use></svg>
      <span class="battery-icon"><span class="battery-fill"></span></span>
    </div>`;

  function statusBar(light = false) {
    return `
      <div class="status-bar app-status${light ? ' is-light' : ''}">
        <span class="status-time">${STATUS_TIME}</span>
        ${STATUS_RIGHT}
      </div>`;
  }

  function iconButton(iconId, label, attributes = '') {
    return `<button class="icon-button" type="button" ${attributes} aria-label="${esc(label)}">${svg(iconId)}</button>`;
  }

  function appHeader({ title, theme = '', actions = '', titleClass = '' }) {
    return `
      <header class="app-header ${theme}">
        <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
        <h1 class="app-header-title ${titleClass}">${title}</h1>
        <div class="header-actions">
          ${actions}
          <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
        </div>
      </header>`;
  }

  function avatar(person, extra = '') {
    return `<span class="avatar ${person.tone || 'blue'} ${extra}" aria-hidden="true">${esc(person.initial || person.name.charAt(0))}</span>`;
  }

  function pushSubview(markup, setup) {
    const view = document.createElement('div');
    view.className = 'subview';
    view.innerHTML = markup;
    appLayer.appendChild(view);
    if (typeof setup === 'function') setup(view);
    const scroller = $('.page-scroll, .app-body', view);
    if (scroller) scroller.scrollTop = 0;
    return view;
  }

  /* ------------------------------------------------------------------ */
  /* App icon artwork                                                    */
  /* ------------------------------------------------------------------ */

  const PHOTO_PETALS = Array.from({ length: 8 }, () => '<span class="photo-petal"></span>').join('');

  const APP_LABELS = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    amazon: 'Amazon',
    chatgpt: 'ChatGPT',
    x: 'X',
    spotify: 'Spotify',
    notes: 'Notes',
    calendar: 'Calendar',
    settings: 'Settings',
    photos: 'Photos',
    weather: 'Weather',
    phone: 'Phone',
    safari: 'Safari',
    messages: 'Messages',
    camera: 'Camera'
  };

  function iconHTML(id) {
    switch (id) {
      case 'whatsapp':
        return `<span class="app-icon is-image-icon icon-whatsapp" aria-hidden="true"></span>`;
      case 'instagram':
        return `<span class="app-icon is-image-icon icon-instagram" aria-hidden="true"></span>`;
      case 'amazon':
        return `<span class="app-icon is-image-icon icon-amazon" aria-hidden="true"></span>`;
      case 'chatgpt':
        return `<span class="app-icon is-image-icon icon-chatgpt" aria-hidden="true"></span>`;
      case 'x':
        return `<span class="app-icon is-image-icon icon-x" aria-hidden="true"></span>`;
      case 'spotify':
        return `<span class="app-icon is-image-icon icon-spotify" aria-hidden="true"></span>`;
      case 'notes':
        return `<span class="app-icon is-image-icon icon-notes" aria-hidden="true"></span>`;
      case 'calendar':
        return `<span class="app-icon icon-calendar" aria-hidden="true"><span class="cal-weekday">SUN</span><span class="cal-day">27</span></span>`;
      case 'settings':
        return `<span class="app-icon is-image-icon icon-settings" aria-hidden="true"></span>`;
      case 'photos':
        return `<span class="app-icon is-image-icon icon-photos" aria-hidden="true"></span>`;
      case 'weather':
        return `<span class="app-icon is-image-icon icon-weather" aria-hidden="true"></span>`;
      case 'phone':
        return `<span class="app-icon icon-phone" aria-hidden="true"><span class="phone-icon-img"></span></span>`;
      case 'safari':
        return `<span class="app-icon is-image-icon icon-safari" aria-hidden="true"></span>`;
      case 'messages':
        return `<span class="app-icon icon-messages" aria-hidden="true"><span class="message-bubble"></span></span>`;
      case 'camera':
        return `<span class="app-icon icon-camera" aria-hidden="true"><span class="camera-body"><span class="camera-lens"></span><span class="camera-dot"></span></span></span>`;
      default:
        return `<span class="app-icon icon-default" aria-hidden="true">${svg('i-grid', 'brand-icon')}</span>`;
    }
  }

  const HOME_APPS = [
    'calendar', 'weather', 'photos', 'notes',
    'instagram', 'amazon', 'chatgpt', 'spotify', 'x'
  ];

  const DOCK_APPS = ['phone', 'safari', 'whatsapp', 'settings'];

  function appButton(id, inDock = false) {
    const label = APP_LABELS[id];
    const unread = id === 'whatsapp' && window.WHATSAPP_UNREAD;
    const missedCalls = id === 'phone' && inDock ? 17 : 0;
    return `
      <button class="app-button" type="button" data-app="${id}" aria-label="Open ${label}${unread ? ', 1 unread message' : ''}${missedCalls ? ', 17 missed calls' : ''}">
        <span class="app-icon-wrap">
          ${iconHTML(id)}
          ${unread ? '<span class="app-badge" data-wa-home-badge aria-label="1 unread message">1</span>' : ''}
          ${missedCalls ? `<span class="app-badge is-phone-badge" aria-label="17 missed calls">${missedCalls}</span>` : ''}
        </span>
        ${inDock ? '' : `<span class="app-label">${label}</span>`}
      </button>`;
  }

  function renderHome() {
    appGrid.innerHTML = HOME_APPS.map(id => appButton(id)).join('');
    dock.innerHTML = DOCK_APPS.map(id => appButton(id, true)).join('');
  }

  /* ------------------------------------------------------------------ */
  /* Content data                                                        */
  /* ------------------------------------------------------------------ */

  const CHATS = [
    {
      name: 'Mom', initial: 'M', tone: 'pink', time: '3:12 PM', preview: "Don't forget Sunday dinner", unread: 2,
      reply: 'Perfect. I will save you a slice of pie.',
      messages: [
        { text: 'Are you still coming over on Sunday?', me: false, time: '3:06 PM' },
        { text: "Yes! I'll be there around six.", me: true, time: '3:09 PM' },
        { text: "Don't forget Sunday dinner. Your aunt is bringing pie.", me: false, time: '3:12 PM' }
      ]
    },
    {
      name: 'Design Crew', initial: 'D', tone: 'purple', time: '2:48 PM', preview: 'Maya: The new screens look great.', unread: 0,
      reply: 'Nice. I will add the final notes before the review.',
      messages: [
        { text: 'The new screens look great.', me: false, time: '2:41 PM' },
        { text: 'The tiny phone mockup is my favorite.', me: false, time: '2:42 PM' },
        { text: 'Same. I am polishing the app transitions now.', me: true, time: '2:48 PM' }
      ]
    },
    {
      name: 'Alex', initial: 'A', tone: 'blue', time: '1:26 PM', preview: 'Sent you the photos from yesterday.', unread: 0,
      reply: 'Got them. These are lovely, thank you!',
      messages: [
        { text: 'Sent you the photos from yesterday.', me: false, time: '1:26 PM' },
        { text: 'The light was so good.', me: false, time: '1:27 PM' }
      ]
    },
    {
      name: 'Weekend Plans', initial: 'W', tone: 'orange', time: '12:03 PM', preview: 'Lena: Brunch on Saturday?', unread: 5,
      reply: 'Saturday works for me. Let us meet at eleven.',
      messages: [
        { text: 'Brunch on Saturday?', me: false, time: '12:01 PM' },
        { text: 'I found a little place near the river.', me: false, time: '12:03 PM' }
      ]
    },
    {
      name: 'Riley', initial: 'R', tone: 'green', time: 'Yesterday', preview: 'That playlist is perfect.', unread: 0,
      reply: 'I knew you would like it. I will send a few more.',
      messages: [
        { text: 'That playlist is perfect.', me: false, time: 'Yesterday' },
        { text: 'It has been on repeat all week.', me: false, time: 'Yesterday' }
      ]
    }
  ];

  const MESSAGES = [
    {
      name: 'Maya', initial: 'M', tone: 'pink', time: '3:04 PM', preview: 'See you at six!', unread: 1,
      reply: 'See you then. I will grab the corner table.',
      messages: [
        { text: 'See you at six!', me: false, time: '3:04 PM' },
        { text: 'I booked the little table by the window.', me: false, time: '3:05 PM' },
        { text: 'Perfect. I am on my way.', me: true, time: '3:07 PM' }
      ]
    },
    {
      name: 'Alex Chen', initial: 'A', tone: 'blue', time: '1:22 PM', preview: 'The photos came out great.', unread: 0,
      reply: 'They really did. I will send my favorites tonight.',
      messages: [
        { text: 'The photos came out great.', me: false, time: '1:22 PM' },
        { text: 'That one by the window is my favorite.', me: true, time: '1:24 PM' }
      ]
    },
    {
      name: 'Book Club', initial: 'B', tone: 'purple', time: 'Yesterday', preview: 'Nina: Chapter six is wild.', unread: 3,
      reply: 'Chapter six completely changed the story for me.',
      messages: [
        { text: 'Chapter six is wild.', me: false, time: 'Yesterday' },
        { text: 'No spoilers yet! I am almost there.', me: true, time: 'Yesterday' }
      ]
    },
    {
      name: 'Sam', initial: 'S', tone: 'orange', time: 'Monday', preview: 'Thanks for the recommendation.', unread: 0,
      reply: 'Any time. Let me know what you think.',
      messages: [
        { text: 'Thanks for the recommendation.', me: false, time: 'Monday' },
        { text: 'The first episode is so good.', me: false, time: 'Monday' }
      ]
    }
  ];

  const INSTAGRAM_POSTS = [
    {
      id: 'ig-1',
      user: 'mira.studio',
      place: 'Shanghai, China',
      tone: 'pink',
      initial: 'M',
      photoClass: 'ig-photo-1',
      likes: '1,284',
      caption: 'Golden hour from the ferry. The city looked like a postcard tonight.',
      comments: 'View all 24 comments',
      liked: false
    },
    {
      id: 'ig-2',
      user: 'slow.mornings',
      place: 'A little kitchen',
      tone: 'sand',
      initial: 'S',
      photoClass: 'ig-photo-2',
      likes: '892',
      caption: 'Coffee, a new notebook, and nowhere to be. A very good Sunday.',
      comments: 'View all 16 comments',
      liked: false
    },
    {
      id: 'ig-3',
      user: 'tiny.worlds',
      place: 'The dollhouse',
      tone: 'purple',
      initial: 'T',
      photoClass: 'ig-photo-3',
      likes: '3,041',
      caption: 'A tiny world with a big imagination. Found this little scene at the flea market.',
      comments: 'View all 41 comments',
      liked: false
    }
  ];

  const STORIES = [
    { name: 'Your story', initial: '+', tone: 'add' },
    { name: 'Mira', initial: 'M', tone: 'pink' },
    { name: 'Alex', initial: 'A', tone: 'blue' },
    { name: 'Nina', initial: 'N', tone: 'purple' },
    { name: 'Sam', initial: 'S', tone: 'orange' }
  ];

  const AMAZON_PRODUCTS = [
    {
      title: 'Echo Dot (5th Gen)',
      price: 49.99,
      rating: '4.7',
      reviews: '38,204',
      art: 'az-art-dot',
      blurb: 'Smart speaker with vibrant sound and Alexa.',
      prime: true
    },
    {
      title: 'Kindle Paperwhite',
      price: 139.99,
      rating: '4.8',
      reviews: '12,893',
      art: 'az-art-kindle',
      blurb: 'A glare-free display and weeks of battery life.',
      prime: true
    },
    {
      title: 'Fire TV Stick 4K',
      price: 39.99,
      rating: '4.6',
      reviews: '61,442',
      art: 'az-art-fire',
      blurb: 'Cinematic streaming in 4K with Alexa Voice Remote.',
      prime: false
    },
    {
      title: 'Everyday Wireless Earbuds',
      price: 59.99,
      rating: '4.4',
      reviews: '8,107',
      art: 'az-art-buds',
      blurb: 'Clear sound, a pocket-sized case, and all-day comfort.',
      prime: true
    }
  ];

  let cartCount = 0;

  const X_POSTS = [
    {
      name: 'Mira Chen', handle: '@mira.codes', initial: 'M', tone: 'pink', time: '12m',
      text: 'Small screens are underrated. I built a tiny iPhone in the browser today and now I want to live inside it. ✨',
      replies: '18', reposts: '42', likes: '316', media: null, liked: false, reposted: false
    },
    {
      name: 'Design Weekly', handle: '@designweekly', initial: 'D', tone: 'blue', time: '1h',
      text: 'The best interfaces feel inevitable. Every control is exactly where your thumb expects it to be.',
      replies: '31', reposts: '120', likes: '1,842', media: null, liked: false, reposted: false
    },
    {
      name: 'Shanghai Coffee', handle: '@shcoffee', initial: 'S', tone: 'sand', time: '2h',
      text: 'A quiet corner, a flat white, and a window full of rain. Sunday, done right.',
      replies: '7', reposts: '14', likes: '208', media: 'x-photo-1', liked: false, reposted: false
    },
    {
      name: 'Nina Park', handle: '@ninapark', initial: 'N', tone: 'purple', time: '3h',
      text: 'Currently reading: a novel about maps, memory, and the places we invent. Already underlining sentences.',
      replies: '12', reposts: '9', likes: '154', media: null, liked: false, reposted: false
    }
  ];

  const SPOTIFY_PLAYLISTS = [
    { name: 'Midnight Drive', meta: 'Luna Park · 42 songs', art: 'sp-art-1', color: '#4c2a85' },
    { name: 'Soft Focus', meta: 'Sunday morning · 28 songs', art: 'sp-art-2', color: '#c05a42' },
    { name: 'Paper Planes', meta: 'Indie folk · 36 songs', art: 'sp-art-3', color: '#2f6f63' },
    { name: 'City Lights', meta: 'Electronic · 51 songs', art: 'sp-art-4', color: '#204a7c' },
    { name: 'Tea & Rain', meta: 'Lo-fi beats · 64 songs', art: 'sp-art-5', color: '#7b5e47' },
    { name: 'Good Energy', meta: 'Feel-good pop · 33 songs', art: 'sp-art-6', color: '#a5316b' }
  ];

  const SPOTIFY_TRACKS = [
    { title: 'Midnight Drive', artist: 'Luna Park', duration: '3:42' },
    { title: 'Window Seat', artist: 'Mono Club', duration: '4:08' },
    { title: 'After the Rain', artist: 'Hana Lee', duration: '3:17' },
    { title: 'Neon Quiet', artist: 'The Small Hours', duration: '5:01' },
    { title: 'Home Before Two', artist: 'Luna Park', duration: '3:55' }
  ];

  let playerState = {
    title: 'Midnight Drive',
    artist: 'Luna Park',
    art: 'sp-art-1',
    playing: false
  };

  const NOTES = [
    {
      title: 'Little phone build',
      body: 'Swipe up to unlock. Tap an app to open it.\nBack returns to the previous page, and the home button exits to the desktop.\n\nRemember to check the lock screen date: December 27, 2026.',
      date: 'Today'
    },
    {
      title: 'Weekend plans',
      body: 'Sunday dinner at Mom\'s at six.\nBring the apple tart and the camera.\n\nMaybe take the long way home along the river.',
      date: 'Today'
    },
    {
      title: 'Gift ideas',
      body: 'A tiny notebook with a linen cover.\nWarm socks. A good pen.\nSomething for the kitchen that is actually useful.',
      date: 'Yesterday'
    },
    {
      title: 'Books to read',
      body: 'The Cartographers\nA History of the World in 100 Objects\nSmall Things Like These\n\nAsk Nina for the book club list.',
      date: 'Yesterday'
    }
  ];

  const CALENDAR_EVENTS = {
    '27': [
      { time: '10:00 AM', title: 'Winter walk', place: 'Riverside Park', detail: 'Meet at the north gate. Bring a thermos and wear something warm.' },
      { time: '6:30 PM', title: 'Dinner with family', place: "Mom's place", detail: 'Sunday dinner. Aunt May is bringing pie. Do not be late.' }
    ],
    '24': [
      { time: '7:00 PM', title: 'Christmas Eve dinner', place: 'Home', detail: 'Candles, music, and the good tablecloth.' }
    ],
    '31': [
      { time: '8:00 PM', title: "New Year's Eve", place: 'Rooftop', detail: 'Bring something warm. Fireworks at midnight.' }
    ],
    '6': [
      { time: '2:00 PM', title: 'Book club', place: 'The Reading Room', detail: 'Discuss chapters six through nine.' }
    ],
    '19': [
      { time: '11:30 AM', title: 'Brunch with Maya', place: 'Corner Cafe', detail: 'The table by the window is booked.' }
    ]
  };

  let selectedCalendarDay = 27;

  const PHOTOS = [
    { cls: 'ph-1', label: 'Harbor at dusk' },
    { cls: 'ph-2', label: 'Coffee and a notebook' },
    { cls: 'ph-3', label: 'A tiny world' },
    { cls: 'ph-4', label: 'Pink afternoon' },
    { cls: 'ph-5', label: 'Window light' },
    { cls: 'ph-6', label: 'Sunday flowers' },
    { cls: 'ph-7', label: 'A quiet street' },
    { cls: 'ph-8', label: 'The blue hour' },
    { cls: 'ph-9', label: 'Little details' }
  ];

  let capturedPhotos = [];

  /* ------------------------------------------------------------------ */
  /* Whatsapp                                                            */
  /* ------------------------------------------------------------------ */

  function chatBubble(message, app = 'wa') {
    return `
      <div class="chat-bubble ${app === 'msg' ? 'msg-bubble' : ''} ${message.me ? 'out' : 'in'}">
        <span class="bubble-copy">${esc(message.text)}</span>
        <span class="bubble-time">${esc(message.time || '')}</span>
      </div>`;
  }

  function whatsappRoot() {
    return `
      <div class="app-view app-whatsapp">
        ${statusBar(true)}
        ${appHeader({
          title: 'WhatsApp',
          theme: 'is-green',
          actions: iconButton('i-search', 'Search', 'data-toast="Search is not part of this demo"')
        })}
        <div class="app-body wa-body">
          <div class="wa-search-row">
            <div class="wa-search">${svg('i-search')}<span>Search</span></div>
            <button class="wa-new-chat" type="button" data-toast="New chat is not part of this demo" aria-label="New chat">${svg('i-plus')}</button>
          </div>
          <div class="wa-tabs" role="tablist" aria-label="WhatsApp sections">
            <button class="wa-tab is-active" type="button" role="tab" aria-selected="true">Chats</button>
            <button class="wa-tab" type="button" role="tab" aria-selected="false" data-toast="Status updates are not part of this demo">Status</button>
            <button class="wa-tab" type="button" role="tab" aria-selected="false" data-toast="Calls are not part of this demo">Calls</button>
          </div>
          <div class="wa-chat-list">
            ${CHATS.map((chat, index) => `
              <button class="wa-chat-row" type="button" data-chat="${index}">
                ${avatar(chat)}
                <span class="wa-chat-copy">
                  <span class="wa-chat-top">
                    <strong>${esc(chat.name)}</strong>
                    <span class="${chat.unread ? 'is-unread-time' : ''}">${esc(chat.time)}</span>
                  </span>
                  <span class="wa-chat-bottom">
                    <span>${esc(chat.preview)}</span>
                    ${chat.unread ? `<span class="unread-badge">${chat.unread}</span>` : ''}
                  </span>
                </span>
              </button>
            `).join('')}
          </div>
          <div class="wa-encryption">Your personal messages are end-to-end encrypted.</div>
        </div>
      </div>`;
  }

  function whatsappChat(index) {
    const chat = CHATS[index];
    const thread = chat.messages.map(message => chatBubble(message, 'wa')).join('');
    return `
      <div class="app-view app-whatsapp app-chat-view">
        ${statusBar(true)}
        <header class="chat-header wa-chat-header">
          <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
          <div class="chat-person">
            ${avatar(chat, 'small')}
            <span><strong>${esc(chat.name)}</strong><small>online</small></span>
          </div>
          <div class="header-actions">
            ${iconButton('i-phone', 'Voice call', 'data-toast="Voice calls are not available in this demo"')}
            <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
        </header>
        <div class="chat-thread wa-thread" data-chat-thread>
          <div class="chat-day">Today</div>
          ${thread}
        </div>
        <form class="chat-composer" data-chat-form data-chat-index="${index}">
          <div class="composer-field">
            <button class="composer-plus" type="button" data-toast="Attachments are not part of this demo" aria-label="Add attachment">${svg('i-plus')}</button>
            <input type="text" name="message" placeholder="Message" autocomplete="off" aria-label="Message">
          </div>
          <button class="composer-send" type="submit" aria-label="Send message">${svg('i-send')}</button>
        </form>
      </div>`;
  }

  function sendChatMessage(form, app) {
    const input = $('input[name="message"]', form);
    const text = input.value.trim();
    if (!text) return;

    const view = form.closest('.app-chat-view');
    const thread = $('[data-chat-thread]', view);
    const index = Number(form.dataset.chatIndex);
    const data = app === 'msg' ? MESSAGES : CHATS;
    const chat = data[index];
    if (!chat || !thread) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${app === 'msg' ? 'msg-bubble' : ''} out is-new`;
    const copy = document.createElement('span');
    copy.className = 'bubble-copy';
    copy.textContent = text;
    const time = document.createElement('span');
    time.className = 'bubble-time';
    time.textContent = STATUS_TIME;
    bubble.append(copy, time);
    thread.appendChild(bubble);
    chat.messages.push({ text, me: true, time: STATUS_TIME });
    input.value = '';
    thread.scrollTop = thread.scrollHeight;

    window.setTimeout(() => {
      if (!thread.isConnected) return;
      const incoming = document.createElement('div');
      incoming.className = `chat-bubble ${app === 'msg' ? 'msg-bubble' : ''} in is-new`;
      const incomingCopy = document.createElement('span');
      incomingCopy.className = 'bubble-copy';
      incomingCopy.textContent = chat.reply || 'Sounds good!';
      const incomingTime = document.createElement('span');
      incomingTime.className = 'bubble-time';
      incomingTime.textContent = STATUS_TIME;
      incoming.append(incomingCopy, incomingTime);
      thread.appendChild(incoming);
      chat.messages.push({ text: chat.reply || 'Sounds good!', me: false, time: STATUS_TIME });
      thread.scrollTop = thread.scrollHeight;
    }, 1000);
  }

  /* ------------------------------------------------------------------ */
  /* Instagram                                                           */
  /* ------------------------------------------------------------------ */

  function instagramRoot() {
    return `
      <div class="app-view app-instagram">
        ${statusBar(false)}
        ${appHeader({
          title: '<span class="ig-wordmark">Instagram</span>',
          actions: iconButton('i-heart', 'Activity', 'data-toast="No new activity"') + iconButton('i-send', 'Messages', 'data-toast="Direct messages are not part of this demo"')
        })}
        <div class="app-body ig-body">
          <div class="ig-stories" aria-label="Stories">
            ${STORIES.map((story, index) => `
              <button class="ig-story ${story.tone === 'add' ? 'is-add' : ''}" type="button" data-toast="${story.tone === 'add' ? 'Add to your story' : `Viewing ${story.name}'s story`}">
                <span class="story-ring"><span class="story-avatar ${story.tone}">${esc(story.initial)}</span></span>
                <span class="story-name">${esc(story.name)}</span>
              </button>
            `).join('')}
          </div>
          <div class="ig-feed">
            ${INSTAGRAM_POSTS.map((post, index) => `
              <article class="ig-post">
                <header class="ig-post-head">
                  <span class="avatar small ${post.tone}">${esc(post.initial)}</span>
                  <span class="ig-user"><strong>${esc(post.user)}</strong><small>${esc(post.place)}</small></span>
                  ${iconButton('i-more', 'More options', `data-toast="Post options"`)}
                </header>
                <div class="ig-photo ${post.photoClass}" data-like-photo="${index}" role="img" aria-label="${esc(post.caption)}">
                  <span class="ig-heart-pop" aria-hidden="true">${svg('i-heart')}</span>
                </div>
                <div class="ig-post-actions">
                  <button class="icon-button ig-like-btn" type="button" data-like="${index}" aria-label="Like post" aria-pressed="false">${svg('i-heart')}</button>
                  ${iconButton('i-comment', 'Comment', 'data-toast="Comments are not part of this demo"')}
                  ${iconButton('i-send', 'Share', 'data-toast="Sharing is not part of this demo"')}
                  <span class="ig-spacer"></span>
                  ${iconButton('i-bookmark', 'Save', 'data-toast="Post saved"')}
                </div>
                <div class="ig-post-copy">
                  <strong>${esc(post.likes)} likes</strong>
                  <p><strong>${esc(post.user)}</strong> ${esc(post.caption)}</p>
                  <button class="ig-comments" type="button" data-toast="Comments are not part of this demo">${esc(post.comments)}</button>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
        <nav class="ig-tabbar" aria-hidden="true">
          <span class="is-active">${svg('i-home')}</span>
          ${svg('i-search')}
          <span class="ig-reels">${svg('i-play')}</span>
          ${svg('i-heart')}
          <span class="tab-avatar">M</span>
        </nav>
      </div>`;
  }

  function likeInstagramPost(button) {
    const index = Number(button.dataset.like);
    const post = INSTAGRAM_POSTS[index];
    if (!post) return;
    post.liked = !post.liked;
    button.classList.toggle('is-liked', post.liked);
    button.setAttribute('aria-pressed', String(post.liked));
  }

  function popInstagramHeart(photo) {
    const heart = $('.ig-heart-pop', photo);
    if (!heart) return;
    heart.classList.remove('is-popping');
    void heart.offsetWidth;
    heart.classList.add('is-popping');
  }

  /* ------------------------------------------------------------------ */
  /* Amazon                                                              */
  /* ------------------------------------------------------------------ */

  function amazonHeaderActions() {
    return `
      <button class="icon-button amazon-cart-button" type="button" data-toast="Shopping cart" aria-label="Shopping cart">
        ${svg('i-cart')}
        <span class="cart-badge" data-cart-badge>${cartCount}</span>
      </button>`;
  }

  function amazonRoot() {
    return `
      <div class="app-view app-amazon">
        ${statusBar(true)}
        ${appHeader({
          title: '<span class="amazon-wordmark">amazon<span class="amazon-wordmark-smile"></span></span>',
          theme: 'is-amazon',
          actions: amazonHeaderActions()
        })}
        <div class="app-body az-body">
          <form class="az-search" data-amazon-search-form>
            ${svg('i-search')}
            <input type="search" name="query" placeholder="Search Amazon" aria-label="Search Amazon">
          </form>
          <button class="az-hero" type="button" data-toast="Holiday deals end soon">
            <span class="az-hero-kicker">Holiday deals</span>
            <span class="az-hero-title">Small gifts.<br>Big smiles.</span>
            <span class="az-hero-cta">Shop the edit ${svg('i-chevron-right')}</span>
            <span class="az-hero-art" aria-hidden="true"><i></i><i></i><i></i></span>
          </button>
          <div class="az-section-head">
            <h2>Recommended for you</h2>
            <button type="button" data-toast="Showing more recommendations">See all</button>
          </div>
          <div class="az-grid">
            ${AMAZON_PRODUCTS.map((product, index) => `
              <button class="az-card" type="button" data-product="${index}">
                <span class="az-art ${product.art}" aria-hidden="true"></span>
                <span class="az-product-title">${esc(product.title)}</span>
                <span class="az-stars">★★★★★ <small>${product.rating}</small></span>
                <span class="az-price">$${product.price.toFixed(2)}</span>
                ${product.prime ? '<span class="az-prime">prime</span>' : ''}
              </button>
            `).join('')}
          </div>
          <p class="az-signin">Sign in for the best experience</p>
          <button class="az-signin-button" type="button" data-toast="Sign-in is not part of this demo">Sign in securely</button>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function amazonProduct(index) {
    const product = AMAZON_PRODUCTS[index];
    return `
      <div class="app-view app-amazon-detail">
        ${statusBar(false)}
        ${appHeader({ title: 'Product details', theme: 'is-amazon-light' })}
        <div class="app-body az-detail-body">
          <div class="az-detail-art ${product.art}" aria-hidden="true"></div>
          <p class="az-detail-brand">Amazon's Choice</p>
          <h2>${esc(product.title)}</h2>
          <div class="az-detail-rating"><span class="az-stars">★★★★★</span> <span>${product.rating} · ${product.reviews} ratings</span></div>
          <p class="az-detail-price">$${product.price.toFixed(2)}</p>
          <p class="az-detail-blurb">${esc(product.blurb)}</p>
          <div class="az-detail-divider"></div>
          <p class="az-detail-small"><strong>${product.prime ? 'Prime delivery' : 'Standard delivery'}</strong><br>Arrives tomorrow if you order within 4 hrs 12 mins.</p>
          <button class="az-add-button" type="button" data-add-cart="${index}">Add to Cart</button>
          <button class="az-buy-button" type="button" data-toast="This is a demo checkout">Buy Now</button>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function addToCart() {
    cartCount += 1;
    $$('[data-cart-badge]').forEach(badge => { badge.textContent = String(cartCount); });
    $$('.cart-badge', appLayer).forEach(badge => { badge.textContent = String(cartCount); });
    showToast('Added to Cart');
  }

  /* ------------------------------------------------------------------ */
  /* ChatGPT                                                             */
  /* ------------------------------------------------------------------ */

  function chatgptRoot() {
    const recents = [
      'Tarantella dance sheet music',
      'Why YouTuber Nils Krogstad was cancelled',
      'Understanding data annotation',
      'Who can do data annotation?',
      'Remote contract jobs without a degree',
      'Money saving hacks'
    ];
    const menu = [
      {
        label: 'Library',
        icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/></svg>`
      },
      {
        label: 'Projects',
        icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h6l2 2h10v11.5H3z"/><path d="M3 6.5v-2h6l2 2h10v2"/></svg>`
      },
      {
        label: 'Apps',
        icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>`
      },
      {
        label: 'More',
        icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>`
      }
    ];
    return `
      <div class="app-view app-gptx">
        ${statusBar(true)}
        <header class="gptx-topbar">
          <div class="gptx-topbar-left">
            <button class="gptx-back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
            <span class="gptx-logo">ChatGPT</span>
          </div>
          <button class="gptx-search" type="button" aria-label="Search">${svg('i-search')}</button>
        </header>
        <div class="app-body gptx-history" data-gptx-scroll>
          <nav class="gptx-menu" aria-label="ChatGPT menu">
            ${menu.map(item => `
              <button class="gptx-menu-row" type="button">
                <span class="gptx-menu-icon">${item.icon}</span>
                <span>${esc(item.label)}</span>
              </button>
            `).join('')}
          </nav>
          <p class="gptx-recents">Recents</p>
          <div class="gptx-list">
            ${recents.map(item => `
              <button class="gptx-row" type="button" data-gptx-row>${esc(item)}</button>
            `).join('')}
          </div>
        </div>
        <div class="gptx-bottom">
          <button class="gptx-chat" type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l4.3-1 10.2-10.2-3.3-3.3L5 15.7 4 20z"/><path d="M13.8 6.8l3.4 3.4"/></svg>
            <span>Chat</span>
          </button>
          <button class="gptx-settings" type="button" aria-label="Settings">${svg('i-gear')}</button>
        </div>
      </div>`;
  }

  function chatGptReply(prompt) {
    const text = prompt.toLowerCase();
    if (text.includes('birthday')) {
      return 'Happy birthday! Wishing you a year full of good coffee, long walks, and the kind of days that feel like they have no clock.';
    }
    if (text.includes('weekend') || text.includes('shanghai')) {
      return 'Try a slow Saturday: coffee at a neighborhood cafe, a walk along the river, and an early dinner. Keep Sunday open for the little places you discover on the way.';
    }
    if (text.includes('photosynthesis')) {
      return 'Photosynthesis is how plants turn sunlight into food. They take in water and carbon dioxide, use light as energy, and make sugar while releasing oxygen.';
    }
    if (text.includes('name') || text.includes('tiny')) {
      return 'Three ideas: Pocket, Little Glass, and Tiny Home. My favorite for this one is Pocket.';
    }
    return 'Here is a simple way to think about it: start with the one small next step, keep the rest of the plan loose, and adjust as you go. I can help you turn that into a more detailed plan.';
  }

  function appendChatGpt(role, text) {
    const thread = $('[data-gpt-thread]');
    const scroller = $('[data-gpt-scroll]');
    if (!thread) return;
    const welcome = $('[data-gpt-welcome]');
    if (welcome) welcome.remove();

    const message = document.createElement('div');
    message.className = `gpt-message ${role}`;
    if (role === 'assistant') {
      const mark = document.createElement('span');
      mark.className = 'gpt-avatar';
      mark.innerHTML = svg('brand-openai');
      message.appendChild(mark);
    }
    const bubble = document.createElement('div');
    bubble.className = 'gpt-bubble';
    bubble.textContent = text;
    message.appendChild(bubble);
    thread.appendChild(message);

    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }

  function submitChatGpt(text) {
    const prompt = text.trim();
    if (!prompt) return;
    appendChatGpt('user', prompt);
    const thread = $('[data-gpt-thread]');
    const scroller = $('[data-gpt-scroll]');
    const typing = document.createElement('div');
    typing.className = 'gpt-message assistant is-typing';
    typing.innerHTML = `<span class="gpt-avatar">${svg('brand-openai')}</span><div class="gpt-bubble"><span></span><span></span><span></span></div>`;
    if (thread) thread.appendChild(typing);
    if (scroller) scroller.scrollTop = scroller.scrollHeight;

    window.setTimeout(() => {
      if (!typing.isConnected) return;
      typing.remove();
      appendChatGpt('assistant', chatGptReply(prompt));
    }, 1100);
  }

  /* ------------------------------------------------------------------ */
  /* X                                                                   */
  /* ------------------------------------------------------------------ */

  function xPostHTML(post, index, isNew = false) {
    return `
      <article class="x-post${isNew ? ' is-new' : ''}" data-x-post="${index}">
        <span class="avatar ${post.tone}">${esc(post.initial)}</span>
        <div class="x-post-main">
          <div class="x-post-head">
            <strong>${esc(post.name)}</strong>
            <span>${esc(post.handle)} · ${esc(post.time)}</span>
            <span class="x-more">···</span>
          </div>
          <p class="x-post-text">${esc(post.text)}</p>
          ${post.media ? `<div class="x-media ${post.media}" aria-hidden="true"></div>` : ''}
          <div class="x-actions">
            <button type="button" data-toast="Replies are not part of this demo" aria-label="Reply">${svg('i-comment')}<span>${esc(post.replies)}</span></button>
            <button type="button" class="x-repost" data-x-repost="${index}" aria-label="Repost" aria-pressed="${post.reposted}">${svg('i-refresh')}<span>${esc(post.reposts)}</span></button>
            <button type="button" class="x-like" data-x-like="${index}" aria-label="Like" aria-pressed="${post.liked}">${svg('i-heart')}<span>${esc(post.likes)}</span></button>
            <button type="button" data-toast="Post analytics" aria-label="Views">${svg('i-bars')}<span>${index === 0 ? '8.2K' : '2.1K'}</span></button>
          </div>
        </div>
      </article>`;
  }

  function xRoot() {
    return `
      <div class="app-view app-x">
        ${statusBar(true)}
        ${appHeader({
          title: `<span class="x-wordmark">${svg('brand-x')}</span>`,
          theme: 'is-dark',
          actions: iconButton('i-search', 'Explore', 'data-toast="Explore is not part of this demo"')
        })}
        <div class="x-tabs" role="tablist" aria-label="Timeline">
          <button type="button" class="is-active" data-x-tab role="tab" aria-selected="true">For you</button>
          <button type="button" data-x-tab role="tab" aria-selected="false">Following</button>
        </div>
        <div class="app-body x-body">
          <div class="x-feed" data-x-feed>
            ${X_POSTS.map((post, index) => xPostHTML(post, index)).join('')}
          </div>
          <div class="bottom-safe"></div>
        </div>
        <button class="x-compose-fab" type="button" data-x-compose aria-label="Compose post">${svg('i-plus')}</button>
      </div>`;
  }

  function xComposeView() {
    return `
      <div class="app-view app-x">
        ${statusBar(true)}
        <header class="app-header is-dark x-compose-header">
          <button class="x-cancel" type="button" data-back>Cancel</button>
          <h1 class="app-header-title">New post</h1>
          <div class="header-actions">
            <button class="x-post-button" type="submit" form="x-compose-form" data-x-post-submit>Post</button>
            <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
        </header>
        <form class="app-body x-compose-body" id="x-compose-form" data-x-form>
          <div class="x-compose-row">
            <span class="avatar dark">Y</span>
            <div class="x-compose-field">
              <textarea name="post" maxlength="280" placeholder="What is happening?" aria-label="Post text"></textarea>
              <div class="x-compose-tools">
                <span class="x-compose-icons">${svg('i-camera')}${svg('i-grid')}${svg('i-heart')}</span>
                <span class="x-character-count" data-x-count>280</span>
              </div>
            </div>
          </div>
        </form>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Spotify                                                             */
  /* ------------------------------------------------------------------ */

  function spotifyPlayerHTML() {
    return `
      <div class="sp-player${playerState.playing ? ' is-playing' : ''}" data-sp-player>
        <span class="sp-player-art ${playerState.art}" aria-hidden="true"></span>
        <span class="sp-player-copy">
          <strong data-player-title>${esc(playerState.title)}</strong>
          <small data-player-artist>${esc(playerState.artist)}</small>
          <span class="sp-progress"><i></i></span>
        </span>
        <button class="sp-play-button" type="button" data-play-toggle aria-label="${playerState.playing ? 'Pause' : 'Play'}">
          <svg class="sp-play-icon"><use href="#${playerState.playing ? 'i-pause' : 'i-play'}"></use></svg>
        </button>
      </div>`;
  }

  function spotifyRoot() {
    return `
      <div class="app-view app-spotify">
        ${statusBar(true)}
        ${appHeader({
          title: 'Spotify',
          theme: 'is-dark',
          actions: iconButton('i-search', 'Search', 'data-toast="Search is not part of this demo"')
        })}
        <div class="app-body sp-body">
          <div class="sp-top">
            <p>Good evening</p>
            <h2>Made for you</h2>
          </div>
          <div class="sp-grid">
            ${SPOTIFY_PLAYLISTS.map((playlist, index) => `
              <button class="sp-card" type="button" data-playlist="${index}">
                <span class="sp-cover ${playlist.art}" aria-hidden="true"><i></i></span>
                <strong>${esc(playlist.name)}</strong>
                <small>${esc(playlist.meta)}</small>
              </button>
            `).join('')}
          </div>
          <div class="sp-bottom-space"></div>
        </div>
        ${spotifyPlayerHTML()}
      </div>`;
  }

  function spotifyPlaylist(index) {
    return `
      <div class="app-view app-spotify sp-playlist">
        ${statusBar(true)}
        <header class="sp-hero-header">
          <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
          <div class="header-actions">
            <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
        </header>
        <div class="page-scroll sp-playlist-scroll">
          <div class="sp-playlist-hero">
            <span class="sp-hero-cover ${SPOTIFY_PLAYLISTS[index].art}" aria-hidden="true"><i></i></span>
            <h2>${esc(SPOTIFY_PLAYLISTS[index].name)}</h2>
            <p>${esc(SPOTIFY_PLAYLISTS[index].meta)} · 2 hr 18 min</p>
            <div class="sp-hero-actions">
              <button type="button" class="sp-hero-play" data-play-track="0" aria-label="Play playlist">${svg('i-play')}</button>
              <button type="button" class="sp-hero-heart" data-toast="Added to your library" aria-label="Add to library">${svg('i-heart')}</button>
            </div>
          </div>
          <div class="sp-track-list">
            ${SPOTIFY_TRACKS.map((track, trackIndex) => `
              <button class="sp-track" type="button" data-play-track="${trackIndex}">
                <span class="sp-track-number">${trackIndex + 1}</span>
                <span class="sp-track-copy"><strong>${esc(track.title)}</strong><small>${esc(track.artist)}</small></span>
                <span class="sp-track-duration">${esc(track.duration)}</span>
              </button>
            `).join('')}
          </div>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function updateSpotifyPlayer() {
    const player = $('[data-sp-player]');
    if (player) {
      player.classList.toggle('is-playing', playerState.playing);
      const title = $('[data-player-title]', player);
      const artist = $('[data-player-artist]', player);
      const art = $('.sp-player-art', player);
      if (title) title.textContent = playerState.title;
      if (artist) artist.textContent = playerState.artist;
      if (art) art.className = `sp-player-art ${playerState.art}`;
      const button = $('[data-play-toggle]', player);
      if (button) {
        button.setAttribute('aria-label', playerState.playing ? 'Pause' : 'Play');
        const icon = $('use', button);
        if (icon) icon.setAttribute('href', playerState.playing ? '#i-pause' : '#i-play');
      }
    }
  }

  function playSpotifyTrack(index) {
    const track = SPOTIFY_TRACKS[index] || SPOTIFY_TRACKS[0];
    playerState.title = track.title;
    playerState.artist = track.artist;
    playerState.art = SPOTIFY_PLAYLISTS[index % SPOTIFY_PLAYLISTS.length].art;
    playerState.playing = true;
    updateSpotifyPlayer();
    showToast(`Playing ${track.title}`);
  }

  /* ------------------------------------------------------------------ */
  /* Notes                                                               */
  /* ------------------------------------------------------------------ */

  function noteCard(note, index) {
    return `
      <button class="note-card" type="button" data-note="${index}" data-note-card="${index}">
        <span class="note-card-top">
          <strong class="note-card-title" data-note-card-title>${esc(note.title || 'New Note')}</strong>
          <span class="note-card-chevron">${svg('i-chevron-right')}</span>
        </span>
        <span class="note-card-preview" data-note-card-preview>${esc(note.body.replace(/\n/g, ' ') || 'No additional text')}</span>
        <span class="note-card-date">${esc(note.date)}</span>
      </button>`;
  }

  function notesListHTML() {
    return NOTES.map((note, index) => noteCard(note, index)).join('');
  }

  function notesRoot() {
    return `
      <div class="app-view app-notes">
        ${statusBar(false)}
        ${appHeader({
          title: 'Notes',
          theme: 'is-notes',
          actions: iconButton('i-plus', 'New note', 'data-new-note')
        })}
        <div class="app-body notes-body">
          <div class="notes-search">${svg('i-search')}<span>Search</span></div>
          <p class="notes-section-title">Today</p>
          <div class="notes-list" data-notes-list>
            ${notesListHTML()}
          </div>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function noteEditor(index) {
    const note = NOTES[index];
    return `
      <div class="app-view app-notes app-note-editor">
        ${statusBar(false)}
        ${appHeader({ title: 'Note', theme: 'is-notes' })}
        <div class="app-body note-editor-body">
          <p class="note-editor-date">December 27, 2026 at 3:30 PM</p>
          <input class="note-title-input" type="text" value="${esc(note.title)}" placeholder="Title" data-note-title="${index}" aria-label="Note title">
          <textarea class="note-body-input" placeholder="Start writing..." data-note-body="${index}" aria-label="Note text">${esc(note.body)}</textarea>
        </div>
      </div>`;
  }

  function refreshNoteCard(index) {
    const card = $(`[data-note-card="${index}"]`);
    if (!card) return;
    const note = NOTES[index];
    $('[data-note-card-title]', card).textContent = note.title || 'New Note';
    $('[data-note-card-preview]', card).textContent = note.body.replace(/\n/g, ' ') || 'No additional text';
  }

  function createNote() {
    NOTES.unshift({ title: 'New Note', body: '', date: 'Today' });
    const list = $('[data-notes-list]');
    if (list) list.innerHTML = notesListHTML();
    // Re-index the cards after unshift.
    $$('[data-note-card]').forEach((card, index) => {
      card.dataset.note = String(index);
      card.dataset.noteCard = String(index);
      const title = $('[data-note-card-title]', card);
      const preview = $('[data-note-card-preview]', card);
      if (title) title.dataset.noteCardTitle = String(index);
      if (preview) preview.dataset.noteCardPreview = String(index);
    });
    pushSubview(noteEditor(0));
  }

  /* ------------------------------------------------------------------ */
  /* Calendar                                                            */
  /* ------------------------------------------------------------------ */

  function calendarCells() {
    const firstDay = new Date(2026, 11, 1).getDay();
    const daysInMonth = 31;
    const cells = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  function calendarEventsHTML(day) {
    const events = CALENDAR_EVENTS[String(day)] || [];
    if (!events.length) {
      return `<div class="cal-empty"><span>${svg('i-sun')}</span><p>No events today.</p><small>A little room for nothing at all.</small></div>`;
    }
    return events.map((event, index) => `
      <button class="cal-event" type="button" data-cal-event="${day}:${index}">
        <span class="cal-event-time">${esc(event.time)}</span>
        <span class="cal-event-copy"><strong>${esc(event.title)}</strong><small>${esc(event.place)}</small></span>
        <span class="row-chevron">${svg('i-chevron-right')}</span>
      </button>
    `).join('');
  }

  function calendarRoot() {
    return `
      <div class="app-view app-calendar">
        ${statusBar(false)}
        ${appHeader({
          title: 'Calendar',
          actions: `<button class="text-button" type="button" data-cal-today>Today</button>`
        })}
        <div class="app-body cal-body">
          <div class="cal-month-row">
            <div>
              <p class="cal-month">December</p>
              <p class="cal-year">2026</p>
            </div>
            <div class="cal-nav">
              <button type="button" data-toast="The demo is set to December 2026" aria-label="Previous month">${svg('i-chevron-left')}</button>
              <button type="button" data-toast="The demo is set to December 2026" aria-label="Next month">${svg('i-chevron-right')}</button>
            </div>
          </div>
          <div class="cal-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
          <div class="cal-grid" data-cal-grid>
            ${calendarCells().map(day => day === null
              ? '<span class="cal-day is-empty"></span>'
              : `<button class="cal-day${day === selectedCalendarDay ? ' is-selected' : ''}${CALENDAR_EVENTS[String(day)] ? ' has-event' : ''}" type="button" data-cal-day="${day}"><span>${day}</span>${CALENDAR_EVENTS[String(day)] ? '<i></i>' : ''}</button>`
            ).join('')}
          </div>
          <div class="cal-divider"></div>
          <p class="cal-selected-label" data-cal-selected-label>Sunday, December 27</p>
          <div class="cal-events" data-cal-events>${calendarEventsHTML(selectedCalendarDay)}</div>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function selectCalendarDay(day) {
    selectedCalendarDay = day;
    $$('[data-cal-day]').forEach(button => button.classList.toggle('is-selected', Number(button.dataset.calDay) === day));
    const label = $('[data-cal-selected-label]');
    const events = $('[data-cal-events]');
    if (label) {
      const weekday = new Date(2026, 11, day).toLocaleDateString('en-US', { weekday: 'long' });
      label.textContent = `${weekday}, December ${day}`;
    }
    if (events) events.innerHTML = calendarEventsHTML(day);
  }

  function calendarEventDetail(key) {
    const [dayString, indexString] = key.split(':');
    const day = Number(dayString);
    const index = Number(indexString);
    const event = (CALENDAR_EVENTS[String(day)] || [])[index];
    if (!event) return '';
    const weekday = new Date(2026, 11, day).toLocaleDateString('en-US', { weekday: 'long' });
    const endTime = (() => {
      const match = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return '';
      let hour = Number(match[1]) % 12;
      if (match[3].toUpperCase() === 'PM') hour += 12;
      const end = new Date(2026, 11, day, hour, Number(match[2]) + 60);
      return end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    })();
    return `
      <div class="app-view app-calendar">
        ${statusBar(false)}
        ${appHeader({ title: 'Event', actions: `<button class="text-button" type="button" data-toast="Editing is not part of this demo">Edit</button>` })}
        <div class="app-body event-detail-body">
          <p class="event-detail-day">${weekday}, December ${day}, 2026</p>
          <h2>${esc(event.title)}</h2>
          <p class="event-detail-time">${esc(event.time)}${endTime ? ` – ${esc(endTime)}` : ''}</p>
          <div class="event-detail-row">${svg('i-location')}<span>${esc(event.place)}</span></div>
          <p class="event-detail-notes">${esc(event.detail)}</p>
          <div class="event-detail-actions">
            <button type="button" data-toast="Reminder set for 30 minutes before">${svg('i-bell')}<span>Remind me</span></button>
            <button type="button" data-toast="Event shared">${svg('i-share')}<span>Share</span></button>
          </div>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Settings                                                            */
  /* ------------------------------------------------------------------ */

  function settingsIcon(className, inner) {
    return `<span class="settings-icon ${className}" aria-hidden="true">${inner}</span>`;
  }

  function settingToggleRow({ icon, color, label, key, on = false, value = '' }) {
    return `
      <div class="settings-row">
        ${settingsIcon(color, icon)}
        <span class="settings-label">${esc(label)}</span>
        <span class="settings-value">${esc(value)}</span>
        <button class="switch${on ? ' is-on' : ''}" type="button" data-toggle-setting="${key}" aria-label="${esc(label)}" aria-pressed="${on}"><span></span></button>
      </div>`;
  }

  function settingLinkRow({ icon, color, label, value = '', key = '', chevron = true }) {
    return `
      <button class="settings-row" type="button" ${key ? `data-setting="${key}"` : 'data-toast="This setting is not part of the demo"'}>
        ${settingsIcon(color, icon)}
        <span class="settings-label">${esc(label)}</span>
        <span class="settings-value">${esc(value)}</span>
        ${chevron ? `<span class="row-chevron">${svg('i-chevron-right')}</span>` : ''}
      </button>`;
  }

  const WORKS_CITED_ENTRIES = [
    "ABBA. “Money, Money, Money.” ABBA Gold, Polar Music International, 2008, Spotify, https://open.spotify.com/track/29FNeqjOV2kPWGS55qhtGB?si=eed9717f7d204d0b.",
    "“Aesthetic Heart Wallpapers.” PixelsTalk, https://www.pixelstalk.net/aesthetic-heart-wallpapers/.",
    "AntiqueHugger. “Enchanted Evening Barbie Doll – Vintage Mattel Collector Edition –Hollywood Glamour Classic.” Etsy, Etsy, 9 Oct. 2026, https://www.etsy.com/uk/listing/4518568848/enchanted-evening-barbie-doll-vintage?show_sold_out_detail=1&ref=nla_listing_details. Accessed 15 Nov. 2026.",
    "Aqua. “Barbie Girl.” Aquarium (Special Edition), Universal Music, 1997, Spotify, https://open.spotify.com/track/5ZrDlcxIDZyjOzHdYW1ydr?si=b6a5b12f670f429f.",
    "Asonsiga. “Handmade 8 Inch Waldorf Knitted Doll, Style 4.” Amazon, https://www.amazon.com/Asonsiga-Handmade-Removable-Cashmere-Companion/dp/B0HGM6SQRC/. Accessed 15 Nov. 2026.",
    "Barbie. “Barbie Collector BMFC Flower Dress Barbie Doll.” Amazon, https://www.amazon.ae/Barbie-Collector-BMFC-Flower-Dress/dp/B00GRMJJ84. Accessed 15 Nov. 2026.",
    "Barbie. “Wedding Day Midge.” Amazon, https://www.amazon.com.au/Barbie-Plastic-Wedding-Unisex-figure/dp/B0D89JKR8F. Accessed 15 Nov. 2026.",
    "Batiyeer. “Batiyeer 5pcs 18 Inch Doll Bed Accessories Pink Bow Doll Bedding Set.” Amazon, https://www.amazon.com/Batiyeer-Accessories-Bedding-Ruffled-Blanket/dp/B0H6FTM3QG/. Accessed 17 Nov. 2026.",
    "“Brunette Ken in ‘Business Appointment’ Costume, 1966.” Theriault’s, https://www.theriaults.com/events/listing/2478/brunette-ken-in-business-appointment-costume-1966. Accessed 15 Nov. 2026.",
    "BTFBM. “BTFBM Womens Summer 2026 Casual Maxi Dresses Lightweight Short Sleeve Dress.” Amazon, https://www.amazon.com/BTFBM-Dresses-Lightweight-Elastic-Pockets/dp/B0DR2DXMC6/. Accessed 17 Nov. 2026.",
    "Burson, Nancy. Aged Barbie. 1994. San Francisco Museum of Modern Art, https://www.sfmoma.org/artwork/2021.146/.",
    "Carpenter, Sabrina. “Goodbye.” Man’s Best Friend, Island Records, 2025, Spotify, https://open.spotify.com/track/4tVVmShMF2PYdLqcejrsy2?si=9308dce6a16449bf.",
    "Cass, Chez. “Remember The Heart Family? Back in the mid-80s, Barbie took on a whole new role — as a mom! The Barbie Heart Family, introduced by Mattel in 1985, brought a softer, sweeter side to Barbie’s world. Did you have any Heart Family dolls or sets growing up? Which one was your favorite?” Facebook, 5 Oct. 2025, https://www.facebook.com/groups/281238235383286/posts/3040366899470392/.",
    "Clapton, Eric. “Wonderful Tonight.” Spotify, https://open.spotify.com/track/6zC0mpGYwbNTpk9SKwh08f?si=d8756d051dc64c1f.",
    "Dave DollTown. “Poppy Parker Baby It’s You.” Flickr, 22 Nov. 2018, https://www.flickr.com/photos/89174265@N06/45952835452/.",
    "DoreenBeads. “Handkerchiefs for Women, 10Pcs Vintage Cotton Printed Hankies.” Amazon, https://www.amazon.com/Handkerchiefs-Vintage-Printed-Printing-Hankies/dp/B0GF6FNNCB/. Accessed 17 Nov. 2026.",
    "EAT. “Artificial Christmas Tree,4.5FT Christmas with Over 600 Branch Tips, Décor w/Easy Assembly.” Amazon, https://www.amazon.com/Artificial-Christmas-4-5FT-Branch-Assembly/dp/. Accessed 17 Nov. 2026.",
    "Eilish, Billie. “What Was I Made For? [From The Motion Picture “Barbie”].” Darkroom/Interscope Records, 2023, Spotify, https://open.spotify.com/track/6wf7Yu7cxBSPrRlWeSeK0Q?si=c9ff772c171d4e47.",
    "FairyGlim. “33 FT 100LEDs Christmas Lights Plug in,Outdoor Indoor Connectable Fairy Lights with Timer and 8 Modes,Christmas Tree Lights for Garden Party Wedding Christmas Decoration(Warm White).” Amazon, https://www.amazon.com/100LEDs-Christmas-Outdoor-Connectable-Decoration/dp/B0FGY6YF45/. Accessed 17 Nov. 2026.",
    "FindsfromtheCabin. “Silken Flame Porcelain Barbie from the Porcelain Treasures Collection.” Etsy, Etsy, 19 Aug. 2026, https://www.etsy.com/uk/listing/1541889489/silken-flame-porcelain-barbie-from-the. Accessed 15 Nov. 2026.",
    "Frieseke, Frederick Carl. “The Bird Cage.” c. 1910. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Frederick_Carl_Frieseke_-_The_Bird_Cage_-_1917.02_-_New_Britain_Museum_of_American_Art.jpg.",
    "Foulkes, Nick. “Franck Muller: The Man Who Invented The ‘It’ Watch.” GQ Magazine, 2 Jan. 2019, https://www.gq-magazine.co.uk/article/franck-muller-the-man-who-invented-the-it-watch.",
    "GILFASHI. “Reversible Pashmina Shawl Wrap for Women Gifts, 75x25 inch.” Amazon, https://www.amazon.com/GILFASHE-Womens-Pashmina-Shawls-Vintage/dp/B0HCC183TB/. Accessed 15 Nov. 2026.",
    "Hapdream. “2pcs Plastic Toy Sword for Kids Boys, 17.3\" Fake Medieval Knight Sword.” Amazon, https://www.amazon.com/Medieval-Fighting-Halloween-Role-Play-Accessory/dp/B0HF4MZ7P9/. Accessed 17 Nov. 2026.",
    "Ibsen, Henrik. A Doll’s House. Project Gutenberg, https://www.gutenberg.org/files/2542/2542-h/2542-h.htm.",
    "JOIONE. “Christmas Tree Candles, 10 Pack Flameless Candles for Christmas Tree.” Amazon, https://www.amazon.com/JOIONE-Christmas-Candles-Flameless-Flickering/dp/B0D639456D/. Accessed 15 Nov. 2026.",
    "Lewtemi. “Lewtemi Gold Trumpet Musical Instruments Toy for Kid Fake Plastic.” Amazon, https://www.amazon.com/Lewtemi-Instruments-Preschool-Instrument-Performances/dp/B0DM5JV4L7/. Accessed 15 Nov. 2026.",
    "Lipa, Dua. “Dance The Night.” Barbie The Album, Atlantic Recording Corporation, 2023, Spotify, https://open.spotify.com/track/11C4y2Yz1XbHmaQwO06s9f?si=cc43e141482045b3.",
    "LumBelle. “24 Pcs Christmas Artificial Poinsettia Flowers 5.9\".” Amazon, https://www.amazon.com/LumBelle-Christmas-Artificial-Poinsettia-Poinsettias/dp/B0FMYG5556/. Accessed 15 Nov. 2026.",
    "“Macarons.” Pierre Hermé, https://www.pierreherme.com/en/macarons.html. Accessed 15 Nov. 2026.",
    "Mattel, Inc. v. MCA Records, Inc., vol. 296 F.3d 894 (9th Cir, 2002). Casetext, https://web.archive.org/web/20190502112119/https:/casetext.com/case/mattel-inc-v-mca-records-inc. Accessed 14 Nov. 2026.",
    "Milidog. “i refreshed this DOTW Italian barbie from 1992!” Reddit, 21 Mar. 2026, https://www.reddit.com/r/Barbie/comments/1rzzgtl/i_refreshed_this_dotw_italian_barbie_from_1992/.",
    "Milivojevic, Marko. “new year, nightlife, party, celebration, nightclub, atmosphere, people, hotel, ceremony, spotlight.” Pixnio, 31 Dec. 2020, https://pixnio.com/media/new-year-nightlife-party-celebration-nightclub#img_info.",
    "PONYEEHAW. “Ride on Horse Toys, Kids Riding Horse Toys Ride on Toys for 3-6 Years Old, Premium Plush Animals Toys Walking Horse with Wheels (Brown, 25.9\" L x 12.2\" W x 28.3\" H).” Amazon, https://www.amazon.com/PONYEEHAW-Walking-Horse-Plush-Animal/dp/. Accessed 15 Nov. 2026.",
    "Reflections By Talea. “{Barbie & Ken have a baby!} Kentucky Newborn Photographer.” Reflections By Talea Photography, 20 Mar. 2020, https://www.reflectionsbytalea.com/blog-post/barbie-ken-have-a-baby-kentucky-newborn-photographer.",
    "SIX and Abby Mueller. “Heart of Stone.” SIX: LIVE ON OPENING NIGHT (Original Broadway Cast Recording), 6 Music Ltd, 2022, Spotify, https://open.spotify.com/track/0ezEGdFPYtRHzILpYuDOhE?si=b56f02d9fab74d1e.",
    "Soo, Phillipa. “Burn.” Hamilton (Original Broadway Cast Recording), WEA International Inc., 2015, Spotify, https://open.spotify.com/track/4B3qvzOMzLQXLeYgPsG3KA?si=d14f6a0902564262.",
    "Special Edition 1998 Tree Trimming Barbie Christmas Sweater Mattel 22967 Gift. eBay, eBay Inc., 6 Mar. 2026, https://www.ebay.co.uk/itm/194217952667. Accessed 15 Nov. 2026.",
    "TasteAtlas [@tasteatlas]. “100 Best Chocolates in the World.” Instagram, 21 Oct. 2025, https://www.instagram.com/p/DQEuyMRiPXZ/?utm_source=ig_web_copy_link&xtok=NTc4MTIwNjQ2YQ==.",
    "The Bleachers. “Merry Christmas, Please Don’t Call.” Dirty Hit, 2024, Spotify, https://open.spotify.com/track/0UOG0zUn7t8m8QcxfzR7AH?si=da5169c6004e442f.",
    "The Smiths. “I Know It’s Over - 2011 Remaster.” The Queen Is Dead, Rhino UK, 2011, Spotify, https://open.spotify.com/track/3M2bD9SMYnJIPdrTKUnBd3?si=0dd80e87985d4574.",
    "Urban CoCo. “Urban CoCo Embroidered Scarf for Women, Tassel Shawl, Soft Lightweight Wrap.” Amazon, https://www.amazon.com/Womens-Embroidered-Oversize-Tassel-Shawl/dp/B07YS89WB5/. Accessed 17 Nov. 2026.",
    "Vtg 1984 HEART FAMILY BARBIE KEN Boy Girl & True Heart Dog Cottage Dream Wicker. eBay, eBay Inc., 15 May 2026, https://www.ebay.com/itm/277875786304. Accessed 15 Nov. 2026.",
    "Wkior. “Womens Summer Ruffle Short Sleeve V Neck Shift Dress.” Amazon, https://www.amazon.com/Wkior-Womens-Dresses-Elegant-Summer/dp/B09T8WM5TT/. Accessed 15 Nov. 2026.",
    "WULFUL. “WULFUL Boys' Formal Suit Set,Slim Fit Tuxedo Wedding Suit 6-16 Years with Adjustable Waist.” Amazon, https://www.amazon.com/WULFUL-Formal-Tuxedo-Wedding-Adjustable/dp/B0G8HR5YJH/. Accessed 15 Nov. 2026.",
    "Youngson, Nick. “Reputation.” Picpedia, https://www.picpedia.org/highway-signs/r/reputation.html."
];

  function settingsRoot() {
    return `
      <div class="app-view app-settings settings-redesign">
        ${statusBar(false)}
        ${appHeader({ title: 'Settings', theme: 'is-settings' })}
        <div class="app-body settings-body">
          <div class="settings-account-card">
            <span class="settings-avatar" aria-hidden="true"></span>
            <strong>Nora Helmer</strong>
          </div>

          <div class="settings-group settings-menu-group">
            <div class="settings-row settings-adaptation-row">
              ${settingsIcon('blue', svg('i-bluetooth'))}
              <span class="settings-label">Adaptation Information</span>
              <span class="settings-toggle-box">
                <span class="settings-toggle-state" data-adaptation-state>Off</span>
                <button class="switch" type="button" data-adaptation-toggle aria-label="Adaptation Information" aria-pressed="false"><span></span></button>
              </span>
            </div>
            <div class="settings-adaptation-note" data-adaptation-note hidden>
              <p>This work is an adaptation of Henrik Ibsen's <i>A Doll's House</i> by Xiao Yi, submitted as part of the creative assignment for ENGL6081 Global Fictions (Semester 1, 2026) at The University of Hong Kong.</p>
            </div>
            ${settingLinkRow({ icon: svg('i-control'), color: 'gray', label: 'Works Cited', key: 'works-cited' })}
            ${settingLinkRow({ icon: svg('i-bell'), color: 'red', label: 'GenAI Use Declaration (Abridged)', key: 'genai' })}
          </div>

          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function settingsDetailTopbar(title) {
    return `
      <header class="settings-detail-topbar">
        <button class="settings-detail-back" type="button" data-back aria-label="Back to Settings">
          ${svg('i-chevron-left')}<span>Settings</span>
        </button>
        <h1>${esc(title)}</h1>
        <span class="settings-detail-spacer" aria-hidden="true"></span>
      </header>`;
  }

  const WORKS_CITED_ITALIC_TERMS = [
    "Special Edition 1998 Tree Trimming Barbie Christmas Sweater Mattel 22967 Gift",
    "SIX: LIVE ON OPENING NIGHT (Original Broadway Cast Recording)",
    "Hamilton (Original Broadway Cast Recording)",
    "San Francisco Museum of Modern Art",
    "Reflections By Talea Photography",
    "Mattel, Inc. v. MCA Records, Inc.",
    "Darkroom/Interscope Records",
    "Aquarium (Special Edition)",
    "Project Gutenberg",
    "Wikimedia Commons",
    "Barbie The Album",
    "Man’s Best Friend",
    "The Queen Is Dead",
    "A Doll’s House",
    "GQ Magazine",
    "Pierre Hermé",
    "Theriault’s",
    "Aged Barbie",
    "ABBA Gold",
    "Dirty Hit",
    "eBay Inc.",
    "Casetext",
    "Facebook",
    "Instagram",
    "Picpedia",
    "PixelsTalk",
    "Spotify",
    "Amazon",
    "Etsy",
    "eBay",
    "Flickr",
    "Reddit",
    "Pixnio"
  ];

  function escapeWorkRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function formatWorkEntry(entry) {
    const urlIndex = entry.indexOf('http');
    const head = urlIndex === -1 ? entry : entry.slice(0, urlIndex);
    const tail = urlIndex === -1 ? '' : entry.slice(urlIndex);
    const termPattern = WORKS_CITED_ITALIC_TERMS
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeWorkRegExp)
      .join('|');
    let htmlHead = esc(head).replace(new RegExp(`(${termPattern})`, 'g'), '<i>$1</i>');
    const dollBook = /A Doll(?:’|')s House/;
    if (dollBook.test(head) && !htmlHead.includes('<i>A Doll')) {
      htmlHead = htmlHead.replace(dollBook, match => `<i>${match}</i>`);
    }
    return htmlHead + esc(tail);
  }

  function settingsWorksCitedPage() {
    return `
      <div class="app-view app-settings settings-detail-app" data-settings-detail-page="works">
        ${statusBar(false)}
        ${settingsDetailTopbar('Works Cited')}
        <div class="works-cited-page" style="height: calc(100% - 44px); overflow-y: auto; padding: 0;">
          <div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 2; text-align: left; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">Works Cited</div>
            ${WORKS_CITED_ENTRIES.map(entry => `<p style="margin-left: 0.5in; text-indent: -0.5in; margin-bottom: 0;">${formatWorkEntry(entry)}</p>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function settingsGenAIPage() {
    return `
      <div class="app-view app-settings settings-detail-app" data-settings-detail-page="genai">
        ${statusBar(false)}
        ${settingsDetailTopbar('GenAI Use Declaration')}
        <div class="genai-page">
          <p>I declare that generative artificial intelligence (GenAI) was used in the creation of this assignment.</p>
          <p>This interactive phone was generated using DeepSeek Harness (model: DeepSeek-V4.1-Flash; reasoning effort set at high), and the prompts were themselves generated with the assistance of DeepSeek web chat (model: DeepSeek-V4.1-Flash-1017).</p>
          <p>The actual content found within the apps of this interactive phone remains my original effort in adapting Henrik Ibsen's <i>A Doll's House</i>.</p>
          <p>For further information, please refer to my uploaded "GenAI Use Declaration Form".</p>
        </div>
      </div>`;
  }

  function toggleAdaptation(button) {
    const isOn = !button.classList.contains('is-on');
    button.classList.toggle('is-on', isOn);
    button.setAttribute('aria-pressed', String(isOn));
    const app = button.closest('.app-settings');
    const state = app ? app.querySelector('[data-adaptation-state]') : null;
    const note = app ? app.querySelector('[data-adaptation-note]') : null;
    if (state) state.textContent = isOn ? 'On' : 'Off';
    if (note) note.hidden = !isOn;
  }

  const SETTINGS_DETAILS = {
    account: {
      title: 'Apple Account',
      body: `
        <div class="settings-profile-card"><span class="avatar large pink">A</span><h3>Alex Chen</h3><p>alex.chen@example.com</p></div>
        <div class="settings-group">
          ${settingLinkRow({ icon: svg('i-cloud'), color: 'blue', label: 'iCloud', value: 'On' })}
          ${settingLinkRow({ icon: svg('i-bag'), color: 'orange', label: 'Media & Purchases' })}
          ${settingLinkRow({ icon: svg('i-location'), color: 'green', label: 'Find My' })}
        </div>`
    },
    wifi: {
      title: 'Wi-Fi',
      body: `
        <div class="settings-group">
          ${settingToggleRow({ icon: svg('i-wifi'), color: 'blue', label: 'Wi-Fi', key: 'wifi-main', on: true, value: 'Home' })}
        </div>
        <p class="settings-caption">Networks</p>
        <div class="settings-group">
          ${['Home', 'Little Cafe', 'Library Guest', 'Mira\'s iPhone'].map((network, index) => `
            <button class="settings-row" type="button" data-toast="${index === 0 ? 'Connected to Home' : `Connecting to ${network}`}">
              <span class="settings-label">${esc(network)}</span>
              <span class="settings-value">${index === 0 ? svg('i-check') : svg('i-lock')}</span>
              <span class="row-chevron">${svg('i-chevron-right')}</span>
            </button>`).join('')}
        </div>`
    },
    bluetooth: {
      title: 'Bluetooth',
      body: `
        <div class="settings-group">${settingToggleRow({ icon: svg('i-bluetooth'), color: 'blue', label: 'Bluetooth', key: 'bluetooth-main', on: true, value: 'On' })}</div>
        <div class="settings-group">
          ${[['Little Speaker', 'Connected'], ['AirPods', 'Not Connected'], ['Kitchen Scale', 'Not Connected']].map(([name, status]) => `
            <button class="settings-row" type="button" data-toast="${name}: ${status}">
              <span class="settings-label">${name}</span><span class="settings-value">${status}</span>
            </button>`).join('')}
        </div>`
    },
    general: {
      title: 'General',
      body: `
        <div class="settings-group">
          ${settingLinkRow({ icon: svg('i-info'), color: 'gray', label: 'About', value: 'iPhone 6' })}
          ${settingLinkRow({ icon: svg('i-download'), color: 'gray', label: 'Software Update', value: 'Up to Date' })}
          ${settingLinkRow({ icon: svg('i-storage'), color: 'gray', label: 'iPhone Storage' })}
          ${settingLinkRow({ icon: svg('i-keyboard'), color: 'gray', label: 'Keyboard' })}
        </div>`
    },
    about: {
      title: 'About',
      body: `
        <div class="about-phone">
          <span class="about-phone-art">${svg('brand-apple')}</span>
          <h3>iPhone 6</h3>
          <p>Little phone demo</p>
        </div>
        <div class="settings-group">
          <div class="settings-row"><span class="settings-label">Name</span><span class="settings-value">Alex's iPhone</span></div>
          <div class="settings-row"><span class="settings-label">Software Version</span><span class="settings-value">12.5.7</span></div>
          <div class="settings-row"><span class="settings-label">Model Name</span><span class="settings-value">iPhone 6</span></div>
          <div class="settings-row"><span class="settings-label">Capacity</span><span class="settings-value">64 GB</span></div>
          <div class="settings-row"><span class="settings-label">Serial Number</span><span class="settings-value">C39N4LITTLE6</span></div>
        </div>`
    }
  };

  function settingsDetail(key) {
    if (key === 'works-cited') return settingsWorksCitedPage();
    if (key === 'genai') return settingsGenAIPage();
    if (key === 'about') return settingsSubview(SETTINGS_DETAILS.about);
    const detail = SETTINGS_DETAILS[key] || {
      title: capitalize(key.replace(/-/g, ' ')),
      body: `
        <div class="settings-group settings-info-group">
          <p>This setting is included for the look and feel of the demo.</p>
          <p>Try Airplane Mode, Wi-Fi, Bluetooth, or General for a little more interaction.</p>
        </div>`
    };
    if (key === 'general') {
      detail.body = detail.body.replace('label: \'About\'', 'label: \'About\'');
    }
    return settingsSubview(detail);
  }

  function settingsSubview(detail) {
    let body = detail.body;
    if (detail.title === 'General') {
      body = `
        <div class="settings-group">
          <button class="settings-row" type="button" data-setting="about">${settingsIcon('gray', svg('i-info'))}<span class="settings-label">About</span><span class="settings-value">iPhone 6</span><span class="row-chevron">${svg('i-chevron-right')}</span></button>
          ${settingLinkRow({ icon: svg('i-download'), color: 'gray', label: 'Software Update', value: 'Up to Date' })}
          ${settingLinkRow({ icon: svg('i-storage'), color: 'gray', label: 'iPhone Storage' })}
          ${settingLinkRow({ icon: svg('i-keyboard'), color: 'gray', label: 'Keyboard' })}
        </div>`;
    }
    return `
      <div class="app-view app-settings">
        ${statusBar(false)}
        ${appHeader({ title: detail.title, theme: 'is-settings' })}
        <div class="app-body settings-body">
          ${body}
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function toggleSetting(button) {
    const isOn = !button.classList.contains('is-on');
    button.classList.toggle('is-on', isOn);
    button.setAttribute('aria-pressed', String(isOn));
    const label = button.getAttribute('aria-label') || 'Setting';
    showToast(`${label} ${isOn ? 'on' : 'off'}`);
  }

  /* ------------------------------------------------------------------ */
  /* Photos                                                              */
  /* ------------------------------------------------------------------ */

  function allPhotos() {
    return [...capturedPhotos, ...PHOTOS];
  }

  function photoStyle(item) {
    return item.style ? ` style="${item.style}"` : '';
  }

  function photoClass(item) {
    return item.cls || '';
  }

  function photoGridHTML() {
    return allPhotos().map((photo, index) => `
      <button class="photo-thumb ${photoClass(photo)}" type="button" data-photo="${index}" aria-label="${esc(photo.label || 'Photo')}"${photoStyle(photo)}></button>
    `).join('');
  }

  function photosRoot() {
    return `
      <div class="app-view app-photos">
        ${statusBar(false)}
        ${appHeader({ title: 'Photos', actions: `<button class="text-button" type="button" data-toast="Select multiple photos">Select</button>` })}
        <div class="app-body photos-body">
          <div class="photos-summary">
            <h2>Library</h2>
            <p>December 27, 2026 · Shanghai</p>
          </div>
          <div class="photos-grid" data-photos-grid>
            ${photoGridHTML()}
          </div>
          <div class="bottom-safe"></div>
        </div>
        <nav class="photos-tabbar" aria-hidden="true">
          <span class="is-active">${svg('i-photo')}<small>Library</small></span>
          <span>${svg('i-heart')}<small>For You</small></span>
          <span>${svg('i-grid')}<small>Albums</small></span>
          <span>${svg('i-search')}<small>Search</small></span>
        </nav>
      </div>`;
  }

  function photoViewer(index) {
    const photo = allPhotos()[index];
    if (!photo) return '';
    return `
      <div class="app-view app-photo-viewer">
        ${statusBar(true)}
        <header class="photo-viewer-header">
          <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
          <div class="photo-viewer-title"><strong>December 27, 2026</strong><small>Shanghai</small></div>
          <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
        </header>
        <div class="photo-full ${photoClass(photo)}"${photoStyle(photo)} role="img" aria-label="${esc(photo.label || 'Photo')}"></div>
        <div class="photo-viewer-toolbar">
          <button type="button" data-toast="Shared">${svg('i-share')}</button>
          <button type="button" class="photo-heart" data-photo-like aria-label="Favorite">${svg('i-heart')}</button>
          <button type="button" data-toast="Photo info">${svg('i-info')}</button>
          <button type="button" data-toast="This is a demo — the photo stays safe">${svg('i-trash')}</button>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Weather                                                             */
  /* ------------------------------------------------------------------ */

  function weatherRoot() {
    return `
      <div class="app-view app-weather">
        ${statusBar(true)}
        ${appHeader({ title: 'Weather', theme: 'is-glass' })}
        <div class="app-body weather-body">
          <div class="weather-location"><h2>A Doll's House</h2><p>Sunday, December 27</p></div>
          <div class="weather-now">
            <span class="weather-temp">2°</span>
            <div class="weather-condition"><strong>Partly Cloudy</strong><span>H:3° L:-4°</span></div>
          </div>
          <div class="weather-art" aria-hidden="true">
            <span class="weather-art-sun"></span>
            <span class="weather-art-cloud one"></span>
            <span class="weather-art-cloud two"></span>
          </div>
          <p class="weather-note">A soft, bright afternoon. Light wind from the east.</p>
          <div class="weather-hourly">
            ${[['Now', '2°', 'sun'], ['4 PM', '1°', 'sun'], ['5 PM', '0°', 'cloud'], ['6 PM', '-2°', 'cloud'], ['7 PM', '-3°', 'moon'], ['8 PM', '-4°', 'moon']].map(([hour, temp, icon]) => `
              <div class="weather-hour"><span>${hour}</span><span class="weather-mini-icon ${icon}"></span><strong>${temp}</strong></div>
            `).join('')}
          </div>
          <div class="weather-forecast">
            ${[['Mon', 'sun', 2, -4], ['Tue', 'cloud', 1, -5], ['Wed', 'rain', 0, -6], ['Thu', 'cloud', 3, -3], ['Fri', 'sun', 4, -1]].map(([day, icon, high, low]) => {
              const start = ((low - -6) / 10) * 100;
              const width = ((high - low) / 10) * 100;
              return `
              <div class="weather-day"><span>${day}</span><span class="weather-mini-icon ${icon}"></span><span class="weather-low">${low}°</span><span class="weather-bar"><i style="margin-left:${start}%;width:${width}%"></i></span><span class="weather-high">${high}°</span></div>
            `;
            }).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Phone                                                               */
  /* ------------------------------------------------------------------ */

  const PHONE_NAV_ICONS = {
    favorites: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.7l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.7z"/></svg>',
    recents: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><path d="M12 7.2v5.1l3.4 2"/></svg>',
    contacts: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.2 20c.8-3.2 3.4-5.1 6.8-5.1s6 1.9 6.8 5.1"/></svg>',
    keypad: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="1.2"/><circle cx="12" cy="6" r="1.2"/><circle cx="18" cy="6" r="1.2"/><circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/><circle cx="6" cy="18" r="1.2"/><circle cx="12" cy="18" r="1.2"/><circle cx="18" cy="18" r="1.2"/></svg>',
    voicemail: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7" cy="12" r="3.7"/><circle cx="17" cy="12" r="3.7"/><path d="M7 15.7h10"/></svg>'
  };

  function phoneRoot() {
    const recents = [
      { name: 'Torvald (10)', subtitle: "A Doll's House", time: '1:25 AM' },
      { name: 'Torvald (4)', subtitle: "A Doll's House", time: '1:13 AM' },
      { name: 'Torvald', subtitle: "A Doll's House", time: '1:07 AM' },
      { name: 'Torvald', subtitle: "A Doll's House", time: '0:58 AM' },
      { name: 'Torvald', subtitle: "A Doll's House", time: '0:50 AM' }
    ];
    return `
      <div class="app-view app-phone prx-app">
        ${statusBar(false)}
        <header class="prx-topbar">
          <button class="prx-back" type="button" data-back aria-label="Back to home screen">${svg('i-chevron-left')}</button>
          <h1 class="prx-title">Recents</h1>
          <span class="prx-edit">Edit</span>
        </header>
        <div class="prx-filters" role="tablist" aria-label="Recents filter">
          <button class="prx-filter" type="button" role="tab" aria-selected="false">All</button>
          <button class="prx-filter is-active" type="button" role="tab" aria-selected="true">Missed</button>
        </div>
        <div class="prx-list">
          ${recents.map(row => `
            <button class="prx-recent" type="button" data-call="${esc(row.name.replace(/\\s*\\(\\d+\\)$/, ''))}">
              <span class="prx-recent-copy">
                <strong class="is-missed">${esc(row.name)}</strong>
                <small>${esc(row.subtitle)}</small>
              </span>
              <span class="prx-recent-meta">
                <span class="prx-time">${esc(row.time)}</span>
                <span class="prx-info" aria-hidden="true">i</span>
              </span>
            </button>
          `).join('')}
        </div>
        <nav class="prx-tabs" aria-label="Phone">
          <span class="prx-tab"><span class="prx-tab-icon">${PHONE_NAV_ICONS.favorites}</span><span>Favorites</span></span>
          <span class="prx-tab is-active"><span class="prx-tab-icon">${PHONE_NAV_ICONS.recents}</span><span>Recents</span></span>
          <span class="prx-tab"><span class="prx-tab-icon">${PHONE_NAV_ICONS.contacts}</span><span>Contacts</span></span>
          <span class="prx-tab"><span class="prx-tab-icon">${PHONE_NAV_ICONS.keypad}</span><span>Keypad</span></span>
          <span class="prx-tab"><span class="prx-tab-icon">${PHONE_NAV_ICONS.voicemail}</span><span>Voicemail</span></span>
        </nav>
      </div>`;
  }

  function callView(name) {
    return `
      <div class="app-view app-call">
        ${statusBar(true)}
        <div class="call-screen">
          <div class="call-top">
            <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
            <span>Calling</span>
            <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
          <div class="call-person">
            <span class="call-avatar"><span class="avatar large pink">${esc(name.charAt(0))}</span><span class="call-pulse"></span></span>
            <h2>${esc(name)}</h2>
            <p>mobile</p>
            <small>Calling...</small>
          </div>
          <div class="call-actions">
            <button type="button" data-toast="Microphone muted">${svg('i-mic')}<span>mute</span></button>
            <button type="button" data-toast="Speaker on">${svg('i-speaker')}<span>speaker</span></button>
            <button type="button" data-toast="Keypad">${svg('i-grid')}<span>keypad</span></button>
          </div>
          <button class="call-end" type="button" data-back aria-label="End call">${svg('i-phone')}</button>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Safari                                                              */
  /* ------------------------------------------------------------------ */

  const SAFARI_FAVORITES = [
    { name: 'PIERRE HERMÉ', initial: 'P', tone: 'dark', site: 'apple' },
    { name: 'Indeed', initial: 'I', tone: 'blue', site: 'wikipedia' },
    { name: 'Vogue', initial: 'V', tone: 'blue', site: 'times' },
    { name: 'Weather', initial: 'W', tone: 'green', site: 'weather' }
  ];

  const SAFARI_HISTORY = [
    'how to get a divorce',
    'will my children remember me',
    'is it illegal to forge cosigner signature',
    'best chocolate recommendation',
    'remote contract jobs hiring immediately',
    'remote contract jobs part time'
  ];

  function safariRoot() {
    return `
      <div class="app-view app-safari">
        ${statusBar(false)}
        ${appHeader({ title: 'Safari', actions: iconButton('i-plus', 'New tab', 'data-toast="A new tab is ready"') })}
        <div class="app-body safari-body">
          <form class="safari-search" data-safari-form>
            ${svg('i-search')}
            <input type="search" name="query" placeholder="Search or enter website" aria-label="Search or enter website">
          </form>
          <p class="safari-section-title">Favorites</p>
          <div class="safari-favorites">
            ${SAFARI_FAVORITES.map(favorite => `
              <button type="button" class="safari-favorite" data-site="${favorite.site}">
                <span class="fav-icon ${favorite.tone}">${esc(favorite.initial)}</span>
                <span>${esc(favorite.name)}</span>
              </button>
            `).join('')}
          </div>
          <div class="safari-card safari-history">
            <div class="safari-history-body">
              <strong>Search History</strong>
              <div class="safari-history-list">
                ${SAFARI_HISTORY.map(item => `
                  <div class="safari-history-row">
                    <span class="safari-history-icon">${svg('i-search')}</span>
                    <span>${esc(item)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="safari-card">
            <span class="safari-card-icon">${svg('i-lock')}</span>
            <div><strong>Privacy Report</strong><p>Safari prevented 27 trackers from profiling you in the last seven days.</p></div>
          </div>
          <div class="safari-card reading">
            <span class="safari-card-icon">${svg('i-bookmark')}</span>
            <div><strong>Reading List</strong><p>A quiet corner of the internet, saved for later.</p></div>
          </div>
          <div class="bottom-safe"></div>
        </div>
        <div class="safari-toolbar">
          <button type="button" data-toast="No page to go back to">${svg('i-chevron-left')}</button>
          <button type="button" data-toast="No page to go forward to">${svg('i-chevron-right')}</button>
          <button type="button" data-toast="Link copied">${svg('i-share')}</button>
          <button type="button" data-toast="Bookmarks">${svg('i-bookmark')}</button>
          <button type="button" data-toast="Tabs">${svg('i-grid')}</button>
        </div>
      </div>`;
  }

  const SITE_CONTENT = {
    apple: {
      title: 'apple.com',
      brand: 'Apple',
      headline: 'iPhone 6',
      sub: 'Thin. Light. Powerful.',
      body: 'A beautiful 4.7-inch display, an incredibly fast chip, and a design that feels just right in one hand. This little demo is a love letter to the pocket-sized phone.',
      extra: 'The little phone demo is built with HTML, CSS, and JavaScript. No App Store required.'
    },
    wikipedia: {
      title: 'wikipedia.org',
      brand: 'Wikipedia',
      headline: 'IPhone 6',
      sub: 'The free encyclopedia',
      body: 'The iPhone 6 is a smartphone designed by Apple. It was announced in September 2014 and featured a 4.7-inch display, a thinner aluminum body, and the A8 chip.',
      extra: 'The article continues on Wikipedia. This pocket-sized version stops here, with just enough room for the essentials.'
    },
    times: {
      title: 'thetimes.com',
      brand: 'The Times',
      headline: 'The small screen returns',
      sub: 'Design · 4 min read',
      body: 'For a while, phones grew larger every year. Now a quiet counter-trend is emerging: small, intentional devices that ask for less attention, not more.',
      extra: 'The full story is available in the Sunday edition. This preview ends at the good part.'
    },
    weather: {
      title: 'weather.com',
      brand: 'Weather',
      headline: 'Shanghai, China',
      sub: 'Partly Cloudy · 18°',
      body: 'A mild afternoon with light winds from the east. Sunset at 5:02 PM. Tomorrow brings a little more cloud and a high of 21°.',
      extra: 'The seven-day outlook is available in the Weather app. This tiny page stops at today.'
    }
  };

  function safariSite(siteKey, query = '') {
    const site = SITE_CONTENT[siteKey] || {
      title: 'search.example.com',
      brand: 'Search',
      headline: query || 'A quiet corner of the web',
      sub: 'Search results',
      body: 'This is a small, self-contained search result page for the little phone demo. Everything here is fictional, and the back button always works.'
    };
    return `
      <div class="app-view app-safari-site">
        ${statusBar(false)}
        <header class="safari-site-header">
          <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
          <span class="safari-address">${svg('i-lock')} ${esc(site.title)}</span>
          <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
        </header>
        <div class="page-scroll safari-page">
          <div class="site-brand">${esc(site.brand)}</div>
          <h1>${esc(site.headline)}</h1>
          <p class="site-sub">${esc(site.sub)}</p>
          <div class="site-art ${siteKey}"><span>${esc(site.brand)}</span></div>
          <p>${esc(site.body)}</p>
          <p>${esc(site.extra || 'This is a tiny internet for a tiny phone. The back button is always one tap away.')}</p>
          <div class="site-footer">Little web · December 27, 2026</div>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Messages                                                            */
  /* ------------------------------------------------------------------ */

  function messagesRoot() {
    return `
      <div class="app-view app-messages">
        ${statusBar(false)}
        ${appHeader({ title: 'Messages', actions: iconButton('i-plus', 'New message', 'data-toast="New message is not part of this demo"') })}
        <div class="app-body msg-body">
          <div class="msg-search">${svg('i-search')}<span>Search</span></div>
          <div class="msg-list">
            ${MESSAGES.map((chat, index) => `
              <button class="msg-row" type="button" data-msg="${index}">
                ${avatar(chat)}
                <span class="msg-row-copy">
                  <span class="msg-row-top"><strong>${esc(chat.name)}</strong><span>${esc(chat.time)}</span></span>
                  <span class="msg-row-preview">${esc(chat.preview)} ${chat.unread ? `<b>${chat.unread}</b>` : ''}</span>
                </span>
              </button>
            `).join('')}
          </div>
          <div class="bottom-safe"></div>
        </div>
      </div>`;
  }

  function messagesChat(index) {
    const chat = MESSAGES[index];
    const thread = chat.messages.map(message => chatBubble(message, 'msg')).join('');
    return `
      <div class="app-view app-messages app-chat-view">
        ${statusBar(false)}
        <header class="chat-header msg-chat-header">
          <button class="icon-button back" type="button" data-back aria-label="Back">${svg('i-chevron-left')}</button>
          <div class="chat-person">${avatar(chat, 'small')}<span><strong>${esc(chat.name)}</strong><small>iMessage</small></span></div>
          <div class="header-actions">
            <button class="icon-button app-home-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
        </header>
        <div class="chat-thread msg-thread" data-chat-thread>
          <div class="chat-day">Today</div>
          ${thread}
        </div>
        <form class="chat-composer msg-composer" data-chat-form data-chat-index="${index}" data-chat-app="msg">
          <div class="composer-field">
            <button class="composer-plus" type="button" data-toast="Attachments are not part of this demo" aria-label="Add attachment">${svg('i-plus')}</button>
            <input type="text" name="message" placeholder="iMessage" autocomplete="off" aria-label="Message">
          </div>
          <button class="composer-send" type="submit" aria-label="Send message">${svg('i-send')}</button>
        </form>
      </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* Camera                                                              */
  /* ------------------------------------------------------------------ */

  function cameraCaptureStyle() {
    const positions = ['50% 22%', '50% 48%', '50% 72%', '35% 50%', '66% 50%'];
    const position = positions[capturedPhotos.length % positions.length];
    return `background-image:var(--wallpaper-lock);background-position:${position};background-size:cover;filter:saturate(1.05) contrast(1.02);`;
  }

  function cameraRoot() {
    const latest = capturedPhotos[0];
    const thumbStyle = latest ? latest.style : `background-image:var(--wallpaper-lock);background-position:50% 50%;background-size:cover;`;
    return `
      <div class="app-view app-camera">
        <div class="camera-viewfinder"></div>
        <div class="camera-overlay"></div>
        <div class="camera-grid-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        ${statusBar(true)}
        <div class="camera-top">
          <button class="camera-round-button" type="button" data-back aria-label="Close camera">${svg('i-chevron-left')}</button>
          <span class="camera-mode">PHOTO</span>
          <div class="camera-top-actions">
            <button class="camera-round-button" type="button" data-camera-flash aria-label="Toggle flash">${svg('i-flash')}</button>
            <button class="camera-round-button" type="button" data-home aria-label="Go to Home screen">${svg('i-home')}</button>
          </div>
        </div>
        <div class="camera-focus" aria-hidden="true"></div>
        <div class="camera-bottom">
          <div class="camera-thumb" style="${thumbStyle}" aria-hidden="true"></div>
          <button class="camera-shutter" type="button" data-shutter aria-label="Take photo"><span></span></button>
          <button class="camera-round-button camera-flip" type="button" data-toast="Switched camera" aria-label="Switch camera">${svg('i-refresh')}</button>
        </div>
        <div class="camera-flash-effect" aria-hidden="true"></div>
      </div>`;
  }

  function takePhoto() {
    const flash = $('.camera-flash-effect');
    if (flash) {
      flash.classList.remove('fire');
      void flash.offsetWidth;
      flash.classList.add('fire');
    }
    const style = cameraCaptureStyle();
    capturedPhotos.unshift({ style, label: 'Camera photo' });
    const thumb = $('.camera-thumb');
    if (thumb) thumb.setAttribute('style', style);
    showToast('Photo saved to Photos');
  }

  /* ------------------------------------------------------------------ */
  /* App renderer registry                                               */
  /* ------------------------------------------------------------------ */

  const RENDERERS = {
    whatsapp: () => window.WhatsAppUI.root(),
    instagram: () => window.InstagramUI.root(),
    amazon: () => window.AmazonOrdersUI.root(),
    chatgpt: chatgptRoot,
    x: () => window.XUI.root(),
    spotify: () => window.SpotifyUI.root(),
    notes: () => window.NotesUI.root(),
    calendar: () => window.CalendarUI.root(),
    settings: settingsRoot,
    photos: () => window.PhotosUI.root(),
    weather: weatherRoot,
    phone: phoneRoot,
    safari: safariRoot,
    messages: messagesRoot,
    camera: cameraRoot
  };

  /* ------------------------------------------------------------------ */
  /* Navigation and lock-screen state                                    */
  /* ------------------------------------------------------------------ */

  let locked = true;
  let currentApp = null;
  let appOrigin = 'home';
  let torchOn = false;
  let closeTimer = null;

  function unlockPhone() {
    if (!locked) return;
    locked = false;
    lockScreen.classList.remove('is-dragging', 'is-snapping');
    lockScreen.style.transform = '';
    lockScreen.style.opacity = '';
    lockScreen.classList.add('is-unlocked');
    lockScreen.setAttribute('aria-hidden', 'true');
    lockScreen.inert = true;
    screen.classList.remove('is-locked');
    screen.classList.add('is-unlocked');
    homeScreen.setAttribute('aria-hidden', 'false');
    homeScreen.inert = false;
    setPageHint('home');
    window.setTimeout(() => {
      if (!locked) lockScreen.style.visibility = 'hidden';
    }, 620);
  }

  function lockPhone() {
    locked = true;
    lockScreen.style.visibility = '';
    lockScreen.classList.remove('is-unlocked');
    lockScreen.classList.remove('is-dragging', 'is-snapping');
    lockScreen.style.transform = '';
    lockScreen.style.opacity = '';
    lockScreen.setAttribute('aria-hidden', 'false');
    lockScreen.inert = false;
    homeScreen.setAttribute('aria-hidden', 'true');
    homeScreen.inert = true;
    screen.classList.add('is-locked');
    screen.classList.remove('is-unlocked');
    setPageHint('lock');
  }

  function enableDragScroll(container) {
    if (!container || container.dataset.dragScrollReady === '1') return;
    container.dataset.dragScrollReady = '1';

    let isDown = false;
    let moved = false;
    let startY = 0;
    let startScrollTop = 0;
    let suppressClickUntil = 0;
    const threshold = 5;

    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      container.classList.remove('is-drag-ready', 'is-dragging');
      document.body.classList.remove('is-drag-scrolling');
      if (moved) {
        suppressClickUntil = performance.now() + 180;
        moved = false;
      }
    };

    container.addEventListener('mousedown', event => {
      if (event.button !== 0) return;
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      isDown = true;
      moved = false;
      startY = event.clientY;
      startScrollTop = container.scrollTop;
      container.classList.add('is-drag-ready');
    });

    container.addEventListener('mousemove', event => {
      if (!isDown) return;
      const deltaY = event.clientY - startY;
      if (!moved && Math.abs(deltaY) < threshold) return;
      if (!moved) {
        moved = true;
        container.classList.add('is-dragging');
        document.body.classList.add('is-drag-scrolling');
      }
      event.preventDefault();
      container.scrollTop = startScrollTop - deltaY * 1.8;
    });

    container.addEventListener('mouseup', endDrag);
    container.addEventListener('mouseleave', endDrag);
    container.addEventListener('dragstart', event => event.preventDefault());
    container.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function refreshDragScroll() {
    appLayer.querySelectorAll('.x-feed, .x-profile-scroll, .wa-messages, .wa-contact-list, .ig-feed, .ig-detail, .safari-body, .gptx-history, .ntx-list, .ntx-detail, .cal-scroll, .spx-list, .phx-library, .azx-scroll, .works-cited-page, .genai-page')
      .forEach(enableDragScroll);
  }

  function openApp(id, origin = 'home') {
    if (!RENDERERS[id]) return;
    if (currentApp) closeApp('origin', true);
    currentApp = id;
    appOrigin = origin;
    appLayer.classList.toggle('wa-instant', id === 'whatsapp');
    appLayer.classList.toggle('x-instant', id === 'x');
    appLayer.classList.toggle('ig-instant', id === 'instagram');
    appLayer.classList.toggle('gptx-instant', id === 'chatgpt');
    appLayer.classList.toggle('ntx-instant', id === 'notes');
    appLayer.classList.toggle('calx-instant', id === 'calendar');
    appLayer.classList.toggle('spx-instant', id === 'spotify');
    appLayer.classList.toggle('phx-instant', id === 'photos');
    appLayer.classList.toggle('azx-instant', id === 'amazon');
    appLayer.classList.toggle('phone-instant', id === 'phone');
    appLayer.innerHTML = RENDERERS[id]();
    refreshDragScroll();
    appLayer.classList.add('is-open');
    appLayer.setAttribute('aria-hidden', 'false');
    appLayer.inert = false;
    homeScreen.setAttribute('aria-hidden', 'true');
    homeScreen.inert = true;
    lockScreen.setAttribute('aria-hidden', 'true');
    lockScreen.inert = true;
    setPageHint('app');
    const body = $('.app-body', appLayer);
    if (body) body.scrollTop = 0;
  }

  function closeApp(target = 'origin', immediate = false) {
    if (!currentApp) return;
    const closedApp = currentApp;
    if (closedApp === 'instagram' && window.InstagramUI && window.InstagramUI.stopAudio) {
      window.InstagramUI.stopAudio();
    }
    if (closedApp === 'spotify' && window.SpotifyUI && window.SpotifyUI.stop) {
      window.SpotifyUI.stop();
    }
    const destination = target === 'home' ? 'home' : appOrigin;
    appLayer.classList.remove('is-open');
    appLayer.setAttribute('aria-hidden', 'true');
    appLayer.inert = true;
    currentApp = null;
    appOrigin = 'home';

    if (destination === 'home') {
      if (locked) unlockPhone();
      homeScreen.setAttribute('aria-hidden', 'false');
      homeScreen.inert = false;
      lockScreen.setAttribute('aria-hidden', 'true');
      lockScreen.inert = true;
      screen.classList.remove('is-locked');
      screen.classList.add('is-unlocked');
      locked = false;
      lockScreen.classList.add('is-unlocked');
      lockScreen.style.visibility = 'hidden';
      setPageHint('home');
    } else {
      locked = true;
      lockScreen.style.visibility = '';
      lockScreen.classList.remove('is-unlocked');
      lockScreen.setAttribute('aria-hidden', 'false');
      lockScreen.inert = false;
      homeScreen.setAttribute('aria-hidden', 'true');
      homeScreen.inert = true;
      screen.classList.add('is-locked');
      screen.classList.remove('is-unlocked');
      setPageHint('lock');
    }

    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (!currentApp) appLayer.innerHTML = '';
    }, immediate ? 0 : 360);

  }

  function goBack() {
    if (currentApp === 'whatsapp' && window.WhatsAppUI && window.WhatsAppUI.back()) {
      return;
    }
    if (currentApp === 'x' && window.XUI && window.XUI.back()) {
      return;
    }
    if (currentApp === 'instagram' && window.InstagramUI && window.InstagramUI.back()) {
      return;
    }
    if (currentApp === 'notes' && window.NotesUI && window.NotesUI.back()) {
      return;
    }
    if (currentApp === 'photos' && window.PhotosUI && window.PhotosUI.back()) {
      return;
    }
    if (currentApp) {
      const subviews = $$('.subview', appLayer);
      if (subviews.length) {
        const last = subviews[subviews.length - 1];
        if (last._cleanup) last._cleanup();
        last.remove();
        const under = $$('.subview', appLayer).pop();
        const back = under ? $('[data-back]', under) : $('[data-back]', appLayer);
        if (back) back.focus({ preventScroll: true });
      } else {
        closeApp('origin');
      }
    } else if (!locked) {
      lockPhone();
    }
  }

  function goHomeAction() {
    if (currentApp) {
      closeApp('home');
    } else if (!locked) {
      lockPhone();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Lock-screen gestures and controls                                   */
  /* ------------------------------------------------------------------ */

  let dragState = null;
  let lockDragMoved = false;

  lockScreen.addEventListener('pointerdown', event => {
    if (!locked || currentApp) return;
    if (event.target.closest('button')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      lastY: event.clientY,
      lastTime: performance.now(),
      pointerId: event.pointerId
    };
    lockDragMoved = false;
    lockScreen.classList.add('is-dragging');
    lockScreen.classList.remove('is-snapping');
    try { lockScreen.setPointerCapture(event.pointerId); } catch (error) { /* no-op */ }
  });

  lockScreen.addEventListener('pointermove', event => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const deltaY = Math.min(0, event.clientY - dragState.startY);
    const deltaX = Math.abs(event.clientX - dragState.startX);
    if (Math.abs(deltaY) > 6 || deltaX > 6) lockDragMoved = true;
    const resisted = deltaY >= 0 ? deltaY * 0.2 : deltaY;
    lockScreen.style.transform = `translate3d(0, ${resisted}px, 0)`;
    lockScreen.style.opacity = String(Math.max(.18, 1 + resisted / 620));
    dragState.lastY = event.clientY;
    dragState.lastTime = performance.now();
  });

  function endLockDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const deltaY = event.clientY - dragState.startY;
    const elapsed = Math.max(1, performance.now() - dragState.lastTime);
    const velocity = (event.clientY - dragState.lastY) / elapsed;
    dragState = null;
    lockScreen.classList.remove('is-dragging');
    try { lockScreen.releasePointerCapture(event.pointerId); } catch (error) { /* no-op */ }
    if (deltaY < -76 || (deltaY < -32 && velocity < -0.5)) {
      unlockPhone();
    } else {
      lockScreen.classList.add('is-snapping');
      lockScreen.style.transform = '';
      lockScreen.style.opacity = '';
      window.setTimeout(() => lockScreen.classList.remove('is-snapping'), 360);
    }
  }

  lockScreen.addEventListener('pointerup', endLockDrag);
  lockScreen.addEventListener('pointercancel', endLockDrag);
  lockScreen.addEventListener('pointerleave', event => {
    if (dragState && event.pointerType === 'mouse' && event.buttons === 0) endLockDrag(event);
  });

  unlockCue.addEventListener('click', () => {
    if (!locked || lockDragMoved) return;
    unlockPhone();
  });

  unlockCue.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (locked) unlockPhone();
    }
  });

  flashlightButton.addEventListener('click', () => {
    torchOn = !torchOn;
    lockScreen.classList.toggle('torch-on', torchOn);
    flashlightButton.classList.toggle('is-on', torchOn);
    flashlightButton.setAttribute('aria-pressed', String(torchOn));
    showToast(torchOn ? 'Flashlight on' : 'Flashlight off');
  });

  lockCameraButton.addEventListener('click', () => {
    if (!locked) return;
    openApp('camera', 'lock');
  });

  homeButton.addEventListener('click', () => {
    if (currentApp) {
      closeApp('home');
    } else if (!locked) {
      lockPhone();
    } else {
      unlockCue.classList.remove('pulse');
      void unlockCue.offsetWidth;
      unlockCue.classList.add('pulse');
      window.setTimeout(() => unlockCue.classList.remove('pulse'), 520);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (currentApp) {
        goBack();
      } else if (!locked) {
        lockPhone();
      }
      return;
    }
    if (event.key === 'ArrowUp' && locked && !currentApp && !event.target.closest('input, textarea')) {
      event.preventDefault();
      unlockPhone();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Delegated app interactions                                          */
  /* ------------------------------------------------------------------ */

  document.addEventListener('click', event => {
    const appButton = event.target.closest('[data-app]');
    if (appButton && !appLayer.contains(appButton)) {
      openApp(appButton.dataset.app);
      return;
    }

    if (event.target.closest('[data-back]')) {
      goBack();
      return;
    }

    if (event.target.closest('[data-home]')) {
      closeApp('home');
      return;
    }

    const toastTarget = event.target.closest('[data-toast]');
    if (toastTarget) {
      showToast(toastTarget.dataset.toast || 'Done');
      if (!toastTarget.closest('.settings-row')) return;
    }

    if (!currentApp) return;

    const chatRow = event.target.closest('[data-chat]');
    if (chatRow) {
      const index = Number(chatRow.dataset.chat);
      pushSubview(whatsappChat(index));
      const thread = $('[data-chat-thread]', appLayer);
      if (thread) thread.scrollTop = thread.scrollHeight;
      return;
    }

    const msgRow = event.target.closest('[data-msg]');
    if (msgRow) {
      const index = Number(msgRow.dataset.msg);
      pushSubview(messagesChat(index));
      const thread = $('[data-chat-thread]', appLayer);
      if (thread) thread.scrollTop = thread.scrollHeight;
      return;
    }

    const likeButton = event.target.closest('[data-like]');
    if (likeButton) {
      likeInstagramPost(likeButton);
      return;
    }

    const likePhoto = event.target.closest('[data-like-photo]');
    if (likePhoto) {
      popInstagramHeart(likePhoto);
      return;
    }

    const product = event.target.closest('[data-product]');
    if (product) {
      pushSubview(amazonProduct(Number(product.dataset.product)));
      return;
    }

    const addCart = event.target.closest('[data-add-cart]');
    if (addCart) {
      addToCart();
      return;
    }

    const gptxRow = event.target.closest('[data-gptx-row]');
    if (gptxRow) {
      $$('[data-gptx-row]', appLayer).forEach(row => row.classList.toggle('is-selected', row === gptxRow));
      return;
    }

    const gptPrompt = event.target.closest('[data-gpt-prompt]');
    if (gptPrompt) {
      submitChatGpt(gptPrompt.dataset.gptPrompt);
      return;
    }

    if (event.target.closest('[data-gpt-new]')) {
      appLayer.innerHTML = chatgptRoot();
      const body = $('.app-body', appLayer);
      if (body) body.scrollTop = 0;
      showToast('New chat');
      return;
    }

    const xTab = event.target.closest('[data-x-tab]');
    if (xTab) {
      $$('[data-x-tab]', appLayer).forEach(tab => {
        tab.classList.toggle('is-active', tab === xTab);
        tab.setAttribute('aria-selected', String(tab === xTab));
      });
      return;
    }

    const xLike = event.target.closest('[data-x-like]');
    if (xLike) {
      const post = X_POSTS[Number(xLike.dataset.xLike)];
      post.liked = !post.liked;
      xLike.classList.toggle('is-liked', post.liked);
      xLike.setAttribute('aria-pressed', String(post.liked));
      return;
    }

    const xRepost = event.target.closest('[data-x-repost]');
    if (xRepost) {
      const post = X_POSTS[Number(xRepost.dataset.xRepost)];
      post.reposted = !post.reposted;
      xRepost.classList.toggle('is-reposted', post.reposted);
      xRepost.setAttribute('aria-pressed', String(post.reposted));
      return;
    }

    if (event.target.closest('[data-x-compose]')) {
      pushSubview(xComposeView());
      return;
    }

    const playlist = event.target.closest('[data-playlist]');
    if (playlist) {
      pushSubview(spotifyPlaylist(Number(playlist.dataset.playlist)));
      return;
    }

    const playToggle = event.target.closest('[data-play-toggle]');
    if (playToggle) {
      playerState.playing = !playerState.playing;
      updateSpotifyPlayer();
      showToast(playerState.playing ? 'Playing' : 'Paused');
      return;
    }

    const playTrack = event.target.closest('[data-play-track]');
    if (playTrack) {
      playSpotifyTrack(Number(playTrack.dataset.playTrack));
      return;
    }

    const note = event.target.closest('[data-note]');
    if (note) {
      pushSubview(noteEditor(Number(note.dataset.note)));
      return;
    }

    if (event.target.closest('[data-new-note]')) {
      createNote();
      return;
    }

    const calDay = event.target.closest('[data-cal-day]');
    if (calDay) {
      selectCalendarDay(Number(calDay.dataset.calDay));
      return;
    }

    if (event.target.closest('[data-cal-today]')) {
      selectCalendarDay(27);
      return;
    }

    const calEvent = event.target.closest('[data-cal-event]');
    if (calEvent) {
      pushSubview(calendarEventDetail(calEvent.dataset.calEvent));
      return;
    }

    const adaptationToggle = event.target.closest('[data-adaptation-toggle]');
    if (adaptationToggle) {
      toggleAdaptation(adaptationToggle);
      return;
    }

    const toggle = event.target.closest('[data-toggle-setting]');
    if (toggle) {
      toggleSetting(toggle);
      return;
    }

    const setting = event.target.closest('[data-setting]');
    if (setting) {
      pushSubview(settingsDetail(setting.dataset.setting), view => {
        if (!view.querySelector('[data-settings-detail-page]')) return;
        view.classList.add('settings-detail-subview');
        view.querySelectorAll('.works-cited-page, .genai-page').forEach(enableDragScroll);
      });
      return;
    }

    const photo = event.target.closest('[data-photo]');
    if (photo) {
      pushSubview(photoViewer(Number(photo.dataset.photo)));
      return;
    }

    const photoLike = event.target.closest('[data-photo-like]');
    if (photoLike) {
      photoLike.classList.toggle('is-liked');
      showToast(photoLike.classList.contains('is-liked') ? 'Added to Favorites' : 'Removed from Favorites');
      return;
    }

    const phoneTab = event.target.closest('[data-phone-tab]');
    if (phoneTab) {
      $$('[data-phone-tab]', appLayer).forEach(tab => {
        tab.classList.toggle('is-active', tab === phoneTab);
        tab.setAttribute('aria-selected', String(tab === phoneTab));
      });
      $$('[data-phone-panel]', appLayer).forEach(panel => {
        panel.hidden = panel.dataset.phonePanel !== phoneTab.dataset.phoneTab;
      });
      return;
    }

    const call = event.target.closest('[data-call]');
    if (call) {
      pushSubview(callView(call.dataset.call));
      return;
    }

    const dial = event.target.closest('[data-dial]');
    if (dial) {
      const display = $('[data-dial-display]');
      if (display) {
        if (display.textContent.trim() === '\u00a0') display.textContent = '';
        display.textContent += dial.dataset.dial;
      }
      return;
    }

    if (event.target.closest('[data-dial-delete]')) {
      const display = $('[data-dial-display]');
      if (display) display.textContent = display.textContent.slice(0, -1) || '\u00a0';
      return;
    }

    if (event.target.closest('[data-call-custom]')) {
      const display = $('[data-dial-display]');
      const number = display ? display.textContent.trim() : '';
      pushSubview(callView(number && number !== '\u00a0' ? number : 'Unknown'));
      return;
    }

    const site = event.target.closest('[data-site]');
    if (site) {
      pushSubview(safariSite(site.dataset.site));
      return;
    }

    const flash = event.target.closest('[data-camera-flash]');
    if (flash) {
      flash.classList.toggle('is-on');
      showToast(flash.classList.contains('is-on') ? 'Flash on' : 'Flash off');
      return;
    }

    if (event.target.closest('[data-shutter]')) {
      takePhoto();
      return;
    }
  });

  document.addEventListener('dblclick', event => {
    const photo = event.target.closest('[data-like-photo]');
    if (!photo) return;
    const index = Number(photo.dataset.likePhoto);
    const post = INSTAGRAM_POSTS[index];
    if (post && !post.liked) {
      const likeButton = $(`[data-like="${index}"]`);
      if (likeButton) likeInstagramPost(likeButton);
    }
    popInstagramHeart(photo);
  });

  document.addEventListener('input', event => {
    if (event.target.matches('[data-note-title]')) {
      const index = Number(event.target.dataset.noteTitle);
      if (NOTES[index]) {
        NOTES[index].title = event.target.value;
        refreshNoteCard(index);
      }
      return;
    }
    if (event.target.matches('[data-note-body]')) {
      const index = Number(event.target.dataset.noteBody);
      if (NOTES[index]) {
        NOTES[index].body = event.target.value;
        refreshNoteCard(index);
      }
      return;
    }
    if (event.target.matches('#x-compose-form textarea')) {
      const count = $('[data-x-count]');
      if (count) count.textContent = String(280 - event.target.value.length);
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target;
    if (form.matches('[data-chat-form]')) {
      event.preventDefault();
      sendChatMessage(form, form.dataset.chatApp === 'msg' ? 'msg' : 'wa');
      return;
    }
    if (form.matches('[data-gpt-form]')) {
      event.preventDefault();
      const input = $('input[name="prompt"]', form);
      const value = input.value;
      if (!value.trim()) return;
      input.value = '';
      submitChatGpt(value);
      return;
    }
    if (form.matches('[data-amazon-search-form]')) {
      event.preventDefault();
      const input = $('input[name="query"]', form);
      showToast(`Showing results for "${input.value.trim() || 'everything'}"`);
      input.blur();
      return;
    }
    if (form.matches('[data-safari-form]')) {
      event.preventDefault();
      const input = $('input[name="query"]', form);
      const query = input.value.trim();
      pushSubview(safariSite('search', query || 'A quiet corner of the web'));
      input.blur();
      return;
    }
    if (form.matches('[data-x-form]')) {
      event.preventDefault();
      const textarea = $('textarea[name="post"]', form);
      const text = textarea.value.trim();
      if (!text) {
        showToast('Write something first');
        return;
      }
      const newPost = {
        name: 'You', handle: '@you', initial: 'Y', tone: 'dark', time: 'now',
        text, replies: '0', reposts: '0', likes: '0', media: null, liked: false, reposted: false
      };
      X_POSTS.unshift(newPost);
      const feed = $('[data-x-feed]');
      if (feed) {
        const holder = document.createElement('div');
        holder.innerHTML = xPostHTML(newPost, 0, true);
        feed.prepend(holder.firstElementChild);
        $$('.x-post', feed).forEach((post, index) => {
          post.dataset.xPost = String(index);
          $$('[data-x-like]', post).forEach(button => { button.dataset.xLike = String(index); });
          $$('[data-x-repost]', post).forEach(button => { button.dataset.xRepost = String(index); });
        });
      }
      const subview = form.closest('.subview');
      if (subview) subview.remove();
      showToast('Posted');
      return;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */

  renderHome();

  const BASE_WIDTH = 420;
  const BASE_HEIGHT = 852;

  function fitPhone() {
    // visualViewport is the reliable measurement for a phone-sized layout:
    // some mobile browsers report a slightly wider layout viewport.
    const viewport = window.visualViewport;
    const viewportWidth = Math.min(window.innerWidth, viewport?.width || window.innerWidth);
    const viewportHeight = Math.min(window.innerHeight, viewport?.height || window.innerHeight);
    const availableWidth = Math.max(240, viewportWidth - 24);
    const availableHeight = Math.max(360, viewportHeight - 78);
    const scale = Math.min(1.08, availableWidth / BASE_WIDTH, availableHeight / BASE_HEIGHT);
    phoneSlot.style.width = `${BASE_WIDTH * scale}px`;
    phoneSlot.style.height = `${BASE_HEIGHT * scale}px`;
    phone.style.transform = `scale(${scale})`;
  }

  fitPhone();
  window.addEventListener('resize', fitPhone);
  window.addEventListener('orientationchange', () => window.setTimeout(fitPhone, 80));

  // Optional deep links are handy for previews and screenshots:
  // ?view=home or ?view=whatsapp opens that screen directly.
  const previewView = new URLSearchParams(window.location.search).get('view');
  if (previewView) {
    appLayer.style.transition = 'none';
    lockScreen.style.transition = 'none';
  }
  if (previewView === 'home') {
    window.setTimeout(unlockPhone, 80);
  } else if (previewView && RENDERERS[previewView]) {
    window.setTimeout(() => {
      unlockPhone();
      openApp(previewView);
    }, 120);
  }

  // Keep the demo visually anchored to a crisp, predictable date.
  document.documentElement.dataset.demoDate = '2026-12-27';
})();
