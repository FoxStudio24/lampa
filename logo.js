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
        
        /* Skeleton loader стили */
        .skeleton-item {
            background: linear-gradient(90deg, #2a2a2a 5%, #3a3a3a 25%, #2a2a2a 55%) !important;
            background-size: 200% 100% !important;
            animation: skeleton-loading 1.5s infinite !important;
            border-radius: 99px !important;
            color: transparent !important;
            pointer-events: none !important;
            overflow: hidden !important;
        }
        
        .skeleton-item * {
            visibility: hidden !important;
        }
        
        .full-start-new__buttons .skeleton-item {
            border-radius: 1em !important;
            margin-left: 0 !important;
            margin-bottom: 12px !important;
        }
        
        .full-start-new__title.skeleton-item {
            border-radius: 6px !important;
            min-height: 1.2em !important;
            max-height: 1.2em !important;
            width: 150px !important;
            display: block !important;
            margin-left: 0 !important;
            margin-bottom: 12px !important;
        }
        
        .full-start-new__head.skeleton-item {
            border-radius: 10px !important;
            max-width: 250px !important;
            display: block !important;
            margin-left: 0 !important;
            margin-bottom: 12px !important;
        }
        
        .full-start-new__details.skeleton-item,
        .cardify__details.skeleton-item {
            border-radius: 10px !important;
            margin-left: 0 !important;
            margin-bottom: 12px !important;
        }
        
        /* Стили для правого блока */
        .full-start__pg.skeleton-item,
        .full-start__status.skeleton-item,
        .full-start__rate.skeleton-item {
            border-radius: 8px !important;
            margin: 0 !important;
        }
        
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        
        .content-fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    window.logoplugin || (window.logoplugin = !0, Lampa.Listener.follow("full", (function(a) {
        if ("complite" == a.type) {
            var e = a.data.movie;
            var isSerial = e.name || e.first_air_date;
            var apiPath = isSerial ? "tv/" + e.id : "movie/" + e.id;
            
            var render = a.object.activity.render();
            var titleContainer = render.find(".full-start-new__title");
            var headContainer = render.find(".full-start-new__head");
            var detailsContainer = render.find(".full-start-new__details");
            var buttonsContainer = render.find(".full-start-new__buttons");
            var rateLineContainer = render.find(".full-start-new__rate-line");
            
            // Убираем существующие классы content-fade-in перед добавлением skeleton
            render.find('.content-fade-in').removeClass('content-fade-in');
            
            // Добавляем skeleton класс ко всем элементам
            titleContainer.addClass('skeleton-item');
            headContainer.addClass('skeleton-item');
            detailsContainer.addClass('skeleton-item');
            buttonsContainer.find('.full-start__button').addClass('skeleton-item');
            
            // Добавляем skeleton для правого блока
            rateLineContainer.find('.full-start__pg').addClass('skeleton-item');
            rateLineContainer.find('.full-start__status').addClass('skeleton-item');
            rateLineContainer.find('.full-start__rate').addClass('skeleton-item');
            
            // Получаем русское название из переводов
            var translationsApi = Lampa.TMDB.api(apiPath + "/translations?api_key=" + Lampa.TMDB.key());
            console.log("API URL для переводов:", translationsApi);
            
            var removeSkeletons = function() {
                headContainer.removeClass('skeleton-item').addClass('content-fade-in').css({
                    'max-width': '',
                    'display': '',
                    'margin-left': '',
                    'margin-bottom': ''
                });
                detailsContainer.removeClass('skeleton-item').addClass('content-fade-in').css({
                    'margin-left': '',
                    'margin-bottom': ''
                });
                buttonsContainer.find('.full-start__button').removeClass('skeleton-item').addClass('content-fade-in').css({
                    'margin-left': '',
                    'margin-bottom': ''
                });
                
                // Убираем skeleton с правого блока
                rateLineContainer.find('.full-start__pg').removeClass('skeleton-item').addClass('content-fade-in');
                rateLineContainer.find('.full-start__status').removeClass('skeleton-item').addClass('content-fade-in');
                rateLineContainer.find('.full-start__rate').removeClass('skeleton-item').addClass('content-fade-in');
            };
            
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
                                var marginTop = "1px";
                                var logoHeight = isMobile ? "auto" : "1em";
                                var alignItems = isMobile ? "center" : "flex-start";
                                
                                // Убираем skeleton со всех элементов
                                removeSkeletons();
                                titleContainer.removeClass('skeleton-item').css({
                                    'min-height': '',
                                    'max-height': '',
                                    'width': '',
                                    'display': '',
                                    'margin-left': '',
                                    'margin-bottom': ''
                                });
                                
                                // Если логотип не русский, показываем русское название
                                if (!isRussianLogo && russianTitle) {
                                    titleContainer.html(
                                        '<div class="content-fade-in" style="display: flex; flex-direction: column; align-items: ' + alignItems + ';">' +
                                            '<img style="margin-top: 5px; max-height: ' + logoHeight + ' !important; max-width: none !important; width: auto !important; height: ' + logoHeight + ' !important;" src="' + logoPath + '" />' +
                                            '<span style="margin-top: ' + marginTop + '; font-size: ' + fontSize + '; color: #fff;">' + russianTitle + '</span>' +
                                        '</div>'
                                    );
                                } else {
                                    titleContainer.html(
                                        '<div class="content-fade-in" style="display: flex; flex-direction: column; align-items: ' + alignItems + ';">' +
                                            '<img style="margin-top: 5px; max-height: ' + logoHeight + ' !important; max-width: none !important; width: auto !important; height: ' + logoHeight + ' !important;" src="' + logoPath + '" />' +
                                        '</div>'
                                    );
                                }
                            };
                            img.onerror = function() {
                                console.log("Ошибка загрузки изображения логотипа");
                                removeSkeletons();
                                titleContainer.removeClass('skeleton-item').css({
                                    'min-height': '',
                                    'max-height': '',
                                    'width': '',
                                    'display': '',
                                    'margin-left': '',
                                    'margin-bottom': ''
                                });
                            };
                            img.src = logoPath;
                        } else {
                            console.log("Логотип невалидный (нет file_path):", logo);
                            removeSkeletons();
                            titleContainer.removeClass('skeleton-item').css({
                                'min-height': '',
                                'max-height': '',
                                'width': '',
                                'display': '',
                                'margin-left': '',
                                'margin-bottom': ''
                            });
                        }
                    } else {
                        console.log("Логотипы отсутствуют");
                        removeSkeletons();
                        titleContainer.removeClass('skeleton-item').css({
                            'min-height': '',
                            'max-height': '',
                            'width': '',
                            'display': '',
                            'margin-left': '',
                            'margin-bottom': ''
                        });
                    }
                })).fail(function() {
                    console.log("Ошибка запроса логотипов");
                    removeSkeletons();
                    titleContainer.removeClass('skeleton-item').css({
                        'min-height': '',
                        'max-height': '',
                        'width': '',
                        'display': '',
                        'margin-left': '',
                        'margin-bottom': ''
                    });
                });
            })).fail(function() {
                console.log("Ошибка запроса переводов, используем оригинальное название");
                removeSkeletons();
                titleContainer.removeClass('skeleton-item').css({
                    'min-height': '',
                    'max-height': '',
                    'width': '',
                    'display': '',
                    'margin-left': '',
                    'margin-bottom': ''
                });
            });
        }
    })))
}();
