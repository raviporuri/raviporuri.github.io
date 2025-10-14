'use client'

import { useState } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Title,
  Text,
  Alert,
  Group,
  Select
} from '@mantine/core'
import { IconMail, IconUser, IconMessage, IconCheck, IconX } from '@tabler/icons-react'

interface ContactFormProps {
  opened: boolean
  onClose: () => void
}

export default function ContactForm({ opened, onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    company: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    'Recruiter',
    'Executive Recruiter',
    'Hiring Manager',
    'Company Executive',
    'Engineer',
    'Startup Founder',
    'Investor',
    'Business Partner',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        role: '',
        company: '',
        subject: '',
        message: ''
      })
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSuccess(false)
    setError('')
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Contact Ravi"
      size="md"
      centered
      padding="xl"
    >
      {success ? (
        <Stack align="center" gap="md">
          <IconCheck size={48} color="green" />
          <Title order={3} ta="center">Message Sent!</Title>
          <Text ta="center" c="dimmed">
            Thank you for reaching out. Ravi will get back to you within 24-48 hours.
          </Text>
          <Button onClick={handleClose} variant="filled">
            Close
          </Button>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Interested in discussing executive opportunities, partnerships, or AI innovation?
              Send a message and Ravi will get back to you directly.
            </Text>

            {error && (
              <Alert icon={<IconX size={16} />} color="red">
                {error}
              </Alert>
            )}

            <Group grow>
              <TextInput
                label="Name"
                placeholder="Your full name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftSection={<IconUser size={16} />}
              />
              <TextInput
                label="Email"
                placeholder="your@email.com"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftSection={<IconMail size={16} />}
              />
            </Group>

            <Group grow>
              <Select
                label="Role"
                placeholder="Select your role"
                data={roles}
                value={formData.role}
                onChange={(value) => setFormData({ ...formData, role: value || '' })}
                searchable
              />
              <TextInput
                label="Company (Optional)"
                placeholder="Your company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </Group>

            <TextInput
              label="Subject"
              placeholder="Brief subject line"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <Textarea
              label="Message"
              placeholder="Tell Ravi about your opportunity, partnership idea, or question..."
              minRows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                leftSection={<IconMessage size={16} />}
              >
                Send Message
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  )
}