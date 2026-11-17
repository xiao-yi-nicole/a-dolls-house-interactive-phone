# Little iPhone 6

A self-contained, interactive iPhone 6 made with plain HTML, CSS, and JavaScript.

## Run it

Open `index.html` in a modern browser. No build step or package install is required.

If you only want to move or share a single file, open **`standalone.html`** instead. It
inlines all CSS and JavaScript, the phone wallpapers, and every WhatsApp and X image, so
it works without the rest of the folder.

The wallpapers are embedded as data URIs in `styles.css`, so `index.html` also works
even if the `assets/` folder is missing. The `assets/` copies are kept only as source
images.

If your browser blocks local files, serve the folder locally:

```bash
python -m http.server 8080
```

Then open `http://127.0.0.1:8080`.

## Controls

- **Swipe up** anywhere on the lock screen, or press **ArrowUp**, to unlock.
- Tap an app icon to open it.
- The **chevron** in an app's header goes back one page.
- The **house** icon in an app's header exits to the home screen.
- Press **Esc** to go back one page, or to lock the phone from the home screen.
- The physical **home button** below the screen locks the phone or exits an app.
- On desktop, hold the left mouse button and drag vertically inside the X feed or a
  WhatsApp chat/list to swipe-scroll it, just like a touch screen.
- In **WhatsApp**, the list back arrow exits to the desktop; a chat's back arrow returns
  to the contact list; closing an email returns to the same chat and scroll position.
  Opening Torvald's unread conversation clears its contact-row badge, desktop badge and
  lock-screen notification.

## Included screens

Required apps: WhatsApp, Instagram, Amazon, ChatGPT, X, Spotify, Notes, Calendar,
Settings, and Photos.

Extra home-screen apps: Weather and Clock.

Home grid (four columns): Calendar, Clock, Weather, Photos; Notes, Instagram, Amazon,
ChatGPT; Spotify, X.

Dock apps: Phone, Safari, WhatsApp, and Settings. The Phone dock icon carries a red 17
badge for missed calls.

WhatsApp is a complete four-conversation story adaptation of `Whatsapp.docx`: exact
message text and spelling, Torvald's pink wallpaper, custom avatars, date/time separators,
blue double checks, a single gray check for Krogstad's final message, Christine's ❤️
reaction and quoted reply, two incoming `Voice call` bubbles, three clickable Gmail-style
email screenshots with a cropped-photo viewer, and Anne's unsent draft.

Torvald's final letter is one unread incoming bubble. The unread state appears as a green
`1` badge on the contact row, on the desktop WhatsApp icon, and as an iOS-style lock-screen
notification. Opening the Torvald chat clears all three. Each conversation remembers its
own scroll position after leaving it; first open still starts at the bottom.

X is a light-mode story app built from `X.docx`. The Following feed shows Torvald's posts;
his profile includes the deleted post, the limited-reply notice, a Following status and the
henrik1828 quote with its deleted-post screenshot; Nora's protected profile uses her
special-character name, lock icon, threaded replies, a Torvald quote tweet and the embedded
WhatsApp conversation crop. Tapping Nora's home avatar opens her profile, and tapping
Torvald's avatar or name in the feed opens his profile. Repost counts include quote counts,
and all tweet timestamps carry a small calendar icon.

Instagram is a light-mode adaptation of `Instagram.docx`. It opens directly on Nora's
profile with the exact follower data and blue-linked `@torvaldhelmer` bio, then presents
the five posts as a clean three-column image grid: the two pinned posts carry pin badges,
the nine-photo post carries a multi-image badge, and the party and Christmas-tree covers
complete the grid. Tapping any cover opens the Post detail view with actions, likes,
caption and date. The nine-photo post is a one-image-at-a-time carousel driven by large
semi-transparent arrows; the December 26 party detail plays the supplied audio and pauses
and resets it on exit. Both the grid and detail view remain drag-to-scroll.

Notes is a native-style light iOS Notes screen: a yellow-accent `< Folders` bar, large
Notes title, search field, white rounded note cards and a yellow folder/new bottom bar.
Opening a note shows a white editor with the yellow share/new/Done actions, its original
line breaks and spellings, and the Torvald Italy strikethrough. The detail back arrow
returns to the list and restores its scroll position. Both views support mouse drag-to-scroll.

Calendar is an iOS-style December 2026 month view with a red selected day, event dots,
day-driven event lists and Today/Calendars/Inbox tabs. The date grid is interactive and
the content supports mouse drag-to-scroll.

