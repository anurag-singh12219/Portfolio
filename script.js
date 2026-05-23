(() => {
  const state = {
    resume: null,
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function runSplash() {
    const splash = qs("#splash-screen");
    const fill = qs("#splash-progress");
    const main = qs("#main-content");

    if (!splash || !fill || !main) return;

    let progress = 0;
    const start = performance.now();
    const duration = 1500;

    function tick(now) {
      progress = Math.min(100, ((now - start) / duration) * 100);
      fill.style.width = progress.toFixed(2) + "%";

      if (progress < 100) {
        requestAnimationFrame(tick);
        return;
      }

      setTimeout(() => {
        splash.classList.add("hide");
        main.classList.remove("opacity-0");
      }, 250);

      setTimeout(() => {
        splash.remove();
      }, 1200);
    }

    requestAnimationFrame(tick);
  }

  function initBackground() {
    const canvas = qs("#bg-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (prefersReducedMotion) {
      return;
    }

    let particles = [];
    let rafId = 0;

    function particleCount() {
      return window.innerWidth < 768 ? 30 : 70;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < particleCount(); i += 1) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const o = particles[j];
          const dx = p.x - o.x;
          const dy = p.y - o.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - dist / 1500})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    }

    resizeCanvas();
    draw();

    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId), { once: true });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length || prefersReducedMotion) {
      nodes.forEach((node) => node.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
  }

  function renderHero() {
    const basics = state.resume.basics;
    qs("#hero-name").textContent = basics.name;
    qs("#hero-title").textContent = basics.title;
    qs("#hero-summary").textContent = basics.summary;
    qs("#download-resume-btn").setAttribute("href", "./public/Anurag_Singh_Resume.pdf");

    const experienceBtn = qs("#view-experience-btn");
    experienceBtn?.addEventListener("click", () => {
      const experienceEl = qs("#experience");
      if (experienceEl) {
        experienceEl.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
    });
  }

  function renderExperience() {
    const list = qs("#experience-list");
    if (!list) return;

    list.innerHTML = state.resume.experience
      .map(
        (exp, index) => `
          <article class="timeline-item reveal" data-exp-index="${index}">
            <div class="timeline-dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" color="#34d399" aria-hidden="true">
                <path d="M21 8a2 2 0 0 0-2-2h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path>
                <path d="M8 10h8"></path>
              </svg>
            </div>
            <div class="timeline-card ${index === 0 ? "active" : ""}" role="button" tabindex="0" aria-expanded="${index === 0}">
              <div class="timeline-meta">
                <div>
                  <h3 class="timeline-role">${escapeHtml(exp.role)}</h3>
                  <div class="timeline-company">${escapeHtml(exp.company)}</div>
                </div>
                <span class="timeline-dates">${escapeHtml(exp.dates)}</span>
              </div>
              <ul class="timeline-bullets">
                ${exp.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
              </ul>
            </div>
          </article>
        `
      )
      .join("");

    const cards = list.querySelectorAll(".timeline-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => toggleExperienceCard(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleExperienceCard(card);
        }
      });
    });

    const impact = qs("#impact-highlights");
    if (impact) {
      impact.innerHTML = `
        <h3>Impact Highlights</h3>
        <div class="highlight-item">Developed an AI-Powered Mental Health Companion using <strong>Streamlit</strong> and machine learning models.</div>
        <div class="highlight-item">Implemented deep learning integration using <strong>TensorFlow</strong> and <strong>DeepFace</strong>.</div>
        <div class="highlight-item">Built a Deep Learning-Based Animal Detection System using <strong>YOLOv8</strong> and <strong>OpenCV</strong>.</div>
      `;
    }
  }

  function toggleExperienceCard(targetCard) {
    const cards = document.querySelectorAll(".timeline-card");

    cards.forEach((card) => {
      if (card === targetCard) {
        const isActive = card.classList.contains("active");
        card.classList.toggle("active", !isActive);
        card.setAttribute("aria-expanded", String(!isActive));
      } else {
        card.classList.remove("active");
        card.setAttribute("aria-expanded", "false");
      }
    });
  }

  function renderProjects() {
    const grid = qs("#projects-grid");
    if (!grid) return;

    grid.innerHTML = state.resume.projects
      .map(
        (project) => `
          <div class="col-md-6 reveal">
            <article class="project-card">
              <h3 class="project-title h4 mb-2">${escapeHtml(project.title)}</h3>
              <p class="project-stack mb-3">${escapeHtml(project.stack)}</p>
              <ul class="project-bullets">
                ${project.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
              </ul>
              <div class="project-date">${escapeHtml(project.dates)}</div>
            </article>
          </div>
        `
      )
      .join("");
  }

  function renderAchievements() {
    const icons = ["&#127942;", "&#127941;", "&#11088;"];
    const themes = ["theme-yellow", "theme-emerald", "theme-blue"];
    const grid = qs("#achievements-grid");
    if (!grid) return;

    grid.innerHTML = state.resume.achievements
      .slice(0, 3)
      .map(
        (achievement, index) => `
          <div class="col-md-4 reveal">
            <article class="achievement-card ${themes[index % themes.length]}">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="achievement-icon" aria-hidden="true">${icons[index % icons.length]}</div>
                <h3 class="achievement-title h5 mb-0">${escapeHtml(achievement.title)}</h3>
              </div>
              <p class="achievement-context mb-0">${escapeHtml(achievement.context)}</p>
            </article>
          </div>
        `
      )
      .join("");
  }

  function renderSkills() {
    const grid = qs("#skills-grid");
    if (!grid) return;

    grid.innerHTML = state.resume.skills
      .map(
        (group) => `
          <div class="col-md-6 col-lg-4 reveal">
            <article class="skill-card">
              <h3 class="skill-title h5 mb-3">${escapeHtml(group.category)}</h3>
              <ul class="skill-list">
                ${group.items.map((item) => `<li class="skill-item">${escapeHtml(item)}</li>`).join("")}
              </ul>
            </article>
          </div>
        `
      )
      .join("");
  }

  function renderEducation() {
    const wrap = qs("#education-list");
    if (!wrap) return;

    wrap.innerHTML = state.resume.education
      .map(
        (edu) => `
          <article class="edu-card reveal">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-2">
              <div>
                <h3 class="edu-degree h4 mb-1">${escapeHtml(edu.degree)}</h3>
                <div class="edu-institution">${escapeHtml(edu.institution)}</div>
              </div>
              <span class="edu-score">${escapeHtml(edu.score)}</span>
            </div>
            <div class="edu-meta mb-3">${escapeHtml(edu.dates)} | ${escapeHtml(edu.location)}</div>
            <p class="edu-details mb-0">${escapeHtml(edu.details)}</p>
          </article>
        `
      )
      .join("");
  }

  function renderCertifications() {
    const wrap = qs("#cert-extra");
    if (!wrap) return;

    const certHtml = state.resume.certifications
      .map((cert) => `<li class="cert-item">${escapeHtml(cert)}</li>`)
      .join("");

    const extraHtml = state.resume.extra
      .map((item) => `<li class="extra-item cert-item">${escapeHtml(item)}</li>`)
      .join("");

    wrap.innerHTML = `
      <div class="col-lg-6 reveal">
        <article class="cert-card">
          <h3 class="h4 mb-3">Certifications</h3>
          <ul class="cert-list">${certHtml}</ul>
        </article>
      </div>
      <div class="col-lg-6 reveal">
        <article class="cert-card">
          <h3 class="h4 mb-3">Extracurricular Activities</h3>
          <ul class="extra-list">${extraHtml}</ul>
        </article>
      </div>
    `;
  }

  function renderFooter() {
    const footer = qs("#footer-copy");
    if (!footer) return;

    footer.textContent = `© ${new Date().getFullYear()} Anurag Singh. All rights reserved.`;
  }

  function closeMobileNavOnClick() {
    const navLinks = document.querySelectorAll(".navbar .nav-link");
    const navMenu = qs("#navMenu");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (!navMenu || !window.bootstrap) return;

        const collapse = window.bootstrap.Collapse.getInstance(navMenu) || new window.bootstrap.Collapse(navMenu, { toggle: false });
        if (window.innerWidth < 992) {
          collapse.hide();
        }
      });
    });
  }

  async function loadResumeData() {
    const response = await fetch("./public/resume.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load resume data");
    }

    state.resume = await response.json();
  }

  async function init() {
    try {
      runSplash();
      initBackground();
      await loadResumeData();
      renderHero();
      renderExperience();
      renderProjects();
      renderAchievements();
      renderSkills();
      renderEducation();
      renderCertifications();
      renderFooter();
      initReveal();
      closeMobileNavOnClick();
    } catch (error) {
      console.error(error);
      const main = qs("#main-content");
      if (main) {
        main.classList.remove("opacity-0");
        main.innerHTML = "<section class='container py-5'><p class='text-danger mb-0'>Unable to load portfolio content. Please try again.</p></section>";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
