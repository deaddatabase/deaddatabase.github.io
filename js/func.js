var LocalStEnable = function() {
  try {
      var mod = '__storage_test__';
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
  } catch(e) {
      return false;
  }
}();
var SessionStEnable = function() {
  try {
      var mod = '__storage_test__';
      sessionStorage.setItem(mod, mod);
      sessionStorage.removeItem(mod);
      return true;
  } catch(e) {
      return false;
  }
}();

//polyfill the CustomEvent() constructor functionality in Internet Explorer 9
(function () {
  if ( typeof window.CustomEvent === "function" ) return false;
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: null };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
  window.CustomEvent = CustomEvent;
})();

const qmarkStr = "??????";

function capital(string) {
  var pieces = string.split(' ');
  var tmp = '';
  for(var i = 0, len = pieces.length; i < len; i++){
    if(pieces[i] == '') continue;
    if(pieces[i] == "II" || pieces[i] == "III");
    else {
      if(pieces[i][0] == '(' && typeof pieces[i][1] !== "undefined")
        pieces[i] = pieces[i][0] + pieces[i][1].toUpperCase() + pieces[i].substring(2).toLowerCase();
      else if(pieces[i][0] == 'X' && !isNaN(parseInt(pieces[i][1])))
        pieces[i] = pieces[i].toLowerCase();
      else if(pieces[i][0] == pieces[i][0].toUpperCase())
        pieces[i] = pieces[i][0] + pieces[i].substring(1).toLowerCase();
      else
        pieces[i] = pieces[i][0].toUpperCase() + pieces[i].substring(1).toLowerCase();
    }
    tmp += pieces[i] + ' ';
  }
  if(tmp[tmp.length-1] == ' ')
    return tmp.slice(0, -1);
  return tmp;
}

function unique_list(arr) {
  var u = {}, a = [];
  for(var i = 0, l = arr.length; i < l; ++i){
    if(!u.hasOwnProperty(arr[i])) {
      a.push(arr[i]);
      u[arr[i]] = 1;
    }
  }
  return a;
}

function setupToast(){
    var d = document;
    var x = d.createElement("div");
    x.id = "TOAST";
    d.body.appendChild(x);
    x.addEventListener("animationend", function(e){
      if(e.animationName == "fadein"){
        toast.state = "running";
      }
      else if(e.animationName == "fadeout"){
        x.className = x.className.replace("show", '');
        toast.state = "finished";
      }
    });
    x.addEventListener("animationstart", function(e){
      if(e.animationName == "fadein"){
        toast.state = "starting";
      }
      else if(e.animationName == "fadeout"){
        toast.state = "finishing";
      }
    });
}

function toast(text) {
    if(typeof toast.state === "undefined") toast.state = "starting";
    if(typeof toast.startTime === "undefined") toast.startTime = Date.now();
    var x = document.getElementById("TOAST");
    if(x.className == "show"){
      if(toast.state.match(/starting|finishing/)){
        setTimeout(function(){toast(text)}, 500);
        return;
      }
      else if(toast.state == "running"){
        var deltaTime = Date.now() - toast.startTime;
        toast.startTime = Date.now();
        x.style.webkitAnimationPlayState = "paused";
        setTimeout(function(){
          x.style.webkitAnimationPlayState = "running";
        }, deltaTime);
      }
    }
    else{
      x.className = "show";
      toast.state = "running";
      toast.startTime = Date.now();
    }
    x.innerText = text;
}

function setFrameSrc(id, url, event){
  document.getElementById(id).src = url;
}

function openInCompareFrame(event){
  document.getElementById("COMPARE_IFRAME").src = event.target.dataset.url;
}

