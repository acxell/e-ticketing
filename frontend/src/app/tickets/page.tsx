'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Card,
  TextInput,
  Button,
  Group,
  Table,
  ActionIcon,
  Modal,
  Stack,
  Select,
  Textarea,
  Badge,
  Box,
  Text,
  Tooltip,
  Avatar,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconEye, IconSearch, IconTicket, IconFilter, IconUser, IconAlertCircle, IconClock } from '@tabler/icons-react';
import { api } from '@/lib/api';
import AppShellLayout from '@/components/AppShell';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasRole, ROLES } from '@/lib/permissions';

export default function TicketsPage() {
  const { user } = useAuthStore();
  
  // Only CS can create tickets
  const canCreateTicket = hasRole(user, [ROLES.ADMIN, ROLES.CUSTOMER_SERVICE]);
  
  // Only NOC and Admin can set priority
  const canSetPriority = hasRole(user, [ROLES.ADMIN, ROLES.AGENT_NOC]);

  const [opened, setOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch tickets with filters
  const { data: ticketsData, isLoading } = useQuery(
    ['tickets', searchQuery, statusFilter, priorityFilter],
    async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      
      const response = await api.get(`/tickets?${params.toString()}`);
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  // Fetch customers for dropdown
  const { data: customersData } = useQuery('customers', async () => {
    const response = await api.get('/customers');
    return response.data;
  });

  const customerOptions =
    customersData?.data?.map((customer: any) => ({
      value: customer.id.toString(),
      label: `${customer.customerCode} - ${customer.fullName}`,
    })) || [];

  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      customerId: '',
      priority: '',
    },
    validate: {
      title: (value) => (value.length < 1 ? 'Title is required' : null),
      customerId: (value) => (!value ? 'Customer is required' : null),
      priority: (value) => (!value ? 'Priority is required' : null),
    },
  });

  const createMutation = useMutation(
    async (values: typeof form.values) => {
      const { data } = await api.post('/tickets', {
        ...values,
        customerId: parseInt(values.customerId),
      });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tickets');
        notifications.show({
          title: 'Success',
          message: 'Ticket created successfully',
          color: 'green',
        });
        form.reset();
        setOpened(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
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
  };

  return (
    <AppShellLayout>
      {/* Page Header */}
      <Box mb="xl">
        <Group justify="space-between" mb="sm">
          <Box>
            <Text size="xl" fw={700} c="#0f172a">
              Support Tickets
            </Text>
            <Text size="sm" c="dimmed">
              Track and manage customer support requests
            </Text>
          </Box>
          
          {/* Only show create button for CS and Admin */}
          {canCreateTicket && (
            <Button
              leftSection={<IconTicket size={18} />}
              onClick={() => setOpened(true)}
              styles={{
                root: {
                  background: '#3b82f6',
                  '&:hover': { background: '#2563eb' },
                },
              }}
            >
              Create Ticket
            </Button>
          )}
        </Group>
      </Box>

      {/* Main Card */}
      <Card
        shadow="sm"
        p="lg"
        radius="md"
        style={{
          border: '1px solid #e2e8f0',
          background: 'white',
        }}
      >
        {/* Search and Filters */}
        <Stack gap="md" mb="md">
          <TextInput
            placeholder="Search tickets by title, code, or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={12} />}
            size="md"
            styles={{
              input: {
                border: '1px solid #cbd5e1',
                '&:focus': { borderColor: '#3b82f6' },
              },
            }}
          />
          
          <Group>
            {/* Status filter visible to all */}
            <Select
              placeholder="Filter by Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
              clearable
              leftSection={<IconFilter size={16} />}
              data={[
                { value: 'OPEN', label: 'Open' },
                { value: 'IN_PROGRESS', label: 'In Progress' },
                { value: 'RESOLVED', label: 'Resolved' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
              styles={{
                input: {
                  border: '1px solid #cbd5e1',
                  '&:focus': { borderColor: '#3b82f6' },
                },
              }}
              style={{ width: 200 }}
            />

            {/* Priority filter only for NOC and Admin */}
            {canSetPriority && (
              <Select
                placeholder="Filter by Priority"
                value={priorityFilter}
                onChange={(value) => setPriorityFilter(value || '')}
                clearable
                leftSection={<IconAlertCircle size={16} />}
                data={[
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' },
                ]}
                styles={{
                  input: {
                    border: '1px solid #cbd5e1',
                    '&:focus': { borderColor: '#3b82f6' },
                  },
                }}
                style={{ width: 200 }}
              />
            )}
          </Group>
        </Stack>

        {/* Tickets Table */}
        <Table.ScrollContainer minWidth={900}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8fafc' }}>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Ticket</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Customer</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Status</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Priority</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Created</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Actions</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center" style={{ padding: '40px' }}>
                    <Text c="dimmed">Loading tickets...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : ticketsData?.data?.length ? (
                ticketsData.data.map((ticket: any) => (
                  <Table.Tr key={ticket.id}>
                    <Table.Td>
                      <Box>
                        <Text fw={600} size="sm" mb={4}>
                          {ticket.title}
                        </Text>
                        <Badge size="xs" variant="light" color="gray">
                          {ticket.ticketCode}
                        </Badge>
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="sm">
                          {ticket.customer.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="sm" fw={500}>{ticket.customer.fullName}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="md"
                        variant="light"
                        color={getStatusColor(ticket.status)}
                      >
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        size="md"
                        variant="light"
                        color={getPriorityColor(ticket.priority)}
                        leftSection={<IconAlertCircle size={12} />}
                      >
                        {ticket.priority}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={6}>
                        <IconClock size={14} color="#64748b" />
                        <Text size="sm" c="#475569">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="View Details">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="lg"
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={6} align="center" style={{ padding: '40px' }}>
                    <Text c="dimmed">No tickets found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* Create Ticket Modal */}
      {canCreateTicket && (
        <Modal
          opened={opened}
          onClose={() => {
            setOpened(false);
            form.reset();
          }}
          title={
            <Text fw={700} size="lg">
              Create New Ticket
            </Text>
          }
          size="md"
          radius="md"
        >
          <form
            onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
          >
            <Stack>
              <Select
                label="Customer"
                placeholder="Select customer"
                data={customerOptions}
                required
                size="md"
                leftSection={<IconUser size={16} />}
                searchable
                styles={{
                  label: { fontWeight: 600, marginBottom: 6 },
                  input: { border: '1px solid #cbd5e1' },
                }}
                {...form.getInputProps('customerId')}
              />
              <TextInput
                label="Title"
                placeholder="Brief description of the issue"
                required
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 6 },
                  input: { border: '1px solid #cbd5e1' },
                }}
                {...form.getInputProps('title')}
              />
              <Textarea
                label="Description"
                placeholder="Detailed description of the issue"
                minRows={4}
                size="md"
                styles={{
                  label: { fontWeight: 600, marginBottom: 6 },
                  input: { border: '1px solid #cbd5e1' },
                }}
                {...form.getInputProps('description')}
              />
              <Select
                label="Priority"
                placeholder="Select priority level"
                data={[
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' },
                ]}
                required
                size="md"
                leftSection={<IconAlertCircle size={16} />}
                styles={{
                  label: { fontWeight: 600, marginBottom: 6 },
                  input: { border: '1px solid #cbd5e1' },
                }}
                {...form.getInputProps('priority')}
              />
              <Button
                type="submit"
                size="md"
                loading={createMutation.isLoading}
                styles={{
                  root: {
                    background: '#3b82f6',
                    '&:hover': { background: '#2563eb' },
                  },
                }}
              >
                Create Ticket
              </Button>
            </Stack>
          </form>
        </Modal>
      )}
    </AppShellLayout>
  );
}