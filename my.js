(function () {  
    'use strict';  
      
    // Проверяем, что Lampa готова  
    if (typeof Lampa === 'undefined' || !Lampa.Utils) {  
        setTimeout(arguments.callee, 100);  
        return;  
    }  
      
    // Загружаем плагины  
    Lampa.Utils.putScriptAsync([  
        'https://foxstudio24.github.io/lampa/logo.js',  
        'https://darkestclouds.github.io/plugins/applecation/applecation.min.js',
        'https://foxstudio24.github.io/lampa/mob.js',
        'https://foxstudio24.github.io/lampa/hide.js',
        ' https://foxstudio24.github.io/lampa/Quality/Quality.js',
    ], function () {  
        console.log('Logo и Necardify плагины загружены');  
    });  
})();









