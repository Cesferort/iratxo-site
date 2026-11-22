(function () {
  var raiz = document.querySelector("[data-capturas]");
  if (!raiz) return;

  var fotos = Array.prototype.slice.call(raiz.querySelectorAll("figure"));
  var puntos = Array.prototype.slice.call(raiz.querySelectorAll("[data-punto]"));
  var actual = 0;
  var reloj = null;
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mostrar(n) {
    actual = (n + fotos.length) % fotos.length;
    fotos.forEach(function (foto, i) {
      var visible = i === actual;
      foto.hidden = !visible;
    });
    puntos.forEach(function (punto, i) {
      var visible = i === actual;
      punto.classList.toggle("is-on", visible);
      if (visible) punto.setAttribute("aria-current", "true");
      else punto.removeAttribute("aria-current");
    });
  }

  function parar() {
    if (!reloj) return;
    clearInterval(reloj);
    reloj = null;
  }

  function arrancar() {
    if (quieto || reloj || fotos.length < 2) return;
    reloj = setInterval(function () { mostrar(actual + 1); }, 5000);
  }

  raiz.querySelector("[data-prev]").addEventListener("click", function () {
    parar();
    mostrar(actual - 1);
    arrancar();
  });

  raiz.querySelector("[data-next]").addEventListener("click", function () {
    parar();
    mostrar(actual + 1);
    arrancar();
  });

  puntos.forEach(function (punto, i) {
    punto.addEventListener("click", function () {
      parar();
      mostrar(i);
      arrancar();
    });
  });

  raiz.addEventListener("mouseenter", parar);
  raiz.addEventListener("mouseleave", arrancar);
  raiz.addEventListener("focusin", parar);
  raiz.addEventListener("focusout", function (ev) {
    if (!raiz.contains(ev.relatedTarget)) arrancar();
  });

  mostrar(0);
  arrancar();
})();
