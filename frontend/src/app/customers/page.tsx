'use client';

import { useState } from 'react';
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
  Box,
  Text,
  Badge,
  Avatar,
  Tooltip,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconSearch, IconUserPlus, IconMail, IconPhone, IconMapPin, IconPackage } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { useForm } from '@mantine/form';
import AppShellLayout from '@/components/AppShell';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';

export default function CustomersPage() {
  const [opened, setOpened] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: packagesData } = useQuery('packages', async () => {
    const response = await api.get('/packages');
    return response.data;
  });

  const packageOptions =
    packagesData?.data?.map((pkg: any) => ({
      value: pkg.id.toString(),
      label: `${pkg.name} ($${pkg.price})`,
    })) || [];

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      packageId: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      fullName: (value) => (value.length < 1 ? 'Name is required' : null),
      packageId: (value) => (!value ? 'Package is required' : null),
    },
  });

  const { data: customersData, isLoading, error } = useQuery(
    ['customers', searchQuery],
    async () => {
      const response = await api.get('/customers', {
        params: { search: searchQuery }
      });
      return response.data;
    },
    {
      keepPreviousData: true
    }
  );

  const customers = customersData?.data || [];

  const createMutation = useMutation(
    async (values: typeof form.values) => {
      const { data } = await api.post('/customers', {
        ...values,
        packageId: parseInt(values.packageId),
      });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        notifications.show({
          title: 'Success',
          message: 'Customer created successfully',
          color: 'green',
        });
        form.reset();
        setOpened(false);
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Something went wrong',
          color: 'red',
        });
      },
    }
  );

  const updateMutation = useMutation(
    async (values: typeof form.values) => {
      const updateData = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
        packageId: parseInt(values.packageId)
      };

      const { data } = await api.patch(`/customers/${selectedCustomer.id}`, updateData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        notifications.show({
          title: 'Success',
          message: 'Customer updated successfully',
          color: 'green',
        });
        form.reset();
        setOpened(false);
        setSelectedCustomer(null);
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

  const deleteMutation = useMutation(
    async (id: number) => {
      const { data } = await api.delete(`/customers/${id}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('customers');
        notifications.show({
          title: 'Success',
          message: 'Customer deleted successfully',
          color: 'green',
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Something went wrong',
          color: 'red',
        });
      },
    }
  );

  const handleSubmit = (values: typeof form.values) => {
    if (selectedCustomer) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    form.setValues({
      ...customer,
      packageId: customer.packageId.toString(),
    });
    setOpened(true);
  };

  const handleDelete = (customer: any) => {
    setCustomerToDelete(customer);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <AppShellLayout>
      <Box mb="xl">
        <Group justify="space-between" mb="sm">
          <Box>
            <Text size="xl" fw={700} c="#0f172a">
              Customers
            </Text>
            <Text size="sm" c="dimmed">
              Manage your customer database
            </Text>
          </Box>
          <Button
            leftSection={<IconUserPlus size={18} />}
            onClick={() => setOpened(true)}
            styles={{
              root: {
                background: '#3b82f6',
                '&:hover': { background: '#2563eb' },
              },
            }}
          >
            Add Customer
          </Button>
        </Group>
      </Box>

      <Card
        shadow="sm"
        p="lg"
        radius="md"
        style={{
          border: '1px solid #e2e8f0',
          background: 'white',
        }}
      >
        <TextInput
          placeholder="Search by name, email, or code..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconSearch size={18} />}
          mb="md"
          size="md"
          styles={{
            input: {
              border: '1px solid #cbd5e1',
              '&:focus': { borderColor: '#3b82f6' },
            },
          }}
        />

        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8fafc' }}>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Customer</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Contact</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Address</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Package</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Actions</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <Text c="dimmed">Loading customers...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : error ? (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                    Error loading customers
                  </Table.Td>
                </Table.Tr>
              ) : customers && customers.length > 0 ? (
                customers.map((customer: any) => (
                  <Table.Tr key={customer.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="md">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Text fw={600} size="sm">{customer.fullName}</Text>
                          <Badge size="xs" variant="light" color="gray">
                            {customer.customerCode}
                          </Badge>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Group gap={6}>
                          <IconMail size={14} color="#64748b" />
                          <Text size="sm" c="#475569">{customer.email}</Text>
                        </Group>
                        {customer.phone && (
                          <Group gap={6}>
                            <IconPhone size={14} color="#64748b" />
                            <Text size="sm" c="#475569">{customer.phone}</Text>
                          </Group>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      {customer.address ? (
                        <Group gap={6}>
                          <IconMapPin size={14} color="#64748b" />
                          <Text size="sm" c="#475569">{customer.address}</Text>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {customer.package ? (
                        <Box>
                          <Group gap={6} mb={2}>
                            <IconPackage size={14} color="#3b82f6" />
                            <Text fw={600} size="sm" c="#1e40af">
                              {customer.package.name}
                            </Text>
                          </Group>
                          <Badge size="sm" variant="light" color="green">
                            ${customer.package.price}
                          </Badge>
                        </Box>
                      ) : (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit Customer">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="lg"
                            onClick={() => handleEdit(customer)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Customer">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            onClick={() => handleDelete(customer)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <Text c="dimmed">No customers found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSelectedCustomer(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
          </Text>
        }
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Enter customer full name"
              required
              size="md"
              leftSection={<IconUserPlus size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('fullName')}
            />
            <TextInput
              label="Email"
              placeholder="customer@example.com"
              required
              size="md"
              leftSection={<IconMail size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              size="md"
              leftSection={<IconPhone size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('phone')}
            />
            <TextInput
              label="Address"
              placeholder="Enter address"
              size="md"
              leftSection={<IconMapPin size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('address')}
            />
            <Select
              label="Package"
              placeholder="Select a package"
              data={packageOptions}
              required
              size="md"
              leftSection={<IconPackage size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('packageId')}
            />
            <Button
              type="submit"
              size="md"
              loading={createMutation.isLoading || updateMutation.isLoading}
              styles={{
                root: {
                  background: '#3b82f6',
                  '&:hover': { background: '#2563eb' },
                },
              }}
            >
              {selectedCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </Stack>
        </form>
      </Modal>

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${customerToDelete?.fullName}"? This action cannot be undone.`}
      />
    </AppShellLayout>
  );
}