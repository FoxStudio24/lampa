!function() {
    "use strict";

    // Проверяем наличие jQuery
    if (typeof $ === "undefined") {
        console.error("[PlayerInfoLogo] Ошибка: jQuery не найден");
        return;
    }

    // Добавляем настройку в интерфейс Lampa
    try {
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
        console.log("[PlayerInfoLogo] Настройка player_info_logo добавлена");
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при добавлении настройки:", e.message);
    }

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            if ("1" == Lampa.Storage.get("player_info_logo")) {
                console.log("[PlayerInfoLogo] Логотипы отключены в настройках");
                return;
            }

            // Проверяем наличие элементов
            var $playerTitle = $(".player-footer-card__title");
            var $playerInfoName = $(".player-info__name");
            console.log("[PlayerInfoLogo] Поиск элементов: .player-footer-card__title =", !!$playerTitle.length, ", .player-info__name =", !!$playerInfoName.length);
            if (!$playerTitle.length || !$playerInfoName.length) {
                console.log("[PlayerInfoLogo] Один из элементов не найден в DOM");
                return;
            }

            // Получаем название
            var title = $playerTitle.text().trim();
            console.log("[PlayerInfoLogo] Название из .player-footer-card__title:", title);
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое, пропускаем");
                return;
            }

            // Проверяем наличие логотипа
            if ($playerInfoName.parent().find(".player-info__logo").length) {
                console.log("[PlayerInfoLogo] Логотип уже существует, пропускаем");
                return;
            }

            // Запрашиваем ID через TMDB Search API
            var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
            var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title) + "&language=ru";
            console.log("[PlayerInfoLogo] API URL для поиска:", searchUrl);

            $.get(searchUrl, function(data) {
                console.log("[PlayerInfoLogo] Ответ TMDB (поиск):", data);
                if (data.results && data.results.length > 0) {
                    var result = data.results[0];
                    var isSerial = result.media_type === "tv";
                    var id = result.id;
                    console.log("[PlayerInfoLogo] Найден контент:", result.media_type, "ID:", id);

                    // Запрашиваем логотип
                    var apiPath = isSerial ? "tv/" + id : "movie/" + id;
                    var logoUrl = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;
                    console.log("[PlayerInfoLogo] API URL для логотипов:", logoUrl);

                    $.get(logoUrl, function(e) {
                        console.log("[PlayerInfoLogo] Ответ TMDB (логотипы):", e);
                        if (e.logos && e.logos.length > 0) {
                            var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; }) ||
                                       e.logos.find(function(l) { return l.iso_639_1 === "en"; }) ||
                                       e.logos[0];
                            if (logo && logo.file_path) {
                                var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                                console.log("[PlayerInfoLogo] Отображаем логотип:", logoPath);

                                // HTML для логотипа
                                var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                                    '<img style="margin-bottom: 5px; max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" src="' + logoPath + '" />' +
                                    '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                                // Добавление логотипа
                                $playerInfoName.each(function() {
                                    var $this = $(this);
                                    $this.before(
                                        '<div class="player-info__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>'
                                    );
                                    console.log("[PlayerInfoLogo] Логотип добавлен для:", title);
                                });
                            } else {
                                console.log("[PlayerInfoLogo] Логотип невалидный (нет file_path)");
                            }
                        } else {
                            console.log("[PlayerInfoLogo] Логотипы отсутствуют для:", title);
                        }
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        console.error("[PlayerInfoLogo] Ошибка TMDB API (логотипы):", textStatus, errorThrown, "Статус:", jqXHR.status);
                    });
                } else {
                    console.log("[PlayerInfoLogo] Контент не найден в TMDB для:", title);
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.error("[PlayerInfoLogo] Ошибка TMDB API (поиск):", textStatus, errorThrown, "Статус:", jqXHR.status);
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка в displayPlayerInfoLogo:", e.message);
        }
    }

    // Наблюдение за изменениями
    function observePlayerFooter() {
        try {
            var target = document.querySelector(".player-footer__body");
            if (!target) {
                console.log("[PlayerInfoLogo] Элемент .player-footer__body не найден для наблюдения");
                return;
            }

            var observer = new MutationObserver(function(mutations) {
                console.log("[PlayerInfoLogo] Обнаружены изменения в .player-footer__body");
                displayPlayerInfoLogo();
            });
            observer.observe(target, { childList: true, subtree: true });
            console.log("[PlayerInfoLogo] MutationObserver запущен для .player-footer__body");
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка в observePlayerFooter:", e.message);
        }
    }

    // Периодическая проверка каждые 2 секунды
    setInterval(function() {
        console.log("[PlayerInfoLogo] Периодическая проверка DOM");
        displayPlayerInfoLogo();
    }, 2000);

    // Запуск
    try {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            console.log("[PlayerInfoLogo] DOM загружен, запускаем");
            displayPlayerInfoLogo();
            observePlayerFooter();
        } else {
            document.addEventListener("DOMContentLoaded", function() {
                console.log("[PlayerInfoLogo] DOM загружен, запускаем");
                displayPlayerInfoLogo();
                observePlayerFooter();
            });
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при инициализации:", e.message);
    }
}();
