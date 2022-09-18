function getList(type){
  if(typeof type === "undefined") type = "titan";
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./getTierList.php";
  var params = "&page="+type;//+ d.body.id.toLowerCase();
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200){
      var r = JSON.parse(xhttp.responseText);
      r = r.sort(function(a, b){
        return (b['ups']-b['downs']) - (a['ups']-a['downs']);
        //return a['ups']-a['downs'] <= b['ups']-b['downs'];
      });
      var d=document;
      var table = d.createElement("table");
      var row = table.appendChild(d.createElement("tr"));
      var column = row.appendChild(d.createElement("th"));
      column.innerText = "Rank";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Name";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Likes";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Dislikes";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Rating";
      var rank = 0, oldRating = 0, sameRank = 0;
      for(var i=0; i<r.length; i++){
        if(r[i].id == "undefined" || r[i].id.match("OVR")) continue;
        var rating = r[i].ups - r[i].downs;
        var entity = parent["get"+(type == "titan" ? "Titan" : "Relic")+"ById"](r[i].id);
        if(oldRating != rating){
          rank++;
          oldRating = rating;
          rank+=sameRank;
	  sameRank = 0;
        }
        else sameRank++;
        row = table.appendChild(d.createElement("tr"));
        column = row.appendChild(d.createElement("td"));
        column.innerText = rank;
        column = row.appendChild(d.createElement("td"));
        var img = column.appendChild(d.createElement("img"));
        img.src = "./images/" + entity.uiIcon + ".png";
        img.className = "icon";
        if(type == "relic"){
          img = column.appendChild(d.createElement("img"));
          img.className = "rarity";
          img.src = "./images/rarity/"+entity.rarity+"star_line.png";
        }
        else
          img.style = "margin-right:10px;";
        var link = column.appendChild(d.createElement("a"));
        link.innerText = entity.uiName;
        link.href = "./"+(type == "titan" ? "titan" : "relic")+".html?name=" + entity.id;
        link.target = "titan_frameName";
        link.className = "link";
        //column.innerText = parent["get"+(type == "titan" ? "Titan" : "Relic")+"ById"](r[i].id).uiName;
        column = row.appendChild(d.createElement("td"));
        column.innerText = r[i].ups;
        column = row.appendChild(d.createElement("td"));
        column.innerText = r[i].downs;
        column = row.appendChild(d.createElement("td"));
        column.innerText = rating;
        if(rating < 0) column.className = "cell_negative";
        else if(rating > 0) column.className = "cell_positive";
      }
      d.body.appendChild(table);
    }
  };
  xhttp.send(params);
}

function initTierList(){
  var parameters = decodeURI(location.search.substring(1)).split('&')[0];
  getList(parameters.split('=')[1]);
}