# Flora Invoices

A weekly payout and invoicing tool for a wellness centre, built in Google Sheets and Google Apps Script.
The manager logs a week of bookings and the tool produces each practitioner's invoice, a manager review
summary, e-transfer notes and an archive. A side panel shows which step is done and which needs review.

I designed it for Flora Sanctuary and directed Claude Code, which wrote the code. The design decisions
in this README are mine.

> **Privacy by design.** The tool and the business's data are kept apart on purpose. The manager runs
> her own copy of the sheet, and I have never had access to it or to the business's real data. Updates
> reach her copy without that access, and the script never sends data back to me. Everything in this
> repo, including the sample data, is made up, and all rates and fees are placeholders.

*Screenshots and a demo recording are coming. See [docs](docs/).*

---

## The problem

A wellness centre pays its practitioners every week. Each payout depends on the service price, the
practitioner's share, linen and product fees, event travel and service fees, gratuities, and the odd
comped booking or custom price. The manager was working all of this out by hand. Mistakes cost trust,
and the practitioners had no easy way to check their own totals.

The practitioners are all self-employed, so they need accurate records of what they earned and what
was deducted. Those records weren't being provided.

The person running the tool is not technical, may work on an iPad, and needs it to just work every week.

## What it does

- **A mini database of services:** the Services tab holds each practitioner's services, their types and
  prices. Dependent dropdowns on Transactions use it, so nobody has to look up a price or detail, and
  every figure comes from one place.
- **Weekly flow in order:** preview totals, make invoice PDFs, make one manager review summary, email
  invoices, write e-transfer notes, then start the next week (back up, archive, clear, move the date on).
- **Invoices a practitioner can check:** each PDF lists every booking with its fees, then a short ledger
  (services, less fees, plus gratuity) that adds up to the net payout.
- **One review instead of many:** the manager checks one summary PDF of the whole week instead of
  opening every invoice. Nothing is emailed until its own button is pressed.
- **Business reports:** business totals for any week, and a summary for any past week.
- **E-transfer notes:** for each practitioner, the message to send with the payment is generated from
  the week's figures, so it is factual and gives proper context. An E-Transfers tab lists every payment
  with its message and a Paid tick box, and works in the iPad Sheets app.
- **Accurate records for self-employed practitioners:** every practitioner gets an invoice that shows
  each booking, fee and gratuity, and the totals are archived week by week.
- **Side panel:** this week at a glance, each step ticked only when it really succeeded, and a health pill.
- **Health Check:** finds problems and explains them in plain words. Its report holds counts and row
  numbers only, so it can be sent to the developer without sharing bookings or amounts.
- **Safety nets:** a backup copy before each new week, guards on every typed or pasted date, refusals to
  send invoices that are out of date, and warnings before anything that can't be undone.

## Version history

Each change below started with something the client said, found, or wished for.

### Version 1: the invoice structure
- **Need:** turn a week of bookings into accurate practitioner invoices.
- **Change:** a Settings tab for rules and prices, a Services tab as the single source of truth, a
  Transactions tab that grows by rows, and a PDF invoice for each practitioner.
- **Change:** event fees became a per-booking toggle (an Event column on Transactions), reversing an
  earlier design that set them per service.

### Version 2: reports and a sheet that is hard to break
- **Feedback:** the manager didn't want to open every invoice to review the week.
  **Change:** business reports alongside the original invoices: a manager review summary and a
  business totals report.
- **Feedback:** the client found simple but surprising ways to break the sheet. One bad date in the
  pay-week cell stopped a whole week, and text or day-first dates slipped through.
  **Change:** validation hardened: real dates only, the pay week must start on a Friday, dates are read
  tolerantly as a backstop, rows past the limit are reported instead of ignored, a Health Check, and a
  backup before each new week.
- **Feedback:** payments went out with messages like "1 massage, 1 facial plus tips".
  **Change:** e-transfer notes that carry the invoice detail into the payment message.

### Version 3: a guided workflow with an app feel
- **Feedback:** the client thought she had to generate every invoice and have them emailed in order to
  review them, and she asked for reports that already existed but that she hadn't found.
  **Change:** I clarified the pain points and created a guided workflow. The one menu became two
  custom menus: one for the weekly flow in order, and one for reports and under-the-hood fixes. Every
  step now says plainly whether it emails anyone or not.

