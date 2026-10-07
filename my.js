(function () {  
    'use strict';  
      
 
    if (typeof Lampa === 'undefined' || !Lampa.Utils) {  
        setTimeout(arguments.callee, 100);  
        return;  
    }  
      

    Lampa.Utils.putScriptAsync([  
        'https://foxstudio24.github.io/lampa/mob.js',
        'https://darkestclouds.github.io/plugins/applecation/applecation.min.js',  
    ], function () {  
        console.log('Плагины загружены');  
    });  
})();
















