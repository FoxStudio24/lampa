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
            console.log("[PlayerInfoLogo] Настройка player_info_logo добавлена");
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
                console.log("[PlayerInfoLogo] Логотипы отключены в настройках");
                return;
            }

            // Проверяем наличие элементов
            var $playerTitle = $(".player-footer-card__title");
            var $playerInfoName = $(".player-info__name");
            console.log("[PlayerInfoLogo] Элементы найдены: title =", !!$playerTitle.length, ", name =", !!$playerInfoName.length);
            if (!$playerTitle.length || !$playerInfoName.length) {
                console.log("[PlayerInfoLogo] Элементы не найдены, пропускаем");
                return;
            }

            // Получаем название
            var title = $playerTitle.text().trim();
            console.log("[PlayerInfoLogo] Название:", title);
            if (!title) {
                console.log("[PlayerInfoLogo] Название пустое, пропускаем");
                return;
            }

            // Удаляем старый логотип
            $(".player-info__logo").remove();
            console.log("[PlayerInfoLogo] Старый логотип удален");

            // Запрашиваем ID через TMDB Search API
            var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
            var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title) + "&language=ru";
            console.log("[PlayerInfoLogo] Запрос к TMDB:", searchUrl);

            $.get(searchUrl).done(function(data) {
                console.log("[PlayerInfoLogo] TMDB поиск: результаты =", data.results ? data.results.length : 0);
                if (data.results && data.results.length > 0) {
                    var result = data.results[0];
                    var isSerial = result.media_type === "tv";
                    var id = result.id;
                    console.log("[PlayerInfoLogo] Контент:", result.media_type, "ID:", id);

                    // Запрашиваем логотип
                    var apiPath = isSerial ? "tv/" + id : "movie/" + id;
                    var logoUrl = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;
                    console.log("[PlayerInfoLogo] Запрос логотипов:", logoUrl);

                    $.get(logoUrl).done(function(e) {
                        console.log("[PlayerInfoLogo] TMDB логотипы: найдено =", e.logos ? e.logos.length : 0);
                        if (e.logos && e.logos.length > 0) {
                            var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; }) ||
                                       e.logos.find(function(l) { return l.iso_639_1 === "en"; }) ||
                                       e.logos[0];
                            if (logo && logo.file_path) {
                                var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                                console.log("[PlayerInfoLogo] Логотип:", logoPath);

                                // HTML для логотипа
                                var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                                    '<img style="margin-bottom: 5px; max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" src="' + logoPath + '" />' +
                                    '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                                // Добавление логотипа
                                $playerInfoName.each(function() {
                                    $(this).before('<div class="player-info__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>');
                                });
                                console.log("[PlayerInfoLogo] Логотип добавлен для:", title);
                            } else {
                                console.log("[PlayerInfoLogo] Логотип невалидный");
                            }
                        } else {
                            console.log("[PlayerInfoLogo] Логотипы не найдены");
                        }
                    }).fail(function(jqXHR) {
                        console.error("[PlayerInfoLogo] Ошибка TMDB API (логотипы), Статус:", jqXHR.status);
                    });
                } else {
                    console.log("[PlayerInfoLogo] Контент не найден в TMDB");
                }
            }).fail(function(jqXHR) {
                console.error("[PlayerInfoLogo] Ошибка TMDB API (поиск), Статус:", jqXHR.status);
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Ошибка в displayPlayerInfoLogo:", e.message);
        }
    }

    // Подписка на события Lampa
    try {
        if (Lampa && Lampa.Listener) {
            Lampa.Listener.follow('player', function(e) {
                console.log("[PlayerInfoLogo] Событие плеера:", e.type);
                if (e.type === 'create' || e.type === 'update' || e.type === 'change') {
                    setTimeout(displayPlayerInfoLogo, 500);
                }
            });
            Lampa.Listener.follow('card', function(e) {
                console.log("[PlayerInfoLogo] Событие карточки:", e.type);
                if (e.type === 'select' || e.type === 'update') {
                    setTimeout(displayPlayerInfoLogo, 500);
                }
            });
            console.log("[PlayerInfoLogo] Подписка на события Lampa установлена");
        } else {
            console.error("[PlayerInfoLogo] Lampa.Listener не найден");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при подписке на события:", e.message);
    }

    // Легковесная периодическая проверка
    setInterval(function() {
        displayPlayerInfoLogo();
    }, 2000);

    // Запуск
    try {
        if (document.readyState === "complete" || document.readyState === "interactive") {
            console.log("[PlayerInfoLogo] DOM загружен, запуск");
            setTimeout(displayPlayerInfoLogo, 500);
        } else {
            document.addEventListener("DOMContentLoaded", function() {
                console.log("[PlayerInfoLogo] DOM загружен, запуск");
                setTimeout(displayPlayerInfoLogo, 500);
            });
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Ошибка при инициализации:", e.message);
    }
}();
