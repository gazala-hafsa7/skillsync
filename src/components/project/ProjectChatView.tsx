import React, { useState } from 'react';
import { api } from '../../api/api';
import { Button } from '../ui/button';

interface ProjectMessage {
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface ProjectChatViewProps {
  projectId: string;
  projectTitle: string;
  currentUserId: string;
  onClose?: () => void;
  mode?: 'modal' | 'page';
}

export const ProjectChatView: React.FC<ProjectChatViewProps> = ({
  projectId,
  projectTitle,
  currentUserId,
  onClose,
  mode = 'modal',
}) => {
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let active = true;

    const loadMessages = async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      const data = await api.getProjectMessages(projectId);

      if (!active) return;

      if (Array.isArray(data)) {
        setMessages(data);
        setError('');
      } else {
        setError(data.message || 'Failed to load chat');
      }

      if (showLoader) {
        setLoading(false);
      }
    };

    loadMessages(true);

    const intervalId = window.setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextText = text.trim();
    if (!nextText) return;

    const data = await api.sendProjectMessage(projectId, nextText);

    if (Array.isArray(data)) {
      setMessages(data);
      setText('');
      setError('');
    } else {
      setError(data.message || 'Failed to send message');
    }
  };

  const shellStyle: React.CSSProperties =
    mode === 'page'
      ? {
          width: '100%',
          minHeight: 'calc(100vh - 120px)',
          background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '24px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }
      : {
          width: '100%',
          maxWidth: 720,
          height: 'min(80vh, 760px)',
          background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '24px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        };

  const chatBody = (
    <div style={shellStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{projectTitle} Chat</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
            Only the team lead and joined members can chat here.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {mode === 'modal' && (
            <Button
              size="sm"
              variant="glass"
              type="button"
              onClick={() =>
                window.open(`${window.location.origin}${window.location.pathname}#project-chat/${projectId}`, '_blank', 'noopener,noreferrer')
              }
            >
              Open In Tab
            </Button>
          )}
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.025)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {loading && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Loading chat...</p>}
        {!loading && messages.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>No messages yet.</p>}
        {!loading &&
          messages.map((message, index) => {
            const ownMessage = message.senderId === currentUserId;
            return (
              <div
                key={`${message.senderId}-${message.createdAt}-${index}`}
                style={{
                  alignSelf: ownMessage ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  padding: '10px 12px',
                  borderRadius: 14,
                  background: ownMessage ? 'rgba(224,60,82,0.16)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${ownMessage ? 'rgba(224,60,82,0.25)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: ownMessage ? '#fca5a5' : '#d1d5db', marginBottom: 4 }}>
                  {ownMessage ? (
                    'You'
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = `profile/${message.senderId}`;
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d1d5db',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {message.senderName}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#f3f4f6', lineHeight: 1.5 }}>{message.text}</div>
              </div>
            );
          })}
      </div>

      {error && (
        <div style={{ fontSize: 12, color: '#f87171', background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.25)', borderRadius: 10, padding: '10px 12px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          rows={mode === 'page' ? 3 : 2}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Send a message to your project team..."
          style={{
            flex: 1,
            resize: 'none',
            padding: '12px 14px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            color: '#f0f0f0',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <Button type="submit" variant="accent" size="md">
          Send
        </Button>
      </form>
    </div>
  );

  if (mode === 'page') {
    return chatBody;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {chatBody}
    </div>
  );
};
