//"use strict";
var res = {};
var versions = [];
var max_res = 0;
var touchDevice = "ontouchstart" in window;


var userId = localStorage.getItem("userId") == null ? Math.random().toString(36).substring(2,11) : localStorage.getItem("userId");
var swRegistration = null;

window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function get_lang_link(selected_lang){
  old_link = window.location.href;
  if(old_link.slice(0, 5) == "file:"){
    local = true;
    link_parts = old_link.match(/(file:\/+(\w+\/+)+)(index(\w+).html)/)
  } else {
    local = false;
    link_parts = old_link.match(/(https?:\/\/(w{3}.)?dotdatabase.github.io)\/?(index(\w+)*\.html)?/);
  }
  link_lang = link_parts.pop();
  if(typeof link_lang !== "undefined"){
    old_lang = link_lang.split("_").pop();
    if(local && ["static", "all"].includes(old_lang))
      old_lang = "en";
  }
  else {
    old_lang = localStorage.getItem("lang");
    old_lang = old_lang == null ? "en" : old_lang;
  }
  link_page = link_parts.pop();
  link_parts.pop(); //skip one element - will be www. if in the link
  link_base = link_parts.pop();
  if(typeof link_page !== "undefined"){ //if the link ends with index_xx.html, replace .html
    if(selected_lang == "en") new_loc = ".html";
    else new_loc = "_"+selected_lang+".html";
    new_link = link_base + "\/" + link_page.replace((old_lang == "en" ? ".html" : "_"+old_lang+".html"), new_loc);
  } else { //https://dotdatabase.net --> english
    if(selected_lang == "en") new_link = link_base;
    else new_link = link_base + "/index_" + selected_lang + ".html";
  }
  return new_link;
}

function init(){
  addSpinner();
  /*window.addEventListener("error", function(e){
    toast("Error loading the page.");console.log(e);
  });*/
  localStorage.removeItem("GodMode");//remove creative mode
  localStorage.removeItem("saveLastTitan");//remove old
  localStorage.removeItem("");//remove old
  //if undefined user --> assign user and save
  if(userId == "undefined"){
    userId = Math.random().toString(36).substring(2,11);
    localStorage.setItem("userId", userId);
  }
  if(localStorage.getItem("userId") == null) {
    localStorage.setItem("userId", userId);
  }
  document.getElementById("PAGE_CONTAINER").className = "content_hide";
  //if(window.frameElement){//prevent to display my page in an iframe
  //  document.body.style.display = "none";
  //  return;
  //}
  setupToast();
  //register service worker
  if ('serviceWorker' in navigator) {
    // Override the default scope of '/' with './', so that the registration applies
    // to the current directory and everything underneath it.
    navigator.serviceWorker.register('service-worker.js', {scope: './'})
    .then(function(registration) {
      // At this point, registration has taken place.
      // The service worker will not handle requests until this page and any
      // other instances of this page (in other tabs, etc.) have been
      // closed/reloaded.
      console.log("Finished registering service worker.");
    }).catch(function(error) {
      navigator.serviceWorker.register('service-worker.min.js', {scope: './'})
      .then(function(registration) {
        console.log("Finished registering service worker.");
      }).catch(function(error) {
        // Something went wrong during registration. The service-worker.js file
        // might be unavailable or contain a syntax error.
        console.log("Service worker couldn't be registered: " + error);
      });
    });
    // Handler for messages coming from the service worker
    navigator.serviceWorker.addEventListener("message", messageHandler);
  } else {
    // The current browser doesn't support service workers.
    console.log("Service worker is not supported.");
  }
  //beginLoading();
  //init banner
  initBanner(beginLoading);
  if(mobilecheck() && banners_mobile.length > 0){
    selected_banner = Math.ceil(Math.random()*banners_mobile.length) - 1;
    switchBanner(
      banners_mobile[selected_banner][0],
      banners_mobile[selected_banner][1],
      banners_mobile[selected_banner][2]
    );
  } else if (banners_desktop.length > 0){
    selected_banner = Math.ceil(Math.random()*banners_desktop.length) - 1;
    switchBanner(
      banners_desktop[selected_banner][0],
      banners_desktop[selected_banner][1],
      banners_desktop[selected_banner][2]
    );
  }
}

function beginLoading(){
  //createLoadingAnimation();
  max_res = assets.length;
  for(var j=0; j<assets.length; j++){
    getData("./data/" + assets[j]);
  }
}

