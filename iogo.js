!function() {
    "use strict";

    // Добавляем параметр в настройки Lampa
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: { 1: "Скрыть", 0: "Отображать" },
            default: "0"
        },
        field: {
            name: "Логотипы вместо названий",
            description: "Отображает логотипы фильмов вместо текста"
        }
    });

    // Проверяем, что плагин ещё не инициализирован
    if (!window.logoplugin) {
        window.logoplugin = true;

        // Подписываемся на событие "full"
        Lampa.Listener.follow("full", function(a) {
            if (a.type === "complite" && Lampa.Storage.get("logo_glav") !== "1") {
                var e = a.data.movie;
                // Определяем тип контента: фильм или сериал
                var isSerial = e.name || e.first_air_date;
                var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
                var t = Lampa.TMDB.api(apiPath + "/images?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language"));

                console.log(t);
                $.get(t, function(e) {
                    if (e.logos && e.logos[0]) {
                        var logoPath = e.logos[0].file_path;
                        if (logoPath !== "") {
                            // Стили для изображения
                            var imgStyle = "margin-top: 5px; max-height: 125px;";
                            // Стили для контейнера: масштабирование только на ПК
                            var containerStyle = window.innerWidth > 768 ? "transform: scale(2); transform-origin: top center;" : "";
                            a.object.activity.render().find(".full-start-new__title").css("cssText", containerStyle).html(
                                '<img style="' + imgStyle + '" src="' + 
                                Lampa.TMDB.image("/t/p/w300" + logoPath.replace(".svg", ".png")) + '" />'
                            );
                        }
                    }
                });
            }
        });
    }
}();
