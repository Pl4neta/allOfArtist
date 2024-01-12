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
        setTimeout(allOfArtist, 10);
        return;
    }

    const buttontxt = "Create All Of ..."
    
    /*function btnText(uris){ 
        buttontxt = "Create All Of " + artistName.name
    }*/
    

    async function getArtist(uri){
	var artistData = {}
	try{
	    let artist = await CosmosAsync.get('https://api.spotify.com/v1/artists/'+uri)
	    artistData.id = artist.id
	    artistData.name = artist.name
	}
	catch{
	    try{
		let artist = await CosmosAsync.get('https://api.spotify.com/v1/tracks/'+uri)
		artistData.id = artist.artists[0].id
		artistData.name = artist.artists[0].name
	    }
	    catch{
		artistData.id = artistData.name = 'ERROR'
	    }
	}
	/*if (artist.error.status == '404'){
	    artist = await CosmosAsync.get('https://api.spotify.com/v1/tracks/'+uri)
	    artistName = artist.artists[0].name
	}
	else*/
	    //artistName = artist.error.message
	artistData.name = artistData.name.replace(/\s/g, '%20');
	return artistData;
	//return 'teste';
    }

    async function makePlaylist(uris){
        const rawUri = uris[0]
        const uri = rawUri.split(":")[2]
		const artist = await getArtist(uri)
        var offset = 0
        if(artist.id != 'ERROR'){
	    	const artistTracksSearchRaw = await CosmosAsync.get('https://api.spotify.com/v1/search?query=artist%3A'+artist.name+'&type=track&offset='+offset+'&limit=50')
	    	var artistTracks = []
	    	var artistTracksSearch = artistTracksSearchRaw.tracks.items
	    	for (let i = 0; i < artistTracksSearch.length; i++){
			var check = false;
			for (let r = 0; r < artistTracksSearch[i].artists.length; r++){
		    	if(artistTracksSearch[i].artists[r].id == artist.id)
				check = true;
			}
			if(check)
		    	artistTracks.push(artistTracksSearch[i].name);
	    	};
			//artistTracksSearch.foreach((track) => {
	    	//let t = track.name
	    	//artistTracks.push(t);
			//});*/
	    	Spicetify.PopupModal.display({
			title: "Content",
			content: artistTracks//uri+' '+artistTracksSearch[0].artists.length//artistName //artistTracks[0]+artistTracks[1]+artistTracks[2],
	    	});
		}
		else{
	    	Spicetify.PopupModal.display({
			title: "Content",
			content: 'Error',
	    	});
		}
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
