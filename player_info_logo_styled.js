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
        /* Название под логотипом + нормальный цвет */
        .player-info__name {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            padding: 10px !important;
            color: white !important;
        }
        /* Центрирование содержимого блока player-info__values */
        .player-info__values {
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            width: 100% !important;
            margin-top: 8px !important;
        }
        /* Убрать фон и блюр у .player-info */
        .player-info {
            background: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
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

    // Переменная для хранения текущего названия
    var currentTitle = "";
    var logoLoadTimeout = null;

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo(forceReload) {
        try {
            // Очищаем предыдущий таймаут
            if (logoLoadTimeout) {
                clearTimeout(logoLoadTimeout);
            }

            if (Lampa && Lampa.Storage && Lampa.Storage.get("player_info_logo") === "1") {
                console.log("[PlayerInfoLogo] Логотипы отключены");
                // Удаляем логотип если отключен
                $(".player-info__logo").remove();
                currentTitle = "";
                return;
            }

            // Проверяем наличие элементов
            var $playerInfoName = $(".player-info__name");
            console.log("[PlayerInfoLogo] .player-info__name найден:", !!$playerInfoName.length);
            if (!$playerInfoName.length) {
                console.log("[PlayerInfoLogo] .player-info__name не найден");
                return;
            }

            // Ищем заголовок в разных местах
            var $playerTitle = $(".player-footer-card__title");
            if (!$playerTitle.length) {
                console.log("[PlayerInfoLogo] .player-footer-card__title не найден, ищем запасные");
                $playerTitle = $(".card__title, .player-title, .media-title, .title, [class*=title], .player-info__name");
                console.log("[PlayerInfoLogo] Запасной заголовок найден:", !!$playerTitle.length);
            }

            // Получаем название
            var title = "";
            if ($playerTitle.length) {
                title = $playerTitle.first().text().trim();
                // Очищаем название от лишних символов и информации
                title = title.replace(/\s*\(\d{4}\).*$/, '').replace(/\s*S\d+.*$/i, '').replace(/\s*Сезон.*$/i, '').trim();
            }
            
            console.log("[PlayerInfoLogo] Название:", title || "не найдено");
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое");
                // Удаляем логотип если название пустое
                $(".player-info__logo").remove();
                currentTitle = "";
                return;
            }

            // Проверяем, изменилось ли название
            if (currentTitle === title && !forceReload) {
                console.log("[PlayerInfoLogo] Название не изменилось, логотип уже актуальный");
                // Но все равно проверим, есть ли логотип на странице
                if (!$(".player-info__logo").length) {
                    console.log("[PlayerInfoLogo] Логотип отсутствует, загружаем заново");
                } else {
                    return;
                }
            }

            // Обновляем текущее название
            currentTitle = title;

            // Всегда удаляем старый логотип при смене контента
            $(".player-info__logo").remove();
            console.log("[PlayerInfoLogo] Старый логотип удален, загружаем новый для:", title);

            // Запрашиваем ID через TMDB Search API
            var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
            var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title) + "&language=ru";

            $.get(searchUrl).done(function(data) {
                console.log("[PlayerInfoLogo] TMDB поиск: результаты =", data.results ? data.results.length : 0);
                if (data.results && data.results.length > 0) {
                    var result = data.results[0];
                    var isSerial = result.media_type === "tv";
                    var id = result.id;

                    // Запрашиваем логотип
                    var apiPath = isSerial ? "tv/" + id : "movie/" + id;
                    var logoUrl = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;

                    $.get(logoUrl).done(function(e) {
                        console.log("[PlayerInfoLogo] TMDB логотипы: найдено =", e.logos ? e.logos.length : 0);
                        if (e.logos && e.logos.length > 0) {
                            var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; }) ||
                                       e.logos.find(function(l) { return l.iso_639_1 === "en"; }) ||
                                       e.logos[0];
                            if (logo && logo.file_path) {
                                var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");

                                // HTML для логотипа (упрощенный, так как стили теперь в CSS)
                                var logoHtml = '<div class="player-info__logo">' +
                                    '<img src="' + logoPath + '" />' +
                                    '</div>';

                                // Добавление логотипа
                                $playerInfoName.before(logoHtml);
                                console.log("[PlayerInfoLogo] Логотип добавлен для:", title);
                            }
                        }
                    }).fail(function(jqXHR) {
                        console.error("[PlayerInfoLogo] Ошибка TMDB API (логотипы):", jqXHR.status);
                    });
                }
            }).fail(function(jqXHR) {
                console.error("[PlayerInfoLogo] Ошибка TMDB API (поиск):", jqXHR.status);
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка:", e.message);
        }
    }

    // Функция для принудительной очистки логотипа
    function clearLogo() {
        $(".player-info__logo").remove();
        currentTitle = "";
        if (logoLoadTimeout) {
            clearTimeout(logoLoadTimeout);
            logoLoadTimeout = null;
        }
        console.log("[PlayerInfoLogo] Логотип принудительно очищен");
    }

    // Функция отложенной загрузки логотипа
    function delayedLogoLoad(delay, forceReload) {
        if (logoLoadTimeout) {
            clearTimeout(logoLoadTimeout);
        }
        logoLoadTimeout = setTimeout(function() {
            displayPlayerInfoLogo(forceReload);
        }, delay || 1500);
    }

    // Подписка на события Lampa
    try {
        if (Lampa && Lampa.Listener) {
            // Очищаем логотип при начале загрузки нового контента
            Lampa.Listener.follow('player', function(e) {
                console.log("[PlayerInfoLogo] Событие плеера:", e.type);
                if (e.type === 'start' || e.type === 'loading' || e.type === 'play') {
                    clearLogo();
                }
                delayedLogoLoad(2000, true);
            });
            
            Lampa.Listener.follow('card', function(e) {
                console.log("[PlayerInfoLogo] Событие карточки:", e.type);
                if (e.type === 'start' || e.type === 'loading' || e.type === 'open') {
                    clearLogo();
                }
                delayedLogoLoad(2000, true);
            });

            // Дополнительные события для надежности
            Lampa.Listener.follow('activity', function(e) {
                if (e.type === 'start' || e.type === 'change') {
                    console.log("[PlayerInfoLogo] Активность изменилась, очищаем логотип");
                    clearLogo();
                    delayedLogoLoad(2500, true);
                }
            });

            // Отслеживаем изменения в DOM
            var observer = new MutationObserver(function(mutations) {
                var shouldUpdate = false;
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        // Проверяем изменения в элементах с названиями
                        var relevantChange = $(mutation.target).find('.player-info__name, .player-footer-card__title, .card__title').length > 0 ||
                                           $(mutation.target).is('.player-info__name, .player-footer-card__title, .card__title');
                        if (relevantChange) {
                            shouldUpdate = true;
                        }
                    }
                    if (mutation.type === 'characterData') {
                        var parent = $(mutation.target).parent();
                        if (parent.is('.player-info__name, .player-footer-card__title, .card__title')) {
                            shouldUpdate = true;
                        }
                    }
                });
                
                if (shouldUpdate) {
                    console.log("[PlayerInfoLogo] DOM изменился, обновляем логотип");
                    clearLogo();
                    delayedLogoLoad(1000, true);
                }
            });

            // Наблюдаем за изменениями в body
            if (document.body) {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }

            console.log("[PlayerInfoLogo] Подписка на события установлена");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка подписки:", e.message);
    }

    // Запуск с задержкой
    try {
        setTimeout(function checkDOM() {
            console.log("[PlayerInfoLogo] Проверка DOM");
            displayPlayerInfoLogo(true);
            if (!$(".player-info__name").length) {
                setTimeout(checkDOM, 2000);
            }
        }, 1500);

        // Дополнительная проверка через больший интервал
        setInterval(function() {
            var $playerInfoName = $(".player-info__name");
            if ($playerInfoName.length && !$(".player-info__logo").length) {
                console.log("[PlayerInfoLogo] Периодическая проверка - логотип отсутствует, загружаем");
                displayPlayerInfoLogo(true);
            }
        }, 5000);
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка инициализации:", e.message);
    }
}();
