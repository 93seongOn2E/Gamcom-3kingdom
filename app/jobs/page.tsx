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
  skills: SkillInfo[];
};

type SkillInfo = {
  name: string;
  description: string;
  controlEffects?: string[];
};

type HiddenSkillProfile = {
  kingdom: "위나라" | "촉나라" | "오나라";
  name: string;
  role: string;
  skills: SkillInfo[];
};

const jobGroups: JobGroup[] = [
  {
    title: "영객",
    role: "도적",
    id: "job-yeonggaek",
    description: "낮은 체력을 빠른 속도와 짧은 쿨타임으로 보완하는 암살형 직업군입니다. 순간 진입과 빠른 교전에 강합니다.",
    skills: [
      { name: "월영참", description: "검을 반달 모양으로 크게 휘둘러, 닿는 범위의 적을 한 번에 베어냅니다." },
      { name: "일도", description: "번개처럼 짧은 순간에 파고들어, 적의 급소를 정확히 타격합니다." },
      { name: "암영표", description: "그림자 속에서 비도를 던져 적에게 피해를 입히고 움직임을 무디게 만듭니다.", controlEffects: ["둔화"] },
      { name: "영격수", description: "그림자를 밟듯 순식간에 거리를 좁혀, 적에게 치명타를 입힙니다." },
      { name: "난영참", description: "주변 적을 빠르게 여러 번 베어냅니다." },
      { name: "극야일섬", description: "노려본 대상을 꿰뚫듯 돌진해 그 자리에 묶어두고 주변의 적에게도 함께 피해를 입힙니다.", controlEffects: ["속박"] }
    ],
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
    skills: [
      { name: "열강참", description: "대검을 크게 휘둘러 전방의 적을 강하게 베어냅니다." },
      { name: "일진쇄갑", description: "검을 앞으로 겨눈 채 빠르게 돌진하여, 부딪힌 적을 밀쳐냅니다.", controlEffects: ["넉백"] },
      { name: "파쇄참", description: "무기를 머리 위로 들어 올린 후, 그대로 바닥에 내리찍어 강한 충격을 퍼뜨립니다." },
      { name: "수호격", description: "창대를 휘둘러 두 번 연달아 공격하고, 적중한 타격 수에 따라 보호막을 얻습니다." },
      { name: "열풍연참", description: "바람을 가르듯 세 번 연속 사선으로 베어냅니다." },
      { name: "천패강림", description: "기를 한곳에 집중해 응축한 뒤, 전방의 적에게 빠르게 연속 공격하여 총 3회에 걸쳐 피해를 줍니다." }
    ],
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
    skills: [
      { name: "수호천", description: "창을 앞으로 곧게 뻗어, 닿는 자리의 적을 꿰뚫듯 관통하며 공격합니다." },
      { name: "호신철갑", description: "방패를 겸한 창대를 앞으로 밀어붙여, 부딪힌 적을 짧게 기절시키고 뒤로 밀쳐냅니다.", controlEffects: ["스턴", "넉백"] },
      { name: "속박관창", description: "창을 깊이 찔러 넣은 뒤, 찌른 지점부터 부채꼴로 충격파를 퍼뜨려 맞은 적을 둔화시킵니다.", controlEffects: ["둔화"] },
      { name: "격통파", description: "창끝을 지면에 세게 내리찍어, 갈라진 땅을 따라 전방으로 긴 파동을 보내 피해를 줍니다." },
      { name: "철옹성", description: "거대한 수호 진형을 펼쳐, 일정 시간 동안 자신과 주변 아군이 받는 피해를 대폭 줄여줍니다." },
      { name: "천창격", description: "하늘 높이 떠올라 창을 내리찍고, 그 주변에 넓은 범위의 파동을 일으켜 적을 끌어당깁니다.", controlEffects: ["끌어당김"] }
    ],
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
    skills: [
      { name: "생사풍", description: "대상을 지정하여 사용하며, 아군에게 사용 시 회복 효과를 부여하고 적에게 사용 시 피해를 입힙니다." },
      { name: "혜광일선", description: "부채 끝에서 밝은 빛줄기가 곧게 뻗어나갑니다. 적에게 닿으면 피해를 입히고, 아군에게 닿으면 보호막을 씌웁니다." },
      { name: "유운수호진", description: "주변 원형 범위에 구름의 기운을 모아, 범위 내 플레이어 수에 비례하여 아군을 회복시키고 적군에게는 피해를 입힙니다." },
      { name: "음양선광", description: "부채에 모은 빛을 지정한 대상에게 발사합니다. 아군에게는 공격력을 증가시키고, 적에게는 공격력을 감소시킵니다." },
      { name: "회천풍", description: "지정한 위치에 바람을 불러일으켜 원형 범위를 만듭니다. 잠시 뒤, 그 범위 안에 있는 적에게는 피해를 입히고 아군은 치유합니다." },
      { name: "천기대책", description: "큰 진형을 펼치고 부채에서 밝은 빛의 비를 흩뿌립니다. 범위 내 아군에게 지속 회복 효과를 줍니다." }
    ],
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
    skills: [
      { name: "초격", description: "일직선으로 날아가는 흰 빛의 화살을 발사합니다." },
      { name: "은월관통", description: "달빛을 머금은 은빛 화살을 부채꼴로 흩뿌려, 넓은 전방을 동시에 꿰뚫습니다." },
      { name: "퇴진", description: "뒤로 빠르게 물러나며, 주변 적에게 피해를 줍니다." },
      { name: "매화 회전궁", description: "중력을 머금은 투사체를 날려 지정한 자리에 떨어뜨립니다. 그 지점을 중심으로 주변 적을 서서히 끌어당기며, 붙잡힌 적에게 지속적으로 피해를 입힙니다.", controlEffects: ["끌어당김"] },
      { name: "만시질풍", description: "전방을 향해 수많은 화살을 빠르게 쏘아, 범위 안의 적에게 여러 차례 피해를 줍니다." },
      { name: "낙매화우", description: "매화꽃을 흩날리며, 수십 발의 화살을 비처럼 넓은 지역에 쏟아냅니다." }
    ],
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

const hiddenSkillProfiles: HiddenSkillProfile[] = [
  {
    kingdom: "촉나라",
    name: "조자룡",
    role: "영객",
    skills: [
      { name: "선풍무", description: "조준한 적에게 빠르게 달려들어, 무적 상태로 사방을 베어내며 주변 적에게도 피해를 입힙니다." },
      { name: "혈영폭", description: "조준한 적을 빠르게 네 번 연속으로 베어내며, 그 주변 적들에게도 피해를 입힙니다." },
      { name: "유성천강", description: "공중으로 도약한 뒤 수직으로 낙하하여, 착지 지점을 중심으로 원형 범위의 적을 강타합니다." }
    ]
  },
  {
    kingdom: "촉나라",
    name: "관우",
    role: "패월 + 창수",
    skills: [
      { name: "격연참", description: "정면을 향해 크게 두 번 베어냅니다." },
      { name: "파뢰창", description: "창을 바닥에 내리찍어 사방으로 퍼지는 파동으로 주변 일대의 적을 두 차례 강타합니다." },
      { name: "선풍승격", description: "기를 끌어올린 뒤 주변 일대를 두 차례 베어내고 마지막으로 검을 위로 올려쳐 적을 공중으로 띄웁니다.", controlEffects: ["에어본"] }
    ]
  },
  {
    kingdom: "촉나라",
    name: "장비",
    role: "패월 + 창수",
    skills: [
      { name: "선풍각", description: "창을 회전시키며 주변의 적을 단숨에 베어냅니다." },
      { name: "유성강", description: "하늘의 기운을 끌어내려, 바라보는 지점에 별똥별처럼 내리꽂아 강타합니다." },
      { name: "붕천격", description: "하늘 높이 뛰어올라 땅으로 내리찍어, 낙하 지점의 적을 강타하며 잠시 둔화시킵니다.", controlEffects: ["둔화"] }
    ]
  },
  {
    kingdom: "촉나라",
    name: "제갈량",
    role: "책사",
    skills: [
      { name: "회생진", description: "주변 일대에 치유의 기운을 피어올려, 범위 안의 아군을 즉시 치유합니다." },
      { name: "천상책략", description: "천상의 책략을 펼쳐, 지정한 아군의 공격력과 이동속도를 높이고 잠시 동안 모든 방해 효과에 면역이 되게 합니다." },
      { name: "팔괘풍", description: "팔괘의 기운을 담은 바람을 넓게 흩뿌려, 주변의 적에게는 피해를 입히고 아군은 치유합니다." }
    ]
  },
  {
    kingdom: "촉나라",
    name: "유비",
    role: "군주",
    skills: [
      { name: "류성보", description: "앞으로 짧게 돌진하며 주변의 적을 한 번에 베어냅니다." },
      { name: "호신강기", description: "주위를 휩쓸어 피해를 입히고, 자신을 보호하는 결계를 펼칩니다." },
      { name: "회선난", description: "제자리에서 주위를 세 차례 베어낸 뒤, 곧바로 다시 세 차례 몰아쳐 적을 베어냅니다." },
      { name: "천패강림", description: "거대한 기운을 뿜어내 주변 일대의 적에게 피해를 입힌 뒤, 잠시 동안 방어력이 크게 상승합니다." },
      { name: "비룡귀참", description: "용의 기운을 실어 앞으로 돌진하며 적을 베어낸 뒤 제자리로 돌아옵니다. 돌진한 자리에는 용의 흔적이 남아, 주변 일대를 모조리 베어내며 피해를 입힙니다." },
      { name: "승천낙뢰", description: "하늘 높이 솟아오른 뒤 바라보는 방향으로 내리꽂히며 착지 지점을 중심으로 주변 일대의 적을 거대한 폭발에 휩쓸어 강타합니다." }
    ]
  },
  {
    kingdom: "위나라",
    name: "하후돈",
    role: "영객",
    skills: [
      { name: "배후난격", description: "조준한 적의 뒤로 순식간에 이동한 뒤, 앞으로 베며 적과 그 주변을 함께 관통합니다." },
      { name: "천공연무", description: "조준한 대상의 위치로 이동하여 적을 공중으로 띄운 뒤 순식간에 여러 번 베어냅니다.", controlEffects: ["에어본"] },
      { name: "축검일섬", description: "2초간 검기를 끌어올린 뒤, 정면을 향해 반원을 그리며 크게 베어냅니다." }
    ]
  },
  {
    kingdom: "위나라",
    name: "장료",
    role: "패월 + 창수",
    skills: [
      { name: "선풍참", description: "좌우로 엇갈린 십자 검격을 일으켜 주변 일대의 적을 베어넘깁니다." },
      { name: "와류참", description: "회오리치듯 좌우 사선으로 크게 베어내며, 휩쓸린 적을 자신 쪽으로 살짝 끌어당깁니다.", controlEffects: ["끌어당김"] },
      { name: "창랑격", description: "약 1초간 바라보는 방향으로 맹렬히 돌진하며, 경로의 적을 강타하고 뒤로 밀쳐냅니다.", controlEffects: ["넉백"] }
    ]
  },
  {
    kingdom: "위나라",
    name: "전위",
    role: "패월 + 창수",
    skills: [
      { name: "만천검격", description: "여러 갈래에서 정면을 향해 동시에 베어냅니다." },
      { name: "낙성진", description: "잠시 기운을 모은 뒤 주변 일대에 하늘에서 장렬한 에너지를 내리꽂아 강타합니다." },
      { name: "철벽난무", description: "주변 일대를 어지럽게 열두 차례 베어내며, 그동안 자신은 보호막을 두르고 입힌 피해만큼 체력을 회복합니다." }
    ]
  },
  {
    kingdom: "위나라",
    name: "사마의",
    role: "책사",
    skills: [
      { name: "창생진", description: "주변 일대에 서린 기운을 끌어올려, 범위 안의 아군을 즉시 치유합니다." },
      { name: "현천무", description: "서늘한 안개를 넓게 흩뿌려, 주변의 적에게는 피해를 입히고 아군은 치유합니다." },
      { name: "필승지략", description: "승리를 부르는 지략을 펼쳐, 지정한 아군의 공격력과 이동속도를 높이고 잠시 동안 모든 방해 효과에 면역이 되게 합니다." }
    ]
  },
  {
    kingdom: "위나라",
    name: "조조",
    role: "군주",
    skills: [
      { name: "비룡낙격", description: "하늘로 떠올라 주변의 적을 내려찍으며 여러 번 베어냅니다." },
      { name: "파진막", description: "주변을 크게 두 번 베어내고, 자신을 보호하는 결계를 펼칩니다." },
      { name: "광격참", description: "제자리에서 연속으로 네 번 크게 베어냅니다." },
      { name: "위압군림", description: "사방을 짓누르는 기세를 터뜨려 주변 일대의 적을 강타한 뒤, 잠시 동안 방어력이 크게 상승합니다." },
      { name: "선풍검기", description: "주변을 크게 휘둘러 일대의 적을 베어낸 뒤, 정면을 향해 검기를 발사해 피해를 입힙니다." },
      { name: "천검진", description: "발밑에 검진을 펼쳐 그 위의 적들의 이동속도를 늦춘 뒤, 하늘에서 검이 쏟아져 내리며 넓은 범위의 적을 강타합니다.", controlEffects: ["둔화"] }
    ]
  },
  {
    kingdom: "오나라",
    name: "감녕",
    role: "영객",
    skills: [
      { name: "잔영혈폭", description: "조준한 적의 뒤로 빠르게 이동한 뒤, 1초 후 적을 중심으로 붉은 폭발을 일으킵니다." },
      { name: "낙뢰삼연", description: "조준한 적의 뒤로 이동해 빠르게 여러 번 베어낸 뒤, 하늘에서 강한 충격이 내리꽂힙니다." },
      { name: "검류참", description: "정면으로 빠르게 돌진하며 적에게 피해를 입히고, 지나간 자리에 검기가 떨어지며 추가로 피해를 입힙니다." }
    ]
  },
  {
    kingdom: "오나라",
    name: "여몽",
    role: "패월 + 창수",
    skills: [
      { name: "나선격", description: "소용돌이치는 검격을 넓게 퍼뜨려 주변 일대의 적을 몰아쳐 베어냅니다." },
      { name: "삼연낙성", description: "정면을 향해 하늘에서 강렬한 에너지를 연달아 세 번 내리꽂고, 그 충격파를 직선으로 뻗어 보내 적을 강타합니다." },
      { name: "낙성봉인", description: "하늘에서 강렬한 에너지가 떨어져 주변 일대의 적을 강타하며, 맞은 적은 잠시 동안 스킬을 봉인당합니다.", controlEffects: ["스킬봉인"] }
    ]
  },
  {
    kingdom: "오나라",
    name: "태사자",
    role: "패월 + 창수",
    skills: [
      { name: "광류무", description: "거세게 휘몰아치는 회오리 검격으로 주변의 적을 단숨에 휩쓸어 버립니다." },
      { name: "회무승격", description: "주변 일대를 원을 그리며 훑어 벤 뒤, 검을 아래에서 위로 올려쳐 휩쓸린 적을 공중으로 띄웁니다.", controlEffects: ["에어본"] },
      { name: "연환창", description: "주변 일대를 한 번 베어낸 뒤, 곧바로 정면을 향해 창을 세 번 내질러 적을 꿰뚫습니다." }
    ]
  },
  {
    kingdom: "오나라",
    name: "주유",
    role: "책사",
    skills: [
      { name: "양화진", description: "주변 일대에 온기를 불어넣어, 범위 안의 아군을 즉시 치유합니다." },
      { name: "적벽비책", description: "적벽의 비책을 펼쳐, 지정한 아군의 공격력과 이동속도를 높이고 잠시 동안 모든 방해 효과에 면역이 되게 합니다." },
      { name: "온화풍", description: "따스한 생명의 기운을 넓게 흩뿌려, 주변의 적에게는 피해를 입히고 아군은 치유합니다." }
    ]
  },
  {
    kingdom: "오나라",
    name: "손권",
    role: "군주",
    skills: [
      { name: "삼단원보", description: "제자리에서 검격을 점점 멀리 뻗어 나가며 세 번 베어냅니다." },
      { name: "강동일섬", description: "앞으로 나아가며 적을 베어낸 뒤, 자신을 보호하는 결계를 펼칩니다." },
      { name: "십자검풍", description: "양손검을 크게 엇갈려 십자로 베어낸 뒤, 몰아치는 검풍으로 주변의 적까지 함께 휩쓸어 피해를 입힙니다." },
      { name: "반석진위", description: "무게 있는 기운을 둘러 주변 일대의 적을 밀어붙인 뒤 잠시 동안 방어력이 크게 상승합니다." },
      { name: "패왕진격", description: "강대한 기운을 터뜨려 주변 일대의 적을 강타한 뒤 잠시 동안 자신의 공격력이 크게 상승합니다." },
      { name: "척결진", description: "발밑에 거대한 결계를 펼쳐 주변 일대의 적을 강타하고, 지속되는 동안 결계 안으로 들어오는 적을 바깥으로 계속 밀쳐냅니다.", controlEffects: ["넉백"] }
    ]
  }
];

function hiddenRoleBadgeClass(role: string, highlight?: boolean) {
  if (highlight) {
    return "bg-[#d4a017]/24 text-[#ffe0a3] ring-1 ring-[#d4a756]/40";
  }

  if (role === "영객") {
    return "bg-[#6d28d9]/30 text-[#ede9fe] ring-1 ring-[#a78bfa]/34";
  }

  if (role === "패월 + 창수") {
    return "bg-[#172554]/38 text-[#bfdbfe] ring-1 ring-[#3b82f6]/28";
  }

  if (role === "책사") {
    return "bg-[#9a3412]/32 text-[#fed7aa] ring-1 ring-[#fb923c]/30";
  }

  return "bg-[#17324d]/60 text-[#d8e9ff] ring-1 ring-white/10";
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

function SkillList({ skills }: { skills: SkillInfo[] }) {
  return (
    <div className="grid gap-2">
      {skills.map((skill) => (
        <div key={skill.name} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-black text-[#f3e7d0]">{skill.name}</span>
            <ControlEffectBadges effects={skill.controlEffects} />
          </div>
          <p className="mt-1 text-[13px] font-semibold leading-6 text-[#aa9a82]">{skill.description}</p>
        </div>
      ))}
    </div>
  );
}

function controlEffectBadgeClass(effect: string) {
  if (effect === "넉백") return "bg-[#f97316]/18 text-[#fed7aa] ring-[#fb923c]/34";
  if (effect === "스턴") return "bg-[#facc15]/20 text-[#fef3c7] ring-[#facc15]/34";
  if (effect === "스킬봉인") return "bg-[#ef4444]/18 text-[#fecaca] ring-[#f87171]/34";
  if (effect === "둔화") return "bg-[#38bdf8]/18 text-[#dff6ff] ring-[#38bdf8]/34";
  if (effect === "속박") return "bg-[#a855f7]/18 text-[#f3e8ff] ring-[#c084fc]/34";
  if (effect === "끌어당김") return "bg-[#14b8a6]/18 text-[#ccfbf1] ring-[#2dd4bf]/34";
  if (effect === "에어본") return "bg-[#6366f1]/18 text-[#e0e7ff] ring-[#818cf8]/34";

  return "bg-white/10 text-[#f3e7d0] ring-white/15";
}

function ControlEffectBadges({ effects }: { effects?: string[] }) {
  if (!effects?.length) {
    return null;
  }

  return (
    <>
      {effects.map((effect) => (
        <span key={effect} className={`rounded-full px-2 py-0.5 text-[11px] font-black leading-none ring-1 ${controlEffectBadgeClass(effect)}`}>
          {effect}
        </span>
      ))}
    </>
  );
}

function SkillNameChips({ skills }: { skills: SkillInfo[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span key={skill.name} className="inline-flex items-center gap-1 rounded-full bg-white/[0.055] px-2 py-1 text-[11px] font-black leading-none text-[#dbc292] ring-1 ring-white/8">
          <span className="leading-none">{skill.name}</span>
          <ControlEffectBadges effects={skill.controlEffects} />
        </span>
      ))}
    </div>
  );
}

function kingdomDotClass(kingdom: HiddenSkillProfile["kingdom"]) {
  if (kingdom === "위나라") return "bg-sky-400";
  if (kingdom === "촉나라") return "bg-emerald-400";
  return "bg-amber-400";
}

function kingdomPanelClass(kingdom: HiddenSkillProfile["kingdom"]) {
  if (kingdom === "위나라") {
    return "border-sky-400/24 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.13),transparent_34%),rgba(0,0,0,0.24)]";
  }

  if (kingdom === "촉나라") {
    return "border-emerald-400/24 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.13),transparent_34%),rgba(0,0,0,0.24)]";
  }

  return "border-amber-400/24 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_34%),rgba(0,0,0,0.24)]";
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
              나라별 주요 인물에게 배정된 히든 직업과 전용 스킬을 함께 확인할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:p-5">
          {(["위나라", "촉나라", "오나라"] as const).map((kingdom) => {
            const profiles = hiddenSkillProfiles
              .filter((profile) => profile.kingdom === kingdom)
              .sort((left, right) => {
                if (left.role === "군주" && right.role !== "군주") return -1;
                if (left.role !== "군주" && right.role === "군주") return 1;
                return 0;
              });

            return (
              <section key={kingdom} className={`rounded-2xl border p-3.5 md:p-4 ${kingdomPanelClass(kingdom)}`}>
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-3.5 w-3.5 rounded-full ${kingdomDotClass(kingdom)} shadow-[0_0_18px_rgba(245,211,143,0.28)]`} />
                    <h3 className="text-xl font-black text-[#f3e7d0]">{kingdom}</h3>
                  </div>
                  <span className="rounded-full bg-black/34 px-3 py-1 text-xs font-black text-[#dbc292] ring-1 ring-white/10">
                    히든 {profiles.length}명
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {profiles.map((profile) => (
                    <details
                      key={`${profile.kingdom}-${profile.name}`}
                      id={profile.role === "군주" ? undefined : `hidden-${profile.name}`}
                      className="group rounded-xl border border-[rgba(212,167,86,0.18)] bg-black/34 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] open:border-[#d4a756]/36 open:bg-black/44"
                    >
                      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-lg font-black tracking-[-0.02em] text-[#f3e7d0]">{profile.name}</div>
                            <div className="mt-1 text-xs font-bold text-[#aa9a82]">전용 스킬 {profile.skills.length}개 · 클릭해서 상세 보기</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[12px] font-black ring-1 ${hiddenRoleBadgeClass(profile.role, profile.role === "군주")}`}>
                              {profile.role === "군주" ? "👑" : ""}{profile.role}
                            </span>
                            <span className="text-xs font-black text-[#d4a756] transition group-open:rotate-180">⌄</span>
                          </div>
                        </div>
                        <SkillNameChips skills={profile.skills} />
                      </summary>

                      <div className="mt-3 border-t border-white/8 pt-3">
                        <SkillList skills={profile.skills} />
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
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

              <div className="border-t border-[rgba(212,167,86,0.16)] p-4 md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-black ring-1 ${hiddenRoleBadgeClass(group.title)}`}>
                    스킬
                  </span>
                  <h3 className="text-lg font-black text-[#f3e7d0]">{group.title} 스킬</h3>
                </div>
                <SkillList skills={group.skills} />
              </div>
            </section>
          </div>
        ))}
      </div>
    </div>
  );
}
