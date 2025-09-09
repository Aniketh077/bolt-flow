import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { IconButton } from '~/components/ui/IconButton';
import { useCollaboration } from './CollaborationProvider';

interface ShareDialogProps {
  projectId: string;
  onShare: (sessionId: string) => void;
}

export function ShareDialog({ projectId, onShare }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [userName, setUserName] = useState('');
  const { joinSession } = useCollaboration();

  const generateShareLink = () => {
    const sessionId = `${projectId}-${Date.now()}`;
    const link = `${window.location.origin}/collaborate/${sessionId}`;
    setShareLink(link);
    onShare(sessionId);
  };

  const startCollaboration = () => {
    if (!userName.trim()) return;

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      name: userName,
      color: getRandomColor()
    };

    const sessionId = shareLink.split('/').pop() || projectId;
    joinSession(sessionId, user);
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <>
      <IconButton
        icon="i-ph:share-bold"
        title="Share & Collaborate"
        onClick={() => setIsOpen(true)}
      />

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-bolt-elements-background-depth-1 border border-bolt-elements-borderColor rounded-lg shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-bolt-elements-textPrimary">
                Share & Collaborate
              </h2>
              <Dialog.Close asChild>
                <IconButton icon="i-ph:x" />
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary"
                />
              </div>

              {!shareLink ? (
                <button
                  onClick={generateShareLink}
                  disabled={!userName.trim()}
                  className="w-full px-4 py-2 bg-accent-500 hover:bg-accent-600 disabled:bg-bolt-elements-background-depth-3 disabled:text-bolt-elements-textTertiary text-white rounded font-medium transition-colors"
                >
                  Generate Share Link
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-bolt-elements-textPrimary mb-2">
                      Share Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 p-3 bg-bolt-elements-background-depth-2 border border-bolt-elements-borderColor rounded text-bolt-elements-textPrimary"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-2 bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-background-depth-4 text-bolt-elements-textPrimary rounded"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={startCollaboration}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                  >
                    Start Collaborating
                  </button>
                </div>
              )}

              <div className="text-sm text-bolt-elements-textSecondary">
                <p>Share this link with others to collaborate in real-time:</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Real-time code editing</li>
                  <li>Live cursor tracking</li>
                  <li>Instant synchronization</li>
                  <li>User presence indicators</li>
                </ul>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function getRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}