'use client'

import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  SimpleGrid,
  Stack,
  Badge,
  Avatar,
  Center,
  Box,
  Flex,
  Paper,
  ThemeIcon,
  rem,
  Anchor,
  Divider,
  Timeline,
  Progress,
  Modal,
  TextInput,
  ActionIcon,
  ScrollArea,
  Loader
} from '@mantine/core'
import {
  IconBrain,
  IconFileText,
  IconSearch,
  IconTarget,
  IconRocket,
  IconUser,
  IconChartBar,
  IconMessage,
  IconDownload,
  IconStar,
  IconBuildingSkyscraper,
  IconTrendingUp,
  IconAward,
  IconCode,
  IconDatabase,
  IconCloud,
  IconSend,
  IconBrandLinkedin,
  IconBrandGithub,
  IconMail,
  IconX,
  IconUsers,
  IconCurrencyDollar
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [loading, setLoading] = useState(false)

  const experiences = [
    {
      company: "Equiti Ventures",
      role: "Founder & AI Product Leader",
      period: "2024 - Present",
      icon: IconBrain,
      color: "blue",
      description: "Leading development of AI-powered mobile applications using cutting-edge LLMs and computer vision",
      achievements: [
        "Building next-generation AI security platforms (Scanity, DefScan)",
        "Developing AI-native applications with advanced ML capabilities",
        "Creating innovative AI-powered solutions"
      ]
    },
    {
      company: "Cisco Systems",
      role: "Senior Director, CX Platform Engineering",
      period: "2020 - 2024",
      icon: IconBuildingSkyscraper,
      color: "red",
      description: "Led global team responsible for Customer Experience Cloud data and analytics solutions",
      achievements: [
        "Grew CX Cloud from MVP to $500M+ ARR in 4 years",
        "25% increase in annual services revenue",
        "50% reduction in renewals cycle time",
        "Managed 100+ person organization across 3 teams"
      ]
    },
    {
      company: "Dropbox",
      role: "Global Head of Data and Business Intelligence",
      period: "2017 - 2020",
      icon: IconCloud,
      color: "blue",
      description: "Developed enterprise data strategy for 600M+ users, led company from pre-IPO to IPO",
      achievements: [
        "Doubled revenue from $850M to $1.8B",
        "Led IPO data strategy and execution",
        "Built enterprise analytics on AWS and Snowflake",
        "Managed global team of 35+ across 4 pillars"
      ]
    },
    {
      company: "Chegg",
      role: "Director of Data Engineering & BI",
      period: "2015 - 2017",
      icon: IconChartBar,
      color: "green",
      description: "First director of data engineering, built comprehensive digital platform",
      achievements: [
        "40% revenue increase within 12 months",
        "100% stock value growth in 12 months",
        "Built engineering team to 25+ people",
        "Developed India center of excellence"
      ]
    },
    {
      company: "Yahoo",
      role: "Senior Manager, Data Platforms",
      period: "2007 - 2015",
      icon: IconDatabase,
      color: "purple",
      description: "Managed massive data pipelines and platform engineering at scale",
      achievements: [
        "400+ billion events, hundreds of petabytes",
        "$2+ billion annual revenue generated",
        "World's largest MS OLAP SSAS Cube (20+ TB)",
        "10K+ servers, 450+ production clusters"
      ]
    }
  ]

  const skills = [
    { category: "AI & Machine Learning", skills: ["Generative AI", "LLMs", "Computer Vision", "ML Platforms", "Predictive Analytics"], level: 95, color: "blue" },
    { category: "Data Platforms", skills: ["Big Data", "Data Engineering", "Analytics", "Data Governance", "ETL/ELT"], level: 98, color: "green" },
    { category: "Cloud Platforms", skills: ["AWS", "Snowflake", "Azure", "Multi-cloud", "Infrastructure"], level: 90, color: "cyan" },
    { category: "Leadership", skills: ["Team Building", "Strategy", "P&L", "IPO Experience", "Global Teams"], level: 95, color: "orange" },
    { category: "Programming", skills: ["SQL", "Python", "Java", "Scala", "JavaScript"], level: 85, color: "grape" }
  ]

  const achievements = [
    { metric: "Revenue Impact", value: "$3.2B+", description: "Total revenue growth delivered", icon: IconCurrencyDollar },
    { metric: "Team Leadership", value: "500+", description: "People managed across career", icon: IconUsers },
    { metric: "Platform Scale", value: "600M+", description: "Users served (Dropbox)", icon: IconUser },
    { metric: "Data Volume", value: "400B+", description: "Events processed daily", icon: IconDatabase },
    { metric: "Years Experience", value: "25+", description: "Technology leadership", icon: IconStar },
    { metric: "Patents", value: "Multiple", description: "U.S. patents granted", icon: IconAward }
  ]

  const projects = [
    {
      name: "Scanity.ai",
      description: "First true AI-native security platform using GPT-4 + Claude for vulnerability detection that traditional scanners miss. Features zero-trust architecture and SOC 2 compliance.",
      tech: ["OpenAI GPT-4", "Claude", "AWS Lambda", "Next.js"],
      status: "Active",
      highlight: "AI Security Pioneer"
    },
    {
      name: "YAARS (Receipt OCR)",
      description: "Advanced receipt processing using PaddleOCR (PP-OCRv3) with 95%+ accuracy. Implements CoreML on-device processing with custom-trained models for multi-language support.",
      tech: ["PaddleOCR", "CoreML", "Computer Vision", "Swift"],
      status: "Active",
      highlight: "Custom OCR Models"
    },
    {
      name: "Jourro (Travel AI)",
      description: "Intelligent travel journal using advanced OCR for ticket processing. Features airport code detection, flight number recognition, and context-aware date extraction.",
      tech: ["Advanced OCR", "Context AI", "iOS", "Swift"],
      status: "Active",
      highlight: "Context-Aware Processing"
    },
    {
      name: "SniftyShare",
      description: "AI-powered content sharing platform with intelligent categorization and real-time processing. Built with modern React architecture and cloud-native infrastructure.",
      tech: ["React", "AI Classification", "Firebase", "Cloud Functions"],
      status: "Active",
      highlight: "Intelligent Content AI"
    },
    {
      name: "ZipWik",
      description: "Digital catalog platform with strict AI development rules and real-time data processing. Features comprehensive API integration and production-ready architecture.",
      tech: ["TypeScript", "API Integration", "React", "Production AI"],
      status: "Active",
      highlight: "Production AI Standards"
    }
  ]

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || loading) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      // Call your AI chat endpoint here
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      if (response.ok) {
        const data = await response.json()
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I\'m having trouble responding right now. Please try again later.' }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I\'m having trouble responding right now. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Group align="center" gap="xl" style={{ minHeight: '80vh' }}>
              <Stack style={{ flex: 1 }} gap="xl">
                <Avatar
                  size={120}
                  radius="xl"
                  src="/ravi-avatar.jpg"
                  alt="Ravi Poruri"
                  style={{
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                />

                <Stack gap="md">
                  <Title
                    order={1}
                    size="3rem"
                    fw={900}
                    c="white"
                    style={{ lineHeight: 1.1 }}
                  >
                    Ravi Poruri
                  </Title>

                  <Text size="xl" c="white" fw={600} style={{ opacity: 0.9 }}>
                    Technology Leader & AI Innovator
                  </Text>

                  <Text size="lg" c="white" style={{ opacity: 0.8, maxWidth: 600 }}>
                    25+ years driving technology transformations. From database admin to AI entrepreneur,
                    I've led teams that delivered $3.2B+ in revenue impact across Yahoo, Dropbox, Cisco, and my own ventures.
                  </Text>
                </Stack>

                <Group>
                  <Button
                    size="lg"
                    variant="white"
                    color="dark"
                    leftSection={<IconMessage size={20} />}
                    onClick={() => setChatOpen(true)}
                    style={{ fontWeight: 600 }}
                  >
                    Ask AI About My Experience
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    c="white"
                    style={{ borderColor: 'white', fontWeight: 600 }}
                    leftSection={<IconDownload size={20} />}
                    onClick={() => window.open('/resume-customizer', '_blank')}
                  >
                    Customize Resume
                  </Button>
                </Group>

                <Group>
                  <ActionIcon size="lg" variant="subtle" color="white">
                    <IconBrandLinkedin size={24} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="subtle" color="white">
                    <IconBrandGithub size={24} />
                  </ActionIcon>
                  <ActionIcon size="lg" variant="subtle" color="white">
                    <IconMail size={24} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Group>
          </motion.div>
        </Container>
      </Box>

      {/* Key Achievements */}
      <Container size="lg" py="4rem">
        <Stack align="center" mb="3rem">
          <Title order={2} size="2.5rem" ta="center" fw={700}>
            Career Impact
          </Title>
          <Text size="lg" ta="center" c="dimmed">
            Quantified achievements across 25+ years of technology leadership
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} spacing="lg">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.metric}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Paper p="md" radius="md" style={{ textAlign: 'center', height: '100%' }}>
                <ThemeIcon size="xl" color="blue" variant="light" mx="auto" mb="md">
                  <achievement.icon style={{ width: rem(24), height: rem(24) }} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="blue">
                  {achievement.value}
                </Text>
                <Text size="sm" fw={500}>
                  {achievement.metric}
                </Text>
                <Text size="xs" c="dimmed">
                  {achievement.description}
                </Text>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Experience Timeline */}
      <Box py="4rem" style={{ backgroundColor: '#f8f9fa' }}>
        <Container size="lg">
          <Stack align="center" mb="4rem">
            <Title order={2} size="2.5rem" ta="center" fw={700}>
              Professional Journey
            </Title>
            <Text size="lg" ta="center" c="dimmed">
              From database administration to AI entrepreneurship
            </Text>
          </Stack>

          <Timeline active={0} bulletSize={24} lineWidth={2}>
            {experiences.map((exp, index) => (
              <Timeline.Item
                key={exp.company}
                bullet={<exp.icon size={16} />}
                title={
                  <Group gap="xs">
                    <Text fw={600} size="lg">{exp.role}</Text>
                    <Badge color={exp.color}>{exp.period}</Badge>
                  </Group>
                }
              >
                <Text c="dimmed" size="sm" mb="xs">{exp.company}</Text>
                <Text size="sm" mb="md">{exp.description}</Text>
                <Stack gap="xs">
                  {exp.achievements.map((achievement, idx) => (
                    <Text key={idx} size="sm" c="dimmed">
                      • {achievement}
                    </Text>
                  ))}
                </Stack>
              </Timeline.Item>
            ))}
          </Timeline>
        </Container>
      </Box>

      {/* Skills & Expertise */}
      <Container size="lg" py="4rem">
        <Stack align="center" mb="4rem">
          <Title order={2} size="2.5rem" ta="center" fw={700}>
            Core Competencies
          </Title>
          <Text size="lg" ta="center" c="dimmed">
            Technical expertise and leadership capabilities
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {skills.map((skillGroup, index) => (
            <motion.div
              key={skillGroup.category}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card shadow="sm" padding="xl" radius="md" h="100%">
                <Stack>
                  <Group justify="space-between">
                    <Text fw={600} size="lg">{skillGroup.category}</Text>
                    <Badge color={skillGroup.color}>{skillGroup.level}%</Badge>
                  </Group>

                  <Progress
                    value={skillGroup.level}
                    color={skillGroup.color}
                    size="lg"
                    radius="xl"
                  />

                  <Text size="sm" c="dimmed">
                    {skillGroup.skills.join(" • ")}
                  </Text>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Recent AI Projects */}
      <Box py="4rem" style={{ backgroundColor: '#f8f9fa' }}>
        <Container size="lg">
          <Stack align="center" mb="4rem">
            <Badge size="lg" variant="light" color="blue">
              Latest Work
            </Badge>
            <Title order={2} size="2.5rem" ta="center" fw={700}>
              AI Innovation Portfolio
            </Title>
            <Text size="lg" ta="center" c="dimmed">
              Custom AI models, advanced OCR systems, and production-ready intelligent applications showcasing
              unique implementations across security, computer vision, and context-aware processing
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card shadow="sm" padding="xl" radius="md" h="100%" style={{ position: 'relative' }}>
                  <Stack>
                    <Group justify="space-between">
                      <Title order={4}>{project.name}</Title>
                      <Group gap="xs">
                        <Badge color="blue" variant="light" size="sm">{project.highlight}</Badge>
                        <Badge color="green">{project.status}</Badge>
                      </Group>
                    </Group>

                    <Text c="dimmed" style={{ flexGrow: 1, lineHeight: 1.5 }}>
                      {project.description}
                    </Text>

                    <Group gap="xs">
                      {project.tech.map((tech) => (
                        <Badge key={tech} size="sm" variant="light" color="gray">
                          {tech}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Contact CTA */}
      <Box
        py="4rem"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
        }}
      >
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Stack align="center" gap="xl">
              <Title order={2} size="2.5rem" ta="center" c="white" fw={700}>
                Let's Connect
              </Title>

              <Text size="lg" ta="center" c="white" maw={600} style={{ opacity: 0.9 }}>
                Interested in AI innovation, technology leadership, or building scalable platforms?
                Let's discuss opportunities to collaborate.
              </Text>

              <Group justify="center">
                <Button
                  size="lg"
                  variant="white"
                  color="dark"
                  leftSection={<IconMessage size={20} />}
                  onClick={() => setChatOpen(true)}
                >
                  Ask AI About My Background
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  c="white"
                  style={{ borderColor: 'white' }}
                  leftSection={<IconMail size={20} />}
                >
                  raviporuri@gmail.com
                </Button>
              </Group>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* AI Chat Modal */}
      <Modal
        opened={chatOpen}
        onClose={() => setChatOpen(false)}
        title={
          <Group>
            <IconBrain size={24} />
            <Text fw={600}>Ask AI About Ravi's Experience</Text>
          </Group>
        }
        size="lg"
      >
        <Stack gap="md">
          <ScrollArea h={400} style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
            <Box p="md">
              {chatMessages.length === 0 && (
                <Text c="dimmed" ta="center">
                  Ask me anything about Ravi's experience, skills, achievements, or career journey!
                </Text>
              )}
              {chatMessages.map((message, index) => (
                <Box key={index} mb="md">
                  <Group gap="xs" mb="xs">
                    {message.role === 'assistant' ? <IconBrain size={16} /> : <IconUser size={16} />}
                    <Text size="sm" fw={600} c={message.role === 'assistant' ? 'blue' : 'dark'}>
                      {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                    </Text>
                  </Group>
                  <Text size="sm" style={{ marginLeft: '24px' }}>
                    {message.content}
                  </Text>
                </Box>
              ))}
              {loading && (
                <Group gap="xs" mb="md">
                  <IconBrain size={16} />
                  <Text size="sm" fw={600} c="blue">AI Assistant</Text>
                  <Loader size="sm" />
                </Group>
              )}
            </Box>
          </ScrollArea>

          <Group gap="xs">
            <TextInput
              flex={1}
              placeholder="Ask about Ravi's experience..."
              value={chatInput}
              onChange={(e) => setChatInput(e.currentTarget.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              disabled={loading}
            />
            <ActionIcon
              size="lg"
              onClick={handleChatSubmit}
              disabled={!chatInput.trim() || loading}
              color="blue"
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Stack>
      </Modal>

      {/* Footer */}
      <Box py="2rem" style={{ backgroundColor: '#212529' }}>
        <Container size="lg">
          <Stack align="center" gap="md">
            <Group>
              <IconBrain size={24} style={{ color: '#3b82f6' }} />
              <Title order={3} c="white">
                Ravi Poruri
              </Title>
            </Group>

            <Text ta="center" c="dimmed">
              Technology Leader & AI Innovator • 25+ Years Experience • $3.2B+ Revenue Impact
            </Text>

            <Group>
              <Anchor href="https://linkedin.com/in/raviporuri" c="dimmed" size="sm">
                LinkedIn
              </Anchor>
              <Anchor href="https://github.com/raviporuri" c="dimmed" size="sm">
                GitHub
              </Anchor>
              <Anchor href="mailto:raviporuri@gmail.com" c="dimmed" size="sm">
                Contact
              </Anchor>
            </Group>

            <Divider w="100%" />

            <Text size="sm" c="dimmed" ta="center">
              © 2024 Ravi Poruri. All rights reserved.
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}