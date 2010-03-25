function DetailAssistant(args, searchItem) {
  this.searchItem = searchItem;
}

DetailAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, true);

  UIHelper.setupAppMenu(this);

  $("title").innerHTML = this.searchItem.name;

  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  GBModel.loadApiDetailUrl(this.searchItem.api_detail_url, this.onItemRecieved.bind(this));
};

DetailAssistant.prototype.onItemRecieved = function(success, item) {
  if (success) {
    this.detailItem = item;

    $("detailContainer").innerHTML = item.description;

    if (this.searchItem.resource_type == "character") {
      $("subtitle").innerHTML = "<b>Character</b> that appears in "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "game") {
      $("subtitle").innerHTML = "<b>Game</b> consisting of "+item.releases.length+" releases";
    } else if (this.searchItem.resource_type == "franchise") {
      $("subtitle").innerHTML = "<b>Game franchise</b> comprised of "+item.games.length+" games";
    } else if (this.searchItem.resource_type == "location") {
      $("subtitle").innerHTML = "<b>Location</b> that appears in "+item.games.length+" games";
    } else {
      $("subtitle").innerHTML = "<b>"+this.searchItem.resource_type[0].toUpperCase() + this.searchItem.resource_type.substr(1)+"</b>";
    }

    $("viewOriginalContainer").style.display = "block";
  } else {
    // TODO: handle error case
  }

  UIHelper.setSpin(this, false);
}

DetailAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

DetailAssistant.prototype.viewOriginalTap = function(event) {
  if (this.detailItem) {
    this.controller.serviceRequest("palm://com.palm.applicationManager",
      {
        method: "open",
        parameters: {
          id: "com.palm.app.browser",
          params: {
            scene: "page",
            target: this.detailItem.site_detail_url
          }
        }
      }
    );
  }
}

DetailAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);
}
