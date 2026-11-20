"""Fetch Google Scholar citation metrics via SerpApi and write data/metrics.json.

Google Scholar has no official API and blocks direct scraping from cloud servers,
so this uses SerpApi's Google Scholar Author endpoint (free plan covers one run a day).
Needs the repository secret SERPAPI_KEY. Uses only the Python standard library.
"""
import json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

AUTHOR_ID = "AJLEDX4AAAAJ"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "metrics.json")

key = os.environ.get("SERPAPI_KEY")
if not key:
    sys.exit("SERPAPI_KEY is not set; add it under Settings > Secrets and variables > Actions.")

url = "https://serpapi.com/search.json?" + urllib.parse.urlencode(
    {"engine": "google_scholar_author", "author_id": AUTHOR_ID, "hl": "en", "api_key": key})
with urllib.request.urlopen(url, timeout=60) as r:
    data = json.load(r)

table = data.get("cited_by", {}).get("table", [])
def pick(name):
    for row in table:
        if name in row:
            return row[name].get("all")
    return None

metrics = {
    "citations": pick("citations"),
    "hIndex": pick("h_index"),
    "i10Index": pick("i10_index"),
    "updated": datetime.now(timezone.utc).strftime("%-d %B %Y"),
    "source": "Google Scholar via SerpApi",
}
if not metrics["citations"]:
    sys.exit("No citation data returned; leaving metrics.json unchanged. Response keys: %s" % list(data))

with open(OUT, "w") as f:
    json.dump(metrics, f, indent=2)
print(metrics)
