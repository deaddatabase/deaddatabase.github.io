if(document.getElementById) {
  window.popup = function(e, txt){
      createCustomPopup(e, txt);
  }
}

function createCustomPopup(e, txt) {
    var d = document;

    var alert_box = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));

    alert_box.id = "POPUP";
    var top = e.clientY;
    var left = e.clientX;
    if(typeof e.frameId !== "undefined"){
        top += d.getElementById(e.frameId).offsetTop;
        left += d.getElementById(e.frameId).offsetLeft;
    }
    alert_box.style.top = top + "px";
    alert_box.style.left = left + "px";
    alert_box.style.visiblity = "visible";

    var msg = alert_box.appendChild(d.createElement("p"));
    msg.innerHTML = txt;

    alert_box.style.display = "block";
}

function removeCustomPopup() {
  var d = document;
  var popup = d.getElementById("POPUP");
  if(popup != null)
    d.getElementsByTagName("body")[0].removeChild(popup);
}
