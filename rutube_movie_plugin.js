(function(){
var Subscribe = Lampa.Subscribe;
var Platform = Lampa.Platform;
var Lang = Lampa.Lang;
var Panel = Lampa.PlayerPanel || { update: function() {}, hide: function() {}, show: function() {} }; // Добавляем заглушку для Panel
var TAG = 'RuTube';

// Проверяем зависимости
if (!Subscribe || !Platform || !Lang) {
    console.error(TAG, 'Required Lampa dependencies are missing');
    return;
}

// Rutube Player API
var RT = {
    PlayerState: {
        ENDED: 'stopped',
        PLAYING: 'playing',
        PAUSED: 'paused',
        BUFFERING: 3,
        CUED: 5,
        AD_PLAYING: 'adStart',
        AD_ENDED: 'adEnd',
        UNSTARTED: -1
    },
    Player: function(containerId, options) {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) throw new Error('Container not found: ' + containerId);
            this.options = options || {};
            this.eventHandlers = this.options.events || {};
            this.iframe = null;
            this.ready = false;
            this.currentTime = 0;
            this.duration = 0;
            this.playbackQuality = 720;
            this.playerState = RT.PlayerState.UNSTARTED;
            this.qualityList = [];
            this.initPlayer();
        } catch (e) {
            console.error(TAG, 'Player initialization failed:', e);
        }
    }
};

