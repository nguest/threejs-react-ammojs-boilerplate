import * as THREE from 'three';

import Config from '../sceneConfig/general';
import { promisifyLoader } from '../helpers/helpers';

class SkyBox {
  constructor(scene) {
    this.scene = scene;
    this.loadAssets();
  }

  loadAssets() {
    console.log({ cc:THREE.CubeTextureLoader })
    //const path = './assets/textures/skybox/';
    const path = 'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/';
    const loader = new THREE.CubeTextureLoader();
    const cubeMap = promisifyLoader(loader).load([
      // `${path}right.jpg`,
      // `${path}left.jpg`,
      // `${path}top.jpg`,
      // `${path}bottom.jpg`,
      // `${path}front.jpg`,
      // `${path}back.jpg`,
      `${path}pos-x.jpg`,
      `${path}neg-x.jpg`,
      `${path}pos-y.jpg`,
      `${path}neg-y.jpg`,
      `${path}pos-z.jpg`,
      `${path}neg-z.jpg`,
    ]);

    cubeMap.then((map) => this.createBackground(map));
  }

  createBackground(cubeMap) {
    console.log({ cubeMap })
    cubeMap.minFilter = THREE.LinearFilter;

    this.scene.background = cubeMap;
  }

  createSkyBox(material) {
    const size = 300;

    this.skyBox = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      material,
    );

    this.skyBox.rotation.set(0, Math.PI * 0.5, 0);

    this.skyBox.matrixWorldNeedsUpdate = true;
    this.skyBox.material.needsUpdate = true;
    this.skyBox.position.set(...Config.skyBox.position);

    this.scene.add(this.skyBox);
    return this.skyBox;
  }
}

export default SkyBox;
