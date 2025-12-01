import { CreateNewGameSessionData, CreateNewGameSessionVariables, ListPublicGameSessionsData, CreateNewCharacterData, CreateNewCharacterVariables, GetMyCharactersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewGameSession(options?: useDataConnectMutationOptions<CreateNewGameSessionData, FirebaseError, CreateNewGameSessionVariables>): UseDataConnectMutationResult<CreateNewGameSessionData, CreateNewGameSessionVariables>;
export function useCreateNewGameSession(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewGameSessionData, FirebaseError, CreateNewGameSessionVariables>): UseDataConnectMutationResult<CreateNewGameSessionData, CreateNewGameSessionVariables>;

export function useListPublicGameSessions(options?: useDataConnectQueryOptions<ListPublicGameSessionsData>): UseDataConnectQueryResult<ListPublicGameSessionsData, undefined>;
export function useListPublicGameSessions(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicGameSessionsData>): UseDataConnectQueryResult<ListPublicGameSessionsData, undefined>;

export function useCreateNewCharacter(options?: useDataConnectMutationOptions<CreateNewCharacterData, FirebaseError, CreateNewCharacterVariables>): UseDataConnectMutationResult<CreateNewCharacterData, CreateNewCharacterVariables>;
export function useCreateNewCharacter(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewCharacterData, FirebaseError, CreateNewCharacterVariables>): UseDataConnectMutationResult<CreateNewCharacterData, CreateNewCharacterVariables>;

export function useGetMyCharacters(options?: useDataConnectQueryOptions<GetMyCharactersData>): UseDataConnectQueryResult<GetMyCharactersData, undefined>;
export function useGetMyCharacters(dc: DataConnect, options?: useDataConnectQueryOptions<GetMyCharactersData>): UseDataConnectQueryResult<GetMyCharactersData, undefined>;
