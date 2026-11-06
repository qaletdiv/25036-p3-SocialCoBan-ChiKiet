import { Heart, MessageCircle, Users, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  { icon: Users, title: "Kết nối bạn bè", description: "Tìm lại những người thân quen và mở rộng vòng tròn của bạn." },
  { icon: MessageCircle, title: "Trò chuyện mọi lúc", description: "Chia sẻ suy nghĩ và trao đổi cùng bạn bè thật dễ dàng." },
  { icon: Heart, title: "Lưu giữ khoảnh khắc", description: "Đăng tải và lan tỏa những điều khiến bạn hạnh phúc." },
];

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-600 p-12 text-white lg:flex">
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-1/3 size-40 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute right-24 top-1/3 size-40 rounded-full border border-white/15" />

      <BrandLogo tone="light" className="relative" />

      <div className="relative space-y-10">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Mọi vòng tròn thân quen,
            <br />
            <span className="text-brand-200">trong một nơi duy nhất.</span>
          </h2>
          <p className="max-w-md text-base leading-relaxed text-brand-100/90">
            Cập nhật những điều mới mẻ từ bạn bè và cộng đồng của bạn mỗi ngày.
          </p>
        </div>

        <ul className="space-y-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                <Icon className="size-5 text-brand-100" aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-brand-100/80">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-brand-200/80">© {new Date().getFullYear()} Kircle. Bảo lưu mọi quyền.</p>
    </aside>
  );
}
