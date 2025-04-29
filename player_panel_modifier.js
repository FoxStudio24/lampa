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
        console.log('Player Panel Modifier Plugin: Modifying player panel...');

        // Находим панель плеера
        var playerPanel = $('.player-panel');
        if (!playerPanel.length) {
            console.error('Player Panel Modifier Plugin: Player panel not found');
            return;
        }

        // Находим timeline и right panel
        var timeline = playerPanel.find('.player-panel__timeline');
        var rightPanel = playerPanel.find('.player-panel__right');
        if (!timeline.length || !rightPanel.length) {
            console.error('Player Panel Modifier Plugin: Required elements not found');
            return;
        }

        // Извлекаем кнопки из player-panel__right
        var buttons = rightPanel.find('.button.selector');
        if (!buttons.length) {
            console.error('Player Panel Modifier Plugin: No buttons found in player-panel__right');
            return;
        }

        // Создаём новый контейнер для кнопок рядом с timeline
        var buttonsContainer = $('<div class="player-panel__buttons-inline"></div>');
        buttons.each(function() {
            $(this).appendTo(buttonsContainer);
        });

        // Вставляем контейнер с кнопками после timeline
        timeline.after(buttonsContainer);

        // Добавляем стили через <style> тег
        var styles = `
            /* Сбрасываем цвета, фоны и эффекты */
            .player-panel,
            .player-panel * {
                background: transparent !important;
                background-color: transparent !important;
                color: #fff !important; /* Белый цвет текста и иконок для видимости */
                fill: #fff !important;
                stroke: #fff !important;
                box-shadow: none !important;
                text-shadow: none !important;
                border: none !important;
            }

            /* Стили для timeline и кнопок */
            .player-panel__timeline {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
            }

            .player-panel__buttons-inline {
                position: absolute;
                left: 80%; /* Располагаем на 80% длины timeline */
                transform: translateX(-50%);
                display: flex;
                align-items: center;
                gap: 10px; /* Расстояние между кнопками */
            }

            /* Уменьшаем размер кнопок, чтобы они уместились */
            .player-panel__buttons-inline .button.selector {
                transform: scale(0.8); /* Уменьшаем кнопки на 20% */
                margin: 0;
            }

            /* Убираем ненужные отступы и выравниваем */
            .player-panel__right {
                display: none; /* Скрываем оригинальный контейнер */
            }
        `;

        // Добавляем стили в head
        $('<style>').text(styles).appendTo('head');
        console.log('Player Panel Modifier Plugin: Styles applied');

        // Логируем успешное выполнение
        console.log('Player Panel Modifier Plugin: Buttons moved and styles applied successfully');
    }

    // Запускаем модификацию при загрузке плеера
    Lampa.Listener.follow('player_panel', function(event) {
        console.log('Player Panel Modifier Plugin: Player panel event triggered:', event);
        if (event.type === 'show' || event.type === 'update') {
            setTimeout(modifyPlayerPanel, 100); // Небольшая задержка для уверенности, что DOM готов
        }
    });

    // Инициализация плагина
    if (!window.player_panel_modifier_plugin) {
        console.log('Player Panel Modifier Plugin: Initializing plugin');
        window.player_panel_modifier_plugin = true;
        modifyPlayerPanel();
    }
})();