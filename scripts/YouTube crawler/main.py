from youtube_crawler import YoutubeCrawler
import json

with open('config.json', 'r') as f:
    config = json.load(f)

developer_key = config["developer_key"]

crawler = YoutubeCrawler(developer_key)
for channel in config["to_crawl"]:
    videos = crawler.get_all_videos_of_channel(channel["channel_id"])
    videos = [video.__dict__ for video in videos]
    filename = "output/{}.json".format(channel["clear_name"])
    with open(filename, 'w') as fp:
        json.dump(videos, fp)
