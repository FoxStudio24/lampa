(function() {
    'use strict';

    // Функция для скрытия элементов меню в настройках
    function hideSettingsMenu() {
        Lampa.Settings.listener.follow('open', function(e) {
            var selectors = ['account', 'parser', 'server', 'tmdb', 'iptv', 'plugins', 'sisi', 'lampac_profiles'].map(function(c) {
                return '[data-component="' + c + '"]';
            }).join(',');

            $(selectors, e.body).remove();
        });
    }

    // Запуск при загрузке страницы и повторное применение при необходимости
    document.addEventListener('DOMContentLoaded', hideSettingsMenu);
    window.addEventListener('load', hideSettingsMenu);

    // Функция для постоянной проверки и применения изменений
    setInterval(hideSettingsMenu, 1000);
})();
