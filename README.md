== MPEG-DASH VideoJS Example ==

=== Video preparation ===
- use 1MB Sample video 1280x720 from [sample-videos.com](http://www.sample-videos.com/)
- use [GPAC MP4BOX](https://gpac.wp.imt.fr/mp4box/)
- this is a step to produce file inside `gpac`
  - `mp4box -crypt drm.xml -out enc.mp4 origin.mp4`
  - `mp4box -dash 4000 -rap -bs-switching no enc.mp4#video enc.mp4#audio`

=== Installation ===
- `npm install` or `yarn install`
- Run local server `python -m http.server 3000`
- open browser `localhost:3000`

=== Screenshot ===
![screenshot](https://github.com/nodtem66/dash-videojs-sample/raw/master/demo.png)