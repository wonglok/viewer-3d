
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
  name: 'WaterBall',
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
          iTime: {
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
          varying vec2 vUv;
          varying vec3 iNormal;
          uniform float iTime;
          uniform vec3 customColor;

          // Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
          // :)
          // by David Hoskins.

          // Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07


          // Redefine below to see the tiling...
          //#define SHOW_TILING

          #define TAU 6.28318530718
          #define MAX_ITER 35

          vec4 waterwaves( in vec2 fragCoord, in vec2 iResolution, in float iTime)
          {
            float time = iTime * .5+23.0;
              // uv should be the 0-1 uv of texture...
            vec2 uv = fragCoord.xy / iResolution.xy;

          #ifdef SHOW_TILING
            vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
          #else
              vec2 p = mod(uv*TAU, TAU)-250.0;
          #endif
            vec2 i = vec2(p);
            float c = 1.0;
            float inten = .005;

            for (int n = 0; n < MAX_ITER; n++)
            {
              float t = time * (1.0 - (3.5 / float(n+1)));
              i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
              c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
            }
            c /= float(MAX_ITER);
            c = 1.17-pow(c, 1.4);
            vec3 colour = vec3(pow(abs(c), 25.0));
              colour = clamp(colour + vec3(0.0, 0.0, 0.0), 0.0, 1.0);


            #ifdef SHOW_TILING
            // Flash tile borders...
            vec2 pixel = 2.0 / iResolution.xy;
            uv *= 2.0;

            float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
            vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
            uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
            colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line

            #endif
            return vec4(colour, 1.0);
          }
          void main (void) {

            vec4 water = waterwaves((iNormal.xy + iNormal.zz), vec2(3.0), iTime * 10.0);

            gl_FragColor =  vec4(water.xyz * customColor, 1.0);
          }
        `
      })

      let makeAuthorText = () => {
        var myText = new SpriteText('Water Ball by Wong Lok')
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
        mat.uniforms.iTime.value = performance.now() * 0.0001
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
