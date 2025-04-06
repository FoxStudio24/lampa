!function() {
    "use strict";

    if (!window.buttonplugin) {
        window.buttonplugin = true;

        function getIconSize() {
            return window.innerWidth > 768 ? "40px" : "25px";
        }

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
            .full-start__button:hover,
            .full-start__button:focus,
            .full-start__button.active {
                background-color: #fff !important;
                color: #000 !important;
                width: auto !important;
                padding: 0.3em 1em !important;
                border-radius: 9999em !important;
            }
            .full-start__button:hover span,
            .full-start__button:focus span,
            .full-start__button.active span {
                display: inline !important;
            }
        `;
        document.head.appendChild(style);

        Lampa.Listener.follow("full", function(a) {
            if (a.type === "complite") {
                var render = a.object.activity.render();
                var iconSize = getIconSize();

                // Добавляем tabindex для фокуса
                render.find('.full-start__button').attr('tabindex', '0');

                // 1. Кнопка "Онлайн"
                var onlineButton = render.find('.full-start__button.view--online');
                if (onlineButton.length) {
                    onlineButton.find('svg').remove();
                    onlineButton.html(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A1%D0%BC%D0%BE%D1%82%D1%80%D0%B5%D1%82%D1%8C.svg" />' +
                        '<span>Смотреть онлайн</span>'
                    );
                }

                // 2. Кнопка "Торренты"
                var torrentButton = render.find('.full-start__button.view--torrent');
                if (torrentButton.length) {
                    torrentButton.find('svg').remove();
                    torrentButton.html(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%A2%D0%BE%D1%80%D1%80%D0%B5%D0%BD%D1%82.svg" />' +
                        '<span>Торренты</span>'
                    );
                }

                // 3. Кнопка "Трейлеры"
                var trailerButton = render.find('.full-start__button.view--trailer');
                if (trailerButton.length) {
                    trailerButton.find('svg').remove();
                    trailerButton.html(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%AE%D1%82%D1%83%D0%B1.svg" />' +
                        '<span>Трейлеры</span>'
                    );
                }

                // 4. Кнопка "Избранное"
                var bookButton = render.find('.full-start__button.button--book');
                if (bookButton.length) {
                    bookButton.find('svg').remove();
                    bookButton.html(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%97%D0%B0%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B8.svg" />' +
                        '<span>Избранное</span>'
                    );
                }

                // 5. Кнопка "ИИ/Опции"
                var optionsButton = render.find('.full-start__button.button--options');
                if (optionsButton.length) {
                    optionsButton.find('svg').remove();
                    optionsButton.html(
                        '<img style="width: ' + iconSize + '; height: ' + iconSize + '; vertical-align: middle;" src="https://raw.githubusercontent.com/FoxStudio24/lampa/3f759f21cc988dbaf8c817d2d921ba535f416ace/icons/%D0%98%D0%98.svg" />' +
                        '<span>Опции</span>'
                    );
                }
            }
        });
    }
}();
