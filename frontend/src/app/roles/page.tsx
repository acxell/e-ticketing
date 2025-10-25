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
  Box,
  Text,
  Badge,
  Tooltip,
  MultiSelect,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconSearch, IconShieldLock } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { useForm } from '@mantine/form';
import AppShellLayout from '@/components/AppShell';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { useAuthStore } from '@/lib/store';
import { hasRole } from '@/lib/permissions';

export default function RolesPage() {
  const [opened, setOpened] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const isAdmin = hasRole(user, ['ADMIN']);

  const form = useForm({
    initialValues: {
      name: '',
      label: '',
      permissions: [] as string[]
    },
    validate: {
      name: (value) => (!value ? 'Role name is required' : null),
      label: (value) => (!value ? 'Role label is required' : null),
    }
  });

  // Query roles
  const { data: rolesData, isLoading } = useQuery(['roles'], async () => {
    const response = await api.get('/roles');
    return response.data;
  });

  // Query permissions for multiselect
  const { data: permissionsData } = useQuery(['permissions'], async () => {
    const response = await api.get('/permissions');
    return response.data;
  });

  // Create role mutation
  const createMutation = useMutation(
    async (values: typeof form.values) => {
      const response = await api.post('/roles', values);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Role created successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['roles']);
        setOpened(false);
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to create role',
          color: 'red'
        });
      }
    }
  );

  // Update role mutation
  const updateMutation = useMutation(
    async (values: typeof form.values) => {
      const response = await api.put('/roles/' + selectedRole.id, values);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Role updated successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['roles']);
        setOpened(false);
        setSelectedRole(null);
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to update role',
          color: 'red'
        });
      }
    }
  );

  // Delete role mutation
  const deleteMutation = useMutation(
    async (id: number) => {
      const response = await api.delete('/roles/' + id);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'Role deleted successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['roles']);
        setDeleteModal(false);
        setSelectedRole(null);
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete role',
          color: 'red'
        });
      }
    }
  );

  const filteredRoles = rolesData?.data?.filter((role: any) =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <AppShellLayout>
        <Card withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">You don't have permission to manage roles</Text>
        </Card>
      </AppShellLayout>
    );
  }

  return (
    <AppShellLayout>
      <Card
        withBorder
        p="xl"
        radius="md"
        style={{
          border: '1px solid #e2e8f0',
          background: 'white',
        }}
      >
        <Group justify="space-between" mb="md">
          <TextInput
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftSection={<IconSearch size={18} />}
            style={{ flex: 1 }}
            size="md"
            styles={{
              input: {
                border: '1px solid #cbd5e1',
                '&:focus': { borderColor: '#3b82f6' },
              },
            }}
          />
          <Button
            size="md"
            leftSection={<IconShieldLock size={18} />}
            onClick={() => {
              setSelectedRole(null);
              form.reset();
              setOpened(true);
            }}
            variant="filled"
            styles={{
              root: {
                backgroundColor: '#3b82f6',
                '&:hover': { backgroundColor: '#2563eb' },
              },
            }}
          >
            Add Role
          </Button>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8fafc' }}>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Role Name</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Label</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Permissions</Text>
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
                    <Text c="dimmed">Loading roles...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredRoles?.length ? (
                filteredRoles.map((role: any) => (
                  <Table.Tr key={role.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{role.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{role.label}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {role.rolePermissions?.map((rp: any) => (
                          <Badge key={rp.permission.id} size="sm" variant="dot">
                            {rp.permission.label || rp.permission.key}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => {
                              setSelectedRole(role);
                              form.setValues({
                                name: role.name,
                                label: role.label || '',
                                permissions: role.rolePermissions?.map((rp: any) => rp.permission.id.toString()) || []
                              });
                              setOpened(true);
                            }}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Delete">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => {
                              setSelectedRole(role);
                              setDeleteModal(true);
                            }}
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
                    <Text c="dimmed">No roles found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* Create/Edit Role Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSelectedRole(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </Text>
        }
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit((values) => {
          if (selectedRole) {
            updateMutation.mutate(values);
          } else {
            createMutation.mutate(values);
          }
        })}>
          <Stack>
            <TextInput
              label="Role Name"
              placeholder="Enter role name (e.g., ADMIN, MANAGER)"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Label"
              placeholder="Enter role label"
              required
              {...form.getInputProps('label')}
            />
            <MultiSelect
              label="Permissions"
              placeholder="Select permissions"
              data={permissionsData?.data?.map((perm: any) => ({
                value: perm.id.toString(),
                label: perm.label || perm.key
              })) || []}
              {...form.getInputProps('permissions')}
            />
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
              variant="filled"
              styles={{
                root: {
                  backgroundColor: '#3b82f6',
                  '&:hover': { backgroundColor: '#2563eb' },
                },
              }}
            >
              {selectedRole ? 'Update Role' : 'Create Role'}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedRole(null);
        }}
        onConfirm={() => {
          if (selectedRole) {
            deleteMutation.mutate(selectedRole.id);
          }
        }}
        loading={deleteMutation.isLoading}
        title="Delete Role"
        message={'Are you sure you want to delete the role "' + (selectedRole?.name || '') + '"? This action cannot be undone.'}
      />
    </AppShellLayout>
  );
}
