const fs = require('fs');
const glob = require('glob');
const YAML = require('yaml-js');
const extendify = require('extendify');

glob("./**/*.yaml", function (er, files) {
  const contents = files.map(f => {
    return YAML.load(fs.readFileSync(f).toString());
  });
  const extend = extendify({
    inPlace: false,
    isDeep: true
  });
  const merged = contents.reduce(extend);
  // console.log(merged)
  console.log("Generating swagger.json");
//   fs.existsSync("/home/sanjay/apps/swagger-yaml-master") || fs.mkdirSync("/home/sanjay/apps/swagger-yaml-master");
  // fs.writeFile("/home/sanjay/apps/swagger-yaml-master/swagger.yaml", YAML.dump(merged));
  fs.writeFile("api-doc-dist/swagger.json", JSON.stringify(merged, null, 2), (err)=>{
    if (err) throw err;
    console.log('The file has been saved!');
  });
});