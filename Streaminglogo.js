(function() {
    'use strict';

    var Defined = {
        tmdb_api_url: 'https://api.themoviedb.org/3/',
        tmdb_api_key: '06936145fe8e20be28b02e26b55d3ce6', // Ваш TMDB API-ключ
        tmdb_image_base_url: 'https://image.tmdb.org/t/p/original'
    };

    function startPlugin() {
        window.production_logo_plugin = true;

        var manifest = {
            type: 'info',
            version: '1.0.0',
            name: 'Production Logo',
            description: 'Плагин для отображения логотипа компании-производителя в карточке контента',
            component: 'production_logo'
        };

        Lampa.Manifest.plugins = manifest;

        Lampa.Lang.add({
            production_logo_no_company: {
                ru: 'Компания-производитель не найдена',
                en: 'Production company not found'
            }
        });

        // Добавляем стили для логотипа
        Lampa.Template.add('production_logo_css', `
            <style>
            .production-logo-container {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }
            .production-logo {
                max-width: 100px;
                max-height: 40px;
                object-fit: contain;
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px;
            }
            </style>
        `);
        $('body').append(Lampa.Template.get('production_logo_css', {}, true));

        // Функция для получения и отображения логотипа компании-производителя
        function addProductionLogo(e) {
            var movie = e.data.movie || e.movie;
            if (!movie || !movie.id) return;

            var tmdb_id = movie.id;
            var isSerial = movie.number_of_seasons > 0;
            var tmdb_endpoint = isSerial ? 'tv' : 'movie';
            var tmdb_url = Defined.tmdb_api_url + tmdb_endpoint + '/' + tmdb_id + '?api_key=' + Defined.tmdb_api_key;

            console.log('Запрос к TMDB API для получения данных о контенте:', tmdb_url);

            var network = new Lampa.Reguest();
            network.timeout(10000);
            network.silent(tmdb_url, function(response) {
                console.log('Ответ от TMDB API:', JSON.stringify(response, null, 2));

                // Проверяем, есть ли компании-производители
                var companies = response.production_companies || [];
                if (companies.length === 0) {
                    console.log('Компании-производители не найдены');
                    return;
                }

                // Ищем первую компанию с логотипом
                var company = companies.find(function(c) {
                    return c.logo_path && c.logo_path !== '';
                });

                if (!company) {
                    console.log('Логотип компании не найден');
                    return;
                }

                var logoPath = company.logo_path;
                var logoUrl = Defined.tmdb_image_base_url + logoPath;
                console.log('URL логотипа:', logoUrl);

                // Находим блок full-start-new__body
                var fullStartBody = e.object.activity.render().find('.full-start-new__body');
                if (!fullStartBody.length) {
                    console.log('Блок full-start-new__body не найден');
                    return;
                }

                // Удаляем старый логотип, если он есть
                fullStartBody.find('.production-logo-container').remove();

                // Добавляем контейнер с логотипом
                var logoContainer = $('<div class="production-logo-container"></div>');
                var logoImg = $('<img class="production-logo" src="' + logoUrl + '" alt="' + company.name + '">');
                logoContainer.append(logoImg);
                fullStartBody.append(logoContainer);

                console.log('Логотип компании добавлен:', company.name);

            }, function(error) {
                console.error('Ошибка при запросе к TMDB API:', error);
            }, false, { dataType: 'json' });
        }

        // Подписываемся на событие открытия карточки контента
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                addProductionLogo(e);
            }
        });
    }

    if (!window.production_logo_plugin) startPlugin();
})();
