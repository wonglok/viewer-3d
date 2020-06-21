import { ShaderMaterial, DoubleSide, SmoothShading } from 'three'
import { Color, BackSide, AdditiveBlending } from 'three/build/three.module';

let glsl = v => v[0]
export const makeMatCapCustom = ({ matcap }) => {
  const material = new ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    uniforms: {
      time: { value: 0 },
      tMatCap: { type: 't', value: matcap },
      uOpacity: 0.1
    },
    vertexShader: glsl`
        uniform float time;
        varying vec2 vN;

        float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
        vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

        float noise(vec3 p){
            vec3 a = floor(p);
            vec3 d = p - a;
            d = d * d * (3.0 - 2.0 * d);

            vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
            vec4 k1 = perm(b.xyxy);
            vec4 k2 = perm(k1.xyxy + b.zzww);

            vec4 c = k2 + a.zzzz;
            vec4 k3 = perm(c);
            vec4 k4 = perm(c + 1.0);

            vec4 o1 = fract(k3 * (1.0 / 41.0));
            vec4 o2 = fract(k4 * (1.0 / 41.0));

            vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
            vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

            return o4.y * d.y + o4.x * (1.0 - d.y);
        }

        void main() {

          vec4 p = vec4( position, 1. );

          vec3 np = normalize(p.xyz);

          float k = 3.0;
          float a = 0.0;
          float g = 2.0;
          float rr = 1.2;

          np *= (rr + rr * 0.05) * noise(vec3(
            p.x * k + time,
            p.y * k,
            p.z * k
          ));

          p.xyz += np.xyz;

          vec3 newNormal = normalize(p.xyz);
          // p.xyz = np.xyz;

          vec3 e = normalize( vec3( modelViewMatrix * p ) );
          vec3 n = normalize( normalMatrix * newNormal );

          vec3 r = reflect( e, n );
          float m = 2. * sqrt(
            pow( r.x, 2. ) +
            pow( r.y, 2. ) +
            pow( r.z + 1., 2. )
          );
          vN = r.xy / m + .5;



          gl_Position = projectionMatrix * modelViewMatrix * p;
        }
    `,
    fragmentShader: glsl`
      uniform sampler2D tMatCap;

      varying vec2 vN;

      void main() {
        vec3 base = texture2D( tMatCap, vN ).rgb;
        gl_FragColor = vec4( base, 1. );
      }
    `,
    flatShading: SmoothShading
  });

  // object.geometry.computeVertexNormals(true);

  return material
}


export const makeMatGlowCustom = ({ camera }) => {
  const material = new ShaderMaterial({
    uniforms: {
      c: { type: "f", value: 0.3 },
      p: { type: "f", value: 1.3 },
      glowColor: { type: "c", value: new Color(0xba00c2) },
      viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: glsl`
      uniform vec3 viewVector;
      uniform float c;
      uniform float p;
      varying float intensity;
      void main()
      {
          vec3 vNormal = normalize( normalMatrix * normal );
        vec3 vNormel = normalize( normalMatrix * viewVector );
        intensity = pow( c - dot(vNormal, vNormel), p );

          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: glsl`
      uniform vec3 glowColor;
      varying float intensity;
      void main()
      {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
      }
    `,
    side: BackSide,
    blending: AdditiveBlending,
    transparent: true
  });

  // object.geometry.computeVertexNormals(true);

  return material
}
