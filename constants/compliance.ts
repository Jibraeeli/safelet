/**
 * SafeLet compliance data.
 *
 * The 10 legal obligations a small UK landlord must be able to prove under the
 * Renters Rights Act 2026. Each item is written in plain English so a landlord
 * with no legal background can understand what is required, why, and how to fix
 * a gap.
 *
 * Fine amounts are stored as strings because several are expressed as ranges or
 * multiples (e.g. "Up to 3x the deposit") rather than single figures.
 */

export type ComplianceFrequency =
  | 'once'
  | 'annual'
  | 'every5Years'
  | 'every10Years'
  | 'atTenancyStart'
  | 'within30DaysOfDeposit'
  | 'comingSoon';

export interface ComplianceItem {
  /** Stable identifier, safe to use as a database key. */
  id: string;
  /** Short human-readable name shown in the UI. */
  name: string;
  /** Plain-English explanation of what the obligation is. */
  description: string;
  /** Why a landlord should care - the risk of getting it wrong. */
  whyItMatters: string;
  /** Maximum penalty, stored as a string to allow ranges and multiples. */
  fineAmount: string;
  /** Ordered, actionable steps a landlord can follow to become compliant. */
  howToFix: string[];
  /** How often the obligation must be met or renewed. */
  frequency: ComplianceFrequency;
  /** Days before expiry to send a renewal reminder (0 if it never expires). */
  reminderDays: number;
  /** Whether the tenant must acknowledge receipt for this to count as met. */
  requiresTenantAcknowledgement: boolean;
}

