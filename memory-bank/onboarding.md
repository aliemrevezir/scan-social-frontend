Got it. Here’s the full **English** spec + **drop-in CSS replacements** (blue Webflow-like theme) tailored to your Next.js (frontend) + Django (backend) stack and the repo structure you shared.

# Scan Social — Onboarding Design & Integration Spec (EN)

## 1) Visual language (derived only from your reference screenshots)

**Palette**

* Primary / CTA: `#3A62FF`
  Hover: `#2D53F5` • Focus ring: `#BFD0FF` (outer glow)
* Text — Strong: `#0B0C0D` • Muted: `#6B7280`
* Surfaces: `#FFFFFF` (cards) • App BG: gradient `#EAF1FF → #F4F7FF → #FFFFFF`
* Borders/Dividers: `#E5E7EB`
* Success/Warning/Error keep your current tokens but tune focus rings to blue.

**Typography**

* Family: `Inter, ui-sans-serif, system-ui`
* Weights: 300 / 400 / 600 / **800**
* Scale (desktop, mobile scales down proportionally):

  * Display/hero: 56–64 px / 800 / tracking-tight
  * H1: 40 px / 800
  * H2: 28–32 px / 700
  * Body L: 18 px / 400, Body: 16 px / 400, Caption: 12–13 px / 400

**Shape & Motion**

* Radius: inputs 12 px, cards 16 px, chips full/9999 px
* Shadows:

  * Card: `0 20px 45px rgba(2,8,23,.06)`
  * CTA hover: `0 6px 28px rgba(58,98,255,.18)`
  * Focus: dual ring (2 px inner white + 2 px `#BFD0FF`)
* Spacing base 8 px (8/12/16/24/32/48/64)

## 2) Onboarding IA & screens

**Steps**

1. Welcome (expectations + brand promise)
2. Connect accounts (optional/skip)
3. Brand details (required)
4. Preferences & consents
5. Summary & done

**Screen patterns**

* Header: simple brand mark; avoid heavy nav.
* Form card: white surface, 16 px radius, 24–32 px padding, subtle border.
* CTA bar (bottom): Back / Save draft / Continue.

**Component spec**

* **Primary button**: 44–48 px height, 12 px radius, 16 px/600 text, white on blue, hover darkens, press translates Y 1 px, focus ring as above.
* **Inputs**: Label 13 px/600 `#0B0C0D`, placeholder `#9CA3AF`, border `#E5E7EB`, focus dual ring.
* **Stepper**: numbered circular badges; active = blue fill/white icon; completed = neutral (no green).
* **Chips**: selected blue/white, unselected white/gray border.

## 3) Copy (en)

* Welcome: “In a few steps we’ll learn your brand and match the right channels and goals. It takes ~2–3 minutes.”
* Connect accounts (helper): “You can skip this step and connect later.”
* Done: “Preferences saved. Your dashboard will show suggested creators, channels, and a first campaign draft.”

## 4) Screen wiring examples

These snippets assume the React Query hooks that live in `src/lib/api/onboarding.hooks.ts` and the typed REST helpers in `src/lib/api/onboarding.ts`.

### Step 3 — Brand details screen (create brand → profile upsert)

```tsx
import { useCreateBrand } from "@/lib/api/onboarding.hooks";
import { upsertBrandProfile, type BrandProfile } from "@/lib/api/onboarding";

export function BrandDetailsStep({ onComplete }: { onComplete: (brandId: string) => void }) {
  const { mutateAsync: createBrand, isPending } = useCreateBrand();

  const onSubmit = async (values: { name: string; website?: string | null; profile: BrandProfile }) => {
    const brand = await createBrand({ name: values.name, website: values.website ?? null });
    await upsertBrandProfile(brand.id, values.profile);
    onComplete(brand.id);
  };

  return (
    <BrandDetailsForm onSubmit={onSubmit} loading={isPending} />
  );
}
```

### Step 4 — Preferences & consents

