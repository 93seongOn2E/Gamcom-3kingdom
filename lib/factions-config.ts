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
  영객: {
    jobs: ["영객", "하후돈", "조자룡", "감녕"],
    badgeClass: "bg-[#6d28d9]/30 text-[#ede9fe] ring-[#a78bfa]/34"
  },
  "패왕 + 창수": {
    jobs: ["패왕", "창수", "장료", "전위", "관우", "장비", "여몽", "태사자"],
    badgeClass: "bg-[#172554]/38 text-[#bfdbfe] ring-[#3b82f6]/28"
  },
  책사: {
    jobs: ["책사", "사마의", "제갈량", "주유"],
    badgeClass: "bg-[#9a3412]/32 text-[#fed7aa] ring-[#fb923c]/30"
  }
} as const;

export function getHiddenJobBadge(job: string | null) {
  if (!job) {
    return null;
  }

  for (const [label, config] of Object.entries(hiddenJobConfig)) {
    if ((config.jobs as readonly string[]).includes(job)) {
      return {
        label,
        className: config.badgeClass
      };
    }
  }

  return null;
}
