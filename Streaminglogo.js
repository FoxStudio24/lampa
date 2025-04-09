(function() {
    'use strict';

    var Defined = {
        tmdb_api_url: 'https://api.themoviedb.org/3/',
        tmdb_api_key: '06936145fe8e20be28b02e26b55d3ce6', // Ваш TMDB API-ключ
        tmdb_image_base_url: 'https://image.tmdb.org/t/p/original'
    };

    function startPlugin() {
        window.streaming_network_logo_plugin = true;

        var manifest = {
            type: 'info',
            version: '1.0.1',
            name: 'Streaming Network Logo',
            description: 'Плагин для отображения логотипа телесети или стриминговой платформы в карточке контента',
            component: 'streaming_network_logo'
        };

        Lampa.Manifest.plugins = manifest;

        Lampa.Lang.add({
            streaming_network_logo_no_provider: {
                ru: 'Телесеть или платформа не найдена',
                en: 'Network or platform not found'
            }
        });

        // Добавляем стили для логотипа
        Lampa.Template.add('streaming_network_logo_css', `
            <style>
            .streaming-network-logo-container {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 10;
            }
            .streaming-network-logo {
                max-width: 150px; /* Увеличиваем размер */
                max-height: 60px;
                object-fit: contain;
                border-radius: 5px;
                /* Убираем фон */
            }
            </style>
        `);
        $('body').append(Lampa.Template.get('streaming_network_logo_css', {}, true));

        // Функция для получения и отображения логотипа телесети или стриминговой платформы
        function addStreamingNetworkLogo(e) {
            var movie = e.data.movie || e.movie;
            if (!movie || !movie.id) return;

            var tmdb_id = movie.id;
            var isSerial = movie.number_of_seasons > 0;
            var tmdb_endpoint = isSerial ? 'tv' : 'movie';
            var tmdb_url = Defined.tmdb_api_url + tmdb_endpoint + '/' + tmdb_id + (isSerial ? '' : '/watch/providers') + '?api_key=' + Defined.tmdb_api_key;

            console.log('Запрос к TMDB API:', tmdb_url);

            var network = new Lampa.Reguest();
            network.timeout(10000);
            network.silent(tmdb_url, function(response) {
                console.log('Ответ от TMDB API:', JSON.stringify(response, null, 2));

                var logoUrl = null;
                var providerName = '';

                if (isSerial) {
                    // Для сериалов используем поле networks
                    var networks = response.networks || [];
                    if (networks.length > 0) {
                        var networkWithLogo = networks.find(function(n) {
                            return n.logo_path && n.logo_path !== '';
                        });
                        if (networkWithLogo) {
                            logoUrl = Defined.tmdb_image_base_url + networkWithLogo.logo_path;
                            providerName = networkWithLogo.name;
                        }
                    }
                } else {
                    // Для фильмов используем watch/providers
                    var providers = response.results && (response.results['RU'] || response.results['US']) || {};
                    var flatrate = providers.flatrate || providers.buy || providers.rent || [];
                    if (flatrate.length > 0) {
                        var providerWithLogo = flatrate.find(function(p) {
                            return p.logo_path && p.logo_path !== '';
                        });
                        if (providerWithLogo) {
                            logoUrl = Defined.tmdb_image_base_url + providerWithLogo.logo_path;
                            providerName = providerWithLogo.provider_name;
                        }
                    }
                }

                if (!logoUrl) {
                    console.log('Телесеть или платформа с логотипом не найдена');
                    return;
                }

                console.log('URL логотипа:', logoUrl);

                // Находим блок full-start-new__body
                var fullStartBody = e.object.activity.render().find('.full-start-new__body');
                if (!fullStartBody.length) {
                    console.log('Блок full-start-new__body не найден');
                    return;
                }

                // Удаляем старый логотип, если он есть
                fullStartBody.find('.streaming-network-logo-container').remove();

                // Добавляем контейнер с логотипом
                var logoContainer = $('<div class="streaming-network-logo-container"></div>');
                var logoImg = $('<img class="streaming-network-logo" src="' + logoUrl + '" alt="' + providerName + '">');
                logoContainer.append(logoImg);
                fullStartBody.append(logoContainer);

                console.log('Логотип добавлен:', providerName);

            }, function(error) {
                console.error('Ошибка при запросе к TMDB API:', error);
            }, false, { dataType: 'json' });
        }

        // Подписываемся на событие открытия карточки контента
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                addStreamingNetworkLogo(e);
            }
        });
    }

    if (!window.streaming_network_logo_plugin) startPlugin();
})();
