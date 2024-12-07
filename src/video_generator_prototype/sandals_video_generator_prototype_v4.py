import openai
import os
import subprocess
import requests
import platform
import re
import boto3
import random
from pathlib import Path
from moviepy.editor import (
    VideoFileClip,
    AudioFileClip,
    concatenate_videoclips,
    concatenate_audioclips,
    TextClip,
    CompositeVideoClip,
    ColorClip
)
import logging
from moviepy.config import change_settings
import warnings

# Suppress specific MoviePy warnings (optional)
warnings.filterwarnings("ignore", category=UserWarning, module='moviepy.video.io.ffmpeg_reader')

# --------------------------- #
#       Configuration         #
# --------------------------- #

# Replace 'path_to_ffmpeg' with the actual path to your FFMPEG executable
FFMPEG_PATH = r"C:/ffmpeg/bin/ffmpeg.exe"  # Update this path if necessary

# Replace with your actual ImageMagick installation path
IMAGEMAGICK_PATH = r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"  # Updated version

# Configure MoviePy to use the specified FFMPEG and ImageMagick binaries
change_settings({
    "FFMPEG_BINARY": FFMPEG_PATH,
    "IMAGEMAGICK_BINARY": IMAGEMAGICK_PATH
})

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("video_generator.log"),
        logging.StreamHandler()
    ]
)

# Securely load the OpenAI API key from environment variable
openai.api_key = os.getenv('OPENAI_API_KEY')

if not openai.api_key:
    logging.error("OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.")
    exit()

# Get the absolute path of the script directory
script_dir = Path(__file__).parent.resolve()

# Define the parent directory 'sandals_img' as a sibling to the script's grandparent
parent_directory = script_dir.parent.parent / 'sandals_img'

# Verify that the parent_directory exists
if not parent_directory.exists():
    logging.error(f"The directory '{parent_directory}' does not exist. Please ensure the correct path.")
    exit()

# Mapping from file system names to resort codes
resort_code_mapping = {
    'AND_THE_GRENADINES': 'SVG',             # Placeholder code for future resort
    'CASTRIES_SAINT_LUCIA': 'SLT',           # Sandals Regency La Toc
    'GROS-ISLET_SAINT_LUCIA': 'SLU',         # Sandals Grande St. Lucian
    'MONTEGO_BAY_JAMAICA': 'SMB',            # Sandals Montego Bay
    'NASSAU_BAHAMAS': 'SRB',                 # Sandals Royal Bahamian
    'NEGRIL_JAMAICA': 'SNG',                 # Sandals Negril
    'OCHO_RIOS_JAMAICA': 'SGO',              # Sandals Ochi Beach Resort
    'SANTA_BARBARA_CURACAO': 'SPC',          # Sandals Royal Curaçao
    'ST_LAWRENCE_GAP_BARBADOS': 'SBD',       # Sandals Barbados
    'ST._GEORGE\'S_GRENADA': 'SGD',          # Sandals Grenada
    'ST._JOHN\'S_ANTIGUA_AND_BARBUDA': 'SAT',# Sandals Grande Antigua
    'WHITEHOUSE_JAMAICA': 'SSC',             # Sandals South Coast
}

# --------------------------- #
#         Functions           #
# --------------------------- #

def get_resort_info(file_system_name):
    file_system_name = file_system_name.upper()

    # Get the resort code from the mapping
    resort_code = resort_code_mapping.get(file_system_name)

    if not resort_code:
        logging.error(f"Resort location '{file_system_name}' not found in the mapping.")
        return ""
    else:
        # Define the URL with the resort code
        url = f"https://www.sandals.com/api/load-room-data-flexible/?resortCode={resort_code}&checkIn=2024-10-01&checkOut=2025-01-01&adult=2"

        # Fetch the data from the API
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            logging.error(f"An error occurred while fetching data: {e}")
            return ""

        # Check if data was fetched successfully
        if data.get('status') == 'success':
            room_data = data['data']

            # Initialize sets to collect unique amenities and things around the area
            amenities_set = set()
            things_set = set()

            # Iterate over each room listing
            for room in room_data.get('roomsFilteredByMonth', []):
                for room_detail in room.get('rooms', []):
                    # Collect amenities
                    if 'amenities' in room_detail:
                        for amenity in room_detail['amenities']:
                            amenities_set.add(amenity['roomAmenityName'])

                    # Attempt to extract "things around the area" from room descriptions
                    description = room_detail.get('roomDescription', '')
                    # Simple keyword search for nearby attractions
                    keywords = ['beach', 'garden', 'pool', 'mango grove', 'orchid gardens', 'sea', 'ocean', 'mountain']
                    for keyword in keywords:
                        if keyword.lower() in description.lower():
                            things_set.add(keyword.capitalize())

            # Build output string
            output = ""
            output += "\nAmenities:\n"
            for amenity in sorted(amenities_set):
                output += f" - {amenity}\n"

            output += "\nThings Around the Area:\n"
            if things_set:
                for thing in sorted(things_set):
                    output += f" - {thing}\n"
            else:
                output += "No information available.\n"

            return output.strip()
        else:
            logging.error(f"Failed to fetch data. Status: {data.get('status', 'Unknown')}")
            return ""

