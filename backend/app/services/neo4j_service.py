"""Neo4j service for knowledge graph operations"""

from neo4j import GraphDatabase, Driver
from typing import List, Dict, Any
from functools import lru_cache
from ..config import get_settings

settings = get_settings()


class Neo4jService:
    """Service for interacting with Neo4j knowledge graph"""

    def __init__(self):
        self.driver: Driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )

    def close(self):
        """Close Neo4j driver connection"""
        if self.driver:
            self.driver.close()

    def get_knowledge_graph(self, project_id: str) -> Dict[str, Any]:
        """
        Get complete knowledge graph for a project

        Args:
            project_id: Project identifier

        Returns:
            Dictionary with nodes and relationships
        """
        with self.driver.session() as session:
            # Get all nodes for the project
            nodes_result = session.run("""
                MATCH (n {project_id: $project_id})
                RETURN n.id as id, labels(n)[0] as type, n.label as label
            """, project_id=project_id)

            nodes = [
                {
                    "id": record["id"],
                    "type": record["type"],
                    "label": record["label"]
                }
                for record in nodes_result
            ]

            # Get all relationships for the project
            rels_result = session.run("""
                MATCH (a {project_id: $project_id})-[r]->(b {project_id: $project_id})
                RETURN a.id as from, b.id as to, type(r) as type
            """, project_id=project_id)

            relationships = [
                {
                    "from": record["from"],
                    "to": record["to"],
                    "type": record["type"]
                }
                for record in rels_result
            ]

            return {
                "nodes": nodes,
                "relationships": relationships
            }

    def find_solutions(self, project_id: str, problem: str) -> List[Dict[str, Any]]:
        """
        Find features that solve a specific problem

        Args:
            project_id: Project identifier
            problem: Problem label to search for

        Returns:
            List of features that solve the problem
        """
        with self.driver.session() as session:
            result = session.run("""
                MATCH (pr:Problem {project_id: $project_id, label: $problem})
                      <-[:SOLVES]-(f:Feature)
                RETURN f.id as id, f.label as label
            """, project_id=project_id, problem=problem)

            return [
                {"id": record["id"], "label": record["label"]}
                for record in result
            ]

    def search_nodes(self, project_id: str, query: str) -> List[Dict[str, Any]]:
        """
        Search nodes by label (case-insensitive partial match)

        Args:
            project_id: Project identifier
            query: Search query

        Returns:
            List of matching nodes
        """
        with self.driver.session() as session:
            result = session.run("""
                MATCH (n {project_id: $project_id})
                WHERE toLower(n.label) CONTAINS toLower($query)
                RETURN n.id as id, labels(n)[0] as type, n.label as label
                LIMIT 20
            """, project_id=project_id, query=query)

            return [
                {
                    "id": record["id"],
                    "type": record["type"],
                    "label": record["label"]
                }
                for record in result
            ]

    def get_node_details(self, node_id: str, project_id: str) -> Dict[str, Any]:
        """
        Get detailed information about a specific node

        Args:
            node_id: Node identifier
            project_id: Project identifier

        Returns:
            Node details with connected nodes
        """
        with self.driver.session() as session:
            # Get node itself
            node_result = session.run("""
                MATCH (n {id: $node_id, project_id: $project_id})
                RETURN n.id as id, labels(n)[0] as type, n.label as label
            """, node_id=node_id, project_id=project_id)

            node_record = node_result.single()
            if not node_record:
                return None

            node = {
                "id": node_record["id"],
                "type": node_record["type"],
                "label": node_record["label"]
            }

            # Get connected nodes
            connected_result = session.run("""
                MATCH (n {id: $node_id, project_id: $project_id})-[r]-(connected)
                RETURN connected.id as id, labels(connected)[0] as type,
                       connected.label as label, type(r) as relationship
            """, node_id=node_id, project_id=project_id)

            connected_nodes = [
                {
                    "id": record["id"],
                    "type": record["type"],
                    "label": record["label"],
                    "relationship": record["relationship"]
                }
                for record in connected_result
            ]

            return {
                "node": node,
                "connected": connected_nodes
            }


@lru_cache()
def get_neo4j_service() -> Neo4jService:
    """Get cached Neo4j service instance"""
    return Neo4jService()
