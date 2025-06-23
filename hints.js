(function () {
    'use strict';

    Lampa.Lang.add({
        maxsm_hints_torrents: {
            ru: "Проблемы с видео? Смените раздачу.",
            en: "Problems with video? Change the torrent.",
            uk: "Проблеми з відео? Змініть роздачу.",
            be: "Праблемы з відэа? Змяні раздачу.",
            pt: "Problemas com o vídeo? Troque o torrent.",
            zh: "视频有问题？换个种子试试。",
            he: "בעיות בווידאו? החלף טורנט.",
            cs: "Problémy s videem? Změňte torrent.",
            bg: "Проблеми с видеото? Смени торента."
        },
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
        },
        maxsm_hints_incard: {
            ru: "Карточка добавляется при появлении информации о контенте, но сам контент может отсутствовать в источниках.",
            en: "A card appears when content information becomes available, but the content itself may be missing from sources.",
            uk: "Картка з'являється при появі інформації про контент, але сам контент може бути відсутній у джерелах.",
            be: "Картка з'яўляецца пры з'яўленні інфармацыі аб кантэнце, але сам кантэнт можа адсутнічаць у крыніцах.",
            pt: "O cartão é adicionado quando há informações sobre o conteúdo, mas o próprio conteúdo pode não estar disponível nas fontes.",
            zh: "当有内容信息时会显示卡片，但内容本身可能在来源中不存在。",
            he: "כרטיס מופיע כשיש מידע על התוכן, אך ייתכן שהתוכן עצמו אינו זמין במקורות.",
            cs: "Karta se zobrazí při dostupnosti informací o obsahu, ale samotný obsah může ve zdrojích chybět.",
            bg: "Картата се добавя при наличие на информация за съдържанието, но самото съдържание може да липсва в източниците."
        }
    });

    var CONFIG = {
        online: {
            id: 'hint-online-banner',
            showDuration: 3000,
            fadeDuration: 500,
            repeat: true
        },
        torrents: {
            id: 'hint-torrent-banner',
            showDuration: 4000,
            fadeDuration: 500,
            repeat: true
        },
        incard: {
            id: 'hint-incard-banner',
            showDuration: 4000,
            fadeDuration: 500,
            repeat: false
        }
    };

    function createHintText(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.07); border-radius: 0.5em; margin-left: 1.2em; margin-right: 1.2em; padding: 1.2em; font-size: 1.2em; transition: opacity 0.5s;">' + hintText + '</div>';

    }
    
    function createHintText_incard(hintText, id) {
        return '<div id="' + id + '" style="overflow: hidden; display: flex; align-items: center; background-color: rgba(0, 0, 0, 0.15); border-radius: 0.5em;  margin-bottom: 1.2em; padding: 0.5em;  font-size: 1.2em; transition: opacity 0.5s; line-height: 1.4;">' + hintText + '</div>';

    }
    
    function fadeOutAndRemove($el, duration) {
        var height = $el[0].scrollHeight;
    
        $el.css({
            maxHeight: height + 'px',
            overflow: 'hidden'
        });
    
        // Force reflow
        $el[0].offsetHeight;
    
        // Схлопывание
        $el.css({
            transition: 'opacity ' + duration + 'ms, max-height ' + duration + 'ms, margin-bottom ' + duration + 'ms, padding ' + duration + 'ms',
            opacity: '0',
            maxHeight: '0px',
            marginBottom: '0px',
            paddingTop: '0px',
            paddingBottom: '0px'
        });
    
        // Подождём чуть дольше, чем сама анимация, чтобы DOM спокойно переварил
        setTimeout(function () {
            $el.remove();
        }, duration + 50); // буфер для плавности
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
            online: false,
            torrents: false
        };

        Lampa.Storage.listener.follow('change', function (event) {
            if (event.name === 'activity') {
                var component = Lampa.Activity.active().component;

                if (component === 'lampac' && (CONFIG.online.repeat || !shown.online)) {
                    waitForElement('.explorer__files-head', function (el) {
                        var $hint = $(createHintText(Lampa.Lang.translate('maxsm_hints_online'), CONFIG.online.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.online.fadeDuration);
                        }, CONFIG.online.showDuration);

                        shown.online = true;
                    });
                }

                if (component === 'torrents' && (CONFIG.torrents.repeat || !shown.torrents)) {
                    waitForElement('.explorer__files-head', function (el) {
                        var $hint = $(createHintText(Lampa.Lang.translate('maxsm_hints_torrents'), CONFIG.torrents.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.torrents.fadeDuration);
                        }, CONFIG.torrents.showDuration);

                        shown.torrents = true;
                    });
                }
                
                if (component === 'full' && (CONFIG.incard.repeat || !shown.incard)) {
                    waitForElement('.full-start-new__head', function (el) {
                        var $hint = $(createHintText_incard(Lampa.Lang.translate('maxsm_hints_incard'), CONFIG.incard.id));
                        $(el).before($hint);

                        setTimeout(function () {
                            fadeOutAndRemove($hint, CONFIG.incard.fadeDuration);
                        }, CONFIG.incard.showDuration);

                        shown.incard = true;
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
