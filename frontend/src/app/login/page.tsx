'use client';

import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text, Box, Stack, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/api';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'Username is required' : null),
      password: (value) => (value.length < 6 ? 'Password should be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', values);
      const { token, user } = response.data.data;

      // Set token in cookie and axios default headers
      setAuthToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update auth store
      setUser(user);
      
      notifications.show({
        title: 'Success',
        message: 'Successfully logged in',
        color: 'green',
      });
      
      router.push('/tickets');
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Something went wrong',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
      }}
    >
      {/* Left Side - Brand Section */}
      <Box
        style={{
          flex: '1',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Elements */}
        <Box
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            filter: 'blur(60px)',
          }}
        />
        <Box
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(30, 64, 175, 0.15)',
            filter: 'blur(80px)',
          }}
        />

        {/* Logo */}
        <Box
          style={{
            width: 100,
            height: 100,
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </Box>

        {/* Brand Text */}
        <Title
          order={1}
          style={{
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '20px',
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          E - Ticketing Portal
        </Title>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        style={{
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <Container size={480}>
          <Box style={{ marginBottom: '40px' }}>
            <Title
              order={2}
              style={{
                color: '#0f172a',
                fontSize: '1.875rem',
                fontWeight: 700,
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              Sign In
            </Title>
            <Text
              size="md"
              style={{
                color: '#64748b',
              }}
            >
              Enter your credentials to access your account
            </Text>
          </Box>

          <Paper
            shadow="sm"
            p={40}
            radius="lg"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
            }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="lg">
                <TextInput
                  label="Username"
                  placeholder="Enter username"
                  required
                  size="md"
                  radius="md"
                  styles={{
                    label: {
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      marginBottom: '8px',
                    },
                    input: {
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      height: '44px',
                      fontSize: '0.95rem',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        backgroundColor: 'white',
                      },
                    },
                  }}
                  {...form.getInputProps('username')}
                />
                
                <PasswordInput
                  label="Password"
                  placeholder="Enter password"
                  required
                  size="md"
                  radius="md"
                  styles={{
                    label: {
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#1e293b',
                      marginBottom: '8px',
                    },
                    input: {
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      height: '44px',
                      fontSize: '0.95rem',
                      '&:focus': {
                        borderColor: '#3b82f6',
                        backgroundColor: 'white',
                      },
                    },
                  }}
                  {...form.getInputProps('password')}
                />

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  radius="md"
                  loading={loading}
                  styles={{
                    root: {
                      background: '#3b82f6',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      height: '44px',
                      marginTop: '8px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: '#2563eb',
                      },
                      '&:active': {
                        transform: 'translateY(1px)',
                      },
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Divider my="xl" label="Need help?" labelPosition="center" />

            <Text
              size="sm"
              style={{
                color: '#64748b',
                textAlign: 'center',
              }}
            >
              Contact your system administrator for support
            </Text>
          </Paper>

          <Text
            size="xs"
            style={{
              color: '#94a3b8',
              textAlign: 'center',
              marginTop: '24px',
            }}
          >
            © 2025 Enterprise Portal. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}