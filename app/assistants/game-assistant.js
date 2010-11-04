function GameAssistant(args, gameApiUrl, name, optionalMode) {
  this.apiUrl = gameApiUrl;
  this.passedInName = name;

  this.optionalMode = optionalMode;
}

GameAssistant.prototype.setup = function() {
  if (this.passedInName) {
    $("title").innerHTML = this.passedInName;
  }

  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupAppMenu(this);

  var model = {visible: true, items: []};

  model.items.push({});
  model.items.push({id: "view", label: "View", command: "viewOptions"});

  this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, model);

  this.reviewTapHandle = this.onReviewButtonTap.bind(this);
  this.controller.listen("reviewButton", Mojo.Event.tap, this.reviewTapHandle);

  this.linkTapHandle = this.linkTap.bind(this);
  this.controller.listen("detailContainer", Mojo.Event.tap, this.linkTapHandle);

  this.loadGame();
};

GameAssistant.prototype.loadGame = function() {
  GBModel.loadApiDetailUrl(this.apiUrl, this.onGameRecieved.bind(this));
}

GameAssistant.prototype.onGameRecieved = function(success, data) {
  if (success) {
    this.gameItem = data;

    $("title").innerHTML = data.name;

    $("gameImage").src = data.image.thumb_url;

    // platforms
    var platforms = "";
    for (var i = 0; i < data.platforms.length; i++) {
      platforms += "<div class='platformTag'>"+data.platforms[i].name + "</div>";
    }
    $("platforms").innerHTML = platforms;

    // 2010-03-16 00:00:00
    if (data.original_release_date) {
      var ord = data.original_release_date;
      var d = new Date(data.original_release_date.replace("-", " "))
      $("release").innerHTML = "US Release: " + Mojo.Format.formatDate(d, "MMM d, yyyy");
    } else {
      $("release").innerHTML = "US Release: N/A";
    }

    // devs
    var devs = "";
    for (var i = 0; i < data.developers.length; i++) {
      devs += "<div class='developer'>"+data.developers[i].name + "</div>";
    }
    $("developers").innerHTML = devs;

    // reviews
    if (data.reviews && data.reviews.length > 0) {
      $("reviewContainer").style.display = "block";
      $("reviewScore").src = "images/star-"+data.reviews[0].score+".png";
    }

    if (this.optionalMode) {
      if (this.optionalMode == "review") {
        this.commandSelected("reviews");
      }
    } else {
      // data
      $("detailContainer").innerHTML = UIHelper.fixupLinks(data.description);
    }
  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}


GameAssistant.prototype.onReviewButtonTap = function() {
  this.commandSelected("reviews");
}

GameAssistant.prototype.commandSelected = function(command) {
  if (!!command && command != this.currentView) {
    this.currentView = command;
    UIHelper.setSpin(this, true);

    if (command == "reviews") {
      this.onCommandSelectedRecieved(true);
    } else if (command == "overview") {
      this.onCommandSelectedRecieved(true);
    } else if (command == "images" || command == "similar" || command == "videos") {
      this.onCommandSelectedRecieved(true);
    }
  }
}

GameAssistant.prototype.onCommandSelectedRecieved = function(success, data) {
  if (success) {
    // hide the small review area
    $("reviewContainer").style.display = "none";

    // clear any handles
    if (this.listTapHandle) {
      this.controller.stopListening("detailsList", Mojo.Event.listTap, this.listTapHandle);
      this.listTapHandle = null;
    }

    // scroll to top
    this.controller.getSceneScroller().mojo.revealTop(0);

    if (this.currentView == "reviews") {
      // get the oldest review
      var review = null;
      var rdate = null;

      for (var i = 0; i < this.gameItem.reviews.length; i++) {
        var d = new Date(this.gameItem.reviews[i].publish_date.replace("-", " "))
        if (rdate == null || rdate > d) {
          review = this.gameItem.reviews[i];
          rdate = d;
        }
      }

      var stars = "<div style='margin-bottom: 5px;'> <div style='float:right'>Review by "+review.reviewer+"</div><img src='images/star-"+review.score+".png'/></div>"
      $("detailContainer").innerHTML = stars + review.description;
    } else if (this.currentView == "overview") {
      if (this.gameItem.reviews && this.gameItem.reviews.length > 0) {
        $("reviewContainer").style.display = "block";
      }

      $("detailContainer").innerHTML = this.gameItem.description;
    } else if (this.currentView == "images") {
      $("detailContainer").innerHTML = "";
      this.controller.setupWidget("detailsList", this.attributes = {itemTemplate: "game/imageitem"}, this.detailsModel = {items: this.gameItem.images});
      this.controller.update($("detailContainer"), '<div id="detailsList" x-mojo-element="List"></div>');
      this.controller.instantiateChildWidgets($("detailContainer"));
      $("detailsList").mojo.setLengthAndInvalidate(this.gameItem.images.length);

      this.listTapHandle = this.onImageTap.bind(this);
      this.controller.listen("detailsList", Mojo.Event.listTap, this.listTapHandle);
    } else if (this.currentView == "similar") {
      $("detailContainer").innerHTML = "";
      this.controller.setupWidget("detailsList", this.attributes = {itemTemplate: "game/similaritem"}, this.detailsModel = {items: this.gameItem.similar_games});
      this.controller.update($("detailContainer"), '<div id="detailsList" x-mojo-element="List"></div>');
      this.controller.instantiateChildWidgets($("detailContainer"));
      $("detailsList").mojo.setLengthAndInvalidate(this.gameItem.similar_games.length);

      this.listTapHandle = this.onSimilarTap.bind(this);
      this.controller.listen("detailsList", Mojo.Event.listTap, this.listTapHandle);
    } else if (this.currentView == "videos") {
      $("detailContainer").innerHTML = "";
      this.controller.setupWidget("detailsList", this.attributes = {itemTemplate: "game/videoitem"}, this.detailsModel = {items: this.gameItem.videos});
      this.controller.update($("detailContainer"), '<div id="detailsList" x-mojo-element="List"></div>');
      this.controller.instantiateChildWidgets($("detailContainer"));
      $("detailsList").mojo.setLengthAndInvalidate(this.gameItem.videos.length);

      this.listTapHandle = this.onVideoTap.bind(this);
      this.controller.listen("detailsList", Mojo.Event.listTap, this.listTapHandle);
    }
  } else {
    // TODO: impl
  }

  UIHelper.setSpin(this, false);
}

GameAssistant.prototype.imageFetch = function(listWidget, offset, limit) {
  listWidget.mojo.noticeUpdatedItems(0, this.gameItem.images);
}

GameAssistant.prototype.onImageTap = function(event) {
  // get the selected index
  var idx = this.gameItem.images.indexOf(event.item);

  this.controller.stageController.pushScene("images", {transition: Mojo.Transition.zoomFade}, this.gameItem.images, idx);
}

GameAssistant.prototype.onSimilarTap = function(event) {
  this.controller.stageController.pushScene("game", {transition: Mojo.Transition.zoomFade}, event.item.api_detail_url, event.item.name);
}

GameAssistant.prototype.onVideoTap = function(event) {
  var args = {
    appId: "com.palm.app.videoplayer",
    name: "nowplaying"
  };

  var params = {
    target: GBModel.processVideoUrl(event.item.url),
    title: event.item.title,
    thumbUrl: event.item.image.super_url
  };

  this.controller.stageController.pushScene(args, params);
}

GameAssistant.prototype.linkTap = function(event) {
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


GameAssistant.prototype.handleCommand = function(event) {
  if (event.command == "viewOptions") {
    var options = [];

    options.push({label: "Overview", command: "overview"});
    options.push({label: "Reviews", command: "reviews", disabled: !(this.gameItem.reviews && this.gameItem.reviews.length > 0)});
    options.push({label: "Images", command: "images", disabled: !(this.gameItem.images && this.gameItem.images.length > 0)});
    options.push({label: "Similar games", command: "similar", disabled: !(this.gameItem.similar_games && this.gameItem.similar_games.length > 0)});
    options.push({label: "Videos", command: "videos", disabled: !(this.gameItem.videos && this.gameItem.videos.length > 0)});

    this.controller.popupSubmenu({
        onChoose: this.commandSelected.bind(this),
        toggleCmd: this.currentView ? this.currentView : "overview",
        items: options
    });
  } else if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

GameAssistant.prototype.cleanup = function(event) {
  if (this.listTapHandle) {
    this.controller.stopListening("detailsList", Mojo.Event.listTap, this.listTapHandle);
  }

  this.controller.stopListening("reviewButton", Mojo.Event.tap, this.reviewTapHandle);
  this.controller.stopListening("detailContainer", Mojo.Event.listTap, this.linkTapHandle);
}
