videotimeline.js
================

A canvas based timeline for controlling multiple HTML5 video objects. It is a fork on an animation timeline created by Marcin Ignac https://github.com/vorg/timeline.js/, modified for use with HTML5 video. 

Global play/pause/stop controls and scrubbing along the timeline for all connected videos.

Designed to track playback of multicamera setups (production, security, sports etc).

## Usage

### Videos already in the DOM

Simply add as many <video> elements to your page as you want.  Then initialise timeline and add videos to it as follows:

```
var timeline = new Timeline();
timeline.addVideoFromDOM("camera1", "vid1");
timeline.addVideoFromDOM("camera2", "vid2");
timeline.addVideoLink("camera3", "url-to-camera.ogv", true);
```

The timeline will appear automatically in bottom of page. Click on track name to switch to that video, and drag and drop the slider to skip along

See a simple demo [here](http://alunevans.info/apps/videotimeline/)

### Videos not in DOM, loaded from external URL

videotimeline.js allows you to switch between several video files and see them in the same player area

```
var timeline = new Timeline();
timeline.playerElementID = "id-of-div-to-contain-videos";
timeline.addVideoLink("camera1", "url-to-camera.ogv");
timeline.addVideoLink("camera2", "url-to-camera2.ogv");
```

A demo of this is here [here](http://alunevans.info/apps/videotimeline-oneviewer/).
