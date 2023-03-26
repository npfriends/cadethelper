class ChargesPage extends Page {
    getDisplayName() {
        return "Charges";
    }
	
    // hideFromPageList() {
        // return !Boolean( localStorage.getItem("showhidden") );
    // }

    setup() {
        this.searchObject = document.getElementById("chargesSearch");

        this.setupSearch();
    }

    setupSearch() {
        // custom search implementation due to requiring different behaviour

        var context = this;
        this.searchObject.addEventListener("input", function (evt) {
            context.update(this.value);
        });

        this.update("");
    }

    update(query) {
        this.searchObject.value = query;

        this.clearEntries();

        var validCharges = [];
        if (query.length > 0) {
            for (const [key, charge] of Object.entries(CHARGES)) {
                if ( key.toLowerCase().includes(query.toLowerCase()) || (charge.Description != null && charge.Description.toLowerCase().includes(query.toLowerCase()) ) )
                    validCharges.push(key);
            }
        } else {
            validCharges = Object.keys(CHARGES);
        }

        this.buildEntries(validCharges);
    }

    clearEntries() {
        document.getElementById("chargesSectionParent").replaceChildren();
    }

    buildEntries(keys) {
        const groupHeaders = [
            "Offenses Against Persons",
            "Offenses Involving Theft",
            "Offenses Invovling Fraud",
            "Offenses Involving Damage to Property",
            "Offenses Against Public Administration",
            "Offenses Against Public Order",
            "Offenses Against Public Health and Morals",
            "Offenses Against Public Safety",
            "Offenses Involving Operation of a Vehicle/General Citations",
            "Offenses Involving Natural Resources",
        ];

        var parent = document.getElementById("chargesSectionParent");

        var lastGroup = -1;
        var currentGroupContainer = null;

        for (const key of keys) {
            const charge = CHARGES[key];

            if (charge.Group != lastGroup) {
                lastGroup = charge.Group;

                var groupParent = document.createElement("div");
                groupParent.className = "charges-group-parent";
                parent.appendChild(groupParent);
				
				
                var groupHeader = document.createElement("div");
                groupHeader.className = "charges-group-header";
                groupHeader.innerHTML = "<span style='cursor: pointer;' onclick='this.isHidden = !this.isHidden; if (this.isHidden) this.parentElement.parentElement.children[1].style.display = `none`; else this.parentElement.parentElement.children[1].style.display = `grid`; console.log( this.isHidden, this.parentElement.parentElement.children[1] );'>" + (
                    charge.Group != null
                        ? groupHeaders[charge.Group]
                        : "[Unknown]") + "</span>";
                groupParent.appendChild(groupHeader);

                currentGroupContainer = document.createElement("div");
                currentGroupContainer.className = "charges-container";
                groupParent.appendChild(currentGroupContainer);
            }

            var chargeEntry = this.buildChargeEntry(charge);
            currentGroupContainer.appendChild(chargeEntry);
        }
    }

    buildChargeValues(values) {
        var valuesHorizontal = document.createElement("div");
        valuesHorizontal.style =
            "display: flex; flex-direction:row; justify-content: space-around; margin: 0.5vmin;";

        var timeEntry = document.createElement("div");
        timeEntry.innerHTML = `${values["Time"].toLocaleString()} month(s)`;
        timeEntry.className = "charge-value";
        valuesHorizontal.appendChild(timeEntry);

        var fineEntry = document.createElement("div");
        fineEntry.innerHTML = `$${values["Fine"].toLocaleString()}`;
        fineEntry.className = "charge-value";
        valuesHorizontal.appendChild(fineEntry);

        var pointsEntry = document.createElement("div");
        pointsEntry.innerHTML = `${values["Points"].toLocaleString()} point(s)`;
        pointsEntry.className = "charge-value";
        valuesHorizontal.appendChild(pointsEntry);

        return valuesHorizontal;
    }

    buildChargeEntry(charge) {
        var chargeEntry = document.createElement("div");
        chargeEntry.className = "charge";

        chargeEntry.style.backgroundColor = {
            Misdemeanor: "#2d732a",
            Felony: "#ad7537",
            HUT: "#993232",
        }[charge.Type];

        var chargeHeader = document.createElement("div");
        chargeHeader.className = "charge-header";
        chargeHeader.innerHTML = "<b style='font-size:2vmin;text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;'>" + charge.Name + "</b>";
        chargeEntry.appendChild(chargeHeader);
		chargeHeader.addEventListener("click", function () {
			navigator.clipboard.writeText( charge.Name );
		});
		
		// console.log(charge.Name, charge );
		// if ( charge && charge["Default"] && charge["Default"]["Time"] ){
			// var chargeSep = document.createElement("div");
			// chargeSep.className = "charge-seperator";
			// chargeEntry.appendChild(chargeSep);
		// }
		
		if ( charge && charge["Type"] && charge["Type"] == "HUT" ){
			var chargeSep = document.createElement("span");
			chargeSep.innerHTML = "HUT";
			chargeSep.style = "color:#c00;position:absolute;top:1px;right:2px;font-size:0.7em; font-weight:bold;  text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;";
			chargeEntry.appendChild(chargeSep);
		} else if ( charge && charge.Default && charge.Default.Time == 0 ){
			var chargeSep = document.createElement("span");
			chargeSep.innerHTML = "Infraction";
			chargeSep.style = "color:#ccc;position:absolute;top:0px;right:2px;font-size:0.7em; font-weight:bold;  text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;";
			chargeEntry.appendChild(chargeSep);
		}
		
		var stuff = "";
		if(charge["Default"] && charge["Default"]["Time"]) stuff += `<span style='color:#FED8B1;';>${charge["Default"]["Time"].toLocaleString()}</span>`;
		if(charge["Default"] && charge["Default"]["Fine"]) stuff += `  <span style='color:lightgreen';>$${charge["Default"]["Fine"].toLocaleString()}</span>`
		if(stuff != ""){
			var chargeSep = document.createElement("span");
			chargeSep.innerHTML = stuff;
			chargeSep.style = "color:#ccc;position:absolute;top:0px;left:0px;font-size:0.6em; font-weight:bold;";
			chargeEntry.appendChild(chargeSep);
		}
				
		var chargeDesc = document.createElement("div");
		// sepA.className = "charge-seperator";
        chargeDesc.className = chargeDescribe ? "charge-value" : "charge-value hidden";
		chargeDesc.innerHTML = charge.Description != null
                ? "<font style='font-color:white;'>" 
				+ charge.Description + 
				"</font>"
				+ "<span class='chargeRead' style='position:absolute;right:2px;bottom:2px;text-shadow:-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;' onclick='textToSpeach(`" + 
				charge.Name.replace(/'/g, "&apos;").replace(/"/g, "&quot;") + "! " + 
				charge.Description.replace(/'/g, "&apos;").replace(/"/g, "&quot;") + "`);'>🔊</span>"
                : "<b>[Unknown Description]</b>";
		chargeEntry.appendChild(chargeDesc);
		
		/*
        if ("Default" in charge)
            chargeEntry.appendChild(this.buildChargeValues(charge["Default"]));

        if ("Accomplice" in charge) {
            var sepA = document.createElement("div");
            sepA.className = "charge-seperator";
            chargeEntry.appendChild(sepA);

            var chargeHeader = document.createElement("div");
            chargeHeader.className = "charge-subheader";
            chargeHeader.innerHTML = "as Accomplice";
            chargeEntry.appendChild(chargeHeader);

            chargeEntry.appendChild(
                this.buildChargeValues(charge["Accomplice"])
            );
        }

        if ("Accessory" in charge) {
            var sepB = document.createElement("div");
            sepB.className = "charge-seperator";
            chargeEntry.appendChild(sepB);

            var chargeHeader = document.createElement("div");
            chargeHeader.className = "charge-subheader";
            chargeHeader.innerHTML = "as Accessory";
            chargeEntry.appendChild(chargeHeader);

            chargeEntry.appendChild(
                this.buildChargeValues(charge["Accessory"])
            );
        }

		*/
		
        var tooltip = document.createElement("div");
        tooltip.className = chargeDescribe ? "tooltip hidden" : "tooltip";
        tooltip.innerHTML =
            charge.Description != null
                ? "<b>" + charge.Description + "</b>"
                : "<b>[Unknown Description]</b>";
        chargeEntry.appendChild(tooltip);

        // if (
            // "Description" in charge &&
            // ("Accessory" in charge || "Accomplice" in charge)
        // ) {
            // var seperator = document.createElement("div");
            // seperator.className = "charge-seperator";
            // seperator.style.outlineColor = "white";
            // tooltip.appendChild(seperator);

            // var extraInfo = document.createElement("div");
            // extraInfo.innerHTML =
                // "<b>An accomplice differs from an accessory in that an accomplice is present at the actual crime, and could be prosecuted even if the main criminal (the principal) is not charged or convicted. An accessory is generally not present at the actual crime, and may be subject to lesser penalties than an accomplice or principal.</b>";
            // tooltip.appendChild(extraInfo);
        // }
		

        return chargeEntry;
    }
}
