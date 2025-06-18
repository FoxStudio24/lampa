(function() {
    'use strict';

    // Функция для применения стилей
    function applyNotyStyles() {
        var style = document.createElement('style');
        style.textContent = `
            .noty {
                position: fixed;
                top: 20px;
                right: 20px;
                left: auto;
                bottom: auto;
                z-index: 99;
                background: rgba(0, 0, 0, 0.7);
                color: #fff;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-radius: 10px 0 0 10px;
                -webkit-transform: translateY(100%);
                -moz-transform: translateY(100%);
                -ms-transform: translateY(100%);
                -o-transform: translateY(100%);
                transform: translateY(100%);
                -webkit-transition: opacity 0.3s, -webkit-transform 0.3s;
                -o-transition: opacity 0.3s, -o-transform 0.3s;
                -moz-transition: transform 0.3s, opacity 0.3s, -moz-transform 0.3s;
                transition: transform 0.3s, opacity 0.3s, -webkit-transform 0.3s, -moz-transform 0.3s, -o-transform 0.3s;
                opacity: 0;
                padding: 10px 20px;
                max-width: 300px;
            }
            .noty.show {
                -webkit-transform: translateY(0);
                -moz-transform: translateY(0);
                -ms-transform: translateY(0);
                -o-transform: translateY(0);
                transform: translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Наблюдатель для динамически добавленных элементов .noty
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    var notyElements = document.querySelectorAll('.noty');
                    notyElements.forEach(function(element) {
                        element.classList.add('show');
                    });
                }
            });
        });

        // Наблюдать за изменениями в теле документа
        observer.observe(document.body, { childList: true, subtree: true });

        // Применить стили к существующим элементам .noty
        var existingNoty = document.querySelectorAll('.noty');
        existingNoty.forEach(function(element) {
            element.classList.add('show');
        });
    }

    // Запуск при загрузке страницы и повторное применение при необходимости
    document.addEventListener('DOMContentLoaded', applyNotyStyles);
    window.addEventListener('load', applyNotyStyles);

    // Функция для постоянной проверки и применения стилей
    setInterval(applyNotyStyles, 1000);
})();