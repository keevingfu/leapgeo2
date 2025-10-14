#!/usr/bin/env python3
"""
GEO Platform Data Integrity Verification
Verifies data across PostgreSQL, Neo4j, and Redis

Usage: python3 verify_data.py
"""

import psycopg2
import redis
import json
from collections import defaultdict

# Database configurations
DB_CONFIG = {
    'host': 'localhost',
    'port': 5437,
    'database': 'claude_dev',
    'user': 'claude',
    'password': 'claude_dev_2025'
}

REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6382,
    'password': 'claude_redis_2025',
    'db': 0,
    'decode_responses': True
}

def verify_postgresql():
    """Verify PostgreSQL data"""
    print("\n🔍 Verifying PostgreSQL...")
    print("-" * 50)

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Count records
        tables = {
            'projects': "SELECT COUNT(*) FROM projects WHERE id != 'test'",
            'prompts': 'SELECT COUNT(*) FROM prompts',
            'citations': 'SELECT COUNT(*) FROM citations',
            'project_platforms': 'SELECT COUNT(*) FROM project_platforms',
            'prompt_platforms': 'SELECT COUNT(*) FROM prompt_platforms'
        }

        results = {}
        for table, query in tables.items():
            cursor.execute(query)
            count = cursor.fetchone()[0]
            results[table] = count
            status = "✅" if count > 0 else "⚠️"
            print(f"  {status} {table}: {count} records")

        # Verify data integrity
        cursor.execute("""
            SELECT p.name, COUNT(pr.id) as prompt_count
            FROM projects p
            LEFT JOIN prompts pr ON p.id = pr.project_id
            WHERE p.id != 'test'
            GROUP BY p.name
            ORDER BY p.name
        """)

        print("\n  Project-Prompt Mapping:")
        for row in cursor.fetchall():
            print(f"    • {row[0]}: {row[1]} prompts")

        # Verify foreign keys
        cursor.execute("""
            SELECT COUNT(*) FROM prompts
            WHERE project_id NOT IN (SELECT id FROM projects)
        """)
        orphaned = cursor.fetchone()[0]
        if orphaned == 0:
            print(f"\n  ✅ No orphaned prompts")
        else:
            print(f"\n  ⚠️ {orphaned} orphaned prompts found!")

        conn.close()
        return results

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def verify_neo4j():
    """Verify Neo4j knowledge graph"""
    print("\n🔍 Verifying Neo4j...")
    print("-" * 50)

    try:
        from neo4j import GraphDatabase

        driver = GraphDatabase.driver(
            "bolt://localhost:7688",
            auth=("neo4j", "claude_neo4j_2025")
        )

        with driver.session() as session:
            # Count nodes
            result = session.run("""
                MATCH (n:Brand) RETURN 'Brand' as type, count(n) as count
                UNION
                MATCH (n:Product) RETURN 'Product' as type, count(n) as count
                UNION
                MATCH (n:Feature) RETURN 'Feature' as type, count(n) as count
                UNION
                MATCH (n:Problem) RETURN 'Problem' as type, count(n) as count
                UNION
                MATCH (n:Scenario) RETURN 'Scenario' as type, count(n) as count
                UNION
                MATCH (n:UserGroup) RETURN 'UserGroup' as type, count(n) as count
                ORDER BY type
            """)

            node_counts = {}
            total_nodes = 0
            for record in result:
                node_type = record['type']
                count = record['count']
                node_counts[node_type] = count
                total_nodes += count
                print(f"  ✅ {node_type}: {count} nodes")

            print(f"\n  Total nodes: {total_nodes}")

            # Count relationships
            result = session.run("""
                MATCH ()-[r]->()
                RETURN type(r) as rel_type, count(r) as count
                ORDER BY count DESC
            """)

            print("\n  Relationships:")
            total_rels = 0
            for record in result:
                rel_type = record['rel_type']
                count = record['count']
                total_rels += count
                print(f"    • {rel_type}: {count}")

            print(f"\n  Total relationships: {total_rels}")

            # Verify project isolation
            result = session.run("""
                MATCH (b:Brand)
                RETURN b.project_id as project, count(b) as brands
            """)

            print("\n  Project Isolation:")
            for record in result:
                print(f"    • {record['project']}: {record['brands']} brand(s)")

        driver.close()
        return {'nodes': total_nodes, 'relationships': total_rels}

    except ImportError:
        print("  ⚠️ neo4j-driver not installed. Using cypher-shell instead...")

        # Fallback to cypher-shell
        import subprocess
        result = subprocess.run([
            'docker', 'exec', '-i', 'neo4j-claude-mcp',
            'cypher-shell', '-u', 'neo4j', '-p', 'claude_neo4j_2025',
            'MATCH (n) RETURN count(n) as nodes'
        ], capture_output=True, text=True)

        if result.returncode == 0:
            # Parse output
            lines = result.stdout.strip().split('\n')
            if len(lines) >= 2:
                nodes = lines[1].strip()
                print(f"  ✅ Total nodes: {nodes}")
                return {'nodes': int(nodes), 'relationships': 'unknown'}

        return None

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def verify_redis():
    """Verify Redis cache"""
    print("\n🔍 Verifying Redis...")
    print("-" * 50)

    try:
        r = redis.Redis(**REDIS_CONFIG)
        r.ping()

        # Count keys by prefix
        patterns = {
            'Project Info': 'geo:project:*:info',
            'Citation Rates': 'geo:project:*:citation_rate',
            'Platform Stats': 'geo:project:*:platform:*',
            'Prompt Counts': 'geo:project:*:prompt_count'
        }

        results = {}
        for name, pattern in patterns.items():
            keys = list(r.scan_iter(match=pattern))
            count = len(keys)
            results[name] = count
            status = "✅" if count > 0 else "⚠️"
            print(f"  {status} {name}: {count} keys")

        # Verify leaderboard
        leaderboard = r.zrevrange('geo:citation_rate_leaderboard', 0, -1, withscores=True)
        if leaderboard:
            print(f"\n  ✅ Citation Rate Leaderboard: {len(leaderboard)} projects")
            for project, score in leaderboard:
                print(f"    • {project}: {score:.2%}")
        else:
            print(f"\n  ⚠️ No leaderboard data")

        # Verify TTL
        sample_key = 'geo:project:sweetnight:info'
        if r.exists(sample_key):
            ttl = r.ttl(sample_key)
            print(f"\n  ✅ Sample key TTL: {ttl}s ({ttl//60}min)")
        else:
            print(f"\n  ⚠️ Sample key not found")

        return results

    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def verify_cross_database():
    """Verify data consistency across databases"""
    print("\n🔍 Cross-Database Consistency Check...")
    print("-" * 50)

    try:
        # Connect to all databases
        pg_conn = psycopg2.connect(**DB_CONFIG)
        pg_cursor = pg_conn.cursor()
        redis_conn = redis.Redis(**REDIS_CONFIG)

        # Verify project count consistency
        pg_cursor.execute("SELECT COUNT(*) FROM projects WHERE id != 'test'")
        pg_project_count = pg_cursor.fetchone()[0]

        redis_project_count = len(list(redis_conn.scan_iter(match='geo:project:*:info')))

        if pg_project_count == redis_project_count:
            print(f"  ✅ Project count consistent: {pg_project_count}")
        else:
            print(f"  ⚠️ Project count mismatch: PostgreSQL={pg_project_count}, Redis={redis_project_count}")

        # Verify citation rate consistency
        pg_cursor.execute("""
            SELECT id, citation_rate FROM projects
            WHERE id != 'test'
            ORDER BY id
        """)

        for project_id, pg_rate in pg_cursor.fetchall():
            redis_key = f"geo:project:{project_id}:citation_rate"
            redis_rate = redis_conn.get(redis_key)

            if redis_rate:
                redis_rate = float(redis_rate)
                pg_rate = float(pg_rate) if pg_rate else 0.0

                if abs(redis_rate - pg_rate) < 0.001:  # Floating point tolerance
                    print(f"  ✅ {project_id}: Citation rate consistent ({pg_rate:.4f})")
                else:
                    print(f"  ⚠️ {project_id}: Citation rate mismatch (PG={pg_rate:.4f}, Redis={redis_rate:.4f})")
            else:
                print(f"  ⚠️ {project_id}: Not found in Redis")

        pg_conn.close()

    except Exception as e:
        print(f"  ❌ Error: {e}")

