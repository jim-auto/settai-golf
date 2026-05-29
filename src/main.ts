import "./styles.css";

type Phase = "title" | "conversation" | "incident" | "shot" | "air" | "result" | "final";

type Stats = {
  boss: number;
  weird: number;
  company: number;
  settai: number;
  pride: number;
  pressure: number;
  fatigue: number;
  promotion: number;
};

type Choice = {
  label: string;
  hint: string;
  delta: Partial<Stats>;
  message: string;
};

type Conversation = {
  speaker: string;
  line: string;
  trait: string;
  danger: string;
  likes: string;
  dislikes: string;
  favoredShot: string;
  hatedShot: string;
  choices: Choice[];
};

type Incident = {
  title: string;
  line: string;
  choices: Choice[];
};

type Mood = "neutral" | "pleased" | "tense" | "suspicious" | "tired";

type ShotChoice = {
  label: string;
  hint: string;
  power: number;
  curve: number;
  delta: Partial<Stats>;
  message: string;
};

type HoleLayout = {
  name: string;
  yards: number;
  par: number;
  pinX: number;
  greenY: number;
  bunkerX: number;
  waterX: number;
};

type BallPoint = {
  x: number;
  y: number;
};

type Club = {
  name: string;
  power: number;
  control: number;
};

const canvasElement = document.querySelector<HTMLCanvasElement>("#game");
const panelElement = document.querySelector<HTMLDivElement>("#choice-panel");

if (!canvasElement || !panelElement) {
  throw new Error("Game root is missing.");
}

const canvas: HTMLCanvasElement = canvasElement;
const panel: HTMLDivElement = panelElement;
const canvasContext = canvas.getContext("2d");
if (!canvasContext) {
  throw new Error("Canvas 2D context is unavailable.");
}
const ctx: CanvasRenderingContext2D = canvasContext;

const generatedImages = {
  keyVisual: loadImage("generated/key-visual.png"),
  bossPortrait: loadImage("generated/boss-portrait.png"),
  clubhouseIncident: loadImage("generated/clubhouse-incident.png"),
  okochiPortrait: loadImage("generated/portrait-okochi.png"),
  clientPortrait: loadImage("generated/portrait-client.png"),
  makinoPortrait: loadImage("generated/portrait-makino.png"),
  kanzakiPortrait: loadImage("generated/portrait-kanzaki.png")
};

function loadImage(path: string) {
  const image = new Image();
  image.decoding = "async";
  image.src = `${import.meta.env.BASE_URL}${path}`;
  return image;
}

const conversations: Conversation[] = [
  {
    speaker: "営業本部長 大河内",
    line: "最近のAIって凄いよな。うちの仕事も全部なくなるんじゃないか？",
    trait: "自分の経験則を最新技術より上に置きたい",
    danger: "正論で勝つと午後の稟議が冷える",
    likes: "経験を立てる返答",
    dislikes: "未来の正論",
    favoredShot: "忖度ショット",
    hatedShot: "本気ショット",
    choices: [
      {
        label: "AIは補佐役です",
        hint: "正論で少しだけ安心させる",
        delta: { boss: 6, company: 4, settai: 3, weird: -2, pressure: -3 },
        message: "本部長は頷いた。だが『補佐』という言葉に少し救われたようだ。"
      },
      {
        label: "本部長の勘はAIに無理です",
        hint: "露骨だが刺さる",
        delta: { boss: 10, settai: 7, weird: 5, pride: 6, promotion: 3 },
        message: "本部長の口角が上がる。露骨すぎるが、今日はそれも仕事だ。"
      },
      {
        label: "むしろ転職チャンスです",
        hint: "場を凍らせる可能性",
        delta: { boss: -9, company: -8, weird: 9, pressure: 7, promotion: -6 },
        message: "カートのエンジン音だけが、やけに大きく聞こえた。"
      }
    ]
  },
  {
    speaker: "取引先 常務",
    line: "君、彼女いるの？ まあ仕事が恋人って時期も必要だよ。",
    trait: "悪気のない距離感で踏み込んでくる",
    danger: "強く否定すると場が研修資料になる",
    likes: "軽い笑い",
    dislikes: "コンプラの直球",
    favoredShot: "盛り上げ優先",
    hatedShot: "安全プレイ",
    choices: [
      {
        label: "勉強中です",
        hint: "曖昧にかわす",
        delta: { boss: 4, company: 5, settai: 4, weird: -1, fatigue: 3 },
        message: "何も答えていないのに、全員が納得した顔をした。"
      },
      {
        label: "ゴルフ場ではノーコメントで",
        hint: "軽い笑いに逃がす",
        delta: { boss: 2, company: 3, settai: 7, weird: -3, pressure: -4 },
        message: "キャディさんまで小さく笑った。これは良い逃げ方だ。"
      },
      {
        label: "コンプラ的に微妙です",
        hint: "正しいが重い",
        delta: { boss: -6, company: 2, settai: -4, weird: 8, pressure: 5 },
        message: "正しい。正しいが、今ここは芝の上である。"
      }
    ]
  },
  {
    speaker: "課長代理 牧野",
    line: "転職とか考えてないよね？ 最近の若い人は身軽だからさ。",
    trait: "忠誠心を確認しながら自分も揺れている",
    danger: "本音を出すと帰りの車内が長くなる",
    likes: "曖昧な忠誠",
    dislikes: "条件交渉",
    favoredShot: "安全プレイ",
    hatedShot: "ドラマ演出",
    choices: [
      {
        label: "まず今の案件です",
        hint: "忠誠を匂わせつつ断言しない",
        delta: { boss: 7, company: 8, settai: 5, weird: -2, promotion: 4 },
        message: "誰も突っ込めない、完璧に湿度のある回答だった。"
      },
      {
        label: "御社に骨を埋めます",
        hint: "少し古いが強い",
        delta: { boss: 9, company: 6, settai: 3, weird: 6, pride: 4 },
        message: "『御社？』と社内の人間が一瞬だけ固まった。"
      },
      {
        label: "条件次第ですね",
        hint: "芝より空気が硬くなる",
        delta: { boss: -10, company: -10, weird: 10, pressure: 8, promotion: -8 },
        message: "フェアウェイに、見えない稟議書が落ちた。"
      }
    ]
  },
  {
    speaker: "相談役 神崎",
    line: "昔は徹夜が当たり前でさ。朝そのまま客先に行ったもんだよ。",
    trait: "昔話を否定されると人格を否定された顔になる",
    danger: "労務知識は正しいが、この場では硬すぎる",
    likes: "伝説扱い",
    dislikes: "制度の話",
    favoredShot: "ドラマ演出",
    hatedShot: "本気ショット",
    choices: [
      {
        label: "時代を作った世代ですね",
        hint: "肯定して現代に戻る余地を残す",
        delta: { boss: 8, company: 4, settai: 6, weird: 1, pride: 5 },
        message: "相談役は満足げだ。誰も徹夜の再導入とは言っていない。"
      },
      {
        label: "今なら伝説です",
        hint: "笑いに寄せる",
        delta: { boss: 5, company: 5, settai: 7, weird: -2, pressure: -3 },
        message: "『伝説』という便利な棚に、過去がきれいに収まった。"
      },
      {
        label: "労基が来ますね",
        hint: "未来は正しいが今は危険",
        delta: { boss: -8, company: 1, settai: -5, weird: 9, pressure: 6 },
        message: "同伴者全員が、遠くのOB杭を見た。"
      }
    ]
  }
];

const shotChoices: ShotChoice[] = [
  {
    label: "本気ショット",
    hint: "飛ぶ。だが飛びすぎる。",
    power: 94,
    curve: 0.02,
    delta: { boss: -7, company: 2, settai: -4, pride: 10, weird: 2 },
    message: "会心の当たり。上司の笑顔だけが少し遅れて到着した。"
  },
  {
    label: "忖度ショット",
    hint: "少しだけ曲げる高度技術",
    power: 62,
    curve: -0.06,
    delta: { boss: 8, settai: 10, weird: 2, pride: -4, promotion: 4 },
    message: "ラフの浅いところへ。ミスに見えて、計算に見えない。"
  },
  {
    label: "ドラマ演出",
    hint: "木に当てて戻すタイプの物語",
    power: 48,
    curve: 0.14,
    delta: { boss: 5, settai: 8, weird: 6, pressure: 2, fatigue: 4 },
    message: "カーン、という音のあと謎の拍手。接待には効果音がある。"
  },
  {
    label: "盛り上げ優先",
    hint: "リアクションで稼ぐ",
    power: 55,
    curve: 0.08,
    delta: { boss: 6, settai: 9, company: 3, fatigue: 5, weird: -1 },
    message: "打球より声量が飛んだ。場は温まった。"
  },
  {
    label: "安全プレイ",
    hint: "地味だが失点しにくい",
    power: 70,
    curve: -0.01,
    delta: { boss: 3, company: 6, settai: 3, weird: -4, pressure: -2 },
    message: "無難。無難すぎて、会話の責任が戻ってきた。"
  }
];

