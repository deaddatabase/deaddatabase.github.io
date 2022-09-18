/*SERVICE WORKER*/

const myCaches = [
  {
    "name":"dotdatabase-app-shell-core",
    "urls":[//all css, js, html requests go here
          "/",//root directory - index.html redirects to this, skip
          "/titan.html",
          "/news.html",
          "/troop.html",
          "/relic.html",
          "/spell.html",
          "/tierList.html",
          "/userVotes.html",
          "/css/customAlert.css",
          "/css/index.css",
          "/css/banner.css",
          "/css/customSelect.css",
          "/css/tabs.css",
          "/css/loading.css",
          "/css/popup.css",
          "/css/toast.css",
          "/css/titan.css",
          "/css/comments.css",
          "/js/rating.js",
          "/css/troop.css",
          "/css/relic.css",
          "/css/spell.css",
          "/js/index.js",
          "/js/banner.js",
          "/js/customSelect.js",
          "/js/func.js",
          "/js/customAlert.js",
          "/js/popup.js",
          "/js/loading.js",
          "/js/compress.js",
          "/js/tabs.js",
          "/js/titan.js",
          "/js/tierList.js",
          "/js/userVotes.js",
          "/js/comments.js",
          "/js/rating.js",
          "/js/troop.js",
          "/js/spell.js",
          "/js/relic.js"]
  },
  {
    "name":"dotdatabase-app-shell-images",
    "urls":[//images that are not portraits of relic cards
          "/images/add.png",
          "/images/Confirm.png",
          "/images/Like.png",
          "/images/Dislike.png",
          "/images/delete.png",
          "/images/share_link.png",
          "/images/levelUP2.png",
          "/images/load.png",
          "/images/question.png",
          "/images/save.png",
          "/images/screenshot.png",
          "/images/loading_circle.png",
          "/images/loading_sword.png",
          "/images/subtract.png",
          "/images/elements/ACID.png",
          "/images/elements/EARTH.png",
          "/images/elements/FIRE.png",
          "/images/elements/FREEZE.png",
          "/images/elements/HP.png",
          "/images/elements/LIGHTNING.png",
          "/images/races/race_human.png",
          "/images/races/race_elithen.png",
          "/images/races/race_unak.png",
          "/images/races/race_ragnar.png",
          "/images/races/race_mossmane.png",
          "/images/rarity/1star_line.png",
          "/images/rarity/2star_line.png",
          "/images/rarity/3star_line.png",
          "/images/rarity/4star_line.png",
          "/images/rarity/5star_line.png",
          "/images/rarity/AC1_R4_patch.png",
          "/images/rarity/AC2_R4_patch.png",
          "/images/rarity/AC3_R4_patch.png",
          "/images/rarity/AC1_R3_patch.png",
          "/images/rarity/AC2_R3_patch.png",
          "/images/rarity/AC3_R3_patch.png",
          "/images/rarity/AC1_R2_patch.png",
          "/images/rarity/AC2_R2_patch.png",
          "/images/rarity/AC3_R2_patch.png",
          "/images/rarity/AC1_R1_patch.png",
          "/images/rarity/AC2_R1_patch.png",
          "/images/rarity/AC3_R1_patch.png",
          "/images/resources/FOOD.png",
          "/images/resources/GOLD.png",
          "/images/tab_icons/titans.png",
          "/images/tab_icons/relics.png",
          "/images/tab_icons/spells.png",
          "/images/tab_icons/troops.png",
          "/images/skill_icons/DefensiveTitan.png",
          "/images/skill_icons/DefensiveUnak.png",
          "/images/skill_icons/DefensiveMossmane.png",
          "/images/skill_icons/DefensiveSpearmen.png",
          "/images/skill_icons/DefensiveArcher.png",
          "/images/skill_icons/DefensiveMilitia.png",
          "/images/skill_icons/DefensivePikemen.png",
          "/images/skill_icons/DefensiveRagnar.png",
          "/images/skill_icons/DefensiveStormGuards.png",
          "/images/skill_icons/DefensiveSkeleton.png",
          "/images/skill_icons/OffensiveTitan.png",
          "/images/skill_icons/OffensiveUnak.png",
          "/images/skill_icons/OffensiveRagnar.png",
          "/images/skill_icons/OffensiveMossmane.png",
          "/images/skill_icons/OffensivePikemen.png",
          "/images/skill_icons/OffensiveSpearmen.png",
          "/images/skill_icons/OffensiveSkeleton.png",
          "/images/skill_icons/OffensiveArcher.png",
          "/images/skill_icons/OffensiveMilitia.png",
          "/images/skill_icons/OffensiveStormGuards.png",
          "/images/skill_icons/SpecialTitan.png",
          "/images/skill_icons/SpecialUnak.png",
          "/images/skill_icons/SpecialRagnar.png",
          "/images/skill_icons/SpecialRagnar_02.png",
          "/images/skill_icons/SpecialMossmane.png",
          "/images/skill_icons/SpecialPikemen.png",
          "/images/skill_icons/SpecialSpearmen.png",
          "/images/skill_icons/SpecialArcher.png",
          "/images/skill_icons/SpecialMilitia.png",
          "/images/skill_icons/SpecialStormGuards.png",
          "/images/skill_icons/SpecialSkeleton.png",
          "/images/skill_icons/Tier4_DefensiveTitan.png",
          "/images/skill_icons/Tier4_OffensiveTitan.png",
          "/images/skill_icons/Locked.png",
          "/images/relic_cards/ability_lock.png",
          "/images/relic_cards/ability_unlock.png",
          "/images/relic_cards/ability_max.png",
          "/images/relic_cards/broken_pot.png",
          "/images/stat_icons/Armour.png",
          "/images/stat_icons/ArmourPierce.png",
          "/images/stat_icons/CriticalRate.png",
          "/images/stat_icons/Health.png",
          "/images/stat_icons/Speed.png",
          "/images/stat_icons/Charge.png",
          "/images/stat_icons/Duration.png",
          "/images/stat_icons/Radius.png",
          "/images/stat_icons/rating.png",
          "/images/combat_category/CombatType Heavy.png",
          "/images/combat_category/CombatType Mobile.png",
          "/images/combat_category/CombatType Ranged.png",
          "/images/titan_class/class_guardian.png",
          "/images/titan_class/class_paladin.png",
          "/images/titan_class/class_ranger.png",
          "/images/titan_class/class_champion.png",
          "/images/titan_class/class_berserker.png",
          "/images/titan_class/class_infiltrator.png",
          "/images/titan_class/class_guardian.png",
          "/images/troops/omega.png",
          "/images/troops/Archer_Decal.png",
          "/images/troops/Elithen_Decal.png",
          "/images/troops/Mossmane_Decal.png",
          "/images/troops/Unak_Decal.png",
          "/images/troops/Ragnar_Decal.png",
          "/images/troops/Militia_Decal.png",
          "/images/troops/Pikemen_Decal.png",
          "/images/troops/SkeletonHorde_Decal.png",
          "/images/troops/Skeleton_Decal.png"]
  },
  {
      "name":"dotdatabase-app-titan-images",
      "urls":[]
  },
  {
      "name":"dotdatabase-app-relic-images",
      "urls":[]
  },
  {
      "name":"dotdatabase-app-non-shell",
      "urls":[]
  }
];

