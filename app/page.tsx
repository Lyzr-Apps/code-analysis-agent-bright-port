'use client'

import { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle, AlertTriangle, XCircle, Send, Menu, Settings, Home as HomeIcon, Rocket, MessageSquare, TrendingUp, DollarSign, Shield, Code, Server, ChevronRight, ChevronDown, X as CloseIcon } from 'lucide-react'

// Agent IDs
const AGENTS = {
  CODE_ANALYSIS: '6985adf57551cb7920ffea13',
  SECURITY_SCANNER: '6985ae172a763ad393eee3d8',
  INFRASTRUCTURE: '6985ae3d2a763ad393eee3d9',
  DEPLOYMENT_ORCHESTRATOR: '6985ae5e2a763ad393eee3da',
  CHAT_ASSISTANT: '6985ae7c85ec6e96582ac263',
}

// TypeScript Interfaces from response schemas
interface TechStack {
  language: string
  framework: string
  package_manager: string
  runtime_version: string
}

interface Blocker {
  type: string
  severity: string
  location: string
  description: string
  auto_fix: string
}

interface CodeAnalysisResult {
  tech_stack: TechStack
  blockers: Blocker[]
  readiness_score: number
  recommendations: string[]
}

interface ExposedCredential {
  type: string
  location: string
  severity: string
  recommendation: string
}

interface Vulnerability {
  package: string
  current_version: string
  cve_id: string
  severity: string
  fixed_version: string
  description: string
}

interface SecurityHeaders {
  configured: string[]
  missing: string[]
  recommendations: string[]
}

interface Compliance {
  soc2_ready: boolean
  gdpr_ready: boolean
  issues: string[]
}

interface SecurityResult {
  security_clearance: string
  risk_level: string
  exposed_credentials: ExposedCredential[]
  vulnerabilities: Vulnerability[]
  security_headers: SecurityHeaders
  compliance: Compliance
  overall_score: number
}

interface ServiceScaling {
  min_instances: number
  max_instances: number
  auto_scale: boolean
}

interface Service {
  name: string
  type: string
  instance_type: string
  scaling: ServiceScaling
}

interface Database {
  type: string
  size: string
  backup: boolean
}

interface InfrastructureDesign {
  services: Service[]
  databases: Database[]
  additional_services: string[]
}

interface MonthlyCost {
  compute: number
  database: number
  networking: number
  storage: number
  total: number
}

interface CostEstimate {
  monthly_cost: MonthlyCost
  currency: string
  breakdown: string
}

interface DeploymentConfig {
  build_command: string
  start_command: string
  environment_variables: string[]
  port: number
  health_check: string
}

interface InfrastructureResult {
  recommended_platform: string
  platform_justification: string
  infrastructure_design: InfrastructureDesign
  cost_estimate: CostEstimate
  deployment_config: DeploymentConfig
  provisioning_steps: string[]
  estimated_time: string
}

