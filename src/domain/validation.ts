// Validación y generación de tokens de invitación y seguridad de emparejamiento

export interface InvitationPayload {
  code: string;
  spaceId: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  usedBy?: string;
}

/**
 * Genera un código de invitación alfanumérico de alta entropía (8 caracteres en bloques legibles).
 * Ejemplo: "NIDO-7K9M"
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluye O, 0, I, 1 para evitar confusiones al leer
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NIDO-${randomPart}`;
}

/**
 * Valida si una invitación puede ser canjeada por un usuario.
 */
export function validateInvitation(
  invitation: InvitationPayload | null,
  joiningUserId: string,
  currentMembers: string[],
  now: number = Date.now()
): { valid: boolean; reason?: string } {
  if (!invitation) {
    return { valid: false, reason: 'El código de invitación no existe.' };
  }

  if (invitation.used) {
    return { valid: false, reason: 'Este código de invitación ya fue utilizado.' };
  }

  if (now > invitation.expiresAt) {
    return { valid: false, reason: 'Este código de invitación ha vencido (validez: 48 horas).' };
  }

  if (invitation.createdBy === joiningUserId) {
    return { valid: false, reason: 'No podés canjear tu propio código de invitación.' };
  }

  if (currentMembers.length >= 2) {
    return { valid: false, reason: 'Este nido ya tiene a sus dos integrantes completos.' };
  }

  if (currentMembers.includes(joiningUserId)) {
    return { valid: false, reason: 'Ya sos parte de este nido.' };
  }

  return { valid: true };
}
