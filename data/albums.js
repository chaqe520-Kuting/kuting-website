/*
 * 活動相簿資料
 * ------------------------------------------------------------
 * 新增一本相簿：
 *   1. 在 images 資料夾裡新增一個資料夾（例如 images/2027-yufo），把照片放進去。
 *      照片建議先縮小到寬 1600 像素左右、每張 1 MB 以內，網頁會開得比較快。
 *   2. 複製下面任一個 { ... }, 區塊，修改內容：
 *
 *   id      相簿代號，只能用英文、數字和減號，例如 "2027-yufo"（必填，不可重複）
 *   title   相簿名稱
 *   date    活動日期，格式「年-月-日」
 *   cover   封面照片的位置
 *   description 簡短說明
 *   photos  照片清單，每張寫 { src: "照片位置", caption: "說明文字" }
 *   sample  true 代表範例資料，網頁上會標示「範例」；換成真實資料後請刪掉這一行
 *
 * 影片建議上傳到 YouTube（可設為「不公開」只給知道網址的人看），
 * 再把影片網址貼到下面 VIDEOS 清單的 youtube 欄位，網站會自動嵌入播放。
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
 * 影片清單
 *   youtube  YouTube 影片網址，例如 "https://www.youtube.com/watch?v=xxxxxxxxxxx"
 *   file     或者放在網站裡的影片檔位置（不建議，檔案大會讓網站變慢）
 *   兩者都沒填時，會顯示「影片準備中」。
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
