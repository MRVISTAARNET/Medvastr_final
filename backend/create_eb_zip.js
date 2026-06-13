const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'medvastr-prod-final.zip'));
const archive = archiver.create('zip', {
    zlib: { level: 9 } // Highest compression
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archive has been finalized and the output file descriptor has closed.');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// Add the application JAR file at the root level securely
archive.file('target/backend-0.0.1-SNAPSHOT.jar', { name: 'application.jar' });
archive.file('Procfile', { name: 'Procfile' });

console.log("Staging .ebextensions and .platform for AWS...");
archive.directory('.ebextensions/', '.ebextensions');
archive.directory('.platform/', '.platform');

archive.finalize();
