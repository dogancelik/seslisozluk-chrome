(function surumKontrol() {
  var _firstinstall = "firstinstall",
    _version = "version";

  var curr_ver = chrome.app.getDetails().version,
    prev_ver = localStorage.getItem(_version);

  if (curr_ver != prev_ver) {
    if (prev_ver === null) {
      if (localStorage.getItem(_firstinstall) === null) {
        localStorage.setItem(_firstinstall, new Date().getTime());
        Shared.settings.reset();
      }

      chrome.tabs.create({url: "page/firstinstall.html"});
    } else {
      chrome.tabs.create({url: "page/update.html"});
    }
  }

  if (Shared.settings.get() === false) {
    Shared.settings.reset();
  }

  localStorage.setItem(_version, curr_ver);
})();

/* Req obj: {action: string, query: string} */
/* TODO: Bir sınıf oluştur req obj için */
chrome.extension.onRequest.addListener(function(req, sender, cb) {
  console.log("REQ:", req);

  switch (req.action) {
  case "get":
    var obj = JSON.parse(localStorage.getItem(req.query));
    cb(obj);
    break;
  case "translate":
    Shared.queryWord(req.query, function(arrveri) {
      cb(arrveri);
    })
    break;
  case "checkctxmenu":
    chrome.contextMenus.removeAll(function() {
      if (Shared.queryLocalStorage("ayarlar.icerikmenu.aktif")) chrome.contextMenus.create({
        title: "Seslisözlük'de Ara",
        contexts: ["selection", "link", "editable"],
        onclick: Background.contextMenuCallback
      });
    });
    break;
  case "insertcss":
    var time = ""+new Date().getTime(),
      css = Shared.queryLocalStorage("ayarlar.gorunum.css").replace(new RegExp(Shared.boxClassName, "g"), Shared.boxClassName+"-"+time);

    chrome.tabs.insertCSS(sender.tab.id, {
      code: css
    }, function() {
      if (chrome.extension.lastError)
        console.log(chrome.extension.lastError);

      var cname = Shared.boxClassName+"-"+time;
      cb({
        timedclass: cname
      });
    });
    break;
  case "sendrefresh":
    chrome.tabs.getAllInWindow(null, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendRequest(tab.id, {reloadsettings:true});
      });
    });
  }
});

var Background = {
  contextMenuCallback: function(info, tab) {
    if (info.selectionText.length > 0) {
      Shared.queryWord(info.selectionText, function(sonuclar) {
        console.log("RET(CTX):", sonuclar);
        chrome.tabs.sendRequest(tab.id,{ctxresult:sonuclar});
      });
    }
  }
};