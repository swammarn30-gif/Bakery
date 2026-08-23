# Mobile Packaging Loading Investigation

On 2026-08-23, the reported mobile screenshot was matched to the Bakery Vercel production alias `https://bakery-alpha-puce.vercel.app/`, which is also assigned to the canonical live site `https://bakery-happy-and-healthy.vercel.app/`.

The original user-visible state was a Packaging page showing `Loading packaging data…`, six table skeleton rows, and the misleading empty-item message at the same time. Reproduction on the prior deployment showed the skeleton while the request was in flight and real rows after settlement. Vercel’s grouped runtime errors contained historical `/api/trpc/[...path]` 300-second timeouts, while recent live serverless responses were HTTP 200.

The client repair in Git commit `e56d5c2` separates `loading`, `error`, `empty`, and `ready` rendering; retains prior ledger rows while a new date is fetching; and provides a Retry action if a request actually fails. Vercel deployment `dpl_FZ56srfEw7HD4sxocQpHC1Hj8xoa` is READY and serves both listed Bakery aliases.

Live browser verification was completed on `https://bakery-alpha-puce.vercel.app/`: the initial Packaging ledger load resolved to real rows, then the Master Date was changed from 2026-08-02 to 2026-08-22. The ledger resolved with genuine rows and the automatic carry-forward values, including S Opening 990 and 16×24 Closing 100. No false empty-item message was displayed after the initial request settled.
