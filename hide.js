(function() {  
    'use strict';  
      
    // Информация о плагине  
    var plugin_info = {  
        name: 'Hide Reactions and Trailer',  
        version: '1.2.0',  
        description: 'Скрывает элементы реакций, кнопку реакций и кнопку трейлера на интерфейсе'  
    };  
      
    // Основная функция плагина  
    function hideElements() {  
        // Скрываем блок реакций  
        var reactionsBlock = document.querySelector('.full-start-new__reactions');  
        if (reactionsBlock) {  
            reactionsBlock.style.display = 'none';  
        }  
          
        // Скрываем кнопку реакций  
        var reactionButton = document.querySelector('.button--reaction');  
        if (reactionButton) {  
            reactionButton.style.display = 'none';  
        }  
          
        // Скрываем кнопку трейлера  
        var trailerButton = document.querySelector('.view--rutube_trailer');  
        if (trailerButton) {  
            trailerButton.style.display = 'none';  
        }  
          
        // Альтернативно, можно скрыть через CSS класс  
        var style = document.createElement('style');  
        style.textContent = `  
            .full-start-new__reactions {  
                display: none !important;  
            }  
            .reaction {  
                display: none !important;  
            }  
            .button--reaction {  
                display: none !important;  
            }  
            .full-start__button.button--reaction {  
                display: none !important;  
            }  
            .view--rutube_trailer {  
                display: none !important;  
            }  
            .full-start__button.view--rutube_trailer {  
                display: none !important;  
            }  
        `;  
        document.head.appendChild(style);  
    }  
      
    // Инициализация плагина  
    function startPlugin() {  
        console.log('Hide Elements Plugin: Запуск плагина');  
          
        // Скрываем элементы сразу  
        hideElements();  
          
        // Наблюдаем за изменениями DOM для динамически добавляемых элементов  
        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList') {  
                    hideElements();  
                }  
            });  
        });  
          
        observer.observe(document.body, {  
            childList: true,  
            subtree: true  
        });  
    }  
      
    // Регистрация плагина в системе Lampa  
    if (window.Lampa) {  
        startPlugin();  
    } else {  
        // Ждем загрузки Lampa  
        document.addEventListener('DOMContentLoaded', function() {  
            if (window.Lampa) {  
                startPlugin();  
            }  
        });  
    }  
      
    console.log('Hide Elements Plugin загружен');  
})();
