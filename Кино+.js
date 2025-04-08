(function() {
    'use strict';

    var Defined = {
        localhost: 'https://example.com/', // Замените на ваш прокси-сервер, если нужен
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
            'vkvideo': {
                url: 'https://vkvideo.ru/',
                name: 'VK Video',
                show: true
            },
            'rutube': {
                url: 'https://rutube.ru/',
                name: 'Rutube',
                show: true
            }
        };
        var last;
        var balanser = 'vkvideo';
        var initialized;
        var filter_sources = ['vkvideo', 'rutube'];
        var filter_translate = {
            quality: 'Качество',
            source: 'Источник'
        };
        var filter_find = {
            quality: []
        };

        function account(url) {
            var uid = Lampa.Storage.get('kinoplus_unic_id', '');
            if (uid) url = Lampa.Utils.addUrlComponent(url, 'uid=' + encodeURIComponent(uid));
            return url;
        }

        this.initialize = function() {
            var _this = this;
            this.loading(true);
            filter.onBack = function() {
                _this.start();
            };
            filter.onSelect = function(type, a, b) {
                if (type == 'sort') {
                    Lampa.Select.close();
                    _this.changeBalanser(a.source);
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

        this.changeBalanser = function(balanser_name) {
            balanser = balanser_name;
            Lampa.Storage.set('kinoplus_balanser', balanser_name);
            this.reset();
            this.search();
        };

        this.requestParams = function(url) {
            var query = [];
            query.push('title=' + encodeURIComponent(object.movie.title || object.movie.name));
            query.push('original_title=' + encodeURIComponent(object.movie.original_title || object.movie.original_name));
            query.push('year=' + ((object.movie.release_date || object.movie.first_air_date || '0000') + '').slice(0, 4));
            return url + 'search?' + query.join('&');
        };

        this.search = function() {
            this.reset();
            var url = this.requestParams(sources[balanser].url);
            network.timeout(10000);
            network.native(account(url), this.parse.bind(this), this.doesNotAnswer.bind(this), false, {
                dataType: 'json'
            });
        };

        this.parse = function(json) {
            if (!json || !json.results) return this.empty();
            
            var videos = json.results.map(function(item) {
                return {
                    title: item.title,
                    url: item.url,
                    quality: item.quality || 'HD',
                    method: 'play',
                    text: item.title
                };
            });
            
            // Сортировка по качеству (предполагаем, что качество указано как "1080p", "720p" и т.д.)
            videos.sort(function(a, b) {
                var qA = parseInt(a.quality) || 0;
                var qB = parseInt(b.quality) || 0;
                return qB - qA;
            });
            
            this.display(videos);
        };

        this.display = function(videos) {
            var _this = this;
            this.draw(videos, {
                onEnter: function(item, html) {
                    var play = {
                        title: item.title,
                        url: item.url,
                        quality: item.quality
                    };
                    Lampa.Player.play(play);
                    Lampa.Player.playlist([play]);
                }
            });
            filter.set('sort', filter_sources.map(function(e) {
                return {
                    title: sources[e].name,
                    source: e,
                    selected: e == balanser
                };
            }));
        };

        this.draw = function(items) {
            var _this = this;
            scroll.clear();
            items.forEach(function(element) {
                var html = Lampa.Template.get('kinoplus_video_item', {
                    title: element.title,
                    quality: element.quality
                });
                html.on('hover:enter', function() {
                    var play = {
                        title: element.title,
                        url: element.url,
                        quality: element.quality
                    };
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

        this.empty = function() {
            scroll.clear();
            scroll.append(Lampa.Template.get('kinoplus_empty', {}));
            this.loading(false);
        };

        this.doesNotAnswer = function() {
            this.empty();
        };

        this.start = function() {
            if (!initialized) {
                initialized = true;
                this.initialize();
            }
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
            version: '1.0.0',
            name: 'Кино+',
            description: 'Плагин для просмотра видео из VK и Rutube',
            component: 'kinoplus'
        };
        Lampa.Manifest.plugins = manifest;
        Lampa.Lang.add({
            kinoplus_title: {
                ru: 'Кино+',
                en: 'Kino+'
            }
        });

        Lampa.Template.add('kinoplus_css', `
            <style>
            .kinoplus-item { padding: 1em; background: rgba(0,0,0,0.3); margin-bottom: 1em; border-radius: 0.3em; }
            .kinoplus-item__title { font-size: 1.5em; }
            .kinoplus-item__quality { color: #aaa; }
            </style>
        `);
        $('body').append(Lampa.Template.get('kinoplus_css', {}, true));

        Lampa.Template.add('kinoplus_video_item', `
            <div class="kinoplus-item selector">
                <div class="kinoplus-item__title">{title}</div>
                <div class="kinoplus-item__quality">{quality}</div>
            </div>
        `);

        Lampa.Template.add('kinoplus_content_loading', `
            <div class="broadcast__scan"><div></div></div>
        `);

        Lampa.Template.add('kinoplus_empty', `
            <div>Видео не найдено</div>
        `);

        var button = `
            <div class="full-start__button selector view--online kinoplus--button">
                <span>Кино+</span>
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