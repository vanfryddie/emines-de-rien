const http=require('http'),fs=require('fs'),path=require('path'),url=require('url');
const ROOT=path.join(__dirname,'..','site');
const T={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(url.parse(req.url).pathname);
  if(p.endsWith('/'))p+='index.html';
  const f=path.join(ROOT,path.normalize(p).replace(/^(\.\.[\/])+/,''));
  if(!f.startsWith(ROOT)){res.writeHead(403).end();return;}
  fs.stat(f,(e,st)=>{
    if(e||!st.isFile()){res.writeHead(404,{'Content-Type':'text/plain'}).end('404');return;}
    const ext=path.extname(f).toLowerCase();
    const range=req.headers.range;
    const head={'Content-Type':T[ext]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    if(range&&/^bytes=/.test(range)){
      const m=range.replace('bytes=','').split('-');
      const s=parseInt(m[0],10)||0, en=m[1]?parseInt(m[1],10):st.size-1;
      res.writeHead(206,{...head,'Content-Range':`bytes ${s}-${en}/${st.size}`,'Content-Length':en-s+1});
      fs.createReadStream(f,{start:s,end:en}).pipe(res);
    }else{
      res.writeHead(200,{...head,'Content-Length':st.size});
      fs.createReadStream(f).pipe(res);
    }
  });
}).listen(4321,'127.0.0.1',()=>console.log('serving site on http://localhost:4321'));
