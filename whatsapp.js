/* WhatsApp app: exact docx story data, navigation, email viewer, and scroll restore. */
(() => {
  'use strict';

  const data = window.WA_DATA;
  if (!data) return;

  const EMAIL = data.email;
  const CONVERSATIONS = data.conversations;
  const appLayer = document.getElementById('appLayer');

  let activeChat = null;
  let emailOpen = false;
  let emailChatId = null;
  let scrollBeforeEmail = 0;
  let torvaldUnread = true;
  const chatScrollPositions = Object.create(null);
  window.WHATSAPP_UNREAD = true;

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

  function statusBar(light = false) {
    return `
      <div class="status-bar app-status${light ? ' is-light' : ''}">
        <span class="status-time">3:30</span>
        ${STATUS_RIGHT}
      </div>`;
  }

  function checks(single = false, gray = false) {
    if (single) {
      return `
        <span class="wa-checks wa-checks-single" aria-label="Delivered">
          <svg viewBox="0 0 14 11" aria-hidden="true"><path d="M1 5.7l3.1 3.2L12.8 1"/></svg>
        </span>`;
    }
    return `
      <span class="wa-checks${gray ? ' wa-checks-gray' : ''}" aria-label="${gray ? 'Delivered' : 'Read'}">
        <svg viewBox="0 0 19 11" aria-hidden="true">
          <path d="M1 5.7l3.1 3.2L12.8 1"/>
          <path d="M6.4 5.7l3.1 3.2L18.1 1"/>
        </svg>
      </span>`;
  }

  function avatarMarkup(conversation, extraClass = '') {
    return `<span class="wa-avatar wa-avatar-${esc(conversation.avatar)} ${extraClass}" aria-hidden="true"></span>`;
  }

  function previewMarkup(conversation) {
    if (conversation.previewKind === 'draft') {
      const draft = conversation.preview.replace(/^Draft:\s*/, '');
      return `<span class="wa-draft-label">Draft:</span> ${esc(draft)}`;
    }
    return esc(conversation.preview);
  }

  function contactDate(value) {
    return String(value).replace(/^Dec\.\s*/, 'December ');
  }

  function contactRows() {
    return CONVERSATIONS.map(conversation => {
      const unread = conversation.id === 'torvald' && torvaldUnread;
      return `
      <button class="wa-contact-row${unread ? ' is-unread' : ''}" type="button" data-wa-contact="${esc(conversation.id)}" aria-label="Open chat with ${esc(conversation.name)}${unread ? ', 1 unread message' : ''}">
        ${avatarMarkup(conversation)}
        <span class="wa-contact-main">
          <span class="wa-contact-line">
            <strong>${esc(conversation.name)}</strong>
            <span class="wa-contact-date">${esc(contactDate(conversation.lastDate))}</span>
          </span>
          <span class="wa-contact-preview">${previewMarkup(conversation)}</span>
        </span>
        ${unread ? '<span class="wa-unread-badge" aria-label="1 unread message">1</span>' : ''}
      </button>`;
    }).join('');
  }

  function clearTorvaldUnread() {
    if (!torvaldUnread) return;
    torvaldUnread = false;
    window.WHATSAPP_UNREAD = false;
    const row = document.querySelector('[data-wa-contact="torvald"]');
    if (row) {
      row.classList.remove('is-unread');
      row.querySelectorAll('.wa-unread-badge').forEach(badge => badge.remove());
      row.setAttribute('aria-label', 'Open chat with Torvald💕');
    }
    document.querySelectorAll('[data-wa-home-badge]').forEach(badge => badge.remove());
    const homeButton = document.querySelector('.app-button[data-app="whatsapp"]');
    if (homeButton) homeButton.setAttribute('aria-label', 'Open WhatsApp');
    const lockNotification = document.getElementById('lockWhatsAppNotification');
    if (lockNotification) lockNotification.hidden = true;
  }

  function mailStatus(variant) {
    if (variant === 'scheduled') return 'Scheduled';
    if (variant === 'draft') return 'Draft';
    return 'Inbox';
  }

  function emailCardMarkup(event) {
    const variant = event.variant || 'received';
    return `
      <div class="wa-row in wa-mail-row">
        <button class="wa-mail-card" type="button" data-wa-email="${esc(event.email)}" data-wa-variant="${esc(variant)}" aria-label="Open email ${esc(EMAIL.subject)}">
          <span class="wa-mail-top">
            <span class="wa-gmail-mark tiny">M</span>
            <span class="wa-mail-app">Gmail</span>
            <span class="wa-mail-status">${esc(mailStatus(variant))}</span>
          </span>
          <span class="wa-mail-subject">${esc(EMAIL.subject)}</span>
          <span class="wa-mail-from">${esc(EMAIL.sender)} <span>to ${esc(EMAIL.receiver)}</span></span>
          <span class="wa-mail-snippet">${esc(EMAIL.body[1])}</span>
          ${variant === 'scheduled' ? '<span class="wa-mail-scheduled">Scheduled to send: 17:00, December 25</span>' : ''}
          <span class="wa-mail-open">Tap to view email</span>
        </button>
      </div>`;
  }

  function callMarkup(event) {
    return `
      <div class="wa-row in">
        <div class="wa-bubble in wa-call-bubble">
          <span class="wa-call-icon">${icon('i-phone-incoming')}</span>
          <span class="wa-call-details">
            <span class="wa-call-title">Voice call</span>
            <span class="wa-call-duration">${esc(event.duration)}</span>
          </span>
        </div>
      </div>`;
  }

  function textMarkup(event) {
    const quote = event.quote ? `
      <span class="wa-quote">
        <strong>${esc(event.quote.name)}</strong>
        <span>${esc(event.quote.text)}</span>
      </span>` : '';
    const reaction = event.reaction ? `
      <span class="wa-reaction">${esc(event.reaction)}<b>1</b></span>` : '';
    const check = event.type === 'out' ? checks(Boolean(event.singleCheck), Boolean(event.grayChecks)) : '';
    return `
      <div class="wa-row ${event.type}${event.reaction ? ' has-reaction' : ''}">
        <div class="wa-bubble-wrap">
          <div class="wa-bubble ${event.type}">
            ${quote}
            <span class="wa-text">${esc(event.text)}</span>
            ${check ? `<span class="wa-meta">${check}</span>` : ''}
          </div>
          ${reaction}
        </div>
      </div>`;
  }

  function renderEvents(conversation) {
    return conversation.events.map(event => {
      if (event.type === 'system') {
        return `<div class="wa-system-row"><span class="wa-system-pill">${esc(event.text)}</span></div>`;
      }
      if (event.type === 'call') return callMarkup(event);
      if (event.type === 'email') return emailCardMarkup(event);
      return textMarkup(event);
    }).join('');
  }

  function composerMarkup(conversation) {
    const isAnne = conversation.id === 'anne';
    const field = isAnne
      ? `<textarea class="wa-input wa-draft-input" rows="3" aria-label="Draft message">${esc(conversation.draft)}</textarea>`
      : '<input class="wa-input" type="text" placeholder="Message" aria-label="Message" autocomplete="off">';
    return `
      <form class="wa-composer" data-wa-composer>
        <button class="wa-composer-plus" type="button" aria-label="Add attachment">${icon('i-plus')}</button>
        <div class="wa-composer-field">${field}</div>
        <button class="wa-send" type="button" aria-label="Send message">${icon('i-send')}</button>
      </form>`;
  }

  function chatScreen(conversation) {
    return `
      <section class="wa-screen wa-chat-screen" data-wa-screen="${esc(conversation.id)}" data-wa-chat="${esc(conversation.id)}">
        <header class="wa-topbar wa-chat-topbar">
          <button class="wa-icon-button wa-chat-back" type="button" data-wa-back aria-label="Back to chats">${icon('i-chevron-left')}</button>
          ${avatarMarkup(conversation)}
          <div class="wa-chat-heading">
            <strong>${esc(conversation.name)}</strong>
          </div>
          <span class="wa-topbar-icons" aria-hidden="true">${icon('i-more')}</span>
        </header>
        <div class="wa-messages wa-chat-${esc(conversation.id)}" data-wa-messages>
          ${renderEvents(conversation)}
        </div>
        ${composerMarkup(conversation)}
      </section>`;
  }

  function root() {
    return `
      <div class="app-view wa-app" data-wa-app>
        ${statusBar(true)}
        <div class="wa-screens">
          <section class="wa-screen wa-list-screen is-active" data-wa-screen="list">
            <header class="wa-topbar wa-list-topbar">
              <button class="wa-icon-button" type="button" data-home aria-label="Back to home">${icon('i-chevron-left')}</button>
              <h1>WhatsApp</h1>
              <span class="wa-topbar-icons" aria-hidden="true">${icon('i-search')}${icon('i-more')}</span>
            </header>
            <div class="wa-contact-list">
              ${contactRows()}
            </div>
          </section>
          ${CONVERSATIONS.map(chatScreen).join('')}
        </div>
        <div class="wa-email-overlay" data-wa-email-overlay hidden></div>
      </div>`;
  }

  function emailFieldsMarkup() {
    return `
      <div class="wa-email-from">
        <span class="wa-email-field-label">From</span>
        <span class="wa-email-sender">${esc(EMAIL.sender)}</span>
        <span class="wa-email-address">&lt;${esc(EMAIL.senderEmail)}&gt;</span>
      </div>
      <div class="wa-email-to">
        <span class="wa-email-field-label">To</span>
        ${esc(EMAIL.receiver)} &lt;${esc(EMAIL.receiverEmail)}&gt;
      </div>`;
  }

  function emailOverlayMarkup(variant) {
    const status = variant === 'scheduled'
      ? 'Scheduled to send: 17:00, December 25'
      : (variant === 'draft' ? 'Draft' : 'Inbox');
    return `
      <button class="wa-email-scrim" type="button" data-wa-email-close aria-label="Close email"></button>
      <button class="wa-photo-close wa-email-close" type="button" data-wa-email-close aria-label="Close email"><span aria-hidden="true">×</span></button>
      <div class="wa-photo-stage">
        <article class="wa-email-shot wa-email-scroll" aria-label="Email screenshot">
          <div class="wa-gmail-bar">
            <span class="wa-gmail-mark">M</span>
            <strong>Gmail</strong>
            <span class="wa-gmail-bar-icons" aria-hidden="true">${icon('i-search')}${icon('i-more')}</span>
          </div>
          <div class="wa-email-status ${variant === 'scheduled' ? 'is-scheduled' : ''}">${esc(status)}</div>
          <div class="wa-email-label">Subject</div>
          <h2 class="wa-email-subject">${esc(EMAIL.subject)}</h2>
          <div class="wa-email-meta">${emailFieldsMarkup()}</div>
          <div class="wa-email-body">
            ${EMAIL.body.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}
          </div>
          <div class="wa-email-attachment">
            <span class="wa-pdf-badge">PDF</span>
            <span><strong>Original loan documents</strong><small>Attached to this email</small></span>
          </div>
          <div class="wa-email-scroll-end"></div>
        </article>
      </div>`;
  }

  function setActiveScreen(name) {
    const rootElement = document.querySelector('.wa-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('.wa-screen').forEach(screen => {
      screen.classList.toggle('is-active', screen.dataset.waScreen === name);
    });
  }

  function openChat(id) {
    const rootElement = document.querySelector('.wa-app');
    if (!rootElement) return;
    const chat = rootElement.querySelector(`[data-wa-chat="${id}"]`);
    if (!chat) return;
    if (id === 'torvald') clearTorvaldUnread();
    activeChat = id;
    setActiveScreen(id);
    const messages = chat.querySelector('[data-wa-messages]');
    if (!messages) return;
    if (Object.prototype.hasOwnProperty.call(chatScrollPositions, id)) {
      messages.scrollTop = chatScrollPositions[id];
    } else {
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function showList() {
    if (activeChat) {
      const active = document.querySelector(`[data-wa-chat="${activeChat}"]`);
      const messages = active ? active.querySelector('[data-wa-messages]') : null;
      if (messages) chatScrollPositions[activeChat] = messages.scrollTop;
    }
    activeChat = null;
    setActiveScreen('list');
  }

  function openEmail(button) {
    const chat = button.closest('.wa-chat-screen');
    if (!chat) return;
    const messages = chat.querySelector('[data-wa-messages]');
    emailChatId = chat.dataset.waChat;
    scrollBeforeEmail = messages ? messages.scrollTop : 0;
    const overlay = document.querySelector('[data-wa-email-overlay]');
    if (!overlay) return;
    overlay.innerHTML = emailOverlayMarkup(button.dataset.waVariant || 'received');
    overlay.hidden = false;
    emailOpen = true;
  }

  function closeEmail() {
    const overlay = document.querySelector('[data-wa-email-overlay]');
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    overlay.innerHTML = '';
    emailOpen = false;
    const chat = emailChatId
      ? document.querySelector(`[data-wa-chat="${emailChatId}"]`)
      : null;
    const messages = chat ? chat.querySelector('[data-wa-messages]') : null;
    if (messages) {
      messages.scrollTop = scrollBeforeEmail;
    }
    emailChatId = null;
  }

  function back() {
    if (emailOpen) {
      closeEmail();
      return true;
    }
    if (activeChat) {
      showList();
      return true;
    }
    return false;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.wa-app');
      if (!app) return;

      if (event.target.closest('[data-wa-email-close]')) {
        closeEmail();
        return;
      }

      const emailButton = event.target.closest('[data-wa-email]');
      if (emailButton) {
        openEmail(emailButton);
        return;
      }

      if (event.target.closest('[data-wa-back]')) {
        showList();
        return;
      }

      const contact = event.target.closest('[data-wa-contact]');
      if (contact) {
        openChat(contact.dataset.waContact);
      }
    });

    appLayer.addEventListener('submit', event => {
      if (event.target.closest('.wa-app')) {
        event.preventDefault();
      }
    });
  }

  window.WhatsAppUI = {
    root,
    back,
    openChat,
    showList,
    closeEmail
  };
})();
