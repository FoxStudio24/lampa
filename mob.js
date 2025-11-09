(function() {
    'use strict';
    
    // Проверка версии Lampa 3.0.0 и выше
    if (Lampa.Manifest && Lampa.Manifest.app_digital < 300) return;
    
    Lampa.Platform.tv();

    let observer;
    window.logoplugin = true;

    function log(...args) {
        if (window.logoplugin) console.log('[combined-plugin]', ...args);
    }

    // ===== ОСНОВНЫЕ СТИЛИ =====
    function applyBaseStyles() {
        // Удаляем старые стили если есть
        var oldStyle = document.getElementById('no-blur-plugin-styles');
        if (oldStyle) oldStyle.remove();
        
        // Добавляем все стили
        var style = document.createElement('style');
        style.id = 'no-blur-plugin-styles';
        style.textContent = `
            /* Отключаем blur на всех постерах */
            .full-start__poster,
            .full-start-new__poster,
            .full-start__poster img,
            .full-start-new__poster img,
            .screensaver__slides-slide img,
            .screensaver__bg,
            .card--collection .card__img {
                filter: none !important;
                -webkit-filter: none !important;
            }
            
            /* Черный фон */
            .background {
                background: #000 !important;
            }
            
            /* Очистка правого блока */
            .full-start-new__right {
                background: none !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                outline: none !important;
            }
            .full-start-new__right::before, 
            .full-start-new__right::after {
                background: none !important;
                box-shadow: none !important;
                border: none !important;
                opacity: 0 !important;
                content: unset !important;
            }
            
            /* Стили для логотипа */
            .full-start-new__title {
                position: relative !important;
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 70px !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            }
            
            /* Плавное затухание постера снизу */
            .full-start-new__poster {
                position: relative !important;
                overflow: visible !important;
            }
            
            .full-start-new__poster img,
            .full--poster {
                mask-image: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 1) 0%,
                    rgba(0, 0, 0, 1) 50%,
                    rgba(0, 0, 0, 0.8) 70%,
                    rgba(0, 0, 0, 0.4) 85%,
                    rgba(0, 0, 0, 0) 100%) !important;
                -webkit-mask-image: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 1) 0%,
                    rgba(0, 0, 0, 1) 50%,
                    rgba(0, 0, 0, 0.8) 70%,
                    rgba(0, 0, 0, 0.4) 85%,
                    rgba(0, 0, 0, 0) 100%) !important;
            }
            
            /* Плавное затухание обложки снизу и сверху */
            .full-start-new__img {
                border-radius: 0 !important;
                mask-image: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 0) 0%,
                    rgba(0, 0, 0, 0.6) 10%,
                    rgba(0, 0, 0, 1) 20%,
                    rgba(0, 0, 0, 1) 70%,
                    rgba(0, 0, 0, 0.8) 85%,
                    rgba(0, 0, 0, 0.4) 95%,
                    rgba(0, 0, 0, 0) 100%) !important;
                -webkit-mask-image: linear-gradient(to bottom, 
                    rgba(0, 0, 0, 0) 0%,
                    rgba(0, 0, 0, 0.6) 10%,
                    rgba(0, 0, 0, 1) 20%,
                    rgba(0, 0, 0, 1) 70%,
                    rgba(0, 0, 0, 0.8) 85%,
                    rgba(0, 0, 0, 0.4) 95%,
                    rgba(0, 0, 0, 0) 100%) !important;
            }
            
            /* Тень для текста */
            .full-start-new__head {
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6) !important;
            }
        `;
        document.head.appendChild(style);
        
        return true;
    }

    function initBlurPlugin() {
        // Запускаем сразу
        applyBaseStyles();

        // Повторяем несколько раз для надежности
        setTimeout(applyBaseStyles, 100);
        setTimeout(applyBaseStyles, 300);
        setTimeout(applyBaseStyles, 500);
        setTimeout(applyBaseStyles, 1000);

        // Мониторинг изменений каждую секунду
        setInterval(function() {
            if (window.lampa_settings && window.lampa_settings.blur_poster !== false) {
                window.lampa_settings.blur_poster = false;
            }
        }, 1000);
    }

    // ===== ФУНКЦИИ ДЛЯ МОБИЛЬНЫХ СТИЛЕЙ =====
    function initMobileStyles() {
        // Применяем стили сразу
        applyMobileStyles();
        
        // Подписываемся на события
        if (typeof Lampa.Listener !== 'undefined' && typeof Lampa.Listener.follow === 'function') {
            // События приложения
            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'full' || e.type === 'card') {
                    // Применяем стили немедленно и с задержками
                    applyMobileStyles();
                    setTimeout(applyMobileStyles, 50);
                    setTimeout(applyMobileStyles, 150);
                    setTimeout(applyMobileStyles, 400);
                    setTimeout(applyMobileStyles, 800);
                    startDOMObserver();
                }
                
                // При скрытии карточки останавливаем observers
                if (e.type === 'hide' || e.type === 'component_hide') {
                    stopDOMObserver();
                }
            });
        }

        // Запускаем постоянное отслеживание
        startDOMObserver();
        
        // Применяем стили с интервалами
        setTimeout(applyMobileStyles, 200);
        setTimeout(applyMobileStyles, 500);
        setTimeout(applyMobileStyles, 1000);
        setTimeout(applyMobileStyles, 1500);
    }

    function startDOMObserver() {
        // Если observer уже запущен, останавливаем его
        stopDOMObserver();
        
        observer = new MutationObserver(function(mutations) {
            let shouldApplyStyles = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            // Проверяем, появились ли элементы карточки
                            if (node.classList && (
                                node.classList.contains('full-start-new__right') ||
                                node.classList.contains('full-start__left') ||
                                node.classList.contains('items-line__head') ||
                                node.classList.contains('full-start-new__poster') ||
                                node.querySelector('.full-start-new__right') ||
                                node.querySelector('.full-start__left') ||
                                node.querySelector('.items-line__head') ||
                                node.querySelector('.full-start-new__poster')
                            )) {
                                shouldApplyStyles = true;
                            }
                        }
                    }
                }
                
                // Также проверяем изменения атрибутов
                if (mutation.type === 'attributes' && 
                    mutation.target.classList && 
                    (mutation.target.classList.contains('full-start-new__poster'))) {
                    shouldApplyStyles = true;
                }
            });
            
            if (shouldApplyStyles) {
                // Применяем стили немедленно
                applyMobileStyles();
                // И еще раз через короткую задержку
                setTimeout(applyMobileStyles, 50);
                setTimeout(applyMobileStyles, 100);
                // Принудительно переприменяем базовые стили для затемнения
                setTimeout(applyBaseStyles, 150);
            }
        });
        
        // Начинаем наблюдение
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }

    function stopDOMObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function applyMobileStyles() {
        // Применяем стили для мобильной адаптации
        const styles = {
            // Основной контейнер
            '.full-start-new__right, .full-start__left': {
                'display': 'flex',
                'flex-direction': 'column',
                'justify-content': 'center',
                'align-items': 'center'
            },
            
            // Кнопки и рейтинг
            '.full-start-new__buttons, .full-start-new__rate-line, .full-start__buttons, .full-start__details': {
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'row',
                'gap': '0.5em',
                'flex-wrap': 'wrap'
            },
            
            // Детали
            '.full-start-new__details, .full-descr__details, .full-descr__tags': {
                'justify-content': 'center',
                'align-items': 'center',
                'display': 'flex',
                'flex-direction': 'row',
                'flex-wrap': 'wrap'
            },
            
            // Текстовые блоки
            '.full-descr__text, .full-start-new__title, .full-start-new__tagline, .full-start__title, .full-start__title-original': {
                'display': 'flex',
                'flex-direction': 'row',
                'justify-content': 'center',
                'align-items': 'center',
                'text-align': 'center'
            }
        };

        // Применяем все стили
        Object.keys(styles).forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                Object.keys(styles[selector]).forEach(property => {
                    element.style[property] = styles[selector][property];
                });
            });
        });

        // Стили для заголовков разделов
        applySectionHeadStyles();
    }

    function applySectionHeadStyles() {
        const sectionTitles = [
            'Рекомендации',
            'Режиссер', 
            'Актеры',
            'Подробно',
            'Похожие',
            'Коллекция'
        ];

        document.querySelectorAll('.items-line__head').forEach(element => {
            const text = element.textContent.trim();
            
            if (text && (
                sectionTitles.includes(text) ||
                text.includes('Сезон')
            )) {
                element.style.display = 'flex';
                element.style.justifyContent = 'center';
                element.style.alignItems = 'center';
                element.style.width = '100%';
            }
        });
    }

    // ===== ФУНКЦИИ ДЛЯ ЛОГОТИПОВ (ВСТРОЕННЫЕ БЕЗ НАСТРОЕК) =====
    function initLogoPlugin() {
        // Встроенная версия плагина логотипов без настроек
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                var data = e.data.movie;
                var type = data.name ? 'tv' : 'movie';
                
                if (data.id !== '') {
                    var url = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
                    
                    $.get(url, function(data) {
                        if (data.logos && data.logos[0]) {
                            var logo = data.logos[0].file_path;
                            
                            if (logo !== '') {
                                // Добавляем логотип с центрированием
                                e.object.activity.render().find('.full-start-new__title').html(
                                    '<div style="display: flex; justify-content: center; align-items: center; width: 100%;">' +
                                    '<img style="margin-top: 5px; max-height: 125px;" src="' + Lampa.TMDB.image('/t/p/w300' + logo.replace('.svg', '.png')) + '"/>' +
                                    '</div>'
                                );
                            }
                        }
                    }).fail(function() {
                        // Ошибка загрузки логотипа - оставляем оригинальный текст
                        log('Failed to load logo');
                    });
                }
            }
        });
    }

    // ===== ОБЩАЯ ИНИЦИАЛИЗАЦИЯ =====
    function initAllPlugins() {
        initBlurPlugin();    // Запускаем отключение blur и базовые стили
        initMobileStyles();  // Запускаем мобильные стили
    }

    function startPlugin() {
        if (window.appready) {
            initAllPlugins();
        } else {
            if (typeof Lampa.Listener !== 'undefined' && typeof Lampa.Listener.follow === 'function') {
                Lampa.Listener.follow('app', function(e) {
                    if (e.type === 'ready') {
                        setTimeout(initAllPlugins, 500);
                    }
                });
            } else {
                setTimeout(initAllPlugins, 2000);
            }
        }
    }

    // Запускаем плагин
    if (typeof Lampa.Timer !== 'undefined' && typeof Lampa.Timer.add === 'function') {
        Lampa.Timer.add(500, startPlugin, true);
    } else {
        setTimeout(startPlugin, 500);
    }

})();
