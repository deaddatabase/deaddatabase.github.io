function createCSelect(id, change_val_user_event = false, size = undefined){
  //if change_val_user_event is true, then the wrapper.dataset.value needs to be set manually in the change event listener
  //the text is replace, but the value is not
  var d = document;
  var wrapper = d.createElement("div");
  wrapper.change_value_in_user_change_event = change_val_user_event
  var value = d.createElement("div");
  var value_text = d.createElement("p");
  var dropdown = d.createElement("div");
  var options = d.createElement("ul");
  if(typeof id !== "undefined") wrapper.id = id;
  wrapper.className = "c_select";

  wrapper.options = options;

  wrapper.value = function(){
   var v = Number(this.dataset.value);
   return (isNaN(v) ? this.dataset.value : v);
  };
  wrapper.toggle = function(){
    var dropdown = this.lastElementChild;
    var wrap = this;
    var text = wrap.firstElementChild.firstElementChild.innerHTML;
    if (dropdown.offsetHeight == 0) {
      dropdown.style.height = (options.offsetHeight + 10) + "px";
      this.options.style.opacity = "1";
      wrap.firstElementChild.firstElementChild.innerHTML = text.replace("▼", "▲");
      wrap.firstElementChild.style.borderRadius = "5px 5px 0 0";//"5px 5px 5px 0";
    }
    else {
      dropdown.style.height = "";
      this.options.style.opacity = "";
      setTimeout(function(){
        wrap.firstElementChild.style.borderRadius = "";
        wrap.firstElementChild.firstElementChild.innerHTML = text.replace("▲", "▼");
      }, 500);
    }
  };

  wrapper.appendOption = function(text, value){
    var d = document;
    for(var i=0; i<this.options.children.length; i++){
      if(this.options.children[i].dataset.value == value)
        return;
    }

    var option = d.createElement("li");
    option.className = "c_option";
    var button = d.createElement("input");
    button.type = "radio";
    button.name = "range_" + this.id;
    option.appendChild(button);
    var span = d.createElement("span");
    span.innerHTML = text;
    option.appendChild(span);
    option.dataset.value = value;
    option.dataset.text = text;
    if(this.options.children.length == 0){
      this.dataset.value = value;
      this.dataset.text = text;
      this.firstElementChild.firstElementChild.innerHTML = text + "&nbsp;&#9660;";
      option.className += " c_selected_option";
      button.checked = "true";
    }
    this.options.appendChild(option);
    option.addEventListener("click", selectCOption);
    return option;
  };
  wrapper.selectOption = function(option){
    if(typeof option === "string" || typeof option === "number"){
      for(var i=0; i<this.options.children.length; i++){
        if(this.options.children[i].dataset.value == option){
          option = this.options.children[i];
          break;
        }
      }
    }
    if(typeof option === "string" || typeof option === "number") return;

    if(!!option.className.match("c_selected_option")){
      this.toggle();
      return;
    }

    var old_selected = this.options.getElementsByClassName("c_selected_option")[0];
    this.lastValue = old_selected.dataset.value;
    old_selected.className = old_selected.className.replace(" c_selected_option",'');
    old_selected.firstElementChild.checked = "";
    option.className += " c_selected_option";
    option.firstElementChild.checked = "true";
    var on_change_event = new Event("change");
    if(this.change_value_in_user_change_event)
        on_change_event.newValue = option.dataset.value;
    else
        this.dataset.value = option.dataset.value;
    this.dataset.text = option.dataset.text;
    this.firstElementChild.firstElementChild.innerHTML = option.dataset.text + "&nbsp;&#9660;";
    this.toggle();
    this.dispatchEvent(on_change_event);
  };

  wrapper.setOption = function(value){
    var old_selected = this.options.getElementsByClassName("c_selected_option")[0];
    if(old_selected.dataset.value == value) return;

    var op = this.options.children;
    var set = 0;
    for(var i=0; i<op.length; i++){
      if(op[i].dataset.value == value){
        op[i].className += " c_selected_option";
        op[i].firstElementChild.checked = "true";
        set = 1;
        this.dataset.value = op[i].dataset.value;
        this.dataset.text = op[i].dataset.text;
        this.firstElementChild.firstElementChild.innerHTML = op[i].dataset.text + "&nbsp;&#9660;";
      }
    }
    if(set == 1){ 
      old_selected.className = old_selected.className.replace(" c_selected_option",'');
      old_selected.firstElementChild.checked = "";
      this.lastValue = old_selected.dataset.value;
    }
  };

  wrapper.text = function(){
   return this.dataset.text;
  };
  wrapper.clear = function(){
    if(!!this.options.firstChild) //if skills are present, remove
      while (this.options.firstChild)
        this.options.removeChild(this.options.firstChild);
    this.dataset.value = "";
    this.dataset.text = "";
    this.style = "";
    this.firstElementChild.firstElementChild.innerHTML = "&nbsp;&#9660;";
  };
  wrapper.hideOption = function(option_value){
    for(var i=0; i<this.options.children.length; i++){
      if(this.options.children[i].dataset.value == option_value)
        this.options.children[i].className += " content_hide";
    }
  }
  wrapper.hideOptions = function(start, end){
    for(var i=0; i<this.options.children.length; i++){
      if(i >= start && i <= end)
        this.options.children[i].className += " content_hide";
    }
  }

  wrapper.showOption = function(option_value){
    for(var i=0; i<this.options.children.length; i++){
      if(this.options.children[i].dataset.value == option_value)
        this.options.children[i].className = this.options.children[i].className.replace(" content_hide", "")
    }
  }
  wrapper.showOptions = function(start, end){
    for(var i=0; i<this.options.children.length; i++){
      if(i >= start && i <= end)
        this.options.children[i].className = this.options.children[i].className.replace(" content_hide", "")
    }
  }

  wrapper.finalise = function(width){
    if(typeof(width) === "undefined"){
      var list = this.options.children;
      var m = 0, h = list[0].offsetHeight;
      for(var i=0; i<list.length; i++){
        if(list[i].offsetWidth > m) m = list[i].offsetWidth;
      }
      if(h > 0)
        this.lastElementChild.style.maxHeight = (h * 10) + 'px';//Display 10 elements
      this.lastElementChild.style.width = (m+5) + 'px';
      //this.style.minWidth = m + 'px';
      this.style.width = (m+5) + 'px';
    } else {
      if(typeof(width) === "string"){
        this.style.minWidth = width;
        this.lastElementChild.style.minWidth = width;
      } else {
        this.style.minWidth = (width+5) + 'px';
        this.lastElementChild.style.minWidth = width+5;
      }
    }
  };
  wrapper.lastValue = null;

  value.className = "c_value";
  value_text.className = "c_displayed_option";
  dropdown.className = "c_dropdown";
  options.className = "c_options";

  if(typeof size !== "undefined" && typeof size === "string") value_text.style.fontSize = size;
  else value_text.style.fontSize = size + "px";
  value_text.innerHTML = "&#9660;";
  value.appendChild(value_text);
  value_text.addEventListener("click", showCOptions);
  dropdown.appendChild(options);
  wrapper.appendChild(value);
  wrapper.appendChild(dropdown);
  return wrapper;
}

