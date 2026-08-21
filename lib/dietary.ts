import type { DishCategory, DishItem } from "../types/dish"
import { allDishes } from "./dishes"

// data/dishes.json の reverseKeywords は「この料理が苦手な人が好むもの」、
// つまり “その料理を避けたい人の属性” を表す。素直に一覧化すると
// 「辛いの苦手 → 麻婆豆腐」という逆の結果になるため、キーワードは
// 避けるべき料理（avoid）を特定する手がかりとして使い、
// おすすめ側（safe）はそこから除外したうえでタグ・スコアで絞り込む。
export type DietaryAxis = {
  slug: string
  label: string
  // 表記ゆれを含む reverseKeywords。ここに一致した料理は avoid 側に入る
  keywords: string[]
  // キーワードが付いていなくても該当する料理を拾うためのタグ・カテゴリ
  avoidTags?: string[]
  avoidCategories?: DishCategory[]
  avoidExtra?: (dish: DishItem) => boolean
  // タグが付いていなくても説明文に出てくる料理は safe 側から外す。
  // タグ欠落による「食べられる」の誤表示を避けるため、判定は保守的に倒す
  excludeTerms?: string[]
  // safe ページを作る軸だけが持つ。undefined なら avoid ページのみ生成する
  safeFilter?: (dish: DishItem) => boolean
  safeCategories?: DishCategory[]
  safeTitle: string
  avoidTitle: string
  safeLead: string
  avoidLead: string
}

const hasAnyTag = (dish: DishItem, tags: string[]) =>
  tags.some((tag) => dish.tags.includes(tag))

const MEAT_TAGS = ["牛肉", "豚肉", "鶏肉", "羊肉", "ジビエ"]
const DAIRY_TAGS = ["チーズ", "乳製品"]
const WHEAT_TAGS = ["小麦", "パスタ", "麺料理", "パン"]
const SEAFOOD_TAGS = ["魚介", "貝類"]

