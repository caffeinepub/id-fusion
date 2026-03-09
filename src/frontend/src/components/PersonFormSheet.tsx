import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Card, Person } from "../backend";
import { ExternalBlob } from "../backend";
import {
  useCreatePerson,
  useUpdatePerson,
  useUploadImage,
} from "../hooks/useQueries";
import { generateImageKey, getBlobImageUrl } from "../utils/imageUtils";
import CardPhotoUpload from "./CardPhotoUpload";

interface CardFormState {
  cardNumber: string;
  blob: ExternalBlob | null;
  previewUrl: string | null;
  existingUrl: string | null;
}

const EMPTY_CARD: CardFormState = {
  cardNumber: "",
  blob: null,
  previewUrl: null,
  existingUrl: null,
};

const CARD_FIELDS: { key: keyof PersonCards; label: string }[] = [
  { key: "aadhaarCard", label: "Aadhaar Card" },
  { key: "panCard", label: "PAN Card" },
  { key: "rationCard", label: "Ration Card" },
  { key: "voterID", label: "Voter ID" },
  { key: "drivingLicense", label: "Driving License" },
  { key: "rcCard", label: "RC Card (Vehicle)" },
  { key: "passport", label: "Passport" },
];

type PersonCards = Pick<
  Person,
  | "aadhaarCard"
  | "panCard"
  | "rationCard"
  | "voterID"
  | "drivingLicense"
  | "rcCard"
  | "passport"
>;
type CardKey = keyof PersonCards;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  person?: Person;
}

function initCardState(card?: Card): CardFormState {
  if (!card) return EMPTY_CARD;
  const existingUrl = card.photo?.getDirectURL?.() ?? null;
  return {
    cardNumber: card.cardNumber,
    blob: null,
    previewUrl: existingUrl,
    existingUrl,
  };
}

