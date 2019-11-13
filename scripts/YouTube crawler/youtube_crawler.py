# -*- coding: utf-8 -*-
"""Classes for the YT crawler"""
from datetime import datetime

from dateutil import parser
from googleapiclient.discovery import build

VIDEO_CATEGORIES = {
    "1": "Film & Animation",
    "2": "Autos & Vehicles",
    "10": "Music",
    "15": "Pets & Animals",
    "17": "Sports",
    "18": "Short Movies",
    "19": "Travel & Events",
    "20": "Gaming",
    "21": "Videoblogging",
    "22": "People & Blogs",
    "23": "Comedy",
    "24": "Entertainment",
    "25": "News & Politics",
    "26": "Howto & Style",
    "27": "Education",
    "28": "Science & Technology",
    "29": "Nonprofits & Activism",
    "30": "Movies",
    "31": "Anime/Animation",
    "32": "Action/Adventure",
    "33": "Classics",
    "34": "Comedy",
    "35": "Documentary",
    "36": "Drama",
    "37": "Family",
    "38": "Foreign",
    "39": "Horror",
    "40": "Sci-Fi/Fantasy",
    "41": "Thriller",
    "42": "Shorts",
    "43": "Shows",
    "44": "Trailers"
}


class YoutubeVideo(object):
    """A formatted form of YouTube video metadata."""

    def __init__(self, id):
        self.id = id

    def parse_video_details(self, video_details):
        """Parse snippet & statistics data from a video request."""
        snippet = video_details["snippet"]
        self.title = snippet["title"]
        self.description = snippet["description"]
        self.channel_id = snippet["channelId"]
        self.channel_name = snippet["channelTitle"]
        upload_date = parser.parse(snippet["publishedAt"])
        time_delta = datetime.now().date() - upload_date.date()
        self.days_since_upload = time_delta.days
        self.tags = snippet.get("tags", [])
        self.category = VIDEO_CATEGORIES.get(snippet["categoryId"], [])
        stats = video_details["statistics"]
        self.views = stats.get("viewCount", 0)
        self.likes = stats.get("likeCount", 0)
        self.dislikes = stats.get("dislikeCount", 0)


class YoutubeCrawler:
    """This class can be used to crawl YouTube by the API. """

    # A client for the YT API is used, you can find the documentation here:
    # https://github.com/googleapis/google-api-python-client/tree/master/docs

    def __init__(self, developer_key):
        """Initializes the class and build the YouTube API service."""

        # Build the connection object
        self.yt_service = build('youtube', 'v3', developerKey=developer_key)

    # def search_videos(self, search_term, no_of_results) -> List[YoutubeVideo]:
    #     """Finds youtube videos by a search term and returns the result as a list of YTVideo Objects."""
    #
    #     # The search returns at least 5 results
    #     no_of_results = max(no_of_results, 50)
    #     # Figure out how many pages we pages of the response we have to open.
    #     # There are always 5 results on one page.
    #     result_pages_to_open = ceil(no_of_results / 50)
    #     # Build the request
    #     search_service = self.yt_service.search()
    #     request = search_service.list(
    #         part="id",
    #         q=search_term,
    #         type="video",  # Has to be specified, otherwise channels and playlists also appear
    #         safeSearch="strict",  # This is useful setting to filter out inappropriate videos
    #         relevanceLanguage="en",
    #         maxResults=50
    #     )
    #     # Get the first page
    #     result_page = request.execute()
    #     videos = result_page["items"]
    #     result_pages_to_open -= 1
    #     # if there are more pages to open
    #     while result_pages_to_open > 0:
    #         request = search_service.list_next(request, result_page)
    #         videos = result_page["items"]
    #         result_pages_to_open -= 1
    #
    #     # Now  get the video details
    #     videos = [YoutubeVideo(video["id"]["videoId"]) for video in videos]
    #     videos = self.get_video_details(videos)
    #     return videos

    def get_all_videos_of_channel(self, channel_id):
        """Finds all videos including metadata for a channel by its ID."""
        search_service = self.yt_service.search()
        request = search_service.list(
            part="id",
            channelId=channel_id,
            type="video",  # Has to be specified, otherwise channels and playlists also appear
            maxResults=50
        )

        videos = []
        while request is not None:
            result_page = request.execute()
            videos += result_page["items"]
            request = search_service.list_next(request, result_page)

        # Now  get the video details
        video_ids = [video["id"]["videoId"] for video in videos]
        videos = self.get_video_details(video_ids)
        return videos

    def get_video_details(self, video_ids):
        """Load the details, that the search method did not include"""
        video_service = self.yt_service.videos()
        videos = []
        for videoId in video_ids:
            request = video_service.list(
                part="statistics, snippet",
                id=videoId
            )
            video_details = request.execute()["items"][0]
            video = {}
            # order the information
            snippet = video_details["snippet"]
            video["title"] = snippet["title"]
            video["description"] = snippet["description"]
            video["channel_id"] = snippet["channelId"]
            video["channel_name"] = snippet["channelTitle"]
            video["upload_date"] = parser.parse(snippet["publishedAt"])
            video["tags"] = snippet.get("tags", [])
            video["category"] = VIDEO_CATEGORIES.get(snippet["categoryId"], [])
            stats = video_details["statistics"]
            video["views"] = stats.get("viewCount", 0)
            video["likes"] = stats.get("likeCount", 0)
            video["dislikes"] = stats.get("dislikeCount", 0)

            videos.append(video)

        return videos