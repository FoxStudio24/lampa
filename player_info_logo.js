!function() {
    "use strict";

    // Проверяем наличие jQuery
    if (typeof $ === "undefined") {
        console.error("[PlayerInfoLogo] Ошибка: jQuery не найден");
        return;
    }

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

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            if (Lampa && Lampa.Storage && Lampa.Storage.get("player_info_logo") === "1") {
                console.log("[PlayerInfoLogo] Логотипы отключены");
                return;
            }

            // Проверяем наличие элементов
            var $playerInfoName = $(".player-info__name");
            console.log("[PlayerInfoLogo] .player-info__name найден:", !!$playerInfoName.length);
            if (!$playerInfoName.length) {
                console.log("[PlayerInfoLogo] .player-info__name не найден");
                return;
            }

            // Ищем заголовок
            var $playerTitle = $(".player-footer-card__title");
            if (!$playerTitle.length) {
                console.log("[PlayerInfoLogo] .player-footer-card__title не найден, ищем запасные");
                $playerTitle = $(".card__title, .player-title, .media-title, .title, [class*=title]");
                console.log("[PlayerInfoLogo] Запасной заголовок найден:", !!$playerTitle.length);
            }

            // Получаем название
            var title = $playerTitle.length ? $playerTitle.text().trim() : "";
            console.log("[PlayerInfoLogo] Название:", title || "не найдено");
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое");
                return;
            }

            // Удаляем старый логотип
            $(".player-info__logo").remove();
            console.log("[PlayerInfoLogo] Старый логотип удален");

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
                                var logoHtml = '<div class="player-info__logo" style="display: flex; justify-content: center; align-items: center; width: 100%; margin-bottom: 5px;">' +
                                    '<img style="max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); animation: fadeIn 0.5s ease-in;" src="' + logoPath + '" />' +
                                    '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

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

    // Подписка на события Lampa
    try {
        if (Lampa && Lampa.Listener) {
            Lampa.Listener.follow('player', function(e) {
                console.log("[PlayerInfoLogo] Событие плеера:", e.type);
                setTimeout(displayPlayerInfoLogo, 1500);
            });
            Lampa.Listener.follow('card', function(e) {
                console.log("[PlayerInfoLogo] Событие карточки:", e.type);
                setTimeout(displayPlayerInfoLogo, 1500);
            });
            console.log("[PlayerInfoLogo] Подписка на события установлена");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка подписки:", e.message);
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
}();
