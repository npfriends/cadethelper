PAGES = {};

var ttsEnabled 		= true;
var ttsPhonetic 	= true;
var ttsVoice 		= 1;
var ttsLast 		= ""; // quick fix for guesser repeating correct st names
var ttsTranslations = {}
var STREETNAMES 	= {}
var streetSort 		= 0;
var streetPage 		= false;
var chargeDescribe 	= true;
var guessZoom 		= true;
var guessSayCorrect = true;
var guessSayWrong 	= true;
var curPage;
function setVoice(x){
	x = Number(x);
	if (window.isDebug) console.log( "SET VOICE 2", x );
	localStorage.setItem("ttsvoice", x);
	ttsVoice = x;
}
function streetSortChange() {
	if (++streetSort > 2) streetSort = 0;	
	switch(streetSort){
		case 0: 
			document.getElementById('streetSort').textContent = '⬇️';
            break;
		case 1: 
			document.getElementById('streetSort').textContent = '⬆️';
            break;
        default:
			document.getElementById('streetSort').textContent = '🔁';
            break;
	}	
	if (streetPage) streetPage.search.update("");	
}
function textToSpeach(message, noPhonetic = false ) {
	if (!ttsEnabled) return;
	
	if (window.isDebug) console.log("TTS", ttsVoice );
	
	if (window.isDebug)console.log("GUESS 1", curPage, message, ttsLast );
	if (curPage == "guesser" && message == ttsLast ){
		if (window.isDebug)console.log("GUESS 2", curPage, message );
		ttsLast = "";
		return;
	}
	ttsLast = message;
	
	var msgToSend = (ttsPhonetic && !noPhonetic && PHONETICS && PHONETICS[ message ]) ? (PHONETICS[ message ] + "") : (message + "");
	
	const speach = new SpeechSynthesisUtterance(msgToSend);
	speach.voice = speechSynthesis.getVoices()[ ttsVoice ];
	speechSynthesis.speak(speach);
}
function togglePhonetics(noSave){
	ttsPhonetic = !ttsPhonetic;
	document.getElementById("ttsphonetics").style.backgroundColor = ttsPhonetic ? "lightgreen" : "salmon";
	document.getElementById("ttsphonetics").innerHTML = ttsPhonetic ? "🦻PRONUNCIATIONS ENABLED" : "👂PRONUNCIATIONS DISABLED";
	if (!noSave) localStorage.setItem("ttsphonetics", ttsPhonetic);
}
function toggleTTS( noSave ){
	ttsEnabled = !ttsEnabled;
	document.getElementById("ttspower").style.backgroundColor = ttsEnabled ? "lightgreen" : "salmon";
	document.getElementById("ttspower").innerHTML = ttsEnabled ? "🔊TTS" : "🔇TTS";
	document.getElementById("ttspower2").style.backgroundColor = ttsEnabled ? "lightgreen" : "salmon";
	document.getElementById("ttspower2").innerHTML = ttsEnabled ? "🔊TEXT-TO-SPEECH ENABLED" : "🔇TEXT-TO-SPEECH DISABLED";
	if (!noSave) localStorage.setItem("ttsenabled", ttsEnabled);
}
function toggleChargeDescriptions(){
	chargeDescribe = !chargeDescribe;
	document.getElementById("chargeDescriptions").style.backgroundColor = chargeDescribe ? "lightgreen" : "salmon";
	document.getElementById("chargeDescriptions").innerHTML = chargeDescribe ? "DESCRIPTIONS SHOWN" : "DESCRIPTIONS HIDDEN";
	var theButtons = document.querySelectorAll(".charge-value font");
	var buttonArray = Array.from(theButtons);
	buttonArray.forEach(function(button){
		button.classList.toggle("hidden");
	});
	
	var theButtons = document.querySelectorAll("#ChargesPage .tooltip");
	var buttonArray = Array.from(theButtons);
	buttonArray.forEach(function(button){
		button.classList.toggle("hidden");
	});
}
function toggleChargeFolders(){
	chargeFolders = !chargeFolders;
	document.getElementById("chargeFolders").style.backgroundColor = chargeFolders ? "lightgreen" : "salmon";
	document.getElementById("chargeFolders").innerHTML = chargeFolders ? "📖" : "📘";
	
	var theButtons = document.querySelectorAll(".charges-container");
	var buttonArray = Array.from(theButtons);
	buttonArray.forEach(function(button){
		button.style.display = chargeFolders ? "grid" : "none";
	});
}
Object.keys(MAP.Streets).forEach(key => {
  MAP.Locations[key] = { Street: key };
});
Object.keys(MAP.Streets).forEach(key => {
  STREETNAMES[key] = { Name: key, Street: key};
});




