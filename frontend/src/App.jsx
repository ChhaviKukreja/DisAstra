import React, { useState, useEffect, useReducer } from 'react'
import { MapPin, Wifi, WifiOff, Radio, Heart, Home, Droplet, AlertTriangle, Navigation, Clock, Battery, CheckCircle, XCircle, Users, Layers, Shield, TrendingUp, Settings, Filter, Menu, X } from 'lucide-react'

// State Management with useReducer
const initialState = {
  userRole: 'victim', // 'victim' or 'responder'
  networkStatus: { connected: true, peerCount: 5 },
  activeSOS: null,
  incidents: [],
  selectedIncident: null,
  mapLayers: {
    victimDensity: false,
    networkHealth: false,
    resources: true,
    hazards: false
  },
  responderLocation: { lat: 31.6340, lng: 74.8723 }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_ROLE':
      return { ...state, userRole: state.userRole === 'victim' ? 'responder' : 'victim' }
    case 'SEND_SOS':
      return { ...state, activeSOS: action.payload }
    case 'CANCEL_SOS':
      return { ...state, activeSOS: null }
    case 'UPDATE_SOS_STATUS':
      return { ...state, activeSOS: { ...state.activeSOS, ...action.payload } }
    case 'ADD_INCIDENT':
      return { ...state, incidents: [action.payload, ...state.incidents] }
    case 'SELECT_INCIDENT':
      return { ...state, selectedIncident: action.payload }
    case 'ACKNOWLEDGE_INCIDENT':
      return {
        ...state,
        incidents: state.incidents.map(inc =>
          inc.id === action.payload ? { ...inc, acknowledged: true, status: 'acknowledged' } : inc
        )
      }
    case 'TOGGLE_LAYER':
      return {
        ...state,
        mapLayers: { ...state.mapLayers, [action.payload]: !state.mapLayers[action.payload] }
      }
    case 'UPDATE_NETWORK':
      return { ...state, networkStatus: action.payload }
    default:
      return state
  }
}

