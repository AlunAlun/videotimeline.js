videotimeline.js
================

A canvas based timeline for controlling multiple HTML5 video objects. It is a fork on an animation timeline created by Marcin Ignac https://github.com/vorg/timeline.js/, modified for use with HTML5 video. 

Global play/pause/stop controls and scrubbing along the timeline for all connected videos.

Designed to track playback of multicamera setups (production, security, sports etc)

## Usage

Simply add as many <video> elements to your page as you want. Then initialise timeline and add videos to it as follows:

```
var timeline = new Timeline();
timeline.addVideoFromDOM("camera1", "vid1");
timeline.addVideoFromDOM("camera2", "vid2");
```

Timeline will appear automatically in bottom of page. Click on track name to switch to that video.

See a demo [here](http://alunevans.info/apps/videotimeline/).
