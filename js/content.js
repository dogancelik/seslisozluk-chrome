/* Get info */
var ayarlar,
  sinif = "seslisozluk-kutu";

function rebind(){
  chrome.extension.sendRequest({
    action: "get",
    query: "ayarlar"
  }, function(res) {
    ayarlar = res;
    unbind();
    bind();
  });
}
rebind();

chrome.extension.sendRequest({
  action: "checkctxmenu"
});

function Selection() {
  var selection = window.getSelection();
  return {
    selection: selection,
    asText: selection.toString().trim()
  };
}

chrome.extension.onRequest.addListener(function (req, sender, cb) {
  if (req.ctxresult) {
    console.log("RET(CTX):", req.ctxresult);
    goster(Selection().selection, req.ctxresult);
  }

  if (req.reloadsettings) {
    console.log("RELOAD SETTINGS");
    rebind();
  }
});

var Binds = {
  fare: function (e) {
    var sel = Selection();
    if (sel.asText.length > 0 &&
      e.altKey == ayarlar.fare.alt &&
      e.ctrlKey == ayarlar.fare.ctrl &&
      e.shiftKey == ayarlar.fare.shift) {
      chrome.extension.sendRequest({
        action: "translate",
        query: sel.asText
      }, function(res) {
        console.log("RET(FARE):", res);
        goster(sel.selection, res);
      });
    }
  },
  klavye: function() {
    var sel = Selection();
    if (sel.asText.length > 0) {
      chrome.extension.sendRequest({
        action: "translate",
        query: sel.asText
      }, function(res) {
        console.log("RET(KLAVYE):", res);
        goster(sel.selection, res);
      });
    }
  }
}

function unbind() {
  document.body.removeEventListener("dblclick", Binds.fare);
  KeyboardJS.unbind.key(ayarlar.klavye.kombo, null, Binds.klavye);
}

function bind() {
  if (ayarlar.fare.aktif) {
    document.body.addEventListener("dblclick", Binds.fare, false);
  }

  if (ayarlar.klavye.aktif) {
    KeyboardJS.bind.key(ayarlar.klavye.kombo, null, Binds.klavye);
  }
}

function pos(obj) {
  var curleft = 0, curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return {left:curleft, top:curtop};
  }
}

function goster(sel,res) {
  var markerChar = "\ufeff",
    marker = document.createElement("span");
  
  marker.appendChild(document.createTextNode(markerChar));
  sel.getRangeAt(0).cloneRange().insertNode(marker);
  
  var selpos = pos(marker),
    el = document.createElement("div"),
    style = {
      //width: "250px",
      zIndex: "9999",
      position: "absolute",
      top: selpos.top + 25 + "px",
      left: selpos.left + 25 + "px"
    };

  for (var s in style) el.style[s] = style[s];

  chrome.extension.sendRequest({
    action: "insertcss"
  }, function (ret) {
    console.log("CSS RET:", ret);
    el.className = [sinif, ret.timedclass].join(" ");
  });

  var cikti = "";
  if (ayarlar.gorunum.cikti == 1) {
    cikti = res.join(", ");
    el.innerText = cikti;
  } else {
    cikti += "<ul>";
    res.forEach(function(el, i) {
      cikti += "<li><span>"+(i+1)+".</span> <span>"+el+"</span></li>";
    });
    cikti += "</ul>";
    el.innerHTML = cikti;
  }
  

  if (ayarlar.gorunum.click) 
    el.addEventListener("click", function() {
      document.body.removeChild(el);
    });

  if (ayarlar.gorunum.timer > 0)
    setTimeout(function() {
      if (el.parentNode) document.body.removeChild(el);
    }, ayarlar.gorunum.timer * 1000);

  if (ayarlar.gorunum.tek)
    [].forEach.call(document.querySelectorAll("."+sinif), function(el) {
      document.body.removeChild(el);
    });

  document.body.appendChild(el);
}