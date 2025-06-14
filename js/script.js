// js/script.js

// lista de itens
let items = [
  "BALA","BOLA","CASA","PIRULITO","VACA","BOCA",
  "DADO","ELEFANTE","ESCOLA","AMARELO","IGREJA",
  "OVO","URSO","UVA","AMORA","GATO","LUA",
  "CEBOLA","SAPO","FADA"
];

// traduções
const translations = {
  BALA: "CANDY", BOLA: "BALL", CASA: "HOUSE", PIRULITO: "LOLLIPOP",
  VACA: "COW", BOCA: "MOUTH", DADO: "DICE", ELEFANTE: "ELEPHANT",
  ESCOLA: "SCHOOL", AMARELO: "YELLOW", IGREJA: "CHURCH", OVO: "EGG",
  URSO: "BEAR", UVA: "GRAPE", AMORA: "BLACKBERRY", GATO: "CAT",
  LUA: "MOON", CEBOLA: "ONION", SAPO: "FROG", FADA: "FAIRY"
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
  // referências DOM
  const bgMusic      = document.getElementById("bgMusic");
  const wheelEl      = document.getElementById("wheelContainer");
  const canvas       = document.getElementById("canvas");
  const ctx          = canvas.getContext("2d");
  const spinBtn      = document.getElementById("spinBtn");
  const resultBox    = document.getElementById("resultBox");
  const translationBox = document.getElementById("translationBox");
  const resImg       = document.getElementById("resultImage");
  const resTxt       = document.getElementById("resultText");
  const transImg     = document.getElementById("translationImage");
  const transTxt     = document.getElementById("translationText");

  canvas.width  = canvas.height = 700;
  const W  = 700, H = 700, cx = W/2, cy = H/2;

  let highlightIndex = null;

  // desenha a roda
  function drawWheel() {
    const num      = items.length;
    const anglePer = 2 * Math.PI / num;
    const radius   = Math.min(cx, cy) - 20;
    ctx.clearRect(0, 0, W, H);

    items.forEach((item, i) => {
      const start = i * anglePer - Math.PI/2;
      const mid   = start + anglePer/2;
      const sz    = 70;

      // cor de destaque se for o escolhido
      if (i === highlightIndex) {
        ctx.fillStyle   = "#ffeb3b";
        ctx.strokeStyle = "#f57f17";
        ctx.lineWidth   = 4;
      } else {
        ctx.fillStyle   = i % 2 ? "#ffffff" : "#f0f0f0";
        ctx.strokeStyle = "#333";
        ctx.lineWidth   = 1;
      }

      // desenha fatia
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + anglePer);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // desenha imagem
      const ix = cx + Math.cos(mid) * (radius * 0.6) - sz/2;
      const iy = cy + Math.sin(mid) * (radius * 0.6) - sz/2;
      ctx.drawImage(images[item], ix, iy, sz, sz);

      // desenha texto
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.fillStyle = "#000";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item, radius * 0.85, 0);
      ctx.restore();
    });
  }

  drawWheel();

  spinBtn.addEventListener("click", () => {
    // toca música de fundo na primeira interação
    if (bgMusic.paused) bgMusic.play().catch(() => {});

    if (items.length === 0) {
      alert("Todos os itens já foram escolhidos!");
      return;
    }

    // ripple no botão
    gsap.fromTo(spinBtn,
      { scale: 1 },
      { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }
    );

    // limpa destaque e caixinhas
    highlightIndex = null;
    drawWheel();
    resImg.src = ""; resTxt.textContent = "";
    transImg.src = ""; transTxt.textContent = "";

    // prepara giro
    gsap.killTweensOf(wheelEl);
    gsap.set(wheelEl, { rotation: 0 });
    const spins = gsap.utils.random(3, 6);
    const extra = gsap.utils.random(0, 360);
    const final = spins * 360 + extra;

    // anima giro
    gsap.to(wheelEl, {
      rotation: final,
      duration: 5,
      ease: "power3.out",
      onComplete() {
        // calcula o índice do item
        const angle = (final % 360 + 360) % 360;
        const idx   = Math.floor((items.length - (angle / 360) * items.length)) % items.length;
        const chosen = items[idx];

        // destaca fatia
        highlightIndex = idx;
        drawWheel();

        // bounce na roda
        gsap.fromTo(wheelEl,
          { scale: 1 },
          { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: "bounce.out" }
        );

        // estoura confetes
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.3 } });

        // mostra caixinhas com animação
        gsap.fromTo([resultBox, translationBox],
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1 }
        );

        // preenche conteúdo
        resImg.src       = `img/${chosen.toLowerCase()}.png`;
        resTxt.textContent   = chosen;
        transImg.src     = `img/${chosen.toLowerCase()}.png`;
        transTxt.textContent = translations[chosen];

        // remove item após 5s
        setTimeout(() => {
          items.splice(idx, 1);
          highlightIndex = null;
          drawWheel();
        }, 5000);
      }
    });
  });
}
