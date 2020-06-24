
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
import { Tree } from '../../Reusable'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { ShaderMaterial, BackSide, SmoothShading, SphereGeometry, Mesh, AdditiveBlending, Color } from 'three'
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

      let geo = new SphereGeometry(12, 128, 64)
      let mat = new ShaderMaterial({
        side: BackSide,
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

          // Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
          // :)
          // by David Hoskins.

          // Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07


          // Redefine below to see the tiling...
          //#define SHOW_TILING

          #define TAU 6.28318530718
          #define MAX_ITER 35

          vec4 waterwaves(in vec3 dyeColor,  in vec2 fragCoord, in vec2 iResolution, in float iTime)
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
              colour = clamp(colour * vec3(dyeColor), 0.0, 1.0);


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
            vec2 uv = iNormal.xy;
            vec3 grad = vec3(
              1.0 - pattern(uv * 5.5 + -0.25 * cos(time * 0.1)),
              1.0 - pattern(uv * 5.5 + 0.0 * cos(time * 0.1)),
              1.0 - pattern(uv * 5.5 + 0.25 * cos(time * 0.1))
            );

            vec4 water = waterwaves(grad * grad, vec2(iNormal.zz * 3.0), vec2(1.0), time * 1.0);
            gl_FragColor = vec4(water.rgb, 1.0);
          }
        `
      })

      // let makeAuthorText = () => {
      //   var myText = new SpriteText('Chrome Ball by Wong Lok')
      //   // myText.material.blending = AdditiveBlending
      //   myText.material.transparent = true
      //   myText.material.opacity = .5
      //   myText.position.y = 24
      //   myText.textHeight = 2.5
      //   myText.color = 'black'
      //   myText.backgroundColor = 'white'
      //   myText.padding = '3'
      //   myText.position.y = 24
      //   return myText
      // }
      // mesh.add(makeAuthorText())

      let mesh = new Mesh(geo, mat)

      // mesh.rotation.y = Math.PI * 0.5

      this.lookup('base').onLoop(() => {
        mat.uniforms.time.value = performance.now() * 0.001
        mesh.rotation.z += 0.01
        // mesh.rotation.y += 0.01
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
</style>
