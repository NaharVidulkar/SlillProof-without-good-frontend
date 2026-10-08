/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AssessmentsList } from './assessments/AssessmentsList.tsx';
import { AssessmentDetail } from './assessments/AssessmentDetail.tsx';
import { AssessmentAttemptView } from './assessments/AssessmentAttemptView.tsx';
import { AssessmentResultView } from './assessments/AssessmentResultView.tsx';
import { AssessmentResult } from '../../lib/server/assessments/types.ts';

interface AssessmentViewProps {
  onComplete?: () => void;
  onNavigateToPassport?: () => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onComplete,
  onNavigateToPassport,
}) => {
  // Navigation states: 'list' | 'detail' | 'attempt' | 'result'
  const [subView, setSubView] = useState<'list' | 'detail' | 'attempt' | 'result'>('list');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('python-fundamentals');
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [completedResult, setCompletedResult] = useState<AssessmentResult | null>(null);

  const handleSelectAssessment = (id: string) => {
    setSelectedAssessmentId(id);
    setSubView('detail');
  };

  const handleStartAttempt = (attemptId: string) => {
    setActiveAttemptId(attemptId);
    setSubView('attempt');
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
