import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Character_Key {
  id: UUIDString;
  __typename?: 'Character_Key';
}

export interface CreateNewCharacterData {
  character_insert: Character_Key;
}

export interface CreateNewCharacterVariables {
  name: string;
  backstory: string;
  characterClass: string;
}

export interface CreateNewGameSessionData {
  gameSession_insert: GameSession_Key;
}

export interface CreateNewGameSessionVariables {
  name: string;
  description?: string | null;
  genre?: string | null;
  public?: boolean | null;
}

export interface GameSession_Key {
  id: UUIDString;
  __typename?: 'GameSession_Key';
}

export interface GameTurn_Key {
  id: UUIDString;
  __typename?: 'GameTurn_Key';
}

export interface GetMyCharactersData {
  characters: ({
    id: UUIDString;
    name: string;
    characterClass: string;
    backstory: string;
  } & Character_Key)[];
}

export interface ListPublicGameSessionsData {
  gameSessions: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    genre?: string | null;
  } & GameSession_Key)[];
}

export interface Setting_Key {
  id: UUIDString;
  __typename?: 'Setting_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewGameSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewGameSessionVariables): MutationRef<CreateNewGameSessionData, CreateNewGameSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewGameSessionVariables): MutationRef<CreateNewGameSessionData, CreateNewGameSessionVariables>;
  operationName: string;
}
export const createNewGameSessionRef: CreateNewGameSessionRef;

export function createNewGameSession(vars: CreateNewGameSessionVariables): MutationPromise<CreateNewGameSessionData, CreateNewGameSessionVariables>;
export function createNewGameSession(dc: DataConnect, vars: CreateNewGameSessionVariables): MutationPromise<CreateNewGameSessionData, CreateNewGameSessionVariables>;

interface ListPublicGameSessionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicGameSessionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicGameSessionsData, undefined>;
  operationName: string;
}
export const listPublicGameSessionsRef: ListPublicGameSessionsRef;

export function listPublicGameSessions(): QueryPromise<ListPublicGameSessionsData, undefined>;
export function listPublicGameSessions(dc: DataConnect): QueryPromise<ListPublicGameSessionsData, undefined>;

interface CreateNewCharacterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewCharacterVariables): MutationRef<CreateNewCharacterData, CreateNewCharacterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewCharacterVariables): MutationRef<CreateNewCharacterData, CreateNewCharacterVariables>;
  operationName: string;
}
export const createNewCharacterRef: CreateNewCharacterRef;

export function createNewCharacter(vars: CreateNewCharacterVariables): MutationPromise<CreateNewCharacterData, CreateNewCharacterVariables>;
export function createNewCharacter(dc: DataConnect, vars: CreateNewCharacterVariables): MutationPromise<CreateNewCharacterData, CreateNewCharacterVariables>;

interface GetMyCharactersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyCharactersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyCharactersData, undefined>;
  operationName: string;
}
export const getMyCharactersRef: GetMyCharactersRef;

export function getMyCharacters(): QueryPromise<GetMyCharactersData, undefined>;
export function getMyCharacters(dc: DataConnect): QueryPromise<GetMyCharactersData, undefined>;

