// ===== SafeSector - main.js =====
// Shared logic for all pages + bilingual (EN/FA) language switching.
// Requires lang.js (SS_I18N) to be loaded first.

(function () {
    "use strict";

    const ICON_BASE = 'assets/sprites/sprites.svg';
    const LANG_KEY = 'ss-lang';

    // ==========================================
    // LANGUAGE ENGINE
    // ==========================================
    function currentLang() {
        return localStorage.getItem(LANG_KEY) ||
            ((navigator.language || '').toLowerCase().startsWith('fa') ? 'fa' : 'en');
    }

    function t(key) {
        const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
        return (SS_I18N[lang] && SS_I18N[lang][key]) ||
            (SS_I18N.en && SS_I18N.en[key]) || key;
    }

    function formatTemplate(str, replacements) {
        return str.replace(/\{(n|s|q)\}/g, (m, k) =>
            replacements[k] !== undefined ? replacements[k] : m);
    }

    function formatPrice(usd) {
        if (document.documentElement.lang === 'fa') {
            // Prices converted to Toman (rate used across the theme)
            return Math.round(usd * 2000).toLocaleString('fa') + ' تومان';
        }
        return '$' + usd;
    }

    function applyStaticPrices() {
        document.querySelectorAll('.cap-price[data-price]').forEach(el => {
            el.textContent = formatPrice(parseInt(el.getAttribute('data-price'), 10));
        });
    }

    function applyLang(lang) {
        const dict = SS_I18N[lang] || SS_I18N.en;
        const root = document.documentElement;

        root.lang = lang;
        root.dir = lang === 'fa' ? 'rtl' : 'ltr';
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }

        // Text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const val = dict[el.getAttribute('data-i18n')];
            if (val !== undefined) el.textContent = val;
        });
        // Markup content
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const val = dict[el.getAttribute('data-i18n-html')];
            if (val !== undefined) el.innerHTML = val;
        });
        // Placeholders
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const val = dict[el.getAttribute('data-i18n-ph')];
            if (val !== undefined) el.setAttribute('placeholder', val);
        });
        // Aria labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const val = dict[el.getAttribute('data-i18n-aria')];
            if (val !== undefined) el.setAttribute('aria-label', val);
        });
        // Page title
        const pageKey = document.body.getAttribute('data-page');
        if (pageKey && dict['meta.title.' + pageKey]) {
            document.title = dict['meta.title.' + pageKey];
        }

        // Sync switcher UI
        document.querySelectorAll('[data-lang]').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-lang') === lang);
        });
        const langBtnLabel = document.getElementById('langBtnLabel');
        if (langBtnLabel) langBtnLabel.textContent = lang === 'fa' ? 'فا' : 'EN';

        // Language-dependent dynamic content
        applyStaticPrices();
        initPriceCalculator(true);
        buildPortfolioGrid();
        const grid = document.getElementById('blogArchiveGrid');
        if (grid && grid.children.length) renderArchivePage();
        const resultsGrid = document.getElementById('resultsGrid');
        if (resultsGrid && resultsGrid.children.length) performSearch();
    }

    function setLang(lang) {
        if (lang !== 'en' && lang !== 'fa') return;
        if (lang === document.documentElement.lang) return;
        applyLang(lang);
    }

    function initLangSwitcher() {
        document.querySelectorAll('[data-lang]').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                setLang(this.getAttribute('data-lang'));
            });
        });

        // Click-toggle for the desktop dropdown (hover CSS also available)
        const btn = document.getElementById('langBtn');
        if (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const open = btn.classList.toggle('open');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
            document.addEventListener('click', function () {
                btn.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            });
        }
    }

    // ==========================================
    // SCROLL TO TOP BUTTON (All Pages)
    // ==========================================
    function initScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        if (!scrollToTopBtn) return;

        function toggleScrollBtn() {
            scrollToTopBtn.classList.toggle('show', window.scrollY > 50);
        }
        window.addEventListener('scroll', toggleScrollBtn);
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        toggleScrollBtn();
    }

    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS (All Pages)
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href*="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (!href || href.startsWith('http') || href === '#') return;

                if (href.startsWith('#')) {
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        e.preventDefault();
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ==========================================
    // STATS COUNTER (index.html)
    // ==========================================
    let animated = false;

    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        if (!statNumbers.length) return;

        function animateNumbers() {
            if (animated) return;
            const statsSection = document.querySelector('.stats-section');
            if (!statsSection) return;

            const rect = statsSection.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 100;

            if (isVisible) {
                animated = true;
                statNumbers.forEach(el => {
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    let current = 0;
                    const step = Math.ceil(target / 40);
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            el.textContent = target + (target === 99 ? '%' : '+');
                            clearInterval(timer);
                        } else {
                            el.textContent = current + (target === 99 ? '%' : '+');
                        }
                    }, 25);
                });
            }
        }

        window.addEventListener('scroll', animateNumbers);
        window.addEventListener('load', animateNumbers);
    }

    // ==========================================
    // PRICE CALCULATOR (index.html)
    // ==========================================
    function initPriceCalculator(recalculateOnly) {
        const serviceSelect = document.getElementById('serviceType');
        if (!serviceSelect) return;
        const capacitySelect = document.getElementById('capacity');
        const conditionSelect = document.getElementById('condition');
        const turnaroundSelect = document.getElementById('turnaround');
        const diagCheck = document.getElementById('diagnosticConsent');
        const priceSpan = document.getElementById('estimatedValue');

        function calculatePrice() {
            let base = 199;
            const service = serviceSelect.value;
            const cap = parseInt(capacitySelect.value, 10);

            if (service === 'logical') base = 199 + (cap / 500) * 10;
            else if (service === 'physical') base = 399 + (cap / 500) * 15;
            else if (service === 'pcb') base = 149 + (cap / 500) * 8;
            else if (service === 'firmware') base = 249 + (cap / 500) * 12;

            if (conditionSelect.value === 'clicking') base += 150;
            else if (conditionSelect.value === 'pcb_burn') base += 80;

            const turnaround = turnaroundSelect.value;
            if (turnaround === 'express') base += 99;
            else if (turnaround === 'emergency') base += 249;

            if (diagCheck.checked) base += 49;

            priceSpan.textContent = formatPrice(Math.round(base));
        }

        if (!recalculateOnly) {
            [serviceSelect, capacitySelect, conditionSelect, turnaroundSelect, diagCheck].forEach(el => {
                el.addEventListener('change', calculatePrice);
            });
        }
        calculatePrice();
    }

    // ==========================================
    // FAQ ACCORDION (index.html)
    // ==========================================
    function initFaqAccordion() {
        const accordionItems = document.querySelectorAll('.accordion-item');
        if (!accordionItems.length) return;

        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (!header) return;

            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                accordionItems.forEach(i => {
                    i.classList.remove('active');
                    const icon = i.querySelector('.accordion-icon use');
                    if (icon) icon.setAttribute('href', ICON_BASE + '#icon-plus');
                });

                if (!isActive) {
                    item.classList.add('active');
                    const icon = item.querySelector('.accordion-icon use');
                    if (icon) icon.setAttribute('href', ICON_BASE + '#icon-minus');
                }
            });
        });
    }

    // ==========================================
    // SCROLL REVEAL ANIMATIONS (index.html)
    // ==========================================
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.service-card, .pricing-card, .blog-card, .timeline-step, .stat-item');
        if (!revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // BLOG ARCHIVE DATA (archive.html) — bilingual
    // ==========================================
    const archivePosts = [
        {
            id: 1, date: "2026-03-12", img: "assets/imgs/blog/blog-1.jpg", link: "single.html",
            en: { title: "Understanding SMR vs CMR for Recovery", excerpt: "Shingled Magnetic Recording brings capacity but complicates data retrieval.", tags: ["SMR", "CMR", "HDD Technology"] },
            fa: { title: "درک SMR در مقابل CMR برای بازیابی", excerpt: "ضبط مغناطیسی شینگلد ظرفیت را بالا می‌برد اما بازیابی داده را پیچیده می‌کند.", tags: ["SMR", "CMR", "فناوری هارد دیسک"] }
        },
        {
            id: 2, date: "2026-02-28", img: "assets/imgs/blog/blog-2.jpg", link: "single.html",
            en: { title: "Click of Death: Myths & Real Fixes", excerpt: "Not every clicking sound means head failure. Sometimes it's a PCB issue or spindle seizure. We break down the diagnostic steps.", tags: ["Click of Death", "Diagnosis", "Heads"] },
            fa: { title: "کلیک مرگ: افسانه‌ها و راهکارهای واقعی", excerpt: "هر صدای کلیکی به معنای خرابی هد نیست. گاهی مشکل PCB یا گیر کردن اسپیندل است. ما مراحل عیب‌یابی را توضیح می‌دهیم.", tags: ["کلیک مرگ", "تشخیص", "هدها"] }
        },
        {
            id: 3, date: "2026-01-15", img: "assets/imgs/blog/blog-3.jpg", link: "single.html",
            en: { title: "Why a Cleanroom is Non‑Negotiable", excerpt: "A single dust particle can destroy platter surface. We show how our ISO 5 cleanroom prevents microscopic damage during head swaps.", tags: ["Cleanroom", "ISO5", "Physical Repair"] },
            fa: { title: "چرا کلین‌روم غیرقابل مذاکره است", excerpt: "یک ذره گرد و غبار می‌تواند سطح پلیتر را نابود کند. ما نشان می‌دهیم که کلین‌روم ISO 5 ما چگونه از آسیب میکروسکوپی در حین تعویض هد جلوگیری می‌کند.", tags: ["کلین‌روم", "ISO5", "تعمیر فیزیکی"] }
        },
        {
            id: 4, date: "2025-12-22", img: "assets/imgs/blog/blog-4.jpg", link: "single.html",
            en: { title: "Firmware Corruption: When Drives Forget", excerpt: "G-list overflow, translator failure, or damaged SA modules. Using PC3000 to rebuild firmware without losing user data.", tags: ["Firmware", "PC3000", "SMART"] },
            fa: { title: "خرابی فریمور: وقتی درایوها فراموش می‌کنند", excerpt: "سرریز لیست G، خرابی مترجم یا ماژول‌های SA آسیب‌دیده. استفاده از PC3000 برای بازسازی فریمور بدون از دست دادن داده‌های کاربر.", tags: ["فریمور", "PC3000", "SMART"] }
        },
        {
            id: 5, date: "2025-11-08", img: "assets/imgs/blog/blog-1.jpg", link: "single.html",
            en: { title: "PCB Burn Marks: TVS Diode Quick Fix", excerpt: "A burnt PCB doesn't mean lost data. We demonstrate ROM swapping and donor board matching for Seagate, WD, and Toshiba drives.", tags: ["PCB Repair", "Electronics", "DIY warning"] },
            fa: { title: "سوختگی برد PCB: رفع سریع دیود TVS", excerpt: "سوختگی PCB به معنای از دست رفتن داده‌ها نیست. ما تعویض ROM و تطبیق برد اهداکننده را برای درایوهای Seagate، WD و Toshiba نشان می‌دهیم.", tags: ["تعمیر PCB", "الکترونیک", "هشدار خودکار"] }
        },
        {
            id: 6, date: "2025-10-19", img: "assets/imgs/blog/blog-2.jpg", link: "single.html",
            en: { title: "SSD Data Recovery: TRIM & Garbage Collection", excerpt: "SSDs pose different challenges than HDDs. Learn how we handle deleted files, encrypted controllers, and chip-off recovery.", tags: ["SSD", "TRIM", "NAND"] },
            fa: { title: "بازیابی اطلاعات SSD: تریم و جمع‌آوری زباله", excerpt: "SSDها چالش‌های متفاوتی با HDDها دارند. ببینید چگونه فایل‌های حذف‌شده، کنترلرهای رمزنگاری‌شده و بازیابی چیپ آف را مدیریت می‌کنیم.", tags: ["SSD", "TRIM", "NAND"] }
        },
        {
            id: 7, date: "2025-09-14", img: "assets/imgs/blog/blog-3.jpg", link: "single.html",
            en: { title: "Water Damage & Hard Drives: First Steps", excerpt: "Spilled coffee? Drive submerged? Do not power on. Our guide for immediate actions before professional recovery.", tags: ["Water Damage", "Emergency", "Precautions"] },
            fa: { title: "آسیب آب و هارد دیسک: اولین اقدامات", excerpt: "قهوه ریخت؟ درایو زیر آب رفت؟ روشنش نکنید. راهنمای اقدامات فوری ما قبل از بازیابی حرفه‌ای.", tags: ["آسیب آب", "اضطراری", "احتیاط‌ها"] }
        },
        {
            id: 8, date: "2025-08-03", img: "assets/imgs/blog/blog-4.jpg", link: "single.html",
            en: { title: "Helium‑Filled Drives: Why They're Different", excerpt: "Modern high‑capacity drives use helium. Opening them outside cleanroom instantly kills the drive. Our approach explained.", tags: ["Helium", "High Capacity", "Physical Repair"] },
            fa: { title: "درایوهای پر از هلیوم: چرا متفاوت هستند", excerpt: "درایوهای مدرن با ظرفیت بالا از هلیوم استفاده می‌کنند. باز کردن آن‌ها خارج از کلین‌روم فوراً درایو را از کار می‌اندازد. رویکرد ما توضیح داده شده است.", tags: ["هلیوم", "ظرفیت بالا", "تعمیر فیزیکی"] }
        },
        {
            id: 9, date: "2025-07-11", img: "assets/imgs/blog/blog-1.jpg", link: "single.html",
            en: { title: "RAID 0 vs RAID 5: Recovery Nightmares", excerpt: "Multiple drives, one failure. We reconstruct RAID arrays even with missing parameters and degraded members.", tags: ["RAID", "NAS", "Enterprise"] },
            fa: { title: "RAID 0 در مقابل RAID 5: کابوس‌های بازیابی", excerpt: "چند درایو، یک خرابی. ما آرایه‌های RAID را حتی با پارامترهای گمشده و اعضای تخریب‌شده بازسازی می‌کنیم.", tags: ["RAID", "NAS", "سازمانی"] }
        }
    ];

    let currentPage = 1;
    const postsPerPage = 6;

    function formatDate(iso) {
        const d = new Date(iso);
        return document.documentElement.lang === 'fa'
            ? d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
            : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function renderArchivePage() {
        const gridContainer = document.getElementById('blogArchiveGrid');
        const paginationContainer = document.getElementById('paginationContainer');
        if (!gridContainer) return;

        const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
        const start = (currentPage - 1) * postsPerPage;
        const pagePosts = archivePosts.slice(start, start + postsPerPage);

        gridContainer.innerHTML = pagePosts.map(post => {
            const l = post[lang];
            return `
                <article class="blog-archive-card">
                    <div class="archive-img">
                        <img src="${post.img}" loading="lazy" alt="${l.title}">
                    </div>
                    <div class="archive-card-content">
                        <div class="archive-date">
                            <svg class="icon" aria-hidden="true"><use href="${ICON_BASE}#icon-calendar"></use></svg>${formatDate(post.date)}
                        </div>
                        <h3>${l.title}</h3>
                        <p class="archive-excerpt">${l.excerpt}</p>
                        <div>
                            ${l.tags.map(tag => `<span class="archive-tag">${tag}</span>`).join('')}
                        </div>
                        <a href="${post.link}" class="read-link">${t('archive.read')}</a>
                    </div>
                </article>
            `;
        }).join('');

        if (paginationContainer) {
            const totalPages = Math.ceil(archivePosts.length / postsPerPage);
            const goTo = (page) => {
                currentPage = page;
                renderArchivePage();
                const hero = document.querySelector('.archive-hero');
                if (hero) window.scrollTo({ top: hero.offsetTop - 100, behavior: 'smooth' });
            };

            paginationContainer.innerHTML = '';
            const prevBtn = document.createElement('a');
            prevBtn.href = '#';
            prevBtn.className = 'page-btn prev' + (currentPage === 1 ? ' disabled' : '');
            prevBtn.textContent = t('archive.prev');
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage > 1) goTo(currentPage - 1);
            });
            paginationContainer.appendChild(prevBtn);

            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement('a');
                pageBtn.href = '#';
                pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (i !== currentPage) goTo(i);
                });
                paginationContainer.appendChild(pageBtn);
            }

            const nextBtn = document.createElement('a');
            nextBtn.href = '#';
            nextBtn.className = 'page-btn next' + (currentPage === totalPages ? ' disabled' : '');
            nextBtn.textContent = t('archive.next');
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPage < totalPages) goTo(currentPage + 1);
            });
            paginationContainer.appendChild(nextBtn);
        }
    }

    function initBlogArchive() {
        currentPage = 1;
        renderArchivePage();
    }

    // ==========================================
    // SEARCH FUNCTIONALITY (search.html) — bilingual
    // ==========================================
    const searchData = [
        {
            link: "index.html#services", type: "service",
            en: { title: "Click of Death Recovery", excerpt: "Stuck heads, bad sectors, or damaged platters — we perform cleanroom head swaps and firmware calibration.", keywords: "click of death head swap stuck heads bad sectors platters cleanroom کلیک مرگ تعویض هد" },
            fa: { title: "بازیابی کلیک مرگ", excerpt: "هدهای گیر کرده، سکتورهای خراب یا پلیترهای آسیب‌دیده — ما تعویض هد در اتاق تمیز و کالیبراسیون فریمور را انجام می‌دهیم.", keywords: "کلیک مرگ هد سکتور پلیتر اتاق تمیز" }
        },
        {
            link: "index.html#services", type: "service",
            en: { title: "PCB Board Swap & Repair", excerpt: "Burnt PCB, shorted TVS diodes, ROM adaptation. We repair or replace logic boards with donor matching.", keywords: "PCB board swap repair burnt TVS diode ROM donor برد تعمیر" },
            fa: { title: "تعویض و تعمیر برد PCB", excerpt: "سوختگی PCB، دیودهای TVS اتصال کوتاه شده، تطبیق ROM. ما بردهای منطقی را با استفاده از اهداکننده تعمیر یا تعویض می‌کنیم.", keywords: "برد PCB سوختگی دیود رام اهداکننده" }
        },
        {
            link: "index.html#services", type: "service",
            en: { title: "Firmware Corruption Fix", excerpt: "G-list, translator, SMART corruption. Using PC3000 & deep SPI access to rebuild firmware modules.", keywords: "firmware corruption G-list translator SMART PC3000 SPI فریمور" },
            fa: { title: "رفع خرابی فریمور", excerpt: "خرابی لیست G، مترجم، SMART. با استفاده از PC3000 و دسترسی عمیق SPI ماژول‌های فریمور را بازسازی می‌کنیم.", keywords: "فریمور خرابی مترجم اسمارت" }
        },
        {
            link: "index.html#services", type: "service",
            en: { title: "Data Migration & Cloning", excerpt: "Full sector-by-sector cloning onto healthy media, even with unstable heads or degraded surface.", keywords: "data migration cloning sector-by-sector unstable heads degraded کلون انتقال" },
            fa: { title: "انتقال و کلون‌سازی داده", excerpt: "کلون‌سازی کامل سکتور به سکتور روی مدیای سالم، حتی با هدهای ناپایدار یا سطح تخریب‌شده.", keywords: "کلون انتقال داده سکتور" }
        },
        {
            link: "index.html#pricing", type: "section",
            en: { title: "Transparent Pricing", excerpt: "Logical recovery, physical repair, PCB swap and firmware fix pricing based on drive capacity from 500GB to 10TB.", keywords: "pricing cost logical recovery physical repair PCB swap firmware fix 500GB 1TB 10TB قیمت هزینه" },
            fa: { title: "قیمت‌های شفاف", excerpt: "قیمت‌گذاری بازیابی منطقی، تعمیر فیزیکی، تعویض PCB و رفع فریمور بر اساس ظرفیت درایو از ۵۰۰ گیگابایت تا ۱۰ ترابایت.", keywords: "قیمت هزینه بازیابی تعمیر ترابایت گیگابایت" }
        },
        {
            link: "index.html#calculator", type: "tool",
            en: { title: "Instant Price Estimate Calculator", excerpt: "Select service type, drive capacity, physical condition and turnaround to get an estimated total for your recovery.", keywords: "calculator estimate price quote cost diagnostic fee ماشین حساب برآورد" },
            fa: { title: "ماشین‌حساب برآورد فوری قیمت", excerpt: "نوع سرویس، ظرفیت درایو، وضعیت فیزیکی و زمان تحویل را انتخاب کنید تا هزینه تخمینی بازیابی خود را دریافت کنید.", keywords: "ماشین حساب برآورد قیمت هزینه تخمینی" }
        },
        {
            link: "index.html#faq", type: "faq",
            en: { title: "Free Diagnosis & Confidentiality", excerpt: "Yes, we evaluate the drive and provide a firm quote before any work begins. NDAs available upon request.", keywords: "free diagnosis quote confidential NDA evaluation عیب یابی رایگان محرمانه" },
            fa: { title: "عیب‌یابی رایگان و محرمانگی", excerpt: "بله، ما درایو را ارزیابی می‌کنیم و قبل از شروع هر کاری یک قیمت قطعی ارائه می‌دهیم. در صورت درخواست قرارداد عدم افشا امضا می‌شود.", keywords: "عیب یابی رایگان محرمانه عدم افشا" }
        },
        {
            link: "index.html#faq", type: "faq",
            en: { title: "Recovery Time & No Data No Charge", excerpt: "Logical recovery within 24-48 hours. Physical repair 3-5 business days. No Data, No Charge policy applies.", keywords: "recovery time how long no data no charge guarantee 24 hours 48 hours زمان بازیابی تضمین" },
            fa: { title: "زمان بازیابی و سیاست بدون داده بدون هزینه", excerpt: "بازیابی منطقی در ۲۴-۴۸ ساعت. تعمیر فیزیکی ۳-۵ روز کاری. سیاست «بدون داده، بدون هزینه» اعمال می‌شود.", keywords: "زمان بازیابی چقدر طول تضمین بدون هزینه" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Understanding SMR vs CMR for Recovery", excerpt: "Shingled Magnetic Recording brings capacity but complicates data retrieval. Translator rebuild and media cache preservation are key.", keywords: "SMR CMR shingled magnetic recording conventional translator cache recovery" },
            fa: { title: "درک SMR در مقابل CMR برای بازیابی", excerpt: "ضبط مغناطیسی شینگلد ظرفیت را بالا می‌برد اما بازیابی داده را پیچیده می‌کند. بازسازی مترجم و حفظ کش مدیا کلیدی است.", keywords: "اس ام ار شینگلد مترجم کش بازیابی" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Click of Death: Myths & Real Fixes", excerpt: "Not every clicking sound means head failure. Sometimes it's a PCB issue or spindle seizure. We break down the diagnostic steps.", keywords: "click of death myths fixes clicking head failure PCB spindle diagnostic کلیک مرگ" },
            fa: { title: "کلیک مرگ: افسانه‌ها و راهکارهای واقعی", excerpt: "هر صدای کلیکی به معنای خرابی هد نیست. گاهی مشکل PCB یا گیر کردن اسپیندل است. ما مراحل عیب‌یابی را توضیح می‌دهیم.", keywords: "کلیک مرگ اسپیندل عیب یابی" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Why a Cleanroom is Non‑Negotiable", excerpt: "A single dust particle can destroy platter surface. We show how our ISO 5 cleanroom prevents microscopic damage during head swaps.", keywords: "cleanroom ISO 5 dust platter head swap physical repair contamination اتاق تمیز" },
            fa: { title: "چرا کلین‌روم غیرقابل مذاکره است", excerpt: "یک ذره گرد و غبار می‌تواند سطح پلیتر را نابود کند. ما نشان می‌دهیم که کلین‌روم ISO 5 ما چگونه از آسیب میکروسکوپی در حین تعویض هد جلوگیری می‌کند.", keywords: "کلین روم اتاق تمیز گرد و غبار پلیتر" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Firmware Corruption: When Drives Forget", excerpt: "G-list overflow, translator failure, or damaged SA modules. Using PC3000 to rebuild firmware without losing user data.", keywords: "firmware corruption G-list overflow translator failure SA modules PC3000 SMART فریمور" },
            fa: { title: "خرابی فریمور: وقتی درایوها فراموش می‌کنند", excerpt: "سرریز لیست G، خرابی مترجم یا ماژول‌های SA آسیب‌دیده. استفاده از PC3000 برای بازسازی فریمور بدون از دست دادن داده‌های کاربر.", keywords: "فریمور خرابی بازسازی" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "PCB Burn Marks: TVS Diode Quick Fix", excerpt: "A burnt PCB doesn't mean lost data. We demonstrate ROM swapping and donor board matching for Seagate, WD, and Toshiba drives.", keywords: "PCB burn TVS diode ROM swap donor board Seagate WD Toshiba electronics سوختگی برد" },
            fa: { title: "سوختگی برد PCB: رفع سریع دیود TVS", excerpt: "سوختگی PCB به معنای از دست رفتن داده‌ها نیست. ما تعویض ROM و تطبیق برد اهداکننده را برای درایوهای Seagate، WD و Toshiba نشان می‌دهیم.", keywords: "سوختگی برد دیود" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "SSD Data Recovery: TRIM & Garbage Collection", excerpt: "SSDs pose different challenges than HDDs. Learn how we handle deleted files, encrypted controllers, and chip-off recovery.", keywords: "SSD TRIM garbage collection NAND chip-off encrypted deleted files" },
            fa: { title: "بازیابی اطلاعات SSD: تریم و جمع‌آوری زباله", excerpt: "SSDها چالش‌های متفاوتی با HDDها دارند. ببینید چگونه فایل‌های حذف‌شده، کنترلرهای رمزنگاری‌شده و بازیابی چیپ آف را مدیریت می‌کنیم.", keywords: "اس اس دی تریم چیپ اف" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Water Damage & Hard Drives: First Steps", excerpt: "Spilled coffee? Drive submerged? Do not power on. Our guide for immediate actions before professional recovery.", keywords: "water damage spill submerged emergency precautions liquid آسیب آب" },
            fa: { title: "آسیب آب و هارد دیسک: اولین اقدامات", excerpt: "قهوه ریخت؟ درایو زیر آب رفت؟ روشنش نکنید. راهنمای اقدامات فوری ما قبل از بازیابی حرفه‌ای.", keywords: "آسیب آب قهوه اضطراری" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "Helium‑Filled Drives: Why They're Different", excerpt: "Modern high‑capacity drives use helium. Opening them outside cleanroom instantly kills the drive. Our approach explained.", keywords: "helium high capacity physical repair cleanroom sealed drive هلیوم" },
            fa: { title: "درایوهای پر از هلیوم: چرا متفاوت هستند", excerpt: "درایوهای مدرن با ظرفیت بالا از هلیوم استفاده می‌کنند. باز کردن آن‌ها خارج از کلین‌روم فوراً درایو را از کار می‌اندازد. رویکرد ما توضیح داده شده است.", keywords: "هلیوم ظرفیت بالا" }
        },
        {
            link: "single.html", type: "article",
            en: { title: "RAID 0 vs RAID 5: Recovery Nightmares", excerpt: "Multiple drives, one failure. We reconstruct RAID arrays even with missing parameters and degraded members.", keywords: "RAID 0 5 NAS enterprise array degraded multiple drives رید" },
            fa: { title: "RAID 0 در مقابل RAID 5: کابوس‌های بازیابی", excerpt: "چند درایو، یک خرابی. ما آرایه‌های RAID را حتی با پارامترهای گمشده و اعضای تخریب‌شده بازسازی می‌کنیم.", keywords: "رید آرایه سرور" }
        },
        {
            link: "index.html#contact", type: "page",
            en: { title: "Contact SafeSector Lab", excerpt: "24/7 emergency service. Reach our cleanroom at 221B Baker Street, Data District. Call +1 (800) 555-1234.", keywords: "contact phone email address emergency 24/7 lab location تماس تلفن ایمیل" },
            fa: { title: "تماس با آزمایشگاه سیف سکتور", excerpt: "خدمات اضطراری ۲۴ ساعته. کلین‌روم ما در خیابان بیکر ۲۲۱B، منطقه دیتا. تماس: +1 (800) 555-1234.", keywords: "تماس تلفن ایمیل آدرس اضطراری" }
        },
        {
            link: "index.html#process", type: "section",
            en: { title: "Our Recovery Process", excerpt: "Receive, Diagnosis, Repair, Verification, Return — our 5-step timeline ensures your data is handled with precision.", keywords: "process timeline steps receive diagnosis repair verification return فرآیند" },
            fa: { title: "فرآیند بازیابی ما", excerpt: "دریافت، عیب‌یابی، تعمیر، تأیید، بازگشت — خط زمانی ۵ مرحله‌ای ما تضمین می‌کند داده‌های شما با دقت مدیریت شوند.", keywords: "فرآیند مراحل دریافت عیب یابی تعمیر" }
        }
    ];

    function performSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        if (!searchInput || !searchButton) return;

        const resultsGrid = document.getElementById('resultsGrid');
        const resultsHeader = document.getElementById('resultsHeader');
        const resultsCount = document.getElementById('resultsCount');
        const isFa = document.documentElement.lang === 'fa';

        function highlightText(text, query) {
            if (!query) return text;
            const words = query.split(/\s+/).filter(w => w.length > 0);
            let highlighted = text;
            words.forEach(word => {
                const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                highlighted = highlighted.replace(regex, '<mark>$1</mark>');
            });
            return highlighted;
        }

        function displayResults(results, query) {
            if (!resultsGrid) return;
            resultsGrid.innerHTML = '';

            if (results.length === 0) {
                if (resultsHeader) {
                    resultsHeader.style.display = 'block';
                    resultsCount.textContent = formatTemplate(t('searchui.none'), { q: query });
                }
                resultsGrid.innerHTML = `
                    <div class="no-results">
                        <svg class="icon" aria-hidden="true"><use href="${ICON_BASE}#icon-search"></use></svg>
                        <p>${t('searchui.noneTitle')}</p>
                        <p class="no-results-tip">${t('searchui.noneTip')}</p>
                    </div>
                `;
                return;
            }

            if (resultsHeader) {
                resultsHeader.style.display = 'block';
                resultsCount.textContent = formatTemplate(t('searchui.found'),
                    { n: results.length.toLocaleString(isFa ? 'fa' : 'en'), s: results.length > 1 ? 's' : '', q: query });
            }

            results.forEach(item => {
                const l = item[isFa ? 'fa' : 'en'];
                const card = document.createElement('div');
                card.className = 'result-card';
                card.innerHTML = `
                    <div class="result-card-content">
                        <span class="result-type">${t('type.' + item.type)}</span>
                        <h3>${highlightText(l.title, query)}</h3>
                        <p class="result-excerpt">${highlightText(l.excerpt, query)}</p>
                        <a href="${item.link}" class="result-link">${item.type === 'article' ? t('searchui.viewArticle') : t('searchui.viewDetails')}</a>
                    </div>
                `;
                resultsGrid.appendChild(card);
            });
        }

        function run() {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                if (resultsGrid) resultsGrid.innerHTML = '';
                if (resultsHeader) resultsHeader.style.display = 'none';
                return;
            }

            const queryWords = query.split(/\s+/);
            const filteredResults = searchData.filter(item => {
                const l = item[isFa ? 'fa' : 'en'];
                // Search in both languages so users find results either way
                const searchableText = (l.title + ' ' + l.excerpt + ' ' + l.keywords + ' ' +
                    item.en.title + ' ' + item.en.keywords).toLowerCase();
                return queryWords.every(word => searchableText.includes(word));
            });
            displayResults(filteredResults, query);
        }

        if (!searchButton.dataset.bound) {
            searchButton.dataset.bound = '1';
            searchButton.addEventListener('click', run);
            searchInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    run();
                }
            });
            const urlParams = new URLSearchParams(window.location.search);
            const urlQuery = urlParams.get('q');
            if (urlQuery) {
                searchInput.value = urlQuery;
                run();
            }
        } else {
            run();
        }
    }

    function initSearch() {
        performSearch();
    }

    // ==========================================
    // 404 PAGE SEARCH (404.html)
    // ==========================================
    function init404Search() {
        const searchBtn = document.querySelector('.error-search-btn');
        const searchInput = document.querySelector('.error-search-input');

        if (!searchBtn || !searchInput) return;

        searchBtn.addEventListener('click', function () {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = 'search.html?q=' + encodeURIComponent(query);
            }
        });

        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBtn.click();
            }
        });
    }

    // ==========================================
    // COMMENT FORM HANDLER (single.html & page.html)
    // ==========================================
    function initCommentForms() {
        const commentForms = document.querySelectorAll('.comment-form, #commentForm');

        commentForms.forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault();

                const submitBtn = form.querySelector('button[type="submit"]');
                if (!submitBtn) return;
                const iconSvg = submitBtn.querySelector('svg');
                const labelSpan = submitBtn.querySelector('span');
                const originalLabel = labelSpan ? labelSpan.textContent : '';

                submitBtn.disabled = true;
                if (iconSvg) iconSvg.querySelector('use').setAttribute('href', ICON_BASE + '#icon-spinner');
                if (labelSpan) labelSpan.textContent = t('commentui.posting');
                submitBtn.classList.add('spinning');

                setTimeout(() => {
                    if (iconSvg) iconSvg.querySelector('use').setAttribute('href', ICON_BASE + '#icon-check');
                    if (labelSpan) labelSpan.textContent = t('commentui.posted');
                    submitBtn.classList.remove('spinning');

                    setTimeout(() => {
                        if (iconSvg) iconSvg.querySelector('use').setAttribute('href', ICON_BASE + '#icon-paper-plane');
                        if (labelSpan) labelSpan.textContent = originalLabel;
                        submitBtn.disabled = false;
                        form.reset();
                    }, 2000);
                }, 1000);
            });
        });
    }

    // ==========================================
    // REPLY BUTTON HANDLERS (single.html & page.html)
    // ==========================================
    function initReplyButtons() {
        document.querySelectorAll('.comment-reply-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const commentAuthor = this.closest('.comment-item').querySelector('.comment-author').textContent;
                const textarea = document.querySelector('.comment-textarea');
                if (textarea) {
                    textarea.value = `@${commentAuthor} `;
                    textarea.focus();
                    textarea.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ==========================================
    // IMAGE MOVEMENT ON HOVER (index.html, archive.html, single.html)
    // ==========================================
    function initImageMovement() {
        document.querySelectorAll('.portfolio-img, .blog-img-placeholder img, .archive-img img, .article-img img').forEach(img => {
            const container = img.parentElement;
            const maxOffset = 10;
            let animFrameId = null;

            img.style.transform = 'scale(1.1)';
            img.style.transition = 'transform 0.1s ease-out';

            const onMove = e => {
                cancelAnimationFrame(animFrameId);

                const rect = container.getBoundingClientRect();
                const xPercent = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
                const yPercent = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

                const moveX = xPercent * maxOffset;
                const moveY = yPercent * maxOffset;

                animFrameId = requestAnimationFrame(() => {
                    img.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
                });
            };

            const onLeave = () => {
                cancelAnimationFrame(animFrameId);
                img.style.transform = 'scale(1.1) translate(0px, 0px)';
            };

            container.addEventListener('mousemove', onMove);
            container.addEventListener('mouseleave', onLeave);
        });
    }

    // ==========================================
    // SCROLL PROGRESS BAR (All Pages)
    // ==========================================
    function initScrollProgressBar() {
        const progressBar = document.getElementById('scrollProgressBar');
        if (!progressBar) return;

        function updateProgressBar() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        }

        window.addEventListener('scroll', updateProgressBar, { passive: true });
        window.addEventListener('resize', updateProgressBar);
        window.addEventListener('load', updateProgressBar);
        updateProgressBar();
    }

    // ==========================================
    // TOGGLE MENU BTN FUNCTION (All Pages)
    // ==========================================
    function initToggleMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileOverlay = document.getElementById('mobileOverlay');
        if (!menuToggle || !mobileOverlay) return;

        function disableScroll() {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflowY = 'scroll';
        }

        function enableScroll() {
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.overflowY = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }

        function closeMobileMenu() {
            menuToggle.classList.remove('open');
            mobileOverlay.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            enableScroll();
        }

        function openMobileMenu() {
            menuToggle.classList.add('open');
            mobileOverlay.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
            disableScroll();
        }

        menuToggle.addEventListener('click', function () {
            if (mobileOverlay.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        mobileOverlay.addEventListener('click', function (e) {
            if (e.target === mobileOverlay) closeMobileMenu();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileOverlay.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // ===== SWIPER INITIALIZATION (Blog & Testimonials) =====
    function initSwipers() {
        if (typeof Swiper === 'undefined') return;

        if (document.querySelector('.blog-swiper')) {
            new Swiper('.blog-swiper', {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 24,
                pagination: { el: '.swiper-pagination', clickable: true },
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                breakpoints: {
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
        }
        if (document.querySelector('.testimonials-swiper')) {
            new Swiper('.testimonials-swiper', {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                pagination: { el: '.testimonials-swiper .swiper-pagination', clickable: true },
                navigation: { nextEl: '.testimonials-swiper .swiper-button-next', prevEl: '.testimonials-swiper .swiper-button-prev' },
                breakpoints: {
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 }
                }
            });
        }
    }

    // ===== PORTFOLIO GALLERY + LIGHTBOX =====
    const portfolioImages = [
        { src: "assets/imgs/portfolio/job-1.jpg", key: "portfolio.job1" },
        { src: "assets/imgs/portfolio/job-2.jpg", key: "portfolio.job2" },
        { src: "assets/imgs/portfolio/job-3.jpg", key: "portfolio.job3" },
        { src: "assets/imgs/portfolio/job-4.jpg", key: "portfolio.job4" },
        { src: "assets/imgs/portfolio/job-5.jpg", key: "portfolio.job5" },
        { src: "assets/imgs/portfolio/job-6.jpg", key: "portfolio.job6" }
    ];

    function buildPortfolioGrid() {
        const grid = document.getElementById('portfolioGrid');
        if (!grid) return;
        grid.innerHTML = '';
        portfolioImages.forEach((item, index) => {
            const caption = t(item.key);
            const div = document.createElement('div');
            div.className = 'portfolio-item';
            div.setAttribute('data-index', index);
            div.innerHTML = `
                <img class="portfolio-img" src="${item.src}" loading="lazy" alt="${caption}">
                <div class="portfolio-caption">${caption}</div>
            `;
            div.addEventListener('click', () => openLightbox(index));
            grid.appendChild(div);
        });
    }

    let currentImageIndex = 0;
    const modal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');

    function openLightbox(index) {
        currentImageIndex = index;
        updateLightboxImage();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function updateLightboxImage() {
        lightboxImg.src = portfolioImages[currentImageIndex].src;
        lightboxImg.alt = t(portfolioImages[currentImageIndex].key);
    }
    function closeLightbox() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
        updateLightboxImage();
    }
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
        updateLightboxImage();
    }

    function initLightboxEvents() {
        if (!modal) return;
        const closeBtn = document.querySelector('.close-lightbox');
        const prevBtn = document.querySelector('.prev-lightbox');
        const nextBtn = document.querySelector('.next-lightbox');
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', prevImage);
        nextBtn.addEventListener('click', nextImage);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'flex') {
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'Escape') closeLightbox();
            }
        });
    }

    // ===== DUMMY CONTACT FORM (index.html) =====
    function initContactForm() {
        const form = document.getElementById('dummyContact');
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const labelSpan = btn.querySelector('span');
            const original = labelSpan ? labelSpan.textContent : '';
            btn.disabled = true;
            if (labelSpan) labelSpan.textContent = t('commentui.posting');
            setTimeout(() => {
                if (labelSpan) labelSpan.textContent = t('commentui.posted');
                form.reset();
                setTimeout(() => {
                    if (labelSpan) labelSpan.textContent = original;
                    btn.disabled = false;
                }, 2000);
            }, 900);
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        // Restore saved language (or browser default) before showing content
        applyLang(currentLang());

        initStatsCounter();
        initPriceCalculator();
        initFaqAccordion();
        initSwipers();
        buildPortfolioGrid();
        initLightboxEvents();
        initScrollReveal();
        initBlogArchive();
        initSearch();
        init404Search();
        initContactForm();

        initScrollToTop();
        initSmoothScroll();
        initCommentForms();
        initReplyButtons();
        initImageMovement();
        initScrollProgressBar();
        initToggleMenu();
        initLangSwitcher();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
