import { useState } from 'react'
import type { Card, AppMode, StudyResult } from './types'
import { useCards } from './hooks/useCards'
import { CardList } from './components/CardList/CardList'
import { CardEditor } from './components/CardEditor/CardEditor'
import { StudyMode } from './components/StudyMode/StudyMode'
import { Summary } from './components/Summary/Summary'

function App() {
  const { cards, addCard, updateCard, deleteCard, importCards } = useCards()
  const [mode, setMode] = useState<AppMode>('list')
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [studyResult, setStudyResult] = useState<StudyResult>({ total: 0, correct: 0 })

  function handleAdd() {
    setEditingCard(null)
    setMode('editor')
  }

  function handleEdit(card: Card) {
    setEditingCard(card)
    setMode('editor')
  }

  function handleSave(front: string, back: string) {
    if (editingCard) {
      updateCard(editingCard.id, front, back)
    } else {
      addCard(front, back)
    }
    setMode('list')
  }

  function handleCancelEdit() {
    setMode('list')
  }

  function handleStartStudy() {
    setMode('study')
  }

  function handleFinishStudy(result: StudyResult) {
    setStudyResult(result)
    setMode('summary')
  }

  function handleCancelStudy() {
    setMode('list')
  }

  function handleRetry() {
    setMode('study')
  }

  function handleBackToList() {
    setMode('list')
  }

  if (mode === 'editor') {
    return (
      <CardEditor
        editingCard={editingCard}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
    )
  }

  if (mode === 'study') {
    return (
      <StudyMode
        cards={cards}
        onFinish={handleFinishStudy}
        onCancel={handleCancelStudy}
      />
    )
  }

  if (mode === 'summary') {
    return (
      <Summary
        result={studyResult}
        onRetry={handleRetry}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <CardList
      cards={cards}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={deleteCard}
      onImport={importCards}
      onStartStudy={handleStartStudy}
    />
  )
}

export default App
