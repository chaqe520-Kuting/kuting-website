/*
 * 法會行事曆資料
 * ------------------------------------------------------------
 * 新增一場法會：複製下面任一個 { ... }, 區塊，貼在清單裡，再修改內容。
 *
 *   date        國曆日期，格式「年-月-日」，例如 "2027-02-07"（必填）
 *   endDate     多日法會的最後一天（可不填）
 *   title       法會名稱（必填）
 *   time        時間，例如 "上午 9:00 – 下午 4:00"
 *   place       地點，例如 "大殿"
 *   description 簡短說明
 *   sample      true 代表這是範例資料，網頁上會標示「範例」；換成真實資料後請刪掉這一行
 *
 * 農曆日期會由網站自動換算顯示，不需要另外填寫。
 * 目前所有內容皆為範例，日期依農曆節日推算，實際日期請依古亭院公告修改。
 */
window.EVENTS = [
  {
    date: "2026-10-28",
    title: "觀世音菩薩出家紀念日 祈福法會",
    time: "上午 9:00 – 11:30",
    place: "大殿",
    description: "恭誦〈普門品〉、大悲咒，祈願眾生離苦得樂。",
    sample: true
  },
  {
    date: "2026-11-08",
    title: "藥師琉璃光如來聖誕 消災延壽法會",
    time: "上午 9:00 – 下午 4:00",
    place: "大殿",
    description: "禮拜藥師懺，為家人祈求身心安康、消災延壽。",
    sample: true
  },
  {
    date: "2026-12-25",
    title: "阿彌陀佛聖誕 佛七",
    endDate: "2026-12-31",
    time: "每日 上午 8:00 – 下午 5:00",
    place: "大殿",
    description: "七日精進念佛共修，歡迎全程或隨喜參加。",
    sample: true
  },
  {
    date: "2027-01-15",
    title: "釋迦牟尼佛成道日 臘八粥結緣",
    time: "上午 9:00 起",
    place: "大殿、齋堂",
    description: "上午誦經祈福，備有臘八粥與大眾結緣。",
    sample: true
  },
  {
    date: "2027-02-07",
    title: "新春禮佛 祈福法會",
    endDate: "2027-02-09",
    time: "上午 8:00 – 下午 5:00",
    place: "大殿",
    description: "大年初一至初三開放禮佛、點燈祈福，祝福大眾新春吉祥。",
    sample: true
  },
  {
    date: "2027-02-21",
    title: "元宵 光明燈祈福法會",
    time: "晚上 7:00 – 9:00",
    place: "大殿",
    description: "點亮光明燈，祈願一年平安順遂。",
    sample: true
  },
  {
    date: "2027-03-26",
    title: "觀世音菩薩聖誕 祝壽法會",
    time: "上午 9:00 – 下午 4:00",
    place: "大殿",
    description: "恭祝觀音菩薩聖誕，禮拜大悲懺。",
    sample: true
  },
  {
    date: "2027-05-13",
    title: "浴佛節 慶祝佛誕法會",
    time: "上午 9:00 – 中午 12:00",
    place: "大殿前廣場",
    description: "恭迎佛誕，大眾以香湯沐浴太子像，洗滌身心塵垢。",
    sample: true
  },
  {
    date: "2027-07-22",
    title: "觀世音菩薩成道紀念日 祈福法會",
    time: "上午 9:00 – 11:30",
    place: "大殿",
    sample: true
  },
  {
    date: "2027-08-16",
    title: "中元 盂蘭盆超薦法會",
    endDate: "2027-08-18",
    time: "上午 8:00 – 下午 5:00",
    place: "大殿",
    description: "報答父母恩德，超薦歷代祖先、冤親債主。報名請洽服務處。",
    sample: true
  },
  {
    date: "2027-08-31",
    title: "地藏菩薩聖誕 法會",
    time: "上午 9:00 – 下午 4:00",
    place: "大殿",
    description: "禮拜地藏懺，迴向法界眾生。",
    sample: true
  },
  {
    date: "2027-10-18",
    title: "觀世音菩薩出家紀念日 祈福法會",
    time: "上午 9:00 – 11:30",
    place: "大殿",
    sample: true
  },
  {
    date: "2027-12-14",
    title: "阿彌陀佛聖誕 念佛法會",
    time: "上午 9:00 – 下午 4:00",
    place: "大殿",
    sample: true
  }
];

/*
 * 每月例行共修（依農曆自動排入行事曆）
 *   lunarDays  農曆日子，例如 [1, 15] 代表每月初一、十五
 *   若當天已有上面的大型法會，就不會重複顯示。
 *   不需要例行共修時，把整段改成 window.REGULAR_EVENTS = []; 即可。
 */
window.REGULAR_EVENTS = [
  {
    lunarDays: [1, 15],
    title: "朔望共修 誦經祈福",
    time: "上午 9:00 – 11:00",
    place: "大殿",
    description: "每月農曆初一、十五誦經共修，歡迎隨喜參加。",
    sample: true
  }
];