def fetch_location_folders(parent_directory):
    # Get the list of folder names in the parent directory
    try:
        folder_names = [folder.name for folder in parent_directory.iterdir() if folder.is_dir()]
        return folder_names
    except Exception as e:
        logging.error(f"Error accessing directory '{parent_directory}': {e}")
        return []

def strip_script(script):
    """
    Removes any potential headers or labels from the script.
    """
    # Remove markdown bold headers, section labels, and emojis
    cleaned_script = re.sub(r'(\*\*.*?\*\*:\s*|\[.*?\]\s*|:[^\s]*:)', '', script).strip()
    return cleaned_script


def generate_vacation_script(destination, amenities_info):
    # Clean up the destination name
    clean_destination = destination.replace('_', ' ').replace('.', '').replace("  ", " ").title()
    
    # Prepare the prompt
    prompt = f"""
    Generate an enthusiastic and emotionally appealing script for a customer planning a getaway vacation to {clean_destination}.
    Incorporate the following amenities and interesting features into the script:
    {amenities_info}
    
    **Important Instructions:**
    
    - Write a concise script with a total length of **140 words or less**.
    - Divide the script into 9 short paragraphs, each focusing on one of the topics listed below.
    - Each paragraph should be around **15 words**.
    - Use vivid descriptions and emotional language to engage the viewer.
    - Highlight specific amenities and attractions.
    - Do not include the topic names or any headings in the scripts.
    - Separate each paragraph with three hash symbols (###).
    - **Do not use emojis or special characters.**
    - **Output only the scripts separated by ###, nothing else.**
    
    Topics:
    - Intro to the destination
    - Beaches in {clean_destination}
    - Food in {clean_destination}
    - Culture in {clean_destination}
    - Nightlife in {clean_destination}
    - Natural attractions in {clean_destination}
    - Activities in {clean_destination}
    - Amenities offered at the resort
    - Outro and summary
    """
    try:
        # Send the request to OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a creative script writer for vacation videos."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        response_text = response.choices[0].message.content.strip()

        # Attempt to parse the scripts
        try:
            # Split the response into individual scripts using the delimiter
            scripts = re.split(r'###', response_text)
            scripts = [strip_script(script) for script in scripts if script.strip()]

            # Log the generated scripts
            logging.info(f"Generated scripts for {clean_destination}: {scripts}")

            # Calculate total word count
            total_words = sum(len(script.split()) for script in scripts)
            logging.info(f"Total script word count: {total_words}")

            # If total words exceed the limit, log a warning
            if total_words > 140:
                logging.warning(f"Total script word count exceeds 140 words ({total_words} words). The video may be longer than desired.")

            return scripts

        except Exception as e:
            logging.error(f"Error parsing scripts: {e}, response text: {response_text}")
            return None

    except Exception as e:
        logging.error(f"Error using OpenAI API: {e}")
        return None




def fetch_all_video_clips(folder_path):
    """
    Fetches all video clips from the specified folder.
    """
    video_clips = [os.path.join(folder_path, vid) for vid in os.listdir(folder_path) if vid.lower().endswith('.mp4')]
    if not video_clips:
        logging.error(f"No MP4 video files found in '{folder_path}'.")
        return []
    return video_clips

