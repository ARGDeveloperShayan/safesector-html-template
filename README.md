<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ARGDeveloperShayan/SafeSector">
    <img src="assets/imgs/logo.png" alt="SafeSector Logo">
  </a>

  <h3 align="center">SafeSector</h3>

  <p align="center">
    A bilingual (EN / FA) marketing website theme for a professional HDD &amp; SSD data recovery lab.
    <br />
    <a href="https://github.com/ARGDeveloperShayan/SafeSector"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/ARGDeveloperShayan/SafeSector/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/ARGDeveloperShayan/SafeSector/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

**SafeSector** is a complete, production-ready front-end theme for a data recovery business — built entirely with hand-written HTML, CSS and vanilla JavaScript. No frameworks, no bundlers, no build step: clone it, open `index.html`, and it runs.

It ships with **six fully designed pages** that cover the entire customer journey, from the landing page to the thank-you-free 404 page:

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Hero, services, stats, pricing, calculator, process, portfolio, FAQ, blog, testimonials, certifications, contact |
| Blog Archive | `archive.html` | Paginated, dynamically rendered bilingual article grid |
| Blog Single | `single.html` | Full article layout with author card, threaded comments and related posts |
| Static Page | `page.html` | Reusable article/page template with breadcrumbs and comments |
| Search | `search.html` | Client-side search engine with keyword highlighting |
| 404 | `404.html` | Custom "Sector Not Found" error page with live search |

### Highlights

