/*
******************************************
**************** TITAN.JS ****************
******************************************
*/
'use strict';
/* GLOBALS */
var elemental = ["HP", "FIRE", "FREEZE", "LIGHTNING", "ACID", "EARTH", "VOID"];
var troop_types = ["ARCHERS", "ELITHEN", "HERO", "MILITIA", "MOSSMANE", "NONE", "PIKEMEN", "RAGNAR", "SKELETONHORDE", "UNAK", "VIKING"];
var allowed_invoke_triggers = [
    "ALLIED_UNIT_KILLED", "ENEMY_UNIT_KILLED", "ELAPSED_TIME",
    "ALLIED_SPELL_CAST", "SUMMON_UNIT", "ALLIED_SUMMON_UNIT",
    "ENEMY_SPELL_CAST", "CRITICAL_ATTACK", "INTERVAL_TIME",
    "ALLIED_TROOP_ADDED", "TROOP_HEALTH_OMEGA", "TROOP_HEALTH_INVOKED"
];
var allowed_invoke_targets = [
    "ALLIED_ARMY", "TITAN_RADIUS_ALLY", "TITAN", //TRIGGER_TROOP
    "ALLIED_TROOP_LOWEST_HEALTH_CURRENT"
];

var specialised_troops = parent.getSpecialisedTroopList();

var only_max_level_troops = parent.getMaxTroopList();

//Ranged units that attack as melee
var force_melee_units = [
  "AxeThrowerTempest",     //Stormdottir
  "UnakInfernal"           //Infernal Grenadiers
];

//Initially hidden troops -> Upgrade troops
var hidden_units = [
  "PikemenSpartanUpgrade",
  "CorruptedAresRaid",
  "CorruptedKorthanRaid",
  "CorruptedNecromancerRaid",
  "CorruptedOsirisRaid",
  "CorruptedThorRaid",
  "CorruptedZabavaRaid",
  "CorruptedZeusRaid",
  "BlessedGaiaRaid",
  "BlessedArtemisRaid",
  "BlessedKronosRaid",
  "BlessedHeraclesRaid",
  "BlessedOceanusRaid",
  "BlessedMinotaurRaid",
  "BlessedUranusRaid",
];

//Relic sets
var nexus_complete_set = ["EV_737_10", "EV_738_10", "EV_739_10", "EV_740_10"];
var  zeus_complete_set = ["EV_760_10", "EV_761_10", "EV_762_10", "EV_763_10"];

var skill_synergies = {};
var relic_synergies = {};

//hue-rotate for synergy relics
var hue = "180deg";
/* GLOBALS END */
function loadTitanBuild(string) {
  if(typeof string.target !== "undefined") {//if event called the function
    string = string.target.alt;
  }
  var d = document;
  var tmp = string.split(';');
  if(tmp.length > 2 && tmp[2] > 1){//level got saved; length = 3
    d.getElementById("LEVEL_UP_BUTTON").dataset.level = tmp[2];
    d.getElementById("LEVEL_DOWN_BUTTON").dataset.level = tmp[2];
    update(tmp[2]);
  }
  var skills = tmp[0].split(':')[1].split(',');
  if(skills.length > 0 && skills[0] != ""){
    var tmp_skill, len_1 = skills.length, len_2 = d.getElementsByClassName("skill").length;
    for(var i = 0; i < len_1; i++){
      tmp_skill = skills[i].split('-');
      for(var j = 0; j < len_2;j++){
        if(j == tmp_skill[0])
          attachBoostToSlot(tmp_skill[1], j, "Skill");
      }
    }
  }
  var relics = tmp[1].split(':')[1].split(',');
  if(relics.length > 0 && relics[0] != ""){
    var tmp_relic, len_1 = relics.length, len_2 = d.getElementsByClassName("relic").length;
    for(var i = 0; i < len_1; i++){
      tmp_relic = relics[i].split('-');
      for(var j = 0; j < len_2; j++){
        if(j == tmp_relic[0])
          attachBoostToSlot(tmp_relic[1], j, "Relic");
      }
    }
  }
}

function changeFilter(event){
  var d = document;
  if(event.target.value == "enabled") event.target.value = "disabled";
  else if(event.target.value == "disabled") event.target.value = "enabled";
  var slot = d.getElementsByClassName("crop_relic active");
  if(slot.length > 0) fillPossibleBoosts("Relic", parseInt(slot[0].firstElementChild.id.slice(-1)));
}

function enableGodMode(e){
  if(typeof enableGodMode.c === "undefined") enableGodMode.c = 0;
  enableGodMode.c++;
  if(enableGodMode.c == 7){
    enableGodMode.c = 0;
    if(parent.LocalStEnable){
      if(localStorage.getItem("GodMode") == "enabled") {localStorage.setItem("GodMode", "disabled"); parent.toast("Creative Mode disabled.");}
      else{ localStorage.setItem("GodMode", "enabled"); parent.toast("Creative Mode enabled.");}
    }
  }
}

//Function that checks for all specialised troops that are summoned
function getSpecialTroopsOfTitan(titan_id){
  var d = document;
  var p = parent;
  var titan = p.getTitanById(titan_id);
  var slot_count = 1;
  var special_troops = [];
  while(typeof titan["poolSlot"+slot_count] !== "undefined"){
    var pool_id = titan["poolSlot"+slot_count];
    var pool = p.getSkillPool(pool_id);
    var keys = Object.keys(pool);
    for(var i=0; i<keys.length; i++){
      var k = keys[i];
      if(k =="id") continue;
      else {
        var skill = p.getSkillById(pool[k]["id"]);
        special_troops = [].concat(special_troops, getSpecialTroopsOfBoost(skill));
      }
    }
    slot_count++;
  }
  return p.unique_list(special_troops);
}

function getSpecialTroopsOfAutoCast(cast_ability){
  var d = document;
  var p = parent;
  var special_troops = [];
  if(typeof cast_ability !== "undefined"){
    var cast_effects = cast_ability.abilities;
    for(var j=0; j<cast_effects.length; j++){
      var cast_effect = cast_effects[j];
      //if(allowed_invoke_triggers.includes(cast_effect.trigger.type)){
        var actions = cast_effect.actions;
        for(var k=0; k<actions.length; k++){
          var action = actions[k];
          if(action.action == "ADD_TROOP"){
            if(typeof action.parameterList !== "undefined") {
              var intersection = action.parameterList.filter(function(e) {
                return specialised_troops.indexOf(e) > -1;
              });
              special_troops = [].concat(special_troops, intersection);
            }
            else if(specialised_troops.includes(action.parameter)){
              special_troops.push(action.parameter);
            }
          } else if(action.action == "ADD_AUTOCAST"){
            var next_autocast = p.getAutocastAbilityById(action.parameter);
            special_troops = [].concat(special_troops, getSpecialTroopsOfAutoCast(next_autocast));
          }
        }
      //}
    }
  }
  return special_troops;
}

function getSpecialTroopsOfBoost(boost){
  var d = document;
  var p = parent;
  var special_troops = [];
  while(typeof boost.upgradesTo !== "undefined") boost = p.getSkillById(boost.upgradesTo);
  var i = 1;
  while(typeof boost["effect"+i] !== "undefined"){
    var ability = boost["effect"+i];
    if(ability.effect == "AUTOCAST_ABILITY"){
      var cast_ability = p.getAutocastAbilityById(ability.specificTarget);
      special_troops = [].concat(special_troops, getSpecialTroopsOfAutoCast(cast_ability));
    }
    i++;
  }
  return p.unique_list(special_troops);
}

/****************************************************************************************
 *                                                                                      *
 *                              Titan Patch data functions                              *
 *                                                                                      *
 ****************************************************************************************/

function changeOldAscension(event){
  var img = event.target;
  var my_split = img.src.split('_');
  if(my_split[0].indexOf("AC1") != -1)
    img.src = my_split[0].slice(0, -1) + "2_" + my_split[1] + '_' + my_split[2];
  else if(my_split[0].indexOf("AC2") != -1)
    img.src = my_split[0].slice(0, -1) + "3_" + my_split[1] + '_' + my_split[2];
  else if(my_split[0].indexOf("AC3") != -1)
    img.src = my_split[0].slice(0, -1) + "1_" + my_split[1] + '_' + my_split[2];
}

function applyPatch(){
  var d = document;
  var p = parent;

  var patch = p.getTitanPatch(d.getElementById("TITAN_NAME").dataset.id, d.getElementById("ASCENSION_PATCH").src.split('_R')[0].slice(-1)).split(',');
  var slots = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  var img = d.getElementById("RARITY_IMG");
  for(var i = 0; i < 3; i++){
    var selected = p.getSkillById(patch[i]);
    if(typeof selected === "undefined")
      break;
    var skill_name = slots[i].lastElementChild.firstElementChild.innerHTML;
    if(skill_name == selected.uiName && slots[i].firstElementChild.firstElementChild.alt == selected.id)
      continue;
    removeSkillsAndRelics();

    var skill_img = d.getElementById("SKILL_IMG_" + i);
    skill_img.src = "./images/" + selected.uiIcon + "_old.png";
    skill_img.className = "skill_img_old";
    skill_img.alt = selected.id;
    d.getElementById("SKILL_NAME_" + i).innerHTML = selected["uiName"];

    var select = d.getElementById("SKILL_LEVEL_SELECT_" + i);
    var tmp = selected;
    while (typeof tmp.upgradesTo !== "undefined") tmp = p.getSkillById(tmp.upgradesTo);
    var lv = selected.level;

    if(p.LocalStEnable && localStorage.getItem("manualSkillLevel") == "enabled"){
      if(!!select.firstChild) //if skills are present, remove
          while (select.firstChild)
                select.removeChild(select.firstChild);
      while (lv <= tmp.level){
        var lvl = d.createElement("option");
        lvl.value = lv;
        lvl.innerText = parent.getTranslation("LVL") + lv;
        select.appendChild(lvl);
        lv++;
      }
      //select the correct level
      if(selected.level > 1){
        var op = select.getElementsByTagName("option");
        for (var o = 0; o < op.length; o++) {
          (parseInt(op[o].value) == (selected.level))
            ? op[o].selected = true
            : op[o].selected = false;
        }
      }
    }
    else{
      var xp = p.getTitanXp()[parseInt(d.getElementById("CURRENT_LV").innerHTML)-1];
      select.innerText = lv;
      slots[i].firstElementChild.firstElementChild.alt = selected.id;
    }

    for(var j = 0; j < 1;  j++){
      if(typeof selected["effect" + (j+1)] !== "undefined")
        slots[i].lastElementChild.children[1].children[j].innerHTML = selected["effect" + (j+1)].uiName;
      else
        slots[i].lastElementChild.children[1].children[j].innerHTML = '';
    }
    applySkillsAndRelics();
  }
}

/****************************************************************************************
 *                                                                                      *
 *                             Initialise the titan.html                                *
 *                                                                                      *
 ****************************************************************************************/
function loadAlternate(event){
  console.log("Could not load the image: " + event.target.src);
  event.target.onerror = null;
  event.target.src = "./images/relic_cards/broken_pot.png";
  event.preventDefault();
}

