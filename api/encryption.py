"""
AES-256 encryption for sensitive values stored in the database (API keys, etc.).
Uses Fernet symmetric encryption from the cryptography library.
ENCRYPTION_KEY must be a URL-safe base64-encoded 32-byte key.
Generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
"""

import base64
from cryptography.fernet import Fernet
from api.config import get_settings


def _get_fernet() -> Fernet:
    settings = get_settings()
    key = settings.encryption_key
    if not key:
        # Use a stable dev-only key when ENCRYPTION_KEY is not set
        key = "ZmFrZWtleWZvcmRldm9ubHl0aGlzaXNub3RzZWN1cmU="
    # Ensure it's valid base64 Fernet key
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_value(plaintext: str) -> str:
    """Encrypt a string value. Returns base64-encoded ciphertext."""
    f = _get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Decrypt a base64-encoded ciphertext. Returns plaintext."""
    f = _get_fernet()
    return f.decrypt(ciphertext.encode()).decode()


def mask_key(key: str) -> str:
    """Return a masked version of an API key, e.g. 'sk-ant-...7xB2'."""
    if len(key) <= 8:
        return "•" * len(key)
    return key[:6] + "..." + key[-4:]
