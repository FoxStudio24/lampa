!function() {
    "use strict";

    // Проверяем, что плагин ещё не инициализирован
    if (!window.trailerplugin) {
        window.trailerplugin = true;

        // API-ключ TMDB
        const TMDB_API_KEY = '06936145fe8e20be28b02e26b55d3ce6';

        // Создаем стиль для видео
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            .full-start__trailer-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                z-index: 1;
            }
            .full-start__trailer {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);

        // Функция для получения трейлера по ID фильма из TMDB
        async function getMovieTrailer(movieId) {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                );
                const data = await response.json();
                // Ищем трейлер на YouTube
                const trailer = data.results.find(video => 
                    video.site === 'YouTube' && 
                    (video.type === 'Trailer' || video.type === 'Teaser') &&
                    video.official
                );
                if (trailer) {
                    // Формируем URL для встраивания видео с YouTube
                    return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&quality=1080p`;
                }
                // Запасной вариант, если трейлера нет
                return null;
            } catch (error) {
                console.error('Ошибка загрузки трейлера из TMDB:', error);
                return null;
            }
        }

        // Функция для создания и управления видео
        async function initTrailer(movieId) {
            // Находим или создаем контейнер для видео
            let container = document.querySelector('.full-start__trailer-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'full-start__trailer-container';
                const originalBackground = document.querySelector('.full-start__background');
                if (originalBackground) {
                    originalBackground.parentElement.appendChild(container);
                    // Удаляем старый фон
                    originalBackground.remove();
                }
            }

            // Удаляем старое видео, если оно есть
            container.innerHTML = '';

            // Получаем URL трейлера
            const trailerUrl = await getMovieTrailer(movieId);
            if (!trailerUrl) {
                console.error('Трейлер для фильма не найден');
                return;
            }

            // Создаем iframe для YouTube видео
            const video = document.createElement('iframe');
            video.className = 'full-start__trailer';
            video.src = trailerUrl;
            video.allow = 'autoplay; encrypted-media';
            video.allowFullscreen = false;
            video.frameBorder = '0';
            container.appendChild(video);
        }

        // Слушаем событие полной загрузки интерфейса
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Логируем e.object для отладки
                console.log('e.object:', e.object);

                // Проверяем наличие данных о фильме
                const movie = e.object.data || e.object.item || e.object;
                const movieId = movie && (movie.id || movie.tmdb_id || movie.movie_id);

                if (movieId) {
                    console.log('Найден movieId:', movieId);
                    initTrailer(movieId);
                } else {
                    console.error('ID фильма не найден в e.object:', e.object);
                }
            }
        });

        // Слушаем смену фильма
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'update' || e.type === 'movie_change') {
                // Логируем e для отладки
                console.log('App event:', e);

                // Проверяем наличие данных о фильме
                const movie = e.data || e.movie || e.item;
                const movieId = movie && (movie.id || movie.tmdb_id || movie.movie_id);

                if (movieId) {
                    console.log('Смена фильма, новый movieId:', movieId);
                    initTrailer(movieId);
                } else {
                    console.error('ID фильма не найден при смене:', e);
                }
            }
        });
    }
}();
