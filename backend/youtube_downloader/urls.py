from django.urls import path
from django.conf.urls.static import static
from myproject import settings
from .views import VideoDetails
from . import views

urlpatterns = [
    path('api/get-video-quality/', VideoDetails.as_view(), name='video_details'),
    path('api/download/', views.download_video, name='download_video'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)