export default function PersonFormSheet({
  open,
  onOpenChange,
  mode,
  person,
}: Props) {
  const [name, setName] = useState(person?.name ?? "");
  const [personId, setPersonId] = useState(person?.personId ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(person?.dateOfBirth ?? "");
  const [address, setAddress] = useState(person?.address ?? "");
  const [cards, setCards] = useState<Record<CardKey, CardFormState>>({
    aadhaarCard: initCardState(person?.aadhaarCard),
    panCard: initCardState(person?.panCard),
    rationCard: initCardState(person?.rationCard),
    voterID: initCardState(person?.voterID),
    drivingLicense: initCardState(person?.drivingLicense),
    rcCard: initCardState(person?.rcCard),
    passport: initCardState(person?.passport),
  });
  const [expandedCards, setExpandedCards] = useState<Set<CardKey>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPerson = useCreatePerson();
  const updatePerson = useUpdatePerson();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (open) {
      setName(person?.name ?? "");
      setPersonId(person?.personId ?? "");
      setDateOfBirth(person?.dateOfBirth ?? "");
      setAddress(person?.address ?? "");
      setCards({
        aadhaarCard: initCardState(person?.aadhaarCard),
        panCard: initCardState(person?.panCard),
        rationCard: initCardState(person?.rationCard),
        voterID: initCardState(person?.voterID),
        drivingLicense: initCardState(person?.drivingLicense),
        rcCard: initCardState(person?.rcCard),
        passport: initCardState(person?.passport),
      });
      setExpandedCards(new Set());
    }
  }, [open, person]);

  const toggleCard = (key: CardKey) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const updateCardNumber = (key: CardKey, value: string) => {
    setCards((prev) => ({
      ...prev,
      [key]: { ...prev[key], cardNumber: value },
    }));
  };

  const handleBlobReady = (
    key: CardKey,
    blob: ExternalBlob | null,
    previewUrl: string | null,
  ) => {
    setCards((prev) => ({
      ...prev,
      [key]: { ...prev[key], blob, previewUrl },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!personId.trim()) {
      toast.error("Person ID is required");
      return;
    }
    if (!dateOfBirth.trim()) {
      toast.error("Date of birth is required");
      return;
    }
    if (!address.trim()) {
      toast.error("Address is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Build card objects — upload new photos in parallel
      const cardEntries = await Promise.all(
        CARD_FIELDS.map(async ({ key }) => {
          const state = cards[key];
          if (!state.cardNumber.trim()) return [key, undefined] as const;

          let photoBlob: ExternalBlob;

          if (state.blob) {
            // New photo uploaded — upload to backend
            const imageKey = generateImageKey(personId || "new", key);
            await uploadImage.mutateAsync({ key: imageKey, blob: state.blob });
            photoBlob = state.blob;
          } else if (state.existingUrl) {
            photoBlob = ExternalBlob.fromURL(state.existingUrl);
          } else {
            // No photo - create empty blob
            photoBlob = ExternalBlob.fromBytes(new Uint8Array(0));
          }

          const card: Card = {
            cardNumber: state.cardNumber.trim(),
            photo: photoBlob,
          };
          return [key, card] as const;
        }),
      );

      const cardMap = Object.fromEntries(
        cardEntries.filter(([, v]) => v !== undefined),
      ) as Partial<PersonCards>;

      const personData: Person = {
        name: name.trim(),
        personId: personId.trim(),
        dateOfBirth: dateOfBirth.trim(),
        address: address.trim(),
        ...cardMap,
      };

      if (mode === "create") {
        await createPerson.mutateAsync(personData);
        toast.success(`${name} added successfully`);
      } else if (person) {
        await updatePerson.mutateAsync({
          personId: person.personId,
          person: personData,
        });
        toast.success(`${name} updated successfully`);
      }

      onOpenChange(false);
    } catch {
      toast.error(
        mode === "create" ? "Failed to add person" : "Failed to update person",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filledCardCount = CARD_FIELDS.filter(({ key }) =>
    cards[key].cardNumber.trim(),
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-background border-border p-0 flex flex-col"
        data-ocid="admin.sheet"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-display text-xl">
            {mode === "create" ? "Add New Person" : `Edit — ${person?.name}`}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-sm">
            {mode === "create"
              ? "Create a new identity record with associated ID cards."
              : "Update the identity record and associated ID cards."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <form
              id="person-form"
              onSubmit={handleSubmit}
              className="px-6 py-6 space-y-6"
            >
              {/* Personal info */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="p-name"
                      className="text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="p-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rajesh Kumar"
                      className="bg-card border-border focus:border-primary"
                      data-ocid="person.input"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="p-id"
                      className="text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      Person ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="p-id"
                      value={personId}
                      onChange={(e) => setPersonId(e.target.value)}
                      placeholder="e.g. PRS-2024-001"
                      className="bg-card border-border focus:border-primary id-number"
                      data-ocid="person.id.input"
                      required
                      readOnly={mode === "edit"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="p-dob"
                      className="text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      Date of Birth <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="p-dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="bg-card border-border focus:border-primary"
                      data-ocid="person.dob.input"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="p-address"
                      className="text-xs text-muted-foreground uppercase tracking-wider"
                    >
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="p-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123, Main Street, City, State, PIN"
                      className="bg-card border-border focus:border-primary resize-none"
                      rows={2}
                      data-ocid="person.textarea"
                      required
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-border" />

              {/* ID Cards */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Identity Cards
                  </h3>
                  <span className="text-xs text-primary">
                    {filledCardCount} filled
                  </span>
                </div>
                <div className="space-y-2">
                  {CARD_FIELDS.map(({ key, label }) => {
                    const isExpanded = expandedCards.has(key);
                    const state = cards[key];
                    const isFilled =
                      state.cardNumber.trim() || state.previewUrl;
                    return (
                      <div
                        key={key}
                        className={`border rounded transition-colors ${isFilled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                        data-ocid={`card.${key}.panel`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleCard(key)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left"
                          data-ocid={`card.${key}.toggle`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${isFilled ? "bg-primary" : "bg-muted-foreground/30"}`}
                            />
                            <span className="text-sm font-medium text-foreground">
                              {label}
                            </span>
                            {isFilled && (
                              <span className="id-number text-xs text-primary truncate max-w-[120px]">
                                {state.cardNumber}
                              </span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-4">
                            <Separator className="bg-border" />
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                                Card Number
                              </Label>
                              <Input
                                value={state.cardNumber}
                                onChange={(e) =>
                                  updateCardNumber(key, e.target.value)
                                }
                                placeholder={`Enter ${label} number`}
                                className="bg-background border-border focus:border-primary id-number"
                                data-ocid={`card.${key}.input`}
                              />
                            </div>
                            <CardPhotoUpload
                              label="Card Photo"
                              currentPhotoUrl={state.existingUrl ?? undefined}
                              onBlobReady={(blob, url) =>
                                handleBlobReady(key, blob, url)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </form>
          </ScrollArea>
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-muted-foreground hover:text-foreground flex-1"
            disabled={isSubmitting}
            data-ocid="admin.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="person-form"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1"
            data-ocid="admin.save_button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Adding..." : "Saving..."}
              </>
            ) : mode === "create" ? (
              "Add Person"
            ) : (
              "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
