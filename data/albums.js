/*
 * 活動相簿資料
 * ------------------------------------------------------------
 * 法會照片不用改這個檔案：
 *   直接把照片上傳到「相簿」資料夾裡，用「日期 法會名稱」當資料夾名稱，
 *   例如「相簿/2027-02-13 玉皇大帝聖誕」，網站會自動縮小照片、建立相簿。
 *   詳細步驟請看「相簿」資料夾裡的「使用說明.txt」。
 *
 * 下面的 ALBUMS 是範例相簿，有真實相簿後網站會自動隱藏，也可以整段刪掉。
 */
window.ALBUMS = [
  {
    id: "2026-ullambana",
    title: "中元盂蘭盆超薦法會",
    date: "2026-08-27",
    cover: "images/sample/chant.svg",
    description: "大眾虔誠誦經，報答父母恩德，超薦歷代祖先。",
    sample: true,
    photos: [
      { src: "images/sample/chant.svg", caption: "大眾誦經" },
      { src: "images/sample/hall.svg", caption: "大殿莊嚴" },
      { src: "images/sample/incense.svg", caption: "信眾上香" },
      { src: "images/sample/flower.svg", caption: "佛前供花" }
    ]
  },
  {
    id: "2026-yufo",
    title: "浴佛節 慶祝佛誕法會",
    date: "2026-05-24",
    cover: "images/sample/bath.svg",
    description: "恭迎佛誕，大眾以香湯沐浴太子像。",
    sample: true,
    photos: [
      { src: "images/sample/bath.svg", caption: "浴佛儀式" },
      { src: "images/sample/flower.svg", caption: "花亭布置" },
      { src: "images/sample/garden.svg", caption: "院景" }
    ]
  },
  {
    id: "2026-newyear",
    title: "新春禮佛祈福",
    date: "2026-02-17",
    cover: "images/sample/newyear.svg",
    description: "新春開放禮佛、點燈祈福。",
    sample: true,
    photos: [
      { src: "images/sample/newyear.svg", caption: "新春祈福" },
      { src: "images/sample/lamp.svg", caption: "光明燈" },
      { src: "images/sample/porridge.svg", caption: "結緣點心" },
      { src: "images/sample/hall.svg", caption: "大殿" }
    ]
  }
];

/*
 * YouTube 影片
 *   貼「頻道網址」：網站自動播放頻道裡的全部影片，上傳時不用再加播放清單。
 *     例如 "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx"
 *   也可以貼「播放清單網址」：只播放清單裡的影片。
 *     例如 "https://www.youtube.com/playlist?list=PLxxxxxxxxxxxx"
 */
window.VIDEO_PLAYLIST = "https://www.youtube.com/playlist?list=PLBS8vMNMpxMo";

/*
 * 個別影片清單（有播放清單的話可以不填）
 *   youtube  YouTube 影片網址，例如 "https://www.youtube.com/watch?v=xxxxxxxxxxx"
 *   file     或者放在網站裡的影片檔位置（不建議，檔案大會讓網站變慢）
 *   兩者都沒填時，會顯示「影片準備中」。
 *   下面是範例，有真實影片或播放清單後會自動隱藏。
 */
window.VIDEOS = [
  {
    title: "浴佛節法會 精華片段",
    date: "2026-05-24",
    youtube: "",
    description: "（範例）影片上傳到 YouTube 後，把網址貼到這裡即可。",
    sample: true
  },
  {
    title: "中元法會 誦經實況",
    date: "2026-08-27",
    youtube: "",
    sample: true
  }
];
