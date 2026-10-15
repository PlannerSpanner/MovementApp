// Cross-platform launcher for tools/gen_cues.py: `npm run cues` runs through cmd.exe on
// Windows, which cannot execute a forward-slash relative path like
// tools/tts-venv/Scripts/python, so the script step used to fail there (2026-10-12).
// Resolves the venv interpreter for either layout and forwards all arguments.
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const cands=[path.join(ROOT,'tools','tts-venv','Scripts','python.exe'),
             path.join(ROOT,'tools','tts-venv','bin','python')];
const py=cands.find(f=>fs.existsSync(f));
if(!py){console.error('tools/tts-venv not found — create it: py -m venv tools/tts-venv && tools/tts-venv/Scripts/pip install kokoro-onnx soundfile lameenc numpy');process.exit(1);}
const r=spawnSync(py,[path.join(__dirname,'gen_cues.py'),...process.argv.slice(2)],{stdio:'inherit'});
process.exit(r.status==null?1:r.status);
