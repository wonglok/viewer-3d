
var path = require('path')
let exporter = {
  O3D: require('~/components/Reusable/O3D').default
}

async function importAll (r, type) {
  r.keys().forEach(key => {
    let filename = path.basename(key).replace('.vue', '')
    exporter[filename] = () => new Promise((resolve) => {
      if (type === 'sync') {
        resolve(r(key).default)
      } else if (type === 'lazy') {
        r(key).then((mod) => {
          resolve(mod.default)
        })
      }
    })
  })
  return exporter
}

// importAll(require.context('~/components/Pages', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('~/components/Reusable', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('~/components/GLUnits', true, /\.vue$/, 'sync'), 'sync')

importAll(require.context('~/components/GLScene', true, /\.vue$/, 'sync'), 'sync')
importAll(require.context('~/components/GLContent', true, /\.vue$/, 'lazy'), 'lazy')

export default exporter
