(function () {
    'use strict';

    // Функция для получения качества из YTS API
    function getQuality(title, callback) {
        var url = 'https://yts.mx/api/v2/list_movies.json?query_term=' + encodeURIComponent(title);
        Lampa.Utils.get(url, function (data) {
            var qualities = [];
            if (data && data.data && data.data.movies) {
                data.data.movies.forEach(function (movie) {
                    if (movie.torrents) {
                        movie.torrents.forEach(function (torrent) {
                            var quality = torrent.quality;
                            if (['1080p', '2K', '4K'].includes(quality)) {
                                qualities.push(quality);
                            }
                            // TS в YTS не всегда есть, но если это экранка, можем считать низкое качество как TS
                            if (torrent.quality === '720p' && torrent.size.includes('MB')) {
                                qualities.push('TS');
                            }
                        });
                    }
                });
            }
            // Убираем дубликаты и возвращаем первое подходящее качество
            var uniqueQualities = [...new Set(qualities)];
            callback(uniqueQualities.length > 0 ? uniqueQualities[0] : '');
        }, function () {
            callback(''); // Если ошибка, ничего не показываем
        });
    }

    // Функция для добавления качества на карточку
    function addQualityToCard(card, title) {
        // Проверяем, не добавлено ли уже качество
        if (card.querySelector('.card__quality')) return;

        getQuality(title, function (quality) {
            if (!quality) return; // Если качества нет, ничего не делаем

            // Создаем элемент для качества
            var qualityDiv = document.createElement('div');
            qualityDiv.className = 'card__quality';
            qualityDiv.textContent = quality;
            qualityDiv.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                z-index: 10;
            `;

            // Добавляем в card__view
            var cardView = card.querySelector('.card__view');
            if (cardView) {
                cardView.style.position = 'relative'; // Для правильного позиционирования
                cardView.appendChild(qualityDiv);
            }
        });
    }

    // Перехватываем рендеринг карточек
    Lampa.Listener.follow('view', function (e) {
        if (e.type === 'card' && e.card) {
            var card = e.card.dom; // DOM-элемент карточки
            var title = card.querySelector('.card__title').textContent;
            if (title) {
                addQualityToCard(card, title);
            }
        }
    });

    // Добавляем CSS глобально
    Lampa.Template.add('quality_marks_css', `
        <style>
            .card__quality {
                position: absolute;
                top: 5px;
                right: 5px;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                z-index: 10;
            }
        </style>
    `);

    // Регистрируем плагин
    Lampa.Plugin.register({
        name: 'QualityMarks',
        version: '1.0',
        description: 'Добавляет отметки качества (TS, 1080p, 2K, 4K) на карточки фильмов'
    });
})();