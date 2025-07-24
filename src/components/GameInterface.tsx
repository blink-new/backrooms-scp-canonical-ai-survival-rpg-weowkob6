import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tablet, Heart, Droplets, Utensils, Brain, Zap } from 'lucide-react'
import { GameState, GameChoice } from '@/types/game'
import { TabletInterface } from './TabletInterface'
import { blink } from '@/blink/client'

interface GameInterfaceProps {
  gameState: GameState
  onChoiceSelect: (choice: GameChoice) => void
  onUpdateGameState: (newState: Partial<GameState>) => void
}

export function GameInterface({ gameState, onChoiceSelect, onUpdateGameState }: GameInterfaceProps) {
  const [isTabletOpen, setIsTabletOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [glitchEffect, setGlitchEffect] = useState(false)

  // Apply sanity effects
  useEffect(() => {
    if (gameState?.playerStats?.sanity !== undefined && 
        typeof gameState.playerStats.sanity === 'number' && 
        gameState.playerStats.sanity < 30) {
      const interval = setInterval(() => {
        setGlitchEffect(true)
        setTimeout(() => setGlitchEffect(false), 300)
      }, Math.random() * 5000 + 2000)
      
      return () => clearInterval(interval)
    }
  }, [gameState?.playerStats?.sanity])

  // Safety check - should not happen due to App.tsx guards, but prevents crashes
  if (!gameState || !gameState.playerStats || !gameState.currentEvent) {
    return (
      <div className="h-screen w-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-mono text-yellow-400">Loading game state...</p>
        </div>
      </div>
    )
  }

  const handleChoiceClick = async (choice: GameChoice) => {
    setIsLoading(true)
    try {
      await onChoiceSelect(choice)
    } finally {
      setIsLoading(false)
    }
  }

  const openTablet = () => {
    setIsTabletOpen(true)
    onUpdateGameState({ isTabletOpen: true })
  }

  const closeTablet = () => {
    setIsTabletOpen(false)
    onUpdateGameState({ isTabletOpen: false })
  }

  const getStatColor = (statName: string) => {
    switch (statName) {
      case 'health': return 'bg-red-500'
      case 'hunger': return 'bg-orange-500'
      case 'thirst': return 'bg-blue-500'
      case 'sanity': return 'bg-purple-500'
      case 'energy': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'health': return <Heart className="w-4 h-4" />
      case 'hunger': return <Utensils className="w-4 h-4" />
      case 'thirst': return <Droplets className="w-4 h-4" />
      case 'sanity': return <Brain className="w-4 h-4" />
      case 'energy': return <Zap className="w-4 h-4" />
      default: return null
    }
  }

  const renderStatBar = (statName: keyof typeof gameState.playerStats, label: string) => {
    const current = gameState.playerStats[statName] as number
    const max = gameState.playerStats[`max${statName.charAt(0).toUpperCase() + statName.slice(1)}` as keyof typeof gameState.playerStats] as number
    const percentage = (current / max) * 100
    
    return (
      <div className="flex items-center space-x-2 text-sm">
        {getStatIcon(statName)}
        <span className="w-16 text-xs font-mono">{label}</span>
        <div className="flex-1 bg-gray-800 rounded-full h-2 relative overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getStatColor(statName)}`}
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          />
        </div>
        <span className="w-12 text-xs font-mono text-right">{current}/{max}</span>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col backrooms-pattern">
      {/* Survival Stats Bar */}
      <div className="bg-gray-900/90 border-b border-gray-700 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-mono text-yellow-400">{gameState.currentLevelName}</h2>
            <div className="text-sm font-mono text-gray-400">
              {gameState.currentEvent.isScpZone && (
                <span className="text-red-400 animate-pulse">⚠ SCP ZONE DETECTED</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {renderStatBar('health', 'HEALTH')}
            {renderStatBar('hunger', 'HUNGER')}
            {renderStatBar('thirst', 'THIRST')}
            {renderStatBar('sanity', 'SANITY')}
            {renderStatBar('energy', 'ENERGY')}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Entity Display Panel (Left) */}
        <div className="w-1/4 bg-gray-900/50 border-r border-gray-700 p-4 entity-shadow">
          {gameState.currentEvent.entityPresent ? (
            <div className="h-full flex flex-col">
              <div className="border-b border-gray-600 pb-2 mb-4">
                <h3 className="text-sm font-mono text-red-400 uppercase tracking-wide">ENTITY DETECTED</h3>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-yellow-400 mb-2">
                  {gameState.currentEvent.entityName || "Unknown Entity"}
                </h4>
                <div className="text-xs text-gray-300 mb-3 font-mono">
                  Classification: {gameState.currentEvent.entityType || "Hostile"}
                </div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  {gameState.currentEvent.entityDescription || "A dangerous entity lurks nearby. Exercise extreme caution."}
                </div>
                {gameState.currentEvent.entityThreatLevel && (
                  <div className="mt-4 p-2 bg-red-900/30 border border-red-700 rounded">
                    <div className="text-xs font-mono text-red-300">
                      THREAT LEVEL: {gameState.currentEvent.entityThreatLevel}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-xs font-mono">CLEAR</span>
              </div>
              <p className="text-sm font-mono text-center">NO ENTITIES<br/>DETECTED</p>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Area appears safe for<br/>the moment...
              </div>
            </div>
          )}
        </div>

        {/* Central Game Panel */}
        <div className="flex-1 flex flex-col">
          {/* Narrative Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gray-900/80 border-gray-700 p-6 mb-6">
                <h3 className={`text-xl font-bold mb-4 ${glitchEffect ? 'animate-glitch' : ''}`}>
                  {gameState.currentEvent.title}
                </h3>
                <div className={`text-gray-300 leading-relaxed ${glitchEffect ? 'glitch-text' : ''}`} 
                     data-text={gameState.currentEvent.description}>
                  {gameState.currentEvent.description}
                </div>
                
                {gameState.currentEvent.weatherEffect && (
                  <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
                    <p className="text-blue-300 text-sm font-mono">
                      🌤 {gameState.currentEvent.weatherEffect.name}: {gameState.currentEvent.weatherEffect.description}
                    </p>
                  </div>
                )}

                {gameState.currentEvent.environmentalHazards.length > 0 && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm font-mono">
                      ⚠ Environmental Hazards: {gameState.currentEvent.environmentalHazards.join(', ')}
                    </p>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {gameState.currentEvent.choices.slice(0, 4).map((choice, index) => (
                  <Button
                    key={choice.id}
                    onClick={() => handleChoiceClick(choice)}
                    disabled={isLoading}
                    className="action-button h-16 text-left p-4 font-mono text-sm"
                    variant="outline"
                  >
                    <div>
                      <div className="font-semibold text-yellow-400">{choice.text}</div>
                      {choice.type === 'ally_action' && choice.allyId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Ally: {gameState.allies.find(a => a.id === choice.allyId)?.name}
                        </div>
                      )}
                      {choice.type === 'item_use' && choice.itemId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Use: {gameState.inventory.find(i => i.id === choice.itemId)?.name}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {/* Tablet Button */}
              <div className="text-center">
                <Button
                  onClick={openTablet}
                  className="action-button px-8 py-3 font-mono atmospheric-glow"
                  variant="outline"
                >
                  <Tablet className="w-5 h-5 mr-2" />
                  OPEN TABLET
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Display Panel (Right) */}
        <div className="w-1/4 bg-gray-900/50 border-l border-gray-700 p-4">
          <div className="h-full flex flex-col">
            <div className="border-b border-gray-600 pb-2 mb-4">
              <h3 className="text-sm font-mono text-blue-400 uppercase tracking-wide">ENVIRONMENT</h3>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-yellow-400 mb-2">
                {gameState.currentLevelName}
              </h4>
              <div className="text-xs text-gray-300 mb-3 font-mono">
                Level ID: {gameState.currentLevel}
              </div>
              <div className="text-sm text-gray-400 leading-relaxed mb-4">
                {gameState.currentEvent.environmentDescription || 
                 "The endless yellow hallways stretch in all directions, lit by buzzing fluorescent lights."}
              </div>
              
              {gameState.currentEvent.weatherEffect && (
                <div className="mb-3 p-2 bg-blue-900/30 border border-blue-700 rounded">
                  <div className="text-xs font-mono text-blue-300 mb-1">WEATHER</div>
                  <div className="text-sm text-blue-200">{gameState.currentEvent.weatherEffect.name}</div>
                </div>
              )}

              {gameState.currentEvent.environmentalHazards.length > 0 && (
                <div className="mb-3 p-2 bg-orange-900/30 border border-orange-700 rounded">
                  <div className="text-xs font-mono text-orange-300 mb-1">HAZARDS</div>
                  <div className="text-sm text-orange-200">
                    {gameState.currentEvent.environmentalHazards.join(', ')}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 font-mono">
                  ATMOSPHERIC CONDITIONS
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Temperature: {gameState.currentEvent.temperature || "Room Temperature"}<br/>
                  Humidity: {gameState.currentEvent.humidity || "Moderate"}<br/>
                  Lighting: {gameState.currentEvent.lighting || "Fluorescent"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Interface Overlay */}
      {isTabletOpen && (
        <TabletInterface
          gameState={gameState}
          onClose={closeTablet}
          onUpdateGameState={onUpdateGameState}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-mono text-yellow-400">Processing<span className="loading-dots"></span></p>
          </div>
        </div>
      )}
    </div>
  )
}