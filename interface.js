!function() {
    "use strict";

    if (!window.trailerplugin) {
        window.trailerplugin = true;

        const TMDB_API_KEY = '06936145fe8e20be28b02e26b55d3ce6';

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
                opacity: 0;
                transition: opacity 0.5s ease-in-out;
            }
            .full-start__trailer {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .full-start__background {
                z-index: 0;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(style);

        async function getMovieTrailer(movieId) {
            try {
                const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
                );
                const data = await response.json();
                const trailer = data.results.find(video => 
                    video.site === 'YouTube' && 
                    (video.type === 'Trailer' || video.type === 'Teaser') &&
                    video.official
                );
                if (trailer) {
                    return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&quality=1080p`;
                }
                return null;
            } catch (error) {
                console.error('Ошибка загрузки трейлера из TMDB:', error);
                return null;
            }
        }

        async function initTrailer(movieId) {
            let container = document.querySelector('.full-start__trailer-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'full-start__trailer-container';
                const originalBackground = document.querySelector('.full-start__background');
                if (originalBackground) {
                    originalBackground.parentElement.appendChild(container);
                    // Оставляем старый фон, не удаляем его
                }
            }

            container.innerHTML = '';

            const trailerUrl = await getMovieTrailer(movieId);
            if (!trailerUrl) {
                console.error('Трейлер для фильма не найден');
                return;
            }

            const video = document.createElement('iframe');
            video.className = 'full-start__trailer';
            video.src = trailerUrl;
            video.allow = 'autoplay; encrypted-media';
            video.allowFullscreen = false;
            video.frameBorder = '0';
            container.appendChild(video);

            // Задержка 10 секунд перед показом трейлера
            setTimeout(() => {
                container.style.opacity = '1';
            }, 10000);
        }

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                const movie = e.object.data || e.object.item || e.object;
                const movieId = movie && (movie.id || movie.tmdb_id || movie.movie_id);

                if (movieId) {
                    initTrailer(movieId);
                } else {
                    console.error('ID фильма не найден в e.object:', e.object);
                }
            }
        });

        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'update' || e.type === 'movie_change') {
                const movie = e.data || e.movie || e.item;
                const movieId = movie && (movie.id || movie.tmdb_id || movie.movie_id);

                if (movieId) {
                    initTrailer(movieId);
                } else {
                    console.error('ID фильма не найден при смене:', e);
                }
            }
        });
    }
}();
