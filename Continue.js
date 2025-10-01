!function() {  
    "use strict";  
  
    if (!window.continuewatchplugin) {  
        window.continuewatchplugin = true;  
  
        function waitForLampa() {  
            var attempts = 0;  
            var maxAttempts = 100;  
              
            var checkInterval = setInterval(function() {  
                attempts++;  
                  
                // Ищем главную страницу с items-line  
                var homeContent = document.querySelector('.items-line');  
                  
                console.log('Continue Watch Plugin: Попытка', attempts, 'найден items-line:', !!homeContent);  
                  
                if (homeContent || attempts >= maxAttempts) {  
                    clearInterval(checkInterval);  
                      
                    if (homeContent) {  
                        console.log('Continue Watch Plugin: Главная найдена, добавляем секцию');  
                        addContinueWatchSection();  
                    } else {  
                        console.log('Continue Watch Plugin: Превышено время ожидания');  
                    }  
                }  
            }, 500);  
        }  
  
        function addContinueWatchSection() {  
            // Создаем секцию с правильной структурой items-line  
            var itemsLine = document.createElement('div');  
            itemsLine.className = 'items-line layer--visible layer--render items-line--type-cards';  
              
            // Заголовок секции  
            var head = document.createElement('div');  
            head.className = 'items-line__head';  
              
            var title = document.createElement('div');  
            title.className = 'items-line__title';  
            title.textContent = 'Продолжить просмотр';  
              
            head.appendChild(title);  
              
            // Тело секции с горизонтальным скроллом  
            var body = document.createElement('div');  
            body.className = 'items-line__body';  
              
            var scroll = document.createElement('div');  
            scroll.className = 'scroll scroll--horizontal';  
              
            var scrollContent = document.createElement('div');  
            scrollContent.className = 'scroll__content';  
              
            var scrollBody = document.createElement('div');  
            scrollBody.className = 'scroll__body items-cards';  
            scrollBody.style.transform = 'translate3d(0px, 0px, 0px)';  
              
            // Создаем тестовые карточки  
            var testCards = [  
                {  
                    title: 'Тестовый фильм 1',  
                    year: '2024',  
                    type: 'movie',  
                    poster: 'https://image.tmdb.org/t/p/w200//iynqgJI1bGGP1Jw8Os3kykUCccF.jpg',  
                    vote: '8.5'  
                },  
                {  
                    title: 'Тестовый сериал 1',  
                    year: '2024',  
                    type: 'tv',  
                    poster: 'https://image.tmdb.org/t/p/w200//iynqgJI1bGGP1Jw8Os3kykUCccF.jpg',  
                    vote: '7.6'  
                }  
            ];  
              
            testCards.forEach(function(item, index) {  
                var card = document.createElement('div');  
                card.className = 'card selector layer--visible layer--render card--loaded';  
                if (item.type === 'tv') card.className += ' card--tv';  
                if (index === 0) card.className += ' focus';  
                  
                var cardView = document.createElement('div');  
                cardView.className = 'card__view';  
                  
                var cardImg = document.createElement('img');  
                cardImg.className = 'card__img';  
                cardImg.src = item.poster;  
                  
                var cardIcons = document.createElement('div');  
                cardIcons.className = 'card__icons';  
                  
                var cardIconsInner = document.createElement('div');  
                cardIconsInner.className = 'card__icons-inner';  
                  
                var historyIcon = document.createElement('div');  
                historyIcon.className = 'card__icon icon--history';  
                cardIconsInner.appendChild(historyIcon);  
                  
                cardIcons.appendChild(cardIconsInner);  
                  
                if (item.type === 'tv') {  
                    var cardType = document.createElement('div');  
                    cardType.className = 'card__type';  
                    cardType.textContent = 'TV';  
                    cardView.appendChild(cardType);  
                }  
                  
                var cardVote = document.createElement('div');  
                cardVote.className = 'card__vote';  
                cardVote.textContent = item.vote;  
                  
                cardView.appendChild(cardImg);  
                cardView.appendChild(cardIcons);  
                cardView.appendChild(cardVote);  
                  
                var cardTitle = document.createElement('div');  
                cardTitle.className = 'card__title';  
                cardTitle.textContent = item.title;  
                  
                var cardAge = document.createElement('div');  
                cardAge.className = 'card__age';  
                cardAge.textContent = item.year;  
                  
                card.appendChild(cardView);  
                card.appendChild(cardTitle);  
                card.appendChild(cardAge);  
                  
                scrollBody.appendChild(card);  
            });  
              
            scrollContent.appendChild(scrollBody);  
            scroll.appendChild(scrollContent);  
            body.appendChild(scroll);  
              
            itemsLine.appendChild(head);  
            itemsLine.appendChild(body);  
              
            // Находим первую существующую items-line и добавляем перед ней  
            var firstItemsLine = document.querySelector('.items-line');  
            if (firstItemsLine && firstItemsLine.parentNode) {  
                firstItemsLine.parentNode.insertBefore(itemsLine, firstItemsLine);  
                console.log('Continue Watch Plugin: Секция добавлена перед первой items-line');  
            }  
        }  
  
        // Запускаем после загрузки DOM  
        if (document.readyState === 'loading') {  
            document.addEventListener('DOMContentLoaded', waitForLampa);  
        } else {  
            waitForLampa();  
        }  
          
        console.log('Continue Watch Plugin: Плагин инициализирован');  
    }  
}();