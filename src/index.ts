import { ssam } from "ssam";
import type { Sketch, WebGLProps, SketchSettings } from "ssam";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import vert from "./shaders/vert.glsl";
import frag from "./shaders/frag.glsl";

const sketch = ({ wrap, canvas, width, height, pixelRatio }: WebGLProps) => {
  if (import.meta.hot) {
    import.meta.hot.dispose(() => wrap.dispose());
    import.meta.hot.accept(() => wrap.hotReload());
  }

  let target = new THREE.Vector2(0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 1);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 0, 0);
  camera.lookAt(0, 0, -100);

  // const controls = new OrbitControls(camera, renderer.domElement);

  const stats = new Stats();
  // document.body.appendChild(stats.dom);

  const scene = new THREE.Scene();

  const geometry = new THREE.PlaneGeometry(2, 2);

  const getMaterial = (level: Number) => {
    let material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0.0 },
        uLevel: { value: level },
      },
      vertexShader: vert,
      fragmentShader: frag,
    })

    return material;
  }

  let number = 120;
  let meshes = [];
  let materials: THREE.ShaderMaterial[] = [];
  for(let i = 0; i < number; i++) {
    let material = getMaterial(i / 30);
    materials.push(material);

    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.z = -i * 0.2;
    meshes.push(mesh);
  }


  wrap.render = ({ playhead }: WebGLProps) => {
    playhead = (Date.now() / 10000) % 1;
    camera.position.z = - playhead * 6;

    materials.forEach((material, i) => {
      material.uniforms["time"].value = playhead;
    });

    target.lerp(new THREE.Vector2(window.screenLeft, window.screenTop), 0.9);

    camera.setViewOffset(
      window.screen.width,
      window.screen.height,
      target.x,
      target.y,
      window.innerWidth,
      window.innerHeight
    )

    // controls.update();
    stats.update();
    renderer.render(scene, camera);
  };

  wrap.resize = ({ width, height }: WebGLProps) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  wrap.unload = () => {
    renderer.dispose();
    renderer.forceContextLoss();
  };
};

const settings: SketchSettings = {
  mode: "webgl2",
  // dimensions: [800, 800],
  pixelRatio: window.devicePixelRatio,
  animate: true,
  duration: 6_000,
  playFps: 60,
  exportFps: 60,
  framesFormat: ["mp4"],
  attributes: {
    preserveDrawingBuffer: true,
  },
};

ssam(sketch as Sketch, settings);
