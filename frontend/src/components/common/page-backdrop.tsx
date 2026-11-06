export function PageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-brand-300/30 blur-3xl" />
      <div className="absolute top-1/3 -right-40 size-[38rem] rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -bottom-48 left-1/4 size-[30rem] rounded-full bg-brand-400/15 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(130 80 245 / 0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 70%)",
        }}
      />
    </div>
  );
}
