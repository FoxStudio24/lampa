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

    // Функция для получения и отображения логотипа
    function displayLogo(movie, render) {
        if ("1" == Lampa.Storage.get("logo_glav")) return;
        var isSerial = movie.name || movie.first_air_date;
        var apiPath = isSerial ? "tv/" + movie.id : "movie/" + movie.id;
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

                    // Общий HTML для логотипа
                    var logoHtml = '<div style="display: flex; flex-direction: column; align-items: flex-start; animation: fadeIn 0.5s ease-in;">' +
                        '<img style="margin-bottom: 5px; max-height: 125px;" src="' + logoPath + '" />';

                    if (!isRussianLogo) {
                        var titleApi = Lampa.TMDB.api(apiPath + "?api_key=" + Lampa.TMDB.key() + "&language=ru");
                        console.log("API URL для названия:", titleApi);
                        $.get(titleApi, (function(data) {
                            var russianTitle = isSerial ? data.name : data.title;
                            console.log("Русское название из TMDB:", russianTitle);
                            var titleHtml = russianTitle ? logoHtml + '<span style="margin-top: 5px; font-size: 32px; color: #fff;">' + russianTitle + '</span></div>' : logoHtml + '</div>';
                            titleHtml += '<style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                            // Обновление full-start-new__title
                            render.find(".full-start-new__title").html(titleHtml);
                            console.log("Логотип добавлен в full-start-new__title");

                            // Обновление head-backward (перед head-backward__title)
                            render.find(".head-backward").each(function() {
                                var $this = $(this);
                                if ($this.find(".head-backward__logo").length === 0) {
                                    $this.find(".head-backward__title").before(
                                        '<div class="head-backward__logo" style="margin-bottom: 10px;">' + titleHtml + '</div>'
                                    );
                                    console.log("Логотип добавлен перед head-backward__title");
                                } else {
                                    console.log("Логотип уже существует в head-backward");
                                }
                            });

                            // Обновление player-info__line (перед player-info__name)
                            render.find(".player-info__line").each(function() {
                                var $this = $(this);
                                if ($this.find(".player-info__logo").length === 0) {
                                    $this.find(".player-info__name").before(
                                        '<div class="player-info__logo" style="margin-bottom: 5px;">' + titleHtml + '</div>'
                                    );
                                    console.log("Логотип добавлен перед player-info__name в плеере");
                                } else {
                                    console.log("Логотип уже существует в player-info__line");
                                }
                            });
                        }));
                    } else {
                        var titleHtml = logoHtml + '</div><style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>';

                        // Обновление full-start-new__title
                        render.find(".full-start-new__title").html(titleHtml);
                        console.log("Логотип добавлен в full-start-new__title");

                        // Обновление head-backward (перед head-backward__title)
                        render.find(".head-backward").each(function() {
                            var $this = $(this);
                            if ($this.find(".head-backward__logo").length === 0) {
                                $this.find(".head-backward__title").before(
                                    '<div class="head-backward__logo" style="margin-bottom: 10px;">' + titleHtml + '</div>'
                                );
                                console.log("Логотип добавлен перед head-backward__title");
                            } else {
                                console.log("Логотип уже существует в head-backward");
                            }
                        });

                        // Обновление player-info__line (перед player-info__name)
                        render.find(".player-info__line").each(function() {
                            var $this = $(this);
                            if ($this.find(".player-info__logo").length === 0) {
                                $this.find(".player-info__name").before(
                                    '<div class="player-info__logo" style="margin-bottom: 5px;">' + titleHtml + '</div>'
                                );
                                console.log("Логотип добавлен перед player-info__name в плеере");
                            } else {
                                console.log("Логотип уже существует в player-info__line");
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

    // Обработчик для главной страницы
    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type) {
            console.log("Событие full:complite сработало");
            displayLogo(a.data.movie, a.object.activity.render());
        }
    })));

    // Используем MutationObserver для отслеживания появления player-info__line в плеере
    function observePlayer() {
        var observer = new MutationObserver(function(mutations, obs) {
            var playerLine = document.querySelector(".player-info__line");
            if (playerLine && !playerLine.querySelector(".player-info__logo")) {
                console.log("Обнаружен player-info__line в плеере");
                // Предполагаем, что данные о фильме доступны в Lampa.Player или другом глобальном объекте
                var movie = Lampa.Player && Lampa.Player.data ? Lampa.Player.data.movie : null;
                if (movie) {
                    console.log("Фильм для плеера:", movie);
                    displayLogo(movie, $(document));
                } else {
                    console.log("Данные о фильме в плеере недоступны");
                }
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Запускаем наблюдатель при загрузке
    if (document.readyState === "complete" || document.readyState === "interactive") {
        console.log("DOM загружен, запускаем наблюдатель");
        observePlayer();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("DOM загружен, запускаем наблюдатель");
            observePlayer();
        });
    }
}();
