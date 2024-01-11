//@ts-check

// NAME: All Of Artist
// AUTHOR: P4lmeiras
// DESCRIPTION: Create a playlist with all songs of an artist

/// <reference path="../../spicetify-cli/globals.d.ts" />
(function allOfArtist(){ 
    const{
        CosmosAsync,
        URI
    } = Spicetify;
    if (!(CosmosAsync && URI)){
        setTimeout(allOfArtist, 10)
        return
    }

    const buttontxt = "Create All Of ..."
    
    /*function btnText(uris){ 
        buttontxt = "Create All Of " + artistName.name
    }*/
    
    function makePlaylist(uris){
        const rawUri = uris[0]
        const uri = rawUri.split(":")[2]
        //const artistName = await CosmosAsync.get(`https://api.spotify.com/v1/artists/${uri}`)
        Spicetify.PopupModal.display({
            title: "Content",
            content: "Teste",
        });
    }
    
    function shouldDisplayContextMenu(uris){
        if (uris.length > 1){
            return false;
        }
        const uri = uris[0]
        const uriObj = Spicetify.URI.fromString(uri);
        if (uriObj.type === Spicetify.URI.Type.TRACK || uriObj.type === Spicetify.URI.Type.ARTIST){
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
