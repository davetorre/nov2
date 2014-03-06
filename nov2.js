var context,
    bufferLoader,
    bufferList = [],
    music,
    finishedLoading,
    playButton = document.getElementById('playButton'),
    pauseButton = document.getElementById('pauseButton'),
    stopButton = document.getElementById('stopButton'),
    drumsButton = document.getElementById('drumsButton'),
    bassButton = document.getElementById('bassButton'),
    chordsButton = document.getElementById('chordsButton'),
    voxButton = document.getElementById('voxButton');
 
bufferLoader = {
    loadCount: 0,
    urlList: ["audio/drums.mp3",
              "audio/bass.mp3",
              "audio/chords.mp3",
              "audio/vox.mp3",
              "audio/Nov2_kick2.mp3",
              "audio/snare.mp3"
             ],
    loadBuffer: function (url, index) {
        var request = new XMLHttpRequest(),
            that = this;
        function callback(buffer) {
            bufferList[index] = buffer;
            that.loadCount++;
            if (that.loadCount === that.urlList.length) {
                // do the rest of the prep work
                finishedLoading();
            }
        }
        request.open("get", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            context.decodeAudioData(request.response, callback);
        };
        request.send();
    },
    load: function () {
        var i;
        for (i = 0; i < this.urlList.length; i += 1) {
            this.loadBuffer(this.urlList[i], i);
        }
    }
};

finishedLoading = function () {
    music.init();

    drumsButton.onclick = function () {
        music.toggleTrack(0);
        if (music.tracks[0].muted) {
            drumsButton.style.background = "#5d5d5d";
        } else {
            drumsButton.style.background = "#FFFFFF";
        }
    };
    
    bassButton.onclick = function () {
        music.toggleTrack(1);
        if (music.tracks[1].muted) {
            bassButton.style.background = "#5d5d5d";
        } else {
            bassButton.style.background = "#FFFFFF";
        }
    };
    
    chordsButton.onclick = function () {
        music.toggleTrack(2);
        if (music.tracks[2].muted) {
            chordsButton.style.background = "#5d5d5d";
        } else {
            chordsButton.style.background = "#FFFFFF";
        }
    };

    voxButton.onclick = function () {
        music.toggleTrack(3);
        if (music.tracks[3].muted) {
            voxButton.style.background = "#5d5d5d";
        } else {
            voxButton.style.background = "#FFFFFF";
        }
    };

    playButton.onclick = function () {
        music.play();
    };

    pauseButton.onclick = function () {
        music.pause();
    };

    stopButton.onclick = function () {
        music.stop();
    };
    
    document.onkeydown = function(event) {
        var keyCode = event.keyCode;
        var buffer, source;
        switch (keyCode) {
        case 70:
            buffer = bufferList[4]; //kick drum
            break;
        case 74:
            buffer = bufferList[5]; //snare
            break;
        default:
            return;
        }
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = false;
        source.connect(context.destination);
        source.start(context.currentTime);
    };
    
    document.getElementById('title').innerHTML = 'November 2';
    document.getElementById('title2').innerHTML =
            'F is for kick, J is for snare (on your keyboard!).';
};

music = {
    tracks: [],
    state: 0,
    init: function () {
        var i, source, gainNode;
        for (i = 0; i < 4; i++) { // using the first 4 files in bufferList
            source = context.createBufferSource();
            gainNode = context.createGain();
            source.buffer = bufferList[i];
            source.loop = false;
            source.connect(gainNode);
            gainNode.connect(context.destination);
            this.tracks.push({source: source, gainNode: gainNode, muted: false});
        }
    },
    toggleTrack: function (index) {
        if (!this.tracks[index].muted) {
            this.tracks[index].gainNode.gain.value = 0;
            this.tracks[index].muted = true;
        } else {
            this.tracks[index].gainNode.gain.value = 1;
            this.tracks[index].muted = false;
        }
    },
    play: function () {
        var i;
        if (this.state === 0) { // if stopped
            for (i = 0; i < this.tracks.length; i++) {
                this.tracks[i].source.start(context.currentTime);
            }
            this.state = 1;
        } else if (this.state === 2) { // if paused
            for (i = 0; i < this.tracks.length; i++) {
                this.tracks[i].source.connect(this.tracks[i].gainNode);
            }
            this.state = 1;
        }
    },
    pause: function () {
        var i;
        if (this.state === 1) { // if playing
            for (i = 0; i < this.tracks.length; i++) {
                this.tracks[i].source.disconnect();
            }
            this.state = 2;
        }
    },
    stop: function () {
        var i;
        if (this.state === 1 || this.state === 2) {
            for (i = 0; i < this.tracks.length; i++) {
                this.tracks[i].source.stop(context.currentTime);
                this.tracks[i].source = context.createBufferSource();
                this.tracks[i].source.buffer = bufferList[i];
                this.tracks[i].source.loop = false;
                this.tracks[i].source.connect(this.tracks[i].gainNode);
            }
            this.state = 0;
        }
    }
};

window.onload = function () {
    try {
        context = new AudioContext();
    } catch (e) {
        alert("No web audio support in this browser :(");
        return;
    }
    
    // load all audio files
    bufferLoader.load();      
};