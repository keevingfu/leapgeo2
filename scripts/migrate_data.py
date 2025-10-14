#!/usr/bin/env python3
"""
GEO Platform Data Migration Script
Migrates Mock data from index.tsx to PostgreSQL

Usage: python3 migrate_data.py
"""

import psycopg2
from datetime import datetime, date

# Database connection
DB_CONFIG = {
    'host': 'localhost',
    'port': 5437,
    'database': 'claude_dev',
    'user': 'claude',
    'password': 'claude_dev_2025'
}

# Mock data from index.tsx
PROJECTS = [
    {
        'id': 'sweetnight',
        'name': 'SweetNight Mattress',
        'industry': 'Consumer Electronics - Sleep Products',
        'status': 'active',
        'citation_rate': 0.32,
        'total_prompts': 156,
        'content_published': 289,
        'description': 'GEO optimization project for SweetNight mattress brand focusing on overseas market penetration',
        'platforms': ['YouTube', 'Reddit', 'Quora', 'Medium', 'Wikipedia', 'LinkedIn', 'Twitter/X', 'Amazon', 'Official Website']
    },
    {
        'id': 'eufy',
        'name': 'Eufy Robot Vacuum',
        'industry': 'Consumer Electronics - Smart Home',
        'status': 'active',
        'citation_rate': 0.35,
        'total_prompts': 89,
        'content_published': 203,
        'description': 'GEO strategy for Eufy robot vacuum cleaners targeting smart home and pet owner segments globally',
        'platforms': ['YouTube', 'Reddit', 'Quora', 'Amazon', 'Official Website', 'Twitter/X', 'TikTok']
    },
    {
        'id': 'hisense',
        'name': 'Hisense TV',
        'industry': 'Consumer Electronics - Display',
        'status': 'active',
        'citation_rate': 0.28,
        'total_prompts': 45,
        'content_published': 127,
        'description': 'GEO project for Hisense TV products in North American market',
        'platforms': ['YouTube', 'Reddit', 'Quora', 'RTINGS']
    }
]

PROMPTS = {
    'sweetnight': [
        {'id': 1, 'text': 'best mattress for hot sleepers 2025', 'intent': 'High-Intent', 'priority': 'P0', 'score': 92, 'citation_rate': 0.35, 'status': 'active', 'platforms': ['YouTube', 'Reddit', 'Quora'], 'created_date': '2024-12-15'},
        {'id': 2, 'text': 'CoolNest vs Purple mattress comparison', 'intent': 'Comparison', 'priority': 'P0', 'score': 88, 'citation_rate': 0.31, 'status': 'active', 'platforms': ['Medium', 'YouTube', 'Reddit'], 'created_date': '2024-12-20'},
        {'id': 3, 'text': 'how to choose mattress firmness for back pain', 'intent': 'How-to', 'priority': 'P1', 'score': 85, 'citation_rate': 0.28, 'status': 'active', 'platforms': ['Quora', 'Medium'], 'created_date': '2025-01-05'},
        {'id': 4, 'text': 'SweetNight mattress review', 'intent': 'Review', 'priority': 'P0', 'score': 90, 'citation_rate': 0.33, 'status': 'active', 'platforms': ['YouTube', 'Amazon', 'Reddit'], 'created_date': '2024-11-28'},
        {'id': 5, 'text': 'cooling mattress technology explained', 'intent': 'Educational', 'priority': 'P1', 'score': 82, 'citation_rate': 0.25, 'status': 'pending', 'platforms': ['Medium', 'Official Website'], 'created_date': '2025-01-08'},
    ],
    'eufy': [
        {'id': 1, 'text': 'best robot vacuum for pet hair 2025', 'intent': 'High-Intent', 'priority': 'P0', 'score': 94, 'citation_rate': 0.38, 'status': 'active', 'platforms': ['YouTube', 'Reddit', 'Amazon'], 'created_date': '2025-01-12'},
        {'id': 2, 'text': 'Eufy X10 Pro vs Roborock S8', 'intent': 'Comparison', 'priority': 'P0', 'score': 91, 'citation_rate': 0.36, 'status': 'active', 'platforms': ['YouTube', 'Reddit'], 'created_date': '2025-01-15'},
        {'id': 3, 'text': 'how to set up multi-floor mapping', 'intent': 'How-to', 'priority': 'P1', 'score': 87, 'citation_rate': 0.29, 'status': 'active', 'platforms': ['YouTube', 'Official Website'], 'created_date': '2025-01-18'},
        {'id': 4, 'text': 'robot vacuum noise level comparison', 'intent': 'Comparison', 'priority': 'P1', 'score': 83, 'citation_rate': 0.27, 'status': 'pending', 'platforms': ['Reddit', 'Quora'], 'created_date': '2025-01-20'},
    ],
    'hisense': [
        {'id': 1, 'text': 'best 4K TV for gaming 2025', 'intent': 'High-Intent', 'priority': 'P0', 'score': 89, 'citation_rate': 0.30, 'status': 'active', 'platforms': ['YouTube', 'Reddit'], 'created_date': '2024-11-10'},
        {'id': 2, 'text': 'Hisense U8K vs Samsung QN90C', 'intent': 'Comparison', 'priority': 'P0', 'score': 92, 'citation_rate': 0.33, 'status': 'active', 'platforms': ['YouTube', 'RTINGS', 'Reddit'], 'created_date': '2024-11-15'},
    ]
}

