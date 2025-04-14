(function () {
  'use strict';

  // Функция для запуска плагина
  function startPlugin() {
    console.log('HideContinueWatching: Запуск плагина...');

    // Добавляем языковые настройки
    try {
      Lampa.Lang.add({
        hide_continue_watching: {
          ru: 'Скрыть "Продолжить просмотр"',
          en: 'Hide "Continue Watching"',
          uk: 'Приховати "Продовжити перегляд"',
          be: 'Схаваць "Працягнуць прагляд"',
          zh: '隐藏“继续观看”',
          pt: 'Ocultar "Continuar Assistindo"',
          bg: 'Скриване на „Продължи гледането“'
        }
      });
      console.log('HideContinueWatching: Языковые настройки добавлены');
    } catch (e) {
      console.error('HideContinueWatching: Ошибка добавления языковых настроек:', e);
      return;
    }

    // Добавляем стили для скрытия блока
    var style = `
      <style>
        .items-line--type-iptv.hide-continue-watching {
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

    // Иконка для настроек
    var icon = `
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>
        <path d="M5 14H22V18H5V14Z" fill="white"/>
        <path d="M5 20H15V23H5V20Z" fill="white"/>
        <path d="M25 20H31V23H25V20Z" fill="white"/>
        <path d="M5 5L31 23" stroke="red" stroke-width="3"/>
      </svg>
    `;

    // Добавляем настройки в меню
    try {
      Lampa.SettingsApi.addComponent({
        component: 'hide_continue_watching',
        icon: icon,
        name: 'Hide Continue Watching'
      });
      Lampa.SettingsApi.addParam({
        component: 'hide_continue_watching',
        param: {
          name: 'hide_continue_watching',
          type: 'trigger',
          default: false
        },
        field: {
          name: Lampa.Lang.translate('hide_continue_watching')
        }
      });
      console.log('HideContinueWatching: Настройки добавлены');
    } catch (e) {
      console.error('HideContinueWatching: Ошибка добавления настроек:', e);
      return;
    }

    // Функция для применения скрытия блока
    function applyHideContinueWatching() {
      var shouldHide = Lampa.Storage.field('hide_continue_watching');
      console.log('HideContinueWatching: Проверка настройки hide_continue_watching:', shouldHide);

      var $continueWatchingBlock = $('.items-line--type-iptv');
      if (shouldHide) {
        $continueWatchingBlock.addClass('hide-continue-watching');
        console.log('HideContinueWatching: Блок "Продолжить просмотр" скрыт');
      } else {
        $continueWatchingBlock.removeClass('hide-continue-watching');
        console.log('HideContinueWatching: Блок "Продолжить просмотр" отображен');
      }
    }

    // Применяем скрытие при загрузке страницы
    applyHideContinueWatching();

    // Следим за изменениями настроек
    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'hide_continue_watching') {
        console.log('HideContinueWatching: Настройка изменена:', event.value);
        applyHideContinueWatching();
      }
    });

    // Следим за динамической загрузкой контента (на случай, если блок появляется позже)
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready' || e.type === 'complete') {
        console.log('HideContinueWatching: Приложение готово или контент загружен, проверка блока...');
        applyHideContinueWatching();
      }
    });

    // Следим за изменением активности (переход между страницами)
    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start') {
        console.log('HideContinueWatching: Новая активность, проверка блока...');
        setTimeout(applyHideContinueWatching, 500); // Даем время на рендеринг
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