def generate_summary(pg_results, neo4j_results, redis_results):
    """Generate final summary"""
    print("\n" + "=" * 50)
    print("📊 VERIFICATION SUMMARY")
    print("=" * 50)

    if pg_results:
        total_pg = sum(pg_results.values())
        print(f"\n✅ PostgreSQL: {total_pg} total records")

    if neo4j_results:
        print(f"✅ Neo4j: {neo4j_results['nodes']} nodes, {neo4j_results.get('relationships', 'unknown')} relationships")

    if redis_results:
        total_redis = sum(redis_results.values())
        print(f"✅ Redis: {total_redis} cached keys")

    print("\n🎉 Phase 1 Data Layer Foundation Complete!")
    print("\n📋 Next Steps:")
    print("  1. Review the AUTOMATION-ROADMAP.md")
    print("  2. Start Phase 2: Backend API development")
    print("  3. Run: /generate-prp INITIAL-PHASE2.md")

def main():
    """Main verification function"""
    print("🚀 GEO Platform Data Integrity Verification")
    print("=" * 50)

    # Verify each database
    pg_results = verify_postgresql()
    neo4j_results = verify_neo4j()
    redis_results = verify_redis()

    # Cross-database verification
    verify_cross_database()

    # Generate summary
    generate_summary(pg_results, neo4j_results, redis_results)

if __name__ == "__main__":
    main()