function initTitan() {
  var parameters = decodeURI(location.search.substring(1)).split('&');
  //Load from json
  if(typeof parameters[0] === "string"){
    var name_parameter = parameters[0];
    if(name_parameter.match("|build") && parameters.length == 1){
      var build_parameter = name_parameter.split("|bui")[1];
      name_parameter = name_parameter.split("|build")[0];
    }
    else if(name_parameter.match("&build") && parameters.length == 1){
      var build_parameter = name_parameter.split("&bui")[1];
      name_parameter = name_parameter.split("&build")[0];
    }
    if(parameters.length > 1){
      var build_parameter = parameters[1];
    }
    var name = name_parameter.split('=')[1];
    if(typeof build_parameter !== "undefined")
      var build = build_parameter.split('=')[1];
    var d = document;
    var p = parent;
    var titan_specific_troops = getSpecialTroopsOfTitan(name);
    var titan = p.getTitanById(name);
    if(typeof titan === "undefined") titan = p.getTitanByName(name);
    if(typeof titan["extends"] !== "undefined")
      var default_titan = p.getTitanById(titan["extends"]);
 
    var level_container = d.getElementById("LEVEL_CONTAINER");
    //level up/down button
    var level_up_button = d.createElement("input");
    level_up_button.id = "LEVEL_UP_BUTTON";
    level_up_button.type = "image";
    level_up_button.title = "Level up!";
    level_up_button.src = "./images/levelUP2.png";
    level_up_button.dataset.level = 1;
    level_up_button.dataset.maxLevel = titan.startingMaxlevelNew;
    excludeScreenshot(level_up_button);
    level_container.appendChild(level_up_button);

    var level_down_button = d.createElement("input");
    level_down_button.id = "LEVEL_DOWN_BUTTON";
    level_down_button.type = "image";
    level_down_button.title = "Level down!";
    level_down_button.src = "./images/levelUP2.png";
    level_down_button.dataset.level = 1;
    level_down_button.dataset.maxLevel = titan.startingMaxlevelNew;
    excludeScreenshot(level_down_button);
    level_container.appendChild(level_down_button);

    level_up_button.addEventListener("click", levelUp);
    level_down_button.addEventListener("click", levelDown);


    //set the titan's name
    var titan_name = d.getElementById("TITAN_NAME");
    titan_name.innerHTML = "<span id=\"NAME_SPAN\">"+titan["uiName"] + "</span>";
    titan_name.dataset.id = titan.id;
    //save build (localStorage)
    var save_img = d.createElement("img");
    excludeScreenshot(save_img);
    save_img.id = "SAVE_BUILD";
    save_img.className = "icon_name";
    save_img.title = "Save the current build locally!";
    save_img.src = "./images/save.png";
    save_img.addEventListener("click", function (event){
      var d = document;
      var name = d.getElementById("TITAN_NAME");
      var id = name.dataset.id;
      //get name span
      name = name.firstElementChild;
      var build = createBuildString();
      if(build == "S:;R:") {
        parent.toast("Error: No skills and relics selected.");
        return;
      }
      else build = LZString.compressToEncodedURIComponent(build);
      parent.save_titan(name.innerText, id, build);
    });
    titan_name.appendChild(save_img);
    //share image
    var share_img = d.createElement("img");
    excludeScreenshot(share_img);
    share_img.id = "SHARE_BUILD";
    share_img.className = "icon_name";
    share_img.title = "Share the titan build!";
    share_img.src = "./images/share_link.png";
    share_img.addEventListener("click", copyLink);
    titan_name.appendChild(share_img);
    d.body.style.visibility = "visible";
    if(!p.mobilecheck() && !p.touchDevice){//Only on desktop preview effects
      initScreenshot("TITAN_NAME");
    }

    if(parent.LocalStEnable && localStorage.getItem("compare") == "enabled" /*&& frameElement.id != "COMPARE_IFRAME"*/){
      //open in compare tab
      var compare_img = d.createElement("img");
      excludeScreenshot(compare_img);
      compare_img.id = "COMPARE_BUILD";
      compare_img.className = "icon_name";
      compare_img.title = "Compare the titan build!";
      compare_img.src = "./images/compare.png";
      compare_img.dataset.titan = name;
      compare_img.addEventListener("click", function(e){
        var ids = ["COMPARE_IFRAME", "TITAN_IFRAME"];
        var mirror_id = ids[0] == frameElement.id ? ids[1] : ids[0];
        parent.document.getElementById(mirror_id).src = "./titan.html?name=" + e.target.dataset.titan + (createBuildString() == "S:;R:" ? "" : "|build=" + LZString.compressToEncodedURIComponent(createBuildString()));
      });
      titan_name.appendChild(compare_img);
    }

    //initRating();

    //set the titan's img
    var titan_img = d.getElementById("TITAN_IMG");
    titan_img.addEventListener("error", loadAlternate);
    titan_img.src = "./images/" + titan.uiIcon + ".png";

    //setting race,class img
    var image_container = d.getElementById("TITAN_IMG_CONTAINER");
    var icon_container = image_container.appendChild(d.createElement("div"));
    icon_container.style = "height:100%;width:100%;";
    var race_img = d.createElement("img");
    race_img.src = "./images/races/race_" + titan.unitSpecies.toLowerCase() + ".png";
    race_img.id = "TITAN_RACE_IMG";
    race_img.title = p.capital(titan.unitSpecies);
    race_img.alt = titan.unitSpecies;
    race_img.className = "small_icon";
    race_img.addEventListener("click", showRaceHelp);
    icon_container.appendChild(race_img);

    if(typeof titan.archetype === "undefined")
      titan.archetype = default_titan.archetype;
    var class_img = d.createElement("img");
    class_img.src = "./images/titan_class/class_" + titan.archetype.toLowerCase() + ".png";
    class_img.id = "TITAN_CLASS_IMG";
    class_img.title = titan.archetype;
    class_img.alt = titan.archetype;
    class_img.className = "small_icon";
    class_img.addEventListener("click", showArchetypeHelp);
    icon_container.appendChild(class_img);

    var element = d.createElement("img");
    var dmg_type = typeof titan.damageType === "undefined" ? "HP" : titan.damageType;
    element.src = "./images/elements/" + dmg_type + ".png";
    element.id = "TITAN_DAMAGE_TYPE_2";
    element.className= "small_icon";
    element.title = dmg_type + " Damage";
    element.alt = dmg_type;
    if(dmg_type == "HP") element.style = "margin-right:11px;";
    else if(dmg_type == "FREEZE") element.style = "margin-right:5px;left:177px;";
    else if(dmg_type == "EARTH") element.style = "left:170px;";
    else if(dmg_type == "FIRE") element.style = "margin-right:12px;";
    else if(dmg_type == "ACID") element.style = "margin-right:9px;left:180px;";
    else if(dmg_type == "LIGHTNING") element.style = "margin-right:12px;";
    else if(dmg_type == "VOID") element.style = "margin-right:5px;left:177px";
    icon_container.appendChild(element);
    element.addEventListener("click", enableGodMode);

    //set the titan's rarity
    var rarity_img = d.createElement("img");
    rarity_img.id = "RARITY_IMG";
    rarity_img.className = "small_icon";
    rarity_img.src = "./images/rarity/" + titan.startingRarity + "star_line.png";
    icon_container.appendChild(rarity_img);

    //set titles
    var title_container = d.createElement("div");
    excludeScreenshot(title_container);
    title_container.className = "flex_row";
    var title_icon = d.createElement("img");
    title_icon.className = "title_icon";
    var titles = parent.getTitles();
    title_container.appendChild(title_icon);

    var title_select = createCSelect("TITLE_SELECT");
    title_select.className += " title_select";
    title_select.appendOption("---", "---");
    for(var i=0; i<titles.length; i++){
      title_select.appendOption(titles[i].uiName, titles[i].id);
    }

    title_container.appendChild(title_select);
    title_select.addEventListener("change", function(event){
      var titles = parent.getTitles();
      var img = event.target.parentElement.firstElementChild;
      var oldTitle, title, found = 0;
      for(var i=0; i<titles.length; i++){
        if(titles[i].id == event.target.value()){
          title = titles[i];
          found = 1;
        }
        else if(typeof event.target.dataset.oldTitle !== "undefined" && titles[i].id == event.target.dataset.oldTitle){
          oldTitle = titles[i];
        }
      }
      if(!found){
        event.target.className += "title_select";
        event.target.dataset.oldTitle = '';
        img.src = '';
        img.dataset.effectNum = 0;
        img.dataset.title = '';
        for(var i=0; i<img.dataset.effectNum; i++){
          img.dataset["effect"+i] = '';
        }
      }
      else{
        img.src = "./images/" + title.uiIcon + ".png";
        event.target.dataset.oldTitle = title.id;
        event.target.className = event.target.className.replace("title_select", '');
        img.dataset.title = title.uiName;
        img.dataset.effectNum = title.spoilEffects.length;
        for(var i=0; i<title.spoilEffects.length; i++){
           img.dataset["effect"+i] = title.spoilEffects[i].uiName;
        }
      }
      if(typeof oldTitle !== "undefined"){
        for(var i=0; i<oldTitle.spoilEffects.length; i++)
          removeAbilityEffect("Skill", oldTitle.spoilEffects[i]);
      }
      if(typeof title !== "undefined"){
        for(var i=0; i<title.spoilEffects.length; i++)
          applyAbilityEffect("Skill", title.spoilEffects[i]);
      }
    });
    title_icon.addEventListener("click", function(event){
      if(typeof event.target.dataset.title !== "undefined" && event.target.dataset.title != ''){
        var string = '';
        for(var i=0; i<event.target.dataset.effectNum; i++)
          string += (i+1) + ") " + event.target.dataset["effect"+i] + "<br>";
        parent.alert(event.target.dataset.title, string);
      }
    });
    d.getElementById("TITAN_NAME").appendChild(title_container);
    title_select.finalise();

    //set default max Level matching ascension 1
    d.getElementById('LVL').innerHTML = p.getTranslation("LVL").toUpperCase();
    d.getElementById('LVL_VALUE').innerHTML = "<span id=\"CURRENT_LV\">1</span>/" + "<span id=\"MAX_LV\">" + titan.startingMaxlevelNew + "</span>";
    d.getElementById("XP").innerHTML = p.getTranslation("XP").toUpperCase() + ": " + p.getTitanXp()[0].titan_XP["rarity" + titan.startingRarity];
    d.getElementById("XP_TOTAL").innerHTML = "Total: -----";
    d.getElementById("XP_FUSION").innerHTML = p.getTranslation("TXT_FUSION") +": "+ p.getTitanXp()[0].fusion_XP["rarity" + titan.startingRarity];


    /************************************ START STATS TABLE ****************************************************/


    var table = d.getElementById("TITAN_STATS");
    var row, cell;

    var stat_values = ["info", "HP", "DAMAGE", "RATE_OF_FIRE", "ARMOR", "ARMOR_PIERCING", "CRITICAL", "SPEED"];

    var c = 0;
    // table only has two columns
    for(var i = 0, len = stat_values.length; i < len; i++) {
      if(stat_values[i] == "RATE_OF_FIRE" && typeof titan.secondsPerRangedAttack === "undefined"){
          c++;
          continue;
      }

      row = table.insertRow(i - c);
      row.className = "stats_row";
      for(var j = 0; j < 2; j++) {
        cell = row.insertCell(j);
        cell.className = "stats_cell";

        if(j==0){
          cell.id = "TITAN_" + stat_values[i];
          var tmp = p.getTranslation(stat_values[i]);
          if(stat_values[i] != "info" ){
            if(stat_values[i] == "RATE_OF_FIRE") tmp = p.getTranslation("RATE_OF_FIRE");
            cell.innerText = typeof tmp !== "undefined" ? tmp : p.getTranslation(stat_values[i]);
          }
          if(stat_values[i] == "info"){
            var tmp = d.createElement("img");
            tmp.src = "./images/question.png";
            tmp.className = "qmark";
            cell.appendChild(tmp);
            cell.firstElementChild.addEventListener("click", showStatHelp);

            var atk_def_btn = d.createElement("div");
            atk_def_btn.className = "autocast_button unselectable";
            atk_def_btn.id = "ATTACK_DEFEND_BUTTON";
            atk_def_btn.innerText = "Attack Mode";
            atk_def_btn.dataset.battleMode = "ATK";//ATK or DEF
            cell.appendChild(atk_def_btn);
            atk_def_btn.addEventListener("click", toggleTitanMode);
          }
          else if(stat_values[i] == "HP"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Health.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "DAMAGE"){
            var icon = d.createElement("img");
            var dmg_type = typeof titan.damageType === "undefined" ? "HP" : titan.damageType;
            icon.src = "./images/elements/" + dmg_type + ".png";
            icon.id = "DAMAGE_TYPE";
            icon.className = "icon";
            icon.title = dmg_type + " Damage";
            icon.alt = dmg_type;
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "ARMOR"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Armour.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "ARMOR_PIERCING"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/ArmourPierce.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "CRITICAL"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/CriticalRate.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "SPEED"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Speed.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }

        }
        else{
          if(stat_values[i] == "info"){
            var dropdown = createCSelect("TITAN_LEVEL_SELECT");
            for(var k=0; k < titan.startingMaxlevelNew; k++) {
              dropdown.appendOption(p.getTranslation("LVL").toUpperCase() + ' ' + (k + 1), k+1);
            }
            cell.appendChild(dropdown);
            dropdown.finalise();
            dropdown.addEventListener("change", selectLevel);
            excludeScreenshot(dropdown.lastElementChild);
          }
          else if(stat_values[i] == "HP") {
            var tmp = titan;
            while(typeof tmp["health"] === "undefined")
              tmp = p.getTitanById(tmp["extends"]);
            cell.innerText = Math.floor(tmp.health);
          }
          else if(stat_values[i] == "DAMAGE"){
            var span = d.createElement("span");
            cell.appendChild(span);
            span.id = "TITAN_DAMAGE_SPAN";
            //if titan has innate resistance
            for(var e = 0; e < elemental.length; e++){
              var innate_resistance = titan["damageFrom " + elemental[e]];
              if(typeof innate_resistance !== "undefined" )
                span.dataset["res" + p.capital(elemental[e])] = innate_resistance == 1 ? '' : Math.round((1 - innate_resistance) * 100);
            }
            if(typeof titan.rangedDamage !== "undefined"){
              var ranged_dmg_factor = 1;
              if(typeof titan.titanRangedMaxAttacks !== "undefined"){
                ranged_dmg_factor *= titan.titanRangedMaxAttacks;
              } //else ranged_dmg_factor *= 56; //Sorcerers have factor 1

              span.innerText = Math.floor(titan.rangedDamage * ranged_dmg_factor / titan.secondsPerRangedAttack);
              span.dataset.fdmg =         titan.rangedDamage * ranged_dmg_factor / titan.secondsPerRangedAttack;
            } else {
              span.innerText = Math.floor(titan.meleeDPS);
              span.dataset.fdmg =         titan.meleeDPS;
            }
          }
          else if(stat_values[i] == "RATE_OF_FIRE") cell.innerText = titan.secondsPerRangedAttack + 's';
          else if(stat_values[i] == "ARMOR"){
            var tmp = titan;
            while(typeof tmp !== "undefined" && typeof tmp["armourValue"] === "undefined")
              tmp = p.getTitanById(tmp["extends"]);
            cell.innerText = tmp.armourValue + '%';
          }
          else if(stat_values[i] == "ARMOR_PIERCING"){
            var tmp = titan;
            while(typeof tmp !== "undefined" && typeof tmp["armourPierce"] === "undefined")
              tmp = p.getTitanById(tmp["extends"]);
            cell.innerText = tmp.armourPierce + '%';

          }
          else if(stat_values[i] == "CRITICAL"){
            var tmp = titan;
            while(typeof tmp !== "undefined" && typeof tmp["criticalRate"] === "undefined")
              tmp = p.getTitanById(tmp["extends"]);
            cell.innerText = tmp.criticalRate + '%';
          }
          else if(stat_values[i] == "SPEED"){
            var tmp = titan;
            while(typeof tmp !== "undefined" && typeof tmp["moveSpeed"] === "undefined")
              tmp = p.getTitanById(tmp["extends"]);
            cell.innerText = tmp.moveSpeed;
          }
        }
      }

    }

    /********************************* ADDING RELIC/SKILL ******************************************************/
    if(p.LocalStEnable && localStorage.getItem("manualSkillLevel") == "enabled")
        var manual_skill = true;
    else 
        var manual_skill = false;
    var div_container, div, div_title_description, div_crop, img, title, description, lvl, tmp, img_button, num_type, num_effect, counter=0;
    var labels = [];
    var label_skill, version_dropdown;
    var types = ["Skill", "Relic"];
    for(var j = 0, len = types.length; j<len; j++){
      div_container = d.getElementById("TITAN_" + types[j].toUpperCase() + "S");
      div_container.className = "flex_row";
      img = d.createElement("img");
      excludeScreenshot(img);
      img.className = "qmark";
      img.src = "./images/question.png";
      num_type = titan["starting"+ types[j] +"Slots"];
      if(types[j] == "Skill"){
        img.addEventListener("click", showSkillHelp);
        div_container.appendChild(img);

        version_dropdown = createCSelect("SKILL_SELECT_VERSION");//d.createElement("select");
        version_dropdown.dataset.titanId = titan.id;
        version_dropdown.className += " skill_select";
        label_skill = d.createElement("label");
        excludeScreenshot(label_skill);
        label_skill.appendChild(version_dropdown);
        //label_skill.appendChild(d.createTextNode(' ' + p.getTranslation("SKILLS")));

        //adding the first option
        version_dropdown.appendOption("Current", "---");

        var versions = p.versions;
        for(var t = 0; t < versions.length; t++){
          if(typeof p.getOldTitanById(name, versions[t]) !== "undefined"){
            version_dropdown.appendOption(versions[t].replace(new RegExp('_', 'g'), '.'), versions[t]);
            counter++;
          }
        }
        //Add skill sets
        if(counter > 0){
         div_container.appendChild(label_skill);
         version_dropdown.finalise()
         version_dropdown.addEventListener("change", function(event){
            //event.preventDefault();
            var d = document, p = parent;
            var versions = p.versions;
            var titan = p.getTitanById(event.target.dataset.titanId);
            var skillpool = undefined;
            if(event.target.value() != "---")
              var old_titan = p.getOldTitanById(titan.id, event.target.value());
            for(var s = 0; s < versions.length; s++){
              if(event.target.value() == versions[s] || event.target.value() == "---") {
                var slots = d.getElementsByClassName("skill");//"crop_skill active");
                for(var sk = 0; sk < slots.length; sk++){
                  /*/auto equip old skills
                  if(event.target.value() != "---"){
                    skillpool = p.getOldSkillPool(old_titan["poolSlot"+(sk+1)], event.target.value());
                    if(typeof skillpool == "undefined")
                      skillpool = p.getSkillPool(old_titan["poolSlot"+(sk+1)]);
                  }
                  else{
                    skillpool = p.getSkillPool(titan["poolSlot" + (sk+1)]);
                  }
                  if(typeof skillpool !== "undefined"){
                    if (Object.keys(skillpool).length == 2)// 1 skill only, second element is poolid
                      attachBoostToSlot(skillpool["1"].id, sk, "Skill");
                    //else //do not clear skill slots after switching - no hybrids
                    //  clearBoostSlot("Skill", sk);
                  }*/
                  if(slots[sk].firstElementChild.className.match("active")){
                    //if active skill slot - fill possible boosts
                    fillPossibleBoosts("Skill", parseInt(slots[sk].firstElementChild.firstElementChild.id.slice(-1)));
                  }
                }
              }
            }
          });
        }
      }
      else{ //adding relic filters
        img.addEventListener("click", showRelicHelp);
        div = d.createElement("div");
        div.className = "flex_row";
        div.style.width = "100%";
        div.appendChild(img);
        for(var y = 0; y < 5; y++){
          var checkbox = d.createElement("input");
          var label = d.createElement("label");
          excludeScreenshot(label);
          var checkbox_img = d.createElement("img");

          checkbox.id = (y+1) + "_RELIC_FILTER";
          checkbox.type = "checkbox";
          if(y > 2) {
            checkbox.checked = "checked";
            checkbox.value = "enabled";
          }
          else{
            checkbox.checked = "";
            checkbox.value = "disabled";
          }
          checkbox.addEventListener("change", changeFilter);
          checkbox_img.src = "./images/rarity/"+ (y+1) + "star_line.png";
          checkbox_img.className = "relic_filter";
          label.appendChild(checkbox);
          label.appendChild(checkbox_img);
          div.appendChild(label);
        }
        //copying effect filters from tabs
        var filter_types = ["effect", 'target', 'specificTarget'];
        div_container.appendChild(div);
        for(var y = 0; y < filter_types.length; y++){
          var filter = createCSelect(filter_types[y].toUpperCase() + "_FILTER_RELIC");
          var options = p.document.getElementById(filter_types[y].toUpperCase() + "_FILTER_TAB_RELIC").options.children;
          for(var z = 0; z < options.length; z++){
            filter.appendOption(options[z].dataset.text, options[z].dataset.value);
          }
          div.appendChild(filter);
          div.lastElementChild.className += " filter_relic";
          filter.finalise();

          //div.appendChild(p.document.getElementById(filter_types[y].toUpperCase() + "_FILTER_TAB_RELIC").cloneNode(true));
          excludeScreenshot(div.lastElementChild);
          //div.lastElementChild.id = filter_types[y].toUpperCase() + "_FILTER_RELIC";
          //div.lastElementChild.className = "filter_relic";
          div.lastElementChild.addEventListener("change", function(event){
            var slot = d.getElementsByClassName("crop_relic active");
            if(slot.length > 0) fillPossibleBoosts("Relic", parseInt(slot[0].firstElementChild.id.slice(-1)));
          });
        }
      }

      for(var i = 0; i < num_type; i++) {
        //create divs
        div = d.createElement("div");
        div_crop = d.createElement("div");
        div_title_description = d.createElement("div");
        img = d.createElement("img");
        if(j == 0) title = d.createElement("h4");
        else title = d.createElement("h5");
        description = d.createElement('p');

        div.className = types[j].toLowerCase();
        div_title_description.className = types[j].toLowerCase() + "_info flex_column";
        div_crop.className = "crop_" + types[j].toLowerCase();
        img.className = "boost_img_locked";
        img.id = types[j].toUpperCase() + "_IMG_" + i;
        title.className = types[j].toLowerCase() + "_name";
        title.id = types[j].toUpperCase() + "_NAME_" +  i;
        description.className = types[j].toLowerCase() + "_description flex_column no_wrap";
        description.id = types[j].toUpperCase() + "_DESCRIPTION_" + i;
        var tmp = '';
        if(types[j] == "Skill")  tmp = p.getTranslation("TXT_SKILLS");
        else if(types[j] == "Relic") tmp = p.getTranslation("TXT_ALTAR_TITAN_OR_RELIC");
        title.innerHTML = tmp + ' ' + (i+1);
        if(j == 0) num_effect = 1;//Skills
        else num_effect = 3;//Relics
        /*********** Add all the relic/skill abilities **********/
        for(var k = 0; k < num_effect; k++){
          var span = d.createElement("span");
          span.className = types[j].toLowerCase() + "_effect";
          span.id = types[j].toUpperCase() + "_EFFECT_" + k;
          description.appendChild(span);
          span.innerHTML = p.getTranslation("LOCKED");
        }
        /********************************************************/
        span = d.createElement("span");
        if(((manual_skill || i == 5) && types[j] == "Skill") || types[j] == "Relic"){
          var tmp = createCSelect(types[j].toUpperCase() + "_LEVEL_SELECT_" + i, false, "12px");
          excludeScreenshot(tmp.lastElementChild);
          tmp.addEventListener("change", selectLevelBoost);
          tmp.finalise("55px");
        }
        else{
          span.innerText = p.getTranslation('LVL') + ' ';
          span.style = "font-size:13px;";
          tmp = d.createElement("span");
          tmp.id = types[j].toUpperCase() + "_LEVEL_SELECT_" + i;
        }
        span.appendChild(tmp);


        div_crop.appendChild(img);
        div.appendChild(div_crop);
        div_title_description.appendChild(title);
        div_title_description.appendChild(description);
        div_title_description.appendChild(span);
        div.appendChild(div_title_description);

        img.src = "./images/skill_icons/Locked.png";
        img.addEventListener("click", fillPossibleBoosts_event);
        var unlocked_skill_relic = types[j] == "Skill" ? titan["startingFull"+ types[j] +"Slot"] : titan["startingUnlocked"+ types[j] +"Slots"];
        if(i > unlocked_skill_relic - 1 && !manual_skill && i != 5)//last skill is unlocked by fusion(prestige)
          div.className += " preview";
        div_container.appendChild(div);
      }
      var div_possible = d.createElement("div");
      excludeScreenshot(div_possible);
      div_possible.id = "POSSIBLE_" + types[j].toUpperCase() + "S";
      div_possible.className = "flex_row";
      div_container.appendChild(div_possible);

      if(types[j] == "Skill"){
        if(counter > 0)
          label_skill.style = "margin-right:" + (div_container.offsetWidth-label_skill.offsetWidth-20) + "px;";
        else
          d.getElementById("TITAN_SKILLS").firstElementChild.style = "margin-right:calc(100% - 20px)";
      }
    }

    //titan patch(1.7 titans) - this creates the three diamonds image to toggle between the earlier ascension levels
    if(typeof p.getTitanPatch(titan.id, 1) !== "undefined"){
      div_container = d.getElementById("TITAN_SKILLS");
      div = d.createElement("div");
      div.className = "flex_row";
      div.id = "TITAN_ASCENSION_PATCH";
      img = d.createElement("img");
      img.className = "qmark";
      img.src = "./images/question.png";
      img.addEventListener("click", function(){
        p.alert("Titan Patch", "If the titan was transferred from Dawn of Titans 1.7.x, \
                the titan will have unique skill(s), depending on the ascension\
                level he had. To equip those unique skills, just select the 1.7.x \
                ascension level and press on the confirm button.");
      });
      div.appendChild(img);
      img = d.createElement("img");
      img.id = "ASCENSION_PATCH";
      img.src = "./images/rarity/AC1_R" + titan.startingRarity + "_patch.png";
      img.addEventListener("click", changeOldAscension);
      div.appendChild(img);
      img = d.createElement("img");
      img.className = "apply_ascension_patch";
      img.src = "./images/Confirm.png";
      img.addEventListener("click", applyPatch);
      div.appendChild(img);
      div_container.parentNode.insertBefore(div, div_container.nextSibling);//insert after TITAN_SKILLS div
      //div_container.appendChild(div);
    }
/******************************************************** TROOP TABLES **********************************************************/
    var lists = p.document.getElementById("TROOP_LIST").children;
    var troops = [];
    var all_troops = p.getAllTroopList();
    for(var i=1; i<all_troops.length; i++){
      var t = all_troops[i];
      if(t.search("Summon") > -1  || //skip Omega troops
         //skip corrupted troops, CorruptedThorRaid is allowed for Nexus, BlessedArtemisRaid is allowed for Zeus
         t.search("Raid") > -1 && (t.search("Corrupted") == -1 && t.search("Blessed") == -1)
        ){continue;}
      else{
        troops.push(t);
      }
    }
    //troops stats
    var troop = p.getTroopById(troops[0]);
    var default_troop = p.getTroopById("DefaultFootSoldier");//base class for all troops
    var table = d.getElementById('TROOP_STATS');
    var row, cell;

    var stat_values = ["info", "HP", "DAMAGE", "ARMOR", "ARMOR_PIERCING", "CRITICAL", "SPEED", "UNIT_COUNT"];
    // table only has two columns
    for(var j = 0, len = stat_values.length; j < len; j++){
      row = table.insertRow(j);
      for(var k = 0; k < 2; k++) {
        cell = row.insertCell(k);
        cell.className = "stats_cell";
        if(k == 0){
          cell.id = "TROOP_" + stat_values[j];
          var tmp = p.getTranslation(stat_values[j]);
          if(stat_values[j] != "info")
            cell.innerText = typeof tmp !== "undefined" ? tmp : p.getTranslation(stat_values[j]);
          if(stat_values[j] == "info"){
            cell.innerText = '';
            var img = d.createElement("img");
            img.className = "qmark";
            img.src = "./images/question.png";
            cell.appendChild(img);
            cell.firstElementChild.addEventListener("click", showTroopHelp);

            cell.className += " flex_row";
            cell.style = "border:none;";
            var troop_select = createCSelect("TROOP_SELECT");
            for(var m = 0, len_t = troops.length; m < len_t; m++) {
              troop_select.appendOption(p.getTranslation("UINAME_" + (troops[m] == "AxeThrower" ? "Viking" : troops[m])).replace("Raise Dead Skeleton","Skeleton"), troops[m]);
            }
            for(var m=0; m<specialised_troops.length; m++){
              var current_troop = specialised_troops[m];
              if(current_troop == "Skeleton") continue;
              if(!titan_specific_troops.includes(current_troop) || hidden_units.includes(current_troop)){
                troop_select.hideOption(current_troop);
              }
            }
            cell.appendChild(troop_select);
            troop_select.finalise();
            excludeScreenshot(troop_select.lastElementChild);
            troop_select.addEventListener("change", changeTroop);

            var omega = d.createElement("label");
            var omega_box = d.createElement("input");
            omega_box.type = "checkbox";
            omega_box.className = "summon_checkbox";
            omega_box.value = "disabled";
            omega.appendChild(omega_box);
            var omega_img = d.createElement("img");
            omega_img.src = "./images/troops/omega.png";
            omega_img.className = "summon_icon";
            omega.appendChild(omega_img);
            omega.id = "TROOP_OMEGA";
            if(parent.isUnitOverride(troops[0]))//hide militia
              omega.className = '';
            else
              omega.className = "content_hide";
            cell.appendChild(omega);
            omega.firstElementChild.addEventListener("change", toggleSummonTroop);

            var corrupted = d.createElement("label");
            var corrupted_box = d.createElement("input");
            corrupted_box.type = "checkbox";
            corrupted_box.className = "summon_checkbox";
            corrupted_box.value = "disabled";
            corrupted.appendChild(corrupted_box);
            var corrupted_img = d.createElement("img");
            corrupted_img.src = "./images/troops/corrupted.png";
            corrupted_img.className = "summon_icon";
            corrupted.appendChild(corrupted_img);
            corrupted.id = "TROOP_CORRUPTED";
            if(parent.isUnitOverride(troops[0]))//hide militia
              corrupted.className = '';
            else
              corrupted.className = "content_hide";
            cell.appendChild(corrupted);
            corrupted.firstElementChild.addEventListener("change", toggleSummonTroop);
          }
          else if(stat_values[j] == "HP"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Health.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "DAMAGE"){
            var element = d.createElement("img");
            var dmg_type = (typeof troop.damageType === "undefined")? "HP" : troop.damageType;
            element.src = "./images/elements/" + dmg_type + ".png";
            element.alt = dmg_type;
            element.id = "TROOP_DAMAGE_TYPE";
            element.className = "icon";
            element.title = (typeof troop.damageType === "undefined" ? "HP" : troop.damageType) + " Damage";
            cell.appendChild(element);
            //if troop has innate resistance
            for(var e = 0; e < elemental.length; e++){
              var innate_resistance = troop["damageFrom " + elemental[e]];
              if(typeof innate_resistance !== "undefined")
                span.dataset["res" + p.capital(elemental[e])] = innate_resistance == 1 ? '' : Math.round((1 - innate_resistance) * 100);
            }
          }
          else if(stat_values[j] == "ARMOR"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Armour.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "ARMOR_PIERCING"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/ArmourPierce.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "CRITICAL"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/CriticalRate.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "SPEED"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Speed.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
        }
        else{
          if(stat_values[j] == "info"){
            var dropdown = createCSelect("TROOP_LEVEL_SELECT");
            for(var m=0; m < 60; m++) {
              dropdown.appendOption(p.getTranslation("LVL").toUpperCase() + ' ' + (m + 1), m+1);
            }
            dropdown.hideOptions(25, 60);
            cell.appendChild(dropdown);
            dropdown.finalise();
            excludeScreenshot(dropdown.lastElementChild);
            dropdown.addEventListener("change", changeTroopLevel);
            dropdown.dataset.troopId = troop.id;
          }
          else if(stat_values[j] == "HP"){
            cell.innerText = troop.displayHealth;
            if(localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled")
              cell.innerText += " (" + troop.health + ")";
          }
          else if(stat_values[j] == "DAMAGE"){
            var dmg_span = d.createElement("span");
            dmg_span.id = "TROOP_DAMAGE_SPAN";
            dmg_span.dataset.fdmg = troop.displayDamage;
            dmg_span.innerText = Math.floor(troop.displayDamage);
            cell.appendChild(dmg_span);
          }
          else if(stat_values[j] == "ARMOR"){
            var tmp = troop;
            while(typeof tmp["armourValue"] === "undefined")
                tmp = p.getTroopById(tmp["extends"]);
            cell.innerText = tmp.armourValue + "%";
          }
          else if(stat_values[j] == "ARMOR_PIERCING"){
            var tmp = troop;
            while(typeof tmp["armourPierce"] === "undefined")
                tmp = p.getTroopById(tmp["extends"]);
            cell.innerText = tmp.armourPierce + "%";
          }
          else if(stat_values[j] == "CRITICAL"){
            var tmp = troop;
            while(typeof tmp["criticalRate"] === "undefined")
                tmp = p.getTroopById(tmp["extends"]);
            cell.innerText = tmp.criticalRate + "%";
          }
          else if(stat_values[j] == "SPEED"){
            var tmp = troop;
            while(typeof tmp["moveSpeed"] === "undefined")
                tmp = p.getTroopById(tmp["extends"]);
            cell.innerText = tmp.moveSpeed;
          }
          else if(stat_values[j] == "UNIT_COUNT"){
            var tmp = troop;
            while(typeof tmp["headCount"] === "undefined")
                tmp = p.getTroopById(tmp["extends"]);
            cell.innerText = tmp.headCount;
          }
        }
      }
    }

/******************************************************** SPELL TABLES **********************************************************/
    var lists = p.document.getElementById("SPELL_LIST").children;
    var spells = [];
    for(var i = 0; i < lists.length; i++){
      if (lists[i].lastElementChild == null)
        continue
      var cat = lists[i].lastElementChild.children;
      for(var j = 0; j < cat.length; j++)
          spells.push(cat[j].firstElementChild.href.split('=')[1]);
    }
    spells.sort();
    //spell stats
    var spell = p.getSpell("Fireball");

    var table = d.getElementById('SPELL_STATS');
    var row, cell;

    var stat_values = ["info", "DAMAGE", "RADIUS", "DURATION", "HASTE"];
    // table only has two columns
    for(var j = 0, len = stat_values.length; j < len; j++){
      row = table.insertRow(j);
      for(var k = 0; k < 2; k++) {
        cell = row.insertCell(k);
        cell.className = "stats_cell";
        if(k == 0){
          cell.id = "SPELL_" + stat_values[j];
          var tmp = p.getTranslation(stat_values[j]);
          if(stat_values[j] != "info")
            cell.innerText = typeof tmp !== "undefined" ? tmp : p.getTranslation(stat_values[j]);
          if(stat_values[j] == "info"){
            cell.innerText = '';
            var img = d.createElement("img");
            img.className = "qmark";
            img.src = "./images/question.png";
            cell.appendChild(img);
            cell.firstElementChild.addEventListener("click", showSpellHelp);


            cell.className += " flex_row";
            cell.style = "border:none;";
            var spell_select = createCSelect("SPELL_SELECT");
            for(var m = 0; m < spells.length; m++) {
              spell_select.appendOption(p.replaceSpells(spells[m]), spells[m]);
            }
            cell.appendChild(spell_select);
            spell_select.setOption("Fireball");
            spell_select.finalise();
            excludeScreenshot(spell_select.lastElementChild);
            spell_select.addEventListener("change", changeSpell);
          }
          else if(stat_values[j] == "DAMAGE"){
            var element = d.createElement("img");
            var dmg_type = (typeof spell.damageType === "undefined")? "HP" : spell.damageType;
            element.src = "./images/elements/" + dmg_type + ".png";
            element.alt = dmg_type;
            element.id = "SPELL_DAMAGE_TYPE";
            element.className = "icon";
            element.title = (typeof spell.damageType === "undefined" ? "HP" : spell.damageType) + " Damage";
            cell.appendChild(element);
          }
          else if(stat_values[j] == "RADIUS"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Radius.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "DURATION"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Duration.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[j] == "HASTE"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Speed.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
        }
        else{
          if(stat_values[j] == "info"){
            var dropdown = createCSelect("SPELL_LEVEL_SELECT");
            for(var m=0; m < 25; m++) {
              dropdown.appendOption(p.getTranslation("LVL").toUpperCase() + ' ' + (m + 1), m+1);
            }
            cell.appendChild(dropdown);
            dropdown.finalise();
            excludeScreenshot(dropdown.lastElementChild);
            dropdown.addEventListener("change", changeSpellLevel);
            dropdown.dataset.spellId = spell.id;
          }
          else if(stat_values[j] == "DAMAGE"){
            var dmg_span = d.createElement("span");
            dmg_span.id = "SPELL_DAMAGE_SPAN";
            dmg_span.innerText = Math.round(spell.missileCount * spell.damageSpec.damage);//Fireball
            dmg_span.dataset.fdmg = spell.missileCount * spell.damageSpec.damage;
            cell.appendChild(dmg_span);
          }
          else if(stat_values[j] == "RADIUS"){
            cell.innerText = spell.radius;
          }
          else if(stat_values[j] == "DURATION"){
            cell.innerText = typeof spell.duration === "undefined" ? 0 : spell.duration;
          }
          else if(stat_values[j] == "HASTE"){
            cell.innerText = (typeof spell.haste === "undefined" ? 0 : spell.haste-1) * 100 + "%";
          }
        }
      }
    }

    //correction of different widths
    if(p.capital(titan.archetype) == 'Guardian') class_img.style.marginRight = 10 + "px";
    if(p.capital(titan.archetype) == 'Berserker') class_img.style.marginRight = -4 + "px";
    if(p.capital(titan.archetype) == 'Champion') class_img.style.marginRight = 11 + "px";
    if(p.capital(titan.archetype) == 'Paladin') class_img.style.marginRight = 17 + "px";
    if(p.capital(titan.archetype) == 'Infiltrator') class_img.style.marginRight = 3 + "px";
    if(p.capital(titan.archetype) == 'Ranger') class_img.style.marginRight = 9.5 + "px";

    //add comments
    //initComments();
    //getRating
    //getRating(titan.id);
    //excludeScreenshot("SUBMIT_COMMENT");
    //excludeScreenshot("TITAN_COMMENTS");
    //var skillpools = [];
    //auto equip skills that are preset 100%
    for(var sk = 0; sk < 5; sk++){
      var skillpool = p.getSkillPool(titan["poolSlot" + (sk+1)]);
      if(typeof skillpool !== "undefined"){
        if (Object.keys(skillpool).length == 2)// 1 skill only, second element is poolid
          attachBoostToSlot(skillpool["1"].id, sk, "Skill");
        //skillpools[sk] = skillpool.id;
      }
    }

    if(typeof build !== "undefined"){
      build = LZString.decompressFromEncodedURIComponent(build);
      loadTitanBuild(build);
    }
    addTitanBuild2History();
  }
}

/****************************************************************************************
 *                                                                                      *
 *        Skill/Relic specific functions                                                *
 *                                                                                      *
 ****************************************************************************************/

function fillPossibleBoosts_event(event){
  var type = parent.capital(event.target.id.split('_')[0]);
  var number = parseInt(event.target.id.slice(-1));
  fillPossibleBoosts(type, number);
}

function fillPossibleBoosts(type, number){
  var d = document;
  var p = parent;
  var all_skills = false;
  var relic_stacking = false;

  if(p.LocalStEnable){
    if(localStorage.getItem("GodMode") == "enabled") all_skills = true;
    if(localStorage.getItem("relicStacking") == "enabled") relic_stacking = true;
  }

  //var type = parent.capital(event.target.id.split('_')[0]);
  var container = d.getElementById("POSSIBLE_" + type.toUpperCase() + "S"); //container for possible Skills
  if(!!container.firstChild) //if skills are present, remove
    while (container.firstChild)
          container.removeChild(container.firstChild);
  var slots = d.getElementById("TITAN_" + type.toUpperCase() + "S").getElementsByClassName(type.toLowerCase());

  for(var i = 0; i < slots.length; i++){ //change active skill slot
    if(i == number){
      if(!slots[i].firstElementChild.className.match(/active/)){
        slots[i].firstElementChild.className += " active";
      }
    }
    else
      slots[i].firstElementChild.className = slots[i].firstElementChild.className.replace(" active", "");
  }
  var activeSlot = d.getElementById("TITAN_" + type.toUpperCase() + "S").getElementsByClassName("active")[0].parentElement;

  var div_crop, image, boost;
  var titan = p.getTitanById(d.getElementById("TITAN_NAME").dataset.id);
  if(type == "Skill"){//obtain skill array
    var versions = p.versions;
    var skillpool;
    var old_skill = false;
    var old_skill_select = d.getElementById("SKILL_SELECT_VERSION");
    if(old_skill_select != null && old_skill_select.value() != "---"){
      for(var t = 0; t < versions.length; t++){
        if(old_skill_select.value() == versions[t]){
          //old_skill = true; //enables old skill images for older skills
          titan = p.getOldTitanById(titan.id, versions[t]);
          skillpool = p.getOldSkillPool(titan["poolSlot" + (number + 1)], versions[t]);
          break;
        }
      }
    }
    if(typeof skillpool === "undefined")
        skillpool = p.getSkillPool(titan["poolSlot" + (number + 1)]); //skillpool number starts with 1
    if(all_skills) {
      //makes all skills available in all slots
      var r = parent.res.titanSkillPools;
      var a = [];
      var b = {};
      for(var i = 0; i < r.length; i++){
        b = Object.assign({}, r[i]);
        delete b.id;
        a = a.concat(Object.values(b));
      }
      a = a.sort(function(a, b){ return a.id.localeCompare(b.id);  });
      var new_array = [];
      for(var i = 0; i < a.length; i++){
        var skill = a[i];
        var c = 0;
        for(var j = i + 1; j < a.length; j++)
          if(skill.id == a[j].id)
            c++;
        if(c == 0) new_array.push(a[i]);
      }
      var rv = {};
      for (var i = 0; i < new_array.length; ++i)
        rv[i] = new_array[i];
      skillpool = rv;
    }
    var keys = Object.keys(skillpool);
    if(!all_skills) var len = keys.length - 1;//id does not count
    else var len = keys.length;
    //only one skill -- unchangeable/auto equip; unless other skill was equipped
    if(len == 1 && slots[number].firstElementChild.firstElementChild.alt == skillpool['1'].id)
      return;
  }
  else{
    var relics_by_rarity = p.document.getElementById("RELIC_LIST").children;
    var rarity, id;
    var max_relic;
    var rarity_img;
    var array = [];
    for(var y = 0; y < relics_by_rarity.length; y++)
      array.push(Array.prototype.slice.call(relics_by_rarity[y].lastElementChild.children) );
    var relics = Array.prototype.concat.apply([], array);
    var len = relics.length;
    //fetch filter values
    var effect = d.getElementById('EFFECT_FILTER_RELIC').value();
    var target = d.getElementById('TARGET_FILTER_RELIC').value();
    var specific = d.getElementById('SPECIFICTARGET_FILTER_RELIC').value();
  }

  //add skills/relics
  for(var i = 0; i < len; i++){//last element doesnt have id - it is the pool's id;
    if(type == "Relic"){
      boost = p.getRelicById(relics[i].firstElementChild.href.split('=')[1]);
      var max_boost = p.getMaxRelicById(boost.id);
      if(typeof boost === "undefined") continue;
      else if(boost.scope != "HERO" || boost.groupId == "EVENT BOOST") continue;
      if(p.LocalStEnable && localStorage.getItem("collection") == "enabled" && localStorage.getItem(boost.id) != "owned" && localStorage.getItem("collectionSize") != null) continue;
      if(d.getElementById(boost.rarity + "_RELIC_FILTER").value == "disabled") continue;
      var found = false;
      if(typeof boost.titanArchetypeScope !== "undefined" && titan.archetype.toUpperCase() != boost.titanArchetypeScope.toUpperCase() && !all_skills)
        continue;

      //current damage type of titan
      var dmg_type = d.getElementById("DAMAGE_TYPE");
      dmg_type = dmg_type.alt.split(' ');
      dmg_type = dmg_type[dmg_type.length -1];
      var x = 1;
      while(typeof max_boost["effect"+x] !== "undefined"){
        var ability = max_boost["effect"+x];
        if(ability.effect == "DAMAGE_TYPE_BOOST" && ability.target == "ALL_HEROES"
        && ability.value.split(':')[0] != dmg_type && !all_skills){
          found = false;
          break;
        }
        if(boost.id.match(specific)) { //Event relic filter; id contains EV
          found = true;
          break;
        }
        else if(effect == target && effect == specific){//all are ---
          found = true;
          break;
        }
        else if(ability.effect == effect
        && ability.target == target
        && ability.specificTarget == specific){
          found = true;
          break;
        }
        else if(ability.effect == effect
        && target == '---'
        && specific == '---'){
          found = true;
          break;
        }
        else if(effect == '---'
        && ability.target == target
        && specific == '---'){
          found = true;
          break;
        }
        else if(effect == '---'
        && target == '---'
        && ability.specificTarget == specific){
          found = true;
          break;
        }
        else if(ability.effect == effect
        && ability.target == target
        && specific == '---'){
          found = true;
          break;
        }
        else if(ability.effect == effect
        && target == '---'
        && ability.specificTarget == specific){
          found = true;
          break;
        }
        else if(effect == '---'
        && ability.target == target
        && ability.specificTarget == specific){
          found = true;
          break;
        }
        //else found = 0;
        x++;
      }
      if(!found) continue;//if we dont find the relic that has the selected effect/target/specific target, continue
      found = false;
      if(!relic_stacking){//skip active relic slot
        for(var k = 0; k < slots.length; k++){
          var equipped_boost = p.getRelicById(slots[k].firstElementChild.firstElementChild.alt);
          if(typeof equipped_boost === "undefined") continue;
          if(!slots[k].firstElementChild.className.match('active') &&
            equipped_boost.rarity == boost.rarity && boost.groupId == equipped_boost.groupId){
            //if a 5* is equipped (groupId 'R5 RELIC') on another slot or if a relic of the same name and rarity is equipped on another slot
            found = true;
            break;
          }
        }

      }
      if(found) continue;//if we find a relic with the same name, rarity and not in the active slot, continue
    }
    else{
      boost = p.getSkillById(skillpool[keys[i]].id);
      var max_boost = boost;
      if(!all_skills){
        found = 0;
        for(var k = 0; k < slots.length; k++){
          if(!slots[k].firstElementChild.className.match('active') && !slots[k].lastElementChild.firstElementChild.innerText.match(p.getTranslation("TXT_SKILLS")) &&
                   p.getSkillById(slots[k].firstElementChild.firstElementChild.alt).effect1.effect == boost.effect1.effect &&
                   slots[k].firstElementChild.firstElementChild.alt.split("_")[0] == boost.id){
            found = 1;
            break;
          }
        }

        if(found) continue;
      }

      if(typeof boost === "undefined") continue;
    }

    //create divs
    var div_crop = d.createElement("div");
    var image = d.createElement("img");

    div_crop.className = "crop_possible_" + type.toLowerCase();
    image.className = "possible_" + type.toLowerCase() + "_img";
    if(old_skill){
      image.className += "_old";
      image.src = "./images/" + boost.uiIcon + "_old.png";
    }
    else image.src = "./images/" + boost.uiIcon + ".png";
    image.alt = boost.id;
    image.title = boost["uiName"];
    //load broken pot for images that are not available
    image.addEventListener("error", loadAlternate);
    image.addEventListener("click", attachBoost);

    div_crop.appendChild(image);

    if(type == "Relic"){//add rarity stars for relics
      var rarity_img = d.createElement("img");
      rarity_img.className = "possible_rarity_img";
      rarity_img.src = "./images/rarity/" + boost.rarity + "star_line.png";
      if(typeof boost.spoilNotes !== "undefined"){
        rarity_img.style.filter = "hue-rotate("+hue+")";
        rarity_img.style.webkitFilter = "hue-rotate("+hue+")";
      }
      div_crop.appendChild(rarity_img);
    }
    container.appendChild(div_crop);
    var elements = [];
    var stats = [];
    var enable_stat_img = localStorage.getItem("statImages");
    if(enable_stat_img == null || enable_stat_img == "enabled"){
      for(var j = 0; j < 4; j++){
        if(typeof max_boost["effect"+(j+1)] !== "undefined"){
          var t = max_boost["effect"+(j+1)].target.replace("ARMY","Troop").replace("ALL_HEROES","Titan").replace("ALL_UNITS","Titan & Troop");
          if(typeof max_boost["effect"+(j+1)].specificTarget !== "undefined") t = t.replace("SPECIFIC_UNIT", p.replaceTroops(max_boost["effect"+(j+1)].specificTarget)).replace("SPECIFIC_ARCHETYPE", p.capital(max_boost["effect"+(j+1)].specificTarget));
          if(max_boost["effect"+(j+1)].effect == "HEALTH"){
            if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              stat_img.id = "HEALTH_IMG_" +i +j;
              stat_img.title = t + " Health";
              stat_img.src = "./images/stat_icons/Health.png";
              div_crop.appendChild(stat_img);
            }
            else{
              var stat_img = d.getElementById("HEALTH_IMG_" +i + stats.indexOf("HEALTH"));
              stat_img.title = t + ", " + stat_img.title;
            }
          }
          else if(max_boost["effect"+(j+1)].effect == "ARMOUR"){
            if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              stat_img.id = "ARMOUR_IMG_" +i +j;
              stat_img.title = t + " Armour";
              stat_img.src = "./images/stat_icons/Armour.png";
              div_crop.appendChild(stat_img);
            }
            else{
              var stat_img = d.getElementById("ARMOUR_IMG_" +i + stats.indexOf("ARMOUR"));
              stat_img.title = t + ", " + stat_img.title;
            }
          }
          else if(max_boost["effect"+(j+1)].effect == "ARMOUR_PIERCE"){
            if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              stat_img.id = "ARMOUR_PIERCE_IMG_" +i +j;
              stat_img.title = t + " Armour Piercing";
              stat_img.src = "./images/stat_icons/ArmourPierce.png";
              div_crop.appendChild(stat_img);
            }
            else{
              var stat_img = d.getElementById("ARMOUR_PIERCE_IMG_" +i + stats.indexOf("ARMOUR_PIERCE"));
              stat_img.title = t + ", " + stat_img.title;
            }
          }
          else if(max_boost["effect"+(j+1)].effect == "CRITICAL_RATE_BOOST"){
            if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              stat_img.id = "CRITICAL_RATE_IMG_" +i +j;
              stat_img.title = t + " Critical";
              stat_img.src = "./images/stat_icons/CriticalRate.png";
              div_crop.appendChild(stat_img);
            }
            else{
              var stat_img = d.getElementById("CRITICAL_RATE_IMG_" +i + stats.indexOf("CRITICAL_RATE_BOOST"));
              stat_img.title = t + ", " + stat_img.title;
            }
          }
          else if(max_boost["effect"+(j+1)].effect == "DAMAGE_TYPE_BOOST"){
            var element = max_boost["effect"+(j+1)].value.split(':')[0];
            if(element != "ALL_ELEMENTAL_TYPES"){
              if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
                var stat_img = d.createElement("img");
                stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
                //stat_img.className += " stat_offensive";
                stat_img.id = "DAMAGE_TYPE_IMG_" +i +j;
                stat_img.title =  t + " " + p.replaceElements(max_boost["effect"+(j+1)].value.split(':')[0]) + " Damage";
                stat_img.src = "./images/elements/"+ max_boost["effect"+(j+1)].value.split(':')[0] +".png";
                //stat_img.src = "./images/stat_icons/rating.png";
                div_crop.appendChild(stat_img);
              }
              else {
                var stat_img = d.getElementById("DAMAGE_TYPE_IMG_" +i + stats.indexOf("DAMAGE_TYPE_BOOST"));
                stat_img.title = t + ", " + stat_img.title;
              }
            }
            else continue;
          }
          else if(max_boost["effect"+(j+1)].effect == "ATTACK"){
            if(stats.indexOf(max_boost["effect"+(j+1)].effect) == -1){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              //stat_img.className += " stat_offensive";
              stat_img.id = "DAMAGE_IMG_" +i +j;
              stat_img.title =  t + " Damage";
              stat_img.src = "./images/stat_icons/rating.png";
              div_crop.appendChild(stat_img);
            }
            else{
              var stat_img = d.getElementById("DAMAGE_IMG_" +i + stats.indexOf("ATTACK"));
              stat_img.title = t + ", " + stat_img.title;
            }
          }
          else if(max_boost["effect"+(j+1)].effect == "DAMAGE_TYPE_RESIST"){
            var element = max_boost["effect"+(j+1)].value.split(':')[0];
            if(elements.indexOf(element) == -1 && element != "ALL_ELEMENTAL_TYPES"){
              var stat_img = d.createElement("img");
              stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase();// + " stat_img_effect";
              //stat_img.className += " stat_defensive";
              stat_img.id = "RESIST_IMG_" +i +j;
              stat_img.title =  t + " " + p.replaceElements(max_boost["effect"+(j+1)].value.split(':')[0]) + " Resist";
              stat_img.src = "./images/elements/" + element + ".png";
              div_crop.appendChild(stat_img);
            }
            else if(element != "ALL_ELEMENTAL_TYPES"){
              var stat_img = d.getElementById("RESIST_IMG_" +i + stats.indexOf("DAMAGE_TYPE_RESIST"));
              stat_img.title = t + ", " + stat_img.title;
            }
            elements.push(element);
          }
          stats.push(max_boost["effect"+(j+1)].effect);
        }
      }
    }
