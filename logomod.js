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
            name: "Логотипы вместо названий 2.0",
            description: "Отображает логотипы фильмов и сериалов вместо текста"
        }
    });

    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type && "1" != Lampa.Storage.get("logo_glav")) {
            var e = a.data.movie;
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            var t = Lampa.TMDB.api(apiPath + "/images?api_key=" + Lampa.TMDB.key());
            console.log("API URL для логотипов:", t);
            $.get(t, (function(e) {
                if (e.logos && e.logos.length > 0) {
                    console.log("Все логотипы:", e.logos);
                    var logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                    var isRussianLogo = !!logo;
                    if (!logo) {
                        logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                        console.log("Английский логотип:", logo ? "найден" : "не найден");
                    }
                    if (!logo) {
                        logo = e.logos[0];
                        console.log("Взят первый доступный логотип:", logo);
                    }
                    if (logo && logo.file_path) {
                        var logoPath = Lampa.TMDB.image("/t/p/w300" + logo.file_path.replace(".svg", ".png"));
                        console.log("Отображаем логотип:", logoPath);

                        // Common HTML for logo display
                        var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                            '<img style="margin-top: 5px; max-height: 125px;" src="' + logoPath + '" />';

                        // Apply logo to full-start-new__title
                        if (!isRussianLogo) {
                            var titleApi = Lampa.TMDB.api(apiPath + "?api_key=" + Lampa.TMDB.key() + "&language=ru");
                            console.log("API URL для названия:", titleApi);
                            $.get(titleApi, (function(data) {
                                var russianTitle = isSerial ? data.name : data.title;
                                console.log("Русское название из TMDB:", russianTitle);
                                var titleHtml = russianTitle ? logoHtml + '<span style="margin-top: 5px; font-size: 32px; color: #fff;">' + russianTitle + '</span></div>' : logoHtml + '</div>';
                                titleHtml += '<style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                                // Update full-start-new__title
                                a.object.activity.render().find(".full-start-new__title").html(titleHtml);

                                // Update player-info__body (before player-info__line)
                                a.object.activity.render().find(".player-info__body").each(function() {
                                    var $this = $(this);
                                    if ($this.find(".player-info__logo").length === 0) { // Prevent duplicates
                                        $this.find(".player-info__line").before(
                                            '<div class="player-info__logo" style="margin-bottom: 10px;">' + titleHtml + '</div>'
                                        );
                                    }
                                });
                            }));
                        } else {
                            var titleHtml = logoHtml + '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                            // Update full-start-new__title
                            a.object.activity.render().find(".full-start-new__title").html(titleHtml);

                            // Update player-info__body (before player-info__line)
                            a.object.activity.render().find(".player-info__body").each(function() {
                                var $this = $(this);
                                if ($this.find(".player-info__logo").length === 0) { // Prevent duplicates
                                    $this.find(".player-info__line").before(
                                        '<div class="player-info__logo" style="margin-bottom: 10px;">' + titleHtml + '</div>'
                                    );
                                }
                            });
                        }
                    } else {
                        console.log("Логотип невалидный (нет file_path):", logo);
                    }
                } else {
                    console.log("Логотипы отсутствуют для:", e.title || e.name);
                }
            }));
        }
    })));
}();