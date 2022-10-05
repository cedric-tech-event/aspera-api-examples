const yaml = require('js-yaml');
const fs   = require('fs');
console.log("config="+JSON.stringify(yaml.load(fs.readFileSync(process.argv[2], 'utf8')))+";");
