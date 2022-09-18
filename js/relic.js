/*
******************************************
**************** RELIC.JS ****************
******************************************
*/

//Function that initialises the HTML
function initRelic() {
  var parameters = location.search.substring(1).split('=');
  //Load from json
  if(typeof parameters[0] === "string" && parameters[0] == "name") {
    var d = document;
    var p = parent;
    var name = unescape(parameters[1]);
    var relic = p.getRelicById(name);
    if(typeof relic.spoilNotes !== "undefined")
      d.getElementById("RELIC_SYNERGY").innerText = relic.spoilNotes;
    var max_relic = p.getMaxRelicById(relic.id);
    if(relic.id.split('_').length > 2)
      var default_boost = p.getRelicById(relic.id.slice(0, relic.id.lastIndexOf('_')));
    else
      var default_boost = p.getRelicById(relic.id);

    //set the relic's name
    var title = d.getElementById("RELIC_NAME");
    title.innerHTML = "<span id=\"NAME_SPAN\">"+relic["uiName"] + "</span>";
    d.getElementById("NAME_SPAN").addEventListener("click",copyLink);
    title.dataset.id = default_boost.id;
    var rarity_img = d.createElement('img');
    rarity_img.id = "RELIC_RARITY_IMG";
    rarity_img.src = "./images/rarity/" + relic.rarity + "star_line.png";
    title.appendChild(rarity_img);
    //No rating for override relics
    //if(!relic.override)
    //  initRating();

    //set the relic's image
    var relic_img = d.getElementById("RELIC_IMAGE");
    relic_img.addEventListener("error", loadAlternate);
    relic_img.src = "./images/" + relic.uiIcon + ".png";

    //create Level options in dropdown
    var dropdown = createCSelect("RELIC_LEVEL_SELECT");
    var tmp = relic, j=0, number_effect=1;

    //we want to have options 1-10 and not 5-10
    var lv = (typeof default_boost !== "undefined") ? default_boost.level : relic.level;

    while (lv <= max_relic.level){
      dropdown.appendOption(p.getTranslation("LVL").toUpperCase() + ' ' + lv, lv)
      if(typeof tmp.effect3 !== "undefined")
        number_effect = 3;
      else if(typeof tmp.effect2 !== "undefined")
        number_effect = 2;
      lv++;
    }

    //select the correct level
    if(relic.level > 1){
      dropdown.setOption(relic.level);
    }
    d.getElementById("RELIC_JUMP_TO_LEVEL").appendChild(dropdown);

    //level up/down button
    var button = d.getElementById("LEVEL_UP_BUTTON");
    button.src = './images/levelUP2.png';
    button.dataset.level = max_relic.level;
    button.dataset.maxlevel = max_relic.level;
    button.addEventListener('click', levelUp);
    button = d.getElementById("LEVEL_DOWN_BUTTON");
    button.src = './images/levelUP2.png';
    button.dataset.level = max_relic.level;
    button.dataset.maxlevel = max_relic.level;
    button.addEventListener('click', levelDown);

    dropdown.addEventListener("change", jumpToLevel);
    d.getElementById("RELIC_LEVEL").innerHTML = p.getTranslation("LVL").toUpperCase()+' ' + relic.level + '/' + max_relic.level;

    var xp = p.getRelicXp(relic.rarity);
    d.getElementById("XP").innerHTML = p.getTranslation("XP") +": "+ (relic.level < max_relic.level ? xp.relicFusionXPRequired[relic.level] : "---");
    var total_xp = 0;
    for(var i=0; i<relic.level; i++)
      total_xp += xp.relicFusionXPRequired[i];
    d.getElementById("XP_TOTAL").innerHTML = "Total: " + total_xp;
    d.getElementById("XP_FORGE").innerHTML = p.getTranslation("FORGE") +": "+ xp.relicFusionXPWorth[relic.level];

    var effect_container = d.getElementById("RELIC_EFFECTS");
    var div, image, effect;
    number_effect = 3;
    for(var i = 0; i < number_effect; i++){
      div = d.createElement("div");
      image = d.createElement("img");
      effect = d.createElement('p');

      div.className = "flex_row no_wrap";
      image.id = "EFFECT_IMG_"+ (i+1);
      image.className = "effect_img";
      effect.id = "EFFECT_DESCIPTION_" + (i+1);
      effect.className = "effect_description";

      if(typeof relic["effect" + (i+1)] !== "undefined"){
        effect.innerHTML = relic["effect" + (i+1)].uiName;
        if(max_relic["effect" + (i+1)].uiName == relic["effect" + (i+1)].uiName)
          image.src = './images/relic_cards/ability_max.png';
        else
          image.src = "./images/relic_cards/ability_unlock.png";
      }else{
        effect.innerHTML = 'Locked';
        image.src = "./images/relic_cards/ability_lock.png";
      }
      div.appendChild(image);
      div.appendChild(effect);
      effect_container.appendChild(div);
    }
    //default level max; user request
    var event = {};
    event.target = {};
    event.target.value = function(){return max_relic.level};
    jumpToLevel(event);

    d.body.style.visibility = "visible";
    //getRating(relic.id);
  }
}


//Function that loads broken_pot.png if there was an error while loading an image
function loadAlternate(event){
  console.log("Could not load the image: " + event.target.src);
  event.target.onerror = null;
  event.target.src = "./images/relic_cards/broken_pot.png";
  event.preventDefault();
}


