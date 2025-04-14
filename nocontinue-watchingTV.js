(function () {
  'use strict';

  // Функция для запуска плагина
  function startPlugin() {
    console.log('HideContinueWatching: Запуск плагина...');

    // Добавляем стили для скрытия блока
    var style = `
      <style>
        .items-line--type-iptv {
          display: none !important;
        }
      </style>
    `;

    try {
      Lampa.Template.add('hide_continue_watching_css', style);
      $('body').append(Lampa.Template.get('hide_continue_watching_css', {}, true));
      console.log('HideContinueWatching: Стили добавлены');
    } catch (e) {
      console.error('HideContinueWatching: Ошибка добавления стилей:', e);
      return;
    }

    // Функция для скрытия блока
    function hideContinueWatching() {
      var $continueWatchingBlock = $('.items-line--type-iptv');
      $continueWatchingBlock.css('display', 'none'); // Дополнительно принудительно скрываем через JS
      console.log('HideContinueWatching: Блок "Продолжить просмотр" скрыт');
    }

    // Применяем скрытие при загрузке страницы
    hideContinueWatching();

    // Следим за динамической загрузкой контента
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready' || e.type === 'complete') {
        console.log('HideContinueWatching: Приложение готово или контент загружен, проверка блока...');
        hideContinueWatching();
      }
    });

    // Следим за изменением активности (переход между страницами)
    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start') {
        console.log('HideContinueWatching: Новая активность, проверка блока...');
        setTimeout(hideContinueWatching, 500); // Даем время на рендеринг
      }
    });
  }

  // Запускаем плагин, когда приложение готово
  if (window.appready) {
    console.log('HideContinueWatching: Приложение готово, запуск плагина...');
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') {
        console.log('HideContinueWatching: Событие appready, запуск плагина...');
        startPlugin();
      }
    });
  }
})();
