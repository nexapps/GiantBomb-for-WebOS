var UIHelper = {currentScene: null, context: null, commandMenuModel: null};

UIHelper.setupCommandMenu = function(context, scene) {
  this.context = context;

  var model = {visible: true, items: UIHelper.buildCommandMenu(scene)};

  UIHelper.commandMenuModel = model;

  this.context.controller.setupWidget(Mojo.Menu.commandMenu, {menuClas2s: "mv-bottom-fade"}, UIHelper.commandMenuModel);
}

UIHelper.buildCommandMenu = function(scene) {
  this.currentScene = scene;

  var modelitems = [];

  modelitems.push({});

  var items = [];
  items.push({icon: "xapp-web", label: "News", command: "news"});
  items.push({iconPath: "images/star.png", label: "Reviews", command: "reviews"});
  items.push({iconPath: "images/video.png", label: "Videos", command: "videos"});

  items.push({icon: "search", label: "Search", command: "search"});
  items.push({icon: "xapp-calendar", label: "Releases", command: "releases"});

  modelitems.push({toggleCmd: scene, items: items});

  modelitems.push({});

  return modelitems;
}

UIHelper.showError = function(scene, errorMsg, tryAgainCallback) {
  scene.controller.showAlertDialog({
    onChoose: function() {window.setTimeout(function(){tryAgainCallback()}, 300)},
    title: "Error",
    message: errorMsg,
    choices: [{label: "Try Again", value:"tryagain", type:"affirmative"}]
  });
}


UIHelper.setSpin = function(context, enabled) {
  if (enabled) {
    context.controller.get("spinContainer").show();
  } else {
    context.controller.get("spinContainer").hide();
  }

  var spinner = context.controller.get("spinner");
  if (spinner && spinner.mojo) {
    if (enabled) {
      spinner.mojo.start();
    } else {
      spinner.mojo.stop();
    }
  }
}


UIHelper.changeScene = function(context, event) {
  if (UIHelper.currentScene === event.command) {
    return;
  }

  if (event.command === Mojo.Menu.prefsCmd) {
    context.controller.stageController.pushScene("prefs", {transition: Mojo.Transition.crossFade});
  } else if (event.command === "about") {
    context.controller.stageController.pushScene("about", {transition: Mojo.Transition.crossFade});
  } else if (event.command === Mojo.Menu.helpCmd) {
    context.controller.stageController.pushScene("support", {transition: Mojo.Transition.crossFade});
  } else {
    // default - switch to scene
    UIHelper.currentScene = event.command;
    context.controller.stageController.popScene();
    context.controller.stageController.pushScene(event.command, {transition: Mojo.Transition.crossFade});
  }
}

