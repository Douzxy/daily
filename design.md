# Lifetime — Verdana Health Design System Reference

## Design Philosophy
Calm, trustworthy, clinical-yet-approachable. No AI slop — every pixel intentional.
Inspired by premium finance/health dashboards on refero.design.

## Color Tokens (Tailwind CSS Variables)
```
--color-navy:        #0F172A   /* Primary actions, headers */
--color-navy-hover:  #020617   /* Primary hover */
--color-slate:       #64748B   /* Secondary text, borders */
--color-sage:        #059669   /* Links, CTAs, highlights */
--color-bg:          #F8FAFC   /* Page background */
--color-surface:     #FFFFFF   /* Card backgrounds */
--color-border:      #E2E8F0   /* Default borders */
--color-border-light:#F1F5F9   /* Subtle dividers */
--color-success:     #22C55E   /* Confirmed, healthy */
--color-warning:     #EAB308   /* Pending, caution */
--color-error:       #EF4444   /* Critical, danger */
--color-info:        #0EA5E9   /* Informational */
```

## Typography
- **Headline**: Plus Jakarta Sans (bold/semibold)
- **Body**: DM Sans (regular/medium)
- **Mono**: Fira Code (tabular data)

## Spacing Scale (8px base)
xs=4px, sm=8px, md=16px, lg=24px, xl=32px, 2xl=48px, 3xl=64px

## Border Radius
sm=4px, DEFAULT=8px, md=12px, lg=16px, full=9999px

## Elevation (gentle, diffused)
- sm: 0 1px 3px rgba(15,23,42,0.03)
- DEFAULT: 0 2px 6px rgba(15,23,42,0.05)
- md: 0 4px 16px rgba(15,23,42,0.07)
- lg: 0 8px 32px rgba(15,23,42,0.10)

## Component Patterns

### Buttons
- Primary: bg-navy text-white hover:bg-navy-hover
- Secondary: bg-transparent text-navy border-navy hover:bg-navy/[0.04]
- Ghost: bg-transparent text-slate hover:bg-border-light
- Destructive: bg-error text-white hover:bg-red-600
- Disabled: opacity-40, cursor-not-allowed

### Cards
- Default: bg-surface border border-border rounded-lg p-6
- Elevated: bg-surface shadow-md rounded-lg p-6
- No harsh shadows, generous padding

### Inputs
- Default: border-border bg-surface rounded-lg h-[42px] px-3.5
- Focus: border-2 border-navy ring-3 ring-navy/10
- Error: border-2 border-error ring-3 ring-error/10

### Checkboxes
- 18x18px, rounded-sm (4px)
- Unchecked: border-1.5 border-slate-300 bg-white
- Checked: bg-navy, white checkmark
- Label: 8px left spacing

## Do's
✅ Navy + White as primary visual rhythm
✅ Generous whitespace — health interfaces should breathe
✅ Consistent 8px radius for approachability
✅ Uppercase chip labels with tracking for polish
✅ Fira Code for tabular numeral alignment
✅ Clear iconography with text labels

## Don'ts
❌ No harsh neons or saturated accents
❌ No condensed or decorative fonts
❌ No heavy drop shadows
❌ No dense data dumps — use progressive disclosure
❌ No generic placeholder content
