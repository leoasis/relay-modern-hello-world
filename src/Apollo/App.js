import React from "react";
import {
  ApolloClient,
  createNetworkInterface,
  ApolloProvider,
  gql,
  graphql
} from "react-apollo";

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: "http://api.githunt.com/graphql"
  })
});

function getRequestedFieldsOnly(data, selections) {
  if (Array.isArray(data)) {
    return data.map(item => getRequestedFieldsOnly(item, selections));
  }

  const newData = {};

  selections.forEach(selection => {
    const field = selection.name.value;
    if (selection.selectionSet) {
      newData[field] = getRequestedFieldsOnly(data[field], selection.selectionSet.selections);
    } else {
      newData[field] = data[field];
    }
  });

  return newData;
}

// fragmentSpec es o un fragment directo (asumimos prop `data`) o
// un objeto cuyas keys son el nombre de la prop y el value es el
// fragment
function createFragmentContainer(fragmentSpec) {

  return Component =>
    class FragmentContainer extends React.Component {
      static displayName = `FragmentContainer(${Component.displayName ||
        Component.name ||
        "Component"})`;

      static getFragment() {
        console.log(fragmentSpec);
        return fragmentSpec;
      }

      render() {
        return <Component data={getRequestedFieldsOnly(this.props.data, fragmentSpec.definitions[0].selectionSet.selections)} />;
      }
    };
}

const Feed = createFragmentContainer(gql`
  fragment Feed on Entry {
    repository {
      owner {
        login
      }
      name
      stargazers_count
    }
    postedBy {
      login
    }
  }
`)(({ data }) =>
  <ol>
    {data.map(entry =>
      <li key={`${entry.repository.owner.login}/${entry.repository.name}`}>
        {entry.repository.owner.login}/{entry.repository.name}:{" "}
        {entry.repository.stargazers_count} Stars
      </li>
    )}
  </ol>
);

const AppFeedQuery = graphql(gql`
  query AppFeedQuery {
    feed(type: TOP, limit: 5) {
      ...Feed
      score
    }
  }

  ${Feed.getFragment()}
`)(
  ({ data: { loading, error, feed } }) =>
    error
      ? <div>
          {error.message}
        </div>
      : feed ? <Feed data={feed} /> : <div>Loading</div>
);

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h2>Tiny GitHunt (Apollo)</h2>
        <h3>More info</h3>
        <ApolloProvider client={client}>
          <AppFeedQuery />
        </ApolloProvider>
        <ul>
          <li>
            <a href="http://www.githunt.com/">Full GitHunt App</a>
          </li>
          <li>
            <a href="https://github.com/stubailo/relay-modern-hello-world">
              Improve this example on GitHub
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

export default App;