Spotify opens directly on a Liked Songs playlist with a gray-green-to-black gradient,
large cover, 35-minute meta and a green play/pause control. Its nine track rows sit on a
black list with embedded covers, a gray placeholder for the missing cover, green active
titles and sequential audio playback with automatic next-track behavior.

Photos is a light Library grid of eight square thumbnails ordered oldest to newest, with
a Years/Months/All selector. Opening any photo gives a light full-screen viewer with the
date and time stacked in two lines, blue Back/Edit controls, translucent gray left/right
arrows and horizontal swipe, an eight-photo filmstrip with a blue current-photo border,
and dark-gray share/heart/info/trash actions. The detail back arrow returns to the
Library and restores its scroll position.

Phone opens on a light Recents page with All/Missed segmented control, Edit, five red
Torvald missed calls from A Doll's House (newest first: 1:25, 1:13, 1:07, 0:58 and
0:50 AM), and
Favorites/Recents/Contacts/Keypad/Voicemail bottom navigation. The lock screen stacks
the WHATSAPP notification above a PHONE missed-call card for Torvald (17), both on
high-transparency white glass. Both Dock badges are red; the Phone app and lock-card
icons use the supplied green phone image.

Amazon opens directly on a white Your Orders page with a search header, order search
row and sixteen continuous horizontal product cards. Each card has an 80px rounded
image top-aligned on the left, a two-line-clamped title with the status below it on the
right, and a gray chevron at the far right, above the fixed Home/Profile/Cart/Menu bar.
The first Returning status is green and bold; delivered statuses are gray. The list
supports mouse drag scrolling; cards are not links.

A few small details are interactive too: Settings has toggles and detail pages, and the
lock-screen flashlight toggles.

The phone uses a fixed demo date of **Sunday, December 27, 2026** and a fixed demo time
of **3:30** so the lock screen stays visually consistent.

## Project structure

```text
tiny-phone/
├── index.html          Markup and the inline SVG icon sprite
├── standalone.html     Single-file build: HTML + CSS + JS + embedded wallpapers
├── styles.css          Device shell, lock screen, home screen, embedded wallpapers
├── app.css             Per-app visual design (other apps)
├── script.js           Shell, lock screen, home screen and other app interactions
├── whatsapp-data.js    Conversation data extracted verbatim from Whatsapp.docx
├── whatsapp.js         WhatsApp navigation, email viewer and scroll restore
├── whatsapp.css        WhatsApp UI, bubbles, checks, calls and email styling
├── whatsapp-media.css  Embedded WhatsApp avatars and chat wallpapers
├── x-data.js           X profiles, posts, stats, quotes and threads from X.docx
├── x.js                X navigation, profiles, quote cards and thread rendering
├── x.css               Light-mode X interface scoped to .x-app
├── x-media.css         Embedded X banners and avatars
├── instagram-data.js   Nora's Instagram profile and post data
├── instagram.js        Profile/detail navigation, carousel and audio
├── instagram.css       Light-mode Instagram interface scoped to .igx-app
├── instagram-media.css Embedded Instagram avatars and post images
├── notes.js            Notes list, full note text and detail navigation
├── notes.css           Native light-mode Notes interface scoped to .ntx-app
├── calendar.js         December 2026 grid, selected day and event data
├── calendar.css        iOS light-mode Calendar interface scoped to .calx-app
├── spotify.js          Liked Songs playlist, audio queue and playback
├── spotify.css         Spotify gradient header, black list and active state
├── spotify-media.css   Embedded Spotify playlist and album covers
├── photos.js           Library grid, photo viewer, swipe and filmstrip
├── photos.css          Light Library and photo viewer
├── photos-media.css    Embedded eight-photo library images
├── amazon-orders.js    Grouped Your Orders list and bottom navigation
├── amazon-orders.css   White Amazon order cards and fixed tab bar
├── amazon-orders-media.css  Embedded product thumbnails
├── preview/            Rendered preview images
└── assets/
    ├── lock-wallpaper.jpg
    ├── home-wallpaper.jpg
    ├── whatsapp/        Source avatar and wallpaper images
    ├── x/               Source X banners and avatars
    └── instagram/       Source Instagram profile and post images
```

## Wallpaper sources

- Lock screen: https://i.postimg.cc/kDrJkCLS/001-suo-ping.jpg
- Home screen: https://i.postimg.cc/g27W5mRg/002-bi-zhi.png

