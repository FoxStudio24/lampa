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
        
        .player-panel__body {
            padding: 1em;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)) !important;
        }
        
        .player-panel {
            left: 0em;
            bottom: 0em;
            right: 0em;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: none !important;
            background-image: none !important;
            background-color: transparent !important;
            box-shadow: none !important;
        }
        
        /* Hide center elements */
        .player-panel__center > div {
            display: none !important;
        }
        
        /* Rearrange play/pause in left section */
        .player-panel__line-two {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }
        
        .player-panel__center {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            flex: 1 !important;
        }
        
        .player-panel__left {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }
        
        .player-panel__right {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }
        
        .player-panel__playpause {
            font-size: 1em;
            margin: 0 0em;
            order: -1 !important; /* Move play/pause to the start of left section */
        }
        
        .player-panel__pip, .player-panel__volume {
            display: none !important;
        }
        
        @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
        }
        </style>
    `;

    // Append styles to head
    $('head').append(customStyles);

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

    // Fuzzy matching for title comparison
    function findBestMatch(results, originalTitle) {
        if (!results || results.length === 0) return null;

        var cleanOriginal = originalTitle.toLowerCase()
            .replace(/\s*\(\d{4}\).*$/, '')
            .replace(/\s*s\d+.*$/i, '')
            .replace(/\s*сезон.*$/i, '')
            .replace(/[^\w\s]/g, '')
            .trim();

        console.log("[PlayerInfoLogo] Searching for:", cleanOriginal);

        var bestMatch = null;
        var highestScore = 0;

        for (var i = 0; i < results.length; i++) {
            var item = results[i];
            var title = (item.title || item.name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();
            var originalTitle = (item.original_title || item.original_name || "").toLowerCase()
                .replace(/[^\w\s]/g, '')
                .trim();

            // Simple fuzzy matching (Levenshtein distance could be used for more precision)
            var score = 0;
            if (title === cleanOriginal || originalTitle === cleanOriginal) {
                score = 100; // Exact match
            } else if (title.includes(cleanOriginal) || originalTitle.includes(cleanOriginal)) {
                score = 80; // Substring match
            } else if (cleanOriginal.includes(title) || cleanOriginal.includes(originalTitle)) {
                score = 60; // Partial match
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        }

        if (bestMatch && highestScore >= 60) {
            console.log("[PlayerInfoLogo] Best match found:", bestMatch.title || bestMatch.name, "Score:", highestScore);
            return bestMatch;
        }

        console.log("[PlayerInfoLogo] No suitable match found");
        return null;
    }

    // Main function to display logo
    function displayPlayerInfoLogo() {
        try {
            console.log("[PlayerInfoLogo] Starting displayPlayerInfoLogo");

            if (isLoading) {
                console.log("[PlayerInfoLogo] Already loading, skipping");
                return;
            }

            var $playerInfoName = $(".player-info__name");
            if (!$playerInfoName.length) {
                console.log("[PlayerInfoLogo] .player-info__name not found");
                return;
            }

            var $playerTitle = $(".player-footer-card__title");
            if (!$playerTitle.length) {
                $playerTitle = $(".card__title, .player-title, .media-title, .title, [class*=title]");
            }

            var title = $playerTitle.length ? $playerTitle.text().trim() : "";

            if (!title) {
                console.log("[PlayerInfoLogo] Title is empty");
                return;
            }

            var cleanTitle = title
                .replace(/\s*\(\d{4}\).*$/, '')
                .replace(/\s*S\d+.*$/i, '')
                .replace(/\s*Сезон.*$/i, '')
                .replace(/\s*(trailer|трейлер|teaser|тизер|official|featurette).*$/i, '')
                .replace(/\s*-.*$/, '')
                .replace(/[^\w\s\u0400-\u04FF]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            console.log("[PlayerInfoLogo] Title:", cleanTitle);

            if (currentTitle === cleanTitle) {
                console.log("[PlayerInfoLogo] Title unchanged");
                return;
            }

            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }

            clearAllLogos();

            isLoading = true;
            currentTitle = cleanTitle;

            console.log("[PlayerInfoLogo] Starting fetch for:", cleanTitle);

            var apiKey = Lampa.TMDB.key();
            var currentLampaLang = Lampa.Storage.get('language') || 'en';
            var searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(cleanTitle)}&language=${currentLampaLang}&page=1`;

            logoTimeout = setTimeout(function() {
                if (isLoading) {
                    console.log("[PlayerInfoLogo] Fetch timeout - logo not found");
                    isLoading = false;
                    $playerInfoName.text(cleanTitle).show();
                }
            }, 5000);

            $.get(searchUrl).done(function(data) {
                if (!isLoading) return;

                console.log("[PlayerInfoLogo] TMDB search: results =", data.results ? data.results.length : 0);

                var bestMatch = findBestMatch(data.results, cleanTitle);

                if (!bestMatch) {
                    console.log("[PlayerInfoLogo] No suitable result found");
                    clearTimeout(logoTimeout);
                    isLoading = false;
                    $playerInfoName.text(cleanTitle).show();
                    return;
                }

                var isSerial = bestMatch.media_type === "tv";
                var id = bestMatch.id;
                var apiPath = isSerial ? `tv/${id}` : `movie/${id}`;
                var logoUrl = `https://api.themoviedb.org/3/${apiPath}/images?api_key=${apiKey}`;

                $.get(logoUrl).done(function(e) {
                    if (!isLoading) return;

                    clearTimeout(logoTimeout);
                    isLoading = false;

                    console.log("[PlayerInfoLogo] TMDB logos: found =", e.logos ? e.logos.length : 0);

                    var logo = null;
                    var logoLang = null;

                    // Prioritize logo based on language
                    logo = e.logos.find(function(l) { return l.iso_639_1 === currentLampaLang; });
                    if (logo) logoLang = currentLampaLang;

                    if (!logo && currentLampaLang !== 'ru') {
                        logo = e.logos.find(function(l) { return l.iso_639_1 === "ru"; });
                        if (logo) logoLang = 'ru';
                    }

                    if (!logo && currentLampaLang !== 'en') {
                        logo = e.logos.find(function(l) { return l.iso_639_1 === "en"; });
                        if (logo) logoLang = 'en';
                    }

                    if (!logo) {
                        logo = e.logos[0];
                        if (logo) logoLang = logo.iso_639_1;
                    }

                    if (logo && logo.file_path) {
                        var logoPath = Lampa.TMDB.image(`/t/p/w300${logo.file_path.replace(".svg", ".png")}`);

                        if (!$(".player-info__logo").length) {
                            var imageLogoHtml = createImageLogo(logoPath);
                            $playerInfoName.before(imageLogoHtml);
                            console.log("[PlayerInfoLogo] Logo image added");

                            if (logoLang !== currentLampaLang) {
                                var titleApi = `https://api.themoviedb.org/3/${apiPath}?api_key=${apiKey}&language=${currentLampaLang}`;
                                $.get(titleApi).done(function(data) {
                                    var localizedTitle = isSerial ? data.name : data.title;
                                    if (localizedTitle) {
                                        $playerInfoName.text(localizedTitle).show();
                                    }
                                }).fail(function() {
                                    console.error("[PlayerInfoLogo] Error fetching localized title");
                                    $playerInfoName.text(cleanTitle).show();
                                });
                            } else {
                                $playerInfoName.hide();
                            }
                            return;
                        }
                    }

                    console.log("[PlayerInfoLogo] No logo found in database");
                    $playerInfoName.text(cleanTitle).show();
                }).fail(function() {
                    if (!isLoading) return;

                    clearTimeout(logoTimeout);
                    isLoading = false;
                    console.error("[PlayerInfoLogo] Error fetching logos");
                    $playerInfoName.text(cleanTitle).show();
                });
            }).fail(function() {
                if (!isLoading) return;

                clearTimeout(logoTimeout);
                isLoading = false;
                console.error("[PlayerInfoLogo] Error searching TMDB");
                $playerInfoName.text(cleanTitle).show();
            });
        } catch (e) {
            console.error("[PlayerInfoLogo] Error:", e.message);
            isLoading = false;
            if (logoTimeout) {
                clearTimeout(logoTimeout);
            }
            if ($playerInfoName.length) {
                $playerInfoName.text(cleanTitle).show();
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
        setTimeout(function() {
            displayPlayerInfoLogo();
        }, 1000);
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

    // Start observer on specific elements
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
