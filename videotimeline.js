
var Timeline = function() {
  this.visible = false;
  this.tracks = [];   
	this.time = 0;      
	this.totalTime = 0; 
	this.loopCount = 0;	
  //-1 infinite loop;     0 play forever without looping, continue increasing time even after last animation
  //1  play once and stop at the time the last animation finishes;    >1 loop n-times
	this.loopMode = 0;	 
	this.playing = false;
  this.currentVideo = 0;
  var self = this; 
	setInterval(function() {
	  self.update();
	}, 1000/30);
}   

Timeline.prototype.addVideoFromDOM= function(name, id) {
  if (!document.getElementById(id)) {
    console.log("DOM does not contain video with this ID"); return;}
  var videoTrack = {
    type: "video",
    startTime: 0, //TEMP!
    endTime:10, //TEMP!
    id: id,
    index: this.tracks.length,
    name: name,
  }
  document.getElementById(id).addEventListener('loadedmetadata', function() {
    videoTrack.endTime = document.getElementById(id).duration
  });
  this.tracks.push(videoTrack)
}

Timeline.prototype.addVideoFromURL = function(name, url, addToPage) {
  var vidElement = document.createElement("video");
  vidElement.id = name;
  var source = document.createElement('source');
      source.src = url;
      source.type = 'video/ogg';
      vidElement.appendChild(source);

  if (addToPage)
    document.body.appendChild(vidElement);

  var videoTrack = {
    type: "video",
    startTime: 0, //TEMP!
    endTime:10, //TEMP!
    id: name,
    index: this.tracks.length,
    name: name,
  }
  document.getElementById(name).addEventListener('loadedmetadata', function() {
    videoTrack.endTime = document.getElementById(id).duration
  });
  this.tracks.push(videoTrack)
}

Timeline.prototype.play = function() {
  
  this.playing = true;
  this.shouldPlay = false;
  this.synchVideos();
  document.getElementById(this.tracks[this.currentVideo].id).play();
  this.time = document.getElementById(this.tracks[this.currentVideo].id).currentTime ;
}   

Timeline.prototype.pause = function() {
  this.playing = false; 
  document.getElementById(this.tracks[this.currentVideo].id).pause(); 
} 

Timeline.prototype.stop = function() {
  this.playing = false;
  this.time = 0;       
  this.prevTime = this.time - 1/30; //FIXME 1/30

  document.getElementById(this.tracks[this.currentVideo].id).pause();
  document.getElementById(this.tracks[this.currentVideo].id).currentTime = 0;
  
} 

Timeline.prototype.changeTrack = function(newTrack) {
  //check if playing and pause current video
  var needRestart = false;
  if (this.playing) { 
    this.pause(); 
    needRestart = true;
  }
  //change video
  this.currentVideo = newTrack.index;

  //restart if required
  if (needRestart)
    this.play();
}

//    _    _ ______ _      _____  ______ _____   
//   | |  | |  ____| |    |  __ \|  ____|  __ \  
//   | |__| | |__  | |    | |__) | |__  | |__) | 
//   |  __  |  __| | |    |  ___/|  __| |  _  /  
//   | |  | | |____| |____| |    | |____| | \ \  
//   |_|  |_|______|______|_|    |______|_|  \_\ 
//                                               
//                                                                                                                                                         

Timeline.prototype.synchVideos = function() {
    for (vidID in this.tracks) {
      this.tracks[vidID].time = this.time;
    }
    if (this.tracks[this.currentVideo])
      document.getElementById(this.tracks[this.currentVideo].id).currentTime = this.time;
  
}

Timeline.prototype.preUpdate = function() {
  //check video has content
  var currentVideo = document.getElementById(this.tracks[this.currentVideo].id);
  if (currentVideo.readyState < currentVideo.HAVE_FUTURE_DATA) {
    if (this.playing) {
      this.pause();
      this.shouldPlay = true;
    }
  } else if (this.shouldPlay) {
    this.shouldPlay = false;
    this.play();
  }


  this.updateGUI();
}

