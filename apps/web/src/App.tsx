import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { AvatarBuilderScreen } from './screens/AvatarBuilderScreen';
import { AssessmentIntroScreen } from './screens/AssessmentIntroScreen';
import { AssessmentScreen } from './screens/AssessmentScreen';
import { AssessmentResultsScreen } from './screens/AssessmentResultsScreen';
import { GamePlayScreen } from './screens/GamePlayScreen';
import { SoccerShotScreen } from './screens/SoccerShotScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LockerScreen } from './screens/LockerScreen';
import { ParentScreen } from './screens/ParentScreen';
import { DesignScreen } from './screens/DesignScreen';
import { HomeScreen } from './screens/HomeScreen';
import { DemoScreen } from './screens/DemoScreen';

function GameRouter() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'setup':
      return <SetupScreen />;
    case 'avatar-builder':
      return <AvatarBuilderScreen />;
    case 'assessment-intro':
      return <AssessmentIntroScreen />;
    case 'assessment':
      return <AssessmentScreen />;
    case 'assessment-results':
      return <AssessmentResultsScreen />;
    case 'playing':
      return <GamePlayScreen />;
    case 'soccer-shot':
      return <SoccerShotScreen />;
    case 'reward':
      return <GamePlayScreen />;
    case 'progress':
      return <ProgressScreen />;
    case 'locker':
      return <LockerScreen />;
    default:
      return <WelcomeScreen />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play" element={<GameRouter />} />
        <Route path="/design" element={<DesignScreen />} />
        <Route path="/demo" element={<DemoScreen />} />
        <Route path="/parent" element={<ParentScreen />} />
        <Route path="/avatar" element={<AvatarBuilderScreen />} />
        <Route path="/locker" element={<LockerScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
