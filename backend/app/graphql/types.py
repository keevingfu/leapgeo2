"""GraphQL types for Knowledge Graph API"""

import strawberry
from typing import List, Optional


@strawberry.type
class KnowledgeGraphNode:
    """Represents a node in the knowledge graph"""
    id: str
    type: str  # Brand, Product, Feature, Problem, Scenario, UserGroup
    label: str
    properties: Optional[str] = None  # JSON string for additional properties


@strawberry.type
class KnowledgeGraphRelationship:
    """Represents a relationship between two nodes"""
    from_node: str = strawberry.field(name="from")
    to_node: str = strawberry.field(name="to")
    type: str  # HAS_PRODUCT, HAS_FEATURE, SOLVES, APPLIES_TO, NEEDS, HAS_PROBLEM, BENEFITS


@strawberry.type
class KnowledgeGraph:
    """Complete knowledge graph for a project"""
    nodes: List[KnowledgeGraphNode]
    relationships: List[KnowledgeGraphRelationship]


@strawberry.type
class NodeDetails:
    """Detailed information about a specific node"""
    node: KnowledgeGraphNode
    connected: List[KnowledgeGraphNode]


@strawberry.type
class Feature:
    """Feature node type"""
    id: str
    label: str


@strawberry.type
class SearchResult:
    """Search result for nodes"""
    nodes: List[KnowledgeGraphNode]
    total: int
