(function(){
    console.log('Player Panel Modifier Plugin: Starting initialization...');

    // Проверяем наличие jQuery
    if (typeof $ === 'undefined') {
        console.error('Player Panel Modifier Plugin: jQuery is not defined');
        return;
    }

    // Проверяем наличие Lampa
    if (typeof Lampa === 'undefined') {
        console.error('Player Panel Modifier Plugin: Lampa is not defined');
        return;
    }

    // Функция для модификации панели плеера
    function modifyPlayerPanel() {
        console.log('Player Panel Modifier Plugin: Attempting to modify player panel...');

        // Находим панель плеера
        var playerPanel = $('.player-panel');
        if (!playerPanel.length) {
            console.log('Player Panel Modifier Plugin: Player panel not found yet');
            return false;
        }

        // Находим timeline и right panel
        var timeline = playerPanel.find('.player-panel__timeline');
        var rightPanel = playerPanel.find('.player-panel__right');
        if (!timeline.length || !rightPanel.length) {
            console.error('Player Panel Modifier Plugin: Required elements (timeline or right panel) not found');
            return false;
        }

        // Извлекаем кнопки из player-panel__right
        var buttons = rightPanel.find('.button.selector');
        if (!buttons.length) {
            console.error('Player Panel Modifier Plugin: No buttons found in player-panel__right');
            return false;
        }

        // Создаём новый контейнер для кнопок
        var buttonsContainer = $('<div class="player-panel__buttons-inline"></div>');
        buttons.each(function() {
            $(this).appendTo(buttonsContainer);
        });

        // Создаём обёртку для timeline и кнопок
        var wrapper = $('<div class="player-panel__timeline-wrapper"></div>');
        
        // Перемещаем timeline в обёртку
        timeline.wrap(wrapper);
        var timelineWrapper = timeline.parent('.player-panel__timeline-wrapper');

        // Вставляем кнопки после timeline внутри обёртки
        timeline.after(buttonsContainer);

        // Удаляем старые стили, если они были добавлены ранее
        $('#player-panel-modifier-styles').remove();

        // Добавляем стили через <style> тег с уникальным ID
        var styles = `
            /* Обёртка для timeline и кнопок */
            .player-panel.panel--visible .player-panel__timeline-wrapper {
                display: flex;
                align-items: center;
                width: 100%;
                margin: 0 auto;
            }

            /* Стили для timeline */
            .player-panel.panel--visible .player-panel__timeline {
                width: 70%; /* Уменьшенная ширина шкалы */
                display: flex;
                align-items: center;
            }

            .player-panel.panel--visible .player-panel__buttons-inline {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 10px; /* Отступ между шкалой и кнопками */
            }

            /* Уменьшаем размер кнопок */
            .player-panel.panel--visible .player-panel__buttons-inline .button.selector {
                transform: scale(0.7);
                margin: 0;
            }

            /* Скрываем оригинальный контейнер */
            .player-panel.panel--visible .player-panel__right {
                display: none !important;
            }

            /* Убедимся, что время слева и справа остаётся на месте */
            .player-panel.panel--visible .player-panel__line-one {
                display: flex;
                justify-content: space-between;
                width: 100%;
            }
        `;

        // Добавляем стили в head
        $('<style id="player-panel-modifier-styles">').text(styles).appendTo('head');
        console.log('Player Panel Modifier Plugin: Styles applied');

        // Логируем успешное выполнение
        console.log('Player Panel Modifier Plugin: Timeline and buttons aligned side by side, styles applied successfully');
        return true;
    }

    // Функция для наблюдения за DOM
    function observeDOM() {
        console.log('Player Panel Modifier Plugin: Setting up DOM observer...');
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Проверяем, появилась ли панель плеера
                    var playerPanel = $('.player-panel');
                    if (playerPanel.length) {
                        console.log('Player Panel Modifier Plugin: Player panel detected via observer');
                        if (modifyPlayerPanel()) {
                            // Если модификация прошла успешно, отключаем наблюдатель
                            observer.disconnect();
                        }
                    }
                }
            });
        });

        // Наблюдаем за изменениями в body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Пробуем модифицировать сразу
    if (!window.player_panel_modifier_plugin) {
        console.log('Player Panel Modifier Plugin: Initializing plugin');
        window.player_panel_modifier_plugin = true;

        // Пробуем модифицировать сразу
        if (!modifyPlayerPanel()) {
            // Если не удалось, запускаем наблюдатель
            observeDOM();
        }

        // Также попробуем привязаться к событию player (на всякий случай)
        if (Lampa.Listener) {
            Lampa.Listener.follow('player', function(event) {
                console.log('Player Panel Modifier Plugin: Player event triggered:', event);
                setTimeout(modifyPlayerPanel, 100);
            });
        }
    }
})();
