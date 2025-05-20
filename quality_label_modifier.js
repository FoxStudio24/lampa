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
                display: inline-block; /* Для корректного отображения */
            }
            .quality-label-4k, .quality-label-2k {
                background: rgba(128, 128, 128, 0.3); /* Серый полупрозрачный фон */
                border-radius: 4px; /* Закругленные углы */
                padding: 2px 6px; /* Отступы внутри */
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
            // Находим все элементы с классом selectbox-item__title
            var qualityElements = document.querySelectorAll('.selectbox-item__title');
            qualityElements.forEach(function (element) {
                var text = element.innerText;
                var modifiedText = text;

                // Заменяем 2160p на 4K
                if (text.includes('2160p')) {
                    modifiedText = text.replace('2160p', '4K');
                    element.innerHTML = modifiedText.replace('4K', '<span class="quality-label quality-label-4k">4K</span>');
                }
                // Заменяем 1440p на 2K
                else if (text.includes('1440p')) {
                    modifiedText = text.replace('1440p', '2K');
                    element.innerHTML = modifiedText.replace('2K', '<span class="quality-label quality-label-2k">2K</span>');
                }
                // Для других разрешений (720p, 1080p и т.д.) добавляем только серый фон
                else if (text.match(/\d+p/)) {
                    var resolution = text.match(/\d+p/)[0];
                    element.innerHTML = text.replace(resolution, `<span class="quality-label">${resolution}</span>`);
                }
            });
        }

        // Выполняем обработку при полной загрузке интерфейса
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                modifyQualityLabels();
            }
        });

        // Выполняем обработку при изменении активности (на случай динамической загрузки)
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start') {
                setTimeout(modifyQualityLabels, 500); // Даем время на рендеринг
            }
        });
    }
})();