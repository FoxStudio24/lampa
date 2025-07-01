(function() {  
    'use strict';  
      
    // Ваши CSS стили  
    const mobileStyles = `  
       @media screen and (max-width: 480px) {
    .full-start-new__right {
        background: none !important;
        background-image: none !important;
        background-color: transparent !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
    }
.full-start__pg, .full-start__status {
    font-size: 2.1em;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 0.3em 0.6em;
    border: 1px solid rgba(255, 255, 255, 0.205);
    -webkit-border-radius: 0.3em;
    border-radius: 0.3em;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    min-width: 2em;
}

.full-start-new__rate-line .full-start__rate {
    margin: 0;
    font-size: 1.12em;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 0.3em 0.6em;
    border: 1px solid rgba(255, 255, 255, 0.3);
    -webkit-border-radius: 0.4em;
    border-radius: 0.4em;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
}
.full-start-new__pg-container .full-start__pg {
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 0.3em 0.6em;
    border: 1px solid rgba(255, 255, 255, 0.205);
    -webkit-border-radius: 0.3em;
    border-radius: 0.3em;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    min-width: 2em;
}
.full-start__pg {
  position: fixed;
  top: 30px;
  right: 10px;
  z-index: 1000;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  backdrop-filter: blur(3px);
}
.card--tv .card__type {
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
    background-color: rgba(0, 0, 0, 0.5);
    color: #dddddd;
    padding: 0.3em 0.6em;
    border: 1px solid rgba(255, 255, 255, 0.205);
    -webkit-border-radius: 0.3em;
    border-radius: 0.3em;
    backdrop-filter: blur(3px);
}
.full-start__status {
  position: fixed;
  top: 55px; /* ниже, чем .full-start__pg */
  right: 10px;
  z-index: 1000;
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
font-size: 1em;
    font-weight: bold;
    background-color: rgba(0, 0, 0, 0.5);
    color: #dddddd;
    padding: 0.3em 0.6em;
    border: 1px solid rgba(255, 255, 255, 0.205);
    -webkit-border-radius: 0.3em;
    border-radius: 0.3em;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    text-align: center;
    min-width: 2em;
    backdrop-filter: blur(3px);
}
.full-start-new__details {
    display: flex;
    justify-content: center; /* горизонтально */
    align-items: center;     /* вертикально */
    height: 100%; /* или нужная высота */
    text-align: center;
}
.full-start-new__tagline {
    margin-bottom: 0em;
}
.full-start__rate > div:first-child {
    background: rgb(0 0 0 / 0%);
}
}
    `;  
      
    // Функция добавления стилей  
    function addMobileStyles() {  
        const styleElement = document.createElement('style');  
        styleElement.textContent = mobileStyles;  
        document.head.appendChild(styleElement);  
    }  
      
    // Инициализация плагина  
    function init() {  
        addMobileStyles();  
    }  
      
    // Регистрация плагина  
    if (window.Lampa) {  
        init();  
    } else {  
        document.addEventListener('DOMContentLoaded', init);  
    }  
})();
