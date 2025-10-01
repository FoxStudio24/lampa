!function() {  
    "use strict";  
  
    if (!window.continuewatchplugin) {  
        window.continuewatchplugin = true;  
  
        function createContinueWatchSection() {  
            var itemsLine = document.createElement('div');  
            itemsLine.className = 'items-line layer--visible layer--render items-line--type-cards';  
            itemsLine.id = 'continue-watch-plugin-section';  
              
            var head = document.createElement('div');  
            head.className = 'items-line__head';  
              
            var title = document.createElement('div');  
            title.className = 'items-line__title';  
            title.textContent = 'Продолжить просмотр';  
              
            head.appendChild(title);  
              
            var body = document.createElement('div');  
            body.className = 'items-line__body';  
              
            var scroll = document.createElement('div');  
            scroll.className = 'scroll scroll--horizontal';  
              
            var scrollContent = document.createElement('div');  
            scrollContent.className = 'scroll__content';  
              
            var scrollBody = document.createElement('div');  
            scrollBody.className = 'scroll__body items-cards';  
            scrollBody.style.transform = 'translate3d(0px, 0px, 0px)';  
              
            // Тестовые карточки  
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
              
            return itemsLine;  
        }  
  
        function addContinueWatchSection() {  
            // Проверяем, есть ли уже наша секция  
            if (document.getElementById('continue-watch-plugin-section')) {  
                return;  
            }  
  
            // Ищем первую существующую items-line на главной странице  
            var firstItemsLine = document.querySelector('.items-line');  
            if (firstItemsLine && firstItemsLine.parentNode) {  
                var section = createContinueWatchSection();  
                firstItemsLine.parentNode.insertBefore(section, firstItemsLine);  
                console.log('Continue Watch Plugin: Секция добавлена');  
            }  
        }  
  
        // Постоянная проверка каждые 2 секунды  
        function startPeriodicCheck() {  
            setInterval(function() {  
                // Проверяем, есть ли items-line на странице (значит мы на главной)  
                var hasItemsLine = document.querySelector('.items-line');  
                var hasOurSection = document.getElementById('continue-watch-plugin-section');  
                  
                // Если есть items-line, но нет нашей секции - добавляем  
                if (hasItemsLine && !hasOurSection) {  
                    console.log('Continue Watch Plugin: Обнаружена главная без секции, добавляем');  
                    addContinueWatchSection();  
                }  
            }, 2000);  
        }  
  
        // Также используем MutationObserver как дополнительный механизм  
        function setupObserver() {  
            var observer = new MutationObserver(function(mutations) {  
                var shouldCheck = false;  
                  
                mutations.forEach(function(mutation) {  
                    if (mutation.type === 'childList') {  
                        var addedNodes = Array.from(mutation.addedNodes);  
                        var hasItemsLine = addedNodes.some(function(node) {  
                            return node.nodeType === 1 && (  
                                (node.classList && node.classList.contains('items-line')) ||  
                                (node.querySelector && node.querySelector('.items-line'))  
                            );  
                        });  
                          
                        if (hasItemsLine) {  
                            shouldCheck = true;  
                        }  
                    }  
                });  
                  
                if (shouldCheck) {  
                    setTimeout(function() {  
                        var hasItemsLine = document.querySelector('.items-line');  
                        var hasOurSection = document.getElementById('continue-watch-plugin-section');  
                          
                        if (hasItemsLine && !hasOurSection) {  
                            console.log('Continue Watch Plugin: MutationObserver обнаружил изменения, добавляем секцию');  
                            addContinueWatchSection();  
                        }  
                    }, 500);  
                }  
            });  
  
            var appContainer = document.querySelector('#app');  
            if (appContainer) {  
                observer.observe(appContainer, {  
                    childList: true,  
                    subtree: true  
                });  
                console.log('Continue Watch Plugin: MutationObserver установлен');  
            }  
        }  
  
        function waitForLampa() {  
            var attempts = 0;  
            var maxAttempts = 100;  
              
            var checkInterval = setInterval(function() {  
                attempts++;  
                  
                var homeContent = document.querySelector('.items-line');  
                  
                if (homeContent || attempts >= maxAttempts) {  
                    clearInterval(checkInterval);  
                      
                    if (homeContent) {  
                        console.log('Continue Watch Plugin: Lampa загружена');  
                        addContinueWatchSection();  
                        setupObserver();  
                        startPeriodicCheck(); // Запускаем постоянную проверку  
                    } else {  
                        console.log('Continue Watch Plugin: Превышено время ожидания');  
                    }  
                }  
            }, 500);  
        }  
  
        if (document.readyState === 'loading') {  
            document.addEventListener('DOMContentLoaded', waitForLampa);  
        } else {  
            waitForLampa();  
        }  
          
        console.log('Continue Watch Plugin: Плагин инициализирован');  
    }  
}();