function load_titan(name, id){
  d = document;
  if(d.getElementById("MODAL_CONTAINER")) return;

  modal_container = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
  modal_container.id = "MODAL_CONTAINER";
  modal_container.style.height = d.documentElement.scrollHeight + "px";

  alert_box = modal_container.appendChild(d.createElement("div"));
  alert_box.style.width = "300px";

  alert_box.id = "ALERT_BOX";
  if(d.all && !window.opera) alert_box.style.top = d.documentElement.scrollTop + "px";
  alert_box.style.left = (d.documentElement.offsetWidth - alert_box.offsetWidth)/2 + "px";
  alert_box.style.visiblity = "visible";
  alert_box.style.display = "block";

  btn = alert_box.appendChild(d.createElement('a'));
  btn.id = "CLOSE_BUTTON";
  btn.appendChild(d.createTextNode('x'));
  btn.href = "javascript:;";
  btn.addEventListener("click", removeCustomAlert);

  h1 = alert_box.appendChild(d.createElement("h1"));
  h1.appendChild(d.createTextNode("Load " + name + " Build"));

  msg = alert_box.appendChild(d.createElement('p'));
  msg.style.textAlign = "left";
  var build_names = localStorage.getItem(id);//build names seperated by ;
  if(LocalStEnable && build_names != null){
    build_names = build_names.split(';');
    msg.innerHTML = "Current saved builds are:<br>";
    for(var i=0; i<build_names.length; i++){
      var build_link = d.createElement("a");
      build_link.innerText = build_names[i];
      build_link.className = "link";
      build_link.dataset.name = name;
      build_link.target = "titan_frameName";
      build_link.href = "./titan.html?titan=" + id + "&build=" + localStorage.getItem(id + '#' + build_names[i]);
      msg.appendChild(build_link);
      var del = d.createElement("img");
      del.dataset.id = id;
      del.dataset.name = name;
      del.dataset.buildName = build_names[i];
      del.className = "delete_build_img";
      del.src = "./images/delete.png";
      msg.appendChild(del);
      msg.innerHTML += "<br>";
    }
    var links = modal_container.getElementsByClassName("link");
    var del_buttons = modal_container.getElementsByClassName("delete_build_img");
    for(var i=0; i<links.length; i++){
      links[i].addEventListener("click", function(event){
        toast(event.target.dataset.name + ": " + event.target.innerText + " loaded.");
        removeCustomAlert(event);
        if(mobilecheck() && window.screen.width < 554) showMenu();
      });
      del_buttons[i].addEventListener("click", function(event){
        var id = event.target.dataset.id;
        var build_name = event.target.dataset.buildName;
        var builds = localStorage.getItem(id);
        if(builds == null) return;
        else builds = builds.split(';');
        var new_builds = '';
        for(var i=0; i<builds.length; i++){
          if(builds[i] == build_name) continue;
          else new_builds += builds[i] + ';';
        }
        new_builds = new_builds.slice(0, -1); 
        localStorage.removeItem(id + '#' + build_name);
	if(new_builds != "") localStorage.setItem(id, new_builds);
        else{
          localStorage.removeItem(id);
          document.getElementById("LOAD_IMG_" + id).className += " content_hide";
        }
        toast(event.target.dataset.name + ": " + build_name + " deleted.");
        removeCustomAlert(event);
      });
    }
  }
}

function save_titan(name, id, build){
  d = document;
  if(d.getElementById("MODAL_CONTAINER")) return;

  modal_container = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
  modal_container.id = "MODAL_CONTAINER";
  modal_container.style.height = d.documentElement.scrollHeight + "px";

  alert_box = modal_container.appendChild(d.createElement("div"));
  alert_box.style.width = "300px";

  alert_box.id = "ALERT_BOX";
  if(d.all && !window.opera) alert_box.style.top = d.documentElement.scrollTop + "px";
  alert_box.style.left = (d.documentElement.offsetWidth - alert_box.offsetWidth)/2 + "px";
  alert_box.style.visiblity = "visible";
  alert_box.style.display = "block";

  btn = alert_box.appendChild(d.createElement('a'));
  btn.id = "CLOSE_BUTTON";
  btn.appendChild(d.createTextNode('x'));
  btn.href = "javascript:;";
  btn.addEventListener("click", removeCustomAlert);

  h1 = alert_box.appendChild(d.createElement("h1"));
  h1.appendChild(d.createTextNode("Save " + name));

  msg = alert_box.appendChild(d.createElement('p'));
  msg.style.textAlign = "left";
  
  var build_names = localStorage.getItem(id);//build names seperated by ;
  msg.innerHTML = "Using the same name as an existing build will overwrite that build.<br><br>";
  if(LocalStEnable && build_names != null){
    build_names = build_names.split(';');
    msg.innerHTML += "Current saved builds are:<br>";
    for(var i=0; i<build_names.length; i++){
      if(localStorage.getItem(id + '#' + build_names[i]) == build){
        toast("Build already exists as: " + build_names[i]);
        removeCustomAlert();
        return;
      }
      var build_link = d.createElement('a');
      build_link.className = "link";
      build_link.innerText =  build_names[i];
      build_link.innerHTML += "<br>";
      build_link.href = "#";
      build_link.dataset.id = id;
      build_link.dataset.name = name;
      build_link.dataset.bName = build_names[i];
      build_link.dataset.build = build;
      msg.innerHTML += (i+1) + ") ";
      msg.appendChild(build_link);
    }
  }
  else msg.innerText += "There are no saved builds for this titan.";
  if(LocalStEnable){
    var textbox = d.createElement("input");
    textbox.type = "text";
    textbox.id = "BUILD_NAME";
    textbox.size = "34";
    textbox.maxLength = "25";
    textbox.placeholder = "Enter a name for your build!";
    //textbox
    msg.appendChild(textbox);
    msg.innerHTML += "<br>";
    var save_btn = d.createElement("div");
    save_btn.innerText = "SAVE BUILD";
    save_btn.id = "SAVE_BUILD_BUTTON";
    save_btn.className = "no_select";
    save_btn.dataset.id = id;
    save_btn.dataset.name = name;
    save_btn.dataset.build = build;
    save_btn.addEventListener("click", function(event){
      event.preventDefault();
      var d = document;
      var build_name = d.getElementById("BUILD_NAME").value;
      if(build_name == '') {
        d.getElementById("BUILD_NAME").style.borderColor = "red";
        return;
      }
      var names = localStorage.getItem(event.target.dataset.id);
      if(names == null) names = build_name;
      else if(!names.match(build_name)) names += ';' + build_name; 
      localStorage.setItem(event.target.dataset.id, names);
      var load_img = d.getElementById("LOAD_IMG_" + event.target.dataset.id);
      load_img.className = load_img.className.replace(" content_hide", '');
      localStorage.setItem(event.target.dataset.id + '#' + build_name, event.target.dataset.build);
      toast(event.target.dataset.name + ": " + build_name + " saved.");
      removeCustomAlert();
    });
    msg.appendChild(save_btn);

    var links = modal_container.getElementsByClassName("link");
    for(var i=0; i<links.length; i++){
      links[i].addEventListener("click", function(event){
        event.preventDefault();
        localStorage.setItem(event.target.dataset.id + '#' + event.target.dataset.bName, event.target.dataset.build);
        toast(event.target.dataset.name + ": " + event.target.innerText + " overwritten.");
        removeCustomAlert();
        //d.getElementById("BUILD_NAME").value = event.target.dataset.bName;
      });
    }
  }
}

