---
title: "Asterisk Audio Processing"
summary: "Asterisk needs audio files in specific formats. Here are the conversion commands:"
lang: en
translationKey: "homelab-services-asterisk-audio"
slug: asterisk-audio
track: homelab
stage: services
order: 3
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/asterisk/audio.md
aiTranslated: true
---
## Generate Asterisk-ready audio quickly

Asterisk needs audio files in specific formats. Here are the conversion commands:

### Using ffmpeg

```bash
sudo ffmpeg -i /var/lib/asterisk/sounds/custom/input.wav \
       -ac 1 \             # 转换为单声道（关键！）
       -ar 8000 \          # 8kHz 采样率（电话标准）
       -acodec pcm_s16le \ # 16-bit PCM（Asterisk 要求）
       -y \                # 覆盖而不提示
       /var/lib/asterisk/sounds/custom/output.wav
```

### Using sox

```bash
sox input.wav -r 8000 -c 1 -s output.wav
```

### Batch conversion

For batch conversion to formats like `.ulaw`, see this script:

<!--code:title=Batch conversion script · /lib/asterisk_scripts/convert_all_ulaw.sh collapse-->
```bash
#!/bin/bash

# --- Function to check if sox is installed ---
check_sox_installed() {
    if ! command -v sox &> /dev/null; then
        echo "Error: 'sox' command is not installed or not in your PATH."
        echo "Please install it using: sudo apt install sox libsox-fmt-all"
        exit 1
    fi
}

# --- Function to convert a single WAV file ---
convert_to_ulaw() {
    local input_wav_path="$1"
    local output_ulaw_path="$2"

    echo "Converting: $(basename "$input_wav_path") -> $(basename "$output_ulaw_path")"
    
    # sox input.wav -r 8000 -c 1 -t ul output.ulaw
    sox "$input_wav_path" -r 8000 -c 1 -t ul "$output_ulaw_path"

    if [ $? -eq 0 ]; then
        echo "Successfully converted: $(basename "$input_wav_path")"
        return 0 # Success
    else
        echo "Error converting $(basename "$input_wav_path")"
        return 1 # Failure
    fi
}

# --- Main script execution ---
check_sox_installed

echo "--- WAV to G.711 u-law Converter ---"

read -p "Enter the source directory containing WAV files: " SOURCE_DIR
read -p "Enter the destination directory for u-law files: " DEST_DIR

# Validate source directory
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' does not exist."
    exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

converted_count=0
skipped_count=0
failed_count=0
total_files=0

echo -e "\nStarting conversion from '$SOURCE_DIR' to '$DEST_DIR'..."

# Find all .wav files recursively (case-insensitive)
find "$SOURCE_DIR" -type f \( -name "*.wav" -o -name "*.WAV" \) | while IFS= read -r input_wav_path; do
    total_files=$((total_files + 1))

    # Get the relative path of the WAV file from the source directory
    # This removes the SOURCE_DIR prefix from the full path
    relative_path="${input_wav_path#$SOURCE_DIR/}"

    # Determine the corresponding output directory in the destination
    output_dir=$(dirname "$DEST_DIR/$relative_path")
    
    # Create the output directory if it doesn't exist
    mkdir -p "$output_dir"

    # Construct the output .ulaw filename
    # Remove .wav/.WAV extension and add .ulaw
    output_ulaw_filename=$(basename "$input_wav_path")
    output_ulaw_filename="${output_ulaw_filename%.*}.ulaw" # Removes any extension and adds .ulaw

    output_ulaw_path="$output_dir/$output_ulaw_filename"

    # Check if the .ulaw file already exists in the destination
    if [ -f "$output_ulaw_path" ]; then
        echo "Skipping: $(basename "$input_wav_path") (already exists as $(basename "$output_ulaw_path"))"
        skipped_count=$((skipped_count + 1))
        continue
    fi

    # Perform the conversion
    if convert_to_ulaw "$input_wav_path" "$output_ulaw_path"; then
        converted_count=$((converted_count + 1))
    else
        failed_count=$((failed_count + 1))
    fi
done

echo -e "\n--- Conversion Summary ---"
echo "Total WAV files found: $total_files"
echo "Successfully converted: $converted_count"
echo "Skipped (already exists): $skipped_count"
echo "Failed conversions: $failed_count"
echo "--------------------------"
echo "Conversion process complete."

exit 0
```

## Audio format requirements

- **Sample rate**: 8000 Hz (telephone standard)
- **Channels**: Mono (MONO)
- **Encoding**: PCM 16-bit or ulaw/alaw
- **Format**: WAV files