export const complianceItems: ComplianceItem[] = [
  {
    id: 'renters-rights-sheet',
    name: 'Renters Rights Information Sheet',
    description:
      'A standard information sheet, published by the government, that sets out a tenant’s key rights under the Renters Rights Act 2026. You must give it to the tenant at the start of the tenancy.',
    whyItMatters:
      'It is a new legal duty under the Renters Rights Act 2026. If you cannot prove the tenant received it, you can be fined and your ability to regain possession may be affected.',
    fineAmount: 'Up to £7,000',
    howToFix: [
      'Download the latest Renters Rights Information Sheet from GOV.UK.',
      'Give the current version to the tenant at or before the start of the tenancy.',
      'Ask the tenant to acknowledge receipt, in writing or in the app.',
      'Save a dated copy alongside the tenant’s acknowledgement.',
    ],
    frequency: 'atTenancyStart',
    reminderDays: 0,
    requiresTenantAcknowledgement: true,
  },
  {
    id: 'gas-safety',
    name: 'Gas Safety Certificate',
    description:
      'An annual safety check of all gas appliances, flues and pipework in the property, carried out by a Gas Safe registered engineer, recorded on a CP12 certificate.',
    whyItMatters:
      'Unsafe gas appliances can cause fires, explosions and carbon monoxide poisoning. The check is a legal requirement and a missing or out-of-date certificate can block eviction and lead to prosecution.',
    fineAmount: 'Up to £6,000',
    howToFix: [
      'Book a Gas Safe registered engineer to inspect every gas appliance and flue.',
      'Obtain the CP12 Gas Safety Record once the check is complete.',
      'Give a copy to the tenant within 28 days (or before they move in).',
      'Set a reminder to renew the check before the 12-month expiry.',
    ],
    frequency: 'annual',
    reminderDays: 30,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'eicr',
    name: 'Electrical Check (EICR)',
    description:
      'An Electrical Installation Condition Report (EICR) is an inspection of the property’s fixed wiring and electrical installations by a qualified electrician, required at least every 5 years.',
    whyItMatters:
      'Faulty wiring is a major cause of house fires and electric shocks. Without a valid EICR you are breaking the law and local councils can take enforcement action.',
    fineAmount: 'Up to £30,000',
    howToFix: [
      'Hire a qualified, registered electrician to carry out an EICR.',
      'Ensure any C1 or C2 faults are remedied and obtain written confirmation.',
      'Give a copy of the report to the tenant within 28 days.',
      'Renew the inspection at least every 5 years, or sooner if the report requires it.',
    ],
    frequency: 'every5Years',
    reminderDays: 60,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'epc',
    name: 'Energy Performance Certificate',
    description:
      'An Energy Performance Certificate (EPC) rates how energy-efficient the property is from A to G. A valid EPC must be in place before the property is marketed or let, and lasts 10 years.',
    whyItMatters:
      'You cannot legally let a property without a valid EPC, and minimum energy efficiency standards mean a poor rating can stop you letting at all. A missing EPC can also block possession.',
    fineAmount: 'Up to £5,000',
    howToFix: [
      'Book an accredited Domestic Energy Assessor to produce an EPC.',
      'Check the rating meets the current minimum energy efficiency standard.',
      'Make any improvements needed to reach the required rating.',
      'Give the certificate to the tenant and renew it within 10 years.',
    ],
    frequency: 'every10Years',
    reminderDays: 90,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'smoke-co-alarms',
    name: 'Smoke and CO Alarms',
    description:
      'At least one smoke alarm on every storey and a carbon monoxide alarm in any room with a fixed combustion appliance (such as a boiler or wood burner). All alarms must be tested and working at the start of the tenancy.',
    whyItMatters:
      'Working alarms save lives by giving early warning of fire and carbon monoxide. Failing to provide and test them is a breach of the regulations that councils actively enforce.',
    fineAmount: 'Up to £5,000',
    howToFix: [
      'Fit a smoke alarm on every storey of the property.',
      'Fit a carbon monoxide alarm in every room with a fixed combustion appliance.',
      'Test every alarm is working on the day the tenancy starts.',
      'Record the test, and replace faulty alarms immediately when reported.',
    ],
    frequency: 'atTenancyStart',
    reminderDays: 0,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'deposit-protection',
    name: 'Deposit Protection',
    description:
      'Any tenancy deposit you take must be protected in a government-approved deposit protection scheme, and the prescribed information given to the tenant, within 30 days of receiving it.',
    whyItMatters:
      'If a deposit is not protected in time you can be ordered to pay the tenant up to three times the deposit, and you lose the right to evict using a Section 21 notice.',
    fineAmount: 'Up to 3x the deposit',
    howToFix: [
      'Register the deposit with an approved scheme within 30 days of receiving it.',
      'Serve the prescribed information to the tenant within the same 30 days.',
      'Keep the scheme certificate and proof the tenant received the information.',
      'Return the deposit through the scheme’s process at the end of the tenancy.',
    ],
    frequency: 'within30DaysOfDeposit',
    reminderDays: 7,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'how-to-rent',
    name: 'How to Rent Guide',
    description:
      'The government’s “How to Rent” checklist explains the renting process and tenant rights. The current version must be given to the tenant at the start of the tenancy.',
    whyItMatters:
      'If you cannot prove you served the correct, up-to-date guide, you may be unable to regain possession of your property using a Section 8 notice.',
    fineAmount: 'Blocks Section 8 possession',
    howToFix: [
      'Download the current “How to Rent” guide from GOV.UK.',
      'Give it to the tenant at or before the start of the tenancy.',
      'Re-serve the latest version whenever the tenancy is renewed and the guide has changed.',
      'Ask the tenant to acknowledge receipt and keep a dated copy.',
    ],
    frequency: 'atTenancyStart',
    reminderDays: 0,
    requiresTenantAcknowledgement: true,
  },
  {
    id: 'right-to-rent',
    name: 'Right to Rent Check',
    description:
      'A check that every adult tenant has the legal right to rent in the UK, carried out by viewing original documents or using the online check, before the tenancy starts.',
    whyItMatters:
      'Letting to someone without the right to rent is a criminal matter. Civil penalties apply per tenant, and repeated breaches can lead to prosecution.',
    fineAmount: 'Up to £10,000 per tenant',
    howToFix: [
      'Check the right to rent of every adult who will live in the property.',
      'View and verify original documents, or complete the Home Office online check.',
      'Keep dated copies of the documents or the online check result.',
      'Set a reminder to re-check any tenant with time-limited permission to stay.',
    ],
    frequency: 'atTenancyStart',
    reminderDays: 0,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'tenancy-agreement',
    name: 'Written Tenancy Agreement',
    description:
      'A written agreement setting out the terms of the tenancy, signed at the start of the tenancy. Under the Renters Rights Act 2026 tenancies move to a periodic structure, so the written terms must reflect the new rules.',
    whyItMatters:
      'Without a compliant written agreement your terms may be unenforceable, and you may be unable to rely on a Section 8 notice to regain possession.',
    fineAmount: 'Blocks Section 8 possession',
    howToFix: [
      'Use a tenancy agreement template that reflects the Renters Rights Act 2026.',
      'Complete the property, parties, rent and term details accurately.',
      'Have both landlord and tenant sign and date the agreement at the start.',
      'Give the tenant a signed copy and keep one for your records.',
    ],
    frequency: 'atTenancyStart',
    reminderDays: 0,
    requiresTenantAcknowledgement: false,
  },
  {
    id: 'prs-database',
    name: 'PRS Database Registration',
    description:
      'A new Private Rented Sector (PRS) database where landlords and their properties must be registered. This requirement is being introduced under the Renters Rights Act 2026 and is expected to come into force in 2027.',
    whyItMatters:
      'Once active, you will not be able to legally market or let a property, or use possession grounds, unless you and the property are registered on the PRS database.',
    fineAmount: 'Up to £7,000',
    howToFix: [
      'Watch for the official launch of the PRS database in 2027.',
      'Register yourself as a landlord once the service goes live.',
      'Register each property you let and keep the entries up to date.',
      'Keep your registration reference as proof of compliance.',
    ],
    frequency: 'comingSoon',
    reminderDays: 0,
    requiresTenantAcknowledgement: false,
  },
];

export default complianceItems;