def generate_voiceovers(scripts, voice_id='Joanna', region='us-east-1', total_duration_limit=60):
    """
    Generates audio files for each script using Amazon Polly.
    Returns a list of audio file paths and the total duration of all audio files.
    """
    # Initialize Amazon Polly client
    try:
        polly_client = boto3.client('polly', region_name=region)
    except Exception as e:
        logging.error(f"Error initializing Amazon Polly client: {e}")
        return [], 0

    # Create a directory to save audio files
    audio_dir = script_dir / 'audio_files_polly'
    audio_dir.mkdir(parents=True, exist_ok=True)

    audio_files = []
    total_audio_duration = 0  # To calculate total duration

    for idx, script in enumerate(scripts, 1):
        try:
            # Use SSML to adjust speech rate and add pauses
            ssml_text = f"<speak><prosody rate='medium'>{script}</prosody></speak>"

            response = polly_client.synthesize_speech(
                Text=ssml_text,
                OutputFormat='mp3',
                VoiceId=voice_id,
                Engine='neural',
                TextType='ssml'
            )

            audio_filename = f"script_{idx}.mp3"
            audio_path = audio_dir / audio_filename

            # Save the audio stream returned by Amazon Polly
            if "AudioStream" in response:
                with open(audio_path, 'wb') as file:
                    file.write(response['AudioStream'].read())
                audio_files.append(audio_path)
                logging.info(f"Generated audio for script {idx}: {audio_path}")

                # Calculate duration using AudioFileClip
                try:
                    audio_clip = AudioFileClip(str(audio_path))
                    total_audio_duration += audio_clip.duration
                    audio_clip.close()
                except Exception as e:
                    logging.error(f"Error reading audio file {audio_path}: {e}")
            else:
                logging.error(f"Could not stream audio for script {idx}.")
        except Exception as e:
            logging.error(f"Error generating audio for script {idx}: {e}")
            continue

    # Check if total duration exceeds the limit
    if total_audio_duration > total_duration_limit:
        logging.warning(f"Total audio duration {total_audio_duration:.2f}s exceeds the limit of {total_duration_limit}s.")
        # Optionally, adjust the speech rate to 'fast' to reduce duration
        # Or you can skip generating the video for this location
        # For this example, we'll adjust the speech rate and regenerate the audio files

        logging.info("Adjusting speech rate to 'fast' and regenerating audio files.")

        # Reset variables
        audio_files = []
        total_audio_duration = 0

        for idx, script in enumerate(scripts, 1):
            try:
                ssml_text = f"<speak><prosody rate='fast'>{script}</prosody></speak>"

                response = polly_client.synthesize_speech(
                    Text=ssml_text,
                    OutputFormat='mp3',
                    VoiceId=voice_id,
                    Engine='neural',
                    TextType='ssml'
                )

                audio_filename = f"script_{idx}.mp3"
                audio_path = audio_dir / audio_filename

                if "AudioStream" in response:
                    with open(audio_path, 'wb') as file:
                        file.write(response['AudioStream'].read())
                    audio_files.append(audio_path)
                    logging.info(f"Generated audio for script {idx}: {audio_path}")

                    # Calculate duration
                    try:
                        audio_clip = AudioFileClip(str(audio_path))
                        total_audio_duration += audio_clip.duration
                        audio_clip.close()
                    except Exception as e:
                        logging.error(f"Error reading audio file {audio_path}: {e}")
                else:
                    logging.error(f"Could not stream audio for script {idx}.")
            except Exception as e:
                logging.error(f"Error generating audio for script {idx}: {e}")
                continue

        if total_audio_duration > total_duration_limit:
            logging.error(f"Total audio duration {total_audio_duration:.2f}s still exceeds the limit after adjusting speech rate.")
            # Decide whether to proceed or skip
            return [], 0

    return audio_files, total_audio_duration


def resize_clip(clip, target_width, target_height):
    # Calculate aspect ratios
    clip_ratio = clip.w / clip.h
    target_ratio = target_width / target_height

    if clip_ratio > target_ratio:
        # The clip is wider than the target aspect ratio
        new_height = target_height
        new_width = clip.w * target_height / clip.h
    else:
        # The clip is narrower than the target aspect ratio
        new_width = target_width
        new_height = clip.h * target_width / clip.w

    # Resize the clip to the new dimensions
    clip = clip.resize(newsize=(new_width, new_height))

    # Crop the clip to the target dimensions
    x_center = new_width / 2
    y_center = new_height / 2
    clip = clip.crop(
        x_center=x_center,
        y_center=y_center,
        width=target_width,
        height=target_height
    )
    return clip

