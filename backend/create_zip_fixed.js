const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'medvastr-prod-final.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archive has been finalized successfully using Node archiver.');
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);

archive.file('target/backend-0.0.1-SNAPSHOT.jar', { name: 'application.jar' });
archive.file('Procfile', { name: 'Procfile' });
archive.directory('.ebextensions/', '.ebextensions');
archive.directory('.platform/', '.platform');

archive.finalize();
