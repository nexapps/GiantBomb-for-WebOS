function BombcastAssistant() {
}

BombcastAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupCommandMenu(this, "bombcast");

  // setup list
  this.bombcastModel = {items: []};
  this.controller.setupWidget("bombcastList", {itemsCallback: this.loadBombcasts.bind(this), itemTemplate: "bombcast/bombcastitem"}, this.bombcastModel);

  // event listeners
  this.bombcastTapHandle = this.bombcastTap.bind(this);
  this.controller.listen("bombcastList", Mojo.Event.listTap, this.bombcastTapHandle);
};

BombcastAssistant.prototype.loadBombcasts = function(listWidget, offset, limit) {
  function _callback(success, data) {
    if (success) {
      listWidget.mojo.noticeAddedItems(0, data.items)
      listWidget.mojo.setLength(parseInt(data.items.length));
    } else {
      // TODO: impl
    }

    UIHelper.setSpin(this, false);
  }

 
  GBModel.loadBombcasts(_callback.bind(this));
}

BombcastAssistant.prototype.bombcastTap = function(event) {
  var args = {
    appId: "com.palm.app.streamingmusicplayer",
    name: "nowplaying"
  };

  var params = {
    target: event.item.url,
    title: event.item.title,
    mimeType: event.item.mime,
    thumbUrl: "http://media.giantbomb.com/uploads/0/27/933918-bombcast.jpg"
  };

  this.controller.stageController.pushScene(args, params);
}

BombcastAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

BombcastAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("bombcastList", Mojo.Event.listTap, this.bombcastTapHandle);
}
