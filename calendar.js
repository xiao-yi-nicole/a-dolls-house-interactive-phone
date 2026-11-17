/* Calendar app: iOS-style December 2026 month grid with day-driven events. */
(() => {
  'use strict';

  const YEAR = 2026;
  const MONTH = 11;
  const SELECTED_DAY = 27;
  const EVENTS = {
    5: [{ time: '', title: 'Amazon Christmas order', note: '' }],
    24: [{ time: '17:00', title: 'Christmas Eve dinner', note: 'Home' }],
    26: [{ time: '21:00', title: 'Dance party', note: 'Upstairs' }],
    28: [{ time: '', title: 'Final installment - T', note: '' }]
  };

  const appLayer = document.getElementById('appLayer');
  let selectedDay = SELECTED_DAY;

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

  function dateLabel(day) {
    return new Date(YEAR, MONTH, day).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }

  function eventsFor(day) {
    return EVENTS[day] || [];
  }

  function eventsMarkup(day) {
    const events = eventsFor(day);
    if (!events.length) {
      return '<p class="calx-empty">No Events</p>';
    }
    return events.map(event => `
      <div class="calx-event">
        <span class="calx-event-time">${esc(event.time)}</span>
        <span class="calx-event-copy">
          <strong>${esc(event.title)}</strong>
          ${event.note ? `<small>${esc(event.note)}</small>` : ''}
        </span>
      </div>
    `).join('');
  }

  function dayCells() {
    const leading = 2;
    const cells = [];
    for (let index = 0; index < leading; index += 1) {
      cells.push('<span class="calx-day is-empty" aria-hidden="true"></span>');
    }
    for (let day = 1; day <= 31; day += 1) {
      const hasEvents = eventsFor(day).length > 0;
      cells.push(`
        <button class="calx-day${day === selectedDay ? ' is-selected' : ''}" type="button"
          data-calx-day="${day}" aria-label="${esc(dateLabel(day))}" aria-pressed="${day === selectedDay}">
          <span class="calx-day-number">${day}</span>
          ${hasEvents ? '<span class="calx-dot" aria-hidden="true"></span>' : ''}
        </button>`);
    }
    return cells.join('');
  }

  function root() {
    selectedDay = SELECTED_DAY;
    return `
      <div class="app-view calx-app" data-calx-app>
        ${statusBar()}
        <header class="calx-topbar">
          <button class="calx-back" type="button" data-back aria-label="Back to home screen">
            <span class="calx-back-chevron">${icon('i-chevron-left')}</span>
          </button>
          <div class="calx-topbar-icons" aria-hidden="true">
            <span class="calx-topbar-icon">
              <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </span>
            <span class="calx-topbar-icon">${icon('i-search')}</span>
            <span class="calx-topbar-icon">${icon('i-plus')}</span>
          </div>
        </header>
        <div class="cal-scroll" data-calx-scroll>
          <div class="calx-weekdays" aria-hidden="true">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>
          <div class="calx-month">
            <span class="calx-arrow calx-arrow-left" aria-hidden="true">&lt;</span>
            <div class="calx-month-copy">
              <strong>December</strong>
              <small>2026</small>
            </div>
            <span class="calx-arrow calx-arrow-right" aria-hidden="true">&gt;</span>
          </div>
          <div class="calx-grid">
            ${dayCells()}
          </div>
          <div class="calx-divider"></div>
          <section class="calx-events">
            <h1 class="calx-date-heading" data-calx-heading>${esc(dateLabel(selectedDay))}</h1>
            <div class="calx-event-list" data-calx-events>${eventsMarkup(selectedDay)}</div>
          </section>
        </div>
        <nav class="calx-tabs" aria-hidden="true">
          <span>Today</span>
          <span>Calendars</span>
          <span>Inbox</span>
        </nav>
      </div>`;
  }

  function selectDay(day) {
    selectedDay = day;
    const rootElement = document.querySelector('.calx-app');
    if (!rootElement) return;
    rootElement.querySelectorAll('[data-calx-day]').forEach(button => {
      const selected = Number(button.dataset.calxDay) === day;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const heading = rootElement.querySelector('[data-calx-heading]');
    const events = rootElement.querySelector('[data-calx-events]');
    if (heading) heading.textContent = dateLabel(day);
    if (events) events.innerHTML = eventsMarkup(day);
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      const app = event.target.closest('.calx-app');
      if (!app) return;
      const day = event.target.closest('[data-calx-day]');
      if (day) selectDay(Number(day.dataset.calxDay));
    });
  }

  window.CalendarUI = { root };
})();
