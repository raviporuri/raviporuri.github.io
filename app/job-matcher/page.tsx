'use client'

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
  Textarea,
  Paper,
  ThemeIcon,
  Loader,
  Alert,
  Progress,
  Divider
} from '@mantine/core'
import {
  IconSearch,
  IconTarget,
  IconBrain,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconArrowRight,
  IconBriefcase,
  IconChartBar,
  IconStar
} from '@tabler/icons-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface JobMatch {
  matchScore: number
  matchReasons: string[]
  missingSkills: string[]
  recommendations: string[]
  salaryRange: string
  roleLevel: string
  company: string
  position: string
  location: string
}

export default function JobMatcherPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<JobMatch | null>(null)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description to analyze')
      return
    }

    setLoading(true)
    setError('')
    setAnalysis(null)

    try {
      const response = await fetch('/api/job-matcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to analyze job description')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    if (score >= 40) return 'orange'
    return 'red'
  }

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Poor Match'
  }

  return (
    <Container size="lg" py="2rem">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <Title order={1} size="2.5rem" fw={700} mb="md">
              AI Job Matcher
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Analyze job opportunities against Ravi's 25+ years of technology leadership experience.
              Get intelligent matching insights and personalized recommendations.
            </Text>
          </Box>

          {/* Input Section */}
          <Card shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group>
                <ThemeIcon size="xl" color="blue" variant="light">
                  <IconSearch size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Job Description Analysis</Title>
                  <Text c="dimmed">Paste the complete job description below for AI-powered analysis</Text>
                </div>
              </Group>

              <Textarea
                placeholder="Paste the complete job description here... Include role requirements, responsibilities, qualifications, company info, etc."
                minRows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.currentTarget.value)}
                disabled={loading}
              />

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Group justify="center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={loading || !jobDescription.trim()}
                  leftSection={loading ? <Loader size="sm" /> : <IconBrain size={20} />}
                >
                  {loading ? 'Analyzing Match...' : 'Analyze Job Match'}
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Stack gap="lg">
                {/* Match Score */}
                <Card shadow="sm" padding="xl" radius="md" style={{ border: `2px solid var(--mantine-color-${getMatchColor(analysis.matchScore)}-5)` }}>
                  <Group justify="space-between" align="center">
                    <div>
                      <Title order={2}>Match Score</Title>
                      <Text size="lg" c="dimmed">Overall compatibility analysis</Text>
                    </div>
                    <Box ta="center">
                      <Text size="3rem" fw={900} c={getMatchColor(analysis.matchScore)}>
                        {analysis.matchScore}%
                      </Text>
                      <Badge size="lg" color={getMatchColor(analysis.matchScore)}>
                        {getMatchLabel(analysis.matchScore)}
                      </Badge>
                    </Box>
                  </Group>
                  <Progress
                    value={analysis.matchScore}
                    color={getMatchColor(analysis.matchScore)}
                    size="xl"
                    radius="xl"
                    mt="md"
                  />
                </Card>

                {/* Job Details */}
                <Card shadow="sm" padding="xl" radius="md">
                  <Title order={3} mb="md">Position Overview</Title>
                  <Group grow>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Company</Text>
                      <Text fw={600}>{analysis.company}</Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Position</Text>
                      <Text fw={600}>{analysis.position}</Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Level</Text>
                      <Text fw={600}>{analysis.roleLevel}</Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Location</Text>
                      <Text fw={600}>{analysis.location}</Text>
                    </Stack>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">Salary Range</Text>
                      <Text fw={600}>{analysis.salaryRange}</Text>
                    </Stack>
                  </Group>
                </Card>

                <Group align="start" grow>
                  {/* Match Reasons */}
                  <Card shadow="sm" padding="xl" radius="md" h="100%">
                    <Group mb="md">
                      <ThemeIcon color="green" variant="light">
                        <IconCheck size={16} />
                      </ThemeIcon>
                      <Title order={4}>Why This Matches</Title>
                    </Group>
                    <Stack gap="xs">
                      {analysis.matchReasons.map((reason, index) => (
                        <Group key={index} gap="xs" align="start">
                          <IconCheck size={14} color="green" style={{ marginTop: '2px' }} />
                          <Text size="sm">{reason}</Text>
                        </Group>
                      ))}
                    </Stack>
                  </Card>

                  {/* Missing Skills */}
                  {analysis.missingSkills.length > 0 && (
                    <Card shadow="sm" padding="xl" radius="md" h="100%">
                      <Group mb="md">
                        <ThemeIcon color="orange" variant="light">
                          <IconAlertCircle size={16} />
                        </ThemeIcon>
                        <Title order={4}>Skills to Highlight</Title>
                      </Group>
                      <Stack gap="xs">
                        {analysis.missingSkills.map((skill, index) => (
                          <Group key={index} gap="xs" align="start">
                            <IconArrowRight size={14} color="orange" style={{ marginTop: '2px' }} />
                            <Text size="sm">{skill}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Card>
                  )}
                </Group>

                {/* Recommendations */}
                <Card shadow="sm" padding="xl" radius="md">
                  <Group mb="md">
                    <ThemeIcon color="blue" variant="light">
                      <IconTarget size={16} />
                    </ThemeIcon>
                    <Title order={4}>AI Recommendations</Title>
                  </Group>
                  <Stack gap="sm">
                    {analysis.recommendations.map((rec, index) => (
                      <Paper key={index} p="md" radius="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                        <Text size="sm">{rec}</Text>
                      </Paper>
                    ))}
                  </Stack>
                </Card>

                {/* Action Buttons */}
                <Group justify="center">
                  <Button
                    size="lg"
                    variant="outline"
                    leftSection={<IconBriefcase size={20} />}
                    onClick={() => window.open('/resume-customizer', '_blank')}
                  >
                    Customize Resume for This Role
                  </Button>
                  <Button
                    size="lg"
                    leftSection={<IconChartBar size={20} />}
                    onClick={() => setJobDescription('')}
                  >
                    Analyze Another Position
                  </Button>
                </Group>
              </Stack>
            </motion.div>
          )}

          {/* Example Jobs */}
          {!analysis && (
            <Card shadow="sm" padding="xl" radius="md">
              <Title order={4} mb="md">Try These Example Positions</Title>
              <Text size="sm" c="dimmed" mb="md">
                Click to analyze common roles that match Ravi's background:
              </Text>
              <Group>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Chief Technology Officer
Senior technology executive role leading engineering organization of 200+ engineers across multiple product lines. Responsible for technology strategy, architecture decisions, and scaling engineering practices.

Requirements:
- 15+ years technology leadership experience
- Experience scaling engineering teams from startup to enterprise
- Background in data platforms, AI/ML, and cloud infrastructure
- IPO or acquisition experience preferred
- Strong background in B2B SaaS platforms`)}
                >
                  CTO Position
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`VP of Engineering - AI/ML
Lead engineering for AI-powered platform serving millions of users. Build and scale ML infrastructure, guide AI strategy, and manage global engineering teams.

Requirements:
- 10+ years engineering leadership experience
- Deep experience with AI/ML platforms and LLMs
- Experience managing 50+ person engineering organizations
- Background in data engineering and analytics
- Cloud-native architecture experience (AWS, Azure)`)}
                >
                  VP Engineering - AI
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Senior Director of Data Engineering
Strategic leadership role overseeing data platform engineering across multiple business units. Lead data strategy, architecture, and team development for enterprise-scale data operations.

Requirements:
- 12+ years data engineering experience
- Experience with big data platforms (Hadoop, Spark, Kafka)
- Cloud data platform expertise (Snowflake, AWS, GCP)
- Team leadership experience (25+ person teams)
- Business intelligence and analytics background`)}
                >
                  Sr Director Data
                </Button>
              </Group>
            </Card>
          )}
        </Stack>
      </motion.div>
    </Container>
  )
}