function showAcknowledgements(){
    alert("About", "Thanks to all the players that helped to improve and keep this site up and running.<br><br>\
        Developed by <a class=\"link\" href=\"mailto:yuki@dotdatabase.net\">Yuki</a><br><br>\
        All Dawn of Titans content and materials are trademarks, copyrights, or other proprietary rights of <a class=\"link\" href=\"http://www.naturalmotion.com/\" \
        target=\"_blank\">Naturalmotion Games</a> Ltd., its parents or affiliated companies, or its licensors.<br>\
        All rights reserved.<br><br>\
        Use at your own risk - no warranty provided.<br>\
        Best viewed on a desktop browser.\
        Donations may be used to keep the website up to date, cover server costs and development costs or any other expenses I have for living and entertainment purposes.\
        <br><form style=\"text-align:center;\" action=\"https://www.paypal.com/cgi-bin/webscr\" method=\"post\" target=\"_top\"><input type=\"hidden\" name=\"cmd\" \
        value=\"_s-xclick\"><input type=\"hidden\" name=\"hosted_button_id\" value=\"YGLMXY4TBU74J\"><input type=\"image\" src=\"https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif\" \
        border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\"><img alt=\"\" border=\"0\" src=\"https://www.paypalobjects.com/en_US/i/scr/pixel.gif\" width=\"1\" \
        height=\"1\"></form><div style=\"text-align: center;\"><a target=\"_new\" href=\"https://www.patreon.com/bePatron?u=24521482\" id=\"PATREON_LINK\"><img src=\"./images/patron_button.png\" id=\"PATREON_BUTTON\" style=\"border-radius: 10px;width: 92px;height: auto;\"></a></div>",{"width":"340px"});
}

function messageHandler(event){
  var d = document;
  var tag = event.data.tag;
  var data = event.data.data;
  if(tag == "toast")
    toast(data);
  else if(tag == "DeleteData"){
    if("storage" in navigator && "estimate" in navigator.storage){
      navigator.storage.estimate().then(function(estimate){
        var del_label = document.getElementById("DELETE_REDUNDANT");
        if(del_label != null ) del_label.lastElementChild.innerText = (estimate.usage/1024/1024).toFixed(1) + "MB";
      });
    }
  }
  else if(tag.match("UpdateData")){
    data = JSON.parse(data);
    updateData(data);
    toast("Offline Data has been updated.");
  }
}

function optionsClick(event){
  var d = document;
  if(event.target.value == "enabled"){
    event.target.value = "disabled"
    if(event.target.id == "collection"){
      var icons_collection = d.getElementsByClassName("relic_collection");
      for(var i=0; i<icons_collection.length; i++){
        icons_collection[i].className += " content_hide";
      }
    }
    else if(event.target.id == "compare"){
      var icons_open_new = d.getElementsByClassName("compare_link");
      for(var i=0; i<icons_open_new.length; i++){
        icons_open_new[i].className += " content_hide";
      }
    }
  }
  else if(event.target.value == "disabled"){
    event.target.value = "enabled";
    if(event.target.id == "collection"){
      var icons_collection = d.getElementsByClassName("relic_collection");
      for(var i=0; i<icons_collection.length; i++){
        icons_collection[i].className = icons_collection[i].className.replace(" content_hide", '');
      }
    }
    else if(event.target.id == "compare"){
      var icons_open_new = d.getElementsByClassName("compare_link");
      for(var i=0; i<icons_open_new.length; i++){
        icons_open_new[i].className = icons_open_new[i].className.replace(" content_hide", '');
      }
    }
  }
  if(LocalStEnable){
    if(event.target.value == "disabled") localStorage.setItem(event.target.id, "disabled");
    else localStorage.setItem(event.target.id, "enabled");
  }
}

function loadNews(event){
  var d = document;
  var frame = d.getElementById("TITAN_IFRAME");
  frame.src = "news.html";
}

function loadTierList(event){
  var d = document;
  var frame = d.getElementById("TITAN_IFRAME");
  if(event.target.dataset.page == "titan")
    event.target.dataset.page = "relic";
  else
    event.target.dataset.page = "titan";
  frame.src = "./tierList.html?page="+event.target.dataset.page;
}