/*
    div_crop.appendChild(d.createElement('br'));
    var troops = [];
    for(var j = 0; j < 4; j++){
      if(typeof max_boost["effect"+(j+1)] !== "undefined" && type == "Relic"){
        //var t = max_boost["effect"+(j+1)].target.replace("ARMY","Troop").replace("ALL_HEROES","Titan").replace("ALL_UNITS","Titan & Troop");
        //if(typeof max_boost["effect"+(j+1)].specificTarget !== "undefined") t = t.replace("SPECIFIC_UNIT", p.replaceTroops(max_boost["effect"+(j+1)].specificTarget)).replace("SPECIFIC_ARCHETYPE", p.capital(max_boost["effect"+(j+1)].specificTarget));

        if(max_boost["effect"+(j+1)].target == "SPECIFIC_UNIT" && troops.indexOf(max_boost["effect"+(j+1)].specificTarget) == -1){
          var stat_img = d.createElement("img");
          stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase() + " stat_img_target";//_" + j;
          stat_img.id = "TROOP_IMG_" + j;
          stat_img.src = "./images/troops/"+ max_boost["effect"+(j+1)].specificTarget +"_Decal.png";
          div_crop.appendChild(stat_img);
          troops.push(max_boost["effect"+(j+1)].specificTarget);
        }
 /*       else if(max_boost["effect"+(j+1)].target == "ALL_HEROES" && troops.indexOf(max_boost["effect"+(j+1)].target) == -1){
          var stat_img = d.createElement("img");
          stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase() + " stat_img_target" + j;
          stat_img.id = "TITAN_IMG_" + j;
          stat_img.src = "./images/tab_icons/titans.png";
          div_crop.appendChild(stat_img);
          troops.push(max_boost["effect"+(j+1)].target);
        }
        else if(max_boost["effect"+(j+1)].target == "ARMY" && !troops.toString().match(/ARMY|Archer|Militia|Pikemen|Elithen|Unak|Ragnar|AxeThrower|Mossmane|ArcherSummon|MilitiaSummon|ElithenSummon|UnakSummon|RagnarSummon|AxeThrowerSummon|MossmaneSummon/)){
          var stat_img = d.createElement("img");
          stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase() + " stat_img_target" + j;
          stat_img.id = "TROOPS_IMG_" + j;
          stat_img.src = "./images/tab_icons/troops.png";
          div_crop.appendChild(stat_img);
          troops.push(max_boost["effect"+(j+1)].target);
        }
        else if(max_boost["effect"+(j+1)].target == "ALL_UNITS" && !troops.toString().match(/ALL_UNITS|ARMY|ALL_HEROES/)){
          var stat_img = d.createElement("img");
          stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase()  + " stat_img_target" + j;
          stat_img.id = "TITAN_IMG_" + j;
          stat_img.src = "./images/tab_icons/titans.png";
          div_crop.appendChild(stat_img);
          stat_img = d.createElement("img");
          stat_img.className = "possible_stat_img stat_img_" + type.toLowerCase()  + " stat_img_target" + j;
          stat_img.id = "TROOPS_IMG_" + j;
          stat_img.src = "./images/tab_icons/troops.png";
          div_crop.appendChild(stat_img);
          troops.push("ARMY");
          troops.push("ALL_HEROES");
          troops.push(max_boost["effect"+(j+1)].target);
        }
*/
//      }
//    }
/*
    if(!p.mobilecheck() && !p.touchDevice){//Only on desktop preview effects
      p.replaceStr(max_boost);
      var msg = "<ul>";// = "<img src=\"./images/"+boost.uiIcon+".png\" class=\"content_hide\"> <ul>";
      for(var j=0; j<3; j++){
        if(typeof max_boost["effect"+(j+1)] !== "undefined" && typeof activeSlot.lastElementChild.children[1].children[j] !== "undefined")
          msg += "<li>"+max_boost["effect"+(j+1)].uiName+"</li>"
      }
      msg += "</ul>";
      image.dataset.msg = msg;

    image.addEventListener("mouseenter", function(e){e.frameId = frameElement.id;p.popup(e, e.target.dataset.msg);});
    image.addEventListener("mouseleave", p.removeCustomPopup);
    }
*/
  }
}


function addTitanBuild2History(){
  var d = document;
  var build = createBuildString();
  var name = d.getElementById("TITAN_NAME");
  history.replaceState({}, "Unofficial Dawn of Titans Database - " + name.firstElementChild.innerText, location.href.split("&build")[0] + ( build != "S:;R:" ? "&build=" + LZString.compressToEncodedURIComponent(build) : ''));
}

function createBuildString(){
  var d = document;
  var abl="S:";
  var skills = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  var relics = d.getElementById("TITAN_RELICS").getElementsByClassName("relic");
  for(var i=0 , len = skills.length; i < len; i++)
    if(!skills[i].lastElementChild.firstElementChild.innerText.match(new RegExp(parent.getTranslation("TXT_SKILLS"))))
      abl += i + '-' + skills[i].firstElementChild.firstElementChild.alt +',';
  if(abl.slice(-1) == ',')
    abl = abl.slice(0,-1);
  abl += ";R:";
  for(var i=0, len = relics.length; i < len; i++)
    if(!relics[i].lastElementChild.firstElementChild.innerText.match(new RegExp(parent.getTranslation("TXT_ALTAR_TITAN_OR_RELIC"))))
      abl += i + '-' + relics[i].firstElementChild.firstElementChild.alt +',';
  var lv = d.getElementById('TITAN_LEVEL_SELECT').value();
  if (lv > 1) {
    if(abl.slice(-1) == ',') abl = abl.slice(0,-1);
    abl += ';' + lv;
  }
  else if(abl.slice(-1) == ',')
    abl = abl.slice(0,-1);
  return abl;
}

function createBuildComment(){
  var d = document;
  var commentBuild = '';
  var skills = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  var relics = d.getElementById("TITAN_RELICS").getElementsByClassName("relic");
  for(var i=0 , len = skills.length; i < len; i++){
    if(!skills[i].lastElementChild.firstElementChild.innerText.match(new RegExp(parent.getTranslation("TXT_SKILLS")))){
      var skill = parent.getSkillById(skills[i].firstElementChild.firstElementChild.alt);
      commentBuild += customEscapeStr(skill.uiName) + ',' + skill.uiIcon + ';';
    }
  }
  if(commentBuild != '')
    commentBuild = commentBuild.slice(0,-1) + ':';
  for(var i=0, len = relics.length; i < len; i++){
    if(!relics[i].lastElementChild.firstElementChild.innerText.match(new RegExp(parent.getTranslation("TXT_ALTAR_TITAN_OR_RELIC")))){
      var relic = parent.getRelicById(relics[i].firstElementChild.firstElementChild.alt);
      commentBuild += customEscapeStr(relic.uiName) + ',' + relic.uiIcon + ';';
    }
  }
  if(commentBuild != '' && commentBuild.slice(-1) == ';')
    commentBuild = commentBuild.slice(0,-1);
  return commentBuild;
}

function copyLinkEvent(event){
  if(parent.LocalStEnable && localStorage.getItem("GodMode") == "enabled") {parent.alert("Sorry", "Creative Mode Titans links can't be copied."); return;}
  copyLink(event, event.target.alt);
}

function copyLink(ev, build){
  if(parent.LocalStEnable && localStorage.getItem("GodMode") == "enabled") {parent.alert("Sorry", "Creative Mode Titans links can't be copied."); return;}
  if(typeof build === "undefined")
    var build = createBuildString();
  var d = document;
  var t = d.getElementById("TITAN_NAME");
  var titan = parent.getTitanById(t.dataset.id);
  var long_url = decodeURI(parent.window.location.toString()).split('?')[0];
  long_url += "?titan=" + titan.uiName;
  if(build != "S:;R:")
    long_url += '|build=' + LZString.compressToEncodedURIComponent(build);
  var msg = "If you want to disable url shortening, please change the site options. Here is the long version:<br><br>"+long_url;
  if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
    msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Long Url to Clipboard\" type=\"button\" data-url=\""+ long_url + "\">";
  }
  if(parent.LocalStEnable && localStorage.getItem("tinyUrl") == "enabled"){
    parent.addSpinner();
    var xhttp = new XMLHttpRequest();
    var url = "./tiny.php";
    long_url =  encodeURI(long_url);
    var params = "long_url=" + long_url + "&provider=" + localStorage.getItem("provider");
    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200){
        parent.removeSpinner();
        var response = JSON.parse(xhttp.responseText);
        if(response.state != "error")
        msg += "<br><br>The short link is:<br><br>" + response.shorturl;
        if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){//if not iphone, add copy btn
          msg += "<br><input onclick=\"copyToClipboard(event)\" value=\"Copy Short Url to Clipboard\" type=\"button\" data-url=\"" + response.shorturl + "\">";
        }
        parent.alert("Copy Link", msg);
      }
    };
    xhttp.send(params);
  }
  else{
    parent.alert("Copy Link", msg);
  }
}


function getMaxSkillAbl(skill){
  var tmp = skill;
  while(typeof tmp.upgradesTo !== "undefined")
    tmp = parent.getSkillById(tmp.upgradesTo);
  //parent.replaceStr(tmp);
  return tmp.effect1.uiName;
}

function clearBoostSlot(type, slotNumber){//Skill or Relic
  var d = document, p = parent;
  type = p.capital(type);
  var slot = d.getElementsByClassName(type.toLowerCase())[slotNumber];
  var img_div = slot.firstElementChild;
  var img = img_div.firstElementChild;
  if(!img.className.match("Locked")){//classname has Locked no boost is equipped
    removeSkillsAndRelics();
    var tmp = p["get" + type + 'ById'](img.alt);
    var boost_specific_troops = getSpecialTroopsOfBoost(tmp);
    var troop_select = d.getElementById("TROOP_SELECT");
    for(var i=0; i<boost_specific_troops.length; i++){
      troop_select.hideOption(boost_specific_troops[i]);
    }

    img.removeAttribute("alt");
    var slot_num = img_div.firstElementChild.id.slice(-1);
    var info_div = img_div.parentElement.lastElementChild;
    var title = info_div.children[0];
    var abilities = info_div.children[1].children;//spans of effects
    var dropdown = info_div.children[2].firstElementChild;

    img.src = "./images/skill_icons/Locked.png";
    img.className = "boost_img_locked";
    var tmp = "";
    if(type == "Skill")  tmp = p.getTranslation("TXT_SKILLS");
    else if(type == "Relic") tmp = p.getTranslation("TXT_ALTAR_TITAN_OR_RELIC");
    title.innerHTML = tmp + ' ' + (parseInt(slot_num)+1);
    for(var i = 0; i < abilities.length; i++)
      abilities[i].innerHTML = p.getTranslation("LOCKED");
    if(typeof dropdown.options !== "undefined" && !!dropdown.options.firstChild) //if skills are present, remove
      dropdown.clear();
    else dropdown.innerText = '';
    if(img_div.firstElementChild != img_div.lastElementChild)//remove the star image from relics
      img_div.removeChild(img_div.lastElementChild);
    applySkillsAndRelics();
    addTitanBuild2History();
  }
}

function clearBoostSlotEvent(e){
  e.preventDefault();
  e.target.blur();
  var d = document;
  var type = e.target.parentElement.id.split('_')[0];
  var slot = parseInt(e.target.parentElement.id.slice(-1));
  clearBoostSlot(type, slot);
}

function attachBoost(event){
  var d = document;
  var type_lower = event.target.className.split('_')[1].split('_')[0];
  var type = parent.capital(type_lower);
  var type_upper = type.toUpperCase();

  var selected = parent["get" + type + "ById"](event.target.alt);

  var activeSlot = d.getElementById("TITAN_" + type_upper + "S").getElementsByClassName("active")[0];
  var slot_num = activeSlot.firstElementChild.id.slice(-1);
  var skill_name = activeSlot.parentElement.lastElementChild.firstElementChild.innerText;

  if(parent.LocalStEnable && localStorage.getItem('manualSkillLevels') == "enabled" && skill_name == selected["uiName"] && activeSlot.firstElementChild.alt == event.target.alt)
    return;
  removeSkillsAndRelics();

  var img = d.getElementById(type_upper + "_IMG_" + slot_num);
  img.addEventListener("error", loadAlternate);
  img.className = "boost_img";
  if(event.target.src.match("_old.png")) img.className += "_old";
  img.src = event.target.src;
  var boost_name = d.getElementById(type_upper + "_NAME_" + slot_num);
  boost_name.innerText = selected["uiName"];
  if(typeof selected.spoilNotes !== "undefined"){
    try{
      var synergy_info = d.createElement("img");
      synergy_info.src = "./images/question.png";
      synergy_info.className = "synergy_info";
      synergy_info.dataset.title = selected.uiName + " Synergy";
      synergy_info.dataset.info = selected.spoilNotes;
      boost_name.appendChild(synergy_info);
      synergy_info.addEventListener("click", function(event){
        var title = event.target.dataset.title;
        var content = event.target.dataset.info;
        parent.alert(title, content);
      });
    } catch {}
  }
  var btn = d.createElement("img");
  btn.src = "./images/delete.png";
  btn.className = "clear_button";
  btn.id = "CLEAR_BUTTON_" + type.toUpperCase();
  boost_name.appendChild(btn);
  btn.addEventListener("click", clearBoostSlotEvent);

  if(type == "Relic"){
    if(activeSlot.children.length <= 1){//add rarity stars if not present
        var stars = d.createElement("img");
        stars.className = "relic_rarity_img";
        activeSlot.appendChild(stars);
      }
      else{
        var stars = activeSlot.lastElementChild;
      }
      stars.src = "./images/rarity/" + selected.rarity + "star_line.png";
      stars.alt = selected.rarity;
      if(typeof selected.spoilNotes !== "undefined"){
        stars.style.filter = "hue-rotate("+hue+")";
        stars.style.webkitFilter = "hue-rotate("+hue+")";
      }
  } else {

  }

  var tmp = selected;
  while (typeof tmp.upgradesTo !== "undefined") tmp = parent["get" + type + "ById"](tmp.upgradesTo);
  add_invoke_counter_skill(tmp, boost_name, slot_num);
  var boost_specific_troops = getSpecialTroopsOfBoost(tmp);
  var troop_select = d.getElementById("TROOP_SELECT");
  for(var i=0; i<boost_specific_troops.length; i++){
    troop_select.showOption(boost_specific_troops[i]);
  }

  var lv = selected.level;
  var select = d.getElementById(type_upper + "_LEVEL_SELECT_" + slot_num);

  if((parent.LocalStEnable && localStorage.getItem('manualSkillLevel') == "enabled") || type == "Relic" || (type == "Skill" && slot_num == 5)){
    if(!!select.options.firstChild) //if skills are present, remove
      select.clear();
    while (lv <= tmp.level){
      select.appendOption(parent.getTranslation("LVL") + " " + lv, lv);
      lv++;
    }
    select.finalise();
    //select.parentElement.style.maxHeight = (select.offsetHeight * 10/16) + "px";
    //use the max relic
    selected = tmp;
    //select the correct level(max level)
    if(selected.level > 1){
      select.setOption(selected.level);
    }
  }
  else{
    var xp = parent.getTitanXp()[parseInt(d.getElementById("CURRENT_LV").innerText)-1];
    var level = xp.unlockSkillLevel["skill" + (parseInt(slot_num) + 1)];
    select.innerText = typeof level === "undefined" ? 1 : level;
    while(selected.level < level) selected = parent.getSkillById(selected.upgradesTo);
  }
  img.alt = selected.id;

  for(var i = 0; i < 3; i++){
    var effectSpan = activeSlot.parentElement.lastElementChild.children[1].children[i];
    var effect = selected["effect" + (i+1)];
    if(typeof effect !== "undefined" && typeof effect.uiName !== "undefined"){
      if(typeof effectSpan !== "undefined"){
          effectSpan.innerHTML = effect.uiName;
          if(type == "Skill" && effectSpan.offsetHeight > 39){//parent.mobilecheck()){
            //adjust size for mobile phones
            changeFontSizeSkillEffect(effectSpan);
          }
      }
    }
    else if(type == "Relic")
      effectSpan.innerHTML = '';
  }
  applySkillsAndRelics();

  addTitanBuild2History();
    var container = d.getElementById("POSSIBLE_" + type.toUpperCase() + "S"); //container for possible Skills
    if(!!container.firstChild) //if skills are present, remove
      while (container.firstChild)
        container.removeChild(container.firstChild);
    activeSlot.className = activeSlot.className.replace(" active", '');
    if(!(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)){
      activeSlot.scrollIntoView();//iOS scroll into view is badly supported
    }
}

function attachBoostToSlot(boost_id, slot_num, type){
  var d = document;
  var type_upper = type.toUpperCase();
  var type_lower = type.toLowerCase();
  if(type == "Skill"){
    var default_boost = parent["get" + type + "ById"](boost_id.split('_')[0]);
  }
  else{
    if(boost_id.split('_').length > 2)
      var default_boost = parent["get" + type + "ById"](boost_id.slice(0, boost_id.lastIndexOf('_')));
    else
      var default_boost = parent["get" + type + "ById"](boost_id);
  }
  var selected = parent["get" + type + "ById"](boost_id);

  var slot = d.getElementById("TITAN_" + type_upper + "S").getElementsByClassName(type_lower)[slot_num].firstElementChild;
  var name = slot.parentElement.lastElementChild.firstElementChild.innerText;
  if(name == selected["uiName"] && slot.firstElementChild.alt == boost_id)
    return;
  removeSkillsAndRelics();

  var img = d.getElementById(type_upper + "_IMG_" + slot_num);
  img.addEventListener("error", loadAlternate)
  img.src = "./images/" + selected.uiIcon + ".png";
  img.className = "boost_img";
  img.alt = boost_id;
  var boost_name = d.getElementById(type_upper + "_NAME_" + slot_num);
  boost_name.innerText = selected["uiName"];
  if(type == "Relic" && typeof default_boost.spoilNotes !== "undefined"){
    try{
      var synergy_info = d.createElement("img");
      synergy_info.src = "./images/question.png";
      synergy_info.className = "synergy_info";
      synergy_info.dataset.title = selected.uiName + " Synergy";
      synergy_info.dataset.info = default_boost.spoilNotes;
      boost_name.appendChild(synergy_info);
      synergy_info.addEventListener("click", function(event){
        var title = event.target.dataset.title;
        var content = event.target.dataset.info;
        parent.alert(title, content);
      });
    } catch {}
  }
  var btn = d.createElement("img");
  btn.src = "./images/delete.png";
  btn.className = "clear_button";
  btn.id = "CLEAR_BUTTON_" + type.toUpperCase();
  boost_name.appendChild(btn);
  btn.addEventListener("click", clearBoostSlotEvent);
  if(type == "Relic"){
    if(slot.children.length <= 1){//add rarity stars if not present
      var stars = d.createElement("img");
      stars.className = "relic_rarity_img";
      slot.appendChild(stars);
    }
    else{
      var stars = slot.lastElementChild;
    }
    stars.src = "./images/rarity/" + selected.rarity + "star_line.png";
    stars.alt = selected.rarity;
    if(typeof default_boost.spoilNotes !== "undefined"){
      stars.style.filter = "hue-rotate("+hue+")";
      stars.style.webkitFilter = "hue-rotate("+hue+")";
    }

  }
  var tmp = selected;
  while (typeof tmp.upgradesTo !== "undefined") tmp = parent["get" + type + "ById"](tmp.upgradesTo);
  add_invoke_counter_skill(tmp, boost_name, slot_num);
  var boost_specific_troops = getSpecialTroopsOfBoost(tmp);
  var troop_select = d.getElementById("TROOP_SELECT");
  for(var i=0; i<boost_specific_troops.length; i++){
    troop_select.showOption(boost_specific_troops[i]);
  }


  //we want to have options 1-10 and not 5-10
  var lv = (typeof default_boost !== "undefined") ? default_boost.level : selected.level;
  var select = d.getElementById(type_upper + "_LEVEL_SELECT_" + slot_num);
  if((parent.LocalStEnable && localStorage.getItem('manualSkillLevel') == "enabled") || type == "Relic" || (type == "Skill" && slot_num == 5)){
    if(!!select.options.firstChild) //if skills are present, remove
      select.clear();
    while (lv <= tmp.level){
      select.appendOption(parent.getTranslation("LVL") + ' ' + lv, lv);
      lv++;
    }
    select.finalise();
    //select the correct level
    if(selected.level > 1){
      select.setOption(selected.level);
    }
  }
  else{
    var xp = parent.getTitanXp()[parseInt(d.getElementById("CURRENT_LV").innerHTML) - 1];
    var level = xp.unlockSkillLevel["skill" + (parseInt(slot_num) + 1)];
    level = typeof level === "undefined" ? 1 : level;
    while(selected.level < level) selected = parent.getSkillById(selected.upgradesTo);
    if(selected.level > level){
      var s = selected.id.split("_");
      selected = parent.getSkillById(s[0] + (level == 1 ? '' : "_" + level) );
    }
    select.innerText = selected.level;
    img.alt = selected.id;
    //parent.replaceStr(selected);
  }

  for(var i = 0; i < 3; i++){
    var effectSpan = slot.parentElement.lastElementChild.children[1].children[i];
    var effect = selected["effect" + (i+1)];
    if(typeof effect !== "undefined" && typeof effect.uiName !== "undefined"){
      if(typeof effectSpan !== "undefined"){
        effectSpan.innerText = effect.uiName;
        if(type == "Skill" && effectSpan.offsetHeight > 39){//parent.mobilecheck()){
          //adjust size for mobile phones
          changeFontSizeSkillEffect(effectSpan);
        }
      }
    } else if(type == "Relic")
      effectSpan.innerHTML = '';
  }
  applySkillsAndRelics();
  addTitanBuild2History();
}

function count_same_invokes(autocast_ability, ref_trigger, ref_action){
  var count = 0;
  var cast_effects = autocast_ability.abilities;
  for(var l=0; l<cast_effects.length; l++){
    var cast_effect = cast_effects[l];
    if (cast_effect.trigger.type == ref_trigger.type){
      for(var m=0; m<cast_effects[l].actions.length; m++){
        var action = cast_effect.actions[m];
        if(action.target == ref_action.target && action.parameter == ref_action.parameter)
          count++;
      }
    }
  }
  return count;
}

