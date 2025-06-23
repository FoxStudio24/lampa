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
            fadeDuration: 600,
            repeat: true
        }
    };

    function createHintText(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.07); border-radius: 0.5em; margin-left: 1.2em; margin-right: 1.2em; padding: 1.2em; font-size: 1.2em; transform: translateY(-20px); opacity: 0; transition: all 0.6s ease-out;">' + hintText + '</div>';
    }
    
    function fadeInAndShow($el, duration) {
        // Элемент уже создан с начальным состоянием (translateY(-20px), opacity: 0)
        
        // Force reflow
        $el[0].offsetHeight;

        // Анимация появления - плавное движение вниз
        setTimeout(function() {
            $el.css({
                transform: 'translateY(0px)',
                opacity: '1'
            });
        }, 50);
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
