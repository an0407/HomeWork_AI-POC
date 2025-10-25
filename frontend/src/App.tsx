import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { DashboardPage } from './pages/DashboardPage'
import { ScanHomeworkPage } from './pages/ScanHomeworkPage'
import { SolutionPage } from './pages/SolutionPage'
import { PracticeConfigPage } from './pages/PracticeConfigPage'
import { PracticeTestPage } from './pages/PracticeTestPage'
import { PracticeResultsPage } from './pages/PracticeResultsPage'
import { FlashcardsLibraryPage } from './pages/FlashcardsLibraryPage'
import { FlashcardStudyPage } from './pages/FlashcardStudyPage'
import { LibraryPage } from './pages/LibraryPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan" element={<ScanHomeworkPage />} />
          <Route path="/solution/:id" element={<SolutionPage />} />
          <Route path="/practice" element={<PracticeConfigPage />} />
          <Route path="/practice/test/:id" element={<PracticeTestPage />} />
          <Route path="/practice/results/:id" element={<PracticeResultsPage />} />
          <Route path="/flashcards" element={<FlashcardsLibraryPage />} />
          <Route path="/flashcards/study/:id" element={<FlashcardStudyPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
