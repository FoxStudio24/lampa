!function() {  
    "use strict";  
  
    if (!window.continuewatchplugin) {  
        window.continuewatchplugin = true;  
  
        var style = document.createElement('style');  
        style.type = 'text/css';  
        style.innerHTML = `  
            .continue-watch-section {  
                margin: 2em 0;  
                padding: 1.5em;  
                background: rgba(255, 255, 255, 0.05);  
                border-radius: 1em;  
            }  
              
            .continue-watch-title {  
                font-size: 1.8em;  
                margin-bottom: 1em;  
                color: #ffffff;  
            }  
              
            .continue-watch-items {  
                display: flex;  
                overflow-x: auto;  
                gap: 1em;  
                padding-bottom: 1em;  
            }  
              
            .continue-watch-item {  
                min-width: 200px;  
                background: rgba(255, 255, 255, 0.1);  
                border-radius: 0.8em;  
                padding: 1em;  
                cursor: pointer;  
                transition: transform 0.2s;  
            }  
        `;  
          
        document.getElementsByTagName('head')[0].appendChild(style);  
  
        // Ждем полной загрузки Lampa  
        function waitForLampa() {  
            var attempts = 0;  
            var maxAttempts = 100; // 50 секунд максимум  
              
            var checkInterval = setInterval(function() {  
                attempts++;  
                  
                // Ищем более специфичные селекторы Lampa  
                var appContainer = document.querySelector('#app');  
                var hasLampaContent = appContainer && (  
                    appContainer.querySelector('.scroll') ||  
                    appContainer.querySelector('.items-line') ||  
                    appContainer.querySelector('.menu')  
                );  
                  
                console.log('Continue Watch Plugin: Попытка', attempts, 'найден контент:', !!hasLampaContent);  
                  
                if (hasLampaContent || attempts >= maxAttempts) {  
                    clearInterval(checkInterval);  
                      
                    if (hasLampaContent) {  
                        console.log('Continue Watch Plugin: Lampa загружена, добавляем секцию');  
                        addContinueWatchSection();  
                    } else {  
                        console.log('Continue Watch Plugin: Превышено время ожидания');  
                    }  
                }  
            }, 500);  
        }  
  
        function addContinueWatchSection() {  
            // Создаем тестовую секцию  
            var section = document.createElement('div');  
            section.className = 'continue-watch-section';  
            section.innerHTML = `  
                <div class="continue-watch-title">Продолжить просмотр</div>  
                <div style="color: #fff; padding: 1em;">  
                    Тестовая секция плагина "Продолжить просмотр"  
                </div>  
            `;  
              
            var appContainer = document.querySelector('#app');  
            if (appContainer) {  
                // Добавляем в начало контейнера  
                appContainer.insertBefore(section, appContainer.firstChild);  
                console.log('Continue Watch Plugin: Секция добавлена');  
            }  
        }  
  
        // Запускаем после загрузки DOM  
        if (document.readyState === 'loading') {  
            document.addEventListener('DOMContentLoaded', waitForLampa);  
        } else {  
            waitForLampa();  
        }  
          
        console.log('Continue Watch Plugin: Плагин инициализирован');  
    }  
}();