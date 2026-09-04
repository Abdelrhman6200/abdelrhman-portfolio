import { useState } from "react";
import { ArrowRight, CircleDot, RotateCw } from "lucide-react";

const stages = [
  {
    number: "01",
    label: "OPERATIONS",
    title: "See the real work",
    body: "Start where the pressure is: handoffs, repeated decisions, and information nobody can trust quickly.",
    tone: "coral",
  },
  {
    number: "02",
    label: "AUTOMATION",
    title: "Make the path repeatable",
    body: "Turn the known failure points into clear states, checks, and workflows the team can actually run.",
    tone: "orange",
  },
  {
    number: "03",
    label: "AI SYSTEMS",
    title: "Give the system judgement",
    body: "Add AI where it helps people decide faster — with a visible trail, useful exceptions, and a human in control.",
    tone: "yellow",
  },
] as const;

export default function StoryMachine() {
  const [active, setActive] = useState(0);
  const stage = stages[active];

  return (
    <section className="story-machine" aria-labelledby="story-machine-title">
      <div className="story-machine-intro">
        <div>
          <div className="ref-kicker">THE VISUAL MODEL</div>
          <h2 id="story-machine-title">
            Experience becomes
            <br />
            <em>infrastructure.</em>
          </h2>
        </div>
        <p>
          The work moves in one direction: understand the operation, make the repeatable parts reliable, then
          give the system enough intelligence to improve the next decision.
        </p>
      </div>

      <div className="story-machine-layout">
        <div className="story-machine-scene" aria-hidden="true">
          <div className="story-machine-grid" />
          <div className="story-machine-orbit story-machine-orbit-a" />
          <div className="story-machine-orbit story-machine-orbit-b" />
          <div className="story-machine-track story-machine-track-a" />
          <div className="story-machine-track story-machine-track-b" />
          <div className="story-machine-node story-machine-node-a"><CircleDot size={14} /></div>
          <div className="story-machine-node story-machine-node-b"><CircleDot size={14} /></div>
          <div className="story-machine-node story-machine-node-c"><CircleDot size={14} /></div>
          <div className="story-machine-core">
            <span className="story-machine-core-mark">AS</span>
            <span>SYSTEM LOOP</span>
          </div>
          <div className="story-machine-signal"><span /></div>
        </div>

        <div className="story-machine-copy">
          <div className="story-machine-tabs" role="tablist" aria-label="The systems builder progression">
            {stages.map((item, index) => (
              <button
                key={item.number}
                type="button"
                role="tab"
                aria-selected={active === index}
                aria-controls={`story-machine-panel-${item.number}`}
                className={`story-machine-tab story-machine-tab-${item.tone} ${active === index ? "is-active" : ""}`}
                onClick={() => setActive(index)}
              >
                <i>{item.number}</i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={`story-machine-panel story-machine-panel-${stage.tone}`} id={`story-machine-panel-${stage.number}`} role="tabpanel">
            <div className="story-machine-panel-top">
              <span>{stage.label}</span>
              <RotateCw size={14} aria-hidden="true" />
            </div>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
            <div className="story-machine-handoff"><span>next</span><ArrowRight size={14} aria-hidden="true" /> {active === stages.length - 1 ? "improve again" : stages[active + 1].label.toLowerCase()}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
