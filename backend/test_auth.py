"""Test authentication directly"""
import asyncio
from sqlalchemy import text
from app.database import async_session_maker
from app.services.auth import verify_password

async def test_login():
    """Test login flow"""
    username = "admin"
    password = "password123"

    async with async_session_maker() as session:
        try:
            # Get user by username
            result = await session.execute(
                text("SELECT * FROM users WHERE username = :username"),
                {"username": username}
            )
            user = result.fetchone()

            if user:
                print(f"✓ User found: {user._mapping['username']}")
                print(f"  Email: {user._mapping['email']}")
                print(f"  Is active: {user._mapping['is_active']}")

                # Test password verification
                is_valid = verify_password(password, user._mapping['password_hash'])
                print(f"  Password valid: {is_valid}")

                if is_valid:
                    print("\n✓ Login test PASSED")
                else:
                    print("\n✗ Password verification FAILED")
            else:
                print(f"✗ User '{username}' not found")

        except Exception as e:
            print(f"✗ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_login())
