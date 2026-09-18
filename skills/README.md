# Sellman skills

Playbooks the Sellman agents load. Each follows the SKILL.md format (YAML frontmatter with `name` and
`description`, then instructions). Agents list the skills they use in `agents/*.md`; the runner injects the
matching SKILL.md bodies into the agent's context.

| Skill | Used by |
|---|---|
| icp-and-segmentation | market-researcher, signal-scout, strategist |
| offer-design | offer-architect |
| outcome-pricing | offer-architect, strategist |
| positioning-and-messaging | content-strategist, listing-manager, outbound-writer |
| audit-led-selling | offer-architect, content-strategist, lifecycle-writer |
| marketplace-listing | listing-manager |
| geo-content | content-strategist |
| compliant-outbound | outbound-writer |
| community-selling | community-listener |
| competitor-intel | competitor-analyst, market-researcher |
| self-serve-conversion | lifecycle-writer, content-strategist |
| attribution-and-experiments | strategist |
| claims-and-compliance | every agent that drafts customer-facing text |
| partner-channel | strategist, content-strategist, partner-manager |

These are also valid Claude skills — zip a folder to use it in Claude directly.