function getTitanByName(id) {
    var t = res.titan;
    for (var i = t.length; i--;)
        if (t[i].uiName == id)
            return t[i];
}

function getTitanById(id) {
    var t = res.titan;
    for (var i = t.length; i--;)
        if (t[i].id == id)
            return t[i];
}


function getOldTitanById(id, ver) {
    var t = res['titan_'+ver];
    for (var i = t.length; i--;)
        if (t[i].id == id)
            return t[i];
}

function getTitanMaxLevel(id) {//max level in the data
    var titan = getTitanById(id);
    if(typeof getTitanById(titan.id + titan.ascensionMaxLevel) !== "undefined")
      return titan.ascensionMaxLevel;
    if(typeof titan.ascensionMaxLevel === "undefined"){
      for(var i = 1; i < 62; i++)
        if(typeof getTitanById(titan.id + (i == 1 ? '' : i)) === "undefined")
          return i-1;
      }
      else{
        for(var i = titan.ascensionMaxLevel; i--;)
          if(typeof getTitanById(titan.id + i) !== "undefined")
            return i;
      }
}
function getTroopByName(name) {
    var t = res.troop;
    for (var i = t.length; i--;)
        if (t[i].uiName == name)
            return t[i];
}
function getTroopById(id) {
    var t = res.troop;
    for (var i = t.length; i--;)
        if (t[i].id == id)
            return t[i];
}

function getMaxTroopList(){
  var t = res.troop;
  var result = [];
  for (var i = t.length; i--;){
    var troop = t[i];
    if (!troop.id.match(/\d+$/g)){
      if(troop.displayHealth == t[i+1].displayHealth && troop.displayDamage == t[i+1].displayDamage)
        result.push(troop.id);
    }
  }
  result.reverse();
  return result;
}

function getSpecialisedTroopList(){
  var t = res.troop;
  var result = [];
  for (var i = t.length; i--;){
    var troop = t[i];
    if (!troop.id.match(/\d+$/g) && !troop.hirable){
      result.push(troop.id);
    }
  }
  result.reverse();
  return result;
}

function getAllTroopList(){
  var t = res.troop;
  var result = [];
  for (var i = t.length; i--;){
    var troop = t[i];
    if (!troop.id.match(/\d+$/g)){
      result.push(troop.id);
    }
  }
  result.reverse();
  return result;
}

function getSpell(id){
  var r = res.spell;
  for (var i = r.length; i--;)
    if(r[i].id == id) return r[i];
}

function getMissile(id){
  var r = res.Missiles;
  if(!id.match('_')) id = spellIdToMissile(id);
  for(var i = r.length; i--;)
    if(r[i].id == id) return r[i];
}

function getSpellVar(id){
  var r = res.SpellVars;
  if(!id.match('_')) id = spellIdToVar(id);
  return r[id];
}

function spellIdToVar(id){//LightningCloud, LightningStorm, MeteorStrike, RaiseDead, Terror
  var lv, name;
  if(!isNaN(parseInt(id.slice(-1)))){
    if(!isNaN(parseInt(id.slice(-2)))){
      lv = parseInt(id.slice(-2));
      name = id.slice(0, -2);
    }
    else{
      lv = parseInt(id.slice(-1));
      name = id.slice(0, -1);
    }
  }
  else name = id;
  if(name == "Lightning") name += "Cloud";
  return name + '_' + (typeof lv === "undefined"  ? 1 : lv);
}

function spellIdToMissile(id){//FireballSpell
  var lv, name;
  if(!isNaN(parseInt(id.slice(-1)))){
    if(!isNaN(parseInt(id.slice(-2)))){
      lv = parseInt(id.slice(-2));
      name = id.slice(0, -2);
    }
    else{
      lv = parseInt(id.slice(-1));
      name = id.slice(0, -1);
    }
  }
  else name = id;
  return name + 'Spell' + (lv == 1 || typeof lv === "undefined"  ? '' : ('_' + lv) );
}

