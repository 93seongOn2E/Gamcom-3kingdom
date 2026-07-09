import Image from "next/image";

const statScoreMap = {
  "매우낮음": 1,
  "낮음": 2,
  "보통": 3,
  "높음": 4,
  "매우높음": 5,
  "매우느림": 1,
  "느림": 2,
  "빠름": 4,
  "매우빠름": 5
} as const;

type StatLabel = keyof typeof statScoreMap;

type JobVariant = {
  name: string;
  weaponName: string;
  weaponType: string;
  icon: string;
  stats: {
    공격력: StatLabel;
    체력: StatLabel;
    속도: StatLabel;
    쿨타임: StatLabel;
  };
};

type JobGroup = {
  title: string;
  role: string;
  id: string;
  description: string;
  variants: JobVariant[];
};

const jobGroups: JobGroup[] = [
  {
    title: "영객",
    role: "도적",
    id: "job-yeonggaek",
    description: "낮은 체력을 빠른 속도와 짧은 쿨타임으로 보완하는 암살형 직업군입니다. 순간 진입과 빠른 교전에 강합니다.",
    variants: [
      {
        name: "야운",
        weaponName: "음풍검",
        weaponType: "단검",
        icon: "/assets/icons/weapons/eumpung-sword.webp",
        stats: { 공격력: "높음", 체력: "매우낮음", 속도: "빠름", 쿨타임: "매우빠름" }
      },
      {
        name: "적령",
        weaponName: "혈영도",
        weaponType: "단검",
        icon: "/assets/icons/weapons/hyeolyeong-blade.webp",
        stats: { 공격력: "매우높음", 체력: "매우낮음", 속도: "매우빠름", 쿨타임: "빠름" }
      }
    ]
  },
  {
    title: "패월",
    role: "전사",
    id: "job-paewol",
    description: "높은 공격력과 체력을 바탕으로 전면 교전을 담당하는 근접 직업군입니다. 무기에 따라 연속 공격과 한 방 위력이 갈립니다.",
    variants: [
      {
        name: "노월",
        weaponName: "참월검",
        weaponType: "쌍검",
        icon: "/assets/icons/weapons/chamwol-twin-sword.webp",
        stats: { 공격력: "높음", 체력: "높음", 속도: "느림", 쿨타임: "빠름" }
      },
      {
        name: "천강",
        weaponName: "벽천검",
        weaponType: "대검",
        icon: "/assets/icons/weapons/byeokcheon-greatsword.webp",
        stats: { 공격력: "매우높음", 체력: "높음", 속도: "느림", 쿨타임: "느림" }
      }
    ]
  },
  {
    title: "창수",
    role: "창",
    id: "job-changsu",
    description: "느린 대신 높은 생존력과 긴 사거리를 활용하는 압박형 직업군입니다. 전선 유지와 거점 싸움에 어울립니다.",
    variants: [
      {
        name: "창화",
        weaponName: "비화창",
        weaponType: "창",
        icon: "/assets/icons/weapons/bihwa-spear.webp",
        stats: { 공격력: "낮음", 체력: "매우높음", 속도: "매우느림", 쿨타임: "매우느림" }
      },
      {
        name: "룡격",
        weaponName: "창룡극",
        weaponType: "창",
        icon: "/assets/icons/weapons/changryong-polearm.webp",
        stats: { 공격력: "보통", 체력: "높음", 속도: "매우느림", 쿨타임: "매우느림" }
      }
    ]
  },
  {
    title: "책사",
    role: "부채",
    id: "job-chaeksa",
    description: "낮은 직접 전투력을 빠른 쿨타임과 전술 운용으로 보완하는 보조형 직업군입니다. 흐름을 만들고 교전을 설계합니다.",
    variants: [
      {
        name: "운책",
        weaponName: "지모선",
        weaponType: "부채",
        icon: "/assets/icons/weapons/jimun-fan.webp",
        stats: { 공격력: "매우낮음", 체력: "보통", 속도: "느림", 쿨타임: "매우빠름" }
      },
      {
        name: "지명",
        weaponName: "휘운선",
        weaponType: "부채",
        icon: "/assets/icons/weapons/hwiun-feather-fan.webp",
        stats: { 공격력: "매우낮음", 체력: "낮음", 속도: "빠름", 쿨타임: "매우빠름" }
      }
    ]
  },
  {
    title: "궁장",
    role: "활",
    id: "job-gungjang",
    description: "낮은 체력을 거리 조절로 보완하는 원거리 직업군입니다. 안정적인 견제와 후방 지원에 강점을 가집니다.",
    variants: [
      {
        name: "백현",
        weaponName: "백영궁",
        weaponType: "장궁",
        icon: "/assets/icons/weapons/baegyeong-bow.webp",
        stats: { 공격력: "보통", 체력: "매우낮음", 속도: "느림", 쿨타임: "느림" }
      },
      {
        name: "운시",
        weaponName: "유운궁",
        weaponType: "단궁",
        icon: "/assets/icons/weapons/yuun-bow.webp",
        stats: { 공격력: "낮음", 체력: "낮음", 속도: "느림", 쿨타임: "보통" }
      }
    ]
  }
];

