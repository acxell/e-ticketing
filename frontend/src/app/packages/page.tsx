'use client';

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Group,
  TextInput,
  Modal,
  Stack,
  NumberInput,
  Textarea,
  ActionIcon,
  Box,
  Text,
  Badge,
  Tooltip,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconSearch, IconPackageExport, IconPackage, IconFileText, IconCurrencyDollar } from '@tabler/icons-react';
import { api } from '@/lib/api';
import AppShellLayout from '@/components/AppShell';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';

export default function PackagesPage() {
  const [opened, setOpened] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: '',
      code: '',
      description: '',
      price: 0,
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
      code: (value) => (!value ? 'Code is required' : null),
      price: (value) => (value < 0 ? 'Price must be positive' : null),
    },
  });

  const { data: packagesData, isLoading } = useQuery(
    ['packages', searchQuery],
    async () => {
      const response = await api.get('/packages', {
        params: searchQuery ? { search: searchQuery } : undefined
      });
      return response.data;
    },
    {
      keepPreviousData: true,
    }
  );

  const createMutation = useMutation(
    async (values: typeof form.values) => {
      const { data } = await api.post('/packages', values);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('packages');
        notifications.show({
          title: 'Success',
          message: 'Package created successfully',
          color: 'green',
        });
        form.reset();
        setOpened(false);
      },
    }
  );

  const updateMutation = useMutation(
    async (values: typeof form.values) => {
      const { data } = await api.patch(
        `/packages/${selectedPackage.id}`,
        values
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('packages');
        notifications.show({
          title: 'Success',
          message: 'Package updated successfully',
          color: 'green',
        });
        form.reset();
        setOpened(false);
        setSelectedPackage(null);
      },
    }
  );

  const deleteMutation = useMutation(
    async (id: number) => {
      const { data } = await api.delete(`/packages/${id}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('packages');
        notifications.show({
          title: 'Success',
          message: 'Package deleted successfully',
          color: 'green',
        });
      },
    }
  );

  const handleSubmit = (values: typeof form.values) => {
    if (selectedPackage) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    form.setValues(pkg);
    setOpened(true);
  };

  const handleDelete = (pkg: any) => {
    setPackageToDelete(pkg);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (packageToDelete) {
      deleteMutation.mutate(packageToDelete.id);
      setDeleteModalOpen(false);
      setPackageToDelete(null);
    }
  };

  return (
    <AppShellLayout>
      <Box mb="xl">
        <Group justify="space-between" mb="sm">
          <Box>
            <Text size="xl" fw={700} c="#0f172a">
              Packages
            </Text>
            <Text size="sm" c="dimmed">
              Manage service packages and pricing
            </Text>
          </Box>
          <Button
            leftSection={<IconPackageExport size={18} />}
            onClick={() => setOpened(true)}
            styles={{
              root: {
                background: '#3b82f6',
                '&:hover': { background: '#2563eb' },
              },
            }}
          >
            Add Package
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
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

        <Table.ScrollContainer minWidth={600}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8fafc' }}>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Package</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Description</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Price</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Actions</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={4} align="center" style={{ padding: '40px' }}>
                    <Text c="dimmed">Loading packages...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : packagesData?.data?.length ? (
                packagesData.data.map((pkg: any) => (
                  <Table.Tr key={pkg.id}>
                    <Table.Td>
                      <Box>
                        <Group gap="sm" mb={4}>
                          <IconPackage size={18} color="#3b82f6" />
                          <Text fw={600} size="sm">{pkg.name}</Text>
                        </Group>
                        <Badge size="sm" variant="light" color="gray">
                          {pkg.code}
                        </Badge>
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="#475569" lineClamp={2}>
                        {pkg.description || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="lg" variant="light" color="green">
                        ${pkg.price.toFixed(2)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit Package">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            size="lg"
                            onClick={() => handleEdit(pkg)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete Package">
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="lg"
                            onClick={() => handleDelete(pkg)}
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
                  <Table.Td colSpan={4} align="center" style={{ padding: '40px' }}>
                    <Text c="dimmed">No packages found</Text>
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
          setSelectedPackage(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {selectedPackage ? 'Edit Package' : 'Add New Package'}
          </Text>
        }
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Package Code"
              placeholder="Enter package code"
              required
              size="md"
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('code')}
            />
            <TextInput
              label="Package Name"
              placeholder="Enter package name"
              required
              size="md"
              leftSection={<IconPackage size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Enter package description"
              minRows={3}
              size="md"
              leftSection={<IconFileText size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('description')}
            />
            <NumberInput
              label="Price"
              placeholder="0.00"
              min={0}
              required
              size="md"
              leftSection={<IconCurrencyDollar size={16} />}
              styles={{
                label: { fontWeight: 600, marginBottom: 6 },
                input: { border: '1px solid #cbd5e1' },
              }}
              {...form.getInputProps('price')}
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
              {selectedPackage ? 'Update Package' : 'Create Package'}
            </Button>
          </Stack>
        </form>
      </Modal>

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPackageToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={deleteMutation.isLoading}
        title="Delete Package"
        message={`Are you sure you want to delete package "${packageToDelete?.name}"? This action cannot be undone.`}
      />
    </AppShellLayout>
  );
}