'use strict';
// OG card + icons, built from the hosts' own wordmark and photography.
const fs=require('fs'),path=require('path');
const {createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
GlobalFonts.registerFromPath(path.join(__dirname,'InstrumentSans.ttf'),'InstrumentSans');
const OUT=path.join(__dirname,'..','site','assets');
const img=(n)=>path.join(OUT,'img',n);

(async()=>{
  const W=1200,H=630;
  const c=createCanvas(W,H); const x=c.getContext('2d');
  const photo=await loadImage(img('p00-1600.jpg'));
  // cover-fit
  const s=Math.max(W/photo.width,H/photo.height);
  x.drawImage(photo,(W-photo.width*s)/2,(H-photo.height*s)/2,photo.width*s,photo.height*s);

  // Darken so the gold mark reads at thumbnail size.
  const g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'rgba(6,6,12,.62)');
  g.addColorStop(.55,'rgba(6,6,12,.52)');
  g.addColorStop(1,'rgba(6,6,12,.88)');
  x.fillStyle=g; x.fillRect(0,0,W,H);

  const wm=await loadImage(img('wordmark.png'));
  const ww=660, wh=wm.height*(ww/wm.width);
  x.drawImage(wm,(W-ww)/2,H*0.36-wh/2,ww,wh);

  x.textAlign='center';
  x.fillStyle='rgba(244,239,230,.92)';
  x.font='400 30px InstrumentSans';
  x.fillText('A mirror-clad tiny house for two — La Bruyère, Belgium',W/2,H*0.68);

  x.fillStyle='rgba(226,178,106,.95)';
  x.font='500 25px InstrumentSans';
  // star as a path: neither face carries U+2605
  const sx=W/2-132,sy=H*0.78-8,sr=11;
  x.beginPath();
  for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const r=i%2?sr*0.44:sr;
    x[i?'lineTo':'moveTo'](sx+Math.cos(a)*r,sy+Math.sin(a)*r);}
  x.closePath();x.fill();
  x.textAlign='left';
  x.fillText('5.0 from 6 guest reviews',sx+20,H*0.78);

  fs.writeFileSync(path.join(OUT,'og.jpg'),c.encodeSync('jpeg',86));
  console.log('og.jpg');

  // Icons: the wordmark's initial on a dark plate, in the house's gold.
  for(const size of [512,180,32]){
    const ic=createCanvas(size,size); const k=ic.getContext('2d');
    const u=(v)=>v*size;
    k.fillStyle='#0b0b12';
    k.beginPath(); k.roundRect(0,0,size,size,u(0.22)); k.fill();
    // mirror volume + reflection, in gold
    k.fillStyle='#e2b26a';
    k.fillRect(u(0.155),u(0.315),u(0.69),u(0.05));
    k.fillRect(u(0.20),u(0.365),u(0.60),u(0.255));
    k.fillStyle='#c658eb';
    k.fillRect(u(0.595),u(0.425),u(0.145),u(0.14));
    k.save(); k.globalAlpha=.30; k.fillStyle='#e2b26a';
    k.fillRect(u(0.20),u(0.645),u(0.60),u(0.175));
    k.globalAlpha=.45; k.fillStyle='#c658eb';
    k.fillRect(u(0.595),u(0.70),u(0.145),u(0.095));
    k.restore();
    k.fillStyle='rgba(226,178,106,.55)';
    k.fillRect(u(0.10),u(0.626),u(0.80),u(0.014));
    fs.writeFileSync(path.join(OUT,`icon-${size}.png`),ic.encodeSync('png'));
  }
  console.log('icons');
})();
