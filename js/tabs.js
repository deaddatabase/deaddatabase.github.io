var translate_menu = true;
String.prototype.replaceArray = function(find, replace){
  var replace_string = this;
  var i = 0;
  for (; i < find.length; i++) {
    replace_string = replace_string.replace(find[i], replace[i]);
  }
  return replace_string;
};
var titan_count = 0;
var relic_count = 0;

function showTab(e){
  if(typeof e.target.href === "undefined") var target = e.target.parentElement;
  else var target = e.target;
  var d = document, new_content = undefined;
  var selected_id = getHash( target.getAttribute("href") );
  var tab_list = d.getElementById("TABS");
  var tab_list_items = tab_list.children;
  var width = 0, mW = 0;
  for ( var i = 0, l = tab_list_items.length; i < l; i++ ) {
      var tab_link = tab_list_items[i].firstElementChild;
      var id = getHash( tab_link.getAttribute("href") );
      var content_div = d.getElementById( id );
      if ( id == selected_id ) {
        new_content = content_div;
        tab_link.className = "selected";
        content_div.className = "tab_content active_tab";
        content_div.style = "height:calc(100% - " + (tab_list.offsetHeight+30) + "px);";
      } else {
        tab_link.className = '';
        content_div.className = "tab_content content_hide";
      }
      width += tab_list_items[i].offsetWidth;
  }

  e.preventDefault();
  target.blur();
  // Stop the browser following the link
}

function getFirstChildWithTagName( element, tag_name ){
  for ( var i = 0; i < element.childNodes.length; i++ )
    if ( element.childNodes[i].nodeName == tag_name )
      return element.childNodes[i];
}

function getHash( url ){
  return url.substring( url.lastIndexOf ('#') + 1 );
}

function initTabs(){
  // Grab the tab links and content divs from the page
  var d = document
  var width = 0;
  var tab_list = d.getElementById("TABS");
  var tab_list_items = tab_list.children;
  for ( var i = 0; i < tab_list_items.length; i++ ) {
      var tab_link = tab_list_items[i].firstElementChild;
      tab_link.addEventListener("click", showTab);
      if ( i == 0 ){
        tab_link.className = "selected"; //Highlight the first tab
        document.getElementById( getHash(tab_link.getAttribute("href")) ).className = "tab_content active_tab"
      }// Hide all content divs except the first
      else document.getElementById( getHash(tab_link.getAttribute("href")) ).className = "tab_content content_hide";
      width += 37;
  }
  d.getElementById("TITAN_LIST_CONTAINER").style = "height:calc(100% - " + (tab_list.offsetHeight+30) + "px);";
  //if(!mobilecheck())
    //d.getElementById("TAB_CONTAINER").style = "min-width:" + (width+2) + "px;";
}

function loadTitanBuild(event){
  load_titan(event.target.dataset.name, event.target.dataset.id);
}

function addToCollection(event){
      var id = event.target.dataset.id;
      var name = event.target.dataset.name;
      var status = event.target.dataset.status;
      if(localStorage.getItem("collectionSize") == null) var collection_size = 0;
      else var collection_size = parseInt(localStorage.getItem("collectionSize"));
      if(status == "owned"){
        event.target.dataset.status = "missing";
        event.target.src = "./images/subtract.png";
        localStorage.removeItem(id);
        localStorage.setItem("collectionSize", collection_size-1);
        if(collection_size-1 == 0) localStorage.removeItem("collectionSize");
        toast("Removed " + name + " from the collection.");
      }
      else if(status == "missing"){
        event.target.dataset.status = "owned";
        event.target.src = "./images/add.png";
        localStorage.setItem(id, "owned");
        localStorage.setItem("collectionSize", collection_size+1);
        toast("Added " + name + " to the collection.");
      }
    }

function showRelicAvailability(event){
  event.preventDefault();
  alert(event.target.dataset.name, "Can be obtained from:<br>" + event.target.dataset.pools);
}

