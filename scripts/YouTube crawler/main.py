import json

from video_matcher import VideoMatcher
from youtube_crawler import YoutubeCrawler

with open('config.json', 'r') as f:
    config = json.load(f)

if config["task"] == "crawl":
    developer_key = config["developer_key"]
    crawler = YoutubeCrawler(developer_key)
    for channel in config["to_crawl"]:
        videos = crawler.get_all_videos_of_channel(channel["channel_id"])
        videos = [video.__dict__ for video in videos]
        filename = "output/video_data.json"
        with open(filename, 'r') as videofile:
            old_videos = json.load(videofile)
        with open(filename, 'w') as videofile:
            all_videos = old_videos + videos
            json.dump(all_videos, videofile)

elif config["task"] == "match":
    to_match = config["to_match"]
    matcher = VideoMatcher(to_match)
    for category in ["movements", "artists", "artworks"]:
        best_matches = matcher.match(category)
        filename = "output/{}_{}_matches.json".format(to_match, category)
        with open(filename, 'w') as fp:
            json.dump(best_matches, fp)
else:
    raise Exception("Please specify 'crawl' or 'match' as task in the config file.")
