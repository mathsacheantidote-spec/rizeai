import rizeLogo from "@/assets/rize-logo.png";

export function BrandLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background animate-loader-out pointer-events-none">
      <div className="relative flex flex-col items-center gap-5">
        <div className="absolute h-36 w-36 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <img src={rizeLogo} alt="Rize" className="relative h-20 w-44 object-contain animate-logo-pop" />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-1/2 rounded-full bg-gradient-primary animate-loader-bar" />
        </div>
      </div>
    </div>
  );
}
