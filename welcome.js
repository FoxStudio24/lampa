!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.welcomeplugin) {
        window.welcomeplugin = true;

        // Создаем стиль
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .welcome {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 100;
                background: #000000 url('https://github.com/FoxStudio24/lampa/raw/main/icons/Welcome.png') no-repeat 50% 50%;
                -webkit-background-size: cover;
                -moz-background-size: cover;
                -o-background-size: cover;
                background-size: cover;
            }
        `;
        
        // Добавляем стиль в head
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}();