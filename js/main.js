/* ============================================================
   ARGROW — Interactions & Animations
   ============================================================ */
(function(){
  "use strict";

  document.addEventListener('DOMContentLoaded', function(){

    /* ---------------- Preloader ---------------- */
    var preloader = document.getElementById('preloader');
    window.addEventListener('load', function(){
      setTimeout(function(){ preloader && preloader.classList.add('done'); }, 400);
    });
    // fallback in case load event already fired / is slow
    setTimeout(function(){ preloader && preloader.classList.add('done'); }, 2500);

    /* ---------------- Footer year ---------------- */
    var y = document.getElementById('year');
    if(y) y.textContent = new Date().getFullYear();

    /* ---------------- Scroll progress bar ---------------- */
    var progressBar = document.getElementById('progressBar');
    function updateProgress(){
      var h = document.documentElement;
      var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      if(progressBar) progressBar.style.width = scrolled + '%';
    }
    document.addEventListener('scroll', updateProgress, { passive:true });
    updateProgress();

    /* ---------------- Navbar shrink + active link ---------------- */
    var navbar = document.getElementById('navbar');
    function onScrollNav(){
      if(window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    document.addEventListener('scroll', onScrollNav, { passive:true });
    onScrollNav();

    /* ---------------- Mobile menu ---------------- */
    var burger = document.getElementById('burger');
    var navLinks = document.getElementById('navLinks');
    if(burger){
      burger.addEventListener('click', function(){
        burger.classList.toggle('open');
        navLinks.classList.toggle('open');
      });
      navLinks.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){
          burger.classList.remove('open');
          navLinks.classList.remove('open');
        });
      });
    }

    /* ---------------- Language toggle (TR/EN) ---------------- */
    var langToggle = document.getElementById('langToggle');
    if(langToggle && typeof EA_I18N !== 'undefined'){
      var langBtns = langToggle.querySelectorAll('.lang-btn');

      function applyLang(lang){
        document.querySelectorAll('[data-i18n]').forEach(function(el){
          var key = el.getAttribute('data-i18n');
          if(EA_I18N[key] && EA_I18N[key][lang]){
            el.innerHTML = EA_I18N[key][lang];
          }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
          var key = el.getAttribute('data-i18n-placeholder');
          if(EA_I18N[key] && EA_I18N[key][lang]){
            el.setAttribute('placeholder', EA_I18N[key][lang]);
          }
        });
        langBtns.forEach(function(b){
          b.classList.toggle('active', b.getAttribute('data-lang') === lang);
        });
        document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'tr');
      }

      var savedLang = 'tr';
      try{ savedLang = localStorage.getItem('ea-lang') || 'tr'; }catch(e){}
      if(savedLang === 'en') applyLang('en');

      langBtns.forEach(function(btn){
        btn.addEventListener('click', function(){
          var lang = btn.getAttribute('data-lang');
          applyLang(lang);
          try{ localStorage.setItem('ea-lang', lang); }catch(e){}
        });
      });
    }

    /* ---------------- Theme toggle (dark/light) ---------------- */
    function syncLogoTheme(isLight){
      document.querySelectorAll('.logo img').forEach(function(img){
        img.src = isLight ? '/img/argrow-logo-light.png' : '/img/ArGrowLogo.png';
      });
    }
    var themeToggle = document.getElementById('themeToggle');
    if(themeToggle){
      themeToggle.addEventListener('click', function(){
        var isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if(isLight){
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('ea-theme', 'dark');
          syncLogoTheme(false);
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          localStorage.setItem('ea-theme', 'light');
          syncLogoTheme(true);
        }
      });
    }

    /* ---------------- Cursor glow ---------------- */
    var glow = document.getElementById('cursorGlow');
    if(glow && window.matchMedia('(hover:hover)').matches){
      window.addEventListener('mousemove', function(e){
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    }

    /* ---------------- Back to top ---------------- */
    var backToTop = document.getElementById('backToTop');
    document.addEventListener('scroll', function(){
      if(window.scrollY > 600) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    }, { passive:true });
    backToTop && backToTop.addEventListener('click', function(){
      window.scrollTo({ top:0, behavior:'smooth' });
    });

    /* ---------------- Scroll reveal (IntersectionObserver) ---------------- */
    var revealEls = document.querySelectorAll('.reveal-up');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function(el){ io.observe(el); });

    /* ---------------- Timeline progress line ---------------- */
    var timeline = document.querySelector('.timeline');
    var timelineProgress = document.querySelector('.timeline-progress');
    if(timeline && timelineProgress){
      var tIo = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            timelineProgress.style.width = '100%';
            tIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      tIo.observe(timeline);
    }

    /* ---------------- Animated counters ---------------- */
    var counters = document.querySelectorAll('.stat-num');
    var cIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var divisor = decimals ? Math.pow(10, decimals) : 1;
        var displayTarget = decimals ? target / divisor : target;
        var duration = 1600;
        var startTime = null;

        function step(ts){
          if(!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = displayTarget * eased;
          el.textContent = (decimals ? current.toFixed(decimals) : Math.round(current)) + suffix;
          if(progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cIo.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el){ cIo.observe(el); });

    /* ---------------- Tilt cards (3D mouse follow) ---------------- */
    var tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(function(card){
      var inner = card.querySelector('.tilt-card-inner');
      if(!inner) return;
      card.addEventListener('mousemove', function(e){
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotateX = ((y - midY) / midY) * -6;
        var rotateY = ((x - midX) / midX) * 6;
        inner.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
        inner.style.setProperty('--mx', x + 'px');
        inner.style.setProperty('--my', y + 'px');
      });
      card.addEventListener('mouseleave', function(){
        inner.style.transform = 'rotateX(0) rotateY(0) translateY(0)';
      });
    });

    /* ---------------- Magnetic buttons ---------------- */
    var magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.4) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = 'translate(0,0)';
      });
    });

    /* ---------------- Pricing toggle ---------------- */
    var toggleBtns = document.querySelectorAll('.toggle-btn');
    var panelSetup = document.getElementById('panel-setup');
    var panelSubs = document.getElementById('panel-subs');
    toggleBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        toggleBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        var target = btn.getAttribute('data-target');
        if(target === 'setup'){
          panelSetup.classList.remove('is-hidden');
          panelSubs.classList.add('is-hidden');
        } else {
          panelSubs.classList.remove('is-hidden');
          panelSetup.classList.add('is-hidden');
        }
      });
    });

    /* ---------------- FAQ accordion ---------------- */
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item){
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      q.addEventListener('click', function(){
        var isOpen = item.classList.contains('open');
        faqItems.forEach(function(other){
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        });
        if(!isOpen){
          item.classList.add('open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });

    /* ---------------- Testimonial slider ---------------- */
    var track = document.getElementById('testiTrack');
    var prevBtn = document.getElementById('testiPrev');
    var nextBtn = document.getElementById('testiNext');
    var dotsWrap = document.getElementById('testiDots');
    if(track){
      var cards = track.children.length;
      var perView = 3;
      function getPerView(){
        if(window.innerWidth <= 900) return 1;
        return 3;
      }
      var index = 0;
      var autoplayTimer;

      function totalSlides(){ return Math.max(cards - getPerView() + 1, 1); }

      function renderDots(){
        dotsWrap.innerHTML = '';
        for(var i=0; i<totalSlides(); i++){
          var d = document.createElement('span');
          if(i === index) d.classList.add('active');
          d.addEventListener('click', function(idx){ return function(){ goTo(idx); }; }(i));
          dotsWrap.appendChild(d);
        }
      }

      function goTo(i){
        var max = totalSlides() - 1;
        index = Math.max(0, Math.min(i, max));
        var pct = (100 / cards) * index;
        track.style.transform = 'translateX(calc(-' + pct + '% - ' + (index * (24/getPerView()*0)) + 'px))';
        // account for gap using JS width calc instead of pure percentage
        var cardEl = track.children[0];
        var cardWidth = cardEl.getBoundingClientRect().width;
        var gap = 24;
        track.style.transform = 'translateX(-' + (index * (cardWidth + gap)) + 'px)';
        Array.prototype.forEach.call(dotsWrap.children, function(d, di){
          d.classList.toggle('active', di === index);
        });
      }

      function next(){ goTo(index + 1 > totalSlides() - 1 ? 0 : index + 1); }
      function prev(){ goTo(index - 1 < 0 ? totalSlides() - 1 : index - 1); }

      nextBtn.addEventListener('click', function(){ next(); resetAutoplay(); });
      prevBtn.addEventListener('click', function(){ prev(); resetAutoplay(); });

      function resetAutoplay(){
        clearInterval(autoplayTimer);
        autoplayTimer = setInterval(next, 5000);
      }

      renderDots();
      goTo(0);
      resetAutoplay();

      window.addEventListener('resize', function(){
        renderDots();
        goTo(0);
      });
    }

    /* ---------------- Contact form (forwards to WhatsApp) ---------------- */
    var form = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        if(!form.checkValidity()){ form.reportValidity(); return; }

        var data = new FormData(form);
        var lines = [
          'Merhaba ArGrow ekibi, web sitesi formundan yazıyorum:',
          'Ad Soyad: ' + (data.get('name') || '-'),
          'E-Posta: ' + (data.get('email') || '-'),
          'Telefon: ' + (data.get('phone') || '-'),
          'Şirket / Marka: ' + (data.get('company') || '-'),
          'Mesaj: ' + (data.get('message') || '-')
        ];
        var waUrl = 'https://wa.me/905451534770?text=' + encodeURIComponent(lines.join('\n'));
        var waLink = document.createElement('a');
        waLink.href = waUrl;
        waLink.target = '_blank';
        waLink.rel = 'noopener';
        document.body.appendChild(waLink);
        waLink.click();
        waLink.remove();

        var submitBtn = form.querySelector('button[type="submit"]');
        var label = submitBtn.querySelector('.btn-label');
        var originalText = label.textContent;
        label.textContent = 'Gönderiliyor...';
        submitBtn.style.opacity = '.7';
        setTimeout(function(){
          label.textContent = originalText;
          submitBtn.style.opacity = '1';
          success.classList.add('show');
          form.reset();
          setTimeout(function(){ success.classList.remove('show'); }, 6000);
        }, 900);
      });
    }

    /* QR tool and Kâr/Zarar app logic now live in js/tools.js (loaded only
       on qr-menu.html and kar-zarar.html) to keep main.js lean. */

    /* ---------------- Particle background (hero canvas) ---------------- */
    var canvas = document.getElementById('particles');
    if(canvas){
      var ctx = canvas.getContext('2d');
      var particles = [];
      var hero = document.getElementById('hero');
      var W, H;

      function resize(){
        W = canvas.width = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
      }
      window.addEventListener('resize', resize);
      resize();

      var count = window.innerWidth < 768 ? 35 : 70;
      for(var i=0; i<count; i++){
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: Math.random() * 0.5 + 0.2
        });
      }

      var colors = ['110,162,63', '139,193,88', '74,117,48'];

      function draw(){
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function(p, i){
          p.x += p.vx;
          p.y += p.vy;
          if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
          if(p.y < 0) p.y = H; if(p.y > H) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + colors[i % colors.length] + ',' + p.alpha + ')';
          ctx.fill();
        });

        // connecting lines for nearby particles
        for(var a=0; a<particles.length; a++){
          for(var b=a+1; b<particles.length; b++){
            var dx = particles[a].x - particles[b].x;
            var dy = particles[a].y - particles[b].y;
            var dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 110){
              ctx.beginPath();
              ctx.moveTo(particles[a].x, particles[a].y);
              ctx.lineTo(particles[b].x, particles[b].y);
              ctx.strokeStyle = 'rgba(110,162,63,' + (0.12 * (1 - dist/110)) + ')';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      }
      draw();
    }

  });
})();
