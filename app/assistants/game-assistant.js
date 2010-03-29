function GameAssistant(args, gameApiUrl, name) {
  this.apiUrl = gameApiUrl;
  this.passedInName = name;
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
  
//  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  //this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  this.loadGame();
};

GameAssistant.prototype.loadGame = function() {
  GBModel.loadApiDetailUrl(this.apiUrl, this.onGameRecieved.bind(this));
}

GameAssistant.prototype.onGameRecieved = function(success, data) {
  if (success) {
    this.gameItem = data;

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

    // reviews
    if (data.reviews && data.reviews.length > 0) {
      $("reviewContainer").style.display = "block";
      $("reviewScore").src = "images/star-"+data.reviews[0].score+".png";
    }

    // data
    $("detailContainer").innerHTML = data.description;

  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}

GameAssistant.prototype.commandSelected = function(command) {
  if (!!command && command != this.currentView) {
    this.currentView = command;

      UIHelper.setSpin(this, true);

    if (command == "reviews") {
      this.onCommandSelectedRecieved(true);
    } else if (command == "overview") {
      this.onCommandSelectedRecieved(true);
    }
  }
}

GameAssistant.prototype.onCommandSelectedRecieved = function(success, data) {
  if (success) {
    // hide the small review area
    $("reviewContainer").style.display = "none";

    if (this.currentView == "reviews") {
      // review is already loaded

      var stars = "<div style='margin-bottom: 5px;'> <div style='float:right'>Review by "+this.gameItem.reviews[0].reviewer+"</div><img src='images/star-"+this.gameItem.reviews[0].score+".png'/></div>"
      $("detailContainer").innerHTML = stars + this.gameItem.reviews[0].description;
    } else if (this.currentView = "overview") {
      $("reviewContainer").style.display = "block";
      $("detailContainer").innerHTML = this.gameItem.description;
    }
  } else {
    // TODO: impl
  }

  UIHelper.setSpin(this, false);
}

GameAssistant.prototype.handleCommand = function(event) {
  if (event.command == "viewOptions") {
    var options = [];

    options.push({label: "Overview", command: "overview"});
    options.push({label: "Reviews", command: "reviews", disabled: !(this.gameItem.reviews && this.gameItem.reviews.length > 0)});
    options.push({label: "Images", command: "image", disabled: !(this.gameItem.images && this.gameItem.images.length > 0)});
    options.push({label: "Similar games", command: "similar", disabled: !(this.gameItem.similar_games && this.gameItem.similar_games.length > 0)});
    options.push({label: "Videos", command: "videos", disabled: !(this.gameItem.videos && this.gameItem.similar_games.videos > 0)});

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
  //this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);
}
