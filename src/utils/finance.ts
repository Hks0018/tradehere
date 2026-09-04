/** Pure financial math used by the calculators. All rates are percentages. */

export interface SipYearRow {
  year: number;
  invested: number;
  value: number;
  gain: number;
}

export interface SipResult {
  invested: number;
  futureValue: number;
  returns: number;
  breakdown: SipYearRow[];
}

/**
 * SIP future value with contributions at the start of each month:
 * FV = P × [((1 + i)^n − 1) / i] × (1 + i)
 */
export function calculateSip(
  monthlyAmount: number,
  annualRatePercent: number,
  years: number,
): SipResult {
  const i = annualRatePercent / 100 / 12;
  const breakdown: SipYearRow[] = [];

  for (let year = 1; year <= years; year += 1) {
    const n = year * 12;
    const value =
      i === 0
        ? monthlyAmount * n
        : monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = monthlyAmount * n;
    breakdown.push({
      year,
      invested: round(invested),
      value: round(value),
      gain: round(value - invested),
    });
  }

  const final = breakdown[breakdown.length - 1] ?? { invested: 0, value: 0 };
  return {
    invested: final.invested,
    futureValue: final.value,
    returns: round(final.value - final.invested),
    breakdown,
  };
}

export interface LumpsumResult {
  principal: number;
  maturity: number;
  interest: number;
  breakdown: { year: number; invested: number; value: number; gain: number }[];
}

/** Compound interest: A = P × (1 + r/n)^(n×t) */
export function calculateCompound(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundsPerYear = 4,
): LumpsumResult {
  const r = annualRatePercent / 100;
  const n = compoundsPerYear;
  const breakdown = [];

  for (let year = 1; year <= years; year += 1) {
    const value = principal * Math.pow(1 + r / n, n * year);
    breakdown.push({
      year,
      invested: round(principal),
      value: round(value),
      gain: round(value - principal),
    });
  }

  const maturity = principal * Math.pow(1 + r / n, n * years);
  return {
    principal: round(principal),
    maturity: round(maturity),
    interest: round(maturity - principal),
    breakdown,
  };
}

export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[];
}

/** EMI = P × r × (1 + r)^n / ((1 + r)^n − 1) */
export function calculateEmi(
  principal: number,
  annualRatePercent: number,
  years: number,
): EmiResult {
  const r = annualRatePercent / 100 / 12;
  const n = Math.round(years * 12);
  const emi =
    r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const schedule: EmiResult["schedule"] = [];
  let balance = principal;
  let yearPrincipal = 0;
  let yearInterest = 0;

  for (let month = 1; month <= n; month += 1) {
    const interest = balance * r;
    const principalPart = Math.min(emi - interest, balance);
    balance = Math.max(balance - principalPart, 0);
    yearPrincipal += principalPart;
    yearInterest += interest;

    if (month % 12 === 0 || month === n) {
      schedule.push({
        year: Math.ceil(month / 12),
        principalPaid: round(yearPrincipal),
        interestPaid: round(yearInterest),
        balance: round(balance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  return {
    emi: round(emi),
    totalPayment: round(emi * n),
    totalInterest: round(emi * n - principal),
    principal: round(principal),
    schedule,
  };
}

/** Fixed deposit with quarterly compounding by convention. */
export function calculateFd(
  deposit: number,
  annualRatePercent: number,
  years: number,
  compoundsPerYear = 4,
): LumpsumResult {
  return calculateCompound(deposit, annualRatePercent, years, compoundsPerYear);
}

export interface RetirementResult {
  yearsToRetire: number;
  corpusRequired: number;
  projectedCorpus: number;
  shortfall: number;
  monthlyExpenseAtRetirement: number;
  suggestedMonthlySip: number;
  breakdown: SipYearRow[];
}

/**
 * Retirement projection.
 * 1. Inflate today's monthly expense to the retirement year.
 * 2. Size the corpus from a real (inflation-adjusted) post-retirement return.
 * 3. Project the existing savings + SIP, and back-solve the SIP needed.
 */
export function calculateRetirement(input: {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyExpense: number;
  currentSavings: number;
  monthlyInvestment: number;
  preReturn: number;
  postReturn: number;
  inflation: number;
}): RetirementResult {
  const {
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpense,
    currentSavings,
    monthlyInvestment,
    preReturn,
    postReturn,
    inflation,
  } = input;

  const yearsToRetire = Math.max(retirementAge - currentAge, 0);
  const retirementYears = Math.max(lifeExpectancy - retirementAge, 1);

  const monthlyExpenseAtRetirement =
    monthlyExpense * Math.pow(1 + inflation / 100, yearsToRetire);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // Real rate during retirement.
  const realRate = (1 + postReturn / 100) / (1 + inflation / 100) - 1;
  const corpusRequired =
    Math.abs(realRate) < 1e-6
      ? annualExpenseAtRetirement * retirementYears
      : (annualExpenseAtRetirement * (1 - Math.pow(1 + realRate, -retirementYears))) / realRate;

  const sip = calculateSip(monthlyInvestment, preReturn, Math.max(yearsToRetire, 1));
  const grownSavings = currentSavings * Math.pow(1 + preReturn / 100, yearsToRetire);
  const projectedCorpus = sip.futureValue + grownSavings;

  const i = preReturn / 100 / 12;
  const n = Math.max(yearsToRetire, 1) * 12;
  const gap = Math.max(corpusRequired - grownSavings, 0);
  const suggestedMonthlySip =
    i === 0 ? gap / n : gap / (((Math.pow(1 + i, n) - 1) / i) * (1 + i));

  const breakdown = sip.breakdown.map((row) => ({
    ...row,
    invested: round(row.invested + currentSavings),
    value: round(row.value + currentSavings * Math.pow(1 + preReturn / 100, row.year)),
    gain: round(
      row.value +
        currentSavings * Math.pow(1 + preReturn / 100, row.year) -
        (row.invested + currentSavings),
    ),
  }));

  return {
    yearsToRetire,
    corpusRequired: round(corpusRequired),
    projectedCorpus: round(projectedCorpus),
    shortfall: round(Math.max(corpusRequired - projectedCorpus, 0)),
    monthlyExpenseAtRetirement: round(monthlyExpenseAtRetirement),
    suggestedMonthlySip: round(suggestedMonthlySip),
    breakdown,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
