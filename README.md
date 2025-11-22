
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Vẽ đồ thị đa thức bậc 1–5</title>
    <style>
      :root{--bg:#0f1724;--card:#0b1220;--accent:#60a5fa;--muted:#9ca3af;--grid:rgba(255,255,255,0.08);--axis:rgba(255,255,255,0.8);--tick:rgba(255,255,255,0.9)}
      *{box-sizing:border-box;font-family:Inter, system-ui, Arial}
      body{margin:0;background:linear-gradient(135deg,#091426,#0f1c2e);color:#e6eef8;display:flex;flex-direction:column;min-height:100vh}
      .container{max-width:1000px;margin:32px auto;padding:28px;background:var(--card);border-radius:16px;box-shadow:0 0 25px #0008;backdrop-filter:blur(6px)}
      h2{text-align:center;margin-top:0;font-size:28px;color:#90c8ff;text-shadow:0 0 12px #60a5fa55}

      label{font-size:13px;color:var(--muted)}
      input,select{padding:6px 8px;border-radius:6px;border:1px solid #333;background:#0f1724;color:#e6eef8}
      input{width:70px;text-align:center;font-family:'Times New Roman','Cambria Math',serif;font-size:16px}

      button{padding:10px 16px;border:none;border-radius:8px;background:var(--accent);cursor:pointer;color:#000;font-weight:600;transition:0.2s}
      button.secondary{background:#444;color:#fff}
      button:hover{filter:brightness(1.12);transform:translateY(-1px)}
      canvas{width:100%;height:850px;border-radius:10px;background:rgba(255,255,255,0.01);margin-top:18px;box-shadow:0 0 15px #0006}
      #coeffs{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:18px;margin-top:12px;padding:10px 0}
      .coeff-box{display:flex;align-items:center;gap:4px}
      .controls{display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap}
      .controls .group{display:flex;align-items:center;gap:6px}
      /* light theme overrides (applied dynamically) */
      .light body, .light :root{}
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Vẽ đồ thị đa thức</h2>
      <label>Chọn bậc đa thức:</label>
      <select id="degree">
        <option value="1">Bậc 1</option>
        <option value="2">Bậc 2</option>
        <option value="3">Bậc 3</option>
        <option value="4">Bậc 4</option>
        <option value="5">Bậc 5</option>
      </select>
      <div id="coeffs"></div>
      <div class="controls">
        <div class="group">
          <label>Cận trái</label><input id="xmin" type="number" value="-10">
          <label>Cận phải</label><input id="xmax" type="number" value="10">
          <label>Cận dưới</label><input id="ymin" type="number" value="-100">
          <label>Cận trên</label><input id="ymax" type="number" value="100">
          <label>Kích thước</label><input id="scale" type="number" value="40">
        </div>
        <div class="group">
          <label>Màu</label><input type='color' id='color' value='#60a5fa'>
          <button id="draw">Vẽ</button>
          <button id="theme" class="secondary">Đổi nền</button>
        </div>
      </div>
      <canvas id="plot"></canvas>
    </div>
    <script>
    const coeffContainer = document.getElementById("coeffs");
    const degreeSelect = document.getElementById("degree");
    function renderCoeffInputs(){
      const deg = parseInt(degreeSelect.value);
      let html = `<div style="display:flex;align-items:center;flex-wrap:wrap;gap:10px"><span>y = </span>`;
      for(let i = deg; i >= 0; i--){
        html += `<div class='coeff-box'><input id='a${i}' value='0' type='number' step='any'>`;
        if(i > 1) html += `<label>x<sup>${i}</sup></label>`;
        else if(i === 1) html += `<label>x</label>`;
        html += `</div>`;
        if(i !== 0) html += `<span> + </span>`;
      }
      html += `</div>`;
      coeffContainer.innerHTML = html;
    }
    renderCoeffInputs();
    degreeSelect.addEventListener('change', renderCoeffInputs);
    const canvas = document.getElementById('plot');
    const ctx = canvas.getContext('2d');
    let themeIsDark = true;
    function setTheme(dark){
      const r = document.documentElement;
      if(dark){
        r.style.setProperty('--bg','#0f1724');
        r.style.setProperty('--card','#0b1220');
        r.style.setProperty('--axis','rgba(255,255,255,0.8)');
        r.style.setProperty('--tick','rgba(255,255,255,0.95)');
        r.style.setProperty('--grid','rgba(255,255,255,0.06)');
        document.body.style.background = 'linear-gradient(135deg,#091426,#0f1c2e)';
        document.querySelectorAll('input,select').forEach(el=>{el.style.background='#0f1724';el.style.color='#e6eef8'});
      } else {
        r.style.setProperty('--bg','#ffffff');
        r.style.setProperty('--card','#f6f7fb');
        r.style.setProperty('--axis','rgba(0,0,0,0.8)');
        r.style.setProperty('--tick','rgba(0,0,0,0.9)');
        r.style.setProperty('--grid','rgba(0,0,0,0.06)');
        document.body.style.background = '#ffffff';
        document.querySelectorAll('input,select').forEach(el=>{el.style.background='#ffffff';el.style.color='#111'});
      }
      themeIsDark = dark;
      document.querySelector('.container').style.background = dark ? 'var(--card)' : '#ffffff';
      document.querySelector('.container').style.color = dark ? '#e6eef8' : '#0b1220';
    }
    setTheme(true);
    function resize(){
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(300, rect.width * dpr);
      canvas.height = Math.max(200, rect.height * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw();
    }
    window.addEventListener('resize', resize);
    function worldToScreen(x,y,opts){
      const {scale,width,height,xmin,xmax,ymin,ymax} = opts;
      const cx = width/2;
      const cy = height/2;
      return [cx + x*scale, cy - y*scale];
    }
    function drawAxes(opts){
      const {scale,width,height,xmin,xmax,ymin,ymax} = opts;
      const css = getComputedStyle(document.documentElement);
      const gridColor = css.getPropertyValue('--grid').trim() || 'rgba(0,0,0,0.06)';
      const axisColor = css.getPropertyValue('--axis').trim() || 'rgba(0,0,0,0.8)';
      const tickColor = css.getPropertyValue('--tick').trim() || 'rgba(0,0,0,0.9)';

      // grid lines (vertical & horizontal at integer values) - light, subtle
      ctx.save();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // vertical lines
      const startX = Math.ceil(xmin);
      const endX = Math.floor(xmax);
      for(let x = startX; x <= endX; x++){
        const [sx] = worldToScreen(x,0,opts);
        ctx.moveTo(sx,0); ctx.lineTo(sx,height);
      }
      const startY = Math.ceil(ymin);
      const endY = Math.floor(ymax);
      for(let y = startY; y <= endY; y++){
        const [,sy] = worldToScreen(0,y,opts);
        ctx.moveTo(0,sy); ctx.lineTo(width,sy);
      }
      ctx.stroke();
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const [x0,y0] = worldToScreen(0,0,opts);
      ctx.moveTo(0,y0); ctx.lineTo(width,y0);
      ctx.moveTo(x0,0); ctx.lineTo(x0,height);
      ctx.stroke();
      ctx.font = 'bold 14px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = tickColor;
      ctx.strokeStyle = 'transparent';
      for(let x = startX; x <= endX; x++){
        const [sx,sy] = worldToScreen(x,0,opts);
        ctx.beginPath();
        ctx.moveTo(sx, sy-6); ctx.lineTo(sx, sy+6);
        ctx.strokeStyle = tickColor; ctx.lineWidth = 2; ctx.stroke();
        if(x !== 0){
          const txt = String(x);
          const tw = ctx.measureText(txt).width;
          ctx.fillStyle = themeIsDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';
          ctx.fillRect(sx - tw/2 - 6, sy + 8, tw + 12, 18);
          ctx.fillStyle = themeIsDark ? '#fff' : '#000';
          ctx.fillText(txt, sx, sy + 11);
        }
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      for(let y = startY; y <= endY; y++){
        const [sx,sy] = worldToScreen(0,y,opts);
        ctx.beginPath();
        ctx.moveTo(sx-6, sy); ctx.lineTo(sx+6, sy);
        ctx.strokeStyle = tickColor; ctx.lineWidth = 2; ctx.stroke();
        if(y !== 0){
          const txt = String(y);
          const tw = ctx.measureText(txt).width;
          ctx.fillStyle = themeIsDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.75)';
          ctx.fillRect(sx + 10, sy - 10, tw + 12, 20);
          ctx.fillStyle = themeIsDark ? '#fff' : '#000';
          ctx.fillText(txt, sx + 16, sy);
        }
      }
      ctx.restore();
    }
    function draw(){
      const xmin = parseFloat(document.getElementById('xmin').value) || -10;
      const xmax = parseFloat(document.getElementById('xmax').value) || 10;
      const ymin = parseFloat(document.getElementById('ymin').value) || -100;
      const ymax = parseFloat(document.getElementById('ymax').value) || 100;
      const scale = parseFloat(document.getElementById('scale').value) || 40;
      const color = document.getElementById('color').value || '#60a5fa';
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0,0,width,height);
      const opts = {scale,width,height,xmin,xmax,ymin,ymax};
      drawAxes(opts);
      const deg = parseInt(degreeSelect.value) || 1;
      const a = [];
      for(let i=0;i<=deg;i++) a[i] = parseFloat(document.getElementById(`a${i}`).value) || 0;
      function poly(x){
        let s = 0;
        for(let i = deg; i >= 0; i--) s = s * x + a[i];
        return s;
      }
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      const samples = Math.max(200, Math.round((xmax - xmin) * 60));
      let first = true;
      for(let i=0;i<=samples;i++){
        const t = i / samples;
        const x = xmin + t * (xmax - xmin);
        const y = poly(x);
        const [sx,sy] = worldToScreen(x,y,opts);
        if(first){ ctx.moveTo(sx,sy); first=false; }
        else ctx.lineTo(sx,sy);
      }
      ctx.stroke();
    }
    document.getElementById('draw').addEventListener('click', draw);
    window.addEventListener('load', resize);
    window.addEventListener('orientationchange', resize);
    document.getElementById('theme').addEventListener('click', ()=>{
      setTheme(!themeIsDark);
      draw();
    });
    setTimeout(()=>{ resize(); }, 50);
    </script>
  </body>
</html>