RT.Player.prototype = {
    initPlayer: function() {
        try {
            this.createIframe();
            this.bindEvents();
            this.setupQualityTracking();
        } catch (e) {
            console.error(TAG, 'initPlayer failed:', e);
        }
    },

    createIframe: function() {
        try {
            var iframe = document.createElement('iframe');
            var src = 'https://rutube.ru/play/embed/' + this.options.videoId;
            var params = [];

            var pv = this.options.playerVars || {};
            if (pv.start) params.push('t=' + pv.start);
            if (pv.end) params.push('stopTime=' + pv.end);
            if (pv.skinColor) params.push('skinColor=' + pv.skinColor);

            if (pv.suggestedQuality) {
                this.playbackQuality = pv.suggestedQuality;
            }

            if (this.options.privateKey) {
                src += '/?p=' + encodeURIComponent(this.options.privateKey);
            }

            if (params.length) src += (src.includes('?') ? '&' : '?') + params.join('&');

            iframe.setAttribute('src', src);
            iframe.setAttribute('width', this.options.width || '100%');
            iframe.setAttribute('height', this.options.height || '100%');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('webkitAllowFullScreen', '');
            iframe.setAttribute('mozallowfullscreen', '');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'clipboard-write; autoplay');

            this.container.appendChild(iframe);
            this.iframe = iframe;
        } catch (e) {
            console.error(TAG, 'createIframe failed:', e);
        }
    },

    bindEvents: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            try {
                if (!self.iframe || e.source !== self.iframe.contentWindow) return;
                var message = JSON.parse(e.data);
                switch(message.type) {
                    case 'player:ready':
                        self.handleReady(message);
                        break;
                    case 'player:adStart':
                        self.triggerEvent('onStateChange', { data: RT.PlayerState.AD_PLAYING });
                        break;
                    case 'player:adEnd':
                        self.triggerEvent('onStateChange', { data: RT.PlayerState.AD_ENDED });
                        if (self.playerState === RT.PlayerState.ENDED)
                            self.triggerEvent('onStateChange', { data: RT.PlayerState.ENDED });
                        break;
                    case 'player:changeState':
                        self.handleStateChange(message.data);
                        break;
                    case 'player:currentTime':
                        self.currentTime = message.data.time;
                        self.triggerEvent('onTimeUpdate', message.data);
                        break;
                    case 'player:durationChange':
                        self.duration = message.data.duration;
                        self.triggerEvent('onDurationChange', message.data);
                        break;
                    case 'player:currentQuality':
                        self.handleQualityChange(message.data);
                        break;
                    case 'player:qualityList':
                        self.qualityList = message.data.list || [];
                        self.triggerEvent('onQualityList', self.qualityList);
                        break;
                    case 'player:error':
                        self.triggerEvent('onError', message.data);
                        break;
                }
            } catch (err) {
                console.error(TAG, 'Error parsing message:', err);
            }
        });
    },

    handleReady: function(message) {
        this.ready = true;
        this.triggerEvent('onReady');
        this.sendCommand({ type: 'player:getQualityList', data: {} });
    },

    handleStateChange: function(data) {
        try {
            const stateMap = {
                playing: RT.PlayerState.PLAYING,
                paused: RT.PlayerState.PAUSED,
                stopped: RT.PlayerState.ENDED,
                lockScreenOn: RT.PlayerState.BUFFERING,
                lockScreenOff: RT.PlayerState.PLAYING
            };
            if (stateMap[data.state]) {
                this.playerState = stateMap[data.state];
                this.triggerEvent('onStateChange', { data: this.playerState });
            }
        } catch (e) {
            console.error(TAG, 'handleStateChange failed:', e);
        }
    },

    handleQualityChange: function(data) {
        try {
            const newQuality = data.quality.height;
            if (newQuality !== this.playbackQuality) {
                this.playbackQuality = newQuality;
                this.triggerEvent('onPlaybackQualityChange', { data: newQuality });
            }
        } catch (e) {
            console.error(TAG, 'handleQualityChange failed:', e);
        }
    },

    setupQualityTracking: function() {
        setInterval(() => {
            if (this.playerState === RT.PlayerState.PLAYING) {
                this.triggerEvent('onTimeUpdate');
            }
        }, 250);
    },

    mapQuality: function(height) {
        const qualityMap = {
            144: 'tiny',
            240: 'small',
            360: 'medium',
            480: 'large',
            720: 'hd720',
            1080: 'hd1080',
            1440: 'hd1440',
            2160: 'hd2160'
        };
        return qualityMap[height] || 'unknown';
    },

    setPlaybackQuality: function(quality) {
        try {
            const heightMap = {
                'tiny': 144,
                'small': 240,
                'medium': 360,
                'large': 480,
                'hd720': 720,
                'hd1080': 1080,
                'hd1440': 1440,
                'hd2160': 2160
            };
            if (this.qualityList.length && (heightMap[quality] || Number.isInteger(quality))) {
                var h = heightMap[quality] || quality;
                var setQuality = this.qualityList.sort(function(a,b){return Math.abs(a - h) - Math.abs(b - h)})[0];
                this.sendCommand({
                    type: 'player:changeQuality',
                    data: {quality: setQuality}
                });
            }
        } catch (e) {
            console.error(TAG, 'setPlaybackQuality failed:', e);
        }
    },

    getAvailableQualityLevels: function() {
        return this.qualityList.map(h => this.mapQuality(h));
    },

    sendCommand: function(command) {
        if (!this.ready || !this.iframe || !this.iframe.contentWindow) return;
        this.iframe.contentWindow.postMessage(JSON.stringify(command), '*');
    },

    getCurrentTime: function() {
        return this.currentTime;
    },

    getDuration: function() {
        return this.duration;
    },

    getPlayerState: function() {
        return this.playerState;
    },

    getPlaybackQuality: function() {
        return this.playbackQuality;
    },

    playVideo: function() {
        this.sendCommand({ type: 'player:play', data: {} });
    },

    pauseVideo: function() {
        this.sendCommand({ type: 'player:pause', data: {} });
    },

    stopVideo: function() {
        this.sendCommand({ type: 'player:stop', data: {} });
    },

    seekTo: function(seconds) {
        this.sendCommand({ type: 'player:setCurrentTime', data: { time: seconds } });
    },

    setVolume: function(volume) {
        this.sendCommand({ type: 'player:setVolume', data: { volume: volume } });
    },

    addEventListener: function(event, handler) {
        this.eventHandlers[event] = handler;
    },

    triggerEvent: function(event, data) {
        if (this.eventHandlers[event]) {
            if (!data) data = {};
            data.target = this;
            this.eventHandlers[event](data);
        }
    }
};

