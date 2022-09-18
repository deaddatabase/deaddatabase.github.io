function initBanner(callback){
  var d = document;
  var banner_container = d.createElement("div");
  var outer = d.createElement("div");
  outer.id = "BANNER";
  outer.className = "banner";
  banner_container.className = "banner_container";
  banner_container.id = "BANNER_CONTAINER";
  outer.appendChild(banner_container);
  var w_mark = d.createElement("span");
  w_mark.id = "BANNER_WATERMARK";
  w_mark.className = "banner_watermark";
  w_mark.style.display = "none";
  var link = d.createElement("a");
  link.id = "BANNER_LINK";
  link.href = "javascript:;";
  var banner_img = d.createElement("img");
  banner_img.id = "BANNER_IMG";
  banner_img.className = "banner_img";
  banner_img.addEventListener("load", function(e){
    setSize(e.target.offsetWidth, e.target.offsetHeight);
    if(typeof callback !== "undefined") callback();
  });
  banner_img.addEventListener("error", function(e){
    console.log("Could not load the image: " + e.target.src);
    e.target.onerror = null;
    e.target.src = "./images/relic_cards/broken_pot.png";
    e.preventDefault();
  });
  var close_btn = d.createElement("div");
  close_btn.id = "CLOSE_BANNER";
  close_btn.className = "close_banner";
  var close1 = close_btn.appendChild(d.createElement("div"));
  var close2 = close_btn.appendChild(d.createElement("div"));
  close_btn.addEventListener("click", hideBanner);
  close1.className = "close_bar bar_1";
  close2.className = "close_bar bar_2";
  link.appendChild(banner_img);
  link.appendChild(w_mark);
  banner_container.appendChild(link);
  banner_container.appendChild(close_btn);
  d.body.appendChild(outer);
}

function setSize(w, h){//set size for buttons etc
  if(typeof w === "undefined") w = 0;
  if(typeof h === "undefined") h = 0;
  var d = document;
  d.getElementById("BANNER").style = "left:calc(50% - "+ (w / 2) +"px);top:calc(100% - "+ (h + 40) +"px);";
  d.getElementById("BANNER_CONTAINER").style = "width:" + w + "px;height:" + h + "px;";
  var x = d.getElementById("CLOSE_BANNER");
  x.style = "left:" + (w - (x.offsetWidth + 1)) + "px;top:-" + (h + 4) + "px;";
}

function switchBannerImg(src){
  if(typeof src !== "undefined" && src != '')
    document.getElementById("BANNER_IMG").src = src;
}

function setBannerDim(w, h){
  var d = document;
  var img = d.getElementById("BANNER_IMG");
  if(typeof w !== "undefined")
    img.style.width = w + "px";
  else
    img.style.width = "";
  if(typeof h !== "undefined")
    img.style.height = h + "px";
  else
    img.style.height = "";
  setSize(img.offsetWidth, img.offsetHeight);
}

function switchBannerLink(url, target){
  var link = document.getElementById("BANNER_LINK");
  if(typeof url !== "undefined" && url != ''){
    link.href = url;
    if(typeof target !== "undefined")
      link.target = target;
    else
      link.target = "_blank";
  }
  else{
    link.href = "javascript:;";
    link.target = "_self";
  }
}

function hideBanner(){
  document.getElementById("BANNER").className = "banner";
  setTimeout(function(){document.getElementById("BANNER").style.zIndex = "-1";}, 1000);
}

function showBanner(){
  document.getElementById("BANNER").className += " outer_banner_container";
  setTimeout(function(){document.getElementById("BANNER").style.zIndex = "";}, 1000);
}

function disableCloseBanner(){
  document.getElementById("CLOSE_BANNER").style.display = "none";
}

function enableCloseBanner(){
  document.getElementById("CLOSE_BANNER").style.display = "block";
}

