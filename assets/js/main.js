/* Multifunnels shared behaviors: i18n, navigation, analytics, project rendering. */
(function () {
  "use strict";

  var projects = window.MF_PROJECTS || [];
  var translations = window.MF_I18N || {};
  var rtlLanguages = ["he", "ar"];

  /* ── Analytics ─────────────────────────────────────────────────────
     Events go to GA4 via gtag (defined in each page's head). If gtag is
     unavailable (blocked, not loaded), fall back to a GTM-style
     dataLayer push. Each named event fires once per interaction. */
  window.dataLayer = window.dataLayer || [];
  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    } else {
      window.dataLayer.push(Object.assign({ event: eventName }, params || {}));
    }
  }
  window.mfTrack = track;

  /* ── Language ────────────────────────────────────────────────────── */
  var languageSelects = Array.prototype.slice.call(
    document.querySelectorAll("[data-language-select]")
  );
  var savedLanguage = null;
  try { savedLanguage = localStorage.getItem("multifunnels-language"); } catch (e) {}
  var browserLanguage = (navigator.language || "en").slice(0, 2);
  var initialLanguage = translations[savedLanguage]
    ? savedLanguage
    : translations[browserLanguage]
      ? browserLanguage
      : "en";

  function applyLanguage(language, isUserAction) {
    var dictionary = translations[language] || translations.en || {};
    var fallback = translations.en || {};
    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.indexOf(language) !== -1 ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");
      var value = dictionary[key] || fallback[key];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (element) {
      // data-i18n-attr="placeholder:formNamePlaceholder,aria-label:someKey"
      element.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0].trim();
        var key = parts[1].trim();
        var value = dictionary[key] || fallback[key];
        if (value) element.setAttribute(attr, value);
      });
    });

    languageSelects.forEach(function (select) { select.value = language; });
    try { localStorage.setItem("multifunnels-language", language); } catch (e) {}
    if (isUserAction) track("language_changed", { language: language });
  }

  languageSelects.forEach(function (select) {
    select.addEventListener("change", function (event) {
      applyLanguage(event.target.value, true);
    });
  });

  /* ── Header scroll state ─────────────────────────────────────────── */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Mobile menu ─────────────────────────────────────────────────── */
  var menuToggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (menuToggle && mobileMenu) {
    var setMenu = function (open) {
      mobileMenu.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      mobileMenu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    menuToggle.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("is-open"));
    });
    mobileMenu.querySelectorAll("a, .mobile-menu-close").forEach(function (el) {
      el.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ── Footer project links (rendered from central data) ───────────── */
  document.querySelectorAll("[data-project-links]").forEach(function (list) {
    var kind = list.getAttribute("data-project-links"); // "product" | "infrastructure" | "all"
    projects
      .filter(function (p) { return kind === "all" || p.type === kind; })
      .sort(function (a, b) { return a.order - b.order; })
      .forEach(function (p) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = p.caseStudyUrl;
        a.textContent = p.name;
        li.appendChild(a);
        list.appendChild(li);
      });
  });

  /* ── Related projects on case pages ──────────────────────────────── */
  document.querySelectorAll("[data-related-projects]").forEach(function (grid) {
    var current = grid.getAttribute("data-related-projects");
    projects
      .filter(function (p) { return p.slug !== current; })
      .sort(function (a, b) { return a.order - b.order; })
      .slice(0, 3)
      .forEach(function (p) {
        var a = document.createElement("a");
        a.className = "related-card";
        a.href = p.caseStudyUrl;
        var strong = document.createElement("strong");
        strong.textContent = p.name;
        var span = document.createElement("span");
        span.setAttribute("data-i18n", p.categoryKey);
        span.textContent = p.proof;
        a.appendChild(strong);
        a.appendChild(span);
        grid.appendChild(a);
      });
  });

  /* ── External product links + analytics ──────────────────────────── */
  document.querySelectorAll("a[data-track]").forEach(function (link) {
    link.addEventListener("click", function () {
      var name = link.getAttribute("data-track");
      var label = link.getAttribute("data-track-label") || link.href;
      track(name, { label: label });
    });
  });

  /* ── Copy MCP endpoint buttons ───────────────────────────────────── */
  document.querySelectorAll("[data-copy]").forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.getAttribute("data-copy");
      var done = function () {
        button.classList.add("is-copied");
        var original = button.textContent;
        button.textContent = button.getAttribute("data-copied-label") || "Copied";
        setTimeout(function () {
          button.classList.remove("is-copied");
          button.textContent = original;
        }, 1800);
        track("mcp_endpoint_copied", { endpoint: value });
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  /* ── Contact form (Netlify Forms, AJAX submit) ───────────────────── */
  var form = document.querySelector("form[name='project-brief']");
  if (form) {
    var started = false;
    form.addEventListener("input", function () {
      if (!started) {
        started = true;
        track("contact_form_started", {});
      }
    }, { once: false });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (value, key) { body.append(key, value); });
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString()
      }).then(function () {
        form.hidden = true;
        var success = document.querySelector(".form-success");
        if (success) success.classList.add("is-visible");
        track("contact_form_submitted", {});
      }).catch(function () {
        // Fallback: standard submit so Netlify still captures the entry.
        form.removeAttribute("hidden");
        form.submit();
      });
    });
  }

  /* ── Orchestration animation (the site's single motion statement) ── */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var orchestration = document.querySelector(".orchestration");
  if (orchestration && !reduceMotion) {
    // Activate the one-time flow animation shortly after load.
    window.requestAnimationFrame(function () {
      setTimeout(function () { orchestration.classList.add("is-animated"); }, 250);
    });
  }

  /* ── Year ────────────────────────────────────────────────────────── */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  applyLanguage(initialLanguage, false);
})();
