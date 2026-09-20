import { REVIEW_ART, ReviewArtwork } from "../art/ReviewArtwork";
import React from "react";
import type { HeroGender } from "../../data/heroes/heroPortraits";
import type { ClassId, RaceId } from "../../game/heroes/types";

export function HeroPortrait({ raceId, classId, gender, variant = 0, label, size = 84 }: { raceId: RaceId; classId: ClassId; gender: HeroGender; variant?: 0 | 1 | 2 | 3 | 4; label: string; size?: number }) {
  const normalizedVariant: 1 | 2 | 3 | 4 = variant === 2 || variant === 3 || variant === 4 ? variant : 1;
  const replacementId = `${raceId}-${classId}-${gender}-v${normalizedVariant}`;
  return <ReviewArtwork id={REVIEW_ART[replacementId] ? replacementId : undefined} label={label} size={size} />;
}
