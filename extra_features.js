(function () {
  'use strict';

  // Функция для запуска плагина
  function startPlugin() {
    console.log('ExtraFeatures: Запуск плагина...');

    // Добавляем языковые настройки
    try {
      Lampa.Lang.add({
        extra_features: {
          ru: 'Доп фичи',
          en: 'Extra Features',
          uk: 'Додаткові функції',
          be: 'Дадатковыя функцыі',
          zh: '额外功能',
          pt: 'Recursos Extras',
          bg: 'Допълнителни функции'
        },
        new_fonts: {
          ru: 'Новые шрифты',
          en: 'New Fonts',
          uk: 'Нові шрифти',
          be: 'Новыя шрыфты',
          zh: '新字体',
          pt: 'Novas Fontes',
          bg: 'Нови шрифтове'
        },
        new_fonts_show: {
          ru: 'Показать',
          en: 'Show',
          uk: 'Показати',
          be: 'Паказаць',
          zh: '显示',
          pt: 'Mostrar',
          bg: 'Показване'
        },
        new_fonts_hide: {
          ru: 'Скрыть',
          en: 'Hide',
          uk: 'Приховати',
          be: 'Схаваць',
          zh: '隐藏',
          pt: 'Ocultar',
          bg: 'Скриване'
        }
      });
      console.log('ExtraFeatures: Языковые настройки добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления языковых настроек:', e);
      return;
    }

    // Добавляем стили для шрифта Martian Mono
    var style = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Martian+Mono:wght@400;700&display=swap');
        .martian-mono * {
          font-family: 'Martian Mono', monospace !important;
        }
      </style>
    `;

    try {
      Lampa.Template.add('extra_features_css', style);
      $('body').append(Lampa.Template.get('extra_features_css', {}, true));
      console.log('ExtraFeatures: Стили добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления стилей:', e);
      return;
    }

    // Новая иконка (из твоего SVG)
    var icon = `
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
        <rect x="304" y="128" style="fill: rgb(255, 255, 255);" width="160" height="352" fill="#FFFFFF"></rect>
        <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="-37.9375" y1="639.3125" x2="-37.9375" y2="653.3125" gradientTransform="matrix(16 0 0 -16 735 10581)">
          <stop offset="0" style="stop-color:#4DC4FF"></stop>
          <stop offset="1" style="stop-color:#4DE1FF"></stop>
        </linearGradient>
        <rect x="48" y="128" style="fill: rgb(255, 255, 255);" width="160" height="224" fill="url(#SVGID_1_)"></rect>
        <g>
          <path style="fill: rgb(255, 255, 255);" d="M464,112H304c-4.208,0-8.336,1.712-11.312,4.688S288,123.792,288,128v352 c0,4.208,1.712,8.336,4.688,11.312S299.792,496,304,496h160c4.208,0,8.336-1.712,11.312-4.688S480,484.208,480,480V128 c0-4.208-1.712-8.336-4.688-11.312C472.336,113.712,468.208,112,464,112z M448,464H320V144h128V464z" fill="#297BCC"></path>
          <path style="fill: rgb(255, 255, 255);" d="M208,112H48c-4.208,0-8.336,1.712-11.312,4.688S32,123.792,32,128v224 c0,4.208,1.712,8.336,4.688,11.312S43.792,368,48,368h160c4.208,0,8.336-1.712,11.312-4.688S224,356.208,224,352V128 c0-4.208-1.712-8.336-4.688-11.312C216.336,113.712,212.208,112,208,112z M192,336H64V144h128V336z" fill="#297BCC"></path>
          <rect y="16" style="fill: rgb(255, 255, 255);" width="512" height="32" fill="#297BCC"></rect>
        </g>
      </svg>
    `;

    // Добавляем настройки в меню
    try {
      Lampa.SettingsApi.addComponent({
        component: 'extra_features',
        icon: icon,
        name: Lampa.Lang.translate('extra_features')
      });
      Lampa.SettingsApi.addParam({
        component: 'extra_features',
        param: {
          name: 'new_fonts',
          type: 'select',
          values: {
            show: Lampa.Lang.translate('new_fonts_show'),
            hide: Lampa.Lang.translate('new_fonts_hide')
          },
          default: 'hide'
        },
        field: {
          name: Lampa.Lang.translate('new_fonts')
        }
      });
      console.log('ExtraFeatures: Настройки добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления настроек:', e);
      return;
    }

    // Функция для применения шрифта Martian Mono
    function applyNewFonts() {
      var shouldShow = Lampa.Storage.field('new_fonts') === 'show';
      console.log('ExtraFeatures: Проверка настройки new_fonts:', shouldShow);

      if (shouldShow) {
        $('body').addClass('martian-mono');
        console.log('ExtraFeatures: Шрифт Martian Mono применен');
      } else {
        $('body').removeClass('martian-mono');
        console.log('ExtraFeatures: Шрифт Martian Mono отключен');
      }
    }

    // Применяем шрифт при загрузке страницы
    applyNewFonts();

    // Следим за изменениями настроек
    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'new_fonts') {
        console.log('ExtraFeatures: Настройка new_fonts изменена:', event.value);
        applyNewFonts();
      }
    });

    // Следим за динамической загрузкой контента
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready' || e.type === 'complete') {
        console.log('ExtraFeatures: Приложение готово или контент загружен, применение шрифта...');
        applyNewFonts();
      }
    });

    // Следим за изменением активности (переход между страницами)
    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start') {
        console.log('ExtraFeatures: Новая активность, применение шрифта...');
        setTimeout(applyNewFonts, 500); // Даем время на рендеринг
      }
    });
  }

  // Запускаем плагин, когда приложение готово
  if (window.appready) {
    console.log('ExtraFeatures: Приложение готово, запуск плагина...');
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') {
        console.log('ExtraFeatures: Событие appready, запуск плагина...');
        startPlugin();
      }
    });
  }
})();