interface DeploymentSummary {
  deployment_decision: string
  decision_justification: string
  overall_readiness_score: number
  repository_url: string
  code_analysis_summary: {
    tech_stack: string
    readiness_score: number
    critical_blockers: number
    status: string
  }
  security_summary: {
    security_clearance: string
    risk_level: string
    critical_vulnerabilities: number
    status: string
  }
  infrastructure_summary: {
    recommended_platform: string
    estimated_monthly_cost: number
    provisioning_ready: boolean
    status: string
  }
  next_steps: string[]
  estimated_deployment_time: string
  approval_required: boolean
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Deployment {
  id: string
  name: string
  status: 'success' | 'failed' | 'in_progress' | 'pending'
  lastDeployed: string
  platform: string
  url?: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timestamp: Date
}

export default function Home() {
  const [view, setView] = useState<'dashboard' | 'new-deployment' | 'deployment-detail'>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  // Deployment flow state
  const [repoUrl, setRepoUrl] = useState('')
  const [currentPhase, setCurrentPhase] = useState<'idle' | 'code' | 'security' | 'infrastructure' | 'review'>('idle')
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResult | null>(null)
  const [securityScan, setSecurityScan] = useState<SecurityResult | null>(null)
  const [infrastructure, setInfrastructure] = useState<InfrastructureResult | null>(null)
  const [deploymentSummary, setDeploymentSummary] = useState<DeploymentSummary | null>(null)
  const [phaseLoading, setPhaseLoading] = useState<string | null>(null)
  const [expandedBlocker, setExpandedBlocker] = useState<number | null>(null)

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Dashboard state
  const [deployments, setDeployments] = useState<Deployment[]>([
    { id: '1', name: 'sample-repo', status: 'success', lastDeployed: '2 hours ago', platform: 'Railway', url: 'https://sample.railway.app' },
    { id: '2', name: 'api-service', status: 'in_progress', lastDeployed: '5 minutes ago', platform: 'AWS' },
    { id: '3', name: 'frontend-app', status: 'success', lastDeployed: '1 day ago', platform: 'Vercel', url: 'https://frontend.vercel.app' },
  ])

  const [notifications, setNotifications] = useState<Notification[]>([])

  // Notification system
  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message, timestamp: new Date() }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Start new deployment flow
  const handleStartDeployment = async () => {
    if (!repoUrl.trim()) {
      addNotification('error', 'Please enter a repository URL')
      return
    }

    setView('new-deployment')
    setCurrentPhase('code')
    setPhaseLoading('code')

    try {
      // Phase 1: Code Analysis
      const codeResult = await callAIAgent(
        `Analyze repository: ${repoUrl}`,
        AGENTS.CODE_ANALYSIS
      )

      if (codeResult.success && codeResult.response.result) {
        setCodeAnalysis(codeResult.response.result as CodeAnalysisResult)
        addNotification('success', 'Code analysis completed')
      } else {
        addNotification('error', 'Code analysis failed')
      }

      setPhaseLoading(null)

      // Auto-proceed to security scan after 1 second
      setTimeout(async () => {
        setCurrentPhase('security')
        setPhaseLoading('security')

        try {
          const securityResult = await callAIAgent(
            `Security scan for repository: ${repoUrl}`,
            AGENTS.SECURITY_SCANNER
          )

          if (securityResult.success && securityResult.response.result) {
            setSecurityScan(securityResult.response.result as SecurityResult)
            addNotification('success', 'Security scan completed')
          } else {
            addNotification('error', 'Security scan failed')
          }

          setPhaseLoading(null)

          // Auto-proceed to infrastructure
          setTimeout(async () => {
            setCurrentPhase('infrastructure')
            setPhaseLoading('infrastructure')

            try {
              const infraResult = await callAIAgent(
                `Infrastructure provisioning for repository: ${repoUrl}`,
                AGENTS.INFRASTRUCTURE
              )

              if (infraResult.success && infraResult.response.result) {
                setInfrastructure(infraResult.response.result as InfrastructureResult)
                addNotification('success', 'Infrastructure planning completed')
              } else {
                addNotification('error', 'Infrastructure planning failed')
              }

              setPhaseLoading(null)
              setCurrentPhase('review')
            } catch (error) {
              addNotification('error', 'Infrastructure phase failed')
              setPhaseLoading(null)
            }
          }, 1000)
        } catch (error) {
          addNotification('error', 'Security phase failed')
          setPhaseLoading(null)
        }
      }, 1000)
    } catch (error) {
      addNotification('error', 'Code analysis phase failed')
      setPhaseLoading(null)
    }
  }

  // Approve and deploy
  const handleApproveAndDeploy = async () => {
    setPhaseLoading('deploy')

    try {
      const deployResult = await callAIAgent(
        `Deploy repository: ${repoUrl}`,
        AGENTS.DEPLOYMENT_ORCHESTRATOR
      )

      if (deployResult.success && deployResult.response.result) {
        setDeploymentSummary(deployResult.response.result as DeploymentSummary)
        addNotification('success', 'Deployment approved and initiated!')

        // Add to deployments list
        const newDeployment: Deployment = {
          id: Date.now().toString(),
          name: repoUrl.split('/').pop() || 'new-deployment',
          status: 'in_progress',
          lastDeployed: 'Just now',
          platform: infrastructure?.recommended_platform || 'Railway',
        }
        setDeployments(prev => [newDeployment, ...prev])

        // Reset and go back to dashboard
        setTimeout(() => {
          setView('dashboard')
          resetDeploymentFlow()
        }, 3000)
      } else {
        addNotification('error', 'Deployment orchestration failed')
      }
    } catch (error) {
      addNotification('error', 'Deployment failed')
    }

    setPhaseLoading(null)
  }

