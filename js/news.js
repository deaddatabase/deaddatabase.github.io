function loadNews(){
  document.getElementById("NEWS_HEADER").innerHTML = "What's new:";
  getNews();
}

function getNews(){
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./news.php";
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200){
      var list_item;
      var date, description;
      var news = JSON.parse(xhttp.responseText);
      var list = document.getElementById("NEWS_LIST");
      try{
        for(var i = 0; i < news.length; i++)
        {
          list_item = document.createElement("li");
          date = colorize(makeDate(news[i].date));
          description = rarity(linkify(colorize(makeLinks(news[i].description))));
          list_item.innerHTML = "<b>" + date + ":</b> <p class=\"news_description\">" + description + "</p>";
          list_item.style.fontSize = "1.1em";
          list.appendChild(list_item);
          document.body.appendChild(list_item);
        }
      }
      catch(e){
        console.log(e);
        list_item = document.createElement("li");
        list_item.innerHTML = "<b>Error:</b> <p class=\"news_description\">Try and reload the page. If this message persists, please contact yuki@dotdatabase.net.</p>";
        list_item.style.fontSize = "1.1em";
        list.appendChild(list_item);
        document.body.appendChild(list_item);
      }
      document.body.style.visibility = "visible";
    }
  };
  xhttp.send();
}

//links to pages like the titan page or troop page
function makeLinks(string){
  var tabs = ["titan", "troop", "relic"];
  var type, tmp = string;
  for(var i = 0; i < tabs.length; i++){
    type = tabs[i];
    if(string.match(new RegExp(type))) string = removeSpecifier(string, type);
  }
  return string;
}

function getEntity(type, name){
  if(type == 'titan') return parent.getTitanByName(name);
  else if(type == 'troop') return parent.getTroopByName(name);
  else if(type == 'relic') return parent.getRelicById(name);
}

function removeSpecifier(string, type){
  var name, before, after, url, tmp;
  //extract titan and make a link
  if(string.match(new RegExp("<" + type + ">"))){
    tmp = string.split(new RegExp("<" + type + ">(.+)?"));
    before = tmp[0];
    tmp = tmp[1].split(new RegExp("</" + type + ">(.+)?"));
    name = tmp[0];
    after = tmp[1];
    url = "./" + type + ".html?name=" + getEntity(type, name).id;
    a = "<a href=\"" + url + "\" class=\"link\">" + getEntity(type, name)["uiName"] + "</a>";
    tmp = before + a;
    if(typeof after !== "undefined") tmp += after;
    if(tmp.match(new RegExp(type))) tmp = removeSpecifier(tmp, type);
    return tmp;
  }
  else return string;
}

function colorize(string){
  if(string.match("<c")){
    var split, custom_color = 0, color = "red";
    if(string.match("<c=")){
      split = string.split(new RegExp("<c=" + "(.+)?"));
      custom_color = 1;
    }
    else split = string.split(new RegExp("<c>" + "(.+)?"));
    var before = split[0];
    if(custom_color){
      split = split[1].split(new RegExp('>' + "(.+)?"));
      color = split[0];
    }
    string = split[1].split(new RegExp("</c>" + "(.+)?"));
    var after = string[1];
    var span = "<span style=\"color:" + color + ";\">" + string[0] + "</span>";
    string = before + span;
    if(!(typeof after === "undefined")) string += after;
    if(string.match("<c")) string = colorize(string);
  }
  return string;
}

function makeDate(date){
  var numbers = date.split('-');
  var tmp = '';
  for(var i=0; i<numbers.length; i++){
    tmp += numbers[i];
    if(i < numbers.length-1)
      tmp += "\/";
  }
  return tmp;
}

function linkify(string){
  if(string.match("<link=")){
    var split = string.split(new RegExp("<link=\"" + "(.+)?"));
    var after = split[1].split(new RegExp("\"" + "(.+)?"));
    string = split[0] + "<a class=\"link\" href=\"";
    if(after[0].match(new RegExp("www")))
      string += "http://";
    else if(after[0].match(new RegExp(".html")))
      string += "./";
    string += after[0] + '\"';
    if(!after[0].match(new RegExp(".html")))
      string += " target=\"_blank\""
    if(after[1].match(new RegExp("<link=")))
      string += linkify(after[1]);
    else string += after[1];
    string = string.replace("</link>", "</a>");
  }
  return string;
}

function rarity(string){
  if(string.match(/<\*/)){
    var split = string.split(new RegExp("<\\*" + "(.+)?"));
    var after = split[1].split(new RegExp("\\*" + "(.+)?"));
    string = split[0] + "<img class=\"rarity\" src=\".\/images\/rarity\/"+after[0]+"star_line.png\"";
    if(after[1].match(new RegExp("<\\*")))
      string += rarity(after[1]);
    else string += after[1];
    string = string.replace("*>", ">");
  }
  return string;
}
