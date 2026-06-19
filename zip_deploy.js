const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'medvastr-prod-FINAL-SOLID.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 }
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Successfully created medvastr-prod-FINAL-SOLID.zip with forward slashes.');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

const sourceDir = path.join(__dirname, 'deploy_fixed');

function addDirectory(dir, zipPath) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        const entryName = zipPath ? zipPath + '/' + file : file;

        if (stat.isDirectory()) {
            addDirectory(fullPath, entryName);
        } else {
            archive.file(fullPath, { name: entryName });
        }
    }
}

addDirectory(sourceDir, '');
archive.finalize();
