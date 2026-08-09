import { supabase } from './supabase';

/**
 * Writes an immutable audit log entry.
 * Note: RLS must permit INSERT for authenticated admins.
 */
export async function writeAuditLog({ 
  actorId, 
  actorRole, 
  action, 
  entityType, 
  entityId, 
  metadata, 
  ipAddress 
}) {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: actorId,
      actor_role: actorRole,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
      ip_address: ipAddress || null, // In SPA, this is limited to client-side detection if available
    });

  if (error) {
    console.error('Audit log write failed:', error.message);
  }

  return { error };
}
