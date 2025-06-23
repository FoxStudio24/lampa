(function () {
    'use strict';

    Lampa.Lang.add({
        maxsm_hints_online: {
            ru: "Проблемы с видео? Смените источник или озвучку.",
            en: "Problems with video? Change the source or audio track.",
            uk: "Проблеми з відео? Змініть джерело або озвучення.",
            be: "Праблемы з відэа? Змяніце крыніцу або агучку.",
            pt: "Problemas com o vídeo? Troque a fonte ou a dublagem.",
            zh: "视频有问题？试试更换来源或音轨。",
            he: "בעיות בווידאו? נסה מקור או פסקול אחר.",
            cs: "Problémy s videem? Změňte zdroj nebo dabing.",
            bg: "Проблеми с видеото? Смени източника или озвучаването."
        }
    });

    var CONFIG = {
        online: {
            id: 'hint-online-banner',
            showDuration: 3000,
            fadeDuration: 500,
            repeat: true
        }
    };

    function createHintText(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.07); border-radius: 0.5em; margin-left: 1.2em; margin-right: 1.2em; padding: 1.2em; font-size: 1.2em; opacity: 0; transition: opacity 0.5s, max-height 0.5s, margin 0.5s, padding 0.5s;">' + hintText + '</div>';
    }
    
    function fadeInAndShow($el, duration) {
        var height = $el[0].scrollHeight;
        
        // Устанавливаем начальное состояние
        $el.css({
            opacity: '0',
            maxHeight: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px'
        });

        // Force reflow
        $el[0].offsetHeight;

        // Анимация появления
        setTimeout(function() {
            $el.css({
                opacity: '1',
                maxHeight: height + 'px',
                marginLeft: '1.2em',
                marginRight: '1.2em',
                paddingTop: '1.2em',
                paddingBottom: '1.2em'
            });
        }, 10);
    }
    
    function fadeOutAndRemove($el, duration) {
        var height = $el[0].scrollHeight;
    
        $el.css({
            maxHeight: height + 'px',
            overflow: 'hidden'
        });
    
        // Force reflow
        $el[0].offsetHeight;
    
        // Анимация исчезновения
        $el.css({
            transition: 'opacity ' + duration + 'ms, max-height ' + duration + 'ms, margin ' + duration + 'ms, padding ' + duration + 'ms',
            opacity: '0',
            maxHeight: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px'
        });
    
        // Удаляем элемент после завершения анимации
        setTimeout(function () {
            $el.remove();
        }, duration + 50);
    }

    function waitForElement(selector, callback) {
        var check = function () {
            var el = document.querySelector(selector);
            if (el) {
                callback(el);
                return true;
            }
            return false;
        };

        if (typeof MutationObserver !== 'undefined') {
            if (check()) return;

            var observer = new MutationObserver(function () {
                if (check()) observer.disconnect();
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            var interval = setInterval(function () {
                if (check()) clearInterval(interval);
            }, 500);
        }
    }

    function initializeHintFeature() {
        var shown = {
            online: false
        };

        Lampa.Storage.listener.follow('change', function (event) {
            if (event.name === 'activity') {
                var component = Lampa.Activity.active().component;

                if (component === 'lampac' && (CONFIG.online.repeat || !shown.online)) {
                    waitForElement('.explorer__files-head', function (el) {
                        var $hint = $(createHintText(Lampa.Lang.translate('maxsm_hints_online'), CONFIG.online.id));
                        $(el).before($hint);

                        // Анимация появления
                        fadeInAndShow($hint, CONFIG.online.fadeDuration);

                        // Анимация исчезновения через заданное время
                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.online.fadeDuration);
                        }, CONFIG.online.showDuration);

                        shown.online = true;
                    });
                }
            }
        });
    }

    if (window.appready) {
        initializeHintFeature();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                initializeHintFeature();
            }
        });
    }
})();
