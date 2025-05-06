(function () {
    'use strict';

    function rating_kp_imdb(card) {
        var network = new Lampa.Reguest();
        var clean_title = card && card.title ? kpCleanTitle(card.title) : card && card.name ? kpCleanTitle(card.name) : '';
        var search_date = card && (card.release_date || card.first_air_date || card.last_air_date) || '0000';
        var search_year = parseInt((search_date + '').slice(0, 4));
        var orig = card && (card.original_title || card.original_name) || '';
        var kp_prox = '';
        var params = {
            id: card && card.id ? card.id : card && card.tmdb_id ? card.tmdb_id : 0,
            url: kp_prox + 'https://kinopoiskapiunofficial.tech/',
            rating_url: kp_prox + 'https://rating.kinopoisk.ru/',
            headers: {
                'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
            },
            cache_time: 60 * 60 * 24 * 1000 // 1 день
        };

        // Отладочный лог для проверки структуры card
        console.log('Rating.js: Card data:', JSON.stringify(card, null, 2));

        // Проверка на существование card
        if (!card) {
            Lampa.Noty.show('Ошибка: данные о фильме недоступны.');
            return;
        }

        // Если id отсутствует, пытаемся загрузить данные из TMDB
        if (!params.id && clean_title) {
            network.silent(
                'https://api.themoviedb.org/3/search/movie?api_key=06936145fe8e20be28b02e26b55d3ce6&query=' + encodeURIComponent(clean_title),
                function (json) {
                    if (json.results && json.results.length) {
                        var result = json.results[0];
                        params.id = result.id;
                        card.id = result.id;
                        card.vote_average = result.vote_average || 0;
                        card.release_date = result.release_date || '0000';
                        card.imdb_id = result.imdb_id || '';
                        console.log('Rating.js: Данные из TMDB:', JSON.stringify(card, null, 2));
                        getRating();
                    } else {
                        Lampa.Noty.show('Ошибка: фильм не найден в TMDB.');
                    }
                },
                function (a, c) {
                    Lampa.Noty.show('Ошибка запроса к TMDB: ' + network.errorDecode(a, c));
                }
            );
            return;
        }

        if (!params.id) {
            Lampa.Noty.show('Ошибка: ID фильма не найден.');
            return;
        }

        getRating();

        function getRating() {
            var movieRating = _getCache(params.id);
            if (movieRating) {
                return _showRating(movieRating[params.id]);
            } else {
                searchFilm();
            }
        }

        function searchFilm() {
            var url = params.url;
            var url_by_title = Lampa.Utils.addUrlComponent(url + 'api/v2.1/films/search-by-keyword', 'keyword=' + encodeURIComponent(clean_title));
            if (card.imdb_id) url = Lampa.Utils.addUrlComponent(url + 'api/v2.2/films', 'imdbId=' + encodeURIComponent(card.imdb_id));
            else url = url_by_title;
            network.clear();
            network.timeout(15000);
            network.silent(url, function (json) {
                if (json.items && json.items.length) chooseFilm(json.items);
                else if (json.films && json.films.length) chooseFilm(json.films);
                else if (url !== url_by_title) {
                    network.clear();
                    network.timeout(15000);
                    network.silent(url_by_title, function (json) {
                        if (json.items && json.items.length) chooseFilm(json.items);
                        else if (json.films && json.films.length) chooseFilm(json.films);
                        else chooseFilm([]);
                    }, function (a, c) {
                        showError(network.errorDecode(a, c));
                    }, false, {
                        headers: params.headers
                    });
                } else chooseFilm([]);
            }, function (a, c) {
                showError(network.errorDecode(a, c));
            }, false, {
                headers: params.headers
            });
        }

        function chooseFilm(items) {
            if (items && items.length) {
                var is_sure = false;
                var is_imdb = false;
                items.forEach(function (c) {
                    var year = c.start_date || c.year || '0000';
                    c.tmp_year = parseInt((year + '').slice(0, 4));
                });
                if (card.imdb_id) {
                    var tmp = items.filter(function (elem) {
                        return (elem.imdb_id || elem.imdbId) == card.imdb_id;
                    });
                    if (tmp.length) {
                        items = tmp;
                        is_sure = true;
                        is_imdb = true;
                    }
                }
                var cards = items;
                if (cards.length) {
                    if (orig) {
                        var _tmp = cards.filter(function (elem) {
                            return containsTitle(elem.orig_title || elem.nameOriginal, orig) || containsTitle(elem.en_title || elem.nameEn, orig) || containsTitle(elem.title || elem.ru_title || elem.nameRu, orig);
                        });
                        if (_tmp.length) {
                            cards = _tmp;
                            is_sure = true;
                        }
                    }
                    if (card.title) {
                        var _tmp2 = cards.filter(function (elem) {
                            return containsTitle(elem.title || elem.ru_title || elem.nameRu, card.title) || containsTitle(elem.en_title || elem.nameEn, card.title) || containsTitle(elem.orig_title || elem.nameOriginal, card.title);
                        });
                        if (_tmp2.length) {
                            cards = _tmp2;
                            is_sure = true;
                        }
                    }
                    if (cards.length > 1 && search_year) {
                        var _tmp3 = cards.filter(function (c) {
                            return c.tmp_year == search_year;
                        });
                        if (!_tmp3.length) _tmp3 = cards.filter(function (c) {
                            return c.tmp_year && c.tmp_year > search_year - 2 && c.tmp_year < search_year + 2;
                        });
                        if (_tmp3.length) cards = _tmp3;
                    }
                }
                if (cards.length == 1 && is_sure && !is_imdb) {
                    if (search_year && cards[0].tmp_year) {
                        is_sure = cards[0].tmp_year > search_year - 2 && cards[0].tmp_year < search_year + 2;
                    }
                    if (is_sure) {
                        is_sure = false;
                        if (orig) {
                            is_sure |= equalTitle(cards[0].orig_title || cards[0].nameOriginal, orig) || equalTitle(cards[0].en_title || cards[0].nameEn, orig) || equalTitle(cards[0].title || cards[0].ru_title || cards[0].nameRu, orig);
                        }
                        if (card.title) {
                            is_sure |= equalTitle(cards[0].title || cards[0].ru_title || cards[0].nameRu, card.title) || equalTitle(cards[0].en_title || cards[0].nameEn, card.title) || equalTitle(cards[0].orig_title || cards[0].nameOriginal, card.title);
                        }
                    }
                }
                if (cards.length == 1 && is_sure) {
                    var id = cards[0].kp_id || cards[0].kinopoisk_id || cards[0].kinopoiskId || cards[0].filmId;
                    var base_search = function base_search() {
                        network.clear();
                        network.timeout(15000);
                        network.silent(params.url + 'api/v2.2/films/' + id, function (data) {
                            var movieRating = _setCache(params.id, {
                                kp: data.ratingKinopoisk,
                                imdb: data.ratingImdb,
                                timestamp: new Date().getTime()
                            });
                            return _showRating(movieRating);
                        }, function (a, c) {
                            showError(network.errorDecode(a, c));
                        }, false, {
                            headers: params.headers
                        });
                    };
                    network.clear();
                    network.timeout(5000);
                    network["native"](params.rating_url + id + '.xml', function (str) {
                        if (str.indexOf('<rating>') >= 0) {
                            try {
                                var ratingKinopoisk = 0;
                                var ratingImdb = 0;
                                var xml = $($.parseXML(str));
                                var kp_rating = xml.find('kp_rating');
                                if (kp_rating.length) {
                                    ratingKinopoisk = parseFloat(kp_rating.text());
                                }
                                var imdb_rating = xml.find('imdb_rating');
                                if (imdb_rating.length) {
                                    ratingImdb = parseFloat(imdb_rating.text());
                                }
                                var movieRating = _setCache(params.id, {
                                    kp: ratingKinopoisk,
                                    imdb: ratingImdb,
                                    timestamp: new Date().getTime()
                                });
                                return _showRating(movieRating);
                            } catch (ex) {
                            }
                        }
                        base_search();
                    }, function (a, c) {
                        base_search();
                    }, false, {
                        dataType: 'text'
                    });
                } else {
                    var movieRating = _setCache(params.id, {
                        kp: 0,
                        imdb: 0,
                        timestamp: new Date().getTime()
                    });
                    return _showRating(movieRating);
                }
            } else {
                var _movieRating = _setCache(params.id, {
                    kp: 0,
                    imdb: 0,
                    timestamp: new Date().getTime()
                });
                return _showRating(_movieRating);
            }
        }

        function cleanTitle(str) {
            return str ? str.replace(/[\s.,:;’'`!?]+/g, ' ').trim() : '';
        }

        function kpCleanTitle(str) {
            return cleanTitle(str).replace(/^[ \/\\]+/, '').replace(/[ \/\\]+$/, '').replace(/\+( *[+\/\\])+/g, '+').replace(/([+\/\\] *)+\+/g, '+').replace(/( *[\/\\]+ *)+/g, '+');
        }

        function normalizeTitle(str) {
            return cleanTitle(str.toLowerCase().replace(/[\-\u2010-\u2015\u2E3A\u2E3B\uFE58\uFE63\uFF0D]+/g, '-').replace(/ё/g, 'е'));
        }

        function equalTitle(t1, t2) {
            return typeof t1 === 'string' && typeof t2 === 'string' && normalizeTitle(t1) === normalizeTitle(t2);
        }

        function containsTitle(str, title) {
            return typeof str === 'string' && typeof title === 'string' && normalizeTitle(str).indexOf(normalizeTitle(title)) !== -1;
        }

        function showError(error) {
            Lampa.Noty.show('Рейтинг KP: ' + error);
        }

        function _getCache(movie) {
            var timestamp = new Date().getTime();
            var cache = Lampa.Storage.cache('kp_rating', 500, {});
            if (cache[movie]) {
                if ((timestamp - cache[movie].timestamp) > params.cache_time) {
                    delete cache[movie];
                    Lampa.Storage.set('kp_rating', cache);
                    return false;
                }
            } else return false;
            return cache;
        }

        function _setCache(movie, data) {
            var timestamp = new Date().getTime();
            var cache = Lampa.Storage.cache('kp_rating', 500, {});
            if (!cache[movie]) {
                cache[movie] = data;
                Lampa.Storage.set('kp_rating', cache);
            } else {
                if ((timestamp - cache[movie].timestamp) > params.cache_time) {
                    data.timestamp = timestamp;
                    cache[movie] = data;
                    Lampa.Storage.set('kp_rating', cache);
                } else data = cache[movie];
            }
            return data;
        }

        function _showRating(data) {
            console.log('Rating.js: Показ рейтинга:', JSON.stringify(data, null, 2));
            if (data) {
                var kp_rating = !isNaN(data.kp) && data.kp !== null ? parseFloat(data.kp).toFixed(1) : '0.0';
                var imdb_rating = !isNaN(data.imdb) && data.imdb !== null ? parseFloat(data.imdb).toFixed(1) : '0.0';
                var render = Lampa.Activity.active().activity.render();
                $('.wait_rating', render).remove();

                // Форматируем рейтинги
                kp_rating = kp_rating.endsWith('.0') ? kp_rating.slice(0, -2) : kp_rating;
                imdb_rating = imdb_rating.endsWith('.0') ? imdb_rating.slice(0, -2) : imdb_rating;

                // Проверяем TMDB рейтинг
                var tmdb_rating = '0.0';
                if (card && typeof card.vote_average === 'number' && !isNaN(card.vote_average)) {
                    tmdb_rating = parseFloat(card.vote_average).toFixed(1);
                } else if (card && typeof card.rating === 'number' && !isNaN(card.rating)) {
                    tmdb_rating = parseFloat(card.rating).toFixed(1);
                }
                tmdb_rating = tmdb_rating.endsWith('.0') ? tmdb_rating.slice(0, -2) : tmdb_rating;
                console.log('Rating.js: TMDB rating:', tmdb_rating);

                var rateLine = $('.full-start-new__rate-line', render);
                if (!rateLine.length) {
                    // Если контейнер отсутствует, создаём его
                    var $rightContainer = $('.full-start-new__right', render);
                    if ($rightContainer.length) {
                        rateLine = $('<div class="full-start-new__rate-line"></div>');
                        $rightContainer.append(rateLine);
                    }
                }

                // Извлекаем существующие .full-start__pg и .full-start__status, чтобы переместить их в конец
                var $pgElement = rateLine.find('.full-start__pg').detach();
                var $statusElement = rateLine.find('.full-start__status').detach();

                // Создаём элементы рейтингов
                var $tmdbRating = $('<div class="full-start__rating tmdb">TMDB ' + tmdb_rating + '</div>');
                var $kpRating = $('<div class="full-start__rating kp">KP ' + kp_rating + '</div>');
                var $imdbRating = $('<div class="full-start__rating imdb">IMDb ' + imdb_rating + '</div>');

                // Добавляем звёзды для TMDB
                var tmdbStars = Math.round(parseFloat(tmdb_rating) / 2);
                var tmdbStarsHtml = $('<div class="rating-stars"></div>');
                for (var i = 0; i < 5; i++) {
                    var starSvg = i < tmdbStars ?
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="yellow" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>' :
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>';
                    tmdbStarsHtml.append(starSvg);
                }

                // Добавляем звёзды для KP
                var kpStars = Math.round(parseFloat(kp_rating) / 2);
                var kpStarsHtml = $('<div class="rating-stars"></div>');
                for (var i = 0; i < 5; i++) {
                    var starSvg = i < kpStars ?
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="yellow" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>' :
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>';
                    kpStarsHtml.append(starSvg);
                }

                // Добавляем звёзды для IMDb
                var imdbStars = Math.round(parseFloat(imdb_rating) / 2);
                var imdbStarsHtml = $('<div class="rating-stars"></div>');
                for (var i = 0; i < 5; i++) {
                    var starSvg = i < imdbStars ?
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="yellow" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>' :
                        '<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>';
                    imdbStarsHtml.append(starSvg);
                }

                // Создаём контейнеры
                var $tmdbContainer = $('<div class="rating-container"></div>').append($tmdbRating).append(tmdbStarsHtml);
                var $kpContainer = $('<div class="rating-container"></div>').append($kpRating).append(kpStarsHtml);
                var $imdbContainer = $('<div class="rating-container"></div>').append($imdbRating).append(imdbStarsHtml);

                // Скрываем контейнеры с нулевыми рейтингами
                if (tmdb_rating === '0') $tmdbContainer.addClass('hide');
                if (kp_rating === '0') $kpContainer.addClass('hide');
                if (imdb_rating === '0') $imdbContainer.addClass('hide');

                // Добавляем рейтинги в начало контейнера в нужном порядке
                if (rateLine.find('.full-start__rating.tmdb').length === 0) {
                    rateLine.prepend($tmdbContainer);
                }
                if (rateLine.find('.full-start__rating.kp').length === 0) {
                    // Добавляем KP сразу после TMDB
                    var $tmdb = rateLine.find('.full-start__rating.tmdb').parent('.rating-container');
                    if ($tmdb.length) {
                        $tmdb.after($kpContainer);
                    } else {
                        rateLine.prepend($kpContainer);
                    }
                }
                if (rateLine.find('.full-start__rating.imdb').length === 0) {
                    // Добавляем IMDb сразу после KP
                    var $kp = rateLine.find('.full-start__rating.kp').parent('.rating-container');
                    if ($kp.length) {
                        $kp.after($imdbContainer);
                    } else {
                        var $tmdb = rateLine.find('.full-start__rating.tmdb').parent('.rating-container');
                        if ($tmdb.length) {
                            $tmdb.after($imdbContainer);
                        } else {
                            rateLine.prepend($imdbContainer);
                        }
                    }
                }

                // Перемещаем .full-start__pg и .full-start__status в конец
                if ($pgElement.length) {
                    rateLine.append($pgElement);
                } else if (!rateLine.find('.full-start__pg').length) {
                    rateLine.append('<div class="full-start__pg hide"></div>');
                }
                if ($statusElement.length) {
                    rateLine.append($statusElement);
                } else if (!rateLine.find('.full-start__status').length) {
                    rateLine.append('<div class="full-start__status hide"></div>');
                }

                rateLine.removeClass('hide');

                // Повторная попытка рендеринга через 1000 мс, если контейнер был очищен
                setTimeout(function () {
                    var rateLine = $('.full-start-new__rate-line', render);
                    // Извлекаем .full-start__pg и .full-start__status
                    var $pgElementRetry = rateLine.find('.full-start__pg').detach();
                    var $statusElementRetry = rateLine.find('.full-start__status').detach();

                    if (rateLine.find('.full-start__rating.kp').length === 0) {
                        console.log('Rating.js: Контейнер рейтингов очищен, повторное добавление KP');
                        var $tmdb = rateLine.find('.full-start__rating.tmdb').parent('.rating-container');
                        if ($tmdb.length) {
                            $tmdb.after($kpContainer);
                        } else {
                            rateLine.prepend($kpContainer);
                        }
                    }
                    if (rateLine.find('.full-start__rating.imdb').length === 0) {
                        console.log('Rating.js: Контейнер рейтингов очищен, повторное добавление IMDb');
                        var $kp = rateLine.find('.full-start__rating.kp').parent('.rating-container');
                        if ($kp.length) {
                            $kp.after($imdbContainer);
                        } else {
                            var $tmdb = rateLine.find('.full-start__rating.tmdb').parent('.rating-container');
                            if ($tmdb.length) {
                                $tmdb.after($imdbContainer);
                            } else {
                                rateLine.prepend($imdbContainer);
                            }
                        }
                    }

                    // Перемещаем .full-start__pg и .full-start__status в конец
                    if ($pgElementRetry.length) {
                        rateLine.append($pgElementRetry);
                    } else if (!rateLine.find('.full-start__pg').length) {
                        rateLine.append('<div class="full-start__pg hide"></div>');
                    }
                    if ($statusElementRetry.length) {
                        rateLine.append($statusElementRetry);
                    } else if (!rateLine.find('.full-start__status').length) {
                        rateLine.append('<div class="full-start__status hide"></div>');
                    }

                    rateLine.removeClass('hide');
                }, 1000);
            }
        }
    }

    function startPlugin() {
        window.rating_plugin = true;
        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                console.log('Rating.js: Событие complete, данные:', JSON.stringify(e.data, null, 2));
                var render = e.object.activity.render();
                if (!render.find('.wait_rating').length) {
                    $('.full-start-new__body', render).prepend(
                        '<div style="position: absolute; top: 10px; right: 10px; width:2em; margin-top:1em; margin-right:1em; z-index: 2000;" class="wait_rating">' +
                        '<div class="broadcast__scan"><div></div></div><div>'
                    );
                    setTimeout(function () {
                        rating_kp_imdb(e.data.movie);
                    }, 200); // Задержка 200 мс
                }
            }
        });
    }

    if (!window.rating_plugin) startPlugin();
})();
