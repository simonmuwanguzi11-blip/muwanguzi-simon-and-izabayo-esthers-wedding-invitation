# Design QA — Wedding Invitation

## Comparison target

- Source visual truth: `C:\Users\ADMIN\Pictures\Screenshots\Screenshot 2026-09-11 085554g.png` and `C:\Users\ADMIN\Pictures\Screenshots\Screenshot 2026-09-11 085824.png`.
- Implementation: browser-rendered `http://localhost:3000/` captured in the Codex in-app browser.
- Viewport/state: desktop in-app browser; opened-envelope state and wedding-details state.
- Density normalization: the source is a phone-in-hand video frame, while the implementation is a responsive invitation page. Comparison is limited to the app-owned envelope, guest pass, botanical palette, typography hierarchy, countdown, and event flow—not surrounding device chrome.

## Full-view comparison evidence

The implementation preserves the reference interaction hierarchy: soft botanical/ivory palette, envelope as the opening action, a reserved guest pass, a reveal of the couple’s names, and a formal countdown/event-details treatment. The implementation uses responsive web sizing in place of the source phone frame.

## Focused region comparison evidence

- Envelope/pass: verified in the opened state. The pass surfaces the saved guest name and number of attendees when present in browser storage or URL parameters.
- Details/countdown: verified in the rendered details state. Ceremony time is 11:00 AM; both event locations have direct map links; calendar, live countdown, gift section, and RSVP CTA are visible.

## Required fidelity surfaces

- Fonts and typography: Cormorant Garamond and Sacramento provide the formal serif/script hierarchy shown by the reference; uppercase Montserrat supports compact labels.
- Spacing and layout rhythm: the envelope is centered above the revealed invitation, while details use generous vertical spacing and one clear primary action at a time.
- Colors and visual tokens: ivory, sage, botanical green, and muted gold match the reference’s warm floral-envelope direction.
- Image quality and asset fidelity: the cover and gallery support user-uploaded wedding photos, avoiding generic stock imagery. No actual couple photo was supplied for static placement.
- Copy and content: names, date, 11:00 AM ceremony, venue, reception, gift/contribution, RSVP, and map actions are all current.

## Interaction checks

- Envelope click opens the pass and invitation reveal, and starts the opt-in-on-gesture celebration melody.
- “See more details” moves to the cover page.
- Cover page moves to gallery, gallery moves to event details, and the event-details RSVP CTA moves to the RSVP page.
- The two map links resolve to the ceremony and reception searches respectively.
- Browser console/script syntax check completed with no JavaScript syntax errors.

## Findings

No actionable P0, P1, or P2 differences for the requested responsive web interpretation.

## Follow-up polish

- Add the final couple cover photo and gallery images for the strongest personal result.
- For a fully personalized first-screen pass for every recipient, issue invitation URLs such as `?guest=Guest%20Name&guests=2` from a guest-list system.

final result: passed
