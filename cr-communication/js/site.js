
(function () {
  var root = document.documentElement;
  var version = root.getAttribute("data-version");

  function syncDots() {
    var current = root.getAttribute("data-tone");
    document.querySelectorAll("[data-pick]").forEach(function (btn) {
      var on = btn.getAttribute("data-pick") === current;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
    });
  }

  document.querySelectorAll("[data-pick]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-pick");
      root.setAttribute("data-tone", id);
      try { localStorage.setItem("cr-tone-" + version, id); } catch (e) {}
      syncDots();
    });
  });
  if (version) syncDots();

  var menu = document.querySelector(".menu");
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  document.querySelectorAll("[data-open]").forEach(function (btn) {
    btn.addEventListener("click", function () { setMenu(true); });
  });
  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", function () { setMenu(false); });
  });
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href") || "";
      var here = (location.pathname.split("/").pop() || "index.html");
      var target = href.split("/").pop();
      setMenu(false);
      if (target === here) {
        event.preventDefault();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    });
  });

  var carousel = document.querySelector(".carousel");
  if (carousel) {
    var dots = document.querySelectorAll(".dot-page");
    carousel.addEventListener("scroll", function () {
      var mid = carousel.scrollLeft + carousel.clientWidth / 2;
      var best = 0;
      var dist = Infinity;
      Array.prototype.forEach.call(carousel.children, function (card, i) {
        var center = card.offsetLeft + card.offsetWidth / 2;
        var delta = Math.abs(center - mid);
        if (delta < dist) { dist = delta; best = i; }
      });
      dots.forEach(function (dot, i) { dot.classList.toggle("is-on", i === best); });
    }, { passive: true });
  }

  var note = document.querySelector("[data-note]");
  if (note) {
    var q = new URLSearchParams(location.search);
    var messages = {
      ok: "Message envoyé. On vous répond à l’adresse indiquée.",
      nom: "Le nom et le message sont indispensables.",
      email: "Indiquez votre e-mail, pour que l’on puisse vous répondre.",
      mail: "Le serveur n’a pas envoyé le message. Écrivez directement à crcommunication@icloud.com."
    };
    var key = q.get("ok") === "1" ? "ok" : q.get("err");
    if (key && messages[key]) {
      note.hidden = false;
      note.textContent = messages[key];
    }
  }

  if (!root.classList.contains("snap-home")) return;
  var locked = window.innerHeight;
  var apply = function (height) { root.style.setProperty("--hero-lock", Math.round(height) + "px"); };
  apply(locked);
  window.addEventListener("resize", function () {
    var next = window.innerHeight;
    if (Math.abs(next - locked) < 160) return;
    locked = next;
    apply(locked);
  });
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var startX = 0, startY = 0, lockUntil = 0;
  var points = function () {
    var services = document.getElementById("services");
    var footer = document.querySelector("footer");
    return [0, services ? services.offsetTop : 0, footer ? footer.offsetTop : 0];
  };
  var go = function (dir) {
    var now = Date.now();
    if (now < lockUntil) return;
    var pts = points();
    var y = window.scrollY;
    var idx = 0;
    for (var i = 0; i < pts.length; i++) if (pts[i] <= y + 32) idx = i;
    var next = Math.max(0, Math.min(pts.length - 1, idx + dir));
    if (pts[next] === Math.round(y)) return;
    lockUntil = now + 680;
    root.style.setProperty("scroll-snap-type", "none");
    window.scrollTo({ top: pts[next], behavior: reduced ? "auto" : "smooth" });
    window.setTimeout(function () { root.style.removeProperty("scroll-snap-type"); }, reduced ? 0 : 620);
  };
  window.addEventListener("wheel", function (event) {
    if (reduced || Math.abs(event.deltaY) < 12) return;
    var target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(".carousel") && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    go(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  window.addEventListener("touchstart", function (event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
  }, { passive: true });
  window.addEventListener("touchmove", function (event) {
    if (reduced) return;
    var dx = event.touches[0].clientX - startX;
    var dy = event.touches[0].clientY - startY;
    var target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(".carousel") && Math.abs(dx) > Math.abs(dy)) return;
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) event.preventDefault();
  }, { passive: false });
  window.addEventListener("touchend", function (event) {
    if (reduced) return;
    var dx = event.changedTouches[0].clientX - startX;
    var dy = startY - event.changedTouches[0].clientY;
    var target = event.target instanceof Element ? event.target : null;
    if (target && target.closest(".carousel") && Math.abs(dx) > Math.abs(dy)) return;
    if (Math.abs(dy) < 28) return;
    go(dy > 0 ? 1 : -1);
  }, { passive: true });
})();
