export default function GuidePage() {
  return <ContentPage title="멀티뷰" desc="서버 입문, 세력 선택, 전투, 영토전 규칙을 정리할 Wiki 페이지입니다." />;
}

function ContentPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="pixel-frame p-8">
        <h1 className="mb-3 text-2xl font-black text-[#f3e7d0]">{title}</h1>
        <p className="text-sm leading-7 text-[#aa9a82]">{desc}</p>
      </div>
    </div>
  );
}
