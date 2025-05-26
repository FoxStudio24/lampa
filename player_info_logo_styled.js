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

    // Переменная для хранения текущего названия и состояния
    var currentTitle = "";
    var isLoading = false;

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            console.log("[PlayerInfoLogo] Запуск displayPlayerInfoLogo");
            
            // Сбрасываем флаг загрузки в начале функции
            isLoading = false;
            
            // Предотвращаем множественные одновременные запросы
            if (isLoading) {
                console.log("[PlayerInfoLogo] Уже загружается, пропускаем");
                return;
            }

            if (Lampa && Lampa.Storage && Lampa.Storage.get("player_info_logo") === "1") {
                console.log("[PlayerInfoLogo] Логотипы отключены");
                $(".player-info__logo").remove();
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
                $playerTitle = $(".card__title, .player-title, .media-title, .title, [class*=title]");
                console.log("[PlayerInfoLogo] Запасной заголовок найден:", !!$playerTitle.length);
            }

            // Получаем название
            var title = $playerTitle.length ? $playerTitle.text().trim() : "";
            
            // Очищаем название от лишней информации
            if (title) {
                title = title.replace(/\s*\(\d{4}\).*$/, '').replace(/\s*S\d+.*$/i, '').replace(/\s*Сезон.*$/i, '').trim();
            }
            
            console.log("[PlayerInfoLogo] Текущее название:", title || "не найдено");
            console.log("[PlayerInfoLogo] Предыдущее название:", currentTitle);
            
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое");
                return;
            }

            // ВСЕГДА удаляем старый логотип при смене контента
            $(".player-info__logo").remove();
            console.log("[PlayerInfoLogo] Старый логотип удален");

            // Проверяем, изменилось ли название
            if (currentTitle === title) {
                console.log("[PlayerInfoLogo] Название не изменилось, но загружаем логотип заново");
            } else {
                console.log("[PlayerInfoLogo] Название изменилось с '" + currentTitle + "' на '" + title + "'");
            }

            // Устанавливаем флаг загрузки
            isLoading = true;
            currentTitle = title;

            console.log("[PlayerInfoLogo] Начинаем загрузку логотипа для:", title);

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

                                // HTML для логотипа
                                var logoHtml = '<div class="player-info__logo">' +
                                    '<img src="' + logoPath + '" />' +
                                    '</div>';

                                // Добавление логотипа
                                $playerInfoName.before(logoHtml);
                                console.log("[PlayerInfoLogo] Логотип добавлен для:", title);
                            }
                        } else {
                            console.log("[PlayerInfoLogo] Логотипы не найдены для:", title);
                        }
                        isLoading = false;
                    }).fail(function(jqXHR) {
                        console.error("[PlayerInfoLogo] Ошибка TMDB API (логотипы):", jqXHR.status);
                        isLoading = false;
                    });
                } else {
                    console.log("[PlayerInfoLogo] Результаты поиска не найдены для:", title);
                    isLoading = false;
                }
            }).fail(function(jqXHR) {
                console.error("[PlayerInfoLogo] Ошибка TMDB API (поиск):", jqXHR.status);
                isLoading = false;
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка:", e.message);
            isLoading = false;
        }
    }

    // Функция для полной очистки логотипа и сброса состояния
    function clearLogo() {
        $(".player-info__logo").remove();
        currentTitle = "";
        isLoading = false;
        console.log("[PlayerInfoLogo] Логотип и состояние очищены");
    }

    // Функция для принудительного обновления логотипа
    function forceUpdateLogo() {
        console.log("[PlayerInfoLogo] Принудительное обновление логотипа");
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
                    console.log("[PlayerInfoLogo] Активность изменилась, принудительно обновляем логотип");
                    forceUpdateLogo();
                } else if (e.type === 'destroy') {
                    clearLogo();
                }
            });

            // Дополнительное событие для отслеживания смены контента
            Lampa.Listener.follow('torrent', function(e) {
                if (e.type === 'start') {
                    console.log("[PlayerInfoLogo] Новый торрент, обновляем логотип");
                    forceUpdateLogo();
                }
            });

            console.log("[PlayerInfoLogo] Подписка на события установлена");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка подписки:", e.message);
    }

    // Отслеживание изменений в DOM
    var observer = new MutationObserver(function(mutations) {
        var shouldUpdate = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Проверяем, появились ли новые элементы с информацией о плеере
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
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
            console.log("[PlayerInfoLogo] DOM изменился, обновляем логотип");
            setTimeout(forceUpdateLogo, 500);
        }
    });

    // Запускаем observer для отслеживания изменений
    try {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        console.log("[PlayerInfoLogo] MutationObserver запущен");
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка MutationObserver:", e.message);
    }

    // Запуск с задержкой
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

    // Дополнительная проверка каждые 5 секунд для надежности
    setInterval(function() {
        if ($(".player-info__name").length && !$(".player-info__logo").length) {
            console.log("[PlayerInfoLogo] Периодическая проверка: логотип отсутствует, обновляем");
            displayPlayerInfoLogo();
        }
    }, 5000);
}();
