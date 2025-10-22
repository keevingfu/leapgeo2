"""GraphQL resolvers for Knowledge Graph API"""

import strawberry
from typing import List, Optional

from ..services.neo4j_service import get_neo4j_service
from .types import (
    KnowledgeGraph,
    KnowledgeGraphNode,
    KnowledgeGraphRelationship,
    NodeDetails,
    Feature,
    SearchResult
)


def _convert_node_to_graphql(node: dict) -> KnowledgeGraphNode:
    """Convert Neo4j node dict to GraphQL type"""
    return KnowledgeGraphNode(
        id=node.get("id", ""),
        type=node.get("type", ""),
        label=node.get("label", ""),
        properties=node.get("properties")
    )


def _convert_relationship_to_graphql(rel: dict) -> KnowledgeGraphRelationship:
    """Convert Neo4j relationship dict to GraphQL type"""
    return KnowledgeGraphRelationship(
        from_node=rel.get("from", ""),
        to_node=rel.get("to", ""),
        type=rel.get("type", "")
    )


@strawberry.type
class Query:
    """GraphQL Query resolvers"""

    @strawberry.field
    def get_knowledge_graph(
        self,
        project_id: str
    ) -> KnowledgeGraph:
        """
        Get complete knowledge graph for a project

        Args:
            project_id: Project identifier (e.g., 'sweetnight', 'eufy', 'hisense')

        Returns:
            Complete knowledge graph with nodes and relationships
        """
        neo4j_service = get_neo4j_service()
        data = neo4j_service.get_knowledge_graph(project_id)

        nodes = [_convert_node_to_graphql(node) for node in data.get("nodes", [])]
        relationships = [
            _convert_relationship_to_graphql(rel)
            for rel in data.get("relationships", [])
        ]

        return KnowledgeGraph(nodes=nodes, relationships=relationships)

    @strawberry.field
    def search_nodes(
        self,
        project_id: str,
        query: str
    ) -> SearchResult:
        """
        Search nodes by label (case-insensitive partial match)

        Args:
            project_id: Project identifier
            query: Search query string

        Returns:
            Search results with matching nodes and total count
        """
        neo4j_service = get_neo4j_service()
        results = neo4j_service.search_nodes(project_id, query)
        nodes = [_convert_node_to_graphql(node) for node in results]

        return SearchResult(nodes=nodes, total=len(nodes))

    @strawberry.field
    def get_node_details(
        self,
        node_id: str,
        project_id: str
    ) -> Optional[NodeDetails]:
        """
        Get detailed information about a specific node

        Args:
            node_id: Node identifier
            project_id: Project identifier

        Returns:
            Node details with connected nodes, or None if not found
        """
        neo4j_service = get_neo4j_service()
        data = neo4j_service.get_node_details(node_id, project_id)

        if not data or "node" not in data:
            return None

        node = _convert_node_to_graphql(data["node"])
        connected = [
            _convert_node_to_graphql(n)
            for n in data.get("connected", [])
        ]

        return NodeDetails(node=node, connected=connected)

    @strawberry.field
    def find_solutions(
        self,
        project_id: str,
        problem: str
    ) -> List[Feature]:
        """
        Find features that solve a specific problem

        Args:
            project_id: Project identifier
            problem: Problem description

        Returns:
            List of features that solve the problem
        """
        neo4j_service = get_neo4j_service()
        results = neo4j_service.find_solutions(project_id, problem)

        features = [
            Feature(id=feature.get("id", ""), label=feature.get("label", ""))
            for feature in results
        ]

        return features

    @strawberry.field
    def get_all_brands(
        self,
        project_id: str
    ) -> List[KnowledgeGraphNode]:
        """
        Get all brand nodes for a project

        Args:
            project_id: Project identifier

        Returns:
            List of brand nodes
        """
        neo4j_service = get_neo4j_service()
        data = neo4j_service.get_knowledge_graph(project_id)
        nodes = data.get("nodes", [])

        # Filter for Brand type nodes
        brand_nodes = [
            _convert_node_to_graphql(node)
            for node in nodes
            if node.get("type") == "Brand"
        ]

        return brand_nodes

    @strawberry.field
    def get_products_by_brand(
        self,
        project_id: str,
        brand_id: str
    ) -> List[KnowledgeGraphNode]:
        """
        Get all products for a specific brand

        Args:
            project_id: Project identifier
            brand_id: Brand node identifier

        Returns:
            List of product nodes
        """
        neo4j_service = get_neo4j_service()
        data = neo4j_service.get_knowledge_graph(project_id)
        nodes = {node.get("id"): node for node in data.get("nodes", [])}
        relationships = data.get("relationships", [])

        # Find products connected to the brand via HAS_PRODUCT relationship
        product_ids = [
            rel.get("to")
            for rel in relationships
            if rel.get("from") == brand_id and rel.get("type") == "HAS_PRODUCT"
        ]

        products = [
            _convert_node_to_graphql(nodes[pid])
            for pid in product_ids
            if pid in nodes
        ]

        return products


@strawberry.type
class Mutation:
    """GraphQL Mutation resolvers (placeholder for future implementation)"""

    @strawberry.field
    def create_brand(
        self,
        project_id: str,
        brand_id: str,
        brand_name: str
    ) -> KnowledgeGraphNode:
        """
        Create a new brand node (placeholder)

        TODO: Implement Neo4j write operations
        """
        # Placeholder - will implement when Neo4j write operations are added
        return KnowledgeGraphNode(
            id=brand_id,
            type="Brand",
            label=brand_name,
            properties=None
        )

    @strawberry.field
    def link_product(
        self,
        project_id: str,
        brand_id: str,
        product_id: str
    ) -> KnowledgeGraphRelationship:
        """
        Link a product to a brand (placeholder)

        TODO: Implement Neo4j write operations
        """
        # Placeholder - will implement when Neo4j write operations are added
        return KnowledgeGraphRelationship(
            from_node=brand_id,
            to_node=product_id,
            type="HAS_PRODUCT"
        )
