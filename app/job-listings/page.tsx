'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Stack,
  Badge,
  Box,
  TextInput,
  Select,
  Loader,
  Alert,
  Modal,
  Tabs,
  Divider,
  Progress,
  ActionIcon,
  Tooltip,
  MultiSelect,
  Switch,
  Paper,
  Anchor,
  ThemeIcon
} from '@mantine/core'
import {
  IconSearch,
  IconFilter,
  IconStar,
  IconMapPin,
  IconCurrencyDollar,
  IconCalendar,
  IconExternalLink,
  IconFileText,
  IconBrain,
  IconTarget,
  IconTrendingUp,
  IconBuilding,
  IconSettings,
  IconRefresh,
  IconAlertCircle
} from '@tabler/icons-react'
import { motion } from 'framer-motion'

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary?: string
  description: string
  url: string
  source: string
  postedDate: string
  relevanceScore?: number
  matchReasons?: string[]
}

interface JobStrategy {
  relevanceScore: number
  matchStrengths: string[]
  potentialConcerns: string[]
  resumeStrategy: {
    keyExperiences: string[]
    quantifiedAchievements: string[]
    technicalSkills: string[]
    leadershipStories: string[]
  }
  coverLetterStrategy: {
    openingHook: string
    keySellingPoints: string[]
    closingCTA: string
  }
  interviewPrep: {
    starStories: string[]
    technicalDepth: string[]
    questionsToAsk: string[]
  }
  applicationStrategy: {
    preferredChannel: string
    networkingApproach: string
    followUpTimeline: string
  }
}