function getRelicById(id) {
    var r = res.relic;
    for (var i = r.length; i--;)
        if (r[i].id == id)
            return r[i];
}

function getAutocastAbilityById(id){
    return res.AutocastAbilities[id]
}
function getAutocastRelicById(id){
    var r = res.AutocastSpoilTypes;
    for (var i = r.length; i--;)
       if(r[i].id == id)
            return r[i]
}

function getRelicByNr(n){
    return res.relic[n];
}

function getRelicByName(id) {
    var r = res.relic;
    for (var i = r.length; i--;)
        if (r[i].textString1/*uiName*/ == id)
            return r[i];
}

function getTitles(){
  return res.PlayerTitles;
}

function getTitleById(id){
  var r=res.PlayerTitles;
  for(var i=0; i<r.length; i++){
    if(r[i].id == id)
      return r[i];
  }
}

function getPantheonRelics(){
  var list = {};
  var r=res.TitanCollections;
  for(var i=1; i<r.length; i++){
    var collectionLevels = r[i].collectionLevels;
    for(var j=0; j<collectionLevels.length; j++){
      var spoils = collectionLevels[j].reward.spoils_and_units;
      for(var k=0; k<spoils.length; k++){
        var reward = spoils[k];
        var relic = getRelicById(reward.id);
        var name = relic.uiName + "("+relic.rarity+"*)"; 
        if(typeof reward !== "undefined"){
          if(!(list.hasOwnProperty(reward.id)))
            list[name] = [];
          for(var l=0; l<collectionLevels[j].titansRequired.length; l++){
             list[name].push(getTitanById(collectionLevels[j].titansRequired[l].id).uiName);
          }
        }
      }
    }
  }
  return list;
}

function relicInPantheon(id){
  var r=res.TitanCollections;
  for(var i=1; i<r.length; i++){
    var collectionLevels = r[i].collectionLevels;
    for(var j=0; j<collectionLevels.length; j++){
      var spoils = r[i].collectionLevels[j].reward.spoils_and_units;
      for(var k=0; k<spoils.length; k++){
        var reward = spoils[k];
        if(typeof reward !== "undefined" && reward.id == id)
          return true;
      }
    }
  }
  return false;
}

function getBaseSkillById(id) {
    if(!isNaN(parseInt(id.slice(-1)))){
      if(!isNaN(parseInt(id.slice(-2, -1))))
        id = id.slice(0, -3);//excluse _
      else
        id = id.slice(0,-2);
    }
    var t = res.titanBuffs;
    for (var i = t.length; i--;)
        if (t[i].id == id)
            return t[i];
}

function getSkillById(id) {
    var t = res.titanBuffs;
    for (var i = t.length; i--;)
        if (t[i].id == id)
            return t[i];
}

function isUnitOverride(id) {
  if(id == "Skeleton" || id.indexOf("PikemenSpartan") == 0)
    return false;
  else
    id.replace("Horde", '')
  var t = res.troop;
  for (var i = t.length; i--;)
    if(t[i].id == id + "Summon" || t[i].id == id + "Raid")
      return true;
  return false;
}

function getUnitOverrideId(id, type) {
  if(id == "Skeleton")
    return id;
  if(id.includes("Summon") || id.includes("Raid"))
    return id;
  if(type.toLowerCase() == "omega")
    return "Summon" + id
  else if(type.toLowerCase() == "omega_troop")
    return id + "Summon"
  else if(type.toLowerCase() == "corrupted")
    return id.replace("Horde", "") + "Raid";
  else
    return id;
}

function getTranslation(id) {
		var lang_lookup = {"en":"US ENGLISH", "fr":"FRENCH", "de":"GERMAN", "it":"ITALIAN",
            "es":"SPANISH", "pt":"PORTUGUESE(BR)", "ru":"RUSSIAN", "chs":"CHINESE(S)",
            "cht":"CHINESE(T)", "jp":"JAPANESE", "ko":"KOREAN", "da":"DANISH",
            "nl":"DUTCH", "no":"NORWEGIAN", "sv":"SWEDISH", "tr":"TURKISH", "ar":"ARABIC"
    };
    id = (id.match(/TXT_/) ? '' : "TXT_") + id.replace(/\s/g, '_').toUpperCase();//replace spaces and make uppercase
    //base translation default
    var cur_lang = localStorage.getItem("lang");
    cur_lang = cur_lang == null ? lang_lookup["en"] : lang_lookup[cur_lang];
    var r = undefined;
    if(typeof r === "undefined"){
      try{
        r = res["baseTranslation"][id][cur_lang];
      } catch {
        console.log("Could not find " + id);
      }
      
    }
    if(typeof r !== "undefined")
      return capital(r);
    return qmarkStr;
}

function getSkillByName(name) {
    var t = res.titanBuffs;
    for (var i = t.length; i--;)
        if (t[i].textString1 == name)
            return t[i];
}

