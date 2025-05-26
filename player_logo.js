!function() {
    "use strict";

    // Добавляем настройку в интерфейс Lampa
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "player_logo",
            type: "select",
            values: { 0: "Отображать", 1: "Скрыть" },
            default: "0"
        },
        field: {
            name: "Логотип в плеере",
            description: "Отображает логотип фильма или сериала над названием в плеере"
        }
    });

    // Функция для получения и отображения логотипа
    function displayPlayerLogo() {
        if ("1" == Lampa.Storage.get("player_logo")) {
            console.log("[PlayerLogo] Логотипы в плеере отключены в настройках");
            return;
        }

        // Проверяем наличие элемента
        var $playerTitle = $(".player-footer-card__title");
        if (!$playerTitle.length) {
            console.log("[PlayerLogo] Элемент .player-footer-card__title не найден в DOM");
            return;
        }

        // Проверяем, не добавлен ли уже логотип
        if ($playerTitle.parent().find(".player-footer-card__logo").length) {
            console.log("[PlayerLogo] Логотип уже существует над .player-footer-card__title");
            return;
        }

        // Пытаемся получить данные о фильме
        var movie = null;
        if (Lampa.Player && Lampa.Player.data && Lampa.Player.data.movie) {
            movie = Lampa.Player.data.movie;
            console.log("[PlayerLogo] Фильм найден в Lampa.Player.data.movie:", JSON.stringify(movie));
        } else if (Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active.movie) {
            movie = Lampa.Activity.active.movie;
            console.log("[PlayerLogo] Фильм найден в Lampa.Activity.active.movie:", JSON.stringify(movie));
        } else if (Lampa.Storage && Lampa.Storage.get("last_movie")) {
            movie = Lampa.Storage.get("last_movie");
            console.log("[PlayerLogo] Фильм найден в Lampa.Storage.last_movie:", JSON.stringify(movie));
        } else if (window.lampa_settings && window.lampa_settings.movie) {
            movie = window.lampa_settings.movie;
            console.log("[PlayerLogo] Фильм найден в window.lampa_settings.movie:", JSON.stringify(movie));
        } else {
            console.log("[PlayerLogo] Данные о фильме не найдены в Lampa.Player, Lampa.Activity, Lampa.Storage или window.lampa_settings");
            return;
        }

        // Проверяем наличие movie.id
        if (!movie.id) {
            console.log("[PlayerLogo] ID фильма отсутствует в данных:", JSON.stringify(movie));
            return;
        }

        // Определяем тип контента и путь API
        var isSerial = movie.name || movie.first_air_date;
        var apiPath = isSerial ? "tv/" + movie.id : "movie/" + movie.id;
        var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
        var t = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;
        console.log("[PlayerLogo] API URL для логотипов:", t);

        $.get(t, function(e) {
            if (e.logos && e.logos.length > 0) {
                console.log("[PlayerLogo] Все логотипы:", JSON.stringify(e.logos));
                var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                if (!logo) {
                    logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                    console.log("[PlayerLogo] Английский логотип:", logo ? "найден" : "не найден");
                }
                if (!logo) {
                    logo = e.logos[0];
                    console.log("[PlayerLogo] Взят первый доступный логотип:", JSON.stringify(logo));
                }
                if (logo && logo.file_path) {
                    var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                    console.log("[PlayerLogo] Отображаем логотип:", logoPath);

                    // HTML для логотипа с современным дизайном
                    var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                        '<img style="margin-bottom: 5px; max-height: 125px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" src="' + logoPath + '" />' +
                        '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                    // Добавление логотипа перед player-footer-card__title
                    $playerTitle.each(function() {
                        var $this = $(this);
                        $this.before(
                            '<div class="player-footer-card__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>'
                        );
                        console.log("[PlayerLogo] Логотип добавлен перед .player-footer-card__title для:", movie.title || movie.name);
                    });
                } else {
                    console.log("[PlayerLogo] Логотип невалидный (нет file_path):", JSON.stringify(logo));
                }
            } else {
                console.log("[PlayerLogo] Логотипы отсутствуют для:", movie.title || movie.name);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log("[PlayerLogo] Ошибка TMDB API:", textStatus, errorThrown, "Статус:", jqXHR.status);
        });
    }

    // Постоянная проверка каждые 500 мс
    setInterval(function() {
        console.log("[PlayerLogo] Проверка наличия .player-footer-card__title");
        displayPlayerLogo();
    }, 500);

    // Проверка при загрузке DOM
    if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("[PlayerLogo] DOM загружен, запускаем проверку");
        displayPlayerLogo();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("[PlayerLogo] DOM загружен, запускаем проверку");
            displayPlayerLogo();
        });
    }
}();
