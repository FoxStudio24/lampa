(function () {  
  'use strict';  
  
  function startPlugin() {  
    console.log('ContinueWatching: Запуск плагина...');  
  
    // Минимальные стили, не портящие интерфейс  
    var style = `  
      <style>  
        .continue-watching-section {  
          margin-bottom: 2em;  
        }  
        .continue-watching-title {  
          color: rgba(255,255,255,0.8);  
          font-size: 1.2em;  
          margin-bottom: 1em;  
          padding: 0 2em;  
        }  
        .continue-progress {  
          position: absolute;  
          bottom: 0;  
          left: 0;  
          height: 3px;  
          background: rgba(255,255,255,0.8);  
          z-index: 2;  
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
  
    // Функция для добавления секции над items-line  
    function addContinueWatchingSection() {  
      console.log('ContinueWatching: Попытка добавить секцию...');  
        
      // Ищем существующую items-line для вставки перед ней  
      var $itemsLine = $('.items-line.layer--visible.layer--render.items-line--type-cards').first();  
        
      if ($itemsLine.length && !$('.continue-watching-section').length) {  
        console.log('ContinueWatching: Найден items-line, добавляем секцию');  
          
        var continueSection = `  
          <div class="continue-watching-section">  
            <div class="continue-watching-title">Продолжить просмотр</div>  
            <div class="items-line layer--visible layer--render items-line--type-cards" id="continue-items-line">  
              <!-- Карточки будут добавлены динамически -->  
            </div>  
          </div>  
        `;  
          
        $itemsLine.before(continueSection);  
        loadContinueWatchingData();  
        console.log('ContinueWatching: Секция добавлена перед items-line');  
      } else {  
        console.log('ContinueWatching: items-line не найден или секция уже существует');  
      }  
    }  
  
    // Загрузка данных в формате Lampa  
    function loadContinueWatchingData() {  
      console.log('ContinueWatching: Загрузка данных...');  
        
      // Тестовые данные в формате Lampa  
      var testData = [  
        {  
          title: "Тестовый фильм 1",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Film1",  
          progress: 45,  
          year: 2023,  
          details: "Драма • 2ч 15мин",  
          url: "#film1"  
        },  
        {  
          title: "Тестовый сериал",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Series",  
          progress: 67,  
          year: 2023,  
          details: "S2E5 • Комедия",  
          season: 2,  
          episode: 5,  
          url: "#series1"  
        },  
        {  
          title: "Еще один фильм",  
          image: "https://via.placeholder.com/300x450/333/fff?text=Film2",  
          progress: 23,  
          year: 2022,  
          details: "Боевик • 1ч 45мин",  
          url: "#film2"  
        }  
      ];  
  
      var $container = $('#continue-items-line');  
        
      if ($container.length) {  
        testData.forEach(function(item, index) {  
          // Создаем данные в формате Lampa  
          var itemData = {  
            method: "link",  
            url: item.url,  
            title: item.title,  
            year: item.year,  
            details: item.details,  
            img: item.image,  
            continue_watching: true,  
            progress: item.progress  
          };  
  
          // Создаем карточку в стиле Lampa  
          var card = $(`  
            <div class="items-line__item selector ${index === 0 ? 'focus' : ''}" data-json='${JSON.stringify(itemData)}'>  
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
  
          $container.append(card);  
        });  
  
        // Регистрируем карточки в системе навигации Lampa  
        setTimeout(function() {  
          if (typeof Lampa.Controller !== 'undefined') {  
            Lampa.Controller.collectionSet($container);  
            console.log('ContinueWatching: Навигация настроена');  
          }  
        }, 100);  
          
        console.log('ContinueWatching: Добавлено карточек:', testData.length);  
      } else {  
        console.error('ContinueWatching: Контейнер для карточек не найден');  
      }  
    }  
  
    // Функция с задержкой для повторных попыток  
    function tryAddSection(attempts = 0) {  
      if (attempts > 5) {  
        console.error('ContinueWatching: Превышено количество попыток');  
        return;  
      }  
        
      if ($('.continue-watching-section').length === 0) {  
        addContinueWatchingSection();  
        if ($('.continue-watching-section').length === 0) {  
          setTimeout(() => tryAddSection(attempts + 1), 2000);  
        }  
      }  
    }  
  
    // Запускаем с задержкой  
    setTimeout(() => {  
      tryAddSection();  
    }, 3000);  
  
    // Следим за изменением активности  
    Lampa.Listener.follow('activity', function (e) {  
      if (e.type === 'start') {  
        console.log('ContinueWatching: Новая активность');  
        setTimeout(() => tryAddSection(), 2000);  
      }  
    });  
  }  
  
  // Запускаем плагин  
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