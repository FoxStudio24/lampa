(function () {  
  'use strict';  
  
  function startPlugin() {  
    console.log('ContinueWatching: Запуск плагина...');  
  
    // Добавляем стили для карточек  
    var style = `  
      <style>  
        .continue-watching-section {  
          margin: 20px 0;  
        }  
        .continue-card {  
          position: relative;  
          width: 200px;  
          height: 300px;  
          margin: 10px;  
          border-radius: 8px;  
          overflow: hidden;  
          cursor: pointer;  
          display: inline-block;  
        }  
        .continue-card__background {  
          width: 100%;  
          height: 70%;  
          background-size: cover;  
          background-position: center;  
        }  
        .continue-card__info {  
          padding: 10px;  
          background: rgba(0,0,0,0.8);  
          color: white;  
          height: 30%;  
        }  
        .continue-card__title {  
          font-weight: bold;  
          margin-bottom: 5px;  
        }  
        .continue-card__season {  
          font-size: 12px;  
          opacity: 0.8;  
        }  
        .continue-card__progress {  
          width: 100%;  
          height: 3px;  
          background: rgba(255,255,255,0.3);  
          margin-top: 5px;  
        }  
        .progress-bar {  
          height: 100%;  
          background: #fff;  
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
      // Ищем место для вставки (например, после главного меню)  
      var $mainContent = $('.full-start, .main-content').first();  
        
      if ($mainContent.length && !$('.continue-watching-section').length) {  
        var continueSection = `  
          <div class="continue-watching-section">  
            <h2>Продолжить просмотр</h2>  
            <div class="continue-watching-cards" id="continue-cards">  
              <!-- Карточки будут добавлены динамически -->  
            </div>  
          </div>  
        `;  
          
        $mainContent.prepend(continueSection);  
        loadContinueWatchingData();  
        console.log('ContinueWatching: Секция добавлена');  
      }  
    }  
  
    // Загрузка данных о продолжении просмотра  
    function loadContinueWatchingData() {  
      // Получаем данные из localStorage или API  
      var watchHistory = JSON.parse(localStorage.getItem('lampa_watch_history') || '[]');  
      var $container = $('#continue-cards');  
        
      watchHistory.slice(0, 10).forEach(function(item) {  
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
        if (url) {  
          Lampa.Activity.push({  
            url: url,  
            component: 'full'  
          });  
        }  
      });  
    }  
  
    // Применяем при загрузке страницы  
    addContinueWatchingSection();  
  
    // Следим за динамической загрузкой контента  
    Lampa.Listener.follow('app', function (e) {  
      if (e.type === 'ready' || e.type === 'complete') {  
        console.log('ContinueWatching: Приложение готово, добавление секции...');  
        setTimeout(addContinueWatchingSection, 1000);  
      }  
    });  
  
    // Следим за изменением активности  
    Lampa.Listener.follow('activity', function (e) {  
      if (e.type === 'start') {  
        console.log('ContinueWatching: Новая активность, проверка секции...');  
        setTimeout(addContinueWatchingSection, 500);  
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