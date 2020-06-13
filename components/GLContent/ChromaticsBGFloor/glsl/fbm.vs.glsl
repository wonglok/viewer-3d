precision mediump float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform highp float time;
uniform lowp vec2 sceneRect;

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float noise( in vec2 p ) {
	return sin(p.x)*sin(p.y);
}

float fbm4( vec2 p )
{
    float f = 0.0;
    f += 0.5000 * noise( p ); p = m * p * 2.02;
    f += 0.2500 * noise( p ); p = m * p * 2.03;
    f += 0.1250 * noise( p ); p = m * p * 2.01;
    f += 0.0625 * noise( p );
    return f / 0.9375;
}

float fbm6( vec2 p )
{
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
  float vout = fbm4( p - time + fbm6( p + fbm4( p - time )) );
  return abs(vout);
}

varying vec2 vUv;
void main (void) {
  vUv = uv;

	vec2 pt = vUv.xy;
  pt.y = pt.y * (sceneRect.y / sceneRect.x);
  pt.xy = pt.xy * 10.5;

	float levitation = pattern(pt.xy + cos(time));

  // vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	// vec2 scale;
	// scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	// scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	// // #ifndef USE_SIZEATTENUATION
	// // 	bool isPerspective = isPerspectiveMatrix( projectionMatrix );
	// // 	if ( isPerspective ) scale *= - mvPosition.z;
	// // #endif
  // float rotation = 0.0;
  // vec2 center = vec2(0.0, 0.0);
	// vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	// vec2 rotatedPosition;
	// rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	// rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	// mvPosition.xy += rotatedPosition;
  // // mvPosition.z += mvPosition.z;
	// gl_Position = projectionMatrix * mvPosition;

	vec3 nPos = position;
	nPos.z = levitation * 80.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}
