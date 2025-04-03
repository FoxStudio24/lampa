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
            // Определяем тип контента: фильм или сериал
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            var t = Lampa.TMDB.api(apiPath + "/images?api_key=" + Lampa.TMDB.key() + "&language=" + Lampa.Storage.get("language"));
            console.log(t),
            $.get(t, (function(e) {
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
                        // Получаем русское название (name для сериалов, title для фильмов)
                        var title = isSerial ? e.name : e.title;
                        // Формируем HTML: логотип слева, текст справа
                        a.object.activity.render().find(".full-start-new__title").html(
                            '<div style="display: flex; align-items: center;">' +
                                '<img style="margin-top: 5px; max-height: 125px;" src="' + logoPath + '" />' +
                                '<span style="margin-left: 10px; font-size: 16px; color: #fff;">' + title + '</span>' +
                            '</div>'
                        );
                    }
                }
            }))
        }
    })))
}();
