function ImagesAssistant(args, images, startPos) {
  this.images = images;
  this.currentPos = startPos;
}

ImagesAssistant.prototype.setup = function() {
  var model = {
    onLeftFunction: this.goLeft.bind(this),
    onRightFunction: this.goRight.bind(this)
  }

  this.controller.setupWidget("imageView", {noExtractFS: true}, model);

  this.updateDimensions();

  if (this.controller.stageController.setWindowOrientation) {
    this.controller.stageController.setWindowOrientation("free");
    this.controller.listen(document, "orientationchange", this.updateDimensions.bind(this));
  }
};

ImagesAssistant.prototype.updateDimensions = function(event) {
  var height = this.controller.window.innerHeight;
	var width = this.controller.window.innerWidth;
	
	if (event && event.position > 3) {
    $("imageView").mojo.manualSize(width, height);
	} else {
	  $("imageView").style.height = height + "px";
	  $("imageView").style.width = width + "px";
	}
	
}

ImagesAssistant.prototype.setImages = function() {
  var imgView = $("imageView");
  var l = this.images.length;

  // we load the screen version left/right to save bandwidth
  imgView.mojo.leftUrlProvided(this.currentPos > 0 ? this.images[this.currentPos-1].screen_url : null);
  imgView.mojo.centerUrlProvided(this.images[this.currentPos].super_url);
  imgView.mojo.rightUrlProvided((this.currentPos < this.images.length-1) ? this.images[this.currentPos+1].screen_url : null);
}

ImagesAssistant.prototype.goLeft = function(event) {
  if (this.currentPos > 0) {
    this.currentPos--;
    this.setImages();
  }
}

ImagesAssistant.prototype.goRight = function(event) {
  if (this.currentPos < this.images.length-1) {
    this.currentPos++;
    this.setImages();
  }
}

ImagesAssistant.prototype.aboutToActivate = function(event) {
  this.setImages();
}

ImagesAssistant.prototype.deactivate = function(event) {
  if (this.controller.stageController.setWindowOrientation) {
    this.controller.stageController.setWindowOrientation("up");
  }
}

ImagesAssistant.prototype.cleanup = function(event) {
}
