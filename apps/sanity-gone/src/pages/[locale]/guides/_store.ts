import { atom, computed, action } from "nanostores";
import type * as OutputTypes from "../../../types/output-types.ts";

export const operatorsStore = atom<Record<string, OutputTypes.Operator>>(
    typeof window !== "undefined"
        ?  (window as any).operators
        : {}
)