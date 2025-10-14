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
  ScrollArea,
  ActionIcon
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
import GatedChatWidget from '../components/GatedChatWidget'

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false)

  const experiences = [
    {
      company: "Equiti Ventures",
      role: "Founder & AI Product Leader",
      period: "2024 - Present",
      icon: IconBrain,
      color: "blue",
      achievements: ["Building AI-powered applications", "Computer vision & LLM integration", "Scanity.ai platform launch"]
    },
    {
      company: "Cisco Systems",
      role: "Senior Director, CX Platform Engineering",
      period: "2020 - 2024",
      icon: IconBuildingSkyscraper,
      color: "orange",
      achievements: ["Grew CX Cloud from MVP to $500M+ ARR", "25% increase in annual services revenue", "Led 100+ person global organization"]
    },
    {
      company: "Dropbox",
      role: "Global Head of Data & BI",
      period: "2017 - 2020",
      icon: IconCloud,
      color: "cyan",
      achievements: ["Led company from pre-IPO to IPO", "Doubled revenue from $850M to $1.8B", "Managed 600M+ users platform"]
    },
    {
      company: "Chegg",
      role: "Director of Data Engineering",
      period: "2015 - 2017",
      icon: IconTrendingUp,
      color: "green",
      achievements: ["First director of data engineering", "40% revenue increase in 12 months", "100% stock value growth"]
    },
    {
      company: "Yahoo",
      role: "Senior Manager, Data Platforms",
      period: "2007 - 2015",
      icon: IconDatabase,
      color: "purple",
      achievements: ["400+ billion events daily", "$2+ billion annual revenue", "Multiple U.S. patents"]
    }
  ]

  const metrics = [
    { label: "Revenue Impact", value: "$3.2B+", icon: IconCurrencyDollar },
    { label: "Team Leadership", value: "500+", icon: IconUsers },
    { label: "Users Served", value: "600M+", icon: IconUser },
    { label: "Patents Awarded", value: "Multiple", icon: IconAward }
  ]

  const skills = [
    { category: "AI/ML", level: 95, color: "blue" },
    { category: "Data Platforms", level: 98, color: "cyan" },
    { category: "Cloud Platforms", level: 90, color: "green" },
    { category: "Leadership", level: 95, color: "orange" },
    { category: "Programming", level: 85, color: "purple" }
  ]

  const projects = [
    {
      name: "Scanity.ai",
      description: "First true AI-native security platform using LLaMA and open-source models for vulnerability detection that traditional scanners miss. Features zero-trust architecture and SOC 2 compliance.",
      tech: ["LLaMA", "Open Source AI", "AWS Lambda", "Next.js"],
      status: "Active",
      highlight: "AI Security Pioneer"
    },
    {
      name: "YAARS",
      description: "Advanced receipt processing using PaddleOCR (PP-OCRv3) with 95%+ accuracy. Custom CoreML on-device processing with multi-language support and superior table extraction.",
      tech: ["PaddleOCR", "CoreML", "On-device AI", "Multi-language"],
      status: "Active",
      highlight: "Custom OCR Models"
    },
    {
      name: "Jourro",
      description: "Intelligent travel journal using advanced OCR for ticket processing. Context-aware airport code detection and smart date extraction from surrounding text context.",
      tech: ["Context AI", "OCR", "Travel Tech", "Smart Processing"],
      status: "Active",
      highlight: "Context-Aware Processing"
    },
    {
      name: "SniftyShare",
      description: "AI-powered content sharing platform with intelligent categorization and real-time processing. Cloud-native infrastructure using Firebase and Cloud Functions.",
      tech: ["Firebase", "Cloud Functions", "React", "AI Classification"],
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
        <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align="center"
              gap="3rem"
            >
              <Box flex={1}>
                <Avatar
                  size={120}
                  radius="xl"
                  alt="Ravi Poruri"
                  style={{
                    border: '4px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 700
                  }}
                >
                  RP
                </Avatar>

                <Stack gap="md">
                  <Title
                    order={1}
                    size="3.5rem"
                    fw={700}
                    c="white"
                    style={{ lineHeight: 1.1 }}
                  >
                    Ravi Poruri
                  </Title>

                  <Text size="xl" c="white" fw={600} style={{ opacity: 0.9 }}>
                    Executive Technology Leader & AI Innovator
                  </Text>

                  <Text size="lg" c="white" style={{ opacity: 0.8, maxWidth: 700, lineHeight: 1.6 }}>
                    <strong>Proven C-Level Executive</strong> with 25+ years scaling technology organizations from startup to IPO.
                    Led strategic transformations delivering <strong>$3.2B+ revenue impact</strong>, built global teams of <strong>500+ engineers</strong>,
                    and pioneered AI innovations serving <strong>600M+ users</strong>. Currently founding next-generation AI applications
                    while bringing deep expertise in data platforms, enterprise architecture, and executive leadership to drive business growth.
                  </Text>
                </Stack>

                <Group mt="2rem" gap="md">
                  <Button
                    size="lg"
                    variant="white"
                    leftSection={<IconMessage size={20} />}
                    onClick={() => setChatOpen(true)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  >
                    Ask AI About My Experience
                  </Button>
                  <Group gap="sm">
                    <ActionIcon size="lg" variant="subtle" color="white">
                      <IconBrandLinkedin size={20} />
                    </ActionIcon>
                    <ActionIcon size="lg" variant="subtle" color="white">
                      <IconBrandGithub size={20} />
                    </ActionIcon>
                    <ActionIcon size="lg" variant="subtle" color="white">
                      <IconMail size={20} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>
            </Flex>
          </motion.div>
        </Container>
      </Box>

      {/* Career Impact Metrics */}
      <Container size="lg" py="4rem">
        <Stack align="center" mb="3rem">
          <Title order={2} size="2.5rem" ta="center" fw={700}>
            Executive Leadership Impact
          </Title>
          <Text size="lg" ta="center" c="dimmed" maw={800}>
            Quantified business results from leading technology transformations, scaling global organizations,
            and driving innovation across Fortune 500 companies and high-growth startups
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xl">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Paper p="xl" radius="lg" shadow="sm" ta="center" h="100%">
                <ThemeIcon size={60} radius="xl" variant="light" color="blue" mb="md">
                  <metric.icon size={30} />
                </ThemeIcon>
                <Title order={2} size="2rem" fw={700} mb="xs">
                  {metric.value}
                </Title>
                <Text size="md" c="dimmed" fw={500}>
                  {metric.label}
                </Text>
              </Paper>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Professional Journey */}
      <Box style={{ backgroundColor: '#f8f9fa' }} py="4rem">
        <Container size="lg">
          <Stack align="center" mb="4rem">
            <Title order={2} size="2.5rem" ta="center" fw={700}>
              Executive Leadership Journey
            </Title>
            <Text size="lg" ta="center" c="dimmed" maw={800}>
              Strategic progression from technical individual contributor to C-Level executive and AI entrepreneur,
              consistently delivering transformational business results across multiple industries
            </Text>
          </Stack>

          <Timeline active={experiences.length} bulletSize={30} lineWidth={3}>
            {experiences.map((exp, index) => (
              <Timeline.Item
                key={exp.company}
                bullet={<exp.icon size={16} />}
                title={
                  <Group gap="md" wrap="nowrap">
                    <div>
                      <Text size="lg" fw={700}>{exp.role}</Text>
                      <Text size="md" c="dimmed">{exp.company} • {exp.period}</Text>
                    </div>
                  </Group>
                }
              >
                <Stack gap="xs" mt="sm">
                  {exp.achievements.map((achievement, i) => (
                    <Text key={i} size="sm" c="dimmed">
                      • {achievement}
                    </Text>
                  ))}
                </Stack>
              </Timeline.Item>
            ))}
          </Timeline>
        </Container>
      </Box>

      {/* Recent AI Projects */}
      <Container size="lg" py="4rem">
        <Stack align="center" mb="3rem">
          <Title order={2} size="2.5rem" ta="center" fw={700}>
            Recent AI Innovations (2024)
          </Title>
          <Text size="lg" ta="center" c="dimmed">
            Building next-generation AI applications with unique implementations and production-ready architectures
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card shadow="sm" padding="lg" radius="md" h="100%">
                <Group justify="space-between" mb="md">
                  <Text fw={700} size="lg">{project.name}</Text>
                  <Badge color="green" variant="light">{project.status}</Badge>
                </Group>

                <Badge color="blue" variant="filled" mb="md">
                  {project.highlight}
                </Badge>

                <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
                  {project.description}
                </Text>

                <Group gap="xs" mb="md">
                  {project.tech.map((tech) => (
                    <Badge key={tech} variant="outline" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </Group>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>

      {/* Core Skills */}
      <Box style={{ backgroundColor: '#f8f9fa' }} py="4rem">
        <Container size="lg">
          <Stack align="center" mb="3rem">
            <Title order={2} size="2.5rem" ta="center" fw={700}>
              Core Competencies
            </Title>
            <Text size="lg" ta="center" c="dimmed">
              Deep expertise across technology leadership, AI/ML, and enterprise data platforms
            </Text>
          </Stack>

          <Stack gap="xl" maw={800} mx="auto">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{skill.category}</Text>
                  <Text size="sm" c="dimmed">{skill.level}%</Text>
                </Group>
                <Progress value={skill.level} color={skill.color} size="lg" radius="xl" />
              </motion.div>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box py="4rem" style={{ backgroundColor: '#1e40af' }}>
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Stack align="center" gap="2rem">
              <Title order={2} c="white" ta="center" size="2.5rem">
                Let's Connect
              </Title>
              <Text size="lg" c="white" ta="center" style={{ opacity: 0.9 }}>
                Interested in discussing executive opportunities, AI innovation, or strategic partnerships?
              </Text>
              <Group gap="md">
                <Button
                  size="lg"
                  variant="white"
                  leftSection={<IconMessage size={20} />}
                  onClick={() => setChatOpen(true)}
                >
                  Chat with AI Assistant
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  leftSection={<IconMail size={20} />}
                  component="a"
                  href="mailto:raviporuri@gmail.com"
                >
                  raviporuri@gmail.com
                </Button>
              </Group>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Gated AI Chat Modal */}
      <Modal
        opened={chatOpen}
        onClose={() => setChatOpen(false)}
        title="AI Assistant - Tailored for Your Role"
        size="xl"
        centered
        padding="lg"
      >
        <GatedChatWidget />
      </Modal>

      {/* Footer */}
      <Box py="2rem" style={{ backgroundColor: '#212529' }}>
        <Container size="lg">
          <Stack align="center" gap="md">
            <Group>
              <IconBrain size={24} style={{ color: '#3b82f6' }} />
              <Text c="white" fw={600}>Ravi Poruri</Text>
            </Group>
            <Text c="dimmed" size="sm" ta="center">
              Executive Technology Leader • AI Innovator • Strategic Advisor
            </Text>
            <Group gap="md">
              <Anchor href="#" c="dimmed" size="sm">LinkedIn</Anchor>
              <Anchor href="#" c="dimmed" size="sm">GitHub</Anchor>
              <Anchor href="mailto:raviporuri@gmail.com" c="dimmed" size="sm">Email</Anchor>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}