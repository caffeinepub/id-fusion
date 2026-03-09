import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob, Person, UserProfile } from "../backend";
import { IDFusionRole } from "../backend";
import { useActor } from "./useActor";

// ── User Profile ──────────────────────────────────────────────────────────────

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerUserProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerUserProfile"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Persons ───────────────────────────────────────────────────────────────────

export function useListPersons() {
  const { actor, isFetching } = useActor();
  return useQuery<Person[]>({
    queryKey: ["persons"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPersons();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchPersons(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Person[]>({
    queryKey: ["personsSearch", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) return actor.listPersons();
      return actor.searchPersonsByName(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPerson(personId: string | null, role?: IDFusionRole) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["person", personId, role],
    queryFn: async () => {
      if (!actor || !personId) return null;
      const view = await actor.getPerson(personId);

      // Backend now always returns adminView for all callers.
      // Filter to the appropriate role-based view on the frontend.
      if (view.__kind__ !== "adminView") return view;
      const person = view.adminView;

      if (!role || role === IDFusionRole.admin) return view;

      if (role === IDFusionRole.general) {
        return {
          __kind__: "generalView" as const,
          generalView: {
            personId: person.personId,
            name: person.name,
            dateOfBirth: person.dateOfBirth,
            address: person.address,
            rationCard: person.rationCard,
            aadhaarCard: person.aadhaarCard,
            panCard: person.panCard,
          },
        };
      }

      if (role === IDFusionRole.rto) {
        return {
          __kind__: "rtoView" as const,
          rtoView: {
            personId: person.personId,
            name: person.name,
            dateOfBirth: person.dateOfBirth,
            address: person.address,
            drivingLicense: person.drivingLicense,
            rcCard: person.rcCard,
          },
        };
      }

      if (role === IDFusionRole.passport) {
        return {
          __kind__: "passportView" as const,
          passportView: {
            personId: person.personId,
            name: person.name,
            dateOfBirth: person.dateOfBirth,
            address: person.address,
            passport: person.passport,
          },
        };
      }

      if (role === IDFusionRole.voter) {
        return {
          __kind__: "voterView" as const,
          voterView: {
            personId: person.personId,
            name: person.name,
            dateOfBirth: person.dateOfBirth,
            address: person.address,
            voterID: person.voterID,
          },
        };
      }

      return view;
    },
    enabled: !!actor && !isFetching && !!personId,
  });
}

export function useCreatePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (person: Person) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.createPerson(person);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });
}

export function useUpdatePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      personId,
      person,
    }: { personId: string; person: Person }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.updatePerson(personId, person);
    },
    onSuccess: (_, { personId }) => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
      void queryClient.invalidateQueries({ queryKey: ["person", personId] });
    },
  });
}

export function useDeletePerson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (personId: string) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.deletePerson(personId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["persons"] });
    },
  });
}

export function useUploadImage() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ key, blob }: { key: string; blob: ExternalBlob }) => {
      if (!actor) throw new Error("Actor not ready");
      await actor.uploadImage(key, blob);
    },
  });
}