Timeline.prototype.update = function() {  
  this.preUpdate();
                   
  if (this.playing) {
    this.totalTime += 1/30;   
    this.prevTime = this.time;
    this.time += 1/30;  
  }
  
  if (this.loopMode != 0) {
    var camEnd = this.findVideoDuration();
    if (this.time > camEnd) {
      this.loopCount++;
      this.time = 0;
    }
    if (this.loopMode == -1) {
      //loop infinitely
    }  
    else {
      if (this.loopCount >= this.loopMode) {
        this.playing = false;
      }
    }
  }     

  this.applyValues();             
} 

Timeline.prototype.getTrackAt = function(mouseX, mouseY) {                     
  var scrollY = this.tracksScrollY * (this.tracks.length * this.trackLabelHeight - this.canvas.height + this.headerHeight);
  var clickedTrackNumber = Math.floor((mouseY - this.headerHeight + scrollY)/this.trackLabelHeight);
                                                 
  if (clickedTrackNumber >= 0 && clickedTrackNumber >= this.tracks.length) {    
    return null;
  }    
  
  return this.tracks[clickedTrackNumber];  
}





Timeline.prototype.applyValues = function() { 
	//TODO: change actual camera parameters based on time
}

Timeline.prototype.findVideoDuration = function() {
  var endTime = 0;   
  for(var i=0; i<this.tracks.length; i++) {
    if (this.tracks[i].endTime > endTime) {
      endTime = this.tracks[i].endTime;
    }
  }             
  return endTime;
} 

Timeline.prototype.timeToX = function(time) {   
  var animationEnd = this.findVideoDuration();
  var visibleTime = this.xToTime(this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth) - this.xToTime(20); //50 to get some additional space
  if (visibleTime < animationEnd) {      
    time -= (animationEnd - visibleTime) * this.timeScrollX;
  }
  
  return this.trackLabelWidth + time * (this.timeScale * 200) + 10;
}  

Timeline.prototype.xToTime = function(x) {                                                    
  var animationEnd = this.findVideoDuration();  
  var visibleTime = (this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth - 20)/(this.timeScale * 200);
  var timeShift = Math.max(0, (animationEnd - visibleTime) * this.timeScrollX);
  return (x - this.trackLabelWidth - 10)/(this.timeScale * 200) + timeShift;
}

//     _____ _    _ _____ 
//    / ____| |  | |_   _|
//   | |  __| |  | | | |  
//   | | |_ | |  | | | |  
//   | |__| | |__| |_| |_ 
//    \_____|\____/|_____|
//                        
//                        

Timeline.prototype.initGUI = function() {  
	var self = this;     

	this.trackLabelWidth = 108;  
	this.trackLabelHeight = 20; 
	this.tracksScrollWidth = 16;  
	this.tracksScrollHeight = 0;
	this.tracksScrollThumbPos = 0;   
	this.tracksScrollThumbHeight = 0; 
	this.tracksScrollY = 0;    
	this.timeScrollWidth = 0;  
	this.timeScrollHeight = 16;
	this.timeScrollThumbPos = 0;   
	this.timeScrollThumbWidth = 0;   
	this.timeScrollX = 0;
	this.headerHeight = 30;
	this.canvasHeight = 200; 
	this.draggingTime = false;    
	this.draggingTracksScrollThumb = false;    
	this.draggingTimeScrollThumb = false;
	this.draggingKeys = false;
	this.draggingTimeScale = false;
	this.selectedKeys = [];  
	this.timeScale = 0.018;    
	        
	//this.load();    TODO: Load and save timeline

	this.container = document.createElement("div");  
  this.container.id = "timeline";   
  this.container.style.display = "block";   
	this.container.style.width = "100%";    
	this.container.style.height = this.canvasHeight + "px";
	this.container.style.background = "#EEEEEE";	
	this.container.style.position = "fixed";		   
	this.container.style.left = "0px";      	   
	this.container.style.bottom = "0px";      	   
	document.body.appendChild(this.container);     

	this.splitter = document.createElement("div");
	this.splitter.style.width = "100%";       
	this.splitter.style.height = "4px";
	this.splitter.style.cursor = "ns-resize";
	this.splitter.style.position = "fixed";	  
	this.splitter.style.left = "0px";	  
	this.splitter.style.bottom = (this.canvasHeight - 2) + "px";   
	this.splitter.addEventListener("mousedown", function() { //TODO move splitter
		function mouseMove(e) {         
			var h = (window.innerHeight - e.clientY);  
			self.splitter.style.bottom = (h - 2) + "px";
			self.container.style.height = h + "px";
			self.canvasHeight = h;     	                                     
			self.tracksScrollY = 0;   
			self.tracksScrollThumbPos = 0;
			//self.save();
			} 
			function mouseUp(e) {
				document.body.removeEventListener("mousemove", mouseMove, false);
				document.body.removeEventListener("mouseup", mouseUp, false);
			}                                                  
				document.body.addEventListener("mousemove", mouseMove, false);
				document.body.addEventListener("mouseup", mouseUp, false);
		},
	false);          
	document.body.appendChild(this.splitter);

	this.canvas = document.createElement("canvas");		 
	this.c = this.canvas.getContext("2d");
	this.canvas.width = 0;    
	this.container.appendChild(this.canvas);


	//this.buildInputDialog(); TODO input dialog for annotoations

	var self = this;
	this.canvas.addEventListener('click', function(event) {
		self.onMouseClick(event);
	}, false);
	this.canvas.addEventListener('mousedown', function(event) {
		self.onMouseDown(event);
	}, false);
	document.body.addEventListener('mousemove', function(event) {
		self.onDocumentMouseMove(event);
	}, false);
	this.canvas.addEventListener('mousemove', function(event) {
		self.onCanvasMouseMove(event);
	}, false);
	document.body.addEventListener('mouseup', function(event) {
		self.onMouseUp(event);
	}, false);    
	this.canvas.addEventListener('dblclick', function(event) {
		self.onMouseDoubleClick(event);
	}, false);        
}   

