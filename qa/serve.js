// tiny static server for the repo root, ephemeral port
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const MIME={'.html':'text/html','.png':'image/png','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.wav':'audio/wav'};
function serve(){
  return new Promise(res=>{
    const srv=http.createServer((req,rsp)=>{
      const p=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html');
      if(!p.startsWith(ROOT)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){rsp.writeHead(404);rsp.end();return;}
      rsp.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0,'127.0.0.1',()=>res({port:srv.address().port,close:()=>srv.close()}));
  });
}
module.exports={serve};
