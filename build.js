const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function execute(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            if (stdout) resolve(stdout);
            resolve(stderr);
        });
    });
}

// type: dev prod prod-min
function setTsConfig(type) {
    let filePath = 'config/tsconfig-dev.json';
    if (type === 'prod') {
        filePath = 'config/tsconfig-prod.json';
    } else if (type === 'prod-min') {
        filePath = 'config/tsconfig-prod-min.json';
    }
    const tsConfig = fs.readFileSync(path.resolve(__dirname, filePath));
    fs.writeFileSync(path.resolve(__dirname, 'tsconfig.json'), tsConfig);
}

function buildProd() {
    setTsConfig('prod');
    return execute('npm run build:umd');
}

function buildProdMin() {
    setTsConfig('prod');
    return execute('npm run build:min');
}

function main() {
    buildProd().then((result1) => {
        console.log('result1: ', result1);
        return buildProdMin();
    }).then((result2) => {
        console.log('result2: ', result2);
    }).then(() => {
        return execute('cp package.json dist/package.json')
    }).catch(error => {
        console.error(error);
    }).finally(() => {
        setTsConfig('dev');
    })
}

main();
