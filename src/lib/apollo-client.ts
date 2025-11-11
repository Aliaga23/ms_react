import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

const errorLink = onError((errorResponse: any) => {
  if (errorResponse.graphQLErrors) {
    errorResponse.graphQLErrors.forEach((error: any) => {
      console.error(`[GraphQL error]: Message: ${error.message}`)
    })
  }
  if (errorResponse.networkError) {
    console.error(`[Network error]: ${errorResponse.networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
