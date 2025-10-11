(function() {
    'use strict';

    var Defined = {
        tmdb_api_url: 'https://api.themoviedb.org/3/',
        tmdb_api_key: '06936145fe8e20be28b02e26b55d3ce6',
        tmdb_image_base_url: 'https://image.tmdb.org/t/p/original',
        custom_logos: {
            'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
            'Кинопоиск': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Kinopoisk_colored_logo_%282021-present%29.svg',
            'Иви': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Ivi_logo.svg',
            'HBO': 'https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg',
            'MGM+': 'https://upload.wikimedia.org/wikipedia/commons/4/49/MGM%2B_logo.svg',
            'Sky': 'https://upload.wikimedia.org/wikipedia/en/a/a6/Sky_Group_logo_2020.svg',
            'Premier': 'https://upload.wikimedia.org/wikipedia/commons/2/21/LOGO_PREMIER_2022.png',
            'ТНТ': 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Logo_tnt.png',
            'Amazon Prime Video': 'https://upload.wikimedia.org/wikipedia/commons/4/43/Amazon_Prime_Video_logo_%282022%29.svg',
            'Amediateka': 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Amediateka_logo.svg',
            'Peacock': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/NBCUniversal_Peacock_Logo.svg',
            'START': 'https://upload.wikimedia.org/wikipedia/commons/5/5d/START_logo_2021.svg'
        }
    };

    function startPlugin() {
        window.streaming_network_logo_plugin = true;

        var manifest = {
            type: 'info',
            version: '1.0.10',
            name: 'Streaming Network Logo',
            description: 'Плагин для отображения логотипа телесети в карточке контента',
            component: 'streaming_network_logo'
        };

        Lampa.Manifest.plugins = manifest;

        Lampa.Lang.add({
            streaming_network_logo_no_provider: {
                ru: 'Телесеть не найдена',
                en: 'Network not found'
            }
        });

        Lampa.Template.add('streaming_network_logo_css', `
            <style>
            .streaming-network-logo-container {
                position: absolute;
                top: 10px;
                right: 50px;
                z-index: 10;
            }
            .streaming-network-logo {
                max-width: 200px;
                max-height: 80px;
                object-fit: contain;
                filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.6)) drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.4));
            }
            @media (max-width: 768px) {
                .streaming-network-logo-container {
                    display: none !important;
                }
            }
            .full-start-new__body .label--network {
                display: none !important;
            }
            </style>
        `);
        $('body').append(Lampa.Template.get('streaming_network_logo_css', {}, true));

        function addStreamingNetworkLogo(e) {
            var movie = e.data.movie || e.movie;
            if (!movie || !movie.id) {
                console.log('Ошибка: movie или movie.id не определены');
                return;
            }

            var tmdb_id = movie.id;
            var isSerial = movie.number_of_seasons > 0;
            var tmdb_endpoint = isSerial ? 'tv' : 'movie';
            var tmdb_url = Defined.tmdb_api_url + tmdb_endpoint + '/' + tmdb_id + '?api_key=' + Defined.tmdb_api_key;

            console.log('TMDB ID:', tmdb_id);
            console.log('Это сериал?', isSerial);
            console.log('Запрос к TMDB API:', tmdb_url);

            var network = new Lampa.Reguest();
            network.timeout(10000);
            network.silent(tmdb_url, function(response) {
                console.log('Ответ от TMDB API:', JSON.stringify(response, null, 2));

                var logoUrl = null;
                var providerName = '';

                var networks = response.networks || [];
                console.log('Networks:', networks);
                if (networks.length > 0) {
                    var networkWithLogo = networks.find(function(n) {
                        return n.logo_path && n.logo_path !== '';
                    });
                    if (networkWithLogo) {
                        providerName = networkWithLogo.name;
                        if (Defined.custom_logos[providerName]) {
                            logoUrl = Defined.custom_logos[providerName];
                            console.log('Используется пользовательский логотип для:', providerName);
                        } else {
                            logoUrl = Defined.tmdb_image_base_url + networkWithLogo.logo_path;
                            console.log('Используется логотип из TMDB для:', providerName);
                        }
                        console.log('Найдена телесеть:', providerName);
                    } else {
                        console.log('Телесеть с логотипом не найдена');
                    }
                } else {
                    console.log('Поле networks пустое');
                }

                if (!logoUrl) {
                    console.log('Телесеть с логотипом не найдена');
                    return;
                }

                console.log('URL логотипа:', logoUrl);

                var fullStartBody = e.object.activity.render().find('.full-start-new__body');
                if (!fullStartBody.length) {
                    console.log('Блок full-start-new__body не найден');
                    return;
                }

                fullStartBody.find('.streaming-network-logo-container').remove();

                var logoContainer = $('<div class="streaming-network-logo-container"></div>');
                var logoImg = $('<img class="streaming-network-logo" src="' + logoUrl + '" alt="' + providerName + '">');
                logoContainer.append(logoImg);
                fullStartBody.append(logoContainer);

                console.log('Логотип телесети добавлен:', providerName);

            }, function(error) {
                console.error('Ошибка при запросе к TMDB API:', error);
            }, false, { dataType: 'json' });
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                addStreamingNetworkLogo(e);
            }
        });
    }

    if (!window.streaming_network_logo_plugin) startPlugin();
})();
