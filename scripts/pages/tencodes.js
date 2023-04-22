class TenCodesPage extends Page {
    getDisplayName() {
        return "10 Codes";
    }
    getDisplayEmoji() {
        return "📻";
    }

    hideFromPageList() {
        return !Boolean( localStorage.getItem("showhidden") );
    }

    setup() {
		
	}
}
