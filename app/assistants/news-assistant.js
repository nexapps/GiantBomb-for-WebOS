function NewsAssistant() {
}

NewsAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupAppMenu(this);
  UIHelper.setupCommandMenu(this, "news");

  // setup list
  this.newsModel = {items: []};
  this.controller.setupWidget("newsList", {itemsCallback: this.loadNews.bind(this), itemTemplate: "news/newsitem"}, this.newsModel);

  // event listeners
  this.newsTapHandle = this.newsTap.bind(this);
  this.controller.listen("newsList", Mojo.Event.listTap, this.newsTapHandle);
};

NewsAssistant.prototype.loadNews = function(listWidget, offset, limit) {
  function _callback(success, data) {
    if (success) {
      listWidget.mojo.noticeAddedItems(0, data.items)
      listWidget.mojo.setLength(parseInt(data.items.length));
    } else {
      // TODO: impl
    }

    UIHelper.setSpin(this, false);
  }

 
  GBModel.loadNews(_callback.bind(this));
}

NewsAssistant.prototype.newsTap = function(event) {
  this.controller.stageController.pushScene("newsarticle", {transition: Mojo.Transition.zoomFade}, event.item, true);
}

NewsAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

NewsAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("newsList", Mojo.Event.listTap, this.newsTapHandle);
}