export default function JobListingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessKey, setAccessKey] = useState('')
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Search parameters
  const [keywords, setKeywords] = useState('CTO OR "Chief Technology Officer" OR "VP Engineering" OR "Head of Engineering"')
  const [location, setLocation] = useState('San Francisco Bay Area')
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [excludeCompanies, setExcludeCompanies] = useState<string[]>([])

  // UI state
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [strategyModalOpen, setStrategyModalOpen] = useState(false)
  const [jobStrategy, setJobStrategy] = useState<JobStrategy | null>(null)
  const [strategyLoading, setStrategyLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>('search')

  // Check authentication
  useEffect(() => {
    const stored = sessionStorage.getItem('job-listings-auth')
    if (stored === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthentication = () => {
    if (accessKey === 'ravi2025jobs' || accessKey === 'demo') {
      setIsAuthenticated(true)
      sessionStorage.setItem('job-listings-auth', 'authenticated')
      setError('')
    } else {
      setError('Invalid access key. Please contact Ravi for access.')
    }
  }

  const searchJobs = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          location,
          remote: remoteOnly,
          companies,
          excludeCompanies
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search jobs')
      }

      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Job search error:', error)
      setError('Failed to search jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getJobStrategy = async (job: JobListing) => {
    setSelectedJob(job)
    setStrategyModalOpen(true)
    setStrategyLoading(true)

    try {
      const response = await fetch('/api/job-tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          jobUrl: job.url
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create strategy')
      }

      setJobStrategy(data)
    } catch (error) {
      console.error('Strategy error:', error)
      setError('Failed to create application strategy.')
    } finally {
      setStrategyLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const companyOptions = [
    'OpenAI', 'Anthropic', 'Databricks', 'Snowflake', 'Stripe', 'Airbnb',
    'Netflix', 'Uber', 'Meta', 'Google', 'Microsoft', 'Amazon', 'Apple'
  ]

  // Authentication gate
  if (!isAuthenticated) {
    return (
      <Container size="sm" py="4rem">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card shadow="lg" padding="xl" radius="md" style={{ maxWidth: 500, margin: '0 auto' }}>
            <Stack gap="lg" ta="center">
              <ThemeIcon size={60} radius={30} mx="auto" color="green">
                <IconSearch size={30} />
              </ThemeIcon>

              <div>
                <Title order={2} mb="md">
                  AI Job Listings Agent
                </Title>
                <Text c="dimmed" size="sm">
                  This is a private tool for intelligent job search and application strategy.
                  Please enter your access key to continue.
                </Text>
              </div>

              <TextInput
                placeholder="Enter access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthentication()}
                size="md"
              />

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Button
                onClick={handleAuthentication}
                size="md"
                fullWidth
                disabled={!accessKey.trim()}
              >
                Access Job Listings
              </Button>

              <Text size="xs" c="dimmed">
                Need access? Contact Ravi through LinkedIn or the website contact form.
              </Text>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container size="xl" py="2rem">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <Title order={1} size="2.5rem" fw={700} mb="md">
              AI Job Listings Agent
            </Title>
            <Text size="lg" c="dimmed" maw={700} mx="auto">
              Intelligent job search powered by multiple sources with AI-driven relevance scoring
              and automated application strategy generation.
            </Text>
          </Box>

          {/* Search Controls */}
          <Card shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group>
                <IconFilter size={20} />
                <Title order={3}>Search Criteria</Title>
              </Group>

              <Group grow>
                <TextInput
                  label="Keywords"
                  placeholder="CTO, VP Engineering, Chief Technology Officer"
                  value={keywords}
                  onChange={(e) => setKeywords(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                />
                <TextInput
                  label="Location"
                  placeholder="San Francisco Bay Area"
                  value={location}
                  onChange={(e) => setLocation(e.currentTarget.value)}
                  leftSection={<IconMapPin size={16} />}
                />
              </Group>

              <Group grow>
                <MultiSelect
                  label="Target Companies (optional)"
                  placeholder="Select companies to focus on"
                  data={companyOptions}
                  value={companies}
                  onChange={setCompanies}
                  searchable
                  clearable
                />
                <MultiSelect
                  label="Exclude Companies (optional)"
                  placeholder="Companies to exclude"
                  data={companyOptions}
                  value={excludeCompanies}
                  onChange={setExcludeCompanies}
                  searchable
                  clearable
                />
              </Group>

              <Group>
                <Switch
                  label="Remote only"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.currentTarget.checked)}
                />
              </Group>

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Group justify="center">
                <Button
                  size="lg"
                  onClick={searchJobs}
                  disabled={loading || !keywords.trim()}
                  leftSection={loading ? <Loader size="sm" /> : <IconSearch size={20} />}
                >
                  {loading ? 'Searching Jobs...' : 'Search Jobs'}
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Results */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card shadow="sm" padding="xl" radius="md">
                <Group justify="space-between" mb="lg">
                  <Title order={2}>Found {jobs.length} Opportunities</Title>
                  <Button
                    variant="light"
                    leftSection={<IconRefresh size={16} />}
                    onClick={searchJobs}
                  >
                    Refresh
                  </Button>
                </Group>

                <Stack gap="md">
                  {jobs.map((job) => (
                    <Card key={job.id} shadow="xs" padding="lg" radius="md" withBorder>
                      <Stack gap="sm">
                        <Group justify="space-between" align="start">
                          <div style={{ flex: 1 }}>
                            <Group gap="sm" mb="xs">
                              <Title order={4}>{job.title}</Title>
                              {job.relevanceScore && (
                                <Badge color={getScoreColor(job.relevanceScore)} size="sm">
                                  {job.relevanceScore}% match
                                </Badge>
                              )}
                              {job.remote && (
                                <Badge color="blue" variant="light" size="sm">
                                  Remote
                                </Badge>
                              )}
                            </Group>

                            <Group gap="md" mb="sm">
                              <Group gap="xs">
                                <IconBuilding size={16} />
                                <Text size="sm" fw={500}>{job.company}</Text>
                              </Group>
                              <Group gap="xs">
                                <IconMapPin size={16} />
                                <Text size="sm">{job.location}</Text>
                              </Group>
                              {job.salary && (
                                <Group gap="xs">
                                  <IconCurrencyDollar size={16} />
                                  <Text size="sm">{job.salary}</Text>
                                </Group>
                              )}
                              <Group gap="xs">
                                <IconCalendar size={16} />
                                <Text size="sm">{formatDate(job.postedDate)}</Text>
                              </Group>
                            </Group>

                            {job.matchReasons && job.matchReasons.length > 0 && (
                              <Group gap="xs" mb="sm">
                                {job.matchReasons.slice(0, 2).map((reason, index) => (
                                  <Badge key={index} variant="light" color="green" size="xs">
                                    {reason}
                                  </Badge>
                                ))}
                              </Group>
                            )}

                            <Text size="sm" c="dimmed" lineClamp={2} mb="sm">
                              {job.description}
                            </Text>

                            <Group gap="xs">
                              <Badge variant="outline" size="xs">{job.source}</Badge>
                            </Group>
                          </div>

                          <Stack gap="xs">
                            <Tooltip label="View job details">
                              <ActionIcon
                                component="a"
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="light"
                                color="blue"
                              >
                                <IconExternalLink size={16} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label="Get application strategy">
                              <ActionIcon
                                onClick={() => getJobStrategy(job)}
                                variant="light"
                                color="green"
                              >
                                <IconBrain size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Stack>
                        </Group>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Card>
            </motion.div>
          )}

          {/* Strategy Modal */}
          <Modal
            opened={strategyModalOpen}
            onClose={() => setStrategyModalOpen(false)}
            title={selectedJob ? `Application Strategy: ${selectedJob.title}` : 'Application Strategy'}
            size="xl"
          >
            {strategyLoading ? (
              <Stack align="center" py="xl">
                <Loader size="lg" />
                <Text>Creating personalized application strategy...</Text>
              </Stack>
            ) : jobStrategy ? (
              <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                  <Tabs.Tab value="overview" leftSection={<IconTarget size={14} />}>
                    Overview
                  </Tabs.Tab>
                  <Tabs.Tab value="resume" leftSection={<IconFileText size={14} />}>
                    Resume Strategy
                  </Tabs.Tab>
                  <Tabs.Tab value="cover" leftSection={<IconStar size={14} />}>
                    Cover Letter
                  </Tabs.Tab>
                  <Tabs.Tab value="interview" leftSection={<IconBrain size={14} />}>
                    Interview Prep
                  </Tabs.Tab>
                  <Tabs.Tab value="application" leftSection={<IconTrendingUp size={14} />}>
                    Application Plan
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="md">
                  <Stack gap="lg">
                    <Group align="center">
                      <Progress
                        value={jobStrategy.relevanceScore}
                        size="lg"
                        color={getScoreColor(jobStrategy.relevanceScore)}
                        style={{ flex: 1 }}
                      />
                      <Text fw={600}>{jobStrategy.relevanceScore}% Match</Text>
                    </Group>

                    <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                      <Title order={5} mb="sm">Match Strengths</Title>
                      <Stack gap="xs">
                        {jobStrategy.matchStrengths.map((strength, index) => (
                          <Text key={index} size="sm">✓ {strength}</Text>
                        ))}
                      </Stack>
                    </Card>

                    {jobStrategy.potentialConcerns.length > 0 && (
                      <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
                        <Title order={5} mb="sm">Potential Concerns</Title>
                        <Stack gap="xs">
                          {jobStrategy.potentialConcerns.map((concern, index) => (
                            <Text key={index} size="sm">⚠ {concern}</Text>
                          ))}
                        </Stack>
                      </Card>
                    )}
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="resume" pt="md">
                  <Stack gap="md">
                    <div>
                      <Title order={5} mb="sm">Key Experiences to Emphasize</Title>
                      <Stack gap="xs">
                        {jobStrategy.resumeStrategy.keyExperiences.map((exp, index) => (
                          <Text key={index} size="sm">• {exp}</Text>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Quantified Achievements</Title>
                      <Stack gap="xs">
                        {jobStrategy.resumeStrategy.quantifiedAchievements.map((achievement, index) => (
                          <Text key={index} size="sm">• {achievement}</Text>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Technical Skills to Prioritize</Title>
                      <Group gap="xs">
                        {jobStrategy.resumeStrategy.technicalSkills.map((skill, index) => (
                          <Badge key={index} variant="light" color="blue">
                            {skill}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="cover" pt="md">
                  <Stack gap="md">
                    <div>
                      <Title order={5} mb="sm">Opening Hook</Title>
                      <Text size="sm" style={{ fontStyle: 'italic' }}>
                        "{jobStrategy.coverLetterStrategy.openingHook}"
                      </Text>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Key Selling Points</Title>
                      <Stack gap="xs">
                        {jobStrategy.coverLetterStrategy.keySellingPoints.map((point, index) => (
                          <Text key={index} size="sm">• {point}</Text>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Closing Call-to-Action</Title>
                      <Text size="sm" style={{ fontStyle: 'italic' }}>
                        "{jobStrategy.coverLetterStrategy.closingCTA}"
                      </Text>
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="interview" pt="md">
                  <Stack gap="md">
                    <div>
                      <Title order={5} mb="sm">STAR Stories to Prepare</Title>
                      <Stack gap="xs">
                        {jobStrategy.interviewPrep.starStories.map((story, index) => (
                          <Text key={index} size="sm">• {story}</Text>
                        ))}
                      </Stack>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Technical Depth Areas</Title>
                      <Group gap="xs">
                        {jobStrategy.interviewPrep.technicalDepth.map((area, index) => (
                          <Badge key={index} variant="outline" color="orange">
                            {area}
                          </Badge>
                        ))}
                      </Group>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Questions to Ask</Title>
                      <Stack gap="xs">
                        {jobStrategy.interviewPrep.questionsToAsk.map((question, index) => (
                          <Text key={index} size="sm">• {question}</Text>
                        ))}
                      </Stack>
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="application" pt="md">
                  <Stack gap="md">
                    <div>
                      <Title order={5} mb="sm">Preferred Application Channel</Title>
                      <Text size="sm">{jobStrategy.applicationStrategy.preferredChannel}</Text>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Networking Approach</Title>
                      <Text size="sm">{jobStrategy.applicationStrategy.networkingApproach}</Text>
                    </div>

                    <div>
                      <Title order={5} mb="sm">Follow-up Timeline</Title>
                      <Text size="sm">{jobStrategy.applicationStrategy.followUpTimeline}</Text>
                    </div>

                    <Divider />

                    <Group justify="center">
                      <Button
                        component="a"
                        href={selectedJob?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        leftSection={<IconExternalLink size={16} />}
                        size="lg"
                      >
                        Apply Now
                      </Button>
                    </Group>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            ) : null}
          </Modal>
        </Stack>
      </motion.div>
    </Container>
  )
}