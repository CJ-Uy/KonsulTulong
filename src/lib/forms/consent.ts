/**
 * Canonical consent text and version, stored as-shown for each patient response.
 *
 * Updating the wording must bump CONSENT_VERSION. Past responses keep a hash of
 * the exact text they accepted, so re-displaying old wording is unnecessary.
 */
export const CONSENT_VERSION = "2026-05-19";

export const CONSENT_TEXT_EN = `By continuing you agree that this clinic may collect the answers you provide here and use them only for your current consultation. The clinic stores this information securely and will not share it without your consent, except where required by law. You may ask the clinic to delete your record at any time.`;

export const CONSENT_TEXT_FIL = `Sa pagpapatuloy, sumasang-ayon ka na maaaring kolektahin ng klinikang ito ang iyong mga sagot at gamitin lamang ito para sa kasalukuyang konsultasyon. Ligtas itong itatabi at hindi ibabahagi nang walang pahintulot mo, maliban kung kinakailangan ng batas. Maaari kang humiling ng pagbura ng iyong record anumang oras.`;

export const CONSENT_TEXT_CEB = `Pinaagi sa pagpadayon, mosugot ka nga ang klinik makakuha sa imong mga tubag ug magamit lang ang mga ini para sa imong konsultasyon karon. Tinipigan kini sa luwas, ug dili kini ipaambit kung wala ka motugot, gawas kung gikinahanglan sa balaod. Mahimo nimong hangyoon ang pagbug-os sa imong record sa bisan unsang panahon.`;
