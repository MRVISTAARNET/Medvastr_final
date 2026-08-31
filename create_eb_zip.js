const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

const zipPath = path.join(__dirname, 'medvastr-backend-eb.zip');
const backendDir = path.join(__dirname, 'backend');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
  console.log(`Successfully created ${zipPath} (${archive.pointer()} total bytes)`);
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

// 1. Add application.jar
const jarPath = path.join(backendDir, 'target', 'backend-0.0.1-SNAPSHOT.jar');
archive.file(jarPath, { name: 'application.jar' });

// 2. Add Procfile
const procPath = path.join(backendDir, 'Procfile');
archive.file(procPath, { name: 'Procfile' });

// 3. Add .ebextensions directory recursively with forward slashes
const ebDir = path.join(backendDir, '.ebextensions');
if (fs.existsSync(ebDir)) {
  const files = fs.readdirSync(ebDir);
  files.forEach(file => {
    const fullP = path.join(ebDir, file);
    archive.file(fullP, { name: `.ebextensions/${file}` });
  });
}

archive.finalize();
