!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.interfaceplugin) {
        window.interfaceplugin = true;

        // Создаем стиль
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .settings-folder {
                margin: 15px; /* внешние отступы со всех сторон */
                border-radius: 15px; /* закругления */
            }
body.glass--style .selectbox-item.focus,
body.glass--style .settings-folder.focus,
body.glass--style .settings-param.focus {
    background: linear-gradient(135deg, #8b75cb, #9b79d6, #b79cec, #6a4fbb);
    color: #fff;
    box-shadow: 
        inset 0 0 0 3px rgba(255, 255, 255, 0.2), /* внутренняя белая рамка */
        0 4px 14px rgba(139, 117, 203, 0.4);     /* внешняя тень */
    transform: scale(1.01);
    transition: all 0.3s ease;
}
.selectbox-item {
      margin: 15px; /* внешние отступы со всех сторон */
      border-radius: 15px; /* закругления */
}




        `;
        
        // Добавляем стиль в head
        document.getElementsByTagName('head')[0].appendChild(style);
    }
}();