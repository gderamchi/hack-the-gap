"""
Database migration script to add new tables and columns for leaderboard functionality
"""

import sqlite3
import os

DB_PATH = 'influencer_monitor.db'

def migrate_database():
    """Add new tables and columns to existing database"""
    
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found. Creating new database...")
        import database
        database.init_db()
        print("✅ New database created with all tables")
        return
    
    print(f"Migrating existing database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if contributors table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='contributors'")
        if not cursor.fetchone():
            print("Creating contributors table...")
            cursor.execute("""
                CREATE TABLE contributors (
                    id INTEGER PRIMARY KEY,
                    username VARCHAR(100) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE,
                    total_points INTEGER DEFAULT 0,
                    analyses_count INTEGER DEFAULT 0,
                    streak_days INTEGER DEFAULT 0,
                    last_contribution_date DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("CREATE INDEX idx_total_points ON contributors(total_points)")
            cursor.execute("CREATE INDEX idx_analyses_count ON contributors(analyses_count)")
            print("✅ Contributors table created")
        else:
            print("✅ Contributors table already exists")
        
        # Check if contributor_stats table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='contributor_stats'")
        if not cursor.fetchone():
            print("Creating contributor_stats table...")
            cursor.execute("""
                CREATE TABLE contributor_stats (
                    id INTEGER PRIMARY KEY,
                    contributor_id INTEGER NOT NULL,
                    period VARCHAR(20) NOT NULL,
                    period_start DATETIME NOT NULL,
                    points_earned INTEGER DEFAULT 0,
                    analyses_count INTEGER DEFAULT 0,
                    FOREIGN KEY (contributor_id) REFERENCES contributors(id)
                )
            """)
            cursor.execute("CREATE INDEX idx_contributor_period ON contributor_stats(contributor_id, period, period_start)")
            cursor.execute("CREATE INDEX idx_period_points ON contributor_stats(period, points_earned)")
            print("✅ Contributor_stats table created")
        else:
            print("✅ Contributor_stats table already exists")
        
        # Check if analysis_history table has contributor_id column
        cursor.execute("PRAGMA table_info(analysis_history)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'contributor_id' not in columns:
            print("Adding contributor_id column to analysis_history...")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN contributor_id INTEGER")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN points_awarded INTEGER DEFAULT 10")
            cursor.execute("ALTER TABLE analysis_history ADD COLUMN quality_score FLOAT DEFAULT 1.0")
            cursor.execute("CREATE INDEX idx_contributor_date ON analysis_history(contributor_id, analyzed_at)")
            print("✅ Added new columns to analysis_history")
        else:
            print("✅ Analysis_history already has contributor columns")
        
        conn.commit()
        print("\n🎉 Database migration completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {str(e)}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
