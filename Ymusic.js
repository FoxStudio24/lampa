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
        }  
    });  
  
    // Создаем пункт меню  
    function addMenuItem() {  
        const menuItem = $(`  
            <li class="menu__item selector binded" data-action="ymusic">  
                <div class="menu__ico">  
                    <svg viewBox="0 0 24 24" fill="currentColor">  
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>  
                    </svg>  
                </div>  
                <div class="menu__text">${Lampa.Lang.translate('menu_ymusic')}</div>  
            </li>  
        `);  
  
        // Добавляем в первую секцию меню  
        $('.menu__case:first .menu__list').append(menuItem);  
    }  
  
    // Создаем модальное окно  
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
                    ">${Lampa.Lang.translate('ymusic_close')}</div>  
                </div>  
                <iframe src="https://music.yandex.ru/" style="  
                    width: 100%;  
                    height: 100%;  
                    border: none;  
                "></iframe>  
            </div>  
        `);  
  
        $('body').append(modal);  
        return modal;  
    }  
  
    // Обработчик открытия модала  
    function openYMusic() {  
        const modal = $('.ymusic-modal');  
        if (modal.length === 0) {  
            createModal();  
        }  
          
        $('.ymusic-modal').show();  
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
        // Добавляем пункт меню  
        addMenuItem();  
  
        // Обработчик клика по пункту меню  
        $(document).on('click', '[data-action="ymusic"]', openYMusic);  
          
        // Обработчик кнопки закрытия  
        $(document).on('click', '.ymusic-close', closeYMusic);  
  
        console.log('YMusic plugin loaded');  
    }  
  
    // Запускаем после загрузки Lampa  
    if (window.Lampa) {  
        init();  
    } else {  
        window.addEventListener('load', init);  
    }  
  
})();
