/*
******************************************
**************** SPELL.JS ****************
******************************************
*/

function initSpell() {
  var parameters = location.search.substring(1).split('=');
  //Load from json
  if(typeof parameters[0] === "string" && parameters[0] == "name") {
    var d = document;
    var id = unescape(parameters[1]);
    var spell = parent.getSpell(id);
    var base_spell = spell;
    while(base_spell.level != 1 && typeof base_spell["extends"] !== "undefined")
      base_spell = parent.getSpell(base_spell["extends"]);

    var lvl = 1;
    if(!isNaN(parseInt(spell.id.slice(-2))))
      lvl = parseInt(spell.id.slice(-2));
    else if(!isNaN(parseInt(spell.id.slice(-1))))
      lvl = parseInt(spell.id.slice(-1));
    if(lvl == 25) d.getElementById("SPELL_GRAIN").className = "content_hide";
    var spell_name = d.getElementById("SPELL_NAME");
    spell_name.innerText = base_spell["uiName"];
    spell_name.dataset.id = base_spell.id;

    var tmp;
    var spell_img = d.getElementById("SPELL_IMG");
    spell_img.addEventListener("error", loadAlternate);
    spell_img.src = base_spell.spellIcon.replace("Media/UI", "./images") + ".png";

    //set the spell element
    var element_img = d.createElement("img");
    base_spell.damageType = typeof base_spell.damageType === "undefined" ? "HP" : base_spell.damageType;
    element_img.id = "SPELL_DAMAGE_TYPE2";
    element_img.className = "small_icon";
    element_img.src = "./images/elements/" + base_spell.damageType + ".png";

    var images = d.getElementById('SPELL_IMG_CONTAINER');
    images.appendChild(element_img);

    //set grain and time for upgrade
    d.getElementById("GRAIN_VALUE").innerHTML = (typeof spell.costToUpgrade !== "undefined") ? spell.costToUpgrade.slice(0,-1) : "---";
    d.getElementById("SPELL_TIME").innerHTML = (typeof spell.timeToUpgrade !== "undefined") ? "Time: " + parent.minToDayHourMinute(spell.timeToUpgrade.slice(0, -1)) : "---";


    var table = d.getElementById("SPELL_STATS");
    var row, cell;

    var stat_values = ["qmark", "DAMAGE", "RADIUS", "DURATION", "TRAINING_TIME", "TRAINING_COST"];
    var c = 0;
    for(var i = 0; i < stat_values.length; i++) {
      if(stat_values[i] == "PLACEHOLDER" && typeof spell.placeholder === "undefined"){
          c++;
          continue;
      }

      row = table.insertRow(i - c);
      row.className = "stats_row";
      for(var j = 0; j < 2; j++) {
        cell = row.insertCell(j);
        cell.className = "stats_cell";
        if(j == 0){
          cell.id = "SPELL_" + stat_values[i];
          tmp = parent.getTranslation(stat_values[i]);
          if(stat_values[i] != "qmark"){
            cell.innerText = parent.getTranslation(stat_values[i]);
          }
          if(stat_values[i] == "qmark"){
            cell.innerHTML = "<img src=\"./images/question.png\" class=\"qmark\">";
            cell.firstElementChild.addEventListener("click", showStatFAQ);
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/rating.png";
            icon.className = "icon";
            cell.appendChild(icon);
            var s = cell.appendChild(d.createElement("span"));
            s.innerText = spell.rating;
            s.id = "SPELL_RATING";
            s.style.marginLeft = "5px";
          }
          else if(stat_values[i] == "DAMAGE"){
            var icon = d.createElement("img");
            var dmg_type = base_spell.damageType;
            icon.src = './images/elements/' + dmg_type + '.png';
            icon.id = "damageType";
            icon.className= "icon";
            icon.title = dmg_type + " Damage";
            icon.alt = dmg_type;
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "RADIUS"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Radius.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
          else if(stat_values[i] == "DURATION"){
            var icon = d.createElement("img");
            icon.src = "./images/stat_icons/Duration.png";
            icon.className = "icon";
            cell.appendChild(icon);
          }
        }
        else{
          if(stat_values[i] == 'qmark'){
            var spell_level_select = createCSelect("SPELL_LEVEL_SELECT");
            cell.appendChild(spell_level_select);
          }
          else if(stat_values[i] == "DAMAGE"){
            var span = d.createElement("span");
            cell.appendChild(span);
            span.id = "DAMAGE_SPAN";
            var dmg = 0;

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
              dmg = lvl;
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
            span.innerText = Math.round(dmg);
            span.dataset.fdmg = dmg;
          }
          else if(stat_values[i] == "RADIUS"){
            tmp = spell;
            while(typeof tmp["radius"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
            cell.innerText = tmp.radius;
          }
          else if(stat_values[i] == "DURATION"){
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
            cell.innerText = dur;
          }
          else if(stat_values[i] == "TRAINING_TIME"){
            tmp = spell;
            while(typeof tmp["timeToBuild"] === "undefined")
              tmp = parent.getTroopById(tmp["extends"]);
              cell.innerText = parent.secToMinutes(tmp.timeToBuild.slice(0, -1));
          }
          else if(stat_values[i] == "TRAINING_COST"){
            cell.innerHTML = "<span id=\"costBuildSpan\">" +((typeof spell.costToBuild !== "undefined") ? spell.costToBuild.slice(0, -1) : "---" )+ "</span>";
            cell.innerHTML += "<img style=\"height:12px;width:auto;\" src=\"./images/resources/GOLD.png\" >";
          }
        }
      }

    }

    //create Level options in dropdown
    var dropdown = d.getElementById("SPELL_LEVEL_SELECT");
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
    d.body.style.visibility = "visible";
    //add comments
    //initComments();
  }
}

function loadAlternate(event){
  console.log("Could not load the image: " + event.target.src);
  event.target.onerror = null;
  event.target.src = "./images/relic_cards/broken_pot.png";
  event.preventDefault();
}

function showStatFAQ(){
  parent.alert("Spell's Stats", "Shows the relevant stat information for the selected level.");
}
/***************************************************update stats*********************************************************/
function update(level){
  var d = document;
  var name = d.getElementById("SPELL_NAME").dataset.id;
  var base_spell = parent.getSpell(name);
  var spell = parent.getSpell(name + (level == 1 ? '' : level));
  var select = d.getElementById("SPELL_LEVEL_SELECT");
  if(level != select.value()) select.setOption(level);

  d.getElementById("SPELL_RATING").innerText = spell.rating;

  cells = d.getElementsByClassName("stats_cell");
  for(var i = 0; i < cells.length; i = i + 2){
    if(cells[i].id == "SPELL_DAMAGE"){
      var dmg = 0;
      var dmg_span = d.getElementById("DAMAGE_SPAN");
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
            dmg = spell.spellVar.unitId.slice(-2);
            if(isNaN(parseInt(dmg)))
              dmg = dmg.slice(-1);
            if(isNaN(parseInt(dmg)))
              dmg = 1;
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
    else if(cells[i].id == "SPELL_RADIUS" && typeof spell.radius !== "undefined"){
      cells[i+1].innerText = spell.radius;
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
      cells[i+1].innerText = dur;
    }
    else if(cells[i].id == "SPELL_TRAINING_COST"){
      var tmp = spell;
      while(typeof tmp.costToBuild === "undefined") tmp = parent.getSpell(tmp["extends"]);
      d.getElementById("costBuildSpan").innerText = tmp.costToBuild.slice(0, -1);
    }
    else if(cells[i].id == "SPELL_TRAINING_TIME"){
      var tmp = spell;
      while(typeof tmp.timeToBuild === "undefined") tmp = parent.getSpell(tmp["extends"]);
      cells[i+1].innerText = parent.secToMinutes(tmp.timeToBuild.slice(0, -1))
    }
  }
  if(level == 25){
    d.getElementById("SPELL_GRAIN").className = "content_hide";
  }
  else{
    var grain_container = d.getElementById("SPELL_GRAIN");
    if(grain_container.className == "content_hide")
      grain_container.className = '';
    d.getElementById("GRAIN_VALUE").innerHTML = spell.costToUpgrade.slice(0, -1);
    d.getElementById("SPELL_TIME").innerHTML = "Time: " + parent.minToDayHourMinute(spell.timeToUpgrade.slice(0, -1));
  }

//  if(parent.SessionStEnable && (localStorage.getItem("saveTitanForumSwitch") == "enabled" || localStorage.getItem("saveTitanForumSwitch") == null))
//    sessionStorage.setItem("returnLastTitan", "http://dotdatabase.net/troop.html?name=" + troop.id);
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
