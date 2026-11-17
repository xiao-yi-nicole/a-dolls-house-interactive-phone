/* X app: light-mode home, Torvald profile, Nora profile, threads and quote cards. */
(() => {
  'use strict';

  const data = window.X_DATA;
  if (!data) return;

  const appLayer = document.getElementById('appLayer');
  let activeScreen = 'home';

  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const icon = id => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;
  const cleanTime = value => String(value).replace(', 2026', '');

  function paragraphHTML(text) {
    const sentences = String(text).match(/[^.!?]+[.!?]+(?:[”"’']+)?|[^.!?]+$/g) || [String(text)];
    return sentences
      .map(sentence => sentence.trim())
      .filter(Boolean)
      .map(sentence => `<p>${esc(sentence)}</p>`)
      .join('');
  }

  function torvaldParagraphHTML(text) {
    const sentences = String(text)
      .replace(/😂\s+(?=[A-Z])/g, '😂\n')
      .split(/\n|(?<=[.!?])\s+(?=[A-Z“"'])/)
      .map(sentence => sentence.trim())
      .filter(Boolean);
    return sentences
      .map(sentence => `<p style="margin:0 0 12px;font-size:12px;">${esc(sentence)}</p>`)
      .join('');
  }

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

  function avatar(name, extra = '') {
    return `<span class="x-avatar x-avatar-${esc(name)} ${extra}" aria-hidden="true"></span>`;
  }

  function verified() {
    return '<span class="x-verified-img" role="img" title="Verified account" aria-label="Verified account"></span>';
  }

  function lockIcon() {
    return '<span class="x-protected-img" role="img" title="Protected account" aria-label="Protected account"></span>';
  }

  const statIcons = {
    Comments: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 01-8.5 8.3 9 9 0 01-4-.9L3 20.5l1.7-5a8 8 0 01-1.2-4A8.4 8.4 0 0112 3a8.4 8.4 0 019 8.5z"/></svg>`,
    Reposts: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v7"/><path d="M7 7L3.5 10.5M17 17H7v-7M17 17l3.5-3.5"/></svg>`,
    Likes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.9a5.5 5.5 0 00-7.8 0L12 7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1L12 22l7.7-7.3 1.1-1a5.5 5.5 0 000-7.8z"/></svg>`,
    Bookmarks: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>`,
    Views: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V12M12 20V6M19 20V9"/></svg>`,
    Quotes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h4v4H8.5c0 2 1.2 2.5 2.5 3v2c-3 0-5-1.8-5-5V7zm7 0h4v4h-2.5c0 2 1.2 2.5 2.5 3v2c-3 0-5-1.8-5-5V7z"/></svg>`
  };

  function parseStat(value) {
    const text = String(value ?? '0').replace(/,/g, '').trim();
    const match = /^([0-9.]+)\s*([KM])?$/i.exec(text);
    if (!match) return 0;
    const number = Number(match[1]);
    if (!Number.isFinite(number)) return 0;
    const unit = (match[2] || '').toUpperCase();
    if (unit === 'M') return number * 1000000;
    if (unit === 'K') return number * 1000;
    return number;
  }

  function formatStat(number) {
    if (number >= 1000000) {
      const value = Math.round(number / 100000) / 10;
      return `${value.toFixed(value % 1 === 0 ? 0 : 1)}M`;
    }
    if (number >= 1000) {
      const value = Math.round(number / 100) / 10;
      return `${value.toFixed(value % 1 === 0 ? 0 : 1)}K`;
    }
    return String(Math.round(number));
  }

  function statsHTML(stats, options = {}) {
    const includeQuotes = Boolean(options.includeQuotes);
    const values = includeQuotes
      ? {
          Comments: stats?.Comments ?? '0',
          Reposts: stats?.Reposts ?? '0',
          Quotes: stats?.Quotes ?? '0',
          Likes: stats?.Likes ?? '0',
          Bookmarks: stats?.Bookmarks ?? '0',
          Views: stats?.Views ?? '0'
        }
      : {
          Comments: stats?.Comments ?? '0',
          Reposts: formatStat(parseStat(stats?.Reposts) + parseStat(stats?.Quotes)),
          Likes: stats?.Likes ?? '0',
          Bookmarks: stats?.Bookmarks ?? '0',
          Views: stats?.Views ?? '0'
        };
    const order = includeQuotes
      ? ['Comments', 'Reposts', 'Quotes', 'Likes', 'Bookmarks', 'Views']
      : ['Comments', 'Reposts', 'Likes', 'Bookmarks', 'Views'];
    return `<div class="x-stats">${order.map(label => {
      const value = values[label];
      const displayLabel = label === 'Reposts' && !includeQuotes ? 'Reposts and quotes' : label;
      return `<span class="x-stat" title="${displayLabel}" aria-label="${displayLabel} ${value}">${statIcons[label]}<span>${esc(value)}</span></span>`;
    }).join('')}</div>`;
  }

  function calendarIcon() {
    return '';
  }

  function quoteHTML(quote, options = {}) {
    const deletedTweet = data.torvaldTweets.find(tweet => tweet.deleted);
    const bottomQuote = data.torvaldTweets.find(tweet => tweet.id === 'torvald-2');
    const deleted = quote.deletedShot
      ? `
        <div class="x-deleted-shot">
          <div class="x-shot-head">
            ${avatar('torvald', 'x-shot-avatar')}
            <div class="x-shot-ident">
              <strong>Torvald Helmer</strong>
              <span>@TorvaldHelmer · Dec 27 · 0:17</span>
            </div>
          </div>
          <div class="x-shot-text">${deletedTweet ? paragraphHTML(deletedTweet.text) : ''}</div>
          <div class="x-shot-stats">${deletedTweet ? statsHTML(deletedTweet.stats, { includeQuotes: true }) : ''}</div>
          ${bottomQuote ? `
            <div class="x-shot-quote">
              <div class="x-shot-quote-head">
                ${avatar('torvald', 'x-shot-quote-avatar')}
                <div class="x-shot-quote-ident">
                  <strong>Torvald Helmer</strong>
                  <span>@TorvaldHelmer · Dec 24 · 5:40 PM</span>
                </div>
              </div>
              <div class="x-shot-quote-text">${paragraphHTML(bottomQuote.text)}</div>
            </div>` : ''}
        </div>`
      : '';
    const handleTime = quote.deletedShot
      ? '<span class="x-handle-time"><span class="x-handle">Dec 27</span></span>'
      : (quote.handle
        ? `<span class="x-handle-time"><span class="x-handle">${esc(quote.handle)}</span><span class="x-dot">·</span><span class="x-time">${esc(cleanTime(quote.time))}</span></span>`
        : '');
    const quoteText = options.paragraphs ? paragraphHTML(quote.text) : esc(quote.text);
    return `
      <div class="x-quote">
        <div class="x-quote-head">
          ${avatar(quote.avatar, 'x-quote-avatar')}
          <span class="x-name-block"><span class="x-quote-name">${esc(quote.name)}</span>${quote.avatar === 'torvald' ? verified() : ''}</span>
          ${handleTime}
        </div>
        <div class="x-quote-text">${quoteText}</div>
        ${deleted}
      </div>`;
  }

  function whatsappSnippet() {
    const messages = [
      { type: 'in', text: 'Still I forgive you' },
      { type: 'in', text: 'Your anxiety is simply a sign of your great love for me' },
      { type: 'in', text: '(As it should be)' },
      { type: 'in', text: 'And I am enough of a man to take everything upon myself' },
      { type: 'out', text: 'Torvald' },
      { type: 'out', text: 'What do you mean by that?' },
      { type: 'out', text: 'You will never have to do that!' },
      { type: 'in', text: 'That’s right' },
      { type: 'in', text: 'We will share it then, as man and wife would' }
    ];
    const doubleCheck = `
      <span class="wa-meta">
        <span class="wa-checks" aria-label="Read">
          <svg viewBox="0 0 19 11" aria-hidden="true">
            <path d="M1 5.7l3.1 3.2L12.8 1"/>
            <path d="M6.4 5.7l3.1 3.2L18.1 1"/>
          </svg>
        </span>
      </span>`;
    return `
      <div class="x-wa-shot" aria-label="Screenshot of a WhatsApp conversation with Torvald">
        <div class="x-wa-body">
          ${messages.map(message => `
            <div class="wa-row ${message.type}">
              <div class="wa-bubble-wrap">
                <div class="wa-bubble ${message.type}">
                  <span class="wa-text">${esc(message.text)}</span>
                  ${message.type === 'out' ? doubleCheck : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  function repliesHTML(comments) {
    return `
      <div class="x-thread-replies">
        ${comments.map((comment, index) => {
          const isLast = index === comments.length - 1;
          return `
            <div class="x-reply${comment.depth > 1 ? ' is-nested' : ''}">
              <div class="x-thread-rail">
                ${avatar(comment.avatar, 'x-reply-avatar')}
                ${isLast ? '' : '<span class="x-thread-line" aria-hidden="true"></span>'}
              </div>
              <div class="x-reply-content">
                <div class="x-reply-head">
                  <span class="x-name-block"><strong>${esc(comment.name)}${comment.avatar === 'nora' ? lockIcon() : ''}</strong></span>
                  <span class="x-handle-time"><span class="x-handle">${esc(comment.handle)}</span><span class="x-dot">·</span><span class="x-time">${calendarIcon()}${esc(cleanTime(comment.time))}</span></span>
                </div>
                <p class="x-reply-text">${esc(comment.text)}</p>
                ${statsHTML({ Comments: isLast ? '0' : '1', Reposts: '0', Likes: '0', Bookmarks: '0', Views: '0' })}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }

  function tweetHTML(tweet, options = {}) {
    const home = Boolean(options.home);
    const clickable = home;
    const avatarMarkup = clickable
      ? `<button class="x-avatar-link" type="button" data-x-profile="${esc(tweet.avatar)}" aria-label="Open ${esc(tweet.name)} profile">${avatar(tweet.avatar, 'x-tweet-avatar')}</button>`
      : avatar(tweet.avatar, 'x-tweet-avatar');
    const nameMarkup = clickable
      ? `<button class="x-name-link" type="button" data-x-profile="${esc(tweet.avatar)}">${esc(tweet.name)}</button>`
      : `<span class="x-tweet-name">${esc(tweet.name)}</span>`;
    const badges = `${tweet.verified ? verified() : ''}${tweet.protected ? lockIcon() : ''}`;
    const isTorvaldProfile = Boolean(options.profile) && tweet.avatar === 'torvald';
    const useParagraphs = isTorvaldProfile && tweet.id !== 'torvald-7' && tweet.id !== 'torvald-8';
    const textMarkup = useParagraphs ? paragraphHTML(tweet.text) : esc(tweet.text);
    const limited = !home && tweet.limitedReplies
      ? `<div class="x-limited"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 20v-1.5a4 4 0 00-4-4H6a4 4 0 00-4 4V20M9 10a4 4 0 100-8 4 4 0 000 8zM17 4.5a3.5 3.5 0 010 7M22 20v-1.5a4 4 0 00-3-3.8"/></svg><span>${esc(tweet.limitedReplies)}</span></div>`
      : '';
    const quoteMarkup = !home && tweet.quote ? quoteHTML(tweet.quote, { paragraphs: useParagraphs || tweet.quoteTorvald }) : '';
    const imageMarkup = !home && tweet.whatsappSnippet ? whatsappSnippet() : '';
    const replies = !home && tweet.comments?.length ? repliesHTML(tweet.comments) : '';

    const mainMarkup = `
      <div class="x-tweet-main">
        <div class="x-tweet-head">
          <span class="x-name-block">${nameMarkup}${badges}</span>
          <span class="x-handle-time"><span class="x-handle">${esc(tweet.handle)}</span><span class="x-dot">·</span><span class="x-time">${calendarIcon()}${esc(cleanTime(tweet.time))}</span></span>
        </div>
        <div class="x-tweet-text">${textMarkup}</div>
        ${quoteMarkup}
        ${imageMarkup}
        ${limited}
        ${statsHTML(tweet.stats)}
      </div>`;

    const card = replies
      ? `
        <article class="x-tweet x-thread-main">
          <div class="x-thread-rail">
            ${avatarMarkup}
            <span class="x-thread-line" aria-hidden="true"></span>
          </div>
          ${mainMarkup}
        </article>`
      : `
        <article class="x-tweet">
          ${avatarMarkup}
          ${mainMarkup}
        </article>`;

    if (replies) {
      return `<div class="x-thread">${card}${replies}</div>`;
    }
    return card;
  }

  function homeScreen() {
    return `
      <section class="x-screen x-home-screen is-active" data-x-screen="home">
        <header class="x-home-topbar">
          <button class="x-avatar-button" type="button" data-x-profile="nora" aria-label="Open Nora profile">
            ${avatar('nora')}
          </button>
          <span class="x-logo" aria-label="X">${icon('brand-x')}</span>
          <button class="x-exit-button" type="button" data-home aria-label="Back to home screen">${icon('i-home')}</button>
        </header>
        <div class="x-tabs" aria-label="Timeline tabs">
          <span class="x-tab">For you</span>
          <span class="x-tab is-active">Following</span>
        </div>
        <div class="x-feed">
          ${data.torvaldTweets
            .filter(tweet => !tweet.deleted)
            .slice()
            .sort((a, b) => String(b.sort).localeCompare(String(a.sort)))
            .map(tweet => tweet.id === 'torvald-8'
              ? torvaldSpecialCard(tweet, { home: true })
              : torvaldCard(tweet, { home: true }))
            .join('')}
        </div>
      </section>`;
  }

  function profileScreen(id) {
    const profile = data.profiles[id];
    const tweets = id === 'torvald'
      ? data.torvaldTweets.filter(tweet => !tweet.deleted)
      : data.noraTweets;
    const badge = profile.verified ? verified() : (profile.protected ? lockIcon() : '');
    return `
      <section class="x-screen x-profile-screen" data-x-screen="${esc(id)}">
        <header class="x-profile-topbar">
          <button class="x-back-button" type="button" data-x-back aria-label="Back to X home">${icon('i-chevron-left')}</button>
          <strong>Profile</strong>
          <span class="x-profile-topbar-spacer" aria-hidden="true"></span>
        </header>
        <div class="x-profile-scroll" data-x-profile-scroll="${esc(id)}">
          <div class="x-banner x-banner-${esc(id)}"></div>
          <div class="x-profile-avatar-wrap">
            ${avatar(id, 'x-profile-avatar')}
            ${id === 'torvald' ? '<span class="x-following-button" aria-label="Following Torvald Helmer">Following</span>' : ''}
          </div>
          <div class="x-profile-info">
            <div class="x-profile-name-row">
              <span class="x-profile-name">${esc(profile.name)}</span>
              ${badge}
            </div>
            <div class="x-profile-handle">${esc(profile.handle)}</div>
            <p class="x-profile-bio">${esc(profile.bio)}</p>
            <div class="x-profile-joined">${esc(profile.joined)}</div>
            <div class="x-profile-counts"><strong>${esc(profile.following)}</strong> Following&nbsp;&nbsp;&nbsp;<strong>${esc(profile.followers)}</strong> Followers</div>
          </div>
          <div class="x-profile-feed">
            ${tweets.map(tweet => tweetHTML(tweet, { profile: true })).join('')}
          </div>
        </div>
      </section>`;
  }

  function torvaldCard(tweet, options = {}) {
    const home = Boolean(options.home);
    const paragraphs = tweet.id === 'torvald-7'
      ? esc(tweet.text)
      : torvaldParagraphHTML(tweet.text);
    const avatarMarkup = home
      ? `<button class="x-avatar-link" type="button" data-x-profile="torvald" aria-label="Open Torvald Helmer profile">${avatar('torvald', 'x-tweet-avatar')}</button>`
      : avatar('torvald', 'x-tweet-avatar');
    const nameMarkup = home
      ? '<button class="x-name-link" type="button" data-x-profile="torvald">Torvald Helmer</button>'
      : '<span class="x-tweet-name">Torvald Helmer</span>';
    return `
      <article class="x-tweet tweet">
        ${avatarMarkup}
        <div class="x-tweet-main">
          <div class="x-tweet-head tweet-header">
            <span class="x-name-block">${nameMarkup}${verified()}</span>
            <span class="x-handle-time"><span class="x-handle">@TorvaldHelmer</span><span class="x-dot">·</span><span class="x-time">${esc(cleanTime(tweet.time))}</span></span>
          </div>
          <div class="x-tweet-text tweet-content">${paragraphs}</div>
          ${statsHTML(tweet.stats)}
        </div>
      </article>`;
  }

  function torvaldSpecialCard(tweet, options = {}) {
    const home = Boolean(options.home);
    const avatarMarkup = home
      ? `<button class="x-avatar-link" type="button" data-x-profile="torvald" aria-label="Open Torvald Helmer profile">${avatar('torvald', 'twt-icon')}</button>`
      : avatar('torvald', 'twt-icon');
    return `
      <article class="twt" data-x-twt>
        <div class="twt-header">
          <div class="twt-icon-container">
            ${avatarMarkup}
          </div>
          <div class="twt-id">
            <div class="twt-meta-row">
              <span class="twt-name">${home ? '<button class="x-name-link" type="button" data-x-profile="torvald">Torvald Helmer</button>' : 'Torvald Helmer'} ${verified()}</span>
              <span class="twt-handle-time"><span class="twt-handle">@TorvaldHelmer</span><span class="twt-dot">·</span><span class="twt-time">${esc(cleanTime(tweet.time))}</span></span>
            </div>
          </div>
        </div>

        <div class="twt-content">${esc(tweet.text)}</div>

        <div class="twt-quotebox">
          <div class="twt-header">
            <div class="twt-icon-container">
              <span class="x-avatar x-avatar-henrik twt-iconquote" aria-hidden="true"></span>
            </div>
            <div class="twt-id">
              <div class="twt-meta-row">
                <span class="twt-name">henrik1828</span>
                <span class="twt-handle-time"><span class="twt-handle">@ihatealtending</span><span class="twt-dot">·</span><span class="twt-time">Dec 27 · 1:28</span></span>
              </div>
            </div>
          </div>
          <div class="twt-contentquote">lol dude crashing out bcs his wife left him (he deleted the original post but guess who got a screenshot). check out the latest post of <span class="twt-hl">norahelmer</span> on instagram he's been treating her like shit</div>

          <div class="twt-image-container">
            <div class="twt-header">
              <div class="twt-icon-container">
                ${avatar('torvald', 'twt-iconquote')}
              </div>
              <div class="twt-id">
                <div class="twt-meta-row">
                  <span class="twt-name">Torvald Helmer ${verified()}</span>
                  <span class="twt-handle-time"><span class="twt-handle">@TorvaldHelmer</span><span class="twt-dot">·</span><span class="twt-time">Dec 27 · 0:17</span></span>
                </div>
              </div>
            </div>
            <div class="twt-content">
              <p>Women nowadays have no religion, no morality, no sense of duty, and their husbands are unjustly punished for not suspecting as such!</p>
              <p>Eventually they will destroy all your happiness, ruin all your future!</p>
              <p>It is so horrible to think of sinking to such miserable depths because of a thoughtless woman—one who is cherished by her husband during the entirety of their married life, nonetheless!!!</p>
            </div>
          </div>
        </div>

        ${statsHTML(tweet.stats)}
      </article>`;
  }

  function torvaldProfileScreen() {
    const profile = data.profiles.torvald;
    const tweets = data.torvaldTweets
      .filter(tweet => !tweet.deleted)
      .slice()
      .sort((a, b) => String(b.sort).localeCompare(String(a.sort)));
    return `
      <section class="x-screen x-profile-screen" data-x-screen="torvald">
        <header class="x-profile-topbar">
          <button class="x-back-button" type="button" data-x-back aria-label="Back to X home">${icon('i-chevron-left')}</button>
          <strong>Profile</strong>
          <span class="x-profile-topbar-spacer" aria-hidden="true"></span>
        </header>
        <div class="x-profile-scroll" data-x-profile-scroll="torvald">
          <div class="x-banner x-banner-torvald"></div>
          <div class="x-profile-avatar-wrap">
            ${avatar('torvald', 'x-profile-avatar')}
            <span class="x-following-button" aria-label="Following Torvald Helmer">Following</span>
          </div>
          <div class="x-profile-info">
            <div class="x-profile-name-row">
              <span class="x-profile-name">${esc(profile.name)}</span>
              ${verified()}
            </div>
            <div class="x-profile-handle">${esc(profile.handle)}</div>
            <p class="x-profile-bio">${esc(profile.bio)}</p>
            <div class="x-profile-joined">${esc(profile.joined)}</div>
            <div class="x-profile-counts"><strong>${esc(profile.following)}</strong> Following&nbsp;&nbsp;&nbsp;<strong>${esc(profile.followers)}</strong> Followers</div>
          </div>
          <div class="x-profile-feed">
            ${tweets.map(tweet => tweet.id === 'torvald-8' ? torvaldSpecialCard(tweet) : torvaldCard(tweet)).join('')}
          </div>
        </div>
      </section>`;
  }

  function root() {
    activeScreen = 'home';
    return `
      <div class="app-view x-app" data-x-app>
        ${statusBar()}
        <div class="x-screens">
          ${homeScreen()}
          ${torvaldProfileScreen()}
          ${profileScreen('nora')}
        </div>
      </div>`;
  }

  function setScreen(name) {
    const rootElement = document.querySelector('.x-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('.x-screen').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.xScreen === name);
    });
    activeScreen = name;
    if (name !== 'home') {
      const scroll = rootElement.querySelector(`[data-x-profile-scroll="${name}"]`);
      if (scroll) scroll.scrollTop = 0;
    }
  }

  function openProfile(name) {
    if (name !== 'torvald' && name !== 'nora') return;
    setScreen(name);
  }

  function showHome() {
    setScreen('home');
  }

  function back() {
    if (activeScreen !== 'home') {
      showHome();
      return true;
    }
    return false;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.x-app');
      if (!app) return;
      const profileTarget = event.target.closest('[data-x-profile]');
      if (profileTarget) {
        openProfile(profileTarget.dataset.xProfile);
        return;
      }
      if (event.target.closest('[data-x-back]')) {
        showHome();
      }
    });
  }

  window.XUI = { root, back, openProfile, showHome };
})();
