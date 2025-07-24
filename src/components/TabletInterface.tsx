import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Package, Map, Users, MessageSquare, Settings, Gamepad2, BookOpen } from 'lucide-react'
import { GameState } from '@/types/game'

interface TabletInterfaceProps {
  gameState: GameState
  onClose: () => void
  onUpdateGameState: (newState: Partial<GameState>) => void
}

export function TabletInterface({ gameState, onClose, onUpdateGameState }: TabletInterfaceProps) {
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="tablet-screen w-full max-w-4xl h-full max-h-[80vh] rounded-2xl overflow-hidden">
        {/* Tablet Header */}
        <div className="bg-gray-800 border-b border-gray-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-mono text-yellow-400">SURVIVAL TABLET v2.1</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tablet Content */}
        <div className="h-full bg-gray-900 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-gray-800 border-b border-gray-600 rounded-none p-1 grid grid-cols-7 gap-1">
              <TabsTrigger value="inventory" className="font-mono text-xs">
                <Package className="w-4 h-4 mr-1" />
                INV
              </TabsTrigger>
              <TabsTrigger value="map" className="font-mono text-xs">
                <Map className="w-4 h-4 mr-1" />
                MAP
              </TabsTrigger>
              <TabsTrigger value="allies" className="font-mono text-xs">
                <Users className="w-4 h-4 mr-1" />
                TEAM
              </TabsTrigger>
              <TabsTrigger value="messages" className="font-mono text-xs">
                <MessageSquare className="w-4 h-4 mr-1" />
                MSG
              </TabsTrigger>
              <TabsTrigger value="games" className="font-mono text-xs">
                <Gamepad2 className="w-4 h-4 mr-1" />
                GAMES
              </TabsTrigger>
              <TabsTrigger value="lore" className="font-mono text-xs">
                <BookOpen className="w-4 h-4 mr-1" />
                LORE
              </TabsTrigger>
              <TabsTrigger value="settings" className="font-mono text-xs">
                <Settings className="w-4 h-4 mr-1" />
                SET
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4">
              <TabsContent value="inventory" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">INVENTORY MANAGEMENT</h3>
                  
                  {gameState.inventory.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-600 p-6 text-center">
                      <p className="text-gray-400 font-mono">No items in inventory</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {gameState.inventory.map((item) => (
                        <Card key={item.id} className="bg-gray-800 border-gray-600 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-mono text-sm text-white">{item.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.quantity}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={item.rarity === 'legendary' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {item.rarity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.sourceWiki}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">DISCOVERED LEVELS</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.discoveredLevels.map((levelId) => (
                      <Card key={levelId} className="bg-gray-800 border-gray-600 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-mono text-white">{levelId}</h4>
                          <Badge variant="outline" className="text-xs">
                            DISCOVERED
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          Access methods and environmental data available
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="allies" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">ALLY STATUS</h3>
                  
                  {gameState.allies.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-600 p-6 text-center">
                      <p className="text-gray-400 font-mono">No allies recruited</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Find faction members to recruit as allies
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {gameState.allies.map((ally) => (
                        <Card key={ally.id} className="bg-gray-800 border-gray-600 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-mono text-white">{ally.name}</h4>
                              <p className="text-xs text-yellow-400">{ally.faction}</p>
                            </div>
                            <Badge 
                              variant={ally.isAlive ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {ally.isAlive ? 'ALIVE' : 'DECEASED'}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-3">{ally.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-gray-400">Health</p>
                              <p className="text-white font-mono">{ally.stats.health}/{ally.stats.maxHealth}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Combat</p>
                              <p className="text-white font-mono">{ally.stats.combat}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Relationship</p>
                              <p className="text-white font-mono">{ally.relationship}/100</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">ENCRYPTED MESSAGES</h3>
                  
                  <Card className="bg-gray-800 border-gray-600 p-4">
                    <div className="text-center text-gray-400 font-mono">
                      <p>No new messages</p>
                      <p className="text-xs mt-2">Secure communication channel active</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="games" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">MINIGAMES & UTILITIES</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-800 border-gray-600 p-4 cursor-pointer hover:bg-gray-700 transition-colors">
                      <div className="text-center">
                        <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <h4 className="font-mono text-white text-sm">Token Wheel</h4>
                        <p className="text-xs text-gray-400">Spin for resources</p>
                      </div>
                    </Card>
                    
                    <Card className="bg-gray-800 border-gray-600 p-4 cursor-pointer hover:bg-gray-700 transition-colors">
                      <div className="text-center">
                        <Package className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                        <h4 className="font-mono text-white text-sm">Puzzle Box</h4>
                        <p className="text-xs text-gray-400">Logic challenges</p>
                      </div>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lore" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">CANONICAL LORE DATABASE</h3>
                  
                  <Card className="bg-gray-800 border-gray-600 p-4">
                    <h4 className="font-mono text-white mb-2">Current Level: {gameState.currentLevelName}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Access to canonical information about entities, levels, and factions 
                      discovered during your journey. All data sourced from official wikidot archives.
                    </p>
                  </Card>

                  <Card className="bg-gray-800 border-gray-600 p-4">
                    <h4 className="font-mono text-white mb-2">Faction Reputation</h4>
                    <div className="space-y-2">
                      {Object.entries(gameState.factionReputation).map(([faction, rep]) => (
                        <div key={faction} className="flex items-center justify-between">
                          <span className="text-sm text-gray-300">{faction}</span>
                          <Badge variant={rep > 0 ? 'default' : rep < 0 ? 'destructive' : 'secondary'}>
                            {rep > 0 ? '+' : ''}{rep}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-mono text-yellow-400 mb-4">SYSTEM SETTINGS</h3>
                  
                  <Card className="bg-gray-800 border-gray-600 p-4">
                    <h4 className="font-mono text-white mb-3">Digital Assistant</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Status</span>
                        <Badge variant={gameState.playerStats.sanity > 50 ? 'default' : 'destructive'}>
                          {gameState.playerStats.sanity > 50 ? 'STABLE' : 'GLITCHING'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Reliability</span>
                        <span className="text-sm text-white font-mono">
                          {Math.max(0, Math.min(100, gameState.playerStats.sanity))}%
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-gray-800 border-gray-600 p-4">
                    <h4 className="font-mono text-white mb-3">Game Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-400">Levels Discovered</p>
                        <p className="text-white font-mono">{gameState.discoveredLevels.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Allies Recruited</p>
                        <p className="text-white font-mono">{gameState.allies.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Items Collected</p>
                        <p className="text-white font-mono">{gameState.inventory.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Events Survived</p>
                        <p className="text-white font-mono">{gameState.gameLog.length}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}