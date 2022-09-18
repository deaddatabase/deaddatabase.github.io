function animate(now, total) {
    var step = Math.round(now/total*100);
    document.getElementById('PROGRESS_BAR').style.width = step + '%';
    document.getElementById('LOADING').innerHTML = step + '%';
    if(now/total == 1) {
      setTimeout(function(){
        document.getElementsByTagName("body")[0].removeChild(document.getElementById("MODAL_CONTAINER_LOAD"));
      }, 500);
    }
}

function createLoadingAnimation(title){
  if(typeof title === "undefined") title = "Loading";
  var modal_container = document.getElementsByTagName("body")[0].appendChild(document.createElement("div"));
      modal_container.id = "MODAL_CONTAINER_LOAD";
      modal_container.style.height = document.documentElement.scrollHeight + "px";
  var container = document.createElement("div");
  var bar = document.createElement("div");
  var load = document.createElement("span");
  bar.style.width = 0;
  bar.id = "PROGRESS_BAR";
  load.id = "LOADING";
  container.className = "loading_container";
  load.innerHTML = title;
  container.style.top = (document.documentElement.scrollHeight - container.offsetWidth)/2 + "px";
  container.appendChild(bar);
  container.appendChild(load);
  modal_container.appendChild(container);
}

function addSpinner(){
  var d = document;
  var modal_container = document.getElementsByTagName("body")[0].appendChild(document.createElement("div"));
      modal_container.id = "MODAL_CONTAINER_SPINNER";
      modal_container.style.height = document.documentElement.scrollHeight + "px";
  var spinner = modal_container.appendChild(d.createElement('div'));
  spinner.id = "SPINNER";
  var stat_part = spinner.appendChild(d.createElement('img'));
  stat_part.src = "./images/loading_sword.png";
  stat_part.className = "spin_icon_static";
  var circle = spinner.appendChild(d.createElement('img'));
  circle.src = "./images/loading_circle.png";
  circle.className = "spin_icon_dynamic";
}

function removeSpinner(){
  document.getElementsByTagName("body")[0].removeChild(document.getElementById("MODAL_CONTAINER_SPINNER"));
}
