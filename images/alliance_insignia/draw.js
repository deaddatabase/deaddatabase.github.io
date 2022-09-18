function drawBanner(player, alliance, num){
	var d = document;

	d.getElementById("player").innerText = player;
	d.getElementById("allinace").innerText = alliance;
	d.getElementById("Insignia").src = './Insignia_'+num+'.png';
}

function init(){
	var d = document;
	var page = d.getElementById("page_container");
	var name = d.createElement('p');
	name.id = 'player';

	var clan = d.createElement('span');
	clan.id = 'allinace';

	var img = d.createElement('img');
	img.id = 'Insignia';
	img.addEventListener("load", function(event){

		event.target.style.paddingRight = 0;
		event.target.style.paddingLeft = 0;
		var miss = 92 - img.offsetWidth;
		event.target.className = "hide";
		if(miss > 0){
			event.target.style.paddingRight = miss/2.0 + "px";
			event.target.style.paddingLeft = miss/2.0 + "px";
		}
		event.target.className = "";
	});

	page.appendChild(name);
	page.appendChild(clan);
	page.appendChild(img);

	drawBanner("Yuki", "Yuki's Alliance", 50);
	setInterval(slideshow, 1000);
}

function slideshow(){
	var d = document;
	var img = d.getElementById("Insignia");
	var num = parseInt(img.src.split('.png')[0].split('Insignia_')[1]);
	console.log(num);
	if(num % 10 == 0)
		num -= 9;
	else 
		num++;
	img.src = './Insignia_'+num+'.png';
}