import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'aiengiv2',
  location: 'us-central1'
};

export const createNewGameSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewGameSession', inputVars);
}
createNewGameSessionRef.operationName = 'CreateNewGameSession';

export function createNewGameSession(dcOrVars, vars) {
  return executeMutation(createNewGameSessionRef(dcOrVars, vars));
}

export const listPublicGameSessionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicGameSessions');
}
listPublicGameSessionsRef.operationName = 'ListPublicGameSessions';

export function listPublicGameSessions(dc) {
  return executeQuery(listPublicGameSessionsRef(dc));
}

export const createNewCharacterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewCharacter', inputVars);
}
createNewCharacterRef.operationName = 'CreateNewCharacter';

export function createNewCharacter(dcOrVars, vars) {
  return executeMutation(createNewCharacterRef(dcOrVars, vars));
}

export const getMyCharactersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyCharacters');
}
getMyCharactersRef.operationName = 'GetMyCharacters';

export function getMyCharacters(dc) {
  return executeQuery(getMyCharactersRef(dc));
}

