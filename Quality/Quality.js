(function () {
  'use strict';

  var isProcessing = false;
  var cardBadgesCache = {};

  // Встроенные SVG иконки из твоей папки Quality_ico
  var svgIcons = {
    '4K': 'Quality_ico/4K.svg',
    '2K': 'Quality_ico/2K.svg',
    'FULL HD': 'Quality_ico/FULL HD.svg',
    'HD': 'Quality_ico/HD.svg',
    'HDR': 'Quality_ico/HDR.svg',
    'Dolby Vision': 'Quality_ico/Dolby Vision.svg',
    '7.1': 'Quality_ico/7.1.svg',
    '5.1': 'Quality_ico/5.1.svg',
    '4.0': 'Quality_ico/4.0.svg',
    '2.0': 'Quality_ico/2.0.svg',
    'DUB': 'Quality_ico/DUB.svg'
  };

  function getBest(results) {
    var best = { resolution: null, hdr: false, dolbyVision: false, audio: null, dub: false };
    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var audioOrder = ['2.0', '4.0', '5.1', '7.1'];
    
    results.forEach(function(item) {
      if (item.ffprobe && Array.isArray(item.ffprobe)) {
        item.ffprobe.forEach(function(stream) {
          if (stream.codec_type === 'video' && stream.height) {
            var res = null;
            if (stream.height >= 2160 || stream.width >= 3840) res = '4K';
            else if (stream.height >= 1440 || stream.width >= 2560) res = '2K';
            else if (stream.height >= 1080 || stream.width >= 1920) res = 'FULL HD';
            else if (stream.height >= 720 || stream.width >= 1280) res = 'HD';
            
            if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) {
              best.resolution = res;
            }

            if (stream.side_data_list) {
              var hasDolbyVision = stream.side_data_list.some(function(s) {
                return s.side_data_type === 'DOVI configuration record' || 
                       s.side_data_type === 'Dolby Vision RPU';
              });
              
              var hasHDR = stream.side_data_list.some(function(s) {
                return s.side_data_type === 'Mastering display metadata' || 
                       s.side_data_type === 'Content light level metadata';
              });

              if (hasDolbyVision) best.dolbyVision = true;
              if (hasHDR || hasDolbyVision) best.hdr = true;
            }

            if (!best.hdr && stream.color_transfer) {
              var transfer = stream.color_transfer.toLowerCase();
              if (transfer === 'smpte2084' || transfer === 'arib-std-b67') {
                best.hdr = true;
              }
            }

            if (!best.dolbyVision && stream.codec_name) {
              var codec = stream.codec_name.toLowerCase();
              if (codec.indexOf('dovi') >= 0 || codec.indexOf('dolby') >= 0) {
                best.dolbyVision = true;
              }
            }
          }
          
          if (stream.codec_type === 'audio') {
            if (stream.channels) {
              var aud = null;
              if (stream.channels >= 8) aud = '7.1';
              else if (stream.channels >= 6) aud = '5.1';
              else if (stream.channels >= 4) aud = '4.0';
              else if (stream.channels >= 2) aud = '2.0';
              
              if (aud && (!best.audio || audioOrder.indexOf(aud) > audioOrder.indexOf(best.audio))) {
                best.audio = aud;
              }
            }
            
            if (stream.tags) {
              var lang = (stream.tags.language || '').toLowerCase();
              var title = (stream.tags.title || stream.tags.handler_name || '').toLowerCase();
              var isRussian = lang === 'rus' || lang === 'ru' || lang === 'russian';
              var isDub = title.indexOf('dub') >= 0 || title.indexOf('дубляж') >= 0 || title.indexOf('дублир') >= 0 || title === 'd';
              if (isRussian && isDub) best.dub = true;
            }
          }
        });
      }
      
      var title = item.Title.toLowerCase();
      if (title.indexOf('dolby vision') >= 0 || title.indexOf('dovi') >= 0 || title.match(/\bdv\b/)) {
        best.dolbyVision = true;
      }
      if (title.indexOf('hdr10+') >= 0 || title.indexOf('hdr10') >= 0 || title.indexOf('hdr') >= 0) {
        best.hdr = true;
      }
    });

    return best;
  }

  function createBadgeImg(type, isCard) {
    var className = isCard ? 'card-quality-badge' : 'quality-badge';
    var modifierClass = (type === '4K' || type === '2K' || type === 'FULL HD' || type === 'HD') ? '--resolution' : '--outlined';
    var iconPath = svgIcons[type];
    
    if (!iconPath) return '';
    
    return '<div class="' + className + ' ' + className + modifierClass + '"><img src="' + iconPath + '" alt="' + type + '"></div>';
  }

  function addCardBadges(cardElement, movieId, best) {
    if (!cardElement || cardElement.find('.card-quality-badges').length) return;

    var badges = [];
    
    if (best.resolution) badges.push(createBadgeImg(best.resolution, true));
    if (best.hdr) badges.push(createBadgeImg('HDR', true));
    if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', true));
    if (best.audio) badges.push(createBadgeImg(best.audio, true));
    if (best.dub) badges.push(createBadgeImg('DUB', true));

    if (badges.length === 0) return;

    var container = $('<div class="card-quality-badges"></div>').html(badges.join(''));
    cardElement.find('.card__view').append(container);
  }

  function processCards() {
    $('.card').each(function() {
      var card = $(this);
      var movieId = card.data('id');
      
      if (!movieId || cardBadgesCache[movieId]) return;

      var movie = card.data('item');
      if (!movie || !Lampa.Storage.field('parser_use')) return;
      if (!Lampa.Parser || !Lampa.Parser.get) return;

      var searchQuery = movie.title || movie.name;

      Lampa.Parser.get({ search: searchQuery, movie: movie, page: 1 }, function(response) {
        if (!response || !response.Results || response.Results.length === 0) return;

        var best = getBest(response.Results);
        cardBadgesCache[movieId] = best;
        addCardBadges(card, movieId, best);
      });
    });
  }

  function addDetailsBadges() {
    if (isProcessing) return;
    var detailsElement = $('.full-start-new__details');
    if (!detailsElement.length) return;
    $('.quality-badges-container').remove();
    isProcessing = true;
  }

  Lampa.Listener.follow('full', function(e) {
    if (e.type !== 'complite') return;
    
    var movie = e.data.movie;
    if (!movie || !Lampa.Storage.field('parser_use')) return;
    if (!Lampa.Parser || !Lampa.Parser.get) return;

    addDetailsBadges();

    var searchQuery = movie.title || movie.name;

    Lampa.Parser.get({ search: searchQuery, movie: movie, page: 1 }, function(response) {
      isProcessing = false;

      if (!response || !response.Results || response.Results.length === 0) return;

      var best = getBest(response.Results);
      console.log('[QualityBadges] Данные:', best);

      var badges = [];
      
      if (best.resolution) badges.push(createBadgeImg(best.resolution, false));
      if (best.hdr) badges.push(createBadgeImg('HDR', false));
      if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', false));
      if (best.audio) badges.push(createBadgeImg(best.audio, false));
      if (best.dub) badges.push(createBadgeImg('DUB', false));
      
      if (badges.length === 0) return;

      var attempts = 0;
      var maxAttempts = 10;
      
      var interval = setInterval(function() {
        attempts++;
        var detailsElement = $('.full-start-new__details');
        
        if (detailsElement.length) {
          clearInterval(interval);
          $('.quality-badges-container').remove();
          detailsElement.after('<div class="quality-badges-container">' + badges.join('') + '</div>');
          console.log('[QualityBadges] Добавлено');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);
    }, function(error) {
      isProcessing = false;
    });
  });

  setInterval(processCards, 2000);

  Lampa.Template.add('qb_css', '<style>\
    .quality-badges-container {\
      display: flex;\
      gap: 0.4em;\
      margin-top: 0.5em;\
      margin-bottom: 0.5em;\
    }\
    .quality-badge {\
      height: 1.2em;\
      display: flex;\
      align-items: center;\
    }\
    .quality-badge img {\
      height: 100%;\
      width: auto;\
      display: block;\
    }\
    .card__view {\
      position: relative;\
    }\
    .card-quality-badges {\
      position: absolute;\
      top: 0.5em;\
      right: 0.5em;\
      display: flex;\
      flex-direction: column;\
      gap: 0.3em;\
      align-items: flex-end;\
      z-index: 3;\
      pointer-events: none;\
    }\
    .card-quality-badge {\
      height: 1em;\
      display: flex;\
      align-items: center;\
    }\
    .card-quality-badge img {\
      height: 100%;\
      width: auto;\
      display: block;\
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));\
    }\
  </style>');
  $('body').append(Lampa.Template.get('qb_css', {}, true));

  console.log('[QualityBadges] v1.0.0 запущен');

})();
