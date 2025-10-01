(function() {  
    'use strict';  
  
    var Plugin = {  
        component: 'continue_watching',  
        name: 'Продолжить просмотр',  
        version: '1.0.0',  
        description: 'Показывает карточки для продолжения просмотра'  
    };  
  
    var Template = {  
        card: function(item) {  
            return `  
                <div class="continue-card selector" data-url="${item.url}">  
                    <div class="continue-card__background">  
                        <img src="${item.image}" alt="${item.title}">  
                    </div>  
                    <div class="continue-card__info">  
                        <div class="continue-card__title">${item.title}</div>  
                        ${item.season ? `<div class="continue-card__season">S${item.season}E${item.episode}</div>` : ''}  
                        <div class="continue-card__progress">  
                            <div class="progress-bar" style="width: ${item.progress}%"></div>  
                        </div>  
                    </div>  
                </div>  
            `;  
        }  
    };  
  
    function Component() {  
        var network = new Lampa.Reguest();  
        var scroll = new Lampa.Scroll({ mask: true, over: true });  
        var items = [];  
  
        this.create = function() {  
            this.activity.loader(true);  
            this.load();  
        };  
  
        this.load = function() {  
            network.silent('{localhost}/continue-watching/list', (data) => {  
                items = data.items || [];  
                this.build();  
                this.activity.loader(false);  
            }, () => {  
                this.empty();  
            });  
        };  
  
        this.build = function() {  
            scroll.render().addClass('continue-watching');  
              
            items.forEach(item => {  
                var card = $(Template.card(item));  
                  
                card.on('hover:enter', () => {  
                    // Открываем страницу с контентом  
                    Lampa.Activity.push({  
                        url: item.url,  
                        title: item.title,  
                        component: 'full'  
                    });  
                });  
  
                scroll.append(card);  
            });  
        };  
  
        this.empty = function() {  
            var empty = new Lampa.Empty();  
            scroll.append(empty.render());  
            this.activity.loader(false);  
        };  
  
        this.start = function() {  
            Lampa.Controller.add('content', {  
                toggle: () => {  
                    Lampa.Controller.collectionSet(scroll.render());  
                    Lampa.Controller.collectionFocus(false, scroll.render());  
                },  
                left: () => {  
                    Lampa.Controller.toggle('menu');  
                }  
            });  
  
            Lampa.Controller.toggle('content');  
        };  
  
        this.render = function() {  
            return scroll.render();  
        };  
  
        this.destroy = function() {  
            network.clear();  
            scroll.destroy();  
        };  
    }  
  
    // Регистрируем компонент  
    Lampa.Component.add('continue_watching', Component);  
  
    // Добавляем в меню  
    Lampa.Listener.follow('app', (e) => {  
        if (e.type == 'ready') {  
            Lampa.Menu.add({  
                title: 'Продолжить просмотр',  
                component: 'continue_watching',  
                icon: '<svg>...</svg>'  
            });  
        }  
    });  
  
})();