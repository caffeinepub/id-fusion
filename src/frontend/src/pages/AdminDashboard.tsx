import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Person, UserProfile } from "../backend";
import AppHeader from "../components/AppHeader";
import PersonFormSheet from "../components/PersonFormSheet";
import { useDeletePerson, useListPersons } from "../hooks/useQueries";
import {
  type RoleCreds,
  type RoleCredsMap,
  addRoleCred,
  getRoleCreds,
  removeRoleCred,
  updateRoleCred,
} from "../utils/credentialUtils";

interface Props {
  profile: UserProfile;
}

type NonAdminRole = keyof RoleCredsMap;

const ROLE_CONFIGS: Array<{
  key: NonAdminRole;
  label: string;
  icon: string;
  color: string;
}> = [
  { key: "general", label: "General Login", icon: "👤", color: "text-primary" },
  { key: "rto", label: "RTO Login", icon: "🚗", color: "text-emerald-400" },
  {
    key: "passport",
    label: "Passport Login",
    icon: "✈️",
    color: "text-purple-400",
  },
  { key: "voter", label: "Voter Login", icon: "🗳️", color: "text-orange-400" },
];

type NewCredRow = { username: string; password: string; show: boolean };

function RoleCredentialsCard({
  cfg,
}: {
  cfg: (typeof ROLE_CONFIGS)[number];
}) {
  const [creds, setCreds] = useState<RoleCreds[]>(
    () => getRoleCreds()[cfg.key],
  );
  const [newRow, setNewRow] = useState<NewCredRow>({
    username: "",
    password: "",
    show: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<NewCredRow>({
    username: "",
    password: "",
    show: false,
  });

  const refresh = () => setCreds(getRoleCreds()[cfg.key]);

  const handleAdd = () => {
    if (!newRow.username.trim() || !newRow.password.trim()) {
      toast.error("Username and password are required");
      return;
    }
    addRoleCred(cfg.key, newRow.username, newRow.password);
    setNewRow({ username: "", password: "", show: false });
    refresh();
    toast.success(`Credential added for ${cfg.label}`);
  };

  const handleDelete = (id: string) => {
    removeRoleCred(cfg.key, id);
    refresh();
    toast.success("Credential removed");
  };

  const startEdit = (c: RoleCreds) => {
    setEditingId(c.id);
    setEditRow({ username: c.username, password: c.password, show: false });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editRow.username.trim() || !editRow.password.trim()) {
      toast.error("Username and password are required");
      return;
    }
    updateRoleCred(cfg.key, editingId, editRow.username, editRow.password);
    setEditingId(null);
    refresh();
    toast.success("Credential updated");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{cfg.icon}</span>
        <span className={`font-display font-semibold text-sm ${cfg.color}`}>
          {cfg.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {creds.length} user{creds.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Existing credentials list */}
      {creds.length > 0 && (
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {creds.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
                data-ocid={`admin.role.${cfg.key}.item.${i + 1}`}
              >
                {editingId === c.id ? (
                  /* Edit row */
                  <div className="flex items-center gap-2 p-2 rounded bg-background border border-primary/30">
                    <Input
                      type="text"
                      value={editRow.username}
                      onChange={(e) =>
                        setEditRow((r) => ({ ...r, username: e.target.value }))
                      }
                      placeholder="Username"
                      className="h-8 text-xs flex-1 bg-transparent border-input"
                      data-ocid={`admin.role.${cfg.key}.edit.input`}
                    />
                    <div className="relative flex-1">
                      <Input
                        type={editRow.show ? "text" : "password"}
                        value={editRow.password}
                        onChange={(e) =>
                          setEditRow((r) => ({
                            ...r,
                            password: e.target.value,
                          }))
                        }
                        placeholder="Password"
                        className="h-8 text-xs pr-8 bg-transparent border-input"
                        data-ocid={`admin.role.${cfg.key}.edit.input`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditRow((r) => ({ ...r, show: !r.show }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        tabIndex={-1}
                      >
                        {editRow.show ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-8 px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                      data-ocid={`admin.role.${cfg.key}.save_button`}
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="h-8 px-2 text-muted-foreground"
                      data-ocid={`admin.role.${cfg.key}.cancel_button`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  /* Display row */
                  <div className="flex items-center gap-2 px-3 py-2 rounded bg-background/50 border border-border/60 group">
                    <span className="text-xs font-medium text-foreground flex-1 truncate">
                      {c.username}
                    </span>
                    <span className="text-xs text-muted-foreground flex-1 font-mono tracking-widest">
                      {"•".repeat(Math.min(c.password.length, 8))}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(c)}
                        className="h-6 px-1.5 text-muted-foreground hover:text-primary"
                        data-ocid={`admin.role.${cfg.key}.edit_button.${i + 1}`}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(c.id)}
                        className="h-6 px-1.5 text-muted-foreground hover:text-destructive"
                        data-ocid={`admin.role.${cfg.key}.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add new credential row */}
      <div className="flex items-center gap-2 p-2 rounded border border-dashed border-border bg-background/30">
        <Input
          type="text"
          value={newRow.username}
          onChange={(e) =>
            setNewRow((r) => ({ ...r, username: e.target.value }))
          }
          placeholder="Username"
          autoComplete="off"
          className="h-8 text-xs flex-1 bg-transparent border-input focus:border-primary"
          data-ocid={`admin.role.${cfg.key}.input`}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <div className="relative flex-1">
          <Input
            type={newRow.show ? "text" : "password"}
            value={newRow.password}
            onChange={(e) =>
              setNewRow((r) => ({ ...r, password: e.target.value }))
            }
            placeholder="Password"
            autoComplete="new-password"
            className="h-8 text-xs pr-8 bg-transparent border-input focus:border-primary"
            data-ocid={`admin.role.${cfg.key}.input`}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            type="button"
            onClick={() => setNewRow((r) => ({ ...r, show: !r.show }))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {newRow.show ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </button>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          data-ocid={`admin.role.${cfg.key}.primary_button`}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
    </motion.div>
  );
}

function ManageLoginsTab() {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Role Login Credentials
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add multiple usernames and passwords for each role. Each row is one
          login account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLE_CONFIGS.map((cfg) => (
          <RoleCredentialsCard key={cfg.key} cfg={cfg} />
        ))}
      </div>

      {/* Admin credentials info */}
      <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-accent">Admin Account</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Admin credentials are fixed and cannot be changed here.
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboard({ profile }: Props) {
  const [search, setSearch] = useState("");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);

  const { data: persons, isLoading } = useListPersons();
  const deletePerson = useDeletePerson();

  const filteredPersons = useMemo(() => {
    if (!persons) return [];
    if (!search.trim()) return persons;
    const q = search.toLowerCase();
    return persons.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.personId.toLowerCase().includes(q),
    );
  }, [persons, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePerson.mutateAsync(deleteTarget.personId);
      toast.success(`${deleteTarget.name} has been removed`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete person");
    }
  };

  const cardCount = (p: Person) => {
    return [
      p.aadhaarCard,
      p.panCard,
      p.rationCard,
      p.voterID,
      p.drivingLicense,
      p.rcCard,
      p.passport,
    ].filter(Boolean).length;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader profile={profile} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <Tabs defaultValue="records">
          <TabsList className="mb-6 bg-card border border-border">
            <TabsTrigger
              value="records"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.records.tab"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Identity Records
            </TabsTrigger>
            <TabsTrigger
              value="logins"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.logins.tab"
            >
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Manage Logins
            </TabsTrigger>
          </TabsList>

          {/* ── Identity Records Tab ── */}
          <TabsContent value="records">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Identity Records
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {persons?.length ?? 0} records in system
                </p>
              </div>
              <Button
                onClick={() => setIsAddOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-ocid="admin.open_modal_button"
              >
                <Plus className="w-4 h-4" />
                Add Person
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary"
                data-ocid="admin.search_input"
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

            {/* Persons list */}
            {isLoading ? (
              <div className="space-y-3" data-ocid="admin.loading_state">
                {["sk1", "sk2", "sk3", "sk4"].map((k) => (
                  <Skeleton key={k} className="h-20 w-full rounded" />
                ))}
              </div>
            ) : filteredPersons.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
                data-ocid="admin.empty_state"
              >
                <Users className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  {search
                    ? "No persons match your search"
                    : "No identity records yet. Add the first person."}
                </p>
                {!search && (
                  <Button
                    variant="outline"
                    onClick={() => setIsAddOpen(true)}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    data-ocid="admin.primary_button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Person
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredPersons.map((person, i) => (
                    <motion.div
                      key={person.personId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ delay: i * 0.03 }}
                      data-ocid={`admin.item.${i + 1}`}
                      className="bg-card border border-border rounded p-4 flex items-center justify-between gap-4 card-glow-hover group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                          <span className="font-display font-bold text-sm text-primary">
                            {person.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {person.name}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="id-number text-xs text-muted-foreground">
                              {person.personId}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-primary/20 text-primary hidden sm:inline-flex"
                            >
                              {cardCount(person)} cards
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPerson(person)}
                          data-ocid={`admin.edit_button.${i + 1}`}
                          className="h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span className="text-xs hidden sm:inline">Edit</span>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteTarget(person)}
                              data-ocid={`admin.delete_button.${i + 1}`}
                              className="h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            className="bg-card border-border"
                            data-ocid="admin.dialog"
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-display">
                                Delete Record
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                This will permanently remove{" "}
                                <strong className="text-foreground">
                                  {person.name}
                                </strong>
                                's identity record and all associated cards.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                className="border-border"
                                data-ocid="admin.cancel_button"
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deletePerson.isPending}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid="admin.confirm_button"
                              >
                                {deletePerson.isPending ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                    Deleting…
                                  </>
                                ) : (
                                  "Delete Record"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* ── Manage Logins Tab ── */}
          <TabsContent value="logins">
            <ManageLoginsTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border/40">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
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

      {/* Add Person Sheet */}
      <PersonFormSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="create"
      />

      {/* Edit Person Sheet */}
      {editingPerson && (
        <PersonFormSheet
          open={!!editingPerson}
          onOpenChange={(open) => {
            if (!open) setEditingPerson(null);
          }}
          mode="edit"
          person={editingPerson}
        />
      )}
    </div>
  );
}
