function DetailAssistant(args, searchItem) {
  this.searchItem = searchItem;
}

DetailAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupAppMenu(this);

  if (this.searchItem.name) {
    $("title").innerHTML = this.searchItem.name;
  }

  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  this.linkTapHandle = this.linkTap.bind(this);
  this.controller.listen("detailContainer", Mojo.Event.tap, this.linkTapHandle);


  GBModel.loadApiDetailUrl(this.searchItem.api_detail_url, this.onItemRecieved.bind(this));
};

DetailAssistant.prototype.onItemRecieved = function(success, item) {
  if (success) {
    this.detailItem = item;

    if (item.description) {
      // replace GB links
      $("detailContainer").innerHTML = UIHelper.fixupLinks(item.description);
    }

    if (item.name) {
      $("title").innerHTML = item.name;
    }

    if (this.videoTapHandle) {
      this.controller.stopListening("videosList", Mojo.Event.listTap, this.videoTapHandle);
      this.videoTapHandle = null;
    }
    try {
    if (this.searchItem.resource_type == "character") {
      $("subtitle").innerHTML = "<b>Character</b> that appears in "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "game") {
      $("subtitle").innerHTML = "<b>Game</b> consisting of "+item.releases.length+" releases";
    } else if (this.searchItem.resource_type == "franchise") {
      $("subtitle").innerHTML = "<b>Game franchise</b> comprised of "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "location") {
      $("subtitle").innerHTML = "<b>Location</b>";
    } else if (this.searchItem.resource_type == "company") {
      $("subtitle").innerHTML = "<b>Company</b> that makes video games";
    } else if (this.searchItem.resource_type == "person") {
      $("subtitle").innerHTML = "<b>Person</b> that is credited in "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "object") {
      $("subtitle").innerHTML = "<b>Object/thing</b> that appears in "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "concept") {
      $("subtitle").innerHTML = "<b>Concept</b> that appears in "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "platform") {
      $("subtitle").innerHTML = "Video game <b>platform</b>";
    } else if (this.searchItem.resource_type == "video") {
      $("subtitle").innerHTML = "<b>Video</b>";

      $("detailContainer").innerHTML = "<div id='videoItem' style='position: relative; margin-top: 10px'><img src='"+item.image.screen_url+"'/><div style='position: absolute; left: 0px; bottom: 0px'><img src='images/play-button.png'/></div></div>" + item.deck;

      this.videoTapHandle = this.onVideoTap.bind(this);
      this.controller.listen("videoItem", Mojo.Event.tap, this.videoTapHandle);
    } else {
      $("subtitle").innerHTML = "<b>"+this.searchItem.resource_type[0].toUpperCase() + this.searchItem.resource_type.substr(1)+"</b> + this";
    }
    } catch (e){
      Mojo.Log.error(e)
    }

    $("viewOriginalContainer").style.display = "block";
  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}

DetailAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

DetailAssistant.prototype.linkTap = function(event) {
  if (event.target.className == "newsgblink") {
    event.stop();
  
    var link = event.target.getAttribute("link")
    var item = UIHelper.buildFromLink(link);
  
    if (item.resource_type == "game") {
      this.controller.stageController.pushScene("game", {transition: Mojo.Transition.zoomFade}, item.api_detail_url, "");
    } else {
      this.controller.stageController.pushScene("detail", {transition: Mojo.Transition.zoomFade}, item, true);
    }
  }
}

DetailAssistant.prototype.onVideoTap = function(event) {
  var args = {
    appId: "com.palm.app.videoplayer",
    name: "nowplaying"
  };

  var params = {
    target: GBModel.processVideoUrl(this.detailItem.url),
    title: this.detailItem.name,
    thumbUrl: this.detailItem.image.super_url
  };

  this.controller.stageController.pushScene(args, params);
}

DetailAssistant.prototype.viewOriginalTap = function(event) {
  if (this.detailItem) {
    this.controller.serviceRequest("palm://com.palm.applicationManager",
      {
        method: "open",
        parameters: {
          id: "com.palm.app.browser",
          params: {
            scene: "page",
            target: this.detailItem.site_detail_url
          }
        }
      }
    );
  }
}

DetailAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  if (this.videoTapHandle) {
    this.controller.stopListening("videosList", Mojo.Event.listTap, this.videoTapHandle);
  }

  if (this.linkTapHandle) {
    this.controller.stopListening("detailContainer", Mojo.Event.listTap, this.linkTapHandle);
  }
}
