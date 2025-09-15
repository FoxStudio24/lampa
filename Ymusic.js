(function() {  
    'use strict';  
  
    // Добавляем переводы для разных языков  
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
  
    let menuItemAdded = false;  
  
    // Создаем пункт меню  
    function addMenuItem() {  
        // Проверяем, не добавлен ли уже пункт  
        if ($('[data-action="ymusic"]').length > 0) {  
            return;  
        }  
  
        const menuItem = $(`  
            <li class="menu__item selector binded" data-action="ymusic">  
                <div class="menu__ico">  
                    <svg viewBox="0 0 24 24" fill="currentColor">  
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5c4.69 0 8.5 3.81 8.5 8.5s-3.81 8.5-8.5 8.5S3.5 16.69 3.5 12 7.31 3.5 12 3.5zM11 17l6-4-6-4v8z"/>  
                    </svg>  
                </div>  
                <div class="menu__text">${Lampa.Lang.translate('menu_ymusic')}</div>  
            </li>  
        `);  
  
        // Добавляем в первую секцию меню  
        $('.menu__case:first .menu__list').append(menuItem);  
        menuItemAdded = true;  
    }  
  
    // Функция для проверки и добавления пункта меню  
    function ensureMenuItemExists() {  
        if (!menuItemAdded || $('[data-action="ymusic"]').length === 0) {  
            addMenuItem();  
        }  
    }  
  
    // Создаем модальное окно с альтернативным контентом  
    function createModal() {  
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
                    ">${Lampa.Lang.translate('ymusic_close')}</div>  
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
                    <div style="  
                        font-size: 48px;  
                        margin-bottom: 20px;  
                    ">🎵</div>  
                    <h2 style="  
                        font-size: 32px;  
                        margin-bottom: 20px;  
                        color: #ff6b35;  
                    ">Яндекс.Музыка</h2>  
                    <p style="  
                        font-size: 18px;  
                        margin-bottom: 30px;  
                        max-width: 500px;  
                        line-height: 1.5;  
                    ">${Lampa.Lang.translate('ymusic_iframe_blocked')}</p>  
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
                    ">${Lampa.Lang.translate('ymusic_open_external')}</button>  
                </div>  
            </div>  
        `);  
  
        $('body').append(modal);  
        return modal;  
    }  
  
    // Обработчик открытия модала  
    function openYMusic() {  
        let modal = $('.ymusic-modal');  
        if (modal.length === 0) {  
            modal = createModal();  
        }  
          
        modal.show();  
          
        // Настройка контроллера для навигации пультом  
        Lampa.Controller.add('ymusic', {  
            toggle: () => {  
                Lampa.Controller.collectionSet('.ymusic-modal');  
                Lampa.Controller.collectionFocus(false, '.ymusic-modal');  
            },  
            back: () => {  
                closeYMusic();  
            }  
        });  
          
        Lampa.Controller.toggle('ymusic');  
    }  
  
    // Обработчик закрытия модала  
    function closeYMusic() {  
        $('.ymusic-modal').hide();  
        Lampa.Controller.toggle('content');  
    }  
  
    // Инициализация плагина  
    function init() {  
        // Добавляем пункт меню при инициализации  
        addMenuItem();  
  
        // Следим за изменениями в DOM и добавляем пункт при необходимости  
        const observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList') {  
                    // Проверяем, если меню было пересоздано  
                    if ($('.menu__case:first .menu__list').length > 0) {  
                        ensureMenuItemExists();  
                    }  
                }  
            });  
        });  
  
        // Начинаем наблюдение за изменениями в body  
        observer.observe(document.body, {  
            childList: true,  
            subtree: true  
        });  
  
        // Обработчик клика по пункту меню (используем делегирование событий)  
        $(document).on('click', '[data-action="ymusic"]', openYMusic);  
          
        // Обработчик кнопки закрытия  
        $(document).on('click', '.ymusic-close', closeYMusic);  
          
        // Обработчик кнопки открытия в новой вкладке  
        $(document).on('click', '.ymusic-open-external', function() {  
            window.open('https://music.yandex.ru/', '_blank');  
        });  
  
        // Добавляем стили для hover эффектов  
        $('<style>').text(`  
            .ymusic-open-external:hover {  
                background: #e55a2b !important;  
            }  
            .ymusic-close:hover {  
                background: rgba(255,255,255,0.2) !important;  
            }  
        `).appendTo('head');  
  
        // Периодически проверяем наличие пункта меню  
        setInterval(ensureMenuItemExists, 5000);  
  
        console.log('YMusic plugin loaded');  
    }  
  
    // Запускаем после загрузки Lampa  
    if (window.Lampa) {  
        init();  
    } else {  
        window.addEventListener('load', init);  
    }  
  
})();