function getTitanXp(){
  return res.titanLvl;
}

function getRelicXp(rarity){
  var t = res.relicRepair;
  for(var i = t.length; i--;){
    if(rarity == t[i].relicRarity)
    return t[i];
  }
}

function getMaxTroopLevel(id){
  max_troop = getTroopById(id+60);
  if(typeof(max_troop) !== "undefined")
    return 60;
  else
    return 25;
}

function getAscensionCost(){
  return res.ascensionCost;
}

function getTroops(){
  return res.troop;
}

function getSkillPool(id){
  var r=res.titanSkillPools;
  for(var i = 0; i < r.length; i++)
    if(r[i].id == id)
      return r[i];
}
function getOldSkillPool(id, ver){
  var r=res["titanSkillPools_" + ver];
  if(typeof r !== "undefined")
  for(var i = 0; i < r.length; i++)
    if(r[i].id == id)
      return r[i];
}

function getTitanPatch(id, asc){
  for(var i=res.titanPatch.length; i--;)
    if(res.titanPatch[i].id == id){
      if(asc == "1")return res.titanPatch[i].baseEvolveSpoil;
      else if(asc == "2")return res.titanPatch[i].firstEvolveSpoil;
      else if(asc == "3")return res.titanPatch[i].secondEvolveSpoil;
    }
}

function copyToClipboard(event){
  var d = document;
  event.preventDefault();
  var t = d.createElement("textArea");
  t.innerText = event.target.dataset.url;
  d.getElementById("ALERT_BOX").appendChild(t);
  t.select();
  d.execCommand("copy");
  t.parentElement.removeChild(t);
  toast("Link Copied!");
}

function replaceSpells(string){
  return string.replace(/Terror/i, getTranslation("TERROR_NAME")).replace(/Shield/i, getTranslation("SHIELD_NAME")).replace(/Rage/i, getTranslation("RAGE_NAME")).replace(/Fireball/i, getTranslation("FIREBALL_NAME")).replace(/MeteorStrike/i, getTranslation("METEOR_STRIKE_NAME")).replace(/RaiseDead/i, getTranslation("RAISE_DEAD_NAME")).replace(/PoisonCloud/i, getTranslation("POISON_CLOUD_NAME")).replace(/Freeze/i, getTranslation("FREEZE_NAME")).replace(/LightningStorm/i, getTranslation("LIGHTNING_STORM_NAME")).replace(/Lightning/i, getTranslation("LIGHTNING_NAME"));
}
function replaceElements(string){
  return string.replace(/HP/i, getTranslation("HP_DAMAGE")).replace(/FREEZE/i, getTranslation("FREEZE_DAMAGE")).replace(/ACID/i, getTranslation("ACID_DAMAGE")).replace(/FIRE/i, getTranslation("FIRE_DAMAGE")).replace(/EARTH/i, getTranslation("EARTH_DAMAGE")).replace(/LIGHTNING/i, getTranslation("LIGHTNING_DAMAGE")).replace(/ALL_ELEMENTAL_TYPES/i, getTranslation("ALL_ELEMENTAL_TYPES_DAMAGE")).replace(/VOID/i, getTranslation("VOID_DAMAGE"));
}
function replaceTroops(string){
  return string.replace(/ARCHER(\b|s\b)/i, getTranslation("UINAME_ARCHERS")).replace(/MILITIA/i, getTranslation("UINAME_MILITIA")).replace(/PIKEMEN/i, getTranslation("UINAME_PIKEMEN")).replace(/MOSSMANE/i, getTranslation("UINAME_MOSSMANE")).replace(/RAGNAR/i, getTranslation("UINAME_RAGNAR")).replace(/UNAK/i, getTranslation("UINAME_UNAK")).replace(/ELITHEN/i, getTranslation("UINAME_ELITHEN")).replace(/HERO/i, getTranslation("UINAME_HERO")).replace(/AXETHROWER/i, getTranslation("UINAME_VIKING")).replace(/SKELETONHORDE/i, getTranslation("UINAME_SKELETONHORDE")).replace(/SKELETON/i, getTranslation("UINAME_SKELETON"));
}

function minToDayHourMinute(time){//if minutes
  m = time % 60;
  h = time / 60 - m / 60;
  d = Math.round(h / 24 - h % 24 / 24);
  h -= d * 24;
  time = '';
  if(d != 0) time += Math.round(d) + 'd ';
  if(h != 0) time += Math.round(h) + 'h ';
  if(m != 0) time += Math.round(m) + 'm';
  return time;
}

function secToMinutes(time){//if seconds
  s = time % 60;
  m = time / 60 - s/60;
  time = '';
  if(m != 0) time = Math.round(m) + 'm ';
  if(s != 0) time += Math.round(s) + 's';
  return time;
}
/*
function sendGaEvent(category, action, label){
  if(typeof ga !== "undefined")
    ga('send', 'event', category, action, label, '');
}
*/
function roundToDec(num, dec){
  if(typeof dec === "undefined") dec = 1;
  var val = Math.pow(10, dec);
  return Math.round((num + 0.00001) * val) / val;
}

