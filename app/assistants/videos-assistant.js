function VideosAssistant() {
}

VideosAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupCommandMenu(this, "videos");

  // setup list
  this.newsModel = {items: []};
  this.controller.setupWidget("videosList", {itemsCallback: this.loadVideos.bind(this), itemTemplate: "videos/videoitem",}, this.newsModel);

  this.videoTapHandle = this.onVideoTap.bind(this);
  this.controller.listen("videosList", Mojo.Event.listTap, this.videoTapHandle);
};

VideosAssistant.prototype.loadVideos = function(listWidget, offset, limit) {
  GBModel.loadVideos(this.onVideosRecieved.bind(this, listWidget, offset, limit), offset, limit);
}

VideosAssistant.prototype.onVideosRecieved = function(listWidget, offset, limit, success, data) {
  if (success) {
    listWidget.mojo.noticeUpdatedItems(offset, data.items)
    listWidget.mojo.setLength(parseInt(data.totalCount));

    // mem cleanup? not sure this works
    data = null;
  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}

VideosAssistant.prototype.onVideoTap = function(event) {
  var args = {
    appId: "com.palm.app.videoplayer",
    name: "nowplaying"
  };
  Mojo.Log.info(event.item.url);
  return
  var params = {
    target: event.item.url,
    title: event.item.title,
    thumbUrl: event.item.superImage
  };

  this.controller.stageController.pushScene(args, params);
}

VideosAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

VideosAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("videosList", Mojo.Event.listTap, this.videoTapHandle);
}
