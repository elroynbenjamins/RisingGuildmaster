import React, { useMemo, useRef } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useGuild } from '../../state/GuildContext';
import { GuideScrollContext } from './GuidedTutorialContext';
import { containsGuideRect } from './guideGeometry';

/** Reveal a newly requested anchor once; subsequent manual scrolling is never fought. */
export function GuidedScrollView(props: ScrollViewProps) {
  const { guild } = useGuild();
  const ref = useRef<ScrollView>(null);
  const viewport = useRef<View>(null);
  const offset = useRef(0);
  const reduceMotion = guild.uiPreferences.reduceMotion;
  const value = useMemo<NonNullable<React.ContextType<typeof GuideScrollContext>>>(() => ({
    visible: (rect, done) => {
      const view = viewport.current;
      if (!view) { done(false); return; }
      view.measureInWindow((x, y, width, height) => done(containsGuideRect({ x, y, width, height }, rect)));
    },
    reveal: node => {
      const scroll = ref.current;
      const view = viewport.current;
      if (!scroll || !view) return;
      view.measureInWindow((_x, viewportY, _width, viewportHeight) => {
        node.measureInWindow((_targetX, targetY, _targetWidth, targetHeight) => {
          if (ref.current !== scroll || viewportHeight <= 0 || targetHeight <= 0) return;
          const delta = targetY < viewportY + 12 ? targetY - viewportY - 12 : targetY + targetHeight > viewportY + viewportHeight - 12 ? targetY + targetHeight - viewportY - viewportHeight + 12 : 0;
          if (Math.abs(delta) > 1) scroll.scrollTo({ y: Math.max(0, offset.current + delta), animated: !reduceMotion });
        });
      });
    },
  }), [reduceMotion]);
  return <GuideScrollContext.Provider value={value}><View ref={viewport} collapsable={false} style={{ flex: 1 }}><ScrollView {...props} ref={ref} scrollEventThrottle={16} onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; props.onScroll?.(event); }}>{props.children}</ScrollView></View></GuideScrollContext.Provider>;
}
