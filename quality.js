// Пример структуры плагина для Lampa    
(function() {    
    'use strict';    
        
    // Добавление пользовательских стилей    
    function addCustomStyles() {    
        const style = document.createElement('style');    
        style.textContent = `    
            .card__quality {      
                position: absolute;      
                right: 0.3em;      
                bottom: 3em;      
                padding: 0.3em 0.5em;      
                background: #ffffff;      
                color: #000000;      
                font-size: 1em;      
                -webkit-border-radius: 0.3em;      
                -moz-border-radius: 0.3em;      
                border-radius: 0.9em;      
            }  
            .card__quality img {  
                max-width: 50%;  
                height: auto;  
                display: block;  
            }  
        `;    
        document.head.appendChild(style);    
    }  
  
    // Замена текста на изображения  
    function replaceQualityText() {  
        const qualityMap = {  
            '4K': 'https://foxstudio24.github.io/lampa//quality/4к.png',  
            'FLHD': 'https://foxstudio24.github.io/lampa//quality/FLHD.png',  
            'TS': 'https://foxstudio24.github.io/lampa//quality/TS.png'  
        };  
  
        const qualityElements = document.querySelectorAll('.card__quality');  
        qualityElements.forEach(element => {  
            const textContent = element.textContent.trim();  
            if (qualityMap[textContent]) {  
                element.innerHTML = `<img src="${qualityMap[textContent]}" alt="${textContent}">`;  
            }  
        });  
    }  
        
    // Инициализация плагина    
    function init() {    
        addCustomStyles();  
        replaceQualityText();  
          
        // Наблюдатель за новыми элементами  
        const observer = new MutationObserver(() => {  
            replaceQualityText();  
        });  
        observer.observe(document.body, { childList: true, subtree: true });  
    }    
        
    // Запуск при загрузке    
    if (document.readyState === 'loading') {    
        document.addEventListener('DOMContentLoaded', init);    
    } else {    
        init();    
    }    
})();
