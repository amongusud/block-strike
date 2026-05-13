import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// ======================================
// CENA
// ======================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);

scene.fog = new THREE.Fog(
  0x87ceeb,
  20,
  100
);

// ======================================
// CAMERA
// ======================================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0,1.8,5);

// ======================================
// RENDERER
// ======================================

const renderer = new THREE.WebGLRenderer({
  antialias:true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
  renderer.domElement
);

// ======================================
// LUZ
// ======================================

const light = new THREE.DirectionalLight(
  0xffffff,
  1
);

light.position.set(20,30,10);

light.castShadow = true;

scene.add(light);

scene.add(
  new THREE.AmbientLight(
    0xffffff,
    0.4
  )
);

// ======================================
// CHÃO
// ======================================

const floor = new THREE.Mesh(

  new THREE.PlaneGeometry(200,200),

  new THREE.MeshLambertMaterial({
    color:0x3a9d23
  })
);

floor.rotation.x = -Math.PI/2;

floor.receiveShadow = true;

scene.add(floor);

// ======================================
// BLOCOS
// ======================================

const blocks = [];

function createBlock(
  x,
  y,
  z,
  color = 0x888888
){

  const block = new THREE.Mesh(

    new THREE.BoxGeometry(1,1,1),

    new THREE.MeshLambertMaterial({
      color
    })
  );

  block.position.set(x,y,z);

  block.castShadow = true;

  block.receiveShadow = true;

  scene.add(block);

  blocks.push(block);
}

// mapa

for(let x=-20;x<=20;x+=2){

  for(let z=-20;z<=20;z+=2){

    createBlock(
      x,
      0.5,
      z,
      Math.random() * 0xffffff
    );
  }
}

createBlock(0,2,-5,0xff0000);
createBlock(3,2,-8,0x0000ff);
createBlock(-4,2,-6,0xffff00);

// ======================================
// PLAYER
// ======================================

const player = {

  height:1.8,

  speed:0.15,

  gravity:0.012,

  velocityY:0,

  jumpForce:0.25,

  canJump:true
};

// ======================================
// INPUT
// ======================================

const keys = {};

document.addEventListener(
  'keydown',
  e => {

    keys[e.code] = true;

    if(
      e.code === 'Space'
      &&
      player.canJump
    ){

      player.velocityY =
        player.jumpForce;

      player.canJump = false;
    }
  }
);

document.addEventListener(
  'keyup',
  e => {

    keys[e.code] = false;
  }
);

// ======================================
// POINTER LOCK
// ======================================

const menu =
  document.getElementById('menu');

menu.addEventListener(
  'click',
  () => {

    document.body.requestPointerLock();
  }
);

document.addEventListener(
  'pointerlockchange',
  () => {

    if(
      document.pointerLockElement
      ===
      document.body
    ){

      menu.style.display = 'none';

    }else{

      menu.style.display = 'flex';
    }
  }
);

// ======================================
// MOUSE LOOK
// ======================================

let pitch = 0;

document.addEventListener(
  'mousemove',
  e => {

    if(
      document.pointerLockElement
      !==
      document.body
    ) return;

    camera.rotation.y -=
      e.movementX * 0.002;

    pitch -=
      e.movementY * 0.002;

    pitch = Math.max(
      -Math.PI/2,
      Math.min(Math.PI/2,pitch)
    );

    camera.rotation.x = pitch;
  }
);

// ======================================
// MOVIMENTO
// ======================================

function movePlayer(){

  const direction =
    new THREE.Vector3();

  if(keys['KeyW']) direction.z -= 1;
  if(keys['KeyS']) direction.z += 1;
  if(keys['KeyA']) direction.x -= 1;
  if(keys['KeyD']) direction.x += 1;

  direction.normalize();

  const forward =
    new THREE.Vector3();

  camera.getWorldDirection(forward);

  forward.y = 0;

  forward.normalize();

  const right =
    new THREE.Vector3();

  right.crossVectors(
    new THREE.Vector3(0,1,0),
    forward
  );

  camera.position.add(
    forward.multiplyScalar(
      direction.z * player.speed
    )
  );

  camera.position.add(
    right.multiplyScalar(
      direction.x * player.speed
    )
  );

  // gravidade

  player.velocityY -=
    player.gravity;

  camera.position.y +=
    player.velocityY;

  if(
    camera.position.y
    <
    player.height
  ){

    camera.position.y =
      player.height;

    player.velocityY = 0;

    player.canJump = true;
  }
}

// ======================================
// TIRO
// ======================================

const raycaster =
  new THREE.Raycaster();

document.addEventListener(
  'click',
  () => {

    if(
      document.pointerLockElement
      !==
      document.body
    ) return;

    raycaster.setFromCamera(
      new THREE.Vector2(0,0),
      camera
    );

    const hits =
      raycaster.intersectObjects(
        blocks
      );

    if(hits.length > 0){

      const hit = hits[0].object;

      scene.remove(hit);

      blocks.splice(
        blocks.indexOf(hit),
        1
      );
    }
  }
);

// ======================================
// HUD
// ======================================

const hud =
  document.getElementById('hud');

function updateHUD(){

  hud.innerHTML = `
    X: ${camera.position.x.toFixed(1)}
    Y: ${camera.position.y.toFixed(1)}
    Z: ${camera.position.z.toFixed(1)}
  `;
}

// ======================================
// LOOP
// ======================================

function animate(){

  requestAnimationFrame(animate);

  movePlayer();

  updateHUD();

  renderer.render(
    scene,
    camera
  );
}

animate();

// ======================================
// RESIZE
// ======================================

window.addEventListener(
  'resize',
  () => {

    camera.aspect =
      window.innerWidth
      /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);
