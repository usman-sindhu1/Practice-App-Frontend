import type { AdminDoctorProfile } from '../types/doctor';
import type { PublicDoctor } from '../types/availability';

export function getDoctorDisplayName(doctor: Pick<PublicDoctor, 'full_name' | 'first_name' | 'last_name'>): string {
  if (doctor.full_name?.trim()) return doctor.full_name.trim();
  return `Dr. ${doctor.first_name} ${doctor.last_name}`.trim();
}

export function mapApprovedDoctorProfile(profile: AdminDoctorProfile): PublicDoctor | null {
  if (profile.status !== 'approved') return null;

  return {
    user_id: profile.user_id,
    first_name: profile.user?.first_name ?? '',
    last_name: profile.user?.last_name ?? '',
    full_name: profile.full_name,
    profession: profile.profession,
    service: profile.service
      ? {
          id: profile.service.id,
          name: profile.service.name,
          description: profile.service.description,
        }
      : null,
  };
}

export function normalizeApprovedDoctors(data: unknown): PublicDoctor[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item) => {
      if (!item || typeof item !== 'object') return null;

      const row = item as Record<string, unknown>;

      if (row.status && row.status !== 'approved') return null;

      if (row.user_id && (row.first_name || row.user)) {
        const user = row.user as PublicDoctor | undefined;
        const service = row.service as { id?: string; name?: string; description?: string | null } | null;
        return {
          user_id: String(row.user_id),
          first_name: String(user?.first_name ?? row.first_name ?? ''),
          last_name: String(user?.last_name ?? row.last_name ?? ''),
          full_name: (row.full_name as string | null) ?? null,
          profession: (row.profession as string | null) ?? null,
          service: service?.id
            ? {
                id: String(service.id),
                name: String(service.name ?? ''),
                description:
                  service.description === undefined ? null : (service.description as string | null),
              }
            : null,
        } satisfies PublicDoctor;
      }

      return null;
    })
    .filter((doctor): doctor is PublicDoctor => Boolean(doctor?.user_id));
}
