const { spawn } = require('child_process');

function runCustomCommand(command) {
    return new Promise((resolve, reject) => {
        var resultStr = "";

        const child = spawn(command, [], { shell: true });
        child.stdout.on('data', (data) => {
            resultStr += data.toString("utf-8");
        });

        child.stderr.on('data', (data) => {
            resultStr += data;
        });

        child.on('close', (code) => {
            resultStr = resultStr.replace(/�/g, 'ue');
            resolve(resultStr);
        });
    });
}

module.exports = {
    runCustomCommand
};