function RuTube(call_video){
    var stream_url, loaded = false;
    var needclick = Platform.screen('mobile') || navigator.userAgent.toLowerCase().indexOf("android") >= 0;
    var object = $('<div class="player-video__youtube"><div class="player-video__youtube-player" id="rutube-player"></div><div class="player-video__youtube-line-top"></div><div class="player-video__youtube-line-bottom"></div><div class="player-video__youtube-noplayed hide">'+Lang.translate('player_youtube_no_played')+'</div><style>#rutube-player iframe{top:0}</style></div>');
    var video = object[0];
    var listener = Subscribe();
    var volume = 1;
    var rutube;
    var timeupdate;
    var timetapplay;
    var screen_size = 1;
    var levels = [];
    var current_level = 'AUTO';

    function videoSize(){
        var size = { width: 0, height: 0 };
        if(rutube){
            try {
                size.height = rutube.getPlaybackQuality();
                size.width = Math.round(size.height * 16 / 9);
            } catch(e) {
                console.error(TAG, 'videoSize failed:', e);
            }
        }
        return size;
    }

    Object.defineProperty(video, "src", {
        set: function (url) {
            if(url) stream_url = url;
        },
        get: function(){ return stream_url; }
    });

    Object.defineProperty(video, "currentTime", {
        set: function (t) {
            try {
                if (rutube) rutube.seekTo(t);
            } catch(e) {
                console.error(TAG, 'currentTime set failed:', e);
            }
        },
        get: function(){
            try {
                return rutube ? rutube.getCurrentTime() : 0;
            } catch(e) {
                console.error(TAG, 'currentTime get failed:', e);
                return 0;
            }
        }
    });

    Object.defineProperty(video, "duration", {
        set: function () {},
        get: function(){
            try {
                return rutube ? rutube.getDuration() : 0;
            } catch(e) {
                console.error(TAG, 'duration get failed:', e);
                return 0;
            }
        }
    });

    Object.defineProperty(video, "paused", {
        set: function () {},
        get: function(){
            if(needclick) return true;
            try {
                return rutube ? rutube.getPlayerState() === RT.PlayerState.PAUSED : true;
            } catch(e) {
                console.error(TAG, 'paused get failed:', e);
                return true;
            }
        }
    });

    Object.defineProperty(video, "audioTracks", {
        set: function () {},
        get: function(){ return []; }
    });

    Object.defineProperty(video, "textTracks", {
        set: function () {},
        get: function(){ return []; }
    });

    Object.defineProperty(video, "videoWidth", {
        set: function () {},
        get: function(){ return videoSize().width; }
    });

    Object.defineProperty(video, "videoHeight", {
        set: function () {},
        get: function(){ return videoSize().height; }
    });

    Object.defineProperty(video, "volume", {
        set: function (num) {
            volume = num;
            if(rutube) rutube.setVolume(volume);
        },
        get: function(){ return volume; }
    });

    video.canPlayType = function(){ return true; };

    video.resize = function(){
        try {
            object.find('.player-video__youtube-player').width(window.innerWidth * screen_size);
            object.find('.player-video__youtube-player').height((window.innerHeight) * screen_size);
            object.find('.player-video__youtube-player').addClass('minimize');
        } catch (e) {
            console.error(TAG, 'resize failed:', e);
        }
    };

    video.addEventListener = listener.follow.bind(listener);

    video.load = function(){
        if (!stream_url || rutube) return;
        var id, privateKey, m;
        try {
            if ((m = stream_url.match(/^https?:\/\/(www\.)?rutube\.ru\/(play\/embed|video\/private|video|shorts)\/([\da-f]{32,})\/?(\?p=([^&]+))?/i))) {
                id = m[3];
                privateKey = m[5];
            } else {
                throw new Error('Invalid RuTube URL');
            }

            video.resize();

            var nosuport = function(){
                object.append('<div class="player-video__youtube-needclick"><img src="https://rutube.ru/api/video/' + id + '/thumbnail/?redirect=1" /><div>'+Lang.translate('torrent_error_connect') + '</div></div>');
            };

            if(typeof RT == 'undefined' || typeof RT.Player == 'undefined' || !id) {
                console.error(TAG, 'RT.Player or video ID missing');
                return nosuport();
            }

            if(needclick){
                object.append('<div class="player-video__youtube-needclick"><img src="https://rutube.ru/api/video/' + id + '/thumbnail/?redirect=1" /><div></div></div>');
                timetapplay = setTimeout(function(){
                    object.find('.player-video__youtube-needclick div').text(Lang.translate('player_youtube_start_play'));
                    Panel.update('pause');
                }, 10000);
            }

            var durationInit = false;
            rutube = new RT.Player('rutube-player', {
                videoId: id,
                privateKey: privateKey,
                playerVars: {
                    'controls': 1,
                    'showinfo': 0,
                    'autohide': 1,
                    'modestbranding': 1,
                    'autoplay': 1,
                    'disablekb': 1,
                    'fs': 0,
                    'enablejsapi': 1,
                    'playsinline': 1,
                    'rel': 0,
                    'suggestedQuality': 'hd1080',
                    'setPlaybackQuality': 'hd1080'
                },
                events: {
                    onReady: function(event){
                        loaded = true;
                        rutube.setVolume(volume);
                        rutube.sendCommand({ type: 'player:hideControls', data: {}});
                        window.rutube = rutube;
                        rutube.iframe.blur();
                        window.focus();
                    },
                    onTimeUpdate: function (event) {
                        if (durationInit && !event.duration) return;
                        durationInit = true;
                        listener.send('canplay');
                        listener.send('loadeddata');
                        timeupdate = setInterval(function(){
                            if(rutube.getPlayerState() !== RT.PlayerState.PAUSED) listener.send('timeupdate');
                        }, 100);
                        if(needclick) rutube.playVideo();
                    },
                    onStateChange: (state) => {
                        object.removeClass('ended');
                        if(state.data === RT.PlayerState.AD_PLAYING){
                            Panel.hide();
                        } else if(state.data === RT.PlayerState.AD_ENDED){
                            Panel.show();
                            rutube.iframe.blur();
                            window.focus();
                        } else if(needclick) {
                            object.find('.player-video__youtube-needclick div').text(Lang.translate('loading') + '...');
                        }
                        if(state.data === RT.PlayerState.PLAYING || state.data === RT.PlayerState.AD_PLAYING){
                            listener.send('playing');
                            clearTimeout(timetapplay);
                            if(needclick){
                                needclick = false;
                                setTimeout(function(){
                                    object.find('.player-video__youtube-needclick').remove();
                                }, 500);
                            }
                        }
                        if (state.data === RT.PlayerState.ENDED) {
                            object.addClass('ended');
                            listener.send('ended');
                            listener.send('stop');
                        }
                        if (state.data === RT.PlayerState.BUFFERING) {
                            listener.send('waiting');
                            state.target.setPlaybackQuality('hd1080');
                        }
                    },
                    onQualityList: function(list) {
                        levels = [];
                        list.forEach(function(qa){
                            var qualityStr = qa + 'p';
                            var level = {
                                quality: qualityStr,
                                title: qualityStr,
                                selected: current_level === qualityStr,
                                call: false
                            };
                            Object.defineProperty(level, "enabled", {
                                set: function (v){
                                    if (v) {
                                        current_level = qualityStr;
                                        rutube.setPlaybackQuality(qa);
                                        levels.map(function(e){e.selected = false});
                                        level.selected = true;
                                    }
                                },
                                get: function(){}
                            });
                            levels.push(level);
                        });
                        if (Lampa.PlayerVideo && Lampa.PlayerVideo.listener) {
                            Lampa.PlayerVideo.listener.send('levels', {levels: levels, current: current_level});
                        }
                    },
                    onPlaybackQualityChange: function(state){
                        var qualityStr = rutube.getPlaybackQuality() + 'p';
                        if (Lampa.PlayerVideo && Lampa.PlayerVideo.listener) {
                            Lampa.PlayerVideo.listener.send('levels', {levels: levels, current: qualityStr});
                        }
                    },
                    onError: function(e){
                        object.find('.player-video__youtube-noplayed').removeClass('hide');
                        object.addClass('ended');
                        if(needclick) object.find('.player-video__youtube-needclick').remove();
                        clearTimeout(timetapplay);
                    }
                }
            });
        } catch (e) {
            console.error(TAG, 'video.load failed:', e);
        }
    };

    video.play = function(){
        try {
            if (rutube) rutube.playVideo();
        } catch(e) {
            console.error(TAG, 'play failed:', e);
        }
    };

    video.pause = function(){
        try {
            if (rutube) rutube.pauseVideo();
        } catch(e) {
            console.error(TAG, 'pause failed:', e);
        }
    };

    video.size = function(type){};

    video.speed = function(speed){};

    video.destroy = function(){
        try {
            if(loaded){
                clearInterval(timeupdate);
                if (rutube && rutube.iframe) {
                    rutube.iframe.remove();
                }
            }
            object.remove();
            clearTimeout(timetapplay);
            listener.destroy();
        } catch(e) {
            console.error(TAG, 'destroy failed:', e);
        }
    };

    call_video(video);
    return object;
}

