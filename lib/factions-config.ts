export const nationConfigs = [
  {
    key: "위나라",
    short: "위",
    color: "#2f73c8",
    description: "조경훈의 버인협회를 중심으로, 박재박의 버블란과 로기다의 로스타시티라는 변수를 품은 전통의 강호 세력"
  },
  {
    key: "촉나라",
    short: "촉",
    color: "#2f9b5f",
    description: "감스트의 버컴퍼니의 자본력과 꾸티뉴의 꾸한성의 피지컬이 결집된 공격적인 신흥 세력"
  },
  {
    key: "오나라",
    short: "오",
    color: "#d63d35",
    description: "지피티의 지력사무소, 홍타쿠의 홍피스, 가습기의 가무소 연합으로 균형감 있게 버티는 연합 세력"
  }
] as const;

export const crewBadgeClassMap: Record<string, string> = {
  "버인협회": "bg-[#9fd2ff]/28 text-[#eef7ff] ring-[#9fd2ff]/50",
  "로스타시티": "bg-[#5a8dff]/24 text-[#e6eeff] ring-[#5a8dff]/48",
  "버블란": "bg-[#244fba]/24 text-[#dbe6ff] ring-[#244fba]/48",

  "버컴퍼니": "bg-[#a8efc8]/28 text-[#effff5] ring-[#a8efc8]/50",
  "꾸한성": "bg-[#2fae63]/24 text-[#e1ffec] ring-[#2fae63]/48",

  "지력사무소": "bg-[#ffc1c1]/28 text-[#fff1f1] ring-[#ffc1c1]/50",
  "가무소": "bg-[#ff8f8f]/24 text-[#fff0f0] ring-[#ff8f8f]/48",
  "홍피스": "bg-[#e04444]/24 text-[#ffe4e4] ring-[#e04444]/48"
};

export const hiddenJobConfig = {
  군주: {
    jobs: ["조조", "유비", "손권"],
    badgeClass: "bg-[#d4a017]/24 text-[#ffe0a3] ring-[#d4a756]/40"
  },
  "히든 영객": {
    jobs: ["하후돈", "조자룡", "감녕"],
    badgeClass: "bg-[#581c87]/42 text-[#f5d0fe] ring-[#d946ef]/34",
    prefix: "✦"
  },
  "히든 패왕+창수": {
    jobs: ["장료", "전위", "관우", "장비", "여몽", "태사자"],
    badgeClass: "bg-[#1e3a2f]/44 text-[#d9f99d] ring-[#84cc16]/32",
    prefix: "✦"
  },
  "히든 책사": {
    jobs: ["사마의", "제갈량", "주유"],
    badgeClass: "bg-[#7c2d12]/42 text-[#fed7aa] ring-[#fb923c]/34",
    prefix: "✦"
  },
  영객: {
    jobs: ["영객", "야운", "적령"],
    badgeClass: "bg-[#6d28d9]/30 text-[#ede9fe] ring-[#a78bfa]/34"
  },
  패왕: {
    jobs: ["패왕", "패월", "노월", "천강"],
    badgeClass: "bg-[#172554]/38 text-[#bfdbfe] ring-[#3b82f6]/28"
  },
  창수: {
    jobs: ["창수", "창화", "룡격"],
    badgeClass: "bg-[#14532d]/34 text-[#bbf7d0] ring-[#4ade80]/22"
  },
  궁장: {
    jobs: ["궁장", "백현", "운시"],
    badgeClass: "bg-[#0f766e]/30 text-[#ccfbf1] ring-[#2dd4bf]/28"
  },
  책사: {
    jobs: ["책사", "운책", "지명"],
    badgeClass: "bg-[#9a3412]/32 text-[#fed7aa] ring-[#fb923c]/30"
  }
} as const;

export const hiddenJobNames = [
  ...hiddenJobConfig["히든 영객"].jobs,
  ...hiddenJobConfig["히든 패왕+창수"].jobs,
  ...hiddenJobConfig["히든 책사"].jobs
];

export const baseJobOptions = [
  { value: "야운", group: "영객" },
  { value: "적령", group: "영객" },
  { value: "노월", group: "패왕" },
  { value: "천강", group: "패왕" },
  { value: "창화", group: "창수" },
  { value: "룡격", group: "창수" },
  { value: "운책", group: "책사" },
  { value: "지명", group: "책사" },
  { value: "백현", group: "궁장" },
  { value: "운시", group: "궁장" }
] as const;

export const hiddenJobOptionsByNation: Record<string, string[]> = {
  위나라: ["하후돈", "장료", "전위", "사마의"],
  촉나라: ["조자룡", "관우", "장비", "제갈량"],
  오나라: ["감녕", "여몽", "태사자", "주유"]
};

export function formatJobDisplayName(job: string | null) {
  if (!job) {
    return "-";
  }

  const baseJob = baseJobOptions.find((option) => option.value === job);
  return baseJob ? `${baseJob.group}-${job}` : job;
}

export function getHiddenJobBadge(job: string | null) {
  if (!job) {
    return null;
  }

  for (const [label, config] of Object.entries(hiddenJobConfig)) {
    if ((config.jobs as readonly string[]).includes(job)) {
      return {
        label,
        className: config.badgeClass,
        prefix: "prefix" in config ? config.prefix : ""
      };
    }
  }

  return null;
}
