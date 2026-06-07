#!/usr/bin/env python3
"""
dishes.json の全エントリにソースURLを自動付与するスクリプト。
対象: Wikipedia (EN/JA), TasteAtlas, Britannica
- すでに source フィールドがある場合はスキップ
- 429 発生時は exponential backoff
- EN/TasteAtlas/Britannica: englishName の第1候補で検索
- JA: name で検索
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


TASTEATLAS_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "identity",
}


def check_tasteatlas(query: str) -> str | None:
    """tasteatlas.com/{slug} の存在を確認してURLを返す。200以外はNone。"""
    slug = re.sub(r"[^a-z0-9]+", "-", query.lower()).strip("-")
    url = f"https://www.tasteatlas.com/{slug}"
    req = urllib.request.Request(url, headers=TASTEATLAS_HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            if res.status == 200:
                return url
    except urllib.error.HTTPError:
        pass
    except Exception as e:
        print(f"  ERR [tasteatlas] '{query}': {e}", file=sys.stderr)
    return None


def search_britannica(query: str, retries: int = 3) -> str | None:
    """Britannica 検索ページをHTMLパースして最上位記事のURLを返す。"""
    url = f"https://www.britannica.com/search?query={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    })

    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=10) as res:
                html = res.read().decode("utf-8", errors="replace")
            # /topic/SLUG のみ対象（biography は食品記事にほぼ不適切）
            matches = re.findall(r'/topic/([^"<\s#?]{2,80})', html)
            query_words = set(re.sub(r"[^a-z0-9 ]", "", query.lower()).split())
            seen = set()
            for slug in matches:
                if "topic-content" in slug or "page" in slug.lower():
                    continue
                slug_norm = re.sub(r"[^a-z0-9 ]", "", slug.replace("-", " ").lower())
                slug_words = set(slug_norm.split())
                path = f"/topic/{slug}"
                if path not in seen:
                    seen.add(path)
                    # クエリ語がスラグ語の50%以上を占める場合のみ採用
                    overlap = query_words & slug_words
                    if overlap and len(overlap) / max(len(slug_words), 1) >= 0.5:
                        return f"https://www.britannica.com{path}"
            return None
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = BASE_DELAY * (2 ** attempt) * 3
                print(f"  429 backoff {wait:.1f}s [britannica] '{query}'", flush=True)
                time.sleep(wait)
            else:
                print(f"  HTTP {e.code} [britannica] '{query}'", file=sys.stderr)
                return None
        except Exception as e:
            print(f"  ERR [britannica] '{query}': {e}", file=sys.stderr)
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

        existing = dish.get("source") or []
        if len(existing) > 1:
            skipped += 1
            continue

        print(f"[{i+1}/{total}] {dish_id} ({name}) existing={len(existing)}", flush=True)

        sources = list(existing)

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

        # TasteAtlas: EN クエリで直接URL確認
        ta_url = check_tasteatlas(en_query)
        time.sleep(BASE_DELAY)
        if ta_url and ta_url not in sources:
            sources.append(ta_url)
            print(f"  TA: {ta_url}", flush=True)

        # Britannica: EN クエリで検索
        br_url = search_britannica(en_query)
        time.sleep(BASE_DELAY)
        if br_url and br_url not in sources:
            sources.append(br_url)
            print(f"  BR: {br_url}", flush=True)

        if len(sources) > len(existing):
            dish["source"] = sources
            updated += 1
        elif not sources:
            print(f"  MISS", flush=True)

    with open(DISHES_PATH, "w", encoding="utf-8") as f:
        json.dump(dishes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nDone: {updated} updated, {skipped} skipped, {total - updated - skipped} no match")


if __name__ == "__main__":
    main()
