
var Locals = {};
for (const [key, street] of Object.entries(MAP.Locations)){
	if( Boolean(street.Coords) ){
	   if (window.isDebug) console.log(key );
	   Locals[ key ] = street;
	}
}
if (window.isDebug) console.log( Locals );

class LocationsPage extends Page {
    getDisplayName() {
        return 'Locations';
    }
    getDisplayEmoji() {
        return "🗺️";
    }LocationPage

    setup() {
        this.setupSearch();
        this.setupMap();
        this.setupButton();
    }

    setupSearch() {
		
        this.search = new SearchProvider(
            this.pageElement.querySelector(".searchbar"),
            this.pageElement.querySelector(".search-content")
        );

        this.search.searchFunction = (term, filters) => {
            if ((term == null || term.length <= 1) && filters.length <= 0) {
                return Object.values(Locals);
            }

            var valid = [];

			var propterm = this.validPropertyTerm;
			Object.keys(Locals).sort().forEach(function(value, i) {
				if (window.isDebug) console.log("DEBUG 1", value, Locals[value]);
				
                if ( propterm(Locals[value], term) )
                    valid.push(Locals[value]);
					
			});


			/*
            for (const [key, value] of Object.entries(STREETNAMES)) {
                if (
                    this.validPropertyTerm(value, term) 
                    // this.validPropertyTerm(value, term) &&
                    // this.validPropertyFilters(value, filters)
                )
                    valid.push(value);
            }
			*/
			
            return valid;
        };

        var context = this;
        this.search.drawFunction = (property) => {
			// console.log( property );
            var subtitle = "[Unknown Location]";

            if (property.Name in MAP.Locations) {
                var locale = MAP.Locations[property.Name];

                if (locale.Coords != null) subtitle = "";
                if (locale.Area != null) subtitle = locale.Area;
                if (locale.Street != null) subtitle = locale.Street;
            }

            return {
                title: property.Name,
                subtitle: "",
                onclick: function () {
                    context.showProperty(property.Name);
                },
            };
        };

        this.search.setSearchFilters(["Street", "Avenue", "Drive", "Way", "Boulevard", "Freeway", "Highway" ], true );

        this.search.update("");
    }

    validPropertyTerm(property, term) {
		if (window.isDebug) console.log(property, term);
        if (term.length > 0) {
            if (property.Name.toLowerCase().includes(term)) return true;
        } else {
            return true;
        }

        return false;
    }

    // validateFilter(property, filter) {
		// console.log(property, filter);
        // return false;
    // }

    validPropertyFilters(property, filters) {
        // for (let i = 0; i < filters.length; i++) {
            // const filter = filters[i];

            // if (!this.validateFilter(property, filter)) return false;
        // }

		console.log(property, filter);
        return true;
    }

    setupMap() {
        this.map = new MapProvider(
            this.pageElement.querySelector(".properties-map")
        );

        // for (const [key, area] of Object.entries(MAP.Areas)) {
            // this.map.addMapObject(key, new AreaObject(this.map, area));
        // }

		// STREETNAMES
        for (const [key, street] of Object.entries(MAP.Streets)) {
            this.map.addMapObject(key, new StreetObject(this.map, street));
        }		

        for (const [key, location] of Object.entries(MAP.Locations)) {
            if (location.Coords != null) {
                location["Name"] = key;
                this.map.addMapObject(
                    key,
                    new LocationObject(this.map, location)
                );
            }
        }
    }

    showProperty(propertyName) {
        if (!(propertyName in STREETNAMES)) {
            return;
        }

        this.currentProperty = STREETNAMES[propertyName];

        if (propertyName in MAP.Locations)
            this.map.focusLocation(MAP.Locations[propertyName]);
        else this.map.resetView();

        // document.getElementById("propertyTitle").innerHTML = propertyName;
		
		/*
        var keyholderParent = document.getElementById("propertyKeyholders");
        keyholderParent.replaceChildren();

        // owner section
        var ownerHeader = document.createElement("div");
        ownerHeader.className = "title";
        ownerHeader.innerHTML = "Owner";
        keyholderParent.appendChild(ownerHeader);

        // find owner from all keyholders
        var ownerFound = false;
        for (let i = 0; i < this.currentProperty.Keys.length; i++) {
            const holder = this.currentProperty.Keys[i];

            if (holder.Type == "Owner") {
                var ownerEntry = document.createElement("div");
                ownerEntry.className = "entry";
                ownerEntry.innerHTML = `(${holder.StateID}) ${
                    PROFILES[holder.StateID].Name
                }`;
                ownerEntry.addEventListener("click", function () {
                    showPage("profiles");
                    PAGES["profiles"].showProfile(holder.StateID);
                    PAGES["profiles"].search.update(
                        `housing="${propertyName}"`
                    );
                });
                keyholderParent.appendChild(ownerEntry);

                ownerFound = true;

                break;
            }
        }

        if (!ownerFound) {
            var unknownOwnerEntry = document.createElement("div");
            unknownOwnerEntry.className = "entry";
            unknownOwnerEntry.innerHTML = "[Unknown Owner]";
            keyholderParent.appendChild(unknownOwnerEntry);
        }

        // keyholder section
        var keyholderHeader = document.createElement("div");
        keyholderHeader.className = "title";
        keyholderHeader.innerHTML = "Keyholders";
        keyholderParent.appendChild(keyholderHeader);

        for (let i = 0; i < this.currentProperty.Keys.length; i++) {
            const holder = this.currentProperty.Keys[i];

            if (holder.Type == "Keyholder") {
                var keyholderEntry = document.createElement("div");
                keyholderEntry.className = "entry";
                keyholderEntry.innerHTML = `(${holder.StateID}) ${
                    PROFILES[holder.StateID].Name
                }`;
                keyholderEntry.addEventListener("click", function () {
                    showPage("profiles");
                    PAGES["profiles"].showProfile(holder.StateID);
                    PAGES["profiles"].search.update(
                        `housing="${propertyName}"`
                    );
                });
                keyholderParent.appendChild(keyholderEntry);
            }
        }
		
		*/

        setURLParam("id", propertyName);
    }
	
    setupButton() {
		 // document.getElementById("mapButton").addEventListener("click", this.mapOnly )
	}
	/*
    mapOnly() {
		this.isMapOnly = this.isMapOnly || false;
		var tab1 = document.getElementById("propTab");
		var tab2 = document.getElementById("mapTab");
		var tab3 = document.getElementById("infoTab");
		
		if (this.isMapOnly){
			//tab1.hide();
			//tab3.hide();
			//tab2.width = 40%;
		} else {
			//tab1.show();
			//tab3.show();
			//tab2.width = 200%;
		}
		this.isMapOnly = !this.isMapOnly;
    }
	*/
}
