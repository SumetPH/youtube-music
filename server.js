const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const ytlist = require("youtube-playlist");
const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const db = require("monk")("localhost/youtube_music");
const Song = db.get("song");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/audio", express.static(path.join(__dirname, "audio")));
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(morgan("dev"));
app.use(cors());

app.get("/playlist", async (req, res) => {
  const playlist = await ytlist(
    "https://www.youtube.com/playlist?list=PLeVBEy5zDyv6RlLARi1-s-KStlz1O3iRT"
  );
  const songs = await Song.find({});
  if (songs.length > 0) {
    const checkPlaylist = playlist.data.playlist.filter((p) => {
      if (!songs.find((s) => s.videoId === p.id)) return p;
    });
    return res.json(checkPlaylist);
  } else {
    return res.json(playlist.data.playlist);
  }
});

app.get("/songs", async (req, res) => {
  const songs = await Song.find({});
  return res.json(songs);
});

app.get("/download/:id", async (req, res) => {
  const YD = new YoutubeMp3Downloader({
    ffmpegPath: "/usr/local/bin/ffmpeg",
    outputPath: "./audio",
  });

  YD.download(req.params.id, `${req.params.id}.mp3`);
  YD.on("finished", function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).json("Download fail.");
    } else {
      Song.insert(data);
      return res.status(200).json(data);
    }
  });
});

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    return res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
