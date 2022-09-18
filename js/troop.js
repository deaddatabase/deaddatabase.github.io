/*
******************************************
**************** TROOP.JS ****************
******************************************
*/

function initTroop() {
  var parameters = location.search.substring(1).split('=');
  //Load from json
  if(typeof parameters[0] === "string" && parameters[0] == "name") {
    var d = document;
    var id = unescape(parameters[1]);
    var troop = parent.getTroopById(id);
    var default_troop = parent.res.troop[0];

    var lvl = 1;
    if(!isNaN(parseInt(troop.id.slice(-2))))
      lvl = parseInt(troop.id.slice(-2))
    else if(!isNaN(parseInt(troop.id.slice(-1))))
      lvl = parseInt(troop.id.slice(-1))
    if(lvl == 25) d.getElementById("TROOP_GRAIN").className = "content_hide";

    //set the troop's name
    var tmp = troop;
    while( lvl != 1 && typeof tmp["extends"] !== "undefined" && tmp["extends"] != "DefaultFootSoldier")
      tmp = parent.getTroopById(tmp["extends"]);

    var troop_name = d.getElementById("TROOP_NAME");
    troop_name.innerHTML = tmp["uiName"];
    troop_name.dataset.id = tmp.id;
    var race = (tmp.id == "Militia" || tmp.id == "Archer" || tmp.id == "Pikemen" || tmp.id == "SkeletonHorde") ? "Human" : tmp.id;

    //set the troop's race"
    var race_img = d.createElement("img");
    race_img.id = "TROOP_RACE_IMG";
    race_img.className = "small_icon";
    race_img.addEventListener("click", showRaceFAQ);
    race_img.src = "./images/races/race_" + race.toLowerCase() + ".png";
    //set the troop emblem
    var decal_img = d.createElement("img");
    decal_img.id = 'TROOP_EMBLEM_IMG';
    decal_img.className = "small_icon";
    decal_img.addEventListener("click", showArchetypeHelp);
    decal_img.src = "./images/troops/" + tmp.id + "_Decal.png";
    //set the troop combat category
    var combat_category_img = d.createElement("img");
    combat_category_img.id = "TROOP_COMBAT_TYPE_IMG";
    combat_category_img.className = "small_icon";

    tmp = troop;
    while(typeof tmp.visualType === "undefined")
      tmp = parent.getTroopById(tmp["extends"]);
    var troop_img = d.getElementById("TROOP_IMG");
    troop_img.addEventListener("error", loadAlternate);
    troop_img.src = "./images/troop_img/" + tmp.visualType + ".png";
    while(typeof tmp.broadCombatCategory === "undefined")
      tmp = parent.getTroopById(tmp["extends"]);
    troop.broadCombatCategory = (typeof tmp.broadCombatCategory === "undefined") ? parent.getTroopById(troop["extends"]).broadCombatCategory : tmp.broadCombatCategory;
    combat_category_img.src = "./images/combat_category/CombatType "+ (troop.broadCombatCategory == "SHOCK" ? "Mobile" : parent.capital(troop.broadCombatCategory)) +".png";
    var images = d.getElementById('TROOP_IMG_CONTAINER');
    images.appendChild(decal_img);
    images.appendChild(race_img);
    images.appendChild(combat_category_img);

    var charge = (typeof troop.canCharge === "undefined") ? default_troop.canCharge : troop.canCharge;
    if(charge){
      var charge = d.createElement('img');
      charge.id = 'TROOP_CHARGE_IMG';
      charge.className = "small_icon";
      charge.title = "Charge";
      charge.src = "./images/stat_icons/Charge.png";
      images.appendChild(charge);
    }

    //set grain and time for upgrade
    d.getElementById("GRAIN_VALUE").innerHTML = (typeof troop.costToUpgrade !== "undefined") ? troop.costToUpgrade.slice(0,-1) : "---";
    d.getElementById("TROOP_TIME").innerHTML = (typeof troop.timeToUpgrade !== "undefined") ? "Time: " + parent.minToDayHourMinute(troop.timeToUpgrade.slice(0, -1)) : "---";


    var table = d.getElementById("TROOP_STATS");
    var row, cell;

    var stat_values = ["qmark", "HP", "DAMAGE", "RATE_OF_FIRE", "ARMOR", "ARMOR_PIERCING", "CRITICAL", "SPEED", "UNIT_COUNT", "TRAINING_TIME", "TRAINING_COST"];
    var c = 0;
    for(var i = 0; i < stat_values.length; i++) {
      if(stat_values[i] == "RATE_OF_FIRE" && typeof troop.secondsPerRangedAttack === "undefined"){
          c++;
          continue;
      }

      row = table.insertRow(i - c);
      row.className = "stats_row";
      for(var j = 0; j < 2; j++) {
        cell = row.insertCell(j);
        cell.className = "stats_cell";
        if(j == 0){
          cell.id = "TROOP_" + stat_values[i];
          tmp = parent.getTranslation(stat_values[i]);
          if(stat_values[i] != "qmark"){
            if(stat_values[i] == "RATE_OF_FIRE") tmp = parent.getTranslation("BUFF_ATTACK_RATE").split('%')[1];
            cell.innerText = typeof tmp !== "undefined" ? tmp : parent.getTranslation(stat_values[i], "EN");
          }
          if(stat_values[i] == "qmark"){
            cell.innerHTML = "<img src=\"./images/question.png\" class=\"qmark\">";
            cell.firstElementChild.addEventListener("click", showStatFAQ);
          }
          if(stat_values[i] == "HP"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Health.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "DAMAGE"){
            var icon = d.createElement("img");
            var dmg_type = (typeof troop.damageType === "undefined")? "HP" : troop.damageType;
            icon.src = './images/elements/' + dmg_type + '.png';
            icon.id = "damageType";
            icon.className= "icon";
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
          else if(stat_values[i] == "TRAINING_TIME"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Duration.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "TRAINING_COST"){
            var icon = d.createElement("img");
            icon.src = "./images/resources/FOOD.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
        }
        else{
          if(stat_values[i] == 'qmark'){
            var troop_level_select = createCSelect("TROOP_LEVEL_SELECT");
            cell.appendChild(troop_level_select);
          }
          else if(stat_values[i] == "HP"){
            tmp = troop;
            while(typeof tmp["headCount"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = Math.round(troop.health * tmp.headCount);
          }
          else if(stat_values[i] == "DAMAGE"){
            var span = d.createElement("span");
            cell.appendChild(span);
            span.id = "DAMAGE_SPAN";
            var tmp = troop;
            while(typeof tmp["displayDamage"] === "undefined")
              tmp = p.getTroopById(tmp["extends"]);
            span.innerText = Math.floor(tmp.displayDamage);
            span.dataset.fdmg = tmp.displayDamage;
          }
          else if(stat_values[i] == "RATE_OF_FIRE"){
            tmp = troop;
            while(typeof tmp["secondsPerRangedAttack"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = troop.secondsPerRangedAttack + 's';
          }
          else if(stat_values[i] == "ARMOR"){
            tmp = troop;
            while(typeof tmp["armourValue"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.armourValue + '%';
          }
          else if(stat_values[i] == "ARMOR_PIERCING"){
            tmp = troop;
            while(typeof tmp["armourPierce"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.armourPierce + '%';
          }
          else if(stat_values[i] == "CRITICAL"){
            tmp = troop;
            while(typeof tmp["criticalRate"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.criticalRate + '%';
          }
          else if(stat_values[i] == "SPEED"){
            tmp = troop;
            while(typeof tmp["moveSpeed"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.moveSpeed;
          }
          else if(stat_values[i] == "UNIT_COUNT"){
            tmp = troop;
            while(typeof tmp["headCount"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.headCount;
          }
          else if(stat_values[i] == 'Reinforcement Space'){
            tmp = troop;
            while(typeof tmp["reinforcementValue"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.reinforcementValue;
          }
          else if(stat_values[i] == "TRAINING_TIME"){
            tmp = troop;
            while(typeof tmp["timeToBuild"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = parent.secToMinutes(tmp.timeToBuild.slice(0, -1));
          }
          else if(stat_values[i] == "TRAINING_COST"){
            cell.innerHTML = "<span id=\"costBuildSpan\">" +((typeof troop.costToBuild !== "undefined") ? troop.costToBuild.slice(0, -1) : "---" )+ "</span>";
          }
        }
      }

    }

    //create Level options in dropdown
    var dropdown = d.getElementById("TROOP_LEVEL_SELECT");
    for(var i = 0; i < parent.getMaxTroopLevel(); i++) {
      dropdown.appendOption(parent.getTranslation("LVL").toUpperCase() + ' ' + (i + 1), i+1);
      if(i+1 == lvl) dropdown.setOption(i+1);
    }
    dropdown.finalise();
    dropdown.addEventListener("change", jumpToLevel);

    //level up/down btn
    var button = d.getElementById("LEVEL_UP_BUTTON");
    button.src = './images/levelUP2.png';
    button.dataset.level = 1;
    button.dataset.maxlevel = parent.getMaxTroopLevel();
    button.addEventListener('click', levelUp);
    button = d.getElementById("LEVEL_DOWN_BUTTON");
    button.src = './images/levelUP2.png';
    button.dataset.level = 1;
    button.dataset.maxlevel = parent.getMaxTroopLevel();
    button.addEventListener('click', levelDown);

    //correction of different widths of the decal icons
    if(troop.id == "Militia") decal_img.style.marginRight = 21 + "px";
    else if(troop.id == "Archer") decal_img.style.marginRight = 3 + "px";
    else if(troop.id == "Pikemen") decal_img.style.marginRight = 19 + "px";
    else if(troop.id == "SkeletonHorde") decal_img.style.marginRight = -15 + "px";
    else if(troop.id == "Unak") decal_img.style.marginRight = 10 + "px";
    else if(troop.id == "Mossmane") ;//decal_img.style.marginRight = 0 + "px";
    else if(troop.id == "Elithen") decal_img.style.marginRight = 19 + "px";
    else if(troop.id == "Ragnar") decal_img.style.marginRight = 11 + "px";
    else if(troop.id == "AxeThrower") decal_img.style.marginRight = 16 + "px";

    d.body.style.visibility = "visible";
  }
}

function loadAlternate(event){
  console.log("Could not load the image: " + event.target.src);
  event.target.onerror = null;
  event.target.src = "./images/relic_cards/broken_pot.png";
  event.preventDefault();
}

function showStatFAQ(){
  parent.alert("Troop's Stats", "Shows the relevant stat information for the selected level.");
}

function showRaceFAQ(){
  parent.alert("Races in DoT", "There are 5 races in Dawn of Titans.<br>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_human.png\">" + parent.getTranslation("HUMAN_NAME") + " - " + parent.getTranslation("HP_DAMAGE")+"<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_unak.png\">" + parent.getTranslation("UNAK_NAME") + " - " + parent.getTranslation("FIRE_DAMAGE")+"<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_mossmane.png\">" + parent.getTranslation("MOSSMANE_NAME") + " - " + parent.getTranslation("ACID_DAMAGE")+"<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_elithen.png\">" + parent.getTranslation("ELITHEN_NAME") + " - " + parent.getTranslation("FREEZE_DAMAGE")+"<br/>\
          <img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/races/race_ragnar.png\">" + parent.getTranslation("RAGNAR_NAME") + " - " + parent.getTranslation("EARTH_DAMAGE")+"<br/>\
          ");
}

function showArchetypeHelp(){
  parent.alert("Troops in DoT", "There are 7 different troops in Dawn of Titans. <br>\
        <table><tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Militia_Decal.png\"></td><td> " + parent.getTranslation("UINAME_MILITIA") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Archer_Decal.png\"></td><td> " + parent.getTranslation("UINAME_ARCHERS") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Pikemen_Decal.png\"></td><td> " + parent.getTranslation("UINAME_PIKEMEN") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Unak_Decal.png\"></td><td> " + parent.getTranslation("UINAME_UNAK") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Mossmane_Decal.png\"></td><td> " + parent.getTranslation("UINAME_MOSSMANE") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Elithen_Decal.png\"></td><td> " + parent.getTranslation("UINAME_ELITHEN") + " </td></tr>\
            <tr><td><img style=\"height:20px;width:auto;margin-right:5px;\" src=\"./images/troops/Ragnar_Decal.png\"></td><td> " + parent.getTranslation("UINAME_RAGNAR") + " </td></tr>\
        </table>");
}

/***************************************************update stats*********************************************************/
function update(level){
  var d = document;
  var name = d.getElementById("TROOP_NAME").dataset.id;
  var base_troop = parent.getTroopById(name);
  var troop = parent.getTroopById(name + (level == 1 ? '' : level));
  var select = d.getElementById("TROOP_LEVEL_SELECT");
  if(troop.level != select.value()) select.setOption(level);
  var temp = base_troop;
  while(typeof temp.headCount === "undefined")
    temp = parent.getTroopById(temp.extends);
  var headCount = temp.headCount;

  cells = d.getElementsByClassName("stats_cell");
  if(typeof troop.visualType !== "undefined")
    d.getElementById("TROOP_IMG").src = "./images/troop_img/" + troop.visualType + ".png";
  for(var i = 0; i < cells.length; i = i + 2){
    if(cells[i].id == "TROOP_HP"){
      cells[i+1].innerText = Math.round(troop.health * headCount);//parseInt(troop.displayHealth);
    }
    else if(cells[i].id == "TROOP_DAMAGE"){
      d.getElementById("DAMAGE_SPAN").innerHTML = parseInt(troop.displayDamage);
    }
    else if(cells[i].id == "TROOP_ARMOR" && typeof troop.armourValue !== "undefined"){
      var tmp = troop;
      while(typeof tmp.armourValue === "undefined") tmp = parent.getTroopById(tmp["extends"]);
      cells[i+1].innerText = tmp.armourValue + '%';
    }
    else if(cells[i].id == "TROOP_ARMOR_PIERCING"){
      var tmp = troop;
      while(typeof tmp.armourPierce === "undefined") tmp = parent.getTroopById(tmp["extends"]);
      cells[i+1].innerText = tmp.armourPierce + '%';
    }
    else if(cells[i].id == "TROOP_TRAINING_COST"){
      var tmp = troop;
      while(typeof tmp.costToBuild === "undefined") tmp = parent.getTroopById(tmp["extends"]);
      d.getElementById("costBuildSpan").innerText = tmp.costToBuild.slice(0, -1);
    }
    else if(cells[i].id == "TROOP_TRAINING_TIME"){
      var tmp = troop;
      while(typeof tmp.timeToBuild === "undefined") tmp = parent.getTroopById(tmp["extends"]);
      cells[i+1].innerText = parent.secToMinutes(tmp.timeToBuild.slice(0, -1))
    }
  }
  if(level == 25){
    d.getElementById("TROOP_GRAIN").className = "content_hide";
  }
  else{
    var grain_container = d.getElementById("TROOP_GRAIN");
    if(grain_container.className == "content_hide")
      grain_container.className = '';
    d.getElementById("GRAIN_VALUE").innerHTML = troop.costToUpgrade.slice(0, -1);
    d.getElementById("TROOP_TIME").innerHTML = "Time: " + parent.minToDayHourMinute(troop.timeToUpgrade.slice(0, -1));
  }
  var tmp = troop;
  while(typeof tmp.visualType === "undefined")
    tmp = parent.getTroopById(tmp["extends"]);
  d.getElementById("TROOP_IMG").src = "./images/troop_img/" + tmp.visualType + ".png";

  if(parent.SessionStEnable && (localStorage.getItem("saveTitanForumSwitch") == "enabled" || localStorage.getItem("saveTitanForumSwitch") == null))
    sessionStorage.setItem("returnLastTitan", "http://dotdatabase.net/troop.html?name=" + troop.id);
}
/***************************************************Level specific functions*********************************************************/

function jumpToLevel(event){
  event.preventDefault();
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.value();
  document.getElementById("LEVEL_DOWN_BUTTON").dataset.level = event.target.value();
  update(event.target.value());
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
  event.target.dataset.level = parseInt(event.target.dataset.level) - 1;
  document.getElementById("LEVEL_UP_BUTTON").dataset.level = event.target.dataset.level;
  update(event.target.dataset.level);
}
