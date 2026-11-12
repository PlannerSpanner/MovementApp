// Serves ONLY the built /review folder on the LAN (0.0.0.0), read-only, no caching, so the
// assessment can be read and the loops watched on the phone.   node proto/review/serve.js [port]
const http=require('http'),fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..','..','review'),PORT=+process.argv[2]||8377;
const MIME={'.html':'text/html; charset=utf-8','.png':'image/png','.js':'text/javascript','.css':'text/css'};
http.createServer((req,rsp)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){rsp.writeHead(405);rsp.end();return;}
  const rel=decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'')||'index.html',p=path.resolve(ROOT,rel);
  if(!(p===ROOT||p.startsWith(ROOT+path.sep))||!fs.existsSync(p)||fs.statSync(p).isDirectory()){rsp.writeHead(404);rsp.end('not found');return;}
  rsp.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});
  fs.createReadStream(p).pipe(rsp);
}).listen(PORT,'0.0.0.0',()=>{
  const ips=Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
  console.log('review page:');ips.forEach(ip=>console.log('  http://'+ip+':'+PORT+'/'));console.log('  http://127.0.0.1:'+PORT+'/  (this machine)');
});
