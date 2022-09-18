function initComments(){
  //create comment input
  var d = document;
  var form = d.createElement("form");
  var fieldset = d.createElement("fieldset");
  var legend = d.createElement("legend");
  var page = d.createElement("input");
	var password = d.createElement("label");
  var author = d.createElement("input");
  var comment = d.createElement("textarea");
  var remainCharAuthor = d.createElement("div");
	var remainCharComment = d.createElement("div");
	var saveBuild = d.createElement("input");
	var submitButton = d.createElement("input");

	var type = d.body.id;

	form.id = "SUBMIT_COMMENT";
	fieldset.id = "SUBMIT_COMMENT_FIELDSET";
	fieldset.style = "display:inline-block;";
	legend.innerText = "Submit a comment";
	fieldset.appendChild(legend);
	page.type = "hidden";
	page.id = "PAGE";
	page.value = type.toLowerCase() + ":" + d.getElementById(type + "_NAME").dataset.id;
	fieldset.appendChild(page);
	password.className = "password";
	password.innerText = "Password:";
	var pwd = password.appendChild(d.createElement("input"));
	pwd.className = "password";
	pwd.type = "text";
	pwd.id = "PASS";
	fieldset.appendChild(password);
	fieldset.innerHTML += "Name:";
	author.id = "COMMENT_AUTHOR";
	author.type = "text";
	author.name = "name";
	fieldset.appendChild(author);
	remainCharAuthor.id = "REMAINING_AUTHOR";
	remainCharAuthor.className = "remainChar";
	fieldset.appendChild(remainCharAuthor);
	comment.id = "COMMENT_TEXT";
	comment.name = "comment";
	comment.rows = "4";
	comment.cols = "27";
	comment.placeholder = "Enter your comment here...";
	fieldset.appendChild(comment);
	remainCharComment.id = "REMAINING_TEXT";
	remainCharComment.className = "remainChar";
	fieldset.appendChild(remainCharComment);
	fieldset.appendChild(d.createElement("br"));
	if(d.body.id == "TITAN"){
	  saveBuild.type = "checkbox";
	  saveBuild.id = "SAVE_BUILD_CHECKBOX";
	  saveBuild.name = "saveBuild";
	  fieldset.appendChild(saveBuild);
	  fieldset.innerHTML += "Save Build<br>";
	}
	submitButton.type = "button";
	submitButton.id = "SUBMIT_BUTTON";
	submitButton.value = "Submit Comment!";
	submitButton.disabled = true;
	fieldset.appendChild(submitButton);
	form.appendChild(fieldset);
	d.body.appendChild(form);
	var commentsDiv = d.body.appendChild(d.createElement("div"));
	commentsDiv.id = d.body.id + "_COMMENTS";

	initEventsListeners();
  //loading the comments
  getComments(name);
}

function initEventsListeners(){
  //setting limit to comment
  var d = document;
  var comment = d.getElementById("COMMENT_TEXT");
  var author = d.getElementById("COMMENT_AUTHOR");
  var saveBuild = d.getElementById("SAVE_BUILD_CHECKBOX");

  author.placeholder = "Enter your name";
  comment.addEventListener("keydown", preventInput);
  comment.addEventListener("keyup", count);
  author.addEventListener("keydown", preventInput);
  author.addEventListener("keyup", count);
  d.getElementById("REMAINING_TEXT").innerHTML = 'Remaining characters: ' + (1000 - comment.value.length);
  d.getElementById("REMAINING_AUTHOR").innerHTML = 'Remaining characters: ' + (20 - author.value.length);
  if(d.body.id == "TITAN"){
    saveBuild.checked = true;
    saveBuild.value = 'on';
    saveBuild.addEventListener("change", function (event){
    if(event.target.value == 'on')
      event.target.value = 'off';
    else if(event.target.value == 'off')
      event.target.value = 'on';
    });
  }
  d.getElementById("SUBMIT_BUTTON").addEventListener("click", sendComment);
}


