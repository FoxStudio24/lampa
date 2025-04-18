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
    if (!Lampa.Utils) {
        console.error('RuTube Plugin: Lampa.Utils is not defined');
        return;
    }

    var Subscribe = Lampa.Subscribe;
    var Platform = Lampa.Platform;
    var Lang = Lampa.Lang;
    var Panel = Lampa.PlayerPanel || { update: function() {}, hide: function() {}, show: function() {} };
    var TAG = 'RuTube';

    console.log('RuTube Plugin: Dependencies loaded successfully');

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
                console.log('RuTube Plugin: Iframe created with src:', src);
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
                    console.log('RuTube Plugin: Received message from iframe:', message);
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

                console.log('RuTube Plugin: Extracted videoId:', id, 'privateKey:', privateKey);

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
                            console.log('RuTube Plugin: Player ready');
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
                            // Автоматически выбираем максимальное качество
                            if (list.length > 0) {
                                var maxQuality = Math.max(...list);
                                current_level = maxQuality + 'p';
                                rutube.setPlaybackQuality(maxQuality);
                                levels.forEach(function(level) {
                                    level.selected = level.quality === current_level;
                                });
                                console.log('RuTube Plugin: Set maximum quality to:', maxQuality + 'p');
                            }
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
                            console.error('RuTube Plugin: Player error:', e);
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
                var query = cleanString([search, year, 'фильм'].join(' '));
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
                            if (data && data.results && data.results.length) {
                                var queryWord = query.split(' ');
                                var cleanSearch = cleanString(search);
                                if (searchOrig && search !== searchOrig)
                                    queryWord.push.apply(queryWord, cleanString(searchOrig).split(' '));
                                queryWord.push('фильм');
                                var getRate = function(r){
                                    if (r._rate === -1) {
                                        r._rate = 0;
                                        var si = r._title.indexOf(cleanSearch);
                                        var rw = r._title.split(' ');
                                        if (si >= 0) {
                                            r._rate += 300;
                                            if (year) {
                                                var ow = r._title.substring(si + cleanSearch.length).trim().split(' ');
                                                if (ow.length && ow[0] !== year && /^(\d+|[ivx]+)$/.test(ow[0])) r._rate -= 100;
                                                ow = rw.filter(function(w){return w.length === 4 && /^([03-9]\d|1[0-8]|2[1-9]|20[3-9])\d+$/.test(w);});
                                                if (ow.indexOf(year) >= 0) r._rate += 100;
                                            }
                                        }
                                        var rf = rw.filter(function(w){return queryWord.indexOf(w) >= 0});
                                        var wordDiff = rw.length - rf.length;
                                        r._rate += rf.length * 50;
                                        r._rate -= wordDiff * 50;
                                        r._rate += r.duration > 3600 ? 100 : 0;
                                    }
                                    return r._rate;
                                };
                                results = data.results.filter(function(r){
                                    r._title = cleanString(r.title);
                                    r._rate = -1;
                                    var isTrailer = r._title.includes('трейлер') || r._title.includes('trailer') || 
                                                    r._title.includes('тизер') || r._title.includes('teaser');
                                    if (isTrailer) {
                                        console.log('RuTube Plugin: Excluded trailer:', r.title);
                                        return false;
                                    }
                                    console.log('RuTube Plugin: Evaluating video:', r.title, 'duration:', r.duration, 'embed_url:', r.embed_url);
                                    return r.embed_url &&
                                        !r.is_hidden && !r.is_deleted && !r.is_locked && !r.is_audio && !r.is_paid && !r.is_livestream && !r.is_adult &&
                                        getRate(r) > 100;
                                }).sort(function(a,b){
                                    return getRate(b) - getRate(a);
                                });
                                console.log('RuTube Plugin: Filtered results:', results);
                            } else {
                                console.log('RuTube Plugin: No results in response');
                            }
                            if (results.length) {
                                sessionStorage.setItem(key, JSON.stringify([true, results, search]));
                                console.log('RuTube Plugin: Results found:', results);
                                typeof success === 'function' && success.apply(this, [results]);
                            } else {
                                sessionStorage.setItem(key, JSON.stringify([false, {}, search]));
                                console.log('RuTube Plugin: No results found after filtering');
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
                                console.log('RuTube Plugin: Retrying with proxy:', proxy);
                                cacheRequest(movie, isTv, success, fail);
                            } else {
                                sessionStorage.setItem(key, JSON.stringify([false, data, search]));
                                console.log('RuTube Plugin: Network request failed');
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
                console.log('RuTube Plugin: Searching for movie:', title, 'isTv:', isTv);
                var searchOk = function (data) {
                    console.log('RuTube Plugin: searchOk called with data:', data);
                    if (data[0]) {
                        data.forEach(function(res) {
                            if (res.embed_url && res.embed_url.includes('/video/')) {
                                var videoId = res.embed_url.match(/\/video\/([\da-f]{32,})/i);
                                if (videoId && videoId[1]) {
                                    res.embed_url = 'https://rutube.ru/play/embed/' + videoId[1];
                                }
                            }
                        });
                        success(data);
                    }
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
            var button = '<div class="full-start__button selector view--rutube_movie" data-subtitle="#{rutube_movie_rutube}">' +
                '<svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<rect x="1" y="1" width="130" height="130" stroke="currentColor" stroke-width="2"/>' +
                '<path d="M52 44L90 66L52 88V44Z" fill="currentColor"/>' +
                '<text x="10" y="30" font-family="Arial" font-size="20" fill="currentColor">RuTube</text>' +
                '</svg>' +
                '<span>#{rutube_movie_play}</span>' +
                '</div>';
            Lampa.Listener.follow('full', function (event) {
                console.log('RuTube Plugin: Lampa.Listener.follow triggered with event type:', event.type);
                try {
                    if (event.type === 'complite') {
                        var isTv = event.object && event.object.method && event.object.method === 'tv';
                        // Пропускаем сериалы на этапе добавления кнопки
                        if (isTv) {
                            console.log('RuTube Plugin: Skipping TV series - button not added');
                            return;
                        }
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
                                    url: res.embed_url,
                                    iptv: true
                                });
                            });
                            console.log('RuTube Plugin: Playlist created:', playlist);
                            btn.on('hover:enter', function () {
                                console.log('RuTube Plugin: Button hover:enter triggered');
                                RT.eventContext = this;
                                Lampa.Player.play(playlist[0]);
                                Lampa.Player.playlist(playlist);
                            });
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
