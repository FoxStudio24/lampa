(function () {  
  'use strict';  
  
  function startPlugin() {  
    console.log('ContinueWatching: Запуск плагина...');  
  
    // Минимальные стили для прогресс-бара  
    var style = `  
      <style>  
        .continue-progress {  
          position: absolute;  
          bottom: 0;  
          left: 0;  
          height: 3px;  
          background: rgba(255,255,255,0.9);  
          z-index: 2;  
          transition: width 0.3s ease;  
        }  
        .continue-watching-section .items-line__title {  
          color: rgba(255,255,255,0.8);  
          font-size: 1.2em;  
          margin-bottom: 1em;  
          padding: 0 2em;  
        }  
      </style>  
    `;  
  
    try {  
      Lampa.Template.add('continue_watching_css', style);  
      $('body').append(Lampa.Template.get('continue_watching_css', {}, true));  
      console.log('ContinueWatching: Стили добавлены');  
    } catch (e) {  
      console.error('ContinueWatching: Ошибка добавления стилей:', e);  
      return;  
    }  
  
    // Функция для добавления секции  
    function addContinueWatchingSection() {  
      console.log('ContinueWatching: Попытка добавить секцию...');  
        
      // Ищем контейнер для вставки - главную страницу  
      var $mainContainer = $('.full-start__body, .full-start').first();  
      var $existingItemsLine = $mainContainer.find('.items-line').first();  
        
      if ($mainContainer.length && $existingItemsLine.length && !$('.continue-watching-section').length) {  
        console.log('ContinueWatching: Найден контейнер, добавляем секцию');  
          
        // Создаем секцию в стандартном формате Lampa  
        var continueSection = $(`  
          <div class="continue-watching-section">  
            <div class="items-line__title">Продолжить просмотр</div>  
            <div class="items-line layer--visible layer--render items-line--type-cards" id="continue-items-line">  
            </div>  
          </div>  
        `);  
          
        // Вставляем перед первой существующей секцией  
        $existingItemsLine.before(continueSection);  
        loadContinueWatchingData();  
        console.log('ContinueWatching: Секция добавлена');  
      } else {  
        console.log('ContinueWatching: Контейнер не найден или секция уже существует');  
      }  
    }  
  
    // Загрузка данных с правильной структурой карточек  
    function loadContinueWatchingData() {  
      console.log('ContinueWatching: Загрузка данных...');  
        
      // Получаем данные из системы закладок Lampac  
      var testData = [  
        {  
          title: "Тестовый фильм 1",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Film1",  
          progress: 45,  
          year: 2023,  
          details: "Драма • 2ч 15мин",  
          id: 1001  
        },  
        {  
          title: "Тестовый сериал",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Series",   
          progress: 67,  
          year: 2023,  
          details: "S2E5 • Комедия",  
          season: 2,  
          episode: 5,  
          id: 1002  
        },  
        {  
          title: "Еще один фильм",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Film2",  
          progress: 23,  
          year: 2022,  
          details: "Боевик • 1ч 45мин",   
          id: 1003  
        }  
      ];  
  
      var $container = $('#continue-items-line');  
        
      if ($container.length) {  
        testData.forEach(function(item, index) {  
          // Создаем карточку точно как в стандартных шаблонах Lampa  
          var card = $(`  
            <div class="items-line__item selector" data-json='${JSON.stringify(item)}'>  
              <div class="items-line__item-imgbox">  
                <img class="items-line__item-img" src="${item.image}" alt="${item.title}">  
                <div class="continue-progress" style="width: ${item.progress}%"></div>  
              </div>  
              <div class="items-line__item-body">  
                <div class="items-line__item-title">${item.title}</div>  
                <div class="items-line__item-subtitle">${item.details}</div>  
              </div>  
            </div>  
          `);  
  
          // Добавляем обработчики событий как в стандартных карточках  
          card.on('hover:focus', function() {  
            $(this).addClass('focus');  
          }).on('hover:hover', function() {  
            $(this).addClass('hover');  
          }).on('hover:enter', function() {  
            console.log('ContinueWatching: Открытие карточки:', item.title);  
            // Здесь будет логика открытия контента  
          });  
  
          $container.append(card);  
        });  
  
        // Важно: регистрируем карточки в системе навигации после добавления  
        setTimeout(function() {  
          try {  
            if (typeof Lampa !== 'undefined' && Lampa.Controller) {  
              // Обновляем коллекцию селекторов для навигации  
              Lampa.Controller.collectionSet($container.find('.selector'));  
              Lampa.Controller.collectionFocus(false, $container);  
              console.log('ContinueWatching: Навигация настроена для', testData.length, 'карточек');  
            }  
          } catch (e) {  
            console.error('ContinueWatching: Ошибка настройки навигации:', e);  
          }  
        }, 200);  
          
        console.log('ContinueWatching: Добавлено карточек:', testData.length);  
      } else {  
        console.error('ContinueWatching: Контейнер для карточек не найден');  
      }  
    }  
  
    // Функция для повторных попыток с ограничением  
    function tryAddSection(attempts = 0) {  
      if (attempts > 8) {  
        console.error('ContinueWatching: Превышено количество попыток');  
        return;  
      }  
        
      if ($('.continue-watching-section').length === 0) {  
        addContinueWatchingSection();  
        if ($('.continue-watching-section').length === 0) {  
          setTimeout(() => tryAddSection(attempts + 1), 1500);  
        }  
      }  
    }  
  
    // Запускаем немедленно при готовности  
    setTimeout(() => {  
      tryAddSection();  
    }, 1000);  
  
    // Следим за активностью для обновления  
    Lampa.Listener.follow('activity', function (e) {  
      if (e.type === 'start') {  
        console.log('ContinueWatching: Новая активность, проверка секции');  
        setTimeout(() => {  
          if ($('.continue-watching-section').length === 0) {  
            tryAddSection();  
          }  
        }, 1000);  
      }  
    });  
  }  
  
  // Запуск плагина  
  if (window.appready) {  
    console.log('ContinueWatching: Приложение готово, запуск плагина...');  
    startPlugin();  
  } else {  
    Lampa.Listener.follow('app', function (e) {  
      if (e.type === 'ready') {  
        console.log('ContinueWatching: Событие appready, запуск плагина...');  
        startPlugin();  
      }  
    });  
  }  
})();