const holeLayouts: HoleLayout[] = [
  { name: "松風 1番", yards: 318, par: 4, pinX: 0.58, greenY: 0.15, bunkerX: 0.72, waterX: 0.23 },
  { name: "霞 2番", yards: 286, par: 4, pinX: 0.46, greenY: 0.16, bunkerX: 0.28, waterX: 0.78 },
  { name: "稟議 3番", yards: 342, par: 4, pinX: 0.62, greenY: 0.14, bunkerX: 0.18, waterX: 0.48 },
  { name: "根回し 4番", yards: 301, par: 4, pinX: 0.42, greenY: 0.16, bunkerX: 0.69, waterX: 0.18 }
];

const clubs: Club[] = [
  { name: "Driver", power: 1.12, control: 0.76 },
  { name: "Iron", power: 0.82, control: 0.94 },
  { name: "Wedge", power: 0.52, control: 1.14 },
  { name: "Putter", power: 0.2, control: 1.32 }
];

const incidents: Incident[] = [
  {
    title: "上司のボールが見つからない",
    line: "本部長のボールがラフに消えた。本人は『この辺なんだけどな』と、明らかに違う場所を指している。",
    choices: [
      {
        label: "全力で探す",
        hint: "誠意は見えるが進行が詰まる",
        delta: { boss: 7, settai: 4, fatigue: 6, pressure: 4 },
        message: "汗だくで探した。誠意は伝わったが、後ろの組の視線も伝わった。"
      },
      {
        label: "近くに落ちていた体にする",
        hint: "やや黒いが場は進む",
        delta: { boss: 9, settai: 8, weird: 5, promotion: 3 },
        message: "『あ、ありました』の声が少し早すぎた。だが全員が前に進めた。"
      },
      {
        label: "ルール通りロストです",
        hint: "競技ゴルフなら正解",
        delta: { boss: -12, company: -4, settai: -8, weird: 6, pride: 4 },
        message: "正しい。正しすぎて、芝の温度が二度下がった。"
      }
    ]
  },
  {
    title: "昼食の注文だけ遅い",
    line: "クラブハウスで、相談役の天ざるだけ来ない。本人は平静を装っているが箸袋を三回折った。",
    choices: [
      {
        label: "店員に静かに確認",
        hint: "角を立てずに動く",
        delta: { boss: 5, company: 6, settai: 7, weird: -2, promotion: 3 },
        message: "声量、角度、タイミング。すべてが業務連絡の美しさだった。"
      },
      {
        label: "自分の食事を差し出す",
        hint: "美談だが重い",
        delta: { boss: 4, settai: 5, weird: 7, fatigue: 5, pressure: 2 },
        message: "相談役は喜んだが、周囲は『そこまでやる？』という顔をした。"
      },
      {
        label: "話題で待ち時間を埋める",
        hint: "自然だが長期戦",
        delta: { boss: 3, company: 4, settai: 6, fatigue: 4, pressure: -2 },
        message: "昔話を引き出した。天ざるより先に昭和が来た。"
      }
    ]
  },
  {
    title: "カート運転係に任命",
    line: "『若いから頼むよ』の一言で、あなたは全ホールのカート運転責任者になった。",
    choices: [
      {
        label: "完璧な停車位置を狙う",
        hint: "気配りで評価される",
        delta: { boss: 6, company: 7, settai: 6, fatigue: 5, promotion: 4 },
        message: "乗り降り、日陰、クラブ位置。停車位置に人事評価が宿った。"
      },
      {
        label: "あえて雑談を優先",
        hint: "運転より空気",
        delta: { boss: 4, settai: 8, pressure: -3, fatigue: 3, weird: 1 },
        message: "少し遠回りしたが、車内の沈黙は回避した。"
      },
      {
        label: "免許ない設定で逃げる",
        hint: "短期回避、長期不信",
        delta: { boss: -7, company: -7, settai: -4, weird: 8, fatigue: -2 },
        message: "逃げ切った。ただし『若いのに？』という謎の疑問が残った。"
      }
    ]
  },
  {
    title: "取引先が仕事の愚痴を始める",
    line: "常務が『最近、御社のレス遅いんだよね』と、パター練習場で急に本題へ入った。",
    choices: [
      {
        label: "その場で謝る",
        hint: "早いが会社を背負う",
        delta: { boss: 2, company: -3, settai: 5, pressure: 6, promotion: 2 },
        message: "謝罪は速かった。だが月曜の確認事項が三つ増えた。"
      },
      {
        label: "持ち帰りを約束",
        hint: "社会人の万能薬",
        delta: { boss: 5, company: 6, settai: 5, weird: -1, pressure: 3 },
        message: "『確認します』は、芝の上でも強い。"
      },
      {
        label: "担当部署のせいにする",
        hint: "短期防衛、社内政治に傷",
        delta: { boss: -2, company: -9, settai: -2, weird: 7, pressure: -2 },
        message: "その場は軽くなったが、社内のどこかで椅子が軋んだ。"
      }
    ]
  }
];

let phase: Phase = "title";
let hole = 1;
const maxHoles = 4;
let selectedMessage = "";
let lastShotPower = 0;
let lastScoreDiff = 0;
let animationTime = 0;
let audio: AudioEngine | null = null;
let memos: string[] = [];
let lastDelta: Partial<Stats> = {};
let currentIncident: Incident = incidents[0];
let finalScore = 0;
let finalTitle = "";
let finalDetails: string[] = [];
let activeShot: ShotChoice | null = null;
let pendingShotMessage = "";
let shotTarget = 0.42;
let ballLanding: BallPoint = { x: 0.5, y: 0.82 };
let previousBall: BallPoint = { x: 0.5, y: 0.86 };
let ballTrail: BallPoint[] = [];
let lastLie = "ティー";
let lastDistanceToPin = 0;
let shotStage = 1;
let strokeCount = 0;
let bossStrokeCount = 4;
let wind = { x: 0, y: 0, label: "無風" };
let selectedClub: Club = clubs[0];
let shotFeedback = "";
let shotFeedbackTone: "good" | "bad" | "neutral" = "neutral";
let shotFeedbackAt = -999;
let bossMood: Mood = "neutral";
let roomMood: Mood = "neutral";
let playerMood: Mood = "neutral";
let reactionText = "本日は、笑顔と沈黙の配分が重要です。";

let stats: Stats = {
  boss: 45,
  weird: 18,
  company: 42,
  settai: 35,
  pride: 32,
  pressure: 28,
  fatigue: 8,
  promotion: 30
};

class AudioEngine {
  private context: AudioContext;
  private master: GainNode;
  private timer = 0;
  private step = 0;

  constructor() {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.055;
    this.master.connect(this.context.destination);
  }

  start() {
    void this.context.resume();
    if (this.timer) return;
    this.timer = window.setInterval(() => this.playBar(), 520);
  }

  click() {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.03, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.12);
    osc.connect(gain).connect(this.master);
    osc.start();
    osc.stop(this.context.currentTime + 0.13);
  }

  private playBar() {
    const chords = [
      [261.63, 329.63, 392.0, 493.88],
      [293.66, 349.23, 440.0, 523.25],
      [246.94, 311.13, 392.0, 466.16],
      [220.0, 277.18, 329.63, 415.3]
    ];
    const chord = chords[this.step % chords.length];
    chord.forEach((freq, index) => this.note(freq, 0.38, index * 0.018));
    if (this.step % 2 === 0) {
      this.note(chord[0] / 2, 0.22, 0.04, "sine");
    }
    this.step += 1;
  }

  private note(freq: number, length: number, delay = 0, type: OscillatorType = "sine") {
    const now = this.context.currentTime + delay;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + length + 0.02);
  }
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function applyDelta(delta: Partial<Stats>) {
  lastDelta = { ...delta };
  for (const key of Object.keys(delta) as (keyof Stats)[]) {
    stats[key] = clamp(stats[key] + (delta[key] ?? 0));
  }
  updateReaction(delta);
}

function updateReaction(delta: Partial<Stats>) {
  if ((delta.boss ?? 0) >= 7 || (delta.settai ?? 0) >= 8) {
    bossMood = "pleased";
    reactionText = "上司の口角が、社内承認フローより少し早く上がった。";
  } else if ((delta.boss ?? 0) <= -7) {
    bossMood = "suspicious";
    reactionText = "上司の沈黙が、議事録に残らない種類の重さを帯びた。";
  } else if ((delta.weird ?? 0) >= 6) {
    bossMood = "suspicious";
    roomMood = "tense";
    reactionText = "場が一瞬だけ、研修動画の悪い例みたいになった。";
  } else if ((delta.company ?? 0) <= -6) {
    roomMood = "tense";
    reactionText = "社内の誰かが、月曜の根回し工数を計算し始めた。";
  } else if ((delta.fatigue ?? 0) >= 5) {
    playerMood = "tired";
    reactionText = "あなたの笑顔に、うっすら残業申請の影が差した。";
  } else {
    bossMood = stats.boss > 62 ? "pleased" : stats.weird > 55 ? "suspicious" : "neutral";
    roomMood = stats.pressure > 55 ? "tense" : "neutral";
    playerMood = stats.fatigue > 55 ? "tired" : "neutral";
    reactionText = "空気はまだ読める。読めるうちは、仕事が増える。";
  }
}

