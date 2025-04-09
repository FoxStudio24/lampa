(function () {
    'use strict';

    // Функция для получения качества из YTS API
    function getQuality(title, callback) {
        try {
            console.log('Запрос качества для фильма:', title);
            var url = 'https://yts.mx/api/v2/list_movies.json?query_term=' + encodeURIComponent(title);
            Lampa.Utils.get(url, function (data) {
                console.log('Ответ от YTS API:', data);
                var qualities = [];
                if (data && data.data && data.data.movies) {
                    data.data.movies.forEach(function (movie) {
                        if (movie.torrents) {
                            movie.torrents.forEach(function (torrent) {
                                var quality = torrent.quality;
                                console.log('Найдено качество:', quality);
                                if (['1080p', '2K', '4K'].includes(quality)) {
                                    qualities.push(quality);
                                }
                                // Упрощаем определение TS
                                if (torrent.quality === '720p') {
                                    qualities.push('TS');
                                }
                            });
                        }
                    });
                } else {
                    console.log('Данные о фильме не найдены в YTS API');
                }
                // Убираем дубликаты и возвращаем первое подходящее качество
                var uniqueQualities = [...new Set(qualities)];
                var result = uniqueQualities.length > 0 ? uniqueQualities[0] : '';
                console.log('Итоговое качество:', result);
                callback(result);
            }, function (error) {
                console.log('Ошибка запроса к YTS API:', error);
                callback(''); // Если ошибка запроса, ничего не показываем
            });
        } catch (e) {
            console.log('Ошибка в getQuality:', e);
            callback('');
        }
    }

    // Функция для добавления качества на карточку
    function addQualityToCard(card, title) {
        try {
            console.log('Добавление качества для карточки:', title);
            // Проверяем, не добавлено ли уже качество
            if (card.querySelector('.card__quality')) {
                console.log('Качество уже добавлено для этой карточки');
                return;
            }

            getQuality(title, function (quality) {
                if (!quality) {
                    console.log('Качество не найдено, пропускаем');
                    return; // Если качества нет, ничего не делаем
                }

                console.log('Добавляем метку качества:', quality);
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
                    z-index: 1000;
                `;

                // Добавляем в card__view
                var cardView = card.querySelector('.card__view');
                if (cardView) {
                    cardView.style.position = 'relative';
                    cardView.appendChild(qualityDiv);
                    console.log('Метка качества добавлена в DOM');
                } else {
                    console.log('Элемент .card__view не найден в карточке');
                }
            });
        } catch (e) {
            console.log('Ошибка в addQualityToCard:', e);
        }
    }

    // Перехватываем рендеринг карточек
    try {
        console.log('Установка слушателя Lampa.Listener.follow');
        Lampa.Listener.follow('view', function (e) {
            console.log('Событие view:', e);
            if (e.type === 'card' && e.card && e.card.dom) {
                var card = e.card.dom;
                var titleElement = card.querySelector('.card__title');
                if (titleElement && titleElement.textContent) {
                    var title = titleElement.textContent;
                    console.log('Найдена карточка с названием:', title);
                    addQualityToCard(card, title);
                } else {
                    console.log('Название карточки не найдено');
                }
            } else {
                console.log('Карточка не соответствует условиям');
            }
        });
    } catch (e) {
        console.log('Ошибка в Lampa.Listener.follow:', e);
    }

    // Добавляем CSS глобально
    try {
        console.log('Добавление CSS стилей');
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
                    z-index: 1000;
                }
            </style>
        `);
    } catch (e) {
        console.log('Ошибка в Lampa.Template.add:', e);
    }

    // Регистрируем плагин
    try {
        console.log('Регистрация плагина');
        Lampa.Plugin.register({
            name: 'QualityMarks',
            version: '1.2',
            description: 'Добавляет отметки качества (TS, 1080p, 2K, 4K) на карточки фильмов'
        });
    } catch (e) {
        console.log('Ошибка в Lampa.Plugin.register:', e);
    }
})();
