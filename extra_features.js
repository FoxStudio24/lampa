(function () {
  'use strict';

  // Функция для запуска плагина
  function startPlugin() {
    console.log('ExtraFeatures: Запуск плагина...');

    // Добавляем языковые настройки (для названия раздела)
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
        }
      });
      console.log('ExtraFeatures: Языковые настройки добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления языковых настроек:', e);
      return;
    }

    // Добавляем стили для окрашивания текста в .card__vote
    var style = `
      <style>
        .card__vote.rating-6-to-7 {
          color: #00FF00 !important; /* Зеленый */
        }
        .card__vote.rating-5-to-6 {
          color: #FFFF00 !important; /* Желтый */
        }
        .card__vote.rating-4-to-5 {
          color: #FF0000 !important; /* Красный */
        }
        .card__vote.rating-0-to-4 {
          color: #808080 !important; /* Серый */
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

    // Иконка (шестеренка с звездочкой, оставляем как есть)
    var icon = `
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2C9.163 2 2 9.163 2 18s7.163 16 16 16 16-7.163 16-16S26.837 2 18 2zm0 2c7.732 0 14 6.268 14 14s-6.268 14-14 14S4 25.732 4 18 10.268 4 18 4zm-1 5l1-3 1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3zm6 6v2h-3v3h-2v-3h-3v-2h3v-3h2v3h3z" fill="white"/>
      </svg>
    `;

    // Добавляем настройки в меню (просто как заголовок, без переключателя)
    try {
      Lampa.SettingsApi.addComponent({
        component: 'extra_features',
        icon: icon,
        name: Lampa.Lang.translate('extra_features')
      });
      console.log('ExtraFeatures: Настройки добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления настроек:', e);
      return;
    }

    // Функция для окрашивания текста в .card__vote
    function applyColoredRatings() {
      var $votes = $('.card__vote');
      $votes.each(function () {
        var $vote = $(this);
        $vote.removeClass('rating-6-to-7 rating-5-to-6 rating-4-to-5 rating-0-to-4'); // Удаляем старые классы

        var ratingText = $vote.text().trim();
        var rating = parseFloat(ratingText);

        if (!isNaN(rating)) {
          if (rating >= 6 && rating <= 7) {
            $vote.addClass('rating-6-to-7');
          } else if (rating >= 5 && rating < 6) {
            $vote.addClass('rating-5-to-6');
          } else if (rating >= 4 && rating < 5) {
            $vote.addClass('rating-4-to-5');
          } else if (rating >= 0 && rating < 4) {
            $vote.addClass('rating-0-to-4');
          }
          console.log('ExtraFeatures: Элемент .card__vote с рейтингом', rating, 'обработан');
        } else {
          console.log('ExtraFeatures: Не удалось распознать рейтинг в .card__vote:', ratingText);
        }
      });
    }

    // Применяем цветные рейтинги при загрузке страницы
    applyColoredRatings();

    // Следим за динамической загрузкой контента
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready' || e.type === 'complete') {
        console.log('ExtraFeatures: Приложение готово или контент загружен, применение цветных рейтингов...');
        applyColoredRatings();
      }
    });

    // Следим за изменением активности (переход между страницами)
    Lampa.Listener.follow('activity', function (e) {
      if (e.type === 'start') {
        console.log('ExtraFeatures: Новая активность, применение цветных рейтингов...');
        setTimeout(applyColoredRatings, 500); // Даем время на рендеринг
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