Both images are embedded into the stylesheet as data URIs, and the copies in `assets/`
are the source files. The demo therefore works offline and does not depend on an
`assets/` folder being present next to `index.html`.

WhatsApp avatars and chat wallpapers are also embedded in `whatsapp-media.css`:

- Torvald: https://i.postimg.cc/qvqThnkm/007-Torvald-Whatsapp-tou-xiang.png
- Christine: https://i.postimg.cc/tRdyLpS9/006-Christine-Whatsapp-tou-xiang.png
- Krogstad: https://i.postimg.cc/wBtgPNZ8/005-Krogstad-Whatsapp-tou-xiang.png
- Anne: https://i.postimg.cc/PxssRR1g/008-Anne-Whatsapp-tou-xiang.png
- Torvald chat wallpaper: https://i.postimg.cc/VkVtyjGJ/003-Whatsapp-Torvald-liao-tian-bi-zhi.jpg
- Default chat wallpaper: https://i.ibb.co/YjT1qGH/1620176370792.jpg

X banners and avatars are embedded in `x-media.css`:

- Torvald banner: https://i.postimg.cc/wjFZntxZ/015-Torvald-tui-tebanner.png
- Torvald avatar: https://i.postimg.cc/NfMzTCfh/010-Torvald-tui-te-tou-xiang.png
- Nora banner: https://i.postimg.cc/5tLv6zHG/017-Nora-tui-tebanner.png
- Nora avatar: https://i.postimg.cc/Dzd95JVZ/012-Nora-tui-te-tou-xiang.png
- henrik1828 avatar: https://i.postimg.cc/zB7DVDq3/014-tui-te-yong-hu-tou-xiang.png

Instagram post images are embedded in `instagram-media.css`:

- Nora avatar: https://i.postimg.cc/Rh7DJptx/019-Nora-ins-tou-xiang.png
- Wedding: https://i.postimg.cc/655Q6kRj/023-Nora-hun-lipost.png
- Baby Emmy: https://i.postimg.cc/QtjxwwJz/037-Nora-third-baby-post.png
- Christmas tree: https://i.postimg.cc/T20jhXL6/021-Nora-christmas-tree-ins.png
- Party: https://i.postimg.cc/kMthLGB9/035-Nora-ins-party.png
- Eight-photo post: https://i.postimg.cc/5NjBCtY9/070-ins1.png through
  https://i.postimg.cc/TYhVDPLd/077-ins8.png

The Christmas-tree audio uses the supplied remote file:
https://mp3tourl.com/audio/1794721840300-f91609a8-3528-4636-89ba-8cfc2ab1105d.m4a

Spotify playlist and album covers are embedded in `spotify-media.css`:

- Liked Songs cover: https://i.postimg.cc/c1Q1f1h7/045-Spotify-playlist-cover.png
- Aqua, ABBA, SIX, The Smiths, Barbie, Hamilton, Goodbye and What Was I Made For covers
  use the image URLs supplied for the Spotify task.

Amazon order thumbnails are embedded in `amazon-orders-media.css` using the image URLs
supplied for the Your Orders task (dress, Christmas lights, candles, flowers, tree,
shawls, handkerchief, two dresses, doll bed, doll, trumpet, horse, sword and suit).

Photos images are embedded in `photos-media.css`:

- https://i.postimg.cc/m2pQLL0Q/001-suo-ping-tu-yuan.webp
- https://i.postimg.cc/HxDH7Q1N/044-photodress2.jpg
- https://i.postimg.cc/vBFM6Wwj/043-photodress1.jpg
- https://i.postimg.cc/Qd2CdJRq/039-photomacaroon.jpg
- https://i.postimg.cc/fTgk6N5z/038-photochocolate.jpg
- https://i.postimg.cc/vm70P3yX/002-bi-zhi-tu-yuan3.jpg
- https://i.postimg.cc/rpGfhQTJ/002-bi-zhi-tu-yuan2.jpg
- https://i.postimg.cc/0NGVtcvn/002-bi-zhi-tu-yuan1.jpg

## Notes

- The screen is a 375 × 667 CSS-pixel iPhone 6 display inside a 4.7-inch-style shell.
- The whole device scales down to fit small phone screens and shorter desktop windows.
- All phone UI copy is in English.
- Brand marks are drawn as inline SVG and CSS approximations for demo purposes.