urlSearchParams = new URLSearchParams(window.location.search);

function updateURL() {
    history.pushState(
        null,
        "",
        window.location.pathname + "?" + urlSearchParams.toString()
    );
}

function setURLParam(key, value) {
    urlSearchParams.set(key, encodeURIComponent(value));

    updateURL();
}

function deleteURLParam(key) {
    urlSearchParams.delete(key);

    updateURL();
}

function addPage(key, pageObject) {
    key = key.toLowerCase();
	
    PAGES[key] = pageObject;

    // add sidebar button

    var sidebar = document.getElementById("sidebar");

    if (!pageObject.hideFromPageList()) {
        var pageButton = document.createElement("button");
        pageButton.innerHTML = pageObject.getDisplayName();
        pageButton.id = key + "PageButton";
		pageButton.className = "menuBtn";
		
		// if (!pageObject.isSettings){
			var pageButton2 = document.createElement("button");
			pageButton2.innerHTML =(  pageObject.getDisplayEmoji && pageObject.getDisplayEmoji() ) || "🔨";
			pageButton2.id = key + "PageButton2";
			pageButton2.className = "menuBtn2 hidden";
			pageButton2.style = "width:30px;";
			pageButton2.addEventListener("click", function () {
				showPage(key);
			});
			sidebar.append(pageButton2);
		// }
		
        if (!pageObject.canOpen()) {
            pageButton.innerHTML = "";
            pageButton.className = "coming-soon";

            var comingSoonText = document.createElement("span");
            comingSoonText.innerHTML = pageObject.getDisplayName();
            pageButton.appendChild(comingSoonText);
        }
		
		// if (pageObject.isSettings){
			// console.log("SETTINGS BUTTON?", pageObject, pageButton)
			// pageButton.className = "sidesettings";
		// }

        pageButton.addEventListener("click", function () {
            showPage(key);
        });
				
        sidebar.appendChild(pageButton);
    }

    pageObject.setup();
}

