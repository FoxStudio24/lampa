(function() {
    'use strict';

    // Функция для замены логотипа
    function replaceLogo() {
        var logoIcon = document.querySelector('.head__logo-icon');
        if (logoIcon) {
            var existingImg = logoIcon.querySelector('img');
            if (existingImg) {
                existingImg.src = 'https://raw.githubusercontent.com/FoxStudio24/deny/refs/heads/main/ico/logo.png';
            } else {
                var newImg = document.createElement('img');
                newImg.src = 'https://raw.githubusercontent.com/FoxStudio24/deny/refs/heads/main/ico/logo.png';
                newImg.className = 'head__logo-icon-img';
                logoIcon.innerHTML = '';
                logoIcon.appendChild(newImg);
            }

            var logoCap = logoIcon.querySelector('.head__logo-cap');
            if (logoCap) {
                logoCap.remove();
            }
        }
    }

    // Запуск при загрузке страницы и повторное применение при необходимости
    document.addEventListener('DOMContentLoaded', replaceLogo);
    window.addEventListener('load', replaceLogo);

    // Наблюдатель для динамически добавленных элементов
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length || mutation.type === 'childList') {
                replaceLogo();
            }
        });
    });

    // Наблюдать за изменениями в теле документа
    observer.observe(document.body, { childList: true, subtree: true });

    // Функция для постоянной проверки и применения изменений
    setInterval(replaceLogo, 1000);
})();