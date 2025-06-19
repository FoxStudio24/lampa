(function () {
	'use strict';

	// Кеш обработанных фильмов для предотвращения дублирования
	var processedMovies = new Set();
	var ratingCache = new Map();

	function rating_kp_imdb(card) {
		if (!card || !card.id) {
			console.log('No valid card data, skipping rating fetch.');
			return;
		}

		// Проверяем, не обрабатывали ли уже этот фильм
		var movieKey = card.id + '_' + (card.media_type || 'movie');
		if (processedMovies.has(movieKey)) {
			console.log('Movie already processed:', movieKey);
			return;
		}

		processedMovies.add(movieKey);

		var network = new Lampa.Reguest();
		var clean_title = card && card.title ? kpCleanTitle(card.title) : '';
		var search_date = card && (card.release_date || card.first_air_date || card.last_air_date) || '0000';
		var search_year = parseInt((search_date + '').slice(0, 4));
		var orig = card && (card.original_title || card.original_name) || '';
		var kp_prox = '';
		var params = {
			id: card.id,
			url: kp_prox + 'https://kinopoiskapiunofficial.tech/',
			rating_url: kp_prox + 'https://rating.kinopoisk.ru/',
			headers: {
				'X-API-KEY': '2a4a0808-81a3-40ae-b0d3-e11335ede616'
			},
			cache_time: 60 * 60 * 24 * 1000 // 1 day
		};

		console.log('Processing card:', card);
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
			return str ? str.replace(/[\s.,:;''`!?]+/g, ' ').trim() : '';
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
			if (data) {
				var kp_rating = !isNaN(data.kp) && data.kp !== null ? parseFloat(data.kp).toFixed(1) : '0.0';
				var imdb_rating = !isNaN(data.imdb) && data.imdb !== null ? parseFloat(data.imdb).toFixed(1) : '0.0';
				
				// Ищем контейнер более гибко
				var render = findRenderContainer();
				if (!render) {
					console.log('Render container not found');
					return;
				}

				$('.wait_rating', render).remove();

				// Format ratings without /10, remove .0 for whole numbers
				kp_rating = kp_rating.endsWith('.0') ? kp_rating.slice(0, -2) : kp_rating;
				imdb_rating = imdb_rating.endsWith('.0') ? imdb_rating.slice(0, -2) : imdb_rating;

				// Attempt to get TMDB rating from card
				var tmdb_rating = '0.0';
				if (card && typeof card.vote_average === 'number' && !isNaN(card.vote_average)) {
					tmdb_rating = parseFloat(card.vote_average).toFixed(1);
				} else if (card && typeof card.rating === 'number' && !isNaN(card.rating)) {
					tmdb_rating = parseFloat(card.rating).toFixed(1);
				}
				tmdb_rating = tmdb_rating.endsWith('.0') ? tmdb_rating.slice(0, -2) : tmdb_rating;
				console.log('TMDB rating attempt - vote_average:', card.vote_average, 'rating:', card.rating, 'Final TMDB:', tmdb_rating);

				// Create rating elements for TMDB, KP, and IMDb
				var $tmdbRating = $('<div class="full-start__rating">TMDB ' + tmdb_rating + '</div>');
				var $kpRating = $('<div class="full-start__rating">KP ' + kp_rating + '</div>');
				var $imdbRating = $('<div class="full-start__rating">IMDb ' + imdb_rating + '</div>');

				// Create rating stars function
				function createStars(rating) {
					var stars = Math.round(parseFloat(rating) / 2); // 5-point scale
					var starsHtml = $('<div class="rating-stars"></div>');
					for (var i = 0; i < 5; i++) {
						var starSvg = i < stars ?
							'<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="yellow" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>' :
							'<svg class="rating-star" width="16" height="16" viewBox="0 0 16 16" fill="gray" xmlns="http://www.w3.org/2000/svg"><path d="M8 0L10.472 5.648L16 6.128L12 10.352L13.416 16L8 13.648L2.584 16L4 10.352L0 6.128L5.528 5.648L8 0Z"/></svg>';
						starsHtml.append(starSvg);
					}
					return starsHtml;
				}

				// Create containers for ratings
				var $tmdbContainer = $('<div class="rating-container"></div>').append($tmdbRating).append(createStars(tmdb_rating));
				var $kpContainer = $('<div class="rating-container"></div>').append($kpRating).append(createStars(kp_rating));
				var $imdbContainer = $('<div class="rating-container"></div>').append($imdbRating).append(createStars(imdb_rating));

				// Hide containers with zero ratings
				if (tmdb_rating === '0') $tmdbContainer.addClass('hide');
				if (kp_rating === '0') $kpContainer.addClass('hide');
				if (imdb_rating === '0') $imdbContainer.addClass('hide');

				// Insert ratings into page
				insertRatings(render, $tmdbContainer, $kpContainer, $imdbContainer);
			}
		}
	}

	// Улучшенная функция поиска контейнера
	function findRenderContainer() {
		// Пробуем несколько вариантов получения активного контейнера
		try {
			var activity = Lampa.Activity.active();
			if (activity && activity.activity && activity.activity.render) {
				return activity.activity.render();
			}
		} catch (e) {
			console.log('Error getting activity render:', e);
		}

		// Fallback - ищем в DOM
		var containers = [
			'.full-start-new__body',
			'.full-start__body',
			'.activity__body',
			'body'
		];

		for (var i = 0; i < containers.length; i++) {
			var container = $(containers[i]).first();
			if (container.length) {
				return container;
			}
		}

		return null;
	}

	// Универсальная функция вставки рейтингов
	function insertRatings(render, $tmdbContainer, $kpContainer, $imdbContainer) {
		// Убираем старые рейтинги
		$('.rating-container', render).remove();

		// Ищем существующую линию рейтинга
		var $rateLine = $('.full-start-new__rate-line', render);
		if ($rateLine.length) {
			$rateLine.prepend($imdbContainer).prepend($kpContainer).prepend($tmdbContainer);
			$rateLine.removeClass('hide');
		} else {
			// Ищем правый контейнер
			var $rightContainer = $('.full-start-new__right', render);
			if ($rightContainer.length) {
				$rightContainer.append(
					$('<div class="full-start-new__rate-line"></div>')
						.append($tmdbContainer)
						.append($kpContainer)
						.append($imdbContainer)
						.append('<div class="full-start__pg hide"></div>')
						.append('<div class="full-start__status hide"></div>')
						.removeClass('hide')
				);
			} else {
				// Fallback - добавляем в основной контейнер
				var $body = $('.full-start-new__body, .full-start__body', render);
				if ($body.length) {
					$body.prepend(
						$('<div class="rating-line-fallback" style="margin-bottom: 15px;"></div>')
							.append($tmdbContainer)
							.append($kpContainer)
							.append($imdbContainer)
					);
				}
			}
		}
	}

	// Debounce utility to prevent multiple rating requests
	function debounce(func, wait) {
		var timeout;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timeout);
			timeout = setTimeout(function () {
				func.apply(context, args);
			}, wait);
		};
	}

	// Улучшенная функция получения данных фильма
	function getMovieData() {
		var movieData = null;

		// Способ 1: Из активной активности
		try {
			var activity = Lampa.Activity.active();
			if (activity && activity.activity) {
				if (activity.activity.data && activity.activity.data.movie) {
					movieData = activity.activity.data.movie;
				} else if (activity.activity.movie) {
					movieData = activity.activity.movie;
				}
			}
		} catch (e) {
			console.log('Error getting movie data from activity:', e);
		}

		// Способ 2: Из URL параметров
		if (!movieData) {
			try {
				var urlParams = new URLSearchParams(window.location.search);
				var cardId = urlParams.get('card');
				if (cardId) {
					movieData = getCachedMovieData(cardId);
				}
			} catch (e) {
				console.log('Error parsing URL params:', e);
			}
		}

		// Способ 3: Из глобального состояния Lampa
		if (!movieData && window.Lampa && Lampa.Storage) {
			try {
				var lastMovie = Lampa.Storage.get('last_movie_data');
				if (lastMovie && lastMovie.id) {
					movieData = lastMovie;
				}
			} catch (e) {
				console.log('Error getting cached movie data:', e);
			}
		}

		return movieData;
	}

	// Функция получения кешированных данных фильма
	function getCachedMovieData(cardId) {
		// Здесь можно реализовать логику получения данных из кеша Lampa
		// Пока возвращаем null
		return null;
	}

	// Наблюдатель за изменениями в DOM
	function setupDOMObserver() {
		var observer = new MutationObserver(function(mutations) {
			var shouldProcess = false;
			
			mutations.forEach(function(mutation) {
				if (mutation.addedNodes.length) {
					for (var i = 0; i < mutation.addedNodes.length; i++) {
						var node = mutation.addedNodes[i];
						if (node.nodeType === 1) { // Element node
							if (node.classList && (
								node.classList.contains('full-start-new__right') ||
								node.classList.contains('full-start__body') ||
								node.querySelector && node.querySelector('.full-start-new__right')
							)) {
								shouldProcess = true;
								break;
							}
						}
					}
				}
			});

			if (shouldProcess) {
				setTimeout(function() {
					var movieData = getMovieData();
					if (movieData && !document.querySelector('.rating-container')) {
						console.log('DOM change detected, processing ratings...');
						rating_kp_imdb(movieData);
					}
				}, 100);
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});

		return observer;
	}

	// Retry mechanism for fetching movie data
	function startRatingWithRetry(maxRetries, interval) {
		var retries = 0;
		function tryFetchRating() {
			var movieData = getMovieData();
			if (movieData) {
				console.log('Movie data found, fetching ratings...');
				rating_kp_imdb(movieData);
			} else if (retries < maxRetries) {
				retries++;
				console.log('Retrying to fetch movie data... Attempt:', retries);
				setTimeout(tryFetchRating, interval);
			} else {
				console.log('Max retries reached. No movie data found.');
			}
		}
		tryFetchRating();
	}

	function startPlugin() {
		if (window.rating_plugin) return;
		window.rating_plugin = true;

		console.log('Rating plugin starting...');

		// Debounced rating function
		var debouncedRating = debounce(function (movieData) {
			if (movieData && movieData.id) {
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

		// Обработка событий активности
		if (Lampa.Activity && Lampa.Activity.listener) {
			Lampa.Activity.listener.follow('activity', function(e) {
				console.log('Activity event:', e.type, e.object ? e.object.component : 'no component');
				
				if (e.type === 'start' && e.object && e.object.component === 'full') {
					setTimeout(function() {
						var movieData = getMovieData();
						if (movieData) {
							console.log('Activity start - movie data found');
							debouncedRating(movieData);
						}
					}, 500);
				}
			});
		}

		// Listen to 'full' event for movie pages
		if (Lampa.Listener) {
			Lampa.Listener.follow('full', function (e) {
				console.log('Full event:', e.type, e.data ? 'has data' : 'no data');
				if (e.type === 'complite' && e.data && e.data.movie) {
					debouncedRating(e.data.movie);
				}
			});

			// Listen to 'app' event for main page and other scenarios
			Lampa.Listener.follow('app', function (e) {
				console.log('App event:', e.type);
				if (e.type === 'ready') {
					// Start with retry mechanism
					startRatingWithRetry(5, 2000); // Retry 5 times, every 2 seconds
				}
			});
		}

		// Настройка наблюдателя DOM
		setupDOMObserver();

		// Попытка обработать текущую страницу
		setTimeout(function() {
			var movieData = getMovieData();
			if (movieData) {
				console.log('Initial movie data found');
				debouncedRating(movieData);
			}
		}, 1000);

		console.log('Rating plugin initialized');
	}

	// Запуск плагина
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startPlugin);
	} else {
		startPlugin();
	}
})();
