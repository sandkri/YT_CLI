# XYN Audio Downloader 

# Easy to use automatic portfolio builder for every GitHub user!

![maintainability](https://img.shields.io/codeclimate/maintainability/sandkri/YT_CLI)
![Test Deployment](https://img.shields.io/badge/deployment-passing-brightgreen)
![issues](https://img.shields.io/github/issues/sandkri/YT_CLI)
![Stars](https://img.shields.io/github/stars/sandkri/YT_CLI?style=social)
![Forks](https://img.shields.io/github/forks/sandkri/YT_CLI?style=social)
![Last Commit](https://img.shields.io/github/last-commit/sandkri/YT_CLI?color=yellow&label=last%20commit)
![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen)
![License](https://img.shields.io/github/license/sandkri/YT_CLI)
![Open in IDX](https://img.shields.io/badge/Open%20in-IDX-000?logo=google)

---

[View Demo](https://your-demo-link.com) · [Report Bug](https://github.com/yourusername/yourrepo/issues) · [Request Feature](https://github.com/yourusername/yourrepo/issues)

A Node.js CLI tool to download audio from **YouTube** and **Spotify** in MP3 or WAV format.  
Includes support for `yt-dlp`, `ffmpeg`, and `spotdl`.

---

## Features

- Download **MP3** or **WAV** from YouTube
- Download Spotify tracks via [`spotdl`](https://github.com/spotDL/spotify-downloader)
- Set or restore download path
- Smooth CLI with spinners and prompts

---

## Requirements

- Node.js v16+
- Python 3.7+
- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp)
- [`ffmpeg`](https://ffmpeg.org/)
- [`spotdl`](https://github.com/spotDL/spotify-downloader)

---

## Installation

### 1. Clone this repo

```bash
git clone https://github.com/yourname/xyn-audio-downloader
cd xyn-audio-downloader
```

### 2. Install dependencies

```bash
npm install
```

### 3. Link CLI globally

```bash
npm link
```

Now you can run the tool anywhere by typing:

```bash
xyn
```

---

## Installing FFmpeg

### On Windows:
- Download from https://ffmpeg.org/download.html
- Extract and add the `bin` folder to your system PATH

### On macOS:
```bash
brew install ffmpeg
```

### On Linux:
```bash
sudo apt install ffmpeg
```

---

## Installing spotdl (Spotify Downloader)

```bash
pip install spotdl
```

> Make sure `spotdl` is in your system PATH.

To verify:
```bash
spotdl --version
```

---

## Usage

After running `xyn`, select:

1. 🎧 Download as MP3  
2. 🎼 Download as WAV  
3. 📂 Change Download Path  
4. 🔄 Restore Default  
5. ❌ Exit

Then paste a valid YouTube or Spotify URL when prompted.

---

## Config

A `config.json` is stored in the tool's folder to remember your download path.

---

## Notes

- Spotify tracks are downloaded using `spotdl`, which searches and downloads from YouTube.
- YouTube downloads use `yt-dlp` + `ffmpeg` directly.
- Make sure all tools (`ffmpeg`, `yt-dlp`, `spotdl`) are in your system's PATH.

---

## Credits

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp)
- [`ffmpeg`](https://ffmpeg.org/)
- [`spotdl`](https://github.com/spotDL/spotify-downloader)
- [`ora`](https://www.npmjs.com/package/ora), [`chalk`](https://www.npmjs.com/package/chalk), [`inquirer`](https://www.npmjs.com/package/inquirer)
- [`sandkri`](https://github.com/sandkri)

---

### ⚠️ Disclaimer

> This tool is provided for educational and personal use only.  
> I am **not liable** for any misuse, illegal downloads, or violations of terms of service related to third-party platforms.  
> Use this tool **at your own risk** and ensure you comply with the applicable laws in your region.

---

