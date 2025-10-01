(function () {  
  'use strict';  
  
  function startPlugin() {  
    console.log('ContinueWatching: Запуск плагина...');  
  
    // Добавляем стили для карточек  
    var style = `  
      <style>  
        .continue-watching-section {  
          margin: 20px;  
          padding: 20px 0;  
        }  
        .continue-watching-title {  
          color: white;  
          font-size: 1.4em;  
          margin-bottom: 15px;  
          font-weight: bold;  
        }  
        .continue-cards-container {  
          display: flex;  
          overflow-x: auto;  
          gap: 15px;  
          padding: 10px 0;  
        }  
        .continue-card {  
          position: relative;  
          min-width: 180px;  
          height: 270px;  
          border-radius: 8px;  
          overflow: hidden;  
          cursor: pointer;  
          background: #1a1a1a;  
          transition: transform 0.2s;  
        }  
        .continue-card:hover {  
          transform: scale(1.05);  
        }  
        .continue-card__background {  
          width: 100%;  
          height: 200px;  
          background-size: cover;  
          background-position: center;  
          background-color: #333;  
        }  
        .continue-card__info {  
          padding: 10px;  
          color: white;  
          height: 70px;  
        }  
        .continue-card__title {  
          font-weight: bold;  
          margin-bottom: 5px;  
          font-size: 0.9em;  
          overflow: hidden;  
          text-overflow: ellipsis;  
          white-space: nowrap;  
        }  
        .continue-card__season {  
          font-size: 0.8em;  
          opacity: 0.7;  
          margin-bottom: 5px;  
        }  
        .continue-card__progress {  
          width: 100%;  
          height: 3px;  
          background: rgba(255,255,255,0.3);  
          border-radius: 2px;  
          overflow: hidden;  
        }  
        .progress-bar {  
          height: 100%;  
          background: #fff;  
          transition: width 0.3s;  
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
  
    // Функция для добавления секции "Продолжить просмотр"  
    function addContinueWatchingSection() {  
      console.log('ContinueWatching: Попытка добавить секцию...');  
        
      // Ищем различные возможные контейнеры главной страницы  
      var $targetContainer = $('.full-start__body, .full-start, .main, .content, body').first();  
        
      if ($targetContainer.length && !$('.continue-watching-section').length) {  
        console.log('ContinueWatching: Найден контейнер:', $targetContainer[0].className);  
          
        var continueSection = `  
          <div class="continue-watching-section">  
            <div class="continue-watching-title">Продолжить просмотр</div>  
            <div class="continue-cards-container" id="continue-cards">  
              <!-- Карточки будут добавлены динамически -->  
            </div>  
          </div>  
        `;  
          
        $targetContainer.prepend(continueSection);  
        loadContinueWatchingData();  
        console.log('ContinueWatching: Секция добавлена в', $targetContainer[0].tagName);  
      } else {  
        console.log('ContinueWatching: Контейнер не найден или секция уже существует');  
        console.log('ContinueWatching: Доступные элементы:', $('body').children().map(function() { return this.className; }).get());  
      }  
    }  
  
    // Загрузка тестовых данных (замените на реальные данные)  
    function loadContinueWatchingData() {  
      console.log('ContinueWatching: Загрузка данных...');  
        
      // Тестовые данные для демонстрации  
      var testData = [  
        {  
          title: "Тестовый фильм 1",  
          image: "https://via.placeholder.com/180x270/333/fff?text=Film1",  
          progress: 45,  
          url: "#"  
        },  
        {  
          title: "Тестовый сериал",  
          image: "https://via.placeholder.com/180x270/333/fff?text=Series",  
          progress: 67,  
          season: 2,  
          episode: 5,  
          url: "#"  
        },  
        {  
          title: "Еще один фильм",  
          image: "https://via.placeholder.com/180x270/333/fff?text=Film2",  
          progress: 23,  
          url: "#"  
        }  
      ];  
  
      var $container = $('#continue-cards');  
        
      if ($container.length) {  
        testData.forEach(function(item) {  
          var card = `  
            <div class="continue-card" data-url="${item.url}">  
              <div class="continue-card__background" style="background-image: url('${item.image}')"></div>  
              <div class="continue-card__info">  
                <div class="continue-card__title">${item.title}</div>  
                ${item.season ? `<div class="continue-card__season">S${item.season}E${item.episode}</div>` : ''}  
                <div class="continue-card__progress">  
                  <div class="progress-bar" style="width: ${item.progress || 0}%"></div>  
                </div>  
              </div>  
            </div>  
          `;  
          $container.append(card);  
        });  
  
        // Обработчик клика по карточкам  
        $('.continue-card').on('click', function() {  
          var url = $(this).data('url');  
          console.log('ContinueWatching: Клик по карточке:', url);  
          // Здесь добавьте логику открытия контента  
        });  
          
        console.log('ContinueWatching: Добавлено карточек:', testData.length);  
      } else {  
        console.error('ContinueWatching: Контейнер для карточек не найден');  
      }  
    }  
  
    // Функция с задержкой для повторных попыток  
    function tryAddSection(attempts = 0) {  
      if (attempts > 10) {  
        console.error('ContinueWatching: Превышено количество попыток');  
        return;  
      }  
        
      if ($('.continue-watching-section').length === 0) {  
        addContinueWatchingSection();  
        setTimeout(() => tryAddSection(attempts + 1), 1000);  
      }  
    }  
  
    // Запускаем с задержкой  
    setTimeout(() => {  
      tryAddSection();  
    }, 2000);  
  
    // Следим за динамической загрузкой контента  
    Lampa.Listener.follow('app', function (e) {  
      if (e.type === 'ready' || e.type === 'complete') {  
        console.log('ContinueWatching: Событие app:', e.type);  
        setTimeout(() => tryAddSection(), 1000);  
      }  
    });  
  
    // Следим за изменением активности  
    Lampa.Listener.follow('activity', function (e) {  
      if (e.type === 'start') {  
        console.log('ContinueWatching: Новая активность');  
        setTimeout(() => tryAddSection(), 500);  
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