'use client';

import { useState, useEffect } from 'react';
import {
  AppShell,
  Text,
  Burger,
  UnstyledButton,
  Stack,
  Button,
  Box,
  Group,
  Avatar,
  Badge,
} from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { IconUsers, IconTicket, IconLogout, IconPackage, IconUserDollar, IconHome, IconBook, IconUserPentagon } from '@tabler/icons-react';
import { useAuthStore } from '@/lib/store';
import { fetchCurrentUser } from '@/lib/api';
import { hasRole, ROLES, PERMISSIONS } from '@/lib/permissions';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, setUser } = useAuthStore();
  
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (!user && storedUserData) {
          setUser(JSON.parse(storedUserData));
        }
        
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
        router.push('/login');
      }
    };

    if (!user) {
      initializeUser();
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getNavigationLinks = () => {
    const links = [];

    if (hasRole(user, [ROLES.ADMIN, ROLES.CUSTOMER_SERVICE])) {
      links.push({
        label: 'Customers',
        href: '/customers',
        icon: IconUserDollar,
        permission: PERMISSIONS.CUSTOMERS.READ
      });
    }

    if (hasRole(user, [ROLES.ADMIN, ROLES.CUSTOMER_SERVICE])) {
      links.push({
        label: 'Packages',
        href: '/packages',
        icon: IconUserPentagon,
        permission: PERMISSIONS.PACKAGES.MANAGE
      });
    }

    links.push({
      label: 'Tickets',
      href: '/tickets',
      icon: IconTicket,
      permission: PERMISSIONS.TICKETS.READ
    });

    if (hasRole(user, [ROLES.ADMIN])) {
      links.push({
        label: 'Users',
        href: '/users',
        icon: IconUsers,
        permission: PERMISSIONS.USERS.MANAGE
      });
    }

    if (hasRole(user, [ROLES.ADMIN])) {
      links.push({
        label: 'Roles',
        href: '/roles',
        icon: IconBook,
        permission: PERMISSIONS.USERS.MANAGE
      });
    }

    return links;
  };

  const links = getNavigationLinks();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f8fafc',
        },
      }}
    >
      {/* Header */}
      <AppShell.Header
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)',
        }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger 
              opened={opened} 
              onClick={() => setOpened(!opened)} 
              hiddenFrom="sm" 
              size="sm"
              color="white"
            />
            
            {/* Logo */}
            <Group gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <IconTicket size={22} color="white" />
              </Box>
              <Box>
                <Text 
                  size="lg" 
                  fw={700} 
                  style={{ 
                    color: 'white',
                    letterSpacing: '-0.01em',
                  }}
                >
                  E-Ticketing Portal
                </Text>
                <Text 
                  size="xs" 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                </Text>
              </Box>
            </Group>
          </Group>

          <Group>
            {user && (
              <Group gap="sm">
                <Avatar 
                  color="blue" 
                  radius="xl" 
                  size="sm"
                  style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box visibleFrom="sm">
                  <Text size="sm" fw={600} style={{ color: 'white' }}>
                    {user.username}
                  </Text>
                  <Text size="xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Administrator
                  </Text>
                </Box>
              </Group>
            )}
            
            <Button 
              variant="subtle" 
              color="white"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
              styles={{
                root: {
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                },
              }}
            >
              <Text visibleFrom="sm">Logout</Text>
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar 
        p="md"
        style={{
          backgroundColor: 'white',
          borderRight: '1px solid #e2e8f0',
        }}
      >
        <Stack gap="xs">
          <Text 
            size="xs" 
            fw={600} 
            tt="uppercase" 
            c="dimmed"
            px="xs"
            mb="xs"
            style={{
              letterSpacing: '0.05em',
            }}
          >
            Navigation
          </Text>
          
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <UnstyledButton
                key={link.href}
                onClick={() => {
                  router.push(link.href);
                  setOpened(false);
                }}
                p="md"
                style={{
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#3b82f6' : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <link.icon 
                      size={20} 
                      color={isActive ? 'white' : '#64748b'} 
                    />
                  </Box>
                  <Text 
                    size="sm" 
                    fw={isActive ? 600 : 500}
                    style={{
                      color: isActive ? '#1e40af' : '#475569',
                    }}
                  >
                    {link.label}
                  </Text>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        <Box p="md">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}