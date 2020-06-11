
var path = require('path')
let exporter = {
}

async function importAll (r, type) {
  r.keys().forEach(key => {
    let filename = path.basename(key).replace('.fbx', '')
    exporter[filename] = r(key)
  })
  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('file-loader!~/components/GLContent/Swat/breakdance', true, /\.fbx$/, 'sync'), 'sync')

export default exporter
