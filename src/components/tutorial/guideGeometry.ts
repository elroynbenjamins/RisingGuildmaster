export interface GuideRect { x: number; y: number; width: number; height: number }
export function validGuideRect(rect: GuideRect): boolean {
  return [rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) && rect.width > 0 && rect.height > 0;
}
export function containsGuideRect(viewport: GuideRect, target: GuideRect): boolean {
  return validGuideRect(viewport) && validGuideRect(target) && target.x >= viewport.x - 1 && target.y >= viewport.y - 1 && target.x + target.width <= viewport.x + viewport.width + 1 && target.y + target.height <= viewport.y + viewport.height + 1;
}
/** Convert native window coordinates to the overlay's safe-area-relative coordinates. */
export function relativeGuideRect(target: GuideRect, root: GuideRect): GuideRect | null {
  if (!containsGuideRect(root, target)) return null;
  const x = Math.max(0, target.x - root.x);
  const y = Math.max(0, target.y - root.y);
  return { x, y, width: Math.min(target.width, root.width - x), height: Math.min(target.height, root.height - y) };
}
export function guideCardPlacement(target: GuideRect, width: number, height: number, desiredHeight: number): GuideRect | null {
  if (!validGuideRect(target) || !Number.isFinite(width) || !Number.isFinite(height) || width < 180 || height < 180 || !Number.isFinite(desiredHeight) || desiredHeight <= 0) return null;
  if (!containsGuideRect({ x: 0, y: 0, width, height }, target)) return null;
  const margin = 10;
  const gap = 12;
  const above = Math.max(0, target.y - gap - margin);
  const below = Math.max(0, height - (target.y + target.height) - gap - margin);
  const useAbove = above >= desiredHeight || above >= below;
  const available = useAbove ? above : below;
  if (available < 130) return null; // Never cover the target to force a tooltip to fit.
  const cardHeight = Math.min(desiredHeight, available);
  const cardWidth = Math.min(360, width - margin * 2);
  const x = Math.max(margin, Math.min(target.x + target.width / 2 - cardWidth / 2, width - margin - cardWidth));
  const y = useAbove ? target.y - gap - cardHeight : target.y + target.height + gap;
  return { x, y, width: cardWidth, height: cardHeight };
}
