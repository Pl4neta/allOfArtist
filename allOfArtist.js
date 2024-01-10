
(function allOfArtist() { 
    const {
        CosmosAsync,
        URI
    } = Spicetify;
    if (!(CosmosAsync && URI)) {
        setTimeout(allOfArtist, 300)
        return
    }
  
    const buttontxt = "Create All Of ..."

  
    function shouldDisplayContextMenu(uris) {
        if (uris.length > 1) {
            return false;
        }
        const uri = uris[0];
        const uriObj = Spicetify.URI.fromString(uri);
        if (uriObj.type === Spicetify.URI.Type.TRACK || uriObj.type === Spicetify.URI.Type.ARTIST) {
            return true;
        }
        return false;
    }

    const cntxMenu = new Spicetify.ContextMenu.Item(
        buttontxt,
        makePlaylist,
        shouldDisplayContextMenu,
    );

    cntxMenu.register();
})();