const dbName = "dotdatabase_app_data";
const objStoreName = "json";
const whitelistDB = [
                     "PlayerTitles","RelicInfusionData","baseTranslation",
                     "spells","SpoilTypes","SpoilPoolTypes",
                     "titans","Titans_Old","TitanBuffs","TitanVariables",
                     "TitanSkillPools","TitanSkillPools_Old","TitanPatchData",
                     "TitanCollections","troops","AutocastAbilities",
                     "titanLevel","AutocastSpoilTypes"
                    ];
var db;

function initDB(){//initialize DB
    var request = indexedDB.open(dbName);
    request.onerror = function(event) {
      console.log("Error opening " + dbName + ": User didn't allow app to access IndexedDB.");
    };
    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      var objectStore = db.createObjectStore(objStoreName, {keyPath: "id"});
    };
    request.onsuccess = function(event) {
      db = event.target.result;
      db.onerror = function(event) {
        console.log("Database error: " + event.target.errorCode);
      };
    };
}
initDB();

function sendMessage(msg, tag){
  if(typeof tag === "undefined") tag = "toast";
  self.clients.matchAll({
    includeUncontrolled: true
  }).then(function(clientList) {
    clientList.map(function(client) {
      client.postMessage({"tag":tag, "data":msg});
    });
  });
}

