import React, { useState, useEffect } from 'react'
import { GameInterface } from '@/components/GameInterface'
import { useGameEngine } from '@/hooks/useGameEngine'
import { blink } from '@/blink/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { gameState, isLoading, error, handleChoice, updateGameState, initializeGame } = useGameEngine()

  // Handle authentication
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setAuthLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-400" />
          <p className="font-mono text-yellow-400">
            {authLoading ? 'Authenticating...' : 'Loading game state...'}
          </p>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!user) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center backrooms-pattern">
        <Card className="bg-gray-900 border-gray-700 p-8 max-w-md mx-4">
          <div className="text-center">
            <h1 className="text-2xl font-mono text-yellow-400 mb-4">
              BACKROOMS & SCP
            </h1>
            <h2 className="text-lg font-mono text-white mb-6">
              CANONICAL AI SURVIVAL RPG
            </h2>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Enter the endless maze of the Backrooms. Survive encounters with canonical entities, 
              explore official levels, and uncover SCP crossover zones in this AI-driven survival experience.
            </p>
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full font-mono bg-yellow-400 text-black hover:bg-yellow-300"
            >
              ENTER THE BACKROOMS
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-red-700 p-8 max-w-md mx-4">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-mono text-red-400 mb-4">System Error</h2>
            <p className="text-gray-300 mb-6 text-sm">{error}</p>
            <Button 
              onClick={initializeGame}
              className="w-full font-mono"
              variant="outline"
            >
              Retry Initialization
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Game state not loaded or incomplete
  if (!gameState || !gameState.playerStats || !gameState.currentEvent) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-yellow-400" />
          <p className="font-mono text-yellow-400">Initializing game world...</p>
        </div>
      </div>
    )
  }

  // Main game interface
  return (
    <GameInterface
      gameState={gameState}
      onChoiceSelect={handleChoice}
      onUpdateGameState={updateGameState}
    />
  )
}

export default App