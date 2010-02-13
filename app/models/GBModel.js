var GBModel = {apiKey: "ffb160afb9ce611cfdf819c378b045b896ef227f", requestQueue: [], runningRequest: false, lastRequest: null}

GBModel.loadNews = function(callback) {
  function _success(transport) {
    // parse out data
    var xmlobject = (new DOMParser()).parseFromString(transport.responseText, "text/xml");

    var newsItems = [];

    var items = document.evaluate("/rss/channel/item", xmlobject, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    var item;
    while (item = items.iterateNext()) {
      // title
      var title = document.evaluate("title", item, null, XPathResult.STRING_TYPE, null).stringValue;

      // pub date
      var pubDate = document.evaluate("pubDate", item, null, XPathResult.STRING_TYPE, null).stringValue;
      var date = Mojo.Format.formatDate(new Date(pubDate), "EEE, MMM d, yyyy");

      // author
      var nsr = {lookupNamespaceURI: function(ns){return "http://purl.org/dc/elements/1.1/"}}
      var author = document.evaluate("dc:creator", item, nsr, XPathResult.STRING_TYPE, null).stringValue;

      // description
      var desc = document.evaluate("description", item, null, XPathResult.STRING_TYPE, null).stringValue;

      // push the new item
      newsItems.push({title: title, date: date, author: author, desc: desc});
    }

    callback(true, {items: newsItems});
  }

  function _error(transport) {
    callback(false, null);
  }

  var url = "http://feeds.feedburner.com/GiantBombNews?format=xml";
  this.getUrl(url, _success.bind(this), _error.bind(this));
}

GBModel.loadVideos = function(callback, offset, limit) {
  var url = "http://api.giantbomb.com/videos/?api_key="+this.apiKey+"&offset="+(offset ? offset: 0)+"&limit="+limit+"&format=JSON&sort=-publish_date";

  function _success(transport, json) {
    json = json ? json : transport.responseText.evalJSON(true);
    // format
    var data = {items: [], totalCount: json.number_of_total_results};

    for (var i = 0; i < json.results.length; i++) {
      var result = json.results[i];

      // video formatting is a bit weird, thanks to http://giantbomb-android.googlecode.com/svn/trunk/src/harris/GiantBomb/VideoFeedParser.java
      // for figuring it out

      var url = "http://media.giantbomb.com/video/";
      var index = result.url.indexOf(".flv");

      if (index != -1) {
        url += result.url.substr(0, index);
      } else {
        url = result.url;
      }

      url += "_ip.m4v?api_key=" + this.apiKey;

      data.items.push({title: result.name, description: result.deck, image: result.image.small_url, superImage: result.image.super_url, url: url});
    }

    callback(true, data);
  }

  function _error(transport) {
    callback(false, null);
  }

  this.getUrl(url, _success.bind(this), _error.bind(this));
}

GBModel.getUrl = function(url, successCallback, failureCallback) {
  // we queue up requests
  GBModel.requestQueue.push({url: url, successCallback: successCallback, failureCallback: failureCallback});

  GBModel.loadPendingRequest();
}

GBModel.postUrl = function(url, data, successCallback, failureCallback) {
  // we queue up requests
  GBModel.requestQueue.push({type: "post", url: url, data: data, successCallback: successCallback, failureCallback: failureCallback});

  GBModel.loadPendingRequest();
}

GBModel.loadPendingRequest = function() {
  // empty queue, no need
  if (GBModel.requestQueue.length == 0) {
    return;
  }

  var ts = new Date().getTime();
  var diff = ts - this.lastRequest;

  // lets be nice and send requests at least 400ms apart to avoid spamming
  // the api.
  if (ts - this.lastRequest < 400) {
    window.setTimeout(this.loadPendingRequest.bind(this), 400 - diff);
  } else {
    GBModel.runningRequest = true;

    var req = GBModel.requestQueue.shift();
    GBModel.runRequest(req);
  }
}

GBModel.runRequest = function(request) {
  // add time
  this.lastRequest = new Date().getTime();

	if (Mojo.Host.current === Mojo.Host.mojoHost) {
		// same original policy means we need to use the proxy on mojo-host
		url = "/proxy?url=" + encodeURIComponent(request.url);
	}

	function _success(transport, json) {
	  GBModel.runningRequest = false;
	  request.successCallback(transport, json);
	  this.ajaxRequest = null;
	}

	function _failure(transport) {
	  GBModel.runningRequest = false;
	  request.failureCallback(transport);
	  this.ajaxRequest = null;
	}

	if (request.type == "post") {
	  this.ajaxRequest = new Ajax.Request(request.url, {
	      method: "post",
	      postBody: request.data,
	      onSuccess: _success.bind(this),
	      onFailure: _failure.bind(this)
	  });
	} else {
	  this.ajaxRequest = new Ajax.Request(request.url, {
	      method: "get",
	      onSuccess: _success.bind(this),
	      onFailure: _failure.bind(this)
	  });
	}
}

GBModel.cancelRequest = function() {
  if (this.ajaxRequest) {
    this.ajaxRequest.transport.abort();
	  GBModel.runningRequest = false;
    this.ajaxRequest = null;
  }
}

GBModel.clearQueue = function() {
  this.cancelRequest();
  GBModel.requestQueue = [];
}
