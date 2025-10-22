"""GraphQL schema for Knowledge Graph API"""

import strawberry
from .resolvers import Query, Mutation

# Create the GraphQL schema
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation
)
