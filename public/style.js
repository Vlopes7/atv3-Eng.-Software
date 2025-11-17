window.onload = function () {
  const canvas = document.getElementById("chuva");
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const gotas = [];

  for (let i = 0; i < 200; i++) {
    gotas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: Math.random() * 15 + 10,
      speed: Math.random() * 2 + 1,
    });
  }

  function desenharChuva() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#c9b6e4"; 
    ctx.lineWidth = 1;

    for (let g of gotas) {
      ctx.beginPath();
      ctx.moveTo(g.x, g.y);
      ctx.lineTo(g.x, g.y + g.length);
      ctx.stroke();

      g.y += g.speed;
      if (g.y > canvas.height) {
        g.y = -g.length;
        g.x = Math.random() * canvas.width;
      }
    }

    requestAnimationFrame(desenharChuva);
  }

  desenharChuva();
  window.addEventListener("resize", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});

}