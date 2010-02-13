function NewsarticleAssistant(args, newsItem) {
  this.newsItem = newsItem;
}

NewsarticleAssistant.prototype.setup = function() {
  $("title").innerHTML = this.newsItem.title;
  $("newsContainer").innerHTML = this.newsItem.desc;
};

NewsarticleAssistant.prototype.cleanup = function(event) {

}
