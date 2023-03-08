class StreetGuesserStreetObject extends StreetObject {
    constructor(parent, street) {
        super(parent, street);

        this.street = street;

        this.selectable = true;

        this.guessedCorrectly = false;
    }

    draw(ctx, offset, zoom) {
        if (!this.hovered && this.selectable) return;

        if (this.selectable) {
            this.color = this.hovered || this.selected ? "orange" : "grey";
            ctx.globalAlpha = this.hovered ? 0.75 : 0.2;
        } else {
            this.color = this.guessedCorrectly ? "green" : "red";
            ctx.globalAlpha = 0.5;
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2 * zoom;

        for (const segment of this.segments) {
            segment.draw(ctx);
        }
		
		if (this.selectable || !(!this.selectable && this.hovered ) ) 
			return;
			
        var textPos = this.parent.getPosFromCoord(this.bounds.center);

        if (
            (this.hovered && this.parent.hoveredObject == this) ||
            this.selected
        ) {
            this.textFadeTarget = 1;
        } else {
            this.textFadeTarget = 0;
        }

        this.textFade += (this.textFadeTarget - this.textFade) * 0.05;

        ctx.save();

        ctx.font = this.bounds.area ** 0.15 * 6 + "px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = this.textFade;

        ctx.translate(textPos.x, textPos.y);

        ctx.strokeText(this.street.Name, 0, 0);

        ctx.fillText(this.street.Name, 0, 0);

        ctx.restore();
    }
}

class StreetGuesserPage extends Page {
    getDisplayName() {
        return "Street Guesser";
    }
    getDisplayEmoji() {
        return "🔎";
    }

    // hideFromPageList() {
        // return true;
    // }
	
	guesses 	= 0;
	hoods 		= [ "City", "Highways", "Vinewood", "Sandyshores", "Grapeseed", "Paleto" ];
	
	streets = false;
	getStreets( rebuild ){
		if (rebuild || !this.streets){
			this.streets = {};
			for (const [key, street] of Object.entries(MAP.Streets)) {
				var hd = ( street.Neighborhood != null ) ? street.Neighborhood : "City";
				if ( this.hoods.includes( hd ) ) 
					this.streets[key] = street;
			}
		}
		return this.streets;
	}
	
    setup() {
        this.setupMap();

        document.getElementById("sgScore").innerHTML =
            "0/" + Object.keys( this.getStreets() ).length;
    }

    setupMap(setting) {
		if ( !setting ){
			this.map = new MapProvider(
				this.pageElement.querySelector(".properties-map")
			);
		}
		
        for (const [key, street] of Object.entries(MAP.Streets)) {
            this.map.addMapObject(
                key,
                new StreetGuesserStreetObject(this.map, street)
            );
        }
	
		if ( !setting ){
			var context = this;
			this.map.onSelect = function (mapObject) {
				context.onStreetSelected(mapObject);
			}
        }
    }

    onStreetSelected(mapObject) {
        if (!this.started) return;

		var hood = ( mapObject && mapObject.street && (mapObject.street.Neighborhood != null)) ? mapObject.street.Neighborhood : "City";
		if (window.isDebug) console.log("TEST:", hood );
		
		
        var correct =
            mapObject.street.Name == this.streetQueue[this.currentStreetIndex];

        if (correct) {
            mapObject.selectable = false;
            mapObject.guessedCorrectly = true;
			if ( guessSayCorrect ) textToSpeach( "correct" );
            this.correct += 1;
        } else {
            var correctObject =
                this.map.mapObjects[this.streetQueue[this.currentStreetIndex]];
            correctObject.selectable = false;
            correctObject.guessedCorrectly = false;

			if ( guessSayWrong ) textToSpeach( "wrong" );
            this.map.focus(correctObject, true);
			
        }

        this.streetQueue.splice(this.currentStreetIndex, 1);

        this.shiftSelectedStreet(0);

        this.guesses += 1;

        this.updateLabels();

        if (this.streetQueue.length <= 0) {
            this.endGame();
        }
    }

    updateLabels() {
        document.getElementById("sgScore").innerHTML = `${this.guesses}/${
            Object.keys( this.getStreets() ).length
        }`;

        document.getElementById(
            "sgCorrect"
        ).innerHTML = `${this.correct} Correct`;

        document.getElementById("sgIncorrect").innerHTML = `${
            this.guesses - this.correct
        } Incorrect`;
    }

    updateTimer() {
        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("sgTimer").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;

        var context = this;
        if (this.started)
            setTimeout(function () {
                context.updateTimer();
            }, 1000);
    }

    sgNozoom(what) {
		guessZoom = !guessZoom;
		document.getElementById( "sgNozoom" ).style.backgroundColor = guessZoom ? "lightgreen" : "salmon";
		document.getElementById( "sgNozoom" ).innerHTML = guessZoom ? "✅STREET ZOOM" : "❌STREET ZOOM";
	}
    sgNocorrect(what) {
		guessSayCorrect = !guessSayCorrect;
		document.getElementById( "sgNocorrect" ).style.backgroundColor = guessSayCorrect ? "lightgreen" : "salmon";
		document.getElementById( "sgNocorrect" ).innerHTML = guessSayCorrect ? "✅SAY CORRECT" : "❌SAY CORRECT";
	}
    sgNowrong(what) {
		guessSayWrong = !guessSayWrong;
		document.getElementById( "sgNowrong" ).style.backgroundColor = guessSayWrong ? "lightgreen" : "salmon";
		document.getElementById( "sgNowrong" ).innerHTML = guessSayWrong ? "✅SAY WRONG" : "❌SAY WRONG";
	}
    sgHood(what) {
		
		if ( this.hoods.includes(what) )
			this.hoods = this.hoods.filter(function(e) { return e !== what })
		else
			this.hoods.push( what );
		if (window.isDebug) console.log("TEST2", this, what, this.hoods );
		
		document.getElementById( "sg" + what ).style.backgroundColor = this.hoods.includes(what) ? "lightgreen" : "salmon";
		
		this.getStreets( true );
		this.buildStreetQueue();
        document.getElementById("sgScore").innerHTML = "0/" + Object.keys( this.getStreets() ).length;
		
	}


    buildStreetQueue() {
        var queue = [];

        for (const [key, street] of Object.entries( this.getStreets() )) {
            queue.push(key);
        }

        // native* shuffle
        queue.sort(() => Math.random() - 0.5);

        this.streetQueue = queue;
    }

    shiftSelectedStreet(amount) {
        if (!this.started) return;

        this.currentStreetIndex =
            (this.currentStreetIndex + amount) % this.streetQueue.length;
        if (this.currentStreetIndex < 0)
            this.currentStreetIndex = this.streetQueue.length - 1;

		var newStreet = this.streetQueue[this.currentStreetIndex];
		
		if (newStreet != null){
			document.getElementById("sgCurrentStreet").innerHTML = newStreet;
			setTimeout(function(){ 
				if (window.isDebug) console.log("TTS CALL2:", newStreet );
				textToSpeach(newStreet); 
			}, 500 );
		} else
			document.getElementById("sgCurrentStreet").innerHTML = "GAME OVER";

    }

    startGame() {
        if (this.started) return;

		Array.from(document.querySelectorAll("button.sgFilter")).forEach(function(button){ button.disabled = true });
		// this.hoods2.forEach( what => {document.getElementById( what ).disabled = 1;} );
		
        this.buildStreetQueue();

        this.currentStreetIndex = 0;
        this.started = true;

        this.guesses = 0;
        this.correct = 0;
        this.startTime = new Date();

        this.updateLabels();
        this.updateTimer();

        this.shiftSelectedStreet(0);

        document.getElementById("sgGiveUp").style.display = "inline";
        document.getElementById("sgRetry").style.display = "none";

    }

    endGame() {
        if (!this.started) return;

        this.started = false;
        this.showEndGame();
    }

    showEndGame() {
        this.map.resetView();

        document.getElementById("sgGiveUp").style.display = "none";
        document.getElementById("sgRetry").style.display = "inline";
		
        var overlayParent = document.getElementById("sgOverlay");

        overlayParent.style.display = "block";
        overlayParent.className = "sg-overlay sg-overlay-fadein";

        document.getElementById("sgEndPercent").innerHTML = `${Math.round(
            (this.correct / Object.keys( this.getStreets() ).length) * 100
        )}%`;
        document.getElementById("sgEndScore").innerHTML = `${this.correct}/${
            Object.keys( this.getStreets() ).length
        }`;

        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("sgEndTime").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;
    }

    retry() {
        var overlayParent = document.getElementById("sgOverlay");

        overlayParent.style.display = "none";
        overlayParent.className = "sg-overlay";

        this.map.clearMapObjects();
		this.setupMap( true );		
        this.buildStreetQueue();
        this.startGame();
    }
}
