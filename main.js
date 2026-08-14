(function () {
  "use strict";

  var manifest = window.PORTFOLIO_MANIFEST || {};

  var SECTIONS = [
    { key: "overview", gridId: "grid-work", countId: "work-count" },
    { key: "animation", gridId: "grid-animation", countId: "animation-count" },
    { key: "games", gridId: "grid-games", countId: "games-count" },
    { key: "illustration", gridId: "grid-illustration", countId: "illustration-count" },
    { key: "matte_painting", gridId: "grid-matte", countId: "matte-count" }
  ];

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxIndex = document.getElementById("lightbox-index");

  var allItems = [];
  var isOpen = false;
  var pos = 0;

  function renderGrid(items, offset, gridId, countId) {
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var fragment = document.createDocumentFragment();
    items.forEach(function (item, index) {
      var globalIndex = offset + index;
      var figure = document.createElement("figure");
      figure.className = "item";

      var link = document.createElement("a");
      link.className = "thumb";
      link.href = "#";

      var img = document.createElement("img");
      img.src = item.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      link.appendChild(img);

      link.addEventListener("click", function (e) {
        e.preventDefault();
        openLightbox(globalIndex);
      });

      figure.appendChild(link);
      fragment.appendChild(figure);
    });

    grid.appendChild(fragment);

    var countEl = document.getElementById(countId);
    if (countEl) countEl.textContent = String(items.length).padStart(2, "0");
  }

  function build() {
    var offset = 0;
    SECTIONS.forEach(function (section) {
      var data = manifest[section.key];
      var items = data && data.items ? data.items : [];
      allItems = allItems.concat(items);
      renderGrid(items, offset, section.gridId, section.countId);
      offset += items.length;
    });
  }

  function openLightbox(index) {
    if (!allItems.length) return;
    pos = index;
    showImage();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    isOpen = true;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    isOpen = false;
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }

  function showImage() {
    var item = allItems[pos];
    lightboxImg.src = item.src;
    lightboxImg.alt = "";
    lightboxIndex.textContent =
      String(pos + 1).padStart(2, "0") + " / " + String(allItems.length).padStart(2, "0");
  }

  function step(dir) {
    if (!isOpen) return;
    pos = (pos + dir + allItems.length) % allItems.length;
    showImage();
  }

  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", function () { step(-1); });
  document.getElementById("lightbox-next").addEventListener("click", function () { step(1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  build();
})();
