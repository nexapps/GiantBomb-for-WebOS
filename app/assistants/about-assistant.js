function AboutAssistant() {
}

AboutAssistant.prototype.setup = function() {
  UIHelper.setupAppMenu(this);
};

AboutAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

