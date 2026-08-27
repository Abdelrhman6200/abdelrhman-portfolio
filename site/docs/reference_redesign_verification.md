# Reference-Led Redesign Verification

## Desktop

- The homepage presents the intended reference-led composition: bright paper canvas, oversized black/coral hero headline, rounded dark service panel, accent project cards, experience list, proof band, and contact card.
- The two in-site demos now share the same visual family through paper cards, coral/yellow signal colors, rounded panels, dark handoff rails, oversized Space Grotesk headings, and compact mono labels.
- Project previews remain legible at 1280px and keep the verified CG Foundry and questionnaire-to-report content intact.

## Mobile

- The homepage collapses into a single reading column while preserving the hero orbit, project previews, dark service module, timeline rows, and contact surface.
- Demo panels stack cleanly, flow rails remain horizontally readable, and controls remain large enough for touch interaction.
- The demos retain reduced-motion safeguards and no horizontal layout break was observed in the 390px capture.

## Validation

- TypeScript check passed.
- Production build passed.
- Desktop and mobile screenshot passes completed for `/`, `/demo/cgf`, and `/demo/questionnaire`.