function addMemo(text: string) {
  memos = [text, ...memos].slice(0, 5);
}

function formatDelta(delta: Partial<Stats>) {
  const labels: Record<keyof Stats, string> = {
    boss: "上司",
    weird: "不自然",
    company: "社内",
    settai: "接待",
    pride: "プライド",
    pressure: "圧",
    fatigue: "疲労",
    promotion: "出世"
  };
  return (Object.keys(delta) as (keyof Stats)[])
    .filter((key) => delta[key])
    .map((key) => `${labels[key]}${delta[key]! > 0 ? "+" : ""}${delta[key]}`)
    .join(" / ");
}

function buildFinalDetails() {
  const strengths: string[] = [];
  const risks: string[] = [];
  const advice: string[] = [];

  if (stats.boss >= 65) strengths.push("上司満足度が高く、帰り際の『またな』に温度があった");
  if (stats.settai >= 65) strengths.push("接待力が安定し、ミスの見せ方に作為が少なかった");
  if (stats.company >= 62) strengths.push("社内評価を落とさず、月曜の根回し余地を残した");
  if (stats.promotion >= 55) strengths.push("出世期待値が伸び、謎の若手抜擢ルートが少し開いた");

  if (stats.weird >= 55) risks.push("不自然度が高く、忖度の輪郭が見えすぎた");
  if (stats.pride >= 58) risks.push("プライド刺激度が高く、ショットの実力が前に出すぎた");
  if (stats.pressure >= 55) risks.push("場の圧力が残り、会話の余白が狭かった");
  if (stats.fatigue >= 52) risks.push("疲労が蓄積し、笑顔の持続可能性に課題がある");
  if (stats.boss < 45) risks.push("上司満足度が不足し、最重要KPIを取りこぼした");

  if (stats.weird >= 55) advice.push("次回は露骨な救済より、偶然に見える遠回りを増やす");
  if (stats.pride >= 58) advice.push("真芯を避け、相手の好みのショットで小さく負ける");
  if (stats.company < 50) advice.push("取引先対応の前に、社内の言い訳が立つ選択を混ぜる");
  if (stats.fatigue >= 52) advice.push("自己犠牲で全部拾わず、店員確認や持ち帰りで分散する");
  if (advice.length === 0) advice.push("この空気感を維持しつつ、会話の引き出しを増やす");

  return [
    `強み: ${strengths[0] ?? "大崩れせず、最後まで接待の形を保った"}`,
    `失点: ${risks[0] ?? "大きな失点は少ないが、決定打も控えめだった"}`,
    `次回: ${advice[0]}`
  ];
}

function applyShotPreference(choice: ShotChoice) {
  const event = currentConversation();
  if (choice.label === event.favoredShot) {
    const delta: Partial<Stats> = { boss: 5, settai: 4, weird: -2, promotion: 2 };
    applyDelta(delta);
    addMemo(`相性: ${event.speaker}は${choice.label}を好む (${formatDelta(lastDelta)})`);
    return `${event.speaker}の好みに合った。`;
  }

  if (choice.label === event.hatedShot) {
    const delta: Partial<Stats> = { boss: -6, settai: -4, weird: 4, pressure: 3 };
    applyDelta(delta);
    addMemo(`相性: ${event.speaker}に${choice.label}は重い (${formatDelta(lastDelta)})`);
    return `${event.speaker}の好みから少し外れた。`;
  }

  return "";
}

function setChoices(choices: Choice[] | ShotChoice[], handler: (index: number) => void) {
  panel.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "choice-grid";
  choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.innerHTML = `${choice.label}<small>${choice.hint}</small>`;
    button.addEventListener("click", () => {
      audio?.click();
      handler(index);
    });
    grid.appendChild(button);
  });
  panel.appendChild(grid);
}

function setPrimary(label: string, handler: () => void) {
  panel.innerHTML = "";
  const button = document.createElement("button");
  button.className = "choice-button primary-button";
  button.textContent = label;
  button.addEventListener("click", () => {
    if (!audio) {
      audio = new AudioEngine();
    }
    audio.start();
    audio.click();
    handler();
  });
  panel.appendChild(button);
}

function currentConversation() {
  return conversations[(hole - 1) % conversations.length];
}

function pickIncident() {
  return incidents[(hole + Math.floor(Math.random() * incidents.length)) % incidents.length];
}

function currentHoleLayout() {
  return holeLayouts[(hole - 1) % holeLayouts.length];
}

function rollWind() {
  const values = [
    { x: 0.0, y: 0.0, label: "無風" },
    { x: 0.04, y: -0.02, label: "右フォロー" },
    { x: -0.04, y: 0.01, label: "左から重役風" },
    { x: 0.02, y: 0.04, label: "向かい風" },
    { x: -0.02, y: -0.03, label: "追い風" }
  ];
  wind = values[(hole + Math.floor(Math.random() * values.length)) % values.length];
}

function recommendedClub() {
  if (shotStage === 3) return clubs[3];
  if (shotStage === 2 || lastDistanceToPin < 90) return clubs[2];
  if (lastDistanceToPin < 190) return clubs[1];
  return clubs[0];
}

function resetBallForHole() {
  ballLanding = { x: 0.5, y: 0.86 };
  previousBall = { ...ballLanding };
  ballTrail = [{ ...ballLanding }];
  lastLie = "ティー";
  lastDistanceToPin = currentHoleLayout().yards;
  shotStage = 1;
  strokeCount = 0;
  bossStrokeCount = 4 + Math.floor(Math.random() * 2);
  rollWind();
  selectedClub = clubs[0];
  shotFeedback = "";
  shotFeedbackAt = -999;
}

function showTitle() {
  phase = "title";
  selectedMessage = "";
  memos = [];
  lastDelta = {};
  finalScore = 0;
  finalTitle = "";
  finalDetails = [];
  activeShot = null;
  pendingShotMessage = "";
  resetBallForHole();
  bossMood = "neutral";
  roomMood = "neutral";
  playerMood = "neutral";
  reactionText = "本日は、笑顔と沈黙の配分が重要です。";
  setPrimary("接待を開始", () => {
    hole = 1;
    stats = {
      boss: 45,
      weird: 18,
      company: 42,
      settai: 35,
      pride: 32,
      pressure: 28,
      fatigue: 8,
      promotion: 30
    };
    resetBallForHole();
    addMemo("本日のミッション: 自然に褒めて、自然に少し負ける。");
    showConversation();
  });
}

function showConversation() {
  phase = "conversation";
  const event = currentConversation();
  setChoices(event.choices, (index) => {
    const choice = event.choices[index];
    applyDelta(choice.delta);
    selectedMessage = choice.message;
    addMemo(`会話: ${choice.label} (${formatDelta(lastDelta)})`);
    currentIncident = pickIncident();
    showIncident();
  });
}

function showIncident() {
  phase = "incident";
  setChoices(currentIncident.choices, (index) => {
    const choice = currentIncident.choices[index];
    applyDelta(choice.delta);
    selectedMessage = choice.message;
    addMemo(`事件: ${choice.label} (${formatDelta(lastDelta)})`);
    showShot();
  });
}

function showShot() {
  phase = "shot";
  activeShot = null;
  pendingShotMessage = "";
  const stageName = shotStage === 1 ? "ティーショット" : shotStage === 2 ? "アプローチ" : "パット";
  selectedMessage = `${stageName}の方針を選べ。残り${lastDistanceToPin}yd。入れすぎても、外しすぎても空気が変わる。`;
  setChoices(shotChoices, (index) => {
    const choice = shotChoices[index];
    applyDelta(choice.delta);
    const preferenceMessage = applyShotPreference(choice);
    selectedClub = recommendedClub();
    activeShot = choice;
    pendingShotMessage = preferenceMessage ? `${choice.message} ${preferenceMessage}` : choice.message;
    shotTarget = choice.label === currentConversation().favoredShot ? 0.42 : 0.48;
    selectedMessage = `${stageName}: ${choice.label}を構えた。動くゲージを接待ゾーンで止めろ。真芯すぎると勝ちすぎる。`;
    setPrimary("タイミングを止める", commitTimedShot);
  });
}

function currentShotTiming() {
  return (Math.sin(animationTime * 3.6) + 1) / 2;
}

function judgeLie(point: BallPoint) {
  const layout = currentHoleLayout();
  const lateral = Math.abs(point.x - 0.5);
  const greenDistance = Math.hypot((point.x - layout.pinX) * 1.6, (point.y - layout.greenY) * 1.25);
  const bunkerDistance = Math.hypot(point.x - layout.bunkerX, point.y - 0.28);
  const waterDistance = Math.hypot(point.x - layout.waterX, point.y - 0.54);

  if (point.x < 0.04 || point.x > 0.96 || point.y < 0.06 || point.y > 0.93) return "OB";
  if (waterDistance < 0.105) return "池";
  if (bunkerDistance < 0.11) return "バンカー";
  if (greenDistance < 0.12) return "グリーン";
  if (lateral < 0.18 && point.y > 0.18 && point.y < 0.82) return "フェアウェイ";
  return "ラフ";
}

