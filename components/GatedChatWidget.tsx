'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Text,
  Title,
  ScrollArea,
  Avatar,
  Group,
  Loader,
  Alert
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { IconUser, IconRobot, IconAlertCircle } from '@tabler/icons-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Visitor {
  id: string
  name: string
  role: string
  purpose: string
}

interface GateFormData {
  name: string
  role: string
  purpose: string
  email?: string
  company?: string
}

export default function GatedChatWidget() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const form = useForm<GateFormData>({
    initialValues: {
      name: '',
      role: '',
      purpose: '',
      email: '',
      company: ''
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      role: (value) => (!value ? 'Role is required' : null),
      purpose: (value) => (!value ? 'Purpose is required' : null)
    }
  })

  const roleOptions = [
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'executive_recruiter', label: 'Executive Recruiter' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'company_executive', label: 'Company Executive' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'investor', label: 'Investor' },
    { value: 'startup_founder', label: 'Startup Founder' },
    { value: 'potential_client', label: 'Potential Client' },
    { value: 'other', label: 'Other' }
  ]

  const handleGateSubmit = async (values: GateFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session')
      }

      setSessionId(data.session_id)
      setVisitor(data.visitor)

      // Add welcome message
      const welcomeMessage = `Thanks ${data.visitor.name}! I'll tailor this conversation for a ${data.visitor.role} interested in ${data.visitor.purpose}. How can I help you learn about Ravi's background?`

      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }])

      notifications.show({
        title: 'Welcome!',
        message: 'Your session has started. Feel free to ask about Ravi\'s experience.',
        color: 'green'
      })

    } catch (error) {
      console.error('Session creation error:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to start session. Please try again.',
        color: 'red'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')

    // Add user message immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Chat error:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to send message. Please try again.',
        color: 'red'
      })

      // Remove the user message that failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Gate form - shown before chat starts
  if (!sessionId) {
    return (
      <Paper shadow="md" radius="lg" p="xl" style={{ maxWidth: 500, margin: '0 auto' }}>
        <Stack gap="lg">
          <Box ta="center">
            <Avatar size="lg" radius="xl" mb="md" style={{ backgroundColor: '#228be6', margin: '0 auto' }}>
              <IconRobot size={32} />
            </Avatar>
            <Title order={2} size="h3" mb="xs">
              Chat with Ravi's AI Assistant
            </Title>
            <Text size="sm" c="dimmed">
              Before we begin, I'd like to tailor our conversation to your interests.
              Please share a few details about yourself:
            </Text>
          </Box>

          <form onSubmit={form.onSubmit(handleGateSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Your Name"
                placeholder="e.g., Sarah Johnson"
                required
                {...form.getInputProps('name')}
              />

              <Select
                label="Your Role"
                placeholder="Select your role"
                required
                data={roleOptions}
                {...form.getInputProps('role')}
              />

              <Textarea
                label="What are you hoping to learn about Ravi?"
                placeholder="e.g., Evaluating for CTO role, exploring technical expertise, considering advisory position..."
                required
                rows={3}
                {...form.getInputProps('purpose')}
              />

              <TextInput
                label="Email (optional)"
                placeholder="your.email@company.com"
                type="email"
                {...form.getInputProps('email')}
              />

              <TextInput
                label="Company (optional)"
                placeholder="Your company name"
                {...form.getInputProps('company')}
              />

              <Button
                type="submit"
                loading={isLoading}
                size="md"
                fullWidth
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                Start Conversation
              </Button>
            </Stack>
          </form>

          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Your information helps me provide relevant insights about Ravi's experience.
              This conversation will be saved for follow-up opportunities.
            </Text>
          </Alert>
        </Stack>
      </Paper>
    )
  }

  // Chat interface - shown after gate is passed
  return (
    <Paper shadow="md" radius="lg" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Group gap="sm">
          <Avatar size="sm" radius="xl" style={{ backgroundColor: '#228be6' }}>
            <IconRobot size={20} />
          </Avatar>
          <div>
            <Text size="sm" fw={600}>Ravi's AI Assistant</Text>
            <Text size="xs" c="dimmed">
              Ready to help • {visitor?.name}
            </Text>
          </div>
        </Group>
      </Box>

      {/* Messages */}
      <ScrollArea flex={1} p="md">
        <Stack gap="md">
          {messages.map((message, index) => (
            <Group
              key={index}
              gap="sm"
              align="flex-start"
              justify={message.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              {message.role === 'assistant' && (
                <Avatar size="sm" radius="xl" style={{ backgroundColor: '#228be6' }}>
                  <IconRobot size={16} />
                </Avatar>
              )}

              <Paper
                p="sm"
                radius="lg"
                style={{
                  maxWidth: '70%',
                  backgroundColor: message.role === 'user' ? '#228be6' : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : 'inherit'
                }}
              >
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Text>
                <Text
                  size="xs"
                  opacity={0.7}
                  ta="right"
                  mt={4}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </Paper>

              {message.role === 'user' && (
                <Avatar size="sm" radius="xl" style={{ backgroundColor: '#495057' }}>
                  <IconUser size={16} />
                </Avatar>
              )}
            </Group>
          ))}

          {isLoading && (
            <Group gap="sm" align="flex-start">
              <Avatar size="sm" radius="xl" style={{ backgroundColor: '#228be6' }}>
                <IconRobot size={16} />
              </Avatar>
              <Paper p="sm" radius="lg" style={{ backgroundColor: '#f8f9fa' }}>
                <Group gap="xs">
                  <Loader size="xs" />
                  <Text size="sm" c="dimmed">Thinking...</Text>
                </Group>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Box p="md" style={{ borderTop: '1px solid #e9ecef' }}>
        <Group gap="sm">
          <Textarea
            flex={1}
            placeholder="Ask about Ravi's experience, achievements, or technical expertise..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            autosize
            maxRows={3}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Send
          </Button>
        </Group>
      </Box>
    </Paper>
  )
}