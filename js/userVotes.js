function getList(type){
  if(typeof type === "undefined") type = "titan";
  if(typeof userId === "undefined") var userId = parent.userId;
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./getUserVotes.php";
  var params = "&page="+type;
      params += "&user="+userId;
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200){
      var r = JSON.parse(xhttp.responseText);
      r = r.sort(function(a, b){
        return (b["ups"]-b["downs"]) - (a["ups"]-a["downs"]);
      });
      var d=document;
      var title = d.createElement("h2");
      title.innerText = "Your Votes:";
      d.body.appendChild(title);
      var table = d.createElement("table");
      var row = table.appendChild(d.createElement("tr"));
      var column = row.appendChild(d.createElement("th"));
      //column.innerText = "Rank";
      //column = row.appendChild(d.createElement("th"));
      column.innerText = "Name";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Likes";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Dislikes";
      column = row.appendChild(d.createElement("th"));
      column.innerText = "Rating";
      //var rank = 0, oldRating = 0, sameRank = 0;
      for(var i=0; i<r.length; i++){
        var rating = r[i].ups - r[i].downs;
        var entity = parent["get"+(type == "titan" ? "Titan" : "Relic")+"ById"](r[i].id);
        /*if(oldRating != rating){
          rank++;
          oldRating = rating;
          rank+=sameRank;
	  sameRank = 0;
        }*/
        //else sameRank++;
        row = table.appendChild(d.createElement("tr"));
        //column = row.appendChild(d.createElement("td"));
        //column.innerText = rank;
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
        column = row.appendChild(d.createElement("td"));
        column.innerText = r[i].ups;
        column = row.appendChild(d.createElement("td"));
        column.innerText = r[i].downs;
        column = row.appendChild(d.createElement("td"));
        column.innerText = rating;
        if(rating < 0) column.className = "cell_negative";
        else if(rating > 0) column.className = "cell_positive";
      }
      if(r.length != 0)
        d.body.appendChild(table);
      else{
        var h = d.body.appendChild(d.createElement("h4"));
        h.innerText = "No votes were recorded for this user.";
      }
    }
  };
  xhttp.send(params);
}

function initUserVotes(){
  var parameters = decodeURI(location.search.substring(1)).split('&')[0];
  getList(parameters.split('=')[1]);
}