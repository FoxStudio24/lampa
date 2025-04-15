(function(){
    console.log('RuTube Plugin: Starting initialization...');

    // Проверяем наличие jQuery
    if (typeof $ === 'undefined') {
        console.error('RuTube Plugin: jQuery is not defined');
        return;
    }

    // Проверяем наличие Lampa и его модулей
    if (typeof Lampa === 'undefined') {
        console.error('RuTube Plugin: Lampa is not defined');
        return;
    }
    if (!Lampa.Subscribe) {
        console.error('RuTube Plugin: Lampa.Subscribe is not defined');
        return;
    }
    if (!Lampa.Platform) {
        console.error('RuTube Plugin: Lampa.Platform is not defined');
        return;
    }
    if (!Lampa.Lang) {
        console.error('RuTube Plugin: Lampa.Lang is not defined');
        return;
    }
    if (!Lampa.Listener) {
        console.error('RuTube Plugin: Lampa.Listener is not defined');
        return;
    }
    if (!Lampa.Player) {
        console.error('RuTube Plugin: Lampa.Player is not defined');
        return;
    }
    if (!Lampa.Storage) {
        console.error('RuTube Plugin: Lampa.Storage is not defined');
        return;
    }
    if (!Lampa.Reguest) {
        console.error('RuTube Plugin: Lampa.Reguest is not defined');
        return;
    }

    var Subscribe = Lampa.Subscribe;
    var Platform = Lampa.Platform;
    var Lang = Lampa.Lang;
    var TAG = 'RuTube';

    console.log('RuTube Plugin: Dependencies loaded successfully');

    // Упрощённая версия без плеера, только для проверки кнопки
    (function () {
        'use strict';

        console.log('RuTube Plugin: Entering main function');

        var proxy = Lampa.Storage.get('rutube_search_proxy', '');
        console.log('RuTube Plugin: Proxy set to', proxy);

        function cleanString(str) {
            return str.replace(/[^a-zA-Z\dа-яА-ЯёЁ]+/g, ' ').trim().toLowerCase();
        }

        function cacheRequest(movie, isTv, success, fail) {
            console.log('RuTube Plugin: cacheRequest called with movie:', movie, 'isTv:', isTv);
            try {
                var year = (movie.release_date || movie.first_air_date || '').toString()
                    .replace(/\D+/g, '')
                    .substring(0,4)
                    .replace(/^([03-9]\d|1[0-8]|2[1-9]|20[3-9])\d+$/, '');
                var search = movie.title || movie.name || movie.original_title || movie.original_name || '';
                var searchOrig = movie.original_title || movie.original_name || '';
                var query = cleanString([search, year, isTv ? 'сезон 1' : 'фильм'].join(' '));
                var url = proxy + 'https://rutube.ru/api/search/video/' +
                    '?query=' + encodeURIComponent(query) +
                    '&format=json';
                var id = (isTv ? 'tv' : '') + (movie.id || (Lampa.Utils.hash(search)*1).toString(36));
                var key = 'RUTUBE_movie_' + id;
                console.log('RuTube Plugin: Cache key:', key, 'URL:', url);

                var data = sessionStorage.getItem(key);
                if (data) {
                    data = JSON.parse(data);
                    console.log('RuTube Plugin: Cache hit:', data);
                    if (data[0]) {
                        typeof success === 'function' && success.apply(this, [data[1]]);
                    } else {
                        typeof fail === 'function' && fail.apply(this, [data[1]]);
                    }
                } else {
                    console.log('RuTube Plugin: Making network request to', url);
                    var network = new Lampa.Reguest();
                    network.native(
                        url,
                        function (data) {
                            console.log('RuTube Plugin: Network response:', data);
                            var results = [];
                            if (data && data.results && data.results[0]) {
                                var queryWord = query.split(' ');
                                var cleanSearch = cleanString(search);
                                if (searchOrig && search !== searchOrig)
                                    queryWord.push.apply(queryWord, cleanString(searchOrig).split(' '));
                                queryWord.push(isTv ? 'сериал' : 'фильм', 'полный', '1080p', '4k');
                                var getRate = function(r){
                                    if (r._rate === -1) {
                                        r._rate = 0;
                                        var si = r._title.indexOf(cleanSearch);
                                        var rw = r._title.split(' ');
                                        if (si >= 0) {
                                            r._rate += 300;
                                            if (year) {
                                                var ow = r._title.substring(si + cleanSearch.length).trim().split(' ');
                                                if (ow.length && ow[0] !== year && /^(\d+|[ivx]+)$/.test(ow[0])) r._rate = -1000;
                                                ow = rw.filter(function(w){return w.length === 4 && /^([03-9]\d|1[0-8]|2[1-9]|20[3-9])\d+$/.test(w);});
                                                if (ow.indexOf(year) >= 0) r._rate += 100;
                                                else for (si in ow) if (cleanSearch.indexOf(ow[si]) < 0) r._rate = -1000;
                                            }
                                        } else {
                                            r._rate = -2000;
                                        }
                                        var rf = rw.filter(function(w){return queryWord.indexOf(w) >= 0});
                                        var wordDiff = rw.length - rf.length;
                                        r._rate += rf.length * 100;
                                        r._rate -= wordDiff * 200;
                                        r._rate += r.duration > 3600 ? 200 : -200;
                                    }
                                    return r._rate;
                                };
                                results = data.results.filter(function(r){
                                    r._title = cleanString(r.title);
                                    r._rate = -1;
                                    var isMovie = r._title.indexOf('фильм') >= 0 || r._title.indexOf('сериал') >= 0 || r.duration > 3600;
                                    var durationOk = r.duration && r.duration > 1800;
                                    return r.embed_url && isMovie && durationOk
                                        && !r.is_hidden && !r.is_deleted && !r.is_locked && !r.is_audio && !r.is_paid && !r.is_livestream && !r.is_adult
                                        && getRate(r) > 400;
                                }).sort(function(a,b){
                                    return getRate(b) - getRate(a);
                                });
                            }
                            if (results.length) {
                                sessionStorage.setItem(key, JSON.stringify([true, results, search]));
                                console.log('RuTube Plugin: Results found:', results);
                                typeof success === 'function' && success.apply(this, [results]);
                            } else {
                                sessionStorage.setItem(key, JSON.stringify([false, {}, search]));
                                console.log('RuTube Plugin: No results found');
                                typeof fail === 'function' && fail.apply(this, [{}]);
                            }
                            network.clear();
                            network = null;
                        },
                        function (data) {
                            console.log('RuTube Plugin: Network error:', data);
                            if (!proxy && !window.AndroidJS && data && 'status' in data && 'readyState' in data && data.status === 0 && data.readyState === 0) {
                                proxy = Lampa.Storage.get('rutube_search_proxy', '') || 'https://rutube-search.root-1a7.workers.dev/';
                                if (proxy.substr(-1) !== '/') proxy += '/';
                                cacheRequest(movie, isTv, success, fail);
                            } else {
                                sessionStorage.setItem(key, JSON.stringify([false, data, search]));
                                typeof fail === 'function' && fail.apply(this, [data]);
                            }
                            network.clear();
                            network = null;
                        }
                    );
                }
            } catch (e) {
                console.error('RuTube Plugin: cacheRequest failed:', e);
                typeof fail === 'function' && fail.apply(this, [{}]);
            }
        }

        function loadMovies(event, success) {
            console.log('RuTube Plugin: loadMovies called with event:', event);
            try {
                if (!event.object || !event.object.source || !event.data || !event.data.movie) {
                    console.error('RuTube Plugin: Invalid event structure');
                    return;
                }
                var movie = event.data.movie;
                var isTv = event.object && event.object.method && event.object.method === 'tv';
                var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
                if (title === '') {
                    console.error('RuTube Plugin: Movie title is empty');
                    return;
                }
                var searchOk = function (data) {
                    console.log('RuTube Plugin: searchOk called with data:', data);
                    if (data[0]) success(data);
                };
                cacheRequest(movie, isTv, searchOk);
            } catch (e) {
                console.error('RuTube Plugin: loadMovies failed:', e);
            }
        }

        Lampa.Lang.add({
            rutube_movie_play: {
                be: 'Гуляць',
                bg: 'Играй',
                cs: 'Přehrát',
                en: 'Play',
                he: 'נגן',
                pt: 'Reproduzir',
                ru: 'Играть',
                uk: 'Грати',
                zh: '播放'
            },
            rutube_movie_rutube: {
                ru: 'Найдено на RUTUBE',
            }
        });

        function startPlugin() {
            console.log('RuTube Plugin: startPlugin called');
            window.rutube_movie_plugin = true;
            var button = '<div class="full-start__button selector view--rutube_movie hide" data-subtitle="#{rutube_movie_rutube}">' +
                '<svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M52 44L90 66L52 88V44Z" fill="currentColor"/><rect x="1" y="1" width="130" height="130" stroke="currentColor" stroke-width="2"/></svg>' +
                '<span>#{rutube_movie_play}</span>' +
                '</div>';
            Lampa.Listener.follow('full', function (event) {
                console.log('RuTube Plugin: Lampa.Listener.follow triggered with event type:', event.type);
                try {
                    if (event.type === 'complite') {
                        var render = event.object.activity.render();
                        console.log('RuTube Plugin: Render object:', render);
                        var btn = $(Lampa.Lang.translate(button));
                        console.log('RuTube Plugin: Button created:', btn);
                        render.find('.full-start__button:last').after(btn);
                        console.log('RuTube Plugin: Button added to DOM');
                        loadMovies(event, function(data){
                            console.log('RuTube Plugin: loadMovies success callback with data:', data);
                            var playlist = [];
                            data.forEach(function (res) {
                                playlist.push({
                                    title: res.title,
                                    url: res.video_url || res.embed_url,
                                    iptv: true
                                });
                            });
                            console.log('RuTube Plugin: Playlist created:', playlist);
                            btn.on('hover:enter', function () {
                                console.log('RuTube Plugin: Button hover:enter triggered');
                                Lampa.Player.play(playlist[0]);
                                Lampa.Player.playlist(playlist);
                            }).removeClass('hide');
                            console.log('RuTube Plugin: Button made visible');
                        });
                    }
                } catch (e) {
                    console.error('RuTube Plugin: Lampa.Listener.follow failed:', e);
                }
            });
        }

        if (!window.rutube_movie_plugin) {
            console.log('RuTube Plugin: Initializing plugin');
            startPlugin();
        }
    })();
})();