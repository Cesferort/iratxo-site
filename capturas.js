// Tira de capturas. El paso de una a otra lo hace el propio navegador con
// scroll-snap (dedo, rueda, teclado); aquí sólo se mueven las flechas y los
// puntos, y se marca cuál se está viendo. Si las cuatro caben, no hay controles.
(function () {
  var raiz = document.querySelector("[data-capturas]");
  if (!raiz) return;

  var pista = raiz.querySelector("[data-pista]");
  var fotos = Array.prototype.slice.call(pista.querySelectorAll("figure"));
  var puntos = Array.prototype.slice.call(raiz.querySelectorAll("[data-punto]"));
  var prev = raiz.querySelector("[data-prev]");
  var next = raiz.querySelector("[data-next]");
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var actual = 0;
  var pendiente = false;
  // Mientras dura un desplazamiento pedido con flecha o punto, manda el destino
  // y no la captura que pasa por el centro: así dos clics seguidos avanzan dos.
  var destino = null;
  var soltar = null;

  function ir(n) {
    n = Math.max(0, Math.min(fotos.length - 1, n));
    var foto = fotos[n];
    destino = n;
    clearTimeout(soltar);
    soltar = setTimeout(function () { destino = null; marcar(); }, 900);
    pista.scrollTo({
      left: foto.offsetLeft - (pista.clientWidth - foto.offsetWidth) / 2,
      behavior: quieto ? "auto" : "smooth"
    });
    marcar();
  }

  // La captura activa es la que tiene el centro más cerca del centro de la tira.
  function marcar() {
    pendiente = false;
    var centro = pista.scrollLeft + pista.clientWidth / 2;
    var mejor = 0;
    var distancia = Infinity;
    fotos.forEach(function (foto, i) {
      var d = Math.abs(foto.offsetLeft + foto.offsetWidth / 2 - centro);
      if (d < distancia) { distancia = d; mejor = i; }
    });
    actual = destino === null ? mejor : destino;
    puntos.forEach(function (punto, i) {
      var visible = i === actual;
      punto.classList.toggle("is-on", visible);
      if (visible) punto.setAttribute("aria-current", "true");
      else punto.removeAttribute("aria-current");
    });
    var max = pista.scrollWidth - pista.clientWidth;
    prev.disabled = pista.scrollLeft <= 2;
    next.disabled = pista.scrollLeft >= max - 2;
  }

  function medir() {
    raiz.classList.toggle("is-scroll", pista.scrollWidth > pista.clientWidth + 2);
    marcar();
  }

  pista.addEventListener("scroll", function () {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(marcar);
  }, { passive: true });

  prev.addEventListener("click", function () { ir(actual - 1); });
  next.addEventListener("click", function () { ir(actual + 1); });
  puntos.forEach(function (punto, i) {
    punto.addEventListener("click", function () { ir(i); });
  });

  pista.addEventListener("keydown", function (ev) {
    if (ev.key === "ArrowLeft") { ev.preventDefault(); ir(actual - 1); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); ir(actual + 1); }
  });

  pista.addEventListener("scrollend", function () {
    if (destino === null) return;
    clearTimeout(soltar);
    destino = null;
    marcar();
  });

  window.addEventListener("resize", medir);
  window.addEventListener("load", medir);
  medir();
})();
