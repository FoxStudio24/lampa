(function() {
    'use strict';

    var Defined = {
        tmdb_api_url: 'https://api.themoviedb.org/3/',
        tmdb_api_key: '06936145fe8e20be28b02e26b55d3ce6', // Ваш TMDB API-ключ
        tmdb_image_base_url: 'https://image.tmdb.org/t/p/original'
    };

    function startPlugin() {
        window.streaming_logo_plugin = true;

        var manifest = {
            type: 'info',
            version: '1.0.0',
            name: 'Streaming Logo',
            description: 'Плагин для отображения логотипа стримингового сервиса в карточке контента',
            component: 'streaming_logo'
        };

        Lampa.Manifest.plugins = manifest;

        Lampa.Lang.add({
            streaming_logo_no_provider: {
                ru: 'Провайдер не найден',
                en: 'Provider not found'
            }
        });

        // Добавляем стили для логотипа
        Lampa.Template.add('streaming_logo_css', `
            <style>
            .streaming-logo-container {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }
            .streaming-logo {
                max-width: 100px;
                max-height: 40

px;
                object-fit: contain;
                border-radius: 5px;
                background: rgba(0, 0, 0, 0.5);
                padding: 5px;
            }
            </style>
        `);
        $('body').append(Lampa.Template.get('streaming_logo_css', {}, true));

        // Функция для получения и отображения логотипа
        function addStreamingLogo(e) {
            var movie = e.data.movie || e.movie;
            if (!movie || !movie.id) return;

            var tmdb_id = movie.id;
            var isSerial = movie.number_of_seasons > 0;
            var tmdb_endpoint = isSerial ? 'tv' : 'movie';
            var tmdb_url = Defined.tmdb_api_url + tmdb_endpoint + '/' + tmdb_id + '/watch/providers?api_key=' + Defined.tmdb_api_key;

            console.log('Запрос к TMDB API для получения провайдеров:', tmdb_url);

            var network = new Lampa.Reguest();
            network.timeout(10000);
            network.silent(tmdb_url, function(response) {
                console.log('Ответ от TMDB API (watch/providers):', JSON.stringify(response, null, 2));

                // Проверяем, есть ли провайдеры для региона (например, RU или US)
                var providers = response.results && (response.results['RU'] || response.results['US']) || {};
                var flatrate = providers.flatrate || providers.buy || providers.rent || [];

                if (flatrate.length === 0) {
                    console.log('Провайдеры не найдены');
                    return;
                }

                // Берем первого провайдера
                var provider = flatrate[0];
                var logoPath = provider.logo_path;
                if (!logoPath) {
                    console.log('Логотип провайдера не найден');
                    return;
                }

                var logoUrl = Defined.tmdb_image_base_url + logoPath;
                console.log('URL логотипа:', logoUrl);

                // Находим блок full-start-new__body
                var fullStartBody = e.object.activity.render().find('.full-start-new__body');
                if (!fullStartBody.length) {
                    console.log('Блок full-start-new__body не найден');
                    return;
                }

                // Удаляем старый логотип, если он есть
                fullStartBody.find('.streaming-logo-container').remove();

                // Добавляем контейнер с логотипом
                var logoContainer = $('<div class="streaming-logo-container"></div>');
                var logoImg = $('<img class="streaming-logo" src="' + logoUrl + '" alt="' + provider.provider_name + '">');
                logoContainer.append(logoImg);
                fullStartBody.append(logoContainer);

                console.log('Логотип добавлен:', provider.provider_name);

            }, function(error) {
                console.error('Ошибка при запросе к TMDB API:', error);
            }, false, { dataType: 'json' });
        }

        // Подписываемся на событие открытия карточки контента
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                addStreamingLogo(e);
            }
        });
    }

    if (!window.streaming_logo_plugin) startPlugin();
})();
