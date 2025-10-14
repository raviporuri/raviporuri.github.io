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
  Tabs,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import {
  IconFileText,
  IconWand,
  IconBrain,
  IconDownload,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconStar,
  IconTarget,
  IconTrendingUp
} from '@tabler/icons-react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface CustomizedResume {
  summary: string
  keyAchievements: string[]
  relevantExperience: string[]
  technicalSkills: string[]
  recommendations: string[]
  coverLetter?: string
}

export default function ResumeCustomizerPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [customizedResume, setCustomizedResume] = useState<CustomizedResume | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>('resume')

  const handleCustomize = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description to customize the resume')
      return
    }

    setLoading(true)
    setError('')
    setCustomizedResume(null)

    try {
      const response = await fetch('/api/resume-customizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      })

      if (response.ok) {
        const data = await response.json()
        setCustomizedResume(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to customize resume')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatResumeText = () => {
    if (!customizedResume) return ''

    return `RAVI PORURI
Technology Leader & AI Innovator
Email: raviporuri@gmail.com | Phone: (408) 823-6713 | LinkedIn: linkedin.com/in/raviporuri

EXECUTIVE SUMMARY
${customizedResume.summary}

KEY ACHIEVEMENTS
${customizedResume.keyAchievements.map(achievement => `• ${achievement}`).join('\n')}

RELEVANT EXPERIENCE

${customizedResume.relevantExperience.join('\n\n')}

TECHNICAL EXPERTISE
${customizedResume.technicalSkills.join(' • ')}

EDUCATION
• MBA (Finance) - Amity University, India
• Bachelor of Computer Applications - Madras University, India (2000)

CERTIFICATIONS & RECOGNITION
• Oracle Certified Professional
• Teradata Certified Implementation Specialist
• Multiple U.S. Patents in Data Platform Technologies
• Snowflake Black Diamond Executive Council Member
• Gartner BI Excellence Award Finalist`
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
              AI Resume Customizer
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Intelligently tailor Ravi's resume to highlight the most relevant experience and achievements
              for specific job opportunities. All information is factual and based on actual experience.
            </Text>
          </Box>

          {/* Input Section */}
          <Card shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group>
                <ThemeIcon size="xl" color="blue" variant="light">
                  <IconWand size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Job-Specific Resume Customization</Title>
                  <Text c="dimmed">Enter the job description to get a tailored resume highlighting relevant experience</Text>
                </div>
              </Group>

              <Textarea
                placeholder="Paste the complete job description here... The AI will analyze requirements and customize Ravi's resume to emphasize the most relevant experience and achievements."
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
                  onClick={handleCustomize}
                  disabled={loading || !jobDescription.trim()}
                  leftSection={loading ? <Loader size="sm" /> : <IconBrain size={20} />}
                >
                  {loading ? 'Customizing Resume...' : 'Customize Resume'}
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Customized Resume Results */}
          {customizedResume && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card shadow="sm" padding="xl" radius="md">
                <Stack gap="lg">
                  <Group justify="space-between" align="center">
                    <Title order={2}>Customized Resume</Title>
                    <Group>
                      <CopyButton value={formatResumeText()}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy resume'} withArrow position="right">
                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                              {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                      <Button leftSection={<IconDownload size={16} />}>
                        Download PDF
                      </Button>
                    </Group>
                  </Group>

                  <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                      <Tabs.Tab value="resume" leftSection={<IconFileText size={14} />}>
                        Resume
                      </Tabs.Tab>
                      <Tabs.Tab value="cover" leftSection={<IconStar size={14} />}>
                        Cover Letter
                      </Tabs.Tab>
                      <Tabs.Tab value="tips" leftSection={<IconTarget size={14} />}>
                        Interview Tips
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="resume" pt="md">
                      <Stack gap="lg">
                        {/* Executive Summary */}
                        <Card shadow="xs" padding="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                          <Title order={4} mb="md">Executive Summary</Title>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {customizedResume.summary}
                          </Text>
                        </Card>

                        {/* Key Achievements */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Key Achievements</Title>
                          <Stack gap="sm">
                            {customizedResume.keyAchievements.map((achievement, index) => (
                              <Group key={index} gap="xs" align="start">
                                <ThemeIcon size="sm" color="green" variant="light" mt={4}>
                                  <IconStar size={12} />
                                </ThemeIcon>
                                <Text size="sm">{achievement}</Text>
                              </Group>
                            ))}
                          </Stack>
                        </Card>

                        {/* Relevant Experience */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Relevant Experience Highlights</Title>
                          <Stack gap="md">
                            {customizedResume.relevantExperience.map((experience, index) => (
                              <Box key={index}>
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                  {experience}
                                </Text>
                                {index < customizedResume.relevantExperience.length - 1 && <Divider mt="md" />}
                              </Box>
                            ))}
                          </Stack>
                        </Card>

                        {/* Technical Skills */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Prioritized Technical Skills</Title>
                          <Group gap="xs">
                            {customizedResume.technicalSkills.map((skill, index) => (
                              <Badge key={index} variant="light" color="blue">
                                {skill}
                              </Badge>
                            ))}
                          </Group>
                        </Card>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="cover" pt="md">
                      {customizedResume.coverLetter ? (
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Customized Cover Letter</Title>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {customizedResume.coverLetter}
                          </Text>
                        </Card>
                      ) : (
                        <Alert icon={<IconAlertCircle size="1rem" />} color="blue" variant="light">
                          Cover letter will be generated in the next update. For now, focus on the customized resume sections.
                        </Alert>
                      )}
                    </Tabs.Panel>

                    <Tabs.Panel value="tips" pt="md">
                      <Card shadow="xs" padding="lg" radius="md">
                        <Title order={4} mb="md">Strategic Recommendations</Title>
                        <Stack gap="md">
                          {customizedResume.recommendations.map((recommendation, index) => (
                            <Paper key={index} p="md" radius="sm" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                              <Group gap="xs" align="start">
                                <ThemeIcon size="sm" color="green" variant="light">
                                  <IconTrendingUp size={12} />
                                </ThemeIcon>
                                <Text size="sm">{recommendation}</Text>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      </Card>
                    </Tabs.Panel>
                  </Tabs>

                  {/* Action Buttons */}
                  <Group justify="center">
                    <Button
                      size="lg"
                      variant="outline"
                      leftSection={<IconTarget size={20} />}
                      onClick={() => window.open('/job-matcher', '_blank')}
                    >
                      Analyze Job Match
                    </Button>
                    <Button
                      size="lg"
                      leftSection={<IconWand size={20} />}
                      onClick={() => {
                        setJobDescription('')
                        setCustomizedResume(null)
                      }}
                    >
                      Customize for Another Role
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </motion.div>
          )}

          {/* Resume Templates */}
          {!customizedResume && (
            <Card shadow="sm" padding="xl" radius="md">
              <Title order={4} mb="md">Quick Resume Templates</Title>
              <Text size="sm" c="dimmed" mb="md">
                Try these pre-configured job types for instant resume customization:
              </Text>
              <Group>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Chief Technology Officer - AI/ML Company
Leading technology vision and engineering organization for AI-powered SaaS platform. Responsible for technology strategy, product architecture, and scaling engineering practices from 100 to 500+ engineers.

Requirements:
- 15+ years technology leadership in enterprise software
- Experience scaling engineering organizations through hypergrowth
- Deep background in AI/ML, data platforms, and cloud infrastructure
- IPO or major acquisition experience required
- Proven track record of building world-class engineering cultures`)}
                >
                  CTO - AI Company
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`VP of Engineering - Enterprise Data Platform
Lead engineering for next-generation data platform serving Fortune 500 customers. Build and scale data engineering, ML infrastructure, and analytics platforms.

Requirements:
- 12+ years engineering leadership experience
- Experience with big data platforms (Hadoop, Spark, Kafka, Snowflake)
- Team leadership experience managing 50+ engineers
- Background in enterprise B2B software and customer success
- Cloud-native architecture and DevOps practices`)}
                >
                  VP Engineering - Data
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Founder/CEO - Enterprise AI Startup
Seeking experienced technology executive to lead AI startup focused on enterprise security solutions. Company has Series A funding and needs proven leader to scale from 20 to 200+ employees.

Requirements:
- 20+ years technology and business leadership
- Experience as founder, CEO, or C-level executive
- Background in AI/ML and enterprise security
- Track record scaling startups to successful exits
- Strong fundraising and investor relations experience`)}
                >
                  Founder/CEO - AI Startup
                </Button>
              </Group>
            </Card>
          )}
        </Stack>
      </motion.div>
    </Container>
  )
}