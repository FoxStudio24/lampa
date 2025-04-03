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
                    if (e.logos && e.logos.length > 0) {
                        // Ищем русский логотип
                        var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                        // Если русского нет, берём английский
                        if (!logo) {
                            logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                        }
                        // Если логотип найден
                        if (logo && logo.file_path !== "") {
                            var logoPath = Lampa.TMDB.image("/t/p/w300" + logo.file_path.replace(".svg", ".png"));
                            // Получаем название на русском (title для фильмов, name для сериалов)
                            var title = isSerial ? e.name : e.title;
                            // Формируем HTML с логотипом и текстом под ним
                            a.object.activity.render().find(".full-start-new__title").html(
                                '<div style="text-align: center;">' +
                                    '<img style="margin-top: 5px; max-height: 125px;" src="' + logoPath + '" />' +
                                    '<div style="font-size: 14px; margin-top: 5px; color: #fff;">' + title + '</div>' +
                                '</div>'
                            );
                        }
                    }
                });
            }
        });
    }
}();