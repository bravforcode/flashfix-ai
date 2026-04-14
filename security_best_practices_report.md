# Security Best Practices Report

## Executive Summary

ตรวจเชิงระบบของโปรเจ็กต์นี้พบช่องโหว่/จุดเสี่ยงที่ยืนยันได้ 4 รายการ และแก้ครบทั้งหมดในรอบนี้แล้ว พร้อมเพิ่ม regression tests ครอบไว้แล้ว

- `npm audit --json` ไม่พบ dependency vulnerability
- browser flow หลักผ่าน: home -> quiz -> solution -> teach-back -> flashcards -> mastery
- file upload flow ผ่านสำหรับ PNG และปฏิเสธ SVG ตามสเปกใหม่
- dev AI proxy ไม่ล้มอีกเมื่อได้รับ malformed JSON หรือ oversized payload

ยังเหลือ residual risk ระดับ deployment: HTTP-only security headers บางรายการยังต้องยืนยันที่ hosting/edge runtime

## High

### FF-001 Resolved: malformed `/api/ai` payload สามารถทำให้ Vite dev proxy ตายทั้ง process

- Severity: High
- Location: [server/dev-ai-proxy.ts](./server/dev-ai-proxy.ts) lines 29-119
- Evidence: current hardening แยกการอ่าน body, parse JSON, และ mapping error เป็น `400/413` แทนการปล่อย exception หลุด
- Impact: request body ที่ไม่เป็น JSON หรือใหญ่เกิน limit เคยทำให้ dev proxy ปิด connection ผิดรูปแบบและทำให้ dev server ใช้งานต่อไม่ได้
- Fix: ย้าย logic ไป `server/dev-ai-proxy.ts`, เพิ่ม guard สำหรับ invalid JSON / oversized body / read error และตอบ JSON error อย่างมีสถานะที่ถูกต้อง
- Mitigation: regression tests ใน [server/dev-ai-proxy.test.ts](./server/dev-ai-proxy.test.ts)
- False positive notes: กระทบ dev proxy boundary โดยตรง ไม่ใช่แค่ warning เชิงโค้ด

## Medium

### FF-002 Resolved: server-side API key resolution รับค่า `VITE_*` ที่เป็น public client env มาใช้เป็น secret fallback

- Severity: Medium
- Location: [server/ai-handler.mjs](./server/ai-handler.mjs) lines 96-111
- Evidence: current code ใช้เฉพาะ `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`; ไม่ fallback ไป `VITE_*` แล้ว
- Impact: การ fallback ไป `VITE_*` ทำให้ทีมสามารถเผลอใส่ secret ลง client bundle ได้โดยคิดว่า server จะอ่านแทน
- Fix: ตัด `VITE_*` fallback ออกจาก `resolveApiKey`
- Mitigation: regression tests ใน [server/ai-handler.test.ts](./server/ai-handler.test.ts)
- False positive notes: ไม่ได้หมายความว่า repo นี้รั่ว secret อยู่แล้ว แต่เป็น misconfiguration path ที่ควรถูกปิด

### FF-003 Resolved: file upload validator รับ `image/*` กว้างเกินสเปกและยอมให้ SVG/GIF ผ่านได้

- Severity: Medium
- Location: [src/features/file-processing/file-extraction.ts](./src/features/file-processing/file-extraction.ts) lines 1-69, [src/features/file-processing/FileUpload.tsx](./src/features/file-processing/FileUpload.tsx) lines 116-121
- Evidence: current code allowlist เฉพาะ `image/png`, `image/jpeg`, `image/webp` และ `accept` ใน input ถูก tighten ตามนั้น
- Impact: ผู้ใช้สามารถอัปโหลดไฟล์ image subtype ที่ระบบไม่ได้ตั้งใจรองรับ เช่น SVG ซึ่งมี semantics ต่างจาก raster image และเปิดทางให้เกิด behavior แปลกหรือ policy drift กับข้อความใน UI
- Fix: เพิ่ม MIME/extension allowlist ที่ตรงกับสเปก และ block SVG/GIF
- Mitigation: regression tests ใน [src/features/file-processing/file-extraction.test.ts](./src/features/file-processing/file-extraction.test.ts)
- False positive notes: ใน flow ปัจจุบันไฟล์ไม่ได้ถูก render กลับเป็น SVG บนหน้าเว็บ แต่การยอมรับไฟล์เกินสเปกยังเป็น input-boundary bug ที่ควรปิด

### FF-004 Resolved: `MathText` ใช้ HTML sink กับ plain text จาก AI/ผู้ใช้โดยไม่จำเป็น

- Severity: Medium
- Location: [src/shared/components/math/MathText.tsx](./src/shared/components/math/MathText.tsx) lines 25-46
- Evidence: current code render plain text ด้วย text nodes (`<span>{part}</span>`) และเหลือ `dangerouslySetInnerHTML` เฉพาะ KaTeX output ที่มาจาก renderer
- Impact: แม้ของเดิม sanitize แล้ว แต่ยังเปิด surface ของ HTML injection sink กับข้อความทั่วไปเกินจำเป็น
- Fix: ตัด `dangerouslySetInnerHTML` ออกจาก plain text path
- Mitigation: regression tests ใน [src/shared/components/math/MathText.test.tsx](./src/shared/components/math/MathText.test.tsx)
- False positive notes: จุดนี้เป็น hardening ลด attack surface มากกว่าการแก้ exploit ที่ยืนยันแล้วใน production

## Residual Risks

### FF-005 Open: ยังต้องยืนยัน HTTP-only security headers ที่ deployment layer

- Severity: Medium
- Location: [index.html](./index.html) lines 3-18
- Evidence: app shell ตอนนี้มี meta CSP และ referrer policy ใน repo แล้ว แต่ `frame-ancestors`, `X-Frame-Options`, `X-Content-Type-Options` และ header-level CSP enforcement ยังตรวจไม่ได้จาก workspace นี้
- Impact: meta CSP ช่วยลด risk ได้ส่วนหนึ่ง แต่ browser defense บางรายการบังคับได้สมบูรณ์กว่าผ่าน response headers เท่านั้น
- Fix: ยืนยัน response headers จริงใน environment ที่ deploy แล้ว โดยตั้งอย่างน้อย header-level `Content-Security-Policy`, `X-Frame-Options` หรือ `frame-ancestors`, `Referrer-Policy`, `X-Content-Type-Options`
- Mitigation: verify ผ่าน runtime response headers ของ environment จริง
- False positive notes: อาจถูกตั้งที่ CDN / reverse proxy / platform config อยู่แล้ว แต่ workspace นี้ยืนยันไม่ได้

## Verification Performed

- `npm run test -- --run`
- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm audit --json`
- Browser checks with Playwright MCP:
  - first-run onboarding + PDPA acceptance
  - desktop and mobile navigation
  - quiz -> solution -> teach-back -> flashcards -> mastery
  - AI assistant request/response rendering
  - PNG upload success
  - SVG upload rejection
  - malformed `/api/ai` -> `400`
  - oversized `/api/ai` -> `413`
