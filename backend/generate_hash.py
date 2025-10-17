"""Generate password hash for testing"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "password123"
hash1 = pwd_context.hash(password)
hash2 = pwd_context.hash(password)

print(f"Password: {password}")
print(f"Hash 1: {hash1}")
print(f"Hash 2: {hash2}")
print(f"\nVerify hash1: {pwd_context.verify(password, hash1)}")
print(f"Verify hash2: {pwd_context.verify(password, hash2)}")
