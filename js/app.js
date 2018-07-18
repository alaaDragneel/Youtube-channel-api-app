// Set Options
const CLIENT_ID = 'YOUR_CLIENT_ID'; // NOTE: Not API Id But The Client Id 
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authBtn           = document.getElementById('auth-btn');
const logoutBtn         = document.getElementById('logout-btn');
const content           = document.getElementById('content');
const channelForm       = document.getElementById('channel-form');
const channelInput      = document.getElementById('channel-input');
const videoContainer    = document.getElementById('video-container');

const defaultChannel    = 'techguyweb'; 

// Form Submit And Change Channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;

    getChannel(channel);
});

// Load auth2 Library
function handleClientLoad()
{
    gapi.load('client:auth2', initClient);
}

// init API Client Library And Set Up authorization Listeners

function initClient() 
{
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then( () => {
        // Listen For The Sign In Changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

        // Handle The Initial Sign In State
        updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())

        authBtn.onclick = handleAuthCLick;
        logoutBtn.onclick = handleLogoutCLick;
    });
}

// Update UI Sign in Changes
function updateSignInStatus(isSignedIn)
{
    if (isSignedIn) {
        authBtn.style.display           = 'none';
        logoutBtn.style.display         = 'block';
        content.style.display           = 'block';
        videoContainer.style.display    = 'block';

        // Get Channel
        getChannel(defaultChannel);
    } else {
        authBtn.style.display           = 'block';
        logoutBtn.style.display         = 'none';
        content.style.display           = 'none';
        videoContainer.style.display    = 'none';
    }
}

// Handle Login
function handleAuthCLick()
{
    gapi.auth2.getAuthInstance().signIn();
}

// Handle Logout
function handleLogoutCLick()
{
    gapi.auth2.getAuthInstance().signOut();
}

// Display Channel Data
function showChannelData(data)
{
    const channelData = document.getElementById('channel-data'); 

    channelData.innerHTML = data;
}

// Get Channel From The API
function getChannel(channel)
{
    gapi.client.youtube.channels.list({
        part: 'snippet,contentDetails,statistics',
        forUsername: channel
    })
    .then(response => {
        console.log(response);
        
        const channel = response.result.items[0];

        const output = `
            <ul class="collection" >
                <li class="collection-item" >Title: ${channel.snippet.title}</li>
                <li class="collection-item" >ID: ${channel.id}</li>
                <li class="collection-item" >Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
                <li class="collection-item" >Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
                <li class="collection-item" >Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
            </ul>
            <p>${channel.snippet.description}</p>
            <hr/>
            <a href="https://youtube.com/${channel.snippet.customUrl}" class="btn grey darken-2" target="_blank"> Visit Channel </a>
        `;
        showChannelData(output); 

        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No Channel By That Name Fucker!'))
}

// Request The Videos From The Playlist
function requestVideoPlaylist(playlistId)
{
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 10
    };

    const request = gapi.client.youtube.playlistItems.list(requestOptions);

    request.execute(response => {
        console.log(response);
        const playlistItems = response.result.items;

        if (playlistItems) {
            let output = '<br/><h4 class="center-align">Latest Videos</h4>'

            // loop Throw Videos and append output
            playlistItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
                    <div class="col s3">
                        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>
                 `;
            });

            // Output Videos
            videoContainer.innerHTML = output;

        } else {
            videoContainer.innerHTML = 'No Uploaded Videos Fucker';
        }
    });
}

// Add Commas To Number
function numberWithCommas(number)
{
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}


