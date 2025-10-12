# Sanity Pack

A Python tool for extracting and processing game data from Arknights.

## Features

- Downloads game data using Arknights' hot update logic
- Unpacks Unity assets using UnityPy
- Processes images:
    - Combines alpha and RGB images
    - Processes character portraits using image atlases
- Decodes Text Assets
    - By Flatbuffers
    - By AES Encryption
- Transforms audio files form .wav into .mp3 for the web

## Installation
1. Make sure you have Python 3.12+ installed
2. Install Poetry if you haven't already:
    ```bash
    curl -sSL https://install.python-poetry.org | python3 -
    ```
3. Install project
    ```bash
    poetry install
    ```
4. Run downloader