// Mock Data Generator
const generateMockIncidents = () => [
  {
    id: 'SOS-001',
    type: 'medical',
    location: { lat: 31.6340, lng: 74.8723 },
    timestamp: Date.now() - 300000,
    message: 'Injured, need medical help',
    batteryLevel: 45,
    urgencyScore: 9.2,
    classification: 'Medical Emergency',
    acknowledged: false,
    status: 'active',
    relayPath: ['Device-A23', 'Device-B45', 'Base-Station-1'],
    eta: 8
  },
  {
    id: 'SOS-002',
    type: 'trapped',
    location: { lat: 31.6380, lng: 74.8680 },
    timestamp: Date.now() - 900000,
    message: 'Trapped under rubble',
    batteryLevel: 22,
    urgencyScore: 9.8,
    classification: 'Building Collapse',
    acknowledged: true,
    status: 'acknowledged',
    relayPath: ['Device-C12', 'Device-D34', 'Device-E56', 'Base-Station-1'],
    eta: 15
  },
  {
    id: 'SOS-003',
    type: 'water',
    location: { lat: 31.6300, lng: 74.8800 },
    timestamp: Date.now() - 1800000,
    message: 'Need water urgently',
    batteryLevel: 68,
    urgencyScore: 6.5,
    classification: 'Resource Request',
    acknowledged: true,
    status: 'en-route',
    relayPath: ['Device-F78', 'Base-Station-2'],
    eta: 5
  },
  {
    id: 'SOS-004',
    type: 'medical',
    location: { lat: 31.6420, lng: 74.8650 },
    timestamp: Date.now() - 600000,
    message: 'Heart patient, medication needed',
    batteryLevel: 55,
    urgencyScore: 8.7,
    classification: 'Medical Emergency',
    acknowledged: false,
    status: 'active',
    relayPath: ['Device-G90', 'Device-H12', 'Base-Station-1'],
    eta: 12
  }
]

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [showSOSModal, setShowSOSModal] = useState(false)
  const [sosType, setSOSType] = useState(null)
  const [sosMessage, setSOSMessage] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (state.userRole === 'responder' && state.incidents.length === 0) {
      generateMockIncidents().forEach(incident => {
        dispatch({ type: 'ADD_INCIDENT', payload: incident })
      })
    }

    // Simulate network updates
    const interval = setInterval(() => {
      const peerCount = Math.floor(Math.random() * 8) + 3
      dispatch({ type: 'UPDATE_NETWORK', payload: { connected: peerCount > 0, peerCount } })
    }, 5000)

    return () => clearInterval(interval)
  }, [state.userRole, state.incidents.length])

  const handleSOSConfirm = () => {
    if (!sosType) return

    const sosData = {
      id: `SOS-${Date.now()}`,
      type: sosType,
      message: sosMessage,
      location: { lat: 31.6340, lng: 74.8723 },
      timestamp: Date.now(),
      batteryLevel: 78,
      status: 'broadcasting',
      acknowledged: false
    }

    dispatch({ type: 'SEND_SOS', payload: sosData })
    setShowSOSModal(false)

    // Simulate acknowledgment after 3 seconds
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_SOS_STATUS',
        payload: { acknowledged: true, status: 'confirmed', eta: 10 }
      })
    }, 3000)
  }

  const emergencyTypes = [
    { id: 'medical', icon: Heart, label: 'Medical Emergency', color: 'text-red-500' },
    { id: 'trapped', icon: Home, label: 'Trapped / Collapse', color: 'text-orange-500' },
    { id: 'water', icon: Droplet, label: 'Water / Food', color: 'text-blue-500' },
    { id: 'danger', icon: AlertTriangle, label: 'Immediate Danger', color: 'text-yellow-500' }
  ]

  const filteredIncidents = state.incidents
    .filter(inc => filterType === 'all' || inc.type === filterType)
    .sort((a, b) => b.urgencyScore - a.urgencyScore)

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <h1 className="text-xl font-bold">DISASTRA</h1>
          <span className="text-xs text-gray-400 ml-2">
            {state.userRole === 'victim' ? 'Civilian Mode' : 'Commander Mode'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {state.networkStatus.connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-gray-300">{state.networkStatus.peerCount} peers</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-gray-300">Searching...</span>
              </>
            )}
          </div>
          
          <button
            onClick={() => dispatch({ type: 'TOGGLE_ROLE' })}
            className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
          >
            Switch to {state.userRole === 'victim' ? 'Responder' : 'Victim'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      {state.userRole === 'victim' ? (
        <VictimView
          state={state}
          dispatch={dispatch}
          showSOSModal={showSOSModal}
          setShowSOSModal={setShowSOSModal}
          sosType={sosType}
          setSOSType={setSOSType}
          sosMessage={sosMessage}
          setSOSMessage={setSOSMessage}
          handleSOSConfirm={handleSOSConfirm}
          emergencyTypes={emergencyTypes}
        />
      ) : (
        <ResponderView
          state={state}
          dispatch={dispatch}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          filterType={filterType}
          setFilterType={setFilterType}
          filteredIncidents={filteredIncidents}
          emergencyTypes={emergencyTypes}
        />
      )}
    </div>
  )
}

