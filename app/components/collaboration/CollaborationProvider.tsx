import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
}

interface CollaborationContextType {
  isConnected: boolean;
  users: User[];
  currentUser: User | null;
  joinSession: (sessionId: string, user: User) => void;
  leaveSession: () => void;
  updateCursor: (line: number, column: number) => void;
  ydoc: Y.Doc | null;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

interface CollaborationProviderProps {
  children: ReactNode;
}

export function CollaborationProvider({ children }: CollaborationProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  const joinSession = (sessionId: string, user: User) => {
    // Initialize Yjs document
    const doc = new Y.Doc();
    setYdoc(doc);

    // Connect to WebSocket provider for real-time sync
    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234', // WebSocket server URL
      sessionId,
      doc
    );

    setProvider(wsProvider);
    setCurrentUser(user);

    // Initialize Socket.IO for user presence
    const newSocket = io('http://localhost:3001', {
      query: { sessionId, userId: user.id, userName: user.name }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to collaboration server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from collaboration server');
    });

    newSocket.on('users-updated', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
    });

    newSocket.on('cursor-updated', ({ userId, cursor }: { userId: string; cursor: { line: number; column: number } }) => {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, cursor } : u
      ));
    });

    setSocket(newSocket);
  };

  const leaveSession = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    if (provider) {
      provider.destroy();
      setProvider(null);
    }
    if (ydoc) {
      ydoc.destroy();
      setYdoc(null);
    }
    setIsConnected(false);
    setUsers([]);
    setCurrentUser(null);
  };

  const updateCursor = (line: number, column: number) => {
    if (socket && currentUser) {
      socket.emit('cursor-update', { cursor: { line, column } });
    }
  };

  useEffect(() => {
    return () => {
      leaveSession();
    };
  }, []);

  const value: CollaborationContextType = {
    isConnected,
    users,
    currentUser,
    joinSession,
    leaveSession,
    updateCursor,
    ydoc
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}