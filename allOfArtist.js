//@ts-check

// NAME: All Of Artist
// AUTHOR: Pl4neta
// DESCRIPTION: Create a playlist with all songs of an artist

/// <reference path="../../spicetify-cli/globals.d.ts" />
(async function allOfArtist(){

    if (!(Spicetify.CosmosAsync && Spicetify.LocalStorage)){
        setTimeout(allOfArtist, 300);
        return;
    }

    const { CosmosAsync, URI } = Spicetify;


    function getConfig(){
        try {
			const parsed = JSON.parse(Spicetify.LocalStorage.get("allOfArtist:settings"));
			if (parsed && typeof parsed === "object") {
				return parsed;
			}
			throw "";
		} catch {
			Spicetify.LocalStorage.set("allOfArtist:settings", JSON.stringify(defaultConfig));
			return defaultConfig;
		}
    }
    function saveConfig(){
		Spicetify.LocalStorage.set("allOfArtist:settings", JSON.stringify(CONFIG));
	}
    function resetConfig(){
		Spicetify.LocalStorage.set("allOfArtist:settings", JSON.stringify(defaultConfig));
    }

    const defaultConfig = { addFeatures: true, addCompilations: true, trackPriority: "trackCount", removeDupes: true, removeDupesConfirm: false, sortOrder: "oldest" };
    const CONFIG = getConfig();

function styleSettings() {
		const style = document.createElement("style");
		style.innerHTML = `
		.setting-row::after {
		  content: "";
		  display: table;
		  clear: both;
		}
		.setting-row {
		  display: flex;
		  padding: 10px 0;
		  align-items: center;
		  justify-content: space-between;
		}
		.setting-row .col.description {
		  float: left;
		  padding-right: 15px;
		  width: 100%;
		}
		.setting-row .col.action {
		  float: right;
		  text-align: right;
		}
		button.switch {
		  align-items: center;
		  border: 0px;
		  border-radius: 50%;
		  background-color: rgba(var(--spice-rgb-shadow), .7);
		  color: var(--spice-text);
		  cursor: pointer;
		  display: flex;
		  margin-inline-start: 12px;
		  padding: 8px;
		}
		button.switch.disabled,
		button.switch[disabled] {
		  color: rgba(var(--spice-rgb-text), .3);
		}
        select {
		color: var(--spice-text);
		background: rgba(var(--spice-rgb-shadow), 0.7);
		border: 0;
		height: 32px;
		}
		`;
		content.appendChild(style);
	}


    function header(title) {
        const container = document.createElement("h2");
        container.innerText = title;
        return container;
    }

    function checkButton(name, desc, attributes) {
        const val = CONFIG[name];
		    const container = document.createElement("div");
		    container.classList.add("setting-row");
		    container.innerHTML = `
			    <label class="col description">${desc}</label>
			    <div class="col action">
                    <button class="switch" ${attributes}>
			            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.check}</svg>
			        </button>
                </div>
            `;
            const button = container.querySelector("button.switch");
		    button.classList.toggle("disabled", !val);
		    button.onclick = () => {
			    const state = button.classList.contains("disabled");
			    button.classList.toggle("disabled");
                CONFIG[name] = state;
                saveConfig();
		    };
		    return container;
    }


    function dropDown(name, desc, options, attributes) {
        const val = CONFIG[name]
		    const container = document.createElement("div");
		    container.classList.add("setting-row");
            let optionsHTML = '';
            for (const [key, value] of Object.entries(options)) {
                optionsHTML += "<option value='"+key+"'>"+value+"</option>";
            }
		    container.innerHTML = `
			    <label class="col description">${desc}</label>
			    <div class="col action">
                    <select ${attributes}>
                        ${optionsHTML}
			        </select>
                </div>
            `;
		    
            const select = container.querySelector("select");
		    select.selectedIndex = val;
		    select.onchange = (e) => {
                CONFIG[name] = select.selectedIndex;
                saveConfig();
		    };
		    return container;
    }


        function settingsContent() {
		content.appendChild(header("Inclusion"));
		content.appendChild(checkButton("addFeatures", "Include Features", ""));
		content.appendChild(checkButton("addCompilations", "Include Compilations", ""));
        content.appendChild(dropDown("trackPriority", "Track Priority (COMING SOON!)", {trackCount: "Album's Track Count", oldest: "Oldest Releases", newest: "Newest Releases"}, "disabled"));

		content.appendChild(header("Dupes"));
		content.appendChild(checkButton("removeDupes", "Automatically Remove Dupes", ""));
		content.appendChild(checkButton("removeDupesConfirm", "Confirm Choices (COMING SOON!)", "disabled"));
		
        content.appendChild(header("Sorting"));
        content.appendChild(dropDown("sortOrder", "Sort Order (COMING SOON!)", {oldest: "Oldest to Newest", newest: "Newest to Oldest", type: "Albums -> EPs -> Singles"}, "disabled"));
	}

    const content = document.createElement("div");
	styleSettings();
	settingsContent();


    async function getArtist(uris){
		const uri = uris[0].split(':');
		const type = uri[1];
		const id = uri[2];
		var artistData = {};
		if(type == 'artist'){
			let artist = await CosmosAsync.get('https://api.spotify.com/v1/artists/'+id);
	    	artistData.id = artist.id;
	    	artistData.name = artist.name;
		}
		else{
			if(type == 'album'){
				let artist = await CosmosAsync.get('https://api.spotify.com/v1/albums/'+id);
				artistData.id = artist.artists[0].id;
				artistData.name = artist.artists[0].name;
			}
			else{
				if(type == 'track'){
					let artist = await CosmosAsync.get('https://api.spotify.com/v1/tracks/'+id);
					artistData.id = artist.artists[0].id;
					artistData.name = artist.artists[0].name;
				}
				else{
					artistData.id = artistData.name = 'ERROR';
				}
			}
		}
		return artistData;
    }

	function createAllOf(uris){
		makePlaylist_getTracks(uris);
	}

	async function makePlaylist_getTracks(uris){
        artistData = await getArtist(uris);
		const user = await CosmosAsync.get('https://api.spotify.com/v1/me');
		if(artistData.id != 'ERROR'){
			var artistAlbumsRaw = await CosmosAsync.get('https://api.spotify.com/v1/artists/'+artistData.id+'/albums?include_groups=album,single,appears_on&limit=50&offset=0');
			const total = artistAlbumsRaw.total;
			var artistAlbums = [];
			do{
				for(let i = 0; i < artistAlbumsRaw.items.length; i++){
					if(!(!CONFIG["addCompilations"] && artistAlbumsRaw.items[i].album_type == 'compilation')){
						let tempDate = artistAlbumsRaw.items[i].release_date.replace(/-/g, '');
						while(tempDate.length < 8){
							tempDate += '0';
						}
						artistAlbums.push([tempDate, artistAlbumsRaw.items[i].id, artistAlbumsRaw.items[i].album_type]);
					}
				}
				if(artistAlbumsRaw.next != null)
					artistAlbumsRaw = await CosmosAsync.get(artistAlbumsRaw.next);
				else
					break;
			}while(artistAlbums.length < total)
			artistAlbums.sort();
			const newPlaylist = await CosmosAsync.post('https://api.spotify.com/v1/users/' + user.id + '/playlists', {
            	name: 'All Of '+artistData.name,
				description: 'Playlist with all '+artistData.name+' songs, generated by Pl4neta\'s extenstion allOfArtist',
				public: false,
				collaborative: false
        	});
			await addFromAlbums(newPlaylist.id,artistData,artistAlbums);
			Spicetify.showNotification('All Of '+artistData.name+' created.');
		}
		else{
			Spicetify.showNotification('ERROR creating All Of '+artistData.name, true);
		}
	}
	
	async function getIndexFrom2dArray(array,key){
		for(let i = 0; i < array.length; i++){
			let index = array[i].indexOf(key);
			if(index > -1)
				return i;
		}
		return false;
	}

	async function addFromAlbums(playlistId,artistData,array){
		var removeTracks = [];
		var tracks = [];
		for(let i = 0; i < array.length; i++){
			var tracksAdd = [];
			var albumTracks = await CosmosAsync.get('https://api.spotify.com/v1/albums/'+array[i][1]+'/tracks?offset=0&limit=50');
			while(true){
				for(let r = 0; r < albumTracks.items.length; r++){
					for(let c = 0; c < albumTracks.items[r].artists.length; c++){
						if(albumTracks.items[r].artists[c].id == artistData.id && !(!CONFIG["addFeatures"] && c > 0)){
							let index = await getIndexFrom2dArray(tracks,albumTracks.items[r].name);
                            tracks.push([albumTracks.items[r].name, albumTracks.items[r].uri, albumTracks.total, array[i][2]]);
                            tracksAdd.push(albumTracks.items[r].uri);
                            if(CONFIG["removeDupes"] && index){
                                if(array[i][2] != "compilation" && (tracks[index][3] == "compilation" || albumTracks.total > tracks[index][2])){
                                    removeTracks.push({uri:tracks[index][1]});
                                    tracks.splice(index,1);
                                }
                                else{
                                    removeTracks.push({uri:albumTracks.items[r].uri});
                                    tracks.pop()
                                }
                            }
						}
					}
				}
				if(albumTracks.next != null)
					albumTracks = await CosmosAsync.get(albumTracks.next);
				else
					break;
			}
			await CosmosAsync.post('https://api.spotify.com/v1/playlists/'+playlistId+'/tracks', {
				uris: tracksAdd
			});
		}
		if(removeTracks){
			for(let i = 0; i < removeTracks.length; i += 100){
				let slice = removeTracks.slice(i, i + 100);
				await CosmosAsync.del('https://api.spotify.com/v1/playlists/'+playlistId+'/tracks', {
						tracks: slice
				});
			}
		}
	}

    async function shouldDisplayContextMenu(uris){
        if (uris.length > 1){
            return false;
        }
        const uri = uris[0];
        const uriObj = Spicetify.URI.fromString(uri);
        if (uriObj.type === Spicetify.URI.Type.TRACK || uriObj.type === Spicetify.URI.Type.ARTIST || uriObj.type === Spicetify.URI.Type.ALBUM){
			let artist = await getArtist(uris);
			cntxMenu.name = 'Create All Of ' + artist.name;
			return true;
        }
        return false;
    }

    new Spicetify.Menu.Item(
		"All Of Artist",
		false,
		() => {
			Spicetify.PopupModal.display({
				title: "All Of Artist Settings",
				content,
                isLarge: true,
			});
		},
		'artist'
	).register();

    const cntxMenu = new Spicetify.ContextMenu.Item(
        'Create All Of',
        createAllOf,
		shouldDisplayContextMenu,
        'artist'
    );
    cntxMenu.register();
})();
