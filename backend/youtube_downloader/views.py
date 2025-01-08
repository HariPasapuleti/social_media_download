import yt_dlp as youtube_dl
from django.http import FileResponse, JsonResponse, HttpResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging, os
import pprint 
from myproject import settings
from datetime import datetime

def index(request):
    return HttpResponse("Welcome to my website!")
# Set up logging
logger = logging.getLogger(__name__)
allowed_qualities = ["144p", "240p", "360p", "720p", "1080p", "2160p"]

class VideoDetails(APIView):
    def get(self, request, format=None):
        url = request.query_params.get('url', None)

        if not url:
            return Response({"error": "URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Setup yt-dlp options
            ydl_opts = {
                'format': 'best',
                'quiet': True,
            }

            with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=False)
                
                # Log the entire info_dict to inspect formats and other keys
                logger.info(f"Video Info: {pprint.pformat(info_dict)}")
                
                formats = info_dict.get('formats', [])
                thumbnail_url = info_dict.get('thumbnail', '')  # Get the thumbnail URL

                # Define allowed video qualities

                # Filter video qualities
                video_qualities = []
                for fmt in formats:
                    if fmt.get('height') and f"{fmt['height']}p" in allowed_qualities:
                        video_qualities.append({
                            'quality': f"{fmt['height']}p",
                            'url': fmt['url']
                        })

                if not video_qualities:
                    logger.error("No video qualities found.")
                    return Response({"error": "No video qualities available for the given URL"}, status=404)

                return Response({
                    "thumbnail": thumbnail_url,
                    "qualities": video_qualities
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching video details: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def download_video(request):
    try:
        url = request.GET.get('url')
        quality = request.GET.get('quality')

        # Log incoming URL and quality for debugging
        logger.info(f"URL: {url}, Quality: {quality}")

        # Ensure the quality is valid
        allowed_qualities = ["144p", "240p", "360p", "720p", "1080p", "2160p"]
        if quality not in allowed_qualities:
            return JsonResponse(
                {"error": f"Invalid quality '{quality}'. Allowed values: {', '.join(allowed_qualities)}."},
                status=400,
            )

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        # Define a unique filename based on URL and quality
        video_filename = f"video_{timestamp}_{quality}.mp4"
        download_path = os.path.join(settings.MEDIA_ROOT, 'videos', video_filename)

        # Ensure the folder exists
        os.makedirs(os.path.dirname(download_path), exist_ok=True)

        # Check if the video already exists
        if os.path.exists(download_path):
            logger.info(f"Serving existing video: {download_path}")
            return FileResponse(open(download_path, 'rb'), as_attachment=True, filename=video_filename)

        # Convert quality to a number for yt-dlp formatting
        quality_num = int(quality.replace('p', ''))

        # yt-dlp options to download and merge video + audio
        ydl_opts = {
            'format': f'bestvideo[height<={quality_num}]+bestaudio/best',  # Fetch video and audio
            'merge_output_format': 'mp4',  # Merge output into an MP4 file
            'outtmpl': download_path,  # Save file to specific location
            'quiet': False,  # Enable verbose logs (can disable later)
            'postprocessors': [{  # Ensure video and audio are merged
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',  # Convert to MP4 after merging
            }],
        }

        # Log yt-dlp options
        logger.info(f"yt-dlp options: {ydl_opts}")

        # Download video using yt-dlp
        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        # Verify if file exists
        if not os.path.exists(download_path):
            raise FileNotFoundError(f"Downloaded file not found at {download_path}")

        # Serve the video file as a response
        return FileResponse(open(download_path, 'rb'), as_attachment=True, filename=video_filename)

    except FileNotFoundError as e:
        logger.error(f"File error: {e}")
        return JsonResponse({"error": f"File error: {e}"}, status=500)

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
