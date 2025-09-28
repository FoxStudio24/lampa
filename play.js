(function() {  
    'use strict';  
      
    // Информация о плагине  
    var plugin_info = {  
        name: 'Replace Online Button Icon',  
        version: '1.0.0',  
        description: 'Заменяет иконку кнопки "Онлайн" на новую иконку play'  
    };  
      
    // Новая SVG иконка  
    var newPlayIcon = `  
        <svg fill="currentColor" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">  
            <title>play</title>  
            <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path>  
        </svg>  
    `;  
      
    // Основная функция плагина  
    function replaceOnlineIcon() {  
        // Находим кнопку "Онлайн"  
        var onlineButton = document.querySelector('.view--online');  
        if (onlineButton) {  
            // Находим SVG элемент внутри кнопки  
            var svgElement = onlineButton.querySelector('svg');  
            if (svgElement) {  
                // Создаем новый SVG элемент  
                var tempDiv = document.createElement('div');  
                tempDiv.innerHTML = newPlayIcon;  
                var newSvg = tempDiv.firstElementChild;  
                  
                // Копируем атрибуты от старого SVG к новому  
                if (svgElement.getAttribute('xmlns')) {  
                    newSvg.setAttribute('xmlns', svgElement.getAttribute('xmlns'));  
                }  
                  
                // Заменяем старый SVG на новый  
                svgElement.parentNode.replaceChild(newSvg, svgElement);  
                  
                console.log('Online button icon replaced successfully');  
            }  
        }  
    }  
      
    // Инициализация плагина  
    function startPlugin() {  
        console.log('Replace Online Icon Plugin: Запуск плагина');  
          
        // Заменяем иконку сразу  
        replaceOnlineIcon();  
          
        // Наблюдаем за изменениями DOM для динамически добавляемых элементов  
        var observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList') {  
                    // Проверяем, добавились ли новые элементы с классом view--online  
                    var addedNodes = Array.from(mutation.addedNodes);  
                    addedNodes.forEach(function(node) {  
                        if (node.nodeType === 1) { // Element node  
                            if (node.classList && node.classList.contains('view--online')) {  
                                replaceOnlineIcon();  
                            } else if (node.querySelector && node.querySelector('.view--online')) {  
                                replaceOnlineIcon();  
                            }  
                        }  
                    });  
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
      
    console.log('Replace Online Icon Plugin загружен');  
})();