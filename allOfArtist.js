//@ts-check

// NAME: All Of Artist
// AUTHOR: P4lmeiras
// DESCRIPTION: Create a playlist with all songs of an artist

/// <reference path="../../spicetify-cli/globals.d.ts" />
(async function allOfArtist(){

    if (!(Spicetify.CosmosAsync && Spicetify.Platform)){
        setTimeout(allOfArtist, 300);
        return;
    }

    const { CosmosAsync, URI, React } = Spicetify;
    const { useState } = React;
    
    function getConfig(){
        try{
            const parsed = JSON.parse(Spicetify.LocalStorage.get("allOfArtistConfig") || "{}");
            if (parsed && typeof parsed === "object"){
                return parsed;
            }
            throw "";
        }
        catch{
            Spicetify.LocalStorage.set("allOfArtistConfig", "{}");
            return {};
        }
    }

    const CONFIG = getConfig();
	saveConfig();


    function saveConfig(){
        Spicetify.LocalStorage.set("allOfArtistConfig", JSON.stringify(CONFIG));
    }

	function settings(){
        const style = React.createElement(
			"style",
			null,
			`.popup-row::after {
				content: "";
				display: table;
				clear: both;
			}
			.popup-row .col {
				display: flex;
				padding: 10px 0;
				align-items: center;
			}
			.popup-row .col.description {
				float: left;
				padding-right: 15px;
			}
			.popup-row .col.action {
				float: right;
				text-align: right;
			}
			.popup-row .div-title {
				color: var(--spice-text);
			}
			.popup-row .divider {
				height: 2px;
				border-width: 0;
				background-color: var(--spice-button-disabled);
			}
			button.checkbox {
				align-items: center;
				border: 0px;
				border-radius: 50%;
				background-color: rgba(var(--spice-rgb-shadow), 0.7);
				color: var(--spice-text);
				cursor: pointer;
				display: flex;
				margin-inline-start: 12px;
				padding: 8px;
			}
			button.checkbox.disabled {
				color: rgba(var(--spice-rgb-text), 0.3);
			}
			select {
				color: var(--spice-text);
				background: rgba(var(--spice-rgb-shadow), 0.7);
				border: 0;
				height: 32px;
			}
			::-webkit-scrollbar {
				width: 8px;
			}`
		);

        function DisplayIcon({ icon, size }) {
		    return React.createElement("svg", {
    			width: size,
    			height: size,
    			viewBox: "0 0 16 16",
    			fill: "currentColor",
    			dangerouslySetInnerHTML: {
    				__html: icon,
    			},
    		});
    	}

        function checkBoxItem({ name, field, defaultValue, onclickFun = () => {} }) {
    		let [value, setValue] = useState(CONFIG[field]);
            value = value? true : defaultValue;
    		return React.createElement(
    			"div",
    			{ className: "popup-row" },
    			React.createElement("label", { className: "col description" }, name),
    			React.createElement(
    				"div",
    				{ className: "col action" },
    				React.createElement(
    					"button",
    					{
    						className: `checkbox${value ? "" : " disabled"}`,
    						onClick: () => {
                                
    							CONFIG[field] = !value;
    							setValue(!value);
    							saveConfig();
    							onclickFun();
    						},
    					},
    					React.createElement(DisplayIcon, { icon: Spicetify.SVGIcons.check, size: 16 })
    				)
    			)
    		);
    	}

        function dropDownItem({ name, field, options, onclickFun = () => {} }) {
			const [value, setValue] = useState(CONFIG[field]);
			return React.createElement(
				"div",
				{ className: "popup-row" },
				React.createElement("label", { className: "col description" }, name),
				React.createElement(
					"div",
					{ className: "col action" },
					React.createElement(
						"select",
						{
							value,
							onChange: (e) => {
								setValue(e.target.value);
								CONFIG[field] = e.target.value;
								saveConfig();
								onclickFun();
							},
						},
						Object.keys(options).map((item) =>
							React.createElement(
								"option",
								{
									value: item,
								},
								options[item]
							)
						)
					)
				)
			);
		}

        let settingsDOMContent = React.createElement(
            "div",
            null,
            style,
            React.createElement("div", { className: "popup-row" }, React.createElement("h3", { className: "div-title" }, "Inclusion")),
    		React.createElement("div", { className: "popup-row" }, React.createElement("hr", { className: "divider" }, null)),
            React.createElement(checkBoxItem, {
			    name: "Include Features",
			    field: "addArtistFeatures",
                defaultValue: true,
    		}),
            React.createElement(checkBoxItem, {
			    name: "Include Compilations",
			    field: "addArtistCompilations",
                defaultValue: true,
		    }),
            React.createElement("div", { className: "popup-row" }, React.createElement("h3", { className: "div-title" }, "Dupes")),
		    React.createElement("div", { className: "popup-row" }, React.createElement("hr", { className: "divider" }, null)),
            React.createElement(checkBoxItem, {
			    name: "Automatically Remove Dupes",
			    field: "removeArtistDupes",
                defaultValue: true,
		    }),
            React.createElement(checkBoxItem, {
			    name: "Confirm Choices (Coming Soon!)",
			    field: "removeArtistDupesConfirm",
                defaultValue: false,
		    }),
            React.createElement("div", { className: "popup-row" }, React.createElement("h3", { className: "div-title" }, "Sorting")),
		    React.createElement("div", { className: "popup-row" }, React.createElement("hr", { className: "divider" }, null)),
            React.createElement(dropDownItem, {
			    name: "Sort Priority",
			    field: "sortPriority",
			    options: {
				    trackCount: "Track Count",
				    older: "Older Releases",
				    newer: "Newer Releases",
	            },
            })        
        );

	    Spicetify.PopupModal.display({
		    title: 'All Of Artist Settings (Work In Progress!)',
		    content: settingsDOMContent,
		    isLarge: true,
	    });
    }

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

	function playlistComplete(uris){
		makePlaylist_getTracks(uris, 'complete');
	}
	
	function playlistOriginals(uris){
		makePlaylist_getTracks(uris, 'originals');
	}
	
	function playlistCompilations(uris){
		makePlaylist_getTracks(uris, 'compilations');
	}

    function playlistRawFull(uris){
        makePlaylist_getTracks(uris, 'raw');
    }

	async function makePlaylist_getTracks(uris,type){
        artistData = await getArtist(uris);
		const user = await CosmosAsync.get('https://api.spotify.com/v1/me');
		if(artistData.id != 'ERROR'){
			var artistAlbumsRaw = await CosmosAsync.get('https://api.spotify.com/v1/artists/'+artistData.id+'/albums?include_groups=album,single,appears_on&limit=50&offset=0');
			const total = artistAlbumsRaw.total;
			var artistAlbums = [];
			do{
				for(let i = 0; i < artistAlbumsRaw.items.length; i++){
					if(!((type != 'compilations' || type != 'raw') && artistAlbumsRaw.items[i].album_type == 'compilation')){
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
			let descType = '';
			if(type == 'originals') descType = ' original';
			const newPlaylist = await CosmosAsync.post('https://api.spotify.com/v1/users/' + user.id + '/playlists', {
            	name: 'All Of '+artistData.name,
				description: 'Playlist with all '+artistData.name+descType+' songs, generated by P4lmeiras\' extenstion allOfArtist',
				public: false,
				collaborative: false
        	});
			await addFromAlbums(newPlaylist.id,artistData,artistAlbums,type);
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

	async function addFromAlbums(playlistId,artistData,array,type){
		var removeTracks = [];
		var tracks = [];
		for(let i = 0; i < array.length; i++){
			var tracksAdd = [];
			var albumTracks = await CosmosAsync.get('https://api.spotify.com/v1/albums/'+array[i][1]+'/tracks?offset=0&limit=50');
			while(true){
				for(let r = 0; r < albumTracks.items.length; r++){
					for(let c = 0; c < albumTracks.items[r].artists.length; c++){
						if(albumTracks.items[r].artists[c].id == artistData.id && !(type == 'originals' && c > 0)){
							let index = await getIndexFrom2dArray(tracks,albumTracks.items[r].name);
							if(index && array[i][2] != "compilation"){
								if(tracks[index][3] == "compilation" || albumTracks.total > tracks[index][2]){
                                    tracks.push([albumTracks.items[r].name, albumTracks.items[r].uri, albumTracks.total, array[i][2]]);
									tracksAdd.push(albumTracks.items[r].uri);
									removeTracks.push({uri:tracks[index][1]});
									tracks.splice(index,1);
								}
							}
							else if(!index){
								tracks.push([albumTracks.items[r].name, albumTracks.items[r].uri, albumTracks.total, array[i][2]]);
								tracksAdd.push(albumTracks.items[r].uri);
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
		if(removeTracks && type != 'raw'){
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

	const menu = new Spicetify.Menu.Item(
		'All of Artist Settings',
		false,
		settings,
		'artist',
	);

    const cntxWith = new Spicetify.ContextMenu.Item(
        'With Featured On',
		playlistComplete,
		shouldDisplayContextMenu,
		'playlist',
    );
	
    const cntxWithout = new Spicetify.ContextMenu.Item(
        'Only Originals',
		playlistOriginals,
		shouldDisplayContextMenu,
		'playlist',
    );
	
	const cntxCompilations = new Spicetify.ContextMenu.Item(
		'Include Compilations',
		playlistCompilations,
		shouldDisplayContextMenu,
		'playlist',
	);

    const cntxRawFull = new Spicetify.ContextMenu.Item(
		'Include Compilations (with dupes)',
		playlistRawFull,
		shouldDisplayContextMenu,
		'playlist',
    );

    const cntxMenu = new Spicetify.ContextMenu.SubMenu(
        'Create All Of',
		[
			cntxWith,
			cntxWithout,
			cntxCompilations,
            cntxRawFull,
		],
		shouldDisplayContextMenu,
    );
	menu.register();
	cntxMenu.register();
})();
