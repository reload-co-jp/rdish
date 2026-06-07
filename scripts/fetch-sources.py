#!/usr/bin/env python3
"""
dishes.json の全エントリに Wikipedia ソースURLを自動付与するスクリプト。
- すでに source フィールドがある場合はスキップ
- 429 発生時は exponential backoff
- EN: englishName の第1候補のみ試行
- JA: name のみ試行
"""

import json
import re
import time
import urllib.parse
import urllib.request
import sys

DISHES_PATH = "data/dishes.json"
BASE_DELAY = 0.8  # リクエスト間隔(秒)


def first_candidate(raw: str) -> str:
    """'Beet / Beetroot' → 'Beet' のように最初の候補だけ返す。"""
    parts = re.split(r"[/|,]", raw)
    return parts[0].strip()


def search_wikipedia(query: str, lang: str, retries: int = 3) -> str | None:
    """Wikipedia search API で最上位記事のURLを返す。429時はbackoff。"""
    params = urllib.parse.urlencode({
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": 1,
        "format": "json",
    })
    url = f"https://{lang}.wikipedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "rdish-source-fetcher/1.0"})

    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                data = json.load(res)
            results = data.get("query", {}).get("search", [])
            if results:
                title = results[0]["title"]
                encoded = urllib.parse.quote(title.replace(" ", "_"))
                return f"https://{lang}.wikipedia.org/wiki/{encoded}"
            return None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = BASE_DELAY * (2 ** attempt) * 3
                print(f"  429 backoff {wait:.1f}s [{lang}] '{query}'", flush=True)
                time.sleep(wait)
            else:
                print(f"  HTTP {e.code} [{lang}] '{query}'", file=sys.stderr)
                return None
        except Exception as e:
            print(f"  ERR [{lang}] '{query}': {e}", file=sys.stderr)
            return None

    return None


def main():
    with open(DISHES_PATH, encoding="utf-8") as f:
        dishes = json.load(f)

    total = len(dishes)
    updated = 0
    skipped = 0

    for i, dish in enumerate(dishes):
        dish_id = dish.get("id", "?")
        name = dish.get("name", "")

        if dish.get("source"):
            skipped += 1
            continue

        print(f"[{i+1}/{total}] {dish_id} ({name})", flush=True)

        sources = []

        # EN: englishName > originalName > id の第1候補
        en_query = None
        for field in ("englishName", "originalName"):
            val = dish.get(field, "")
            if val:
                en_query = first_candidate(val)
                break
        if not en_query:
            en_query = dish_id.replace("-", " ").replace("_", " ")

        en_url = search_wikipedia(en_query, "en")
        time.sleep(BASE_DELAY)
        if en_url:
            sources.append(en_url)
            print(f"  EN: {en_url}", flush=True)

        # JA: name のみ
        ja_url = search_wikipedia(name, "ja")
        time.sleep(BASE_DELAY)
        if ja_url and ja_url not in sources:
            sources.append(ja_url)
            print(f"  JA: {ja_url}", flush=True)

        if sources:
            dish["source"] = sources
            updated += 1
        else:
            print(f"  MISS", flush=True)

    with open(DISHES_PATH, "w", encoding="utf-8") as f:
        json.dump(dishes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nDone: {updated} updated, {skipped} skipped, {total - updated - skipped} no match")


if __name__ == "__main__":
    main()
