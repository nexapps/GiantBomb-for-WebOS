function SearchAssistant() {
  this.searchBoxModel = {value: ""};
  this.itemModel = {items: []};

  this.currentOffset = 0;
  this.totalItems = 0;
}

SearchAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, false);

  UIHelper.setupAppMenu(this);
  UIHelper.setupCommandMenu(this, "search");

  var attributes = {
    hintText: "Search Giant Bomb...",
    focus: false,
    enterSubmits: true,
    multiline: false,
    modifierState: Mojo.Widget.sentenceCase,
    focusMode: Mojo.Widget.focusInsertMode,
    requiresEnterKey: true,
    changeOnKeyPress: true
  };

  this.controller.setupWidget("search-terms", attributes, this.searchBoxModel);

  this.controller.setupWidget("resultsList", {itemsCallback2: this.loadSearch.bind(this), lookahead: 10, renderLimit: 12, itemTemplate: "search/searchitem"}, this.itemModel);

  this.listTapHandle = this.listTap.bind(this);
  this.controller.listen("resultsList", Mojo.Event.listTap, this.listTapHandle);

  this.controller.setupWidget("prevButton", {}, this.prevModel = {buttonLabel: "Previous", buttonClass: "palm-button", disabled: true});
  this.controller.setupWidget("nextButton", {}, this.nextModel = {buttonLabel: "Next", buttonClass: "palm-button", disabled: true});

  this.previousTapHandle = this.previousTap.bind(this);
  this.controller.listen("prevButton", Mojo.Event.tap, this.previousTapHandle);

  this.nextTapHandle = this.nextTap.bind(this);
  this.controller.listen("nextButton", Mojo.Event.tap, this.nextTapHandle);

  this.searchTermsChangedHandle = this.searchTermsChanged.bind(this);
  this.controller.listen("search-terms", Mojo.Event.propertyChanged, this.searchTermsChangedHandle);

  this.doSearchHandle = this.doSearch.bind(this);
  this.controller.listen("search-button", Mojo.Event.tap, this.doSearchHandle);
};

SearchAssistant.prototype.doSearch = function() {
  this.searchTerm = this.searchBoxModel.value.trim();

  if (!this.searchTerm) {
    return;
  }

  UIHelper.setSpin(this, true);

  this.searchTerm = this.searchBoxModel.value;

  // clear
  this.controller.get("resultsList").mojo.setLength(0);
	this.controller.getSceneScroller().mojo.revealTop(0);

  this.loadSearch(this.controller.get("resultsList"), 0, 20);
}

SearchAssistant.prototype.loadSearch = function(listWidget, offset, limit) {
  if (!this.searchTerm) {
    return;
  }

  GBModel.loadSearch(this.searchTerm, this.onSearchRecieved.bind(this, listWidget, offset, limit), offset, limit);
}

SearchAssistant.prototype.onSearchRecieved = function(listWidget, offset, limit, success, data) {
    if (success) {
      listWidget.mojo.noticeUpdatedItems(0, data.items)  
      this.currentOffset = offset;
      this.totalItems = data.totalCount;

      $("navButtonsContainer").style.display = "block";

      this.prevModel.disabled = (offset+limit <= 20);
      this.nextModel.disabled = (data.totalCount <= offset+limit);

      this.controller.modelChanged(this.prevModel);
      this.controller.modelChanged(this.nextModel);
      data = null;

      this.controller.getSceneScroller().mojo.revealTop(0);
    } else {
      // TODO: impl
      Mojo.Log.info("error");
    }

    UIHelper.setSpin(this, false);
}

SearchAssistant.prototype.searchTermsChanged = function(event) {
  // check for enter
  if (event.originalEvent.type == "keyup" && event.originalEvent.keyCode == Mojo.Char.enter) {
    this.doSearch();
  } else {
    this.controller.get("search-button").style.visibility = (event.value === "") ? "hidden" : "visible";
  }
}

SearchAssistant.prototype.previousTap = function(event) {
  UIHelper.setSpin(this, true);

  this.loadSearch(this.controller.get("resultsList"), this.currentOffset-20, 20);
}

SearchAssistant.prototype.nextTap = function(event) {
  UIHelper.setSpin(this, true);

  this.loadSearch(this.controller.get("resultsList"), this.currentOffset+20, 20);
}


SearchAssistant.prototype.listTap = function(event) {
  if (event.item.resource_type == "game") {
    this.controller.stageController.pushScene("game", {transition: Mojo.Transition.zoomFade}, event.item.api_detail_url, event.item.name);
  } else {
    this.controller.stageController.pushScene("detail", {transition: Mojo.Transition.zoomFade}, event.item, true);
  }
}

SearchAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

SearchAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("search-button", Mojo.Event.tap, this.doSearchHandle);
  this.controller.stopListening("search-terms", Mojo.Event.propertyChanged, this.searchTermsChangedHandle);
  this.controller.stopListening("resultsList", Mojo.Event.listTap, this.listTapHandle);
  this.controller.stopListening("prevButton", Mojo.Event.tap, this.previousTapHandle);
  this.controller.stopListening("nextButton", Mojo.Event.tap, this.nextTapHandle);
}
