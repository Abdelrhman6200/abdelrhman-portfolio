/*
 * Cmd/Ctrl-K navigation.
 *
 * The site now has roughly thirty destinations — eight home sections, three
 * case files, seven demos, the CV and eighteen record entries — and until now
 * the only way between any two of them was scrolling back to a nav bar that
 * only exists on the home page. This is the shortcut: type three letters, hit
 * Enter, arrive.
 *
 * It is also the accessibility answer to a long single-page document. Every
 * destination is reachable from the keyboard without traversing the page, and
 * the widget follows the combobox pattern — the input keeps focus and owns
 * `aria-activedescendant`, so a screen reader announces the highlighted option
 * while the caret stays where the user is typing.
 *
 * The item list is derived from the content modules, so a new demo or system
 * becomes searchable with no edit here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Command, FileText, FlaskConical, Hash, Layers, Mail, Search } from "lucide-react";
import { useLocation } from "wouter";
import { allProjects, builtSystems, contact } from "@/content/portfolio";
import { demos } from "@/demos/registry";
import { slugFor } from "@/content/slugs";

/** Header buttons ask for the palette through this, so no context is needed. */
const OPEN_EVENT = "portfolio:open-palette";
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

type Item = {
  id: string;
  label: string;
  hint: string;
  group: "Sections" | "Systems" | "Demos" | "Record" | "Elsewhere";
  /** Route to navigate to. */
  path: string;
  /** Element to scroll to once that route is showing. */
  anchor?: string;
  /** External or mailto destinations leave the app entirely. */
  external?: string;
  icon: typeof Hash;
};

const sections: Array<[string, string]> = [
  ["about", "The builder"],
  ["method", "The eight-stage method"],
  ["services", "What I do"],
  ["work", "Built software"],
  ["case-files", "Operational case files"],
  ["index", "The rest of the record"],
  ["experience", "The progression"],
  ["contact", "Get in touch"],
];

function buildItems(): Item[] {
  return [
    ...sections.map(([id, hint]) => ({
      id: `section-${id}`,
      label: id.replace(/-/g, " ").replace(/^./, (character) => character.toUpperCase()),
      hint,
      group: "Sections" as const,
      path: "/",
      anchor: id,
      icon: Hash,
    })),
    ...builtSystems.map((project) => ({
      id: `system-${project.number}`,
      label: project.title,
      hint: project.subtitle,
      group: "Systems" as const,
      path: `/system/${slugFor(project.title)}`,
      icon: Layers,
    })),
    ...demos.map((demo) => ({
      id: `demo-${demo.slug}`,
      label: `${demo.title} demo`,
      hint: "Live, in your browser, on synthetic data",
      group: "Demos" as const,
      path: `/demo/${demo.slug}`,
      icon: FlaskConical,
    })),
    // Record entries land on the index section: the row itself is not a page,
    // so sending someone to a destination that does not exist would be a lie.
    ...allProjects
      .filter((project) => !builtSystems.includes(project))
      .map((project) => ({
        id: `record-${project.number}`,
        label: project.title,
        hint: project.group,
        group: "Record" as const,
        path: "/",
        anchor: "index",
        icon: Search,
      })),
    {
      id: "cv",
      label: "Curriculum vitae",
      hint: "The whole record as one printable document",
      group: "Elsewhere" as const,
      path: "/cv",
      icon: FileText,
    },
    {
      id: "email",
      label: "Email Abdelrhman",
      hint: contact.email,
      group: "Elsewhere" as const,
      path: "/",
      external: `mailto:${contact.email}`,
      icon: Mail,
    },
    {
      id: "github",
      label: "GitHub",
      hint: contact.githubHandle,
      group: "Elsewhere" as const,
      path: "/",
      external: contact.github,
      icon: ArrowRight,
    },
  ];
}

/** Substring match across label and hint — predictable beats clever here. */
function matches(item: Item, query: string): boolean {
  if (!query) return true;
  const haystack = `${item.label} ${item.hint} ${item.group}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** Where focus was before opening, so Escape returns the user to it. */
  const restoreTo = useRef<HTMLElement | null>(null);

  const items = useMemo(buildItems, []);
  const results = useMemo(() => items.filter((item) => matches(item, query)), [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    restoreTo.current?.focus();
  }, []);

  const show = useCallback(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  // Global hotkey. "/" is included because it costs nothing and is the reflex
  // on any site with a search field — but never while the user is typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.isContentEditable);
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => {
          if (!value) restoreTo.current = document.activeElement as HTMLElement | null;
          return !value;
        });
        return;
      }
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        show();
      }
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    // Restore whatever the page had rather than assuming "visible": the
    // value is read back so a future page-level lock is not clobbered.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    const selector = "[data-active=true]";
    listRef.current?.querySelector<HTMLElement>(selector)?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);

  const go = useCallback(
    (item: Item) => {
      close();
      if (item.external) {
        window.open(item.external, item.external.startsWith("mailto:") ? "_self" : "_blank", "noreferrer");
        return;
      }
      setLocation(item.path);
      if (!item.anchor) {
        window.scrollTo?.({ top: 0 });
        return;
      }
      // The target may not be mounted until the route renders, so scroll on the
      // next frame rather than in the same tick as the navigation.
      const anchor = item.anchor;
      requestAnimationFrame(() => {
        document.getElementById(anchor)?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      });
    },
    [close, setLocation]
  );

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (results.length ? (value + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => (results.length ? (value - 1 + results.length) % results.length : 0));
    } else if (event.key === "Tab") {
      event.preventDefault();
      const direction = event.shiftKey ? -1 : 1;
      setActive((value) =>
        results.length ? (value + direction + results.length) % results.length : 0
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = results[active];
      if (item) go(item);
    }
  };

  let lastGroup = "";

  return (
    <div className="reference-page cmdk-backdrop" onMouseDown={close} role="presentation">
      <div
        className="cmdk-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cmdk-field">
          <Search size={16} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Jump to a system, demo or section…"
            aria-label="Jump to a system, demo or section"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={results[active] ? `cmdk-${results[active].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>ESC</kbd>
        </div>

        <div className="cmdk-list" id="cmdk-list" role="listbox" aria-label="Destinations" ref={listRef}>
          {results.length === 0 ? (
            <p className="cmdk-empty">Nothing matches that.</p>
          ) : (
            results.map((item, index) => {
              const heading = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {heading ? <div className="cmdk-group">{heading}</div> : null}
                  <div
                    id={`cmdk-${item.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-active={index === active}
                    className="cmdk-item"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(item)}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span className="cmdk-item-label">{item.label}</span>
                    <span className="cmdk-item-hint">{item.hint}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cmdk-foot">
          <span>
            <kbd>&uarr;</kbd>
            <kbd>&darr;</kbd> move
          </span>
          <span>
            <kbd>&crarr;</kbd> open
          </span>
          <span>
            <Command size={11} aria-hidden="true" />
            <kbd>K</kbd> anywhere
          </span>
        </div>
      </div>
    </div>
  );
}