def create_random_video(total_duration, video_clips, aspect_ratio='16:9'):
    """
    Creates a random compilation of video clips to match the total audio duration.
    Applies central cropping based on the selected aspect ratio.
    """
    clips = []
    current_duration = 0
    max_iterations = 1000  # Prevent infinite loops
    iterations = 0

    # Define target dimensions based on aspect ratio
    if aspect_ratio == '16:9':
        target_width = 720
        target_height = int(target_width * 9 / 16)  # 720x405
    elif aspect_ratio == '9:16':
        target_width = 720
        target_height = int(target_width * 16 / 9)  # 720x1280
    else:
        logging.error(f"Unsupported aspect ratio: {aspect_ratio}")
        return None

    while current_duration < total_duration and iterations < max_iterations:
        iterations += 1
        # Randomly select a video clip
        clip_path = random.choice(video_clips)
        try:
            video_clip = VideoFileClip(clip_path)
        except Exception as e:
            logging.error(f"Error loading video {clip_path}: {e}")
            continue  # Skip corrupted or unsupported clips

        # Resize and crop the clip to match the target aspect ratio
        try:
            video_clip = resize_clip(video_clip, target_width, target_height)
        except Exception as e:
            logging.error(f"Error resizing or cropping video {clip_path}: {e}")
            video_clip.close()
            continue

        # Trim the clip if it exceeds the required duration
        remaining_duration = total_duration - current_duration
        if video_clip.duration > remaining_duration:
            try:
                video_clip = video_clip.subclip(0, remaining_duration)
                clips.append(video_clip)
                current_duration += video_clip.duration
                logging.info(f"Added trimmed clip {clip_path} with duration {video_clip.duration:.2f} seconds.")
                # video_clip.close()
                break  # Desired duration reached
            except Exception as e:
                logging.error(f"Error trimming video {clip_path}: {e}")
                video_clip.close()
                continue
        else:
            clips.append(video_clip)
            current_duration += video_clip.duration
            logging.info(f"Added clip {clip_path} with duration {video_clip.duration:.2f} seconds.")
            # video_clip.close()

    if iterations == max_iterations:
        logging.warning("Reached maximum iterations while creating random video. The final video may not match the desired duration exactly.")

    # Concatenate all clips
    try:
        final_video = concatenate_videoclips(clips, method="compose")
        logging.info(f"Final video size after concatenation: {final_video.w}x{final_video.h}")
    except Exception as e:
        logging.error(f"Error concatenating video clips: {e}")
        return None

    # No need to resize the final video as clips are already resized
    return final_video


def generate_captions_data(audio_files, scripts):
    """
    Generates captions data based on audio file durations and scripts.
    Splits scripts into shorter phrases for captions.
    """
    captions = []
    current_time = 0

    for idx, audio_path in enumerate(audio_files):
        try:
            audio_clip = AudioFileClip(str(audio_path))
            duration = audio_clip.duration
            audio_clip.close()
        except Exception as e:
            logging.error(f"Error reading audio file {audio_path}: {e}")
            continue

        # Get the corresponding script text
        script_text = scripts[idx] if idx < len(scripts) else ""

        # Split script into phrases of 3-5 words
        words = script_text.split()
        phrases = []
        i = 0
        while i < len(words):
            # Determine the length of the phrase (3-5 words), but make sure not to exceed the list bounds
            phrase_length = min(random.randint(3, 5), len(words) - i)
            phrase = ' '.join(words[i:i+phrase_length])
            phrases.append(phrase)
            i += phrase_length

        # Calculate duration per phrase
        phrase_duration = duration / len(phrases)

        # Create captions for each phrase
        for phrase in phrases:
            captions.append({
                'text': phrase,
                'start': current_time,
                'end': current_time + phrase_duration
            })
            current_time += phrase_duration

    return captions


def add_captions_to_video(video_clip, captions, font_size=28, font='Arial-Bold', color='white', bg_color='rgba(0,0,0,0.6)'):
    """
    Adds animated captions to the video clip positioned at the bottom.
    """
    from moviepy.editor import TextClip, CompositeVideoClip, ColorClip

    # List to hold all caption overlays
    caption_overlays = []

    for caption in captions:
        if not caption['text']:
            continue  # Skip empty captions

        # Create the text clip
        txt_clip = TextClip(
            caption['text'],
            fontsize=font_size,
            font=font,
            color=color,
            method='caption',
            size=(int(video_clip.w * 0.85), None),
            align='center'
        )
        txt_clip = txt_clip.set_position(("center", "bottom"))
        txt_clip = txt_clip.set_start(caption['start']).set_duration(caption['end'] - caption['start'])

        # Get the height of the text clip to create a background rectangle of appropriate size
        txt_height = txt_clip.h

        # Create the background rectangle
        bg_clip = ColorClip(size=(int(video_clip.w * 0.9), txt_height + 20), color=(0, 0, 0))
        bg_clip = bg_clip.set_opacity(0.6)
        bg_clip = bg_clip.set_position(("center", "bottom"))
        bg_clip = bg_clip.set_start(caption['start']).set_duration(caption['end'] - caption['start'])

        # Apply fade-in and fade-out effects for smooth animations
        txt_clip = txt_clip.fadein(0.5).fadeout(0.5)
        bg_clip = bg_clip.fadein(0.5).fadeout(0.5)

        # Append to overlays
        caption_overlays.extend([bg_clip, txt_clip])

    # Overlay all captions onto the video
    try:
        final = CompositeVideoClip([video_clip] + caption_overlays)
    except Exception as e:
        logging.error(f"Error compositing captions: {e}")
        return video_clip  # Return original video if compositing fails

    return final



