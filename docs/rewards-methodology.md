# Rewards methodology

## Scope

US cards, USD, one billing-cycle forecast. Spending is eligible purchases net of refunds, excluding interest, fees and cash-like transactions. Online groceries and ordinary groceries must not overlap. Travel means ordinary travel purchases, not issuer portal purchases. Merchant coding ultimately determines bonus eligibility.

The catalog records official issuer URLs and verification dates. Values in cents per point are user-editable assumptions, not issuer promises. Card rates and scope are displayed in the wallet.

## Optimizer

For non-Bilt cards, allocate each category to the highest objective return. Value is earning rate times assumed point value, or actual cash-back percentage. A points objective counts only the selected currency; ties use estimated value. Different points currencies are never summed for ranking.

For Bilt, evaluate both housing-only and Flexible Cash modes. For each mode, sort spending categories by the opportunity cost of assigning them to Bilt rather than their best alternative. Evaluate category boundaries, zero/all spending and housing tier or rent-unlock thresholds. Category splits are allowed across purchases. Choose the highest-scoring plan, using estimated value to break score ties. Amounts are normalized to cents; actual issuer reward rounding may differ.

## Bilt

- Palladium base earning: 2 points per eligible everyday dollar.
- Housing-only ratio thresholds: 25% → 0.5×, 50% → 0.75×, 75% → 1×, 100% → 1.25×; 250-point floor below 25% when eligible rent is positive.
- Flexible Cash: 4% restricted Cash on everyday spend. Redeem $0.03 Cash per housing point, up to 1× rent. Redemption is optional and chosen according to the objective and opportunity cost.
- Recurring forecast: the previous cycle is assumed to have identical allocated Bilt spending and to fund the next rent unlock. Cash leftover is a per-cycle residual, not an annual balance forecast.
- Next-payment forecast: only the entered existing Cash balance funds rent; newly earned Cash is left for later. Existing Cash itself is not counted as new earnings.
- Value = everyday reward value + housing point value + (new Cash − redeemed Cash) × usable Cash fraction. This accounts for the opportunity cost of redeeming existing restricted Cash.

Mode changes generally apply the following billing cycle; posted purchases define the ratio. Eligible rent must be paid through Bilt with the required linked bank account and account in good standing.

## Exclusions

Point accelerators, transfer bonuses, partner promotions, annual Cash grants, elite milestones, welcome bonuses, issuer portal bonuses, anniversary bonuses, fees, interest and annual benefits are excluded. Existing annual fees are fixed across allocations and not subtracted from monthly marginal rewards. No annual projection is offered. Custom cards support uncapped rates only; rotating categories and annual spending caps are not supported. Bilt Cash expiration and redemption caps make repeated or annual forecasts different from this single-cycle model.

## Privacy

Scenario inputs remain in browser memory unless explicitly saved to localStorage. Saved scenarios contain spending totals and card settings, can be loaded only on the same browser/device and can be deleted through the interface. No card numbers or bank credentials are requested. Do not save scenarios on a shared device unless appropriate.