export const dietaryAxes: DietaryAxis[] = [
  {
    slug: "spice-free",
    label: "辛いもの",
    keywords: [
      "辛いの苦手",
      "辛いのが苦手",
      "辛いものが苦手",
      "辛いもの苦手",
      "辛い料理が苦手",
      "辛味苦手",
      "辛味が苦手",
      "辛味なし",
      "辛さ不要",
      "痺れる味が苦手",
      "しびれが苦手",
      "花椒嫌い",
    ],
    excludeTerms: [
      "唐辛子",
      "チリ",
      "ハラペーニョ",
      "豆板醤",
      "コチュジャン",
      "花椒",
      "ハバネロ",
      "カイエン",
      "辛味",
      "激辛",
    ],
    avoidTags: ["ピリ辛"],
    avoidExtra: (dish) => dish.spicinessScore >= 3,
    safeFilter: (dish) => dish.spicinessScore <= 1,
    safeTitle: "辛いものが苦手な人でも食べられる料理",
    avoidTitle: "辛さがある料理一覧",
    safeLead:
      "唐辛子や花椒の刺激が苦手でも頼みやすい、辛さ控えめの料理を集めました。辛さスコアが低い順に、味の特徴と注文のコツを確認できます。",
    avoidLead:
      "辛さが特徴の料理や、注文時に辛さレベルを確認したい料理をまとめました。辛いものが苦手な人が外食で避けたいときの目安に。",
  },
  {
    slug: "dairy-free",
    label: "乳製品",
    keywords: [
      "乳製品不可",
      "乳製品苦手",
      "乳製品が苦手",
      "乳製品嫌い",
      "乳製品なし",
      "チーズが苦手",
      "チーズ嫌い",
      "チーズなし",
      "山羊乳が苦手",
      "香りが強いチーズが苦手",
      "青カビが苦手",
      "白カビが苦手",
    ],
    excludeTerms: [
      "チーズ",
      "バター",
      "生クリーム",
      "牛乳",
      "クリーム",
      "ヨーグルト",
      "乳",
    ],
    avoidTags: DAIRY_TAGS,
    avoidCategories: ["チーズ"],
    safeFilter: (dish) => !hasAnyTag(dish, DAIRY_TAGS),
    safeTitle: "乳製品が苦手な人でも食べられる料理",
    avoidTitle: "乳製品を使う料理一覧",
    safeLead:
      "チーズ・バター・生クリームを使わない料理を集めました。乳糖不耐やアレルギーで乳製品を避けたいときの外食メニュー選びに。",
    avoidLead:
      "チーズ・バター・生クリームなど乳製品が使われている料理をまとめました。乳製品を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "gluten-free",
    label: "小麦",
    keywords: [
      "小麦不可",
      "小麦アレルギー",
      "グルテンフリー",
      "グルテン不使用",
    ],
    excludeTerms: [
      "小麦",
      "パン",
      "麺",
      "パスタ",
      "衣",
      "薄力粉",
      "強力粉",
      "セモリナ",
      "クスクス",
      "餃子の皮",
    ],
    avoidTags: WHEAT_TAGS,
    safeFilter: (dish) => !hasAnyTag(dish, WHEAT_TAGS),
    safeTitle: "小麦を使わない料理",
    avoidTitle: "小麦を使う料理一覧",
    safeLead:
      "パン・パスタ・麺・衣など小麦を使わない料理を集めました。グルテンを避けたいときの外食メニュー選びに。",
    avoidLead:
      "小麦粉が主役になっている料理をまとめました。小麦を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "seafood-free",
    label: "魚介",
    keywords: [
      "魚介が苦手",
      "魚介苦手",
      "魚介アレルギー",
      "魚嫌い",
      "甲殻類アレルギー",
      "エビアレルギー",
      "淡水魚特有の風味が苦手",
      "骨のない魚が好き",
    ],
    excludeTerms: [
      "魚",
      "エビ",
      "海老",
      "カニ",
      "蟹",
      "貝",
      "イカ",
      "タコ",
      "アンチョビ",
      "魚醤",
      "ナンプラー",
      "かつお",
      "煮干し",
      "いくら",
      "たら",
      "サーモン",
      "ツナ",
      "シーフード",
    ],
    avoidTags: SEAFOOD_TAGS,
    avoidCategories: ["魚介"],
    safeFilter: (dish) => !hasAnyTag(dish, SEAFOOD_TAGS),
    safeTitle: "魚介が苦手な人でも食べられる料理",
    avoidTitle: "魚介を使う料理一覧",
    safeLead:
      "魚・エビ・貝を使わない料理を集めました。魚介が苦手な人や甲殻類アレルギーの人の外食メニュー選びに。",
    avoidLead:
      "魚・エビ・貝など魚介が使われている料理をまとめました。魚介を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "meat-free",
    label: "肉",
    keywords: [
      "ベジタリアン",
      "ヴィーガン",
      "肉なし",
      "肉料理苦手",
      "肉嫌い",
      "野菜だけ",
    ],
    excludeTerms: [
      "肉",
      "牛",
      "豚",
      "鶏",
      "羊",
      "ベーコン",
      "ハム",
      "ソーセージ",
      "ひき肉",
      "ラード",
      "生ハム",
      "チョリソー",
    ],
    avoidTags: MEAT_TAGS,
    avoidCategories: ["肉"],
    safeFilter: (dish) =>
      !hasAnyTag(dish, [...MEAT_TAGS, ...SEAFOOD_TAGS]) &&
      (dish.tags.includes("野菜") ||
        dish.tags.includes("豆類") ||
        dish.tags.includes("きのこ")),
    safeTitle: "肉を使わない料理",
    avoidTitle: "肉を使う料理一覧",
    safeLead:
      "肉も魚介も使わず、野菜・豆・きのこが主役の料理を集めました。ベジタリアンの人や、肉が続いた日のメニュー選びに。",
    avoidLead:
      "牛・豚・鶏・羊などの肉が主役の料理をまとめました。肉を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "egg-free",
    label: "卵",
    keywords: ["卵アレルギー", "卵不可"],
    excludeTerms: [
      "卵",
      "たまご",
      "タマゴ",
      "玉子",
      "エッグ",
      "マヨネーズ",
      "メレンゲ",
      "カスタード",
    ],
    avoidTags: ["卵"],
    safeFilter: (dish) => !dish.tags.includes("卵"),
    safeTitle: "卵を使わない料理",
    avoidTitle: "卵を使う料理一覧",
    safeLead:
      "卵を使わない料理を集めました。卵アレルギーで外食メニューを選びたいときの参考に。",
    avoidLead:
      "卵が使われている料理をまとめました。卵を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "nut-free",
    label: "ナッツ",
    keywords: ["ナッツアレルギー", "ごま不可"],
    excludeTerms: [
      "ナッツ",
      "アーモンド",
      "ピーナッツ",
      "カシュー",
      "ピスタチオ",
      "ヘーゼル",
      "くるみ",
      "クルミ",
      "胡桃",
      "ごま",
      "ゴマ",
      "胡麻",
      "ペカン",
    ],
    avoidTags: ["ナッツ"],
    safeFilter: (dish) => !dish.tags.includes("ナッツ"),
    safeTitle: "ナッツを使わない料理",
    avoidTitle: "ナッツを使う料理一覧",
    safeLead:
      "ナッツを使わない料理を集めました。ナッツアレルギーで外食メニューを選びたいときの参考に。",
    avoidLead:
      "ピーナッツやカシューナッツなどが使われている料理をまとめました。ナッツを避けたい人の確認用です。",
  },
  {
    slug: "pork-free",
    label: "豚肉",
    keywords: ["豚肉嫌い", "豚肉苦手", "豚肉不可"],
    excludeTerms: [
      "豚",
      "ベーコン",
      "ハム",
      "ラード",
      "パンチェッタ",
      "グアンチャーレ",
      "チョリソー",
      "ソーセージ",
      "生ハム",
    ],
    avoidTags: ["豚肉"],
    safeFilter: (dish) => !dish.tags.includes("豚肉"),
    safeTitle: "豚肉を使わない料理",
    avoidTitle: "豚肉を使う料理一覧",
    safeLead:
      "豚肉を使わない料理を集めました。宗教上の理由や好みで豚肉を避けたいときのメニュー選びに。",
    avoidLead:
      "豚肉が使われている料理をまとめました。豚肉を避けたい人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "lamb-free",
    label: "羊肉",
    keywords: ["羊肉苦手", "羊肉が苦手"],
    excludeTerms: ["羊", "ラム", "マトン", "ジンギスカン"],
    avoidTags: ["羊肉"],
    safeFilter: (dish) => !dish.tags.includes("羊肉"),
    safeTitle: "羊肉を使わない料理",
    avoidTitle: "羊肉を使う料理一覧",
    safeLead: "独特の香りが苦手な人向けに、羊肉を使わない料理を集めました。",
    avoidLead:
      "ラム・マトンが使われている料理をまとめました。羊肉が苦手な人が注文前に確認したいときの一覧です。",
  },
  {
    slug: "sour-free",
    label: "酸味",
    keywords: [
      "酸味が苦手",
      "酸味苦手",
      "酸っぱいのが嫌い",
      "酸っぱいの苦手",
      "酸味なし",
      "酢が苦手",
    ],
    excludeTerms: [
      "酢",
      "酸味",
      "レモン",
      "ライム",
      "ピクルス",
      "マリネ",
      "ヨーグルト",
      "タマリンド",
      "梅",
    ],
    avoidTags: ["酸味"],
    safeFilter: (dish) =>
      !dish.tags.includes("酸味") && !dish.tags.includes("マリネ"),
    safeTitle: "酸味が苦手な人でも食べられる料理",
    avoidTitle: "酸味が特徴の料理一覧",
    safeLead:
      "酢やレモンの酸味が前に出ない料理を集めました。酸っぱいものが苦手なときのメニュー選びに。",
    avoidLead:
      "酢・レモン・発酵由来の酸味が特徴の料理をまとめました。酸味が苦手な人の確認用です。",
  },
  {
    slug: "sweet-free",
    label: "甘いもの",
    keywords: [
      "甘いもの苦手",
      "甘いものが苦手",
      "甘いもの嫌い",
      "甘味なし",
      "甘さ不要",
      "甘い味が苦手",
      "甘い料理嫌い",
      "甘い酒が苦手",
    ],
    excludeTerms: [
      "砂糖",
      "甘",
      "蜂蜜",
      "はちみつ",
      "メープル",
      "チョコ",
      "キャラメル",
      "シロップ",
      "ジャム",
    ],
    avoidTags: ["甘み", "菓子", "デザート"],
    avoidCategories: ["デザート"],
    safeFilter: (dish) =>
      !hasAnyTag(dish, ["甘み", "菓子", "デザート"]) &&
      dish.category !== "デザート",
    safeTitle: "甘いものが苦手な人向けの料理",
    avoidTitle: "甘みが特徴の料理一覧",
    safeLead:
      "砂糖の甘みが前に出ない料理を集めました。甘い味付けが苦手なときのメニュー選びに。",
    avoidLead:
      "デザートや甘い味付けが特徴の料理をまとめました。甘いものが苦手な人の確認用です。",
  },
  {
    slug: "light",
    label: "揚げ物・脂",
    keywords: [
      "揚げ物が苦手",
      "揚げ物苦手",
      "揚げ物不可",
      "油っこい料理不可",
      "脂が苦手",
      "脂っこいのが苦手",
      "油少なめ",
      "油控えめ",
    ],
    excludeTerms: [
      "揚げ",
      "フライ",
      "天ぷら",
      "油",
      "こってり",
      "脂",
      "クリーム",
      "バター",
    ],
    avoidTags: ["揚げ物", "こってり"],
    avoidExtra: (dish) => dish.heavinessScore >= 4,
    safeFilter: (dish) =>
      dish.heavinessScore <= 2 && !hasAnyTag(dish, ["揚げ物", "こってり"]),
    safeTitle: "脂っこいものが苦手な人向けのあっさりした料理",
    avoidTitle: "揚げ物・こってりした料理一覧",
    safeLead:
      "油を控えた軽い料理を集めました。揚げ物が続いた日や、脂っこいものが苦手なときのメニュー選びに。",
    avoidLead:
      "揚げ物や脂の多いこってりした料理をまとめました。あっさり食べたい日に避けたいときの目安に。",
  },
  {
    slug: "herb-free",
    label: "ハーブ・香草",
    keywords: [
      "ハーブが苦手",
      "ハーブ嫌い",
      "香草苦手",
      "パクチーが苦手",
      "香菜不可",
      "香りが苦手",
      "香り控えめ",
      "においに敏感",
    ],
    excludeTerms: [
      "パクチー",
      "香菜",
      "コリアンダー",
      "ハーブ",
      "ミント",
      "ディル",
      "バジル",
      "タイム",
      "ローズマリー",
      "オレガノ",
      "パセリ",
    ],
    avoidTags: ["ハーブ"],
    safeFilter: (dish) => !dish.tags.includes("ハーブ"),
    safeTitle: "パクチー・ハーブが苦手な人でも食べられる料理",
    avoidTitle: "ハーブ・香草を使う料理一覧",
    safeLead:
      "パクチーやミントなど香りの強いハーブを使わない料理を集めました。香草が苦手なときのメニュー選びに。",
    avoidLead:
      "パクチー・ディル・ミントなど香草が効いた料理をまとめました。香りが苦手な人の確認用です。",
  },
  {
    slug: "fermented-free",
    label: "発酵食品",
    keywords: [
      "発酵臭が苦手",
      "発酵食品嫌い",
      "臭み嫌い",
      "漬物が苦手",
      "塩辛嫌い",
    ],
    excludeTerms: [
      "発酵",
      "熟成",
      "漬け",
      "味噌",
      "醤油",
      "ヨーグルト",
      "塩辛",
      "魚醤",
      "ザワークラウト",
      "キムチ",
      "納豆",
    ],
    avoidTags: ["発酵"],
    safeFilter: (dish) => !dish.tags.includes("発酵"),
    safeTitle: "発酵食品のクセが苦手な人向けの料理",
    avoidTitle: "発酵食品を使う料理一覧",
    safeLead:
      "発酵由来の独特な香りが強くない料理を集めました。チーズや漬物のクセが苦手なときのメニュー選びに。",
    avoidLead:
      "チーズ・漬物・魚醤など発酵食品が使われている料理をまとめました。発酵臭が苦手な人の確認用です。",
  },
  {
    slug: "raw-free",
    label: "生食",
    keywords: ["生食嫌い", "生が苦手", "生食が苦手"],
    excludeTerms: [
      "生",
      "刺身",
      "カルパッチョ",
      "タルタル",
      "ユッケ",
      "半熟",
      "レア",
    ],
    avoidTags: ["生食"],
    safeFilter: (dish) => !dish.tags.includes("生食"),
    safeTitle: "生ものが苦手な人でも食べられる料理",
    avoidTitle: "生で食べる料理一覧",
    safeLead:
      "刺身やカルパッチョなど生のまま食べる料理を除いた、火を通した料理を集めました。",
    avoidLead:
      "生のまま提供される料理をまとめました。生ものが苦手な人や妊娠中で加熱食を選びたいときの確認用です。",
  },
  {
    slug: "soy-free",
    label: "大豆",
    keywords: ["大豆不可", "豆が苦手"],
    excludeTerms: [
      "大豆",
      "豆腐",
      "味噌",
      "醤油",
      "豆",
      "枝豆",
      "湯葉",
      "油揚げ",
      "テンペ",
    ],
    avoidTags: ["豆類"],
    safeFilter: (dish) => !dish.tags.includes("豆類"),
    safeTitle: "豆・大豆を使わない料理",
    avoidTitle: "豆・大豆を使う料理一覧",
    safeLead:
      "大豆や豆類を使わない料理を集めました。大豆アレルギーのメニュー選びに。",
    avoidLead:
      "豆腐・味噌・ひよこ豆など豆類が使われている料理をまとめました。豆を避けたい人の確認用です。",
  },
  {
    slug: "familiar",
    label: "珍しい食材",
    keywords: [
      "見た目が苦手",
      "珍食材が苦手",
      "カエルが苦手",
      "爬虫類が苦手",
      "内臓が苦手",
      "ホルモン嫌い",
      "骨付き肉が苦手",
    ],
    excludeTerms: [
      "内臓",
      "ホルモン",
      "レバー",
      "モツ",
      "脳",
      "舌",
      "血",
      "昆虫",
      "カエル",
      "ヘビ",
      "ワニ",
      "脳みそ",
    ],
    avoidExtra: (dish) => dish.uniquenessScore >= 5,
    safeFilter: (dish) =>
      dish.uniquenessScore <= 2 && dish.beginnerFriendlyScore >= 4,
    safeTitle: "はじめてでも頼みやすい定番料理",
    avoidTitle: "見た目や食材にクセがある料理一覧",
    safeLead:
      "珍しい食材や内臓を使わない、はじめての店でも頼みやすい定番の料理を集めました。",
    avoidLead:
      "内臓や珍しい食材を使う、見た目にインパクトのある料理をまとめました。苦手な人が避けたいときの目安に。",
  },
  {
    slug: "alcohol-free",
    label: "アルコール",
    // 「ノンアルコールを好む人が避ける」= その飲み物にアルコールが入る、
    // という関係なのでキーワードだけで判定できる（カテゴリ全体は対象にしない）
    keywords: ["ノンアルコール", "アルコールNG", "酒が苦手", "甘い酒が苦手"],
    excludeTerms: [
      "アルコール",
      "ワイン",
      "ビール",
      "酒",
      "ラム",
      "ブランデー",
      "リキュール",
      "ウイスキー",
      "ウォッカ",
      "蒸留",
      "醸造",
    ],
    // 飲み物エントリは 40件中ほぼすべてが酒のため、おすすめ側が成立しない。
    // safeFilter を持たせず avoid ページだけを生成する
    safeTitle: "お酒が飲めない人向けの飲み物",
    avoidTitle: "アルコールを含む飲み物一覧",
    safeLead:
      "アルコールが入らない飲み物を集めました。お酒が飲めない人の一杯目選びに。",
    avoidLead:
      "アルコールを含む飲み物をまとめました。お酒を避けたい人が注文前に確認したいときの一覧です。",
  },
]

