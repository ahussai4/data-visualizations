import * as Cesium from "https://unpkg.com/cesium@1.120.0/Build/Cesium/Cesium.js";

Cesium.Ion.defaultAccessToken = "";

const viewer = new Cesium.Viewer("cesiumContainer", {
  animation: false,
  baseLayerPicker: false,
  geocoder: false,
  fullscreenButton: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  timeline: false,
  infoBox: false,
  selectionIndicator: false,
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,
  imageryProvider: new Cesium.OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
    credit: "© OpenStreetMap contributors",
  }),
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  contextOptions: {
    webgl: {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    },
  },
});

const { scene, camera, clock } = viewer;
scene.globe.depthTestAgainstTerrain = true;
scene.postProcessStages.fxaa.enabled = true;
scene.maximumRenderTimeChange = Infinity;
viewer.resolutionScale = Math.min(1.0, window.devicePixelRatio > 1.5 ? 0.9 : 1);

viewer.cesiumWidget.creditContainer.style.bottom = "0.3rem";
viewer.cesiumWidget.creditContainer.style.left = "0.6rem";

const EARTH_RADIUS_M = 6378137;
const CLOUD_ALTITUDE_M = 16000;
const CLOUD_ROTATION_DEG_PER_SEC = 0.4;
const CLOUD_TEXTURE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/67/Earth_clouds_1024.png";

let currentView = "orbit";
let atmoCloudsEnabled = true;
let cloudRotationDegrees = 0;

const orbitalControls = document.getElementById("orbital-controls");
const atmoCloudToggle = document.getElementById("atmoCloudToggle");

const cloudLayer = viewer.entities.add({
  name: "Dynamic clouds",
  position: Cesium.Cartesian3.ZERO,
  ellipsoid: {
    radii: new Cesium.Cartesian3(
      EARTH_RADIUS_M + CLOUD_ALTITUDE_M,
      EARTH_RADIUS_M + CLOUD_ALTITUDE_M,
      EARTH_RADIUS_M + CLOUD_ALTITUDE_M,
    ),
    material: new Cesium.ImageMaterialProperty({
      image: CLOUD_TEXTURE_URL,
      transparent: true,
      color: new Cesium.Color(1, 1, 1, 0.45),
    }),
  },
});

function setAtmosphereAndClouds(enabled) {
  atmoCloudsEnabled = enabled;
  scene.globe.enableLighting = enabled;
  scene.skyAtmosphere.show = enabled;
  scene.fog.enabled = enabled;
  clock.shouldAnimate = enabled;
  cloudLayer.show = enabled;
  viewer.scene.requestRender();
}

function updateOrbitalControlVisibility() {
  const isOrbital = currentView === "orbit";
  orbitalControls.classList.toggle("hidden", !isOrbital);
}

scene.preRender.addEventListener((_scene, time) => {
  if (!atmoCloudsEnabled || currentView !== "orbit") {
    return;
  }

  const seconds = Cesium.JulianDate.secondsDifference(time, clock.startTime);
  cloudRotationDegrees = (seconds * CLOUD_ROTATION_DEG_PER_SEC) % 360;

  cloudLayer.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    Cesium.Cartesian3.ZERO,
    new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(cloudRotationDegrees), 0, 0),
  );
});

atmoCloudToggle.addEventListener("change", () => {
  if (currentView !== "orbit") {
    atmoCloudToggle.checked = atmoCloudsEnabled;
    return;
  }
  setAtmosphereAndClouds(atmoCloudToggle.checked);
});

const viewpoints = {
  orbit: {
    destination: Cesium.Cartesian3.fromDegrees(-30, 18, 19000000),
    orientation: {
      heading: Cesium.Math.toRadians(18),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 2.4,
  },
  continent: {
    destination: Cesium.Cartesian3.fromDegrees(11.2558, 46.9838, 6500000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-42),
      roll: 0,
    },
    duration: 2.2,
  },
  city: {
    destination: Cesium.Cartesian3.fromDegrees(-73.9857, 40.7484, 17000),
    orientation: {
      heading: Cesium.Math.toRadians(30),
      pitch: Cesium.Math.toRadians(-62),
      roll: 0,
    },
    duration: 2,
  },
  street: {
    destination: Cesium.Cartesian3.fromDegrees(-73.98513, 40.758896, 1100),
    orientation: {
      heading: Cesium.Math.toRadians(45),
      pitch: Cesium.Math.toRadians(-75),
      roll: 0,
    },
    duration: 1.8,
  },
};

function flyToView(viewKey) {
  const view = viewpoints[viewKey];
  if (!view) return;

  currentView = viewKey;
  updateOrbitalControlVisibility();

  if (viewKey === "orbit") {
    setAtmosphereAndClouds(atmoCloudToggle.checked);
  } else {
    cloudLayer.show = false;
    scene.skyAtmosphere.show = true;
    scene.globe.enableLighting = false;
    scene.fog.enabled = false;
    clock.shouldAnimate = false;
  }

  camera.flyTo(view);
}

document.querySelectorAll("button[data-view]").forEach((button) => {
  button.addEventListener("click", () => flyToView(button.dataset.view));
});

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 35;
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "h") {
    flyToView("orbit");
  }
});

clock.multiplier = 300;
clock.shouldAnimate = true;
setAtmosphereAndClouds(true);
flyToView("orbit");
