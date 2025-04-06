!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.buttonplugin) {
        window.buttonplugin = true;

        // Подписываемся на событие полной загрузки интерфейса
        Lampa.Listener.follow("full", function(a) {
            if (a.type === "complite") {
                // Находим кнопку "Онлайн"
                var button = a.object.activity.render().find('.full-start__button.view--online');
                if (button.length) {
                    // Удаляем существующую SVG иконку
                    button.find('svg').remove();
                    
                    // Добавляем PNG изображение перед текстом
                    button.prepend(
                        '<img style="width: 35px; height: 35px; margin-right: 5px; vertical-align: middle;" src="https://cdn-icons-png.flaticon.com/512/7476/7476981.png" />'
                    );
                }
            }
        });
    }
}();
