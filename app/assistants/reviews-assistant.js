function ReviewsAssistant() {
}

ReviewsAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupCommandMenu(this, "reviews");

  // setup list
  this.reviewsModel = {items: []};
  this.controller.setupWidget("reviewsList", {itemsCallback: this.loadReviews.bind(this), itemTemplate: "reviews/reviewitem",}, this.reviewsModel);

  this.reviewTapHandle = this.onReviewTap.bind(this);
  this.controller.listen("reviewsList", Mojo.Event.listTap, this.reviewTapHandle);
};

ReviewsAssistant.prototype.loadReviews = function(listWidget, offset, limit) {
  GBModel.loadReviews(this.onReviewsRecieved.bind(this, listWidget, offset, limit), offset, limit);
}

ReviewsAssistant.prototype.onReviewsRecieved = function(listWidget, offset, limit, success, data) {
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

ReviewsAssistant.prototype.onReviewTap = function(event) {
  this.controller.stageController.pushScene("review", {transition: Mojo.Transition.zoomFade}, event.item, true);
}

ReviewsAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

ReviewsAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("reviewsList", Mojo.Event.listTap, this.reviewTapHandle);
}
