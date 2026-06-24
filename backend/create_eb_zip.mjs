import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const output = fs.createWriteStream(path.join(__dirname, 'medvastr-prod-final.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 }
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archive has been finalized.');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

archive.file('target/backend-0.0.1-SNAPSHOT.jar', { name: 'application.jar' });
archive.file('Procfile', { name: 'Procfile' });

console.log("Staging .ebextensions and .platform for AWS...");
if (fs.existsSync('.ebextensions')) {
    archive.directory('.ebextensions/', '.ebextensions');
}
if (fs.existsSync('.platform')) {
    archive.directory('.platform/', '.platform');
}

archive.finalize();