type HiddenJobGroup = {
  kingdom: "촉나라" | "위나라" | "오나라";
  accent: string;
  entries: {
    role: string;
    names: string[];
    highlight?: boolean;
  }[];
};

const hiddenJobGroups: HiddenJobGroup[] = [
  {
    kingdom: "위나라",
    accent: "bg-sky-400",
    entries: [
      { role: "군주", names: ["조조"], highlight: true },
      { role: "영객", names: ["하후돈"] },
      { role: "패월 + 창수", names: ["장료", "전위"] },
      { role: "책사", names: ["사마의"] }
    ]
  },
  {
    kingdom: "촉나라",
    accent: "bg-emerald-400",
    entries: [
      { role: "군주", names: ["유비"], highlight: true },
      { role: "영객", names: ["조자룡"] },
      { role: "패월 + 창수", names: ["관우", "장비"] },
      { role: "책사", names: ["제갈량"] }
    ]
  },
  {
    kingdom: "오나라",
    accent: "bg-red-400",
    entries: [
      { role: "군주", names: ["손권"], highlight: true },
      { role: "영객", names: ["감녕"] },
      { role: "패월 + 창수", names: ["여몽", "태사자"] },
      { role: "책사", names: ["주유"] }
    ]
  }
];

function hiddenRoleBadgeClass(role: string, highlight?: boolean) {
  if (highlight) {
    return "bg-[#d4a017]/24 text-[#ffe0a3] ring-1 ring-[#d4a756]/40";
  }

  if (role === "영객") {
    return "bg-[#7c2d12]/34 text-[#ffc7a8] ring-1 ring-[#fb923c]/24";
  }

  if (role === "패월 + 창수") {
    return "bg-[#14532d]/34 text-[#bbf7d0] ring-1 ring-[#4ade80]/22";
  }

  if (role === "책사") {
    return "bg-[#1e3a8a]/34 text-[#bfdbfe] ring-1 ring-[#60a5fa]/22";
  }

  return "bg-[#17324d]/60 text-[#d8e9ff] ring-1 ring-white/10";
}

function hiddenRoleHref(role: string) {
  if (role === "영객") {
    return "#job-yeonggaek";
  }

  if (role === "패월 + 창수") {
    return "#job-paewol-changsu";
  }

  if (role === "책사") {
    return "#job-chaeksa";
  }

  return undefined;
}