def merge_audio_video(audio_files, final_video, output_filename='final_video.mp4'):
    """
    Merges the compiled video with the combined audio files.
    """
    try:
        # Combine all audio files into one audio track
        combined_audio = concatenate_audioclips([AudioFileClip(str(audio)) for audio in audio_files])
    except Exception as e:
        logging.error(f"Error concatenating audio files: {e}")
        return False

    try:
        # Set the combined audio to the final video
        final_video = final_video.set_audio(combined_audio)
    except Exception as e:
        logging.error(f"Error setting audio to video: {e}")
        return False

    try:
        # Write the final video file
        final_video.write_videofile(output_filename, fps=24)
    except Exception as e:
        logging.error(f"Error writing final video file: {e}")
        return False
    finally:
        # Close all clips to release resources
        combined_audio.close()
        final_video.close()

    return True

def sanitize_filename(name):
    """
    Sanitizes the location name to be safe for filenames.
    """
    # Remove any invalid filename characters and apostrophes
    name = re.sub(r'[\\/*?:"<>|\']', "", name)
    # Replace spaces with underscores
    name = name.replace(' ', '_').replace('__', '_')
    return name


# --------------------------- #
#           Main              #
# --------------------------- #

if __name__ == "__main__":
    # Fetch all folder names in the parent directory 'sandals_img'
    folder_names = fetch_location_folders(parent_directory)

    if not folder_names:
        logging.error(f"No folders found in '{parent_directory}'. Ensure the directory exists and contains subfolders.")
        exit()

    # Randomly shuffle the folder names
    random.shuffle(folder_names)

    # For numbering the videos
    video_counter = 1

    # Loop through each folder (location) in random order
    for selected_location in folder_names:
        logging.info(f"Processing location: {selected_location}")

        # Get amenities information for the selected location
        amenities_info = get_resort_info(selected_location)
        if not amenities_info:
            logging.error(f"Could not retrieve amenities for {selected_location}. Skipping.")
            continue

        # Fetch all video clips from the selected folder
        folder_path = parent_directory / selected_location
        video_clips = fetch_all_video_clips(folder_path)
        if not video_clips:
            logging.error(f"No video clips found for {selected_location}. Skipping.")
            continue

        # Generate the vacation script incorporating the amenities
        scripts = generate_vacation_script(selected_location, amenities_info)
        if not scripts:
            logging.error(f"Failed to generate scripts for {selected_location}. Skipping.")
            continue

        # Generate voiceovers using Amazon Polly
        audio_files, total_audio_duration = generate_voiceovers(
            scripts,
            voice_id='Joanna',        # Choose from available Amazon Polly voices
            region='us-east-1'        # Replace with your AWS region if different
        )
        if not audio_files:
            logging.error(f"No audio files were generated for {selected_location}. Skipping.")
            continue

        # For each aspect ratio
        for aspect_ratio in ['16:9', '9:16']:
            logging.info(f"Generating video for {selected_location} with aspect ratio {aspect_ratio}")

            # Create a random compilation of video clips to match the total audio duration
            final_video = create_random_video(
                total_duration=total_audio_duration,
                video_clips=video_clips,
                aspect_ratio=aspect_ratio
            )
            if not final_video:
                logging.error(f"Failed to create the final video compilation for {selected_location} with aspect ratio {aspect_ratio}.")
                continue

            # Generate captions data
            captions = generate_captions_data(audio_files, scripts)

            # Add captions to the final video
            final_video_with_captions = add_captions_to_video(
                final_video,
                captions,
                font_size=40,
                font='Arial-Bold',
                color='white',
                bg_color='rgba(0,0,0,0.6)'
            )

            # Sanitize location name for filename
            sanitized_location = sanitize_filename(selected_location)

            # Determine filename
            aspect_label = 'horiz' if aspect_ratio == '16:9' else 'vert'
            output_filename = f"{aspect_label}_{sanitized_location}_{video_counter}.mp4"

            # Merge audio and video with captions
            success = merge_audio_video(
                audio_files=audio_files,
                final_video=final_video_with_captions,
                output_filename=output_filename
            )

            if success:
                logging.info(f"Final video saved as {output_filename}")
                # Optionally, play the video
                # play_video(output_filename)
            else:
                logging.error(f"Video creation failed for {selected_location} with aspect ratio {aspect_ratio}.")

        video_counter += 1

    logging.info("Video generation process completed.")
