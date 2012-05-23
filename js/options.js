var ayarlar = Shared.settings.get(),
  sonuc;

var notifications = {
  cssClass: {
    error: "hata",
    success: "basarili"
  },
  messages: {
    saveError: "Kayıt sırasında hata oluştu.",
    saveSuccess: "Kayıt hatasız tamamlandı, eklentinin çalışmasını istediğiniz sayfaları lütfen yenileyin.",
    resetError: "Sıfırlama sırasında hata oluştu.",
    resetSucess: "Ayarlar sıfırlandı, sayfayı yenileyin."
  }
};

function sonuc_gizle() {
  setTimeout(function(){
    sonuc.style.display = "none";
  },5000);
}

document.addEventListener("DOMContentLoaded", function() {
  sonuc = document.getElementById("sonuc");

  var els = ["aktif_fare ayarlar.fare.aktif",
  "fare_alt ayarlar.fare.alt",
  "fare_ctrl ayarlar.fare.ctrl",
  "fare_shift ayarlar.fare.shift",
  "aktif_klavye ayarlar.klavye.aktif",
  "aktif_icerikmenu ayarlar.icerikmenu.aktif",
  "klavye_kombosu ayarlar.klavye.kombo",
  "sonuc_duzcumle|sonuc_liste ayarlar.gorunum.cikti",
  "kutu_css ayarlar.gorunum.css",
  "aktif_timer|kutu_timer ayarlar.gorunum.timer",
  "kutu_click ayarlar.gorunum.click",
  "kutu_tek ayarlar.gorunum.tek"];

  els.forEach(function(e, i){
    var es = e.split(" "),
      id = es[0],
      aktif = Shared.queryLocalStorage(es[1]);

    if (i < 6 && aktif) document.getElementById(id).checked = true;

    if (id == "klavye_kombosu")
      document.getElementById(id).value =  (typeof aktif == "object" ? aktif.join(", ") : aktif);

    if (id == "sonuc_duzcumle|sonuc_liste") {
      var split = id.split("|");
      document.getElementById(aktif == 1 ? split[0] : split[1]).checked = true;
    }

    if (id == "kutu_css")
      document.getElementById(id).innerText = aktif.replace(/;\s*/g,";\n");

    if (id == "aktif_timer|kutu_timer") {
      var split = id.split("|");
      if (aktif > 0) {
        document.getElementById(split[0]).checked = true;
        document.getElementById(split[1]).value = aktif;
      } else {
        document.getElementById(split[0]).checked = false;
        document.getElementById(split[1]).value = 0;
      }
    }

    if (id == "kutu_click" || id == "kutu_tek")
      document.getElementById(id).checked = aktif;
  });

  document.getElementById("kaydet").addEventListener("click", function(){
    sonuc.style.display = "block";
    try {
      ayarlar.fare.aktif = document.getElementById("aktif_fare").checked;
      ayarlar.fare.alt = document.getElementById("fare_alt").checked;
      ayarlar.fare.ctrl =  document.getElementById("fare_ctrl").checked;
      ayarlar.fare.shift = document.getElementById("fare_shift").checked;
      ayarlar.klavye.aktif =  document.getElementById("aktif_klavye").checked;
      ayarlar.icerikmenu.aktif =  document.getElementById("aktif_icerikmenu").checked;
      ayarlar.klavye.kombo = document.getElementById("klavye_kombosu").value;
      ayarlar.gorunum.css = document.getElementById("kutu_css").value;
      var timer = parseInt(document.getElementById("kutu_timer").value);
      ayarlar.gorunum.timer = (timer > 0 ? timer : 0);
      ayarlar.gorunum.click = document.getElementById("kutu_click").checked;
      ayarlar.gorunum.tek = document.getElementById("kutu_tek").checked;
      var cikti;
      [].forEach.call(document.getElementsByName("sonuclar"), function(el,i){ if (el.checked)  cikti = i+1; });
      ayarlar.gorunum.cikti = cikti;

      localStorage.setItem("ayarlar", JSON.stringify(ayarlar));
      chrome.extension.sendRequest({
        action: "sendrefresh"
      });

    } catch(err) {
      sonuc.className = notifications.cssClass.error;
      sonuc.innerText = notifications.messages.saveError;
      console.log(err);
    } finally {
      sonuc.className = notifications.cssClass.success;
      sonuc.innerText = notifications.messages.saveSuccess; 
    }

    sonuc_gizle();
  });

  document.getElementById("sifirla").addEventListener("click", function(){
    if (confirm("Ayarları sıfırlamak istediğinizden emin misiniz?")) {
      try {
        Shared.settings.reset();
      } catch(err) {
        sonuc.className = notifications.cssClass.error;
        sonuc.innerText = notifications.messages.resetError;
      } finally {
        sonuc.className = notifications.cssClass.success;
        sonuc.innerText = notifications.messages.resetSucess;
      }

      sonuc_gizle();
    }  
  });
});