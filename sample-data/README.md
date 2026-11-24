# Sample data

Made-up entries for a demo week (Friday 2026-01-09 to Thursday 2026-01-15). Every name, email,
price, rate and fee here is a placeholder. None of it comes from the business.

| File | Sheet tab | What it shows |
| --- | --- | --- |
| `settings.csv` | Settings | Business-wide rules: payout share, linen fee, manager email |
| `practitioners.csv` | Practitioners | One row each, with an optional payout override and an inactive row |
| `services.csv` | Services (A:E) | The single source of truth for who offers what, at what price |
| `service-types.csv` | Services (G:H) | Categories and their product fee, which feed the Category dropdown |
| `events.csv` | Events | Event defaults, plus one event that overrides them |
| `transactions.csv` | Transactions (A:E, O:R) | Typed inputs only. The calculated columns F:N fill themselves |

The week includes one of each edge case the invoices handle: a comped booking, a removed
linen fee, a custom price, event bookings, and a practitioner who brings their own linens.
