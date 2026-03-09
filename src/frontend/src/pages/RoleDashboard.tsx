import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  ChevronLeft,
  MapPin,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { PersonView, UserProfile } from "../backend";
import { IDFusionRole } from "../backend";
import AppHeader from "../components/AppHeader";
import IDCardDisplay from "../components/IDCardDisplay";
import { useGetPerson, useSearchPersons } from "../hooks/useQueries";
import { ROLE_BG_COLORS, ROLE_COLORS, ROLE_LABELS } from "../utils/roleUtils";

interface Props {
  profile: UserProfile;
}

type ViewState = "list" | "detail";

function RoleCardSection({ view }: { view: PersonView }) {
  if (view.__kind__ === "voterView") {
    const data = view.voterView;
    return (
      <div className="space-y-4">
        <PersonMetaInfo
          name={data.name}
          dob={data.dateOfBirth}
          address={data.address}
          personId={data.personId}
        />
        <IDCardDisplay
          title="Voter ID"
          card={data.voterID}
          accentColor="text-orange-400"
        />
      </div>
    );
  }
  if (view.__kind__ === "passportView") {
    const data = view.passportView;
    return (
      <div className="space-y-4">
        <PersonMetaInfo
          name={data.name}
          dob={data.dateOfBirth}
          address={data.address}
          personId={data.personId}
        />
        <IDCardDisplay
          title="Passport"
          card={data.passport}
          accentColor="text-purple-400"
        />
      </div>
    );
  }
  if (view.__kind__ === "rtoView") {
    const data = view.rtoView;
    return (
      <div className="space-y-4">
        <PersonMetaInfo
          name={data.name}
          dob={data.dateOfBirth}
          address={data.address}
          personId={data.personId}
        />
        <IDCardDisplay
          title="Driving License"
          card={data.drivingLicense}
          accentColor="text-emerald-400"
        />
        <IDCardDisplay
          title="RC Card (Vehicle)"
          card={data.rcCard}
          accentColor="text-emerald-400"
        />
      </div>
    );
  }
  if (view.__kind__ === "generalView") {
    const data = view.generalView;
    return (
      <div className="space-y-4">
        <PersonMetaInfo
          name={data.name}
          dob={data.dateOfBirth}
          address={data.address}
          personId={data.personId}
        />
        <IDCardDisplay
          title="Aadhaar Card"
          card={data.aadhaarCard}
          accentColor="text-primary"
        />
        <IDCardDisplay
          title="PAN Card"
          card={data.panCard}
          accentColor="text-primary"
        />
        <IDCardDisplay
          title="Ration Card"
          card={data.rationCard}
          accentColor="text-primary"
        />
      </div>
    );
  }
  if (view.__kind__ === "adminView") {
    const data = view.adminView;
    return (
      <div className="space-y-4">
        <PersonMetaInfo
          name={data.name}
          dob={data.dateOfBirth}
          address={data.address}
          personId={data.personId}
        />
        <IDCardDisplay title="Aadhaar Card" card={data.aadhaarCard} />
        <IDCardDisplay title="PAN Card" card={data.panCard} />
        <IDCardDisplay title="Ration Card" card={data.rationCard} />
        <IDCardDisplay title="Voter ID" card={data.voterID} />
        <IDCardDisplay title="Driving License" card={data.drivingLicense} />
        <IDCardDisplay title="RC Card" card={data.rcCard} />
        <IDCardDisplay title="Passport" card={data.passport} />
      </div>
    );
  }
  return null;
}

function PersonMetaInfo({
  name,
  dob,
  address,
  personId,
}: { name: string; dob: string; address: string; personId: string }) {
  return (
    <div className="bg-card border border-border rounded p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
          <span className="font-display font-bold text-lg text-primary">
            {name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground">
            {name}
          </h2>
          <p className="id-number text-xs text-muted-foreground">{personId}</p>
        </div>
      </div>
      <Separator className="bg-border" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5">
              Date of Birth
            </p>
            <p className="text-foreground">{dob}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5">
              Address
            </p>
            <p className="text-foreground text-xs leading-relaxed">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonDetailView({
  personId,
  onBack,
  role,
}: { personId: string; onBack: () => void; role: IDFusionRole }) {
  const { data: personView, isLoading } = useGetPerson(personId, role);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
          data-ocid="role.secondary_button"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <span className="text-muted-foreground text-sm">/</span>
        <span className="text-sm text-foreground">Identity Record</span>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="role.loading_state">
          <Skeleton className="h-32 w-full rounded" />
          <Skeleton className="h-24 w-full rounded" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
      ) : personView ? (
        <RoleCardSection view={personView} />
      ) : (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="role.error_state"
        >
          <p>Record not found or not accessible.</p>
        </div>
      )}
    </div>
  );
}

export default function RoleDashboard({ profile }: Props) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewState>("list");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const { data: persons, isLoading } = useSearchPersons(search);

  const role = profile.idFusionRole;
  const roleBg = ROLE_BG_COLORS[role] ?? "bg-muted border-border";
  const roleColor = ROLE_COLORS[role] ?? "text-foreground";

  const roleAccessLabel: Record<IDFusionRole, string> = {
    [IDFusionRole.general]: "Aadhaar · PAN · Ration Card",
    [IDFusionRole.rto]: "Driving License · RC Card",
    [IDFusionRole.passport]: "Passport",
    [IDFusionRole.voter]: "Voter ID",
    [IDFusionRole.admin]: "All Documents",
  };

  const handleSelectPerson = (personId: string) => {
    setSelectedPersonId(personId);
    setView("detail");
  };

  const handleBack = () => {
    setView("list");
    setSelectedPersonId(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Role badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-medium mb-6 ${roleBg}`}
        >
          <span className={roleColor}>{ROLE_LABELS[role]}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{roleAccessLabel[role]}</span>
        </div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    Search Records
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    View identity information for registered persons
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-card border-border focus:border-primary"
                  data-ocid="role.search_input"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              {isLoading ? (
                <div className="space-y-3" data-ocid="role.loading_state">
                  {["sk1", "sk2", "sk3"].map((k) => (
                    <Skeleton key={k} className="h-16 w-full rounded" />
                  ))}
                </div>
              ) : !persons || persons.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 gap-4"
                  data-ocid="role.empty_state"
                >
                  <Users className="w-10 h-10 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    {search
                      ? "No persons found matching your search"
                      : "No records available"}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {persons.map((person, i) => (
                    <motion.button
                      key={person.personId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => handleSelectPerson(person.personId)}
                      data-ocid={`role.item.${i + 1}`}
                      className="w-full bg-card border border-border rounded p-4 flex items-center justify-between gap-4 text-left card-glow-hover hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {person.name}
                          </p>
                          <p className="id-number text-xs text-muted-foreground">
                            {person.personId}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-primary/20 text-primary text-[10px] shrink-0 group-hover:bg-primary/10"
                      >
                        View
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
            >
              {selectedPersonId && (
                <PersonDetailView
                  personId={selectedPersonId}
                  onBack={handleBack}
                  role={profile.idFusionRole}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
