// js/script.js

let items = [
  "BALA","BOLA","CASA","PIRULITO","VACA","BOCA",
  "DADO","ELEFANTE","ESCOLA","AMARELO","IGREJA",
  "OVO","URSO","UVA","AMORA","GATO","LUA",
  "CEBOLA","SAPO","FADA"
];

const translations = {
  BALA: "CANDY",      BOLA: "BALL",      CASA: "HOUSE",
  PIRULITO: "LOLLIPOP", VACA: "COW",     BOCA: "MOUTH",
  DADO: "DICE",       ELEFANTE: "ELEPHANT", ESCOLA: "SCHOOL",
  AMARELO: "YELLOW",  IGREJA: "CHURCH",  OVO: "EGG",
  URSO: "BEAR",       UVA: "GRAPE",      AMORA: "BLACKBERRY",
  GATO: "CAT",        LUA: "MOON",       CEBOLA: "ONION",
  SAPO: "FROG",       FADA: "FAIRY"
};

// pré-carrega imagens de img/<nome minusculo>.png
const images = {};
Promise.all(items.map(name =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { images[name] = img; res(); };
    img.onerror = () => rej(`Erro carregando img/${name.toLowerCase()}.png`);
    img.src = `img/${name.toLowerCase()}.png`;
  }))
).then(init).catch(console.error);

function init() {
  const bgMusic  = document.getElementById("bgMusic");
  const canvas   = document.getElementById("canvas"),
        ctx      = canvas.getContext("2d");
  canvas.width = canvas.height = 700;
  const W = 700, H = 700, cx = W/2, cy = H/2;

  const wheelEl   = document.getElementById("wheelContainer"),
        spinBtn   = document.getElementById("spinBtn"),
        resImg    = document.getElementById("resultImage"),
        resTxt    = document.getElementById("resultText"),
        transImg  = document.getElementById("translationImage"),
        transTxt  = document.getElementById("translationText");

  let highlightIndex = null;

  function drawWheel() {
    const num      = items.length,
          anglePer = 2 * Math.PI / num,
          radius   = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, W, H);
    items.forEach((item, i) => {
      const start = i * anglePer - Math.PI/2,
            mid   = start + anglePer/2,
            sz    = 70;

      if (i === highlightIndex) {
        ctx.fillStyle   = "#ffeb3b";
        ctx.strokeStyle = "#f57f17";
        ctx.lineWidth   = 4;
      } else {
        ctx.fillStyle   = i%2 ? "#ffffff" : "#f0f0f0";
        ctx.strokeStyle = "#333";
        ctx.lineWidth   = 1;
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + anglePer);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // desenha a imagem (usando lowercase)
      const ix = cx + Math.cos(mid)*(radius*0.6) - sz/2,
            iy = cy + Math.sin(mid)*(radius*0.6) - sz/2;
      ctx.drawImage(images[item], ix, iy, sz, sz);

      // texto
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item, radius*0.85, 0);
      ctx.restore();
    });
  }

  drawWheel();

  spinBtn.addEventListener("click", () => {
    if (bgMusic.paused) bgMusic.play().catch(() => {});
    if (items.length === 0) {
      alert("Todos os itens já foram escolhidos!");
      return;
    }

    highlightIndex = null;
    drawWheel();
    resImg.src = ""; resTxt.textContent = "";
    transImg.src = ""; transTxt.textContent = "";

    gsap.killTweensOf(wheelEl);
    gsap.set(wheelEl, { rotation: 0 });

    const spins = gsap.utils.random(3,6),
          extra = gsap.utils.random(0,360),
          final = spins*360 + extra;

    gsap.to(wheelEl, {
      rotation: final,
      duration: 5,
      ease: "power3.out",
      onComplete() {
        const angle = (final % 360 + 360) % 360,
              idx   = Math.floor((items.length - (angle/360)*items.length)) % items.length,
              chosen = items[idx];

        highlightIndex = idx;
        drawWheel();

        // mostra resultados com lowercase
        resImg.src    = `img/${chosen.toLowerCase()}.png`;
        resTxt.textContent = chosen;
        transImg.src  = `img/${chosen.toLowerCase()}.png`;
        transTxt.textContent = translations[chosen];

        setTimeout(() => {
          items.splice(idx,1);
          highlightIndex = null;
          drawWheel();
        }, 5000);
      }
    });
  });
}
