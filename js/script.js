// js/script.js

let items = [
  "BALA","BOLA","CASA","PIRULITO","VACA","BOCA",
  "DADO","ELEFANTE","ESCOLA","AMARELO","IGREJA",
  "OVO","URSO","UVA","AMORA","GATO","LUA",
  "CEBOLA","SAPO","FADA"
];

const translations = {
  BALA: "CANDY", BOLA: "BALL", CASA: "HOUSE", PIRULITO: "LOLLIPOP",
  VACA: "COW", BOCA: "MOUTH", DADO: "DICE", ELEFANTE: "ELEPHANT",
  ESCOLA: "SCHOOL", AMARELO: "YELLOW", IGREJA: "CHURCH", OVO: "EGG",
  URSO: "BEAR", UVA: "GRAPE", AMORA: "BLACKBERRY", GATO: "CAT",
  LUA: "MOON", CEBOLA: "ONION", SAPO: "FROG", FADA: "FAIRY"
];

// pré-carrega todas as imagens de img/<ITEM>.png
const images = {};
Promise.all(items.map(name =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { images[name] = img; res(); };
    img.onerror = () => rej(`Erro carregando img/${name}.png`);
    img.src = `img/${name}.png`;        // <--- aqui
  }))
).then(init).catch(console.error);

function init() {
  const bgMusic    = document.getElementById("bgMusic");
  const canvas     = document.getElementById("canvas"),
        ctx        = canvas.getContext("2d");
  canvas.width = canvas.height = 700;
  const W    = 700, H = 700, cx = W/2, cy = H/2;

  const wheelEl    = document.getElementById("wheelContainer"),
        spinBtn    = document.getElementById("spinBtn"),
        resImg     = document.getElementById("resultImage"),
        resTxt     = document.getElementById("resultText"),
        transImg   = document.getElementById("translationImage"),
        transTxt   = document.getElementById("translationText");

  let highlightIndex = null;

  function drawWheel() {
    const num      = items.length,
          anglePer = 2 * Math.PI / num,
          radius   = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, W, H);
    items.forEach((item, i) => {
      const start = i * anglePer - Math.PI/2,
            mid   = start + anglePer/2,
            imgSz = 70;

      // destaque em amarelo
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

      // desenha a imagem
      const ix = cx + Math.cos(mid)*(radius*0.6) - imgSz/2,
            iy = cy + Math.sin(mid)*(radius*0.6) - imgSz/2;
      ctx.drawImage(images[item], ix, iy, imgSz, imgSz);

      // desenha o texto
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
    if (items.length === 0) {
      alert("Todos os itens já foram escolhidos!");
      return;
    }

    // toca música de fundo no primeiro clique
    if (bgMusic.paused) bgMusic.play().catch(() => {});

    // limpa estado
    highlightIndex = null;
    drawWheel();
    resImg.src = ""; resTxt.textContent = "";
    transImg.src = ""; transTxt.textContent = "";

    // reseta rotação
    gsap.killTweensOf(wheelEl);
    gsap.set(wheelEl, { rotation: 0 });

    // gira a roda
    const spins = gsap.utils.random(3,6),
          extra = gsap.utils.random(0,360),
          final = spins*360 + extra;

    gsap.to(wheelEl, {
      rotation: final,
      duration: 5,
      ease: "power3.out",
      onComplete() {
        // calcula índice do escolhido
        const angle = (final % 360 + 360) % 360,
              idx   = Math.floor((items.length - (angle/360)*items.length)) % items.length,
              chosen = items[idx];

        // destaca fatia
        highlightIndex = idx;
        drawWheel();

        // mostra imagem e texto, incluindo pasta img/
        resImg.src     = `img/${chosen}.png`;    // <--- aqui também
        resTxt.textContent = chosen;
        transImg.src   = `img/${chosen}.png`;    // <--- e aqui
        transTxt.textContent = translations[chosen];

        // remove o item após 5s e redesenha
        setTimeout(() => {
          items.splice(idx,1);
          highlightIndex = null;
          drawWheel();
        }, 5000);
      }
    });
  });
}
