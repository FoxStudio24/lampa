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
            console.log("Логотипы в плеере отключены в настройках");
            return;
        }

        // Проверяем наличие элемента в DOM
        var $playerTitle = $(".player-footer-card__title");
        if (!$playerTitle.length) {
            console.log("Элемент .player-footer-card__title не найден в DOM");
            return;
        }

        // Проверяем, не добавлен ли уже логотип
        if ($playerTitle.parent().find(".player-footer-card__logo").length) {
            console.log("Логотип уже существует над player-footer-card__title");
            return;
        }

        // Пытаемся получить данные о фильме
        var movie = null;
        if (Lampa.Player && Lampa.Player.data && Lampa.Player.data.movie) {
            movie = Lampa.Player.data.movie;
            console.log("Фильм найден в Lampa.Player.data.movie:", movie);
        } else if (Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active.movie) {
            movie = Lampa.Activity.active.movie;
            console.log("Фильм найден в Lampa.Activity.active.movie:", movie);
        } else {
            console.log("Данные о фильме не найдены в Lampa.Player или Lampa.Activity");
            return;
        }

        // Определяем тип контента и путь API
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
                    $playerTitle.each(function() {
                        var $this = $(this);
                        $this.before(
                            '<div class="player-footer-card__logo" style="margin-bottom: 5px;">' + logoHtml + '</div>'
                        );
                        console.log("Логотип добавлен перед player-footer-card__title для:", movie.title || movie.name);
                    });
                } else {
                    console.log("Логотип невалидный (нет file_path):", logo);
                }
            } else {
                console.log("Логотипы отсутствуют для:", movie.title || movie.name);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.log("Ошибка TMDB API:", textStatus, errorThrown);
        });
    }

    // Периодическая проверка DOM
    var checkInterval = setInterval(function() {
        if ($(".player-footer-card__title").length) {
            console.log("Обнаружен player-footer-card__title, запускаем displayPlayerLogo");
            displayPlayerLogo();
        } else {
            console.log("Ожидание появления player-footer-card__title...");
        }
    }, 1000); // Проверяем каждую секунду

    // Останавливаем интервал через 30 секунд, если элемент не найден
    setTimeout(function() {
        clearInterval(checkInterval);
        console.log("Интервал проверки остановлен, .player-footer-card__title не найден");
    }, 30000);

    // Дополнительная проверка при загрузке DOM
    if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("DOM загружен, запускаем проверку");
        displayPlayerLogo();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM загружен, запускаем проверку");
            displayPlayerLogo();
        });
    }
}();