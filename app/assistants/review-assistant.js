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

  var reviewDetails = "Review for ";

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
