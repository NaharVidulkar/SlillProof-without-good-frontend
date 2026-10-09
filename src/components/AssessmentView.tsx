/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AssessmentsList } from './assessments/AssessmentsList.tsx';
import { AssessmentDetail } from './assessments/AssessmentDetail.tsx';
import { AssessmentAttemptView } from './assessments/AssessmentAttemptView.tsx';
import { AssessmentResultView } from './assessments/AssessmentResultView.tsx';
import { AssessmentResult } from '../../lib/server/assessments/types.ts';

interface AssessmentViewProps {
  onComplete?: () => void;
  onNavigateToPassport?: () => void;
  onAttemptModeChange?: (inAttempt: boolean) => void;
  initialAttemptId?: string | null;
  initialAssessmentId?: string;
  initialSubView?: 'list' | 'detail' | 'attempt';
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onComplete,
  onNavigateToPassport,
  onAttemptModeChange,
  initialAttemptId = null,
  initialAssessmentId = 'python-fundamentals',
  initialSubView,
}) => {
  // Navigation states: 'list' | 'detail' | 'attempt' | 'result'
  const [subView, setSubView] = useState<'list' | 'detail' | 'attempt' | 'result'>(
    initialAttemptId ? 'attempt' : (initialSubView || 'list')
  );
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(initialAssessmentId);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(initialAttemptId);
  const [targetQuestionIndex, setTargetQuestionIndex] = useState<number>(0);
  const [completedResult, setCompletedResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    if (initialAttemptId) {
      setActiveAttemptId(initialAttemptId);
      setSubView('attempt');
    }
  }, [initialAttemptId]);

  useEffect(() => {
    if (initialAssessmentId) {
      setSelectedAssessmentId(initialAssessmentId);
    }
  }, [initialAssessmentId]);

  const lastAttemptModeRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    const isAttempt = subView === 'attempt';
    if (lastAttemptModeRef.current !== isAttempt) {
      lastAttemptModeRef.current = isAttempt;
      onAttemptModeChange?.(isAttempt);
    }
  }, [subView, onAttemptModeChange]);

  const handleSelectAssessment = (id: string) => {
    setSelectedAssessmentId(id);
    setSubView('detail');
    window.history.pushState(null, '', `/assessments/${id}`);
  };

  const handleStartAttempt = (attemptId: string, questionIndex = 0) => {
    setActiveAttemptId(attemptId);
    setTargetQuestionIndex(questionIndex);
    setSubView('attempt');
    window.history.pushState(null, '', `/assessments/${selectedAssessmentId}/attempt/${attemptId}`);
  };

  const handleFinishAttempt = (result: AssessmentResult) => {
    setCompletedResult(result);
    setSubView('result');
    onComplete?.();
  };

  const handleBackToList = () => {
    setSubView('list');
    setActiveAttemptId(null);
    setCompletedResult(null);
    window.history.pushState(null, '', '/assessments');
  };

  return (
    <div className="w-full">
      {subView === 'list' && (
        <AssessmentsList onSelectAssessment={handleSelectAssessment} />
      )}

      {subView === 'detail' && (
        <AssessmentDetail
          assessmentId={selectedAssessmentId}
          onBack={handleBackToList}
          onStartAttempt={handleStartAttempt}
        />
      )}

      {subView === 'attempt' && activeAttemptId && (
        <AssessmentAttemptView
          attemptId={activeAttemptId}
          initialQuestionIndex={targetQuestionIndex}
          onFinish={handleFinishAttempt}
          onExit={handleBackToList}
        />
      )}

      {subView === 'result' && completedResult && (
        <AssessmentResultView
          result={completedResult}
          onBackToAssessments={handleBackToList}
          onNavigateToPassport={onNavigateToPassport}
        />
      )}
    </div>
  );
};