function StatMeter({ label, value }: { label: keyof JobVariant["stats"]; value: StatLabel }) {
  const score = statScoreMap[value];

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-black text-[#dbc292]">{label}</span>
        <span className="text-[12px] font-extrabold text-[#f3e7d0]">{value}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5" aria-label={`${label} ${value}`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={`h-2.5 rounded-sm border ${
              index < score
                ? "border-[#f0c98b]/70 bg-gradient-to-r from-[#c79235] to-[#ffe1a0] shadow-[0_0_10px_rgba(212,167,86,0.22)]"
                : "border-white/10 bg-white/[0.045]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 font-['Noto_Sans_KR','Malgun_Gothic',sans-serif]">
      <section className="pixel-frame overflow-hidden p-6 md:p-8">
        <h1 className="text-3xl font-black tracking-[-0.02em] text-[#f3e7d0]">직업소개</h1>
        <p className="mt-3 max-w-5xl text-sm font-semibold leading-7 text-[#aa9a82]">
          삼국지 RPG 직업별 무기와 운영진이 공개한 능력치 지표를 한눈에 확인할 수 있습니다. 무기 이미지는 AI로 제작된 참고 이미지입니다.
        </p>
      </section>

      <section className="pixel-frame mt-6 overflow-hidden">
        <div className="border-b border-[var(--border)] px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-[#f3e7d0]">히든 직업</h2>
            </div>
            <p className="max-w-3xl text-sm font-semibold leading-7 text-[#aa9a82]">
              히든 직업은 각 나라별 주요 인물에게 배정된 특수 직업 정보입니다. 군주는 별도 직업군이 정해지지 않은 군주 전용 포지션입니다.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-3">
          {hiddenJobGroups.map((group) => (
            <article
              key={group.kingdom}
              className="relative overflow-hidden rounded-xl border border-[rgba(212,167,86,0.26)] bg-[radial-gradient(circle_at_top,rgba(212,167,86,0.16),transparent_34%),linear-gradient(145deg,rgba(0,0,0,0.84),rgba(28,23,15,0.82))] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.32)]"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f0c98b]/60 to-transparent" />
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${group.accent} shadow-[0_0_18px_rgba(245,211,143,0.34)]`} />
                  <div>
                    <h3 className="text-2xl font-black text-[#f3e7d0]">{group.kingdom}</h3>
                  </div>
                </div>
                <span className="rounded-full bg-black/36 px-3 py-1 text-xs font-black text-[#f0c98b] ring-1 ring-[#d4a756]/30">
                  특수 배정
                </span>
              </div>

              <div className="grid gap-3">
                {group.entries.map((entry) => (
                  <a
                    key={entry.role}
                    href={hiddenRoleHref(entry.role)}
                    aria-disabled={!hiddenRoleHref(entry.role)}
                    className={`rounded-lg border px-3.5 py-3.5 transition ${
                      entry.highlight
                        ? "border-[#d4a756]/40 bg-[#d4a017]/12 shadow-[inset_0_1px_0_rgba(255,231,180,0.08)]"
                        : "border-white/8 bg-black/24"
                    } ${
                      hiddenRoleHref(entry.role)
                        ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#d4a756]/42 hover:bg-white/[0.055] focus:outline-none focus:ring-2 focus:ring-[#f0c98b]/36"
                        : "pointer-events-none"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-black ${hiddenRoleBadgeClass(entry.role, entry.highlight)}`}>
                        {entry.role}
                      </span>
                      <div className="flex min-w-0 flex-wrap justify-end gap-2">
                        {entry.names.map((name) => (
                          <span
                            key={name}
                            className={`rounded-md px-3 py-1.5 text-sm font-black ring-1 ${
                              entry.highlight
                                ? "bg-[#d4a017]/16 text-[#ffe0a3] ring-[#d4a756]/26"
                                : "bg-white/[0.055] text-[#f3e7d0] ring-white/8"
                            }`}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6">
        {jobGroups.map((group) => (
          <div key={group.title} className="contents">
            <section id={group.id} className="scroll-mt-24 pixel-frame overflow-hidden">
              <div className="border-b border-[var(--border)] px-5 py-5 md:px-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="mb-1 text-xs font-black tracking-[0.18em] text-[#d4a756]">{group.role}</p>
                    <h2 className="text-2xl font-black text-[#f3e7d0]">{group.title}</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold leading-7 text-[#aa9a82]">{group.description}</p>
              </div>

              {group.id === "job-paewol" ? <div id="job-paewol-changsu" className="-mt-[18px] scroll-mt-35" /> : null}

              <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
                {group.variants.map((job) => (
                  <article key={job.name} className="grid gap-4 rounded-xl border border-[rgba(212,167,86,0.18)] bg-black/26 p-4 md:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]">
                    <div className="flex h-full items-stretch">
                      <div className="relative min-h-[220px] w-full overflow-hidden rounded-xl border border-[rgba(212,167,86,0.28)] bg-black shadow-[0_18px_36px_rgba(0,0,0,0.35)] sm:min-h-[260px] md:min-h-full">
                        <Image src={job.icon} alt={`${job.weaponName} 아이콘`} fill sizes="(min-width: 768px) 220px, 100vw" className="object-cover" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-[#f3e7d0]">{job.name}</h3>
                        <span className="rounded-full bg-[#d4a017]/14 px-2.5 py-1 text-[12px] font-black text-[#f0c98b] ring-1 ring-[#d4a756]/28">
                          {job.weaponName} · {job.weaponType}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {Object.entries(job.stats).map(([label, value]) => (
                          <StatMeter key={label} label={label as keyof JobVariant["stats"]} value={value} />
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
