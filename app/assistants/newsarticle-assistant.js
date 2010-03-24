function NewsarticleAssistant(args, newsItem) {
  this.newsItem = newsItem;
}

NewsarticleAssistant.prototype.setup = function() {
  UIHelper.setupAppMenu(this);

  $("title").innerHTML = this.newsItem.title;
  $("newsContainer").innerHTML = this.newsItem.desc;
};

NewsarticleAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

NewsarticleAssistant.prototype.cleanup = function(event) {
}
