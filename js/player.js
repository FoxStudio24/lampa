// Обновленный плеер с защитой от блокировщиков рекламы
(function () {
    // Define MultiPlayer class
    var MultiPlayer = function () {
        this.playerContainer = null;
        this.iframe = null;
        this.currentPlayer = 'alloha'; // 'vibix', 'alloha', 'lumex', или 'veoveo'
        this.currentContent = null;
        this.isDropdownOpen = false;
        this.loadingOverlay = null;
        this.hasError = false;
        this.progressData = {};
        this.adBlockDetected = false;
        
        // API ключи
        this.API_KEY = '06936145fe8e20be28b02e26b55d3ce6';
        this.VIBIX_KEY = '19804|3WXYJCzkEakcsCqO57deXAVXADdTzeqvDkGQMf5Cc67f135a';
        this.ALLOHA_TOKEN = '04941a9a3ca3ac16e2b4327347bbc1';
        this.LUMEX_API_TOKEN = 'c9368010a6ff29b02795712d3dd8fdab';
        this.VEOVEO_BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ3ZWJTaXRlIjoiMTE5IiwiaXNzIjoiYXBpLXdlYm1hc3RlciIsInN1YiI6IjE4NSIsImlhdCI6MTc0NzMxNTYxOSwianRpIjoiNTEwMmVhODktZTFmYi00MjIxLTkzMzktMGViYjQ4N2UzMTJmIiwic2NvcGUiOiJETEUifQ.rZJsunksW6uj_9hDNn7qowp8mWVJOcEl7353iIR0rNQ';
        this.TMDB_BASE_URL = 'https://api.themoviedb.org/3';
        this.LUMEX_API_URL = 'https://portal.lumex.host/api/short';
        this.VEOVEO_API_URL = 'https://webmaster-api.rstprgapipt.com';
        
        // Список балансеров с тегами
        this.balancers = [
            { id: 'alloha', name: 'Alloha.tv', tags: ['4K', 'ac'] },
            { id: 'gencit', name: 'Gencit', tags: ['HD', 'ac'] },
            { id: 'vibix', name: 'Vibix', tags: ['HD'] },
            { id: 'lumex', name: 'Lumex', tags: ['HD'] },
            { id: 'veoveo', name: 'VeoVeo', tags: ['HD'] }
        ];
    };

    // Безопасный fetch с обработкой ошибок
    MultiPlayer.prototype.safeFetch = async function (url, options) {
        try {
            var response = await fetch(url, options || {});
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    };

    // Создает HTML для тегов балансера (исключает 'ac' так как оно отображается как иконка)
    MultiPlayer.prototype.createBalancerTags = function (tags) {
        if (!tags || tags.length === 0) return '';
        
        return tags.filter(function (tag) {
            return (tag || '').toString().toLowerCase() !== 'ac';
        }).map(function (tag) {
            return '<span class="balancer-tag" style="' +
                'background: rgba(255, 255, 255, 0.9);' +
                'color: #333;' +
                'font-size: 10px;' +
                'font-weight: 600;' +
                'padding: 2px 6.5px;' +
                'border-radius: 4px;' +
                'display: inline-block;' +
                'line-height: 1;' +
                'text-transform: uppercase;' +
                '">' + tag + '</span>';
        }).join('');
    };

    // Возвращает HTML иконки для балансера, если есть тег 'ac'
    MultiPlayer.prototype.getBalancerIconHtml = function (balancer) {
        if (!balancer || !balancer.tags || !Array.isArray(balancer.tags)) return '';
        var hasAc = balancer.tags.some(function (t) { return (t || '').toString().toLowerCase() === 'ac'; });
        if (!hasAc) return '';
        return `<span style="position:relative;display:inline-block;margin-right:2px;vertical-align:middle;">
  <img src="../ico/ac.png" alt="ac" style="width:18px;height:18px;position:relative;z-index:2;">
  <img src="../ico/ac.png" alt="ac" style="width:20px;height:20px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);filter:blur(px);opacity:0.9;z-index:1;">
</span>`;

    };

    MultiPlayer.prototype.getImdbId = async function (tmdbId, type) {
        try {
            var url = this.TMDB_BASE_URL + '/' + type + '/' + tmdbId + '?api_key=' + this.API_KEY + '&append_to_response=external_ids';
            var response = await this.safeFetch(url);
            var data = await response.json();
            return data.external_ids ? data.external_ids.imdb_id || null : null;
        } catch (error) {
            console.error('Ошибка получения IMDB ID:', error);
            return null;
        }
    };

    MultiPlayer.prototype.getVibixUrl = async function (imdbId) {
        try {
            var vibixRes = await this.safeFetch('https://vibix.org/api/v1/publisher/videos/imdb/' + imdbId, {
                headers: {
                    "Authorization": 'Bearer ' + this.VIBIX_KEY
                }
            });
            var vibixData = await vibixRes.json();
            
            if (!vibixData || !vibixData.iframe_url) {
                throw new Error('Видео не найдено на Vibix');
            }
            
            var url = new URL(vibixData.iframe_url);
            url.searchParams.set('design', '2');
            
            return url.toString();
        } catch (error) {
            console.error('Ошибка получения Vibix URL:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.tryAllohaWithImdb = async function (imdbId, type, season, episode) {
        try {
            var params = new URLSearchParams({
                token: this.ALLOHA_TOKEN,
                imdb: imdbId
            });

            if (type === 'tv' && season && episode) {
                params.append('season', season);
                params.append('episode', episode);
            }

            var allohaApiUrl = 'https://api.alloha.tv/?' + params.toString();
            var response = await this.safeFetch(allohaApiUrl);
            var data = await response.json();

            if (data.status === 'error') {
                throw new Error('IMDB ID ' + imdbId + ' не найден в Alloha: ' + data.error_info);
            }

            if (data.data && data.data.iframe) {
                return data.data.iframe;
            }

            throw new Error('Видео не найдено на Alloha');
        } catch (error) {
            console.error('Ошибка при попытке воспроизведения с IMDB ID в Alloha:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.tryAllohaWithTmdb = async function (tmdbId, type, season, episode) {
        try {
            var params = new URLSearchParams({
                token: this.ALLOHA_TOKEN,
                tmdb: tmdbId
            });

            if (type === 'tv' && season && episode) {
                params.append('season', season);
                params.append('episode', episode);
            }

            var allohaApiUrl = 'https://api.alloha.tv/?' + params.toString();
            var response = await this.safeFetch(allohaApiUrl);
            var data = await response.json();

            if (data.status === 'error') {
                throw new Error('TMDB ID ' + tmdbId + ' не найден в Alloha: ' + data.error_info);
            }

            if (data.data && data.data.iframe) {
                return data.data.iframe;
            }

            throw new Error('Видео не найдено на Alloha');
        } catch (error) {
            console.error('Ошибка при попытке воспроизведения с TMDB ID в Alloha:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.getAllohaUrl = async function (tmdbId, imdbId, type, season, episode) {
        var lastError = null;

        try {
            if (imdbId) {
                try {
                    var imdbUrl = await this.tryAllohaWithImdb(imdbId, type, season, episode);
                    if (imdbUrl) return imdbUrl;
                } catch (error) {
                    lastError = error;
                    console.log('IMDB запрос не удался, пробуем TMDB:', error.message);
                }
            }

            try {
                var tmdbUrl = await this.tryAllohaWithTmdb(tmdbId, type, season, episode);
                if (tmdbUrl) return tmdbUrl;
            } catch (error) {
                lastError = error;
            }

            throw lastError || new Error('Видео не найдено на Alloha');
        } catch (error) {
            console.error('Ошибка получения Alloha URL:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.getLumexUrl = async function (imdbId) {
        try {
            var lumexUrl = this.LUMEX_API_URL + '?api_token=' + this.LUMEX_API_TOKEN + '&imdb_id=' + imdbId;
            var lumexResponse = await this.safeFetch(lumexUrl);
            var lumexData = await lumexResponse.json();

            if (!lumexData.result || !lumexData.data || lumexData.data.length === 0) {
                throw new Error('Видео не найдено в базе Lumex');
            }

            var videoData = lumexData.data[0];
            var iframeSrc = videoData.iframe_src;
            
            if (!iframeSrc) {
                throw new Error('Не удалось получить ссылку на плеер Lumex');
            }

            return 'https:' + iframeSrc;
        } catch (error) {
            console.error('Ошибка получения Lumex URL:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.getVeoVeoUrl = async function (imdbId) {
        try {
            var veoveoUrl = this.VEOVEO_API_URL + '/v1/contents/by-imdb/' + imdbId;
            var response = await this.safeFetch(veoveoUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.VEOVEO_BEARER_TOKEN
                }
            });
            var data = await response.json();
            
            if (!data.playerUrl) {
                throw new Error('URL плеера не найден в ответе VeoVeo API');
            }
            
            return data.playerUrl;
        } catch (error) {
            console.error('Ошибка получения VeoVeo URL:', error);
            throw error;
        }
    };

    MultiPlayer.prototype.toggleDropdown = function () {
        var dropdown = document.getElementById('balancer-dropdown');
        var dropdownArrow = document.querySelector('.dropdown-arrow');
        
        if (this.isDropdownOpen) {
            dropdown.style.display = 'none';
            dropdownArrow.style.transform = 'rotate(0deg)';
            this.isDropdownOpen = false;
        } else {
            dropdown.style.display = 'block';
            dropdownArrow.style.transform = 'rotate(180deg)';
            this.isDropdownOpen = true;
        }
    };

    MultiPlayer.prototype.selectBalancer = function (balancerId) {
        var self = this;
        if (balancerId === this.currentPlayer) {
            this.toggleDropdown();
            return;
        }
        
        this.hasError = false;
        this.currentPlayer = balancerId;
        this.toggleDropdown();
        this.updatePlayerInterface();
        this.showLoading();
        
        this.loadCurrentContent().then(function () {
            if (!self.hasError) {
                self.setupIframeHandlers();
            }
        }).catch(function (error) {
            console.error('Ошибка при загрузке контента:', error);
            self.hasError = true;
            self.showError(error.message);
        });
    };

    MultiPlayer.prototype.updatePlayerInterface = function () {
        var self = this;
        var currentBalancerBtn = document.getElementById('current-balancer-btn');
        var dropdown = document.getElementById('balancer-dropdown');
        
        if (currentBalancerBtn) {
            var currentBalancer = this.balancers.find(function (b) { return b.id === self.currentPlayer; });
            currentBalancerBtn.innerHTML = [
                '<span class="balancer-name" style="display:flex;align-items:center;">' + (currentBalancer ? this.getBalancerIconHtml(currentBalancer) + currentBalancer.name : 'Balancer') + '</span>',
                currentBalancer ? this.createBalancerTags(currentBalancer.tags) : '',
                '<svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" style="transition: transform 0.3s ease; margin-left: 8px;">',
                '    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
                '</svg>'
            ].join('');
        }
        
        if (dropdown) {
            dropdown.innerHTML = this.balancers.map(function (balancer) {
                return '<button onclick="window.multiPlayer.selectBalancer(\'' + balancer.id + '\')" style="' +
                    'width: 100%;' +
                    'background: ' + (balancer.id === self.currentPlayer ? 'rgba(255, 255, 255, 0.1)' : 'transparent') + ';' +
                    'border: none;' +
                    'border-radius: 12px;' +
                    'padding: 8px 12px;' +
                    'color: white;' +
                    'font-size: 14px;' +
                    'cursor: pointer;' +
                    'transition: all 0.3s ease;' +
                    'text-align: left;' +
                    'margin-bottom: 4px;' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: space-between;' +
                    '" onmouseover="this.style.background=\'rgba(255,255,255,0.15)\'" onmouseout="this.style.background=\'' + (balancer.id === self.currentPlayer ? 'rgba(255, 255, 255, 0.1)' : 'transparent') + '\'">' +
                    '<span class="balancer-name">' + self.getBalancerIconHtml(balancer) + balancer.name + '</span>' +
                    '<span class="balancer-tags">' + self.createBalancerTags(balancer.tags) + '</span>' +
                    '</button>';
            }).join('');
        }
    };

    MultiPlayer.prototype.loadCurrentContent = async function () {
        if (!this.currentContent) return;

        var tmdbId = this.currentContent.tmdbId;
        var type = this.currentContent.type;
        var season = this.currentContent.season;
        var episode = this.currentContent.episode;
        
        try {
            if (this.iframe) {
                this.iframe.src = '';
            }
            
            if (this.currentPlayer === 'vibix') {
                await this.loadVibixContent(tmdbId, type, season, episode);
            } else if (this.currentPlayer === 'gencit') {
                await this.loadGencitContent(tmdbId, type, season, episode);
            } else if (this.currentPlayer === 'lumex') {
                await this.loadLumexContent(tmdbId, type, season, episode);
            } else if (this.currentPlayer === 'veoveo') {
                await this.loadVeoVeoContent(tmdbId, type, season, episode);
            } else {
                await this.loadAllohaContent(tmdbId, type, season, episode);
            }
            
        } catch (error) {
            console.error('Ошибка загрузки ' + this.currentPlayer + ':', error);
            this.hasError = true;
            this.showError(error.message);
        }
    };

    MultiPlayer.prototype.loadVibixContent = async function (tmdbId, type, season, episode) {
        var imdbId = await this.getImdbId(tmdbId, type);
        if (!imdbId) {
            throw new Error('IMDB ID не найден');
        }

        var vibixUrl = await this.getVibixUrl(imdbId);
        this.iframe.src = vibixUrl;
        this.setupIframeHandlers();
    };

    MultiPlayer.prototype.loadAllohaContent = async function (tmdbId, type, season, episode) {
        var imdbId = await this.getImdbId(tmdbId, type);
        var allohaUrl = await this.getAllohaUrl(tmdbId, imdbId, type, season, episode);
        
        this.iframe.src = allohaUrl;
        this.setupIframeHandlers();
    };

    MultiPlayer.prototype.loadLumexContent = async function (tmdbId, type, season, episode) {
        var imdbId = await this.getImdbId(tmdbId, type);
        if (!imdbId) {
            throw new Error('IMDB ID не найден');
        }

        var lumexUrl = await this.getLumexUrl(imdbId);
        this.iframe.src = lumexUrl;
        this.setupIframeHandlers();
    };

    MultiPlayer.prototype.loadVeoVeoContent = async function (tmdbId, type, season, episode) {
        var imdbId = await this.getImdbId(tmdbId, type);
        if (!imdbId) {
            throw new Error('IMDB ID не найден');
        }

        var veoveoUrl = await this.getVeoVeoUrl(imdbId);
        this.iframe.src = veoveoUrl;
        this.setupIframeHandlers();
    };

    MultiPlayer.prototype.loadGencitContent = async function (tmdbId, type, season, episode) {
        // Сначала пробуем путь через TMDB: https://gencit.info/mds/{tmdbId}
        var resolvedTmdb = tmdbId || (this.currentContent && this.currentContent.tmdbId);
        if (resolvedTmdb) {
            var gencitMdsUrl = 'https://gencit.info/mds/' + resolvedTmdb;
            this.iframe.src = gencitMdsUrl;
            this.setupIframeHandlers();
            return;
        }

        // Если TMDB ID недоступен — пробуем через IMDB (без префикса 'tt')
        var imdbId = await this.getImdbId(resolvedTmdb, type);
        if (!imdbId) {
            throw new Error('TMDB или IMDB ID не найден');
        }

        var cleanImdb = (imdbId || '').toString().replace(/^tt/i, '');
        var gencitUrl = 'https://gencit.info/nba/' + cleanImdb;
        this.iframe.src = gencitUrl;
        this.setupIframeHandlers();
    };

    // Остальные методы остаются без изменений
    MultiPlayer.prototype.createPlayerContainer = function () {
        if (this.playerContainer) {
            this.playerContainer.remove();
        }
        document.body.classList.add('no-scroll');

        this.playerContainer = document.createElement('div');
        this.playerContainer.id = 'multi-player-modal';
        this.playerContainer.style.cssText = [
            'position: fixed;',
            'top: 0;',
            'left: 0;',
            'width: 100%;',
            'height: 100%;',
            'z-index: 999999;',
            'background-color: #141414;',
            'font-family: \'buttonbold\', sans-serif;'
        ].join('');

        var currentBalancer = this.balancers.find(function (b) { return b.id === this.currentPlayer; }, this);
        
        this.playerContainer.innerHTML = [
            '<div class="player-overlay" style="position: relative; width: 100%; height: 100%; z-index: 999999;">',
            '    <div class="player-modal" style="position: relative; width: 100%; height: 100%; z-index: 999999;">',
            '        <div class="player-header" style="position: absolute; top: 20px; right: 20px; z-index: 1000000;">',
            '            <div class="player-controls" style="' +
            '                display: flex;' +
            '                align-items: center;' +
            '                background: rgb(24 24 24 / 65%);' +
            '                backdrop-filter: blur(10px);' +
            '                border: 1px solid rgba(68, 68, 68, 0.3);' +
            '                border-radius: 99px;' +
            '                padding: 3px;' +
            '                gap: 12px;' +
            '            ">',
            '                <div class="balancer-selector" style="position: relative; border-radius: 99px;">',
            '                    <button id="current-balancer-btn" onclick="window.multiPlayer.toggleDropdown()" style="' +
            '                        position: relative;' +
            '                        z-index: 1000001;' +
            '                        display: flex;' +
            '                        align-items: center;' +
            '                        justify-content: center;' +
            '                        gap: 8px;' +
            '                        background: transparent;' +
            '                        border: none;' +
            '                        border-radius: 99px;' +
            '                        padding: 8px 12px;' +
            '                        color: white;' +
            '                        font-size: 14px;' +
            '                        cursor: pointer;' +
            '                        transition: all 0.3s ease;' +
            '                        min-width: 80px;' +
            '                        font-family: \'buttonbold\', sans-serif;' +
            '                    " onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'transparent\'">',
            '                        <span class="balancer-name" style="display:flex;align-items:center;">' + (currentBalancer ? this.getBalancerIconHtml(currentBalancer) + currentBalancer.name : 'Balancer') + '</span>',
            currentBalancer ? this.createBalancerTags(currentBalancer.tags) : '',
            '                        <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" style="transition: transform 0.3s ease; margin-left: 8px;">',
            '                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
            '                        </svg>',
            '                    </button>',
            '                    <div id="balancer-dropdown" style="' +
            '                        position: absolute;' +
            '                        top: 100%;' +
            '                        left: 0;' +
            '                        right: 0;' +
            '                        background: rgb(24 24 24 / 95%);' +
            '                        backdrop-filter: blur(20px);' +
            '                        border: 1px solid rgba(68, 68, 68, 0.3);' +
            '                        border-radius: 20px;' +
            '                        margin-top: 8px;' +
            '                        padding: 8px;' +
            '                        display: none;' +
            '                        z-index: 1000002;' +
            '                        min-width: 200px;' +
            '                        max-width: 300px;' +
            '                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);' +
            '                    ">',
            this.balancers.map(function (balancer) {
                return '<button onclick="window.multiPlayer.selectBalancer(\'' + balancer.id + '\')" style="' +
                    'width: 100%;' +
                    'background: ' + (balancer.id === this.currentPlayer ? 'rgba(255, 255, 255, 0.1)' : 'transparent') + ';' +
                    'border: none;' +
                    'border-radius: 12px;' +
                    'padding: 8px 12px;' +
                    'color: white;' +
                    'font-size: 14px;' +
                    'cursor: pointer;' +
                    'transition: all 0.3s ease;' +
                    'text-align: left;' +
                    'margin-bottom: 4px;' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: space-between;' +
                    '" onmouseover="this.style.background=\'rgba(255,255,255,0.15)\'" onmouseout="this.style.background=\'' + (balancer.id === this.currentPlayer ? 'rgba(255, 255, 255, 0.1)' : 'transparent') + '\'">' +
                    '<span class="balancer-name">' + this.getBalancerIconHtml(balancer) + balancer.name + '</span>' +
                    '<span class="balancer-tags">' + this.createBalancerTags(balancer.tags) + '</span>' +
                    '</button>';
            }, this).join(''),
            '                    </div>',
            '                </div>',
            '                <div class="separator" style="width: 1px; height: 20px; background: rgba(68, 68, 68, 0.5);"></div>',
            '                <button class="close-btn" onclick="this.closest(\'#multi-player-modal\').remove(); document.body.classList.remove(\'no-scroll\');" style="' +
            '                    position: relative;' +
            '                    z-index: 1000001;' +
            '                    display: flex;' +
            '                    align-items: center;' +
            '                    justify-content: center;' +
            '                    background: transparent;' +
            '                    border: none;' +
            '                    border-radius: 50%;' +
            '                    width: 32px;' +
            '                    height: 32px;' +
            '                    padding: 0;' +
            '                    cursor: pointer;' +
            '                    transition: all 0.3s ease;' +
            '                    top: 0px;' +
            '                    right: 0px;' +
            '                " onmouseover="this.style.background=\'rgba(255,255,255,0.1)\'" onmouseout="this.style.background=\'transparent\'">',
            '                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">',
            '                        <line x1="18" y1="6" x2="6" y2="18"></line>',
            '                        <line x1="6" y1="6" x2="18" y2="18"></line>',
            '                    </svg>',
            '                </button>',
            '            </div>',
            '        </div>',
            '        <div class="player-content" style="position: relative; width: 100%; height: 100%; z-index: 999999;">',
            '            <div id="player-loading-overlay" class="loading-overlay" style="' +
            '                position: absolute;' +
            '                top: 0;' +
            '                left: 0;' +
            '                width: 100%;' +
            '                height: 100%;' +
            '                z-index: 1000000;' +
            '                display: flex;' +
            '                flex-direction: column;' +
            '                align-items: center;' +
            '                justify-content: center;' +
            '                background: #141414;' +
            '                backdrop-filter: blur(5px);' +
            '            ">',
            '                <div class="loading-animations" style="' +
            '                    display: flex;' +
            '                    align-items: center;' +
            '                    justify-content: center;' +
            '                    gap: 20px;' +
            '                    margin-bottom: 20px;' +
            '                ">',
            '                    <div class="loader">',
            '                        <svg viewBox="0 0 80 80" style="width: 40px; height: 40px;">',
            '                            <circle r="32" cy="40" cx="40" id="circle"></circle>',
            '                        </svg>',
            '                    </div>',
            '                    <div class="loader triangle">',
            '                        <svg viewBox="0 0 86 80" style="width: 40px; height: 40px;">',
            '                            <polygon points="43 8 79 72 7 72"></polygon>',
            '                        </svg>',
            '                    </div>',
            '                    <div class="loader">',
            '                        <svg viewBox="0 0 80 80" style="width: 40px; height: 40px;">',
            '                            <rect height="64" width="64" y="8" x="8"></rect>',
            '                        </svg>',
            '                    </div>',
            '                </div>',
            '                <div class="loading-text" style="' +
            '                    color: white;' +
            '                    font-size: 16px;' +
            '                    font-weight: 500;' +
            '                    text-align: center;' +
            '                ">',
            '                    Загрузка видео...',
            '                </div>',
            '            </div>',
            '            <iframe id="multi-iframe" frameborder="0" allowfullscreen style="' +
            '                position: absolute;' +
            '                top: 0;' +
            '                left: 0;' +
            '                width: 100%;' +
            '                height: 100%;' +
            '                border: none;' +
            '                z-index: 999998;' +
            '                display: none;' +
            '            "></iframe>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('');

        document.body.appendChild(this.playerContainer);
        this.iframe = document.getElementById('multi-iframe');
        this.loadingOverlay = document.getElementById('player-loading-overlay');
        
        var self = this;
        document.addEventListener('mousedown', function (e) {
            if (self.isDropdownOpen && !e.target.closest('.balancer-selector')) {
                self.toggleDropdown();
            }
        });
    };

    MultiPlayer.prototype.showLoading = function () {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
            
            // Pac-Man загрузка
            var currentBalancer = this.balancers.find(function (b) { return b.id === this.currentPlayer; }, this);
            var balancerName = currentBalancer ? currentBalancer.name : 'плеера';
            
            this.loadingOverlay.innerHTML = [
                '<div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">',
                '    <div class="loader-wrapper">',
                '        <div class="packman"></div>',
                '        <div class="dots">',
                '            <div class="dot"></div>',
                '            <div class="dot"></div>',
                '            <div class="dot"></div>',
                '            <div class="dot"></div>',
                '        </div>',
                '    </div>',
                '    <div style="color: white; font-size: 16px; font-weight: 500; text-align: center;">',
                '        Загрузка ' + balancerName + '...',
                '    </div>',
                '</div>'
            ].join('');
        }
        if (this.iframe) {
            this.iframe.style.display = 'none';
        }
    };

    MultiPlayer.prototype.hideLoading = function () {
        if (this.hasError) return;
        
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
        if (this.iframe) {
            this.iframe.style.display = 'block';
        }
    };

    MultiPlayer.prototype.showError = function (message) {
        if (this.loadingOverlay) {
            var randomIndex = Math.floor(Math.random() * 5) + 1;
            var currentBalancer = this.balancers.find(function (b) { return b.id === this.currentPlayer; }, this);
            var otherBalancers = this.balancers.filter(function (b) { return b.id !== this.currentPlayer; }, this);
            
            var isAdBlockError = this.currentPlayer === 'alloha' && message.includes('Failed to fetch');
            var errorMessage = isAdBlockError
                ? '<img src="../ico/ADERROR.png" alt="AdBlock Error" style="max-width:400px;width:100%;height:auto;vertical-align:middle;margin-bottom:12px;display:block;border-radius:0;box-shadow:none;">'
                  + '<strong>Отключите блокировщик рекламы для корректной работы Alloha.</strong><br>' + message
                : message;
            this.loadingOverlay.innerHTML = [
                '<div class="nf-err-center" style="display: flex; align-items: center; justify-content: center; height: 100%; background: #141414;">',
                '    <div class="nf-err-wrap" style="display: flex; align-items: center; justify-content: center; flex-direction: row;">',
                '        <div class="nf-err-text" style="flex: 1; text-align: left; padding-right: 32px;">',
                '            <div class="nf-err-title" style="font-size: 2em; font-weight: 900; color: white; margin-bottom: 12px;">',
                '                Ошибка загрузки',
                '            </div>',
                '            <div class="nf-err-desc" style="font-size: 1em; font-weight: 500; color: #aaa; line-height: 1.5;">',
                errorMessage,
                '<br>',
                'Плеер <strong>' + (currentBalancer ? currentBalancer.name : 'текущий') + '</strong> не может воспроизвести этот контент.<br>',
                'Попробуйте переключиться на <strong>' + otherBalancers.map(function (b) { return b.name; }).join(', ') + '</strong> или выбрать другой контент.',
                '            </div>',
                '        </div>',
                '        <video id="notfound-video" src="../ico/404-video/' + randomIndex + '.mp4" autoplay loop muted playsinline style="flex: 0 0 320px; width: 320px; height: 180px; border-radius: 8px; object-fit: cover; background: #222; box-shadow: 0 2px 16px #0006; margin-left: 24px;"></video>',
                '    </div>',
                '</div>'
            ].join('');
            this.loadingOverlay.style.display = 'flex';
            
            var nfVideo = document.getElementById('notfound-video');
            if (nfVideo) {
                nfVideo.onerror = function () {
                    nfVideo.style.display = 'none';
                };
            }
        }
    };

    MultiPlayer.prototype.playContent = async function (tmdbId, type, season, episode) {
        try {
            this.currentContent = { tmdbId: tmdbId, type: type, season: season, episode: episode };
            this.hasError = false;
            
            this.createPlayerContainer();
            this.showLoading();

            await this.loadCurrentContent();

        } catch (error) {
            console.error('Ошибка воспроизведения:', error);
            this.hasError = true;
            this.showError(error.message);
        }
    };

    MultiPlayer.prototype.setupIframeHandlers = function () {
        if (!this.iframe || this.hasError) return;

        var self = this;
        var loadingTimeout = setTimeout(function () {
            self.hideLoading();
        }, 8000);

        this.iframe.onload = function () {
            if (self.hasError) return;
            
            clearTimeout(loadingTimeout);
            setTimeout(function () {
                self.hideLoading();
            }, 1000);
        };

        this.iframe.onerror = function () {
            clearTimeout(loadingTimeout);
            self.hasError = true;
            self.showError('Ошибка загрузки видео');
        };
    };

    MultiPlayer.prototype.playMovie = async function (tmdbId) {
        return this.playContent(tmdbId, 'movie');
    };

    MultiPlayer.prototype.playTVShow = async function (tmdbId, season, episode) {
        return this.playContent(tmdbId, 'tv', season, episode);
    };

    MultiPlayer.prototype.openMovie = async function (tmdbId) {
        return this.playContent(tmdbId, 'movie');
    };

    MultiPlayer.prototype.openTVShow = async function (tmdbId, season, episode) {
        return this.playContent(tmdbId, 'tv', season, episode);
    };

    MultiPlayer.prototype.openPlayer = async function (item) {
        var tmdbId = item.id;
        var type = item.title ? 'movie' : 'tv';
        return this.playContent(tmdbId, type);
    };

    window.multiPlayer = new MultiPlayer();
    window.vibixPlayer = window.multiPlayer;

    window.openPlayer = function (item) {
        return window.multiPlayer.openPlayer(item);
    };
})();
