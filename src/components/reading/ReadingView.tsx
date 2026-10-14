import { useEffect, useRef } from 'react';
import type { ReadingSession } from '../../app/useReadingSession';
import type { NoticeKind } from '../layout/NoticeModal';
import { GenerationSequence } from './generation/GenerationSequence';
import { Report } from './report/Report';
import { ReadingWizard } from './wizard/ReadingWizard';
import './ReadingView.css';

interface ReadingViewProps {
  session: ReadingSession;
  reducedMotion: boolean;
  onOpenNotice: (notice: NoticeKind) => void;
}

export function ReadingView({ session, reducedMotion, onOpenNotice }: ReadingViewProps) {
  const { stage, reading } = session;
  const previousStage = useRef(stage);

  // Land at the top whenever the reading appears or a new one begins.
  useEffect(() => {
    if (previousStage.current !== stage && stage !== 'generating') {
      const root = document.documentElement;
      const behaviour = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.style.scrollBehavior = behaviour;
    }
    previousStage.current = stage;
  }, [stage]);

  return (
    <div className="reading-view">
      {stage === 'report' && reading ? (
        <Report
          reading={reading}
          premium={session.premium}
          reducedMotion={reducedMotion}
          onUnlockPremium={session.unlockPremium}
          onNewReading={session.reset}
          onOpenNotice={onOpenNotice}
        />
      ) : (
        <ReadingWizard session={session} onOpenNotice={onOpenNotice} />
      )}
      {stage === 'generating' && (
        <GenerationSequence
          input={session.input}
          reducedMotion={reducedMotion}
          onComplete={session.completeGeneration}
          onError={session.failGeneration}
        />
      )}
    </div>
  );
}
