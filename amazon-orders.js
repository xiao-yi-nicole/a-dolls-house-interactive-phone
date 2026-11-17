/* Amazon — Your Orders list with grouped deliveries. */
(() => {
  'use strict';

  const GROUPS = [
    {
      title: '',
      status: 'Returning',
      hint: 'Return or replace items',
      items: [
        { title: 'Silven flame White Dress with Red Velvety Coat', image: 'nora-dress' }
      ]
    },
    {
      title: 'Delivered December 24',
      status: 'Delivered 24 Dec',
      hint: 'Buy it again',
      items: [
        { title: '33 FT 100LEDs Christmas Lights Plug in,Outdoor Indoor Connectable Fairy Lights with Timer and 8 Modes', image: 'lights' },
        { title: 'Christmas Tree Candles, 10 Pack Flameless Candles for Christmas Tree', image: 'candles' },
        { title: '24 Pcs Christmas Artificial Poinsettia Flowers 5.9"', image: 'flowers' },
        { title: 'Artificial Christmas Tree,4.5FT Christmas with Over 600 Branch Tips, Décor w/Easy Assembly', image: 'christmas-tree' }
      ]
    },
    {
      title: 'Delivered December 22',
      status: 'Delivered 22 Dec',
      hint: 'Buy it again',
      items: [
        { title: 'Reversible Pashmina Shawl Wrap for Women Gifts, 75x25 inch', image: 'shawl1' },
        { title: 'Urban CoCo Embroidered Scarf for Women, Tassel Shawl, Soft Lightweight Wrap', image: 'shawl2' },
        { title: 'Handkerchiefs for Women, 10Pcs Vintage Cotton Printed Hankies', image: 'handkerchief' },
        { title: 'Womens Summer 2026 Casual Maxi Dresses Lightweight Short Sleeve Dress', image: 'dress1' },
        { title: 'Womens Summer Ruffle Short Sleeve V Neck Shift Dress', image: 'dress2' },
        { title: '5pcs 18 Inch Doll Bed Accessories Pink Bow Doll Bedding Set', image: 'doll-bedstead' },
        { title: 'Handmade 8 Inch Waldorf Knitted Doll, Style 4', image: 'doll' },
        { title: 'Gold Trumpet Musical Instruments Toy for Kid Fake Plastic', image: 'trumpet' },
        { title: 'Ride on Horse Toys, Kids Riding Horse Toys Ride on Toys for 3-6 Years Old', image: 'horse' },
        { title: '2pcs Plastic Toy Sword for Kids Boys, 17.3" Fake Medieval Knight Sword', image: 'sword' },
        { title: "Boys' Formal Suit Set,Slim Fit Tuxedo Wedding Suit 6-16 Years with Adjustable Waist", image: 'suit' }
      ]
    }
  ];

  const appLayer = document.getElementById('appLayer');

  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const icon = id => `<svg aria-hidden="true"><use href="#${id}"></use></svg>`;

  const inlineIcon = (paths, viewBox = '0 0 24 24') => `
    <svg viewBox="${viewBox}" aria-hidden="true">${paths}</svg>`;

  const scanIcon = inlineIcon(`
    <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9"/>
    <path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9"/>
    <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15"/>
    <path d="M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>
    <path d="M4 12h16"/>
  `);

  const profileIcon = inlineIcon(`
    <circle cx="12" cy="8" r="3.4"/>
    <path d="M5.2 20c.8-3.2 3.4-5.1 6.8-5.1s6 1.9 6.8 5.1"/>
  `);

  const menuIcon = inlineIcon(`
    <path d="M4 7h16M4 12h16M4 17h16"/>
  `);

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

  function orderMarkup(order, status) {
    return `
      <article class="azx-order">
        <span class="azx-order-thumb azx-img-${order.image}" aria-hidden="true"></span>
        <div class="azx-order-copy">
          <h2 class="azx-order-title">${esc(order.title)}</h2>
          <p class="azx-order-status${status === 'Returning' ? ' is-returning' : ''}">${esc(status)}</p>
        </div>
        <span class="azx-order-arrow" aria-hidden="true">${icon('i-chevron-right')}</span>
      </article>`;
  }

  function root() {
    return `
      <div class="app-view azx-app">
        ${statusBar()}
        <header class="azx-topbar">
          <button class="azx-back" type="button" data-back aria-label="Back to home screen">${icon('i-chevron-left')}</button>
          <div class="azx-search" role="search">
            <span class="azx-search-placeholder">Search or ask a question</span>
            <span class="azx-search-icon">${scanIcon}</span>
            <span class="azx-search-icon">${icon('i-mic')}</span>
          </div>
        </header>
        <div class="azx-scroll" data-azx-scroll>
          <h1 class="azx-title">Your Orders</h1>
          <div class="azx-order-search">
            <span class="azx-order-search-icon">${icon('i-search')}</span>
            <span class="azx-order-search-text">Search all orders</span>
            <span class="azx-filter">Filter ${icon('i-chevron-right')}</span>
          </div>
          <div class="azx-groups">
            ${GROUPS.map(group => group.items.map(item => orderMarkup(item, group.status)).join('')).join('')}
          </div>
        </div>
        <nav class="azx-tabs" aria-hidden="true">
          <span class="azx-tab is-active">
            <span class="azx-tab-icon">${icon('i-home')}</span>
            <span>Home</span>
          </span>
          <span class="azx-tab">
            <span class="azx-tab-icon">${profileIcon}</span>
            <span>Profile</span>
          </span>
          <span class="azx-tab">
            <span class="azx-tab-icon azx-cart-icon">${icon('i-cart')}<b>3</b></span>
            <span>Cart</span>
          </span>
          <span class="azx-tab">
            <span class="azx-tab-icon">${menuIcon}</span>
            <span>Menu</span>
          </span>
        </nav>
      </div>`;
  }

  if (appLayer) {
    appLayer.addEventListener('click', event => {
      if (!event.target.closest('.azx-app')) return;
      event.preventDefault();
    });
  }

  window.AmazonOrdersUI = { root };
})();