/****************************************************************************************
 *                                                                                      *
 *                              Sending and retrieveing comments                        *
 *                                                                                      *
 ****************************************************************************************/

function getComments(name){
  var d = document;
  var xhttp = new XMLHttpRequest();
  var url = "./comment_load.php";
  var params = "page=" + d.getElementById("PAGE").value;
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.setRequestHeader('Cache-Control', 'no-cache');
  xhttp.onreadystatechange = function() {
          if (xhttp.readyState == 4 && xhttp.status == 200){
                  var comments = d.getElementById(d.body.id + "_COMMENTS");
                  comments.innerHTML = xhttp.responseText;
          }
  };
  
  xhttp.send(params);
}

function customEscapeStr(string){
    return string.replace(":", "%colon%").replace(/&/g, "%and%").replace(/\r\n/g, "%n%").replace(/\n/g, "%n%").replace(/\r/g, "%n%")
}

function sendComment(){
		var d = document;
		var xhttp = new XMLHttpRequest();
		var url = "./comment_send.php";
		var id = d.getElementById("COMMENT_AUTHOR");
		var comment = d.getElementById("COMMENT_TEXT");
		var params = "page=" +d.getElementById("PAGE").value;
		params += "&name="+ customEscapeStr(id.value);
		params += "&pass=" + d.getElementById("PASS").value;
		params += "&comment=" + customEscapeStr(comment.value);
		comment.value = '';

		if(d.body.id == "TITAN" && d.getElementById("SAVE_BUILD_CHECKBOX").value == "on"){
			var abl = createBuildString();
			var commentBuild = createBuildComment();
			if(abl != "S:;R:"){
			  params += "&build=" + abl;
			  params += "&comBuild=" + commentBuild;
			}
    }

    d.getElementById("SUBMIT_BUTTON").disabled = true;
    xhttp.open("POST", url, true);
    //Send the proper header information along with the request
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader('Cache-Control', 'no-cache');
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200){
        var comments = d.getElementById(d.body.id + "_COMMENTS");
        comments.innerHTML = xhttp.responseText;
      }
    };
    xhttp.send(params);
}

function upvoteComment(event){
    console.log(event.target);
		var d = document;
		var xhttp = new XMLHttpRequest();
		var url = "./comment_upvote.php";
		var params = "page=" +d.getElementById("PAGE").value;
		params += "&cid=" + event.target.dataset.cid;

    xhttp.open("POST", url, true);
    //Send the proper header information along with the request
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.setRequestHeader('Cache-Control', 'no-cache');
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4 && xhttp.status == 200){
        var comments = d.getElementById(d.body.id + "_COMMENTS");
        comments.innerHTML = xhttp.responseText;
      }
    };
    xhttp.send(params);
}


/********************************************************************************
 *                                                                              *
 *                              Comment event handlers                          *
 *                                                                              *
 ********************************************************************************/

//prevent too long comments
function preventInput(event){
  if(event.target.id == "COMMENT_TEXT")
    var maxchar = 1000;
  else
    var maxchar = 20;
  var len = event.target.value.length;
  var key = event.keyCode || event.which;
  if (len >= maxchar && ![8,46,37,38,39,40].includes(key))
    event.preventDefault();
}

function count(event){
  var d = document;
  if(event.target.id == "COMMENT_TEXT")
    var maxchar = 1000;
  else
    var maxchar = 20;
  var len =  event.target.value.length;
  len += (event.target.value.split("\n").length-1) * 2;
  len += (event.target.value.split("&").length-1) * 4;
  d.getElementById("REMAINING" + event.target.id.split("COMMENT")[1]).innerHTML = "Remaining characters: " + (maxchar - len);
  var btn = d.getElementById("SUBMIT_BUTTON");
  if(len > maxchar)
    btn.disabled = true;
  else if(d.getElementById("COMMENT_AUTHOR").value.length == 0 )//|| d.getElementById("COMMENT_TEXT").value.length == 0)
    btn.disabled = true;
  else
    btn.disabled = false;
}