self.addEventListener("install", event => {
  event.waitUntil(Promise.all(
    myCaches.map(function (myCache) {
      return caches.open(myCache.name).then(function (cache) {
        //return cache.addAll(myCache.urls);
        myCache.urls.map(function(url){
          var r = new Request(url, {
                method: "get"
                //cache: "no-cache"
              });
          return cache.add(r);
        });
      })
      .catch(function(error){
        console.log(error);
      })
    })
  ));
  self.skipWaiting();
});


self.addEventListener('activate', event => {
  var cacheWhitelist = [];
  for(var i=0; i<myCaches.length; i++)
    cacheWhitelist.push(myCaches[i].name);
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1)
              return caches.delete(cacheName);
          })
        );
      })
  );

    db.transaction(objStoreName, "readwrite").objectStore(objStoreName).getAllKeys().onsuccess = function(e) {
      var keys = e.target.result;
      for(var i=0; i<keys.length;i++){
        if(!whitelistDB.toString().match(keys[i])){
          db.transaction(objStoreName, "readwrite").objectStore(objStoreName).delete(keys[i]).onsuccess = function(e) {
            console.log("Removed " + e.target.result + " from indexedDB.");
          }
        }
      }
    };


  self.clients.claim();
});


self.addEventListener("fetch", function(event) {
  if(event.request.url.indexOf("dotdatabase.net") == -1) return;
  else if(event.request.url.slice(-5) == ".json"){//Data files from the server
    event.respondWith(
      new Promise(function(resolve){
          //extract name from url
          var id = event.request.url.split('/');
          id = id[id.length-1].split(".")[0];
          var request = db.transaction(objStoreName).objectStore(objStoreName).get(id);
          request.onsuccess = function(e) {
            if(typeof e.target.result !== "undefined"){
              //if json was found in indexedDB
              var headers = {
                 "status": 200,
                 "statusText":"OK",
                 "Last-Modified":e.target.result.date
              };
              var data = new Blob([e.target.result.data], {"type":"application/json"});
              resolve(new Response(data, headers));
              //check if this is the newest version
              fetch(event.request.url, {
                method: "head",
                cache: "no-cache"
              })
              .then(function(responseHead){
                if(responseHead.ok && responseHead.headers.get("Last-Modified") != e.target.result.date){
                  //Syncing changed file to Database
                  fetch(event.request.url, {
                    method: "post",
                    cache: "no-cache"
                  })
                  .then(function(response){
                    response.json().then(function(json){

                      db.transaction(objStoreName, "readwrite").objectStore(objStoreName).put({
                        "id":id,
                        "date":response.headers.get("Last-Modified"),
                        "data":JSON.stringify(json)
                      })
                      .onsuccess = function(e) {
                        sendMessage(JSON.stringify(json), "UpdateData");
                      }
                    })
                    .catch(function(error){
                      console.log("Error getting json from response: " + id);
                    });
                  });
                }
              })
              .catch(function(error){
                console.log("Failed to get the latest version of " + id + ": " + error);
              });
            }
            else{
              //get json from network and store it in indexedDB
              var fetchRequest = event.request.clone();
              fetch(event.request.url, {
                method: "post",
                cache: "no-cache"
              })
              .then(function(response){
                if(response.ok){
                  var responseToCache = response.clone();
                  responseToCache.json().then(function(json){
                    db.transaction(objStoreName, "readwrite").objectStore(objStoreName).put({
                      "id":id,
                      "date":responseToCache.headers.get("Last-Modified"),
                      "data":JSON.stringify(json)
                    })
                    .onsuccess = function(e) {
                      sendMessage("Data now available for offline use.");
                    }
                  });
                  resolve(response);
                }
               })
              .catch(function(error){
                console.log("Failed to get " + id + ": " + error);
              });
            }
          };
        })
        .then(function(response){
          return response;
        })
        .catch(function(error){
          initDB();//promise rejected, load data from web and set up database for next reload
          return fetch(event.request.url, {
            method: "post",
            cache: "no-cache"
          }).then(function(response){return response;});
        })
    );
  }//Data files END
  else{
    var url_no_query = event.request.url.split('?')[0];
    //all request go to non shell, except for core, titan and relic imgs
    var cache_number = 4;
    if(url_no_query.match(/\.css$|\.js$|\.html$|\/$/)){
      //handle core requests
      cache_number = 0;
    }
    else if(url_no_query.slice(-4) == ".png"){
      if(url_no_query.match("Portraits/")){//Titan images
        cache_number = 2;
      }
      else if(url_no_query.match(/relic_cards\/(combat|event)/)){//relic images
        cache_number = 3;
      }
      else if(url_no_query.match(/troop_img/)){//troop images
        cache_number = 4;
      }
      else cache_number = 1;
    }
    if(event.request.method == "POST"){
      event.respondWith(new Promise(function(resolve){
	return fetch(event.request.clone())
          .then(function(response) {
            resolve(response);
          })
	  .catch(function(error){
            console.log("Failed to fetch: "  + event.request);
            resolve(new Response());
          });
      }));
    }
    else{
    //handle caches
      event.respondWith(new Promise(function(resolve){
        caches.open(myCaches[cache_number].name).then(function(cache){
          cache.match(event.request, {"ignoreSearch": true})
          .then(function(response){
          if (response){
            //chache hit, try to add latest resource, then return response
            cache.add(new Request(url_no_query, {
              method: "get",
              cache: "no-cache"
            }))
            .catch(function(error){
              console.log("Error fetching update " + event.request.url + ": " + error);
            });
            resolve(response);
            return;
          }
          // Didn't find it in core cache, add it
          // IMPORTANT: Clone the request. A request is a stream and
          // can only be consumed once. Since we are consuming this
          // once by cache and once by the browser for fetch, we need
          // to clone the response.
          //var fetch_request = event.request.clone();
          var fetch_request = event.request.clone();

          return fetch(fetch_request)
          .then(function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              resolve(response);
              return;
            }

            var response_to_cache = response.clone();
            cache.put(event.request, response_to_cache);

            resolve(response);
            return;
          })
          .catch(function(error){
            console.log("Failed to fetch: "  + url_no_query);
            resolve(new Response());
            return;
          });
        }).catch(function(e){
          console.log("Failed to match");
          resolve(new Response());
          return;
        })
      })
    }));
    }//end else
  }
});

self.addEventListener("sync", function(event) {
  if(event.tag == "DeleteData"){
    caches.keys().then(function(names) {
      names.map(function(name){
        caches.delete(name);
      });
      sendMessage("Wiped cache.");
    });
    var request = indexedDB.deleteDatabase(dbName);
    request.onsuccess = function(){
      sendMessage("Deleted offline data.");
      sendMessage("Deleted offline data.", event.tag);
    };
    request.onblocked = function(e){
      db.close();
      //setup db for next reload
      initDB();
    };
  }
  else if(event.tag == "DeleteRedundantData"){
    db.transaction(objStoreName, "readwrite").objectStore(objStoreName).getAllKeys().onsuccess = function(e) {
      var keys = e.target.result;
      for(var i=0; i<keys.length;i++){
        if(!whitelistDB.toString().match(keys[i])){
          db.transaction(objStoreName, "readwrite").objectStore(objStoreName).delete(keys[i]).onsuccess = function(e) {
            console.log("Removed " + e.target.result + " from indexedDB.");
          }
        }
      }
    };
  }
});
