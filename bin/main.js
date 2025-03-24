#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const figlet = require("figlet");
const chalk = require("chalk").default;
const inquirer = require("inquirer").default;
const ora = require("ora").default;

const CONFIG_PATH = path.join(__dirname, "config.json");

// Print banner
function printBanner() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync("AUDIO", { horizontalLayout: "fitted" })));
    console.log(chalk.cyan("AUDIO Downloader"));
    console.log(chalk.cyan("-----------------------------"));
}

// Check for FFmpeg
function findFFmpeg() {
    const cmd = os.platform() === "win32" ? "where ffmpeg" : "which ffmpeg";
    try {
        const ffmpegPath = execSync(cmd).toString().trim().split("\n")[0];
        if (fs.existsSync(ffmpegPath)) return ffmpegPath;
    } catch {}
    console.error(chalk.red("❌ FFmpeg not found. Install it or add to PATH."));
    process.exit(1);
}

// Check for spotdl
function findSpotdl() {
    const cmd = os.platform() === "win32" ? "where spotdl" : "which spotdl";
    try {
        const spotdlPath = execSync(cmd).toString().trim().split("\n")[0];
        if (fs.existsSync(spotdlPath)) return spotdlPath;
    } catch {}
    return null;
}

// Default path
function getDefaultDownloadsFolder() {
    return path.join(os.homedir(), "Downloads");
}

// Config loader
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

// Config writer
function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf8");
}

// Audio downloader
async function downloadAudio(url, format) {
    await fetchMetadata(url);
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

    const args = [
        url,
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", ext,
        "--audio-quality", "0",
        "--ffmpeg-location", path.dirname(ffmpegPath),
        "--concurrent-fragments", Math.floor(os.cpus().length/2).toString(),
        "-o", outputTemplate
    ];

    const ytDlp = spawn("yt-dlp", args);

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


// Meta data
async function fetchMetadata(url) {
    try {
        const result = execSync(`yt-dlp --dump-json ${url}`, { encoding: "utf8" });
        const info = JSON.parse(result);

        console.log(chalk.blue("\n🎶 Track Info:"));
        console.log(chalk.green(`• Title: ${info.title}`));
        console.log(chalk.green(`• Artist: ${info.artist || info.uploader}`));
        console.log(chalk.green(`• Duration: ${formatDuration(info.duration)}`));
        console.log(chalk.green(`• Format: ${info.ext || 'unknown'}`));
        console.log("");

    } catch (err) {
        console.log(chalk.red("❌ Failed to fetch metadata."));
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Main menu
async function main() {
    printBanner();

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "🎵 Select an option:",
            choices: [
                { name: "🎧 MP3", value: "mp3" },
                { name: "🎼 WAV", value: "wav" },
                { name: "📂 Change Path", value: "setPath" },
                { name: "🔄 Restore Default", value: "restorePath" },
                { name: "❌ Exit", value: "exit" },
            ],
        },
    ]);

    if (action === "exit") return console.log(chalk.yellow("👋 Goodbye!"));

    if (action === "setPath") {
        const { newPath } = await inquirer.prompt([
            {
                type: "input",
                name: "newPath",
                message: "📂 Enter new download path:",
                validate: (input) => fs.existsSync(input) || "❌ Path not found.",
            },
        ]);
        const config = loadConfig();
        config.downloadPath = newPath;
        saveConfig(config);
        console.log(chalk.green(`✅ Path set to: ${newPath}`));
        return main();
    }

    if (action === "restorePath") {
        const defPath = getDefaultDownloadsFolder();
        saveConfig({ downloadPath: defPath });
        console.log(chalk.green(`🔄 Restored to default: ${defPath}`));
        return main();
    }

    const { url } = await inquirer.prompt([
        {
            type: "input",
            name: "url",
            message: "📥 Enter URL (YouTube or Spotify):",
            validate: (input) => input.startsWith("http") || "❌ Invalid URL.",
        },
    ]);

    await downloadAudio(url, action);
}

main();