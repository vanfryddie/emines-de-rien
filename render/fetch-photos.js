const fs=require('fs'),path=require('path');
const IDS=["b935ccd7-a16b-4cee-ac62-8571fe492caf.jpeg","3b0a4dce-0020-4d9d-bcb8-5f814d890350.jpeg","126e3835-983b-4541-907f-941077563b6e.jpeg","69481004-3ade-4bf6-8682-8360aada0628.jpeg","78c726e4-969c-4294-b9ce-2a0286965bc3.jpeg","9459d23c-ccf2-4dd2-9321-5410d288eb41.jpeg","580c1a12-449a-406f-831a-15a4fdb18e73.jpeg","08b09558-365d-4fc6-badc-6fc0bd988ace.jpeg","43d9f24f-237c-4d6f-9b45-148506386324.jpeg","aa8f1b20-a3ef-465e-9334-46e3e2410a08.jpeg","7febd008-2c74-4f87-9ee3-7538d67aefc3.jpeg","55a5789a-8307-45ac-bf7a-8ffc05a1f5b5.jpeg","30a4e18a-c3c3-4769-a293-7ce2e392606a.jpeg","daefa328-4677-47ee-8de7-3639c4ca42a6.jpeg","3fa3f7ee-39f1-4b67-a293-a3fb278034e6.jpeg","290f87d9-fce8-41b2-b6eb-810ca6b64cb6.jpeg","c10a5e6c-770a-495b-9dd7-96dc61ff06c5.jpeg","b0a9efcd-b613-471d-ada7-b8ee902f593f.jpeg","e13fe626-5d8d-4a09-b1af-c78280b9b166.jpeg","07cae113-fdfa-4fa3-a6d8-025394d8c3d8.jpeg","fc2aae71-4e46-4839-9069-57bcf2681027.jpeg","2e9ddbcc-b843-46ed-915e-6889ab4b3587.jpeg","83bc2032-88e2-4300-b53c-d3956fe04178.png"];
const BASE='https://a0.muscache.com/im/pictures/hosting/Hosting-1760036187402135513/original/';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let ok=0;
  for(let n=0;n<IDS.length;n++){
    const id=IDS[n];
    const out=path.join('render/photos',String(n).padStart(2,'0')+'-'+id);
    // resumable: a previous run's file is kept
    if(fs.existsSync(out)&&fs.statSync(out).size>20000){ok++;continue;}
    let done=false;
    for(let a=1;a<=4&&!done;a++){
      try{
        const r=await fetch(BASE+id+'?im_w=1920',
          {headers:{'User-Agent':UA,'Referer':'https://www.airbnb.com/'}});
        if(!r.ok){console.log('HTTP',r.status,id);await sleep(900);continue;}
        const b=Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(out,b);
        console.log(String(n).padStart(2,'0'),(b.length/1024).toFixed(0)+'kb');
        ok++;done=true;
      }catch(e){
        console.log('retry',a,id,e.cause?e.cause.code:e.message);
        await sleep(700*a);
      }
    }
    if(!done)console.log('GAVE UP',id);
    await sleep(250);
  }
  console.log('have',ok,'of',IDS.length);
})();
