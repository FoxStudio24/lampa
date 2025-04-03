!function() {
    "use strict";
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
    }),
    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type && "1" != Lampa.Storage.get("logo_glav")) {
            var e = a.data.movie;
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            // Убираем параметр language, чтобы получить все логотипы
            var t = Lampa.TMDB.api(apiPath + "/images?api_key=" + Lampa.TMDB.key());
            console.log("API URL:", t);
            $.get(t, (function(e) {
                if (e.logos && e.logos.length > 0) {
                    console.log("Все логотипы:", e.logos);
                    // Ищем русский логотип
                    var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                    if (!logo) {
                        // Если нет русского, ищем английский
                        logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                        console.log("Английский логотип:", logo ? "найден" : "не найден");
                    }
                    if (!logo) {
                        // Если нет ни русского, ни английского, берём первый доступный
                        logo = e.logos[0];
                        console.log("Взят первый доступный логотип:", logo);
                    }
                    if (logo && logo.file_path) {
                        var logoPath = Lampa.TMDB.image("/t/p/w300" + logo.file_path.replace(".svg", ".png"));
                        console.log("Отображаем логотип:", logoPath);
                        a.object.activity.render().find(".full-start-new__title").html(
                            '<img style="margin-top: 5px; max-height: 125px;" src="' + logoPath + '" />'
                        );
                    } else {
                        console.log("Логотип невалидный (нет file_path):", logo);
                    }
                } else {
                    console.log("Логотипы отсутствуют для:", e.title || e.name);
                }
            }))
        }
    })))
}();