Timeline.prototype.updateGUI = function() {   
  if (!this.canvas) {    
    this.initGUI();    
  }                
  
  this.canvas.width = window.innerWidth;
  this.canvas.height = this.canvasHeight;                    
  var w = this.canvas.width;
  var h = this.canvas.height;    
  
  this.tracksScrollHeight = this.canvas.height - this.headerHeight - this.timeScrollHeight;
  var totalTracksHeight = this.tracks.length * this.trackLabelHeight;
  var tracksScrollRatio = this.tracksScrollHeight/totalTracksHeight;
  this.tracksScrollThumbHeight = Math.min(Math.max(20, this.tracksScrollHeight * tracksScrollRatio), this.tracksScrollHeight);
  
  this.timeScrollWidth = this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth;
  var animationEnd = this.findVideoDuration();
  var visibleTime = this.xToTime(this.canvas.width - this.trackLabelWidth - this.tracksScrollWidth) - this.xToTime(0); //100 to get some space after lask key
  var timeScrollRatio = Math.max(0, Math.min(visibleTime/animationEnd, 1));
  this.timeScrollThumbWidth = timeScrollRatio * this.timeScrollWidth; 
  if (this.timeScrollThumbPos + this.timeScrollThumbWidth > this.timeScrollWidth) {
    this.timeScrollThumbPos = Math.max(0, this.timeScrollWidth - this.timeScrollThumbWidth);    
  }       
    
  
  this.c.clearRect(0, 0, w, h);   
                   
  //buttons  
  this.drawRect(0*this.headerHeight - 4 * -1, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD"); 
  this.drawRect(1*this.headerHeight - 4 *  0, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD"); 
  this.drawRect(2*this.headerHeight - 4 *  1, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD"); 
  this.drawRect(3*this.headerHeight - 4 *  2, 5, this.headerHeight - 8, this.headerHeight - 8, "#DDDDDD"); 
  
  //play
  this.c.strokeStyle = "#777777";
  this.c.beginPath();
  this.c.moveTo(4 + 6.5, 5 + 5);
  this.c.lineTo(this.headerHeight - 8, this.headerHeight/2+1.5);
  this.c.lineTo(4 + 6.5, this.headerHeight - 8);
  this.c.lineTo(4 + 6.5, 5 + 5);
  this.c.stroke();                                                                                                  
  
  //pause  
  this.c.strokeRect(this.headerHeight + 5.5, 5 + 5.5, this.headerHeight/6, this.headerHeight - 8 - 11);
  this.c.strokeRect(this.headerHeight + 5.5 + this.headerHeight/6 + 2, 5 + 5.5, this.headerHeight/6, this.headerHeight - 8 - 11);
  
  //stop    
  this.c.strokeRect(2*this.headerHeight - 4 + 5.5, 5 + 5.5, this.headerHeight - 8 - 11, this.headerHeight - 8 - 11);
  
  //export
  this.c.beginPath();
  this.c.moveTo(3*this.headerHeight - 4 *  2 + 5.5, this.headerHeight - 9.5);
  this.c.lineTo(3*this.headerHeight - 4 *  2 + 11.5, this.headerHeight - 9.5);
  this.c.moveTo(3*this.headerHeight - 4 *  2 + 5.5, this.headerHeight - 13.5);
  this.c.lineTo(3*this.headerHeight - 4 *  2 + 13.5, this.headerHeight - 13.5);
  this.c.moveTo(3*this.headerHeight - 4 *  2 + 5.5, this.headerHeight - 17.5);
  this.c.lineTo(3*this.headerHeight - 4 *  2 + 15.5, this.headerHeight - 17.5);
  this.c.stroke();
                                                                       
  //tracks area clipping path
  this.c.save();
  this.c.beginPath();
  this.c.moveTo(0, this.headerHeight+1);
  this.c.lineTo(this.canvas.width, this.headerHeight + 1);  
  this.c.lineTo(this.canvas.width, this.canvas.height - this.timeScrollHeight);  
  this.c.lineTo(0, this.canvas.height - this.timeScrollHeight);
  this.c.clip();
      
  for(var i=0; i<this.tracks.length; i++) { 
    var yshift = this.headerHeight + this.trackLabelHeight * (i + 1);
    var scrollY = this.tracksScrollY * (this.tracks.length * this.trackLabelHeight - this.canvas.height + this.headerHeight);
    yshift -= scrollY;
    if (yshift < this.headerHeight) continue;
      this.drawTrack(this.tracks[i], yshift);     
  }     
  
  this.c.restore();                                                       
                                                                             
  //end of label panel
  this.drawLine(this.trackLabelWidth, 0, this.trackLabelWidth, h, "#000000");
    
  //timeline
                 
  var timelineStart = 0;
  var timelineEnd = animationEnd; 
  var lastTimeLabelX = 0;   
                                                                                 
  this.c.fillStyle = "#666666";  
  var x = this.timeToX(0);
  for(var sec=timelineStart; sec<timelineEnd; sec++) {                               
  //var sec = timelineStart;
  //while(x < this.canvas.width) {  
    x = this.timeToX(sec);
    this.drawLine(x, 0, x, this.headerHeight*0.3, "#999999"); 
               
    var minutes = Math.floor(sec / 60);
    var seconds = sec % 60;
    var time = minutes + ":" + ((seconds < 10) ? "0" : "") + seconds;
    
    if (x - lastTimeLabelX > 30) {
      this.c.fillText(time, x - 6, this.headerHeight*0.8);    
      lastTimeLabelX = x;
    }   
    sec += 1;
  }    
  
  //time ticker
  this.drawLine(this.timeToX(this.time), 0, this.timeToX(this.time), h, "#FF0000"); 
  
  //time scale
  
  for(var i=2; i<20; i++) {   
    var f = 1.0 - (i*i)/361;
    this.drawLine(7 + f*(this.trackLabelWidth-10), h - this.timeScrollHeight + 4, 7 + f*(this.trackLabelWidth - 10), h - 3, "#999999"); 
  }                                                                                                                                     
                     
  this.c.fillStyle = "#666666";
  this.c.beginPath();
  this.c.moveTo(7 + (1.0-this.timeScale)*(this.trackLabelWidth-10), h - 7);
  this.c.lineTo(11 + (1.0-this.timeScale)*(this.trackLabelWidth - 10), h - 1);
  this.c.lineTo(3 + (1.0-this.timeScale)*(this.trackLabelWidth - 10), h - 1);
  this.c.fill();
                                                                     
  //tracks scrollbar
  this.drawRect(this.canvas.width - this.tracksScrollWidth, this.headerHeight + 1, this.tracksScrollWidth, this.tracksScrollHeight, "#DDDDDD");
  if (this.tracksScrollThumbHeight < this.tracksScrollHeight) {
    this.drawRect(this.canvas.width - this.tracksScrollWidth, this.headerHeight + 1 + this.tracksScrollThumbPos, this.tracksScrollWidth, this.tracksScrollThumbHeight, "#999999");
  } 
  
  //time scrollbar
  this.drawRect(this.trackLabelWidth, h - this.timeScrollHeight, w - this.trackLabelWidth - this.tracksScrollWidth, this.timeScrollHeight, "#DDDDDD");  
  if (this.timeScrollThumbWidth < this.timeScrollWidth) {
    this.drawRect(this.trackLabelWidth + 1 + this.timeScrollThumbPos, h - this.timeScrollHeight, this.timeScrollThumbWidth, this.timeScrollHeight, "#999999");
  }
  
  //header borders
  this.drawLine(0, 0, w, 0, "#000000");  
  this.drawLine(0, this.headerHeight, w, this.headerHeight, "#000000");
  this.drawLine(0, h - this.timeScrollHeight, this.trackLabelWidth, h - this.timeScrollHeight, "#000000");
  this.drawLine(this.trackLabelWidth, h - this.timeScrollHeight - 1, this.trackLabelWidth, h, "#000000");
} 

//    ________      ________ _   _ _______ _____ 
//   |  ____\ \    / /  ____| \ | |__   __/ ____|
//   | |__   \ \  / /| |__  |  \| |  | | | (___  
//   |  __|   \ \/ / |  __| | . ` |  | |  \___ \ 
//   | |____   \  /  | |____| |\  |  | |  ____) |
//   |______|   \/   |______|_| \_|  |_| |_____/ 
//                                               
//                                               

Timeline.prototype.onMouseDown = function(event) {   
  this.selectedKeys = [];    
  
  var x = event.layerX;
  var y = event.layerY;
  //TOP TIMELINE (HEADER with minutes/seconds)
  if (x > this.trackLabelWidth && y < this.headerHeight) { //right of track selected, within header

    this.draggingTime = true; 
    this.onDocumentMouseMove(event);

  }  
  //VERTICAL SCROLL BAR        
  else if (x > this.canvas.width - this.tracksScrollWidth && y > this.headerHeight) {  
    
    if (y >= this.headerHeight + this.tracksScrollThumbPos && y <= this.headerHeight + this.tracksScrollThumbPos + this.tracksScrollThumbHeight) {
      this.tracksScrollThumbDragOffset = y - this.headerHeight - this.tracksScrollThumbPos;
      this.draggingTracksScrollThumb = true;
    } 
  }
  //TRACK SELECTOR (far LEFT)
  else if (y > this.headerHeight && y < this.canvasHeight - this.timeScrollHeight) { //x > this.trackLabelWidth && 
    //keys
    // this.selectKeys(event.layerX, event.layerY); //TODO adding and dragging animations
    // if (this.selectedKeys.length > 0) {
    //   this.draggingKeys = true;
    // }       
    // this.cancelKeyClick = false;

    //change selected camera based on selected track
    var selectedTrack = this.getTrackAt(event.layerX, event.layerY);
    this.changeTrack(selectedTrack);
  }    
  //TIME SCALE (bottom left)
  else if (x < this.trackLabelWidth && y > this.canvasHeight - this.timeScrollHeight) {         
    this.timeScale = Math.max(0.01, Math.min((this.trackLabelWidth - x) / this.trackLabelWidth, 1));
    this.draggingTimeScale = true;   
    //this.save(); //TODO: load save timeline
  }   
  //HORIZONTAL SCROLL BAR
  else if (x > this.trackLabelWidth && y > this.canvasHeight - this.timeScrollHeight) {
    if (x >= this.trackLabelWidth + this.timeScrollThumbPos && x <= this.trackLabelWidth + this.timeScrollThumbPos + this.timeScrollThumbWidth) {
      this.timeScrollThumbDragOffset = x - this.trackLabelWidth - this.timeScrollThumbPos;
      this.draggingTimeScrollThumb = true;
    }
  }
}

Timeline.prototype.onCanvasMouseMove = function(event) { 
  var x = event.layerX;
  var y = event.layerY;
     
  if (this.draggingTracksScrollThumb) {         
    this.tracksScrollThumbPos = y - this.headerHeight - this.tracksScrollThumbDragOffset;
    if (this.tracksScrollThumbPos < 0) {
      this.tracksScrollThumbPos = 0;
    }
    if (this.tracksScrollThumbPos + this.tracksScrollThumbHeight > this.tracksScrollHeight) {
      this.tracksScrollThumbPos = Math.max(0, this.tracksScrollHeight - this.tracksScrollThumbHeight);    
    }                                              
    if (this.tracksScrollHeight - this.tracksScrollThumbHeight > 0) {
      this.tracksScrollY = this.tracksScrollThumbPos/(this.tracksScrollHeight - this.tracksScrollThumbHeight);
    }              
    else {
      this.tracksScrollY = 0;
    }                                                                                                         
  }   
  if (this.draggingTimeScrollThumb) {
    this.timeScrollThumbPos = x - this.trackLabelWidth - this.timeScrollThumbDragOffset;
    if (this.timeScrollThumbPos < 0) {
      this.timeScrollThumbPos = 0;
    }  
    if (this.timeScrollThumbPos + this.timeScrollThumbWidth > this.timeScrollWidth) {
      this.timeScrollThumbPos = Math.max(0, this.timeScrollWidth - this.timeScrollThumbWidth);    
    }  
    if (this.timeScrollWidth - this.timeScrollThumbWidth > 0) {
      this.timeScrollX = this.timeScrollThumbPos/(this.timeScrollWidth - this.timeScrollThumbWidth);
    }              
    else {
      this.timeScrollX = 0;
    }
  } 
} 

Timeline.prototype.onDocumentMouseMove = function(event) { 
  var x = event.layerX;
  var y = event.layerY;
  
  if (this.draggingTime) {
    this.time = this.xToTime(x);
    var animationEnd = this.findVideoDuration();
    if (this.time < 0) this.time = 0;
    if (this.time > animationEnd) this.time = animationEnd;  
    this.prevTime = this.time - 1/30; //FIXME: hardcoded frame delta 1/30
    this.synchVideos()
  }  
  // if (this.draggingKeys) {
  //   for(var i=0; i<this.selectedKeys.length; i++) {
  //     var draggedKey = this.selectedKeys[i];
  //     draggedKey.time = Math.max(0, this.xToTime(x));
  //     this.sortTrackKeys(draggedKey.track);
  //     this.rebuildSelectedTracks();
  //   } 
  //   this.cancelKeyClick = true;   
  //   this.timeScrollThumbPos = this.timeScrollX * (this.timeScrollWidth - this.timeScrollThumbWidth);  
  // }    

  if (this.draggingTimeScale) {
    this.timeScale = Math.max(0.01, Math.min((this.trackLabelWidth - x) / this.trackLabelWidth, 1));  

    //this.save(); //TODO: load save timeline
  }
}

             

Timeline.prototype.onMouseUp = function(event) {
  if (this.draggingTime) {
    this.draggingTime = false;
  }        
  if (this.draggingKeys) {
    this.draggingKeys = false;    
  }     
  if (this.draggingTracksScrollThumb) {
    this.draggingTracksScrollThumb = false;
  }        
  if (this.draggingTimeScale) {
    this.draggingTimeScale = false;
  }                     
  if (this.draggingTimeScrollThumb) {
    this.draggingTimeScrollThumb = false;   
  }
}

Timeline.prototype.onMouseClick = function(event) {
  if (event.layerX < 1*this.headerHeight - 4 * 0 && event.layerY < this.headerHeight) {
    this.play();
  }                     
  if (event.layerX > 1*this.headerHeight - 4 * 0 && event.layerX < 2*this.headerHeight - 4 * 1 && event.layerY < this.headerHeight) {
    this.pause();
  }
  
  if (event.layerX > 2*this.headerHeight - 4 * 1 && event.layerX < 3*this.headerHeight - 4 * 2 && event.layerY < this.headerHeight) {
    this.stop();
  }
  
  if (event.layerX > 3*this.headerHeight - 4 * 2 && event.layerX < 4*this.headerHeight - 4 * 3 && event.layerY < this.headerHeight) {
    this.export();
  }          
   
  if (this.selectedKeys.length > 0 && !this.cancelKeyClick) {
    //this.showKeyEditDialog(event.pageX, event.pageY); //TODO add annotation on click
  }  
}  

Timeline.prototype.onMouseDoubleClick = function(event) {
  var x = event.layerX;
  var y = event.layerY;
  
  if (x > this.trackLabelWidth && y < this.headerHeight) {
    //timeline
    var timeStr = prompt("Enter time") || "0:0:0"; 
    var timeArr = timeStr.split(":");
    var seconds = 0;
    var minutes = 0;  
    var hours = 0;
    if (timeArr.length > 0) seconds = parseInt(timeArr[timeArr.length-1]);
    if (timeArr.length > 1) minutes = parseInt(timeArr[timeArr.length-2]);
    if (timeArr.length > 2) hours = parseInt(timeArr[timeArr.length-3]);
    this.time = this.totalTime = hours * 60 * 60 + minutes * 60 + seconds;
  }
  // else if (x > this.trackLabelWidth && this.selectedKeys.length == 0 && y > this.headerHeight && y < this.canvasHeight - this.timeScrollHeight) {
  //   this.addKeyAt(x, y);
  // }     
}   


//    _____  _____       __          _______ _   _  _____ 
//   |  __ \|  __ \     /\ \        / /_   _| \ | |/ ____|
//   | |  | | |__) |   /  \ \  /\  / /  | | |  \| | |  __ 
//   | |  | |  _  /   / /\ \ \/  \/ /   | | | . ` | | |_ |
//   | |__| | | \ \  / ____ \  /\  /   _| |_| |\  | |__| |
//   |_____/|_|  \_\/_/    \_\/  \/   |_____|_| \_|\_____|
//                                                        
//                                                        

Timeline.prototype.drawTrack = function(track, y) {        
  var xshift = 5;

  //object track header background
  if (this.currentVideo == track.index)
    this.drawRect(0, y - this.trackLabelHeight + 1, this.trackLabelWidth, this.trackLabelHeight-1, "#88FFFF");     
	else
	 this.drawRect(0, y - this.trackLabelHeight + 1, this.trackLabelWidth, this.trackLabelHeight-1, "#FFFFFF");    
	//label color
	this.c.fillStyle = "#000000";
                                                     
  
  //bottom track line
  this.drawLine(0, y, this.canvas.width, y, "#FFFFFF");
  //draw track label
  this.c.fillText(track.name, xshift, y - this.trackLabelHeight/4);
                    
}

Timeline.prototype.drawLine = function(x1, y1, x2, y2, color) { 
	this.c.strokeStyle = color;     
	this.c.beginPath();
	this.c.moveTo(x1+0.5, y1+0.5);
	this.c.lineTo(x2+0.5, y2+0.5);
	this.c.stroke();
}

Timeline.prototype.drawRect = function(x, y, w, h, color) {
	this.c.fillStyle = color;
	this.c.fillRect(x, y, w, h);  
} 

Timeline.prototype.drawCenteredRect = function(x, y, w, h, color) {
	this.c.fillStyle = color;
	this.c.fillRect(x-w/2, y-h/2, w, h);  
}

Timeline.prototype.drawRombus = function(x, y, w, h, color, drawLeft, drawRight, strokeColor) {
	this.c.fillStyle = color;       
	if (strokeColor) {     
	  this.c.lineWidth = 2;
    this.c.strokeStyle = strokeColor;
    this.c.beginPath();
    this.c.moveTo(x, y - h/2);
    this.c.lineTo(x + w/2, y); 
    this.c.lineTo(x, y + h/2);
    this.c.lineTo(x - w/2, y);
    this.c.lineTo(x, y - h/2);   
    this.c.stroke(); 
    this.c.lineWidth = 1;
  }   
	     
	if (drawLeft) {     
  	this.c.beginPath();
  	this.c.moveTo(x, y - h/2); 
  	this.c.lineTo(x - w/2, y);
    this.c.lineTo(x, y + h/2);  
    this.c.fill();   
  }  
  
  if (drawRight) {
    this.c.beginPath();
  	this.c.moveTo(x, y - h/2);    
    this.c.lineTo(x + w/2, y);  	
  	this.c.lineTo(x, y + h/2);  	
  	this.c.fill(); 
  }
}      





