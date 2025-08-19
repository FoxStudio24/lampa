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
        'https://foxstudio24.github.io/lampa/necardify.js',
        'https://foxstudio24.github.io/lampa/Streaminglogo.js'
    ], function () {  
        console.log('Logo и Necardify плагины загружены');  
    });  
})();