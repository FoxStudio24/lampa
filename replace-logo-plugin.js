(function() {
    'use strict';

    // Функция для замены логотипа
    function replaceLogo() {
        var langLogo = document.querySelector('.lang__logo');
        if (langLogo) {
            var existingImg = langLogo.querySelector('img');
            if (existingImg) {
                existingImg.src = 'https://raw.githubusercontent.com/FoxStudio24/deny/refs/heads/main/ico/logo.png';
            } else {
                var newImg = document.createElement('img');
                newImg.src = 'https://raw.githubusercontent.com/FoxStudio24/deny/refs/heads/main/ico/logo.png';
                newImg.className = 'lang__logo-img';
                langLogo.innerHTML = '';
                langLogo.appendChild(newImg);
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
