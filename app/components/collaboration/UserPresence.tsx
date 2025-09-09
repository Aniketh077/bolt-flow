import { motion, AnimatePresence } from 'framer-motion';
import { useCollaboration } from './CollaborationProvider';
import { classNames } from '~/utils/classNames';

export function UserPresence() {
  const { users, currentUser, isConnected } = useCollaboration();

  const otherUsers = users.filter(user => user.id !== currentUser?.id);

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={classNames(
          'w-2 h-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )} />
        <span className="text-xs text-bolt-elements-textSecondary">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {otherUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Cursor indicator */}
              {user.cursor && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border border-white" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* User count */}
      {otherUsers.length > 0 && (
        <span className="text-xs text-bolt-elements-textSecondary">
          +{otherUsers.length} collaborator{otherUsers.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}