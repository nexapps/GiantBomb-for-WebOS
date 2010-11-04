var UIHelper = {currentScene: null, context: null, commandMenuModel: null, appMenuModel: null};

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
  //items.push({icon: "xapp-calendar", label: "Releases", command: "releases"});
  items.push({iconPath: "images/podcast.png", label: "Bombcast", command: "bombcast"});

  modelitems.push({toggleCmd: scene, items: items});

  modelitems.push({});

  return modelitems;
}

UIHelper.setupAppMenu = function(context) {
  if (!this.appMenuModel) {
    var items = [];
    items.push(Mojo.Menu.editItem);
    items.push({label: "About...", command: "about", disabled: false});
    items.push({label: "Help", command: Mojo.Menu.helpCmd, disabled: false});
  
    this.appMenuModel = {items: items};
  }

  context.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
}

UIHelper.showError = function(scene, errorMsg, tryAgainCallback) {
  scene.controller.showAlertDialog({
    onChoose: function() {window.setTimeout(function(){tryAgainCallback()}, 300)},
    title: "Error",
    message: errorMsg,
    choices: [{label: "Try Again", value:"tryagain", type:"affirmative"}]
  });
}

UIHelper.fixupLinks = function(desc) {
  var gblinks = desc.match(new RegExp('<a[^>]*href="http://www.giantbomb.com/[^"]*">([^<]*)</a>', "gi"))

  if (gblinks) {
    for (var i = 0; i < gblinks.length; i++) {
      //Mojo.Log.info(gblinks[i] + "\n\n");
      var link = gblinks[i].match(new RegExp("href=\"([^\"]*)\"", "i"))[1];
      var name = gblinks[i].match(new RegExp(">([^<]*)<", "i"))[1];
      desc = desc.replace(gblinks[i], "<span class='newsgblink' link='"+link+"'>"+name+"</span>");
    }
  }

  return desc;
}

UIHelper.buildFromLink = function(link) {
 // url is like this: http://www.giantbomb.com/kinect-support/92-3249/
  var split = link.split("/");
  var data = split[split.length-2];
  split = data.split("-");
  var type = parseInt(split[0], 10);
  var id = split[1];

  var item = {};
  switch (type) {
    case 61:
      item.resource_type = "game";
      item.api_detail_url = "http://api.giantbomb.com/game/"+id+"/";
      break;
    case 62:
      item.resource_type = "franchise";
      item.api_detail_url = "http://api.giantbomb.com/franchise/"+id+"/";
      break;
    case 92:
      item.resource_type = "concept";
      item.api_detail_url = "http://api.giantbomb.com/concept/"+id+"/";
      break;
    case 94:
      item.resource_type = "character";
      item.api_detail_url = "http://api.giantbomb.com/character/"+id+"/";
      break;
    case 60:
      item.resource_type = "platform";
      item.api_detail_url = "http://api.giantbomb.com/platform/"+id+"/";
      break;
    case 72:
      item.resource_type = "person";
      item.api_detail_url = "http://api.giantbomb.com/person/"+id+"/";
      break;
    case 65:
      item.resource_type = "company";
      item.api_detail_url = "http://api.giantbomb.com/company/"+id+"/";
      break;
    case 95:
      item.resource_type = "location";
      item.api_detail_url = "http://api.giantbomb.com/location/"+id+"/";
      break;
    case 59:
      item.resource_type = "accessory";
      item.api_detail_url = "http://api.giantbomb.com/accessory/"+id+"/";
      break;
    case 141:
      item.resource_type = "review";
      item.api_detail_url = "http://api.giantbomb.com/review/"+id+"/";
      break;
    case 17:
      item.resource_type = "video";
      item.api_detail_url = "http://api.giantbomb.com/video/"+id+"/";
      break;
  }

  return item;
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
  } else if (["news", "newsarticle", "reviews", "review", "search", "videos", "bombcast"].indexOf(event.command) > -1) {
    // default - switch to scene
    UIHelper.currentScene = event.command;
    context.controller.stageController.popScene();
    context.controller.stageController.pushScene(event.command, {transition: Mojo.Transition.crossFade});
  }
}