function add_invoke_counter_skill(skill, parent_element, slot_num){
  var d = document;
  var p = parent;
  var i = 1;
  while(typeof(skill["effect"+i]) !== "undefined"){
    var ability = skill["effect"+i]
    if (ability.effect == "AUTOCAST_ABILITY"){ //Invoke Counter
      var cast_ability = p.getAutocastAbilityById(ability.specificTarget);
      add_invoke_counter(cast_ability, ability.specificTarget, parent_element, slot_num);
    }
    i++;
  }
}

function add_invoke_counter_autocast(cast_ability, autocast_id, parent_element, slot_num){
  add_invoke_counter(cast_ability, autocast_id, parent_element, slot_num);
}

function remove_invoke_counter_autocast(cast_ability, autocast_id, parent_element, slot_num){
  remove_invoke_counter(cast_ability, autocast_id, parent_element, slot_num);
}

function add_invoke_counter(cast_ability, autocast_id, parent_element, slot_num){
  var d = document;
  var p = parent;
  var titan_id = d.getElementById("TITAN_NAME").dataset.id;
  var titan = p.getTitanById(titan_id);
  if(typeof cast_ability.titanExclusive === "undefined" && typeof cast_ability.titanGroupInclude === "undefined" ||
     typeof cast_ability.titanExclusive !== "undefined" && cast_ability.titanExclusive.includes(titan_id) ||
     typeof cast_ability.titanGroupInclude !== "undefined" && typeof titan.troopGroup !== "undefined" &&
     titan.troopGroup == cast_ability.titanGroupInclude){
    var cast_effects = cast_ability.abilities;
    for(var j=0; j<cast_effects.length; j++){
      var cast_effect = cast_effects[j];
      if (allowed_invoke_triggers.includes(cast_effect.trigger.type)){
        var has_action = false;
        var same_invoke_count = 0;
        for(var k=0; k<cast_effect.actions.length; k++){
          var action = cast_effect.actions[k];
          if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
            has_action = true;
            if (cast_effect.trigger.type == "ALLIED_TROOP_ADDED"){
              //Mahaha skill 3
              same_invoke_count = count_same_invokes(cast_ability, cast_effect.trigger, action);
            }
            if (cast_effect.trigger.type == "TROOP_HEALTH_INVOKED"){
              //Korthan Prestige
              same_invoke_count = count_same_invokes(cast_ability, cast_effect.trigger, action);
            }
            break;
          }
        }
        if(!has_action)
          continue;
        var invoke_btn = d.createElement("div");
        invoke_btn.dataset.individual_abilities = false;
        if (typeof(cast_effect.trigger.limit) !== "undefined")
          if (same_invoke_count > cast_effect.trigger.limit){
            var limit = same_invoke_count;
            invoke_btn.dataset.individual_abilities = true;
          }
          else
            var limit = cast_effect.trigger.limit;
        else
          var limit = -1

        invoke_btn.className = "autocast_button unselectable";
        invoke_btn.id = "INVOKE_BUTTON_" + slot_num; //+ "_" + i;
        invoke_btn.dataset.value = 0;
        invoke_btn.dataset.limit = limit;
        if(same_invoke_count > 1){
          invoke_btn.dataset.combinedInvoke = "true";
          invoke_btn.dataset.effectIndex = -1;
        }
        else {
          invoke_btn.dataset.combinedInvoke = "false";
          invoke_btn.dataset.effectIndex = j;
        }
        invoke_btn.dataset.autoabilityId = autocast_id;
        parent_element.appendChild(invoke_btn);
        invoke_btn.addEventListener("click", invoke)
        var count_span = d.createElement("span");
        count_span.id = "INVOKE_COUNT_SPAN_" + slot_num;
        count_span.className = "invoke_span";
        count_span.innerText = "0/" 
        if(limit < 0)
           count_span.innerText += "∞"
        else
           count_span.innerText += limit;
        invoke_btn.appendChild(count_span);
        var invoke_clr_btn = d.createElement("img");
        invoke_clr_btn.src = "./images/delete.png";
        invoke_clr_btn.className = "clear_button";
        invoke_clr_btn.id = "INVOKE_CLEAR_BUTTON_" + slot_num;
        invoke_clr_btn.style.height = "15px";
        invoke_btn.appendChild(invoke_clr_btn);
        invoke_clr_btn.addEventListener("click", clear_invoke);
        if(same_invoke_count > 1 && (cast_effect.trigger.type == "ALLIED_TROOP_ADDED" || cast_effect.trigger.type == "TROOP_HEALTH_INVOKED")){
          return;
        }
      }
    }
  }
}

function remove_invoke_counter(cast_ability, autocast_id, parent_element, slot_num){
  var d = document;
  var autocast_buttons = parent_element.getElementsByClassName("autocast_button")
  var cast_effects = cast_ability.abilities;
  for(var j=0; j<autocast_buttons.length; j++){
    if(autocast_buttons[j].dataset.autoabilityId == autocast_id){
      reset_invoke(autocast_buttons[j]);
      parent_element.removeChild(autocast_buttons[j]);
      break;
    }
  }
}

function invoke(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
  if(typeof(event.target.dataset.value) != "undefined")
    var target = event.target;
  else if (event.target.className == "clear_button")
    return
  else
    var target = event.target.parentElement;
  increase_invoke(target)
  return false;
}

function increase_invoke(count_element){
  var old_val = parseInt(count_element.dataset.value);
  var new_val = parseInt(count_element.dataset.value) +1;
  var span = count_element.firstElementChild;
  var limit = parseInt(count_element.dataset.limit)
  if (new_val > limit && limit > 0)
    new_val = count_element.dataset.limit;
  count_element.dataset.value = new_val;
  span.innerText = count_element.dataset.value + "/";
  if(limit < 0)
     span.innerText += "∞"
  else
     span.innerText += limit;
  if(new_val != old_val)
    apply_invoke_counts(count_element, new_val - old_val)
}

function apply_invoke_counts(count_element, times){
  if (count_element.parentElement.parentElement.parentElement.className.match("preview"))
    return
  var d = document;
  var p = parent;
  var cast_ability = p.getAutocastAbilityById(count_element.dataset.autoabilityId);
  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var effect_index = parseInt(count_element.dataset.effectIndex);
  if(typeof cast_ability.titanExclusive === "undefined" || cast_ability.titanExclusive.includes(d.getElementById("TITAN_NAME").dataset.id)) {
    var cast_effects = cast_ability.abilities;
    for(var i=0; i<cast_effects.length; i++){
      if(effect_index == i || effect_index == -1){
        var last_parameter = undefined;
        var trigger = cast_effects[i].trigger;
        var situation = typeof trigger.situation === "undefined" || (trigger.situation == "ATTACK" && titan_mode == "ATK" || trigger.situation == "DEFEND" && titan_mode == "DEF");
        if(allowed_invoke_triggers.includes(trigger.type) && situation){
          if(count_element.dataset.combinedInvoke == "true"){
            if(trigger.type == "ALLIED_TROOP_ADDED" &&
               trigger.operator == "=" &&
               trigger.value != count_element.dataset.value)
              continue;
            if(trigger.type == "TROOP_HEALTH_INVOKED" && parseInt(trigger.value/10+1) != parseInt(count_element.dataset.value)){
              continue;
            }
          }
          for(var j=0; j<cast_effects[i].actions.length; j++){
            var action = cast_effects[i].actions[j];
            if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
              var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
              if(last_parameter != param){ //Zabava has a skill that is triggered twice with 2 different targets. Titans and troops
                var spoil = p.getAutocastRelicById(param);
                last_parameter = param;
                for(var k=0; k<times; k++){
                  applyStatBonusAbility("Relic", spoil);
                }
              }
            }
          }
        }
      }
    }
  }
}

function clear_invoke(event){
  if(typeof(event.target.dataset.value) != "undefined")
    var target = event.target;
  else
    var target = event.target.parentElement;
  reset_invoke(target)
}

function reset_invoke(count_element){
  var old_val = parseInt(count_element.dataset.value);
  var new_val = 0;
  count_element.dataset.value = new_val;
  var span = count_element.firstElementChild;
  span.innerText = count_element.dataset.value + "/";
  var limit = parseInt(count_element.dataset.limit)
  if(limit < 0)
     span.innerText += "∞"
  else
     span.innerText += limit;
  if(new_val != old_val)
    remove_invoke_counts(count_element, old_val)
}

function remove_invoke_counts(count_element, times){
  if (count_element.parentElement.parentElement.parentElement.className.match("preview"))
    return
  var d = document;
  var p = parent;
  var invoke_remove_count = times;
  if(count_element.dataset.individual_abilities == "true")
    times = 1;
  var cast_ability = p.getAutocastAbilityById(count_element.dataset.autoabilityId);
  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var effect_index = parseInt(count_element.dataset.effectIndex);
  if(typeof cast_ability.titanExclusive === "undefined" || cast_ability.titanExclusive.includes(d.getElementById("TITAN_NAME").dataset.id)) {
    var cast_effects = cast_ability.abilities;
    for(var i=0; i<cast_effects.length; i++){
      if(effect_index == i || effect_index == -1){
        var last_parameter = undefined;
        var trigger = cast_effects[i].trigger;
        var situation = typeof trigger.situation === "undefined" || (trigger.situation == "ATTACK" && titan_mode == "ATK" || trigger.situation == "DEFEND" && titan_mode == "DEF");
        if(allowed_invoke_triggers.includes(trigger.type) && situation){
          if(count_element.dataset.combinedInvoke == "true"){
            if(trigger.type == "ALLIED_TROOP_ADDED" &&
               trigger.operator == "=" &&
               trigger.value > invoke_remove_count){
              break; // Once x times the skill was removed, break
            }
            if(trigger.type == "TROOP_HEALTH_INVOKED" && trigger.value/10 >= invoke_remove_count){
              continue;
            }
          }
          for(var j=0; j<cast_effects[i].actions.length; j++){
            var action = cast_effects[i].actions[j];
            if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
              var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
              if(last_parameter != param){
                var spoil = p.getAutocastRelicById(param);
                last_parameter = param;
                for(var k=0; k<times; k++)
                  removeStatBonusAbility("Relic", spoil);
              }
            }
          }
        }
      }
    }
  }
}

function selectLevelBoost(event){
  var d = document;
  var type = parent.capital(event.target.id.split('_')[0]);
  var slot_num = event.target.id.slice(-1);
  var img = d.getElementById(type.toUpperCase() + "_IMG_" + slot_num);
  var id = img.alt;
  var boost = parent["get" + type + "ById"](id);
  var target = event.target.parentElement.parentElement.parentElement;
  removeSkillsAndRelics();

  var level = boost.level;
  //var select = d.getElementById(type.toUpperCase() + "_LEVEL_SELECT_" + slot_num); == event.target
  var new_level = event.target.value();//select.value;
  var tmp = boost;
  if(new_level > level){
    while(typeof tmp.upgradesTo !== "undefined" && new_level != level){
      tmp = parent["get" + type + "ById"](tmp.upgradesTo);
      level = tmp.level;
    }
  }
  else{
    //id for a leveled skill or relic is ID_2, where 2 is the level
    tmp = parent["get" + type + "ById"]( (!isNaN(id.slice(-1))) ? id.slice(0,id.lastIndexOf('_')) : id);
    level = tmp.level;
    while(typeof tmp.upgradesTo !== "undefined" && new_level != level){
      tmp = parent["get" + type + "ById"](tmp.upgradesTo);
      level = tmp.level;
    }
  }
  if(typeof tmp === "undefined")
    return;
  img.alt = tmp.id;

  var slot = d.getElementById(type.toUpperCase() + "_DESCRIPTION_" + slot_num);
  for(var i = 0; i < 3; i++){
    if(typeof tmp["effect" + (i+1)] !== "undefined" && typeof(tmp["effect" + (i+1)].uiName) !== "undefined")
      slot.children[i].innerHTML = tmp["effect" + (i+1)].uiName;
    else if(type == "Relic")
      slot.children[i].innerHTML = '';
  }
  if(!target.className.match(/preview/i)){
    if(type == "Skill"){
      var invk_btn = d.getElementById("INVOKE_BUTTON_" + slot_num)
      if(invk_btn != null){
        for(var i=1; i<5; i++){
          var ability = tmp["effect"+i]
          if(typeof(ability) !== "undefined"){
            if (ability.effect == "AUTOCAST_ABILITY"){ //Invoke Counter
              var cast_ability = parent.getAutocastAbilityById(ability.specificTarget);
              var cast_effects = cast_ability.abilities;
              for(var j=0; j<cast_effects.length; j++){
                var cast_effect = cast_effects[j];
                var trigger = cast_effect.trigger;
                //var situation = typeof trigger.situation === "undefined" || (trigger.situation == "ATTACK" && titan_mode == "ATK" || trigger.situation == "DEFEND" && titan_mode == "DEF");
                if (allowed_invoke_triggers.includes(trigger.type)){// && situation){
                  var limit = -1;
                  if (typeof(cast_effect.trigger.limit) !== "undefined")
                    limit = cast_effect.trigger.limit;
                  var invk_val = parseInt(invk_btn.dataset.value);
                  invk_btn.dataset.autoabilityId = ability.specificTarget;
                  invk_btn.dataset.limit = limit;
                  if(invk_val > limit && limit > 0){
                    invk_btn.dataset.value = limit;
                    invk_val = limit
                  }
                  invk_btn.firstElementChild.innerText = invk_btn.dataset.value + "/";
                  if(limit < 0)
                    invk_btn.firstElementChild.innerText += "∞";
                  else
                    invk_btn.firstElementChild.innerText += limit;
                }
              }
            }
          }
        }
      }
    }
  }
  applySkillsAndRelics();
  addTitanBuild2History();
}

function printPercent(){
  var d = document;
  var p =parent;
  var data = getDataAttributes(d.getElementById("TITAN_DAMAGE_SPAN"));
  var keys = Object.keys(data);
  var arrow = "&#10551;"
  var space1 = "&nbsp&nbsp";
  var space2 = "&nbsp&nbsp&nbsp&nbsp";

  var alt =  document.getElementById("DAMAGE_TYPE").alt.split(' ');
  var dmg_type = "Innate Damagetype: " + p.replaceElements(alt[0]) + "<br>";
  var element = p.capital(alt[0]);
  var archetype = p.capital(d.getElementById("TITAN_CLASS_IMG").alt);
  if(alt.length > 1){
    dmg_type += "Current Damagetype: " + p.replaceElements(alt[alt.length - 1]) + "<br>";
    element = p.capital(alt[alt.length - 1]);
  }
  var dmg = '', res = '', total = '', offensive = '', defensive = '';
  var total_dmg = 1;
  var total_base_dmg = 1;
  var total_elemental_dmg = 1;
  for(var i = 0, len = keys.length; i < len; i++){
    if(keys[i] == 'fdmg')continue;
    if(keys[i].match(/dmg/) && data[keys[i]] != ''){
      if(keys[i].match(/(Militia|Archers|Pikemen|Elithen|Unak|Mossmane|Ragnar|Hero)/i)){
        dmg += space2 + arrow + p.getTranslation("DAMAGE") +' '+ p.getTranslation("TXT_VS_TYPE").replace("#[type]", p.capital(p.replaceTroops(keys[i].replace(/dmg/i,'')))) +": "+ data[keys[i]] + "%<br>";
        //Troop specific dmg is not counted because it doesn't apply to every troop
        //total_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(RegExp(archetype))){
        dmg += space2 + arrow + archetype + ' '+p.getTranslation("DAMAGE")+": "+ data[keys[i]] + "%<br>";
        total_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(RegExp(element))){
        dmg += space2 + arrow + p.getTranslation("TYPE_DAMAGE").replace("#[type]", p.capital(p.replaceElements(keys[i].replace("dmg",'')))) +": "+ data[keys[i]] + "%<br>";
        total_elemental_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(/AttackBase/i)){
        dmg += space2 + arrow + p.getTranslation("BASE_DAMAGE")+": "+ data[keys[i]] + "%<br>";
        total_base_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(/Attack/i)){
        dmg += space2 + arrow + p.getTranslation("DAMAGE")+": "+ data[keys[i]] + "%<br>";
        total_dmg += parseInt(data[keys[i]])/100;
      }
    }
    else if(keys[i].match(/res/) && data[keys[i]] != ''){
      var res_type = keys[i].replace("res", '');
      if(keys[i].match(/(Melee|Ranged)/i))
        res += space1 + p.getTranslation("TXT_RESIST_VS_"+res_type) +": "+ parseInt(data[keys[i]]) + "%<br>";
      else
        res += space1 + p.getTranslation("TXT_RESIST_VS_TYPE").replace("#[type]", p.capital(p.replaceTroops(p.replaceElements(res_type)))) +": "+ parseInt(data[keys[i]]) + "%<br>";
    }
  }
  //Calculate combined damage
  var combined_dmg = parseInt((total_dmg * total_base_dmg * total_elemental_dmg -1)*100);
  if(combined_dmg > 0)
    dmg = space1 + "Total Damage: " + combined_dmg + "%<br>" + dmg;
  var cells = d.getElementById("TITAN_STATS").getElementsByClassName("stats_cell");
  var health_str = '';
  var health = 1;
  var base_health = 1;
  for(var i = 0,len = cells.length; i < len; i++){
    if(typeof cells[i].dataset["healthBase"] !== "undefined" || typeof cells[i].dataset["health"] !== "undefined"){
      var hp_txt = p.getTranslation("HP");
      if(typeof cells[i].dataset["healthBase"] !== "undefined" && cells[i].dataset['healthBase'] != ''){
        health_str += space2 + arrow + p.getTranslation("BASE_HEALTH") +": "+ cells[i].dataset["healthBase"] + "%<br>";
        base_health += parseInt(cells[i].dataset["healthBase"])/100;
      }
      if(typeof cells[i].dataset["health"] !== "undefined" && cells[i].dataset['health'] != '') {
        health_str += space2 + arrow + hp_txt +": "+ cells[i].dataset["health"] + "%<br>";
        health += parseInt(cells[i].dataset["health"])/100;
      }
      var combined_health = parseInt((base_health * health -1)*100);
      if(combined_health > 0)
        health_str = space1 + "Total " + hp_txt + ": " + combined_health + "%<br>" + health_str;
      defensive += health_str;
    }
    else if(typeof cells[i].dataset["armour"] !== "undefined" && cells[i].dataset['armour'] != '')
      defensive += space1 + p.getTranslation("ARMOR") +": "+ Math.round(cells[i].dataset["armour"]) + "%<br>";
    else if(typeof cells[i].dataset["armourPierce"] !== "undefined" && cells[i].dataset['armourPierce'] != '')
      offensive += space1 + p.getTranslation("ARMOR PIERCING") +": "+ Math.round(cells[i].dataset["armourPierce"]) + "%<br>";
    else if(typeof cells[i].dataset["critical"] !== "undefined" && cells[i].dataset["critical"] != '')
      offensive += space1 + p.getTranslation("CRITICAL") +": "+ Math.round(cells[i].dataset["critical"]) + "%<br>";
  }
  if(dmg != '' || offensive != '')
    total += p.getTranslation("OFFENSIVE") + ":<br>" + dmg + offensive;
  if(res != '' || defensive != '')
    total += p.getTranslation("DEFENSIVE") + ":<br>" + defensive + res;
  if(total == '')
    total = "Please equip skills and relics first to see the boosts provided by those.";
  return dmg_type + total;
}

function printTroopPercent(){
  var d = document;
  var p = parent;
  var data = getDataAttributes(d.getElementById("TROOP_DAMAGE_SPAN"));
  var keys = Object.keys(data);
  var arrow = "&#10551;"
  var space1 = "&nbsp&nbsp";
  var space2 = "&nbsp&nbsp&nbsp&nbsp";


  var alt =  document.getElementById("TROOP_DAMAGE_TYPE").alt.split(' ');
  var dmg_type = "Innate Damagetype: " + p.replaceElements(alt[0]) + "<br>";
  var element = p.capital(alt[0]);
  if(alt.length > 1){
    dmg_type += "Current Damagetype: " + p.replaceElements(alt[alt.length-1]) + "<br>";
    element = p.capital(alt[alt.length - 1]);
  }
  var dmg = '', res = '', total = '', offensive = '', defensive = '';
  var total_dmg = 1;
  var total_base_dmg = 1;
  var total_elemental_dmg = 1;
  for(var i = 0, len = keys.length; i < len; i++){
    if(keys[i] == "fdmg") continue;
    if(keys[i].match(/dmg/) && data[keys[i]] != ''){
      if(keys[i].match(/(Militia|Archers|Pikemen|Elithen|Unak|Mossmane|Ragnar|Hero)/i)){
        dmg += space2 + arrow + p.getTranslation("DAMAGE") +' '+ p.getTranslation("TXT_VS_TYPE").replace("#[type]", p.capital(p.replaceTroops(keys[i].replace(/dmg/i,'')))) +": "+ data[keys[i]] + "%<br>";
        //Troop specific dmg is not counted because it doesn't apply to every troop
        //total_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(RegExp(element))){
        dmg += space2 + arrow + p.getTranslation("TYPE_DAMAGE").replace("#[type]", p.capital(p.replaceElements(keys[i].replace("dmg",'')))) +": "+ data[keys[i]] + "%<br>";
        total_elemental_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(/AttackBase/i)){
        dmg += space2 + arrow + p.getTranslation("BASE_DAMAGE")+": "+ data[keys[i]] + "%<br>";
        total_base_dmg += parseInt(data[keys[i]])/100;
      }
      else if(keys[i].match(/Attack/i)){
        dmg += space2 + arrow + p.getTranslation("DAMAGE")+": "+ data[keys[i]] + "%<br>";
        total_dmg += parseInt(data[keys[i]])/100;
      }
    }
    else if(keys[i].match(/res/) && data[keys[i]] != ''){
      var res_type = keys[i].replace("res", '');
      if(keys[i].match(/(Melee|Ranged)/i))
        res += space1 + p.getTranslation("TXT_RESIST_VS_"+res_type) +": "+ parseInt(data[keys[i]]) + "%<br>";
      else
        res += space1 + p.getTranslation("TXT_RESIST_VS_TYPE").replace("#[type]", p.capital(p.replaceTroops(p.replaceElements(res_type)))) +": "+ parseInt(data[keys[i]]) + "%<br>";
    }
  }
  //Calculate combined damage
  var combined_dmg = parseInt((total_dmg * total_base_dmg * total_elemental_dmg-1)*100);
  if(combined_dmg > 0)
    dmg = space1 + "Total Damage: " + combined_dmg + "%<br>" + dmg;
  var cells = d.getElementById("TROOP_STATS").getElementsByClassName("stats_cell");
  var health_str = '';
  var health = 1;
  var base_health = 1;
  for(var i = 0,len = cells.length; i < len; i++){
    if(typeof cells[i].dataset["healthBase"] !== "undefined" || typeof cells[i].dataset["health"] !== "undefined"){
      var hp_txt = p.getTranslation("HP");
      if(typeof cells[i].dataset["healthBase"] !== "undefined" && cells[i].dataset['healthBase'] != ''){
        health_str += space2 + arrow + p.getTranslation("BASE_HEALTH") +": "+ cells[i].dataset["healthBase"] + "%<br>";
        base_health += parseInt(cells[i].dataset["healthBase"])/100;
      }
      if(typeof cells[i].dataset["health"] !== "undefined" && cells[i].dataset['health'] != '') {
        health_str += space2 + arrow + hp_txt +": "+ cells[i].dataset["health"] + "%<br>";
        health += parseInt(cells[i].dataset["health"])/100;
      }
      var combined_health = parseInt((base_health * health -1)*100);
      if(combined_health > 0)
        health_str = space1 + "Total " + hp_txt + ": " + combined_health + "%<br>" + health_str;
      defensive += health_str;
    }
    else if(typeof cells[i].dataset["armour"] !== "undefined" && cells[i].dataset["armour"] != '')
      defensive += space1 + p.getTranslation("ARMOR") +": "+ Math.round(cells[i].dataset["armour"]) + "%<br>";
    else if(typeof cells[i].dataset["armourPierce"] !== "undefined" && cells[i].dataset["armourPierce"] != '')
      offensive += space1 + p.getTranslation("ARMOR_PIERCING") +": "+ Math.round(cells[i].dataset["armourPierce"]) + "%<br>";
    else if(typeof cells[i].dataset["critical"] !== "undefined" && cells[i].dataset["critical"] != '')
      offensive += space1 + p.getTranslation("CRITICAL") +": "+ Math.round(cells[i].dataset["critical"]) + "%<br>";
  }
  if(dmg != '' || offensive != '')
    total += p.getTranslation("OFFENSIVE") + ":<br>" + dmg + offensive;
  if(res != '' || defensive != '')
    total += p.getTranslation("DEFENSIVE") + ":<br>" + defensive + res;
  if(total == '')
    total = "Please equip skills and relics first to see the boosts provided by those.";
  return dmg_type + total;

}

function printSpellPercent(){
  var d = document;
  var data = getDataAttributes(d.getElementById("SPELL_DAMAGE_SPAN"));
  var keys = Object.keys(data);

  var alt =  document.getElementById("SPELL_DAMAGE_TYPE").alt.split(' ');
  var dmg_type = "Innate Damagetype: " + parent.replaceElements(alt[0]) + "<br>";
  var element = parent.capital(alt[0]);
  if(alt.length > 1){
    dmg_type += "Current Damagetype: " + parent.replaceElements(alt[alt.length-1]) + "<br>";
    element = parent.capital(alt[alt.length - 1]);
  }
  var dmg = '', res = '', total = '', offensive = '', defensive = '';
  for(var i = 0, len = keys.length; i < len; i++){
    if(keys[i] == "fdmg") continue;
    if(keys[i].match(/dmg/) && data[keys[i]] != ''){
      if(keys[i].match(RegExp(element)))
        dmg += "&nbsp&nbsp" + parent.capital(parent.replaceTroops(parent.replaceElements(keys[i].replace("dmg",'')))) + ' ' + parent.getTranslation("DAMAGE") +": "+ data[keys[i]] + "%<br>";
    }
    if(keys[i].match(/quantity/i) && data[keys[i]] != ''){
      var sp_type = d.getElementById("SPELL_SELECT").dataset.text;
      if(sp_type == "Lightning Storm") sp_type = "Lightning Bolts";
      else if(sp_type == "Fireball") sp_type = "Fireball Missiles";
      else if(sp_type == "Meteor Strike") sp_type = "Meteors";
      dmg += "&nbsp&nbsp" + sp_type + ": +" + data[keys[i]] + "<br>";
    }
  }
  var cells = d.getElementById("SPELL_STATS").getElementsByClassName("stats_cell");
  for(var i = 0,len = cells.length; i < len; i++){
    if(typeof cells[i].dataset["radius"] !== "undefined" && cells[i].dataset["radius"] != '')
      offensive += "&nbsp&nbsp" + parent.getTranslation("RADIUS") +": "+ Math.floor(cells[i].dataset["radius"]) + "%<br>";
    else if(typeof cells[i].dataset["duration"] !== "undefined" && cells[i].dataset["duration"] != '')
      offensive += "&nbsp&nbsp" + parent.getTranslation("DURATION") +": "+ Math.round(cells[i].dataset["duration"]) + "%<br>";
  }
  if(dmg != '' || offensive != '')
    total += parent.getTranslation("OFFENSIVE") + ":<br>" + dmg + offensive;
  if(total == '')
    total = "Please equip skills and relics first to see the boosts provided by those.";
  return dmg_type + total;

}

/****************************************************************************************
 *                                                                                      *
 *                          Applying abilities, elemental boni                          *
 *                                                                                      *
 ****************************************************************************************/

function getDataAttributes(element){
  //as an object
  var data = {};
  [].forEach.call(element.attributes, function(attr) {
      if (/^data-/.test(attr.name)) {
    var camel_case_name = attr.name.substr(5).replace(/-(.)/g, function ($0, $1) {
        return $1.toUpperCase();
    });
    data[camel_case_name] = attr.value;
      }
  });
  return data;
}

function selectLevel(event){
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.value();
  document.getElementById("LEVEL_DOWN_BUTTON").dataset.level = event.target.value();
  update(event.target.value());
}

function toggleTitanMode(event){
  event.preventDefault();
  removeSkillsAndRelics();
  
  var toggle_button = event.target
  if(toggle_button.dataset.battleMode == "ATK"){
    toggle_button.dataset.battleMode = "DEF";
    toggle_button.innerText = "Defense Mode";
  }
  else{
    toggle_button.dataset.battleMode = "ATK";
    toggle_button.innerText = "Attack Mode";
  }
  applySkillsAndRelics();
}

