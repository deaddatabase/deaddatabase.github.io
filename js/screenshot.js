//This script uses the html2canvas library

function excludeScreenshot(element){
  if(typeof element === "string") element = document.getElementById(element);
  element.dataset.html2canvasIgnore = true;
}
function includeScreenshot(element){
  if(typeof element === "string") element = document.getElementById(element);
  element.removeAttribute("data-html2canvas-ignore");
}

function initScreenshot(el){
  var d = document;
  if(typeof el === "string") el = d.getElementById(el);
  var a = d.createElement("a");
  excludeScreenshot(a);
  var img = d.createElement("img");
  a.href = "javascript:;";
  a.id = "SCREENSHOT";
  a.className = "download_button";
  a.download = "screenshot_" + d.getElementById("NAME_SPAN").innerText.toLowerCase() + "_build.png";
  a.appendChild(img);
  img.addEventListener("click", function(event){
    console.log(event.target.href);
  });
  img.src = "./images/screenshot.png";
  img.className = "icon_name";
  img.addEventListener("click", function(event){
    event.target.parentElement.blur();
    var d = document;
    var p_relics = d.getElementById("POSSIBLE_RELICS");
    var p_skills = d.getElementById("POSSIBLE_SKILLS");
    var lc = d.getElementById("LEFT_COLUMN");
    var cc = d.getElementById("CENTER_COLUMN");
    var rc = d.getElementById("RIGHT_COLUMN");
    var mw = parseFloat(getComputedStyle(d.body).marginLeft.slice(0,-2))
             + parseFloat(getComputedStyle(lc).marginLeft.slice(0,-2)) + parseFloat(getComputedStyle(lc).marginRight.slice(0,-2))
             + parseFloat(getComputedStyle(cc).marginLeft.slice(0,-2)) + parseFloat(getComputedStyle(cc).marginRight.slice(0,-2))
             + parseFloat(getComputedStyle(rc).marginLeft.slice(0,-2)) + parseFloat(getComputedStyle(rc).marginRight.slice(0,-2));
    var w = lc.offsetWidth + cc.offsetWidth + rc.offsetWidth + mw;
    var tc = d.getElementById("TITAN_CONTAINER");
    var tn = d.getElementById("TITAN_NAME");
    var mh = parseFloat(getComputedStyle(d.body).marginTop.slice(0,-2))
             + parseFloat(getComputedStyle(tc).marginTop.slice(0,-2)) + parseFloat(getComputedStyle(tn).marginBottom.slice(0,-2))
             + parseFloat(getComputedStyle(tn).marginTop.slice(0,-2)) + parseFloat(getComputedStyle(tn).marginBottom.slice(0,-2));

    var h = tc.offsetHeight + tn.offsetHeight + mh;
    if(p_relics.offsetHeight != 0 && p_relics.offsetWidth != 0)
      h -= p_relics.offsetHeight + parseFloat(getComputedStyle(p_relics).marginTop.slice(0,-2));
    if(p_skills.offsetHeight != 0 && p_skills.offsetWidth != 0)
      h -= p_skills.offsetHeight + parseFloat(getComputedStyle(p_skills).marginTop.slice(0,-2));
    var options = {"backgroundColor":"#111"};
    if(!parent.mobilecheck())
      options.width = w;
    options.height = h;
    html2canvas(document.body, options).then(function(canvas){
      var p = parent;
      var d = p.document;
      if(d.getElementById("MODAL_CONTAINER")) return;

      var modal_container = d.body.appendChild(d.createElement("div"));
      modal_container.id = "MODAL_CONTAINER";
      modal_container.style.height = d.documentElement.scrollHeight + "px";

      var alert_box = modal_container.appendChild(d.createElement("div"));
      alert_box.style = "overflow:auto;";
      alert_box.style.width = canvas.width;
      if(canvas.height > p.window.screen.height) alert_box.style.height = (p.window.screen.height - 100) + "px";
      alert_box.id = "ALERT_BOX";
      if(d.all && !window.opera) alert_box.style.top = document.documentElement.scrollTop + "px";
      alert_box.style.visiblity = "visible";

      var button = alert_box.appendChild(d.createElement("a"));
      button.id = "CLOSE_BUTTON";
      button.appendChild(d.createTextNode("x"));
      button.href = "javascript:;";
      button.addEventListener("click", removePreview);
    
      var h1 = alert_box.appendChild(d.createElement("h1"));
      h1.innerHTML = "Screenshot Preview";

      var dl = alert_box.appendChild(d.createElement("a"));
      alert_box.appendChild(d.createElement("br"));
      var name = document.getElementById("NAME_SPAN").innerText.toLowerCase();
      dl.download = "screenshot_"+name+"_build.png";
      dl.href = canvas.toDataURL("image/png").replace(/^data:image\/[^;]*/, "data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=screenshot_" + name + "_build.png");
      var btn = dl.appendChild(d.createElement("input"));
      btn.value = "Download!";
      btn.type = "button";

      canvas.id = "SCREENSHOT_CANVAS";
      alert_box.appendChild(canvas);
      alert_box.style.left = (d.documentElement.offsetWidth - canvas.offsetWidth)/2 + "px";
      alert_box.style.display = "block";
    });
  });
  el.appendChild(a);
}

function removePreview(e) {
  var m = parent.document.getElementById("MODAL_CONTAINER");
  if(m == null)
    return;
  parent.document.body.removeChild(m);

}
