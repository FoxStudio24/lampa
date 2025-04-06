!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.buttonplugin) {
        window.buttonplugin = true;

        // Функция для определения размера в зависимости от устройства
        function getIconSize() {
            return window.innerWidth > 768 ? "40px" : "25px";
        }

        // Добавляем стили для кнопок
        var style = document.createElement('style');
        style.textContent = `
            .full-start__button {
                margin-right: 0.75em;
                font-size: 1.3em;
                background-color: rgba(0, 0, 0, 0.22);
                padding: 0.3em;
                display: flex;
                border-radius: 50%;
                align-items: center;
                justify-content: center;
                height: 2.8em;
                width: 2.8em;
                flex-shrink: 0;
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                transition: all 0.3s ease;
                overflow: hidden;
            }
            .full-start__button span {
                display: none;
                margin-left: 0.5em;
                white-space: nowrap;
            }
            .full-start__button:hover {
                background-color: #fff;
                color: #000;
            }
            .full-start__button.active {
                background-color: #fff;
                color: #000;
                width: auto;
                padding: 0.3em 1em;
                border-radius: 999999999999em;
            }
            .full-start__button.active span {
                display: inline;
            }
        `;
        document.head.appendChild(style);

        // Подписываемся на событие полной загрузки интерфейса
        Lampa.Listener.follow("full", function(a) {
            if (a.type === "complite") {
                var render = a.object.activity.render();
                var iconSize = getIconSize();

                // Функция для обработки кнопки
                function updateButton(button, iconSrc) {
                    if (button.length) {
                        button.find('svg').remove();
                        button.prepend(
                            '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="' + iconSrc + '" />'
                        );
                        // Принудительно проверяем и применяем активное состояние
                        if (button.hasClass('active')) {
                            button.css({
                                'width': 'auto',
                                'padding': '0.3em 1em',
                                'border-radius': '999999999999em'
                            });
                            button.find('span').css('display', 'inline');
                        }
                    }
                }

                // 1. Кнопка "Онлайн"
                updateButton(
                    render.find('.full-start__button.view--online'),
                    'https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A1%D0%BC%D0%BE%D1%82%D1%80%D0%B5%D1%82%D1%8C.svg'
                );

                // 2. Кнопка "Торренты"
                updateButton(
                    render.find('.full-start__button.view--torrent'),
                    'https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A2%D0%BE%D1%80%D1%80%D0%B5%D0%BD%D1%82.svg'
                );

                // 3. Кнопка "Трейлеры"
                updateButton(
                    render.find('.full-start__button.view--trailer'),
                    'https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%AE%D1%82%D1%83%D0%B1.svg'
                );

                // 4. Кнопка "Избранное"
                updateButton(
                    render.find('.full-start__button.button--book'),
                    'https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%97%D0%B0%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B8.svg'
                );

                // 5. Кнопка "ИИ/Опции"
                updateButton(
                    render.find('.full-start__button.button--options'),
                    'https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%98%D0%98.svg'
                );
            }
        });
    }
}();
