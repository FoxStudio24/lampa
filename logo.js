!function() {
    "use strict";
    
    // Добавляем CSS стили
    var style = document.createElement('style');
    style.textContent = `
        .cardify .full-start-new__title {
            text-shadow: none !important;
        }
        .full-start-new__title img {
            max-width: none !important;
            width: auto !important;
        }
    `;
    document.head.appendChild(style);
    
    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type) {
            var e = a.data.movie;
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            
            // Скрываем контент до загрузки логотипа
            var contentContainer = a.object.activity.render().find(".full-start-new__body");
            contentContainer.css("opacity", "0");
            
            // Получаем русское название из переводов
            var translationsApi = Lampa.TMDB.api(apiPath + "/translations?api_key=" + Lampa.TMDB.key());
            console.log("API URL для переводов:", translationsApi);
            
            $.get(translationsApi, (function(translationsData) {
                var russianTitle = null;
                
                // Ищем русский перевод
                if (translationsData.translations) {
                    var ruTranslation = translationsData.translations.find(function(t) { 
                        return t.iso_639_1 === "ru" || t.iso_3166_1 === "RU"; 
                    });
                    if (ruTranslation && ruTranslation.data) {
                        russianTitle = isSerial ? ruTranslation.data.name : ruTranslation.data.title;
                    }
                }
                
                // Если не нашли в переводах, берём из основного объекта
                if (!russianTitle) {
                    russianTitle = isSerial ? e.name : e.title;
                }
                
                console.log("Русское название:", russianTitle);
                
                // Теперь запрашиваем логотипы
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

                            // Предзагружаем изображение
                            var img = new Image();
                            img.onload = function() {
                                // Определяем параметры в зависимости от устройства
                                var isMobile = window.innerWidth <= 768;
                                var fontSize = "0.5em";
                                var marginTop = isMobile ? "1px" : "1px";
                                var logoHeight = isMobile ? "auto" : "1.5em";
                                
                                // Если логотип не русский, показываем русское название
                                if (!isRussianLogo && russianTitle) {
                                    a.object.activity.render().find(".full-start-new__title").html(
                                        '<div style="display: flex; flex-direction: column; align-items: flex-start;">' +
                                            '<img style="margin-top: 5px; max-height: ' + logoHeight + ' !important; max-width: none !important; width: auto !important; height: ' + logoHeight + ' !important;" src="' + logoPath + '" />' +
                                            '<span style="margin-top: ' + marginTop + '; font-size: ' + fontSize + '; color: #fff;">' + russianTitle + '</span>' +
                                        '</div>'
                                    );
                                } else {
                                    a.object.activity.render().find(".full-start-new__title").html(
                                        '<div style="display: flex; flex-direction: column; align-items: flex-start;">' +
                                            '<img style="margin-top: 5px; max-height: ' + logoHeight + ' !important; max-width: none !important; width: auto !important; height: ' + logoHeight + ' !important;" src="' + logoPath + '" />' +
                                        '</div>'
                                    );
                                }
                                // Показываем контент
                                contentContainer.css("opacity", "1");
                            };
                            img.onerror = function() {
                                console.log("Ошибка загрузки изображения логотипа");
                                contentContainer.css("opacity", "1");
                            };
                            img.src = logoPath;
                        } else {
                            console.log("Логотип невалидный (нет file_path):", logo);
                            contentContainer.css("opacity", "1");
                        }
                    } else {
                        console.log("Логотипы отсутствуют");
                        contentContainer.css("opacity", "1");
                    }
                })).fail(function() {
                    console.log("Ошибка запроса логотипов");
                    contentContainer.css("opacity", "1");
                });
            })).fail(function() {
                console.log("Ошибка запроса переводов, используем оригинальное название");
                contentContainer.css("opacity", "1");
            });
        }
    })))
}();
