!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.buttonplugin) {
        window.buttonplugin = true;

        // Функция для определения размера в зависимости от устройства
        function getIconSize() {
            return window.innerWidth > 768 ? "32px" : "20px";
        }

        // Подписываемся на событие полной загрузки интерфейса
        Lampa.Listener.follow("full", function(a) {
            if (a.type === "complite") {
                var render = a.object.activity.render();
                var iconSize = getIconSize();

                // 1. Кнопка "Онлайн"
                var onlineButton = render.find('.full-start__button.view--online');
                if (onlineButton.length) {
                    onlineButton.find('svg').remove();
                    onlineButton.prepend(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; margin-right: 5px; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A1%D0%BC%D0%BE%D1%82%D1%80%D0%B5%D1%82%D1%8C.svg" />'
                    );
                }

                // 2. Кнопка "Торренты"
                var torrentButton = render.find('.full-start__button.view--torrent');
                if (torrentButton.length) {
                    torrentButton.find('svg').remove();
                    torrentButton.prepend(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; margin-right: 5px; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A2%D0%BE%D1%80%D1%80%D0%B5%D0%BD%D1%82.svg" />'
                    );
                }

                // 3. Кнопка "Трейлеры"
                var trailerButton = render.find('.full-start__button.view--trailer');
                if (trailerButton.length) {
                    trailerButton.find('svg').remove();
                    trailerButton.prepend(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; margin-right: 5px; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%AE%D1%82%D1%83%D0%B1.svg" />'
                    );
                }

                // 4. Кнопка "Избранное"
                var bookButton = render.find('.full-start__button.button--book');
                if (bookButton.length) {
                    bookButton.find('svg').remove();
                    bookButton.prepend(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; margin-right: 5px; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%97%D0%B0%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B8.svg" />'
                    );
                }

                // 5. Кнопка "ИИ/Опции"
                var optionsButton = render.find('.full-start__button.button--options');
                if (optionsButton.length) {
                    optionsButton.find('svg').remove();
                    optionsButton.prepend(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; margin-right: 5px; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%98%D0%98.svg" />'
                    );
                }
            }
        });
    }
}();
