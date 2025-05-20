(function () {
    'use strict';

    // Проверяем, что плагин ещё не инициализирован
    if (!window.qualityLabelPlugin) {
        window.qualityLabelPlugin = true;

        // Добавляем стили для качества
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .quality-label {
                background: rgba(128, 128, 128, 0.3); /* Серый полупрозрачный фон */
                border-radius: 4px; /* Закругленные углы */
                padding: 2px 6px; /* Отступы внутри */
                margin-left: 5px; /* Отступ от названия источника */
                display: inline-block; /* Для корректного отображения */
            }
            .quality-label-4k, .quality-label-2k {
                background: rgba(128, 128, 128, 0.3); /* Серый полупрозрачный фон */
                border-radius: 4px; /* Закругленные углы */
                padding: 2px 6px; /* Отступы внутри */
                margin-left: 5px; /* Отступ от названия источника */
                display: inline-block;
                animation: glow 2s ease-in-out infinite; /* Анимация свечения */
            }
            @keyframes glow {
                0% {
                    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5),
                                0 0 10px rgba(255, 255, 255, 0.3),
                                0 0 15px rgba(255, 255, 255, 0.2);
                }
                50% {
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.8),
                                0 0 20px rgba(255, 255, 255, 0.5),
                                0 0 30px rgba(255, 255, 255, 0.3);
                }
                100% {
                    box-shadow: 0 0 5px rgba(255, 255, 255, 0.5),
                                0 0 10px rgba(255, 255, 255, 0.3),
                                0 0 15px rgba(255, 255, 255, 0.2);
                }
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);

        // Функция для обработки качества
        function modifyQualityLabels() {
            var qualityElements = document.querySelectorAll('.selectbox-item__title');
            if (!qualityElements.length) {
                console.log('QualityLabelPlugin: Элементы .selectbox-item__title не найдены');
                return false;
            }

            console.log('QualityLabelPlugin: Найдено элементов .selectbox-item__title: ' + qualityElements.length);

            qualityElements.forEach(function (element) {
                var text = element.innerText;
                // Проверяем, что текст не был обработан ранее
                if (element.querySelector('.quality-label')) {
                    console.log('QualityLabelPlugin: Элемент уже обработан: ' + text);
                    return;
                }

                console.log('QualityLabelPlugin: Обрабатываем элемент: ' + text);

                // Заменяем 2160p на 4K
                if (text.includes('2160p')) {
                    var modifiedText = text.replace('2160p', '4K');
                    element.innerHTML = modifiedText.replace('4K', '<span class="quality-label quality-label-4k">4K</span>');
                    console.log('QualityLabelPlugin: Заменено 2160p на 4K для: ' + text);
                }
                // Заменяем 1440p на 2K
                else if (text.includes('1440p')) {
                    var modifiedText = text.replace('1440p', '2K');
                    element.innerHTML = modifiedText.replace('2K', '<span class="quality-label quality-label-2k">2K</span>');
                    console.log('QualityLabelPlugin: Заменено 1440p на 2K для: ' + text);
                }
                // Для других разрешений (720p, 1080p и т.д.) добавляем серый фон
                else if (text.match(/\d+p/)) {
                    var resolution = text.match(/\d+p/)[0];
                    element.innerHTML = text.replace(resolution, `<span class="quality-label">${resolution}</span>`);
                    console.log('QualityLabelPlugin: Добавлен стиль для разрешения ' + resolution + ' в: ' + text);
                } else {
                    console.log('QualityLabelPlugin: Разрешение не найдено в: ' + text);
                }
            });
            return true;
        }

        // Функция для повторной попытки обработки с ограничением
        function tryModifyQualityLabels(attempts = 5, interval = 500) {
            let attempt = 0;
            function tryApply() {
                if (modifyQualityLabels() || attempt >= attempts) {
                    console.log('QualityLabelPlugin: Обработка завершена или достигнут лимит попыток');
                    return;
                }
                attempt++;
                console.log('QualityLabelPlugin: Попытка ' + attempt + ' из ' + attempts);
                setTimeout(tryApply, interval);
            }
            tryApply();
        }

        // Выполняем обработку при полной загрузке интерфейса
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                console.log('QualityLabelPlugin: Событие full:complite сработало');
                tryModifyQualityLabels();
            }
        });

        // Выполняем обработку при изменении активности
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                console.log('QualityLabelPlugin: Событие activity:start сработало');
                tryModifyQualityLabels();
            }
        });

        // Выполняем обработку при готовности приложения
        if (window.appready) {
            console.log('QualityLabelPlugin: Приложение уже готово, запускаем обработку');
            tryModifyQualityLabels();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    console.log('QualityLabelPlugin: Событие app:ready сработало');
                    tryModifyQualityLabels();
                }
            });
        }
    } else {
        console.log('QualityLabelPlugin: Плагин уже инициализирован');
    }
})();
