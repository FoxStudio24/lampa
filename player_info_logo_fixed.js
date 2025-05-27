!function() {
    "use strict";

    // Проверяем наличие jQuery
    if (typeof $ === "undefined") {
        console.error("[PlayerInfoLogo] Ошибка: jQuery не найден");
        return;
    }

    // Добавляем CSS стили
    var customStyles = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&family=Montserrat:wght@300;400;600;700&display=swap&subset=cyrillic');
        
        /* Скрыть время */
        .player-info__time {
            display: none !important;
        }
        
        /* Вертикальное расположение logo + name */
        .player-info__line {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
        }
        
        /* Логотип по центру */
        .player-info__logo {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            margin-bottom: 8px !important;
            padding: 0 !important;
            text-align: center !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            animation: none !important;
            filter: none !important;
            outline: none !important;
            border: none !important;
            background: none !important;
            max-height: 100% !important;
            max-width: 100% !important;
        }
        
        /* Стиль для текстового логотипа */
        .player-info__logo-text {
            font-family: 'Comfortaa', 'Montserrat', sans-serif !important;
            font-weight: 700 !important;
            font-size: 52px !important;
            color: white !important;
            text-align: center !important;
            text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8) !important;
            background: linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4) !important;
            background-size: 400% 400% !important;
            -webkit-background-clip: text !important;
            -webkit-text-fill-color: transparent !important;
            background-clip: text !important;
            animation: gradientShift 3s ease-in-out infinite !important;
            letter-spacing: 2px !important;
            line-height: 1.1 !important;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        /* Название под логотипом */
        .player-info__name {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            padding: 10px !important;
            color: white !important;
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 400 !important;
            font-size: 28px !important;
        }
        
        /* Скрыть player-info__values */
        .player-info__values {
            display: none !important;
        }
        
        /* Убрать фон и блюр у .player-info */
        .player-info {
            background: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
            top: 0em;
            left: 0em;
            right: 0em;
        }
        
        .player-info__body {
            padding: 0em !important;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)) !important;
        }
        
        .player-info__logo {
            margin-top: 15px !important;
        }
        
        .player-panel__body {
            padding: 1em;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)) !important;
        }
        
        .player-panel {
            left: 0em;
            bottom: 0em;
            right: 0em;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: none !important;
            background-image: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
        }
        
        .player-panel__center > div {
            display: none !important;
        }
        
        .player-panel__center > .player-panel__playpause {
            display: flex !important;
        }
        
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
        </style>
    `;

    // Добавляем стили в head
    $('head').append(customStyles);

    // Добавляем настройку в интерфейс Lampa
    try {
        if (Lampa && Lampa.SettingsApi) {
            Lampa.SettingsApi.addParam({
                component: "interface",
                param: {
                    name: "player_info_logo",
                    type: "select",
                    values: { 0: "Отображать", 1: "Скрыть" },
                    default: "0"
                },
                field: {
                    name: "Логотип над названием эпизода",
                    description: "Отображает логотип сериала над названием эпизода в плеере"
                }
            });
            console.log("[PlayerInfoLogo] Настройка добавлена");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка настройки:", e.message);
    }

    // Переменные для контроля состояния
    var currentTitle = "";
    var isLoading = false;
    var logoTimeout = null;
    var uniqueLogoId = 0;

    // Функция очистки старых логотипов
    function clearAllLogos() {
        $(".player-info__logo").remove();
        console.log("[PlayerInfoLogo] Все логотипы удалены");
    }

    // Функция создания текстового логотипа
    function createTextLogo(title) {
        var logoId = ++uniqueLogoId;
        var logoHtml = '<div class="player-info__logo" data-logo-id="' + logoId + '">' +
            '<div class="player-info__logo-text">' + title + '</div>' +
            '</div>';
        return logoHtml;
    }

    // Функция создания обычного логотипа
    function createImageLogo(logoPath) {
        var logoId = ++uniqueLogoId;
        var logoHtml = '<div class="player-info__logo" data-logo-id="' + logoId + '">' +
            '<img src="' + logoPath + '" alt="Logo" style="max-height: 120px; max-width: 400px;" />' +
            '</div>';
        return logoHtml;
    }

    // Улучшенная функция поиска с более точными критериями
    function findBestMatch(results, originalTitle) {
        if (!results || results.length === 0) return null;
        
        var cleanOriginal = originalTitle.toLowerCase()
            .replace(/\s*\(\d{4}\).*$/, '')
            .replace(/\s*s\d+.*$/i, '')
            .replace(/\s*сезон.*$/i, '')
            .replace(/[^\w\s]/g, '')
            .trim();
        
        var scored = results.map(function(item) {
            var title = (item.title || item.name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();
            var originalTitle = (item.original_title || item.original_name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();
            
            var score = 0;
            
            // Точное совпадение
            if (title === cleanOriginal || originalTitle === cleanOriginal) {
                score += 100;
            }
            // Начинается с искомого названия
            else if (title.indexOf(cleanOriginal) === 0 || originalTitle.indexOf(cleanOriginal) === 0) {
                score += 80;
            }
            // Содержит искомое название
            else if (title.indexOf(cleanOriginal) !== -1 || originalTitle.indexOf(cleanOriginal) !== -1) {
                score += 60;
            }
            
            // Бонус за популярность
            if (item.popularity) {
                score += Math.min(item.popularity / 100, 20);
            }
            
            // Бонус за рейтинг
            if (item.vote_average) {
                score += item.vote_average;
            }
            
            return { item: item, score: score };
        });
        
        // Сортируем по убыванию очков
        scored.sort(function(a, b) { return b.score - a.score; });
        
        // Возвращаем лучший результат только если его очки > 50
        return scored[0] && scored[0].score > 50 ? scored[0].item : null;
    }

    // Функция проверки валидности названия для поиска логотипа
    function isValidTitleForLogo(title) {
        if (!title || title.length < 2) {
            return false;
        }
        
        // Проверяем, не является ли название странным набором слов
        var words = title.split(/\s+/);
        
        // Если слишком много слов (больше 6) - скорее всего мусор
        if (words.length > 6) {
            console.log("[PlayerInfoLogo] Слишком много слов в названии:", words.length);
            return false;
        }
        
        // Если название содержит только цифры или спец. символы
        if (/^[\d\s\W]+$/.test(title)) {
            console.log("[PlayerInfoLogo] Название содержит только цифры/символы");
            return false;
        }
        
        // Если название содержит характерные элементы UI
        var uiKeywords = [
            'смотрю', 'фильмы', 'сериалы', 'закладки', 'нравится', 
            'просмотрено', 'продолжение следует', 'настройки', 'ошибка',
            'подробно', 'keyframes', 'fadein', 'opacity'
        ];
        
        var lowerTitle = title.toLowerCase();
        for (var i = 0; i < uiKeywords.length; i++) {
            if (lowerTitle.indexOf(uiKeywords[i]) !== -1) {
                console.log("[PlayerInfoLogo] Обнаружено UI слово:", uiKeywords[i]);
                return false;
            }
        }
        
        return true;
    }

    // Основная функция отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            console.log("[PlayerInfoLogo] Запуск displayPlayerInfoLogo");
            
            // Проверяем, является ли контент трейлером
            if (isTrailerContent()) {
                console.log("[PlayerInfoLogo] Обнаружен трейлер, логотип не показываем");
                clearAllLogos();
                return;
            }
            
            // Предотвращаем множественные запросы
            if (isLoading) {
                console.log("[PlayerInfoLogo] Уже загружается, пропускаем");
                return;
            }

            if (Lampa && Lampa.Storage && Lampa.Storage.get("player_info_logo") === "1") {
                console.log("[PlayerInfoLogo] Логотипы отключены");
                clearAllLogos();
                return;
            }

            // Проверяем наличие элементов
            var $playerInfoName = $(".player-info__name");
            if (!$playerInfoName.length) {
                console.log("[PlayerInfoLogo] .player-info__name не найден");
                return;
            }

            // Ищем заголовок в разных местах
            var $playerTitle = $(".player-footer-card__title");
            if (!$playerTitle.length) {
                $playerTitle = $(".card__title, .player-title, .media-title, .title, [class*=title]");
            }

            var title = $playerTitle.length ? $playerTitle.text().trim() : "";
            
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое");
                return;
            }

            // Очищаем название от информации о трейлерах и лишнего текста
            var cleanTitle = title
                .replace(/\s*\(\d{4}\).*$/, '')
                .replace(/\s*S\d+.*$/i, '')
                .replace(/\s*Сезон.*$/i, '')
                .replace(/\s*(trailer|трейлер|teaser|тизер|official|featurette).*$/i, '')
                .replace(/\s*-.*$/, '') // Убираем все после тире
                .replace(/[^\w\s\u0400-\u04FF]/g, ' ') // Оставляем только буквы, цифры и пробелы (включая кириллицу)
                .replace(/\s+/g, ' ') // Заменяем множественные пробелы на одинарные
                .trim();
            
            console.log("[PlayerInfoLogo] Название:", cleanTitle);
            
            // Проверяем изменение названия
            if (currentTitle === cleanTitle) {
                console.log("[PlayerInfoLogo] Название не изменилось");
                return;
            }

            // Очищаем предыдущий таймаут
            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }

            // ВСЕГДА удаляем все старые логотипы
            clearAllLogos();
            
            isLoading = true;
            currentTitle = cleanTitle;

            console.log("[PlayerInfoLogo] Начинаем загрузку для:", cleanTitle);

            // Запрос к TMDB
            var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
            var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(cleanTitle) + "&language=ru&page=1";

            logoTimeout = setTimeout(function() {
                if (isLoading) {
                    console.log("[PlayerInfoLogo] Таймаут загрузки, показываем текстовый логотип");
                    isLoading = false;
                    
                    // Проверяем, что логотипа еще нет
                    if (!$(".player-info__logo").length) {
                        var textLogoHtml = createTextLogo(cleanTitle);
                        $playerInfoName.before(textLogoHtml);
                        console.log("[PlayerInfoLogo] Текстовый логотип добавлен");
                    }
                }
            }, 3000); // Таймаут 3 секунды

            $.get(searchUrl).done(function(data) {
                if (!isLoading) return; // Если уже отработал таймаут
                
                console.log("[PlayerInfoLogo] TMDB поиск: результаты =", data.results ? data.results.length : 0);
                
                var bestMatch = findBestMatch(data.results, cleanTitle);
                
                if (!bestMatch) {
                    console.log("[PlayerInfoLogo] Подходящий результат не найден, показываем текстовый логотип");
                    clearTimeout(logoTimeout);
                    isLoading = false;
                    
                    if (!$(".player-info__logo").length) {
                        var textLogoHtml = createTextLogo(cleanTitle);
                        $playerInfoName.before(textLogoHtml);
                        console.log("[PlayerInfoLogo] Текстовый логотип добавлен (нет результатов)");
                    }
                    return;
                }

                var isSerial = bestMatch.media_type === "tv";
                var id = bestMatch.id;
                var apiPath = isSerial ? "tv/" + id : "movie/" + id;
                var logoUrl = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;

                $.get(logoUrl).done(function(e) {
                    if (!isLoading) return; // Если уже отработал таймаут
                    
                    clearTimeout(logoTimeout);
                    isLoading = false;
                    
                    console.log("[PlayerInfoLogo] TMDB логотипы: найдено =", e.logos ? e.logos.length : 0);
                    
                    if (e.logos && e.logos.length > 0) {
                        var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; }) ||
                                   e.logos.find(function(l) { return l.iso_639_1 === "en"; }) ||
                                   e.logos.find(function(l) { return !l.iso_639_1; }) ||
                                   e.logos[0];
                        
                        if (logo && logo.file_path) {
                            var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                            
                            // Проверяем, что логотипа еще нет
                            if (!$(".player-info__logo").length) {
                                var imageLogoHtml = createImageLogo(logoPath);
                                $playerInfoName.before(imageLogoHtml);
                                console.log("[PlayerInfoLogo] Изображение логотипа добавлено");
                                return;
                            }
                        }
                    }
                    
                    // Если логотип не найден, показываем текстовый
                    if (!$(".player-info__logo").length) {
                        var textLogoHtml = createTextLogo(cleanTitle);
                        $playerInfoName.before(textLogoHtml);
                        console.log("[PlayerInfoLogo] Текстовый логотип добавлен (нет логотипов)");
                    }
                }).fail(function() {
                    if (!isLoading) return;
                    
                    clearTimeout(logoTimeout);
                    isLoading = false;
                    console.error("[PlayerInfoLogo] Ошибка загрузки логотипов");
                    
                    if (!$(".player-info__logo").length) {
                        var textLogoHtml = createTextLogo(cleanTitle);
                        $playerInfoName.before(textLogoHtml);
                        console.log("[PlayerInfoLogo] Текстовый логотип добавлен (ошибка API)");
                    }
                });
            }).fail(function() {
                if (!isLoading) return;
                
                clearTimeout(logoTimeout);
                isLoading = false;
                console.error("[PlayerInfoLogo] Ошибка поиска TMDB");
                
                if (!$(".player-info__logo").length) {
                    var textLogoHtml = createTextLogo(cleanTitle);
                    $playerInfoName.before(textLogoHtml);
                    console.log("[PlayerInfoLogo] Текстовый логотип добавлен (ошибка поиска)");
                }
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка:", e.message);
            isLoading = false;
            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }
        }
    }

    // Функция полной очистки
    function clearLogo() {
        clearAllLogos();
        currentTitle = "";
        isLoading = false;
        if (logoTimeout) {
            clearTimeout(logoTimeout);
            logoTimeout = null;
        }
        console.log("[PlayerInfoLogo] Состояние очищено");
    }

    // Функция принудительного обновления
    function forceUpdateLogo() {
        console.log("[PlayerInfoLogo] Принудительное обновление");
        clearLogo();
        setTimeout(displayPlayerInfoLogo, 1000);
    }

    // Подписка на события Lampa
    try {
        if (Lampa && Lampa.Listener) {
            Lampa.Listener.follow('player', function(e) {
                console.log("[PlayerInfoLogo] Событие плеера:", e.type);
                if (e.type === 'start' || e.type === 'loading') {
                    clearLogo();
                    setTimeout(displayPlayerInfoLogo, 2000);
                } else if (e.type === 'end' || e.type === 'stop') {
                    clearLogo();
                }
            });
            
            Lampa.Listener.follow('card', function(e) {
                console.log("[PlayerInfoLogo] Событие карточки:", e.type);
                if (e.type === 'start' || e.type === 'loading') {
                    clearLogo();
                    setTimeout(displayPlayerInfoLogo, 2000);
                }
            });

            Lampa.Listener.follow('activity', function(e) {
                console.log("[PlayerInfoLogo] Событие активности:", e.type);
                if (e.type === 'start') {
                    forceUpdateLogo();
                } else if (e.type === 'destroy') {
                    clearLogo();
                }
            });

            Lampa.Listener.follow('torrent', function(e) {
                if (e.type === 'start') {
                    console.log("[PlayerInfoLogo] Новый торрент");
                    forceUpdateLogo();
                }
            });

            console.log("[PlayerInfoLogo] События подключены");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка событий:", e.message);
    }

    // DOM Observer с улучшенной логикой
    var observer = new MutationObserver(function(mutations) {
        var shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && (
                            node.classList.contains('player-info__name') ||
                            node.classList.contains('player-footer-card__title') ||
                            $(node).find('.player-info__name, .player-footer-card__title').length
                        )) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        
        if (shouldUpdate) {
            console.log("[PlayerInfoLogo] DOM изменился");
            setTimeout(forceUpdateLogo, 500);
        }
    });

    // Запуск observer
    try {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log("[PlayerInfoLogo] Observer запущен");
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка Observer:", e.message);
    }

    // Инициализация
    try {
        setTimeout(function checkDOM() {
            console.log("[PlayerInfoLogo] Проверка DOM");
            displayPlayerInfoLogo();
            if (!$(".player-info__name").length) {
                setTimeout(checkDOM, 2000);
            }
        }, 1500);
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка инициализации:", e.message);
    }

    // Периодическая проверка (увеличил интервал до 10 секунд)
    setInterval(function() {
        if ($(".player-info__name").length && !$(".player-info__logo").length && !isLoading) {
            console.log("[PlayerInfoLogo] Периодическая проверка: логотип отсутствует");
            displayPlayerInfoLogo();
        }
    }, 10000);
}();