  const resetDeploymentFlow = () => {
    setRepoUrl('')
    setCurrentPhase('idle')
    setCodeAnalysis(null)
    setSecurityScan(null)
    setInfrastructure(null)
    setDeploymentSummary(null)
    setPhaseLoading(null)
    setExpandedBlocker(null)
  }

  // Chat functions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      const chatResult = await callAIAgent(chatInput, AGENTS.CHAT_ASSISTANT)

      if (chatResult.success && chatResult.response.result) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: chatResult.response.result.response || 'No response available',
          timestamp: new Date(),
        }
        setChatMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setChatMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Network error. Please try again.',
        timestamp: new Date(),
      }
      setChatMessages(prev => [...prev, errorMessage])
    }

    setChatLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500'
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500'
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500'
      case 'failed': return 'text-red-500 bg-red-500/10 border-red-500'
      case 'in_progress': return 'text-blue-500 bg-blue-500/10 border-blue-500'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5" />
      case 'failed': return <XCircle className="w-5 h-5" />
      case 'in_progress': return <Loader2 className="w-5 h-5 animate-spin" />
      case 'pending': return <AlertTriangle className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          {sidebarOpen && <h1 className="text-xl font-bold text-blue-500">DeployBot</h1>}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              view === 'dashboard' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-gray-800'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => {
              setView('new-deployment')
              resetDeploymentFlow()
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              view === 'new-deployment' ? 'bg-blue-500/20 text-blue-500' : 'hover:bg-gray-800'
            }`}
          >
            <Rocket className="w-5 h-5" />
            {sidebarOpen && <span>Deployments</span>}
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                DB
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">DeployBot User</p>
                <p className="text-xs text-gray-400">admin@deploybot.ai</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold">
            {view === 'dashboard' && 'Dashboard'}
            {view === 'new-deployment' && 'New Deployment'}
            {view === 'deployment-detail' && 'Deployment Details'}
          </h2>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(!chatOpen)}>
              <MessageSquare className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Total Deployments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">124</div>
                    <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Success Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">96.8%</div>
                    <p className="text-xs text-gray-500 mt-1">+2.1% from last month</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Active Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">18</div>
                    <p className="text-xs text-gray-500 mt-1">Across 3 platforms</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">$847</div>
                    <p className="text-xs text-gray-500 mt-1">-5% from last month</p>
                  </CardContent>
                </Card>
              </div>

              {/* New Deployment Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Deployments</h3>
                <Button onClick={() => setView('new-deployment')} className="bg-blue-500 hover:bg-blue-600">
                  <Rocket className="w-4 h-4 mr-2" />
                  New Deployment
                </Button>
              </div>

              {/* Deployments List */}
              <div className="grid gap-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg border ${getStatusColor(deployment.status)}`}>
                            {getStatusIcon(deployment.status)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{deployment.name}</h4>
                            <p className="text-sm text-gray-400">
                              {deployment.platform} • Last deployed {deployment.lastDeployed}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {deployment.url && (
                            <Button variant="outline" size="sm">
                              View Live
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Activity Feed */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Activity Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-white"><span className="font-medium">sample-repo</span> deployed successfully</p>
                      <p className="text-gray-500 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-white">Security scan passed for <span className="font-medium">api-service</span></p>
                      <p className="text-gray-500 text-xs">3 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-white">Code analysis found 2 medium issues in <span className="font-medium">frontend-app</span></p>
                      <p className="text-gray-500 text-xs">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {view === 'new-deployment' && (
            <div className="max-w-6xl mx-auto">
              {currentPhase === 'idle' && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Start New Deployment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Repository URL
                      </label>
                      <Input
                        type="text"
                        placeholder="https://github.com/username/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && handleStartDeployment()}
                      />
                    </div>
                    <Button
                      onClick={handleStartDeployment}
                      disabled={!repoUrl.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Start Deployment Pipeline
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentPhase !== 'idle' && (
                <div className="grid lg:grid-cols-[300px,1fr] gap-6">
                  {/* Timeline */}
                  <div className="space-y-4">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-sm">Pipeline Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Phase 1: Code Analysis */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            currentPhase === 'code' && phaseLoading ? 'border-blue-500' :
                            codeAnalysis ? 'border-green-500 bg-green-500' : 'border-gray-600'
                          }`}>
                            {currentPhase === 'code' && phaseLoading ? (
                              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                            ) : codeAnalysis ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${codeAnalysis ? 'text-green-500' : 'text-gray-400'}`}>
                              Code Analysis
                            </p>
                            <p className="text-xs text-gray-500">Analyze tech stack & blockers</p>
                          </div>
                        </div>

                        {/* Phase 2: Security Scan */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            currentPhase === 'security' && phaseLoading ? 'border-blue-500' :
                            securityScan ? 'border-green-500 bg-green-500' : 'border-gray-600'
                          }`}>
                            {currentPhase === 'security' && phaseLoading ? (
                              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                            ) : securityScan ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${securityScan ? 'text-green-500' : 'text-gray-400'}`}>
                              Security Scan
                            </p>
                            <p className="text-xs text-gray-500">Scan for vulnerabilities</p>
                          </div>
                        </div>

                        {/* Phase 3: Infrastructure */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            currentPhase === 'infrastructure' && phaseLoading ? 'border-blue-500' :
                            infrastructure ? 'border-green-500 bg-green-500' : 'border-gray-600'
                          }`}>
                            {currentPhase === 'infrastructure' && phaseLoading ? (
                              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                            ) : infrastructure ? (
                              <CheckCircle className="w-3 h-3 text-white" />
                            ) : null}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${infrastructure ? 'text-green-500' : 'text-gray-400'}`}>
                              Infrastructure
                            </p>
                            <p className="text-xs text-gray-500">Plan deployment architecture</p>
                          </div>
                        </div>

                        {/* Phase 4: Review & Deploy */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            currentPhase === 'review' ? 'border-blue-500' : 'border-gray-600'
                          }`}>
                            {currentPhase === 'review' && (
                              <CheckCircle className="w-3 h-3 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${currentPhase === 'review' ? 'text-blue-500' : 'text-gray-400'}`}>
                              Review & Deploy
                            </p>
                            <p className="text-xs text-gray-500">Final approval</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detail Panel */}
                  <div className="space-y-6">
                    {/* Code Analysis Results */}
                    {codeAnalysis && (
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Code className="w-5 h-5 text-blue-500" />
                              Code Analysis
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">{codeAnalysis.readiness_score}</span>
                              <span className="text-sm text-gray-400">/100</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Tech Stack */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Tech Stack</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="bg-gray-800 p-2 rounded">
                                <span className="text-gray-400">Language:</span> <span className="text-white">{codeAnalysis.tech_stack.language}</span>
                              </div>
                              <div className="bg-gray-800 p-2 rounded">
                                <span className="text-gray-400">Framework:</span> <span className="text-white">{codeAnalysis.tech_stack.framework}</span>
                              </div>
                              <div className="bg-gray-800 p-2 rounded">
                                <span className="text-gray-400">Package Manager:</span> <span className="text-white">{codeAnalysis.tech_stack.package_manager}</span>
                              </div>
                              <div className="bg-gray-800 p-2 rounded">
                                <span className="text-gray-400">Runtime:</span> <span className="text-white">{codeAnalysis.tech_stack.runtime_version}</span>
                              </div>
                            </div>
                          </div>

                          {/* Blockers */}
                          {codeAnalysis.blockers.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">
                                Issues Found ({codeAnalysis.blockers.length})
                              </h4>
                              <div className="space-y-2">
                                {codeAnalysis.blockers.map((blocker, idx) => (
                                  <div key={idx} className={`border rounded-lg ${getSeverityColor(blocker.severity)}`}>
                                    <button
                                      onClick={() => setExpandedBlocker(expandedBlocker === idx ? null : idx)}
                                      className="w-full p-3 flex items-start gap-3 text-left"
                                    >
                                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-xs font-medium uppercase">{blocker.severity}</span>
                                          <span className="text-xs text-gray-400">{blocker.location}</span>
                                        </div>
                                        <p className="text-sm">{blocker.description}</p>
                                      </div>
                                      {expandedBlocker === idx ? (
                                        <ChevronDown className="w-4 h-4 mt-0.5" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 mt-0.5" />
                                      )}
                                    </button>
                                    {expandedBlocker === idx && (
                                      <div className="px-3 pb-3 space-y-2">
                                        <div className="bg-gray-950 p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto">
                                          {blocker.auto_fix}
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full">
                                          Apply Fix
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {codeAnalysis.recommendations.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h4>
                              <ul className="space-y-1 text-sm">
                                {codeAnalysis.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                                    <span className="text-gray-300">{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Security Scan Results */}
                    {securityScan && (
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-500" />
                              Security Scan
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                securityScan.security_clearance === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {securityScan.security_clearance}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Risk Level */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Risk Level</p>
                              <p className="text-lg font-semibold text-white capitalize">{securityScan.risk_level}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Security Score</p>
                              <p className="text-lg font-semibold text-white">{securityScan.overall_score}/100</p>
                            </div>
                          </div>

                          {/* Exposed Credentials */}
                          {securityScan.exposed_credentials.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Exposed Credentials</h4>
                              <div className="space-y-2">
                                {securityScan.exposed_credentials.map((cred, idx) => (
                                  <div key={idx} className={`p-3 border rounded-lg ${getSeverityColor(cred.severity)}`}>
                                    <div className="flex items-start gap-2">
                                      <XCircle className="w-4 h-4 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium">{cred.type} at {cred.location}</p>
                                        <p className="text-xs text-gray-400 mt-1">{cred.recommendation}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vulnerabilities */}
                          {securityScan.vulnerabilities.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Vulnerabilities</h4>
                              <div className="space-y-2">
                                {securityScan.vulnerabilities.map((vuln, idx) => (
                                  <div key={idx} className={`p-3 border rounded-lg ${getSeverityColor(vuln.severity)}`}>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-sm font-medium">{vuln.package} ({vuln.cve_id})</p>
                                        <p className="text-xs text-gray-400 mt-1">{vuln.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          Current: {vuln.current_version} → Fix: {vuln.fixed_version}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Compliance */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Compliance</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className={`p-2 rounded ${securityScan.compliance.soc2_ready ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                SOC2: {securityScan.compliance.soc2_ready ? 'Ready' : 'Not Ready'}
                              </div>
                              <div className={`p-2 rounded ${securityScan.compliance.gdpr_ready ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                GDPR: {securityScan.compliance.gdpr_ready ? 'Ready' : 'Not Ready'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Infrastructure Results */}
                    {infrastructure && (
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-500" />
                            Infrastructure Planning
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Platform */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Recommended Platform</h4>
                            <div className="bg-gray-800 p-3 rounded">
                              <p className="text-lg font-semibold text-white">{infrastructure.recommended_platform}</p>
                              <p className="text-sm text-gray-400 mt-1">{infrastructure.platform_justification}</p>
                            </div>
                          </div>

                          {/* Cost Estimate */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Cost Estimate</h4>
                            <div className="bg-gray-800 p-4 rounded">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400">Monthly Total</span>
                                <span className="text-2xl font-bold text-white">
                                  ${infrastructure.cost_estimate.monthly_cost.total}
                                  <span className="text-sm text-gray-400 ml-1">{infrastructure.cost_estimate.currency}</span>
                                </span>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Compute</span>
                                  <span className="text-white">${infrastructure.cost_estimate.monthly_cost.compute}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Database</span>
                                  <span className="text-white">${infrastructure.cost_estimate.monthly_cost.database}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Networking</span>
                                  <span className="text-white">${infrastructure.cost_estimate.monthly_cost.networking}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Storage</span>
                                  <span className="text-white">${infrastructure.cost_estimate.monthly_cost.storage}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Services */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Services</h4>
                            <div className="space-y-2">
                              {infrastructure.infrastructure_design.services.map((service, idx) => (
                                <div key={idx} className="bg-gray-800 p-3 rounded">
                                  <p className="text-sm font-medium text-white">{service.name}</p>
                                  <p className="text-xs text-gray-400">{service.instance_type}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Scaling: {service.scaling.min_instances}-{service.scaling.max_instances} instances
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Deployment Config */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">Deployment Configuration</h4>
                            <div className="bg-gray-950 p-3 rounded text-xs font-mono space-y-1 text-gray-300">
                              <div>Build: <span className="text-blue-400">{infrastructure.deployment_config.build_command}</span></div>
                              <div>Start: <span className="text-blue-400">{infrastructure.deployment_config.start_command}</span></div>
                              <div>Port: <span className="text-blue-400">{infrastructure.deployment_config.port}</span></div>
                              <div>Health Check: <span className="text-blue-400">{infrastructure.deployment_config.health_check}</span></div>
                            </div>
                          </div>

                          {/* Estimated Time */}
                          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded">
                            <p className="text-sm text-blue-400">
                              Estimated provisioning time: <span className="font-semibold">{infrastructure.estimated_time}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Review & Deploy */}
                    {currentPhase === 'review' && codeAnalysis && securityScan && infrastructure && (
                      <Card className="bg-gray-900 border-gray-800">
                        <CardHeader>
                          <CardTitle>Review & Deploy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-gray-800 p-4 rounded space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Code Readiness</span>
                              <span className="font-semibold text-white">{codeAnalysis.readiness_score}/100</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Security Score</span>
                              <span className="font-semibold text-white">{securityScan.overall_score}/100</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Platform</span>
                              <span className="font-semibold text-white">{infrastructure.recommended_platform}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Monthly Cost</span>
                              <span className="font-semibold text-white">${infrastructure.cost_estimate.monthly_cost.total}</span>
                            </div>
                          </div>

                          <Button
                            onClick={handleApproveAndDeploy}
                            disabled={phaseLoading === 'deploy'}
                            className="w-full bg-green-500 hover:bg-green-600"
                          >
                            {phaseLoading === 'deploy' ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deploying...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Deploy
                              </>
                            )}
                          </Button>

                          {deploymentSummary && (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded">
                              <p className="text-green-400 font-medium mb-2">Deployment Initiated!</p>
                              <p className="text-sm text-gray-400">{deploymentSummary.decision_justification}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
          <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
            <h3 className="font-semibold">Chat Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)}>
              <CloseIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ask me anything about your deployments</p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setChatInput('Why did my last deployment fail?')}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded w-full text-left"
                  >
                    Why did my last deployment fail?
                  </button>
                  <button
                    onClick={() => setChatInput('Show me the deployment logs')}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded w-full text-left"
                  >
                    Show me the deployment logs
                  </button>
                  <button
                    onClick={() => setChatInput('How can I reduce my monthly costs?')}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded w-full text-left"
                  >
                    How can I reduce my monthly costs?
                  </button>
                </div>
              </div>
            )}

            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={handleSendMessage} disabled={!chatInput.trim() || chatLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg border flex items-start gap-3 min-w-[300px] ${
              notif.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-400' :
              notif.type === 'error' ? 'bg-red-500/20 border-red-500 text-red-400' :
              notif.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
              'bg-blue-500/20 border-blue-500 text-blue-400'
            }`}
          >
            <div className="mt-0.5">
              {notif.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notif.type === 'error' && <XCircle className="w-5 h-5" />}
              {notif.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {notif.type === 'info' && <MessageSquare className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notif.message}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="opacity-50 hover:opacity-100"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
