# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateNewGameSession, useListPublicGameSessions, useCreateNewCharacter, useGetMyCharacters } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateNewGameSession(createNewGameSessionVars);

const { data, isPending, isSuccess, isError, error } = useListPublicGameSessions();

const { data, isPending, isSuccess, isError, error } = useCreateNewCharacter(createNewCharacterVars);

const { data, isPending, isSuccess, isError, error } = useGetMyCharacters();

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewGameSession, listPublicGameSessions, createNewCharacter, getMyCharacters } from '@dataconnect/generated';


// Operation CreateNewGameSession:  For variables, look at type CreateNewGameSessionVars in ../index.d.ts
const { data } = await CreateNewGameSession(dataConnect, createNewGameSessionVars);

// Operation ListPublicGameSessions: 
const { data } = await ListPublicGameSessions(dataConnect);

// Operation CreateNewCharacter:  For variables, look at type CreateNewCharacterVars in ../index.d.ts
const { data } = await CreateNewCharacter(dataConnect, createNewCharacterVars);

// Operation GetMyCharacters: 
const { data } = await GetMyCharacters(dataConnect);


```