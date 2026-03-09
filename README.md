# Earth Digital Twin (Web)

An interactive 3D Earth experience that lets you zoom from outer space down toward street-level map detail in a regular web browser.

## Features

- Realistic 3D globe rendering with atmosphere and sunlight-driven lighting.
- Dynamic cloud layer (free public texture) with live orbital-view animation.
- Orbital-only toggle for dynamic clouds + atmospheric simulation.
- Smooth navigation from orbital view to continent, city, and street-scale presets.
- Mouse/touch free navigation (pan, zoom, tilt, rotate).
- Browser-efficient defaults (`requestRenderMode`, capped resolution scale).
- Uses free public map layers from OpenStreetMap.

## Run locally

Because this app uses JavaScript modules, serve it with a local web server:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Controls

- Scroll or pinch to zoom.
- Left-drag to pan/rotate.
- Right-drag (or two-finger drag) to tilt.
- Press `H` to jump back to orbital view.
- Use the on-screen preset buttons: Orbit, Continent, City, Street.
- In orbit view, use the clouds/atmosphere toggle to switch simulation on/off.

## Data attribution

- Globe/map imagery tiles: © OpenStreetMap contributors.
- Cloud texture: Wikimedia Commons (`Earth_clouds_1024.png`).
- 3D engine: CesiumJS (Apache 2.0).
