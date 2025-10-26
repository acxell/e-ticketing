'use client';

import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Card,
  Group,
  Text,
  Badge,
  Button,
  Stack,
  Select,
  Textarea,
  Timeline,
  Box,
  Avatar,
  Divider,
  Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { api } from '@/lib/api';
import AppShellLayout from '@/components/AppShell';
import { IconUser, IconAlertCircle, IconClock, IconMessageCircle, IconChevronLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasRole, ROLES } from '@/lib/permissions';

interface TicketLog {
  id: number;
  fromStatus: string | null;
  toStatus: string | null;
  note: string;
  createdAt: string;
  actor?: {
    username: string;
    fullName: string | null;
  } | null;
}

interface Customer {
  id: number;
  fullName: string;
  email: string;
}

interface Ticket {
  id: number;
  ticketCode: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  customer: Customer;
  ticketLogs: TicketLog[];
  createdAt: string;
  updatedAt: string;
}

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const ticketId = parseInt(params.id);
  const { user } = useAuthStore();

  const { data: ticketData, isLoading, error } = useQuery(['ticket', ticketId], async () => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  });

  const form = useForm({
    initialValues: {
      status: '',
      note: '',
    },
    validate: {
      status: (value) => (!value ? 'Status is required' : null),
      note: (value) => (!value ? 'Comment is required' : null),
    },
  });

  // Query for assignable users
  const { data: assignableUsers } = useQuery(
    ['assignableUsers'],
    async () => {
      const response = await api.get('/users', {
        params: {
          excludeRoles: ['ADMIN', 'CUSTOMER_SERVICE'].join(','),
        },
      });
      return response.data;
    },
    {
      enabled: hasRole(user, [ROLES.ADMIN, ROLES.AGENT_NOC]),
    }
  );

  const updateMutation = useMutation(
    async (values: typeof form.values) => {
      const { data } = await api.patch(`/tickets/${ticketId}/status`, values);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ticket', ticketId]);
        notifications.show({
          title: 'Success',
          message: 'Ticket status updated successfully',
          color: 'green',
        });
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error || 'Something went wrong',
          color: 'red',
        });
      },
    }
  );

  // Add assignMutation
  const assignMutation = useMutation(
    async (assignedToId: number) => {
      const { data } = await api.patch(`/tickets/${ticketId}/assign`, { assignedToId });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ticket', ticketId]);
        notifications.show({
          title: 'Success',
          message: 'Ticket assigned successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.error || 'Something went wrong',
          color: 'red',
        });
      },
    }
  );

  if (isLoading) {
    return (
      <AppShellLayout>
        <Card shadow="sm" p="lg">
          <Text c="dimmed">Loading ticket details...</Text>
        </Card>
      </AppShellLayout>
    );
  }

  if (error || !ticketData?.data) {
    return (
      <AppShellLayout>
        <Card shadow="sm" p="lg">
          <Text c="red">Error loading ticket details. Please try again.</Text>
        </Card>
      </AppShellLayout>
    );
  }

  const ticket: Ticket = ticketData.data;

  // Only NOC and Admin can update status
  const canUpdateStatus = hasRole(user, [ROLES.ADMIN, ROLES.AGENT_NOC]);

  // Only NOC and Admin can set priority
  const canSetPriority = hasRole(user, [ROLES.ADMIN, ROLES.AGENT_NOC]);

  return (
    <AppShellLayout>
      <Box mb="xl">
        <Button
          variant="subtle"
          leftSection={<IconChevronLeft size={16} />}
          onClick={() => router.push('/tickets')}
          mb="md"
          styles={{
            root: {
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' },
            },
          }}
        >
          Back to Tickets
        </Button>
        <Group justify="space-between" mb="sm">
          <Box>
            <Text size="xl" fw={700} c="#0f172a" mb={4}>
              {ticket?.ticketCode ?? 'N/A'}
            </Text>
            <Text size="lg" c="#475569">
              {ticket?.title ?? 'N/A'}
            </Text>
          </Box>
          <Badge
            size="xl"
            variant="light"
            color={getStatusColor(ticket?.status)}
            style={{ padding: '12px 20px' }}
          >
            {ticket?.status?.replace('_', ' ') ?? 'N/A'}
          </Badge>
        </Group>
      </Box>

      <Group align="start" gap="lg">
        {/* Main Content */}
        <Box style={{ flex: 1 }}>
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            mb="lg"
            style={{
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <Stack gap="lg">
              {/* Customer Info */}
              <Box>
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
                  Customer Information
                </Text>
                <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#f8fafc' }}>
                  <Group>
                    <Avatar color="blue" radius="xl" size="lg">
                      {ticket?.customer?.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Text fw={600} size="md">{ticket?.customer?.fullName ?? 'N/A'}</Text>
                      <Text size="sm" c="dimmed">{ticket?.customer?.email ?? 'N/A'}</Text>
                    </Box>
                  </Group>
                </Paper>
              </Box>

              <Divider />

              {/* Priority & Created Date */}
              <Group>
                <Box style={{ flex: 1 }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                    Priority
                  </Text>
                  <Badge
                    size="lg"
                    variant="light"
                    color={getPriorityColor(ticket?.priority)}
                    leftSection={<IconAlertCircle size={14} />}
                  >
                    {ticket?.priority ?? 'N/A'}
                  </Badge>
                </Box>
                <Box style={{ flex: 1 }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="xs">
                    Created
                  </Text>
                  <Group gap={6}>
                    <IconClock size={16} color="#64748b" />
                    <Text size="sm" c="#475569">
                      {new Date(ticket?.createdAt).toLocaleString()}
                    </Text>
                  </Group>
                </Box>
              </Group>

              <Divider />

              {/* Description */}
              <Box>
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" mb="sm">
                  Description
                </Text>
                <Paper p="md" withBorder radius="md" style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="sm" c="#475569">
                    {ticket?.description ?? 'No description provided'}
                  </Text>
                </Paper>
              </Box>
            </Stack>
          </Card>

          {/* Assign Ticket Card - Only visible to NOC and Admin */}
          {canUpdateStatus && (
            <Card
              shadow="sm"
              p="lg"
              radius="md"
              mb="lg"
              style={{
                border: '1px solid #e2e8f0',
                background: 'white',
              }}
            >
              <Text fw={700} size="lg" mb="md">
                Assign Ticket
              </Text>
              <Stack>
                <Select
                  label="Assign to"
                  placeholder="Select user to assign"
                  data={
                    assignableUsers?.data?.map((user: any) => ({
                      value: user.id.toString(),
                      label: user.fullName || user.username,
                    })) || []
                  }
                  size="md"
                  onChange={(value) => value && assignMutation.mutate(parseInt(value))}
                  styles={{
                    label: { fontWeight: 600, marginBottom: 6 },
                    input: { border: '1px solid #cbd5e1' },
                  }}
                />
              </Stack>
            </Card>
          )}

          {/* Update Status Card - Only visible to NOC and Admin */}
          {canUpdateStatus && (
            <Card
              shadow="sm"
              p="lg"
              radius="md"
              style={{
                border: '1px solid #e2e8f0',
                background: 'white',
              }}
            >
              <Text fw={700} size="lg" mb="md">
                Update Status
              </Text>
              <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values))}>
                <Stack>
                  <Select
                    label="New Status"
                    placeholder="Select new status"
                    data={[
                      { value: 'OPEN', label: 'Open' },
                      { value: 'IN_PROGRESS', label: 'In Progress' },
                      { value: 'RESOLVED', label: 'Resolved' },
                      { value: 'CLOSED', label: 'Closed' },
                    ]}
                    required
                    size="md"
                    styles={{
                      label: { fontWeight: 600, marginBottom: 6 },
                      input: { border: '1px solid #cbd5e1' },
                    }}
                    {...form.getInputProps('status')}
                  />
                  <Textarea
                    label="Add Comment"
                    placeholder="Describe what actions were taken..."
                    required
                    minRows={4}
                    size="md"
                    leftSection={<IconMessageCircle size={16} />}
                    styles={{
                      label: { fontWeight: 600, marginBottom: 6 },
                      input: { border: '1px solid #cbd5e1' },
                    }}
                    {...form.getInputProps('note')}
                  />
                  <Button
                    type="submit"
                    size="md"
                    loading={updateMutation.isLoading}
                    styles={{
                      root: {
                        background: '#3b82f6',
                        '&:hover': { background: '#2563eb' },
                      },
                    }}
                  >
                    Update Ticket Status
                  </Button>
                </Stack>
              </form>
            </Card>
          )}
        </Box>

        {/* Timeline Sidebar */}
        <Box style={{ width: 400 }}>
          <Card
            shadow="sm"
            p="lg"
            radius="md"
            style={{
              border: '1px solid #e2e8f0',
              background: 'white',
            }}
          >
            <Text fw={700} size="lg" mb="lg">
              Activity Timeline
            </Text>
            <Timeline
              active={ticket?.ticketLogs?.length ? ticket.ticketLogs.length - 1 : 0}
              bulletSize={24}
              lineWidth={2}
            >
              {ticket?.ticketLogs?.length ? (
                ticket.ticketLogs.map((log: TicketLog) => (
                  <Timeline.Item
                    key={log.id}
                    bullet={
                      <Avatar size="sm" radius="xl" color="blue">
                        {(log.actor?.fullName || log.actor?.username || 'S').charAt(0).toUpperCase()}
                      </Avatar>
                    }
                  >
                    <Paper p="sm" withBorder radius="md" mb="md" style={{ backgroundColor: '#f8fafc' }}>
                      <Text fw={600} size="sm" mb={4}>
                        {log.actor?.fullName || log.actor?.username || 'System'}
                      </Text>
                      <Text size="sm" c="#475569" mb={8}>
                        {log.fromStatus ? (
                          <>
                            Changed status from{' '}
                            <Badge size="xs" variant="light">
                              {log.fromStatus.replace('_', ' ')}
                            </Badge>{' '}
                            to{' '}
                            <Badge size="xs" variant="light">
                              {log.toStatus?.replace('_', ' ')}
                            </Badge>
                          </>
                        ) : (
                          'Created ticket'
                        )}
                      </Text>
                      <Text size="sm" c="#64748b" mb={8} style={{ fontStyle: 'italic' }}>
                        "{log.note}"
                      </Text>
                      <Group gap={4}>
                        <IconClock size={12} color="#94a3b8" />
                        <Text size="xs" c="dimmed">
                          {new Date(log.createdAt).toLocaleString()}
                        </Text>
                      </Group>
                    </Paper>
                  </Timeline.Item>
                ))
              ) : (
                <Timeline.Item
                  bullet={
                    <Avatar size="sm" radius="xl" color="gray">
                      ?
                    </Avatar>
                  }
                >
                  <Text size="sm" c="dimmed">
                    No activity recorded
                  </Text>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Box>
      </Group>
    </AppShellLayout>
  );
}

function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return 'blue';
    case 'IN_PROGRESS':
      return 'yellow';
    case 'RESOLVED':
      return 'green';
    case 'CLOSED':
      return 'gray';
    default:
      return 'gray';
  }
}

function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'red';
    case 'MEDIUM':
      return 'yellow';
    case 'LOW':
      return 'blue';
    default:
      return 'gray';
  }
}