function arrayCompare(array1, array2){
  return JSON.stringify(array1) === JSON.stringify(array2)
}

function getMaxRelicById(relicID){
  var relic = getRelicById(relicID);
  while(typeof relic.upgradesTo !== "undefined" && typeof relic.upgradesTo === "string")
    relic = getRelicById(relic.upgradesTo);
  return relic;
}

function changeSelection(select, value) {
  var options = select.children;
  for(var i=0; i<options.length; i++) {
    if(typeof options[i].selected !== "undefined")
      options[i].removeAttribute("class");
    if(options[i].value == value)
      options[i].selected = "true";
  }
}

function hideTitansFromList(){
  var d=document;
  var titan_class = capital(d.getElementById("ARCHETYPE_FILTER_TAB_TITAN").value());
  var titan_race = capital(d.getElementById("UNITSPECIES_FILTER_TAB_TITAN").value());

  var list = d.getElementById("TITAN_LIST").getElementsByClassName("list_entry");
  var name = d.getElementById("TITAN_FILTER_BY_NAME").value;
  for(var j = 0, len = list.length; j < len; j++){
    var id = list[j].href.split('=');
    var titan = getTitanById(id[id.length-1]);
    if(typeof titan.archetype === "undefined") titan.archetype = getTitanById(titan['extends']).archetype;
    if(titan_class == titan_race) list[j].parentElement.className = '';
    //two filter
    else if(titan_class != "---" && titan_race != "---" &&
      titan_class == capital(titan.archetype) && titan_race == capital(titan.unitSpecies)){
      list[j].parentElement.className = ''; //break;
    }
    //one filter
    else if(titan_class == "---" && titan_race != "---" &&
      titan_race == capital(titan.unitSpecies)){
      list[j].parentElement.className = ''; //break;
    }
    else if(titan_class != "---" && titan_race == "---" &&
      titan_class == capital(titan.archetype)){
      list[j].parentElement.className = ''; //break;
    }
    else { list[j].parentElement.className = "content_hide"; }
  }
  for(var i=0; i<list.length; i++){
    if(list[i].innerText.split('(')[0].toLowerCase().indexOf(name.toLowerCase()) == -1){
      if(list[i].parentElement.className.indexOf("content_hide") == -1)
        list[i].parentElement.className += " content_hide";
    }
    else list[i].parentElement.className = list[i].parentElement.className.replace(" content_hide", '');
  }
}

function hideRelicsFromList(){
  var d=document;
  var effect = d.getElementById("EFFECT_FILTER_TAB_RELIC").value();
  var target = d.getElementById("TARGET_FILTER_TAB_RELIC").value();
  var specific = d.getElementById("SPECIFICTARGET_FILTER_TAB_RELIC").value();

  var list = d.getElementById("RELIC_LIST").getElementsByClassName("list_entry");
  var name = d.getElementById("RELIC_FILTER_BY_NAME").value;
  for(var j = 0,len = list.length; j < len; j++){
    var id = list[j].href.split('=');
    var relic = getMaxRelicById(id[id.length-1]);
    var k=1;
    while(typeof relic["effect"+k] !== "undefined"){
      //CUSTOM FILTERS GO HERE
      if(relic.id.match(specific)){list[j].parentElement.className = ''; break;}//id contains EV; event relic filter
      else if(effect == target && effect == specific) list[j].parentElement.className = '';
      //three abl filter
      else if(effect != "---" && target != "---" && specific != "---" &&
        effect == relic["effect"+k].effect && target == relic["effect"+k].target && specific == relic["effect"+k].specificTarget){
        list[j].parentElement.className = ''; break;
      }
      //one abl filter
      else if(effect == "---" && target != "---" && specific == "---" &&
        target == relic["effect"+k].target){
        list[j].parentElement.className = ''; break;
      }
      else if(effect != "---" && target == "---" && specific == "---" &&
        effect == relic["effect"+k].effect){
        list[j].parentElement.className = ''; break;
      }
      else if(effect == "---" && target == "---" && specific != "---" &&
        specific == relic["effect"+k].specificTarget){
        list[j].parentElement.className = ''; break;
      }
      //two abl filter
      else if(effect != "---" && target != "---" && specific == "---" &&
        target == relic["effect"+k].target && effect == relic["effect"+k].effect){
        list[j].parentElement.className = ''; break;
      }
      else if(effect != "---" && target == "---" && specific != "---" &&
        effect == relic["effect"+k].effect && specific == relic["effect"+k].specificTarget){
        list[j].parentElement.className = ''; break;
      }
      else if(effect == "---" && target != "---" && specific != "---" &&
        target == relic["effect"+k].target && specific == relic["effect"+k].specificTarget){
        list[j].parentElement.className = ''; break;
      }
      else { list[j].parentElement.className = "content_hide"; }
      k++;
    }
  }
  for(var i=0; i<list.length; i++){
    if(list[i].innerText.split('(')[0].toLowerCase().indexOf(name.toLowerCase()) == -1){
      if(list[i].parentElement.className.indexOf("content_hide") == -1)
        list[i].parentElement.className += " content_hide";
    }
    else list[i].parentElement.className = list[i].parentElement.className.replace(" content_hide", '');
  }
}

