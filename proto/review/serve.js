// Serves ONLY the built /review folder on the LAN (0.0.0.0), no caching, so the
// assessment can be read and the loops watched on the phone.   node proto/review/serve.js [port]
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..','..','review'),PORT=+process.argv[2]||8377;
// Read-only except POST /export-skin, which writes review/skin-export.json (tuning page).
const MIME={'.json':'application/json','.html':'text/html; charset=utf-8','.png':'image/png','.js':'text/javascript','.css':'text/css'};
http.createServer((req,rsp)=>{
  // the one write: the skin tuning page's Export button. JSON only, 20 KB cap, fixed file name.
  if(req.method==='POST'&&req.url.split('?')[0].replace(/^\/+/,'')==='export-skin'){
    let body='';req.on('data',c=>{body+=c;if(body.length>20000)req.destroy();});
    req.on('end',()=>{try{const j=JSON.parse(body);if(!j||typeof j.skin!=='object')throw 0;
        fs.writeFileSync(path.join(ROOT,'skin-export.json'),JSON.stringify(j,null,1)+'\n');
        console.log('skin export saved '+new Date().toISOString());rsp.writeHead(200,{'Content-Type':'application/json'});rsp.end('{"ok":true}');}
      catch(e){rsp.writeHead(400);rsp.end('bad json');}});
    return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){rsp.writeHead(405);rsp.end();return;}
  const url0=req.url.split('?')[0],rel=decodeURIComponent(url0).replace(/^\/+/,'')||'index.html';let p=path.resolve(ROOT,rel);
  // a folder serves its index.html; without the trailing slash, redirect so relative links resolve
  if((p===ROOT||p.startsWith(ROOT+path.sep))&&fs.existsSync(p)&&fs.statSync(p).isDirectory()){
    if(!url0.endsWith('/')){rsp.writeHead(302,{Location:url0+'/'});rsp.end();return;}
    p=path.join(p,'index.html');}
  if(!(p===ROOT||p.startsWith(ROOT+path.sep))||!fs.existsSync(p)||fs.statSync(p).isDirectory()){rsp.writeHead(404);rsp.end('not found');return;}
  rsp.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(p).pipe(rsp);
}).listen(PORT,'0.0.0.0',()=>{
  const ips=Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
  console.log('review page:');ips.forEach(ip=>console.log('  http://'+ip+':'+PORT+'/'));console.log('  http://127.0.0.1:'+PORT+'/  (this machine)');
});
