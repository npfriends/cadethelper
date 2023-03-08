class SettingsPage extends Page {
    getDisplayName() {
        return "⚙️ Settings";
    }
    getDisplayEmoji() {
        return "⚙️";
    }

    isSettings = true;
	
    setup() {
		
		var isPhonetic 		= localStorage.getItem("ttsphonetics");
		var isEnabled2 		= ( isPhonetic && isPhonetic == "true" );
		if (Boolean( isPhonetic ) && !isEnabled2){
			if (window.isDebug) console.log("SWAPPING ttsphonetics");
			togglePhonetics( true );
		}
		
		var isTTS = localStorage.getItem("ttsenabled");
		var isEnabled 		= ( isTTS && isTTS == "true" );
		if ( Boolean( isTTS ) && !isEnabled){
			if (window.isDebug) console.log("SWAPPING TTS");
			toggleTTS( true );
		}
		
		// if ( localStorage.getItem("ttsvoice") ){
			// ttsVoice 			= Number( localStorage.getItem("ttsvoice") ) || 1;		
			ttsVoice 			= localStorage.getItem("ttsvoice") || 1;		
			document.getElementById("voiceMenu").value = ttsVoice;
		// }
		ttsTranslations 	= localStorage.getItem("ttstranslations") || {};
		
		
		var list = "(some TTS voices need a bit of help)<table style='margin:auto;'><tr style='font-size:32px;background-color:#3e6a99;'><td>Street Name</td><td>➡️</td><td> Pronunciation</td>";
		if (window.isDebug) console.log(PHONETICS);
		var isA = true;
		for (const street in PHONETICS) {
			isA = !isA;
			if (window.isDebug) console.log(street, PHONETICS[street]);
			
			var rowStyle = isA ? "#3e6a99" : "#244970";
			list = list + `<tr style='background-color:${rowStyle}'><td><span onclick='textToSpeach("${street}", true)'>` + street + "🔊 </span></td><td> ➡️ </td><td>" + `<span onclick='textToSpeach("${PHONETICS[street]}")'>` + PHONETICS[street] + "🔊</span></td></tr>";
		}
		list = list + "</table>";
		document.getElementById("proList").innerHTML = list;

        // PHONETICS.forEach((object) => {
			// console.log( object );
            // var entry = this.drawFunction(object);

            // var entryParent = document.createElement("div");
            // entryParent.className = "entry";
            // entryParent.onclick = entry.onclick;

            // var title = document.createElement("div");
            // title.innerHTML = entry.title;
            // title.className = "title";

            // var subtitle = document.createElement("div");
            // subtitle.innerHTML = entry.subtitle;
            // subtitle.className = "subtitle";

            // this.contentElement.appendChild(entryParent);
            // entryParent.appendChild(title);
            // entryParent.appendChild(subtitle);
        // });
		
	}
	
}
