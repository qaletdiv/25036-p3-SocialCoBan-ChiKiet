import { Flame, Users, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { COMING_SOON_LABEL } from "@/constants/navigation";

interface UpcomingCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function UpcomingCard({ icon: Icon, title, description }: UpcomingCardProps) {
  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-md shadow-brand-600/5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-bold text-brand-900">{title}</h2>
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-zinc-500">
          {COMING_SOON_LABEL}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{description}</p>
    </section>
  );
}

export function RightRail() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-brand-700 via-brand-600 to-brand-500 p-5 text-white shadow-lg shadow-brand-600/25">
        <div className="absolute -top-10 -right-10 size-36 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-14 size-32 rounded-full bg-white/10" />
        <div className="relative">
          <BrandLogo tone="light" />
          <p className="mt-4 text-lg leading-snug font-bold">Mọi vòng tròn thân quen, trong một nơi duy nhất.</p>
          <p className="mt-2 text-sm text-brand-100">
            Chia sẻ khoảnh khắc của bạn và lưu giữ những điều khiến bạn hạnh phúc.
          </p>
        </div>
      </section>

      <UpcomingCard
        icon={Users}
        title="Gợi ý kết nối"
        description="Tìm lại những người thân quen và mở rộng vòng tròn của bạn."
      />
      <UpcomingCard
        icon={Flame}
        title="Chủ đề nổi bật"
        description="Khám phá những điều cộng đồng đang quan tâm mỗi ngày."
      />

      <p className="mt-auto px-2 text-center text-xs text-zinc-400">© 2026 Kircle. Bảo lưu mọi quyền.</p>
    </div>
  );
}