function showOptions(){
  d = document;
  if(d.getElementById("modalContainer")) return;

  modal_container = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
  modal_container.id = "MODAL_CONTAINER";
  modal_container.style.height = d.documentElement.scrollHeight + "px";

  alert_box = modal_container.appendChild(d.createElement("div"));
  alert_box.style.width = "300px";

  alert_box.id = "ALERT_BOX";
  if(d.all && !window.opera) alert_box.style.top = document.documentElement.scrollTop + "px";
  alert_box.style.left = (d.documentElement.offsetWidth - alert_box.offsetWidth)/2 + "px";
  alert_box.style.visiblity = "visible";

  btn = alert_box.appendChild(d.createElement('a'));
  btn.id = "CLOSE_BUTTON";
  btn.appendChild(d.createTextNode('x'));
  btn.href = "javascript:;";
  btn.addEventListener("click", removeCustomAlert);

  h1 = alert_box.appendChild(d.createElement("h1"));
  h1.appendChild(d.createTextNode("Site Options"));

  msg = alert_box.appendChild(d.createElement('p'));
  msg.style = "font-size:14px;";
  if(LocalStEnable){
    msg.innerHTML = "These settings use Local Storage to save user settings.<br><br>\
                    Clearing the local storage will disable all options and \
                    delete all saved titan builds.<br><br>\
                    Deleting the offline data will not wipe the saved titan builds, but will clear old files that might conflict with the latest files.<br><br>";
    var checkbox = d.createElement("input");
    var label = d.createElement("label");

    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "relicStacking";
    checkbox.type = "checkbox";
    if(localStorage.getItem("relicStacking") != null)checkbox.value = localStorage.getItem("relicStacking");
    else if(localStorage.getItem("relicStacking") == null)  {localStorage.setItem("relicStacking", "disabled");checkbox.value = "disabled";}
    else {localStorage.setItem("relicStacking", "enabled");checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Allow relic stacking"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);
/*
    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "tinyUrl";
    checkbox.type = "checkbox";
    if(localStorage.getItem("tinyUrl") != null)checkbox.value = localStorage.getItem("tinyUrl");
    else if(localStorage.getItem("tinyUrl") == null)  {localStorage.setItem("tinyUrl", "disabled");checkbox.value = "disabled";}
    else {localStorage.setItem("tinyUrl", "enabled");checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Shorten links using "));
    var providers = ["tinyurl.com;tinyurl_com", "goo.gl;goo_gl"]//List of providers for url shorten service using tiny.php
    var sel = d.createElement("select");
    for(var i=0; i<providers.length; i++){
      var option = d.createElement("option");
      var tmp = providers[i].split(';');
      option.value = tmp[1];
      option.innerText = tmp[0];
      sel.appendChild(option);
    }
    if(localStorage.getItem("provider") == null)  localStorage.setItem("provider", sel.value);
    else {
      for(var i=0; i<sel.options.length; i++){
        if(sel.options[i].value == localStorage.getItem("provider"))
          sel.options[i].selected = "selected";
        else
          sel.options[i].selected = '';
      }
    }
    sel.addEventListener("change", function(e){
      e.preventDefault;
      localStorage.setItem("provider", e.target.value);
    });
    label.appendChild(sel);
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);
*/
    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "manualSkillLevel";
    checkbox.type = "checkbox";
    if(localStorage.getItem("manualSkillLevel") != null) checkbox.value = localStorage.getItem("manualSkillLevel");
    else if(localStorage.getItem("manualSkillLevel") == null)  {localStorage.setItem("manualSkillLevel", "enabled");checkbox.value = "enabled";}
    else {localStorage.setItem("manualSkillLevel", "enabled"); checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Skills/Relics not bound to Titan LVL"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);

    //stats images
    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "statImages";
    checkbox.type = "checkbox";
    if(localStorage.getItem("statImages") != null) checkbox.value = localStorage.getItem("statImages");
    else if(localStorage.getItem("statImages") == null)  {localStorage.setItem("statImages", "enabled");checkbox.value = "enabled";}
    else {localStorage.setItem("statImages", "enabled");checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Display stat images on top of relics"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);


    //relic collection
    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "collection";
    checkbox.type = "checkbox";
    if(localStorage.getItem("collection") != null) checkbox.value = localStorage.getItem("collection");
    else if(localStorage.getItem("collection") == null)  {localStorage.setItem("collection", "disabled");checkbox.value = "disabled";}
    else {localStorage.setItem("collection", "enabled");checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Equip relics from your collection"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);

    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "individualHealth";
    checkbox.type = "checkbox";
    if(localStorage.getItem("individualHealth") != null)checkbox.value = localStorage.getItem("individualHealth");
    else if(localStorage.getItem("individualHealth") == null)  {localStorage.setItem("individualHealth", "disabled");checkbox.value = "disabled";}
    else {localStorage.setItem("individualHealth", "enabled");checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Display individual health for troops"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    msg.appendChild(label);


    if(!mobilecheck()){
      checkbox = d.createElement("input");
      label = d.createElement("label");
      checkbox.id = "compare";
      checkbox.type = "checkbox";
      if(localStorage.getItem("compare") != null) checkbox.value = localStorage.getItem("compare");
      else if(localStorage.getItem("compare") == null)  {localStorage.setItem("compare", "disabled"); checkbox.value = "disabled";}
      else {localStorage.setItem("compare", "enabled"); checkbox.value = "enabled";}
      if(checkbox.value == "enabled") checkbox.checked = "checked";
      label.appendChild(checkbox);
      label.appendChild(d.createTextNode(" Compare"));
      label.appendChild(d.createElement("br"));
      label.firstElementChild.addEventListener("change", function(e){
        optionsClick(e);
        var frames = document.getElementsByTagName("iframe");
        if(e.target.value == "enabled"){
          frames[0].className  = "compare_iframe";
          frames[1].className  = "compare_iframe";
        }
        else{
          if(frames[0].id == "TITAN_IFRAME"){
            frames[0].className = "content_iframe";
            frames[1].className += " content_hide";
          }
          else{
            frames[1].className = "content_iframe";
            frames[0].className += " content_hide";
          }
        }
      });
      msg.appendChild(label);
    }

    //Donation popup
    if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
      checkbox = d.createElement("input");
      label = d.createElement("label");
      checkbox.id = "hideDonate";
      checkbox.type = "checkbox";
      if(localStorage.getItem("hideDonate") != null) checkbox.value = localStorage.getItem("hideDonate");
      else if(localStorage.getItem("hideDonate") == null)  {localStorage.setItem("hideDonate", "disabled");checkbox.value = "disabled";}
      else {localStorage.setItem("hideDonate", "enabled"); checkbox.value = "enabled";}
      if(checkbox.value == "enabled") checkbox.checked = "checked";
      label.appendChild(checkbox);
      label.appendChild(d.createTextNode(" Hide Donation Popup (iOS)"));
      label.appendChild(d.createElement("br"));
      label.firstElementChild.addEventListener("change", optionsClick);
      msg.appendChild(label);
    }

    //"God Mode" - makes all skills available on all slots and lets you stack them
    checkbox = d.createElement("input");
    label = d.createElement("label");
    checkbox.id = "GodMode";
    checkbox.type = "checkbox";
    if(localStorage.getItem("GodMode") != null) checkbox.value = localStorage.getItem("GodMode");
    else if(localStorage.getItem("GodMode") == null)  {localStorage.setItem("GodMode", "disabled");checkbox.value = "disabled";}
    else {localStorage.setItem("GodMode", "enabled"); checkbox.value = "enabled";}
    if(checkbox.value == "enabled") checkbox.checked = "checked";
    label.appendChild(checkbox);
    label.appendChild(d.createTextNode(" Creative Mode"));
    label.appendChild(d.createElement("br"));
    label.firstElementChild.addEventListener("change", optionsClick);
    if(checkbox.value == "enabled"){
      msg.appendChild(label);
    }

    label = d.createElement("label");
    label.appendChild(d.createTextNode(" Select language: "));

    var languages = ['ENGLISH;en', 'FRANÇAIS;fr', 'DEUTSCH;de', 'ITALIANO;it', 'ESPAÑOL;es', 'PORTUGUÊS;pt', 'РУССКИЙ;ru', '简体中文;chs', '繁體中文;cht', '日本語;jp',
        '한국어;ko', 'DANSK;da', 'NEDERLANDS;nl', 'NORSK (BOKMÅL);no', 'SVENSKA;sv', 'TÜRKÇE;tr', 'ARABIC;ar'];//List of languages and their abbreviations


    label = d.createElement("label");
    label.appendChild(d.createTextNode(" Language: "));
    var sel = d.createElement("select");
    for(var i=0; i<languages.length; i++){
      var option = d.createElement("option");
      var tmp = languages[i].split(';');
      option.value = tmp[1];
      option.innerText = tmp[0];
      sel.appendChild(option);
    }
    if(localStorage.getItem("lang") == null)  localStorage.setItem("lang", sel.value);
    else {
      for(var i=0; i<sel.options.length; i++){
        if(sel.options[i].value == localStorage.getItem("lang"))
          sel.options[i].selected = "selected";
        else
          sel.options[i].selected = '';
      }
    }
    sel.addEventListener("change", function(e){
      e.preventDefault;
      new_link = get_lang_link(e.target.value)
      //localStorage.setItem("lang", e.target.value);
      window.location.href = new_link;
    });
    label.appendChild(sel);
    label.appendChild(d.createElement("br"));
    msg.appendChild(label);

/*
    var textbox = d.createElement("input");
    textbox.type = "text";
    textbox.id = "USER_ID";
    textbox.size = "15";
    //textbox.maxLength = "25";
    textbox.placeholder = "User id to restore builds.";
    textbox.value = userId;
    msg.appendChild(textbox);
    textbox.addEventListener("keydown", function (event){
			var len = event.target.value.length;
			var key = event.keyCode || event.which;
			if (len >= 20 && ![8,46,37,38,39,40].includes(key))
				event.preventDefault();
    });

	  var btn = d.createElement("button");
	  btn.type = "button";
	  btn.className = "optionButton";
	  btn.innerText = "Change Id";
	  btn.addEventListener("click", function(event){
	    //send to server
	    var xhttp = new XMLHttpRequest();
	    var url = "./setId.php";
	    var params = "old=" + userId;
	        params += "&new="+ document.getElementById("USER_ID").value;
	    xhttp.open("POST", url, true);
	    //Send the proper header information along with the request
	    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	    xhttp.onreadystatechange = function() {
	      if (xhttp.readyState == 4 && xhttp.status == 200){
	        var response = JSON.parse(xhttp.response);
	        if(response.status == "SUCCESS"){
	            localStorage.setItem("userId", response.user);
	            userId = response.user;
	        }
	        if(response.message != "NONE")
	          toast(response.message);
	      }
	    };
	    xhttp.send(params);
	    removeCustomAlert();
	    event.preventDefault();
	  });
	  msg.appendChild(btn);

    msg.appendChild(d.createElement("br"));

    var btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Backup Builds";
    btn.addEventListener("click", function(event){
      backupBuilds();
      if(sessionStorage.getItem("backupBuilds") != ""){
		    //send to server
		    var xhttp = new XMLHttpRequest();
		    var url = "./backupBuild.php";
		    var params = "user=" + userId;
		        params += "&builds="+ sessionStorage.getItem("backupBuilds");

		    xhttp.open("POST", url, true);
		    //Send the proper header information along with the request
		    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		    xhttp.onreadystatechange = function() {
		      if (xhttp.readyState == 4 && xhttp.status == 200){
		        toast("Titan Builds saved.");
		      }
		    };
		    xhttp.send(params);
		    //end send server
		    removeCustomAlert();
		    event.preventDefault();
      } else {
        toast("No builds saved, no backup necessary.");
      }
    });
    msg.appendChild(btn);
    //msg.appendChild(d.createElement("br"));

    var btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Restore Builds";
    btn.addEventListener("click", function(event){
      //send to server
      var xhttp = new XMLHttpRequest();
      var url = "./getBuild.php";
      var params = "user=" + document.getElementById("USER_ID").value;

      xhttp.open("POST", url, true);
      //Send the proper header information along with the request
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200){
          var response = JSON.parse(xhttp.response);
          sessionStorage.setItem("backupBuilds", response.builds);
          localStorage.setItem("userId", response.user);
          userId = response.user;
          restoreBuilds();
          toast("Titan Builds restored.");
        }
      };
      xhttp.send(params);
      removeCustomAlert();
      event.preventDefault();
    });
    msg.appendChild(btn);
    msg.appendChild(d.createElement("br"));

    var btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Titan Votes";
    btn.addEventListener("click", function(event){
      document.getElementById("TITAN_IFRAME").src = "./userVotes.html?page=titan";
      removeCustomAlert();
      event.preventDefault();
    });
    msg.appendChild(btn);
    //msg.appendChild(d.createElement("br"));

    var btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Relic Votes";
    btn.addEventListener("click", function(event){
      document.getElementById("TITAN_IFRAME").src = "./userVotes.html?page=relic";
      removeCustomAlert();
      event.preventDefault();
    });
    msg.appendChild(btn);
    msg.appendChild(d.createElement("br"));

    var btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Clear Local Storage";
    btn.addEventListener("click", function(event){
      if(!!localStorage){
        localStorage.clear();
        removeCustomAlert();
        toast("Cleared local storage.");
        localStorage.setItem("userId", userId);
      }
      event.preventDefault();
    });
    msg.appendChild(btn);
    //msg.appendChild(d.createElement("br"));

    label = d.createElement("label");
    label.id = "DELETE_STORAGE";
    btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Clear Offline Data";
    btn.addEventListener("click", function(event){
      if(navigator.serviceWorker){
        navigator.serviceWorker.ready.then(function(swRegistration) {
          return swRegistration.sync.register("DeleteData");
        });
      }
      event.preventDefault();
    });
    label.appendChild(btn);
    msg.appendChild(label);
    msg.appendChild(d.createElement("br"));

    label = d.createElement("label");
    label.id = "DELETE_REDUNDANT";
    btn = d.createElement("button");
    btn.type = "button";
    btn.className = "optionButton";
    btn.innerText = "Clear Redundant Data";
    btn.addEventListener("click", function(event){
      if(navigator.serviceWorker){
        navigator.serviceWorker.ready.then(function(swRegistration) {
          return swRegistration.sync.register("DeleteRedundantData");
        });
      }
      removeRedundantItems();
      toast("Deleted unnecessary data.");
      event.preventDefault();
    });
    label.appendChild(btn);

    if("storage" in navigator && "estimate" in navigator.storage){
      navigator.storage.estimate().then(function(estimate){
        var d = document;
        var label = d.getElementById("DELETE_REDUNDANT");
        var txt = d.createElement("span");
        txt.innerText = (estimate.usage/1024/1024).toFixed(1) + "MB";
        label.appendChild(d.createElement("br"));
        label.appendChild(d.createTextNode(" Storage used: "));
        label.appendChild(txt);
      });
    }
    msg.appendChild(label);
*/
    //user id
    label = d.createElement("label");
    if(localStorage.getItem("userId") == null) {
      localStorage.setItem("userId", userId);
    }
    label.appendChild(d.createElement("br"));
    label.appendChild(d.createTextNode("User: " + userId));
    msg.appendChild(label);

  }
  else msg.innerText = "Unforunately your browser does not support localStorage, so site options are not available.";
  msg.style.textAlign = "left";

  alert_box.style.display = "block";
}

function getData(filepath){
  var name = filepath.split('/');
  var localhost = "127.0.0.1";//Chrome server uses this ip, reserved for localhost
  name = name[name.length-1].split('.')[0];
  if(!!window.fetch && !(window.location.protocol.match("file:") || window.location.host.match(localhost)) ){
    fetch(filepath, {
      method: "get",
      headers: {
        "Content-Type":"application/json;"
      }
    })
    .then(function (response){
      if(response.ok)//status code == 200
        return response.json();
      else {
        console.log("Error fetching " + response.url);
      }
    })
    .then(function (json) {
      if(typeof json !== "undefined") loadData(json);
    })
    .catch(function (error) {
      console.log('Request failed', error, filepath);
    });
  }
  else{
    // OLD XHR REQUEST
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", filepath, true); //post is not cached
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200){
        console.log("JSON: "+ xhttp.responseURL);
        loadData(JSON.parse(xhttp.responseText));
      }
    };
    xhttp.send();
  }
}

function showMenu(){
  var tabs=document.getElementById("TAB_CONTAINER");
  var frame = document.getElementById("TITAN_IFRAME");
  if(tabs.className == ''){
    tabs.className = "content_hide";
    frame.className = "content_iframe";
    var t = document.getElementById("MOBILE_ICON").children;
    t[0].className = "mobile_icon_bar";
    t[1].className = "mobile_icon_bar";
    t[2].className = "mobile_icon_bar";
  }
  else{
    tabs.className = '';
    frame.className = "content_hide";
    var t = document.getElementById("MOBILE_ICON").children;
    t[0].className = "content_hide";
    t[1].className = "mobile_icon_bar_selected_1";
    t[2].className = "mobile_icon_bar_selected_2";
  }
}

function addPolicyPopup(pos, text, button_txt, expire_date, button_center){
  if(typeof button_center === "undefined") var button_center = false;
  if(typeof expire_date === "undefined") var expire_date = 7;
  var d = document;
  var div = d.createElement("div");
  var p = d.createElement('p');
  var pBtn = d.createElement('p');

  var btn = d.createElement('a');
  btn.className = "btn" + " btn_" + pos;
  btn.innerHTML = button_txt;
  btn.addEventListener("click", function(e){
    var s = e.target.className.split('_'); s = s[s.length-1];
    var wrapper = document.getElementsByClassName("wrapper_" + s)[0];
    while (wrapper.firstChild)
      wrapper.removeChild(wrapper.firstChild);
    wrapper.parentElement.removeChild(wrapper);
    setCookie("policyRead", "true", expire_date);
    e.preventDefault();
  });
  btn.href = "javascript:;";
  pBtn.appendChild(btn);

  div.className = "policy_wrapper" + " wrapper_" + pos;
  //set position of div, pos is a string of either 'bottom' or 'top'
  div.style[pos] = '0px';
  p.className = "policy_consent" + " consent_" + pos;
  pBtn.className = "policy_buttons" + " buttons_" + pos;


  p.innerHTML = text;

  div.appendChild(p);
  div.appendChild(pBtn);
  d.body.appendChild(div);

  if(button_center){
    var w = (div.offsetWidth - btn.offsetWidth) / 2;
    btn.style.marginRight = w + "px";
    btn.style.marginLeft = w + "px";
    div.style.paddingBottom = "30px";
  }
}


function viewport(){
  var e = window, a = "inner";
  if ( !( "innerWidth" in window ) ){
    a = "client";
    e = document.documentElement || document.body;
  }
  return { width : e[ a + "Width" ] , height : e[ a + "Height" ] }
}

//finish page load after initializing the tabs, you need titans, relics and troops
function updateData(data) {
  var d = document;
  var json_type = data.ResourceName;
  console.log("Updated " + json_type + ".");
  if(typeof json_type === "undefined") {
    console.log("Invalid json type.");
    return 0;
  }
  else if(json_type == "Titans"){
    res.titan = data.UnitTypes;
  }
  else if(json_type == "AutocastAbilities"){
    res.AutocastAbilities = data.AutocastAbilities;
  }
  else if(json_type == "AutocastSpoilTypes"){
    res.AutocastSpoilTypes = data.AutocastSpoilTypes;
  }
  else if(json_type.match("Titans_Old")){
    var titans = data.OldTitans;
    for(var i = 0; i < titans.length; i++){
      var v = titans[i].ResourceName.split("Titans_")[1];
      if(typeof versions[i] === "undefined") versions.push(v);
      else if(typeof versions[i] !== "undefined"){
        var exists = false;
        for(var j=0; j<versions.length; j++)
          if(versions[j] == v) exists = true;
        if(!exists) versions.push(v)
      }
      res['titan_' + v] = titans[i].Titans;
    }
  }
  else if(json_type == "SpoilTypes"){
    res.relic = data.SpoilTypes;
  }
  else if(json_type == "SpoilPoolTypes"){
    res.SpoilPoolTypes = data.SpoilPoolTypes;
  }
  else if(json_type == "RelicInfusionData"){
    res.relicRepair =  data.RelicInfusionData;
  }
  else if(json_type == "Troops"){
    res.troop = data.UnitTypes;
  }
  else if(json_type == "TitanVariables"){
    res.ascensionCost = data.TitanVariables.AscensionCost.tier1;
  }
  else if(json_type == "TitanBuffs"){
    res.titanBuffs = data.TitanBuffs;
  }
  else if(json_type == "titanLevel"){
    res.titanLvl = data.titanLevel;
  }
  else if(json_type == "TitanSkillPools"){
    res.titanSkillPools = data.TitanSkillPools;
  }
  else if(json_type == "TitanCollections"){
    res.TitanCollections = data.TitanCollections;
  }
  else if(json_type == "PlayerTitles"){
    res.PlayerTitles = data.PlayerTitles;
  }
  else if(json_type == "Spells"){
    res.spell = data.SpellTypes;
  }
  else if(json_type == "UnitOverrideTypes"){
    res.UnitOverrideTypes = data.UnitOverrideTypes;
    return 0;
  }
  else if(json_type.match("TitanSkillPools_Old")){
    var pools = data.OldSkillPools;
    for(var i=0; i<pools.length; i++){
      var v = pools[i].ResourceName.split("TitanSkillPools_")[1];
      if(typeof versions[i] === "undefined") versions.push(v);
      else if(typeof versions[i] !== "undefined"){
        var exists = false;
        for(var j=0; j<versions.length; j++)
          if(versions[j] == v) exists = true;
        if(!exists) versions.push(v)
      }
      res['titanSkillPools_' + v] = pools[i].TitanSkillPools;
    }
  }
  else if(json_type == "baseTranslation"){
    res.baseTranslation = data.baseTranslation;
  }
  else if(json_type == "TitanPatchData"){
    res.titanPatch = data.TitanPatchData;
  }
  else if(json_type == "news"){
    res.news = data.news;
    return 0;
  }
  else {
    res.other = data;
    console.log("Other successfully loaded");
    return 0;
  }
  return 1;
}

function loadData(response) {
  var d = document;
  if ( typeof loadData.number_res_loaded === "undefined" )
    loadData.number_res_loaded = 0;
  var json_type = response.ResourceName;
  console.log("Loaded " + json_type + ".");
  loadData.number_res_loaded += updateData(response);
  //animate(loadData.number_res_loaded, max_res);
  if(loadData.number_res_loaded == max_res){ //if all data was loaded
    detected_lang = window.location.href.match(/_([A-Za-z]+)?.html/);
    detected_lang = detected_lang == null ? "en" : detected_lang[1];
    if (detected_lang == "all" || detected_lang == "static") //for index_all.html and index_static.html
      detected_lang = "en";
    old_lang = localStorage.getItem("lang");
    if(old_lang != null){
      //console.log(old_lang, detected_lang)
      if(old_lang != detected_lang){
        localStorage.setItem("lang", detected_lang);
        window.location.href = window.location.href;
        return;
      }
    } else {
      localStorage.setItem("lang", detected_lang);
    }
    var page_container = d.getElementById("PAGE_CONTAINER");
    var compare_frame = page_container.appendChild(d.createElement("iframe"));
    compare_frame.id = "COMPARE_IFRAME";
    compare_frame.className = "content_iframe";
    if(LocalStEnable && localStorage.getItem("compare") == "disabled" || localStorage.getItem("compare") == null){
      compare_frame.className += " content_hide";
    }
    compare_frame.name = "compare_frameName";
    initStaticTabs();
    if(mobilecheck())
      if(d.getElementById("TAB_CONTAINER").className != "content_hide" && mobilecheck() && window.screen.width < 554)
        showMenu();//if menu is open, hide it
    removeSpinner();
    d.getElementById("NEWS_LINK").addEventListener("click", loadNews);
    d.getElementById("TIER_LIST_LINK").addEventListener("click", loadTierList);
    var frame = document.getElementById("TITAN_IFRAME");
    var parameter_string = decodeURI(location.search.substring(1));

      if(parameter_string.match(/\|build=/))
        var params = parameter_string.split('|');
      else
        var params = parameter_string.split('&');
      var param_1 = params[0].split('=');
      var type_1 = param_1[0];
      if(params.length > 1){
        var param_2 = params[1].split('=');
        var type_2 = param_2[0];
      }

      if(typeof param_1[0] === "string" && (type_1 == "titan" || type_1 == "troop" || type_1 == "relic" || type_1 == "spell") && typeof param_2 === "undefined" ){//load titan/troop/relic in external page
        var name = param_1[1];
        if(type_1 == "titan" && typeof getTitanById(name) === "undefined")
          name = getTitanByName(name).id;
        else if(type_1 == "troop" && capital(name) == "Pikemen")
          name = getTroopByName(name).id;//spearmen have id pikemen, so we need to catch that before it is found by id
        else if(type_1 == "troop" && typeof getTroopById(name) === "undefined")
          name = getTroopByName(name).id;
        else if(type_1 == "spell" && typeof getSpellType(name) === "undefined")
          name = getSpellTypeByName(name).id;
        frame.src  = "./" + type_1 + ".html?name=" + name;
      }
      else if(typeof param_1[0] === "string" && type_1 == "titan" && typeof param_2 !== "undefined" ){//load titan/troop/relic in external page
        var name = param_1[1];
        if(typeof getTitanById(name) === "undefined")
          name = getTitanByName(name).id;
        frame.src  = "./titan.html?name=" + name +'&'+ "build=" + param_2[1];
      }
      else frame.src = "./news.html";

    page_container.className = '';
    d.getElementById(getHash(getFirstChildWithTagName( d.getElementById("TABS").childNodes[0], 'A' ).getAttribute("href") )).style = "height:calc(100% - "+(d.getElementById("TABS").offsetHeight+30)+"px);";


    if(viewport()['width'] < 380 ) d.getElementById("MENU").style = "text-align:right;"

    loadData.number_res_loaded = 0;
    var cookie = 'This website uses cookies to improve user experience. By using my website you consent to all cookies in accordance with my <a target="_blank" class="link" href="./privacy.html#Cookies">Cookie & Privacy Policy</a>. &nbsp;&nbsp;';
    //var privacy = 'In order to use this website you must agree to its <a target="_blank" class="link" href="#">Terms of Service</a> and its <a target="_blank" class="link" href="./privacy.html">Privacy Policy</a>. &nbsp;&nbsp;';
    var t = getCookie("policyRead");
    if(t == '');
    if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
      d.getElementById("FOOT_NOTE").className = "content_hide";
      if(localStorage.getItem("hideDonate") == "disabled" || localStorage.getItem("hideDonate") == null){
        var donation = "Dear iOS User, since there is a bug with iOS I have removed the \"Donate\" button from the website(for iOS). If \
        you still want to support the website you can find the donation button in the \"About\" section.\
        This popup can be disabled in the site settings. Visit the \"Options\" menu at the top of the page to do so.\
        <br><form style=\"text-align:center;\" action=\"https://www.paypal.com/cgi-bin/webscr\" method=\"post\" target=\"_top\"><input \
        type=\"hidden\" name=\"cmd\" value=\"_s-xclick\"><input type=\"hidden\" name=\"hosted_button_id\" value=\"YGLMXY4TBU74J\"><input type=\"image\" \
        src=\"https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif\" border=\"0\" name=\"submit\" alt=\"PayPal - The safer, easier way to pay online!\">\
        <img alt=\"\" border=\"0\" src=\"https://www.paypalobjects.com/en_US/i/scr/pixel.gif\" width=\"1\" height=\"1\"></form><div style=\"text-align: center;\"><a target=\"_new\" href=\"https://www.patreon.com/bePatron?u=24521482\" id=\"PATREON_LINK\"><img src=\"./images/patron_button.png\" id=\"PATREON_BUTTON\" style=\"border-radius: 10px;width: 92px;height: auto;\"></a></div>";
        addPolicyPopup("top", donation, "Close", 0, true);
      }
    }
  }
}