export const DIETARY_AVOID_MIN = 5
export const DIETARY_SAFE_LIMIT = 40

export type DietaryTopic = {
  axis: DietaryAxis
  avoidDishes: DishItem[]
  safeDishes: DishItem[]
  safeTotal: number
}

function matchesKeyword(dish: DishItem, keywords: string[]): boolean {
  return dish.reverseKeywords.some((keyword) => keywords.includes(keyword))
}

const dishTextCache = new Map<string, string>()

function dishText(dish: DishItem): string {
  const cached = dishTextCache.get(dish.id)
  if (cached) return cached
  const text = [
    dish.name,
    ...(dish.aliases ?? []),
    dish.summary,
    dish.menuDescription,
    ...dish.whatComesOut,
    ...dish.tasteAndTexture,
    dish.orderAdvice,
    dish.caution ?? "",
    ...dish.tags,
  ].join(" ")
  dishTextCache.set(dish.id, text)
  return text
}

function mentionsExcludedTerm(dish: DishItem, axis: DietaryAxis): boolean {
  if (!axis.excludeTerms) return false
  const text = dishText(dish)
  return axis.excludeTerms.some((term) => text.includes(term))
}

function isAvoid(dish: DishItem, axis: DietaryAxis): boolean {
  if (matchesKeyword(dish, axis.keywords)) return true
  if (axis.avoidTags && hasAnyTag(dish, axis.avoidTags)) return true
  if (axis.avoidCategories?.includes(dish.category)) return true
  return axis.avoidExtra?.(dish) ?? false
}