// Victim View Component
const VictimView = ({ state, dispatch, showSOSModal, setShowSOSModal, sosType, setSOSType, sosMessage, setSOSMessage, handleSOSConfirm, emergencyTypes }) => {
  if (state.activeSOS) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center max-w-md">
          {state.activeSOS.acknowledged ? (
            <>
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold mb-4 text-green-400">SOS RECEIVED</h2>
              <p className="text-xl mb-6">Help is on the way</p>
              {state.activeSOS.eta && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-blue-400">
                    <Navigation className="w-5 h-5" />
                    <span className="text-lg">Responder is {state.activeSOS.eta} km away</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Radio className="w-24 h-24 text-yellow-500 mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl font-bold mb-4">SOS SENT</h2>
              <p className="text-xl mb-6">Broadcasting to nearby devices...</p>
            </>
          )}

          <div className="bg-gray-800 rounded-lg p-6 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-yellow-400">{state.activeSOS.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Emergency Type:</span>
                <span className="font-semibold capitalize">{state.activeSOS.type.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Battery:</span>
                <span className="font-semibold">{state.activeSOS.batteryLevel}%</span>
              </div>
            </div>
          </div>

          {state.activeSOS.acknowledged && (
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300">Are you still in need of assistance?</p>
              <div className="flex gap-3 mt-3">
                <button className="flex-1 py-2 bg-red-600 rounded hover:bg-red-700">
                  Still Need Help
                </button>
                <button className="flex-1 py-2 bg-green-600 rounded hover:bg-green-700">
                  I'm OK
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => dispatch({ type: 'CANCEL_SOS' })}
            className="px-8 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            Cancel SOS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-8">Emergency Assistance</h2>
        
        <button
          onClick={() => setShowSOSModal(true)}
          className="w-64 h-64 rounded-full bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
        >
          <div className="text-center">
            <AlertTriangle className="w-24 h-24 mx-auto mb-2 group-hover:animate-pulse" />
            <span className="text-4xl font-bold">SOS</span>
          </div>
        </button>

        <p className="mt-8 text-gray-400">Tap to send emergency signal</p>
        
        <button className="mt-6 text-gray-500 hover:text-gray-300">
          <Settings className="w-5 h-5 inline mr-2" />
          Settings
        </button>
      </div>

      {/* SOS Confirmation Modal */}
      {showSOSModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-6 text-center">Select Emergency Type</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {emergencyTypes.map(type => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSOSType(type.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      sosType === type.id
                        ? 'border-red-500 bg-red-900 bg-opacity-30'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-12 h-12 mx-auto mb-2 ${type.color}`} />
                    <span className="text-sm font-semibold block">{type.label}</span>
                  </button>
                )
              })}
            </div>

            <textarea
              value={sosMessage}
              onChange={(e) => setSOSMessage(e.target.value)}
              placeholder="Optional message (e.g., location details)..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 mb-6 resize-none"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSOSModal(false)
                  setSOSType(null)
                  setSOSMessage('')
                }}
                className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSOSConfirm}
                disabled={!sosType}
                className={`flex-1 py-3 rounded-lg font-bold ${
                  sosType
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                CONFIRM & SEND SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Responder View Component
const ResponderView = ({ state, dispatch, showSidebar, setShowSidebar, filterType, setFilterType, filteredIncidents, emergencyTypes }) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-96' : 'w-0'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden`}>
        {showSidebar && (
          <>
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Active Incidents</h3>
                <button onClick={() => setShowSidebar(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="trapped">Trapped</option>
                <option value="water">Resources</option>
                <option value="danger">Danger</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredIncidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  selected={state.selectedIncident?.id === incident.id}
                  onClick={() => dispatch({ type: 'SELECT_INCIDENT', payload: incident })}
                  emergencyTypes={emergencyTypes}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-900">
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-10 bg-gray-800 rounded-lg p-2 space-y-2">
          <h4 className="text-xs font-semibold px-2 text-gray-400">Map Layers</h4>
          {Object.entries(state.mapLayers).map(([key, value]) => (
            <button
              key={key}
              onClick={() => dispatch({ type: 'TOGGLE_LAYER', payload: key })}
              className={`w-full px-3 py-2 rounded text-sm text-left ${
                value ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>

        {/* Mock Map */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 relative">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-gray-700"
                style={{
                  left: `${(i % 5) * 20}%`,
                  top: `${Math.floor(i / 5) * 25}%`,
                  width: '20%',
                  height: '25%'
                }}
              />
            ))}
          </div>

          {/* Plot Incidents on Map */}
          {filteredIncidents.map((incident, idx) => {
            const type = emergencyTypes.find(t => t.id === incident.type)
            const Icon = type?.icon || AlertTriangle
            return (
              <button
                key={incident.id}
                onClick={() => dispatch({ type: 'SELECT_INCIDENT', payload: incident })}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  state.selectedIncident?.id === incident.id ? 'scale-125' : ''
                } transition-transform`}
                style={{
                  left: `${30 + idx * 15}%`,
                  top: `${25 + idx * 18}%`
                }}
              >
                <div className={`w-12 h-12 rounded-full ${
                  incident.urgencyScore > 9 ? 'bg-red-600' : 
                  incident.urgencyScore > 7 ? 'bg-orange-600' : 'bg-yellow-600'
                } flex items-center justify-center shadow-lg animate-pulse`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mt-1 text-xs bg-gray-800 px-2 py-1 rounded">
                  {incident.id}
                </div>
              </button>
            )
          })}
        </div>

        {/* Incident Detail Panel */}
        {state.selectedIncident && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{state.selectedIncident.id}</h3>
                <span className="inline-block mt-1 px-3 py-1 bg-purple-900 text-purple-300 rounded text-sm font-semibold">
                  {state.selectedIncident.classification}
                </span>
              </div>
              <button onClick={() => dispatch({ type: 'SELECT_INCIDENT', payload: null })}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-900 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Urgency Score</div>
                <div className="text-2xl font-bold text-red-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {state.selectedIncident.urgencyScore}/10
                </div>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Battery Level</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Battery className="w-5 h-5" />
                  {state.selectedIncident.batteryLevel}%
                </div>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">Time Elapsed</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {Math.floor((Date.now() - state.selectedIncident.timestamp) / 60000)} min
                </div>
              </div>
              <div className="bg-gray-900 rounded p-3">
                <div className="text-xs text-gray-400 mb-1">ETA</div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  {state.selectedIncident.eta} km
                </div>
              </div>
            </div>

            {state.selectedIncident.message && (
              <div className="bg-gray-900 rounded p-3 mb-4">
                <div className="text-xs text-gray-400 mb-1">Message</div>
                <div className="text-sm">{state.selectedIncident.message}</div>
              </div>
            )}

            <div className="bg-gray-900 rounded p-3 mb-4">
              <div className="text-xs text-gray-400 mb-2">Signal Relay Path</div>
              <div className="flex items-center gap-2 text-xs overflow-x-auto">
                {state.selectedIncident.relayPath.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded whitespace-nowrap">
                      {node}
                    </span>
                    {idx < state.selectedIncident.relayPath.length - 1 && (
                      <span className="text-gray-600">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {!state.selectedIncident.acknowledged && (
                <button
                  onClick={() => dispatch({ type: 'ACKNOWLEDGE_INCIDENT', payload: state.selectedIncident.id })}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                >
                  Acknowledge
                </button>
              )}
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">
                Plan Route
              </button>
              <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold">
                Assign Team
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-semibold">
                Resolve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Incident Card Component
const IncidentCard = ({ incident, selected, onClick, emergencyTypes }) => {
  const type = emergencyTypes.find(t => t.id === incident.type)
  const Icon = type?.icon || AlertTriangle
  const timeAgo = Math.floor((Date.now() - incident.timestamp) / 60000)

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border-b border-gray-700 hover:bg-gray-750 text-left transition ${
        selected ? 'bg-gray-700' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          incident.urgencyScore > 9 ? 'bg-red-600' : 
          incident.urgencyScore > 7 ? 'bg-orange-600' : 'bg-yellow-600'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-sm">{incident.id}</span>
            {incident.acknowledged && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <div className="text-xs text-gray-400 mb-2">{incident.classification}</div>
          
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-400" />
              <span className="font-semibold text-red-400">{incident.urgencyScore}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}m
            </span>
            <span className="flex items-center gap-1">
              <Battery className="w-3 h-3" />
              {incident.batteryLevel}%
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default App
