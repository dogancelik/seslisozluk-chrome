var Shared = {
  queryWord: function(word, callback)  {
    function dom(html) {
      var div = document.createElement("div");
      div.innerHTML = html.replace(/img src/gi, "a href").split(/<body[^<]*?>/g)[1].split("</body>")[0];
      return div;
    }

    var url = "http://m.seslisozluk.com/?word="+word;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onreadystatechange = function(e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var veri = xhr.responseText,
          domveri = dom(veri),
          strveri = domveri.querySelectorAll(".dict_result")[0].innerText;

          var arr, arrveri = [],
            regex = /\d+\.\s([^\d]+)\./gi; // eski: /\d+\.\s([a-zA-ZİıĞğÜüÇçŞşÖö\s^\d]+)\./gi
          while ((arr = regex.exec(strveri)) != null)  
            arrveri.push(arr[1]);

          callback(arrveri);
      }
    };
    xhr.send();
  },
  queryLocalStorage: function(item, data) {
    var split = item.split(".");
    if (split.length === 1) {
      try {
        return data[item];
      } catch (err) {
        throw err;
      }
    } else {
      var sonveri;
      if (data == undefined)
        sonveri = JSON.parse(localStorage.getItem(split.shift()));
      else
        sonveri = data[split.shift()];
      return this.queryLocalStorage(split.join("."), sonveri);
    }
  },
  settings: {
    get: function() {
      var ayarlar = localStorage.getItem("ayarlar");

      if (ayarlar === null) return false;
      else return JSON.parse(ayarlar);
    },
    reset: function() {
      var ayarlar = {
        fare: {
          aktif: true,
          ctrl: true,
          alt: false,
          shift: false
        },
        klavye: {
          aktif: true,
          kombo: "alt+q"
        },
        icerikmenu: {
          aktif: true
        },
        gorunum: {
          css: ".seslisozluk-kutu * {\n\
margin: 0;\
padding: 0;\
border: 0;\
font-family: Verdana;\
font-size: 12px;\
font-weight: bold;\
vertical-align: baseline;\
}\n\
.seslisozluk-kutu {\n\
border: 2px solid #000000;\
border-radius: 25px;\
box-shadow: 0px 0px 8px #000000;\
background-image: -webkit-linear-gradient(top, #d1cfcf, #fffdfc);\
background-image: linear-gradient(top, #d1cfcf, #fffdfc);\
background-clip: padding-box;\
opacity: 0.9;\
padding: 10px;\
font-weight: bold;\
width: 250px;\
}\n\
.seslisozluk-kutu ul {\n\
list-style: none inside;\
margin: 5px;\
}\n\
.seslisozluk-kutu li span:first-child {\n\
font-size:0.8em;\
background-color: rgba(0, 0, 0, 0.9);\
border-radius: 3px;\
color: #fff;\
padding: 3px;\
margin: 3px;\
display: inline-block;\
}",
          cikti: 2,
          timer: 0,
          click: true,
          tek: true
        }
      };

      localStorage.setItem("ayarlar", JSON.stringify(ayarlar));
    }
  },
  boxClassName: "seslisozluk-kutu"
};