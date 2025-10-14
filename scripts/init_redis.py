#!/usr/bin/env python3
"""
GEO Platform Redis Cache Initialization
Initializes Redis cache with project statistics

Usage: python3 init_redis.py
"""

import redis
import psycopg2
import json

# Redis connection
REDIS_CONFIG = {
    'host': 'localhost',
    'port': 6382,
    'password': 'claude_redis_2025',
    'db': 0,
    'decode_responses': True
}

# PostgreSQL connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5437,
    'database': 'claude_dev',
    'user': 'claude',
    'password': 'claude_dev_2025'
}

def connect_redis():
    """Connect to Redis"""
    try:
        r = redis.Redis(**REDIS_CONFIG)
        r.ping()
        print("✅ Connected to Redis")
        return r
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return None

def connect_postgres():
    """Connect to PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to PostgreSQL")
        return conn
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return None

def cache_project_info(redis_conn, pg_conn):
    """Cache project basic information"""
    cursor = pg_conn.cursor()

    print("\n📦 Caching project information...")

    cursor.execute("""
        SELECT id, name, industry, status, citation_rate, total_prompts, content_published
        FROM projects
        WHERE id != 'test'
    """)

    projects = cursor.fetchall()

    for project in projects:
        project_id, name, industry, status, citation_rate, total_prompts, content_published = project

        # Cache project info (JSON)
        project_data = {
            'id': project_id,
            'name': name,
            'industry': industry,
            'status': status,
            'citation_rate': float(citation_rate) if citation_rate else 0,
            'total_prompts': total_prompts,
            'content_published': content_published
        }

        redis_conn.setex(
            f"geo:project:{project_id}:info",
            3600,  # 1 hour TTL
            json.dumps(project_data)
        )

        # Cache citation rate
        redis_conn.setex(
            f"geo:project:{project_id}:citation_rate",
            1800,  # 30 minutes TTL
            str(citation_rate if citation_rate else 0)
        )

        # Add to leaderboard (sorted set)
        redis_conn.zadd(
            'geo:citation_rate_leaderboard',
            {project_id: float(citation_rate) if citation_rate else 0}
        )

        print(f"  ✅ {name}: {citation_rate}")

    print(f"✅ Cached {len(projects)} projects")

def cache_platform_stats(redis_conn, pg_conn):
    """Cache platform statistics"""
    cursor = pg_conn.cursor()

    print("\n📊 Caching platform statistics...")

    # For each project, count citations by platform
    cursor.execute("""
        SELECT project_id, platform, COUNT(*) as citation_count
        FROM citations
        GROUP BY project_id, platform
    """)

    stats = cursor.fetchall()

    for project_id, platform, count in stats:
        key = f"geo:project:{project_id}:platform:{platform}:citations"
        redis_conn.setex(key, 1800, str(count))  # 30 min TTL
        print(f"  ✅ {project_id}/{platform}: {count} citations")

    print(f"✅ Cached {len(stats)} platform stats")

def cache_prompts_count(redis_conn, pg_conn):
    """Cache prompt counts"""
    cursor = pg_conn.cursor()

    print("\n📝 Caching prompt counts...")

    cursor.execute("""
        SELECT project_id, COUNT(*) as prompt_count
        FROM prompts
        GROUP BY project_id
    """)

    counts = cursor.fetchall()

    for project_id, count in counts:
        redis_conn.setex(
            f"geo:project:{project_id}:prompt_count",
            3600,  # 1 hour TTL
            str(count)
        )
        print(f"  ✅ {project_id}: {count} prompts")

    print(f"✅ Cached {len(counts)} prompt counts")

def verify_cache(redis_conn):
    """Verify cached data"""
    print("\n🔍 Verifying Redis cache...")

    # Count keys by prefix
    prefixes = [
        'geo:project:*:info',
        'geo:project:*:citation_rate',
        'geo:project:*:platform:*',
        'geo:project:*:prompt_count'
    ]

    for prefix in prefixes:
        keys = list(redis_conn.scan_iter(match=prefix))
        print(f"  {prefix}: {len(keys)} keys")

    # Show leaderboard
    print("\n🏆 Citation Rate Leaderboard:")
    leaderboard = redis_conn.zrevrange('geo:citation_rate_leaderboard', 0, -1, withscores=True)
    for rank, (project, score) in enumerate(leaderboard, 1):
        print(f"  {rank}. {project}: {score:.2%}")

def main():
    """Main initialization function"""
    print("🚀 Starting Redis Cache Initialization\n")
    print("=" * 50)

    # Connect to services
    redis_conn = connect_redis()
    pg_conn = connect_postgres()

    if not redis_conn or not pg_conn:
        print("❌ Failed to connect to required services")
        return

    try:
        # Clear existing cache (optional)
        print("\n🧹 Clearing existing cache...")
        for key in redis_conn.scan_iter(match='geo:*'):
            redis_conn.delete(key)
        print("✅ Cache cleared")

        # Initialize cache
        cache_project_info(redis_conn, pg_conn)
        cache_platform_stats(redis_conn, pg_conn)
        cache_prompts_count(redis_conn, pg_conn)

        # Verify
        verify_cache(redis_conn)

        print("\n" + "=" * 50)
        print("✅ Redis cache initialized successfully!")

    except Exception as e:
        print(f"\n❌ Initialization failed: {e}")
    finally:
        pg_conn.close()
        print("\n🔒 Connections closed")

if __name__ == "__main__":
    main()
