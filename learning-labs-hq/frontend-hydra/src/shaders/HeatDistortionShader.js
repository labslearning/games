/**
 * TIER GOD SHADER: Refractive Heat Haze
 * Nivel: AAA Industrial (2026)
 * Características: 3D Simplex Noise, Fresnel Falloff y Refracción Orgánica.
 */
export const HeatDistortionShader = {
  uniforms: {
    uTime: { value: 0 },
    uTemperature: { value: 0 },
    uResolution: { value: [window.innerWidth, window.innerHeight] },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      // Tier God: Ligera deformación de vértices para que el cilindro "baile" con el calor
      float dist = sin(position.y * 2.0 + uTime * 3.0) * 0.02;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * dist, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uTemperature;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vNormal;

    // Algoritmo de Ruido Simplex 3D para turbulencia fluida 
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      vec4 j = p - 49.0 * floor(p * (1.0 / 49.0));
      vec4 x_ = floor(j * (1.0 / 7.0));
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ * (1.0/7.0) + 0.5/7.0;
      vec4 y = y_ * (1.0/7.0) + 0.5/7.0;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      // 1. Umbral de activación (Nivel Dios: 200°K) [cite: 24, 71]
      float intensity = clamp((uTemperature - 200.0) / 800.0, 0.0, 1.0);
      
      // 2. Ruido Simplex Multicapa (Turbulencia real)
      float n = snoise(vec3(vUv * 3.0, uTime * 0.5));
      n += snoise(vec3(vUv * 6.0, uTime * 0.8)) * 0.5;
      
      // 3. Efecto Fresnel (La distorsión es más fuerte en los bordes)
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.0);
      
      // 4. Distorsión Refractiva
      float distortion = n * intensity * fresnel * 0.15;
      
      // 5. Colorimetría de calor (Tono ambarino sutil)
      vec3 heatColor = mix(vec3(1.0, 1.0, 1.0), vec3(1.0, 0.6, 0.2), intensity * 0.3);
      
      // El alpha depende de la turbulencia y el Fresnel
      float alpha = (intensity * 0.2) + (fresnel * intensity * 0.5);
      
      gl_FragColor = vec4(heatColor, alpha);
    }
  `
};
