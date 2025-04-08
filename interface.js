!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.backgroundsliderplugin) {
        window.backgroundsliderplugin = true;

        // Ваш API-ключ TMDB (замените на свой)
        const TMDB_API_KEY = 'ВАШ_API_КЛЮЧ_HERE';

        // Создаем стиль для плавной анимации
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .full-start__background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 1s ease-in-out;
            }
            .full-start__background.active {
                opacity: 1;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);

        // Функция для получения изображений по ID фильма из TMDB
        async function getMovieImages(movieId) {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}/images?api_key=${TMDB_API_KEY}`
                );
                const data = await response.json();
                // Берем до 3 фоновых изображений, если их нет — возвращаем запасной вариант
                const backdrops = data.backdrops
                    .map(backdrop => `https://image.tmdb.org/t/p/w1280${backdrop.file_path}`)
                    .slice(0, 3);
                return backdrops.length > 0 
                    ? backdrops 
                    : ['https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg'];
            } catch (error) {
                console.error('Ошибка загрузки изображений из TMDB:', error);
                // Запасной вариант при ошибке
                return ['https://image.tmdb.org/t/p/w1280/2Nti3gYAX513wvhp8IiLL6ZDyOm.jpg'];
            }
        }

        // Функция для создания и управления слайдером
        async function initSlider(movieId) {
            const container = document.querySelector('.full-start__background');
            if (!container) return;

            // Очищаем существующий фон
            container.innerHTML = '';

            // Получаем изображения из TMDB
            const images = await getMovieImages(movieId);

            // Создаем изображения
            images.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.className = 'full-start__background' + (index === 0 ? ' active' : '');
                container.parentElement.appendChild(img);
            });

            // Получаем все изображения фона
            const backgroundImages = document.querySelectorAll('.full-start__background');
            let currentIndex = 0;

            // Функция смены изображения
            function changeBackground() {
                backgroundImages[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % backgroundImages.length;
                backgroundImages[currentIndex].classList.add('active');
            }

            // Очищаем предыдущий интервал, если он был
            if (window.backgroundInterval) clearInterval(window.backgroundInterval);
            // Запускаем слайдер
            window.backgroundInterval = setInterval(changeBackground, 10000); // Смена каждые 10 секунд
        }

        // Слушаем событие полной загрузки интерфейса
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Получаем ID фильма из текущего объекта
                const movieId = e.object.movie.id || e.object.movie.tmdb_id;
                if (movieId) {
                    initSlider(movieId);
                } else {
                    console.error('ID фильма не найден');
                }
            }
        });
    }
}();