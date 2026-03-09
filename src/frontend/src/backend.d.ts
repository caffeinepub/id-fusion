import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Card {
    photo: ExternalBlob;
    cardNumber: string;
}
export interface Person {
    dateOfBirth: string;
    passport?: Card;
    name: string;
    rationCard?: Card;
    panCard?: Card;
    personId: string;
    drivingLicense?: Card;
    voterID?: Card;
    address: string;
    aadhaarCard?: Card;
    rcCard?: Card;
}
export interface UserProfile {
    name: string;
    idFusionRole: IDFusionRole;
}
export type PersonView = {
    __kind__: "rtoView";
    rtoView: {
        dateOfBirth: string;
        name: string;
        personId: string;
        drivingLicense?: Card;
        address: string;
        rcCard?: Card;
    };
} | {
    __kind__: "voterView";
    voterView: {
        dateOfBirth: string;
        name: string;
        personId: string;
        voterID?: Card;
        address: string;
    };
} | {
    __kind__: "passportView";
    passportView: {
        dateOfBirth: string;
        passport?: Card;
        name: string;
        personId: string;
        address: string;
    };
} | {
    __kind__: "adminView";
    adminView: Person;
} | {
    __kind__: "generalView";
    generalView: {
        dateOfBirth: string;
        name: string;
        rationCard?: Card;
        panCard?: Card;
        personId: string;
        address: string;
        aadhaarCard?: Card;
    };
};
export enum IDFusionRole {
    rto = "rto",
    admin = "admin",
    voter = "voter",
    passport = "passport",
    general = "general"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPerson(person: Person): Promise<void>;
    deletePerson(personId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPerson(personId: string): Promise<PersonView>;
    getUploadedImage(key: string): Promise<ExternalBlob | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listPersons(): Promise<Array<Person>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPersonsByName(searchTerm: string): Promise<Array<Person>>;
    updatePerson(personId: string, updatedPerson: Person): Promise<void>;
    uploadImage(key: string, blob: ExternalBlob): Promise<void>;
}
