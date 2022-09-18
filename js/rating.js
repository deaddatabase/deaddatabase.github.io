function getRating(name){
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./getRating.php";
  var params = "id=" + name;
      params += "&page="+ d.body.id.toLowerCase();
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200){
      var rating = JSON.parse(xhttp.responseText).rating;
      var r = document.getElementById("RATING");
      r.innerText = rating;
      if(rating < 0)
        r.className = "rating_negative";
      else if(rating > 0)
        r.className = "rating_positive";
      else
        r.className = '';
    }
  };
  xhttp.send(params);
}

function sendRating(event){
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./sendRating.php";
  var rating = event.target.id;
  var user = typeof userId === "undefined" ? parent.userId : userId;
  if(typeof user === "undefined") {
    parent.alert("Error", "Rating could not be sent. Please reload the page and try again.");
    return;
  }
  var params = "id=" + event.target.dataset.id;
      params += "&page="+ d.body.id.toLowerCase();
      params += "&user="+ user;
      params += "&up=" + (rating == "RATE_UP" ? 1 : 0);
      params += "&down=" + (rating == "RATE_DOWN" ? 1 : 0);

  xhttp.open("POST", url, true);
  //Send the proper header information along with the request
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200){
      var rating = JSON.parse(xhttp.responseText).rating;
      var r = document.getElementById("RATING");
      r.innerText = rating;
      if(rating < 0)
        r.className = "rating_negative";
      else if(rating > 0)
        r.className = "rating_positive";
      else
        r.className = '';
    }
  };
  xhttp.send(params);
}

function initRating(){
  var d = document;
  var name = d.getElementById(d.body.id + "_NAME");
  name.appendChild(d.createElement("br"));
  //like image
  var like_img = d.createElement("img");
  like_img.id = "RATE_UP";
  like_img.className = "icon_name";
  like_img.dataset.id = name.dataset.id;
  like_img.title = "Like!";
  like_img.src = "./images/Like.png";
  like_img.addEventListener("click", sendRating);
  name.appendChild(like_img);
  //rating span
  var rating = d.createElement("span");
  rating.id = "RATING";
  rating.dataset.id = name.dataset.id;
  rating.addEventListener("click", sendRating);
  name.appendChild(rating);
  //dislike image
  var dislike_img = d.createElement("img");
  dislike_img.id = "RATE_DOWN";
  dislike_img.className = "icon_name";
  dislike_img.dataset.id = name.dataset.id;
  dislike_img.title = "Dislike!";
  dislike_img.src = "./images/Dislike.png";
  dislike_img.addEventListener("click", sendRating);
  name.appendChild(dislike_img);
}