The rest of version 3 came from my own choices as the developer, not from client requests:
- **Change:** a sidebar repeats the weekly flow as a more visual panel. It shows which step is complete
  or needs review, which gives the sheet an app feel.
- **Change:** feedback loops guide the user through each step: colour-coded results that lead with the
  outcome, red buttons for steps that can't be undone, and errors that explain themselves and end with
  an error report the manager can send to the developer.
- **Change:** archiving expanded, with room to grow so nothing breaks as the business gets busier:
  capacity grows to 500 bookings a week, 100 practitioners, 400 services and 100 events, and older
  sheets grow once, automatically, formulas and protections included. The archive stores plain values,
  so a later price change never rewrites a past week.
- **Change:** an E-Transfers tab, to automate another routine task. It lists each payment with its
  generated message ready to copy, and a Paid tick box, so paying everyone is one pass down a list.
- **Change:** the theme was modernized: every tab, pop-up and PDF in one rose-and-blush style, and
  tabs grouped by how often they're used.

## Design decisions

- **Rules and prices live in a Settings tab.** A change means editing a cell, not a formula.
- **The sheet grows by adding rows, not by editing formulas.**
- **The Services tab is the single source of truth.** It feeds dependent dropdowns, so a practitioner's
  service list only offers what they actually provide, at the price set in one place.
- **Event fees are a per-transaction toggle.** I reversed my earlier service-level design.
- **Pay stubs are built so the payee can check their own totals.** Every fee is shown per booking and
  again in a ledger that adds up to the net payout.
- **Take out the friction.** A big piece of the design was removing every step the manager would
  otherwise do by hand: looking up prices, working out fees, writing payment messages.
- **The tool is separate from the data.** See the privacy statement at the top.
- **I asked design questions before larger rebuilds.**

## Setup

You need a Google account, [Node.js](https://nodejs.org) and
[clasp](https://github.com/google/clasp) (Google's Apps Script command-line tool).

1. Create a Google Sheet with these tabs: Settings, Practitioners, Services, Events, Transactions,
   Invoices, Calculations, Archive, Payout History and Send Log. The column headings are in
   [sample-data](sample-data/). The calculated columns and the hidden Calculations tab come from the
   template sheet, which isn't in this repo yet (see What's next).
2. In the sheet, open Extensions > Apps Script and note the script ID from Project Settings.
3. In this folder, sign in, link the project and push the code:
   ```sh
   npm install -g @google/clasp
   clasp login
   echo '{"scriptId":"<your-script-id>","rootDir":"src"}' > .clasp.json
   clasp push
   ```
   `.clasp.json` is git-ignored, so your script ID never ends up in the repo.
4. Reload the sheet. Two menus appear: **Flora · This Week** and **Flora · Tools**. Approve the
   permissions the first time.
5. Fill Settings, Practitioners and Services from the sample data, then use **Flora · Tools > Add test
   bookings** to try a week safely. **Clear test bookings** removes exactly those rows.

Run the checks (pure helpers, no Google account needed):

```sh
node --test tests/*.test.js
```

## How it was built

- **Stack:** Google Sheets, Google Apps Script (V8), Claude Code.
- **Roles:** I designed the tool, set the requirements, made the decisions and tested every version.
  Claude Code wrote the code under my direction. I reviewed each change on my own copy of the sheet
  before it was released.
- **Workflow:** versions 1 and 2 were built with Claude and pasted into the sheet. For version 3 I moved
  to Claude Code with clasp and git, so every change was a reviewed commit pushed to my development copy.
- **Testing:** the logic that doesn't need Google (date parsing, capacity growth, invoice layout,
  duplicate detection, tab order and more) is split into pure functions with 46 Node checks. Everything
  else is tested on my own copy of the sheet using clearly labelled test bookings.
- **Size:** about 5,200 lines across 18 script files and one HTML panel.

## What's next

- Make each invoice's per-booking Payout column add up exactly to the net payout figure.
- A short demo video for the manager, built from real screenshots of my copy with test bookings.
- Release updates through an Apps Script library I own, so the manager's copy updates itself and I
  still never need access to it.
- Publish a clean template sheet so the setup above is a single copy.

## Repo layout

```
src/           Apps Script source (.gs), the side panel (Panel.html) and the manifest
tests/         Node checks for the pure helpers
sample-data/   Made-up sample entries for each tab
docs/          Screenshots and the demo recording (placeholders for now)
```

© 2026 Krystal Blanchette. All rights reserved. The code is shared to show my work. Please ask
before reusing it.
