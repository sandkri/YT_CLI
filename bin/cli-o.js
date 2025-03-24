#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk").default;
const ora = require("ora").default;
const args = require("minimist")(process.argv.slice(2));

const CONFIG_PATH = path.join(__dirname, "config.json");

function findFFmpeg() {
    const cmd = os.platform() === "win32" ? "where ffmpeg" : "which ffmpeg";
    try {
        const ffmpegPath = execSync(cmd).toString().trim().split("\n")[0];
        if (fs.existsSync(ffmpegPath)) return ffmpegPath;
    } catch {}
    console.error(chalk.red("❌ FFmpeg not found. Install it or add to PATH."));
    process.exit(1);
}

function findSpotdl() {
    const cmd = os.platform() === "win32" ? "where spotdl" : "which spotdl";
    try {
        const spotdlPath = execSync(cmd).toString().trim().split("\n")[0];
        if (fs.existsSync(spotdlPath)) return spotdlPath;
    } catch {}
    return null;
}

function getDefaultDownloadsFolder() {
    return path.join(os.homedir(), "Downloads");
}

function loadConfig() {
    const defaultPath = getDefaultDownloadsFolder();
    const defaultConfig = { downloadPath: defaultPath };
    if (!fs.existsSync(CONFIG_PATH)) {
        saveConfig(defaultConfig);
        return defaultConfig;
    }
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        return config.downloadPath ? config : defaultConfig;
    } catch {
        saveConfig(defaultConfig);
        return defaultConfig;
    }
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf8");
}

async function downloadAudio(url, format) {
    const config = loadConfig();
    const outputDir = config.downloadPath;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const ext = format === "wav" ? "wav" : "mp3";

    if (url.includes("spotify.com")) {
        const spotdlPath = findSpotdl();
        if (!spotdlPath) {
            console.log(chalk.red("❌ spotdl not found. Install it with: pip install spotdl"));
            process.exit(1);
        }
        const spinner = ora("🎵 Using spotdl to download Spotify track...").start();
        const spot = spawn("spotdl", ["--output", outputDir, url]);

        spot.stderr.on("data", (data) => spinner.text = data.toString());

        spot.on("exit", (code) => {
            spinner.stop();
            console.log(code === 0 ? chalk.green("✅ Spotify download complete!") : chalk.red("❌ Spotify download failed."));
        });
        return;
    }

    const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");
    const ffmpegPath = findFFmpeg();
    const spinner = ora({ text: "⏳ Starting download...", spinner: "dots" }).start();

    const ytdlpArgs = [
        url,
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", ext,
        "--audio-quality", "0",
        "--ffmpeg-location", path.dirname(ffmpegPath),
        "-o", outputTemplate
    ];

    const ytDlp = spawn("yt-dlp", ytdlpArgs);

    ytDlp.stderr.on("data", (data) => {
        const output = data.toString();
        const match = output.match(/\[download\]\s+([\d.]+)%/);
        if (match) spinner.text = `⏳ Downloading... ${chalk.cyan(match[1] + "%")}`;
    });

    ytDlp.on("exit", (code) => {
        spinner.stop();
        console.log(code === 0 ? chalk.green("✅ Download complete!") : chalk.red("❌ Download failed!"));
    });
}

async function run() {
    const format = args.f || args.format;
    const url = args.u || args.url;

    if (!format || !url) {
        console.log("Usage: audio-c -f [mp3|wav] -u <url>");
        process.exit(1);
    }

    await downloadAudio(url, format);
}

run();