function addWatermark(text, options){//angle is in deg
  if(typeof options === "undefined"){
    options = {};
    options.angle = 0;
    options.adjustAngle = true;
    options.bold = false;
    options.italic = false;
    //options.xpos = "m";//l,m,r
    //options.ypos = "m";//t,m,b
  }
  if(typeof options.angle === "undefined") options.angle = 0;
  if(typeof options.adjustAngle === "undefined") options.adjustAngle = true;
  if(typeof options.bold === "undefined") options.bold = false;
  if(typeof options.italic === "undefined") options.italic = false;
  //if(typeof options.xpos === "undefined") options.xpos = "m";
  //if(typeof options.ypos === "undefined") options.ypos = "m";
  var d = document;
  var w_mark = d.getElementById("BANNER_WATERMARK");
  var img = d.getElementById("BANNER_IMG");
  w_mark.innerText = text;
  w_mark.style.display = "block";
  w_mark.style.fontSize = img.offsetHeight/4 + "px";
  w_mark.style.fontWeight = options.bold ? "bold" : "normal";
  w_mark.style.fontStyle = options.italic ? "italic" : "normal";
  positionWatermark(options.angle, options.adjustAngle, options.xpos, options.ypos);
}

function positionWatermark(angle, adjustAngle, xpos, ypos){
  if(typeof positionWatermark.it === "undefined") positionWatermark.it = 0;
  if(typeof adjustAngle === "undefined") adjustAngle = true;
  var d = document;
  var w_mark = d.getElementById("BANNER_WATERMARK");
  w_mark.style.transform = "rotate("+ (angle * -1) +"deg)";
  var b = d.getElementById("BANNER");

  var ws, hs, ls, w, k, l;
  //var ws,hs,w,h,x,y;
  w = w_mark.offsetWidth;
  h = w_mark.offsetHeight;

  const deg2rad = Math.PI / 180;
  k = w * Math.abs(Math.tan(angle * deg2rad));
  l = w / Math.cos(angle * deg2rad);
  ls = w;
  const f = l / ls;
  hs = f * k;
  ws = f * w;
  var y = h * Math.cos(angle * deg2rad);
  var x = h * Math.abs(Math.sin(angle * deg2rad));

//  ws = w * Math.cos(angle * deg2rad);
//  hs = w * Math.abs(Math.sin(angle * deg2rad));


  var height = hs +y;
  var width = ws +x;

//  var sw = width - 2*x;
//  var sh = height - 2*y;

  if(adjustAngle){
    if(positionWatermark.it <= 90){
      if(height > b.offsetHeight && angle <= 90 && angle >= -90){
        if(angle > 0){
          positionWatermark.it++;
          positionWatermark(angle -1, true, xpos, ypos);
          return;
        }
        else if(angle < 0){
          positionWatermark.it++;
          positionWatermark(angle +1, true, xpos, ypos);
          return;
        }
      }
      if(width > b.offsetWidth && angle <= 90 && angle >= -90){
        if(angle > 0){
          positionWatermark.it++;
          positionWatermark(angle +1, true, xpos, ypos);
          return;
        }
        else if(angle < 0){
          positionWatermark.it++;
          positionWatermark(angle -1, true, xpos, ypos);
          return;
        }
      }
    }
    else {
      positionWatermark(0, false, xpos, ypos);
      return;
    }
  }

  var xoff = 0;
  var yoff = 0;
  if(xpos == "l") xoff = 1;
  else if(xpos == "m") xoff = (b.offsetWidth - width)/2;
  else if(xpos == "r") xoff = b.offsetWidth - width;
  if(ypos == "t") yoff = 1;
  else if(ypos == "m") yoff = (b.offsetHeight - height)/2;
  else if(ypos == "b") yoff = b.offsetHeight - height;

  w_mark.style.top = (yoff + y) + "px";
  w_mark.style.left = (xoff + x) + "px";

  positionWatermark.it = 0;

}

function removeWatermark(){
  document.getElementById("BANNER_WATERMARK").style.display = "none";
}

function switchBanner(src, url, dim){
  if(typeof dim === "undefined") dim = [];
  hideBanner();
  setTimeout(function(){
    switchBannerLink(url);
    switchBannerImg(src);
    setBannerDim(dim[0], dim[1]);
  }, 1001);
  setTimeout(showBanner, 1001);
}
