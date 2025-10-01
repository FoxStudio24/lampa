!function() {  
    "use strict";  
  
    // Проверяем, что плагин ещё не инициализирован  
    if (!window.continuewatchplugin) {  
        window.continuewatchplugin = true;  
  
        // Создаем стиль для секции "Продолжить просмотр"  
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
              
            .continue-watch-item:hover {  
                transform: scale(1.05);  
            }  
              
            .continue-watch-poster {  
                width: 100%;  
                height: 280px;  
                background-size: cover;  
                background-position: center;  
                border-radius: 0.5em;  
                margin-bottom: 0.8em;  
            }  
              
            .continue-watch-info {  
                color: #ffffff;  
            }  
              
            .continue-watch-progress {  
                width: 100%;  
                height: 4px;  
                background: rgba(255, 255, 255, 0.2);  
                border-radius: 2px;  
                margin-top: 0.5em;  
                overflow: hidden;  
            }  
              
            .continue-watch-progress-bar {  
                height: 100%;  
                background: #ffffff;  
                transition: width 0.3s;  
            }  
        `;  
          
        // Добавляем стиль в head  
        document.getElementsByTagName('head')[0].appendChild(style);  
  
        // Функция для создания секции "Продолжить просмотр"  
        function createContinueWatchSection() {  
            // Получаем данные из localStorage (история просмотров)  
            var watchHistory = JSON.parse(localStorage.getItem('lampa_watch_history') || '[]');  
              
            if (watchHistory.length === 0) return null;  
  
            var section = document.createElement('div');  
            section.className = 'continue-watch-section';  
              
            var title = document.createElement('div');  
            title.className = 'continue-watch-title';  
            title.textContent = 'Продолжить просмотр'; // Используем перевод из lang файлов  
              
            var itemsContainer = document.createElement('div');  
            itemsContainer.className = 'continue-watch-items';  
              
            // Берем последние 10 просмотренных элементов  
            watchHistory.slice(-10).reverse().forEach(function(item) {  
                var itemElement = document.createElement('div');  
                itemElement.className = 'continue-watch-item';  
                  
                var poster = document.createElement('div');  
                poster.className = 'continue-watch-poster';  
                poster.style.backgroundImage = `url(${item.poster || ''})`;  
                  
                var info = document.createElement('div');  
                info.className = 'continue-watch-info';  
                info.innerHTML = `  
                    <div style="font-weight: bold; margin-bottom: 0.3em;">${item.title || 'Без названия'}</div>  
                    <div style="font-size: 0.9em; opacity: 0.8;">${item.type === 'movie' ? 'Фильм' : 'Сериал'}</div>  
                `;  
                  
                var progress = document.createElement('div');  
                progress.className = 'continue-watch-progress';  
                  
                var progressBar = document.createElement('div');  
                progressBar.className = 'continue-watch-progress-bar';  
                progressBar.style.width = `${(item.progress || 0) * 100}%`;  
                  
                progress.appendChild(progressBar);  
                itemElement.appendChild(poster);  
                itemElement.appendChild(info);  
                itemElement.appendChild(progress);  
                  
                // Добавляем обработчик клика  
                itemElement.addEventListener('click', function() {  
                    // Здесь должна быть логика перехода к просмотру  
                    console.log('Продолжить просмотр:', item);  
                });  
                  
                itemsContainer.appendChild(itemElement);  
            });  
              
            section.appendChild(title);  
            section.appendChild(itemsContainer);  
              
            return section;  
        }  
  
        // Функция для добавления секции на главную страницу  
        function addToHomePage() {  
            // Ждем загрузки основного контента  
            var checkInterval = setInterval(function() {  
                var mainContent = document.querySelector('#app') || document.querySelector('.main-content');  
                  
                if (mainContent) {  
                    clearInterval(checkInterval);  
                      
                    var continueSection = createContinueWatchSection();  
                    if (continueSection) {  
                        // Добавляем секцию в начало главной страницы  
                        mainContent.insertBefore(continueSection, mainContent.firstChild);  
                    }  
                }  
            }, 500);  
        }  
  
        // Запускаем добавление секции после загрузки DOM  
        if (document.readyState === 'loading') {  
            document.addEventListener('DOMContentLoaded', addToHomePage);  
        } else {  
            addToHomePage();  
        }  
    }  
}();