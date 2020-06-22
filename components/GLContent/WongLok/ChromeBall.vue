
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ShaderMaterial, DoubleSide, SmoothShading, SphereGeometry, Mesh, AdditiveBlending, Color } from 'three'
import SpriteText from 'three-spritetext'

export default {
  name: 'ChromeBall',
  mixins: [Tree],
  props: {
  },
  components: {
    ...require('../../webgl')
  },
  data () {
    return {
      cleaners: []
    }
  },
  beforeDestroy () {
    this.o3d.children.forEach((item) => {
      this.o3d.remove(item)
    })
    if (this.cleaners.lenght > 0) {
      try {
        this.cleaners.forEach(e => e())
      } catch (e) {
        console.log(e)
      }
    }
  },
  methods: {
    async loadStuff () {
      let clean = this.clean = (cb = () => {}) => {
        this.cleaners.push(cb)
      }

      let geo = new SphereGeometry(12, 32, 32)

      let mat = new ShaderMaterial({
        uniforms: {
          customColor: {
            value: new Color('rgb(0, 217, 255)')
          },
          time: {
            value: 0
          }
        },
        transparent: true,
        vertexShader: `
          varying vec2 vUv;
          varying vec3 iNormal;
          void main (void) {
            vUv = uv;
            iNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          #include <common>
          uniform vec2 resolution;
          uniform float time;
          varying vec2 vUv;
          varying vec3 iNormal;

          const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

          float noise( in vec2 p ) {
            return sin(p.x)*sin(p.y);
          }

          float fbm4( vec2 p ) {
              float f = 0.0;
              f += 0.5000 * noise( p ); p = m * p * 2.02;
              f += 0.2500 * noise( p ); p = m * p * 2.03;
              f += 0.1250 * noise( p ); p = m * p * 2.01;
              f += 0.0625 * noise( p );
              return f / 0.9375;
          }

          float fbm6( vec2 p ) {
              float f = 0.0;
              f += 0.500000*(0.5+0.5*noise( p )); p = m*p*2.02;
              f += 0.250000*(0.5+0.5*noise( p )); p = m*p*2.03;
              f += 0.125000*(0.5+0.5*noise( p )); p = m*p*2.01;
              f += 0.062500*(0.5+0.5*noise( p )); p = m*p*2.04;
              f += 0.031250*(0.5+0.5*noise( p )); p = m*p*2.01;
              f += 0.015625*(0.5+0.5*noise( p ));
              return f/0.96875;
          }

          float pattern (vec2 p) {
            float vout = fbm4( p + time + fbm6(  p + fbm4( p + time )) );
            return abs(vout);
          }

          void main (void) {
            vec2 uv = iNormal.xy;
            gl_FragColor = vec4(vec3(
              1.0 - pattern(uv * 2.5 + -0.15 * cos(time * 0.1)),
              1.0 - pattern(uv * 2.5 + 0.0 * cos(time * 0.1)),
              1.0 - pattern(uv * 2.5 + 0.15 * cos(time * 0.1))
            ), 1.0);
          }
        `
      })
      let makeAuthorText = () => {
        var myText = new SpriteText('Chrome Ball by Wong Lok')
        // myText.material.blending = AdditiveBlending
        myText.material.transparent = true
        myText.material.opacity = .5
        myText.position.y = 24
        myText.textHeight = 2.5
        myText.color = 'black'
        myText.backgroundColor = 'white'
        myText.padding = '3'

        myText.position.y = 24
        return myText
      }


      let mesh = new Mesh(geo, mat)

      mesh.add(makeAuthorText())

      this.lookup('base').onLoop(() => {
        mat.uniforms.time.value = performance.now() * 0.001
        mesh.rotation.y += 0.001
      })
      this.o3d.add(mesh)
    }
  },
  async mounted () {
    await this.loadStuff()
  }
}
</script>

<style scoped>

a {
  /* color: rgb(0, 217, 255); */
}

</style>
