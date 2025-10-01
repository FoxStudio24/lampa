!function() {  
    "use strict";  
  
    if (!window.continuewatchplugin) {  
        window.continuewatchplugin = true;  
  
        function createContinueWatchSection() {  
            var itemsLine = document.createElement('div');  
            itemsLine.className = 'items-line layer--visible layer--render items-line--type-cards';  
            itemsLine.id = 'continue-watch-plugin-section';  
            // Добавляем атрибут для предотвращения удаления при виртуализации  
            itemsLine.setAttribute('data-persistent', 'true');  
              
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
                // ИСПРАВЛЕНИЕ: Добавляем все необходимые классы для правильной навигации  
                card.className = 'card selector layer--visible layer--render card--loaded';  
                if (item.type === 'tv') card.className += ' card--tv';  
                  
                // Добавляем атрибуты для системы навигации Lampa  
                card.setAttribute('tabindex', '0');  
                card.setAttribute('data-focus', 'true');  
                  
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
                  
                // ИСПРАВЛЕНИЕ: Добавляем обработчики событий для фокуса  
                card.addEventListener('focus', function() {  
                    this.classList.add('focus');  
                });  
                  
                card.addEventListener('blur', function() {  
                    this.classList.remove('focus');  
                });  
                  
                card.addEventListener('mouseenter', function() {  
                    this.classList.add('hover');  
                });  
                  
                card.addEventListener('mouseleave', function() {  
                    this.classList.remove('hover');  
                });  
                  
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
            if (document.getElementById('continue-watch-plugin-section')) {  
                return;  
            }  
  
            var firstItemsLine = document.querySelector('.items-line');  
            if (firstItemsLine && firstItemsLine.parentNode) {  
                var section = createContinueWatchSection();  
                firstItemsLine.parentNode.insertBefore(section, firstItemsLine);  
                console.log('Continue Watch Plugin: Секция добавлена');  
                  
                // ИСПРАВЛЕНИЕ: Принудительно закрепляем секцию в DOM  
                section.style.position = 'relative';  
                section.style.zIndex = '1';  
            }  
        }  
  
        // ИСПРАВЛЕНИЕ: Более агрессивная проверка с защитой от удаления  
        function startPeriodicCheck() {  
            setInterval(function() {  
                var hasItemsLine = document.querySelector('.items-line');  
                var hasOurSection = document.getElementById('continue-watch-plugin-section');  
                  
                if (hasItemsLine && !hasOurSection) {  
                    console.log('Continue Watch Plugin: Восстанавливаем секцию');  
                    addContinueWatchSection();  
                }  
                  
                // Дополнительная защита: если секция есть, но не на правильном месте  
                if (hasOurSection && hasItemsLine) {  
                    var parent = hasItemsLine.parentNode;  
                    if (parent && hasOurSection.parentNode !== parent) {  
                        parent.insertBefore(hasOurSection, hasItemsLine);  
                        console.log('Continue Watch Plugin: Секция перемещена на правильное место');  
                    }  
                }  
            }, 1000); // Проверяем каждую секунду для быстрого восстановления  
        }  
  
        function setupObserver() {  
            var observer = new MutationObserver(function(mutations) {  
                mutations.forEach(function(mutation) {  
                    if (mutation.type === 'childList') {  
                        // Проверяем, не была ли удалена наша секция  
                        var removedNodes = Array.from(mutation.removedNodes);  
                        var ourSectionRemoved = removedNodes.some(function(node) {  
                            return node.nodeType === 1 && node.id === 'continue-watch-plugin-section';  
                        });  
                          
                        if (ourSectionRemoved) {  
                            console.log('Continue Watch Plugin: Секция была удалена, восстанавливаем');  
                            setTimeout(addContinueWatchSection, 100);  
                        }  
                          
                        var addedNodes = Array.from(mutation.addedNodes);  
                        var hasItemsLine = addedNodes.some(function(node) {  
                            return node.nodeType === 1 && (  
                                (node.classList && node.classList.contains('items-line')) ||  
                                (node.querySelector && node.querySelector('.items-line'))  
                            );  
                        });  
                          
                        if (hasItemsLine) {  
                            setTimeout(function() {  
                                var hasItemsLine = document.querySelector('.items-line');  
                                var hasOurSection = document.getElementById('continue-watch-plugin-section');  
                                  
                                if (hasItemsLine && !hasOurSection) {  
                                    addContinueWatchSection();  
                                }  
                            }, 200);  
                        }  
                    }  
                });  
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
                        startPeriodicCheck();  
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