function initStaticTabs(){
  var d = document;
  /*var entries = d.getElementsByClassName("list_entry")
  for(var i=0; i<entries.length; i++){
    //done with inline events
    entries[i].addEventListener("click", clickLinks);
  }*/
  var compare_links = d.getElementsByClassName("compare_link")
  for(var i=0; i<compare_links.length ; i++){
    compare_links[i].onclick = openInCompareFrame
    if(LocalStEnable && (localStorage.getItem("compare") == "disabled" || localStorage.getItem("compare") == null))
      compare_links[i].className += " content_hide";
  }
  var load_builds = d.getElementsByClassName("load_build");
  for(var i=0; i<load_builds.length; i++){
    load_builds[i].onclick = loadTitanBuild;
    if(localStorage.getItem(load_builds[i].dataset.id) == null)
      load_builds[i].className += " content_hide";
  }
  var relic_collection = d.getElementsByClassName("relic_collection");
  for(var i=0; i<relic_collection.length;i++){
    r_id = relic_collection[i].dataset.id;
    if(localStorage.getItem("collection") == null || localStorage.getItem("collection") == "disabled")
      relic_collection[i].className += " content_hide";
    if(localStorage.getItem(r_id) == "owned"){
      relic_collection[i].src = "./images/add.png";
      relic_collection[i].dataset.status = "owned";
    }
    else{
      relic_collection[i].src = "./images/subtract.png";
      relic_collection[i].dataset.status = "missing";
    }
    relic_collection[i].onclick = addToCollection;
  }
  createFilter("titan", d.getElementById("TITAN_LIST_CONTAINER"));
  createFilter("relic", d.getElementById("RELIC_LIST_CONTAINER"));

  var searchboxes = d.getElementsByClassName("filter_name");
  for(var i=0; i<searchboxes.length; i++){
    searchboxes[i].addEventListener("search", function(event){
      event.preventDefault();
      if(event.target.value == ''){
        var type = event.target.id.split('_')[0];
        var elements = d.getElementById(type + "_LIST").getElementsByClassName("list_entry");
        for(var i=0; i<elements.length; i++)
          elements[i].parentElement.className = elements[i].parentElement.className.replace(" content_hide", '');
      }
    });
    searchboxes[i].addEventListener("keyup", function(event){
      var type = event.target.id.split('_')[0];
      var elements = d.getElementById(type + "_LIST").getElementsByClassName("list_entry");
      for(var i=0; i<elements.length; i++){
        if(elements[i].innerText.split('(')[0].toLowerCase().indexOf(event.target.value.toLowerCase()) == -1){
          if(elements[i].parentElement.className.indexOf("content_hide") == -1)
            elements[i].parentElement.className += " content_hide";
        }
        else elements[i].parentElement.className = elements[i].parentElement.className.replace(" content_hide", '');
      }
    });
  }
  /*var relic_qmarks = d.getElementsByClassName("qmark_relic_menu");
  for(var i=0; i<relic_qmarks.length; i++){
     relic_qmarks[i].addEventListener("click", alert.bind(null, relic_qmarks[i].dataset.name, "Can be obtained from:<br>" + relic_qmarks[i].dataset.pools));
     relic_qmarks[i].addEventListener("contextmenu", absorbEvent);
  }*/
  var filters = d.getElementsByClassName("c_select");
  for(var i=0; i<filters.length; i++)
    filters[i].finalise();
  initTabs();
}

