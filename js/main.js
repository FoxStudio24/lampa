document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading-overlay');

    // Установка активного пункта меню на основе текущей страницы
    function setActiveNavItem() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Для навигации в header
        const navLinks = document.querySelectorAll('.nav-tabs a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Для мобильной навигации
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    setActiveNavItem();

    // Функция для сохранения источника открытия (текущей страницы) перед переходом в watch
    function saveWatchSource() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        sessionStorage.setItem('watchSource', currentPage);
    }

    // Восстановление скролла при загрузке страницы
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.classList.remove('no-scroll');
    
    // Если есть сохраненная позиция скролла, восстановим её
    const savedScrollY = parseInt(document.body.dataset.scrollY || '0', 10);
    if (savedScrollY > 0) {
        setTimeout(() => window.scrollTo(0, savedScrollY), 100);
    }

    // Начало анимации загрузки
    function showLoading() {
        document.body.classList.add('loading');
    }

    // Блокировка прокрутки — сохраняем позицию и фиксируем тело
    function lockScroll() {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        document.body.dataset.scrollY = String(scrollY);
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.width = '100%';
        document.body.classList.add('no-scroll');
    }

    // Снятие блокировки прокрутки — восстанавливаем позицию
    function unlockScroll() {
        const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
        document.body.classList.remove('no-scroll');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        try { delete document.body.dataset.scrollY; } catch (e) { document.body.removeAttribute('data-scroll-y'); }
    }

    // Делегированный обработчик кликов для Top10 карточек (открывает общий модал)
    document.addEventListener('click', (e) => {
        const topCard = e.target.closest && e.target.closest('.top10-card');
        if (!topCard) return;
        e.preventDefault();
        const id = topCard.dataset.id;
        const type = topCard.dataset.type || 'movie';
        if (id) {
            // НЕ блокируем скролл перед переходом на watch страницу
            openModal(id, type);
            if (searchModal) searchModal.style.display = 'none';
        }
    });

    // Скрытие оверлея загрузки
    function hideLoading() {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            document.body.classList.remove('loading');
        }, 300);
    }

    // Запуск анимации при загрузке страницы
    showLoading();
    window.addEventListener('load', hideLoading);

    // Логика для кнопки поиска
    const searchTrigger = document.getElementById('search-trigger');
    const searchModal = document.getElementById('search-modal');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchClose = document.getElementById('search-close');

    if (searchTrigger) {
        searchTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.style.display = 'block';
            lockScroll();
            try {
                const modalContent = document.querySelector('.mobile-search-content');
                if (modalContent) {
                    modalContent.classList.add('modal-opening');
                    // remove the class after animations complete
                    setTimeout(() => {
                        modalContent.classList.remove('modal-opening');
                    }, 700);
                }
            } catch (e) {}
            setTimeout(() => {
                searchInput.focus();
                // if empty input — show empty state (desktop behavior)
                updateSearchEmptyState();
            }, 300);
        });
    }

    // Привязать кнопки мобильной навигации к единому модальному окну поиска
    const mobileSearchTriggers = document.querySelectorAll('.mobile-search-trigger');
    if (mobileSearchTriggers && mobileSearchTriggers.length > 0) {
        mobileSearchTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (searchModal) searchModal.style.display = 'block';
                lockScroll();
                try {
                    const modalContent = document.querySelector('.mobile-search-content');
                    if (modalContent) {
                        modalContent.classList.add('modal-opening');
                        setTimeout(() => {
                            modalContent.classList.remove('modal-opening');
                        }, 700);
                    }
                } catch (e) {}
                // Скрываем мобильную навигацию пока открыт поиск
                try {
                    const mobileNav = document.querySelector('.mobile-nav');
                    if (mobileNav) mobileNav.style.display = 'none';
                } catch (err) {}
                setTimeout(() => {
                    if (searchInput) searchInput.focus();
                    updateSearchEmptyState();
                }, 300);
            });
        });
    }

    // Empty state toggle helpers
    function updateSearchEmptyState() {
        try {
            const empty = document.getElementById('search-empty');
            const results = document.querySelectorAll('.mobile-search-results, .mobile-search-results .search-category');
            const q = searchInput ? searchInput.value.trim() : '';
            // Only use empty-state layout on desktop widths
            if (window.innerWidth >= 769) {
                if (empty) empty.style.display = (q === '') ? 'flex' : 'none';
                // hide results container when empty
                const resultsContainer = document.querySelector('.mobile-search-results');
                if (resultsContainer) resultsContainer.style.display = (q === '') ? 'none' : 'block';
                // render recent searches when empty
                if (q === '') renderRecentSearches();
            } else {
                // mobile: keep default behavior
                if (empty) empty.style.display = 'none';
                const resultsContainer = document.querySelector('.mobile-search-results');
                if (resultsContainer) resultsContainer.style.display = 'block';
                // on mobile also render recent if empty
                if (q === '') renderRecentSearches();
            }
        } catch (e) {}
    }

    // Toggle empty state on input
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            updateSearchEmptyState();
        });
    }

    // Recent searches storage and rendering
    const RECENT_KEY = 'nn_recent_searches';

    function loadRecentSearches() {
        try {
            const raw = localStorage.getItem(RECENT_KEY);
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr;
        } catch (e) {}
        return [];
    }

    function saveRecentSearch(query) {
        if (!query) return;
        try {
            let arr = loadRecentSearches();
            // remove duplicates
            arr = arr.filter(item => item.toLowerCase() !== query.toLowerCase());
            arr.unshift(query);
            if (arr.length > 5) arr = arr.slice(0,5);
            localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
        } catch (e) {}
    }

    function renderRecentSearches() {
        try {
            const container = document.getElementById('search-recent');
            if (!container) return;
            const list = loadRecentSearches();
            container.innerHTML = '';
            if (!list || list.length === 0) {
                container.setAttribute('aria-hidden','true');
                return;
            }
            container.setAttribute('aria-hidden','false');
            list.forEach(q => {
                const btn = document.createElement('div');
                btn.className = 'pill';
                btn.textContent = q;
                btn.addEventListener('click', (e) => {
                    if (searchInput) searchInput.value = q;
                    // perform search immediately
                    performSearch(q);
                });
                container.appendChild(btn);
            });
        } catch (e) {}
    }

    function closeSearch() {
        if (searchModal) searchModal.style.display = 'none';
        unlockScroll();
        // remove results-open class so form returns to center
        try {
            const modalContent = document.querySelector('.mobile-search-content');
            if (modalContent) modalContent.classList.remove('results-open');
            const empty = document.getElementById('search-empty');
            const resultsContainer = document.querySelector('.mobile-search-results');
            if (window.innerWidth >= 769) {
                if (empty) empty.style.display = 'flex';
                if (resultsContainer) resultsContainer.style.display = 'none';
            }
        } catch (e) {}
        // Вернуть мобильную навигацию, если она была скрыта
        try {
            const mobileNav = document.querySelector('.mobile-nav');
            if (mobileNav && window.innerWidth <= 768) {
                mobileNav.style.display = 'flex';
            }
        } catch (e) {}

        searchInput.value = '';
        document.getElementById('search-movies').innerHTML = '';
        document.getElementById('search-series').innerHTML = '';
        document.getElementById('search-actors').innerHTML = '';
    }

    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearch();
            }
        });
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            } else {
                // If empty and on desktop, show empty state instead of error styling
                if (window.innerWidth >= 769) {
                    updateSearchEmptyState();
                } else {
                    searchInput.placeholder = 'Введите запрос для поиска';
                    searchInput.style.borderColor = '#ff4d4d';
                    setTimeout(() => {
                        searchInput.placeholder = 'Поиск фильмов, сериалов и актеров...';
                        searchInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }, 2000);
                }
            }
        });
    }

    // Закрытие поиска при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal && searchModal.style.display === 'block') {
            closeSearch();
        }
    });

    const API_KEY = '06936145fe8e20be28b02e26b55d3ce6';
    const BASE_URL = 'https://api.themoviedb.org/3';
    const IMG_URL = 'https://image.tmdb.org/t/p/original';
    const NO_PICTURE_URL = 'ico/No picture.svg';

    const hero = document.getElementById('hero');
    const heroLogo = document.getElementById('hero-logo');
    const heroLogoText = document.getElementById('hero-logo-text');
    const heroDescription = document.getElementById('hero-description');
    const heroWatchBtn = document.getElementById('hero-watch-btn');
    const heroInfoBtn = document.getElementById('hero-info-btn');
    const newMoviesRow = document.getElementById('new-movies');
    const newSeriesRow = document.getElementById('new-series');
    const newAnimationsRow = document.getElementById('new-animations');
    const trendingMoviesRow = document.getElementById('trending-movies');
    const legendaryMoviesRow = document.getElementById('legendary-movies');
    const trendingSeriesRow = document.getElementById('trending-series');
    const legendarySeriesRow = document.getElementById('legendary-series');
    // Обработчики кнопок hero (глобальные)
    if (heroWatchBtn) {
        heroWatchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = heroWatchBtn.dataset.id;
            const type = heroWatchBtn.dataset.type;
            if (id && type) {
                saveWatchSource();
                const tvUrl = `watch/watch.html?TV_ID=${id}&autoplay=1`;
                const movieUrl = `watch/watch.html?M_ID=${id}&autoplay=1`;
                const url = type === 'tv' ? tvUrl : movieUrl;
                window.location.href = url;
            }
        });
    }

    if (heroInfoBtn) {
        heroInfoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = heroInfoBtn.dataset.id;
            const type = heroInfoBtn.dataset.type;
            if (id && type) {
                saveWatchSource();
                const tvUrl = `watch/watch.html?TV_ID=${id}`;
                const movieUrl = `watch/watch.html?M_ID=${id}`;
                const url = type === 'tv' ? tvUrl : movieUrl;
                window.location.href = url;
            }
        });
    }

    // Элементы поиска
    const searchMoviesRow = document.getElementById('search-movies');
    const searchSeriesRow = document.getElementById('search-series');
    const searchActorsRow = document.getElementById('search-actors');

    // Загрузка YouTube IFrame API
    let youtubeScriptLoaded = false;
    function loadYouTubeAPI() {
        if (!youtubeScriptLoaded) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            youtubeScriptLoaded = true;
        }
    }
    loadYouTubeAPI();

    // Функция для получения логотипа (только русский) с таймаутом
    async function getLogo(id, type) {
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(null), 2000);
        });

        const fetchPromise = fetch(`${BASE_URL}/${type}/${id}/images?api_key=${API_KEY}`)
            .then(response => response.json())
            .then(data => {
                const logos = data.logos || [];
                const ruLogo = logos.find(logo => logo.iso_639_1 === 'ru');
                return ruLogo ? `${IMG_URL}${ruLogo.file_path}` : null;
            })
            .catch(() => null);

        return Promise.race([fetchPromise, timeoutPromise]);
    }

    // Получить постер и задний фон для плеера
    async function getImages(id, type) {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=ru-RU`);
        const data = await response.json();
        return {
            poster: data.poster_path ? `${IMG_URL}${data.poster_path}` : NO_PICTURE_URL,
            backdrop: data.backdrop_path ? `${IMG_URL}${data.backdrop_path}` : NO_PICTURE_URL
        };
    }

// Получить и отобразить 1 слайд с YouTube трейлером
async function fetchHeroContent() {
    const response = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=ru-RU`);
    const data = await response.json();
    const content = data.results
        .filter(item => item.vote_average >= 6 && item.overview && item.backdrop_path)
        .map(item => ({ ...item, type: item.media_type }));

    const selectedContent = content[0];
    if (!selectedContent) return;

    let player;
    let isTrailerPlaying = false;
    let allTrailers = [];
    let trailerSuccessfullyPlayed = false;
    let progressInterval;
    let searchStartTime = null;

    const style = document.createElement('style');
    style.textContent = `
        .hero {
            position: relative;
            overflow: visible;
        }
        
        .hero-ambient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            transform: scale(1.02);
            filter: blur(50px);
            opacity: 1;
            pointer-events: none;
            z-index: 0;
        }
        
        .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            border-radius: 20px;
            z-index: 1;
            transition: opacity 1s ease;
        }
        
        .hero-trailer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
            border-radius: 20px;
            overflow: hidden;
        }
            .hero-trailer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top right, rgba(0, 0, 0, 0.8), transparent);
    border-radius: inherit;
    z-index: 3;
    pointer-events: none;
}
        
        .hero-trailer.active {
            opacity: 1;
            pointer-events: all;
        }
        
        .hero-trailer iframe {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            transform: translate(-50%, -50%);
            border: none;
            pointer-events: none;
        }
        
        @media (min-aspect-ratio: 16/9) {
            .hero-trailer iframe {
                height: 56.25vw;
            }
        }
        
        @media (max-aspect-ratio: 16/9) {
            .hero-trailer iframe {
                width: 177.78vh;
            }
        }
        
        .hero-content {
            position: relative;
            z-index: 3;
            transform: translateY(0);
            opacity: 1;
        }
        
        .hero-content.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .hero-logo {
            transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform: translateY(0);
        }
        
        .hero-logo.move-down {
            transform: translateY(70px);
        }
        
        .hero-logo.move-up {
            transform: translateY(0);
        }
        
        .hero-logo-text {
            transition: opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 1;
        }
        
        .hero-logo-text.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .hero-content p {
            transition: opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 1;
        }
        
        .hero-content p.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        @media (min-width: 769px) {
            .trailer-controls {
                bottom: 30px !important;
                right: 30px !important;
                top: auto !important;
            }
        }
        
        @media (max-width: 768px) {
            .hero {
                border-radius: 15px;
            }
            
            .hero-background,
            .hero-trailer {
                border-radius: 15px;
            }
            
            .hero-content {
                padding: 20px;
            }
            
            .hero-logo.move-down {
                transform: translateY(60px);
            }
            
            .trailer-controls {
                top: 20px !important;
                right: 20px !important;
                bottom: auto !important;
            }
        }
        
        @media (max-width: 480px) {
            .hero {
                border-radius: 10px;
            }
            
            .hero-background,
            .hero-trailer {
                border-radius: 10px;
            }
            
            .hero-logo.move-down {
                transform: translateY(50px);
            }
            
            .trailer-controls {
                top: 15px !important;
                right: 15px !important;
                bottom: auto !important;
            }
        }
    `;
    document.head.appendChild(style);

    const ambient = document.createElement('div');
    ambient.className = 'hero-ambient';
    ambient.style.backgroundImage = `url(${IMG_URL}${selectedContent.backdrop_path})`;
    hero.insertBefore(ambient, hero.firstChild);

    const bg = document.createElement('div');
    bg.className = 'hero-background';
    bg.style.backgroundImage = `url(${IMG_URL}${selectedContent.backdrop_path})`;
    hero.insertBefore(bg, hero.firstChild);

    const trailerContainer = document.createElement('div');
    trailerContainer.className = 'hero-trailer';
    hero.insertBefore(trailerContainer, hero.firstChild);

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'trailer-controls';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.bottom = '30px';
    controlsContainer.style.right = '30px';
    controlsContainer.style.zIndex = '10';
    controlsContainer.style.display = 'none';
    controlsContainer.style.gap = '10px';
    controlsContainer.style.pointerEvents = 'all';

    controlsContainer.innerHTML = `
        <button id="trailer-sound-btn" style="
            background: rgba(32, 32, 32, 0.35);
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
            padding: 0;
            margin: 0;
            flex-shrink: 0;
            border : 1px solid #ffffff21;
        ">
            <img src="ico/Звук_выкл.png" style="width: 20px; height: 20px; filter: brightness(0) invert(1);">
        </button>
        <button id="trailer-exit-btn" style="
            background: rgba(32, 32, 32, 0.35);
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
            padding: 0;
            margin: 0;
            flex-shrink: 0;
            border : 1px solid #ffffff21;
        ">
            <img src="ico/закрыть.svg" style="width: 20px; height: 20px; filter: brightness(0) invert(1);">
        </button>
    `;

    controlsContainer.style.display = 'none';
    controlsContainer.style.flexDirection = 'row';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.justifyContent = 'center';

    hero.appendChild(controlsContainer);

    const soundBtn = document.getElementById('trailer-sound-btn');
    const exitBtn = document.getElementById('trailer-exit-btn');

    let isSoundMuted = true;
    const soundIcon = soundBtn.querySelector('img');

    soundBtn.addEventListener('click', () => {
        if (!player) return;
        try {
            if (isSoundMuted) {
                player.unMute();
                player.setVolume(100);
                soundIcon.src = 'ico/Звук_вкл.png';
            } else {
                player.mute();
                soundIcon.src = 'ico/Звук_выкл.png';
            }
            isSoundMuted = !isSoundMuted;
        } catch (error) {}
    });

    exitBtn.addEventListener('click', () => {
        trailerSuccessfullyPlayed = true;
        stopTrailer();
    });

    async function getAllTrailers(contentId, contentType) {
        try {
            const response = await fetch(
                `${BASE_URL}/${contentType}/${contentId}/videos?api_key=${API_KEY}`
            );
            const data = await response.json();
            
            const trailers = data.results.filter(
                video => video.type === 'Trailer' && video.site === 'YouTube'
            );

            trailers.sort((a, b) => {
                const langPriority = { 'ru': 0, 'en': 1 };
                const priorityA = langPriority[a.iso_639_1] ?? 2;
                const priorityB = langPriority[b.iso_639_1] ?? 2;
                return priorityA - priorityB;
            });

            return trailers;
        } catch (error) {
            return [];
        }
    }

    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    function testTrailerQuick(trailer) {
        return new Promise((resolve) => {
            const testDiv = document.createElement('div');
            testDiv.style.display = 'none';
            document.body.appendChild(testDiv);
            
            let resolved = false;
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    try { testPlayer?.destroy(); } catch (e) {}
                    if (document.body.contains(testDiv)) document.body.removeChild(testDiv);
                    resolve(false);
                }
            }, 2500);
            
            try {
                const testPlayer = new YT.Player(testDiv, {
                    videoId: trailer.key,
                    playerVars: { autoplay: 1, mute: 1, controls: 0, fs: 0 },
                    events: {
                        'onReady': (e) => {
                            setTimeout(() => {
                                try {
                                    const time = e.target.getCurrentTime();
                                    if (time > 0 && !resolved) {
                                        resolved = true;
                                        clearTimeout(timeout);
                                        e.target.destroy();
                                        if (document.body.contains(testDiv)) document.body.removeChild(testDiv);
                                        resolve(true);
                                    }
                                } catch (err) {}
                            }, 800);
                        },
                        'onError': (e) => {
                            if (!resolved) {
                                resolved = true;
                                clearTimeout(timeout);
                                testPlayer.destroy();
                                if (document.body.contains(testDiv)) document.body.removeChild(testDiv);
                                resolve(false);
                            }
                        }
                    }
                });
            } catch (err) {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    if (document.body.contains(testDiv)) document.body.removeChild(testDiv);
                    resolve(false);
                }
            }
        });
    }

    async function findAndPlayTrailer() {
        searchStartTime = Date.now();
        
        for (const trailer of allTrailers) {
            if (trailerSuccessfullyPlayed) break;
            
            const isWorking = await testTrailerQuick(trailer);
            if (isWorking) {
                const timeToWait = 10000 - (Date.now() - searchStartTime);
                if (timeToWait > 0) {
                    await new Promise(resolve => setTimeout(resolve, timeToWait));
                }
                
                playTrailer(trailer);
                return;
            }
        }
        
        restoreBackground();
    }

    function playTrailer(trailer) {
        const heroDescription = document.querySelector('.hero-content p');
        const heroLogo = document.querySelector('.hero-logo');
        const heroLogoText = document.querySelector('.hero-logo-text');

        if (heroDescription) heroDescription.classList.add('hidden');
        if (heroLogo) heroLogo.classList.add('move-down');
        if (heroLogoText) heroLogoText.classList.add('hidden');

        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player-main';
        trailerContainer.innerHTML = '';
        trailerContainer.appendChild(playerDiv);

        const waitForAPI = setInterval(() => {
            if (window.YT && window.YT.Player) {
                clearInterval(waitForAPI);
                initPlayer(playerDiv.id, trailer.key);
            }
        }, 100);
    }

    function initPlayer(elementId, videoKey) {
        try {
            player = new YT.Player(elementId, {
                videoId: videoKey,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    playsinline: 1,
                    enablejsapi: 1,
                    origin: window.location.origin
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
        } catch (error) {}
    }

    function onPlayerReady(event) {
        try {
            event.target.playVideo();
            event.target.mute();
        } catch (e) {}
        
        setTimeout(() => {
            trailerContainer.classList.add('active');
            controlsContainer.style.display = 'flex';
            isTrailerPlaying = true;
            trailerSuccessfullyPlayed = true;
            startProgressMonitoring(event.target);
        }, 300);
    }

    function startProgressMonitoring(playerInstance) {
        if (progressInterval) clearInterval(progressInterval);

        progressInterval = setInterval(() => {
            if (playerInstance?.getDuration && playerInstance?.getCurrentTime) {
                try {
                    const duration = playerInstance.getDuration();
                    const currentTime = playerInstance.getCurrentTime();
                    const timeLeft = duration - currentTime;
                    
                    if (timeLeft <= 10.5 && timeLeft >= 9.5) {
                        clearInterval(progressInterval);
                        stopTrailer();
                    }
                } catch (e) {}
            }
        }, 100);
    }

    function onPlayerStateChange(event) {
        if (event.data === 0) {
            stopTrailer();
        }
    }

    function onPlayerError(event) {
        stopTrailer();
    }

    function stopTrailer() {
        if (progressInterval) clearInterval(progressInterval);

        trailerContainer.classList.remove('active');
        controlsContainer.style.display = 'none';
        isTrailerPlaying = false;
        restoreBackground();

        if (player) {
            setTimeout(() => {
                try { player.destroy(); } catch (error) {}
                trailerContainer.innerHTML = '';
                player = null;
            }, 500);
        }
    }

    function restoreBackground() {
        const heroDescription = document.querySelector('.hero-content p');
        const heroLogo = document.querySelector('.hero-logo');
        const heroLogoText = document.querySelector('.hero-logo-text');

        setTimeout(() => {
            if (heroDescription) heroDescription.classList.remove('hidden');
            if (heroLogo) {
                heroLogo.classList.remove('move-down');
                heroLogo.classList.add('move-up');
                setTimeout(() => heroLogo.classList.remove('move-up'), 1200);
            }
            if (heroLogoText) heroLogoText.classList.remove('hidden');
        }, 500);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isModalOpen = document.querySelector('.modal.active') || 
                                   document.querySelector('.player-modal.active');
                
                if (isModalOpen && isTrailerPlaying && player) {
                    try { player.pauseVideo(); } catch (e) {}
                }
            }
        });
    });

    observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class']
    });

    const logoUrl = await getLogo(selectedContent.id, selectedContent.type);

    if (logoUrl) {
        heroLogo.src = logoUrl;
        heroLogo.style.display = 'block';
        heroLogoText.style.display = 'none';
    } else {
        heroLogo.style.display = 'none';
        heroLogoText.textContent = selectedContent.title || selectedContent.name;
        heroLogoText.style.display = 'block';
    }

    heroDescription.textContent = selectedContent.overview || 'Описание отсутствует';
    heroWatchBtn.dataset.id = selectedContent.id;
    heroWatchBtn.dataset.type = selectedContent.type;
    heroInfoBtn.dataset.id = selectedContent.id;
    heroInfoBtn.dataset.type = selectedContent.type;

    const heroContent = document.querySelector('.hero-content');
    if (heroContent) heroContent.classList.add('active');

    const waitForYT = setInterval(async () => {
        if (window.YT && window.YT.Player) {
            clearInterval(waitForYT);
            allTrailers = await getAllTrailers(selectedContent.id, selectedContent.type);
            if (allTrailers.length > 0) {
                findAndPlayTrailer();
            }
        }
    }, 100);
}


    // Получить новые фильмы
    async function fetchNewMovies() {
        const response = await fetch(
            `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=ru-RU`
        );
        const data = await response.json();
        displayMovies(data.results, newMoviesRow, 'movie');
    }

    // Получить новые сериалы
    async function fetchNewSeries() {
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=first_air_date.desc&first_air_date.lte=2025-06-22&vote_count.gte=100`
        );
        const data = await response.json();
        displayMovies(data.results, newSeriesRow, 'tv');
    }

    // Получить новые мультфильмы
    async function fetchNewAnimations() {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&with_genres=16&sort_by=release_date.desc&release_date.lte=2025-06-22&vote_count.gte=100`
        );
        const data = await response.json();
        displayMovies(data.results, newAnimationsRow, 'movie');
    }

    // Получить трендовые фильмы
    async function fetchTrendingMovies() {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&language=ru-RU`);
        const data = await response.json();
        displayMovies(data.results, trendingMoviesRow, 'movie');
    }

    // Получить легендарные фильмы
    async function fetchLegendaryMovies() {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=ru-RU&sort_by=vote_average.desc&vote_count.gte=1000&release_date.lte=2015-01-01`
        );
        const data = await response.json();
        displayMovies(data.results, legendaryMoviesRow, 'movie');
    }

    // Получить трендовые сериалы
    async function fetchTrendingSeries() {
        const response = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&language=ru-RU`);
        const data = await response.json();
        displayMovies(data.results, trendingSeriesRow, 'tv');
    }

    // Получить легендарные сериалы
    async function fetchLegendarySeries() {
        const response = await fetch(
            `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=ru-RU&sort_by=vote_average.desc&vote_count.gte=1000&first_air_date.lte=2015-01-01`
        );
        const data = await response.json();
        displayMovies(data.results, legendarySeriesRow, 'tv');
    }

    // Отобразить фильмы/сериалы в рядах
    function displayActors(actors, container) {
        if (!container) return;
        container.innerHTML = '';
        actors.slice(0, 10).forEach(actor => {
            const actorCard = document.createElement('div');
            actorCard.classList.add('movie-card');
            const profileUrl = actor.profile_path ? `${IMG_URL}${actor.profile_path}` : NO_PICTURE_URL;
            
            actorCard.innerHTML = `
                <img src="${profileUrl}" alt="${actor.name}">
                <div class="gradient-overlay"></div>
                <p>${actor.name}</p>
            `;

            actorCard.dataset.id = actor.id;
            actorCard.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = `watch/actor.html?ID=${actor.id}`;
                if (searchModal) searchModal.style.display = 'none';
            });

            container.appendChild(actorCard);
        });
    }

    function displayMovies(movies, container, type) {
        if (!container) return;
        container.innerHTML = '';
        movies.slice(0, 10).forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            const posterUrl = movie.poster_path ? `${IMG_URL}${movie.poster_path}` : NO_PICTURE_URL;
            const rating = movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : null;

            let ratingClass = 'movie-card-rating';
            if (!rating) {
                ratingClass += ' dark-red';
            } else if (rating >= 6.5) {
                ratingClass += ' high';
            } else if (rating < 6.5 && rating >= 5) {
                ratingClass += ' low';
            } else if (rating < 5 && rating >= 4) {
                ratingClass += ' very-low';
            } else {
                ratingClass += ' dark-red';
            }

            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${movie.title || movie.name}">
                <div class="gradient-overlay"></div>
                <p>${movie.title || movie.name}</p>
                ${rating ? `<div class="${ratingClass}">${rating}</div>` : ''}
            `;

            movieCard.dataset.id = movie.id;
            movieCard.dataset.type = type;
            movieCard.addEventListener('click', (e) => {
                e.preventDefault();
                // НЕ блокируем скролл перед переходом на watch страницу
                openModal(movie.id, type);
                    if (searchModal) searchModal.style.display = 'none';
            });

            container.appendChild(movieCard);
        });
    }

    // Определение возрастного рейтинга
    async function getAgeRating(id, type) {
        try {
            let rating;
            if (type === 'movie') {
                const response = await fetch(`${BASE_URL}/movie/${id}/release_dates?api_key=${API_KEY}`);
                const data = await response.json();
                const usRelease = data.results.find(item => item.iso_3166_1 === 'US');
                rating = usRelease?.release_dates?.find(date => date.certification)?.certification;
            } else if (type === 'tv') {
                const response = await fetch(`${BASE_URL}/tv/${id}/content_ratings?api_key=${API_KEY}`);
                const data = await response.json();
                rating = data.results.find(item => item.iso_3166_1 === 'US')?.rating;
            }

            // Сопоставление рейтингов с возрастными ограничениями
            const ageMap = {
                'G': '0+',
                'TV-Y': '0+',
                'TV-G': '0+',
                'PG': '6+',
                'TV-PG': '6+',
                'PG-13': '12+',
                'TV-14': '12+',
                'R': '16+',
                'NC-17': '18+',
                'TV-MA': '18+'
            };

            return ageMap[rating] || '12+'; // По умолчанию 12+, если рейтинг не найден
        } catch (error) {
            console.error('Ошибка получения возрастного рейтинга:', error);
            return '12+'; // По умолчанию при ошибке
        }
    }

    // Получить трейлеры (до 4 штук)
    async function getTrailers(id, type) {
        const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=ru-RU`);
        const data = await response.json();
        let trailers = data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailers.length < 4) {
            const enResponse = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
            const enData = await enResponse.json();
            const enTrailers = enData.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
            trailers = [...trailers, ...enTrailers].slice(0, 4);
        }

        return trailers.slice(0, 4);
    }

    // Отобразить трейлеры
    function displayTrailers(trailers, id, type) {
        if (!trailersGrid) return;
        trailersGrid.innerHTML = '';

        if (trailers.length === 0) {
            if (modalTrailers) modalTrailers.classList.remove('visible');
            return;
        }

        if (modalTrailers) modalTrailers.classList.add('visible');

        trailers.forEach(trailer => {
            const trailerCard = document.createElement('div');
            trailerCard.classList.add('trailer-card');
            const thumbnailUrl = trailer.key ? `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg` : NO_PICTURE_URL;

            trailerCard.innerHTML = `
                <img src="${thumbnailUrl}" alt="${trailer.name}">
                <div class="play-overlay">
                    <img src="ico/play.svg" alt="Play">
                </div>
            `;

            trailerCard.addEventListener('click', () => {
                if (trailerVideo) {
                    trailerVideo.innerHTML = `
                        <iframe width="100%" height="100%" 
                                src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" 
                                frameborder="0" allowfullscreen></iframe>
                    `;
                }
                if (trailerModal) {
                    trailerModal.style.display = 'block';
                    lockScroll();
                }
            });

            trailersGrid.appendChild(trailerCard);
        });
    }

    // Функция поиска
    async function performSearch(query) {
        // save to recent searches
        try { saveRecentSearch(query); } catch (e) {}
        
        // Show search loader
        const searchLoader = document.getElementById('search-loader');
        if (searchLoader) {
            searchLoader.style.display = 'flex';
        }
        
        try {
            const movieResponse = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}`
            );
            const movieData = await movieResponse.json();

            const seriesResponse = await fetch(
                `${BASE_URL}/search/tv?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}`
            );
            const seriesData = await seriesResponse.json();

            const actorsResponse = await fetch(
                `${BASE_URL}/search/person?api_key=${API_KEY}&language=ru-RU&query=${encodeURIComponent(query)}`
            );
            const actorsData = await actorsResponse.json();

            // Hide search loader
            if (searchLoader) {
                searchLoader.style.display = 'none';
            }

            // Restore the category structure before displaying results
            const resultsContainer = document.querySelector('.mobile-search-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="search-category">
                        <h2>Фильмы</h2>
                        <div id="search-movies" class="movie-row"></div>
                    </div>
                    <div class="search-category">
                        <h2>Сериалы</h2>
                        <div id="search-series" class="movie-row"></div>
                    </div>
                    <div class="search-category">
                        <h2>Актеры</h2>
                        <div id="search-actors" class="movie-row"></div>
                    </div>
                `;
            }

            // Reselect the elements after DOM reconstruction
            const updatedSearchMoviesRow = document.getElementById('search-movies');
            const updatedSearchSeriesRow = document.getElementById('search-series');
            const updatedSearchActorsRow = document.getElementById('search-actors');

            displayMovies(movieData.results || [], updatedSearchMoviesRow, 'movie');
            displayMovies(seriesData.results || [], updatedSearchSeriesRow, 'tv');
            displayActors(actorsData.results || [], updatedSearchActorsRow);
            // Показываем модал с результатами
            if (searchModal) {
                searchModal.style.display = 'block';
                lockScroll();
            }

            // Desktop: animate form up and show results; mobile: default behavior
            try {
                const modalContent = document.querySelector('.mobile-search-content');
                const empty = document.getElementById('search-empty');
                const resultsContainer = document.querySelector('.mobile-search-results');

                if (window.innerWidth >= 769 && modalContent) {
                    // hide empty, show results container and add class to trigger CSS animation
                    if (empty) empty.style.display = 'none';
                    if (resultsContainer) resultsContainer.style.display = 'block';
                    modalContent.classList.add('results-open');

                    // Reorder categories: categories with results first; set 'Ничего не найдено' for empties
                    const categories = Array.from(resultsContainer.querySelectorAll('.search-category'));
                    let anyResults = false;
                    const withResults = [];
                    const withoutResults = [];

                    categories.forEach(cat => {
                        const row = cat.querySelector('.movie-row');
                        const hasItems = row && row.children && row.children.length > 0 && !(row.children.length === 1 && row.children[0].tagName === 'P' && row.children[0].textContent.trim() === '');
                        if (hasItems) {
                            withResults.push(cat);
                            anyResults = true;
                        } else {
                            // show 'Ничего не найдено' in this category
                            if (row) row.innerHTML = '<p>Ничего не найдено</p>';
                            withoutResults.push(cat);
                        }
                    });

                    if (!anyResults) {
                        // none found in all categories
                        resultsContainer.innerHTML = '<p class="no-results-all">Результаты не найдены</p>';
                    } else {
                        // append categories with results first, then empty ones
                        withResults.concat(withoutResults).forEach(c => resultsContainer.appendChild(c));
                    }
                } else {
                    // mobile: if all empty — show single message in movies row (existing behavior)
                    if ((!movieData.results || movieData.results.length === 0) && 
                        (!seriesData.results || seriesData.results.length === 0) &&
                        (!actorsData.results || actorsData.results.length === 0)) {
                        searchMoviesRow.innerHTML = '<p>Результаты не найдены</p>';
                        searchSeriesRow.innerHTML = '';
                        searchActorsRow.innerHTML = '';
                    }
                }
            } catch (err) {
                console.error('Search UI update error', err);
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            // Hide search loader on error
            const searchLoader = document.getElementById('search-loader');
            if (searchLoader) {
                searchLoader.style.display = 'none';
            }
            searchMoviesRow.innerHTML = '<p>Ошибка при выполнении поиска</p>';
            searchSeriesRow.innerHTML = '';
            searchActorsRow.innerHTML = '';
        }
    }

    // Открыть модальное окно с деталями фильма
    async function openModal(id, type) {
        // Перенаправляем на watch/watch.html с параметрами вместо открытия встроенного модаладала
        saveWatchSource();
        const tvUrl = `watch/watch.html?TV_ID=${id}`;
        const movieUrl = `watch/watch.html?M_ID=${id}`;
        
        const url = type === 'tv' ? tvUrl : movieUrl;
        console.log('openModal called with URL:', url);
        window.location.href = url;
    }

    // Инициализация контента
    if (hero) fetchHeroContent();
    if (newMoviesRow) fetchNewMovies();
    if (newSeriesRow) fetchNewSeries();
    if (newAnimationsRow) fetchNewAnimations();
    if (trendingMoviesRow) fetchTrendingMovies();
    if (legendaryMoviesRow) fetchLegendaryMovies();
    if (trendingSeriesRow) fetchTrendingSeries();
    if (legendarySeriesRow) fetchLegendarySeries();

    // Добавляем tooltips для кнопок управления плеером
    // Они будут добавлены динамически когда плеер инициализируется в player.js

    // Инициализируем tooltips для поиска
    setTimeout(() => {
        // tooltip'ы удалены
    }, 100);
});