if (Lampa.PlayerVideo) {
    Lampa.PlayerVideo.registerTube({
        name: 'RuTube',
        verify: function(src){
            return /^https?:\/\/(www\.)?rutube\.ru\/(play\/embed|video\/private|video|shorts)\/([\da-f]{32,})\/?(\?p=([^&]+))?/i.test(src);
        },
        create: RuTube
    });
}

(function () {
    'use strict';

    var proxy = Lampa.Storage.get('rutube_search_proxy', '');
    function cleanString(str) {
        return str.replace(/[^a-zA-Z\dа-яА-ЯёЁ]+/g, ' ').trim().toLowerCase();
    }

    function cacheRequest(movie, isTv, success, fail) {
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
            var data = sessionStorage.getItem(key);
            if (data) {
                data = JSON.parse(data);
                if (data[0]) typeof success === 'function' && success.apply(this, [data[1]]);
                else typeof fail === 'function' && fail.apply(this, [data[1]]);
            } else {
                var network = new Lampa.Reguest();
                network.native(
                    url,
                    function (data) {
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
                            typeof success === 'function' && success.apply(this, [results]);
                        } else {
                            sessionStorage.setItem(key, JSON.stringify([false, {}, search]));
                            typeof fail === 'function' && fail.apply(this, [{}]);
                        }
                        network.clear();
                        network = null;
                    },
                    function (data) {
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
            console.error(TAG, 'cacheRequest failed:', e);
            typeof fail === 'function' && fail.apply(this, [{}]);
        }
    }

    function loadMovies(event, success) {
        try {
            if (!event.object || !event.object.source || !event.data || !event.data.movie) return;
            var movie = event.data.movie;
            var isTv = event.object && event.object.method && event.object.method === 'tv';
            var title = movie.title || movie.name || movie.original_title || movie.original_name || '';
            if (title === '') return;
            var searchOk = function (data) {
                if (data[0]) success(data);
            };
            cacheRequest(movie, isTv, searchOk);
        } catch (e) {
            console.error(TAG, 'loadMovies failed:', e);
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
        window.rutube_movie_plugin = true;
        var button = '<div class="full-start__button selector view--rutube_movie hide" data-subtitle="#{rutube_movie_rutube}">' +
            '<svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M52 44L90 66L52 88V44Z" fill="currentColor"/><rect x="1" y="1" width="130" height="130" stroke="currentColor" stroke-width="2"/></svg>' +
            '<span>#{rutube_movie_play}</span>' +
            '</div>';
        Lampa.Listener.follow('full', function (event) {
            try {
                if (event.type === 'complite') {
                    var render = event.object.activity.render();
                    var btn = $(Lampa.Lang.translate(button));
                    render.find('.full-start__button:last').after(btn);
                    loadMovies(event, function(data){
                        var playlist = [];
                        data.forEach(function (res) {
                            playlist.push({
                                title: res.title,
                                url: res.video_url || res.embed_url,
                                iptv: true
                            });
                        });
                        btn.on('hover:enter', function () {
                            RT.eventContext = this;
                            Lampa.Player.play(playlist[0]);
                            Lampa.Player.playlist(playlist);
                        }).removeClass('hide');
                    });
                }
            } catch (e) {
                console.error(TAG, 'Lampa.Listener.follow failed:', e);
            }
        });
    }

    if (!window.rutube_movie_plugin) startPlugin();
})();
