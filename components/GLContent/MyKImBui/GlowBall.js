/*
  Original Digital ART WORK by My Kim Bui
  Translated and Rewriteen by Wong Lok
*/
import { Mesh, SphereGeometry, Object3D, TextureLoader } from 'three'
import * as GlowBallShader from './GlowBallShader'
import { AdditiveBlending, DoubleSide } from 'three/build/three.module'
import { Noise } from 'noisejs'
import SpriteText from 'three-spritetext'

export const makeScene = async ({ o3d, clean = () => {}, camera, loop }) => {
  const matcapTexLoader = new TextureLoader()
  matcapTexLoader.setCrossOrigin('')
  // resources
  const matcapTexture = matcapTexLoader.load(require('./matcaps/matcap2.jpg'))
  const matcaptopTexture = matcapTexLoader.load(require('./matcaps/matcap-top.png'))
  const sphereGeo = new SphereGeometry(12, 64, 64);

  const group = new Object3D()

  let reg = new Map()

  let makeFirstBall = () => {
    let material = GlowBallShader.makeMatCapCustom({ matcap: matcapTexture })
    const sphere = new Mesh(sphereGeo, material)
    sphereGeo.radius = 12
    reg.set('s1', sphereGeo)
    return sphere
  }

  let makeSecondBall = () => {
    const topmaterial = GlowBallShader.makeMatCapCustom({ matcap: matcaptopTexture });
    let bigger = sphereGeo.clone()
    bigger.scale(1.1, 1.1, 1.1)
    bigger.radius = 12 * 1.1
    reg.set('s2', bigger)

    const topsphere = new Mesh(bigger, topmaterial);
    loop(() => {
      topmaterial.uniforms.time.value = performance.now() * 0.0001
    })
    topsphere.material.side = DoubleSide;
    topsphere.material.blending = AdditiveBlending

    return topsphere
  }

  let makeGlowMesh = () => {
    let mat = GlowBallShader.makeMatGlowCustom({ camera })
    let geometry = sphereGeo.clone()
    geometry.scale(1.21, 1.21, 1.21)
    geometry.radius = 12 * 1.21
    reg.set('s3', geometry)

    var glowMesh = new Mesh(geometry, mat)

    return glowMesh
  }



  let k = 3;
  let a = 0;
  let g = 2;
  var noise = new Noise(Math.random());
  const update = function() {
    const time = performance.now() * 0.001;
    let sphereGeo = reg.get('s1')
    let topsphereGeo = reg.get('s2')
    if (!sphereGeo) {
      return
    }
    if (!topsphereGeo) {
      return
    }
    // for (let i = 0; i < sphereGeo.vertices.length; i++) {
    //   let p = sphereGeo.vertices[i];
    //   let d = topsphereGeo.vertices[i];
    //   p.normalize().multiplyScalar(
    //     sphereGeo.radius * 1 + sphereGeo.radius * 0.05 * noise.perlin3(p.x * k + time, p.y * k, p.z * k)
    //   );
    //   d.normalize().multiplyScalar(
    //     topsphereGeo.radius * 0.1 * 1.15 + a + topsphereGeo.radius * 0.1 * 0.08 * noise.perlin3(p.x * g + time, p.y * g, p.z * g)
    //   );
    // }

    // sphereGeo.computeVertexNormals();
    // sphereGeo.normalsNeedUpdate = true;
    // sphereGeo.verticesNeedUpdate = true;

    // topsphereGeo.computeVertexNormals();
    // topsphereGeo.normalsNeedUpdate = true;
    // topsphereGeo.verticesNeedUpdate = true;

    if (reg.has('b1')) {
      reg.get('b1').rotation.y += 0.01;
    }
    if (reg.has('b2')) {
      reg.get('b2').rotation.y += 0.03;
    }
  };
  let run = true
  loop(() => {
    if (!run) {
      return
    }
    update()
  })

  let makeAuthorText = () => {
    var myText = new SpriteText('Glow Ball by My Kim Bui')
    // myText.material.blending = AdditiveBlending
    myText.material.transparent = true
    myText.material.opacity = .5
    myText.position.y = 24
    myText.textHeight = 2.5
    myText.color = 'black'
    myText.backgroundColor = 'white'
    myText.padding = '3'

    return myText
  }

  let setup = () => {
    let firstBall0 = makeFirstBall()
    reg.set('b1', firstBall0)
    group.add(firstBall0)

    let seocndBall0 = makeSecondBall()
    reg.set('b2', seocndBall0)
    group.add(seocndBall0)

    let thirdBall0 = makeGlowMesh()
    reg.set('b3', thirdBall0)
    group.add(thirdBall0)

    let spriteTextAuthor = makeAuthorText()
    group.add(spriteTextAuthor)

    // group.position.y += 25

    o3d.add(group)
    clean(() => {
      run = false
      o3d.remove(group)
    })
  }

  setup()
}