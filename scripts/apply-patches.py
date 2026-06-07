#!/usr/bin/env python3
"""
data/patches/batch_*.json のパッチを dishes.json に適用するスクリプト。

パッチ形式:
[
  {
    "id": "confit",
    "summary": "新しい説明",        // 省略可 = 変更なし
    "menuDescription": "...",       // 省略可
    "whatComesOut": [...],           // 省略可
    "tasteAndTexture": [...],        // 省略可
    "orderAdvice": "...",            // 省略可
    "caution": "..."                 // 省略可
  },
  ...
]
"""

import json
import glob
import sys

DISHES_PATH = "data/dishes.json"
PATCHES_GLOB = "data/patches/batch_*.json"

PATCHABLE_FIELDS = ["summary", "menuDescription", "whatComesOut", "tasteAndTexture", "orderAdvice", "caution", "source"]

def main():
    with open(DISHES_PATH, encoding="utf-8") as f:
        dishes = json.load(f)

    dish_index = {d["id"]: i for i, d in enumerate(dishes)}

    patch_files = sorted(glob.glob(PATCHES_GLOB))
    if not patch_files:
        print("パッチファイルなし")
        return

    total_updated = 0
    for pf in patch_files:
        with open(pf, encoding="utf-8") as f:
            patches = json.load(f)
        for patch in patches:
            dish_id = patch.get("id")
            if dish_id not in dish_index:
                print(f"  SKIP: {dish_id} not found")
                continue
            idx = dish_index[dish_id]
            changed = False
            for field in PATCHABLE_FIELDS:
                if field in patch and patch[field] is not None:
                    dishes[idx][field] = patch[field]
                    changed = True
            if changed:
                total_updated += 1
        print(f"  Applied: {pf}")

    with open(DISHES_PATH, "w", encoding="utf-8") as f:
        json.dump(dishes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nDone: {total_updated} dishes updated from {len(patch_files)} patch files")


if __name__ == "__main__":
    main()
