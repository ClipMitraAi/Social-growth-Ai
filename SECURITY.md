# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

The Social Growth AI team is committed to ensuring platform security and safeguarding user data. If you discover a security vulnerability, please do NOT create a public GitHub issue.

Please report vulnerabilities directly via:
- **Email**: `security@socialgrowth.ai`
- **PGP Key**: Available upon request for encrypted reports.

Please include:
1. Detailed description of the vulnerability.
2. Steps to reproduce or proof-of-concept payload.
3. Potential impact and attack vectors.

We will acknowledge receipt within 48 hours and provide updates throughout the resolution process.

## Security Practices Implemented

- **Input Sanitization & Validation**: Strict username regex patterns, URL parsers, and bounds checks.
- **SSRF Protection**: Strict domain whitelist for public profile URLs; private network addresses (`127.0.0.1`, `10.*`, `192.168.*`, `169.254.*`, `localhost`) are blocked on the server.
- **Session Security**: Cryptographically salted passwords (`crypto.scryptSync`), secure cookie flags (`HttpOnly`, `SameSite=Lax`).
- **Data Minimization & Compliance**: Users can export or permanently delete their account and associated records with zero residual storage.
- **Zero Credential Theft / No Bot Manipulation**: No automated bots, fake followers, credential scraping, or unauthorized access techniques are used or permitted.
