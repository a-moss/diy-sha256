### DIY SHA256

This was a fun project I did in my spare time to recreate the SHA256 algorithm in node. Currently it only works with strings for input:
For example:

`ts-node index.ts my super secret string I want to hash`

Will produce the following hash:

``

---

:warning: Don't use this in production! This code has not been battle tested, and is by no means the most efficient implementation
