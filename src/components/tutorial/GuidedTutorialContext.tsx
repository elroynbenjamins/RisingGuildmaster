import React, { createContext, useContext, useLayoutEffect, useRef } from 'react';
import { Pressable, View, type PressableProps } from 'react-native';
import type { GuideTab, GuideAction } from '../../game/onboarding/guidedTourService';
import type { GuideRect } from './guideGeometry';

export interface GuideAnchor {
  token: object;
  measure(done: (rect: GuideRect | null) => void): void;
  reveal?(): void;
}
export interface GuidedTutorialContextValue {
  register(id: string, anchor: GuideAnchor): () => void;
  enterMainTab(tab: GuideTab): () => void;
  dispatch(action: GuideAction): void;
  finishNavigation(tour: 'quests'): void;
}
export const GuidedTutorialContext = createContext<GuidedTutorialContextValue | null>(null);
export const GuideScrollContext = createContext<{
  reveal(node: View): void;
  visible(rect: GuideRect, done: (visible: boolean) => void): void;
} | null>(null);

/** Attach directly to a native View/Pressable: no wrapper that could change layout. */
export function useGuideTarget(id?: string, enabled = true) {
  const guide = useContext(GuidedTutorialContext);
  const scroll = useContext(GuideScrollContext);
  const ref = useRef<View>(null);
  const register = guide?.register;
  useLayoutEffect(() => {
    if (!id || !enabled || !register) return;
    const token = {};
    return register(id, {
      token,
      measure: done => {
        const node = ref.current;
        if (!node) { done(null); return; }
        node.measureInWindow((x, y, width, height) => {
          const rect = { x, y, width, height };
          if (!ref.current) { done(null); return; }
          if (scroll) scroll.visible(rect, visible => done(visible ? rect : null));
          else done(rect);
        });
      },
      reveal: () => { if (ref.current) scroll?.reveal(ref.current); },
    });
  }, [id, enabled, register, scroll]);
  return ref;
}

export function GuidePressable({ guideId, ...props }: PressableProps & { guideId?: string }) {
  const ref = useGuideTarget(guideId, !props.disabled);
  return <Pressable {...props} ref={ref} collapsable={false} />;
}
