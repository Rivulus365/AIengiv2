# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListPublicGameSessions*](#listpublicgamesessions)
  - [*GetMyCharacters*](#getmycharacters)
- [**Mutations**](#mutations)
  - [*CreateNewGameSession*](#createnewgamesession)
  - [*CreateNewCharacter*](#createnewcharacter)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListPublicGameSessions
You can execute the `ListPublicGameSessions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPublicGameSessions(): QueryPromise<ListPublicGameSessionsData, undefined>;

interface ListPublicGameSessionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicGameSessionsData, undefined>;
}
export const listPublicGameSessionsRef: ListPublicGameSessionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPublicGameSessions(dc: DataConnect): QueryPromise<ListPublicGameSessionsData, undefined>;

interface ListPublicGameSessionsRef {
  ...
  (dc: DataConnect): QueryRef<ListPublicGameSessionsData, undefined>;
}
export const listPublicGameSessionsRef: ListPublicGameSessionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPublicGameSessionsRef:
```typescript
const name = listPublicGameSessionsRef.operationName;
console.log(name);
```

### Variables
The `ListPublicGameSessions` query has no variables.
### Return Type
Recall that executing the `ListPublicGameSessions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPublicGameSessionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListPublicGameSessionsData {
  gameSessions: ({
    id: UUIDString;
    name: string;
    description?: string | null;
    genre?: string | null;
  } & GameSession_Key)[];
}
```
### Using `ListPublicGameSessions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPublicGameSessions } from '@dataconnect/generated';


// Call the `listPublicGameSessions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPublicGameSessions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPublicGameSessions(dataConnect);

console.log(data.gameSessions);

// Or, you can use the `Promise` API.
listPublicGameSessions().then((response) => {
  const data = response.data;
  console.log(data.gameSessions);
});
```

### Using `ListPublicGameSessions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPublicGameSessionsRef } from '@dataconnect/generated';


// Call the `listPublicGameSessionsRef()` function to get a reference to the query.
const ref = listPublicGameSessionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPublicGameSessionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.gameSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.gameSessions);
});
```

## GetMyCharacters
You can execute the `GetMyCharacters` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyCharacters(): QueryPromise<GetMyCharactersData, undefined>;

interface GetMyCharactersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyCharactersData, undefined>;
}
export const getMyCharactersRef: GetMyCharactersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyCharacters(dc: DataConnect): QueryPromise<GetMyCharactersData, undefined>;

interface GetMyCharactersRef {
  ...
  (dc: DataConnect): QueryRef<GetMyCharactersData, undefined>;
}
export const getMyCharactersRef: GetMyCharactersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyCharactersRef:
```typescript
const name = getMyCharactersRef.operationName;
console.log(name);
```

### Variables
The `GetMyCharacters` query has no variables.
### Return Type
Recall that executing the `GetMyCharacters` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyCharactersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyCharactersData {
  characters: ({
    id: UUIDString;
    name: string;
    characterClass: string;
    backstory: string;
  } & Character_Key)[];
}
```
### Using `GetMyCharacters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyCharacters } from '@dataconnect/generated';


// Call the `getMyCharacters()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyCharacters();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyCharacters(dataConnect);

console.log(data.characters);

// Or, you can use the `Promise` API.
getMyCharacters().then((response) => {
  const data = response.data;
  console.log(data.characters);
});
```

### Using `GetMyCharacters`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyCharactersRef } from '@dataconnect/generated';


// Call the `getMyCharactersRef()` function to get a reference to the query.
const ref = getMyCharactersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyCharactersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.characters);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.characters);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewGameSession
You can execute the `CreateNewGameSession` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewGameSession(vars: CreateNewGameSessionVariables): MutationPromise<CreateNewGameSessionData, CreateNewGameSessionVariables>;

interface CreateNewGameSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewGameSessionVariables): MutationRef<CreateNewGameSessionData, CreateNewGameSessionVariables>;
}
export const createNewGameSessionRef: CreateNewGameSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewGameSession(dc: DataConnect, vars: CreateNewGameSessionVariables): MutationPromise<CreateNewGameSessionData, CreateNewGameSessionVariables>;

interface CreateNewGameSessionRef {
  ...
  (dc: DataConnect, vars: CreateNewGameSessionVariables): MutationRef<CreateNewGameSessionData, CreateNewGameSessionVariables>;
}
export const createNewGameSessionRef: CreateNewGameSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewGameSessionRef:
```typescript
const name = createNewGameSessionRef.operationName;
console.log(name);
```

### Variables
The `CreateNewGameSession` mutation requires an argument of type `CreateNewGameSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewGameSessionVariables {
  name: string;
  description?: string | null;
  genre?: string | null;
  public?: boolean | null;
}
```
### Return Type
Recall that executing the `CreateNewGameSession` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewGameSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewGameSessionData {
  gameSession_insert: GameSession_Key;
}
```
### Using `CreateNewGameSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewGameSession, CreateNewGameSessionVariables } from '@dataconnect/generated';