function estimateDistanceToPin(point: BallPoint) {
  const layout = currentHoleLayout();
  const normalizedDistance = Math.hypot((point.x - layout.pinX) * 1.25, (point.y - layout.greenY) * 1.65);
  return Math.round(normalizedDistance * layout.yards);
}

function applyLieDelta(lie: string) {
  if (lie === "グリーン") return { boss: -1, pride: 3, settai: -1 };
  if (lie === "フェアウェイ") return { company: 2, settai: 2 };
  if (lie === "ラフ") return { boss: 3, settai: 3 };
  if (lie === "バンカー") return { boss: 4, settai: 2, weird: 2, fatigue: 2 };
  if (lie === "池") return { boss: -6, weird: 7, settai: -5, fatigue: 4 };
  return { boss: -8, weird: 9, settai: -6, pressure: 4 };
}

function stageName() {
  return shotStage === 1 ? "ティーショット" : shotStage === 2 ? "アプローチ" : "パット";
}

function nextPointForStage(timing: number, shot: ShotChoice) {
  const layout = currentHoleLayout();
  const club = selectedClub;
  if (shotStage === 1) {
    const carryRatio = clamp((((shot.power * club.power) + Math.round((timing - 0.5) * 38) + 8) / 112) * 100) / 100;
    const miss = (timing - shotTarget) * (0.72 / club.control);
    return {
      x: Math.max(0.02, Math.min(0.98, 0.5 + shot.curve + miss + wind.x)),
      y: Math.max(0.07, Math.min(0.9, 0.88 - carryRatio * 0.76 + wind.y))
    };
  }

  const target = { x: layout.pinX, y: layout.greenY };
  if (shotStage === 3) {
    const cup = target;
    const read = (timing - shotTarget) * (0.12 / club.control) + shot.curve * 0.16 + wind.x * 0.25;
    const pace = (shot.label === "本気ショット" ? 1.18 : shot.label === "安全プレイ" ? 0.78 : shot.label === "忖度ショット" ? 0.92 : 0.86) * club.power * 4.2;
    return {
      x: Math.max(0.02, Math.min(0.98, ballLanding.x + (cup.x - ballLanding.x) * pace + read)),
      y: Math.max(0.06, Math.min(0.9, ballLanding.y + (cup.y - ballLanding.y) * pace + Math.abs(read) * 0.06))
    };
  }

  const aggressiveness = shot.label === "本気ショット" ? 1.08 : shot.label === "安全プレイ" ? 0.82 : shot.label === "忖度ショット" ? 0.92 : 0.75;
  const progress = aggressiveness * club.power * (0.78 + timing * 0.22);
  const miss = (timing - shotTarget) * (0.2 / club.control) + shot.curve * 0.25 + wind.x * 0.6;
  return {
    x: Math.max(0.02, Math.min(0.98, ballLanding.x + (target.x - ballLanding.x) * progress + miss)),
    y: Math.max(0.06, Math.min(0.9, ballLanding.y + (target.y - ballLanding.y) * progress + Math.abs(miss) * 0.18 + wind.y * 0.4))
  };
}

function setShotFeedback(text: string, tone: "good" | "bad" | "neutral") {
  shotFeedback = text;
  shotFeedbackTone = tone;
  shotFeedbackAt = animationTime;
}

function commitTimedShot() {
  if (!activeShot) return;
  const timing = currentShotTiming();
  const timingOffset = Math.round((timing - 0.5) * 38);
  lastShotPower = Math.round(activeShot.power * selectedClub.power + timingOffset);
  const previous = { ...ballLanding };
  previousBall = previous;
  ballLanding = nextPointForStage(timing, activeShot);
  ballTrail.push({
    x: (previous.x + ballLanding.x) / 2 + activeShot.curve * 0.25,
    y: (previous.y + ballLanding.y) / 2 + 0.08
  });
  ballTrail.push(ballLanding);
  lastLie = judgeLie(ballLanding);
  lastDistanceToPin = estimateDistanceToPin(ballLanding);
  strokeCount += 1;
  lastScoreDiff = strokeCount - bossStrokeCount;

  const targetGap = Math.abs(timing - shotTarget);
  if (targetGap < 0.055) {
    applyDelta({ settai: 6, boss: 4, weird: -3, promotion: 2 });
    addMemo(`タイミング: 接待ゾーン (${formatDelta(lastDelta)})`);
    setShotFeedback("NICE SETTAI", "good");
  } else if (timing > 0.82) {
    applyDelta({ pride: 6, boss: -4, weird: 2 });
    addMemo(`タイミング: 真芯すぎる (${formatDelta(lastDelta)})`);
    setShotFeedback("やりすぎ", "bad");
  } else if (timing < 0.16) {
    applyDelta({ weird: 7, settai: -4, fatigue: 2 });
    addMemo(`タイミング: 外しすぎ (${formatDelta(lastDelta)})`);
    setShotFeedback("演技臭い", "bad");
  } else {
    applyDelta({ settai: 1, fatigue: 1 });
    addMemo(`タイミング: 無難 (${formatDelta(lastDelta)})`);
    setShotFeedback("無難", "neutral");
  }

  if (lastLie === "池" || lastLie === "OB") setShotFeedback(lastLie, "bad");
  if (lastLie === "バンカー" && shotFeedbackTone !== "bad") setShotFeedback("ドラマ発生", "neutral");

  const lieDelta = applyLieDelta(lastLie);
  applyDelta(lieDelta);
  addMemo(`ライ: ${lastLie} / 残り${lastDistanceToPin}yd (${formatDelta(lastDelta)})`);

  addMemo(`${stageName()}: ${activeShot.label} / ${lastLie} 残り${lastDistanceToPin}yd`);
  const holed = shotStage === 3 && lastDistanceToPin <= 10;
  const message = `${pendingShotMessage} ${selectedClub.name}で${stageName()}、${lastLie}。ピンまで残り${lastDistanceToPin}yd。風は${wind.label}。`;
  activeShot = null;
  if (shotStage < 3 && lastLie !== "OB" && lastLie !== "池") {
    selectedMessage = `${message} 次は${shotStage === 1 ? "アプローチ" : "パット"}。`;
    shotStage += 1;
    setPrimary(shotStage === 2 ? "アプローチへ" : "パットへ", showShot);
    return;
  }
  resolveShot(holed ? `${message} カップイン。だが入れ方が完璧すぎたかもしれない。` : message);
}

function resolveShot(message: string) {
  phase = "air";
  const tooGood = strokeCount < bossStrokeCount;
  const tooBad = strokeCount > bossStrokeCount + 2 || lastLie === "OB" || lastLie === "池";
  const natural = strokeCount === bossStrokeCount || strokeCount === bossStrokeCount + 1;
  const delta: Partial<Stats> = {};

  if (tooGood) {
    delta.boss = -10;
    delta.pride = 9;
    delta.weird = 5;
    selectedMessage = `${message} ${strokeCount}打。上司より先に仕上がってしまった。`;
  } else if (tooBad) {
    delta.boss = -4;
    delta.weird = 10;
    delta.settai = -7;
    selectedMessage = `${message} ${strokeCount}打。さすがに演技を疑われる崩れ方だ。`;
  } else if (natural) {
    delta.boss = 9;
    delta.settai = 9;
    delta.company = 4;
    delta.promotion = 5;
    selectedMessage = `${message} ${strokeCount}打。上司と同じか少し悪い、美しいホールアウトだった。`;
  } else {
    delta.boss = 3;
    delta.settai = 3;
    delta.company = 1;
    selectedMessage = `${message} ${strokeCount}打。可もなく不可もないが、会食で取り返せる範囲だ。`;
  }

  delta.fatigue = 4;
  applyDelta(delta);
  addMemo(`空気判定: ${formatDelta(lastDelta)}`);
  setPrimary("空気を読む", showResult);
}

function showResult() {
  phase = "result";
  const totalAir = stats.boss + stats.company + stats.settai + stats.promotion - stats.weird - stats.pressure - stats.fatigue * 0.45;
  if (totalAir > 185) {
    selectedMessage = "本日の接待空気は上々。『また回ろう』が社交辞令に聞こえない。";
  } else if (stats.weird > 62) {
    selectedMessage = "接待の輪郭が見えすぎている。自然なミスとは、深い。";
  } else if (stats.boss < 30) {
    selectedMessage = "上司が静かだ。沈黙にも役職がある。";
  } else {
    selectedMessage = "まだ取り返せる。日本企業の午後は長い。";
  }

  const label = hole >= maxHoles ? "最終評価へ" : "次のホールへ";
  setPrimary(label, () => {
    if (hole >= maxHoles) {
      showFinal();
      return;
    }
    hole += 1;
    resetBallForHole();
    showConversation();
  });
}

