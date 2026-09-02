export async function registerUser(_payload: unknown) {
  return {
    message: 'Authentication routes are scheduled for the next backend milestone.',
    status: 'not_implemented',
  }
}

export async function verifyUserEmail(_payload: unknown) {
  return {
    message: 'Email verification is scheduled for the next backend milestone.',
    status: 'not_implemented',
  }
}

export async function loginUser(_payload: unknown) {
  return {
    message: 'Login is scheduled for the next backend milestone.',
    status: 'not_implemented',
  }
}

export async function getCurrentUser(_payload: unknown) {
  return {
    message: 'Session hydration is scheduled for the next backend milestone.',
    status: 'not_implemented',
    payload: _payload,
  }
}