function copyLink(ev, build){
  var d = document;
  var t = d.getElementById("RELIC_NAME");
  var lv = d.getElementById("RELIC_LEVEL_SELECT").value();
  var relic = parent.getRelicById(t.dataset.id + (lv == 1 ? '' : '_' + lv));
  var lurl = decodeURI(parent.window.location.toString()).split('?')[0];
  lurl += "?relic=" + relic.id;
  lurl =  encodeURI(lurl);
  var msg = "If you want to disable url shortening, please change the site options. Here is the long version:<br><br>" + lurl;
  if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
    msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Long Url to Clipboard\" type=\"button\" data-url=\"" + lurl + "\">";
  }
  if(parent.LocalStEnable && localStorage.getItem("tinyUrl") == 'enabled'){//link shortening
    parent.addSpinner();
    var xhttp = new XMLHttpRequest();
    var url = "./tiny.php";
    var params = "long_url=" + lurl + '&provider=' + localStorage.getItem("provider");
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200){
        parent.removeSpinner();
        var response = JSON.parse(xhttp.responseText);
        if(response.state != 'error')
        msg += "<br><br>The short link is:<br><br>" + response.shorturl;
        if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
          msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Short Url to Clipboard\" type=\"button\" data-url=\"" + response.shorturl + "\">";
        }

        /*var furl = "[dblink=http://dotdatabase.net/relic.html?name=" + relic.id;
        furl += "]" + relic.uiName + "[/dblink]";
        msg += "<br><br>The forum link, including the BBCode, is:<br><br>" + furl;
        if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
          msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Forum Url to Clipboard\" type=\"button\" data-url=\"" + furl + "\">";
        }*/
        parent.alert("Copy Link", msg);
      }
    };
    xhttp.send(params);
  }
  else{
    /*var furl = "[dblink=http://dotdatabase.net/relic.html?name=" + relic.id;
    furl += "]" + relic.uiName + "[/dblink]";
    msg += "<br><br>The forum link, including the BBCode, is:<br><br>" + furl;
    if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
      msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Forum Url to Clipboard\" type=\"button\" data-url=\"" + furl + "\">";
    }*/
    parent.alert("Copy Link", msg);
  }
}


/***************************************************Level specific functions*********************************************************/

function update(level){
  var d = document;
  var p = parent;
  var id = d.getElementById("RELIC_NAME").dataset.id;
  var relic = p.getRelicById(id);
  while(typeof relic.upgradesTo !== "undefined" && relic.level < level)
    relic = p.getRelicById(relic.upgradesTo);
  var max_relic = p.getMaxRelicById(relic.id);


  var xp = p.getRelicXp(relic.rarity);
  d.getElementById("XP").innerHTML = p.getTranslation("XP") +": "+ (relic.level < max_relic.level ? xp.relicFusionXPRequired[relic.level] : "---");
  var total_xp = 0;
  for(var i=0; i<relic.level; i++)
    total_xp += xp.relicFusionXPRequired[i];
  d.getElementById("XP_TOTAL").innerHTML = "Total: " + total_xp;
  d.getElementById("XP_FORGE").innerHTML = p.getTranslation("FORGE") +": "+ xp.relicFusionXPWorth[relic.level-1];

  for(var i = 0; i < 3; i++){
    var description = d.getElementById("EFFECT_DESCIPTION_" + (i+1));
    var image = d.getElementById("EFFECT_IMG_" + (i+1));
    if(typeof relic["effect" + (i+1)] !== "undefined"){
      description.innerHTML = relic["effect" + (i+1)].uiName;
      image.src = './images/relic_cards/ability_unlock.png';
      if(max_relic["effect" + (i+1)].uiName == relic["effect" + (i+1)].uiName)
        image.src = './images/relic_cards/ability_max.png';
    }
    else if(description !== null){
      description.innerHTML = 'Locked';
      image.src = './images/relic_cards/ability_lock.png';
    }
  }
  d.getElementById("RELIC_LEVEL").innerHTML = p.getTranslation("LVL").toUpperCase() + ' ' + relic.level + '/' + max_relic.level;
  var select = d.getElementById("RELIC_LEVEL_SELECT");
  if(select.value() != relic.level) select.setOption(relic.level);
  if(p.SessionStEnable && (localStorage.getItem("saveTitanForumSwitch") == "enabled" || localStorage.getItem("saveTitanForumSwitch") == null))
    sessionStorage.setItem("returnLastTitan", "http://dotdatabase.net/relic.html?name=" + relic.id);
}

function levelUp(event) {
  event.preventDefault();
  if(event.target.dataset.level == event.target.dataset.maxlevel) return;
  event.target.dataset.level = parseInt(event.target.dataset.level) + 1;
  document.getElementById("LEVEL_DOWN_BUTTON").dataset.level = event.target.dataset.level;
  update(event.target.dataset.level);
}

function levelDown(event) {
  event.preventDefault();
  if(event.target.dataset.level == 1) return;
  event.target.dataset.level -= 1;
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.dataset.level;
  update(event.target.dataset.level)
}

function jumpToLevel(event) {
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.value();
  document.getElementById("LEVEL_DOWN_BUTTON").dataset.level = event.target.value();
  update(event.target.value())
}
