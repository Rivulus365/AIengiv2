const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'aiengiv2',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createNewGameSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewGameSession', inputVars);
}
createNewGameSessionRef.operationName = 'CreateNewGameSession';
exports.createNewGameSessionRef = createNewGameSessionRef;

exports.createNewGameSession = function createNewGameSession(dcOrVars, vars) {
  return executeMutation(createNewGameSessionRef(dcOrVars, vars));
};

const listPublicGameSessionsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPublicGameSessions');
}
listPublicGameSessionsRef.operationName = 'ListPublicGameSessions';
exports.listPublicGameSessionsRef = listPublicGameSessionsRef;

exports.listPublicGameSessions = function listPublicGameSessions(dc) {
  return executeQuery(listPublicGameSessionsRef(dc));
};

const createNewCharacterRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewCharacter', inputVars);
}
createNewCharacterRef.operationName = 'CreateNewCharacter';
exports.createNewCharacterRef = createNewCharacterRef;

exports.createNewCharacter = function createNewCharacter(dcOrVars, vars) {
  return executeMutation(createNewCharacterRef(dcOrVars, vars));
};

const getMyCharactersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyCharacters');
}
getMyCharactersRef.operationName = 'GetMyCharacters';
exports.getMyCharactersRef = getMyCharactersRef;

exports.getMyCharacters = function getMyCharacters(dc) {
  return executeQuery(getMyCharactersRef(dc));
};
