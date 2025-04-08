(function() {
    'use strict';

    var Defined = {
        api_url: 'https://portal.lumex.host/api/',
        api_token: 'c9368010a6ff29b02795712d3dd8fdab' // Проверьте, действителен ли этот токен
    };

    var unic_id = Lampa.Storage.get('kinoplus_unic_id', '');
    if (!unic_id) {
        unic_id = Lampa.Utils.uid(8).toLowerCase();
        Lampa.Storage.set('kinoplus_unic_id', unic_id);
    }

    function component(object) {
        var network = new Lampa.Reguest();
        var scroll = new Lampa.Scroll({
            mask: true,
            over: true
        });
        var files = new Lampa.Explorer(object);
        var filter = new Lampa.Filter(object);
        var sources = {
            'lumex': {
                name: 'Lumex',
                show: true
            }
        };
        var last;
        var balanser = 'lumex';
        var initialized;
        var filter_sources = ['lumex'];
        var filter_translate = {
            quality: 'Качество',
            translation: 'Перевод',
            season: 'Сезон',
            episode: 'Эпизод'
        };
        var filter_find = {
            quality: [],
            translation: [],
            season: [],
            episode: []
        };
        var contentData = null;

        function account(url) {
            var uid = Lampa.Storage.get('kinoplus_unic_id', '');
            if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
            return url;
        }

        this.create = function() {
            var _this = this;
            this.loading(true);
            filter.onBack = function() {
                _this.start();
            };
            filter.onSelect = function(type, a, b) {
                if (type == 'filter') {
                    var choice = _this.getChoice();
                    if (a.stype == 'translation') {
                        choice.translation = b.index;
                        choice.translation_id = filter_find.translation[b.index].id;
                    } else if (a.stype == 'season') {
                        choice.season = b.index;
                        choice.season_num = filter_find.season[b.index].num;
                        choice.episode = 0;
                        _this.loadEpisodes(choice.season_num);
                    } else if (a.stype == 'episode') {
                        choice.episode = b.index;
                        choice.episode_num = filter_find.episode[b.index].num;
                    }
                    _this.saveChoice(choice);
                    _this.reset();
                    _this.displayContent();
                }
            };
            scroll.body().addClass('torrent-list');
            files.appendFiles(scroll.render());
            files.appendHead(filter.render());
            scroll.minus(files.render().find('.explorer__files-head'));
            scroll.body().append(Lampa.Template.get('kinoplus_content_loading'));
            Lampa.Controller.enable('content');
            this.loading(false);
            this.search();
        };

        this.search = function() {
            var _this = this;
            this.reset();
            var kinopoisk_id = object.movie.kinopoisk_id || object.movie.id;
            var title = object.movie.title || object.movie.name;
            var year = (object.movie.release_date || object.movie.first_air_date || '0000').slice(0, 4);

            console.log('Параметры поиска:', { kinopoisk_id, title, year, number_of_seasons: object.movie.number_of_seasons });

            var url = Defined.api_url + 'short?api_token=' + Defined.api_token;
            if (kinopoisk_id) {
                url += '&kinopoisk_id=' + encodeURIComponent(kinopoisk_id);
            } else {
                url += '&title=' + encodeURIComponent(title);
            }

            console.log('Запрос к API (short):', url);

            network.timeout(10000);
            network.silent(account(url), function(json) {
                console.log('Ответ от API (short):', JSON.stringify(json, null, 2));
                if (json.result && json.data && json.data.length > 0) {
                    contentData = json.data[0];
                    _this.parse(json);
                } else {
                    _this.empty('Контент не найден по kinopoisk_id или названию');
                }
            }, function(error) {
                console.error('Ошибка при запросе (short):', error);
                _this.empty('Ошибка при запросе к API: ' + (error.statusText || 'Неизвестная ошибка'));
            }, false, { dataType: 'json' });
        };

        this.loadEpisodes = function(seasonNum) {
            var _this = this;
            if (!contentData || !contentData.id || (contentData.content_type !== 'tv_series' && contentData.type !== 'serial')) return;

            var url = Defined.api_url + 'tv-series/' + contentData.id + '/episodes?api_token=' + Defined.api_token +
                      '&season_num=' + seasonNum;

            console.log('Запрос эпизодов:', url);

            network.timeout(10000);
            network.silent(account(url), function(json) {
                console.log('Ответ с эпизодами:', JSON.stringify(json, null, 2));
                if (json.result && json.data) {
                    filter_find.episode = json.data.map(function(e) {
                        return {
                            title: e.ru_title || 'Эпизод ' + e.num,
                            num: e.num,
                            media: e.media || []
                        };
                    });
                    var choice = _this.getChoice();
                    choice.episode = 0;
                    choice.episode_num = filter_find.episode[0] ? filter_find.episode[0].num : 1;
                    _this.saveChoice(choice);
                    _this.displayContent();
                } else {
                    _this.empty('Эпизоды не найдены');
                }
            }, function(error) {
                console.error('Ошибка при загрузке эпизодов:', error);
                _this.empty('Ошибка при загрузке эпизодов');
            }, false, { dataType: 'json' });
        };

        this.parse = function(json) {
            var _this = this;
            var content = json.data[0];
            if (!content) return this.empty('Контент не найден в данных');

            console.log('Обработка контента:', JSON.stringify(content, null, 2));

            filter_find.translation = (content.translations || []).map(function(t) {
                return {
                    title: t.short_title || t.title || 'Неизвестный перевод',
                    id: t.id,
                    iframe_src: t.iframe_src
                };
            });

            var videos = [];
            if (content.content_type === 'movie' || content.type === 'movie') {
                if (content.media && content.media.length > 0) {
                    content.media.forEach(function(media) {
                        if (media.qualities && media.qualities.length > 0) {
                            media.qualities.forEach(function(q) {
                                videos.push({
                                    title: content.ru_title || content.title || 'Без названия',
                                    url: q.url,
                                    quality: q.resolution + 'p',
                                    translation: media.translation.short_title || media.translation.title || 'Неизвестный перевод',
                                    translation_id: media.translation.id,
                                    method: 'play'
                                });
                            });
                        } else {
                            console.log('Качества не найдены для медиа:', media);
                        }
                    });
                } else {
                    console.log('Медиа не найдены для фильма:', content);
                }
            } else if (content.content_type === 'tv_series' || content.type === 'serial') {
                filter_find.season = Array.from({ length: content.season_count || content.seasons_count || 1 }, (_, i) => ({
                    title: 'Сезон ' + (i + 1),
                    num: i + 1
                }));

                var choice = this.getChoice();
                var selectedSeason = choice.season_num || 1;

                if (content.episodes && content.episodes.length > 0) {
                    filter_find.episode = content.episodes
                        .filter(function(e) { return parseInt(e.season_num) === selectedSeason; })
                        .map(function(e) {
                            return {
                                title: e.ru_title || 'Эпизод ' + e.num,
                                num: e.num,
                                media: e.media || []
                            };
                        });
                } else {
                    this.loadEpisodes(selectedSeason);
                    return;
                }

                var selectedEpisode = choice.episode_num || (filter_find.episode[0] ? filter_find.episode[0].num : 1);
                var episode = filter_find.episode.find(function(e) {
                    return e.num === selectedEpisode;
                });

                if (episode && episode.media && episode.media.length > 0) {
                    episode.media.forEach(function(media) {
                        videos.push({
                            title: episode.ru_title || 'Эпизод ' + episode.num,
                            url: media.translation.iframe_src,
                            quality: media.max_quality + 'p',
                            translation: media.translation.short_title || media.translation.title || 'Неизвестный перевод',
                            translation_id: media.translation.id,
                            method: 'play',
                            season: selectedSeason,
                            episode: selectedEpisode
                        });
                    });
                } else {
                    console.log('Медиа не найдены для эпизода:', episode);
                }
            }

            if (videos.length === 0) {
                console.log('Видео не найдены:', videos);
                return this.empty('Видео не найдены для данного контента');
            }

            videos.sort(function(a, b) {
                var qA = parseInt(a.quality) || 0;
                var qB = parseInt(b.quality) || 0;
                return qB - qA;
            });

            this.display(videos);
        };

        this.display = function(videos) {
            var _this = this;
            var choice = this.getChoice();

            this.draw(videos, {
                onEnter: function(item, html) {
                    var play = {
                        title: item.title,
                        url: item.url,
                        quality: item.quality,
                        translation: item.translation
                    };
                    if (item.season && item.episode) {
                        play.season = item.season;
                        play.episode = item.episode;
                    }
                    Lampa.Player.play(play);
                    Lampa.Player.playlist([play]);
                }
            });

            var select = [];
            if (filter_find.translation.length > 0) {
                select.push({
                    title: filter_translate.translation,
                    subtitle: filter_find.translation[choice.translation || 0].title,
                    items: filter_find.translation.map(function(t, i) {
                        return {
                            title: t.title,
                            selected: (choice.translation || 0) === i,
                            index: i
                        };
                    }),
                    stype: 'translation'
                });
            }
            if (filter_find.season.length > 0) {
                select.push({
                    title: filter_translate.season,
                    subtitle: filter_find.season[choice.season || 0].title,
                    items: filter_find.season.map(function(s, i) {
                        return {
                            title: s.title,
                            selected: (choice.season || 0) === i,
                            index: i
                        };
                    }),
                    stype: 'season'
                });
            }
            if (filter_find.episode.length > 0) {
                select.push({
                    title: filter_translate.episode,
                    subtitle: filter_find.episode[choice.episode || 0].title,
                    items: filter_find.episode.map(function(e, i) {
                        return {
                            title: e.title,
                            selected: (choice.episode || 0) === i,
                            index: i
                        };
                    }),
                    stype: 'episode'
                });
            }

            filter.set('filter', select);
            filter.set('sort', filter_sources.map(function(e) {
                return {
                    title: sources[e].name,
                    source: e,
                    selected: e == balanser
                };
            }));
        };

        this.displayContent = function() {
            if (contentData) {
                this.parse({ result: true, data: [contentData] });
            } else {
                this.search();
            }
        };

        this.draw = function(items) {
            var _this = this;
            scroll.clear();
            items.forEach(function(element) {
                var html = Lampa.Template.get('kinoplus_video_item', {
                    title: element.title,
                    quality: element.quality,
                    translation: element.translation,
                    season: element.season ? 'Сезон ' + element.season : '',
                    episode: element.episode ? 'Эпизод ' + element.episode : ''
                });
                html.on('hover:enter', function() {
                    var play = {
                        title: element.title,
                        url: element.url,
                        quality: element.quality,
                        translation: element.translation
                    };
                    if (element.season && element.episode) {
                        play.season = element.season;
                        play.episode = element.episode;
                    }
                    Lampa.Player.play(play);
                    Lampa.Player.playlist([play]);
                }).on('hover:focus', function(e) {
                    last = e.target;
                    scroll.update($(e.target), true);
                });
                scroll.append(html);
            });
            Lampa.Controller.enable('content');
        };

        this.getChoice = function() {
            var data = Lampa.Storage.cache('kinoplus_choice', 3000, {});
            var save = data[object.movie.id] || {};
            Lampa.Arrays.extend(save, {
                translation: 0,
                translation_id: 0,
                season: 0,
                season_num: 1,
                episode: 0,
                episode_num: 1
            });
            return save;
        };

        this.saveChoice = function(choice) {
            var data = Lampa.Storage.cache('kinoplus_choice', 3000, {});
            data[object.movie.id] = choice;
            Lampa.Storage.set('kinoplus_choice', data);
        };

        this.reset = function() {
            scroll.clear();
            scroll.body().append(Lampa.Template.get('kinoplus_content_loading'));
        };

        this.loading = function(status) {
            if (status) this.activity.loader(true);
            else {
                this.activity.loader(false);
                this.activity.toggle();
            }
        };

        this.empty = function(message) {
            scroll.clear();
            scroll.append(Lampa.Template.get('kinoplus_empty', { message: message || '#{kinoplus_no_content}' }));
            this.loading(false);
        };

        this.doesNotAnswer = function() {
            this.empty('Сервер не отвечает');
        };

        this.start = function() {
            if (!initialized) {
                initialized = true;
                this.create();
            }
            Lampa.Background.immediately(Lampa.Utils.cardImgBackgroundBlur(object.movie));
            Lampa.Controller.add('content', {
                toggle: function() {
                    Lampa.Controller.collectionSet(scroll.render(), files.render());
                    Lampa.Controller.collectionFocus(last || false, scroll.render());
                },
                up: function() {
                    Navigator.move('up');
                },
                down: function() {
                    Navigator.move('down');
                },
                right: function() {
                    filter.show('Фильтр', 'filter');
                },
                left: function() {
                    Lampa.Controller.toggle('menu');
                },
                back: this.back.bind(this)
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function() {
            // Пустая реализация метода pause
        };

        this.stop = function() {
            // Пустая реализация метода stop
        };

        this.render = function() {
            return files.render();
        };

        this.back = function() {
            Lampa.Activity.backward();
        };

        this.destroy = function() {
            network.clear();
            files.destroy();
            scroll.destroy();
        };
    }

    function startPlugin() {
        window.kinoplus_plugin = true;
        var manifest = {
            type: 'video',
            version: '1.0.5',
            name: 'Кино+',
            description: 'Плагин для просмотра видео из Lumex',
            component: 'kinoplus'
        };
        Lampa.Manifest.plugins = manifest;
        Lampa.Lang.add({
            kinoplus_title: {
                ru: 'Кино+',
                en: 'Kino+'
            },
            kinoplus_no_content: {
                ru: 'Контент не найден',
                en: 'Content not found'
            }
        });

        Lampa.Template.add('kinoplus_css', `
            <style>
            .kinoplus-item { padding: 1em; background: rgba(0,0,0,0.3); margin-bottom: 1em; border-radius: 0.3em; }
            .kinoplus-item__title { font-size: 1.5em; }
            .kinoplus-item__quality, .kinoplus-item__translation, .kinoplus-item__season, .kinoplus-item__episode { color: #aaa; }
            </style>
        `);
        $('body').append(Lampa.Template.get('kinoplus_css', {}, true));

        Lampa.Template.add('kinoplus_video_item', `
            <div class="kinoplus-item selector">
                <div class="kinoplus-item__title">{title}</div>
                <div class="kinoplus-item__quality">{quality}</div>
                <div class="kinoplus-item__translation">{translation}</div>
                <div class="kinoplus-item__season">{season}</div>
                <div class="kinoplus-item__episode">{episode}</div>
            </div>
        `);

        Lampa.Template.add('kinoplus_content_loading', `
            <div class="broadcast__scan"><div></div></div>
        `);

        Lampa.Template.add('kinoplus_empty', `
            <div>{message}</div>
        `);

        var button = `
            <div class="full-start__button selector view--online kinoplus--button">
                <span>#{kinoplus_title}</span>
            </div>
        `;

        function addButton(e) {
            if (e.render.find('.kinoplus--button').length) return;
            var btn = $(button);
            btn.on('hover:enter', function() {
                Lampa.Component.add('kinoplus', component);
                Lampa.Activity.push({
                    url: '',
                    title: 'Кино+',
                    component: 'kinoplus',
                    movie: e.movie,
                    page: 1
                });
            });
            e.render.after(btn);
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                addButton({
                    render: e.object.activity.render().find('.view--torrent'),
                    movie: e.data.movie
                });
            }
        });
    }

    if (!window.kinoplus_plugin) startPlugin();
})();
