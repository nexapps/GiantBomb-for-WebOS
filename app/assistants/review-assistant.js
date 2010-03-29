function ReviewAssistant(args, reviewItem) {
  this.reviewItem = reviewItem
}

ReviewAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  $("title").innerHTML = this.reviewItem.game.name;

  UIHelper.setupAppMenu(this);
  
  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  var reviewDetails = "<b>Review</b> for ";

  if (this.reviewItem.dlc_name) {
    reviewDetails += this.reviewItem.dlc_name + ", an add-on for " + this.reviewItem.game.name;
  } else {
    reviewDetails += this.reviewItem.game.name;
  }

  $("reviewDetails").innerHTML = reviewDetails + " by " + this.reviewItem.reviewer;

  this.loadReview();
};

ReviewAssistant.prototype.loadReview = function() {
  GBModel.loadReview(this.reviewItem, this.onReviewRecieved.bind(this));
}

ReviewAssistant.prototype.onReviewRecieved = function(success, data) {
  if (success) {
    $("reviewContainer").innerHTML = data.description;
    $("score").src = "images/star-"+data.score+".png";
    // mem cleanup? not sure this works
    data = null;

    this.loadGame();
  } else {
    // TODO: handle error case
    UIHelper.setSpin(this, false);
  }
}

ReviewAssistant.prototype.loadGame = function() {
  GBModel.loadApiDetailUrl(this.reviewItem.game.api_detail_url, this.onGameRecieved.bind(this));
}

ReviewAssistant.prototype.onGameRecieved = function(success, data) {
  if (success) {
    $("gameImage").src = data.image.thumb_url;

    // platforms
    var platforms = "";
    for (var i = 0; i < data.platforms.length; i++) {
      platforms += "<div class='platformTag'>"+data.platforms[i].name + "</div>";
    }
    $("platforms").innerHTML = platforms;

    // 2010-03-16 00:00:00
    var ord = data.original_release_date;
    var d = new Date(data.original_release_date.replace("-", " "))
    $("release").innerHTML = "US Release: " + Mojo.Format.formatDate(d, "MMM d, yyyy");

    // devs
    var devs = "";
    for (var i = 0; i < data.developers.length; i++) {
      devs += "<div class='developer'>"+data.developers[i].name + "</div>";
    }
    $("developers").innerHTML = devs;
  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}

ReviewAssistant.prototype.viewOriginalTap = function(event) {
  this.controller.serviceRequest("palm://com.palm.applicationManager",
    {
      method: "open",
      parameters: {
        id: "com.palm.app.browser",
        params: {
          scene: "page",
          target: this.reviewItem.site_detail_url
        }
      }
    }
  );
}

ReviewAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

ReviewAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);
}
