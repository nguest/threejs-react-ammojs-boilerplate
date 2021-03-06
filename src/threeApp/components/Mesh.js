import * as THREE from 'three';
import Ammo from 'ammonext';

import { promisifyLoader } from '../helpers/helpers';
import { GLTFLoader } from '../loaders/GLTFLoader';


export class Mesh {
  constructor({
    add,
    calculateFaces,
    calculateUVs,
    calculateVertices,
    geoRotate,
    material,
    name,
    params,
    physics = {},
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    scene = this.scene,
    shadows = { receive: false, cast: true },
    type,
    url,
  }) {
    this.addObjectToScene = add;
    this.geoRotate = geoRotate;
    this.material = material;
    this.name = name;
    this.params = params;
    this.physics = physics;
    this.physicsWorld = physics.physicsWorld;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
    this.scene = scene;
    this.shadows = shadows;
    this.type = type;

    if (!add) return;

    if (type === 'GLTF') {
      this.initLoader(url);
    } else {
      const geometry = new THREE[type](...params);

      if (params === 'custom') {
        // must be custom type
        if (!calculateVertices || !calculateFaces) {
          throw new Error(
            'calculateVertices and calculateFaces Functions must be defined to calculate custom geometry',
          );
        }
        const vertices = calculateVertices();
        const faces = calculateFaces();

        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
        geometry.computeBoundingBox();
        geometry.name = name;
        const faceVertexUvs = calculateUVs(geometry);
        geometry.faceVertexUvs[0] = faceVertexUvs;

        geometry.elementsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
      }

      this.orientObject(geometry);
    }
  }

  initLoader(url) {
    const loader = new GLTFLoader().setPath(url.path);
    const gltfScene = promisifyLoader(loader).load(url.file);
    gltfScene.then((gltf) => {
      const mesh = gltf.scene.children[0].children.filter((child) => child.type === 'Mesh');
      return this.orientObject(mesh[0].geometry, mesh[0].material);
    });
  }

  orientObject(geometry, loadedMaterial) {
    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0]);
      geometry.rotateY(this.geoRotate[1]);
      geometry.rotateZ(this.geoRotate[2]);
    }
    this.mesh = new THREE.Mesh(geometry, loadedMaterial || this.material);
    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
    this.mesh.geometry.scale(...this.scale);
    this.mesh.castShadow = this.shadows.cast;
    this.mesh.receiveShadow = this.shadows.receive;
    this.mesh.name = this.name;
    if (this.addObjectToScene) {
      this.setInitialState();
      this.scene.add(this.mesh);
    }
    if (this.physicsWorld) this.calculatePhysics(this.mesh, this.params, this.physics, this.type);

    return this.mesh;
  }

  setInitialState() {
    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
  }

  calculatePhysics(mesh, params, physics, type) {
    // Ammojs Section
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...this.rotation, 'XYZ'));
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(...this.position));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    let colShape;
    switch (type) {
    case 'SphereBufferGeometry':
      colShape = new Ammo.btSphereShape(params[0]); break;
    case 'BoxBufferGeometry':
      colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0], params[1], params[2])); break;
    case 'PlaneBufferGeometry':
      colShape = new Ammo.btBoxShape(new Ammo.btVector3(params[0] * 0.5, params[1] * 0.5, 1)); break;
    case 'convexHull':
    case 'GLTF':
      colShape = new Ammo.btConvexHullShape(convexGeometryProcessor(mesh.geometry), true, true); break;
    default:
      colShape = new Ammo.btBvhTriangleMeshShape(concaveGeometryProcessor(mesh.geometry), true, true); break;
    }

    colShape.setMargin(0.1);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    colShape.calculateLocalInertia(physics.mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(physics.mass, motionState, colShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setFriction(physics.friction || 0);
    body.setRestitution(physics.restitution || 1);
    body.setDamping(physics.damping || 0, physics.damping || 0);

    this.physicsWorld.addRigidBody(body, 1, 1);
    mesh.userData.physicsBody = body;
    this.physicsWorld.bodies.push(mesh);
  }
}

const concaveGeometryProcessor = (geometry) => {
  if (!geometry.boundingBox) geometry.computeBoundingBox();

  const data = geometry.isBufferGeometry
    ? geometry.attributes.position.array
    : new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const { vertices } = geometry;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;
      data[i9 + 1] = vA.y;
      data[i9 + 2] = vA.z;

      data[i9 + 3] = vB.x;
      data[i9 + 4] = vB.y;
      data[i9 + 5] = vB.z;

      data[i9 + 6] = vC.x;
      data[i9 + 7] = vC.y;
      data[i9 + 8] = vC.z;
    }
  }

  const vec1 = new Ammo.btVector3(0, 0, 0);
  const vec2 = new Ammo.btVector3(0, 0, 0);
  const vec3 = new Ammo.btVector3(0, 0, 0);
  const triangleMesh = new Ammo.btTriangleMesh();

  if (!data.length) return false;
  for (let i = 0; i < data.length / 9; i++) {
    vec1.setX(data[i * 9]);
    vec1.setY(data[i * 9 + 1]);
    vec1.setZ(data[i * 9 + 2]);

    vec2.setX(data[i * 9 + 3]);
    vec2.setY(data[i * 9 + 4]);
    vec2.setZ(data[i * 9 + 5]);

    vec3.setX(data[i * 9 + 6]);
    vec3.setY(data[i * 9 + 7]);
    vec3.setZ(data[i * 9 + 8]);

    triangleMesh.addTriangle(
      vec1,
      vec2,
      vec3,
      false,
    );
  }

  return triangleMesh;
};

export const convexGeometryProcessor = (geometry) => {
  if (!geometry.boundingBox) geometry.computeBoundingBox();

  const data = geometry.isBufferGeometry
    ? geometry.attributes.position.array
    : new Float32Array(geometry.faces.length * 9);

  if (!geometry.isBufferGeometry) {
    const { vertices } = geometry;

    for (let i = 0; i < geometry.faces.length; i++) {
      const face = geometry.faces[i];
      const vA = vertices[face.a];
      const vB = vertices[face.b];
      const vC = vertices[face.c];

      const i9 = i * 9;

      data[i9] = vA.x;
      data[i9 + 1] = vA.y;
      data[i9 + 2] = vA.z;

      data[i9 + 3] = vB.x;
      data[i9 + 4] = vB.y;
      data[i9 + 5] = vB.z;

      data[i9 + 6] = vC.x;
      data[i9 + 7] = vC.y;
      data[i9 + 8] = vC.z;
    }
  }
  const shape = new Ammo.btConvexHullShape();
  const vec1 = new Ammo.btVector3(0, 0, 0);

  for (let i = 0; i < data.length / 3; i++) {
    vec1.setX(data[i * 3]);
    vec1.setY(data[i * 3 + 1]);
    vec1.setZ(data[i * 3 + 2]);

    shape.addPoint(vec1);
  }
  return shape;
};