function appendCSelect(element, id, size){
  var d = document;
  if(typeof element === "string") element = d.getElementById(element);
  if(element == null) return;
  var wrapper = createCSelect(id, size);
  element.appendChild(wrapper);
  return wrapper;
}

function appendCOption(cSelect, text, value){
  var d = document;
  if(typeof cSelect === "string") cSelect = d.getElementById(cSelect);
  if(cSelect == null) return;
  return cSelect.appendOption(text, value);
}

function selectCOption(event){
  event.preventDefault();
  var selected = event.target;
  if(selected.type == "radio" || typeof selected.dataset.value === "undefined") selected = selected.parentElement;
  var wrapper = selected.parentElement.parentElement.parentElement;
  wrapper.selectOption(selected);
}

function setCOption(cSelect, value){
  var d = document;
  if(typeof cSelect === "string") cSelect = d.getElementById(cSelect);
  if(cSelect == null) return;
  cSelect.setOption(value);
}


function showCOptions(event){
  event.preventDefault();
  if(typeof event.target.className !== "undefined"){
    if(event.target.className == "c_select")
      var wrapper = event.target;
    else if(event.target.className == "c_displayed_option")
      var wrapper = event.target.parentElement.parentElement;
    else if(event.target.className == "c_value")
      var wrapper = event.target.parentElement;
  }
  else var wrapper = event;
  wrapper.toggle();
}

document.body.addEventListener("click", function(e){
  var d = document;
  var dropdowns = d.getElementsByClassName("c_select");
  if(event.target.className == "c_displayed_option")
    var wrapper = event.target.parentElement.parentElement;
  else if(event.target.className == "c_select")
    var wrapper = event.target;
  else if(event.target.className == "c_value")
    var wrapper = event.target.parentElement;

  for(var i=0; i<dropdowns.length;i++){
    if(typeof wrapper === "undefined" && dropdowns[i].lastElementChild.offsetHeight != 0
    || typeof wrapper !== "undefined" && wrapper.id != dropdowns[i].id && dropdowns[i].lastElementChild.offsetHeight != 0)
      dropdowns[i].toggle();
  }
});
