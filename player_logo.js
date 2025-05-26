!function() {
    "use strict";

    // Добавляем настройку в интерфейс Lampa
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

    // Функция для получения и отображения логотипа
    function displayPlayerInfoLogo() {
        if ("1" == Lampa.Storage.get("player_info_logo")) {
            console.log("[PlayerInfoLogo] Логотипы отключены в настройках");
            return;
        }

        // Проверяем наличие элементов
        var $playerTitle = $(".player-footer-card__title");
        var $playerInfoName = $(".player-info__name");
        if (!$playerTitle.length) {
            console.log("[PlayerInfoLogo] Элемент .player-footer-card__title не найден в DOM");
            return;
        }
        if (!$playerInfoName.length) {
            console.log("[PlayerInfoLogo] Элемент .player-info__name не найден в DOM");
            return;
        }

        // Получаем название из .player-footer-card__title
        var title = $playerTitle.text().trim();
        console.log("[PlayerInfoLogo] Название из .player-footer-card__title:", title);
        if (!title) {
            console.log("[PlayerInfoLogo] Название пустое, пропускаем");
            return;
        }

        // Удаляем старый логотип
        $(".player-info__logo").remove();
        console.log("[PlayerInfoLogo] Старый логотип удален");

        // Запрашиваем ID фильма/сериала через TMDB Search API
        var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
        var searchUrl = "https://api.themoviedb.org/3/search/multi?api_key=" + apiKey + "&query=" + encodeURIComponent(title) + "&language=ru";
        console.log("[PlayerInfoLogo] API URL для поиска:", searchUrl);

        $.get(searchUrl, function(data) {
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
                    if (e.logos && e.logos.length > 0) {
                        console.log("[PlayerInfoLogo] Все логотипы:", JSON.stringify(e.logos));
                        var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                        if (!logo) {
                            logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                            console.log("[PlayerInfoLogo] Английский логотип:", logo ? "найден" : "не найден");
                        }
                        if (!logo) {
                            logo = e.logos[0];
                            console.log("[PlayerInfoLogo] Взят первый доступный логотип:", JSON.stringify(logo));
                        }
                        if (logo && logo.file_path) {
                            var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                            console.log("[PlayerInfoLogo] Отображаем логотип:", logoPath);

                            // HTML для логотипа
                            var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                                '<img style="margin-bottom: 5px; max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" src="' + logoPath + '" />' +
                                '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                            // Добавление логотипа перед .player-info__name
                            $playerInfoName.each(function() {
                                var $this = $(this);
                                $this.before(
                                    '<div class="player-info__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>'
                                );
                                console.log("[PlayerInfoLogo] Логотип добавлен перед .player-info__name для:", title);
                            });
                        } else {
                            console.log("[PlayerInfoLogo] Логотип невалидный (нет file_path):", JSON.stringify(logo));
                        }
                    } else {
                        console.log("[PlayerInfoLogo] Логотипы отсутствуют для:", title);
                    }
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    console.log("[PlayerInfoLogo] Ошибка TMDB API (логотипы):", textStatus, errorThrown, "Статус:", jqXHR.status);
                });
            } else {
                console.log("[PlayerInfoLogo] Контент не найден в TMDB для названия:", title);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log("[PlayerInfoLogo] Ошибка TMDB API (поиск):", textStatus, errorThrown, "Статус:", jqXHR.status);
        });
    }

    // Постоянная проверка каждые 500 мс
    setInterval(function() {
        console.log("[PlayerInfoLogo] Проверка наличия .player-footer-card__title и .player-info__name");
        displayPlayerInfoLogo();
    }, 500);

    // Наблюдение за изменениями в .player-footer__body
    function observePlayerFooter() {
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
    }

    // Проверка при загрузке DOM
    if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("[PlayerInfoLogo] DOM загружен, запускаем проверку и наблюдение");
        displayPlayerInfoLogo();
        observePlayerFooter();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("[PlayerInfoLogo] DOM загружен, запускаем проверку и наблюдение");
            displayPlayerInfoLogo();
            observePlayerFooter();
        });
    }
}();
