(function () {  
    'use strict';  
      
    // Проверяем, что Lampa готова  
    if (typeof Lampa === 'undefined' || !Lampa.Utils) {  
        setTimeout(arguments.callee, 100);  
        return;  
    }  
      
    // Загружаем плагины  
    Lampa.Utils.putScriptAsync([  
        'http://honeyxcat.github.io/lampa-logo/lampa-logo.js',  
        'https://darkestclouds.github.io/plugins/applecation/applecation.min.js',
    ], function () {  
        console.log('Logo и Necardify плагины загружены');  
    });  
})();













