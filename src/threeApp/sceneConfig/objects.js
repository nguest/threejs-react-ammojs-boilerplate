import { calculateFaces, calculateVertices, planeUnwrapUVs } from '../custom/geometries/concaveExample1';

export const objectsIndex = [
  {
    name: 'sphere',
    type: 'SphereBufferGeometry',
    params: [20, 20, 10],
    position: [0, 250, -100],
    material: 'redShiny',
    physics: {
      mass: 1,
      friction: 0.8,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'sphere2',
    type: 'SphereBufferGeometry',
    params: [10, 10, 10],
    position: [50, 130, -70],
    material: 'redShiny',
    physics: {
      mass: 1,
      friction: 0.8,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'groundPlane',
    type: 'PlaneBufferGeometry',
    params: [1000, 1000, 1, 1],
    position: [0, 0, 0],
    rotation: [-Math.PI * 0.5, 0, 0],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: false,
    },
    add: true,
  },
  {
    name: 'tiltedPlane',
    type: 'BoxBufferGeometry',
    params: [150, 1, 150, 1, 1, 1],
    position: [-70, 120, -50],
    rotation: [0, 0, -0.5],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'concaveExample1',
    type: 'Geometry',
    params: 'custom',
    position: [0, 30, 20],
    rotation: [0.05, 0, 0.2],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    calculateVertices,
    calculateFaces,
    calculateUVs: planeUnwrapUVs,
    add: true,
  },
  {
    name: 'torus',
    type: 'TorusBufferGeometry',
    params: [12, 6, 80, 16],
    position: [80, 80, -40],
    rotation: [0, 0, 0],
    scale: [2, 2, 2],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'box',
    type: 'BoxBufferGeometry',
    params: [30, 30, 30, 1, 1, 1],
    position: [50, 50, -70],
    rotation: [0, 0, 0],
    scale: [2, 2, 2],
    material: 'mappedFlat',
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
  {
    name: 'duck',
    type: 'GLTF',
    url: {
      path: 'assets/objects/duck/',
      file: 'Duck.gltf',
    },
    position: [0, 100, -105],
    rotation: [0, 0, 0],
    scale: [0.2, 0.2, 0.2],
    physics: {
      mass: 0,
      friction: 0.8,
      restitution: 0.5,
    },
    shadows: {
      receive: true,
      cast: true,
    },
    add: true,
  },
];
