class LocGuesserLocObject extends LocationObject {
    constructor(parent, location) {
        super(parent, location);

        this.location = location;
        this.selectable = true;

        // this.bounds = {
            // min: coordAsVec(this.location.Coords).sub(new Vector(1, 1)),
            // center: coordAsVec(this.location.Coords),
            // max: coordAsVec(this.location.Coords).add(new Vector(1, 1)),
            // area: 1,
        // };

    // constructor(parent, street) {
        // super(parent, street);

        // this.street = street;

        // this.selectable = true;

        this.guessedCorrectly = false;
    }

    draw(ctx, offset, zoom) {
        ctx.globalAlpha = 1;
        var vec = this.parent.getPosFromCoord(coordAsVec(this.location.Coords));

        ctx.beginPath();
        ctx.arc(vec.x, vec.y, 4 * zoom, 0, 2 * Math.PI, false);
		
        if (this.selectable) {
            this.color = this.hovered || this.selected ? "orange" : "grey";
            ctx.globalAlpha = this.hovered ? 0.75 : 0.2;
        } else {
            this.color = this.guessedCorrectly ? "green" : "red";
            ctx.globalAlpha = 0.5;
		}
		
        ctx.fillStyle = this.color;
        ctx.fill();

        if (this.location.Icon != null) {
            var scaleFactor = 0.035 * zoom;
            var icon = this.parent.getIcon(this.location.Icon);
            ctx.drawImage(
                icon,
                vec.x - (icon.width * scaleFactor) / 2,
                vec.y - (icon.height * scaleFactor) / 2,
                icon.width * scaleFactor,
                icon.height * scaleFactor
            );
        }

        if (
            (offset.distance(this.bounds.center) < 60 && zoom >= 2) ||
            this.selected
        ) {
        } else {
            return;
        }

        ctx.font = 12 + "px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.strokeStyle = this.hovered || this.selected ? "red" : "grey";
        ctx.lineWidth = 3;

		if (this.selectable || !(!this.selectable && this.hovered ) ) 
			return;
        var center = this.parent.getPosFromCoord(this.bounds.center);

        ctx.strokeText(this.location.Name, center.x, center.y + 5 * zoom);

        ctx.fillText(this.location.Name, center.x, center.y + 5 * zoom);
    }
	

    // draw(ctx, offset, zoom) {
        // if (!this.hovered && this.selectable) return;

        // if (this.selectable) {
            // this.color = this.hovered || this.selected ? "orange" : "grey";
            // ctx.globalAlpha = this.hovered ? 0.75 : 0.2;
        // } else {
            // this.color = this.guessedCorrectly ? "green" : "red";
            // ctx.globalAlpha = 0.5;
        // }

        // ctx.strokeStyle = this.color;
        // ctx.lineWidth = 2 * zoom;

        // for (const segment of this.segments) {
            // segment.draw(ctx);
        // }
		
		// if (this.selectable || !(!this.selectable && this.hovered ) ) 
			// return;
			
        // var textPos = this.parent.getPosFromCoord(this.bounds.center);

        // if (
            // (this.hovered && this.parent.hoveredObject == this) ||
            // this.selected
        // ) {
            // this.textFadeTarget = 1;
        // } else {
            // this.textFadeTarget = 0;
        // }

        // this.textFade += (this.textFadeTarget - this.textFade) * 0.05;

        // ctx.save();

        // ctx.font = this.bounds.area ** 0.15 * 6 + "px Arial";
        // ctx.fillStyle = "white";
        // ctx.textAlign = "center";
        // ctx.strokeStyle = this.color;
        // ctx.lineWidth = 3;
        // ctx.globalAlpha = this.textFade;

        // ctx.translate(textPos.x, textPos.y);

        // ctx.strokeText(this.street.Name, 0, 0);

        // ctx.fillText(this.street.Name, 0, 0);

        // ctx.restore();
    // }
}

var Locals = {};
for (const [key, street] of Object.entries(MAP.Locations)){
	if( Boolean(street.Coords) ){
	   if (window.isDebug) console.log(key );
	   Locals[ key ] = street;
	}
}
if (window.isDebug) console.log( Locals );
			   
		   
class LocGuesserPage extends Page {
    getDisplayName() {
        return "Loc Guesser";
    }
    getDisplayEmoji() {
        return "🔎";
    }

