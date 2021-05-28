<h1 align="center">DIY SHA-256 Hashing Algorithm</h1>
<h4 align="center">SHA-256 recreated in Node.js, based on FIPS 180-4.</h4>

---
I was curious about how SHA-256 worked under the hood. After researching it more, it seemed like a fun algorithm to try and
recreate. I explicitly chose Node as a challenge, since it's not a low-level language known for bit manipulation.

Currently, the project just works with text string input. For example:

`ts-node index.ts my super secret string`

Will produce the following hash:

`35BAD86091BB4218FAF249952B002FEC93E27B0A963F70F156F4BC311E6867D`

You can validate the hashes at https://emn178.github.io/online-tools/sha256.html


#### Wishlist of items ☑️:
1) Work with any file, not just strings
2) Unit tests
3) Cleaner code

:warning: Don't use this in production! This code has not been battle tested, and is by no means the most efficient implementation. For example,
it dynamically generates the constants every time for learning purposes, rather than the more-optimized static constants.