CITATIONS = {
    'sweetnight': [
        {'platform': 'Perplexity', 'prompt': 'best cooling mattress for hot sleepers', 'source': 'SweetNight CoolNest Review - YouTube', 'position': 1, 'snippet': 'CoolNest technology provides exceptional temperature regulation...', 'detected_at': '2025-10-07 12:00:00'},
        {'platform': 'Claude', 'prompt': 'mattress for back pain relief', 'source': 'Back Pain Support Guide - Medium', 'position': 2, 'snippet': 'SweetNight L6 offers adjustable firmness for optimal spinal alignment...', 'detected_at': '2025-10-07 07:00:00'},
        {'platform': 'ChatGPT', 'prompt': 'CoolNest vs Purple mattress', 'source': 'Mattress Comparison 2025 - Reddit', 'position': 3, 'snippet': 'Both mattresses excel in cooling, but CoolNest uses advanced materials...', 'detected_at': '2025-10-06 15:00:00'},
    ],
    'eufy': [
        {'platform': 'Perplexity', 'prompt': 'best robot vacuum for pet hair', 'source': 'Eufy X10 Pro Review - YouTube', 'position': 1, 'snippet': 'Eufy X10 Pro excels at pet hair removal with 8000Pa suction...', 'detected_at': '2025-10-08 14:00:00'},
        {'platform': 'Claude', 'prompt': 'robot vacuum multi-floor mapping', 'source': 'Smart Home Setup Guide - Reddit', 'position': 2, 'snippet': "Eufy's AI mapping technology handles multiple floors seamlessly...", 'detected_at': '2025-10-08 11:00:00'},
    ],
    'hisense': [
        {'platform': 'Perplexity', 'prompt': 'best gaming TV 2025', 'source': 'Hisense U8K Gaming Review - YouTube', 'position': 2, 'snippet': 'Hisense U8K delivers exceptional 4K gaming performance...', 'detected_at': '2025-10-08 10:00:00'},
    ]
}

def connect_db():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Connected to PostgreSQL")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def migrate_projects(conn):
    """Migrate projects data"""
    cursor = conn.cursor()

    print("\n📦 Migrating projects...")
    for project in PROJECTS:
        try:
            cursor.execute("""
                INSERT INTO projects (id, name, industry, description, status, citation_rate, total_prompts, content_published)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    industry = EXCLUDED.industry,
                    description = EXCLUDED.description,
                    status = EXCLUDED.status,
                    citation_rate = EXCLUDED.citation_rate,
                    total_prompts = EXCLUDED.total_prompts,
                    content_published = EXCLUDED.content_published,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                project['id'],
                project['name'],
                project['industry'],
                project['description'],
                project['status'],
                project['citation_rate'],
                project['total_prompts'],
                project['content_published']
            ))

            # Insert project platforms
            for platform in project['platforms']:
                cursor.execute("""
                    INSERT INTO project_platforms (project_id, platform)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (project['id'], platform))

            print(f"  ✅ {project['name']}")
        except Exception as e:
            print(f"  ❌ {project['name']}: {e}")

    conn.commit()
    print(f"✅ Migrated {len(PROJECTS)} projects")

