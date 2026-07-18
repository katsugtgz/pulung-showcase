/**
 * Icon-resolver helpers — data-driven lookups from copy keys / transmission
 * types to shared icon components.
 *
 * Split out of `icons.tsx` so react-doctor's `only-export-components` rule
 * stays satisfied (Fast Refresh can preserve state when a `.tsx` file exports
 * only React components; pure-function resolvers belong in a `.ts` file).
 *
 * Consumers continue to import these from `@/components/landing` (re-exported
 * via the barrel); only this file and `icons.tsx` know about the split.
 */

import type { CredibilityIconKey } from "@/lib/copy";
import type { TransmissionType } from "@/lib/catalog-data";
import {
  CalendarIcon,
  ManualTransmissionIcon,
  MaticTransmissionIcon,
  MixedTransmissionIcon,
  ShieldIcon,
  SteerIcon,
} from "./icons";

export function credibilityIconByKey(
  key: CredibilityIconKey,
): typeof ShieldIcon {
  switch (key) {
    case "shield":
      return ShieldIcon;
    case "calendar":
      return CalendarIcon;
    case "steer":
      return SteerIcon;
  }
}

export function transmissionIconByKey(
  key: TransmissionType,
): typeof ManualTransmissionIcon {
  switch (key) {
    case "manual":
      return ManualTransmissionIcon;
    case "matic":
      return MaticTransmissionIcon;
    case "mixed":
      return MixedTransmissionIcon;
  }
}
