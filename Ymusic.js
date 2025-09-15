(function() {  
    'use strict';  
  
    // Проверяем доступность необходимых компонентов  
    function checkLampaReady() {  
        return window.Lampa &&   
               window.Lampa.Lang &&   
               window.Lampa.Controller &&   
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
                },  
                ymusic_close: {  
                    ru: 'Закрыть',  
                    uk: 'Закрити',  
                    en: 'Close',   
                    be: 'Зачыніць'  
                },  
                ymusic_open_external: {  
                    ru: 'Открыть в новой вкладке',  
                    uk: 'Відкрити в новій вкладці',  
                    en: 'Open in new tab',  
                    be: 'Адкрыць у новай укладцы'  
                },  
                ymusic_iframe_blocked: {  
                    ru: 'Сайт не может быть загружен в iframe',  
                    uk: 'Сайт не може бути завантажений в iframe',  
                    en: 'Site cannot be loaded in iframe',  
                    be: 'Сайт не можа быць загружаны ў iframe'  
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
  
    // Остальные функции с обработкой ошибок  
    function createModal() {  
        try {  
            const modal = $(`  
                <div class="ymusic-modal" style="  
                    position: fixed;  
                    top: 0;  
                    left: 0;  
                    width: 100%;  
                    height: 100%;  
                    background: #000;  
                    z-index: 10000;  
                    display: none;  
                ">  
                    <div class="ymusic-header" style="  
                        position: absolute;  
                        top: 20px;  
                        right: 20px;  
                        z-index: 10001;  
                    ">  
                        <div class="ymusic-close selector" style="  
                            background: rgba(0,0,0,0.7);  
                            color: white;  
                            padding: 10px 20px;  
                            border-radius: 5px;  
                            cursor: pointer;  
                            font-size: 14px;  
                        ">${window.Lampa && window.Lampa.Lang ? Lampa.Lang.translate('ymusic_close') : 'Закрыть'}</div>  
                    </div>  
                    <div class="ymusic-content" style="  
                        display: flex;  
                        flex-direction: column;  
                        align-items: center;  
                        justify-content: center;  
                        height: 100%;  
                        color: white;  
                        text-align: center;  
                        padding: 40px;  
                    ">  
                        <div style="font-size: 48px; margin-bottom: 20px;">🎵</div>  
                        <h2 style="font-size: 32px; margin-bottom: 20px; color: #ff6b35;">Яндекс.Музыка</h2>  
                        <p style="font-size: 18px; margin-bottom: 30px; max-width: 500px; line-height: 1.5;">  
                            ${window.Lampa && window.Lampa.Lang ? Lampa.Lang.translate('ymusic_iframe_blocked') : 'Сайт не может быть загружен в iframe'}  
                        </p>  
                        <button class="ymusic-open-external selector" style="  
                            background: #ff6b35;  
                            color: white;  
                            padding: 15px 30px;  
                            border: none;  
                            border-radius: 8px;  
                            cursor: pointer;  
                            font-size: 16px;  
                            font-weight: bold;  
                            transition: background-color 0.3s;  
                            margin-top: 20px;  
                        ">${window.Lampa && window.Lampa.Lang ? Lampa.Lang.translate('ymusic_open_external') : 'Открыть в новой вкладке'}</button>  
                    </div>  
                </div>  
            `);  
  
            $('body').append(modal);  
            return modal;  
        } catch (error) {  
            console.error('YMusic: Error creating modal:', error);  
            return null;  
        }  
    }  
  
    function openYMusic() {  
        try {  
            let modal = $('.ymusic-modal');  
            if (modal.length === 0) {  
                modal = createModal();  
                if (!modal) return;  
            }  
              
            modal.show();  
              
            if (window.Lampa && window.Lampa.Controller) {  
                Lampa.Controller.add('ymusic', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet('.ymusic-modal .selector');  
                        Lampa.Controller.collectionFocus(false, '.ymusic-modal');  
                    },  
                    enter: () => {  
                        const focused = Lampa.Controller.focused();  
                        if (focused && focused.hasClass('ymusic-close')) {  
                            closeYMusic();  
                        } else if (focused && focused.hasClass('ymusic-open-external')) {  
                            window.open('https://music.yandex.ru/', '_blank');  
                        }  
                    },  
                    back: () => {  
                        closeYMusic();  
                    }  
                });  
                  
                Lampa.Controller.toggle('ymusic');  
            }  
        } catch (error) {  
            console.error('YMusic: Error opening modal:', error);  
        }  
    }  
  
    function closeYMusic() {  
        try {  
            $('.ymusic-modal').hide();  
            if (window.Lampa && window.Lampa.Controller) {  
                Lampa.Controller.toggle('content');  
            }  
        } catch (error) {  
            console.error('YMusic: Error closing modal:', error);  
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
  
            // Обработчики событий  
            $(document).on('click', '[data-action="ymusic"]', openYMusic);  
            $(document).on('click', '.ymusic-close', closeYMusic);  
            $(document).on('click', '.ymusic-open-external', function() {  
                window.open('https://music.yandex.ru/', '_blank');  
            });  
  
            // Обработчик для пульта  
            $(document).on('keydown', function(e) {  
                if (e.keyCode === 13) {  
                    const focused = $('.menu__item.focus[data-action="ymusic"]');  
                    if (focused.length > 0) {  
                        e.preventDefault();  
                        openYMusic();  
                    }  
                }  
            });  
  
            // Стили  
            $('<style>').text(`  
                .ymusic-open-external:hover,  
                .ymusic-open-external.focus {  
                    background: #e55a2b !important;  
                }  
                .ymusic-close:hover,  
                .ymusic-close.focus {  
                    background: rgba(255,255,255,0.2) !important;  
                }  
            `).appendTo('head');  
  
            // Наблюдатель за изменениями DOM  
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
