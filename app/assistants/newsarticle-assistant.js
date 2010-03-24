function NewsarticleAssistant(args, newsItem) {
  this.newsItem = newsItem;
}

NewsarticleAssistant.prototype.setup = function() {
  UIHelper.setupAppMenu(this);

  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  $("title").innerHTML = this.newsItem.title;
  $("newsContainer").innerHTML = this.newsItem.desc;
};

NewsarticleAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

NewsarticleAssistant.prototype.viewOriginalTap = function(event) {
  this.controller.serviceRequest("palm://com.palm.applicationManager",
    {
      method: "open",
      parameters: {
        id: "com.palm.app.browser",
        params: {
          scene: "page",
          target: this.newsItem.link
        }
      }
    }
  );
}

NewsarticleAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);
}
