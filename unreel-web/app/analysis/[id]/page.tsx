import AnalysisClient from './AnalysisClient';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AnalysisClient />
    </Suspense>
  );
}