function showFinal() {
  phase = "final";
  finalScore = Math.round(
    stats.boss * 0.28 +
      stats.company * 0.18 +
      stats.settai * 0.3 +
      stats.promotion * 0.18 -
      stats.weird * 0.2 -
      stats.pride * 0.08 -
      stats.fatigue * 0.06
  );

  if (stats.weird >= 70) {
    finalTitle = "露骨な忖度職人";
    selectedMessage = "評価: 技術は高いが、見せ方が強すぎる。部長会で『あいつ分かりやすいな』と共有された。";
  } else if (stats.pride >= 72) {
    finalTitle = "勝ってしまう若手";
    selectedMessage = "評価: 能力は申し分ない。ただし、帰りの車で誰もスコアの話をしなかった。";
  } else if (stats.fatigue >= 58) {
    finalTitle = "自己犠牲型カート係";
    selectedMessage = "評価: 献身的。ただし月曜から雑務が自然に集まる危険がある。";
  } else if (finalScore >= 66 && stats.boss >= 62 && stats.settai >= 62) {
    finalTitle = "空気のシングルプレイヤー";
    selectedMessage = "評価: 次期エース候補。翌朝、部長から謎のゴルフスタンプが届いた。";
  } else if (finalScore >= 50) {
    finalTitle = "無難な幹事候補";
    selectedMessage = "評価: 及第点。稟議は通らないが、飲み会には呼ばれる。";
  } else if (stats.company >= 62 && stats.boss < 42) {
    finalTitle = "社内調整はできる人";
    selectedMessage = "評価: 会社には必要。ただし上司の機嫌という最重要KPIを落とした。";
  } else {
    finalTitle = "月曜朝の1on1案件";
    selectedMessage = "評価: 要フォロー。月曜朝の1on1が、なぜか30分延長された。";
  }
  finalDetails = buildFinalDetails();
  addMemo(`最終称号: ${finalTitle} / 接待指数 ${finalScore}`);
  setPrimary("もう一度 接待する", showTitle);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function roundRect(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawImageCover(image: HTMLImageElement, x: number, y: number, w: number, h: number, alpha = 1) {
  if (!image.complete || image.naturalWidth === 0) return false;
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = w / h;
  const drawW = imageRatio > targetRatio ? h * imageRatio : w;
  const drawH = imageRatio > targetRatio ? h : w / imageRatio;
  const drawX = x + (w - drawW) / 2;
  const drawY = y + (h - drawH) / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
  ctx.restore();
  return true;
}

function currentSpeakerImage() {
  const speaker = currentConversation().speaker;
  if (speaker.includes("大河内")) return generatedImages.okochiPortrait;
  if (speaker.includes("常務")) return generatedImages.clientPortrait;
  if (speaker.includes("牧野")) return generatedImages.makinoPortrait;
  if (speaker.includes("神崎")) return generatedImages.kanzakiPortrait;
  return generatedImages.bossPortrait;
}

function drawBackground(w: number, h: number) {
  if (phase === "title" && drawImageCover(generatedImages.keyVisual, 0, 0, w, h, 1)) {
    const overlay = ctx.createLinearGradient(0, 0, 0, h);
    overlay.addColorStop(0, "rgba(9, 18, 14, 0.34)");
    overlay.addColorStop(0.52, "rgba(9, 18, 14, 0.22)");
    overlay.addColorStop(1, "rgba(9, 18, 14, 0.72)");
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (phase === "incident" && drawImageCover(generatedImages.clubhouseIncident, 0, 0, w, h, 0.42)) {
    ctx.fillStyle = "rgba(10, 18, 12, 0.48)";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#c8ddcf");
  sky.addColorStop(0.42, "#eef0d7");
  sky.addColorStop(0.43, "#6e9c63");
  sky.addColorStop(1, "#163d29");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#294c34";
  for (let i = 0; i < 9; i += 1) {
    const x = ((i * 173 + animationTime * 10) % (w + 220)) - 110;
    ctx.beginPath();
    ctx.ellipse(x, h * 0.42, 75, 120, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 10, h * 0.42, 20, 100);
  }

  ctx.fillStyle = "#86b363";
  ctx.beginPath();
  ctx.ellipse(w * 0.56, h * 0.84, w * 0.58, h * 0.28, -0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d6c184";
  ctx.beginPath();
  ctx.ellipse(w * 0.24, h * 0.75, w * 0.12, h * 0.035, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.7, h * 0.34);
  ctx.lineTo(w * 0.7, h * 0.56);
  ctx.stroke();
  ctx.fillStyle = "#a52d2d";
  ctx.beginPath();
  ctx.moveTo(w * 0.7, h * 0.34);
  ctx.lineTo(w * 0.78, h * 0.37);
  ctx.lineTo(w * 0.7, h * 0.41);
  ctx.fill();
}

function drawPanel(x: number, y: number, w: number, h: number, fill = "rgba(18, 35, 28, 0.84)") {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  roundRect(x, y, w, h, 8);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(231,211,151,0.72)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawText(text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = [...text];
  let line = "";
  let offset = 0;
  for (const char of words) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y + offset);
      line = char;
      offset += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) {
    ctx.fillText(line, x, y + offset);
  }
}

function drawTextLimited(text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const chars = [...text];
  let line = "";
  let lineIndex = 0;
  for (const char of chars) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      if (lineIndex >= maxLines - 1) {
        while (ctx.measureText(`${line}...`).width > maxWidth && line.length > 0) {
          line = line.slice(0, -1);
        }
        ctx.fillText(`${line}...`, x, y + lineIndex * lineHeight);
        return;
      }
      ctx.fillText(line, x, y + lineIndex * lineHeight);
      line = char;
      lineIndex += 1;
    } else {
      line = next;
    }
  }
  if (line && lineIndex < maxLines) {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
}

function drawGauge(label: string, value: number, x: number, y: number, w: number, color: string) {
  ctx.fillStyle = "#f7efd7";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText(label, x, y);
  roundRect(x, y + 8, w, 10, 5);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fill();
  roundRect(x, y + 8, (w * value) / 100, 10, 5);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawStats(w: number) {
  if (w < 760) {
    const x = 12;
    drawPanel(x, 12, w - 24, 82, "rgba(23, 29, 28, 0.78)");
    ctx.fillStyle = "#e7d397";
    ctx.font = "800 12px 'Yu Gothic', sans-serif";
    ctx.fillText("非公開評価", x + 12, 32);
    const gaugeW = Math.max(56, (w - 76) / 4);
    drawGauge("上司", stats.boss, x + 12, 52, gaugeW, "#d5b04c");
    drawGauge("不自然", stats.weird, x + 20 + gaugeW, 52, gaugeW, "#d05c48");
    drawGauge("社内", stats.company, x + 28 + gaugeW * 2, 52, gaugeW, "#79b7c7");
    drawGauge("接待", stats.settai, x + 36 + gaugeW * 3, 52, gaugeW, "#89c66d");
    return;
  }

  const x = Math.max(16, w - 286);
  drawPanel(x, 16, 270, 182, "rgba(23, 29, 28, 0.78)");
  ctx.fillStyle = "#e7d397";
  ctx.font = "800 14px 'Yu Gothic', sans-serif";
  ctx.fillText("非公開評価シート", x + 16, 42);
  drawGauge("上司満足度", stats.boss, x + 16, 62, 238, "#d5b04c");
  drawGauge("不自然度", stats.weird, x + 16, 90, 238, "#d05c48");
  drawGauge("社内評価", stats.company, x + 16, 118, 238, "#79b7c7");
  drawGauge("接待力", stats.settai, x + 16, 146, 238, "#89c66d");
  drawGauge("プライド刺激度", stats.pride, x + 16, 174, 238, "#c486c6");
}

function drawCharacter(name: string, role: string, x: number, y: number, mood: Mood, suit: string) {
  const bob = Math.sin(animationTime * 2.2 + x * 0.01) * 2;
  const headY = y - 58 + bob;
  const bodyY = y + bob;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;

  ctx.fillStyle = suit;
  ctx.beginPath();
  ctx.moveTo(x - 40, bodyY + 64);
  ctx.lineTo(x - 30, bodyY - 8);
  ctx.lineTo(x + 30, bodyY - 8);
  ctx.lineTo(x + 40, bodyY + 64);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f1c9a5";
  ctx.beginPath();
  ctx.ellipse(x, headY, 34, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2b211d";
  ctx.beginPath();
  ctx.ellipse(x, headY - 26, 35, 16, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2b211d";
  ctx.lineWidth = 3;
  const browTilt = mood === "suspicious" || mood === "tense" ? 5 : mood === "pleased" ? -2 : 0;
  ctx.beginPath();
  ctx.moveTo(x - 22, headY - 8 + browTilt);
  ctx.lineTo(x - 8, headY - 10 - browTilt);
  ctx.moveTo(x + 8, headY - 10 - browTilt);
  ctx.lineTo(x + 22, headY - 8 + browTilt);
  ctx.stroke();

  ctx.fillStyle = "#1f1c18";
  ctx.beginPath();
  ctx.ellipse(x - 15, headY + 1, 3, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 15, headY + 1, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#6f3b32";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (mood === "pleased") {
    ctx.arc(x, headY + 13, 13, 0.05 * Math.PI, 0.95 * Math.PI);
  } else if (mood === "suspicious" || mood === "tense") {
    ctx.moveTo(x - 13, headY + 18);
    ctx.lineTo(x + 13, headY + 13);
  } else if (mood === "tired") {
    ctx.moveTo(x - 12, headY + 16);
    ctx.quadraticCurveTo(x, headY + 22, x + 12, headY + 16);
  } else {
    ctx.moveTo(x - 12, headY + 16);
    ctx.lineTo(x + 12, headY + 16);
  }
  ctx.stroke();

  ctx.restore();

  const tagW = 136;
  drawPanel(x - tagW / 2, y + 72, tagW, 48, "rgba(248, 242, 223, 0.9)");
  ctx.fillStyle = "#1f2d27";
  ctx.font = "900 12px 'Yu Gothic', sans-serif";
  ctx.fillText(name, x - tagW / 2 + 10, y + 92);
  ctx.font = "700 11px 'Yu Gothic', sans-serif";
  ctx.fillText(role, x - tagW / 2 + 10, y + 112);
}

function drawBossPortrait(x: number, y: number) {
  if (!generatedImages.bossPortrait.complete || generatedImages.bossPortrait.naturalWidth === 0) return false;
  const w = 148;
  const h = 190;
  drawPanel(x - w / 2, y - 126, w, h, "rgba(248, 242, 223, 0.9)");
  ctx.save();
  roundRect(x - w / 2 + 8, y - 118, w - 16, h - 54, 8);
  ctx.clip();
  drawImageCover(generatedImages.bossPortrait, x - w / 2 + 8, y - 118, w - 16, h - 54, 1);
  ctx.restore();
  ctx.fillStyle = "#1f2d27";
  ctx.font = "900 12px 'Yu Gothic', sans-serif";
  ctx.fillText("大河内", x - w / 2 + 14, y + 42);
  ctx.font = "700 11px 'Yu Gothic', sans-serif";
  ctx.fillText(bossMood === "pleased" ? "満足げな上司" : bossMood === "suspicious" ? "疑念の上司" : "上司", x - w / 2 + 14, y + 58);
  return true;
}

function drawReactionStage(w: number, h: number) {
  if (phase === "title" || phase === "final" || phase === "shot" || phase === "air" || phase === "result" || w < 760) return;
  const stageW = Math.min(560, w - 420);
  if (stageW < 420) return;
  const x = (w - stageW) / 2;
  const y = Math.min(h - 300, h * 0.62);

  drawPanel(x, y - 132, stageW, 112, "rgba(18, 35, 28, 0.72)");
  ctx.fillStyle = "#e7d397";
  ctx.font = "800 13px 'Yu Gothic', sans-serif";
  ctx.fillText("場の反応", x + 18, y - 104);
  ctx.fillStyle = "#f8f2df";
  ctx.font = "700 15px 'Yu Gothic', sans-serif";
  drawText(reactionText, x + 18, y - 74, stageW - 36, 23);

  drawCharacter("あなた", "若手社員", x + stageW * 0.22, y, playerMood, "#2e5362");
  if (!drawBossPortrait(x + stageW * 0.5, y + 18)) {
    drawCharacter("大河内", "上司", x + stageW * 0.5, y - 6, bossMood, "#293044");
  }
  drawCharacter("同伴者", "取引先/社内", x + stageW * 0.78, y, roomMood, "#4a3b52");
}

function drawPuttingGreen(w: number, h: number) {
  if (phase !== "shot" || shotStage !== 3) return false;
  const greenW = Math.min(700, w - 420);
  const greenH = Math.min(300, h * 0.34);
  const x = (w - greenW) / 2;
  const y = Math.max(370, h * 0.41);
  if (greenW < 420 || y + greenH > h - 150) return false;

  const layout = currentHoleLayout();
  drawPanel(x, y, greenW, greenH, "rgba(18, 35, 28, 0.78)");
  ctx.save();
  roundRect(x + 10, y + 10, greenW - 20, greenH - 20, 8);
  ctx.clip();
  ctx.fillStyle = "#6fa75f";
  ctx.fillRect(x + 10, y + 10, greenW - 20, greenH - 20);

  const innerX = x + 26;
  const innerY = y + 26;
  const innerW = greenW - 52;
  const innerH = greenH - 52;
  const local = (point: BallPoint) => ({
    x: innerX + (point.x - (layout.pinX - 0.22)) * (innerW / 0.44),
    y: innerY + (point.y - (layout.greenY - 0.18)) * (innerH / 0.36)
  });
  const cup = local({ x: layout.pinX, y: layout.greenY });
  const ball = local(ballLanding);

  for (let i = 0; i < 7; i += 1) {
    ctx.strokeStyle = i % 2 === 0 ? "rgba(248,242,223,0.14)" : "rgba(25,55,32,0.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 46 + i * 34);
    ctx.bezierCurveTo(x + 200, y + 18 + i * 26, x + 430, y + 86 + i * 20, x + greenW - 20, y + 42 + i * 30);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(30,80,35,0.22)";
  ctx.beginPath();
  ctx.ellipse(cup.x, cup.y, 70, 44, -0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1c1b17";
  ctx.beginPath();
  ctx.arc(cup.x, cup.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f8f2df";
  ctx.lineWidth = 2;
  ctx.stroke();

  const feedbackAge = animationTime - shotFeedbackAt;
  const ballProgress = Math.min(1, Math.max(0, feedbackAge / 0.75));
  const previous = local(previousBall);
  const target = local(ballLanding);
  const visible = feedbackAge >= 0 && feedbackAge < 0.9 ? { x: previous.x + (target.x - previous.x) * ballProgress, y: previous.y + (target.y - previous.y) * ballProgress } : ball;

  ctx.strokeStyle = "rgba(248,242,223,0.7)";
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.quadraticCurveTo((ball.x + cup.x) / 2 + 34, (ball.y + cup.y) / 2 - 18, cup.x, cup.y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#f8f2df";
  ctx.beginPath();
  ctx.arc(visible.x, visible.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1d241f";
  ctx.stroke();

  ctx.restore();
  ctx.fillStyle = "#e7d397";
  ctx.font = "900 13px 'Yu Gothic', sans-serif";
  ctx.fillText(`PUTTING GREEN / 残り${lastDistanceToPin}yd / 第3打`, x + 20, y + 28);
  ctx.fillStyle = "#f8f2df";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText(`傾斜: 右へ流れる / WIND ${wind.label} / CLUB ${selectedClub.name}`, x + greenW - 360, y + 28);
  return true;
}

function drawGolfCourse(w: number, h: number) {
  if (phase !== "shot" && phase !== "air" && phase !== "result") return;
  if (drawPuttingGreen(w, h)) return;
  const courseW = Math.min(700, w - 420);
  const courseH = Math.min(300, h * 0.34);
  const x = (w - courseW) / 2;
  const y = Math.max(370, h * 0.41);
  const layout = currentHoleLayout();

  if (courseW < 420 || y + courseH > h - 150) return;

  drawPanel(x, y, courseW, courseH, "rgba(18, 35, 28, 0.78)");
  ctx.save();
  roundRect(x + 10, y + 10, courseW - 20, courseH - 20, 8);
  ctx.clip();

  ctx.fillStyle = "#315f3b";
  ctx.fillRect(x + 10, y + 10, courseW - 20, courseH - 20);

  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.035)";
    ctx.fillRect(x + 10 + i * ((courseW - 20) / 9), y + 10, (courseW - 20) / 9, courseH - 20);
  }

  const innerX = x + 24;
  const innerY = y + 24;
  const innerW = courseW - 48;
  const innerH = courseH - 48;
  const px = (value: number) => innerX + value * innerW;
  const py = (value: number) => innerY + value * innerH;
  const feedbackAge = animationTime - shotFeedbackAt;
  const ballProgress = Math.min(1, Math.max(0, feedbackAge / 0.75));
  const visibleBall =
    feedbackAge >= 0 && feedbackAge < 0.9
      ? {
          x: previousBall.x + (ballLanding.x - previousBall.x) * ballProgress,
          y: previousBall.y + (ballLanding.y - previousBall.y) * ballProgress - Math.sin(ballProgress * Math.PI) * 0.08
        }
      : ballLanding;

  ctx.fillStyle = "#78a95c";
  ctx.beginPath();
  ctx.moveTo(px(0.46), py(0.9));
  ctx.bezierCurveTo(px(0.22), py(0.68), px(0.28), py(0.36), px(0.44), py(0.2));
  ctx.bezierCurveTo(px(0.54), py(0.08), px(0.75), py(0.16), px(0.66), py(0.34));
  ctx.bezierCurveTo(px(0.58), py(0.52), px(0.76), py(0.76), px(0.54), py(0.9));
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(248,242,223,0.16)";
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(px(0.18), py(0.86 - i * 0.17));
    ctx.bezierCurveTo(px(0.38), py(0.78 - i * 0.14), px(0.65), py(0.63 - i * 0.11), px(0.82), py(0.49 - i * 0.08));
    ctx.stroke();
  }

  ctx.fillStyle = "#91bd68";
  ctx.beginPath();
  ctx.ellipse(px(layout.pinX), py(layout.greenY), innerW * 0.15, innerH * 0.1, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#d5bf78";
  ctx.beginPath();
  ctx.ellipse(px(layout.bunkerX), py(0.28), innerW * 0.09, innerH * 0.055, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#5c98a7";
  ctx.beginPath();
  ctx.ellipse(px(layout.waterX), py(0.54), innerW * 0.12, innerH * 0.075, -0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#f8f2df";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px(layout.pinX), py(layout.greenY));
  ctx.lineTo(px(layout.pinX), py(layout.greenY) - 34);
  ctx.stroke();
  ctx.fillStyle = "#b73a34";
  ctx.beginPath();
  ctx.moveTo(px(layout.pinX), py(layout.greenY) - 34);
  ctx.lineTo(px(layout.pinX) + 28, py(layout.greenY) - 25);
  ctx.lineTo(px(layout.pinX), py(layout.greenY) - 17);
  ctx.fill();

  ctx.strokeStyle = "rgba(248,242,223,0.72)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ballTrail.forEach((point, index) => {
    if (index === 0) ctx.moveTo(px(point.x), py(point.y));
    else ctx.lineTo(px(point.x), py(point.y));
  });
  ctx.stroke();

  ctx.fillStyle = "#f8f2df";
  ctx.beginPath();
  ctx.arc(px(visibleBall.x), py(visibleBall.y), 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1d241f";
  ctx.lineWidth = 2;
  ctx.stroke();

  if (shotFeedback && feedbackAge >= 0 && feedbackAge < 1.8) {
    const alpha = feedbackAge > 1.2 ? 1 - (feedbackAge - 1.2) / 0.6 : 1;
    const badgeW = 180;
    const badgeX = px(visibleBall.x) - badgeW / 2;
    const badgeY = py(visibleBall.y) - 58 - Math.sin(Math.min(1, feedbackAge) * Math.PI) * 10;
    ctx.save();
    ctx.globalAlpha = alpha;
    roundRect(badgeX, badgeY, badgeW, 34, 8);
    ctx.fillStyle = shotFeedbackTone === "good" ? "rgba(67, 135, 78, 0.94)" : shotFeedbackTone === "bad" ? "rgba(168, 63, 54, 0.94)" : "rgba(35, 45, 43, 0.94)";
    ctx.fill();
    ctx.strokeStyle = "rgba(248,242,223,0.8)";
    ctx.stroke();
    ctx.fillStyle = "#f8f2df";
    ctx.font = "900 15px 'Yu Gothic', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(shotFeedback, badgeX + badgeW / 2, badgeY + 22);
    ctx.textAlign = "left";
    ctx.restore();
  }

  if (activeShot) {
    const timing = currentShotTiming();
    const previewX = Math.max(0.02, Math.min(0.98, 0.5 + activeShot.curve + (timing - shotTarget) * 0.72));
    const previewPower = activeShot.power + Math.round((timing - 0.5) * 38);
    const previewCarry = clamp(((previewPower + 8) / 112) * 100) / 100;
    const previewY = Math.max(0.07, Math.min(0.9, 0.88 - previewCarry * 0.76));
    ctx.strokeStyle = "rgba(231,211,151,0.82)";
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.moveTo(px(0.5), py(0.86));
    ctx.lineTo(px(previewX), py(previewY));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#e7d397";
    ctx.beginPath();
    ctx.arc(px(previewX), py(previewY), 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.fillStyle = "#e7d397";
  ctx.font = "900 13px 'Yu Gothic', sans-serif";
  ctx.fillText(`${layout.name} / PAR ${layout.par} / ${layout.yards}yd / 第${shotStage}打`, x + 20, y + 28);
  ctx.fillStyle = "#f8f2df";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText(`自分 ${strokeCount}打 / 上司想定 ${bossStrokeCount}打 / ${lastLie} 残り${lastDistanceToPin}yd`, x + courseW - 286, y + 28);
  ctx.fillStyle = "#d9c98d";
  ctx.font = "800 12px 'Yu Gothic', sans-serif";
  ctx.fillText(`CLUB ${selectedClub.name} / WIND ${wind.label}`, x + 20, y + 48);

  const legendX = x + 20;
  const legendY = y + courseH - 24;
  const legend = [
    ["#91bd68", "Green"],
    ["#78a95c", "Fairway"],
    ["#d5bf78", "Bunker"],
    ["#5c98a7", "Water"]
  ];
  legend.forEach(([color, label], index) => {
    ctx.fillStyle = color;
    roundRect(legendX + index * 88, legendY - 8, 18, 10, 3);
    ctx.fill();
    ctx.fillStyle = "#f8f2df";
    ctx.font = "700 10px 'Yu Gothic', sans-serif";
    ctx.fillText(label, legendX + 24 + index * 88, legendY + 1);
  });
}

function drawAirMemo(w: number, h: number) {
  if (w < 760) return;
  const x = 22;
  const y = 18;
  drawPanel(x, y, 342, 228, "rgba(23, 29, 28, 0.76)");
  ctx.fillStyle = "#e7d397";
  ctx.font = "800 14px 'Yu Gothic', sans-serif";
  ctx.fillText("今日の空気", x + 16, y + 30);

  if (phase !== "title" && phase !== "final") {
    const event = currentConversation();
    ctx.fillStyle = "#f8f2df";
    ctx.font = "900 15px 'Yu Gothic', sans-serif";
    ctx.fillText(phase === "incident" ? currentIncident.title : event.speaker, x + 16, y + 58);
    ctx.font = "700 12px 'Yu Gothic', sans-serif";
    ctx.fillStyle = "#d9c98d";
    drawText(phase === "incident" ? "突発: 判断が遅いほど誰かの表情が固まる" : `癖: ${event.trait}`, x + 16, y + 78, 306, 17);
    ctx.fillStyle = "#e7b0a5";
    drawText(phase === "incident" ? "地雷: 正論で片付けると接待ではなく監査になる" : `地雷: ${event.danger}`, x + 16, y + 114, 306, 17);
    if (phase !== "incident") {
      ctx.fillStyle = "#b9d6b0";
      drawText(`好み: ${event.likes} / ${event.favoredShot}`, x + 16, y + 148, 306, 17);
    }
  } else {
    ctx.fillStyle = "#d9c98d";
    ctx.font = "700 12px 'Yu Gothic', sans-serif";
    drawText("開始後、ここに同伴者の癖と接待メモが残る。", x + 16, y + 58, 306, 18);
  }

  ctx.fillStyle = "#f8f2df";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  const memoStart = phase !== "title" && phase !== "final" ? y + 178 : y + 96;
  memos.slice(0, 2).forEach((memo, index) => {
    drawText(`・${memo}`, x + 16, memoStart + index * 38, 306, 16);
  });
}

function drawBusinessCard(w: number, h: number) {
  const x = 22;
  const y = h - 210;
  drawPanel(x, y, Math.min(330, w - 44), 112, "rgba(248, 242, 223, 0.94)");
  ctx.fillStyle = "#1f2d27";
  ctx.font = "800 13px 'Yu Gothic', sans-serif";
  ctx.fillText("株式会社 東西総合ソリューション", x + 18, y + 30);
  ctx.font = "900 26px 'Yu Gothic', sans-serif";
  ctx.fillText("若手 社員", x + 18, y + 66);
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText("役割: 場を乱さず、少しだけ負ける", x + 18, y + 92);
}

function drawMainCopy(w: number, h: number) {
  const isGolfPhase = phase === "shot" || phase === "air" || phase === "result";
  const panelW = Math.min(760, w - 32);
  const x = (w - panelW) / 2;
  const y = phase === "title" ? h * 0.22 : Math.max(w < 760 ? 118 : 190, isGolfPhase ? h * 0.18 : h * 0.18);
  const panelH =
    phase === "title"
      ? 220
      : phase === "final"
        ? Math.min(390, h - y - 96)
        : phase === "conversation" && w >= 760
          ? 250
          : isGolfPhase
            ? 150
            : 210;
  drawPanel(x, y, panelW, panelH);

  ctx.fillStyle = "#f8f2df";
  if (phase === "title") {
    ctx.font = "900 56px Georgia, 'Yu Gothic', serif";
    ctx.textAlign = "center";
    ctx.fillText("Settai Golf", w / 2, y + 78);
    ctx.font = "700 18px 'Yu Gothic', sans-serif";
    ctx.fillStyle = "#e7d397";
    ctx.fillText("ゴルフが上手いだけでは勝てない", w / 2, y + 116);
    ctx.fillStyle = "#f8f2df";
    ctx.font = "700 15px 'Yu Gothic', sans-serif";
    ctx.fillText("微妙な差で負け、自然に褒め、月曜の席順を守れ。", w / 2, y + 158);
    ctx.textAlign = "left";
    return;
  }

  ctx.font = "800 15px 'Yu Gothic', sans-serif";
  ctx.fillStyle = "#e7d397";
  ctx.fillText(`HOLE ${hole} / ${maxHoles}`, x + 24, y + 34);

  ctx.fillStyle = "#f8f2df";
  ctx.font = "900 22px 'Yu Gothic', sans-serif";
  const title =
    phase === "conversation"
      ? `${currentConversation().speaker}`
      : phase === "incident"
        ? `事件: ${currentIncident.title}`
        : phase === "shot"
        ? stageName()
        : phase === "air"
          ? "空気読み"
          : phase === "result"
            ? "評価結果"
            : "最終人事評価";
  ctx.fillText(title, x + 24, y + 70);

  ctx.font = `700 ${isGolfPhase ? 16 : 18}px 'Yu Gothic', sans-serif`;
  const body =
    phase === "conversation"
      ? `「${currentConversation().line}」`
      : phase === "incident"
        ? currentIncident.line
        : selectedMessage;

  if (phase === "final") {
    ctx.fillStyle = "#e7d397";
    ctx.font = `900 ${w < 520 ? 24 : 34}px 'Yu Gothic', sans-serif`;
    ctx.fillText(finalTitle, x + 24, y + 116);
    ctx.fillStyle = "#f8f2df";
    ctx.font = "900 18px 'Yu Gothic', sans-serif";
    ctx.fillText(`接待指数 ${finalScore}`, x + 24, y + 150);
    ctx.font = "700 16px 'Yu Gothic', sans-serif";
    drawText(body, x + 24, y + 178, panelW - 48, 23);

    const detailY = y + 250;
    ctx.fillStyle = "#e7d397";
    ctx.font = "900 14px 'Yu Gothic', sans-serif";
    ctx.fillText("人事コメント詳細", x + 24, detailY);
    ctx.fillStyle = "#f8f2df";
    ctx.font = "700 13px 'Yu Gothic', sans-serif";
    finalDetails.forEach((detail, index) => {
      drawText(detail, x + 24, detailY + 26 + index * 34, panelW - 48, 17);
    });

    if (memos[1] && panelH > 350) {
      ctx.fillStyle = "#d9c98d";
      ctx.font = "700 12px 'Yu Gothic', sans-serif";
      ctx.fillText(`最終ログ: ${memos[1]}`, x + 24, y + panelH - 18);
    }
    return;
  }

  if (isGolfPhase) {
    drawTextLimited(body, x + 24, y + 92, panelW - 48, 20, phase === "shot" ? 1 : 2);
  } else if (phase === "conversation" && w >= 760) {
    const portraitX = x + panelW - 204;
    const portraitY = y + 26;
    drawPanel(portraitX, portraitY, 176, 198, "rgba(248, 242, 223, 0.92)");
    ctx.save();
    roundRect(portraitX + 10, portraitY + 10, 156, 132, 8);
    ctx.clip();
    drawImageCover(currentSpeakerImage(), portraitX + 10, portraitY + 10, 156, 132, 1);
    ctx.restore();
    ctx.fillStyle = "#1f2d27";
    ctx.font = "900 12px 'Yu Gothic', sans-serif";
    ctx.fillText("AI生成ポートレート", portraitX + 14, portraitY + 162);
    ctx.font = "700 11px 'Yu Gothic', sans-serif";
    ctx.fillText(currentConversation().likes, portraitX + 14, portraitY + 182);

    ctx.fillStyle = "#f8f2df";
    ctx.font = "700 18px 'Yu Gothic', sans-serif";
    drawText(body, x + 24, y + 112, panelW - 250, 30);
    ctx.fillStyle = "#d9c98d";
    ctx.font = "700 13px 'Yu Gothic', sans-serif";
    drawText(`空気プロファイル: ${currentConversation().trait}`, x + 24, y + 182, panelW - 250, 20);
  } else {
    drawText(body, x + 24, y + 112, panelW - 48, isGolfPhase ? 24 : 30);
  }

  if (phase === "shot") {
    ctx.fillStyle = "#e7d397";
    ctx.font = "700 14px 'Yu Gothic', sans-serif";
    ctx.fillText(
      `第${shotStage}打 / 残り${lastDistanceToPin}yd / 相手の好み: ${currentConversation().favoredShot}`,
      x + 24,
      y + panelH - 18
    );
  }

  if (isGolfPhase) {
    const noteY = y + panelH - 36;
    ctx.fillStyle = "#d9c98d";
    ctx.font = "800 12px 'Yu Gothic', sans-serif";
    ctx.fillText(`CADDIE: ${lastLie}から残り${lastDistanceToPin}yd。理想は上司と同じか+1打。`, x + 24, noteY);
    ctx.fillText(`CLUB: ${recommendedClub().name} / WIND: ${wind.label}`, x + panelW - 245, noteY);
  }

  if (phase === "result" && memos[0] && !isGolfPhase) {
    ctx.fillStyle = "#d9c98d";
    ctx.font = "700 13px 'Yu Gothic', sans-serif";
    ctx.fillText(`直近メモ: ${memos[0]}`, x + 24, y + 182);
  }
}

function drawShotMeter(w: number, h: number) {
  if (phase === "shot" && activeShot) {
    const meterW = Math.min(520, w - 48);
    const x = (w - meterW) / 2;
    const y = Math.max(520, h - 210);
    const timing = currentShotTiming();
    drawPanel(x, y, meterW, 108, "rgba(248, 242, 223, 0.92)");
    ctx.fillStyle = "#1f2d27";
    ctx.font = "900 15px 'Yu Gothic', sans-serif";
    ctx.fillText(`${stageName()} 接待タイミング`, x + 18, y + 28);
    ctx.font = "700 12px 'Yu Gothic', sans-serif";
    ctx.fillText("左: 演技臭い / 中央: 接待ゾーン / 右: 勝ちすぎ", x + 18, y + 50);

    const barX = x + 24;
    const barY = y + 70;
    const barW = meterW - 48;
    roundRect(barX, barY, barW, 16, 8);
    ctx.fillStyle = "#d5c48a";
    ctx.fill();

    roundRect(barX + barW * 0.82, barY, barW * 0.16, 16, 8);
    ctx.fillStyle = "#b94c42";
    ctx.fill();

    roundRect(barX + barW * (shotTarget - 0.07), barY - 3, barW * 0.14, 22, 8);
    ctx.fillStyle = "#4f8f58";
    ctx.fill();

    const needleX = barX + barW * timing;
    ctx.strokeStyle = "#18241e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(needleX, barY - 12);
    ctx.lineTo(needleX, barY + 30);
    ctx.stroke();
    ctx.fillStyle = "#1f2d27";
    ctx.font = "900 12px 'Yu Gothic', sans-serif";
    ctx.fillText(`${Math.round(timing * 100)}%`, Math.min(barX + barW - 34, Math.max(barX, needleX - 14)), barY + 48);
    return;
  }

  if (phase !== "air" && phase !== "result") return;
  const x = Math.max(24, w * 0.5 - 190);
  const y = Math.max(520, h - 180);
  drawPanel(x, y, 380, 78, "rgba(248, 242, 223, 0.9)");
  ctx.fillStyle = "#1f2d27";
  ctx.font = "800 13px 'Yu Gothic', sans-serif";
  ctx.fillText("ホール結果", x + 18, y + 26);
  ctx.font = "900 22px 'Yu Gothic', sans-serif";
  const sign = lastScoreDiff > 0 ? "+" : "";
  ctx.fillText(`${strokeCount}打 (${sign}${lastScoreDiff})`, x + 18, y + 58);
  ctx.fillStyle = lastScoreDiff < 0 ? "#b44238" : lastScoreDiff > 2 ? "#8750a1" : "#457a45";
  roundRect(x + 138, y + 38, 214, 12, 6);
  ctx.fill();
  ctx.fillStyle = "#1f2d27";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText("狙い目: 上司と同じか+1打", x + 198, y + 27);
}

function draw() {
  animationTime += 0.016;
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);
  drawBackground(w, h);
  drawGolfCourse(w, h);
  drawReactionStage(w, h);
  drawAirMemo(w, h);
  drawBusinessCard(w, h);
  drawStats(w);
  drawMainCopy(w, h);
  drawShotMeter(w, h);

  ctx.fillStyle = "rgba(5, 10, 8, 0.45)";
  ctx.fillRect(0, h - 72, w, 72);
  ctx.fillStyle = "#d9c98d";
  ctx.font = "700 12px 'Yu Gothic', sans-serif";
  ctx.fillText("クラブハウス内BGM: 妙に高級な生成ジャズ / 本日の目的: スコアではなく空気", 18, h - 28);

  requestAnimationFrame(draw);
}

window.addEventListener("resize", resize);
resize();
showTitle();
requestAnimationFrame(draw);
