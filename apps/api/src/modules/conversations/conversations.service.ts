export async function listConversations(_userId: string | undefined) {
  return {
    message: 'Conversations are scheduled for the next backend milestone.',
    status: 'not_implemented',
    userId: _userId,
  }
}

export async function listMessages(_conversationId: string) {
  return {
    message: 'Message reads are scheduled for the next backend milestone.',
    status: 'not_implemented',
    conversationId: _conversationId,
  }
}

export async function sendMessage(_conversationId: string, _payload: unknown) {
  return {
    message: 'Message creation is scheduled for the next backend milestone.',
    status: 'not_implemented',
    conversationId: _conversationId,
    payload: _payload,
  }
}