function buildTopic(axis: DietaryAxis): DietaryTopic {
  const avoidDishes = allDishes.filter((dish) => isAvoid(dish, axis))
  const avoidIds = new Set(avoidDishes.map((dish) => dish.id))
  const safeCategories = axis.safeCategories ?? (["料理"] as DishCategory[])

  const safeAll = axis.safeFilter
    ? allDishes.filter(
        (dish) =>
          !avoidIds.has(dish.id) &&
          safeCategories.includes(dish.category) &&
          !mentionsExcludedTerm(dish, axis) &&
          axis.safeFilter!(dish)
      )
    : []

  const safeSorted = [...safeAll].sort(
    (a, b) =>
      b.beginnerFriendlyScore - a.beginnerFriendlyScore ||
      (b.images?.length ?? 0) - (a.images?.length ?? 0) ||
      a.name.localeCompare(b.name, "ja")
  )

  return {
    axis,
    avoidDishes,
    safeDishes: safeSorted.slice(0, DIETARY_SAFE_LIMIT),
    safeTotal: safeAll.length,
  }
}

const topics = dietaryAxes.map(buildTopic)

export const avoidTopics: DietaryTopic[] = topics.filter(
  (topic) => topic.avoidDishes.length >= DIETARY_AVOID_MIN
)

export const safeTopics: DietaryTopic[] = topics.filter(
  (topic) =>
    topic.axis.safeFilter && topic.safeDishes.length >= DIETARY_AVOID_MIN
)

export function safeTopicBySlug(slug: string): DietaryTopic | undefined {
  return safeTopics.find((topic) => topic.axis.slug === slug)
}

export function avoidTopicBySlug(slug: string): DietaryTopic | undefined {
  return avoidTopics.find((topic) => topic.axis.slug === slug)
}

export function safePath(slug: string): string {
  return `/reverse/k/${slug}/`
}

export function avoidPath(slug: string): string {
  return `/reverse/avoid/${slug}/`
}
