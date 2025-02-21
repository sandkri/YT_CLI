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


// Installer functions
function runInstaller() {
    const installerPath = path.join(__dirname, "installer.js"); 

    if (!fs.existsSync(installerPath)) {
        console.error(chalk.red(`❌ Installer not found at ${installerPath}!`));
        process.exit(1);
    }

    try {
        console.log(chalk.yellow("🔧 Running installer to check dependencies..."));
        execSync(`node "${installerPath}"`, { stdio: "inherit" }); 
        console.log(chalk.green("✅ Installer check complete!\n"));
    } catch (error) {
        console.error(chalk.red("❌ Installer failed! Please check for errors."));
        process.exit(1);
    }
}



function printBanner() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync("XYN", { horizontalLayout: "fitted" })));
    console.log(chalk.cyan("🎵 YouTube Audio Downloader 🎵"));
    console.log(chalk.cyan("------------------------------------------------"));
}

function findFFmpeg() {
    const platform = os.platform();
    let ffmpegPath = null;

    try {
        ffmpegPath = execSync(platform === "win32" ? "where ffmpeg" : "which ffmpeg")
            .toString()
            .trim()
            .split("\n")[0];
        if (fs.existsSync(ffmpegPath)) return ffmpegPath;
    } catch {}

    console.error(chalk.red.bold("❌ FFmpeg not found! Please install it or add it to your system PATH."));
    process.exit(1);
}

function getDefaultDownloadsFolder() {
    return path.join(os.homedir(), "Downloads");
}

function loadConfig() {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        } catch (error) {
            console.error(chalk.red("⚠️ Error loading config. Resetting to default."));
            return { downloadPath: getDefaultDownloadsFolder() };
        }
    }
    return { downloadPath: getDefaultDownloadsFolder() };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf8");
}

async function downloadAudio(url, format) {
    const config = loadConfig();
    const outputDir = config.downloadPath;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const ext = format === "wav" ? "wav" : "mp3";
    const outputTemplate = path.join(outputDir, "%(title)s.%(ext)s");

    const ffmpegPath = findFFmpeg();

    console.log(chalk.green("🎶 Downloading in best audio quality..."));
    console.log(chalk.blue(`📂 Saving to: ${outputDir}`));

    const spinner = ora({ text: "⏳ Starting download...", spinner: "dots" }).start();

    const ytDlp = spawn("yt-dlp", [
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", ext,
        "--audio-quality", "0",
        "--ffmpeg-location", path.dirname(ffmpegPath),
        "-o", outputTemplate,
        url
    ]);

    ytDlp.stderr.on("data", (data) => {
        const output = data.toString();
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/); 

        if (progressMatch) {
            const percent = progressMatch[1];
            spinner.text = `⏳ Downloading... ${chalk.cyan(`${percent}%`)}`;
        }
    });

    ytDlp.on("exit", (code) => {
        spinner.stop();
        if (code === 0) {
            console.log(chalk.green.bold("✅ Download complete! 🎉"));
        } else {
            console.log(chalk.red.bold("❌ Download failed!"));
        }
    });
}

async function main() {
    printBanner();

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "🎵 What do you want to do?",
            choices: [
                { name: "🎧 Download as MP3", value: "mp3" },
                { name: "🎼 Download as WAV", value: "wav" },
                { name: "📂 Change Download Path", value: "setPath" },
                { name: "🔄 Restore Default Path", value: "restorePath" },
                { name: "❌ Exit", value: "exit" },
            ],
        },
    ]);

    if (action === "exit") {
        console.log(chalk.yellow("👋 Goodbye!"));
        process.exit(0);
    }

    if (action === "setPath") {
        const { newPath } = await inquirer.prompt([
            {
                type: "input",
                name: "newPath",
                message: "📂 Enter the new download path:",
                validate: (input) => (fs.existsSync(input) ? true : "❌ Path does not exist! Please enter a valid path."),
            },
        ]);
        const config = loadConfig();
        config.downloadPath = newPath;
        saveConfig(config);
        console.log(chalk.green(`✅ Download path set to: ${newPath}`));
        return main(); // Restart the main menu
    }

    if (action === "restorePath") {
        const defaultPath = getDefaultDownloadsFolder();
        saveConfig({ downloadPath: defaultPath });
        console.log(chalk.green(`🔄 Download path restored to default: ${defaultPath}`));
        return main(); // Restart the main menu
    }

    // If user selects MP3 or WAV, proceed to download
    const { url } = await inquirer.prompt([
        {
            type: "input",
            name: "url",
            message: "📺 Enter YouTube URL:",
            validate: (input) => input.startsWith("http") || "❌ Please enter a valid URL.",
        },
    ]);

    await downloadAudio(url, action);
}

main();
