/* Notes app: iOS-style light note list and full-screen note detail. */
(() => {
  'use strict';

  const NOTES = [
    {
      id: 'christmas-decoration',
      title: 'Christmas decoration plans',
      date: 'Nov 17, 2026',
      body: `THE TREE SHALL BE SPLENDID!!!
candles & flowers (red!) & lights
the ornaments last year were fun to make but the cat teared it up so no more this year :(`
    },
    {
      id: 'christmas-gifts',
      title: 'Christmas gifts',
      date: 'Nov 15, 2026',
      body: `(needs to be cheap!)
ivar: new suit + sword
bob: horse + trumpet
emmy: doll + dolly’s bedstead (its alright for them to be plan, shell soon break them in pieces anyway)
maids: dress-lengths + handkerchiefs (anne needs smth better…)`
    },
    {
      id: 'remote-jobs',
      title: 'Remote contract jobs',
      date: 'Dec 5, 2019',
      body: `remote customer service (don’t have the time and Torvald might find out)
social media assistant (no prev experience)
online tutoring (not smart enough)
UX testing <- need to schedule around Torvald’s work time
transcription/captioning <- similar to above, maybe buy some earbuds?
NEED TO RESEARCH – what is data annotation?`
    },
    {
      id: 'economize',
      title: 'Economize!!!',
      date: 'Dec 1, 2019',
      body: `buy used stuff
free entertainment instead of going out
sweets in moderation
batch errands
no more subscriptions`
    },
    {
      id: 'torvald-italy',
      title: 'Torvald Italy',
      date: 'Sep 22, 2019',
      body: `tell him that I would love to travel abroad like the other young wives I saw on social media
tears and entreaties
remind him that I just gave birth to Ivar & Papa is very ill, he should be kinds and indulgent to me
suggest raising a loan
actually try and get a loan
Papa gave me money (actually from K but don’t let him know)`
    }
  ];

  const appLayer = document.getElementById('appLayer');
  let activeScreen = 'list';
  let savedListScroll = 0;

  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const icon = id => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

  const composeIcon = () => `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l4.4-1 10.1-10.1-3.4-3.4L5 15.6 4 20z"/>
      <path d="M13.7 6.9l3.4 3.4"/>
    </svg>`;

  const folderIcon = () => `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7.5h7l2 2h9V19H3z"/>
      <path d="M3 7.5V5h7l2 2h9v2.5"/>
    </svg>`;

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

  function noteItem(note) {
    return `
      <button class="ntx-item" type="button" data-ntx-note="${esc(note.id)}">
        <strong class="ntx-item-title">${esc(note.title)}</strong>
        <span class="ntx-item-meta">
          <time class="ntx-item-date">${esc(note.date)}</time>
          <span class="ntx-item-preview">${esc(note.body.split('\n')[0])}</span>
        </span>
      </button>`;
  }

  function root() {
    activeScreen = 'list';
    return `
      <div class="app-view ntx-app" data-ntx-app>
        ${statusBar()}
        <div class="ntx-screens">
          <section class="ntx-screen is-active" data-ntx-screen="list">
            <header class="ntx-topbar">
              <button class="ntx-folders" type="button" data-back aria-label="Back to home screen">
                <span class="ntx-chevron">‹</span> Folders
              </button>
              <button class="ntx-compose" type="button" aria-label="New note">${composeIcon()}</button>
            </header>
            <div class="ntx-list" data-ntx-list>
              <h1 class="ntx-large-title">Notes</h1>
              <div class="ntx-search">
                ${icon('i-search')}
                <span>Search</span>
              </div>
              <div class="ntx-cards">
                ${NOTES.map(noteItem).join('')}
              </div>
            </div>
            <nav class="ntx-bottom" aria-hidden="true">
              <span class="ntx-bottom-icon">${folderIcon()}</span>
              <span class="ntx-bottom-icon">${composeIcon()}</span>
            </nav>
          </section>
          <section class="ntx-screen" data-ntx-screen="detail">
            <header class="ntx-topbar">
              <button class="ntx-folders" type="button" data-ntx-back aria-label="Back to Notes">
                <span class="ntx-chevron">‹</span> Folders
              </button>
              <div class="ntx-detail-actions">
                <button class="ntx-icon-button" type="button" aria-label="Share note">${icon('i-share')}</button>
                <button class="ntx-icon-button" type="button" aria-label="New note">${composeIcon()}</button>
                <button class="ntx-done" type="button" data-ntx-back>Done</button>
              </div>
            </header>
            <div class="ntx-detail" data-ntx-detail></div>
          </section>
        </div>
      </div>`;
  }

  function setScreen(name) {
    const rootElement = document.querySelector('.ntx-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('[data-ntx-screen]').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.ntxScreen === name);
    });
    activeScreen = name;
  }

  function openNote(id) {
    const note = NOTES.find(item => item.id === id);
    if (!note) return;
    const list = document.querySelector('[data-ntx-list]');
    savedListScroll = list ? list.scrollTop : 0;
    const detail = document.querySelector('[data-ntx-detail]');
    if (!detail) return;
    const bodyHtml = note.id === 'torvald-italy'
      ? note.body.split('\n').map((line, index, lines) =>
        `<p class="ntx-line${index < lines.length - 1 ? ' is-struck' : ''}">${esc(line)}</p>`
      ).join('')
      : esc(note.body);
    detail.innerHTML = `
      <h1 class="ntx-detail-title">${esc(note.title)}</h1>
      <div class="ntx-detail-date">${esc(note.date)}</div>
      <div class="ntx-detail-body">${bodyHtml}</div>`;
    setScreen('detail');
    detail.scrollTop = 0;
  }

  function showList() {
    setScreen('list');
    const list = document.querySelector('[data-ntx-list]');
    if (list) list.scrollTop = savedListScroll;
  }

  function back() {
    if (activeScreen === 'detail') {
      showList();
      return true;
    }
    return false;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.ntx-app');
      if (!app) return;
      const note = event.target.closest('[data-ntx-note]');
      if (note) {
        openNote(note.dataset.ntxNote);
        return;
      }
      if (event.target.closest('[data-ntx-back]')) {
        showList();
      }
    });
  }

  window.NotesUI = { root, back };
})();
