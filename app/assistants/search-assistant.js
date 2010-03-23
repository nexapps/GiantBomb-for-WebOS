function SearchAssistant() {
  this.searchBoxModel = {value: ""};
  this.itemModel = {items: []};
}

SearchAssistant.prototype.setup = function() {
  this.spinnerModel = {spinning: true};
  this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, this.spinnerModel);
  UIHelper.setSpin(this, false);

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

  this.controller.setupWidget("resultsList", {itemsCallback: this.loadSearch.bind(this), itemTemplate: "search/searchitem"}, this.itemModel);

  this.listTapHandle = this.listTap.bind(this);
  this.controller.listen("resultsList", Mojo.Event.listTap, this.listTapHandle);

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

  this.loadSearch(this.controller.get("resultsList"), 0, 40);
}

SearchAssistant.prototype.loadSearch = function(listWidget, offset, limit) {
  if (!this.searchTerm) {
    return;
  }

  GBModel.loadSearch(this.searchTerm, this.onSearchRecieved.bind(this, listWidget, offset, limit), offset, limit);
}

SearchAssistant.prototype.onSearchRecieved = function(listWidget, offset, limit, success, data) {
    if (success) {
      listWidget.mojo.noticeAddedItems(offset, data.items)
      listWidget.mojo.setLength(parseInt(data.items.length));

      data = null;
    } else {
      // TODO: impl
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

SearchAssistant.prototype.listTap = function(event) {
  this.controller.serviceRequest("palm://com.palm.applicationManager",
    {
      method: "open",
      parameters: {
        id: "com.palm.app.browser",
        params: {
          scene: "page",
          target: event.item.site_detail_url
        }
      }
    }
  );
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

}