function setupPages() {
    // addPage(
        // "Dashboard",
        // new DashboardPage(document.getElementById("DashboardPage"))
    // );
    // addPage(
        // "Profiles",
        // new ProfilesPage(document.getElementById("ProfilesPage"))
    // );
    // addPage(
        // "Map",
        // new MapPage(document.getElementById("MapPage"))
    // );
    // addPage(
        // "Properties",
        // new PropertiesPage(document.getElementById("PropertiesPage"))
    // );
    // addPage(
        // "Employment",
        // new EmploymentPage(document.getElementById("EmploymentPage"))
    // );
    // addPage(
        // "Rankings",
        // new RankingsPage(document.getElementById("RankingsPage"))
    // );
    // addPage(
        // "Incidents",
        // new IncidentsPage(document.getElementById("IncidentsPage"))
    // );
    // addPage("Games", new GamesPage(document.getElementById("GamesPage")));
    addPage("streets", new StreetsPage(document.getElementById("StreetsPage")));
    addPage("guesser", new StreetGuesserPage(document.getElementById("StreetGuesserPage")) );
    addPage("charges", new ChargesPage(document.getElementById("ChargesPage")));
    addPage("locations", new LocGuesserPage(document.getElementById("LocGuesserPage")));
    addPage("tencodes", new TenCodesPage(document.getElementById("TenCodesPage")));
    addPage("settings", new SettingsPage(document.getElementById("SettingsPage")) );
}
function showPage(targetKey) {
	targetKey = targetKey.toLowerCase();
    if (!PAGES[targetKey].canOpen()) return;
	curPage = targetKey;
	if ( window.isDebug ) console.log(curPage);
    for (const [key, value] of Object.entries(PAGES)) {
        var pageContent = value.pageElement;

        pageContent.className =
            key == targetKey ? "page-content" : "page-content hidden";

        if (value.hideFromPageList()) continue;
        var pageButton = document.getElementById(key + "PageButton");

        pageButton.className = key == targetKey ? "selected" : "";
    }

    setURLParam("p", targetKey);

    switch (targetKey) {
        case "profiles":
            PAGES["profiles"].currentProfile == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["profiles"].currentProfile.StateID);
            break;

        case "properties":
            PAGES["properties"].currentProperty == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["properties"].currentProperty.Name);
            break;

        case "employment":
            PAGES["employment"].currentEmployer == null
                ? deleteURLParam("id")
                : setURLParam("id", PAGES["employment"].currentEmployer.Name);
            break;

        case "incidents":
            PAGES["incidents"].currentIncident == null
                ? deleteURLParam("id")
                : setURLParam(
                      "id",
                      PAGES["incidents"].currentIncident.IncidentID
                  );
            break;
        case "streets":		
			
			// var street = streetPage && streetPage.map && streetPage.map.mapObjects && streetPage.map.mapObjects[ decodeURIComponent( urlSearchParams.get("id") ) ];
			
			var find = decodeURIComponent( urlSearchParams.get("id") ).toLowerCase();
			var street = false;
				
			Object.keys(streetPage.map.mapObjects).forEach(function(value,key){
				if ( window.isDebug ) console.log( key, value, value.toLowerCase() == find );
				if (value.toLowerCase() == find){
					street = streetPage.map.mapObjects[ value ];
				}
			})
			if ( window.isDebug ) console.log( find, decodeURIComponent( urlSearchParams.get("id") ), streetPage, street );
			
			if ( street ){
				streetPage.map.selectObject(street);
				setTimeout( function(){ streetPage.map.focus(street, true) }, 500 );
			} else
				deleteURLParam("id");
            break;

        default:
            deleteURLParam("id");
            break;
    }
}

function processURLQuery() {
    var url = window.location.href;

    var params = new URL(url).searchParams;
	
    if (params.has("showhidden")){
		localStorage.setItem("showhidden", 1);
		deleteURLParam("showhidden");
		location.reload();
		return;
	}

    var pageKey = decodeURIComponent(params.get("p"));
	
	pageKey = pageKey.toLowerCase();
    if (pageKey == null) {
        showPage("dashboard");
        return;
    }

    var targetID = null;
    if (params.has("id")) targetID = decodeURIComponent(params.get("id"));
	
    switch (pageKey) {
        case "profiles":
            showPage("profiles");

            if (targetID != null && !isNaN(targetID))
                PAGES["profiles"].showProfile(targetID);
            break;

        case "properties":
            showPage("properties");

            if (targetID != null) PAGES["properties"].showProperty(targetID);
            break;

        case "employment":
            showPage("employment");

            if (targetID != null) PAGES["employment"].showEmployment(targetID);
            break;

        case "incidents":
            showPage("incidents");

            if (targetID != null) PAGES["incidents"].showIncident(targetID);
            break;

        default:
            if (pageKey in PAGES) showPage(pageKey);
            else showPage("streets");
            break;
    }
}

window.onload = () => {
	
    setupPages();
    processURLQuery();
};
