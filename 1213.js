(function () {  
    'use strict';  
  
    function startPlugin() {  
        window.plugin_example_ready = true;  
  
        // Показ маленького всплывающего уведомления сверху  
        Lampa.Noty.show('Пример');  
    }  
  
    if (window.appready) {  
        startPlugin();  
    } else {  
        Lampa.Listener.follow('app', function (e) {  
            if (e.type == 'ready') {  
                startPlugin();  
            }  
        });  
    }  
})();