// The `CreateNewGameSession` mutation requires an argument of type `CreateNewGameSessionVariables`:
const createNewGameSessionVars: CreateNewGameSessionVariables = {
  name: ..., 
  description: ..., // optional
  genre: ..., // optional
  public: ..., // optional
};

// Call the `createNewGameSession()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewGameSession(createNewGameSessionVars);
// Variables can be defined inline as well.
const { data } = await createNewGameSession({ name: ..., description: ..., genre: ..., public: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewGameSession(dataConnect, createNewGameSessionVars);

console.log(data.gameSession_insert);

// Or, you can use the `Promise` API.
createNewGameSession(createNewGameSessionVars).then((response) => {
  const data = response.data;
  console.log(data.gameSession_insert);
});
```

### Using `CreateNewGameSession`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewGameSessionRef, CreateNewGameSessionVariables } from '@dataconnect/generated';

// The `CreateNewGameSession` mutation requires an argument of type `CreateNewGameSessionVariables`:
const createNewGameSessionVars: CreateNewGameSessionVariables = {
  name: ..., 
  description: ..., // optional
  genre: ..., // optional
  public: ..., // optional
};

// Call the `createNewGameSessionRef()` function to get a reference to the mutation.
const ref = createNewGameSessionRef(createNewGameSessionVars);
// Variables can be defined inline as well.
const ref = createNewGameSessionRef({ name: ..., description: ..., genre: ..., public: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewGameSessionRef(dataConnect, createNewGameSessionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.gameSession_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.gameSession_insert);
});
```

## CreateNewCharacter
You can execute the `CreateNewCharacter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewCharacter(vars: CreateNewCharacterVariables): MutationPromise<CreateNewCharacterData, CreateNewCharacterVariables>;

interface CreateNewCharacterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewCharacterVariables): MutationRef<CreateNewCharacterData, CreateNewCharacterVariables>;
}
export const createNewCharacterRef: CreateNewCharacterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewCharacter(dc: DataConnect, vars: CreateNewCharacterVariables): MutationPromise<CreateNewCharacterData, CreateNewCharacterVariables>;

interface CreateNewCharacterRef {
  ...
  (dc: DataConnect, vars: CreateNewCharacterVariables): MutationRef<CreateNewCharacterData, CreateNewCharacterVariables>;
}
export const createNewCharacterRef: CreateNewCharacterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewCharacterRef:
```typescript
const name = createNewCharacterRef.operationName;
console.log(name);
```

### Variables
The `CreateNewCharacter` mutation requires an argument of type `CreateNewCharacterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewCharacterVariables {
  name: string;
  backstory: string;
  characterClass: string;
}
```
### Return Type
Recall that executing the `CreateNewCharacter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewCharacterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewCharacterData {
  character_insert: Character_Key;
}
```
### Using `CreateNewCharacter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewCharacter, CreateNewCharacterVariables } from '@dataconnect/generated';

// The `CreateNewCharacter` mutation requires an argument of type `CreateNewCharacterVariables`:
const createNewCharacterVars: CreateNewCharacterVariables = {
  name: ..., 
  backstory: ..., 
  characterClass: ..., 
};

// Call the `createNewCharacter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewCharacter(createNewCharacterVars);
// Variables can be defined inline as well.
const { data } = await createNewCharacter({ name: ..., backstory: ..., characterClass: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewCharacter(dataConnect, createNewCharacterVars);

console.log(data.character_insert);

// Or, you can use the `Promise` API.
createNewCharacter(createNewCharacterVars).then((response) => {
  const data = response.data;
  console.log(data.character_insert);
});
```

### Using `CreateNewCharacter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewCharacterRef, CreateNewCharacterVariables } from '@dataconnect/generated';

// The `CreateNewCharacter` mutation requires an argument of type `CreateNewCharacterVariables`:
const createNewCharacterVars: CreateNewCharacterVariables = {
  name: ..., 
  backstory: ..., 
  characterClass: ..., 
};

// Call the `createNewCharacterRef()` function to get a reference to the mutation.
const ref = createNewCharacterRef(createNewCharacterVars);
// Variables can be defined inline as well.
const ref = createNewCharacterRef({ name: ..., backstory: ..., characterClass: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewCharacterRef(dataConnect, createNewCharacterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.character_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.character_insert);
});
```

