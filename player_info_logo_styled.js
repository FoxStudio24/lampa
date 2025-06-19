!function() {
    "use strict";

    // Check for jQuery
    if (typeof $ === "undefined") {
        console.error("[PlayerInfoLogo] Error: jQuery not found");
        return;
    }

    // Add CSS styles
    var customStyles = `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;700&family=Montserrat:wght@300;400;600;700&display=swap&subset=cyrillic');
        
        /* Hide time */
        .player-info__time {
            display: none !important;
        }
        
        /* Vertical logo + name layout */
        .player-info__line {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
        }
        
        /* Center logo */
        .player-info__logo {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100% !important;
            margin-bottom: 8px !important;
            padding: 0 !important;
            text-align: center !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            animation: none !important;
            filter: none !important;
            outline: none !important;
            border: none !important;
            background: none !important;
            max-height: 100% !important;
            max-width: 100% !important;
        }
        
        /* Name below logo */
        .player-info__name {
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            padding: 10px !important;
            color: #bbbbbb !important;
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 400 !important;
            font-size: 20px !important;
        }
        
        /* Hide player-info__values */
        .player-info__values {
            display: none !important;
        }
        
        /* Remove background and blur from .player-info */
        .player-info {
            background: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            box-shadow: none !important;
            top: 0em;
            left: 0em;
            right: 0em;
        }
        
        .player-info__body {
            padding: 0em !important;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0)) !important;
        }
        
        .player-info__logo {
            margin-top: 15px !important;
        }
        
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
        </style>
    `;

    // Append styles to head
    $('head').append(customStyles);

    // Add settings for logo display
    Lampa.SettingsApi.addParam({
        component: "interface",
        param: {
            name: "player_logo_display",
            type: "select",
            values: { 0: "Отображать", 1: "Скрыть" },
            default: "0"
        },
        field: {
            name: "Логотипы в плеере",
            description: "Отображает логотипы фильмов и сериалов вместо текста в плеере"
        }
    });

    // State variables
    var currentTitle = "";
    var isLoading = false;
    var logoTimeout = null;
    var uniqueLogoId = 0;

    // Clear all logos
    function clearAllLogos() {
        $(".player-info__logo").remove();
        console.log("[PlayerInfoLogo] All logos removed");
    }

    // Create logo HTML
    function createImageLogo(logoPath) {
        var logoId = ++uniqueLogoId;
        var logoHtml = '<div class="player-info__logo" data-logo-id="' + logoId + '">' +
            '<img src="' + logoPath + '" alt="Logo" style="max-height: 200px; max-width: 600px;" />' +
            '</div>';
        return logoHtml;
    }

    // Get movie data from Lampa
    function getMovieData() {
        var movieData = null;

        try {
            var activity = Lampa.Activity.active();
            if (activity?.activity) {
                movieData = activity.activity.data?.movie || activity.activity.movie;
                if (movieData?.id) {
                    // Ensure media_type is set
                    if (!movieData.media_type) {
                        movieData.media_type = (movieData.name || movieData.first_air_date) ? "tv" : "movie";
                    }
                    console.log("[PlayerInfoLogo] Movie data retrieved from active activity:", movieData);
                    return movieData;
                }
            }
        } catch (e) {
            console.error("[PlayerInfoLogo] Error retrieving data from activity:", e.message);
        }

        // Fallback to Lampa.Storage
        if (!movieData && window.Lampa?.Storage) {
            try {
                var lastMovie = Lampa.Storage.get('last_movie_data');
                if (lastMovie?.id) {
                    if (!lastMovie.media_type) {
                        lastMovie.media_type = (lastMovie.name || lastMovie.first_air_date) ? "tv" : "movie";
                    }
                    movieData = lastMovie;
                    console.log("[PlayerInfoLogo] Movie data retrieved from Lampa.Storage (last_movie_data):", movieData);
                }
            } catch (e) {
                console.error("[PlayerInfoLogo] Error retrieving cached data from Lampa.Storage:", e.message);
            }
        }

        return movieData;
    }

    // Get current episode title from DOM
    function getEpisodeTitle() {
        var currentEpisodeTitle = "";
        try {
            var $playerInfoName = $(".player-info__name");
            if ($playerInfoName.length && $playerInfoName.text().trim()) {
                currentEpisodeTitle = $playerInfoName.text().trim();
                console.log("[PlayerInfoLogo] Episode title from .player-info__name:", currentEpisodeTitle);
                return currentEpisodeTitle;
            }

            var $playerTitleFallback = $(".player-footer-card__title");
            if (!$playerTitleFallback.length) {
                $playerTitleFallback = $(".card__title, .player-title, .media-title, .title, [class*=title]");
            }
            if ($playerTitleFallback.length) {
                currentEpisodeTitle = $playerTitleFallback.text().trim();
                console.log("[PlayerInfoLogo] Episode title from fallback:", currentEpisodeTitle);
            }
        } catch (e) {
            console.error("[PlayerInfoLogo] Error retrieving episode title from DOM:", e.message);
        }
        return currentEpisodeTitle;
    }

    // Main function to display logo and episode title
    function displayPlayerInfoLogo() {
        try {
            console.log("[PlayerInfoLogo] Starting displayPlayerInfoLogo");

            // Check if logo display is enabled
            if (Lampa.Storage.get("player_logo_display") === "1") {
                console.log("[PlayerInfoLogo] Logo display disabled in settings");
                return;
            }

            if (isLoading) {
                console.log("[PlayerInfoLogo] Already loading, skipping");
                return;
            }

            var $playerInfoName = $(".player-info__name");
            if (!$playerInfoName.length) {
                console.log("[PlayerInfoLogo] .player-info__name not found");
                return;
            }

            // Get episode title from DOM
            var currentEpisodeTitle = getEpisodeTitle();
            if (!currentEpisodeTitle) {
                console.log("[PlayerInfoLogo] No episode title found");
                $playerInfoName.text("").show();
                return;
            }

            // Get movie/series data for logo
            var movieData = getMovieData();
            if (!movieData || !movieData.id) {
                console.log("[PlayerInfoLogo] No movie data or ID found, showing episode title only");
                $playerInfoName.text(currentEpisodeTitle).show();
                return;
            }

            var isSerial = movieData.media_type === "tv" || movieData.name || movieData.first_air_date;
            var id = movieData.id;
            var apiPath = isSerial ? `tv/${id}` : `movie/${id}`;
            var currentLampaLang = Lampa.Storage.get('language') || 'en';
            var apiKey = Lampa.TMDB.key();

            // Check for changes in movie ID and language
            var titleKey = `${id}_${currentLampaLang}`;
            if (currentTitle === titleKey) {
                console.log("[PlayerInfoLogo] Movie ID and language unchanged");
                return;
            }

            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }

            clearAllLogos();

            isLoading = true;
            currentTitle = titleKey;

            console.log("[PlayerInfoLogo] Fetching logo for ID:", id, "Type:", isSerial ? "tv" : "movie");

            var logoUrl = `https://api.themoviedb.org/3/${apiPath}/images?api_key=${apiKey}`;

            logoTimeout = setTimeout(function() {
                if (isLoading) {
                    console.log("[PlayerInfoLogo] Logo fetch timeout");
                    isLoading = false;
                    $playerInfoName.text(currentEpisodeTitle).show();
                }
            }, 5000);

            $.get(logoUrl).done(function(e_images) {
                if (!isLoading) return;

                clearTimeout(logoTimeout);
                isLoading = false;

                console.log("[PlayerInfoLogo] TMDB logos found:", e_images.logos ? e_images.logos.length : 0);

                var logo = null;
                var logoLang = null;

                // Prioritize logo based on language
                logo = e_images.logos.find(function(l) { return l.iso_639_1 === currentLampaLang; });
                if (logo) logoLang = currentLampaLang;

                if (!logo && currentLampaLang !== 'ru') {
                    logo = e_images.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                    if (logo) logoLang = 'ru';
                }

                if (!logo && currentLampaLang !== 'en') {
                    logo = e_images.logos.find(function(l) { return l.iso_639_1 === "en"; });
                    if (logo) logoLang = 'en';
                }

                if (!logo) {
                    logo = e_images.logos[0];
                    if (logo) logoLang = logo.iso_639_1;
                }

                if (logo && logo.file_path) {
                    var logoPath = Lampa.TMDB.image(`/t/p/w300${logo.file_path.replace(".svg", ".png")}`);

                    if (!$(".player-info__logo").length) {
                        var imageLogoHtml = createImageLogo(logoPath);
                        $playerInfoName.before(imageLogoHtml);
                        console.log("[PlayerInfoLogo] Logo image added");
                        $playerInfoName.text(currentEpisodeTitle).show();
                        return;
                    }
                }

                console.log("[PlayerInfoLogo] No logo found, showing episode title");
                $playerInfoName.text(currentEpisodeTitle).show();
            }).fail(function() {
                if (!isLoading) return;

                clearTimeout(logoTimeout);
                isLoading = false;
                console.error("[PlayerInfoLogo] Error fetching logos");
                $playerInfoName.text(currentEpisodeTitle).show();
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Error:", e.message);
            isLoading = false;
            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }
            var $playerInfoName = $(".player-info__name");
            if ($playerInfoName.length) {
                $playerInfoName.text(currentEpisodeTitle || "").show();
            }
        }
    }

    // Clear logo and reset state
    function clearLogo() {
        clearAllLogos();
        currentTitle = "";
        isLoading = false;
        if (logoTimeout) {
            clearTimeout(logoTimeout);
            logoTimeout = null;
        }
        console.log("[PlayerInfoLogo] State cleared");
    }

    // Force update logo
    function forceUpdateLogo() {
        console.log("[PlayerInfoLogo] Forcing update");
        clearLogo();
        setTimeout(displayPlayerInfoLogo, 1000);
    }

    // Subscribe to Lampa events
    try {
        if (Lampa && Lampa.Listener) {
            Lampa.Listener.follow('player', function(e) {
                console.log("[PlayerInfoLogo] Player event:", e.type);
                if (e.type === 'start' || e.type === 'loading') {
                    clearLogo();
                    setTimeout(displayPlayerInfoLogo, 2000);
                } else if (e.type === 'end' || e.type === 'stop') {
                    clearLogo();
                }
            });

            Lampa.Listener.follow('card', function(e) {
                console.log("[PlayerInfoLogo] Card event:", e.type);
                if (e.type === 'start' || e.type === 'loading') {
                    clearLogo();
                    setTimeout(displayPlayerInfoLogo, 2000);
                }
            });

            Lampa.Listener.follow('activity', function(e) {
                console.log("[PlayerInfoLogo] Activity event:", e.type);
                if (e.type === 'start') {
                    forceUpdateLogo();
                } else if (e.type === 'destroy') {
                    clearLogo();
                }
            });

            Lampa.Listener.follow('torrent', function(e) {
                if (e.type === 'start') {
                    console.log("[PlayerInfoLogo] New torrent");
                    forceUpdateLogo();
                }
            });

            console.log("[PlayerInfoLogo] Events subscribed");
        }
    } catch (e) {
        console.error("[PlayerInfoLogo] Error subscribing to events:", e.message);
    }

    // DOM Observer for specific elements
    var observer = new MutationObserver(function(mutations) {
        var shouldUpdate = false;

        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && (
                            node.classList.contains('player-info__name') ||
                            node.classList.contains('player-footer-card__title') ||
                            $(node).find('.player-info__name, .player-footer-card__title').length
                        )) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });

        if (shouldUpdate) {
            console.log("[PlayerInfoLogo] DOM changed");
            setTimeout(forceUpdateLogo, 500);
        }
    });

    // Start observer
    try {
        var targetNode = document.querySelector('.player-info, .player-panel') || document.body;
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
        console.log("[PlayerInfoLogo] Observer started on:", targetNode.className || 'body');
    } catch (e) {
        console.error("[PlayerInfoLogo] Observer error:", e.message);
    }

    // Initial check
    try {
        setTimeout(function checkDOM() {
            console.log("[PlayerInfoLogo] Checking DOM");
            displayPlayerInfoLogo();
            if (!$(".player-info__name").length) {
                setTimeout(checkDOM, 2000);
            }
        }, 1500);
    } catch (e) {
        console.error("[PlayerInfoLogo] Initialization error:", e.message);
    }

    // Periodic check
    setInterval(function() {
        if ($(".player-info__name").length && !$(".player-info__logo").length && !isLoading) {
            console.log("[PlayerInfoLogo] Periodic check: logo missing");
            displayPlayerInfoLogo();
        }
    }, 10000);
}();
