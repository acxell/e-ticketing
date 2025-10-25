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
  PasswordInput,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconTrash, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { api } from '@/lib/api';
import { useForm } from '@mantine/form';
import AppShellLayout from '@/components/AppShell';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { useAuthStore } from '@/lib/store';
import { hasPermission } from '@/lib/permissions';

export default function UsersPage() {
  const [opened, setOpened] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);

  const canManageUsers = hasPermission(user, 'users.manage');

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      roleId: ''
    },
    validate: {
      username: (value) => (!value ? 'Username is required' : null),
      email: (value) => (!value ? 'Email is required' : !/^\S+@\S+$/.test(value) ? 'Invalid email' : null),
      password: (value) => (!selectedUser && !value ? 'Password is required' : null),
      fullName: (value) => (!value ? 'Full Name is required' : null),
      roleId: (value) => (!value ? 'Role is required' : null),
    }
  });

  // Query users
  const { data: usersData, isLoading } = useQuery(['users'], async () => {
    const response = await api.get('/users');
    return response.data;
  });

  // Query roles for dropdown
  const { data: rolesData } = useQuery(['roles'], async () => {
    const response = await api.get('/roles');
    return response.data;
  });

  // Create user mutation
  const createMutation = useMutation(
    async (values: typeof form.values) => {
      const response = await api.post('/users', values);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'User created successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['users']);
        setOpened(false);
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to create user',
          color: 'red'
        });
      }
    }
  );

  // Update user mutation
  const updateMutation = useMutation(
    async (values: typeof form.values) => {
      const response = await api.put('/users/' + selectedUser.id, values);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'User updated successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['users']);
        setOpened(false);
        setSelectedUser(null);
        form.reset();
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to update user',
          color: 'red'
        });
      }
    }
  );

  // Delete user mutation
  const deleteMutation = useMutation(
    async (id: number) => {
      const response = await api.delete('/users/' + id);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green'
        });
        queryClient.invalidateQueries(['users']);
        setDeleteModal(false);
        setSelectedUser(null);
      },
      onError: (error: any) => {
        notifications.show({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete user',
          color: 'red'
        });
      }
    }
  );

  const filteredUsers = usersData?.data?.filter((user: any) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!canManageUsers) {
    return (
      <AppShellLayout>
        <Card withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">You don't have permission to manage users</Text>
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
            placeholder="Search users..."
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
            leftSection={<IconUserPlus size={18} />}
            onClick={() => {
              setSelectedUser(null);
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
            Add User
          </Button>
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: '#f8fafc' }}>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">User</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Role</Text>
                </Table.Th>
                <Table.Th>
                  <Text fw={600} size="sm" c="#475569">Contact</Text>
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
                    <Text c="dimmed">Loading users...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredUsers?.length ? (
                filteredUsers.map((user: any) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="sm">
                          {user.fullName?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Text size="sm" fw={500}>{user.fullName}</Text>
                          <Text size="xs" c="dimmed">{user.username}</Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {user.userRoles?.map((ur: any) => (
                        <Badge key={ur.role.id} size="sm" variant="light" color="blue">
                          {ur.role.name}
                        </Badge>
                      ))}
                    </Table.Td>
                    <Table.Td>
                      <Box>
                        <Text size="sm">{user.email}</Text>
                        {user.phone && (
                          <Text size="xs" c="dimmed">{user.phone}</Text>
                        )}
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => {
                              setSelectedUser(user);
                              form.setValues({
                                username: user.username,
                                email: user.email,
                                fullName: user.fullName || '',
                                phone: user.phone || '',
                                roleId: user.userRoles?.[0]?.role.id.toString() || '',
                                password: '' // Clear password when editing
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
                              setSelectedUser(user);
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
                    <Text c="dimmed">No users found</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSelectedUser(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {selectedUser ? 'Edit User' : 'Create New User'}
          </Text>
        }
        size="md"
        radius="md"
      >
        <form onSubmit={form.onSubmit((values) => {
          if (selectedUser) {
            updateMutation.mutate(values);
          } else {
            createMutation.mutate(values);
          }
        })}>
          <Stack>
            <TextInput
              label="Username"
              placeholder="Enter username"
              required
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Email"
              placeholder="Enter email"
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Full Name"
              placeholder="Enter full name"
              required
              {...form.getInputProps('fullName')}
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number"
              {...form.getInputProps('phone')}
            />
            <Select
              label="Role"
              placeholder="Select a role"
              required
              data={rolesData?.data?.map((role: any) => ({
                value: role.id.toString(),
                label: role.name
              })) || []}
              {...form.getInputProps('roleId')}
            />
            <PasswordInput
              label={selectedUser ? 'Password (leave blank to keep current)' : 'Password'}
              placeholder="Enter password"
              required={!selectedUser}
              {...form.getInputProps('password')}
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
              {selectedUser ? 'Update User' : 'Create User'}
            </Button>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        opened={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={() => {
          if (selectedUser) {
            deleteMutation.mutate(selectedUser.id);
          }
        }}
        loading={deleteMutation.isLoading}
        title="Delete User"
        message={'Are you sure you want to delete the user "' + (selectedUser?.username || '') + '"? This action cannot be undone.'}
      />
    </AppShellLayout>
  );
}
