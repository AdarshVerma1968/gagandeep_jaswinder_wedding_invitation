const entryScreen = document.getElementById('entryScreen');
const envelope = document.getElementById('envelope');
const tapEnter = document.getElementById('tapEnter');
const siteContent = document.getElementById('siteContent');
const backgroundMusic = document.getElementById('backgroundMusic');
let isOpening = false;
function openInvitation(){
  if(isOpening) return;
  isOpening = true;
  backgroundMusic.currentTime = 20;
  backgroundMusic.play().catch((error) => {
    console.error('Unable to start the invitation music:', error);
  });
  envelope.classList.add('open');
  tapEnter.textContent = '✦  OPENING YOUR INVITATION  ✦';
  window.setTimeout(() => {
    entryScreen.classList.add('dismissed');
    siteContent.classList.add('visible');
    siteContent.setAttribute('aria-hidden','false');
    document.body.style.overflowY = 'auto';
    paintScratchSurface();
    startPetals();
    revealOnScroll();
  }, 950);
}
tapEnter.addEventListener('click', openInvitation);
envelope.addEventListener('click', openInvitation);
envelope.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){e.preventDefault();openInvitation();} });
document.body.style.overflowY = 'hidden';

function startPetals(){
  const layer = document.getElementById('petals');
  if(layer.dataset.started) return;
  layer.dataset.started = 'true';
  const symbols = ['✿','❀','❁','·'];
  for(let i=0;i<22;i++){
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = symbols[Math.floor(Math.random()*symbols.length)];
    petal.style.left = `${Math.random()*100}%`;
    petal.style.fontSize = `${10+Math.random()*12}px`;
    petal.style.animationDuration = `${10+Math.random()*13}s`;
    petal.style.animationDelay = `${Math.random()*-18}s`;
    petal.style.setProperty('--drift', `${Math.random()*150-75}px`);
    layer.appendChild(petal);
  }
}

// Scroll reveal, with a fallback for browsers without IntersectionObserver.
function revealOnScroll(){
  const elements = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){elements.forEach(el=>el.classList.add('in'));return;}
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}});
  },{threshold:.12});
  elements.forEach(el=>observer.observe(el));
}

// Scratch card: mouse and touch friendly; reveals the date after enough of the coating is cleared.
const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d', {willReadFrequently:true});
let scratching = false;
let scratchedAway = false;
function paintScratchSurface(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width*dpr);
  canvas.height = Math.round(rect.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const gradient = ctx.createLinearGradient(0,0,rect.width,rect.height);
  gradient.addColorStop(0,'#76233a'); gradient.addColorStop(.5,'#9b5360'); gradient.addColorStop(1,'#5b1425');
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=gradient;ctx.fillRect(0,0,rect.width,rect.height);
  ctx.strokeStyle='rgba(232,207,156,.65)';ctx.lineWidth=1;
  ctx.strokeRect(8,8,rect.width-16,rect.height-16);
  ctx.fillStyle='#fff2d8';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`${Math.max(14,Math.min(20,rect.width/25))}px Marcellus, serif`;
  ctx.fillText('A SPECIAL DAY IS WAITING',rect.width/2,rect.height/2-10);
  ctx.font=`${Math.max(10,Math.min(13,rect.width/38))}px Marcellus, serif`;
  ctx.fillText('RUB GENTLY TO REVEAL',rect.width/2,rect.height/2+19);
  ctx.globalCompositeOperation='source-over';
}
function scratchAt(event){
  if(!scratching || scratchedAway) return;
  const rect=canvas.getBoundingClientRect();
  const point=event.touches ? event.touches[0] : event;
  const x=point.clientX-rect.left, y=point.clientY-rect.top;
  const dpr=Math.max(1,window.devicePixelRatio||1);
  ctx.globalCompositeOperation='destination-out';
  ctx.beginPath();ctx.arc(x,y,22,0,Math.PI*2);ctx.fill();
  ctx.globalCompositeOperation='source-over';
  checkScratchProgress();
}
function checkScratchProgress(){
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let clear=0;const stride=32;
  for(let i=3;i<pixels.length;i+=4*stride){if(pixels[i]===0)clear++;}
  if(clear/(pixels.length/(4*stride))>.2){
    scratchedAway=true;canvas.style.transition='opacity .45s';canvas.style.opacity='0';
    document.getElementById('scratchHint').style.opacity='0';
    window.setTimeout(()=>{canvas.style.display='none';},500);
  }
}
canvas.addEventListener('pointerdown',(e)=>{if(scratchedAway)return;scratching=true;canvas.setPointerCapture?.(e.pointerId);scratchAt(e);});
canvas.addEventListener('pointermove',scratchAt);
window.addEventListener('pointerup',()=>{scratching=false;});
window.addEventListener('resize',()=>{if(!scratchedAway)paintScratchSurface();});

// Countdown to the first celebration date, using local device time.
function updateCountdown(){
  const weddingDate = new Date('2026-11-02T09:00:00+05:30').getTime();
  let diff = weddingDate - Date.now();
  if(diff < 0) diff = 0;
  const days = Math.floor(diff/(1000*60*60*24));
  const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  const minutes = Math.floor((diff%(1000*60*60))/(1000*60));
  const seconds = Math.floor((diff%(1000*60))/1000);
  document.getElementById('days').textContent=String(days).padStart(2,'0');
  document.getElementById('hours').textContent=String(hours).padStart(2,'0');
  document.getElementById('minutes').textContent=String(minutes).padStart(2,'0');
  document.getElementById('seconds').textContent=String(seconds).padStart(2,'0');
}
updateCountdown();setInterval(updateCountdown,1000);
