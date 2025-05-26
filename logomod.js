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
    function displayPlayerLogo(movie, render) {
        if ("1" == Lampa.Storage.get("player_logo")) {
            console.log("Логотипы в плеере отключены в настройках");
            return;
        }

        var isSerial = movie.name || movie.first_air_date;
        var apiPath = isSerial ? "tv/" + movie.id : "movie/" + movie.id;
        var apiKey = "06936145fe8e20be28b02e26b55d3ce6";
        var t = "https://api.themoviedb.org/3/" + apiPath + "/images?api_key=" + apiKey;
        console.log("API URL для логотипов:", t);

        $.get(t, function(e) {
            if (e.logos && e.logos.length > 0) {
                console.log("Все логотипы:", e.logos);
                var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                if (!logo) {
                    logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                    console.log("Английский логотип:", logo ? "найден" : "не найден");
                }
                if (!logo) {
                    logo = e.logos[0];
                    console.log("Взят первый доступный логотип:", logo);
                }
                if (logo && logo.file_path) {
                    var logoPath = "https://image.tmdb.org/t/p/w300" + logo.file_path.replace(".svg", ".png");
                    console.log("Отображаем логотип:", logoPath);

                    // HTML для логотипа
                    var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                        '<img style="margin-bottom: 5px; max-height: 125px;" src="' + logoPath + '" />' +
                        '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                    // Добавление логотипа перед player-footer-card__title
                    render.find(".player-footer-card__title").each(function() {
                        var $this = $(this);
                        if ($this.find(".player-footer-card__logo").length === 0) {
                            $this.before(
                                '<div class="player-footer-card__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>'
                            );
                            console.log("Логотип добавлен перед player-footer-card__title в плеере");
                        } else {
                            console.log("Логотип уже существует в player-footer-card__title");
                        }
                    });
                } else {
                    console.log("Логотип невалидный (нет file_path):", logo);
                }
            } else {
                console.log("Логотипы отсутствуют для:", movie.title || movie.name);
            }
        }).fail(function() {
            console.log("Ошибка при запросе к TMDB API для:", movie.title || movie.name);
        });
    }

    // Используем MutationObserver для отслеживания появления player-footer-card__title
    function observePlayer() {
        var observer = new MutationObserver(function(mutations, obs) {
            var playerTitle = document.querySelector(".player-footer-card__title");
            if (playerTitle && !playerTitle.parentNode.querySelector(".player-footer-card__logo")) {
                console.log("Обнаружен player-footer-card__title в плеере");
                var movie = Lampa.Player && Lampa.Player.data ? Lampa.Player.data.movie : null;
                if (movie) {
                    console.log("Фильм для плеера:", movie);
                    displayPlayerLogo(movie, $(document));
                } else {
                    console.log("Данные о фильме в плеере недоступны");
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запускаем наблюдатель при загрузке
    if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("DOM загружен, запускаем наблюдатель для плеера");
        observePlayer();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM загружен, запускаем наблюдатель для плеера");
            observePlayer();
        });
    }
}();
