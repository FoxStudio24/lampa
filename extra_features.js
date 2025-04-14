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
        colored_ratings: {
          ru: 'Цветные рейтинги',
          en: 'Colored Ratings',
          uk: 'Кольорові рейтинги',
          be: 'Каляровыя рэйтынгі',
          zh: '彩色评分',
          pt: 'Classificações Coloridas',
          bg: 'Цветни рейтинги'
        },
        colored_ratings_show: {
          ru: 'Показать',
          en: 'Show',
          uk: 'Показати',
          be: 'Паказаць',
          zh: '显示',
          pt: 'Mostrar',
          bg: 'Показване'
        },
        colored_ratings_hide: {
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

    // Добавляем стили для цветного фона карточек
    var style = `
      <style>
        .card--colored-rating[data-rating-above-7] {
          background: rgba(0, 255, 0, 0.2) !important; /* Прозрачно-зеленый */
        }
        .card--colored-rating[data-rating-below-6] {
          background: rgba(255, 255, 0, 0.2) !important; /* Прозрачно-желтый */
        }
        .card--colored-rating[data-rating-below-5] {
          background: rgba(255, 0, 0, 0.2) !important; /* Прозрачно-красный */
        }
        .card--colored-rating[data-rating-below-4] {
          background: rgba(128, 128, 128, 0.2) !important; /* Прозрачно-серый */
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

    // Иконка для настроек
    var icon = `
      <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="33" height="25" rx="3.5" stroke="white" stroke-width="3"/>
        <path d="M5 14H22V18H5V14Z" fill="white"/>
        <path d="M5 20H15V23H5V20Z" fill="white"/>
        <path d="M25 20H31V23H25V20Z" fill="white"/>
        <circle cx="30" cy="8" r="3" fill="green"/>
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
          name: 'colored_ratings',
          type: 'select',
          values: {
            show: Lampa.Lang.translate('colored_ratings_show'),
            hide: Lampa.Lang.translate('colored_ratings_hide')
          },
          default: 'hide'
        },
        field: {
          name: Lampa.Lang.translate('colored_ratings')
        }
      });
      console.log('ExtraFeatures: Настройки добавлены');
    } catch (e) {
      console.error('ExtraFeatures: Ошибка добавления настроек:', e);
      return;
    }

    // Функция для применения цветного фона карточек
    function applyColoredRatings() {
      var shouldShow = Lampa.Storage.field('colored_ratings') === 'show';
      console.log('ExtraFeatures: Проверка настройки colored_ratings:', shouldShow);

      var $cards = $('.card');
      $cards.each(function () {
        var $card = $(this);
        var $vote = $card.find('.card__vote');
        $card.removeClass('card--colored-rating'); // Удаляем старый класс
        $card.removeAttr('data-rating-above-7 data-rating-below-6 data-rating-below-5 data-rating-below-4'); // Удаляем старые атрибуты

        if (shouldShow && $vote.length) {
          var ratingText = $vote.text().trim();
          var rating = parseFloat(ratingText);

          if (!isNaN(rating)) {
            $card.addClass('card--colored-rating'); // Добавляем класс для стилизации
            if (rating > 7) {
              $card.attr('data-rating-above-7', '');
            } else if (rating < 6 && rating >= 5) {
              $card.attr('data-rating-below-6', '');
            } else if (rating < 5 && rating >= 4) {
              $card.attr('data-rating-below-5', '');
            } else if (rating < 4) {
              $card.attr('data-rating-below-4', '');
            }
            console.log('ExtraFeatures: Карточка с рейтингом', rating, 'обработана');
          } else {
            console.log('ExtraFeatures: Не удалось распознать рейтинг в карточке:', ratingText);
          }
        }
      });
    }

    // Применяем цветные рейтинги при загрузке страницы
    applyColoredRatings();

    // Следим за изменениями настроек
    Lampa.Storage.listener.follow('change', function (event) {
      if (event.name === 'colored_ratings') {
        console.log('ExtraFeatures: Настройка colored_ratings изменена:', event.value);
        applyColoredRatings();
      }
    });

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