!function() {
    "use strict";
    // Добавляем CSS-правила для переопределения стилей логотипа
    $('<style>')
        .text(`
            .full-start-new__title img {
                max-height: 200px !important;
                width: auto !important;
                height: auto !important;
            }
        `)
        .appendTo('head');

    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "logo_glav",
            type: "select",
            values: { 1: "Скрыть", 0: "Отображать" },
            default: "0"
        },
        field: {
            name: "Логотипы вместо названий 2.0",
            description: "Отображает логотипы фильмов и сериаллов вместо текста"
        }
    }),
    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type && "1" != Lampa.Storage.get("logo_glav")) {
            var e = a.data.movie;
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            var currentLampaLang = Lampa.Storage.get('language') || 'en';
            
            var t = Lampa.TMDB.api(apiPath + "/images?api_key=" + Lampa.TMDB.key());
            console.log("API URL для логотипов:", t);
            $.get(t, (function(e_images) {
                if (e_images.logos && e_images.logos.length > 0) {
                    console.log("Все логотипы:", e_images.logos);
                    var logo = null;
                    var logoLang = null;

                    logo = e_images.logos.find(function(l) { return l.iso_639_1 === currentLampaLang; });
                    if (logo) logoLang = currentLampaLang;
                    console.log("Логотип на текущем языке Lampa (" + currentLampaLang + "):", logo ? "найден" : "не найден");

                    if (!logo && currentLampaLang !== 'ru') {
                        logo = e_images.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                        if (logo) logoLang = 'ru';
                        console.log("Русский логотип:", logo ? "найден" : "не найден");
                    }

                    if (!logo && currentLampaLang !== 'en') {
                        logo = e_images.logos.find(function(l) { return l.iso_639_1 === "en"; });
                        if (logo) logoLang = 'en';
                        console.log("Английский логотип:", logo ? "найден" : "не найден");
                    }
                    
                    if (!logo) {
                        logo = e_images.logos[0];
                        if (logo) logoLang = logo.iso_639_1;
                        console.log("Взят первый доступный логотип:", logo);
                    }

                    if (logo && logo.file_path) {
                        var logoPath = Lampa.TMDB.image("/t/p/w300" + logo.file_path.replace(".svg", ".png"));
                        console.log("Отображаем логотип:", logoPath);

                        var showTextTitle = logoLang !== currentLampaLang;

                        if (showTextTitle) {
                            var titleApi = Lampa.TMDB.api(apiPath + "?api_key=" + Lampa.TMDB.key() + "&language=" + currentLampaLang);
                            console.log("API URL для названия:", titleApi);
                            $.get(titleApi, (function(data) {
                                var localizedTitle = isSerial ? data.name : data.title;
                                console.log("Название на языке Lampa (" + currentLampaLang + "):", localizedTitle);
                                var htmlContent = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.9s ease-in;">' +
                                                    '<img style="margin-top: 5px;" src="' + logoPath + '" />';
                                if (localizedTitle) {
                                    htmlContent += '<span style="margin-top: 5px; font-size: 32px; color: #fff;">' + localizedTitle + '</span>';
                                }
                                htmlContent += '</div>' +
                                                '<style>' +
                                                    '@keyframes fadeIn {' +
                                                        'from { opacity: 0; }' +
                                                        'to { opacity: 1; }' +
                                                    '}' +
                                                '</style>';
                                a.object.activity.render().find(".full-start-new__title").html(htmlContent);
                            }));
                        } else {
                            a.object.activity.render().find(".full-start-new__title").html(
                                '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                                    '<img style="margin-top: 5px;" src="' + logoPath + '" />' +
                                '</div>' +
                                '<style>' +
                                    '@keyframes fadeIn {' +
                                        'from { opacity: 0; }' +
                                        'to { opacity: 1; }' +
                                    '}' +
                                '</style>'
                            );
                        }
                    } else {
                        console.log("Логотип невалидный (нет file_path):", logo);
                    }
                } else {
                    console.log("Логотипы отсутствуют для:", e_images.title || e_images.name);
                }
            }))
        }
    })))
}();
