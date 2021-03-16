function init() {
  var renderer = initRenderer();
  var camera = initCamera();
  var scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x333333));
  
  camera.position.set(0, 70, 100);
  var trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  var mixer = new THREE.AnimationMixer();
  var clipAction
  var animationClip
  var selectedClipAction

  var controls
  
  initDefaultLighting(scene);
  var textureLoader = new THREE.TextureLoader();
  var loader = new THREE.MD2Loader();
  loader.load('../models/female/female.md2', function (result) {

    var mat = new THREE.MeshStandardMaterial(
      { morphTargets: true, 
        color: 0xffffff,
        metalness: 0,
        map: textureLoader.load('../models/female/skin/female.jpg')
    })
    
    var mesh = new THREE.Mesh(result, mat);
    scene.add(mesh);

    // // setup the mixer
    mixer = new THREE.AnimationMixer(mesh);
    animationClip = result.animations[7];
    clipAction = mixer.clipAction( animationClip ).play();
    clipAction.play();
    // add the animation controls
    enableControls(result);
  });

  function enableControls(geometry) {
    var gui = new dat.GUI();
    
    controls = addClipActionFolder("Debug params", gui, clipAction, animationClip);

    var animationsArray = geometry.animations.map(function(e) { 
      return e.name;
    });
    animationsArray.push("none")
    var animationMap = geometry.animations.reduce(function(res, el) { 
      res[el.name] = el
      return res;
    }, {"none" : undefined});

    gui.add({animation: "none"}, "animation", animationsArray).onChange(function(selection) {
      clipAction.stop();
      if (selectedClipAction) selectedClipAction.stop();
      if (selection != "none") {
        selectedClipAction = mixer.clipAction( animationMap[selection] ).play();    
      }
    });
  }

  render();
  function render() {
    var delta = clock.getDelta();
    trackballControls.update(delta);
    requestAnimationFrame(render);
    renderer.render(scene, camera)

    if (mixer && clipAction && controls) {
      mixer.update( delta );
      controls.time = mixer.time;
      controls.effectiveTimeScale = clipAction.getEffectiveTimeScale();
      controls.effectiveWeight = clipAction.getEffectiveWeight();
    }
  }   
}
