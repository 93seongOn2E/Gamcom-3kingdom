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
  description: string;
  variants: JobVariant[];
};

const jobGroups: JobGroup[] = [
  {
    title: "영객",
    role: "도적",
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
        <p className="mb-2 text-xs font-black tracking-[0.24em] text-[var(--accent)]">JOB GUIDE</p>
        <h1 className="text-3xl font-black tracking-[-0.02em] text-[#f3e7d0]">직업소개</h1>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-[#aa9a82]">
          삼국지 RPG 직업별 무기와 능력치를 한눈에 확인할 수 있습니다. 능력치는 상대적인 기준으로 정리된 참고용 정보입니다.
        </p>
      </section>

      <div className="mt-6 grid gap-6">
        {jobGroups.map((group) => (
          <section key={group.title} className="pixel-frame overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="mb-1 text-xs font-black tracking-[0.18em] text-[#d4a756]">{group.role}</p>
                  <h2 className="text-2xl font-black text-[#f3e7d0]">{group.title}</h2>
                </div>
                <span className="rounded-full border border-[rgba(212,167,86,0.28)] bg-[#d4a017]/10 px-3 py-1 text-xs font-black text-[#f0c98b]">
                  {group.variants.length}개 무기
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#aa9a82]">{group.description}</p>
            </div>

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
        ))}
      </div>
    </div>
  );
}
