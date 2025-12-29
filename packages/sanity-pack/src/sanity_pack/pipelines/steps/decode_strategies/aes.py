"""AES decryption strategy for text assets."""

import json
from pathlib import Path
from typing import Optional

try:
    from Crypto.Cipher import AES
except ImportError:
    AES = None

from sanity_pack.utils.logger import log


class AESDecodeStrategy:
    """Strategy for decoding AES-CBC encrypted files."""
    
    # Arknights AES mask key
    MASK = bytes.fromhex("554954704169383270484157776e7a7148524d4377506f6e4a4c49423357436c")
    
    def __init__(self):
        if AES is None:
            raise ImportError(
                "pycryptodome is required for AES decryption. "
                "Install it with: pip install pycryptodome"
            )
    
    def decrypt_bytes(self, data: bytes, has_rsa: bool = True) -> bytes:
        """Decrypt AES-CBC encrypted data.
        
        Args:
            data: Encrypted data bytes
            has_rsa: Whether the data has an RSA header (128 bytes) to skip
            
        Returns:
            Decrypted data bytes
        """
        if has_rsa:
            data = data[128:]
        
        aes_key = self.MASK[:16]
        aes_iv = bytearray(b ^ m for b, m in zip(data[:16], self.MASK[16:]))
        cipher = AES.new(aes_key, AES.MODE_CBC, aes_iv)
        
        decrypted_padded = cipher.decrypt(data[16:])
        # Remove padding by reading the last byte which indicates padding length
        decrypted = decrypted_padded[:-decrypted_padded[-1]]
        
        return decrypted
    
    def load_json_or_bson(self, data: bytes) -> any:
        """Load JSON or BSON data.
        
        Args:
            data: Data bytes to parse
            
        Returns:
            Parsed data structure
        """
        # Check if it's BSON (BSON files typically have null bytes)
        if b"\x00" in data[:256]:
            try:
                import bson
                return bson.decode(data)
            except ImportError:
                log.warning("bson module not available, falling back to JSON")
                # Fall through to JSON parsing
        
        return json.loads(data)
    
    def decode(self, file_path: Path, has_rsa: bool = True) -> Optional[bytes]:
        """Decode an AES encrypted file.
        
        Args:
            file_path: Path to the encrypted file
            has_rsa: Whether the file has an RSA header
            
        Returns:
            Decrypted data as bytes, or None if decoding failed
        """
        try:
            with open(file_path, "rb") as f:
                data = f.read()
            
            decrypted = self.decrypt_bytes(data, has_rsa)
            
            # If it's a .lua file, return raw decrypted data
            if file_path.name.endswith('.lua.bytes'):
                log.debug(f'Decoded Lua file: "{file_path}"')
                return decrypted
            
            # Otherwise, try to parse as JSON/BSON and normalize
            try:
                result = self.load_json_or_bson(decrypted)
                return json.dumps(result, indent=4, ensure_ascii=False).encode("utf-8")
            except (json.JSONDecodeError, Exception) as e:
                log.warning(f"Failed to parse decrypted data as JSON/BSON: {e}")
                return decrypted
                
        except Exception as e:
            log.error(f'Failed to decode AES file "{file_path}": {str(e)}', exc_info=True)
            return None

