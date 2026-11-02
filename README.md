# Mount Fable Guesthouse — demonstration website

A complete, single-page website for a fictional boutique guesthouse in Buea, Cameroon.
Built as **Guesthouse Demo B** — a second, deliberately different design direction from the
Atlantic View Apartments showcase, to prove the same service can produce radically different
brand experiences.

**Design direction:** contemporary African boutique hospitality × luxury travel editorial.
Deep forest green, warm ivory, muted stone, restrained terracotta. Large editorial serif
headlines, hairline rules, asymmetric compositions, generous whitespace, full-bleed photography.
No rounded cards, no drop shadows, no decorative gradients.

---

## 1. What's in the box

```
mount-fable/
├── index.html                 the whole page (7 sections + footer)
├── README.md
├── vercel.json                clean URLs + cache policy
└── assets/
    ├── css/styles.css         the design system (~1 file, no framework)
    ├── js/main.js             config, WhatsApp wiring, booking, viewer, menu
    └── img/                   14 optimised JPEGs (~1.1 MB total)
```

**Page weight on first load:** HTML ~14 KB + CSS ~14 KB + JS ~7 KB + hero image 143 KB ≈ **180 KB**.
Everything below the hero is lazy-loaded.

**Stack:** plain HTML, CSS and JavaScript. No build step, no framework, no dependencies,
no database, no authentication, no payment gateway.

---

## 2. Before showing it to a real client — two-minute checklist

### 2.1 The WhatsApp number (one line)

Open `assets/js/main.js`:

```js
whatsappNumber: '237653317507',   // digits only, full international format
```

That is the **only** place the number exists. Every WhatsApp button, every link and the
footer/menu display (`+237 653 317 507`) is generated from it at load time — nothing to
change in `index.html`. The display format is derived automatically.

The current value is a **showcase placeholder**, not a real number. If it is ever blank or
obviously invalid, the script logs an error and disables the buttons rather than sending
guests to a dead link.

### 2.2 Property content

Name, headline, room names, descriptions, prices, amenities, location copy and the footer
disclaimer are all plain text in `index.html` — edit in place.

### 2.3 Photography

Replace the files in `assets/img/` with the guesthouse's own photos, keeping the same file
names and aspect ratios:

| File | Slot | Ratio |
|---|---|---|
| `hero.jpg` / `hero-sm.jpg` | hero (desktop / mobile) | 16:9 / 4:5 |
| `intro.jpg` | brand introduction | 4:5 |
| `intro-detail.jpg` | small overlap image | 1:1 |
| `room-classic.jpg` | Classic Room | 4:5 |
| `room-deluxe.jpg` | Deluxe Room | 3:2 |
| `room-executive.jpg` | Executive Suite | 4:5 |
| `story-1…6.jpg` | photo story | mixed |
| `breakfast.jpg` | photo story | 4:3 |
| `location.jpg` | (optional) location | 16:9 |

Then reword the "illustrative photography" note in the introduction.

### 2.4 Map

`index.html` contains a self-contained SVG **map placeholder**. Replace the whole
`<figure class="map-placeholder">` block with a Google Maps or Mapbox embed; keep the class
name if you want the surrounding styling to continue to apply.

### 2.5 The studio credit

Replace `[Your Studio Name]` in the footer.

---

## 3. How the WhatsApp booking works

The form never posts anywhere. It builds a `wa.me` deep link:

```
https://wa.me/<number>?text=<url-encoded message>
```

Example payload:

```
Hello Mount Fable Guesthouse,

I would like to enquire about a stay:

• Room: Executive Suite
• Check-in: Tue, 3 Feb 2026
• Check-out: Fri, 6 Feb 2026
• Nights: 3
• Guests: 2 guests

Could you let me know if these dates are available and what the total would be? Thank you!
```

A live summary line under the form shows the same request before the button is pressed.

**Validation** (nothing opens until it passes):
- room category, check-in, check-out and guests are required;
- check-out must be after check-in — the check-out field re-mins itself to the day after check-in;
- past check-in dates are rejected;
- errors appear inline in plain language and clear themselves once the form is valid.

To open WhatsApp *without* a pre-filled message, use any link carrying `data-wa="general"`.

---

## 4. Demonstration integrity

This is a fictional property. The page states so in three places: the strip at the top, the
introduction, the location address block and the footer disclaimer. Prices are marked
"Demonstration price — not a real rate", and the booking section says no live availability is
checked. There are no reviews, ratings, testimonials or availability claims anywhere.

---

## 5. Hosting

Any static host. Two known-good options:

**GitHub Pages** — push the folder to a repo, then *Settings → Pages → Source: main / (root)*.
Site appears at `https://<user>.github.io/<repo>/`. All paths are relative, so sub-path hosting
works without changes.

**Vercel** — import the repo; no framework preset, no build command, output directory is the
repo root. `vercel.json` sets clean URLs and a safe cache policy (code revalidates, images
cache for a day).

---

## 6. Reusing this for a real client

1. Copy the folder and rename it.
2. Change `whatsappNumber` and `propertyName` in `assets/js/main.js`.
3. Swap the copy in `index.html` — the seven sections are commented and independent.
4. Replace the photography, keeping the file names.
5. Replace the map placeholder and the studio credit.
6. Delete the demonstration strip, the demonstration price notes and the footer disclaimer
   **only** once the site represents a real business.