def migrate_prompts(conn):
    """Migrate prompts data"""
    cursor = conn.cursor()

    print("\n📝 Migrating prompts...")
    total_count = 0

    for project_id, prompts in PROMPTS.items():
        for prompt in prompts:
            try:
                cursor.execute("""
                    INSERT INTO prompts (project_id, text, intent, priority, score, citation_rate, status, created_date)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    project_id,
                    prompt['text'],
                    prompt['intent'],
                    prompt['priority'],
                    prompt['score'],
                    prompt['citation_rate'],
                    prompt['status'],
                    prompt['created_date']
                ))

                prompt_id = cursor.fetchone()[0]

                # Insert prompt platforms
                for platform in prompt['platforms']:
                    cursor.execute("""
                        INSERT INTO prompt_platforms (prompt_id, platform)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (prompt_id, platform))

                total_count += 1
            except Exception as e:
                print(f"  ❌ Error inserting prompt '{prompt['text'][:50]}...': {e}")

    conn.commit()
    print(f"✅ Migrated {total_count} prompts")

def migrate_citations(conn):
    """Migrate citations data"""
    cursor = conn.cursor()

    print("\n📊 Migrating citations...")
    total_count = 0

    for project_id, citations in CITATIONS.items():
        for citation in citations:
            try:
                cursor.execute("""
                    INSERT INTO citations (project_id, platform, prompt, source, position, snippet, detected_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id,
                    citation['platform'],
                    citation['prompt'],
                    citation['source'],
                    citation['position'],
                    citation['snippet'],
                    citation['detected_at']
                ))
                total_count += 1
            except Exception as e:
                print(f"  ❌ Error inserting citation: {e}")

    conn.commit()
    print(f"✅ Migrated {total_count} citations")

def verify_migration(conn):
    """Verify migration results"""
    cursor = conn.cursor()

    print("\n🔍 Verifying migration...")

    cursor.execute("SELECT COUNT(*) FROM projects")
    projects_count = cursor.fetchone()[0]
    print(f"  Projects: {projects_count}")

    cursor.execute("SELECT COUNT(*) FROM prompts")
    prompts_count = cursor.fetchone()[0]
    print(f"  Prompts: {prompts_count}")

    cursor.execute("SELECT COUNT(*) FROM citations")
    citations_count = cursor.fetchone()[0]
    print(f"  Citations: {citations_count}")

    cursor.execute("SELECT COUNT(*) FROM project_platforms")
    project_platforms_count = cursor.fetchone()[0]
    print(f"  Project Platforms: {project_platforms_count}")

    cursor.execute("SELECT COUNT(*) FROM prompt_platforms")
    prompt_platforms_count = cursor.fetchone()[0]
    print(f"  Prompt Platforms: {prompt_platforms_count}")

    return projects_count, prompts_count, citations_count

def main():
    """Main migration function"""
    print("🚀 Starting GEO Platform Data Migration\n")
    print("=" * 50)

    # Connect to database
    conn = connect_db()
    if not conn:
        return

    try:
        # Run migrations
        migrate_projects(conn)
        migrate_prompts(conn)
        migrate_citations(conn)

        # Verify
        projects, prompts, citations = verify_migration(conn)

        print("\n" + "=" * 50)
        print("✅ Migration completed successfully!")
        print(f"\n📊 Summary:")
        print(f"  • {projects} projects")
        print(f"  • {prompts} prompts")
        print(f"  • {citations} citations")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\n🔒 Database connection closed")

if __name__ == "__main__":
    main()
