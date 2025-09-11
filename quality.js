// Пример структуры плагина для Lampa    
(function() {    
    'use strict';    
        
    // Добавление пользовательских стилей    
    function addCustomStyles() {    
        const style = document.createElement('style');    
        style.textContent = `    
            .card__quality {    
                position: absolute;    
                right: 0.3em;    
                top: 0.3em;    
                padding: 0.3em 0.5em;    
                background: #ffffff;    
                color: #000000;    
                font-size: 1em;    
                -webkit-border-radius: 0.3em;    
                -moz-border-radius: 0.3em;    
                border-radius: 0.9em;    
            }    
        `;    
        document.head.appendChild(style);    
    }    
        
    // Инициализация плагина    
    function init() {    
        addCustomStyles();    
    }    
        
    // Запуск при загрузке    
    if (document.readyState === 'loading') {    
        document.addEventListener('DOMContentLoaded', init);    
    } else {    
        init();    
    }    
})();
