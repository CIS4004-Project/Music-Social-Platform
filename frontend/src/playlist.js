
let counter = 0;
async function searchMusic() {
    const term = document.getElementById('search').value.trim();
    if (!term) return;

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Searching...</p>';

    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=5`);
        const data = await res.json();

        resultsDiv.innerHTML = '';

        if (data.results.length === 0) {
            resultsDiv.innerHTML = '<p>No songs found.</p>';
            return;
        }
        
        let index = 0;
        const beginID = "button";
        //const index = data.results.length;

        data.results.forEach(song => {
            const div = document.createElement('div');
            const buttonID = beginID.concat(index);
            index++;
            //console.log(buttonID);
            div.classList.add('song-card');
            div.innerHTML = `
                <img src="${song.artworkUrl100}" alt="${song.trackName}">
                <div class="song-info">
                    <p class="song-title">${song.trackName}</p>
                    <p class="song-artist">${song.artistName}</p>
                    <audio controls src="${song.previewUrl}"></audio>
                </div>
                <button id="${buttonID}" onClick="addToPlaylist(${buttonID})">Add to playlist</button>
            `;
            resultsDiv.appendChild(div);
        });

    } catch (err) {
        resultsDiv.innerHTML = '<p>Could not fetch songs. Try again.</p>';
    }
}


function addToPlaylist(buttonID){
  console.log(buttonID.id + " was clicked");
  //get song attached to add button
  //document.getElementById('queue').innerHTML = "Added:";
  const currentSearchedSongs = document.querySelectorAll("div.song-card");
  const searchLength = currentSearchedSongs.length;
  //console.log(currentSearchedSongs);
  //console.log("found " + searchLength +" songs");
  
  //get index number 
  const ID = buttonID.id;
  const parsing = ID.split("n");
  const index = parsing[1];
  //console.log(parsing[1]);
  //console.log(currentSearchedSongs[index].innerHTML);
  //const parseInnerHTML = ID.split(" ");
  //console.log(currentSearchedSongs[index].innerHTML;

  const songID = "song" +counter;
  const deleteID = "delete" + counter;
  
  const newDiv = document.createElement('div');
  //newDiv.classlist.add('song-card');
  newDiv.id = songID;
  console.log("created " + newDiv.id);
  newDiv.innerHTML = currentSearchedSongs[index].innerHTML.slice(0,547);
  
  let deleteButton = document.createElement('button');
  deleteButton.innerHTML = "Delete";
  deleteButton.id = deleteID;
  //deleteButton.setAttribute("onClick", "deleteSong(songID)");
  //deleteButton.setAttribute("onClick", "deleteSong()");
  //deleteButton.addEventListener("click", deleteSong.bind(null,newDiv.id));
  console.log("created " + deleteButton.id);
  newDiv.appendChild(deleteButton);
  
  //console.log(newDiv);
  //newDiv.innerHTML = currentSearchedSongs[index];
  queue.appendChild(newDiv);
  counter++;
  deleteButton.addEventListener("click", deleteSong.bind(null,songID));
  
}

function deleteSong(currentSongID){
  console.log("delete button clicked for " + currentSongID);
  const currentSong = document.getElementById(currentSongID);
  currentSong.remove();
}