function createFilter(key, parentElement){
  d = document;
  filter_options = {
    "unitSpecies":[
      ["HUMAN", "Human"],
      ["ELITHEN", "Elithen"],
      ["MOSSMANE", "Mossmane"],
      ["RAGNAR", "Ragnar"],
      ["UNAK", "Unak"]
    ],
    "archetype":[
      ["BERSERKER", "Berserker"],
      ["CHAMPION", "Champion"],
      ["GUARDIAN", "Guardian"],
      ["INFILTRATOR", "Infiltrator"],
      ["PALADIN", "Paladin"],
      ["RANGER", "Ranger"],
    ],
    "effect":[
      ["HEALTH", "Health"],
      ["HEALTH_BASE", "Base Health"],
      ["ARMOUR", "Armor"],
      ["DAMAGE_TYPE_RESIST", "Element Resist"],
      ["RESIST_ALL", "Resist All"],
      ["RESIST_MELEE", "Melee Resist"],
      ["RESIST_RANGED", "Ranged Resist"],
      ["DAMAGE_TYPE", "Element Change"],
      ["DAMAGE_TYPE_BOOST", "Element Damage"],
      ["ATTACK", "Damage"],
      ["ATTACK_BASE", "Base Damage"],
      ["ARMOUR_PIERCE", "Armor Piercing"],
      ["CRITICAL_RATE_BOOST", "Critical"],
      ["CHARGING_BOOST", "Charge"],
      ["FLANKING_BOOST", "Flanking Damage"],
      ["RESIST_CHARGING", "Charge Resist"],
      ["RESIST_FLANKING", "Flanking Resist"],
      ["BATTLE_SPELL_GAIN", "Spells"],
      ["RADIUS_BOOST", "Radius"],
      ["DURATION_BOOST", "Duration Boost"],
      ["UNIT_TYPE_DAMAGE_BOOST", "Damage Vs. Troops"],
      ["UNIT_TYPE_DAMAGE_RESIST", "Resist Vs. Troops"],
    ],
    "target":[
      ["SPECIFIC_ARCHETYPE", "Archetype_"],
      ["ALL_HEROES", "Titans"],
      ["ALL_UNITS", "Titan+Troops"],
      ["ARMY", "Troops"],
      ["ALL_SPELLS", "Spells"],
      ["SPECIFIC_UNIT", "Any Unit"],
      ["SPECIFIC_SPELL", "Spells"],
      ["SPECIFIC_SUMMON_UNIT", "Troops"],
    ],
    "specificTarget":[
      ["EV", "Event"],
      ["Militia", "Militia"],
      ["MilitiaSummon", "Ω Militia"],
      ["MilitiaRaid", "Corrupted Militia"],
      ["Archer", "Archers"],
      ["ArcherSummon", "Ω Archers"],
      ["ArcherRaid", "Corrupted Archers"],
      ["Pikemen", "Spearmen"],
      ["PikemenSummon", "Ω Spearmen"],
      ["PikemenRaid", "Corrupted Spearmen"],
      ["Unak", "Grenadiers"],
      ["UnakSummon", "Ω Grenadiers"],
      ["UnakRaid", "Corrupted Grenadiers"],
      ["Elithen", "Imperials"],
      ["ElithenSummon", "Ω Imperials"],
      ["ElithenRaid", "Corrupted Imperials"],
      ["Mossmane", "Panthers"],
      ["MossmaneSummon", "Ω Panthers"],
      ["MossmaneRaid", "Corrupted Panthers"],
      ["Ragnar", "Goliaths"],
      ["RagnarSummon", "Ω Goliaths"],
      ["RagnarRaid", "Corrupted Goliaths"],
      ["AxeThrower", "Storm Maiden"],
      ["AxeThrowerSummon", "Ω Storm Maiden"],
      ["AxeThrowerRaid", "Corrupted Storm Maiden"],
      ["SkeletonHorde", "Horde"],
      ["SkeletonHordeSummon", "Ω Horde"],
      ["SkeletonRaid", "Corrupted Horde"],
      ["Skeleton", "Skeleton"],
      //["Skeleton", "Raise Dead Skeleton"],
      ["Fireball", "Fireball"],
      ["Shield", "Shield"],
      ["Rage", "Rage"],
      ["Freeze", "Freeze"],
      ["Lightning", "Lightning"],
      ["Terror", "Terror"],
      ["MeteorStrike", "Meteor Strike"],
      ["PoisonCloud", "Poison Cloud"],
      ["LightningStorm", "Lightning Storm"],
      ["RaiseDead", "Raise Dead"],
    ]
  };
  var types = key == "titan" ? ["unitSpecies", "archetype"] : ["effect", "target", "specificTarget"];
  var filter_container = d.createElement("div");
  filter_container.className = "filter_container_" + key;
  parentElement.insertBefore(filter_container, parentElement.firstChild);
  for(var w = 0; w < types.length; w++){
    var options = filter_options[types[w]];
    var div = d.createElement("div");
    div.className = "flex_row nowrap";
    var filter = createCSelect(types[w].toUpperCase() + "_FILTER_TAB_" + key.toUpperCase());
    var help = d.createElement("img");
    help.className = "qmark"

    filter.appendOption("---", "---");
    help.src = "./images/question.png";

    if(key == "titan")
      filter.addEventListener("change", hideTitansFromList);
    else if(key == "relic")
      filter.addEventListener("change", hideRelicsFromList);
    switch(types[w]) {
      case "unitSpecies":
        help.addEventListener("click", function(){ alert("Filter:Race", "Filter what Titan Race you would like to view."); });
        break;
      case "archetype":
        help.addEventListener("click", function(){ alert("Filter:Class", "Filter what Titan Class you would like to view."); });
        break;
      case "effect":
        help.addEventListener("click", function(){ alert("Filter:Effect", "Filter what type of effect the relic should have."); });
        break;
      case "target":
        help.addEventListener("click", function(){ alert("Filter:Target", "Filter what Troop(s)/Titans the relic affects."); });
        break;
      case "specificTarget":
        help.addEventListener("click", function(){ alert("Filter:Specific", "Filter a specific Unit/Class/Spell the relic has an effect on."); });
        break;
      default:
        ;
    }
    div.appendChild(help);
    div.appendChild(filter);
    for(var j=0; j<options.length; j++){
      var option = options[j];
      switch(types[w]) {
		    case "unitSpecies":
					filter.appendOption(getTranslation("TXT_" + option[0] + "_NAME"), option[0]);
		      break;
		    case "archetype":
					filter.appendOption(getTranslation("TXT_ARCHETYPE_" + option[0]), option[0]);
		      break;
		    case "effect":
          if(option[0] == "ATTACK_BASE")
  					filter.appendOption(getTranslation("BASE_DAMAGE"), option[0]);
          if(option[0] == "HEALTH_BASE")
  					filter.appendOption(getTranslation(option[1]), option[0]);
          else
  					filter.appendOption(option[1], option[0]);
		      break;
		    case "target":
					if(j == 2){ //Normal Troops
            _split = option[1].split("+");
						filter.appendOption(getTranslation(_split[0]) + " + " + getTranslation(_split[1]), option[0]);
          } else if(j == 5)
						filter.appendOption(getTranslation("TXT_UINAME_" + option[0].replace("AxeThrower", "Viking")), option[0]);
          else if(j == 7)
						filter.appendOption("Ω " + getTranslation(option[1]), option[0]);
          else
						filter.appendOption(getTranslation(option[1]), option[0]);
		      break;
		    case "specificTarget":
          if(option[0].includes("Summon")) {
						filter.appendOption("Ω " + getTranslation("TXT_UINAME_" + option[0].replace("Summon", "").replace("AxeThrower", "Viking")), option[0]);
          } else if(option[0].includes("Raid")) {
						filter.appendOption(getTranslation("CORRUPTED_UNIT").replace("#[unit]", getTranslation("TXT_UINAME_" + option[0].replace("Skeleton", "SkeletonHorde").replace("Raid", "").replace("AxeThrower", "Viking"))), option[0]);
          } else if(j >= 1 && j <= 28) { //Normal Troops
						filter.appendOption(getTranslation("TXT_UINAME_" + option[0].replace("AxeThrower", "Viking")), option[0]);
          } else if(j >= 29) { //Spells
						filter.appendOption(getTranslation("TXT_" + option[0].replace("LightningStorm", "Lightning_Storm").replace("PoisonCloud", "Poison_Cloud").replace("RaiseDead", "Raise_Dead").replace("MeteorStrike", "Meteor_Strike") + "_NAME"), option[0]);
          } else if(j == 0) { //Event
						filter.appendOption(getTranslation(option[1]), option[0]);
          } else {
						filter.appendOption(getTranslation(option[1]), option[0]);
          }
		      break;
		    default:
		      filter.appendOption(option[1], option[0]);
    	}
    }
    filter_container.appendChild(div);
    if(key == "titan")
      filter.finalise("115px")
    else
      filter.finalise("150px")
    div.style = "min-width:calc("+filter.style.width+" + 30px + 1em);";
  }
  var searchbox = d.createElement("input");
  searchbox.type = "search";
  searchbox.id = key.toUpperCase() + "_FILTER_BY_NAME";
  searchbox.className = "filter_name";
  if(key == "titan")
    searchbox.size = "6";
  else
    searchbox.size = "10";
  searchbox.placeholder = "Filter " + capital(key) + 's!';
  filter_container.appendChild(searchbox);
}

function clickLinks(event){
    event.target.blur();
    //event.preventDefault();
    if(mobilecheck() && window.screen.width < 554 ){
      showMenu();//in index.js
    }
    //sendGaEvent((event.target.href.split(".html")[0]).slice(-5), "select", event.target.innerText.replace("<span style=\"color:red;\">*</span>", ''));
}

function absorbEvent(e){
  e.preventDefault && e.preventDefault();
  e.stopPropagation && e.stopPropagation();
  e.cancelBubble = true;
  e.returnValue = false;
  return false;
}
