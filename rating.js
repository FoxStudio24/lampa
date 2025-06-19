(function () {
    'use strict';

    // Кеш обработанных фильмов
    var processedMovies = new Set();
    var ratingCache = new Map();
    var cardifyObserver = null;

    // Проверка активности cardify
    function isCardifyActive() {
        try {
            return (
                document.querySelector('.cardify__details') !== null || // Приоритетный индикатор
                document.querySelector('.cardify__right') !== null || // Запасной индикатор
                document.querySelector('.cardify-preview, .cardify-trailer') !== null // Дополнительный индикатор
            );
        } catch (e) {
            console.log('Ошибка проверки активности cardify:', e);
            return false;
        }
    }

    // Динамическое ожидание рендеринга cardify
    function waitForCardify(callback, maxWait = 2000) {
        var startTime = Date.now();
        function check() {
            if (isCardifyActive() || Date.now() - startTime > maxWait) {
                console.log('Cardify проверка завершена, активен:', isCardifyActive());
                callback();
            } else {
                requestAnimationFrame(check);
            }
        }
        requestAnimationFrame(check);
    }

    // Наблюдатель за появлением cardify в DOM
    function setupCardifyObserver() {
        if (cardifyObserver) cardifyObserver.disconnect();

        cardifyObserver = new MutationObserver(function (mutations) {
            var shouldProcess = false;
            mutations.forEach(function (mutation) {
                Array.from(mutation.addedNodes).forEach(function (node) {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('cardify__details') ||
                        node.querySelector?.('.cardify__details') ||
                        node.classList?.contains('cardify__right') ||
                        node.querySelector?.('.cardify__right')
                    )) {
                        shouldProcess = true;
                    }
                });
            });

            if (shouldProcess) {
                console.log('Обнаружен cardify__details или cardify__right, добавляем рейтинги...');
                waitForCardify(function () {
                    var movieData = getMovieData();
                    if (movieData && !document.querySelector('.cardify-ratings-wrapper')) {
                        console.log('Обработка рейтингов после появления cardify...');
                        var movieKey = movieData.id + '_' + (movieData.media_type || 'movie');
                        processedMovies.delete(movieKey);
                        rating_kp_imdb(movieData);
                    }
                });
            }
        });

        cardifyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        return cardifyObserver;
    }

    function rating_kp_imdb(card) {
        if (!card || !card.id) {
            console.log('Нет валидных данных карточки, пропуск.');
            return;
        }

        var movieKey = card.id + '_' + (card.media_type || 'movie');
        if (processedMovies.has(movieKey) && document.querySelector('.cardify-ratings-wrapper')) {
            console.log('Фильм уже обработан:', movieKey);
            return;
        }

        processedMovies.add(movieKey);

        var network = new Lampa.Reguest();
        var clean_title = card.title ? kpCleanTitle(card.title) : '';
        var search_date = card.release_date || card.first_air_date || card.last_air_date || '0000';
        var search_year = parseInt(search_date.slice(0, 4));
        var orig = card.original_title || card.original_name || '';
        var kp_prox = '';
        var params = {
            id: card.id,
            url: kp_prox + 'https://kinopoiskapiunofficial.tech/',
            rating_url: kp_prox + 'https://rating.kinopoisk.ru/',
            headers: {
                'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
            },
            cache_time: 24 * 60 * 60 * 1000
        };

        console.log('Обработка карточки:', card);
        getRating();

        function getRating() {
            var movieRating = _getCache(params.id);
            if (movieRating) {
                return _showRating(movieRating[params.id]);
            }
            searchFilm();
        }

        function searchFilm() {
            var url = params.url;
            var url_by_title = Lampa.Utils.addUrlComponent(url + 'api/v2.1/films/search-by-keyword', 'keyword=' + encodeURIComponent(clean_title));
            url = card.imdb_id ? Lampa.Utils.addUrlComponent(url + 'api/v2.2/films', 'imdbId=' + encodeURIComponent(card.imdb_id)) : url_by_title;

            networkRequest(url, function (json) {
                var items = json.items || json.films || [];
                if (items.length) chooseFilm(items);
                else if (url !== url_by_title) {
                    networkRequest(url_by_title, function (json) {
                        chooseFilm(json.items || json.films || []);
                    });
                } else chooseFilm([]);
            });
        }

        function networkRequest(url, success, error = showError) {
            network.clear();
            network.timeout(15000);
            network.silent(url, success, function (a, c) {
                error(network.errorDecode(a, c));
            }, false, { headers: params.headers });
        }

        function chooseFilm(items) {
            if (!items.length) {
                return _showRating(_setCache(params.id, { kp: 0, imdb: 0, timestamp: Date.now() }));
            }

            items.forEach(item => {
                item.tmp_year = parseInt((item.start_date || item.year || '0000').slice(0, 4));
            });

            var filteredItems = items;
            var is_sure = false;

            if (card.imdb_id) {
                var tmp = items.filter(elem => (elem.imdb_id || elem.imdbId) === card.imdb_id);
                if (tmp.length) {
                    filteredItems = tmp;
                    is_sure = true;
                }
            }

            if (orig) {
                var tmp = filteredItems.filter(elem =>
                    containsTitle(elem.orig_title || elem.nameOriginal, orig) ||
                    containsTitle(elem.en_title || elem.nameEn, orig) ||
                    containsTitle(elem.title || elem.ru_title || elem.nameRu, orig)
                );
                if (tmp.length) {
                    filteredItems = tmp;
                    is_sure = true;
                }
            }

            if (card.title) {
                var tmp = filteredItems.filter(elem =>
                    containsTitle(elem.title || elem.ru_title || elem.nameRu, card.title) ||
                    containsTitle(elem.en_title || elem.nameEn, card.title) ||
                    containsTitle(elem.orig_title || elem.nameOriginal, card.title)
                );
                if (tmp.length) {
                    filteredItems = tmp;
                    is_sure = true;
                }
            }

            if (filteredItems.length > 1 && search_year) {
                var tmp = filteredItems.filter(c => c.tmp_year === search_year);
                if (!tmp.length) tmp = filteredItems.filter(c => c.tmp_year && c.tmp_year > search_year - 2 && c.tmp_year < search_year + 2);
                if (tmp.length) filteredItems = tmp;
            }

            if (filteredItems.length === 1 && is_sure) {
                var id = filteredItems[0].kp_id || filteredItems[0].kinopoisk_id || filteredItems[0].kinopoiskId || filteredItems[0].filmId;
                fetchRating(id);
            } else {
                _showRating(_setCache(params.id, { kp: 0, imdb: 0, timestamp: Date.now() }));
            }
        }

        function fetchRating(id) {
            network.clear();
            network.timeout(5000);
            network["native"](params.rating_url + id + '.xml', function (str) {
                if (str.includes('<rating>')) {
                    try {
                        var xml = $($.parseXML(str));
                        var ratingKinopoisk = parseFloat(xml.find('kp_rating').text()) || 0;
                        var ratingImdb = parseFloat(xml.find('imdb_rating').text()) || 0;
                        var movieRating = _setCache(params.id, {
                            kp: ratingKinopoisk,
                            imdb: ratingImdb,
                            timestamp: Date.now()
                        });
                        return _showRating(movieRating);
                    } catch (e) {
                        console.log('Ошибка парсинга XML:', e);
                    }
                }
                fetchRatingFallback(id);
            }, fetchRatingFallback.bind(null, id), false, { dataType: 'text' });
        }

        function fetchRatingFallback(id) {
            networkRequest(params.url + 'api/v2.2/films/' + id, function (data) {
                var movieRating = _setCache(params.id, {
                    kp: data.ratingKinopoisk || 0,
                    imdb: data.ratingImdb || 0,
                    timestamp: Date.now()
                });
                _showRating(movieRating);
            });
        }

        function cleanTitle(str) {
            return str ? str.replace(/[\s.,:;''`!?]+/g, ' ').trim() : '';
        }

        function kpCleanTitle(str) {
            return cleanTitle(str)
                .replace(/^[ \/\\]+/, '')
                .replace(/[ \/\\]+$/, '')
                .replace(/\+( *[+\/\\])+/g, '+')
                .replace(/([+\/\\] *)+\+/g, '+')
                .replace(/( *[\/\\]+ *)+/g, '+');
        }

        function normalizeTitle(str) {
            return cleanTitle(str.toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-').replace(/ё/g, 'е'));
        }

        function equalTitle(t1, t2) {
            return typeof t1 === 'string' && typeof t2 === 'string' && normalizeTitle(t1) === normalizeTitle(t2);
        }

        function containsTitle(str, title) {
            return typeof str === 'string' && typeof title === 'string' && normalizeTitle(str).includes(normalizeTitle(title));
        }

        function showError(error) {
            Lampa.Noty.show('Рейтинг KP: ' + error);
            console.log('Ошибка:', error);
        }

        function _getCache(movie) {
            var timestamp = Date.now();
            var cache = Lampa.Storage.cache('kp_rating', 500, {});
            if (cache[movie] && (timestamp - cache[movie].timestamp) <= params.cache_time) {
                return cache;
            }
            delete cache[movie];
            Lampa.Storage.set('kp_rating', cache);
            return false;
        }

        function _setCache(movie, data) {
            var cache = Lampa.Storage.cache('kp_rating', 500, {});
            cache[movie] = data;
            Lampa.Storage.set('kp_rating', cache);
            return data;
        }

        function _showRating(data) {
            if (!data) return;

            var kp_rating = !isNaN(data.kp) && data.kp ? parseFloat(data.kp).toFixed(1) : '0';
            var imdb_rating = !isNaN(data.imdb) && data.imdb ? parseFloat(data.imdb).toFixed(1) : '0';
            var render = findRenderContainer();
            if (!render) {
                console.log('Контейнер рендеринга не найден');
                return;
            }

            $('.wait_rating', render).remove();

            kp_rating = kp_rating.endsWith('.0') ? kp_rating.slice(0, -2) : kp_rating;
            imdb_rating = imdb_rating.endsWith('.0') ? imdb_rating.slice(0, -2) : imdb_rating;

            var tmdb_rating = '0';
            if (card && !isNaN(card.vote_average)) {
                tmdb_rating = parseFloat(card.vote_average).toFixed(1);
            } else if (card && !isNaN(card.rating)) {
                tmdb_rating = parseFloat(card.rating).toFixed(1);
            }
            tmdb_rating = tmdb_rating.endsWith('.0') ? tmdb_rating.slice(0, -2) : tmdb_rating;

            var $tmdbRating = $('<div class="full-start__rating">TMDB ' + tmdb_rating + '</div>');
            var $kpRating = $('<div class="full-start__rating">KP ' + kp_rating + '</div>');
            var $imdbRating = $('<div class="full-start__rating">IMDb ' + imdb_rating + '</div>');

            function createStars(rating) {
                var stars = Math.round(parseFloat(rating) / 2);
                var starsHtml = $('<div class="rating-stars"></div>').css({
                    'display': 'inline-flex',
                    'margin-left': '5px'
                });
                for (var i = 0; i < 5; i++) {
                    var starSvg = i < stars ?
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="yellow" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>' :
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>';
                    starsHtml.append(starSvg);
                }
                return starsHtml;
            }

            var $tmdbContainer = $('<div class="rating-container kp-imdb-rating"></div>').css({
                'display': 'inline-block',
                'margin-right': '15px'
            }).append($tmdbRating, createStars(tmdb_rating));
            var $kpContainer = $('<div class="rating-container kp-imdb-rating"></div>').css({
                'display': 'inline-block',
                'margin-right': '15px'
            }).append($kpRating, createStars(kp_rating));
            var $imdbContainer = $('<div class="rating-container kp-imdb-rating"></div>').css({
                'display': 'inline-block',
                'margin-right': '15px'
            }).append($imdbRating, createStars(imdb_rating));

            if (tmdb_rating === '0') $tmdbContainer.addClass('hide');
            if (kp_rating === '0') $kpContainer.addClass('hide');
            if (imdb_rating === '0') $imdbContainer.addClass('hide');

            insertRatings(render, $tmdbContainer, $kpContainer, $imdbContainer);
        }
    }

    function findRenderContainer() {
        try {
            var activity = Lampa.Activity.active();
            if (activity?.activity?.render) {
                var render = activity.activity.render();
                if (render.find('.cardify__details').length) {
                    console.log('Найден cardify контейнер в активности');
                    return render;
                }
                return render;
            }
        } catch (e) {
            console.log('Ошибка получения рендера активности:', e);
        }

        var containers = [
            '.cardify__details',
            '.cardify__right',
            '.full-start-new__body',
            '.full-start__body',
            '.activity__body',
            'body'
        ];

        for (var selector of containers) {
            var container = $(selector).first();
            if (container.length) {
                console.log('Найден контейнер:', selector);
                return container;
            }
        }

        return null;
    }

    function insertRatings(render, $tmdbContainer, $kpContainer, $imdbContainer) {
        // Удаляем старые рейтинги
        $('.cardify-ratings-wrapper', render).remove();

        // Ищем cardify__details
        var $cardifyDetails = $('.cardify__details', render);

        if ($cardifyDetails.length) {
            console.log('Найден cardify__details, добавляем рейтинги после него');
            var $ratingsWrapper = $('<div class="cardify-ratings-wrapper"></div>').css({
                'margin-top': '15px',
                'margin-bottom': '15px',
                'display': 'flex',
                'align-items': 'center'
            });
            $ratingsWrapper.append($tmdbContainer, $kpContainer, $imdbContainer);
            $cardifyDetails.after($ratingsWrapper);
            console.log('Рейтинги добавлены после cardify__details');
            return;
        }

        // Fallback для случаев без cardify
        var $rateLine = $('.full-start-new__rate-line', render);
        if ($rateLine.length) {
            console.log('Cardify не найден, используем .full-start-new__rate-line');
            $rateLine.prepend($tmdbContainer, $kpContainer, $imdbContainer);
            $rateLine.removeClass('hide');
        } else {
            var $rightContainer = $('.full-start-new__right', render);
            if ($rightContainer.length) {
                console.log('Создаем новый .full-start-new__rate-line в .full-start-new__right');
                $rightContainer.append(
                    $('<div class="full-start-new__rate-line"></div>')
                        .append($tmdbContainer, $kpContainer, $imdbContainer)
                        .removeClass('hide')
                );
            } else {
                var $body = $('.full-start-new__body, .full-start__body', render);
                if ($body.length) {
                    console.log('Fallback: добавляем рейтинги в .full-start-new__body');
                    $body.prepend(
                        $('<div class="rating-line-fallback" style="margin-bottom: 15px;"></div>')
                            .append($tmdbContainer, $kpContainer, $imdbContainer)
                    );
                }
            }
        }
    }

    function debounce(func, wait) {
        var timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(func.bind(this, ...arguments), wait);
        };
    }

    function getMovieData() {
        var movieData = null;

        try {
            var activity = Lampa.Activity.active();
            if (activity?.activity) {
                movieData = activity.activity.data?.movie || activity.activity.movie;
            }
        } catch (e) {
            console.log('Ошибка получения данных из активности:', e);
        }

        if (!movieData) {
            try {
                var urlParams = new URLSearchParams(window.location.search);
                var cardId = urlParams.get('card');
                if (cardId) movieData = getCachedMovieData(cardId);
            } catch (e) {
                console.log('Ошибка парсинга URL:', e);
            }
        }

        if (!movieData && window.Lampa?.Storage) {
            try {
                var lastMovie = Lampa.Storage.get('last_movie_data');
                if (lastMovie?.id) movieData = lastMovie;
            } catch (e) {
                console.log('Ошибка получения кешированных данных:', e);
            }
        }

        return movieData;
    }

    function getCachedMovieData(cardId) {
        return null;
    }

    function setupDOMObserver() {
        var observer = new MutationObserver(function (mutations) {
            var shouldProcess = false;
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    for (var node of mutation.addedNodes) {
                        if (node.nodeType === 1 && (
                            node.classList?.contains('full-start-new__right') ||
                            node.classList?.contains('full-start__body') ||
                            node.querySelector?.('.full-start-new__right')
                        )) {
                            shouldProcess = true;
                            break;
                        }
                    }
                }
            });

            if (shouldProcess) {
                waitForCardify(function () {
                    var movieData = getMovieData();
                    if (movieData && !document.querySelector('.cardify-ratings-wrapper')) {
                        console.log('Обнаружено изменение DOM, обработка рейтингов...');
                        rating_kp_imdb(movieData);
                    }
                });
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return observer;
    }

    function startPlugin() {
        if (window.rating_plugin) return;
        window.rating_plugin = true;

        console.log('Запуск плагина рейтингов...');

        var debouncedRating = debounce(function (movieData) {
            if (movieData?.id) {
                var render = findRenderContainer();
                if (render && !render.find('.wait_rating').length) {
                    render.find('.full-start-new__body, .full-start__body').first().prepend(
                        '<div style="position: absolute; top: 10px; right: 10px; width:2em; margin-top:1em; margin-right:1em; z-index: 2000;" class="wait_rating">' +
                        '<div class="broadcast__scan"><div></div></div></div>'
                    );
                }
                rating_kp_imdb(movieData);
            }
        }, 1000);

        setupCardifyObserver();
        setupDOMObserver();

        if (Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type === 'complite' && e.data?.movie) {
                    console.log('Событие full:complite, ждем cardify...');
                    waitForCardify(function () {
                        debouncedRating(e.data.movie);
                    }, 2000);
                }
            });

            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    console.log('App ready, инициируем начальную проверку...');
                    setTimeout(function () {
                        var movieData = getMovieData();
                        if (movieData) debouncedRating(movieData);
                    }, 2000);
                }
            });
        }

        console.log('Плагин рейтингов инициализирован');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPlugin);
    } else {
        startPlugin();
    }
})();
