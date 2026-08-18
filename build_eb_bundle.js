const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const zipPath = path.join(root, 'medvastr-backend-eb.zip');
const jarSrc = path.join(root, 'backend', 'target', 'backend-0.0.1-SNAPSHOT.jar');
const procfileSrc = path.join(root, 'backend', 'Procfile');
const stageDir = path.join(root, '_eb_stage');

console.log('Staging deployment files...');
if (fs.existsSync(stageDir)) {
  fs.rmSync(stageDir, { recursive: true, force: true });
}
fs.mkdirSync(stageDir, { recursive: true });

fs.copyFileSync(jarSrc, path.join(stageDir, 'application.jar'));
fs.copyFileSync(procfileSrc, path.join(stageDir, 'Procfile'));

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log('Zipping into Elastic Beanstalk package...');
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory('${stageDir.replace(/\\/g, '\\\\')}', '${zipPath.replace(/\\/g, '\\\\')}')
`;
const psPath = path.join(root, 'temp_zip.ps1');
fs.writeFileSync(psPath, psScript, 'utf8');

execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });
fs.unlinkSync(psPath);
fs.rmSync(stageDir, { recursive: true, force: true });

const sizeMB = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
console.log(`SUCCESS! Created: ${zipPath} (${sizeMB} MB)`);