- 🌍 **Full bilingual support (English / Persian)** — one click switches every string on the page, flips the layout to RTL, swaps the font family from *Orbitron* to *Vazirmatn*, and converts USD prices to Toman. The choice is persisted in `localStorage`.
- 💸 **Live price calculator** — customers pick service type, drive capacity, physical condition and turnaround; the estimate updates instantly and respects the current language/currency.
- 🔎 **Client-side search** — indexes services, sections, FAQs and blog articles in **both** languages, highlights matched terms, and renders "no results" states gracefully.
- 📝 **Dynamic blog archive** — 9 articles, 6 per page, with generated pagination controls and per-language dates/tags.
- 🖼️ **Portfolio gallery with lightbox** — keyboard navigation (← → Esc), click-outside-to-close, and bilingual captions.
- 🎞️ **Swiper-powered carousels** — blog and testimonials with responsive breakpoints.
- 🧩 **Custom SVG sprite system** — every icon is a single `<use>` reference into `assets/sprites/sprites.svg`, keeping the markup clean and the payload small.
- ♿ **Accessibility-minded** — semantic landmarks, `aria-label`/`aria-expanded` state on menus and toggles, focus-visible outlines, and translated ARIA labels.
- 📱 **Fully responsive** — a full-screen mobile overlay menu, collapsible grids, and hover-only info panels that become static cards on touch screens.
- ✨ **Micro-interactions everywhere** — scroll progress bar, scroll-reveal animations, animated stats counters, image parallax-on-hover, and an animated 404 icon.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![HTML5][HTML5-shield]][HTML5-url]
* [![CSS3][CSS3-shield]][CSS3-url]
* [![JavaScript][JavaScript-shield]][JavaScript-url]
* [![Swiper][Swiper-shield]][Swiper-url]
* [![Orbitron][Orbitron-shield]][Orbitron-url]
* [![Vazirmatn][Vazirmatn-shield]][Vazirmatn-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

This is a static theme, so there is nothing to compile. To get a local copy up and running, follow these simple steps.

### Prerequisites

You only need a modern browser to view the theme. For the best experience (correct MIME types, relative paths, `fetch`-free asset loading) we recommend serving it over a local HTTP server:

* **Node.js / npx** (optional)
  ```sh
  npx serve .
  ```
* **Python 3** (optional)
  ```sh
  python -m http.server 8080
  ```
* Or simply use the **Live Server** extension in VS Code.

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/ARGDeveloperShayan/SafeSector.git
   ```
2. Enter the project folder
   ```sh
   cd SafeSector
   ```
3. Open `index.html` directly in your browser, **or** start a local server
   ```sh
   npx serve .
   ```
4. Visit the address printed in your terminal (usually `http://localhost:3000`)
   ```text
   http://localhost:3000/index.html
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

Use this section to understand where everything lives and how to customize the theme for your own lab.

### 1. Changing text and translations

Every visible string is wired to a `data-i18n*` attribute and resolved from the dictionaries in `assets/js/lang.js`:

```html
<h3 data-i18n="svc1.name">Click of Death</h3>
```

```js
// assets/js/lang.js
const SS_I18N = {
  en: { "svc1.name": "Click of Death" },
  fa: { "svc1.name": "کلیک مرگ" }
};
```

The four supported attribute types are:

| Attribute | Applied to |
| --- | --- |
| `data-i18n` | `textContent` |
| `data-i18n-html` | `innerHTML` (allows `<span class="green-underline">`) |
| `data-i18n-ph` | `placeholder` |
| `data-i18n-aria` | `aria-label` |

Add a new key to **both** the `en` and `fa` objects, then reference it in your markup. Missing keys automatically fall back to English.

### 2. Adding a blog post

Append a new object to the `archivePosts` array in `assets/js/main.js` (and, if you want it to be searchable, to the `searchData` array):

```js
{
  id: 10, date: "2026-04-02", img: "assets/imgs/blog/blog-1.jpg", link: "single.html",
  en: { title: "…", excerpt: "…", tags: ["SMR", "CMR"] },
  fa: { title: "…", excerpt: "…", tags: ["SMR", "CMR"] }
}
```

Pagination, dates and tags are regenerated automatically in the active language.

### 3. Updating the price list

Static prices live in the pricing tables as `data-price` attributes (USD is the base currency):

```html
<div class="cap-row"><span>1TB HDD</span><span class="cap-price" data-price="249">$249</span></div>
```

`formatPrice()` in `main.js` converts them to Toman when the site is in Persian mode. The calculator's own logic is in `initPriceCalculator()`.

### 4. Swapping the brand assets

| Asset | Location |
| --- | --- |
| Logo | `assets/imgs/logo.png` |
| Hero background | `assets/imgs/hero-background.jpg` |
| Blog thumbnails | `assets/imgs/blog/blog-1.jpg` … `blog-4.jpg` |
| Portfolio photos | `assets/imgs/portfolio/job-1.jpg` … `job-6.jpg` |
| Icons | `assets/sprites/sprites.svg` |

_For more details, refer to the [documentation](https://github.com/ARGDeveloperShayan/SafeSector)._

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Bilingual EN/FA engine with RTL + font switching
- [x] Home page with services, stats, pricing, calculator, process, portfolio, FAQ, blog, testimonials, certifications, contact
- [x] Dynamic blog archive with pagination
- [x] Blog single & static page templates with comments
- [x] Client-side bilingual search with term highlighting
- [x] Custom 404 page with live search
- [x] Custom SVG icon sprite system
- [ ] Wire the contact & comment forms to a real backend / email service
- [ ] Replace the static OpenStreetMap embed with a configurable map component
- [ ] Add a light theme / dark theme toggle
- [ ] Persist the selected blog category as a URL query parameter
- [ ] Ship a `manifest.json` + service worker for offline PWA support

See the [open issues](https://github.com/ARGDeveloperShayan/SafeSector/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/ARGDeveloperShayan/SafeSector/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=ARGDeveloperShayan/SafeSector" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Shayan Nateghi - shayannateghi90@gmail.com

Project Link: [https://github.com/ARGDeveloperShayan/SafeSector](https://github.com/ARGDeveloperShayan/SafeSector)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) — this README's structure
* [Swiper.js](https://swiperjs.com/) — the blog and testimonial carousels
* [Shields.io](https://shields.io/) and [md-badges](https://github.com/inttter/md-badges) — all badges in this document
* [contrib.rocks](https://contrib.rocks/) — the contributors widget
* [Orbitron](https://fonts.google.com/specimen/Orbitron) — the Latin typeface
* [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — the Persian typeface
* [OpenStreetMap](https://www.openstreetmap.org/) — the embedded lab map

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ARGDeveloperShayan/SafeSector.svg?style=for-the-badge
[contributors-url]: https://github.com/ARGDeveloperShayan/SafeSector/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ARGDeveloperShayan/SafeSector.svg?style=for-the-badge
[forks-url]: https://github.com/ARGDeveloperShayan/SafeSector/network/members
[stars-shield]: https://img.shields.io/github/stars/ARGDeveloperShayan/SafeSector.svg?style=for-the-badge
[stars-url]: https://github.com/ARGDeveloperShayan/SafeSector/stargazers
[issues-shield]: https://img.shields.io/github/issues/ARGDeveloperShayan/SafeSector.svg?style=for-the-badge
[issues-url]: https://github.com/ARGDeveloperShayan/SafeSector/issues
[license-shield]: https://img.shields.io/github/license/ARGDeveloperShayan/SafeSector.svg?style=for-the-badge
[license-url]: https://github.com/ARGDeveloperShayan/SafeSector/blob/main/LICENSE.txt

[HTML5-shield]: https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML5-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS3-shield]: https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS3-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[JavaScript-shield]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[Swiper-shield]: https://img.shields.io/badge/Swiper-6332F6?style=for-the-badge&logo=swiper&logoColor=white
[Swiper-url]: https://swiperjs.com/
[Orbitron-shield]: https://img.shields.io/badge/Orbitron-000000?style=for-the-badge&logo=googlefonts&logoColor=white
[Orbitron-url]: https://fonts.google.com/specimen/Orbitron
[Vazirmatn-shield]: https://img.shields.io/badge/Vazirmatn-1E1E1E?style=for-the-badge&logo=googlefonts&logoColor=white
[Vazirmatn-url]: https://github.com/rastikerdar/vazirmatn