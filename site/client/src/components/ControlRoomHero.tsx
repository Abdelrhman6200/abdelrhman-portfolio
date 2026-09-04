import { ArrowUpRight, Map, Radio, Sparkles, Workflow } from "lucide-react";

const hotspots = [
  { label: "Operations", note: "40K+ records", className: "is-operations", href: "#case-files", icon: Map },
  { label: "Automation", note: "repeatable paths", className: "is-automation", href: "#work", icon: Workflow },
  { label: "AI systems", note: "better decisions", className: "is-ai", href: "#method", icon: Sparkles },
] as const;

export default function ControlRoomHero() {
  return (
    <div className="control-room-hero">
      <div className="control-room-hero-image">
        <img src="/scene/control-room.png" alt="A stylised systems control room with operations, automation, and AI workstations" />
        <div className="control-room-hero-glow" aria-hidden="true" />
        <div className="control-room-hero-scan" aria-hidden="true" />
        {hotspots.map(({ label, note, className, href, icon: Icon }) => (
          <a key={label} className={`control-room-hotspot ${className}`} href={href}>
            <span className="control-room-hotspot-ring"><Icon size={12} aria-hidden="true" /></span>
            <span><b>{label}</b><small>{note}</small></span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        ))}
      </div>
      <div className="control-room-hero-meta">
        <span><Radio size={12} aria-hidden="true" /> ROOM 01 / LIVE MODEL</span>
        <span>CLICK A STATION TO ENTER</span>
      </div>
    </div>
  );
}
