#!/usr/bin/env node

const child_process = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const chalk = require("chalk").default;
const ora = require("ora").default;

function isFfmpegInstalled() {
    try {
        child_process.execSync("ffmpeg -version", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

function installFfmpeg() {
    const spinner = ora("Installing FFmpeg...").start();
    try {
        const platform = os.platform();

        if (platform === "darwin") {
            child_process.execSync("brew install ffmpeg", { stdio: "inherit" });
        } else if (platform === "linux") {
            child_process.execSync("sudo apt update && sudo apt install -y ffmpeg", { stdio: "inherit" });
        } else if (platform === "win32") {
            installFfmpegWindows();
        } else {
            spinner.fail("Unsupported OS. Install FFmpeg manually.");
            return;
        }

        spinner.succeed("FFmpeg installed successfully.");
    } catch (error) {
        spinner.fail("Failed to install FFmpeg. Install it manually and try again.");
        process.exit(1);
    }
}

function installFfmpegWindows() {
    const ffmpegPath = "C:\\ffmpeg";
    const exePath = path.join(ffmpegPath, "ffmpeg.exe");

    if (!fs.existsSync(ffmpegPath)) {
        fs.mkdirSync(ffmpegPath, { recursive: true });
    }

    console.log(chalk.yellow(`Downloading FFmpeg to ${ffmpegPath}...`));

    try {
        child_process.execSync(
            `curl -Lo ${exePath} https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip && powershell -command "Expand-Archive -Force ${exePath} ${ffmpegPath}"`,
            { stdio: "inherit" }
        );
        child_process.execSync(`setx PATH "%PATH%;${ffmpegPath}"`, { stdio: "inherit" });

        console.log(chalk.green("✔ FFmpeg installed and added to PATH."));
    } catch (error) {
        console.error(chalk.red("✖ Failed to install FFmpeg on Windows."));
        process.exit(1);
    }
}

function npmLink() {
    const projectRoot = __dirname; 
    const spinner = ora("Linking yt globally...").start();

    try {
        execSync("npm link", { cwd: projectRoot, stdio: "inherit" }); 
        spinner.succeed("yt command linked successfully!");
    } catch (error) {
        spinner.fail("Failed to link yt. Run 'npm link' manually.");
        process.exit(1);
    }
}


(async function setup() {
    console.log(chalk.cyan("\n🚀 Setting up ytbeat... \n"));

    if (!isFfmpegInstalled()) {
        console.log(chalk.yellow("⚠ FFmpeg is not installed. Installing it now..."));
        installFfmpeg();
    } else {
        console.log(chalk.green("✔ FFmpeg is already installed."));
    }

    npmLink();

    console.log(chalk.green("\n✅ Setup complete! You can now run 'yt'."));
})();
