(function () {  
    'use strict';  
      
    // Проверяем, что Lampa готова  
    if (typeof Lampa === 'undefined' || !Lampa.Utils) {  
        setTimeout(arguments.callee, 100);  
        return;  
    }  
      
    // Загружаем плагины  
    Lampa.Utils.putScriptAsync([  
        'https://foxstudio24.github.io/lampa/mob.js',
        'https://darkestclouds.github.io/plugins/applecation/applecation.min.js',  
        'https://cub.red/plugin/youtube-player',     
    ], function () {  
        console.log('Logo и Necardify плагины загружены');  
    });  
})();
















