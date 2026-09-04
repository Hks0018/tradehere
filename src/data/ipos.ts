import type { Ipo } from "@/types";

/**
 * DEMO DATA — sample IPO records created for this prototype. Company names,
 * price bands and dates are illustrative and do not describe real offerings.
 */
export const IPOS: Ipo[] = [
  {
    id: "ipo-01", company: "Aeris Renewable Power", sector: "Renewable Energy", status: "Open",
    priceBand: { min: 382, max: 402 }, lotSize: 36, issueSize: 24800000000,
    openDate: "2026-09-02", closeDate: "2026-09-05", subscriptionTimes: 18.4,
    summary: "A utility-scale solar and wind developer raising primary capital to fund a 2.4 GW project pipeline and reduce project-level debt.",
  },
  {
    id: "ipo-02", company: "Vireo Speciality Chemicals", sector: "Chemicals", status: "Open",
    priceBand: { min: 214, max: 228 }, lotSize: 65, issueSize: 9600000000,
    openDate: "2026-09-03", closeDate: "2026-09-08", subscriptionTimes: 6.2,
    summary: "A manufacturer of fluorine-based speciality intermediates for agrochemical and pharmaceutical customers, expanding capacity at two existing sites.",
  },
  {
    id: "ipo-03", company: "Kestrel Logistics Networks", sector: "Logistics", status: "Open",
    priceBand: { min: 148, max: 156 }, lotSize: 95, issueSize: 14200000000,
    openDate: "2026-09-01", closeDate: "2026-09-04", subscriptionTimes: 32.8,
    summary: "An asset-light freight aggregation platform connecting shippers with a verified carrier network across twenty-two states.",
  },
  {
    id: "ipo-04", company: "Halcyon Diagnostics", sector: "Healthcare", status: "Upcoming",
    priceBand: { min: 640, max: 674 }, lotSize: 22, issueSize: 18600000000,
    openDate: "2026-09-11", closeDate: "2026-09-15",
    summary: "A pathology and radiology chain operating 148 laboratories, with proceeds earmarked for network expansion into tier-two cities.",
  },
  {
    id: "ipo-05", company: "Orbit Semiconductor Systems", sector: "Technology Hardware", status: "Upcoming",
    priceBand: { min: 918, max: 962 }, lotSize: 15, issueSize: 42400000000,
    openDate: "2026-09-16", closeDate: "2026-09-19",
    summary: "A fabless designer of power-management integrated circuits for automotive and industrial applications, listing to fund a new design centre.",
  },
  {
    id: "ipo-06", company: "Tessera Home Interiors", sector: "Consumer Durables", status: "Upcoming",
    priceBand: { min: 268, max: 284 }, lotSize: 52, issueSize: 7800000000,
    openDate: "2026-09-18", closeDate: "2026-09-22",
    summary: "A modular furniture and interiors brand with an owned manufacturing base and a franchise-led retail expansion plan.",
  },
  {
    id: "ipo-07", company: "Quanta Payment Infrastructure", sector: "Financial Technology", status: "Upcoming",
    priceBand: { min: 486, max: 512 }, lotSize: 29, issueSize: 31200000000,
    openDate: "2026-09-24", closeDate: "2026-09-27",
    summary: "A merchant-acquiring and payment-gateway operator processing transactions for small and medium businesses, raising growth capital.",
  },
  {
    id: "ipo-08", company: "Brightwater Marine Foods", sector: "Agriculture", status: "Listed",
    priceBand: { min: 172, max: 182 }, lotSize: 82, issueSize: 6400000000,
    openDate: "2026-08-12", closeDate: "2026-08-14", listingDate: "2026-08-20",
    listingPrice: 214.5, currentPrice: 238.4, subscriptionTimes: 44.2,
    summary: "An integrated aquaculture and seafood processing exporter serving North American and European retail customers.",
  },
  {
    id: "ipo-09", company: "Ferrum Precision Components", sector: "Auto Components", status: "Listed",
    priceBand: { min: 324, max: 342 }, lotSize: 43, issueSize: 11800000000,
    openDate: "2026-08-05", closeDate: "2026-08-08", listingDate: "2026-08-13",
    listingPrice: 368.0, currentPrice: 341.2, subscriptionTimes: 12.6,
    summary: "A precision machining supplier of transmission and braking components to domestic and export original-equipment manufacturers.",
  },
  {
    id: "ipo-10", company: "Lumen Education Group", sector: "Education", status: "Listed",
    priceBand: { min: 96, max: 104 }, lotSize: 144, issueSize: 4200000000,
    openDate: "2026-07-28", closeDate: "2026-07-31", listingDate: "2026-08-05",
    listingPrice: 98.6, currentPrice: 86.4, subscriptionTimes: 2.8,
    summary: "A vocational skilling and test-preparation provider operating both physical centres and an online learning platform.",
  },
  {
    id: "ipo-11", company: "Sable Infrastructure Trust", sector: "Infrastructure", status: "Listed",
    priceBand: { min: 428, max: 452 }, lotSize: 33, issueSize: 28600000000,
    openDate: "2026-07-15", closeDate: "2026-07-18", listingDate: "2026-07-24",
    listingPrice: 486.2, currentPrice: 524.8, subscriptionTimes: 26.4,
    summary: "A road and transmission asset holding platform distributing operating cash flows from a portfolio of concession assets.",
  },
  {
    id: "ipo-12", company: "Nimbus Cloud Services", sector: "Information Technology", status: "Listed",
    priceBand: { min: 748, max: 786 }, lotSize: 19, issueSize: 22400000000,
    openDate: "2026-07-08", closeDate: "2026-07-11", listingDate: "2026-07-17",
    listingPrice: 842.0, currentPrice: 918.6, subscriptionTimes: 38.9,
    summary: "A managed cloud and data-centre operator with hybrid infrastructure contracts across regulated industries.",
  },
];
