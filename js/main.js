/* ==========================================================================
   LEO FRETES E MUDANÇAS — main.js
   GSAP + ScrollTrigger + SplitText + Lenis
   ========================================================================== */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger, SplitText);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =====================================================
     LENIS — smooth scroll
  ===================================================== */
  let lenis;
  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* =====================================================
     PRELOADER
  ===================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderPath = document.querySelector('.preloader-path');
  const preloaderPct = document.querySelector('.preloader-pct');

  function runPreloader() {
    return new Promise((resolve) => {
      const counter = { val: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(preloader, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
              preloader.style.display = 'none';
              resolve();
            },
          });
        },
      });
      tl.to(preloaderPath, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0);
      tl.to(counter, {
        val: 100,
        duration: 1.6,
        ease: 'power2.inOut',
        onUpdate: () => { preloaderPct.textContent = Math.round(counter.val); },
      }, 0);
      tl.to({}, { duration: 0.2 });
    });
  }

  /* =====================================================
     ROTA DE FUNDO (SVG watermark) — desenha uma vez
  ===================================================== */
  function initRouteWatermark() {
    const path = document.querySelector('#route-watermark path');
    if (!path) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 3.5,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.2 },
    });
  }

  /* =====================================================
     NAVBAR
  ===================================================== */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    ScrollTrigger.create({
      start: 80,
      onUpdate: (self) => {
        navbar.classList.toggle('scrolled', self.scroll() > 80);
      },
    });

    // pill indicador ativo
    const links = document.querySelectorAll('.nav-menu a');
    const menu = document.querySelector('.nav-menu ul');
    let pill = document.querySelector('.nav-pill');
    if (!pill && menu) {
      pill = document.createElement('div');
      pill.className = 'nav-pill';
      menu.style.position = 'relative';
      menu.appendChild(pill);
    }
    function movePill(el) {
      if (!pill || !el || window.innerWidth <= 900) return;
      const r = el.getBoundingClientRect();
      const mr = menu.getBoundingClientRect();
      gsap.to(pill, { x: r.left - mr.left, width: r.width, duration: 0.5, ease: 'power3.out' });
    }
    const sections = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));
    links.forEach((a) => a.addEventListener('mouseenter', () => movePill(a)));

    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: () => {
        let current = sections[0];
        sections.forEach((sec) => {
          if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = sec;
        });
        const activeLink = Array.from(links).find(a => a.getAttribute('href') === '#' + current?.id);
        if (activeLink && document.activeElement?.tagName !== 'A') movePill(activeLink);
      },
    });

    // menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    menuToggle?.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.forEach((a) => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* =====================================================
     BACK TO TOP
  ===================================================== */
  function initBackTop() {
    const backTop = document.getElementById('backTop');
    ScrollTrigger.create({
      start: 400,
      onUpdate: (self) => backTop.classList.toggle('visible', self.scroll() > 400),
    });
    backTop.addEventListener('click', () => {
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =====================================================
     HERO
  ===================================================== */
  function initHero() {
    const titleLines = document.querySelectorAll('.hero-title .line');
    const split = [];
    titleLines.forEach((line) => {
      split.push(new SplitText(line, { type: 'chars', charsClass: 'char' }));
    });

    const tl = gsap.timeline({ delay: 0.15 });

    tl.set('.hero-title .char', { yPercent: 120, opacity: 0, rotateZ: 6 });
    tl.set(['.hero-sub', '.hero-actions', '.hero-stats', '.hero-visual', '.eyebrow'], { opacity: 0, y: 24 });

    tl.to('.eyebrow', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to('.hero-title .char', {
        yPercent: 0, opacity: 1, rotateZ: 0,
        duration: 0.9, ease: 'power4.out', stagger: 0.018,
      }, '-=0.3')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .to('.hero-stats', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5')
      .to('.hero-visual', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7');

    // rota do hero desenha
    const heroPath = document.querySelector('.hero-route-path');
    if (heroPath) {
      const len = heroPath.getTotalLength();
      heroPath.style.strokeDasharray = len;
      heroPath.style.strokeDashoffset = len;
      tl.to(heroPath, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=0.6');
      const pin = document.querySelector('.hero-route-pin');
      if (pin) tl.fromTo(pin, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '-=0.3');
    }

    // parallax suave da imagem no scroll
    gsap.to('.hero-image-frame', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    return tl;
  }

  /* =====================================================
     REVEAL GENÉRICO (scroll)
  ===================================================== */
  function initScrollReveals() {
    const groups = [
      { sel: '.service-card', stagger: 0.1 },
      { sel: '.area-card', stagger: 0.08 },
      { sel: '.gallery-item', stagger: 0.15 },
      { sel: '.faq-item', stagger: 0.08 },
      { sel: '.footer-grid > div', stagger: 0.08 },
    ];
    groups.forEach(({ sel, stagger }) => {
      const els = gsap.utils.toArray(sel);
      if (!els.length) return;
      els.forEach((el) => el.closest('[data-grid-root]') || null);
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger, ease: 'power3.out' }),
      });
      gsap.set(els, { opacity: 0, y: 46 });
    });

    // títulos de seção
    gsap.utils.toArray('.section-head').forEach((head) => {
      gsap.from(head.children, {
        opacity: 0, y: 30, duration: 0.9, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: head, start: 'top 85%' },
      });
    });

    // vehicle
    gsap.from('.scanner-container', {
      opacity: 0, x: -50, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: '.vehicle', start: 'top 75%' },
    });
    gsap.from('.vehicle-info > *', {
      opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.vehicle', start: 'top 72%' },
    });

    // diferencial
    const diffSplit = new SplitText('.diff-box p', { type: 'lines', linesClass: 'diff-line' });
    gsap.set(diffSplit.lines, { opacity: 0, y: 20, filter: 'blur(6px)' });
    gsap.to(diffSplit.lines, {
      opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: '.diff-box', start: 'top 78%' },
    });
    gsap.from('.diff-box h2, .diff-quote-mark', {
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.diff-box', start: 'top 82%' },
    });

    // contact
    gsap.from('.contact-grid > div', {
      opacity: 0, y: 34, duration: 0.9, stagger: 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact', start: 'top 78%' },
    });
  }

  /* =====================================================
     SCANNER (linha de inspeção no veículo)
  ===================================================== */
  function initScanner() {
    const line = document.querySelector('.scanner-line');
    if (!line) return;
    gsap.to(line, {
      top: '92%',
      duration: 2.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      scrollTrigger: { trigger: '.vehicle', start: 'top 80%' },
    });
  }

  /* =====================================================
     CARDS TILT 3D
  ===================================================== */
  function initTiltCards() {
    const cards = document.querySelectorAll('.service-card, .area-card');
    cards.forEach((card) => {
      const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
      const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
      card.style.perspective = '800px';
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        quickX((px - 0.5) * 10);
        quickY(-(py - 0.5) * 10);
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { quickX(0); quickY(0); });
    });
  }

  /* =====================================================
     BOTÕES MAGNÉTICOS + RIPPLE
  ===================================================== */
  function initMagneticButtons() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-whatsapp-nav').forEach((btn) => {
      const qx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const qy = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.3);
        qy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener('mouseleave', () => { qx(0); qy(0); });
      btn.addEventListener('click', function (e) {
        const r = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(r.width, r.height) * 1.4;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  /* =====================================================
     CONTADORES (stats)
  ===================================================== */
  function initCounters() {
    document.querySelectorAll('.counter').forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const suffix = counter.getAttribute('data-suffix') || '';
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            onUpdate: () => { counter.textContent = Math.floor(obj.val) + suffix; },
            onComplete: () => { counter.textContent = target + suffix; },
          });
        },
      });
    });
  }

  /* =====================================================
     ÁREA — mapa com rota conectando os marcadores
  ===================================================== */
  function initAreaMap() {
    const path = document.querySelector('.map-route-path');
    const truck = document.querySelector('.map-truck');
    const markers = gsap.utils.toArray('.map-marker');
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: '.map-container', start: 'top 70%' },
    });

    tl.to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' });
    if (truck) {
      tl.to(truck, {
        motionPath: { path: path, align: path, alignOrigin: [0.5, 0.5] },
        duration: 2.2, ease: 'power2.inOut',
      }, '<');
    }
    markers.forEach((m, i) => {
      tl.from(m, { opacity: 0, scale: 0.4, duration: 0.4, ease: 'back.out(2)' }, i * 0.35);
    });
  }

  /* =====================================================
     PROCESSO — a rota tracejada preenche conforme o scroll
  ===================================================== */
  function initProcessRoute() {
    const fill = document.querySelector('.process-route-fill');
    const steps = gsap.utils.toArray('.process-step');
    if (!fill || !steps.length) return;

    ScrollTrigger.create({
      trigger: '.process-timeline',
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.6,
      onUpdate: (self) => {
        fill.style.width = (self.progress * 100) + '%';
        steps.forEach((s, i) => {
          const threshold = i / (steps.length - 1);
          s.classList.toggle('reached', self.progress >= threshold - 0.05);
        });
      },
    });
  }

  /* =====================================================
     LIGHTBOX
  ===================================================== */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    if (!lightbox) return;
    document.querySelectorAll('.gallery-item img').forEach((img) => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    function close() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    closeBtn?.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* =====================================================
     FAQ — accordion animado
  ===================================================== */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      question.setAttribute('aria-expanded', 'false');
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item.active').forEach((other) => {
          if (other !== item) {
            other.classList.remove('active');
            gsap.to(other.querySelector('.faq-answer'), { height: 0, duration: 0.4, ease: 'power2.inOut' });
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        });
        if (isActive) {
          item.classList.remove('active');
          gsap.to(answer, { height: 0, duration: 0.4, ease: 'power2.inOut' });
          question.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          gsap.set(answer, { height: 'auto' });
          gsap.from(answer, { height: 0, duration: 0.45, ease: 'power2.inOut' });
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* =====================================================
     WHATSAPP — link com mensagem pronta
  ===================================================== */
  function initWhatsApp() {
    const PHONE = '5515991043888';
    const MESSAGE = 'Olá! Gostaria de solicitar um orçamento de frete e mudança. O Assistente da Leo Fretes me encaminhou até você. Aguardo retorno. Atenciosamente.';
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

    document.querySelectorAll('#whatsappFloat, #whatsappNav, #whatsappHero, #whatsappContact').forEach((el) => {
      el.setAttribute('href', url);
    });
  }

  /* =====================================================
     CHATBOT
  ===================================================== */
  function initChatbot() {
    const toggle = document.getElementById('chatbotToggle');
    const win = document.getElementById('chatbotWindow');
    const closeBtn = document.getElementById('chatbotClose');
    const messages = document.getElementById('chatbotMessages');
    const input = document.getElementById('chatbotInput');
    const send = document.getElementById('chatbotSend');
    if (!toggle) return;

    let userName = '';
    let waitingForName = true;

    function addUser(text) {
      const div = document.createElement('div');
      div.className = 'user-msg';
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
    function addBot(html) {
      const div = document.createElement('div');
      div.className = 'bot-msg';
      div.innerHTML = html;
      messages.appendChild(div);
      gsap.from(div, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' });
      messages.scrollTop = messages.scrollHeight;
    }

    toggle.addEventListener('click', () => {
      const open = win.classList.toggle('open');
      if (open && messages.children.length === 0) {
        addBot('📋 Olá! Seja bem-vindo ao canal de atendimento da Leo Fretes e Mudanças.<br><br>Somos uma empresa especializada em fretes e mudanças, com compromisso, pontualidade e transparência em cada serviço prestado.<br><br>Para iniciarmos um atendimento personalizado, poderia nos informar o seu nome?');
        waitingForName = true;
      }
    });
    closeBtn?.addEventListener('click', () => win.classList.remove('open'));

    function process(msg) {
      msg = msg.trim();
      if (waitingForName) {
        userName = msg;
        waitingForName = false;
        addBot(`✅ Muito prazer em conhecê-lo, <strong>${userName}</strong>! Agradecemos pelo contato.<br><br>Para que possamos atendê-lo com excelência, por favor, selecione uma das opções abaixo digitando o número correspondente:<br><br>1 – Solicitar orçamento<br>2 – Telefones para contato<br>3 – WhatsApp<br>4 – Nossos serviços<br>5 – Área de atuação<br>6 – Veículo e capacidade<br>7 – Horário de funcionamento<br>8 – E-mail para contato<br>9 – Encerrar atendimento`);
        return;
      }
      const responses = {
        '1': `📋 *Orçamento, ${userName}:*<br>Entre em contato pelo WhatsApp (15) 99104-3888 ou (71) 992309086.`,
        '2': `📞 *Telefones, ${userName}:*<br>(15) 99104-3888<br>(71) 99230-9086<br>Estamos à disposição para atendê-lo.`,
        '3': `🤖 *Assistente da Leo Fretes - Conexão Imediata*<br><br>Olá, <strong>${userName}</strong>! Estou conectando você ao canal mais rápido de atendimento da Leo Fretes.<br><br>📱 *WhatsApp:*<br>Clique no botão verde flutuante no canto inferior direito ou acesse diretamente:<br>🔗 https://wa.me/5515991043888<br><br>⚡ *Status:* Canal disponível 24 horas para atendimento prioritário.`,
        '4': `🚚 *Nossos Serviços, ${userName}:*<br>Oferecemos fretes, mudanças, transporte de cargas, entregas rápidas, coletas e transporte comercial em Sorocaba, Votorantim e Itu.`,
        '5': `📍 *Área de Atuação, ${userName}:*<br>Sorocaba • Votorantim • Itu • Éden • Aparecidinha`,
        '6': `🚛 *Veículo, ${userName}:*<br>KIA BONGO 2012, capacidade de 2,5m a 3m, peso máximo de 1400 kg. Manutenção em dia e seguro incluso.`,
        '7': `🕒 *Horário de Funcionamento, ${userName}:*<br>Atendimento 24 horas, todos os dias da semana. Estamos sempre prontos para atendê-lo.`,
        '8': `📧 *E-mail, ${userName}:*<br>leandrosantana45@gmail.com<br>Fique à vontade para nos escrever.`,
        '9': `👋 *Até logo, ${userName}!*<br>Agradecemos pelo contato. Foi um prazer atendê-lo. Conte sempre conosco!`,
      };
      const lower = msg.toLowerCase();
      if (responses[msg]) {
        addBot(responses[msg]);
        if (msg === '9') {
          setTimeout(() => { win.classList.remove('open'); waitingForName = true; userName = ''; }, 2200);
        }
        return;
      }
      if (lower.includes('orçamento') || lower.includes('preço') || lower.includes('valor')) {
        addBot('📋 *Orçamento:* Entre em contato pelo WhatsApp (15) 99104-3888. Responderemos rapidamente!');
      } else if (lower.includes('whatsapp') || lower.includes('zap')) {
        addBot('💬 *WhatsApp:* https://wa.me/5515991043888');
      } else if (lower.includes('telefone') || lower.includes('contato') || lower.includes('número')) {
        addBot('📞 (15) 99104-3888 | (71) 99230-9086');
      } else if (lower.includes('serviço') || lower.includes('frete') || lower.includes('mudança')) {
        addBot('🚚 Fretes, mudanças, transportes, entregas, coletas e comercial em Sorocaba, Votorantim e Itu.');
      } else if (lower.includes('área') || lower.includes('cidade') || lower.includes('local') || lower.includes('região')) {
        addBot('📍 Atendemos: Sorocaba, Votorantim, Itu, Éden (Sorocaba) e Aparecidinha (Sorocaba).');
      } else if (lower.includes('veículo') || lower.includes('bongo') || lower.includes('caminhão')) {
        addBot('🚛 KIA BONGO 2012. Capacidade: 2,5m a 3m. Peso máximo: 1400 kg.');
      } else if (lower.includes('horário') || lower.includes('hora') || lower.includes('funciona')) {
        addBot('🕒 Atendimento 24 horas, todos os dias. Estamos sempre prontos!');
      } else if (lower.includes('email') || lower.includes('e-mail')) {
        addBot('📧 leandrosantana45@gmail.com');
      } else if (lower.includes('obrigado') || lower.includes('valeu') || lower.includes('tchau') || lower.includes('adeus')) {
        addBot(`🙏 Agradecemos o contato, ${userName}! Foi um prazer atendê-lo. Até logo!`);
      } else {
        addBot(`🤔 Desculpe, não entendi, ${userName}. Por favor, digite um número de 1 a 9 ou palavras como "orçamento", "whatsapp", "telefone", "serviço", "área", "veículo", "horário" ou "email".`);
      }
    }

    function handleSend() {
      const text = input.value.trim();
      if (!text) return;
      addUser(text);
      input.value = '';
      setTimeout(() => process(text), 400);
    }
    send?.addEventListener('click', handleSend);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSend(); });
  }

  /* =====================================================
     INIT
  ===================================================== */
  document.addEventListener('DOMContentLoaded', async () => {
    initRouteWatermark();
    initNavbar();
    initBackTop();
    initScanner();
    initTiltCards();
    initMagneticButtons();
    initCounters();
    initAreaMap();
    initProcessRoute();
    initLightbox();
    initFaq();
    initWhatsApp();
    initChatbot();

    await runPreloader();
    initHero();
    initScrollReveals();
    ScrollTrigger.refresh();

    console.log('%c🚚 Leo Fretes e Mudanças — site carregado', 'color:#FFA23A;font-weight:bold;');
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
