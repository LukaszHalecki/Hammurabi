import { ShineBorder } from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";

export function TabletPanel({ children, className, shine = false }) {
  return (
    <section className={cn("relative bg-tablet border border-tablet-border rounded-sm p-4 md:p-5", className)}>
      {shine && <ShineBorder borderWidth={1} duration={12} shineColor={["#c98a3e", "#e8ab5e", "#a13d2b"]} />}
      {children}
    </section>
  );
}
