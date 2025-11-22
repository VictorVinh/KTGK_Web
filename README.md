# KTGK_Web
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Vẽ đồ thị đa thức bậc 1-5</title>
  <style>
    :root{--bg:#0f1724;--card:#0b1220;--accent:#60a5fa;--muted:#9ca3af}
    *{box-sizing:border-box;font-family:Inter, system-ui, Arial}
    body{margin:0;background:#071025;color:#e6eef8;display:flex;flex-direction:column;min-height:100vh}
    .container{max-width:1000px;margin:24px auto;padding:18px;background:var(--card);border-radius:12px}
    label{font-size:12px;color:var(--muted)}
    input{padding:6px;border-radius:6px;border:1px solid #333;background:transparent;color:#e6eef8;width:70px;text-align:center;font-family:'Times New Roman', 'Cambria Math', serif;font-size:16px}
    select{padding:6px;border-radius:6px;background:transparent;color:#e6eef8}
    button{padding:8px 12px;border:none;border-radius:8px;background:var(--accent);cursor:pointer}
    canvas{width:100%;height:750px;border-radius:8px;background:rgba(255,255,255,0.03)}
    #coeffs{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:18px;margin-top:12px}
    .coeff-box{display:flex;align-items:center;gap:4px}
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

  <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
    <label>xmin</label><input id="xmin" type="number" value="-10">
    <label>xmax</label><input id="xmax" type="number" value="10">
    <label>ymin</label><input id="ymin" type="number" value="-100">
    <label>ymax</label><input id="ymax" type="number" value="100">
    <label>scale</label><input id="scale" type="number" value="100">
    <label>màu</label><input type='color' id='color' value='#60a5fa'>
    <button id="draw">Vẽ</button>
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
    html += `<div class='coeff-box'><input id='a${i}' value='0'>`;
    if(i > 1) html += `<label>x<sup>${i}</sup></label>`;
    else if(i === 1) html += `<label>x</label>`;
    // x^0 thì bỏ label
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
function resize(){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  draw();
}
window.addEventListener('resize', resize);
function worldToScreen(x,y,opts){
  const {scale,width,height} = opts;
  const sx = width/2 + x*scale;
  const sy = height/2 - y*scale;
  return [sx,sy];
}

function drawAxes(opts){
  const {scale,width,height} = opts;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  for(let x=-width; x<=width; x+=50) ctx.rect(x,0,0,height);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.moveTo(0,height/2); ctx.lineTo(width,height/2);
  ctx.moveTo(width/2,0); ctx.lineTo(width/2,height);
  ctx.stroke();
}
function draw(){
  const xmin = parseFloat(document.getElementById('xmin').value);
  const xmax = parseFloat(document.getElementById('xmax').value);
  const ymin = parseFloat(document.getElementById('ymin').value);
  const ymax = parseFloat(document.getElementById('ymax').value);
  const scale = parseFloat(document.getElementById('scale').value);
  const samples = Math.round((xmax - xmin) * 100);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0,0,width,height);
  drawAxes({scale,width,height});
  const deg = parseInt(degreeSelect.value);
  const a = [];
  for(let i=0;i<=deg;i++){ a[i] = parseFloat(document.getElementById(`a${i}`).value)||0; }

  function poly(x){
    let s = 0;
    for(let i=deg;i>=0;i--) s = s*x + a[i];
    return s;
  }

  ctx.beginPath();
  ctx.strokeStyle = document.getElementById('color').value;
  let first = true;
  for(let i=0;i<=samples;i++){
    let t = i/samples;
    let x = xmin + t*(xmax-xmin);
    let y = poly(x);
    const [sx,sy] = worldToScreen(x,y,{scale,width,height});
    if(first){ ctx.moveTo(sx,sy); first=false;} else ctx.lineTo(sx,sy);
  }
  ctx.stroke();
}

document.getElementById('draw').addEventListener('click', draw);
resize();
</script>

</body>
</html>
