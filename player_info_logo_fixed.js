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

    // Функция создания обычного логотипа
    function createImageLogo(logoPath) {
        var logoId = ++uniqueLogoId;
        var logoHtml = '<div class="player-info__logo" data-logo-id="' + logoId + '">' +
            '<img src="' + logoPath + '" alt="Logo" style="max-height: 120px; max-width: 400px;" />' +
            '</div>';
        return logoHtml;
    }

    // Улучшенная функция поиска с очень строгими критериями
    function findBestMatch(results, originalTitle) {
        if (!results || results.length === 0) return null;
        
        var cleanOriginal = originalTitle.toLowerCase()
            .replace(/\s*\(\d{4}\).*$/, '')
            .replace(/\s*s\d+.*$/i, '')
            .replace(/\s*сезон.*$/i, '')
            .replace(/[^\w\s]/g, '')
            .trim();
        
        console.log("[PlayerInfoLogo] Ищем для:", cleanOriginal);
        
        // Ищем только точные совпадения
        for (var i = 0; i < results.length; i++) {
            var item = results[i];
            var title = (item.title || item.name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();
            var originalTitle = (item.original_title || item.original_name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();
            
            console.log("[PlayerInfoLogo] Проверяем:", title, "vs", cleanOriginal);
            
            // Только ТОЧНОЕ совпадение
            if (title === cleanOriginal || originalTitle === cleanOriginal) {
                console.log("[PlayerInfoLogo] Найдено точное совпадение:", item.title || item.name);
                return item;
            }
        }
        
        console.log("[PlayerInfoLogo] Точные совпадения не найдены");
        return null;
    }

    // Основная функция отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            console.log("[PlayerInfoLogo] Запуск displayPlayerInfoLogo");
            
            // Предотвращаем множественные запросы
            if (isLoading) {
                console.log("[PlayerInfoLogo] Уже загружается, пропускаем");
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
                    console.log("[PlayerInfoLogo] Таймаут загрузки - логотип не найден");
                    isLoading = false;
                }
            }, 5000); // Таймаут 5 секунд

            $.get(searchUrl).done(function(data) {
                if (!isLoading) return; // Если уже отработал таймаут
                
                console.log("[PlayerInfoLogo] TMDB поиск: результаты =", data.results ? data.results.length : 0);
                
                var bestMatch = findBestMatch(data.results, cleanTitle);
                
                if (!bestMatch) {
                    console.log("[PlayerInfoLogo] Подходящий результат не найден");
                    clearTimeout(logoTimeout);
                    isLoading = false;
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
                    
                    console.log("[PlayerInfoLogo] Логотип не найден в базе");
                }).fail(function() {
                    if (!isLoading) return;
                    
                    clearTimeout(logoTimeout);
                    isLoading = false;
                    console.error("[PlayerInfoLogo] Ошибка загрузки логотипов");
                });
            }).fail(function() {
                if (!isLoading) return;
                
                clearTimeout(logoTimeout);
                isLoading = false;
                console.error("[PlayerInfoLogo] Ошибка поиска TMDB");
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