function printTitanNames(){
  var r = parent.res.relic;
  for(var i = 0, len = r.length; i < len; i++)
    if(r[i].id.match(/T_[0-9]/))
      console.log(r[i].id + ':' + r[i].textString1 + ':' + r[i].uiName);
}

function getPortraitId(titan_id){
    var r = res.titan;
    for (var i = r.length; i--;)
        if (isNaN(r[i].id.slice(-1) && r[i].id == titan_id) && typeof r[i].uiIcon !== "undefined")
    return r[i].uiIcon.split('/')[1];
}

function setCookie(cname, cvalue, exdays) {
    if(typeof exdays === "undefined")
  exdays = 1;
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + '=';
    var decoded_cookie = decodeURIComponent(document.cookie);
    var ca = decoded_cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
/*
function getCookies(){
  var pairs = document.cookie.split(";");
  var cookies = {};
  for (var i=0; i<pairs.length; i++){
    var pair = pairs[i].split("=");
    cookies[(pair[0]+'').trim()] = unescape(pair[1]);
  }
  return cookies;
}
*/

function copyLocal2SessionStorage(){
  if(LocalStEnable && SessionStEnable){
    var key;
    for(var i=0; i<localStorage.length; i++){
      key = localStorage.key(i);
      sessionStorage.setItem(key, localStorage.getItem(key));
    }
  }
}

function copySession2LocalStorage(){
  if(SessionStEnable && LocalStEnable){
    var key;
    for(var i=0; i<sessionStorage.length; i++){
      key = sessionStorage.key(i);
      localStorage.setItem(key, sessionStorage.getItem(key));
    }
  }
}

function backupStorage(type){
  if(type.match(/[lL]ocal/)) var otherType = "session", type = local;
  else var otherType = "local", type = "session";
  if(SessionStEnable && LocalStEnable){
    var s = '';
    for(var i=0; i<window[type + "Storage"].length; i++){
      var key = window[type + "Storage"].key(i);
      s += key + ',' + window[type + "Storage"].getItem(key) + '|';
    }
    s = s.slice(0, -1);
    window[otherType + "Storage"].setItem("backup"+capital(type)+"Storage", s);
  }
}


function restoreStorage(type){
  if(type.match(/[lL]ocal/)) var otherType = "session", type = local;
  else var otherType = "local", type = "session";
  if(SessionStEnable && LocalStEnable){
    var s = window[otherType + "Storage"].getItem("backup"+capital(type)+"Storage");
    if(s == null) return;
    var pairs = s.split('|');
    for(var i=0; i<pairs.length; i++){
      var p_split = pairs[i].split(',');
      window[type + "Storage"].setItem(p_split[0], p_split[1]);
    }
    window[otherType + "Storage"].removeItem("backup"+capital(type)+"Storage");
  }
}

function backupBuilds(){
  if(SessionStEnable && LocalStEnable){
    var s = '';
    for(var i=0; i<localStorage.length; i++){
      var key = localStorage.key(i);
      //not sure where __INTERSTITIAL_ comes from but it was included in the database
      if(!key.match(/lang|saveLastTitan|saveTitanForumSwitch|__INTERSTITIAL_|relicStacking|tinyUrl|provider|manualSkillLevel|collection|individualHealth|compare|hideDonate|GodMode|userId|backup/) && key != '')
        s += key + ',' + localStorage.getItem(key) + '|';
    }
    s = s.slice(0, -1);
    sessionStorage.setItem("backupBuilds", s);
  }
}

function restoreBuilds(){
  if(SessionStEnable && LocalStEnable){
    var s = sessionStorage.getItem("backupBuilds");
    if(s == null) return;
    var pairs = s.split('|');
    for(var i=0; i<pairs.length; i++){
      var p_split = pairs[i].split(',');
      localStorage.setItem(p_split[0], p_split[1]);
    }
    sessionStorage.removeItem("backupBuilds");
    recountCollection();
  }
}

function recountCollection(){
  if(LocalStEnable){
    var c = 0;
    for(var i=0; i<localStorage.length; i++){
      var key = localStorage.key(i);
      if(localStorage.getItem(key) == "owned")
        c++;
    }
    localStorage.setItem("collectionSize", c);
  }
}

function removeRedundantItems(){
  if(SessionStEnable && LocalStEnable){
    backupStorage("session");
    sessionStorage.clear();
    copyLocal2SessionStorage();
    sessionStorage.removeItem("GodMode");
    sessionStorage.removeItem("collection");
    sessionStorage.removeItem("collectionSize");
    sessionStorage.removeItem("manualSkillLevel");
    sessionStorage.removeItem("provider");
    sessionStorage.removeItem("relicStacking");
    sessionStorage.removeItem("tinyUrl");
    sessionStorage.removeItem("backupSessionStorage");
    sessionStorage.removeItem("individualHealth");
    var relics = res.relic;
    var titans = res.titan;
    var key;
    for(var i=0; i<sessionStorage.length; i++){
      key = sessionStorage.key(i);
      for(var r=0; r<relics.length; r++){
        if(key.match(relics[r].id)){
          sessionStorage.removeItem(key);
          i--;
          break;
        }
      }
    }
    for(var i=0; i<sessionStorage.length; i++){
      key = sessionStorage.key(i);
      for(var r=0; r<titans.length; r++){
        if(key.match(titans[r].id)){
          sessionStorage.removeItem(key);
          i--;
          break;
        }
      }
    }
    for(var i=0; i<sessionStorage.length; i++){
      localStorage.removeItem(sessionStorage.key(i));
    }
    sessionStorage.clear();
    restoreStorage("session");
  }
}

function getDropRate(poolId, id){
  if(typeof getDropRate.pool === "undefined")
    getDropRate.pool = poolId;
  if(typeof getDropRate.id === "undefined")
    getDropRate.id = [];
  if(getDropRate.pool != poolId){
    getDropRate.pool = poolId;
    getDropRate.id = [];
  }
  var pool = res.SpoilPoolTypes;
  var pool2 = 0;
  var found = {};
  found.chance = 0;
  var tmp = Object.keys(pool);
  for(var i = tmp.length; i--;)
    if(pool[tmp[i]]['id'] == poolId)
      pool2 = pool[tmp[i]];
  if(pool2 == 0)return "Error";
  var keys = Object.keys(pool2);
  var total = 0;

  for(var i = keys.length; i--;){
    if(keys[i] == 'id')continue;
    if(typeof pool2[keys[i]].id !== "undefined" && pool2[keys[i]].id == id){
      found.id = pool2[keys[i]].id;
      found.chance += pool2[keys[i]].chance;
    }
    if(typeof pool2[keys[i]].chance !== "undefined")
      total += parseInt(pool2[keys[i]].chance);
  }
  var name = getRelicById(id);
  var tmp = name;
  var element = undefined;
  while(typeof tmp.upgradesTo !== "undefined" && typeof tmp.upgradesTo == "string")
    tmp = getRelicById(tmp.upgradesTo);
  for(var i= 0; i<3;i++){
    if(typeof tmp["effect"+(i+1)] !== "undefined"){
      if(tmp["effect"+(i+1)].effect == "DAMAGE_TYPE_RESIST")
        element = replaceElements(tmp["effect"+(i+1)].value.split(':')[0]);
    }
  }
  if(typeof name === "undefined") return;
  //console.log(name.uiName, name.id, total, found);
  for(var i=0; i<getDropRate.id.length; i++){
    if(getDropRate.id[i] == found.id) return;
  }
  if(total > 0 && found.chance != 0){
    getDropRate.id.push(id);//push printed relic
    if(name.effect1.effect == "GAIN" && name.effect1.target == "SPECIFIC_HERO"){
      var spl = name.id.split('_'), repl = 0, t;
      if(spl.length > 2){
        repl = spl[spl.length-1];
        t = getTitanById(name.effect1.specificTarget.replace(repl, ''));
      }
      else t = getTitanById(name.effect1.specificTarget);
      console.log((typeof t.uiName !== "undefined" ? t.uiName : t.id) + (repl == 0 ? '' : '(Lv. ' + repl + ')')+ '('+ t.startingRarity +'*): '+ Math.round((found.chance/total*100 + 0.00001) * 1000) / 1000 + '%');
    }
    else console.log( (typeof name !== "undefined" ? name.uiName : id) + '('+ name.rarity +'*'+ (typeof element !== "undefined" ? (', ' + element) : '') +'): '+ Math.round((found.chance/total*100 + 0.00001) * 1000) / 1000 + '%');
  }
  //else console.log('Relic ' + id + ' not found in ' + poolId);
}

function getRates(poolId){

  var r = res.SpoilPoolTypes;
  var x = -1;
  for(var i=0; i<r.length; i++){
    if(r[i].id == poolId){
      x = i;
      break;
    }
  }
  var keys = Object.keys(r[x]);
  console.log("Drop rates for " + poolId + ' ('+ (keys.length-1) +'):');
  for(var y=0; y<keys.length-1; y++){
    if(keys[y] != "id"){
      getDropRate(poolId, r[x][(y+1).toString()].id);
    }
  }
}

function getRatesAllPools(){
  var r = res.SpoilPoolTypes;
  for(var i=0; i<r.length; i++){
    getRates(r[i].id);
  }
  return "Finished";
}

function listPools(){
  var r = res.SpoilPoolTypes;
  for(var i=0; i<r.length; i++){
    console.log(r[i].id+'('+ (Object.keys(r[i]).length-1) +')');
  }
}
