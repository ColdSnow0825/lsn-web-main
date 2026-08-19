/* ==========================================================================
   PROTOCOL // 战术协议  —  esports.js
   交互引擎：读条 / 准星光标 / 导航状态 / 滚动揭示 / 数字滚动 / 能力条
            / 3D 卡片倾斜 / 跑马灯自复制 / 回到顶部 / 打字机
   无依赖（Bootstrap 仅用于其自带组件，本文件不依赖 jQuery）
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ------------------------------------------------------------------ */
  /* 1. PRELOADER —— 假进度读条，营造"开局加载"仪式感                     */
  /* ------------------------------------------------------------------ */
  function initPreloader() {
    var el = document.querySelector('[data-preloader]');
    if (!el) return;

    var fill = el.querySelector('.preloader__fill');
    var pct = el.querySelector('[data-preloader-pct]');
    var value = 0;

    var timer = setInterval(function () {
      value += Math.random() * 18 + 6;
      if (value >= 100) value = 100;
      if (fill) fill.style.width = value + '%';
      if (pct) pct.textContent = String(Math.floor(value)).padStart(3, '0') + '%';

      if (value >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          el.classList.add('is-done');
          document.body.classList.add('is-loaded');
        }, 320);
      }
    }, 140);
  }

  /* ------------------------------------------------------------------ */
  /* 2. CURSOR —— 准星光标（带缓动跟随）                                  */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    if (isTouch || reduceMotion) return;

    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!document.body.classList.contains('cursor-ready')) {
        rx = mx; ry = my;
        document.body.classList.add('cursor-ready');
      }
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) translate(-50%,-50%)';
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    var hot = 'a, button, .card-e, .btn-e, [data-cursor="hot"]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hot)) document.body.classList.add('is-hovering');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hot)) document.body.classList.remove('is-hovering');
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. NAV —— 滚动吸顶 + 当前区块高亮                                    */
  /* ------------------------------------------------------------------ */
  function initNav() {
    var nav = document.querySelector('[data-nav]');
    if (!nav) return;

    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // 区块高亮
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-e__link[href^="#"]'));
    var targets = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);
    if (!targets.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ------------------------------------------------------------------ */
  /* 4. REVEAL —— 滚动进场                                                */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 5. COUNTERS —— 数字滚动                                              */
  /* ------------------------------------------------------------------ */
  function initCounters() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;

    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var dur = parseInt(el.getAttribute('data-count-dur'), 10) || 1600;
      var pad = el.getAttribute('data-count-pad') === 'true';
      var start = performance.now();

      var step = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
        var val = Math.round(target * eased);
        el.textContent = pad ? String(val).padStart(2, '0') : String(val);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 6. METERS —— 能力条填充                                              */
  /* ------------------------------------------------------------------ */
  function initMeters() {
    var bars = document.querySelectorAll('[data-meter]');
    if (!bars.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var fill = en.target.querySelector('.meter__fill');
        if (fill) fill.style.width = en.target.getAttribute('data-meter') + '%';
        io.unobserve(en.target);
      });
    }, { threshold: 0.5 });

    bars.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* 6b. RADAR —— 选手能力雷达图                                          */
  /* ------------------------------------------------------------------ */
  function initRadar() {
    var hosts = document.querySelectorAll('[data-radar]');
    if (!hosts.length) return;

    var C = 200, R = 124, LABEL_R = 152, LEVELS = 4;

    hosts.forEach(function (host) {
      var axes;
      try { axes = JSON.parse(host.getAttribute('data-radar')); } catch (e) { return; }
      if (!Array.isArray(axes) || axes.length < 3) return;

      var n = axes.length;

      var pt = function (i, r) {
        var a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return [C + Math.cos(a) * r, C + Math.sin(a) * r];
      };
      var ring = function (r) {
        var out = [];
        for (var i = 0; i < n; i++) out.push(pt(i, r).map(function (v) { return v.toFixed(1); }).join(','));
        return out.join(' ');
      };

      var svg = '';

      // 同心网格
      for (var l = LEVELS; l >= 1; l--) {
        svg += '<polygon class="radar__grid" points="' + ring(R * l / LEVELS) + '"/>';
      }
      // 轴线
      for (var i = 0; i < n; i++) {
        var e = pt(i, R);
        svg += '<line class="radar__axis" x1="' + C + '" y1="' + C + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '"/>';
      }
      // 数据多边形
      var pts = axes.map(function (a, k) { return pt(k, R * Math.max(0, Math.min(100, a[1])) / 100); });
      svg += '<polygon class="radar__shape" points="' +
             pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>';
      pts.forEach(function (p) {
        svg += '<circle class="radar__dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4"/>';
      });
      // 标签 + 数值
      axes.forEach(function (a, k) {
        var p = pt(k, LABEL_R);
        var anchor = p[0] > C + 6 ? 'start' : (p[0] < C - 6 ? 'end' : 'middle');
        var dy = p[1] < C ? -2 : 12;
        svg += '<text class="radar__label" x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) +
               '" text-anchor="' + anchor + '">' + a[0] + '</text>';
        svg += '<text class="radar__value" x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy + 17).toFixed(1) +
               '" text-anchor="' + anchor + '">' + a[1] + '</text>';
      });

      host.classList.add('radar');
      host.innerHTML = '<svg class="radar__svg" viewBox="0 0 400 400" role="img" aria-label="能力分布雷达图">' + svg + '</svg>';
    });

    if (reduceMotion) {
      hosts.forEach(function (h) { h.classList.add('is-on'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-on');
        io.unobserve(en.target);
      });
    }, { threshold: 0.35 });

    hosts.forEach(function (h) { io.observe(h); });
  }

  /* ------------------------------------------------------------------ */
  /* 7. TILT —— 卡片 3D 倾斜                                              */
  /* ------------------------------------------------------------------ */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    var els = document.querySelectorAll('[data-tilt]');

    els.forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 8;

      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          'perspective(900px) rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg) translateZ(0)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(900px) rotateY(0) rotateX(0)';
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. TICKER —— 自动复制内容以实现无缝循环                              */
  /* ------------------------------------------------------------------ */
  function initTicker() {
    document.querySelectorAll('[data-ticker]').forEach(function (track) {
      track.innerHTML += track.innerHTML;   // 复制一份，配合 translateX(-50%) 无缝
    });
  }

  /* ------------------------------------------------------------------ */
  /* 9. TO-TOP                                                            */
  /* ------------------------------------------------------------------ */
  function initToTop() {
    var btn = document.querySelector('[data-to-top]');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.7);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 10. TYPEWRITER —— 轮播打字                                           */
  /* ------------------------------------------------------------------ */
  function initTypewriter() {
    var el = document.querySelector('[data-type]');
    if (!el) return;

    var words = (el.getAttribute('data-type') || '').split('|').filter(Boolean);
    if (!words.length) return;

    if (reduceMotion) { el.textContent = words[0]; return; }

    var wi = 0, ci = 0, deleting = false;

    (function tick() {
      var word = words[wi];
      ci += deleting ? -1 : 1;
      el.textContent = word.slice(0, ci);

      var delay = deleting ? 45 : 95;
      if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
      else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % words.length; delay = 320; }

      setTimeout(tick, delay);
    })();
  }

  /* ------------------------------------------------------------------ */
  /* BOOT                                                                 */
  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initCursor();
    initNav();
    initTicker();
    initReveal();
    initCounters();
    initMeters();
    initRadar();
    initTilt();
    initToTop();
    initTypewriter();
  });
})();
