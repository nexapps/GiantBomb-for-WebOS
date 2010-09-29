function NewsarticleAssistant(args, newsItem) {
  this.newsItem = newsItem;
}

NewsarticleAssistant.prototype.setup = function() {
  UIHelper.setupAppMenu(this);

  this.viewOriginalTapHandle = this.viewOriginalTap.bind(this);
  this.controller.listen("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);

  $("title").innerHTML = this.newsItem.title;

  var desc = this.newsItem.desc;

  //var re = new RegExp('<div(?:"[^"]+")*[^>]+>.*<embed src="([^"]*)"(?:"[^"]+")*[^>]+>.*</div>', "g");

  // both regexps taken with permission from http://code.google.com/p/giantbomb-android/source/browse/trunk/src/harris/GiantBomb/StringUtils.java
  // TODO: support multiples
  var re = new RegExp("<div[^>]+?rel=\"video\".*?>.+?src=\"(http://www.youtube.com.+?)\".+?div>", "g");

  var exec = re.exec(desc);
  if (exec) {
    if (exec[0]) {
      desc = desc.replace(exec[0], "<div class='newsVideoContainer' yturl='"+encodeURIComponent(exec[1])+"'>Play Video</div>");
    }
  }

  var re2 = new RegExp("<div[^>]+?rel=\"(video|embed)\".*?>.+?paramsURI=(http%3A//www.giantbomb.com.+?)\".+?div>", "g");
  exec = re2.exec(desc);
  if (exec) {
    if (exec[0]) {
      desc = desc.replace(exec[0], "<div class='newsVideoContainer' gburl='"+encodeURIComponent(exec[2])+"'>Play Video</div>");
    }
  }

  // replace GB links
  var gblinks = desc.match(new RegExp('<a[^>]*href="http://www.giantbomb.com/[^"]*">([^<]*)</a>', "gi"))

  if (gblinks) {
    for (var i = 0; i < gblinks.length; i++) {
      Mojo.Log.info(gblinks[i] + "\n\n");
      var link = gblinks[i].match(new RegExp("href=\"([^\"]*)\"", "i"))[1];
      var name = gblinks[i].match(new RegExp(">([^<]*)<", "i"))[1];
      desc = desc.replace(gblinks[i], "<span class='newsgblink' link='"+link+"'>"+name+"</span>");
    }
  }

  this.videoTapHandle = this.videoTap.bind(this);
  this.controller.listen("newsContainer", Mojo.Event.tap, this.videoTapHandle);

  this.linkTapHandle = this.linkTap.bind(this);
  this.controller.listen("newsContainer", Mojo.Event.tap, this.linkTapHandle);

  $("newsContainer").innerHTML = desc;

  if (this.controller.stageController.setWindowOrientation) {
    this.controller.stageController.setWindowOrientation("free");
  }
};

NewsarticleAssistant.prototype.videoTap = function(event) {
  if (event.target.className == "newsVideoContainer") {
    var gburl = event.target.getAttribute("gburl");
    if (gburl) {
      this.loadGBVideo(decodeURIComponent(gburl));
    } else {
      var yturl = event.target.getAttribute("yturl");
      if (yturl) {
        this.showYoutubeVideo(decodeURIComponent(yturl));
      }
    }
  }
}

NewsarticleAssistant.prototype.loadGBVideo = function(url) {
  function _success(transport) {
    var xmlobject = (new DOMParser()).parseFromString(transport.responseText, "text/xml");

    var items = document.evaluate("/mediaPlayer/playList/clip/URI", xmlobject, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

    var item;
    var bitr = 0;
    var url = "";

    while (item = items.iterateNext()) {
      var bitrate = parseInt(item.getAttribute("bitRate"));
      if (bitrate > bitr) {
        url = item.textContent;
        bitr = bitrate;

        // replace bitr from url
        url = url.replace("_"+bitr, "");
      }
    }

    if (url) {
      var title = document.evaluate("/mediaPlayer/playList/clip/billBoard/title", xmlobject, null, XPathResult.STRING_TYPE, null).stringValue;
      var img = document.evaluate("/mediaPlayer/playList/clip/billBoard/bg", xmlobject, null, XPathResult.STRING_TYPE, null).stringValue;

      this.showVideo(GBModel.processVideoUrl(url), title, img);
    }
  }

  function _failure() {
    Mojo.Log.info("video load error");
  }

  new Ajax.Request(url.replace("%3A", ":"), {
      method: "get",
      onSuccess: _success.bind(this),
      onFailure: _failure.bind(this)
  });
}

NewsarticleAssistant.prototype.showVideo = function(url, title, thumb) {
  var args = {
    appId: "com.palm.app.videoplayer",
    name: "nowplaying"
  };

  var params = {
    target: url,
    title: title,
    thumbUrl: thumb
  };

  this.controller.stageController.pushScene(args, params);
}

NewsarticleAssistant.prototype.showYoutubeVideo = function(url) {
  url = url.replace("/v/", "/watch?v=");

  this.controller.serviceRequest("palm://com.palm.applicationManager", {
      method: "launch",
      parameters: {
        id: "com.palm.app.youtube",
        params: {
          target: url
        }
     }
  });
}

NewsarticleAssistant.prototype.linkTap = function(event) {
  Mojo.Log.info("tappy")
  event.stop();
}

NewsarticleAssistant.prototype.handleCommand = function(event) {
  if (event.type == Mojo.Event.command) {
    UIHelper.changeScene(this, event);
  }
}

NewsarticleAssistant.prototype.viewOriginalTap = function(event) {
  this.controller.serviceRequest("palm://com.palm.applicationManager",
    {
      method: "open",
      parameters: {
        id: "com.palm.app.browser",
        params: {
          scene: "page",
          target: this.newsItem.link
        }
      }
    }
  );
}

NewsarticleAssistant.prototype.cleanup = function(event) {
  this.controller.stopListening("viewOriginal", Mojo.Event.tap, this.viewOriginalTapHandle);
  this.controller.stopListening("newsContainer", Mojo.Event.tap, this.videoTapHandle);
}
