(function() {  
    'use strict';  
  
    // Проверяем доступность необходимых компонентов  
    function checkLampaReady() {  
        return window.Lampa &&   
               window.Lampa.Lang &&   
               window.jQuery;  
    }  
  
    // Безопасная инициализация переводов  
    function initTranslations() {  
        try {  
            if (!window.Lampa || !window.Lampa.Lang) {  
                console.error('YMusic: Lampa.Lang not available');  
                return false;  
            }  
  
            Lampa.Lang.add({  
                menu_ymusic: {  
                    ru: 'Яндекс Музыка',  
                    uk: 'Яндекс Музика',   
                    en: 'Yandex Music',  
                    be: 'Яндэкс Музыка'  
                }  
            });  
            return true;  
        } catch (error) {  
            console.error('YMusic: Error adding translations:', error);  
            return false;  
        }  
    }  
  
    let menuItemAdded = false;  
    let initAttempts = 0;  
    const maxInitAttempts = 10;  
  
    // Создаем пункт меню с проверкой ошибок  
    function addMenuItem() {  
        try {  
            if (!window.$ || !window.jQuery) {  
                console.error('YMusic: jQuery not available');  
                return false;  
            }  
  
            if ($('[data-action="ymusic"]').length > 0) {  
                return true;  
            }  
  
            const menuItem = $(`  
                <li class="menu__item selector binded" data-action="ymusic">  
                    <div class="menu__ico">  
                        <svg viewBox="0 0 24 24" fill="currentColor">  
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5c4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM11 17l6-4-6-4v8z"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">${window.Lampa && window.Lampa.Lang ? Lampa.Lang.translate('menu_ymusic') : 'Яндекс Музыка'}</div>  
                </li>  
            `);  
  
            const menuContainer = $('.menu__case:first .menu__list');  
            if (menuContainer.length === 0) {  
                console.error('YMusic: Menu container not found');  
                return false;  
            }  
  
            menuContainer.append(menuItem);  
            menuItemAdded = true;  
            console.log('YMusic: Menu item added successfully');  
            return true;  
        } catch (error) {  
            console.error('YMusic: Error adding menu item:', error);  
            return false;  
        }  
    }  
  
    // Простая функция открытия в новой вкладке  
    function openYMusic() {  
        try {  
            window.open('https://music.yandex.ru/', '_blank');  
        } catch (error) {  
            console.error('YMusic: Error opening external link:', error);  
        }  
    }  
  
    // Инициализация с повторными попытками  
    function init() {  
        initAttempts++;  
          
        if (!checkLampaReady()) {  
            if (initAttempts < maxInitAttempts) {  
                console.log(`YMusic: Lampa not ready, attempt ${initAttempts}/${maxInitAttempts}`);  
                setTimeout(init, 1000);  
                return;  
            } else {  
                console.error('YMusic: Failed to initialize after maximum attempts');  
                return;  
            }  
        }  
  
        try {  
            // Инициализируем переводы  
            if (!initTranslations()) {  
                console.error('YMusic: Failed to initialize translations');  
            }  
  
            // Добавляем пункт меню  
            if (!addMenuItem()) {  
                console.error('YMusic: Failed to add menu item');  
                return;  
            }  
  
            // Обработчики событий - и для мыши, и для пульта  
            $(document).on('click', '[data-action="ymusic"]', openYMusic);  
              
            // Обработчик для пульта - Enter на пункте меню  
            $(document).on('keydown', function(e) {  
                if (e.keyCode === 13) { // Enter key  
                    const focused = $('.menu__item.focus[data-action="ymusic"]');  
                    if (focused.length > 0) {  
                        e.preventDefault();  
                        openYMusic();  
                    }  
                }  
            });  
  
            // Наблюдатель за изменениями DOM для восстановления пункта меню  
            const observer = new MutationObserver(function(mutations) {  
                mutations.forEach(function(mutation) {  
                    if (mutation.type === 'childList' && $('.menu__case:first .menu__list').length > 0) {  
                        if (!menuItemAdded || $('[data-action="ymusic"]').length === 0) {  
                            addMenuItem();  
                        }  
                    }  
                });  
            });  
  
            observer.observe(document.body, {  
                childList: true,  
                subtree: true  
            });  
  
            console.log('YMusic plugin initialized successfully');  
        } catch (error) {  
            console.error('YMusic: Initialization error:', error);  
        }  
    }  
  
    // Запуск с задержкой  
    setTimeout(init, 500);  
  
})();
