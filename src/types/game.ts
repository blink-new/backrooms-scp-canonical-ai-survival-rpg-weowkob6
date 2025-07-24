export interface GameState {
  id: string
  userId: string
  currentLevel: string
  currentLevelName: string
  currentEvent: GameEvent
  playerStats: PlayerStats
  inventory: InventoryItem[]
  allies: Ally[]
  factionReputation: Record<string, number>
  discoveredLevels: string[]
  gameLog: GameLogEntry[]
  isTabletOpen: boolean
  createdAt: string
  updatedAt: string
}

export interface PlayerStats {
  health: number
  hunger: number
  thirst: number
  sanity: number
  energy: number
  maxHealth: number
  maxHunger: number
  maxThirst: number
  maxSanity: number
  maxEnergy: number
}

export interface GameEvent {
  id: string
  type: 'exploration' | 'entity_encounter' | 'environmental' | 'faction' | 'scp_crossover' | 'safe_zone'
  title: string
  description: string
  entityImage?: string
  environmentImage: string
  choices: GameChoice[]
  weatherEffect?: WeatherEffect
  environmentalHazards: string[]
  isScpZone: boolean
  levelSpecificData: Record<string, any>
  // New text-based entity properties
  entityPresent: boolean
  entityName?: string
  entityType?: string
  entityDescription?: string
  entityThreatLevel?: string
  // New text-based environment properties
  environmentDescription?: string
  temperature?: string
  humidity?: string
  lighting?: string
}

export interface GameChoice {
  id: string
  text: string
  type: 'action' | 'ally_action' | 'item_use' | 'dialogue'
  requirements?: ChoiceRequirement[]
  consequences: ChoiceConsequence[]
  allyId?: string
  itemId?: string
}

export interface ChoiceRequirement {
  type: 'stat' | 'item' | 'ally' | 'faction_rep' | 'level_access'
  key: string
  value: number | string
  operator: 'gte' | 'lte' | 'eq' | 'has'
}

export interface ChoiceConsequence {
  type: 'stat_change' | 'item_gain' | 'item_lose' | 'ally_change' | 'faction_rep' | 'level_access' | 'event_trigger'
  key: string
  value: number | string
  description: string
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  type: 'consumable' | 'tool' | 'weapon' | 'artifact' | 'scp_item'
  quantity: number
  effects: ItemEffect[]
  isCanonical: boolean
  sourceWiki: 'backrooms' | 'scp'
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary' | 'anomalous'
}

export interface ItemEffect {
  type: 'stat_restore' | 'stat_boost' | 'protection' | 'special'
  stat?: keyof PlayerStats
  value: number
  duration?: number
  description: string
}

export interface Ally {
  id: string
  name: string
  faction: string
  description: string
  personality: string[]
  stats: AllyStats
  inventory: InventoryItem[]
  relationship: number
  isAlive: boolean
  experienceLevel: number
  specialAbilities: string[]
  backstory: string
}

export interface AllyStats {
  health: number
  maxHealth: number
  combat: number
  stealth: number
  negotiation: number
  technical: number
  survival: number
}

export interface WeatherEffect {
  type: string
  name: string
  description: string
  statEffects: Record<keyof PlayerStats, number>
  duration: number
  isActive: boolean
}

export interface GameLogEntry {
  id: string
  timestamp: string
  type: 'action' | 'event' | 'dialogue' | 'system'
  content: string
  metadata?: Record<string, any>
}

export interface TabletApp {
  id: string
  name: string
  icon: string
  component: string
  isUnlocked: boolean
  hasNotification: boolean
}

export interface FactionData {
  id: string
  name: string
  description: string
  reputation: number
  shopItems: InventoryItem[]
  quests: Quest[]
  isHostile: boolean
  territories: string[]
}

export interface Quest {
  id: string
  title: string
  description: string
  objectives: QuestObjective[]
  rewards: InventoryItem[]
  factionId: string
  isCompleted: boolean
  isActive: boolean
  timeLimit?: number
}

export interface QuestObjective {
  id: string
  description: string
  type: 'collect' | 'explore' | 'survive' | 'eliminate' | 'deliver'
  target: string
  currentProgress: number
  requiredProgress: number
  isCompleted: boolean
}

export interface LevelData {
  id: string
  name: string
  description: string
  difficulty: number
  weatherPatterns: WeatherEffect[]
  commonEntities: string[]
  environmentalHazards: string[]
  safeZones: string[]
  accessMethods: string[]
  isDiscovered: boolean
  visitCount: number
  lastVisited?: string
}

export interface EntityData {
  id: string
  name: string
  description: string
  behavior: string
  dangerLevel: number
  commonLevels: string[]
  imageUrl?: string
  encounterStrategies: string[]
  isCanonical: boolean
}

export interface SCPData {
  id: string
  designation: string
  objectClass: 'Safe' | 'Euclid' | 'Keter' | 'Thaumiel' | 'Apollyon' | 'Archon'
  description: string
  containmentProcedures: string
  specialProperties: string[]
  crossoverLevels: string[]
  encounterEffects: ChoiceConsequence[]
  isActive: boolean
}