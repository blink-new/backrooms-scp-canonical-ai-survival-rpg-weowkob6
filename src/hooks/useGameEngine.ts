import { useState, useEffect, useCallback } from 'react'
import { GameState, GameChoice, GameEvent, PlayerStats, InventoryItem, Ally } from '@/types/game'
import { blink } from '@/blink/client'

// Sample canonical data for initial implementation
const SAMPLE_LEVELS = {
  'level-0': {
    name: 'Level 0 - The Lobby',
    description: 'An endless maze of randomly segmented rooms with the smell of old moist carpet, the madness of mono-yellow, and the endless background noise of fluorescent lights at maximum hum-buzz.',
    environmentImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    commonEntities: ['Smilers', 'Skin-Stealers'],
    weatherEffects: [],
    environmentalHazards: ['Fluorescent Light Malfunction']
  },
  'level-1': {
    name: 'Level 1 - Habitable Zone',
    description: 'A massive warehouse with concrete floors and walls, filled with pipes, machinery, and the occasional maintenance room.',
    environmentImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    commonEntities: ['Hounds', 'Dullers'],
    weatherEffects: [],
    environmentalHazards: ['Electrical Hazards', 'Unstable Flooring']
  }
}

const SAMPLE_ENTITIES = {
  'smiler': {
    name: 'Smiler',
    description: 'Entities that lurk in dark areas, recognizable by their glowing white eyes and smile.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    dangerLevel: 3
  }
}

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create new game state
  const createNewGame = async (userId: string): Promise<GameState> => {
    const initialStats: PlayerStats = {
      health: 100,
      hunger: 100,
      thirst: 100,
      sanity: 100,
      energy: 100,
      maxHealth: 100,
      maxHunger: 100,
      maxThirst: 100,
      maxSanity: 100,
      maxEnergy: 100
    }

    // Validate that all stats are numbers
    Object.keys(initialStats).forEach(key => {
      const statKey = key as keyof PlayerStats
      if (typeof initialStats[statKey] !== 'number' || isNaN(initialStats[statKey] as number)) {
        initialStats[statKey] = key.startsWith('max') ? 100 : 100
      }
    })

    const initialEvent: GameEvent = {
      id: 'start-event',
      type: 'exploration',
      title: 'Welcome to the Backrooms',
      description: 'You find yourself in an endless maze of yellow rooms. The fluorescent lights hum overhead, casting an eerie glow on the damp carpet. The smell of old moisture fills your nostrils. You need to find a way to survive and explore this strange reality.',
      environmentImage: SAMPLE_LEVELS['level-0'].environmentImage,
      choices: [
        {
          id: 'explore-forward',
          text: 'Move Forward',
          type: 'action',
          requirements: [],
          consequences: [
            { type: 'stat_change', key: 'energy', value: -5, description: 'Walking consumes energy' }
          ]
        },
        {
          id: 'listen-carefully',
          text: 'Listen Carefully',
          type: 'action',
          requirements: [],
          consequences: [
            { type: 'stat_change', key: 'sanity', value: -2, description: 'The humming affects your sanity' }
          ]
        },
        {
          id: 'search-area',
          text: 'Search Area',
          type: 'action',
          requirements: [],
          consequences: [
            { type: 'stat_change', key: 'energy', value: -3, description: 'Searching is tiring' }
          ]
        },
        {
          id: 'rest-moment',
          text: 'Rest for a Moment',
          type: 'action',
          requirements: [],
          consequences: [
            { type: 'stat_change', key: 'energy', value: 10, description: 'Brief rest restores energy' },
            { type: 'stat_change', key: 'sanity', value: -1, description: 'The environment is unsettling' }
          ]
        }
      ],
      environmentalHazards: ['Fluorescent Light Malfunction'],
      isScpZone: false,
      levelSpecificData: {},
      // New text-based properties
      entityPresent: false,
      entityName: undefined,
      entityType: undefined,
      entityDescription: undefined,
      entityThreatLevel: undefined,
      environmentDescription: 'An endless maze of randomly segmented rooms with yellowed walls and damp, musty carpet. The monotonous hum of fluorescent lights fills the air.',
      temperature: 'Room Temperature',
      humidity: 'High',
      lighting: 'Fluorescent'
    }

    const newGameState: GameState = {
      id: `game-${Date.now()}`,
      userId,
      currentLevel: 'level-0',
      currentLevelName: 'Level 0 - The Lobby',
      currentEvent: initialEvent,
      playerStats: initialStats,
      inventory: [],
      allies: [],
      factionReputation: {
        'M.E.G.': 0,
        'B.N.T.G.': 0,
        'The Eyes of Argos': 0
      },
      discoveredLevels: ['level-0'],
      gameLog: [{
        id: 'log-start',
        timestamp: new Date().toISOString(),
        type: 'system',
        content: 'Game started. Welcome to the Backrooms.'
      }],
      isTabletOpen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to database
    await blink.db.gameStates.create(newGameState)
    
    return newGameState
  }

  // Generate next event using AI
  const generateNextEvent = async (currentState: GameState, choice: GameChoice): Promise<GameEvent> => {
    try {
      // Use AI to generate contextual next event
      const prompt = `
        Generate the next event for a Backrooms survival RPG based on canonical lore.
        
        Current Context:
        - Level: ${currentState.currentLevelName}
        - Player Stats: Health ${currentState.playerStats.health}/100, Sanity ${currentState.playerStats.sanity}/100
        - Last Choice: ${choice.text}
        - Discovered Levels: ${currentState.discoveredLevels.join(', ')}
        
        Generate a JSON response with:
        - title: Event title
        - description: Detailed atmospheric description (2-3 sentences)
        - type: exploration/entity_encounter/environmental/faction/safe_zone
        - isScpZone: boolean
        - environmentalHazards: array of hazards
        - entityPresent: boolean (true if entity encounter)
        - entityName: string (if entity present, canonical name like "Smiler" or "Skin-Stealer")
        - entityType: string (if entity present, classification like "Hostile" or "Neutral")
        - entityDescription: string (if entity present, brief canonical description)
        - entityThreatLevel: string (if entity present, like "Moderate" or "High")
        - environmentDescription: string (detailed description of current environment)
        - temperature: string (like "Room Temperature" or "Cold")
        - humidity: string (like "High" or "Moderate")
        - lighting: string (like "Fluorescent" or "Dim")
        - choices: array of 4 contextual choices with text and consequences
        
        Keep it canonical to Backrooms wikidot lore, atmospheric, and family-friendly.
      `

      const { object } = await blink.ai.generateObject({
        prompt,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['exploration', 'entity_encounter', 'environmental', 'faction', 'safe_zone'] },
            isScpZone: { type: 'boolean' },
            environmentalHazards: { type: 'array', items: { type: 'string' } },
            entityPresent: { type: 'boolean' },
            entityName: { type: 'string' },
            entityType: { type: 'string' },
            entityDescription: { type: 'string' },
            entityThreatLevel: { type: 'string' },
            environmentDescription: { type: 'string' },
            temperature: { type: 'string' },
            humidity: { type: 'string' },
            lighting: { type: 'string' },
            choices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  type: { type: 'string', enum: ['action', 'ally_action', 'item_use', 'dialogue'] },
                  consequences: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        key: { type: 'string' },
                        value: { type: 'number' },
                        description: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

      // Convert AI response to GameEvent
      const nextEvent: GameEvent = {
        id: `event-${Date.now()}`,
        type: object.type as GameEvent['type'],
        title: object.title,
        description: object.description,
        environmentImage: SAMPLE_LEVELS['level-0'].environmentImage, // Use appropriate image
        entityImage: object.type === 'entity_encounter' ? SAMPLE_ENTITIES.smiler.imageUrl : undefined,
        choices: object.choices.map((choice: any, index: number) => ({
          id: `choice-${Date.now()}-${index}`,
          text: choice.text,
          type: choice.type,
          requirements: [],
          consequences: choice.consequences || []
        })),
        environmentalHazards: object.environmentalHazards || [],
        isScpZone: object.isScpZone || false,
        levelSpecificData: {},
        // New text-based properties
        entityPresent: object.entityPresent || false,
        entityName: object.entityName,
        entityType: object.entityType,
        entityDescription: object.entityDescription,
        entityThreatLevel: object.entityThreatLevel,
        environmentDescription: object.environmentDescription,
        temperature: object.temperature,
        humidity: object.humidity,
        lighting: object.lighting
      }

      return nextEvent
    } catch (err) {
      console.error('Failed to generate next event:', err)
      
      // Fallback to a simple exploration event
      return {
        id: `event-${Date.now()}`,
        type: 'exploration',
        title: 'Continuing Forward',
        description: 'You continue through the endless yellow corridors, the fluorescent lights humming overhead.',
        environmentImage: SAMPLE_LEVELS['level-0'].environmentImage,
        choices: [
          {
            id: 'continue-1',
            text: 'Keep Moving',
            type: 'action',
            requirements: [],
            consequences: [{ type: 'stat_change', key: 'energy', value: -5, description: 'Walking is tiring' }]
          },
          {
            id: 'continue-2',
            text: 'Look Around',
            type: 'action',
            requirements: [],
            consequences: [{ type: 'stat_change', key: 'sanity', value: -2, description: 'The environment is unsettling' }]
          },
          {
            id: 'continue-3',
            text: 'Rest Briefly',
            type: 'action',
            requirements: [],
            consequences: [{ type: 'stat_change', key: 'energy', value: 5, description: 'Brief rest helps' }]
          },
          {
            id: 'continue-4',
            text: 'Search for Items',
            type: 'action',
            requirements: [],
            consequences: [{ type: 'stat_change', key: 'energy', value: -3, description: 'Searching is tiring' }]
          }
        ],
        environmentalHazards: [],
        isScpZone: false,
        levelSpecificData: {},
        // New text-based properties
        entityPresent: false,
        entityName: undefined,
        entityType: undefined,
        entityDescription: undefined,
        entityThreatLevel: undefined,
        environmentDescription: 'The endless yellow hallways stretch in all directions, lit by buzzing fluorescent lights. The carpet beneath your feet is damp and worn.',
        temperature: 'Room Temperature',
        humidity: 'High',
        lighting: 'Fluorescent'
      }
    }
  }

  // Initialize game state
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Check if user has existing game state
      const user = await blink.auth.me()
      const existingGames = await blink.db.gameStates.list({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        limit: 1
      })

      let initialState: GameState

      if (existingGames.length > 0) {
        // Load existing game
        initialState = existingGames[0] as GameState
        
        // Validate loaded game state has all required properties
        if (!initialState.playerStats || 
            typeof initialState.playerStats.sanity !== 'number' ||
            !initialState.currentEvent) {
          console.warn('Loaded game state is incomplete, creating new game')
          initialState = await createNewGame(user.id)
        }
      } else {
        // Create new game
        initialState = await createNewGame(user.id)
      }

      setGameState(initialState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle player choice
  const handleChoice = useCallback(async (choice: GameChoice) => {
    if (!gameState) return

    try {
      setIsLoading(true)

      // Apply choice consequences
      const newStats = { ...gameState.playerStats }
      const newInventory = [...gameState.inventory]
      const newFactionRep = { ...gameState.factionReputation }

      for (const consequence of choice.consequences) {
        switch (consequence.type) {
          case 'stat_change': {
            const statKey = consequence.key as keyof PlayerStats
            if (typeof newStats[statKey] === 'number' && !isNaN(newStats[statKey] as number)) {
              const maxStatKey = `max${statKey.charAt(0).toUpperCase() + statKey.slice(1)}` as keyof PlayerStats
              const maxValue = newStats[maxStatKey] as number
              const currentValue = newStats[statKey] as number
              const changeValue = consequence.value as number
              
              // Ensure all values are valid numbers
              if (typeof maxValue === 'number' && typeof currentValue === 'number' && typeof changeValue === 'number') {
                newStats[statKey] = Math.max(0, Math.min(maxValue, currentValue + changeValue))
              }
            }
            break
          }
          case 'item_gain':
            // Add item logic here
            break
          case 'faction_rep':
            if (newFactionRep[consequence.key] !== undefined) {
              newFactionRep[consequence.key] += consequence.value as number
            }
            break
        }
      }

      // Generate next event using AI
      const nextEvent = await generateNextEvent(gameState, choice)

      // Create new game log entry
      const logEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'action' as const,
        content: `Player chose: ${choice.text}`,
        metadata: { choiceId: choice.id }
      }

      const updatedGameState: GameState = {
        ...gameState,
        currentEvent: nextEvent,
        playerStats: newStats,
        inventory: newInventory,
        factionReputation: newFactionRep,
        gameLog: [...gameState.gameLog, logEntry],
        updatedAt: new Date().toISOString()
      }

      // Save to database
      await blink.db.gameStates.update(gameState.id, updatedGameState)
      
      setGameState(updatedGameState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process choice')
    } finally {
      setIsLoading(false)
    }
  }, [gameState])

  // Update game state
  const updateGameState = useCallback(async (updates: Partial<GameState>) => {
    if (!gameState) return

    const updatedState = {
      ...gameState,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    try {
      await blink.db.gameStates.update(gameState.id, updatedState)
      setGameState(updatedState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update game state')
    }
  }, [gameState])

  // Initialize on mount
  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  return {
    gameState,
    isLoading,
    error,
    handleChoice,
    updateGameState,
    initializeGame
  }
}