```tsx
import { useUpdatePreferences } from "@/lib/api/onboarding.hooks";

export function PreferencesStep({ brandId, onComplete }: { brandId: string; onComplete: () => void }) {
  const { mutateAsync: savePrefs, isPending } = useUpdatePreferences(brandId);

  const handleSubmit = async () => {
    await savePrefs({
      budget_range: "10000-50000",
      campaign_frequency: "monthly",
      content_types: ["image", "video", "story"],
      campaign_goals: ["brand_awareness", "lead_generation", "sales"],
      consents: { marketing_updates: true, terms_ack: true },
    });
    onComplete();
  };

  return <PreferencesForm onSubmit={handleSubmit} loading={isPending} />;
}
```

### Step 5 — Submit + status polling (+ modal logic)

```tsx
import { useSubmitBrand, useBrandStatus, useShouldShowOnboardingModal } from "@/lib/api/onboarding.hooks";
import { isBrandOnboarded } from "@/lib/api/onboarding";

export function SubmissionStep({ brandId }: { brandId: string }) {
  const { mutateAsync: submit, isPending } = useSubmitBrand(brandId);
  const { data: status } = useBrandStatus(brandId, true, 4000);
  const { showModal } = useShouldShowOnboardingModal(brandId);

  const handleSubmit = async () => {
    await submit();
  };

  return (
    <>
      {showModal ? <OnboardingStatusModal status={status} /> : null}
      <SummaryCard
        onSubmit={handleSubmit}
        submitDisabled={isPending || isBrandOnboarded(status)}
        status={status}
      />
    </>
  );
}
```

## 5) Frontend–Backend integration

**Auth & account lifecycle (Django DRF)**

* Register `POST /auth/register` → payload `{email,password,...}` → returns `{user_id}`.
* Login (JWT) `POST /auth/token/obtain` → `{access,refresh}`.
* Refresh `POST /auth/token/refresh`.
* Me `GET /auth/account`; Deactivate `DELETE /auth/account`.

**Brand onboarding workflow (Postman collection you shared)**

* Create brand `POST /api/v1/brands/` (Step 3 submit name/website).
* Update profile `PUT /api/v1/brands/{id}/profile` (industry, size, geo, platforms, KPIs, audience, etc.).
* Social handles `PUT /api/v1/brands/{id}/social-handles`
* Competitors `PUT /api/v1/brands/{id}/competitors`
* Preferences `PUT /api/v1/brands/{id}/campaign-preferences`
* Brand voice `PUT /api/v1/brands/{id}/brand-voice`
* (Optional) Past campaigns init/commit
* Submit `POST /api/v1/brands/{id}/submit`
* Status polling `GET /api/v1/brands/{id}/status`

**Client concerns (Next.js)**

* Global auth context stores `access` + `refresh`; API client adds `Authorization: Bearer <access>`.
* 401 interceptor → refresh → retry. If refresh fails, route to `/login`.
* Save-as-draft: persist form state in `localStorage` per step; restore on load.

**Error/edge cases**

* Unique website conflict → inline field error + help text.
* Normalization (e.g., `x`→`twitter`) → show standardized chips after save.
* Network retry for idempotent PUTs; disable CTA while saving.

**State machine (summary)**
`idle → auth_success → brand_created → profile_saved → prefs_set → submitted → processing → ready`

**Telemetry**

* `onboarding_step_view`, `brand_created`, `profile_saved`, `onboarding_submitted`, `enrichment_job_update`.

**A11y**

* Label/for–id pairs, clear error text, min contrast 4.5:1, `aria-live="polite"` for status.

## 6) Repo placement (matches your tree)

* **Frontend**

  * `/src/styles/tokens.css` (updated)
  * `/src/styles/globals.css` (updated)
  * `/src/styles/distribution.css` (updated)
  * `/src/lib/api/*.ts` already in place; add onboarding endpoints.
* **Backend**

  * As you have under `scan_social/apps/...`; Auth views already defined.

---
## 7) Implementation notes

* `CreateBrandPayload`, `BrandProfile`, and `CampaignPreferences` (with `consents`) mirror the Django serializers so form builders get autocomplete.
* `useShouldShowOnboardingModal` wraps `useBrandStatus` so any screen (e.g., dashboard) can decide whether to force-open the onboarding modal.
* `isBrandOnboarded(status)` prefers the explicit boolean returned by the backend and falls back to the `"ready"` status to keep compatibility.
