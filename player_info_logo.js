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
        } else {
            console.error("[PlayerInfoLogo] Lampa или Lampa.SettingsApi не найдены");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при добавлении настройки:", e.message);
    }

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo() {
        try {
            if (Lampa && Lampa.Storage && Lampa.Storage.get("player_info_logo") === "1") {
                return;
            }

            // Проверяем наличие элементов
            var $playerTitle = $(".player-footer-card__title");
            var $playerInfoName = $(".player-info__name");
            if (!$playerTitle.length || !$playerInfoName.length) {
                return;
            }

            // Получаем название
            var title = $playerTitle.text().trim();
            if (!title) {
                return;
            }

            // Удаляем старый логотип
            $(".player-info__logo").remove();

            // Запрашиваем ID через TMDB Search API
            var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
            var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title) + "&language=ru";

            $.get(searchUrl).done(function(data) {
                if (data.results && data.results.length > 0) {
                    var result = data.results[0];
                    var isSerial = result.media_type === "tv";
                    var id = result.id;

                    // Запрашиваем логотип
                    var apiPath = isSerial ? "tv/" + id : "movie/" + id;
                    var logoUrl = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;

                    $.get(logoUrl).done(function(e) {
                        if (e.logos && e.logos.length > 0) {
                            var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; }) ||
                                       e.logos.find(function(l) { return l.iso_639_1 === "en"; }) ||
                                       e.logos[0];
                            if (logo && logo.file_path) {
                                var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");

                                // HTML для логотипа
                                var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                                    '<img style="margin-bottom: 5px; max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" src="' + logoPath + '" />' +
                                    '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                                // Добавление логотипа
                                $playerInfoName.each(function() {
                                    var $this = $(this);
                                    $this.before('<div class="player-info__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>');
                                });
                            }
                        }
                    }).fail(function(jqXHR) {
                        console.error("[PlayerInfoLogo] Ошибка TMDB API (логотипы), Статус:", jqXHR.status);
                    });
                }
            }).fail(function(jqXHR) {
                console.error("[PlayerInfoLogo] Ошибка TMDB API (поиск), Статус:", jqXHR.status);
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка в displayPlayerInfoLogo:", e.message);
        }
    }

    // Наблюдение за изменениями
    function observePlayerFooter() {
        try {
            var target = document.querySelector(".player-footer__body") || document.body;
            if (!target) {
                console.error("[PlayerInfoLogo] Элемент для наблюдения не найден");
                return;
            }

            var observer = new MutationObserver(function(mutations) {
                var titleChanged = mutations.some(function(mutation) {
                    return mutation.type === "childList" || mutation.type === "characterData";
                });
                if (titleChanged) {
                    displayPlayerInfoLogo();
                }
            });
            observer.observe(target, { childList: true, subtree: true, characterData: true });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка в observePlayerFooter:", e.message);
        }
    }

    // Запуск
    try {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            displayPlayerInfoLogo();
            observePlayerFooter();
        } else {
            document.addEventListener("DOMContentLoaded", function() {
                displayPlayerInfoLogo();
                observePlayerFooter();
            });
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при инициализации:", e.message);
    }
}();