    // hideFromPageList() {
        // return true;
    // }

    setup() {
        this.setupMap();

        document.getElementById("lgScore").innerHTML =
            "0/" + Object.keys(Locals).length;
    }

    setupMap() {
		if (window.isDebug) console.log("TEST", this.pageElement );
		if (window.isDebug) console.log("TEST", this.pageElement, this.pageElement.querySelector(".properties-map") );
        this.map = new MapProvider(
            this.pageElement.querySelector(".properties-map")
        );

        for (const [key, street] of Object.entries(Locals)) {
            this.map.addMapObject(
                key,
                new LocGuesserLocObject(this.map, street)
            );
        }

        var context = this;

        this.map.onSelect = function (mapObject) {
            context.onStreetSelected(mapObject);
        };
    }

    onStreetSelected(mapObject) {
        if (!this.started) return;

		if (window.isDebug) console.log( mapObject );
        var correct =
            mapObject.location.Name == this.streetQueue[this.currentStreetIndex];

        if (correct) {
            mapObject.selectable = false;
            mapObject.guessedCorrectly = true;
			textToSpeach( "correct" );
            this.correct += 1;
        } else {
            var correctObject =
                this.map.mapObjects[this.streetQueue[this.currentStreetIndex]];
            correctObject.selectable = false;
            correctObject.guessedCorrectly = false;

			textToSpeach( "wrong" );
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
        document.getElementById("lgScore").innerHTML = `${this.guesses}/${
            Object.keys(Locals).length
        }`;

        document.getElementById(
            "lgCorrect"
        ).innerHTML = `${this.correct} Correct`;

        document.getElementById("lgIncorrect").innerHTML = `${
            this.guesses - this.correct
        } Incorrect`;
    }

    updateTimer() {
        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("lgTimer").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;

        var context = this;
        if (this.started)
            setTimeout(function () {
                context.updateTimer();
            }, 1000);
    }

    buildStreetQueue() {
        var queue = [];

        for (const [key, street] of Object.entries(Locals)) {
            queue.push(key);
        }

        // naive shuffle
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
        document.getElementById("lgCurrentLoc").innerHTML = newStreet;
		setTimeout(function(){ textToSpeach(newStreet); }, 500 );

    }

    startGame() {
		if (window.isDebug) console.log("START THIS SHIT BRUV");
        if (this.started) return;

        this.buildStreetQueue();

        this.currentStreetIndex = 0;
        this.started = true;

        this.guesses = 0;
        this.correct = 0;
        this.startTime = new Date();

        this.updateLabels();
        this.updateTimer();

        this.shiftSelectedStreet(0);

        document.getElementById("lgRetry").style.display = "inline";
    }

    endGame() {
        if (!this.started) return;

        this.started = false;
        this.showEndGame();
    }

    showEndGame() {
        this.map.resetView();

        var overlayParent = document.getElementById("lgOverlay");

        overlayParent.style.display = "block";
        overlayParent.className = "lg-overlay lg-overlay-fadein";

        document.getElementById("lgEndPercent").innerHTML = `${Math.round(
            (this.correct / Object.keys(Locals).length) * 100
        )}%`;
        document.getElementById("lgEndScore").innerHTML = `${this.correct}/${
            Object.keys(Locals).length
        }`;

        var time = new Date();
        var diff = new Date(time.getTime() - this.startTime.getTime());

        document.getElementById("lgEndTime").innerHTML = `${diff
            .getMinutes()
            .toString()}:${diff.getSeconds().toString().padStart(2, "0")}`;
    }

    retry() {
        var overlayParent = document.getElementById("lgOverlay");

        overlayParent.style.display = "none";
        overlayParent.className = "lg-overlay";

        this.map.clearMapObjects();

        for (const [key, street] of Object.entries(Locals)) {
            this.map.addMapObject(
                key,
                new LocGuesserLocObject(this.map, street)
            );
        }

        this.buildStreetQueue();

        this.startGame();
    }
}
