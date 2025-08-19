!function() {  
    "use strict";  
      
    // Функция загрузки внешнего скрипта  
    function loadScript(url, callback) {  
        var script = document.createElement('script');  
        script.type = 'text/javascript';  
        script.src = url;  
        script.onload = callback || function() {};  
        script.onerror = function() {  
            console.error('Ошибка загрузки скрипта:', url);  
        };  
        document.head.appendChild(script);  
    }  
  
    // Добавляем настройку в интерфейс  
    Lampa.SettingsApi.addParam({  
        component: "interface",  
        param: {  
            name: "foxstudio_interface",  
            type: "select",  
            values: { 1: "Выключен", 0: "Включен" },  
            default: "1"  
        },  
        field: {  
            name: "Новый интерфейс для тв и пк",  
            description: "Включает плагины Necardify и Logo для улучшенного интерфейса"  
        }  
    });  
  
    // Отслеживаем изменения настройки  
    Lampa.Storage.listener.follow('change', function(e) {  
        if (e.name === 'foxstudio_interface') {  
            if (e.value === '0') { // Включен  
                // Загружаем оба плагина  
                loadScript('https://foxstudio24.github.io/lampa/necardify.js', function() {  
                    console.log('Necardify плагин загружен');  
                });  
                loadScript('https://foxstudio24.github.io/lampa/logo.js', function() {  
                    console.log('Logo плагин загружен');  
                });  
            }  
        }  
    });  
  
    // Проверяем настройку при загрузке плагина  
    if (Lampa.Storage.get('foxstudio_interface', '0') === '0') {  
        loadScript('https://foxstudio24.github.io/lampa/necardify.js');  
        loadScript('https://foxstudio24.github.io/lampa/logo.js');  
    }  
  
    console.log('FoxStudio Interface Plugin загружен');  
}();