function update(level){
  var d = document;
  var p = parent;
  d.getElementById("CURRENT_LV").innerText = level;
  d.getElementById("TITAN_LEVEL").style.width = (d.getElementById("LVL").offsetWidth + d.getElementById("LVL_VALUE").offsetWidth + 5) + "px";
  var select = d.getElementById("TITAN_LEVEL_SELECT");
  if(select.value() != level)
    select.setOption(level);

  var titan = p.getTitanById(d.getElementById("TITAN_NAME").dataset.id + ((level == 1)? "" : level));
  var base_titan = p.getTitanById(d.getElementById("TITAN_NAME").dataset.id);
  removeSkillsAndRelics();

  var cells = d.getElementById("TITAN_STATS").getElementsByClassName("stats_cell");
  //update cells
  for(var i = 0, len = cells.length; i < len; i=i+2){
    if(cells[i].id == "TITAN_HP")
      cells[i+1].innerHTML = Math.floor(titan.health);
    else if(cells[i].id == "TITAN_DAMAGE"){
      var dmg_span = d.getElementById("TITAN_DAMAGE_SPAN");
      for(var e = 0; e < elemental.length; e++){
        var tmp = titan;
        while(typeof tmp["damageFrom " + elemental[e]] === "undefined")
          if(typeof tmp["extends"] !== "undefined")
            tmp = p.getTitanById(tmp["extends"]);
          else break;
        if(typeof tmp["damageFrom " + elemental[e]] !== "undefined" ){
          var innate_resistance = tmp["damageFrom " + elemental[e]];
          dmg_span.dataset["res" + p.capital(elemental[e])] = innate_resistance == 1 ? '' : Math.round((1 - innate_resistance) * 100);
        }
        else if(typeof tmp["damageFrom " + elemental[e]] === "undefined" && typeof dmg_span.dataset["res" + p.capital(elemental[e])] !== "undefined"){// any set res is reset
          dmg_span.dataset["res" + p.capital(elemental[e])] = '';
        }

      }
      if(typeof titan.rangedDamage !== "undefined"){
        var temp = titan;
        while(typeof temp.secondsPerRangedAttack === "undefined")
          temp = p.getTitanById(temp["extends"]);
        var ranged_dmg_factor = 1;
        if(typeof base_titan.titanRangedMaxAttacks !== "undefined"){
          ranged_dmg_factor *= base_titan.titanRangedMaxAttacks;
        }// else ranged_dmg_factor *= 56; #Sorcerers have factor 1
        
        dmg_span.innerText = Math.floor(titan.rangedDamage * ranged_dmg_factor / temp.secondsPerRangedAttack);
        dmg_span.dataset.fdmg =         titan.rangedDamage * ranged_dmg_factor / temp.secondsPerRangedAttack;
      } else {
        dmg_span.innerText = Math.floor(titan.meleeDPS);
        dmg_span.dataset.fdmg =         titan.meleeDPS;
      }
    }
    //Armour, Pierce and Crit stop leveling after a certain level, ergo if crit is undefined we need to find the last level that had crit
    else if(cells[i].id == "TITAN_ARMOR"){
      var tmp = titan;
      while(typeof tmp["armourValue"] === "undefined")
          tmp = p.getTitanById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.armourValue + '%';
    }
    else if(cells[i].id == "TITAN_ARMOR_PIERCING"){
      var tmp = titan;
      while(typeof tmp["armourPierce"] === "undefined")
          tmp = p.getTitanById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.armourPierce + '%';
    }
    else if(cells[i].id == "TITAN_CRITICAL"){
      var tmp = titan;
      while(typeof tmp["criticalRate"] === "undefined")
          tmp = p.getTitanById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.criticalRate + '%';
    }
    else if(cells[i].id == "TITAN_SPEED"){
      var tmp = titan;
      while(typeof tmp["moveSpeed"] === "undefined")
          tmp = p.getTitanById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.moveSpeed;
    }
    else if(cells[i].id == "TITAN_RATE_OF_FIRE"){
      var tmp = titan;
      while(typeof tmp["secondsPerRangedAttack"] === "undefined")
          tmp = p.getTitanById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.secondsPerRangedAttack + 's';
    }
  }
  var xp_data = p.getTitanXp();
  var xp = "-----";
  if(level ==  1)
    xp = xp_data[level-1].titan_XP["rarity" + base_titan.startingRarity];
  else if(!(level == base_titan.ascensionMaxLevel || level == d.getElementById("MAX_LV").innerHTML))
    xp = xp_data[level-1].titan_XP["rarity" + base_titan.startingRarity] - xp_data[level-1-1].titan_XP["rarity" + base_titan.startingRarity];

  d.getElementById("XP").innerHTML = p.getTranslation("XP").toUpperCase() + ": " + xp;
  d.getElementById("XP_TOTAL").innerHTML = "Total: " + (level == 1 ? "-----" : xp_data[level - 1 - 1].titan_XP["rarity" + base_titan.startingRarity]);
  d.getElementById("XP_FUSION").innerHTML = p.getTranslation("TXT_FUSION") +": "+ p.getTitanXp()[level - 1].fusion_XP["rarity" + base_titan.startingRarity];

  var skills = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  var relics = d.getElementById("TITAN_RELICS").getElementsByClassName("relic");

  if(p.LocalStEnable && localStorage.getItem("manualSkillLevel") == "disabled" || localStorage.getItem("manualSkillLevel") == null){//if skills are not leveled manually
    var keys = Object.keys(xp_data[level - 1].unlockSkillLevel);
    var unlockedRelics = xp_data[level - 1].unlockRelics;

    for(var i = 0; i < skills.length; i++){//update skills
      if(i < 5){//Prestige skill will not be updated automatically
        if(!skills[i].lastElementChild.firstElementChild.innerText.match(p.getTranslation("SKILLS"))){//if skill is equipped
          var skill_level = xp_data[level - 1].unlockSkillLevel["skill" + (i+1)];
          var img = skills[i].firstElementChild.firstElementChild;
          var slot_num = skills[i].lastElementChild.firstElementChild.id.slice(-1);
          var id = img.alt;
          var boost = parent.getBaseSkillById(id);
          if(typeof skill_level !== "undefined"){//if skilllevel is undefined set skill to level 1
            while (skill_level > boost.level)
              boost = parent.getSkillById(boost.upgradesTo);
          }
          img.alt = boost.id;
          skills[i].lastElementChild.lastElementChild.firstElementChild.innerText = typeof skill_level === "undefined" ? 1 : skill_level;
          //parent.replaceStr(boost);
          var slot = d.getElementById("SKILL_DESCRIPTION_" + slot_num);
          for(var ii = 0; ii < 3; ii++){
            if(typeof boost["effect" + (ii+1)] !== "undefined" && typeof boost["effect" + (ii+1)].uiName !== "undefined")
              slot.children[ii].innerHTML = boost["effect" + (ii+1)].uiName;
          }
        }
        if(skills[i].className.match("preview") && i < keys.length){
          skills[i].className = skills[i].className.replace(" preview", '');
        }
        else if(!skills[i].className.match("preview") && i >= keys.length){
          skills[i].className += " preview";
        }
      }
    }
    for(var i=0; i<relics.length; i++){
      if(relics[i].className.match("preview") && i < unlockedRelics)
        relics[i].className = relics[i].className.replace(" preview", '');
      else if(!relics[i].className.match("preview") && i >= unlockedRelics)
        relics[i].className += " preview";
    }
  }
  else{
    for(var i=0; i<skills.length; i++){
      if(skills[i].className.match("preview"))
        skills[i].className = skills[i].className.replace(" preview", '');
    }
    for(var i=0; i<relics.length; i++){
      if(relics[i].className.match("preview"))
        relics[i].className = relics[i].className.replace(" preview", '');
    }
  }
  applySkillsAndRelics();
  addTitanBuild2History();
}

