// Landing-page section components. Composed in src/app/(public)/page.tsx.
export { Header } from "./header";
export { Hero } from "./hero";
export { CredibilityStrip } from "./credibility-strip";
export { CaraKerja } from "./cara-kerja";
export { Packages } from "./packages";
export { ExperienceBand } from "./experience-band";
export { LocationPicker } from "./location-picker";
export { Testimonials } from "./testimonials";
export { SocialCards } from "./social-cards";
export { Faq } from "./faq";
export { FinalCta } from "./final-cta";
export { Footer } from "./footer";
export { Reveal } from "./reveal";
export { StickyCta } from "./sticky-cta";

// Shared icon vocabulary (issue #50). Section authors import these from
// `@/components/landing` rather than re-declaring inline SVGs.
export {
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  InstagramIcon,
  ManualTransmissionIcon,
  MaticTransmissionIcon,
  MixedTransmissionIcon,
  NumberBadge,
  PinIcon,
  ShieldIcon,
  StarIcon,
  SteerIcon,
  TiktokIcon,
  WhatsappIcon,
} from "./icons";

// Pure-function icon resolvers (kept in a .ts file so react-doctor's
// only-export-components rule stays satisfied by icons.tsx).
export {
  credibilityIconByKey,
  transmissionIconByKey,
} from "./icon-resolvers";
