(function() {  
    'use strict';  
  
    Lampa.Plugin.add({  
        component: 'card-quality',  
        name: 'Card Quality Styles',  
        description: 'Добавляет стили для отображения качества карточек',  
        version: '1.0.1',  
        author: 'lampac'  
    });  
  
    // Обновленные CSS стили  
    var css = `  
       .card__quality {  
            position: absolute;  
            left: 10.2em;  
            bottom: 2.5em;  
            padding: 0.3em 0.5em;  
            background: #ffffff;  
            color: #000000;  
            font-size: 1em;  
            -webkit-border-radius: 0.3em;  
            -moz-border-radius: 0.3em;  
            border-radius: 0.9em;  
        }  
    `;  
  
    // Внедряем стили в документ  
    var style = document.createElement('style');  
    style.textContent = css;  
    document.head.appendChild(style);  
  
})();
