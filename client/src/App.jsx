import React, { useEffect, useState } from "react";
import axios from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

function App() {
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [player, setPlayer] = useState("");

  useEffect(() => {
    fetchSongs();
    fetchPlaylist();
  }, []);

  const fetchSongs = () => {
    axios.get("/songs").then((res) => {
      console.log(res.data);
      if (res.data.length > 0) {
        let oldSongs = res.data;
        let newSongs = [];
        oldSongs.forEach(() => {
          const randomIndex = Math.floor(Math.random() * oldSongs.length);
          newSongs.push(oldSongs[randomIndex]);
          oldSongs = oldSongs.filter((song, index) => index !== randomIndex);
        });

        setSongs(newSongs);
        setPlayer(newSongs[0]);
      }
    });
  };

  const downloadSong = (e, song) => {
    e.target.className = "button is-loading";
    axios.get(`/download/${song.id}`).then((res) => {
      console.log(res);
      setSongs((old) => [...old, res.data]);
      fetchPlaylist();
    });
  };

  const fetchPlaylist = () => {
    axios.get("/playlist").then((res) => {
      console.log(res.data);
      setPlaylist(res.data);
    });
  };

  const prev = () => {
    if (playerIndex > 0) {
      console.log("prev");
      setPlayer(songs[playerIndex - 1]);
      setPlayerIndex(playerIndex - 1);
    }
  };

  const next = () => {
    if (playerIndex < songs.length - 1) {
      console.log("next");
      setPlayer(songs[playerIndex + 1]);
      setPlayerIndex(playerIndex + 1);
    }
  };

  const shuffle = () => {
    let oldSongs = songs;
    let newSongs = [];
    oldSongs.forEach(() => {
      const randomIndex = Math.floor(Math.random() * oldSongs.length);
      newSongs.push(oldSongs[randomIndex]);
      oldSongs = oldSongs.filter((song, index) => index !== randomIndex);
    });
    setSongs(newSongs);
    setPlayerIndex(-1);
  };

  return (
    <div>
      <div className="column">
        <div className="columns">
          <div className="column is-2"></div>
          <div className="column">
            <figure className="image is-16by9">
              {songs.length > 0 ? (
                <img
                  src={`https://img.youtube.com/vi/${player.videoId}/maxresdefault.jpg`}
                  alt=""
                />
              ) : null}
            </figure>
          </div>
          <div className="column is-2"></div>
        </div>
      </div>
      <div className="column">
        <h3 className="has-text-centered">{player.name}</h3>
      </div>
      <div className="column">
        {songs.length > 0 ? (
          <AudioPlayer
            autoPlay={false}
            src={`/audio/${player.videoId}.mp3`}
            onPlay={() => console.log("play")}
            onClickPrevious={prev}
            onClickNext={next}
            onEnded={next}
            showSkipControls={true}
            showJumpControls={false}
          />
        ) : null}
      </div>
      <div className="column">
        <div className="columns">
          <div className="column is-6">
            <div className="card">
              <div className="card-header">
                <p className="card-header-title">Song</p>
                <button
                  className="card-header-icon button"
                  style={{ marginRight: "5px", marginTop: "5px" }}
                  onClick={shuffle}
                >
                  Shuffle
                </button>
              </div>
              <div className="card-content">
                {songs.map((item) => (
                  <div className="columns" key={item.videoId}>
                    <div className="column is-12">
                      <p>{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="column is-6">
            <div className="card">
              <div className="card-header">
                <p className="card-header-title">Playlist</p>
              </div>
              <div className="card-content">
                {playlist.map((item) => (
                  <div className="columns" key={item.id}>
                    <div className="column is-10">
                      <p>{item.name}</p>
                    </div>
                    <div className="column is-2">
                      <button
                        className={`button`}
                        onClick={(e) => downloadSong(e, item)}
                      >
                        Loading
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