function applyElementalDamage(type){
  var d = document;
  if(typeof type === "undefined")
    type = "TITAN";
  type = type.toUpperCase();
  if(type == "TROOP" || type == "SPELL")
    var dmg_img = d.getElementById(type + "_DAMAGE_TYPE");
  else
    var dmg_img = d.getElementById("DAMAGE_TYPE");
  var dmg_span = d.getElementById(type + "_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var element = dmg_img.alt.split(' ');
  element = parent.capital(element[element.length - 1]);
  var multiply = dmg_span.dataset["dmg" + element];
  if (typeof multiply !== "undefined" && multiply != '')
    multiply = parseInt(multiply);
  else
    multiply = 0;
  dmg_span.innerHTML = Math.floor(base_dmg * (1 + multiply/100));
  dmg_span.dataset.fdmg =         base_dmg * (1 + multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className += " cell_positive";
}

function removeElementalDamage(type){
  var d = document;
  if(typeof type === "undefined")
    type = "TITAN";
  type = type.toUpperCase();
  if(type == "TROOP" || type == "SPELL")
    var dmg_img = d.getElementById(type + "_DAMAGE_TYPE");    
  else
    var dmg_img = d.getElementById("DAMAGE_TYPE");
  var dmg_span = d.getElementById(type + "_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var element = dmg_img.alt.split(' ');
  element = parent.capital(element[element.length-1]);
  var multiply = dmg_span.dataset["dmg" + element];
  if (typeof multiply !== "undefined" && multiply != '')
    multiply = parseInt(multiply);
  else
    multiply = 0;
  dmg_span.innerHTML = Math.floor(base_dmg / (1 + multiply/100));
  dmg_span.dataset.fdmg =         base_dmg / (1 + multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className = dmg_span.parentElement.className.replace(" cell_positive", '');
}

function applyBaseDamage(type){
  var d = document;
  if(typeof type === "undefined")
      type = "TITAN";
  var dmg_span = d.getElementById(type.toUpperCase() + "_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = dmg_span.dataset["dmgAttackBase"];
  if (typeof multiply !== "undefined" && multiply != '')
    multiply = parseInt(multiply);
  else
    multiply = 0;
  dmg_span.innerHTML = Math.floor(base_dmg * (1 + multiply/100));
  dmg_span.dataset.fdmg =         base_dmg * (1 + multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className += " cell_positive";
}

function removeBaseDamage(type){
  var d = document;
  if(typeof type === "undefined")
      type = "TITAN";
  var dmg_span = d.getElementById(type.toUpperCase() + "_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = dmg_span.dataset["dmgAttackBase"];
  if (typeof multiply !== "undefined" && multiply != '')
    multiply = parseInt(multiply);
  else
    multiply = 0;
  dmg_span.innerHTML = Math.floor(base_dmg / (1 + multiply/100));
  dmg_span.dataset.fdmg =         base_dmg / (1 + multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className = dmg_span.parentElement.className.replace(" cell_positive", '');
}

function applyAttackDamageTitan(){
  var d = document;
  var titan = parent.getTitanById(d.getElementById("TITAN_NAME").dataset.id);
  var dmg_span = d.getElementById("TITAN_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = 0;
  var multiply_1 = dmg_span.dataset["dmg" + parent.capital(titan.archetype)];
  var multiply_2 = dmg_span.dataset['dmgAttack'];
  if(typeof multiply_1 !== "undefined" && multiply_1 != '')
    multiply += parseInt(multiply_1);
  if(typeof multiply_2 !== "undefined" && multiply_2 != '')
    multiply += parseInt(multiply_2);
  dmg_span.innerHTML = Math.floor(base_dmg*(1+multiply/100));
  dmg_span.dataset.fdmg =         base_dmg*(1+multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className += " cell_positive";
}

function removeAttackDamageTitan(){
  var d = document;
  var titan = parent.getTitanById(d.getElementById("TITAN_NAME").dataset.id);
  var dmg_span = d.getElementById('TITAN_DAMAGE_SPAN');
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = 0;
  var multiply_1 = dmg_span.dataset["dmg" + parent.capital(titan.archetype)];
  var multiply_2 = dmg_span.dataset['dmgAttack'];
  if(typeof multiply_1 !== "undefined" && multiply_1 != '')
    multiply += parseInt(multiply_1);
  if(typeof multiply_2 !== "undefined" && multiply_2 != '')
    multiply += parseInt(multiply_2);
  dmg_span.innerHTML = Math.floor(base_dmg/(1+multiply/100));
  dmg_span.dataset.fdmg =         base_dmg/(1+multiply/100);
  if(multiply > 0)
    dmg_span.parentElement.className = dmg_span.parentElement.className.replace(" cell_positive", '');
}

function applyAllSkillEffects(synergy = false){
  var d = document, p = parent;
  var skills = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  for(var i = 0; i < skills.length; i++)
    if(!skills[i].className.match("preview")){
      var invk_btn = d.getElementById("INVOKE_BUTTON_" + i);
      if (invk_btn != null)
        apply_invoke_counts(invk_btn, parseInt(invk_btn.dataset.value));
      applyStatBonusAbility("Skill", p.getSkillById(skills[i].firstElementChild.firstElementChild.alt));
    }
}
function applyAllRelicEffects(synergy = false){
  var d = document, p = parent;
  var relics = d.getElementById("TITAN_RELICS").getElementsByClassName("relic");
  for(var i=0; i<relics.length; i++)
    if(!relics[i].className.match("preview"))
      applyStatBonusAbility("Relic", p.getRelicById(relics[i].firstElementChild.firstElementChild.alt));
}

function applySkillsAndRelics(){
  //To correctly apply synergy bonus, we need to apply synergies first.
  addAllSynergies();
  applyAllSkillEffects();
  applyAllRelicEffects();
}

function removeAllSkillEffects(){
  var d = document, p = parent;
  var skills = d.getElementById("TITAN_SKILLS").getElementsByClassName("skill");
  for(var i = 0; i < skills.length; i++)
    if(!skills[i].className.match("preview")){
      var invk_btn = d.getElementById("INVOKE_BUTTON_" + i);
      if (invk_btn != null)
        remove_invoke_counts(invk_btn, parseInt(invk_btn.dataset.value));
      removeStatBonusAbility("Skill", p.getSkillById(skills[i].firstElementChild.firstElementChild.alt));
    }
}

function removeAllRelicEffects(){
  var d = document, p = parent;
  var relics = d.getElementById("TITAN_RELICS").getElementsByClassName("relic");
  for(var i=0; i<relics.length; i++)
    if(!relics[i].className.match("preview"))
      removeStatBonusAbility("Relic", p.getRelicById(relics[i].firstElementChild.firstElementChild.alt));
}

function removeSkillsAndRelics(){
  //To correctly remove synergy bonus, we need to remove relics+skills first.
  removeAllRelicEffects();
  removeAllSkillEffects();
  removeAllSynergies();
}



function addSynergy(effect, id, boost_name, slot_num){
  var d = document;
  var p = parent;
  var titan_id = d.getElementById("TITAN_NAME").dataset.id;
  var titan = p.getTitanById(titan_id);
  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  if(typeof effect !== "undefined"){
    if(effect.effect == "AUTOCAST_ABILITY"){
      //search for relic synergy bonus
      var auto_abl = p.getAutocastAbilityById(effect.specificTarget);
      if(typeof auto_abl.titanExclusive === "undefined" && typeof auto_abl.titanGroupInclude === "undefined" ||
         typeof auto_abl.titanExclusive !== "undefined" && auto_abl.titanExclusive.includes(titan_id) ||
         typeof auto_abl.titanGroupInclude !== "undefined" && typeof titan.troopGroup !== "undefined" &&
         titan.troopGroup == auto_abl.titanGroupInclude) {
        var auto_effects = auto_abl.abilities;
        for(var j = 0; j<auto_effects.length; j++){
          var trigger = auto_effects[j].trigger;
          var situation = typeof trigger.situation !== "undefined" && (trigger.situation == "ATTACK" && titan_mode == "ATK" || trigger.situation == "DEFEND" && titan_mode == "DEF");
          
          if(typeof trigger.situation === "undefined" || situation){
            if(trigger.type == "RELIC_EQUIPPED"){
              for(var k=0; k<auto_effects[j].actions.length; k++){
                var action = auto_effects[j].actions[k];
                if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                  _add_spoil_synergy(id, auto_effects[j].trigger.parameter +":"+ action.parameter);
                }
              }
            }
            else if(trigger.type == "BATTLE_START"){
              for(var k=0; k<auto_effects[j].actions.length; k++){
                var action = auto_effects[j].actions[k];
                if(action.action == "ADD_SPOIL_OVERRIDE"){
                  relic_synergies[action.parameter] = action.paramOverride;
                }
              }
            }
            else if(trigger.type == "RELIC_EQUIPPED_LEVEL" && boostIsEquipped("Relic", trigger.parameter)) {
              if(trigger.parameter == "EV_679_10"){
                //For Spartan show Spartan+ instead of Spartan when Synergy relic is equipped
                var troop_select = d.getElementById("TROOP_SELECT");
                troop_select.hideOption("PikemenSpartan");
                troop_select.showOption("PikemenSpartanUpgrade");
              } else {
                for(var k=0; k<auto_effects[j].actions.length; k++){
                  var action = auto_effects[j].actions[k];
                  if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                    _add_spoil_synergy(id, auto_effects[j].trigger.parameter +":"+ action.parameter);
                  }
                  if(action.action == "ADD_AUTOCAST"){
                    _add_autocast_synergy(action.parameter, boost_name, slot_num);
                  }
                }
              }
            }
            else if(trigger.type == "TITAN_PRESTIGED_LEVEL"){
              var prestige_level = d.getElementById("SKILL_LEVEL_SELECT_5");
              if(trigger.operator == "=" && prestige_level.value() == trigger.value){
                for(var k=0; k<auto_effects[j].actions.length; k++){
                  var action = auto_effects[j].actions[k];
                  if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                    _add_spoil_synergy(id, auto_effects[j].trigger.type +":"+ action.parameter);
                  }
                  if(action.action == "ADD_AUTOCAST"){
                    _add_autocast_synergy(action.parameter, boost_name, slot_num);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function _add_spoil_synergy(id, content){
  if(typeof skill_synergies[id] !== "undefined")
    skill_synergies[id] += ";" + content;
  else
    skill_synergies[id] = content;
}

function _add_autocast_synergy(id, boost_name, slot_num){
  var d = document;
  var p = parent;
  var autocast = p.getAutocastAbilityById(id);

  var invoke_counters = boost_name.getElementsByClassName("autocast_button");
  var found = false;
  for(var i=0; i<invoke_counters.length; i++){
    if(invoke_counters[i].dataset.autoabilityId == id){
      found = true;
      break;
    }
  }
  if(!found)
    add_invoke_counter_autocast(autocast, id, boost_name, slot_num);

  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var auto_effects = autocast.abilities;
  for(var i=0; i<auto_effects.length; i++){
    var trigger = auto_effects[i].trigger;
    if(trigger.type == "ON_ATTACK" && titan_mode == "ATK" ||
       trigger.type == "ON_DEFENSE" && titan_mode == "DEF"){
      if(!found)
        add_invoke_counter_autocast(autocast, id, boost_name, slot_num);
/*
      for(j=0; j<auto_effects[i].actions.length; j++){
        var action = auto_effects[i].actions[j];
        if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
          var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
          var spoil = p.getAutocastRelicById(param);
          applyStatBonusAbility("Relic", spoil);
        }
      }
*/
    }
  }

}

function removeSynergy(effect, id, boost_name, slot_num){
  var d = document;
  var p = parent;
  var titan_id = d.getElementById("TITAN_NAME").dataset.id;
  var titan = p.getTitanById(titan_id);
  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  if(typeof effect !== "undefined"){
    if(effect.effect == "AUTOCAST_ABILITY"){
        //search for relic synergy bonus
      var auto_abl = p.getAutocastAbilityById(effect.specificTarget);
      if(typeof auto_abl.titanExclusive === "undefined" && typeof auto_abl.titanGroupInclude === "undefined" ||
         typeof auto_abl.titanExclusive !== "undefined" && auto_abl.titanExclusive.includes(titan_id) ||
         typeof auto_abl.titanGroupInclude !== "undefined" && typeof titan.troopGroup !== "undefined" &&
         titan.troopGroup == auto_abl.titanGroupInclude) {
        var auto_effects = auto_abl.abilities;
        for(var j = 0; j<auto_effects.length; j++){
          var trigger = auto_effects[j].trigger;
          var situation = typeof trigger.situation !== "undefined" && (trigger.situation == "ATTACK" && titan_mode == "ATK" || trigger.situation == "DEFEND" && titan_mode == "DEF");
          if(typeof trigger.situation === "undefined" || situation){
            if(trigger.type == "RELIC_EQUIPPED"){
              for(var k=0; k<auto_effects[j].actions.length; k++){
                var action = auto_effects[j].actions[k];
                if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined"))
                  if(id in skill_synergies)
                    delete skill_synergies[id];
              }
            }
            else if(trigger.type == "BATTLE_START"){
              for(var k=0; k<auto_effects[j].actions.length; k++){
                var action = auto_effects[j].actions[k];
                if(action.action == "ADD_SPOIL_OVERRIDE"){
                  if(action.parameter in relic_synergies){
                    delete relic_synergies[action.parameter];
                  }
                }
              }
            }
            else if(trigger.type == "RELIC_EQUIPPED_LEVEL" && boostIsEquipped("Relic", trigger.parameter)) {
              if(trigger.parameter == "EV_679_10"){
                //hide Spartan+ when relic is removed
                var troop_select = d.getElementById("TROOP_SELECT");
                troop_select.showOption("PikemenSpartan");
                troop_select.hideOption("PikemenSpartanUpgrade");
              } else {
                for(var k=0; k<auto_effects[j].actions.length; k++){
                  var action = auto_effects[j].actions[k];
                  if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined"))
                    if(id in skill_synergies)
                      delete skill_synergies[id];
                }
                if(action.action == "ADD_AUTOCAST"){
                  _rm_autocast_synergy(action.parameter, boost_name, slot_num);
                }
              }
            }
            else if(trigger.type == "TITAN_PRESTIGED_LEVEL"){
              var prestige_level = d.getElementById("SKILL_LEVEL_SELECT_5");
              if(trigger.operator == "=" && prestige_level.value() == trigger.value){
                for(var k=0; k<auto_effects[j].actions.length; k++){
                  var action = auto_effects[j].actions[k];
                  if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                    if(id in skill_synergies)
                      delete skill_synergies[id];
                  }
                  if(action.action == "ADD_AUTOCAST"){
                    _rm_autocast_synergy(action.parameter, boost_name, slot_num);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function _rm_autocast_synergy(id, boost_name, slot_num){
  var d = document;
  var p = parent;
  var autocast = p.getAutocastAbilityById(id);

  var invoke_counters = boost_name.getElementsByClassName("autocast_button");
  var found = false;
  for(var i=0; i<invoke_counters.length; i++){
    if(invoke_counters[i].dataset.autoabilityId == id){
      found = true;
      break;
    }
  }
  if(found)
    remove_invoke_counter_autocast(autocast, id, boost_name, slot_num);
  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var auto_effects = autocast.abilities;
  for(var i=0; i<auto_effects.length; i++){
    var trigger = auto_effects[i].trigger;
    if(trigger.type == "ON_ATTACK" && titan_mode == "ATK" ||
       trigger.type == "ON_DEFENSE" && titan_mode == "DEF"){
      if(!found)
        remove_invoke_counter_autocast(autocast, id, boost_name, slot_num);
/*
      for(var j=0; j<auto_effects[i].actions.length; j++){
        var action = auto_effects[i].actions[j];
        if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
          var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
          var spoil = p.getAutocastRelicById(param);
          removeStatBonusAbility("Relic", spoil);
        }
      }
*/
    }
  }
}

function addSynergies(type, boost, boost_name, slot_num){
  if(typeof boost === "undefined")
    return;
  var i = 1, j = 1;
  while(typeof boost["effect"+(i)] !== "undefined"){
    var effect = boost["effect" + (i)];
    addSynergy(effect, boost.id, boost_name, slot_num);
    i++;
  }
}

function removeSynergies(type, boost, boost_name, slot_num){
  if(typeof boost === "undefined")
    return;
  var i = 1, j = 1;
  while(typeof boost["effect"+(i)] !== "undefined"){
    var effect = boost["effect" + (i)];
    removeSynergy(effect, boost.id, boost_name, slot_num);
    i++;
  }
}

function addBoostSynergies(type){
  var d = document, p = parent;
  var boosts = d.getElementById("TITAN_"+ type.toUpperCase() +"S").getElementsByClassName(type.toLowerCase());
  for(var i=0; i<boosts.length; i++)
    if(!boosts[i].className.match("preview")){
      var boost_name = boosts[i].lastElementChild.firstElementChild;
      addSynergies(type, p["get" +type+ "ById"](boosts[i].firstElementChild.firstElementChild.alt), boost_name, i);
    }
}


function addAllSynergies(){
  addBoostSynergies("Skill");
  addBoostSynergies("Relic");
}

function removeBoostSynergies(type){
  var d = document, p = parent;
  var boosts = d.getElementById("TITAN_"+ type.toUpperCase() +"S").getElementsByClassName(type.toLowerCase());
  for(var i = 0; i < boosts.length; i++)
    if(!boosts[i].className.match("preview")){
      var boost_name = boosts[i].lastElementChild.firstElementChild;
      removeSynergies(type, p["get" +type+ "ById"](boosts[i].firstElementChild.firstElementChild.alt), boost_name, i);
    }
}

function removeAllSynergies(){
  removeBoostSynergies("Skill");
  removeBoostSynergies("Relic");
}

function boostIsEquipped(type, boost_id){
  var d = document, p = parent;
  var boosts = d.getElementById("TITAN_"+type.toUpperCase()+"S").getElementsByClassName(type.toLowerCase());
  for(var i=0; i<boosts.length; i++){
    var boost = boosts[i];
    if(!boost.className.match("preview") && boost.firstElementChild.firstElementChild.alt == boost_id)
      return true
  }
  return false
}

function applyStatBonusAbility(type, boost){
  if(typeof boost === "undefined")
    return;
  var i = 1, j = 1;
  while(typeof boost["effect"+(i)] !== "undefined"){
    var effect = boost["effect" + (i)];
    applyAbilityEffect(type, effect);
    i++;
  }
  applySynergyBonusEffect(boost.id);
}

function removeStatBonusAbility(type, boost){
  if(typeof boost === "undefined")
    return;
  var i = 1, j = 1;
  while(typeof boost["effect"+(i)] !== "undefined"){
    var effect = boost["effect" + (i)];
    removeAbilityEffect(type, effect);
    i++;
  }
  removeSynergyEffect(boost.id);
}

function applySynergyBonusEffect(id){
  var synergies = Object.keys(skill_synergies);
  for(var i=0; i<synergies.length; i++){
    var syn_relics = skill_synergies[synergies[i]].split(";");
    var relic_id = id;
    for(var k=0; k<syn_relics.length; k++){
      var syn_value = syn_relics[k].split(":");
      var syn_id = syn_value[0];
      if(syn_id == "TITAN_PRESTIGED_LEVEL"){
        syn_id = synergies[i];
        syn_id = syn_id.split("_");
        syn_id = syn_id[0] +"_"+ syn_id[1];
        relic_id = relic_id.split("_");
        relic_id = relic_id[0] +"_"+ relic_id[1];
      }
      else if(syn_id.split("_").length == 2){
        relic_id = relic_id.split("_");
        relic_id = relic_id[0] +"_"+ relic_id[1];
      }
      if(relic_id == syn_id){
        var auto_relic = parent.getAutocastRelicById(syn_value[1]);
        var j = 1;
        while(typeof auto_relic["effect"+j] !== "undefined"){
          applyAbilityEffect("Relic", auto_relic["effect"+j]);
          j++;
        }
      }
    }
  }
}

function removeSynergyEffect(id){
  var synergies = Object.keys(skill_synergies);
  for(var i = 0; i<synergies.length; i++){
    var syn_relics = skill_synergies[synergies[i]].split(";");
    var relic_id = id;
    for(var k=0; k<syn_relics.length; k++){
      var syn_value = syn_relics[k].split(":");
      var syn_id = syn_value[0];
      if(syn_id == "TITAN_PRESTIGED_LEVEL"){
        syn_id = synergies[i];
        syn_id = syn_id.split("_");
        syn_id = syn_id[0] +"_"+ syn_id[1];
        relic_id = relic_id.split("_");
        relic_id = relic_id[0] +"_"+ relic_id[1];
      }
      else if(syn_id.split("_").length == 2){
        relic_id = relic_id.split("_");
        relic_id = relic_id[0] +"_"+ relic_id[1];
      }
      if(relic_id == syn_id){
        var auto_relic = parent.getAutocastRelicById(syn_value[1]);
        var j = 1;
        while(typeof auto_relic["effect"+j] !== "undefined"){
          removeAbilityEffect("Relic", auto_relic["effect"+j]);
          j++;
        }
      }
    }
  }
}

function applyAbilityEffect(type, ability){
  var d = document;
  var p = parent;
  var titan_level = d.getElementById("CURRENT_LV").innerHTML;
  var titan_id = d.getElementById("TITAN_NAME").dataset.id;
  var base_titan = parent.getTitanById(titan_id);
  var archetype = p.capital(base_titan.archetype);//for relics like falchion and rapier
  var titan = parent.getTitanById(titan_id + ((titan_level == 1)? '' : titan_level) );
  var base_titan_health = Math.floor(titan.health);
  if(typeof titan.rangedDamage !== "undefined"){
    var tmp = titan;
    while(typeof tmp.secondsPerRangedAttack === "undefined") tmp = parent.getTitanById(tmp["extends"]);
    var sec_per_attack = tmp.secondsPerRangedAttack;
  }

  var troop_select = d.getElementById("TROOP_SELECT");
  var troop_level_select = d.getElementById("TROOP_LEVEL_SELECT");
  var troop_id = troop_level_select.dataset.troopId;
  var troop_level = troop_level_select.value();
  var base_troop = p.getTroopById(troop_id);
  var troop_is_titan = false;
  if(typeof(base_troop.archetype) !== "undefined" || base_troop.extends == "Hero"){
    base_troop = p.getTitanById(base_troop["extends"]);
    troop_is_titan = true;
  }
  var troop_variant = typeof base_troop.troopVariant !== "undefined" ? base_troop.troopVariant : troop_id;
  var troop = p.getTroopById(troop_id + (troop_level == 1 ? '' : troop_level)), summon_troop = undefined;
  var base_troop_health = troop.health;
  var omegaTroop = d.getElementById("TROOP_OMEGA").firstElementChild.value;
  var corruptedTroop = d.getElementById("TROOP_CORRUPTED").firstElementChild.value;
  var is_summon = omegaTroop == "enabled" || corruptedTroop == "enabled";
  var is_omega = omegaTroop == "enabled";
  var is_corrupted = corruptedTroop == "enabled";
  var tmp = base_troop;
  while(typeof tmp.headCount === "undefined")
    tmp = p.getTroopById(tmp.extends)
  var headCount = tmp.headCount;
  if(troop_id == "Skeleton") headCount = 80;
  if(is_summon){
    if(omegaTroop == "enabled")
      var summon_id = p.getUnitOverrideId(troop_id, "OMEGA_TROOP");
    else if(corruptedTroop == "enabled")
      var summon_id = p.getUnitOverrideId(troop_id, "CORRUPTED");
    var summon_troop = p.getTroopById(summon_id + (troop_level == 1 ? '' : troop_level));
    var default_summon_troop = p.getTroopById(summon_id);
    if(typeof summon_troop.health !== "undefined"){
      base_troop_health = summon_troop.health;
    }
    if(typeof summon_troop.headCount !== "undefined"){
      headCount = summon_troop.headCount;
    }
    else if(typeof default_summon_troop.headCount !== "undefined"){
      headCount = default_summon_troop.headCount;
    }
  }

  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var spell_level_select = d.getElementById('SPELL_LEVEL_SELECT');
  var spell_level = spell_level_select.value();
  var base_spell = parent.getSpell(spell_level_select.dataset.spellId);
  var spell = parent.getSpell(spell_level_select.dataset.spellId + (spell_level == 1 ? '' : spell_level));

  if(typeof ability !== "undefined"){
    //apply auto cast ability - sperate from other abilities because the
    if(ability.effect == "AUTOCAST_ABILITY"){
      var cast_ability = parent.getAutocastAbilityById(ability.specificTarget);

      if(typeof cast_ability.titanExclusive === "undefined" && typeof cast_ability.titanGroupInclude === "undefined" ||
         typeof cast_ability.titanExclusive !== "undefined" && cast_ability.titanExclusive.includes(titan_id) ||
         typeof cast_ability.titanGroupInclude !== "undefined" && typeof base_titan.troopGroup !== "undefined" &&
         base_titan.troopGroup == cast_ability.titanGroupInclude) {
        var cast_effects = cast_ability.abilities;
        var relic_set_equipped = false;
        for(var i=0; i<cast_effects.length; i++){
          var cast_effect = cast_effects[i];
          if (typeof(cast_effect.trigger.limit) !== "undefined")
            var ability_limit = cast_effect.trigger.limit;
          else
            var ability_limit = 1;
          if(cast_effect.trigger.type == "ON_ATTACK" && titan_mode == "ATK" ||
             cast_effect.trigger.type == "ON_DEFENSE" && titan_mode == "DEF"){
            for(var j=0; j<cast_effect.actions.length; j++){
              var action = cast_effect.actions[j];
              if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
                var spoil = p.getAutocastRelicById(param);
                applyStatBonusAbility("Relic", spoil);
              }
            }
          } else if(cast_effect.trigger.type == "BATTLE_START"){
            for(var j=0; j<cast_effect.actions.length; j++){
              var action = cast_effect.actions[j];
              if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
                var spoil = p.getAutocastRelicById(param);
                applyStatBonusAbility("Relic", spoil);
              }
            }
          } else if(cast_effect.trigger.type == "RELIC_SET_LEVEL"){
            var all_relics_equipped = true;
            for(var j=0; j<cast_effect.trigger.argumentList.length; j++){
              var argument = cast_effect.trigger.argumentList[j];
              if(!boostIsEquipped("Relic", argument)){
                all_relics_equipped = false;
                break;
              }
            }
            if(all_relics_equipped && !relic_set_equipped){
              relic_set_equipped = true;
              if(p.arrayCompare(cast_effect.trigger.argumentList, nexus_complete_set)){
                //Nexus Corrupted Titans are replaced by CorruptedRaid versions
                troop_select.hideOption("CorruptedAres");
                troop_select.hideOption("CorruptedKorthan");
                troop_select.hideOption("CorruptedNecromancer");
                troop_select.hideOption("CorruptedOsiris");
                troop_select.hideOption("CorruptedThor");
                troop_select.hideOption("CorruptedZabava");
                troop_select.hideOption("CorruptedZeus");
                troop_select.showOption("CorruptedAresRaid");
                troop_select.showOption("CorruptedKorthanRaid");
                troop_select.showOption("CorruptedNecromancerRaid");
                troop_select.showOption("CorruptedOsirisRaid");
                troop_select.showOption("CorruptedThorRaid");
                troop_select.showOption("CorruptedZabavaRaid");
                troop_select.showOption("CorruptedZeusRaid");
              } else if(p.arrayCompare(cast_effect.trigger.argumentList, zeus_complete_set)){
                //Zeus Blessed Titans are replaced by BlessedRaid versions
                troop_select.hideOption("BlessedArtemis");
                troop_select.hideOption("BlessedGaia");
                troop_select.hideOption("BlessedHeracles");
                troop_select.hideOption("BlessedKronos");
                troop_select.hideOption("BlessedMinotaur");
                troop_select.hideOption("BlessedOceanus");
                troop_select.hideOption("BlessedUranus");
                troop_select.showOption("BlessedArtemisRaid");
                troop_select.showOption("BlessedGaiaRaid");
                troop_select.showOption("BlessedHeraclesRaid");
                troop_select.showOption("BlessedKronosRaid");
                troop_select.showOption("BlessedMinotaurRaid");
                troop_select.showOption("BlessedOceanusRaid");
                troop_select.showOption("BlessedUranusRaid");
              } else {

              }
              //break;
            }
          }
        }
      }
      return;
    }

    if(ability.target == "ALL_HEROES" || ability.target == "SPECIFIC_ARCHETYPE"
    || ability.target == "ALL_UNITS" ){
      var dmg_span = d.getElementById("TITAN_DAMAGE_SPAN");
      removeAttackDamageTitan();
      removeElementalDamage();
      removeBaseDamage();
      if(ability.effect == "DAMAGE_TYPE" && type == "Relic"){//change damage typenjnj
        var dmg_img = d.getElementById("DAMAGE_TYPE");
        var dmg_img_2 = d.getElementById("TITAN_DAMAGE_TYPE_2");
        dmg_img.alt += ' ' + ability.value;
        if(dmg_img.title.split(' ')[0] != ability.value){
          dmg_img.src = "./images/elements/" + ability.value + ".png";
          dmg_img_2.src = "./images/elements/" + ability.value + ".png";
          dmg_img.title = ability.value + " Damage";
          dmg_img_2.title = ability.value + " Damage";
        }
      }
      var val = ability.value;
      if(typeof val == "string")
        val = parseInt(val.split(':')[1]);
      if(ability.effect.match(/(ARMOUR)/))//Exceptions for neg values: Armour
        val = val - 100;
      else if(100 - val < 0)
        val = val - 100;
      else
        val = 100 - val;

      if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"
      || ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"
      || ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
        if(typeof ability.value == "string")
          var element = parent.capital(ability.value.split(':')[0]);
        else
          var element = parent.capital(ability.effect.split('_')[1]);
        if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
          var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
          for(var a = 0; a < arr.length; a++){
            if(typeof dmg_span.dataset["dmg" + arr[a]] === "undefined") dmg_span.dataset["dmg" + arr[a]] = '';
            var old_value = dmg_span.dataset["dmg" + arr[a]];
            dmg_span.dataset["dmg" + arr[a]] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
        }
        else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"){
          if(typeof dmg_span.dataset["dmg" + element] === "undefined") dmg_span.dataset["dmg" + element] = '';
          var old_value = dmg_span.dataset["dmg" + element];
          dmg_span.dataset["dmg" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
        }
        else if(ability.effect == "DAMAGE_TYPE_RESIST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
          var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
          for(var a = 0; a < arr.length; a++){
            if(typeof dmg_span.dataset["res" + arr[a]] === "undefined") dmg_span.dataset["res" + arr[a]] = '';
            var old_value = dmg_span.dataset["res" + arr[a]];
            dmg_span.dataset["res" + arr[a]] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
        }
        else if(ability.effect == "DAMAGE_TYPE_RESIST" /*&& element != 'ALL_ELEMENTAL_TYPES'*/ || ability.effect == "UNIT_TYPE_DAMAGE_RESIST"){
          if(typeof dmg_span.dataset["res" + element] === "undefined") dmg_span.dataset["res" + element] = '';
          var old_value = dmg_span.dataset["res" + element];
          dmg_span.dataset["res" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
        }
        else if(ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
          if(typeof dmg_span.dataset["res" + element] === "undefined") dmg_span.dataset["res" + element] = '';
          var old_value = dmg_span.dataset["res" + element];
          dmg_span.dataset["res" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
        }
      }

      var cells = d.getElementById('TITAN_STATS').getElementsByClassName("stats_cell");
      for(var k = 0, len = cells.length; k < len; k=k+2){
        if(cells[k].id == "TITAN_HP"){
          if(ability.effect == "HEALTH_BASE"){
            if(typeof cells[k+1].dataset.healthBase === "undefined") cells[k+1].dataset.healthBase = '';
            if(typeof cells[k+1].dataset.health === "undefined") cells[k+1].dataset.health = '';
            var old_value = cells[k+1].dataset.healthBase;
            var healthBoost = cells[k+1].dataset.health
            cells[k+1].dataset.healthBase = (old_value != '' ?  parseInt(old_value) : "")  + val;
            var boostedBaseHealth = base_titan_health * (1+parseInt(cells[k+1].dataset.healthBase)/100)
            if(healthBoost != '')
              cells[k+1].innerText = Math.floor(boostedBaseHealth * (1+parseInt(healthBoost)/100));
            else
              cells[k+1].innerText = Math.floor(boostedBaseHealth);
            cells[k+1].className += " cell_positive";
          }
          if(ability.effect == "HEALTH"){
            if(typeof cells[k+1].dataset.healthBase === "undefined") cells[k+1].dataset.healthBase = '';
            if(typeof cells[k+1].dataset.health === "undefined") cells[k+1].dataset.health = '';
            var old_value = cells[k+1].dataset.health;
            var healthBaseBoost = cells[k+1].dataset.healthBase
            cells[k+1].dataset.health = (old_value != '' ?  parseInt(old_value) : "")  + val;
            if(healthBaseBoost != '')
              var boostedBaseHealth = base_titan_health * (1 + parseInt(healthBaseBoost)/100)
            else
              var boostedBaseHealth = base_titan_health
            cells[k+1].innerText = Math.floor(boostedBaseHealth * (1+parseInt(cells[k+1].dataset.health)/100));
            cells[k+1].className += " cell_positive";
          }
        }//relics like falchion and rapier
        else if(cells[k].id == "TITAN_DAMAGE"){
          if(ability.effect == "ATTACK"){
            if(typeof ability.specificTarget !== "undefined" && parent.capital(ability.specificTarget) == archetype){
              if(typeof dmg_span.dataset["dmg" + archetype] === "undefined") dmg_span.dataset["dmg" + archetype] = '';
              var old_value = dmg_span.dataset["dmg" + archetype];
              dmg_span.dataset["dmg" + archetype] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
            else if(typeof ability.specificTarget === "undefined"){
              if(typeof dmg_span.dataset['dmgAttack'] === "undefined") dmg_span.dataset['dmgAttack'] = '';
              var old_value = dmg_span.dataset['dmgAttack'];
              dmg_span.dataset['dmgAttack'] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
          }
          if(ability.effect == "ATTACK_BASE"){
            if(typeof dmg_span.dataset["dmgAttackBase"] === "undefined") dmg_span.dataset["dmgAttackBase"] = '';
            var old_value = dmg_span.dataset["dmgAttackBase"];
            dmg_span.dataset["dmgAttackBase"] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
        }
        else if(ability.effect == "ARMOUR" && cells[k].id == "TITAN_ARMOR"){
          if(typeof cells[k+1].dataset.armour === "undefined") cells[k+1].dataset.armour = '';
          var old_value = cells[k+1].dataset.armour;
          cells[k+1].dataset.armour = (old_value != '' ?  parseInt(old_value) : "")  + val;
          cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
          cells[k+1].className += " cell_positive";
        }
        else if(ability.effect == "ARMOUR_PIERCE" && cells[k].id == "TITAN_ARMOR_PIERCING"){
          if(typeof cells[k+1].dataset.armourPierce === "undefined") cells[k+1].dataset.armourPierce = '';
          var old_value = cells[k+1].dataset.armourPierce;
          cells[k+1].dataset.armourPierce = (old_value != '' ?  parseInt(old_value) : "")  + val;
          cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
          cells[k+1].className += " cell_positive";
        }
        else if(ability.effect == "CRITICAL_RATE_BOOST" && cells[k].id == "TITAN_CRITICAL"){
          if(typeof cells[k+1].dataset.critical === "undefined") cells[k+1].dataset.critical = '';
          var old_value = cells[k+1].dataset.critical;
          cells[k+1].dataset.critical = (old_value != '' ?  parseInt(old_value) : "")  + val;
          cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
          cells[k+1].className += " cell_positive";
        }
      }
      applyBaseDamage();
      applyElementalDamage();
      applyAttackDamageTitan();
    }
    
    //Troop effects
    if( ability.target == "SPECIFIC_UNIT"
    || ability.target == "SPECIFIC_SUMMON_UNIT" && is_summon
    || ability.target == "TROOP_GROUP" && is_summon
    || ability.target == "ALL_SUMMONS" && is_omega
    || ability.target == "ALL_HEROES" && troop_is_titan
    || ability.target == "ALL_UNITS"
    || ability.target == "ARMY" && !troop_is_titan){
      var dmg_span = d.getElementById('TROOP_DAMAGE_SPAN');
      removeAttackDamageTroop();
      removeElementalDamage("Troop");
      removeBaseDamage("Troop");
      if(ability.target == "ALL_UNITS"
         || ability.target == "ARMY" && !troop_is_titan
         || is_omega && ability.target == "ALL_SUMMONS" // ALL OMEGA
         || is_omega && ability.specificTarget.match("Summon") && ability.specificTarget.replace("Summon", '') == troop_id
         || is_corrupted && (ability.specificTarget.match("Raid") &&
                             ability.specificTarget.replace("SkeletonRaid", "SkeletonHorde").replace("Raid",'') == troop_id ||
                             ability.specificTarget == "Corrupted")
         || ability.target == "ALL_HEROES" && troop_is_titan // Buff titan in troop table
         || ability.specificTarget == troop_id //Buff targets the exact unit
         || ability.specificTarget == troop_variant){ //Buff targets a troop variant -> Eg. Mossmane buffs apply on corrupted
      //only remove damage change if troops ID match
        if(ability.effect == "DAMAGE_TYPE"){
          var dmg_img = d.getElementById("TROOP_DAMAGE_TYPE");
          dmg_img.alt += ' ' + ability.value;
          if(dmg_img.title.split(' ')[0] != ability.value){
            dmg_img.src = "./images/elements/" + ability.value + ".png";
            dmg_img.title = ability.value + " Damage";
          }
        }
        var val = ability.value;
        if(typeof val == "string")
          val = parseInt(val.split(':')[1]);
        if(ability.effect.match(/(ARMOUR)/))//Exceptions for neg values: Armour
          val = val - 100;
        else if(100 - val < 0)
          val = val - 100;
        else
          val = 100 - val;

        if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"
        || ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"
        || ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
          var dmg_img = d.getElementById("TROOP_DAMAGE_TYPE");
          if(typeof ability.value == "string")
            var element = parent.capital(ability.value.split(':')[0]);
          else
            var element = parent.capital(ability.effect.split('_')[1]);
          if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
            for(var a = 0; a < arr.length; a++){
              if(typeof dmg_span.dataset["dmg" + arr[a]] === "undefined") dmg_span.dataset["dmg" + arr[a]] = '';
              var old_value = dmg_span.dataset["dmg" + arr[a]];
              dmg_span.dataset["dmg" + arr[a]] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"){
            if(typeof dmg_span.dataset["dmg" + element] === "undefined") dmg_span.dataset["dmg" + element] = '';
            var old_value = dmg_span.dataset["dmg" + element];
            dmg_span.dataset["dmg" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
          else if(ability.effect == "DAMAGE_TYPE_RESIST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
            for(var a = 0; a < arr.length; a++){
              if(typeof dmg_span.dataset["res" + arr[a]] === "undefined") dmg_span.dataset["res" + arr[a]] = '';
              var old_value = dmg_span.dataset["res" + arr[a]];
              dmg_span.dataset["res" + arr[a]] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"){
            if(typeof dmg_span.dataset["res" + element] === "undefined") dmg_span.dataset["res" + element] = '';
            var old_value = dmg_span.dataset["res" + element];
            dmg_span.dataset["res" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
          else if(ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
            if(typeof dmg_span.dataset["res" + element] === "undefined") dmg_span.dataset["res" + element] = '';
            var old_value = dmg_span.dataset["res" + element];
            dmg_span.dataset["res" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
        }

        var cells = d.getElementById("TROOP_STATS").getElementsByClassName("stats_cell");
        for(var k = 0, len = cells.length; k < len; k=k+2){
          if(cells[k].id == "TROOP_HP"){
            if(ability.effect == "HEALTH_BASE"){
              if(typeof cells[k+1].dataset.healthBase === "undefined") cells[k+1].dataset.healthBase = '';
              if(typeof cells[k+1].dataset.health === "undefined") cells[k+1].dataset.health = '';
              var old_value = cells[k+1].dataset.healthBase;
              var healthBoost = cells[k+1].dataset.health
              cells[k+1].dataset.healthBase = (old_value != '' ?  parseInt(old_value) : "")  + val;
              var boostedBaseHealth = base_troop_health * (1+parseInt(cells[k+1].dataset.healthBase)/100)
              if(healthBoost != ''){
                cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount) * (1+healthBoost/100));
                if(localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled" && headCount > 1)
                  cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth * (1+healthBoost/100)) +")";
              }
              else{
                cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount));
                if(localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled" && headCount > 1)
                  cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth) +")";
              }
              cells[k+1].className += " cell_positive";
            }
            if(ability.effect == "HEALTH"){
              if(typeof cells[k+1].dataset.healthBase === "undefined") cells[k+1].dataset.healthBase = '';
              if(typeof cells[k+1].dataset.health === "undefined") cells[k+1].dataset.health = '';
              var old_value = cells[k+1].dataset.health;
              var healthBaseBoost = cells[k+1].dataset.healthBase
              cells[k+1].dataset.health = (old_value != '' ?  parseInt(old_value) : "")  + val;
              if(healthBaseBoost != '')
                var boostedBaseHealth = base_troop_health * (1 + parseInt(healthBaseBoost)/100)
              else
                var boostedBaseHealth = base_troop_health
              cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount) * (1+cells[k+1].dataset.health/100));
              if(localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled" && headCount > 1)
                cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth * (1+cells[k+1].dataset.health/100)) +")";
              cells[k+1].className += " cell_positive";
            }
          }
          else if(cells[k].id == "TROOP_DAMAGE"){
            if(ability.effect == "ATTACK"){
              if(typeof dmg_span.dataset['dmgAttack'] === "undefined") dmg_span.dataset['dmgAttack'] = '';
              var old_value = dmg_span.dataset['dmgAttack'];
              dmg_span.dataset['dmgAttack'] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
            if(ability.effect == "ATTACK_BASE"){
              if(typeof dmg_span.dataset['dmgAttackBase'] === "undefined") dmg_span.dataset['dmgAttackBase'] = '';
              var old_value = dmg_span.dataset['dmgAttackBase'];
              dmg_span.dataset['dmgAttackBase'] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
          }
          else if(ability.effect == "ARMOUR" && cells[k].id == "TROOP_ARMOR"){
            if(typeof cells[k+1].dataset.armour === "undefined") cells[k+1].dataset.armour = '';
            var old_value = cells[k+1].dataset.armour;
            cells[k+1].dataset.armour = (old_value != '' ?  parseInt(old_value) : "")  + val;
            cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
            cells[k+1].className += " cell_positive";
          }
          else if(ability.effect == "ARMOUR_PIERCE" && cells[k].id == "TROOP_ARMOR_PIERCING"){
            if(typeof cells[k+1].dataset.armourPierce === "undefined") cells[k+1].dataset.armourPierce = '';
            var old_value = cells[k+1].dataset.armourPierce;
            cells[k+1].dataset.armourPierce = (old_value != '' ?  parseInt(old_value) : "")  + val;
            cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
            cells[k+1].className += " cell_positive";
          }
          else if(ability.effect == "CRITICAL_RATE_BOOST" && cells[k].id == "TROOP_CRITICAL"){
            if(typeof cells[k+1].dataset.critical === "undefined") cells[k+1].dataset.critical = '';
            var old_value = cells[k+1].dataset.critical;
            cells[k+1].dataset.critical = (old_value != '' ?  parseInt(old_value) : "")  + val;
            cells[k+1].innerText = Math.round(parseFloat(cells[k+1].innerText.slice(0,-1)) + val) + '%';
            cells[k+1].className += " cell_positive";
          }
        }
      }
      applyBaseDamage("Troop")
      applyElementalDamage("Troop");
      applyAttackDamageTroop();
    }
    //Spell effects
    if(ability.target == "ALL_SPELLS" || ability.target == "SPECIFIC_SPELL"){
      var dmg_span = d.getElementById('SPELL_DAMAGE_SPAN');
      if(typeof ability.specificTarget === "undefined" || ability.specificTarget == spell_level_select.dataset.spellId){
        var val = ability.value;
        if(typeof val == "string")
          val = parseInt(val.split(':')[1]);
        if(100 - val < 0)
          val = val - 100;
        //don't affect quantity and gain spell
        else if(ability.effect == "QUANTITY_BOOST");
        else if(ability.effect == "RADIUS_BOOST")//Allow negative radius boost
          val -= 100;
        else
          val = 100 - val;

        if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "RESIST_ALL"){
          var dmg_img = d.getElementById("SPELL_DAMAGE_TYPE");
          if(typeof ability.value == "string")
            var element = parent.capital(ability.value.split(':')[0]);
          else
            var element = parent.capital(ability.effect.split('_')[1]);
          removeElementalDamage("Spell");
          if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze", "Acid", "Hp", "Fire", "Lightning", "Void"]; // "Earth" -Shield is not buffed by damage
            for(var a = 0; a < arr.length; a++){
              if(typeof dmg_span.dataset["dmg" + arr[a]] === "undefined") dmg_span.dataset["dmg" + arr[a]] = '';
              var old_value = dmg_span.dataset["dmg" + arr[a]];
              dmg_span.dataset["dmg" + arr[a]] = (old_value != '' ?  parseInt(old_value) : "")  + val;
            }
          } else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "RESIST_ALL"){
              if(ability.effect == "RESIST_ALL")//resist all is for shield spells and increased the absorbed damage
                  element = "Earth";
              if(typeof dmg_span.dataset["dmg" + element] === "undefined") dmg_span.dataset["dmg" + element] = '';
                var old_value = dmg_span.dataset["dmg" + element];
                dmg_span.dataset["dmg" + element] = (old_value != '' ?  parseInt(old_value) : "")  + val;
          }
          applyElementalDamage("Spell");
        }
        var cells = d.getElementById("SPELL_STATS").getElementsByClassName("stats_cell");
        for(var k = 0, len = cells.length; k < len; k=k+2){
          if(ability.effect == "RADIUS_BOOST" && cells[k].id == "SPELL_RADIUS"){
            if(typeof cells[k+1].dataset.radius === "undefined") cells[k+1].dataset.radius = '';
            var old_value = cells[k+1].dataset.radius;
            cells[k+1].dataset.radius = (old_value != '' ?  parseInt(old_value) : "")  + val;
            cells[k+1].innerText = parseFloat(cells[k+1].innerText) * (1 + val/100).toFixed(2);
            cells[k+1].className += " cell_positive";
          }
          else if(ability.effect == "DURATION_BOOST" && cells[k].id == "SPELL_DURATION"){
            if(typeof cells[k+1].dataset.duration === "undefined") cells[k+1].dataset.duration = '';
            var old_value = cells[k+1].dataset.duration;
            var new_value = (old_value != '' ?  parseInt(old_value) : old_value)+ val;
            cells[k+1].dataset.duration = new_value;
            if(cells[k+1].dataset.duration == 0)
              cells[k+1].dataset.duration = "";
            cells[k+1].innerText = parseFloat(cells[k+1].dataset.baseDuration) * (1 + new_value/100);
            cells[k+1].className += " cell_positive";
          }
          else if(ability.effect == "QUANTITY_BOOST" && cells[k].id == "SPELL_DAMAGE"){
            if(typeof dmg_span.dataset.quantity === "undefined") dmg_span.dataset.quantity = '';
            var old_value = dmg_span.dataset.quantity;
            dmg_span.dataset.quantity = (old_value != '' ?  parseInt(old_value) : "")  + val;
            var tmpVal = dmg_span.dataset.quantity;
            removeElementalDamage("Spell");
            if(typeof spell.spellVar !== "undefined"){
              if(typeof spell.spellVar.NumStrikes !== "undefined" || typeof base_spell.spellVar.NumStrikes !== "undefined"){//LightningStorm + Lightning
                tmpVal = ((typeof spell.spellVar.NumStrikes !== "undefined" ? spell.spellVar.NumStrikes : base_spell.spellVar.NumStrikes) + (tmpVal == '' ? 0 : parseInt(tmpVal)))
                      * spell.spellVar.missile.damageSpec.damage;
              }
              else if(typeof spell.spellVar.numStrikeSizes !== "undefined"){//MeteorStrike
                var tempNum = tmpVal/spell.spellVar.numStrikeSizes.length;
                tmpVal = 0;
                for(var n=0; n<spell.spellVar.numStrikeSizes.length; n++){
                  tmpVal += (spell.spellVar.numStrikeSizes[n] + tempNum) * spell.spellVar.missileDescs["missile" + n].damageSpec.damage
                }
              }
              dmg_span.innerText = Math.floor(tmpVal);
              dmg_span.dataset.fdmg = tmpVal;
            }
            else if(typeof spell.missileCount !== "undefined"){//Fireball
              tmpVal = (spell.missileCount + (tmpVal == '' ? 0 : parseInt(tmpVal))) * spell.damageSpec.damage;
              dmg_span.innerText = Math.floor(tmpVal);
              dmg_span.dataset.fdmg = tmpVal;
            }
            applyElementalDamage("Spell");
            cells[k+1].className += " cell_positive";
          }
        }
      }
    }
  }
}

function removeAbilityEffect(type, ability){
  var d = document;
  var p = parent;
  var titan_level = d.getElementById("CURRENT_LV").innerHTML;
  var titan_id = d.getElementById("TITAN_NAME").dataset.id;
  var base_titan = parent.getTitanById(titan_id);
  var archetype = p.capital(base_titan.archetype);//for relics like falchion and rapier
  var titan = parent.getTitanById(titan_id + ((titan_level == 1)? '' : titan_level) );
  var base_titan_health = Math.floor(titan.health);
  if(typeof titan.rangedDamage !== "undefined"){
    var tmp = titan;
    while(typeof tmp.secondsPerRangedAttack === "undefined") tmp = parent.getTitanById(tmp["extends"]);
    var sec_per_attack = tmp.secondsPerRangedAttack;
  }

  var troop_select = d.getElementById("TROOP_SELECT");
  var troop_level_select = d.getElementById("TROOP_LEVEL_SELECT");
  var troop_id = troop_level_select.dataset.troopId;
  var troop_level = troop_level_select.value();
  var base_troop = p.getTroopById(troop_id);
  var troop_is_titan = false;
  if(typeof(base_troop.archetype) !== "undefined" || base_troop.extends == "Hero"){
    base_troop = p.getTitanById(base_troop["extends"]);
    troop_is_titan = true;
  }
  var troop_variant = typeof base_troop.troopVariant !== "undefined" ? base_troop.troopVariant : troop_id;
  var troop = p.getTroopById(troop_id + (troop_level == 1 ? '' : troop_level)), summon_troop = undefined;
  var base_troop_health = troop.health;
  var omegaTroop = d.getElementById("TROOP_OMEGA").firstElementChild.value;
  var corruptedTroop = d.getElementById("TROOP_CORRUPTED").firstElementChild.value;
  var is_summon = omegaTroop == "enabled" || corruptedTroop == "enabled";
  var is_omega = omegaTroop == "enabled";
  var is_corrupted = corruptedTroop == "enabled";

  var tmp = base_troop;
  while(typeof tmp.headCount === "undefined")
    tmp = p.getTroopById(tmp.extends)
  var headCount = tmp.headCount;
  if(troop_id == "Skeleton") headCount = 80;
  if(is_summon){
    if(omegaTroop == "enabled")
      var summon_id = p.getUnitOverrideId(troop_id, "OMEGA_TROOP");
    else if(corruptedTroop == "enabled")
      var summon_id = p.getUnitOverrideId(troop_id, "CORRUPTED");
    var summon_troop = p.getTroopById(summon_id + (troop_level == 1 ? '' : troop_level));
    var default_summon_troop = p.getTroopById(summon_id);
    if(typeof summon_troop.health !== "undefined"){
      base_troop_health = summon_troop.health;
    }
    if(typeof summon_troop.headCount !== "undefined"){
      headCount = summon_troop.headCount;
    }
    else if(typeof default_summon_troop.headCount !== "undefined"){
      headCount = default_summon_troop.headCount;
    }
  }

  var titan_mode = d.getElementById("ATTACK_DEFEND_BUTTON").dataset.battleMode;
  var spell_level_select = d.getElementById('SPELL_LEVEL_SELECT');
  var spell_level = spell_level_select.value();
  var base_spell = parent.getSpell(spell_level_select.dataset.spellId);
  var spell = parent.getSpell(spell_level_select.dataset.spellId + (spell_level == 1 ? '' : spell_level));

  if(typeof ability !== "undefined"){
    //apply auto cast ability - sperate from other abilities because the
    if(ability.effect == "AUTOCAST_ABILITY"){
      var cast_ability = parent.getAutocastAbilityById(ability.specificTarget);
      if(typeof cast_ability.titanExclusive === "undefined" && typeof cast_ability.titanGroupInclude === "undefined" ||
         typeof cast_ability.titanExclusive !== "undefined" && cast_ability.titanExclusive.includes(titan_id) ||
         typeof cast_ability.titanGroupInclude !== "undefined" && typeof base_titan.troopGroup !== "undefined" &&
         base_titan.troopGroup == cast_ability.titanGroupInclude) {
        var cast_effects = cast_ability.abilities;
        var relic_set_equipped = false;
        for(var i=0; i<cast_effects.length; i++){
          var cast_effect = cast_effects[i];
          if (typeof(cast_effect.trigger.limit) !== "undefined")
            var ability_limit = cast_effect.trigger.limit;
          else
            var ability_limit = 1;
          if(cast_effect.trigger.type == "ON_ATTACK" && titan_mode == "ATK" ||
             cast_effect.trigger.type == "ON_DEFENSE" && titan_mode == "DEF"){
            for(var j=0; j<cast_effect.actions.length; j++){
              var action = cast_effect.actions[j];
              if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
                var spoil = p.getAutocastRelicById(param);
                removeStatBonusAbility("Relic", spoil);
              }
            }
          } else if(cast_effect.trigger.type == "BATTLE_START"){
            for(var j=0; j<cast_effect.actions.length; j++){
              var action = cast_effect.actions[j];
              if(action.action == "ADD_SPOIL" && (allowed_invoke_targets.includes(action.target) || typeof action.target === "undefined")){
                var param = (action.parameter in relic_synergies) ? relic_synergies[action.parameter] : action.parameter;
                var spoil = p.getAutocastRelicById(param);
                removeStatBonusAbility("Relic", spoil);
              }
            }
          } else if(cast_effect.trigger.type == "RELIC_SET_LEVEL"){
            var all_relics_equipped = true;
            for(var j=0; j<cast_effect.trigger.argumentList.length; j++){
              var argument = cast_effect.trigger.argumentList[j];
              if(!boostIsEquipped("Relic", argument)){
                all_relics_equipped = false;
                break;
              }
            }
            if(all_relics_equipped && !relic_set_equipped){
              relic_set_equipped = true;
              if(p.arrayCompare(cast_effect.trigger.argumentList, nexus_complete_set)){
                //Nexus CorruptedRaid Titans are replaced by Corrupted versions
                troop_select.showOption("CorruptedAres");
                troop_select.showOption("CorruptedKorthan");
                troop_select.showOption("CorruptedNecromancer");
                troop_select.showOption("CorruptedOsiris");
                troop_select.showOption("CorruptedThor");
                troop_select.showOption("CorruptedZabava");
                troop_select.showOption("CorruptedZeus");
                troop_select.hideOption("CorruptedAresRaid");
                troop_select.hideOption("CorruptedKorthanRaid");
                troop_select.hideOption("CorruptedNecromancerRaid");
                troop_select.hideOption("CorruptedOsirisRaid");
                troop_select.hideOption("CorruptedThorRaid");
                troop_select.hideOption("CorruptedZabavaRaid");
                troop_select.hideOption("CorruptedZeusRaid");
              } else if(p.arrayCompare(cast_effect.trigger.argumentList, zeus_complete_set)){
                //Zeus BlessedRaid Titans are replaced by Blessed versions
                troop_select.showOption("BlessedArtemis");
                troop_select.showOption("BlessedGaia");
                troop_select.showOption("BlessedHeracles");
                troop_select.showOption("BlessedKronos");
                troop_select.showOption("BlessedMinotaur");
                troop_select.showOption("BlessedOceanus");
                troop_select.showOption("BlessedUranus");
                troop_select.hideOption("BlessedArtemisRaid");
                troop_select.hideOption("BlessedGaiaRaid");
                troop_select.hideOption("BlessedHeraclesRaid");
                troop_select.hideOption("BlessedKronosRaid");
                troop_select.hideOption("BlessedMinotaurRaid");
                troop_select.hideOption("BlessedOceanusRaid");
                troop_select.hideOption("BlessedUranusRaid");
              } else {

              }
            }
          }
        }
      }
      return;
    }
    if(ability.target == "ALL_HEROES" || ability.target == "SPECIFIC_ARCHETYPE"
    || ability.target == "ALL_UNITS" ){
      var dmg_span = d.getElementById("TITAN_DAMAGE_SPAN");
      removeAttackDamageTitan();
      removeElementalDamage();
      removeBaseDamage();
      if(ability.effect == "DAMAGE_TYPE" && type == "Relic"){//changing damage type
        var dmg_img = d.getElementById("DAMAGE_TYPE");
        var dmg_img_2 = d.getElementById("TITAN_DAMAGE_TYPE_2");
        var element_previous = dmg_img.alt.split(' ');
        element_previous = element_previous[element_previous.length - 1];
        if(dmg_img.title.split(' ')[0] == ability.value){
          dmg_img.alt = dmg_img.alt.substring(0, dmg_img.alt.lastIndexOf(' ' + element_previous));
          element_previous = dmg_img.alt.split(' ');
          element_previous = element_previous[element_previous.length - 1];
          dmg_img.src = "./images/elements/" + element_previous + ".png";
          dmg_img_2.src = "./images/elements/" + element_previous + ".png";
          dmg_img.title = element_previous  + " Damage";
          dmg_img_2.title = element_previous  + " Damage";
        }
        else//if element removed is not the last element
          dmg_img.alt = dmg_img.alt.replace(new RegExp("(\\b" + ability.value + "\\b)(?!.*\\b\\1\\b)", 'i'), '').replace("  ", ' ');
      }
      var val = ability.value;
      if(typeof val == "string")
        val = parseInt(val.split(':')[1]);
      if(ability.effect.match(/(ARMOUR)/))//Exceptions that allow neg values: Armour
        val = val - 100;
      else if(100 - val < 0)
        val = val - 100;
      else
        val = 100 - val;

      if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"
      || ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"
      || ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
        if(typeof ability.value == "string")
          var element = p.capital(ability.value.split(':')[0]);
        else
          var element = p.capital(ability.effect.split('_')[1]);
        if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
          var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
          for(var a = 0; a < arr.length; a++){
            var old_value = dmg_span.dataset["dmg" + arr[a]];
            dmg_span.dataset["dmg" + arr[a]] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["dmg" + arr[a]] == 0){dmg_span.dataset["dmg" + arr[a]] = '';}
          }
        }
        else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"){
          var old_value = dmg_span.dataset["dmg" + element];
          dmg_span.dataset["dmg" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
          if(dmg_span.dataset["dmg" + element] == 0){
            dmg_span.dataset["dmg" + element] = '';
          }
        }
        else if(ability.effect == "DAMAGE_TYPE_RESIST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
          var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
          for(var a = 0; a < arr.length; a++){
            var old_value = dmg_span.dataset["res" + arr[a]];
            dmg_span.dataset["res" + arr[a]] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["res" + arr[a]] == 0){dmg_span.dataset["res" + arr[a]] = '';}
          }
        }
        else if(ability.effect == "DAMAGE_TYPE_RESIST" || ability.effect == "UNIT_TYPE_DAMAGE_RESIST"){
          var old_value = dmg_span.dataset["res" + element];
          dmg_span.dataset["res" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
          if(dmg_span.dataset["res" + element] == 0){
            dmg_span.dataset["res" + element] = '';
          }
        }
        else if(ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
          var old_value = dmg_span.dataset["res" + element];
          dmg_span.dataset["res" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
          if(dmg_span.dataset["res" + element] == 0){
            dmg_span.dataset["res" + element] = '';
          }
        }
      }

      var cells = d.getElementById('TITAN_STATS').getElementsByClassName("stats_cell");
      for(var k = 0, len = cells.length; k < len; k=k+2){
        if(cells[k].id == "TITAN_HP"){
          if(ability.effect == "HEALTH_BASE"){
            var old_value = cells[k+1].dataset.healthBase;
            var healthBoost = cells[k+1].dataset.health
            cells[k+1].dataset.healthBase = old_value != '' ? parseInt(old_value) - val : old_value;
            var boostedBaseHealth = base_titan_health * (1+parseInt(cells[k+1].dataset.healthBase)/100)
            if(healthBoost != '')
              cells[k+1].innerText = Math.floor(boostedBaseHealth * (1+parseInt(healthBoost)/100));
            else
              cells[k+1].innerText = Math.floor(boostedBaseHealth);
            if(cells[k+1].dataset.healthBase == 0)
              cells[k+1].dataset.healthBase = '';
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", '');
          }
          if(ability.effect == "HEALTH"){
            var old_value = cells[k+1].dataset.health;
            var healthBaseBoost = cells[k+1].dataset.healthBase
            cells[k+1].dataset.health = old_value != '' ? parseInt(old_value) - val : old_value;
            if(healthBaseBoost != '')
              var boostedBaseHealth = base_titan_health * (1 + parseInt(healthBaseBoost)/100)
            else
              var boostedBaseHealth = base_titan_health
            cells[k+1].innerHTML = Math.floor(boostedBaseHealth * (1+cells[k+1].dataset.health/100));
            if(cells[k+1].dataset.health == 0)
              cells[k+1].dataset.health = '';
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", '');
          }
        }//relics like falchion and rapier
        else if(cells[k].id == "TITAN_DAMAGE"){
          if(ability.effect == "ATTACK"){
            if(typeof ability.specificTarget !== "undefined" && p.capital(ability.specificTarget) == archetype){
              var old_value = dmg_span.dataset["dmg" + archetype];
              dmg_span.dataset["dmg" + archetype] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset["dmg" + archetype] == 0)
                dmg_span.dataset["dmg" + archetype] = '';
            }
            else if(typeof ability.specificTarget === "undefined"){
              var old_value = dmg_span.dataset['dmgAttack'];
              dmg_span.dataset['dmgAttack'] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset['dmgAttack'] == 0)
                dmg_span.dataset['dmgAttack'] = '';
            }
          }
          if(ability.effect == "ATTACK_BASE"){
              var old_value = dmg_span.dataset['dmgAttackBase'];
              dmg_span.dataset['dmgAttackBase'] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset['dmgAttackBase'] == 0)
                dmg_span.dataset['dmgAttackBase'] = '';
          }
        }
        else if(ability.effect == "ARMOUR" && cells[k].id == "TITAN_ARMOR"){
          var old_value = cells[k+1].dataset.armour;
          cells[k+1].dataset.armour = old_value != '' ? parseInt(old_value) - val : old_value;
          if(cells[k+1].dataset.armour == 0)
            cells[k+1].dataset.armour = '';
          cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
          cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
        }
        else if(ability.effect == "ARMOUR_PIERCE" && cells[k].id == "TITAN_ARMOR_PIERCING"){
          var old_value = cells[k+1].dataset.armourPierce;
          cells[k+1].dataset.armourPierce = old_value != '' ? parseInt(old_value) - val : old_value;
          if(cells[k+1].dataset.armourPierce == 0)
            cells[k+1].dataset.armourPierce = '';
          cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
          cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
        }
        else if(ability.effect == "CRITICAL_RATE_BOOST" && cells[k].id == "TITAN_CRITICAL"){
          var old_value = cells[k+1].dataset.critical;
          cells[k+1].dataset.critical = old_value != '' ? parseInt(old_value) - val : old_value;
          if(cells[k+1].dataset.critical == 0)
            cells[k+1].dataset.critical = '';
          cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
          cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
        }

      }
      applyBaseDamage();
      applyElementalDamage();
      applyAttackDamageTitan();
    }
    //Troop effects
    if( ability.target == "SPECIFIC_UNIT"
    || ability.target == "SPECIFIC_SUMMON_UNIT" && is_summon
    || ability.target == "TROOP_GROUP" && is_summon
    || ability.target == "ALL_SUMMONS" && is_omega
    || ability.target == "ALL_HEROES" && troop_is_titan
    || ability.target == "ALL_UNITS"
    || ability.target == "ARMY" && !troop_is_titan){
      var dmg_span = d.getElementById("TROOP_DAMAGE_SPAN");
      removeAttackDamageTroop();
      removeElementalDamage("Troop");
      removeBaseDamage("Troop");
      if(ability.target == "ALL_UNITS"
         || ability.target == "ARMY" && !troop_is_titan
         || is_omega && ability.target == "ALL_SUMMONS" // ALL OMEGA
         || is_omega && ability.specificTarget.match("Summon") && ability.specificTarget.replace("Summon", '') == troop_id
         || is_corrupted && (ability.specificTarget.match("Raid") &&
                             ability.specificTarget.replace("SkeletonRaid", "SkeletonHorde").replace("Raid",'') == troop_id ||
                             ability.specificTarget == "Corrupted")
         || ability.target == "ALL_HEROES" && troop_is_titan // Buff titan in troop table
         || ability.specificTarget == troop_id //Buff targets the exact unit
         || ability.specificTarget == troop_variant){ //Buff targets a troop variant -> Eg. Mossmane buffs apply on corrupted
        //only remove damage change if troops ID match
        //change damage type of specific units
        if(ability.effect == "DAMAGE_TYPE"){
          var dmg_img = d.getElementById("TROOP_DAMAGE_TYPE");
          var element_previous = dmg_img.alt.split(' ');
          element_previous = element_previous[element_previous.length - 1];
          if(dmg_img.title.split(' ')[0] == ability.value){
            dmg_img.alt = dmg_img.alt.substring(0, dmg_img.alt.lastIndexOf(' ' + element_previous));
            element_previous = dmg_img.alt.split(' ');
            element_previous = element_previous[element_previous.length - 1];
            dmg_img.src = "./images/elements/" + element_previous + ".png";
            dmg_img.title = element_previous  + " Damage";
          }
          else//if element removed is not the last element
            dmg_img.alt = dmg_img.alt.replace(new RegExp("(\\b" + ability.value + "\\b)(?!.*\\b\\1\\b)", 'i'), '').replace("  ", ' ');
        }
        var val = ability.value;
        if(typeof val == "string")
          val = parseInt(val.split(':')[1]);
        if(ability.effect.match(/(ARMOUR)/))//Exceptions for neg values: Armour
          val = val - 100;
        else if(100 - val < 0)
          val = val - 100;
        else
          val = 100 - val;

        if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"
        || ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"
        || ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
          var dmg_img = d.getElementById("TROOP_DAMAGE_TYPE");
          if(typeof ability.value == "string")
            var element=p.capital(ability.value.split(':')[0]);
          else
            var element=p.capital(ability.effect.split('_')[1]);
          if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
            for(var a = 0; a < arr.length; a++){
              var old_value = dmg_span.dataset["dmg" + arr[a]];
              dmg_span.dataset["dmg" + arr[a]] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset["dmg" + arr[a]] == 0){dmg_span.dataset["dmg" + arr[a]] = '';}
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "UNIT_TYPE_DAMAGE_BOOST"){
            var old_value = dmg_span.dataset["dmg" + element];
            dmg_span.dataset["dmg" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["dmg" + element] == 0){
              dmg_span.dataset["dmg" + element] = '';
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_RESIST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze","Acid","Hp","Fire","Earth","Lightning","Void"];
            for(var a = 0; a < arr.length; a++){
              var old_value = dmg_span.dataset["res" + arr[a]];
              dmg_span.dataset["res" + arr[a]] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset["res" + arr[a]] == 0){dmg_span.dataset["res" + arr[a]] = '';}
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_RESIST"|| ability.effect == "UNIT_TYPE_DAMAGE_RESIST"){
            var old_value = dmg_span.dataset["res" + element];
            dmg_span.dataset["res" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["res" + element] == 0){dmg_span.dataset["res" + element] = '';}
          }
          else if(ability.effect == "RESIST_RANGED" || ability.effect == "RESIST_MELEE"){
            var old_value = dmg_span.dataset["res" + element];
            dmg_span.dataset["res" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["res" + element] == 0){
              dmg_span.dataset["res" + element] = '';
            }
          }
        }

        var cells = d.getElementById("TROOP_STATS").getElementsByClassName("stats_cell");
        for(var k = 0, len = cells.length; k < len; k=k+2){
          if(cells[k].id == "TROOP_HP"){
            if(ability.effect == "HEALTH_BASE"){
              var old_value = cells[k+1].dataset.healthBase;
              var healthBoost = cells[k+1].dataset.health
              cells[k+1].dataset.healthBase = old_value != '' ? parseInt(old_value) - val : old_value;
              var boostedBaseHealth = base_troop_health * (1+parseInt(cells[k+1].dataset.healthBase)/100)
              if(healthBoost != ''){
                cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount) * (1+parseInt(healthBoost)/100));
                if(headCount > 1 && localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled")
                  cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth * (1+parseInt(healthBoost)/100)) +")";
              }
              else{
                cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount));
                if(headCount > 1 && localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled")
                  cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth) +")";
              }
              if(cells[k+1].dataset.healthBase == 0)
                cells[k+1].dataset.healthBase = '';
              cells[k+1].className = cells[k+1].className.replace(" cell_positive", '');
            }
            if(ability.effect == "HEALTH"){
              var old_value = cells[k+1].dataset.health;
              var healthBaseBoost = cells[k+1].dataset.healthBase
              cells[k+1].dataset.health = old_value != '' ? parseInt(old_value) - val : old_value;
              if(healthBaseBoost != '')
                var boostedBaseHealth = base_troop_health * (1 + parseInt(healthBaseBoost)/100)
              else
                var boostedBaseHealth = base_troop_health
              cells[k+1].innerText = Math.floor(Math.round(boostedBaseHealth * headCount) * (1+cells[k+1].dataset.health/100));
              if(headCount > 1 && localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled")
                cells[k+1].innerText += " ("+ parent.roundToDec(boostedBaseHealth * (1+cells[k+1].dataset.health/100)) +")";
              if(cells[k+1].dataset.health == 0)
                cells[k+1].dataset.health = '';
              cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
            }
          }
          else if(cells[k].id == "TROOP_DAMAGE"){
            if(ability.effect == "ATTACK"){
              var old_value = dmg_span.dataset['dmgAttack'];
              dmg_span.dataset['dmgAttack'] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset['dmgAttack'] == 0)
                dmg_span.dataset['dmgAttack'] = '';
            }
            if(ability.effect == "ATTACK_BASE"){
              var old_value = dmg_span.dataset['dmgAttackBase'];
              dmg_span.dataset['dmgAttackBase'] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset['dmgAttackBase'] == 0)
                dmg_span.dataset['dmgAttackBase'] = '';
            }
          }
          else if(ability.effect == "ARMOUR" && cells[k].id == "TROOP_ARMOR"){
            var old_value = cells[k+1].dataset.armour;
            cells[k+1].dataset.armour = old_value != '' ? parseInt(old_value) - val : old_value;
            if(cells[k+1].dataset.armour == 0)
              cells[k+1].dataset.armour = '';
            cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
          else if(ability.effect == "ARMOUR_PIERCE" && cells[k].id == "TROOP_ARMOR_PIERCING"){
            var old_value = cells[k+1].dataset.armourPierce;
            cells[k+1].dataset.armourPierce = old_value != '' ? parseInt(old_value) - val : old_value;
            if(cells[k+1].dataset.armourPierce == 0)
              cells[k+1].dataset.armourPierce = '';
            cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
          else if(ability.effect == "CRITICAL_RATE_BOOST" && cells[k].id == "TROOP_CRITICAL"){
            var old_value = cells[k+1].dataset.critical;
            cells[k+1].dataset.critical = old_value != '' ? parseInt(old_value) - val : old_value;
            if(cells[k+1].dataset.critical == 0)
              cells[k+1].dataset.critical = '';
            cells[k+1].innerHTML = Math.round(parseFloat(cells[k+1].innerHTML.slice(0,-1)) - val) + '%';
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
        }
      }
      applyBaseDamage("Troop");
      applyElementalDamage("Troop");
      applyAttackDamageTroop();
    }

    //Spell effects
    if(ability.target == "ALL_SPELLS" || ability.target == "SPECIFIC_SPELL"){
      var dmg_span = d.getElementById("SPELL_DAMAGE_SPAN");
      if(typeof ability.specificTarget === "undefined" || ability.specificTarget == spell_level_select.dataset.spellId){
        var val = ability.value;
        if(typeof val == "string")
          val = parseInt(val.split(':')[1]);
        if(100 - val < 0)
          val = val - 100;
        else if(ability.effect == "QUANTITY_BOOST");//don't affect quantity
        else if(ability.effect == "RADIUS_BOOST")//Allow negative radius boost
          val -= 100;
        else
          val = 100 - val;

        if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "RESIST_ALL"){
          var dmg_img = d.getElementById("SPELL_DAMAGE_TYPE");
          if(typeof ability.value == "string")
            var element=p.capital(ability.value.split(':')[0]);
          else
            var element=p.capital(ability.effect.split('_')[1]);
          removeElementalDamage("Spell");
          if(ability.effect == "DAMAGE_TYPE_BOOST" && element.match(/ALL_ELEMENTAL_TYPES/i)){
            var arr = ["Freeze", "Acid", "Hp", "Fire", "Lightning", "Void"]; // "Earth" -Shield is not buffed by damage
            for(var a = 0; a < arr.length; a++){
              var old_value = dmg_span.dataset["dmg" + arr[a]];
              dmg_span.dataset["dmg" + arr[a]] = old_value != '' ? parseInt(old_value) - val : old_value;
              if(dmg_span.dataset["dmg" + arr[a]] == 0){
                dmg_span.dataset["dmg" + arr[a]] = '';
              }
            }
          }
          else if(ability.effect == "DAMAGE_TYPE_BOOST" || ability.effect == "RESIST_ALL"){
            if(ability.effect == "RESIST_ALL")//resist all is for shield spells
                element = "Earth"
            var old_value = dmg_span.dataset["dmg" + element];
            dmg_span.dataset["dmg" + element] = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset["dmg" + element] == 0){
              dmg_span.dataset["dmg" + element] = '';
            }
          }
          applyElementalDamage("Spell");
        }


        var cells = d.getElementById("SPELL_STATS").getElementsByClassName("stats_cell");
        for(var k = 0, len = cells.length; k < len; k=k+2){
          if(ability.effect == "RADIUS_BOOST" && cells[k].id == "SPELL_RADIUS"){
            var old_value = cells[k+1].dataset.radius;
            cells[k+1].dataset.radius = old_value != '' ? parseInt(old_value) - val : old_value;
            if(cells[k+1].dataset.radius == 0)
              cells[k+1].dataset.radius = '';
            cells[k+1].innerText = parseFloat(cells[k+1].innerText) / (1 + val/100).toFixed(2);
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
          else if(ability.effect == "DURATION_BOOST" && cells[k].id == "SPELL_DURATION"){
            var old_value = cells[k+1].dataset.duration;
            var new_value = (old_value != '' ? parseInt(old_value) : old_value)- val;
            cells[k+1].dataset.duration = new_value;
            if(cells[k+1].dataset.duration == 0)
              cells[k+1].dataset.duration = '';
            cells[k+1].innerText = parseFloat(cells[k+1].dataset.baseDuration) * (1 + new_value/100);
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
          else if(ability.effect == "QUANTITY_BOOST" && cells[k].id == "SPELL_DAMAGE"){//Quantity Boost of spells
            var old_value = dmg_span.dataset.quantity;
            dmg_span.dataset.quantity = old_value != '' ? parseInt(old_value) - val : old_value;
            if(dmg_span.dataset.quantity == 0)
              dmg_span.dataset.quantity = '';
            var tmpVal = dmg_span.dataset.quantity;
            removeElementalDamage("Spell");
            if(typeof spell.spellVar !== "undefined"){
              if(typeof spell.spellVar.NumStrikes !== "undefined" || typeof base_spell.spellVar.NumStrikes !== "undefined"){//LightningStorm + Lightning
                tmpVal = ((typeof spell.spellVar.NumStrikes !== "undefined" ? spell.spellVar.NumStrikes : base_spell.spellVar.NumStrikes) + (tmpVal == '' ? 0 : parseInt(tmpVal)))
                      * spell.spellVar.missile.damageSpec.damage;
              }
              else if(typeof spell.spellVar.numStrikeSizes !== "undefined"){//MeteorStrike
                var tempNum = (tmpVal == '' ? 0 : tmpVal)/spell.spellVar.numStrikeSizes.length;
                tmpVal = 0;
                for(var n=0; n<spell.spellVar.numStrikeSizes.length; n++){
                  tmpVal += (spell.spellVar.numStrikeSizes[n] + tempNum) * spell.spellVar.missileDescs["missile" + n].damageSpec.damage
                }
              }
              dmg_span.innerText = Math.floor(tmpVal);
              dmg_span.dataset.fdmg = tmpVal;
            }
            else if(typeof spell.missileCount !== "undefined"){//Fireball
              tmpVal = (spell.missileCount + (tmpVal == '' ? 0 : parseInt(tmpVal))) * spell.damageSpec.damage;
              dmg_span.innerText = Math.floor(tmpVal);
              dmg_span.dataset.fdmg = tmpVal;
            }
            applyElementalDamage("Spell");
            cells[k+1].className = cells[k+1].className.replace(" cell_positive", "");
          }
        }
      }
    }
  }//end of applying skills effect
}

/********************************************************************************
*                                                                               *
*                             SPELL FUNCTIONS                                   *
*                                                                               *
*********************************************************************************/
function changeSpellLevel(event) {
  updateSpell(event.target.dataset.spellId, event.target.value());
}


function changeSpell(event){
  var d = document;
  updateSpell(event.target.value(), d.getElementById("SPELL_LEVEL_SELECT").value());
}

function updateSpell(id, lv){
  var d = document;
  var p = parent;
  removeSkillsAndRelics();

  //change spell
  d.getElementById("SPELL_LEVEL_SELECT").dataset.spellId = id;
  var base_spell = p.getSpell(id);
  //change elemental dmg
  var dmg_img = d.getElementById("SPELL_DAMAGE_TYPE");
  dmg_img.src = "./images/elements/"+(typeof base_spell.damageType === "undefined" ? "HP" : base_spell.damageType) + ".png";
  dmg_img.alt = typeof base_spell.damageType !== "undefined" ? base_spell.damageType : "HP";
  dmg_img.title = (typeof base_spell.damageType !== "undefined" ? base_spell.damageType : "HP") + " Damage";
  var spell = p.getSpell(id + ((lv==1)?'':lv));

  //change stats(base)
  var cells = d.getElementById('SPELL_STATS').getElementsByClassName("stats_cell");
  for(var i = 0; i < cells.length; i=i+2){
    if(cells[i].id == "SPELL_DAMAGE"){
      var dmg = 0;
      var dmg_span = d.getElementById("SPELL_DAMAGE_SPAN");
      if(typeof spell.damageSpec !== "undefined"){
        dmg = spell.missileCount * spell.damageSpec.damage;
      }
      else if(typeof spell.spellVar !== "undefined"){
        if(typeof base_spell.spellVar.NumStrikes !== "undefined"){
          dmg = (typeof spell.spellVar.NumStrikes === "undefined" ? base_spell.spellVar.NumStrikes : spell.spellVar.NumStrikes) * spell.spellVar.missile.damageSpec.damage;
        }
        else if(typeof spell.spellVar.numStrikeSizes !== "undefined"){
          for(var j=0; j<spell.spellVar.numStrikeSizes.length; j++)
            dmg += spell.spellVar.numStrikeSizes[j] * spell.spellVar.missileDescs["missile"+j].damageSpec.damage;
        }
        else if(typeof spell.spellVar.unitId !== "undefined"){
          if(typeof base_spell.spellVar.unitId !== "undefined")
            dmg = lv;
        }
      }
      else{
        if(typeof spell.damage !== "undefined"){
          dmg = spell.damage;
          if(typeof spell.duration !== "undefined"){
            if(!!spell.id.match(/Freeze|Terror/));
            else dmg *= parseFloat(spell.duration.slice(0,-1));
            if(typeof spell.interval !== "undefined"){
              if(!!spell.id.match(/Terror|PoisonCloud/));
              else dmg /= parseFloat(spell.interval.slice(0,-1));
            }
          }
        }
        else if(typeof spell.applyShield !== "undefined")
          dmg = spell.applyShield;
        else if(typeof spell.meleeDPS !== "undefined")
          dmg = (spell.meleeDPS - 1) * 100;
      }
      dmg_span.innerText = Math.round(dmg);
      dmg_span.dataset.fdmg = dmg;
    }
    else if(cells[i].id == "SPELL_RADIUS"){
      var r = 0;
      if(typeof spell.radius !== "undefined")
        r = spell.radius;
      else if(base_spell.radius !== "undefined")
        r = base_spell.radius;
      if(typeof spell.spellVar !== "undefined"){
        if(typeof base_spell.spellVar.AreaWidth !== "undefined" && typeof base_spell.spellVar.AreaDepth !== "undefined"){
          r = Math.floor(Math.max(base_spell.spellVar.AreaWidth, base_spell.spellVar.AreaDepth));
        }
      }
      cells[i+1].innerText = r;
    }
    else if(cells[i].id == "SPELL_DURATION"){
      var dur = 0;
      if(typeof spell.duration !== "undefined"){
        if(typeof spell.postExposureDuration !== "undefined")
          dur = spell.postExposureDuration;
        else
          dur = spell.duration;
      }
      else if(typeof base_spell.duration !== "undefined"){
        if(typeof base_spell.postExposureDuration !== "undefined")
          dur = base_spell.postExposureDuration;
        else
          dur = base_spell.duration;
      }
      if(typeof spell.spellVar !== "undefined"){
        if(typeof base_spell.spellVar.NumStrikes !== "undefined"){
          dur = Math.floor((typeof spell.spellVar.NumStrikes === "undefined" ? base_spell.spellVar.NumStrikes : spell.spellVar.NumStrikes) * base_spell.spellVar.StrikeInterval);
        }
        else if(typeof spell.spellVar.numStrikeSizes !== "undefined"){
          var t = 0;
          for(var j=0; j<spell.spellVar.numStrikeSizes.length; j++)
            t += base_spell.spellVar.numStrikeSizes[j];
          dur = Math.floor(t * base_spell.spellVar.maxTimeBetweenMeteors);
        }
      }
      dur = typeof dur === "string" ? dur.replace('s', '') : dur;
      cells[i+1].dataset.baseDuration = dur;
      cells[i+1].innerText = dur;
    }
    else if(cells[i].id == "SPELL_HASTE"){
      cells[i+1].innerText = (typeof spell.haste === "undefined" ? 0 : spell.haste-1) *100 + "%";
    }
  }
  applySkillsAndRelics();
}

/********************************************************************************
*                                                                               *
*                             TROOP FUNCTIONS                                   *
*                                                                               *
*********************************************************************************/
function changeTroopLevel(event) {
  var d = document;
  var p = parent;
  var omega = d.getElementById("TROOP_OMEGA").firstElementChild;
  var corrupted = d.getElementById("TROOP_CORRUPTED").firstElementChild;
  if(only_max_level_troops.includes(event.target.dataset.troopId)){
    event.target.setOption(p.getMaxTroopLevel(event.target.dataset.troopId));
    return;
  }
  if(omega.value == "enabled"){
    //updateTroop inverts the value, so we change it before calling to keep it the same
    removeSkillsAndRelics();
    omega.value = "disabled";
    applySkillsAndRelics();
    updateTroop(event.target.dataset.troopId, event.target.value(), omega);
  }
  else if(corrupted.value == "enabled"){
    //updateTroop inverts the value, so we change it before calling to keep it the same
    removeSkillsAndRelics();
    corrupted.value = "disabled";
    applySkillsAndRelics();
    updateTroop(event.target.dataset.troopId, event.target.value(), corrupted);
  }
  else
    updateTroop(event.target.dataset.troopId, event.target.value());
}


function changeTroop(event){
  var d = document;
  var p = parent;
  var troop_level_select = d.getElementById("TROOP_LEVEL_SELECT");
  var max_troop_level = p.getMaxTroopLevel(event.target.value());
  if(max_troop_level < troop_level_select.value()){
    troop_level_select.setOption(max_troop_level);
  }
  if (max_troop_level == 60)
    troop_level_select.showOptions(25, 60);
  else
    troop_level_select.hideOptions(25, 60);

  var omega = d.getElementById("TROOP_OMEGA");
  var corrupted = d.getElementById("TROOP_CORRUPTED");
  if(parent.isUnitOverride(event.target.value())){
    omega.className = '';
    corrupted.className = '';
  } else {
    omega.className = "content_hide";
    corrupted.className = "content_hide";
  }
  if(omega.firstElementChild.value == "enabled"){
    omega.firstElementChild.checked = false;
    //if omega troop is selected, turn it off when switching troop
    updateTroop(d.getElementById("TROOP_SELECT").value(), troop_level_select.value(), omega.firstElementChild);
  } else if(corrupted.firstElementChild.value == "enabled"){
    corrupted.firstElementChild.checked = false;
    //if corrupted troop is selected, turn it off when switching troop
    updateTroop(d.getElementById("TROOP_SELECT").value(), troop_level_select.value(), corrupted.firstElementChild);
  }
  else{
    updateTroop(event.target.value(), troop_level_select.value());
  }
  if(only_max_level_troops.includes(event.target.value())){
    troop_level_select.setOption(max_troop_level);
  }
}

function toggleSummonTroop(event){
  var d = document;
  removeSkillsAndRelics();
  if(event.target.value == "disabled"){
    //disabled because it will be enabled in updateTroop
    var omega = d.getElementById("TROOP_OMEGA");
    var corrupted = d.getElementById("TROOP_CORRUPTED");
    if(event.target.parentElement.id == "TROOP_OMEGA"){
      corrupted.firstElementChild.value = "disabled";
      corrupted.firstElementChild.checked = false;
    } else if (event.target.parentElement.id == "TROOP_CORRUPTED"){
      omega.firstElementChild.value = "disabled";
      omega.firstElementChild.checked = false;
    }
  }
  applySkillsAndRelics();
  updateTroop(d.getElementById("TROOP_SELECT").value(), d.getElementById("TROOP_LEVEL_SELECT").value(), event.target);
}

function updateTroop(id, lv, summon){
  var d = document;
  var p = parent;
  removeSkillsAndRelics();
  //if summon was passed from event handler
  if(typeof summon !== "undefined"){
    //toggle summon checkbox - after removing skills and relics
    if(summon.value == "disabled"){
      summon.value = "enabled";
    }
    else{
      summon.value = "disabled";
    }
  }
  //change troop
  d.getElementById("TROOP_LEVEL_SELECT").dataset.troopId = id;
  var base_troop = p.getTroopById(id);//LVL 1 Troop
  if(typeof(base_troop.archetype) !== "undefined" || base_troop.extends == "Hero"){
    var default_troop = p.getTitanById(base_troop["extends"]);
    var is_titan_troop = true;
  } else {
    var default_troop = p.getTroopById("DefaultFootSoldier");//Base class for troops
    var is_titan_troop = false;
  }
  var troop = p.getTroopById(id + ((lv==1)?'':lv));
  var override = p.isUnitOverride(id) && typeof summon !== "undefined" && summon.value == "enabled";
  if(typeof troop.headCount !== "undefined")
    var headCount = troop.headCount;
  else if(typeof base_troop.headCount !== "undefined")
    var headCount = base_troop.headCount;
  else
    var headCount = default_troop.headCount;
  var is_ranged_troop = typeof base_troop.rangedDamage !== "undefined" && !force_melee_units.includes(id);
  if(is_ranged_troop){
    if(typeof troop.secondsPerRangedAttack !== "undefined")
      var fire_rate = troop.secondsPerRangedAttack;
    else
      var fire_rate = base_troop.secondsPerRangedAttack;
    var ranged_dmg_factor = 0;
    var count_rdmg_factors = 0;
    for(var i=0; i<troop_types.length; i++){
      if(typeof base_troop["ranged vs " + troop_types[i]] !== "undefined"){
        ranged_dmg_factor += base_troop["ranged vs " + troop_types[i]];
        count_rdmg_factors++;
      }
    }
    if(count_rdmg_factors > 0)
      ranged_dmg_factor /= count_rdmg_factors;
    else
      ranged_dmg_factor = 1;
  }
  if(id == "Skeleton"){
    headCount = 80;
    override = false;
  }
  var headCount_override = false;
  if(override){
    if(summon.parentElement.id == "TROOP_OMEGA"){
      var summon_id = id + "Summon";
      var summon_cell = "stats_cell cell_omega";
    }
    else if(summon.parentElement.id == "TROOP_CORRUPTED"){
      var summon_id = (id == "SkeletonHorde" ? "Skeleton" : id) + "Raid";
      var summon_cell = "stats_cell cell_corrupted";
    }
    var summon_troop = p.getTroopById(summon_id + (lv == 1 ? '' : lv) );
    var default_summon = p.getTroopById(summon_id);
    if(typeof summon_troop.headCount !== "undefined"){// && summon_troop.headCount > headCount){
      headCount = summon_troop.headCount;
      headCount_override = true;
    }
    else if(typeof default_summon.headCount !== "undefined"){// && default_summon.headCount > headCount){
      headCount = default_summon.headCount;
      headCount_override = true;
    }
    if(is_ranged_troop){
      ranged_dmg_factor = 0;
      count_rdmg_factors = 0;
      for(var i=0; i<troop_types.length; i++){
        if(typeof default_summon["ranged vs " + troop_types[i]] !== "undefined"){
          ranged_dmg_factor += default_summon["ranged vs " + troop_types[i]];
          count_rdmg_factors++;
        }
      }
      if(count_rdmg_factors > 0)
        ranged_dmg_factor /= count_rdmg_factors;
      else
        ranged_dmg_factor = 1;
    }
  }
  if(is_titan_troop && is_ranged_troop){
    if(typeof base_troop.titanRangedMaxAttacks !== "undefined")
      ranged_dmg_factor *= base_troop.titanRangedMaxAttacks;
    //else ranged_dmg_factor *= 56;
  }
  //change elemental dmg
  var dmg_img = d.getElementById("TROOP_DAMAGE_TYPE");
  var tmp = troop;
  if(typeof tmp.damageType === "undefined" && typeof base_troop.damageType !== "undefined")
    var dmg_type = base_troop.damageType; //base troop has priority over extending troop
  else {
    while(typeof tmp !== "undefined" && typeof tmp.damageType === "undefined")
      tmp = p.getTroopById(tmp.extends);
    if(typeof tmp !== "undefined" && typeof tmp.damageType !== "undefined")
      var dmg_type = tmp.damageType;
    else
      var dmg_type = base_troop.damageType;
  }
  dmg_img.src = "./images/elements/"+(typeof dmg_type !== "undefined" ? dmg_type : "HP") + ".png";
  dmg_img.alt = typeof dmg_type !== "undefined" ? dmg_type : "HP";
  dmg_img.title = (typeof dmg_type !== "undefined" ? dmg_type : "HP") + " Damage";
  //change stats(base)
  var cells = d.getElementById('TROOP_STATS').getElementsByClassName("stats_cell");
  for(var i = 0; i < cells.length; i=i+2){
    var override_value = undefined;
    if(cells[i].id == "TROOP_HP"){
      if(override && typeof summon_troop !== "undefined"){
        //headCount takes priority over displayDamage because displayDamage uses 56
        if(typeof summon_troop.health !== "undefined"){
          override_value = summon_troop.health;
          cells[i].className = summon_cell
        }
        else if(headCount_override)
          cells[i].className = summon_cell
      }
      if((typeof override_value === "undefined" || override_value == troop.health) && headCount_override == false){
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      }
      var condition = override && typeof override_value !== "undefined" && override_value != troop.health;
      cells[i+1].innerHTML = Math.round((condition ? override_value : troop.health) * headCount);

      var unit_health;
      if(override && headCount > 1){
          if(typeof summon_troop.health !== "undefined")
            unit_health = summon_troop.health;
          else
            unit_health = p.getTroopById(summon_troop.extends).health;
          if(localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled")
            cells[i+1].innerText += " (" + unit_health + ")";
      }
      else if(headCount > 1 && localStorage.getItem("individualHealth") != null && localStorage.getItem("individualHealth") == "enabled"){
        cells[i+1].innerText +=  " (" + troop.health + ")";
      }
    }
    else if(cells[i].id == "TROOP_DAMAGE"){
      var dmg_span = d.getElementById("TROOP_DAMAGE_SPAN");

      for(var e = 0; e < elemental.length; e++){
        var tmp2 = override ? summon_troop : troop;
        var tmp_extend = tmp2["extends"];
        while(typeof tmp2["damageFrom " + elemental[e]] === "undefined"){
          if(typeof tmp2["extends"] !== "undefined"){
            tmp2 = p.getTroopById(tmp2["extends"]);
            if(is_titan_troop && typeof tmp2 === "undefined")
              tmp2 = p.getTitanById(tmp_extend);
            tmp_extend = tmp2["extends"];
          }
          else break;
        }
        if(typeof tmp2["damageFrom " + elemental[e]] !== "undefined" ){
          var innate_resistance = tmp2["damageFrom " + elemental[e]];
          dmg_span.dataset["res" + p.capital(elemental[e])] = innate_resistance == 1 ? '' : Math.round((1 - innate_resistance) * 100);
        }
        else if(typeof tmp2["damageFrom " + elemental[e]] === "undefined" && tmp2.id == "DefaultFootSoldier" && typeof dmg_span.dataset["res" + p.capital(elemental[e])] !== "undefined"){// any set res is reset
          dmg_span.dataset["res" + p.capital(elemental[e])] = '';
        }
      }

      if(override && typeof summon_troop !== "undefined"){
        if(typeof summon_troop.rangedDamage !== "undefined" && !force_melee_units.includes(id)){
            override_value = Math.round(summon_troop.rangedDamage * headCount * ranged_dmg_factor / fire_rate);
            cells[i].className = summon_cell
        }
        else if(typeof summon_troop.meleeDPS !== "undefined"){
            override_value = Math.round(summon_troop.meleeDPS * headCount);
            cells[i].className = summon_cell
        }
        else if(typeof summon_troop.headCount !== "undefined" || headCount_override){
            var tmp_o = summon_troop;
            if(is_ranged_troop) {
              while(typeof tmp_o.rangedDamage === "undefined") tmp_o = p.getTroopById(tmp_o["extends"]);
              override_value = Math.round(tmp_o.rangedDamage * headCount * ranged_dmg_factor / fire_rate);
            }
            else {
              while(typeof tmp_o.meleeDPS === "undefined") tmp_o = p.getTroopById(tmp_o["extends"]);
              override_value = Math.round(tmp_o.meleeDPS * headCount);
            }
            cells[i].className = summon_cell
        }
      }
      var tmp = troop;
      var damage_value;
      if(is_ranged_troop) {
        while(typeof tmp["rangedDamage"] === "undefined")  tmp = p.getTroopById(tmp["extends"]);
        damage_value = tmp.rangedDamage * headCount * ranged_dmg_factor / fire_rate;
      }
      else {
        while(typeof tmp["meleeDPS"] === "undefined")  tmp = p.getTroopById(tmp["extends"]);
        damage_value = tmp.meleeDPS * headCount;
      }
      if((typeof override_value === "undefined" || override_value == damage_value) && headCount_override == false){
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      }
      condition = override && typeof override_value !== "undefined" && override_value != damage_value;
      var damage_value  = condition ? override_value : damage_value;
      if(!override && !base_troop.hirable) {
        //DisplayDamage for Spartan Troops is wrong
        if(base_troop.id == "Skeleton")
          damage_value = damage_value * headCount/56;
        else if (typeof troop.rangedDamage !== "undefined" && !force_melee_units.includes(id))
          damage_value = troop.rangedDamage * headCount * ranged_dmg_factor / fire_rate;
        else
          damage_value = troop.meleeDPS * headCount;
      }
      dmg_span.innerHTML = Math.floor(damage_value);
      dmg_span.dataset.fdmg =         damage_value;
    }
    else if(cells[i].id == "TROOP_ARMOR"){
      var tmp = troop;
      while(typeof tmp["armourValue"] === "undefined")
        tmp = p.getTroopById(tmp["extends"]);
      if(override){
        if(typeof summon_troop !== "undefined" && typeof summon_troop.armourValue !== "undefined")
          override_value = summon_troop.armourValue;
        else if(typeof default_summon !== "undefined" && typeof default_summon.armourValue !== "undefined")
          override_value = default_summon.armourValue;
        if(override_value != tmp.armourValue)
          cells[i].className = summon_cell
      }
      if(typeof override_value === "undefined" || override_value == tmp.armourValue)
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      condition = override && typeof override_value !== "undefined" && override_value != tmp.armourValue;
      cells[i+1].innerText = (condition ? override_value : tmp.armourValue) + '%';
    }
    else if(cells[i].id == "TROOP_ARMOR_PIERCING"){
      var tmp = troop;
      while(typeof tmp["armourPierce"] === "undefined")
        tmp = p.getTroopById(tmp["extends"]);
      if(override){
        if(typeof summon_troop !== "undefined" && typeof summon_troop.armourPierce !== "undefined")
          override_value = summon_troop.armourPierce;
        else if(typeof default_summon !== "undefined" && typeof default_summon.armourPierce !== "undefined")
          override_value = default_summon.armourPierce;
        if(override_value != tmp.armourPierce)
          cells[i].className = summon_cell
      }
      if(typeof override_value === "undefined" || override_value == tmp.armourPierce)
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      condition = override && typeof override_value !== "undefined" && override_value != tmp.armourPierce;
      cells[i+1].innerText = (condition ? override_value : tmp.armourPierce) + '%';
    }
    else if(cells[i].id == "TROOP_CRITICAL"){
      var tmp = troop;
      while(typeof tmp["criticalRate"] === "undefined")
        tmp = p.getTroopById(tmp["extends"]);
      if(override){
        if(typeof summon_troop !== "undefined" && typeof summon_troop.criticalRate !== "undefined")
          override_value = summon_troop.criticalRate;
        else if(typeof default_summon !== "undefined" && typeof default_summon.criticalRate !== "undefined")
          override_value = default_summon.criticalRate;
        if(override_value != tmp.criticalRate)
          cells[i].className = summon_cell
      }
      if(typeof override_value === "undefined" || override_value == tmp.criticalRate)
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      condition = override && typeof override_value !== "undefined" && override_value != tmp.criticalRate;
      cells[i+1].innerText = (condition ? override_value : tmp.criticalRate) + '%';
    }
    else if(cells[i].id == "TROOP_SPEED"){
      var tmp = troop;
      while(typeof tmp["moveSpeed"] === "undefined")
        tmp = p.getTroopById(tmp["extends"]);
      if(override){
        if(typeof default_summon !== "undefined" && typeof default_summon.moveSpeed !== "undefined")
          override_value = default_summon.moveSpeed;
        else if(typeof default_summon !== "undefined" && typeof default_summon.moveSpeed !== "undefined")
          override_value = default_summon.moveSpeed;
        if(override_value != tmp.moveSpeed)
          cells[i].className = summon_cell
      }
      if(typeof override_value === "undefined" || override_value == tmp.moveSpeed)
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
      condition = override && typeof override_value !== "undefined" && override_value != tmp.moveSpeed;
      cells[i+1].innerText = (condition ? override_value : tmp.moveSpeed);
    }
    else if(cells[i].id == "TROOP_UNIT_COUNT"){
      cells[i+1].innerHTML = headCount;
      if(headCount_override)
        cells[i].className = summon_cell
      else
        cells[i].className = cells[i].className.replace(" cell_corrupted",'').replace(" cell_omega",'');
    }
    else if(cells[i].id == "TROOP_RATE_OF_FIRE"){
      var tmp = troop;
      while(typeof tmp["secondsPerRangedAttack"] === "undefined")
          tmp = p.getTroopById(tmp["extends"]);
      cells[i+1].innerHTML = tmp.secondsPerRangedAttack + 's';
    }
  }
  applySkillsAndRelics();
}

function applyAttackDamageTroop(){
  var d = document;
  var tmp = d.getElementById("TROOP_LEVEL_SELECT");
  var troop = parent.getTroopById(tmp.dataset.troopId + ((tmp.value == 1) ? '' : tmp.value()));
  var dmg_span = d.getElementById("TROOP_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = dmg_span.dataset["dmgAttack"];
  dmg_span.innerHTML = Math.floor(base_dmg*(1+parseInt((typeof multiply !== "undefined" && multiply != '') ? multiply : 0)/100));
  dmg_span.dataset.fdmg =         base_dmg*(1+parseInt((typeof multiply !== "undefined" && multiply != '') ? multiply : 0)/100);
  if(typeof multiply !== "undefined" && multiply != '')
    dmg_span.parentElement.className += " cell_positive";
}

function removeAttackDamageTroop(){
  var d = document;
  var tmp = d.getElementById("TROOP_LEVEL_SELECT");
  var troop = parent.getTroopById(tmp.dataset.troopId + ((tmp.value == 1) ? '' : tmp.value()));
  var dmg_span = d.getElementById("TROOP_DAMAGE_SPAN");
  var base_dmg = dmg_span.dataset.fdmg;
  var multiply = dmg_span.dataset["dmgAttack"];
  dmg_span.innerHTML = Math.floor(base_dmg/(1+parseInt((typeof multiply !== "undefined" && multiply != '') ? multiply : 0)/100));
  dmg_span.dataset.fdmg =         base_dmg/(1+parseInt((typeof multiply !== "undefined" && multiply != '') ? multiply : 0)/100);
  if(typeof multiply !== "undefined" && multiply != '')
    dmg_span.parentElement.className = dmg_span.parentElement.className.replace(" cell_positive", '');
}

/********************************************************************************
 *                                                                              *
 *                             Level manipulation                               *
 *                                                                              *
 ********************************************************************************/

function levelUp(event) {
  event.preventDefault();
  if(event.target.dataset.level == event.target.dataset.maxLevel) return;
  event.target.dataset.level = parseInt(event.target.dataset.level) + 1;
  document.getElementById("LEVEL_DOWN_BUTTON").dataset.level = event.target.dataset.level;
  update(event.target.dataset.level);
}

function levelDown(event) {
  event.preventDefault();
  if(event.target.dataset.level == 1) return;
  event.target.dataset.level = parseInt(event.target.dataset.level) - 1;
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.dataset.level;
  update(event.target.dataset.level);
}
/********************************************************************************
 *                                                                              *
 *                                  Help popups                                 *
 *                                                                              *
 ********************************************************************************/

function showArchetypeHelp(){
  parent.alert("Classes in DoT", "There are 9 classes in Dawn of Titans. <br>\
        <table><tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_champion.png\"></td><td>" + parent.getTranslation("ARCHETYPE_CHAMPION") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_guardian.png\"></td><td>" + parent.getTranslation("ARCHETYPE_GUARDIAN") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_paladin.png\"></td><td>" + parent.getTranslation("ARCHETYPE_PALADIN") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_assassin.png\"></td><td>" + parent.getTranslation("ARCHETYPE_ASSASSIN") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_berserker.png\"></td><td>" + parent.getTranslation("ARCHETYPE_BERSERKER") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_infiltrator.png\"></td><td>" + parent.getTranslation("ARCHETYPE_INFILTRATOR") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_ranger.png\"></td><td>" + parent.getTranslation("ARCHETYPE_RANGER") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_shaman.png\"></td><td>" + parent.getTranslation("ARCHETYPE_SHAMAN") + "</td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src= \"./images/titan_class/class_sorcerer.png\"></td><td>" + parent.getTranslation("ARCHETYPE_SORCERER") + "</td></tr>\
        </table> Please note that Assassin, Shaman and Sorcerer are currently not in the game.");
}

function showRaceHelp(){
  parent.alert("Races in DoT", "There are 5 races in Dawn of Titans.<br>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_human.png\">" + parent.getTranslation("HUMAN_NAME") +" - "+ parent.getTranslation("HP_DAMAGE") + "<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_unak.png\">" + parent.getTranslation("UNAK_NAME") +" - "+ parent.getTranslation("FIRE_DAMAGE") + "<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_mossmane.png\">" + parent.getTranslation("MOSSMANE_NAME") +" - "+ parent.getTranslation("ACID_DAMAGE") + "<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_elithen.png\">" + parent.getTranslation("ELITHEN_NAME") +" - "+ parent.getTranslation("FREEZE_DAMAGE") + "<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_ragnar.png\">" + parent.getTranslation("RAGNAR_NAME") +" - "+ parent.getTranslation("EARTH_DAMAGE") + "<br/>\
        Please note that elemental damage is reserved for \
        <img style=\"height:15px;width:auto;\" src=\"./images/rarity/3star_line.png\"> and <img style=\"height:15px;width:auto;\" src=\"./images/rarity/4star_line.png\"> titans. \
        <img style=\"height:15px;width:auto;\" src=\"./images/rarity/1star_line.png\"> and <img style=\"height:15px;width:auto;\" src=\"./images/rarity/2star_line.png\"> titans will have physical damage.");
}

function showSkillHelp(){
  parent.alert("Skills", "To equip certain skills press on the skill slot, which will be highlighted in blue. Then the possible skills\
          should be displayed as icons down below.</br></br>The dropdown list with the label Skills can be used \
          to select skills from before the global release of the game and/or other skillsets that were available until now.");
}

function showStatHelp(){
  parent.alert(document.getElementById("NAME_SPAN").innerText, printPercent());
}
function showRelicHelp(){
  parent.alert("Equipping Relics", "To equip cetain relics press on the relic slot, which will be highlighted in blue. Then the possible relics\
          should be displayed as icons down below.</br></br>Hover with the mouse over them to see their name.\
          Press on any relic to equip it on the selected slot. Repeat this as many times as you want.</br></br>\
          You can set the relic with the dropdown list next to the relic's image.");
}

function showTroopHelp(){
  var d = document;
  var select = d.getElementById('TROOP_SELECT');
  var omega = document.getElementById("TROOP_OMEGA").firstElementChild.value;
  var corrupted = document.getElementById("TROOP_CORRUPTED").firstElementChild.value;
  if(omega == "enabled")
    var prefix = "&Omega; "
  else if(corrupted == "enabled")
    var prefix = "Corrupted "
  else
    var prefix = ''
  parent.alert( prefix + select.text(), printTroopPercent());
}

function showSpellHelp(){
  var select = document.getElementById('SPELL_SELECT');
  parent.alert(select.text(), printSpellPercent());
}

/*
*********************
* DYNAMIC FONT SIZE *
*********************
*/

function changeFontSizeSkillEffect(element){
  // get width of header
  element.style.width = getComputedStyle(element.parentElement.parentElement.firstElementChild).width;
  //multi line mode for long text, otherwise single line
  if(element.innerText.length > 40){
    element.className += " adjusted_font_skill";
    adjustFontSize(element, false);
  } else {
    element.className = element.className.replace(" adjusted_font_skill", "");
  }
}
//function used to adjust the font-size of the element
//so that the width is fixed (single-line mode) or both the width and height are
//fixed (multi-line mode), of course the text should be contained within the fixed width
//and height.
function adjustFontSize(element, singleLine){
    if(typeof adjustFontSize.dummy === "undefined"){
        adjustFontSize.dummy = document.createElement('div');
        adjustFontSize.dummy.className = 'dummy';
    }
    var dummy = adjustFontSize.dummy;
    if(!element.innerText) return;
    var elementStyle = getComputedStyle(element);
    dummy.style.font = elementStyle.font;
    initMode(dummy, singleLine, function(){ dummy.style.width = elementStyle.width });
    dummy.style.padding = elementStyle.padding;
    dummy.style.boxSizing = elementStyle.boxSizing;
    dummy.innerHTML = element.innerHTML;
    document.body.appendChild(dummy);
    var dummyStyle = getComputedStyle(dummy);

    while(singleLine ? parseInt(dummyStyle.width) < parseInt(elementStyle.width) :
                       parseInt(dummyStyle.height) < parseInt(elementStyle.height)){
        dummy.style.fontSize = parseFloat(dummyStyle.fontSize) + 1 + 'px';
        dummyStyle = getComputedStyle(dummy);
    }
    while(singleLine ? parseInt(dummyStyle.width) > parseInt(elementStyle.width) :
                       parseInt(dummyStyle.height) > parseInt(elementStyle.height)){
        dummy.style.fontSize = parseFloat(dummyStyle.fontSize) - 1 + 'px';
        dummyStyle = getComputedStyle(dummy);
    }
    element.style.fontSize = dummyStyle.fontSize;
    document.body.removeChild(dummy);
}

function initMode(dummy, singleLine, callback){
  if(typeof initMode.inSingleLineMode === "undefined"){
    initMode.inSingleLineMode;
  }
  if(typeof initMode.inMultilineMode === "undefined"){
    initMode.inMultilineMode;
  }
  if(!dummy) return;
  if(singleLine && !initMode.inSingleLineMode) {
      dummy.style.whiteSpace = 'nowrap';
      dummy.style.width = 'auto';
      dummy.style.display = "inline-block";
      initMode.inSingleLineMode = true;
      initMode.inMultiLineMode = false;
  }
  else if(!singleLine && !initMode.inMultilineMode) {
      if(callback) callback();
      dummy.style.whiteSpace = 'initial';
      dummy.style.display = "block";
      dummy.style.wordWrap = 'break-word';
      initMode.inMultilineMode = true;
      initMode.inSingleLineMode = false;
  }
}
