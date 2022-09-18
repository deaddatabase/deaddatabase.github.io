if(document.getElementById) {
  window.alert = function(title, txt, options){
    if(typeof options === "undefined")
      var options = {};
    if(typeof options.width === "undefined")
        options.width = "315px";
    if(typeof options.align === "undefined")
        options.align = "left";
      createCustomAlert(title, txt, options);
  }
}

function createCustomAlert(title, txt, options) {
    var d = document;
    if(d.getElementById("MODAL_CONTAINER")) return;

    var modal_container = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    modal_container.id = "MODAL_CONTAINER";
    modal_container.style.height = d.documentElement.scrollHeight + "px";

    var alert_box = modal_container.appendChild(d.createElement("div"));
    alert_box.style.width = options.width;

    alert_box.id = "ALERT_BOX";
    if(d.all && !window.opera) alert_box.style.top = document.documentElement.scrollTop + "px";
    alert_box.style.left = (d.documentElement.offsetWidth - alert_box.offsetWidth)/2 + "px";
    alert_box.style.visiblity = "visible";
    if(!options.hideClose){
      var button = alert_box.appendChild(d.createElement("a"));
      button.id = "CLOSE_BUTTON";
      button.appendChild(d.createTextNode("x"));
      button.href = "javascript:;";
      button.addEventListener("click", removeCustomAlert);
    }
    modal_container.addEventListener("click", removeCustomAlert);
    var h1 = alert_box.appendChild(d.createElement("h1"));
    h1.innerHTML = title;

    var msg = alert_box.appendChild(d.createElement("p"));
    msg.innerHTML = txt;
    if(options.align != "left") msg.style.textAlign = align;

    alert_box.style.display = "block";
}

function removeCustomAlert(e) {
  var d = document;
  if(typeof e !== "undefined"){
    //if(e.target.href == '#') e.preventDefault();
    if(e.target.id == "ALERT_BOX" || e.target.parentElement.id == "ALERT_BOX" && e.target.id != "CLOSE_BUTTON")
      return;
  }
  var m = document.getElementById("MODAL_CONTAINER");
  if(m == null)
    return;
  d.getElementsByTagName("body")[0].removeChild(m);

}
