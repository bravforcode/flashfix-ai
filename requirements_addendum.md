# FlashFix AI — Requirements Addendum (Gap-Fix Edition)

## เพิ่มเติมจาก Gap Analysis: 11 Critical + High Gaps + Medium Enhancements

> เอกสารนี้เพิ่มเติมเข้าไปใน requirements.md เดิม ครอบคลุม **55 gaps** ที่ขาดหายไป
> แบ่งเป็น Phase 11–18 และการอัปเดต Phase 1–10 ที่มีอยู่เดิม

---

## อัปเดต Phase 1: Code Structure Refactoring

### Requirement 1.11: Design Token System (เพิ่มใหม่ — Gap 🟡 High)

**User Story:** ในฐานะนักพัฒนาและนักออกแบบ ฉันต้องการระบบ design tokens ที่เป็นแหล่งความจริงเดียว (single source of truth) สำหรับทุกค่าภาพ เพื่อให้การปรับธีมและ dark mode ทำได้โดยไม่ต้องแตะ component code

#### Acceptance Criteria

1. THE Design_Token_System SHALL กำหนด color palette ครบถ้วนใน CSS custom properties บน `:root`
2. WHEN token ถูกใช้งาน THE System SHALL อ้างอิง `var(--token-name)` เสมอ ไม่ใช้ hardcoded hex values
3. THE Design_Token_System SHALL มี semantic color tokens (--color-primary, --color-success, --color-warning, --color-error, --color-surface, --color-on-surface)
4. WHEN dark mode ถูกเปิดใช้งาน THE System SHALL override tokens ผ่าน `[data-theme="dark"]` selector
5. THE Design_Token_System SHALL มี spacing scale แบบ 4px base (--space-1: 4px, --space-2: 8px, --space-3: 12px, ... --space-16: 64px)
6. WHEN component ต้องการ spacing THE System SHALL ใช้ spacing token แทนค่า pixel โดยตรง
7. THE Design_Token_System SHALL มี typography scale (--text-xs: 12px, --text-sm: 14px, --text-base: 16px, --text-lg: 18px, --text-xl: 20px, --text-2xl: 24px, --text-3xl: 30px)
8. WHEN text ถูก render THE System SHALL ใช้ typography token เสมอ
9. THE Design_Token_System SHALL มี border-radius scale (--radius-sm: 4px, --radius-md: 8px, --radius-lg: 12px, --radius-xl: 16px, --radius-full: 9999px)
10. WHEN element มี rounded corners THE System SHALL ใช้ radius token
11. THE Design_Token_System SHALL มี z-index scale (--z-dropdown: 100, --z-sticky: 200, --z-modal: 300, --z-toast: 400, --z-tooltip: 500)
12. WHEN element ต้องการ z-index THE System SHALL ใช้ z-index token เพื่อป้องกัน z-index wars
13. THE Design_Token_System SHALL มี shadow scale (--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl)
14. WHEN element ต้องการ box-shadow THE System SHALL ใช้ shadow token
15. THE Design_Token_System SHALL มี topic color tokens สำหรับทุก 8 หัวข้อคณิตศาสตร์ (--color-topic-calculus, --color-topic-integral, ...)
16. WHEN topic card ถูก render THE System SHALL ใช้ topic color token ที่สอดคล้อง
17. THE Design_Token_System SHALL export tokens เป็น TypeScript constants ด้วย
18. WHEN developer ต้องการใช้ token ใน JS logic THE System SHALL import จาก `src/constants/tokens.ts`
19. THE Design_Token_System SHALL มี animation duration tokens (--duration-fast: 100ms, --duration-base: 200ms, --duration-slow: 300ms, --duration-3d: 500ms)
20. WHEN animation ถูกสร้าง THE System SHALL ใช้ duration token และ respect `prefers-reduced-motion`

---

### Requirement 1.12: Dark Mode Implementation (เพิ่มใหม่ — Gap 🟡 High)

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ dark mode ที่ใช้งานจริงได้ ไม่ใช่แค่ invert colors เพื่อลดความเมื่อยล้าของสายตาเมื่อใช้งานตอนกลางคืน

#### Acceptance Criteria

1. THE Theme_Manager SHALL ตรวจจับ `prefers-color-scheme` ของ OS โดยอัตโนมัติเมื่อเข้าใช้ครั้งแรก
2. WHEN user เปิดแอปครั้งแรก THE System SHALL ใช้ OS theme preference
3. THE Theme_Manager SHALL มี toggle button ใน AppHeader ให้ switch ระหว่าง light/dark
4. WHEN user คลิก toggle THE System SHALL switch theme ทันทีโดยไม่มี flash
5. THE Theme_Manager SHALL persist theme preference ใน localStorage (`flashfix_theme`)
6. WHEN user กลับมาใช้งาน THE System SHALL restore theme ที่เลือกไว้
7. THE Dark_Mode SHALL มี dark color tokens ที่ไม่ใช่แค่ invert ของ light mode
8. WHEN dark mode active THE System SHALL ใช้ dark-specific backgrounds เช่น `#0f172a` (base), `#1e293b` (surface), `#334155` (elevated)
9. THE Dark_Mode SHALL ทดสอบ contrast ratios ทุก topic colors ใน dark mode
10. WHEN dark mode active THE System SHALL ยืนยันว่า contrast ratio >= 4.5:1 สำหรับ text ทุกสี
11. THE Dark_Mode SHALL ปรับ 3D flashcard flip animation ให้เหมาะกับ dark background
12. WHEN flashcard flip ใน dark mode THE System SHALL ใช้ appropriate shadow และ border ที่ visible
13. THE Dark_Mode SHALL ปรับ chart/progress bar colors ให้ readable ใน dark background
14. WHEN mastery progress bars แสดงใน dark mode THE System SHALL ใช้ higher luminance colors
15. THE Theme_Manager SHALL prevent FOUC (Flash of Unstyled Content)
16. WHEN page โหลด THE System SHALL apply theme ก่อน paint ด้วย inline script ใน `<head>`
17. THE Dark_Mode SHALL รองรับ `forced-colors` media query (Windows High Contrast)
18. WHEN forced-colors active THE System SHALL ยังใช้งานได้
19. THE Dark_Mode SHALL test ด้วย automated tools (axe สำหรับ contrast)
20. WHEN CI รัน THE System SHALL test ทั้ง light และ dark mode

---

### Requirement 1.13: IndexedDB Schema และ Migration System (เพิ่มใหม่ — Gap 🟡 High)

**User Story:** ในฐานะระบบ ฉันต้องการ IndexedDB schema ที่ชัดเจนและมี migration strategy เพื่อรองรับการเปลี่ยน data format ในอนาคตโดยไม่ทำให้ข้อมูลผู้ใช้สูญหาย

#### Acceptance Criteria

1. THE Database_Layer SHALL มี IndexedDB database ชื่อ `flashfix_db` เวอร์ชัน 1
2. WHEN database ถูกเปิด THE System SHALL check version และ run migrations ตามลำดับ
3. THE Database_Layer SHALL มี object store `ai_cache` พร้อม schema: `{key: string (keyPath), prompt_hash: string, response: string, created_at: number, ttl: number}`
4. WHEN AI response ถูกรับ THE System SHALL cache ใน `ai_cache` ด้วย TTL 24 ชั่วโมง
5. THE Database_Layer SHALL มี object store `learning_history` พร้อม schema: `{id: string (keyPath, auto-generated UUID), type: HistoryType, data: object, timestamp: number, topic?: string}`
6. WHEN history entry ถูกบันทึก THE System SHALL assign UUID และ timestamp อัตโนมัติ
7. THE Database_Layer SHALL มี object store `mastery_scores` พร้อม schema: `{topic_id: string (keyPath), score: number, updated_at: number, activity_count: number}`
8. WHEN mastery score เปลี่ยน THE System SHALL update `updated_at` timestamp ด้วย
9. THE Database_Layer SHALL มี index บน `learning_history.timestamp` สำหรับ range queries
10. WHEN ดึง history ตาม date range THE System SHALL ใช้ index แทน full scan
11. THE Database_Layer SHALL มี index บน `ai_cache.prompt_hash` สำหรับ lookup
12. WHEN ค้นหา cached response THE System SHALL ใช้ hash lookup ใน O(log n)
13. THE Database_Layer SHALL expire cache entries ที่เกิน TTL อัตโนมัติ
14. WHEN `ai_cache` entry ถูก read THE System SHALL check TTL และลบถ้าหมดอายุ
15. THE Database_Layer SHALL มี `db_meta` object store เก็บ `{key: 'schema_version', value: number}`
16. WHEN application เริ่มต้น THE System SHALL read schema version และ decide migration path
17. THE Database_Layer SHALL implement migration v1→v2 เมื่อ schema เปลี่ยน
18. WHEN user อัปเดตแอปและ schema เปลี่ยน THE System SHALL migrate data โดย user ไม่สูญเสียข้อมูล
19. THE Database_Layer SHALL fallback ไปยัง localStorage ถ้า IndexedDB ไม่รองรับ
20. WHEN `indexedDB` ไม่มีใน environment THE System SHALL gracefully fallback และ log warning

---

### Requirement 1.14: Browser และ Device Support Matrix (เพิ่มใหม่ — Gap 🟡 High)

**User Story:** ในฐานะทีมพัฒนา ฉันต้องการกำหนด browser และ device ที่รองรับอย่างชัดเจน เพื่อให้การตัดสินใจ polyfill และ CSS property ทำได้อย่างมีหลักการ

#### Acceptance Criteria

1. THE System SHALL กำหนด Tier 1 browsers (fully supported, tested every PR): Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
2. WHEN feature ถูกพัฒนา THE System SHALL test ใน Tier 1 browsers ทั้งหมด
3. THE System SHALL กำหนด Tier 2 browsers (best effort, tested monthly): Chrome for Android 90+, Safari iOS 14+, Samsung Internet 14+
4. WHEN bug report มาจาก Tier 2 browser THE System SHALL investigate และแก้ถ้า feasible
5. THE System SHALL document minimum OS support: Windows 10+, macOS 11+, iOS 14+, Android 10+
6. WHEN CSS property ถูกใช้ THE System SHALL verify ว่า supported ใน Tier 1 browsers ผ่าน caniuse.com
7. THE System SHALL กำหนด minimum screen size: 320px width (mobile), 768px (tablet), 1024px (desktop)
8. WHEN layout ถูกออกแบบ THE System SHALL ทดสอบที่ 320px ก่อนเป็นลำดับแรก
9. THE System SHALL ระบุ unsupported browsers ชัดเจน: IE 11 (ไม่รองรับ)
10. WHEN IE 11 เข้าใช้งาน THE System SHALL แสดง unsupported browser message
11. THE System SHALL configure Browserslist ใน `.browserslistrc` ให้ match กับ support matrix
12. WHEN PostCSS / Autoprefixer ทำงาน THE System SHALL generate prefixes ตาม browserslist
13. THE System SHALL test 3D CSS transform (flashcard flip) ใน Tier 1 mobile browsers
14. WHEN flashcard flip ทำงานบน mobile THE System SHALL ใช้ hardware acceleration (`will-change: transform`)
15. THE System SHALL document JavaScript features ที่ต้องการ polyfill (ถ้ามี)
16. WHEN polyfill จำเป็น THE System SHALL load แบบ conditional (ไม่โหลดถ้า browser รองรับอยู่แล้ว)
17. THE System SHALL test touch events บน mobile browsers (drag-and-drop, swipe)
18. WHEN user swipe flashcard บน mobile THE System SHALL recognize gesture
19. THE System SHALL document font rendering differences ระหว่าง OS
20. WHEN Thai text ถูก render THE System SHALL verify readability บน macOS, Windows, Android

---

## Phase 11: Math Rendering Engine (ใหม่ — Gap 🔴 Critical)

### Requirement 11.1: KaTeX Integration และ Math Component Library

**User Story:** ในฐานะผู้ใช้ที่เรียนคณิตศาสตร์ ฉันต้องการเห็นสูตรคณิตศาสตร์ที่แสดงผลถูกต้องและสวยงาม ไม่ใช่ plain text เช่น `\frac{d}{dx}` หรือ `\int_0^1`

#### Acceptance Criteria

1. THE Math_Rendering_Engine SHALL ใช้ KaTeX เวอร์ชันล่าสุด (เร็วกว่า MathJax 10x, bundle เล็กกว่า)
2. WHEN KaTeX ถูก setup THE System SHALL import katex CSS ใน main.tsx เพื่อให้ styles โหลดก่อน render
3. THE Math_Rendering_Engine SHALL มี `<MathInline>` component สำหรับ inline math
4. WHEN AI response มี math ใน `$...$` format THE System SHALL render ด้วย `<MathInline>`
5. THE Math_Rendering_Engine SHALL มี `<MathBlock>` component สำหรับ display math (centered, full-width)
6. WHEN AI response มี math ใน `$$...$$` format THE System SHALL render ด้วย `<MathBlock>`
7. THE Math_Rendering_Engine SHALL implement `<MathText>` component ที่ auto-detect และ parse inline และ block math จาก plain text
8. WHEN AI ส่ง text ที่มีสูตรปน THE System SHALL parse และ render สูตรถูกต้อง
9. THE Math_Rendering_Engine SHALL handle KaTeX rendering errors gracefully
10. WHEN KaTeX ไม่สามารถ parse expression ได้ THE System SHALL แสดง raw LaTeX ใน `<code>` tag แทนที่จะ crash
11. THE Math_Rendering_Engine SHALL support math ใน flashcard front และ back
12. WHEN flashcard มี math expression THE System SHALL render ก่อน flip animation เริ่ม
13. THE Math_Rendering_Engine SHALL support math ใน quiz questions และ answer options
14. WHEN quiz question มี fraction, integral, limit หรือ trig function THE System SHALL render correctly
15. THE Math_Rendering_Engine SHALL support math ใน wrong answer explanations
16. WHEN AI อธิบาย step-by-step solution THE System SHALL render ทุก math expression ใน explanation
17. THE Math_Rendering_Engine SHALL support common math symbols สำหรับ 8 หัวข้อ
18. WHEN topic เป็น Calculus THE System SHALL support: `\frac`, `\int`, `\lim`, `\sum`, `\infty`, `\partial`
19. THE Math_Rendering_Engine SHALL render math correctly ใน dark mode
20. WHEN dark mode active THE System SHALL adjust KaTeX color tokens ให้ visible บน dark background

---

### Requirement 11.2: AI Prompt Engineering สำหรับ Math Output

**User Story:** ในฐานะระบบ ฉันต้องการให้ AI ส่ง math expressions ในรูปแบบ LaTeX ที่ consistent เพื่อให้ KaTeX render ได้ถูกต้องทุกครั้ง

#### Acceptance Criteria

1. THE Exam_Generator SHALL prompt AI ให้ใช้ `$...$` สำหรับ inline math และ `$$...$$` สำหรับ display math
2. WHEN AI สร้าง exam question THE System SHALL verify output มี math ใน correct format
3. THE Quiz_System SHALL prompt AI ให้ใช้ LaTeX notation เสมอ ไม่ใช้ plain text เช่น "x squared"
4. WHEN AI สร้าง quiz question THE System SHALL reject response ที่ไม่มี LaTeX สำหรับ math topics
5. THE Teach_Back_Engine SHALL ใช้ KaTeX-compatible math ใน feedback
6. WHEN AI ให้ feedback มี math concept THE System SHALL render LaTeX ใน feedback text
7. THE Flashcard_System SHALL prompt AI ให้ใส่ LaTeX ใน rule, hint, example fields
8. WHEN flashcard ถูกสร้าง THE System SHALL render all LaTeX ใน card content
9. THE Wrong_Answer_Explainer SHALL render LaTeX ใน solution steps
10. WHEN AI อธิบาย solution THE System SHALL render `Step 1: $\frac{d}{dx}(x^2) = 2x$` correctly
11. THE Math_Rendering_Engine SHALL มี utility function `parseMathContent(text: string): ReactNode[]`
12. WHEN text ถูก parse THE System SHALL split เป็น text segments และ math segments
13. THE Math_Rendering_Engine SHALL handle nested structures (math inside table cell, list item)
14. WHEN math อยู่ใน structured content THE System SHALL render correctly ไม่แตก layout
15. THE Math_Rendering_Engine SHALL cache rendered KaTeX output เพื่อ performance
16. WHEN same expression ถูก render ซ้ำ THE System SHALL return cached DOM node
17. THE Math_Rendering_Engine SHALL support Thai text ที่ปนกับ math
18. WHEN content มีทั้ง Thai text และ math formula THE System SHALL render ทั้งคู่ถูกต้อง
19. THE Math_Rendering_Engine SHALL handle large expressions (multiple fractions, complex integrals)
20. WHEN expression ซับซ้อน THE System SHALL render ใน 100ms หรือน้อยกว่า

---

## Phase 12: AI Streaming และ Response Validation (ใหม่ — Gap 🔴 Critical)

### Requirement 12.1: AI Response Streaming

**User Story:** ในฐานะผู้ใช้ ฉันต้องการเห็น AI response ที่ streaming ทีละตัวอักษรเหมือน ChatGPT แทนที่จะรอ 10-30 วินาทีเห็นหน้าจอว่างเปล่า

#### Acceptance Criteria

1. THE AI_Client SHALL ใช้ Server-Sent Events (SSE) หรือ streaming fetch สำหรับ AI responses
2. WHEN AI API call ถูกส่ง THE System SHALL request streaming mode (`stream: true`)
3. THE Vercel_Edge_Function SHALL proxy streaming response จาก Anthropic/OpenAI ไปยัง client
4. WHEN streaming response ถูกรับ THE System SHALL forward chunks ทันทีโดยไม่ buffer ทั้งหมด
5. THE AI_Streaming_Component SHALL แสดง text ที่ stream เข้ามาทีละ chunk
6. WHEN chunk ถูกรับ THE System SHALL append ไปยัง displayed text ด้วย smooth animation
7. THE AI_Streaming SHALL มี loading indicator ที่แตกต่างกัน: "กำลังคิด..." → streaming (แสดง text) → เสร็จ
8. WHEN streaming เริ่ม THE System SHALL replace loading indicator ด้วย incoming text
9. THE AI_Streaming SHALL รองรับ abort controller สำหรับยกเลิก streaming
10. WHEN user navigate away ระหว่าง streaming THE System SHALL abort request และ cleanup
11. THE AI_Streaming SHALL มี timeout 60 วินาที (เพิ่มจาก 30 วินาทีเดิมเพราะ streaming ใช้เวลามากกว่า)
12. WHEN streaming ไม่มี chunk ใหม่ใน 60 วินาที THE System SHALL abort และแสดง timeout error
13. THE AI_Streaming SHALL จัดการ JSON parsing หลังจาก streaming เสร็จสิ้น
14. WHEN stream ปิด THE System SHALL parse accumulated text เป็น JSON โดย validate schema ก่อน
15. THE AI_Streaming SHALL ทำงานกับทุก AI providers (Anthropic, OpenAI, Gemini)
16. WHEN provider แต่ละตัว streaming format ต่างกัน THE System SHALL normalize ให้ consistent
17. THE AI_Streaming SHALL track streaming performance metrics
18. WHEN stream เสร็จ THE System SHALL log: time_to_first_chunk, total_time, total_tokens
19. THE AI_Streaming SHALL มี visual "typing" cursor ขณะ streaming
20. WHEN streaming active THE System SHALL แสดง blinking cursor ที่ end of text

---

### Requirement 12.2: AI Response JSON Schema Validation

**User Story:** ในฐานะระบบ ฉันต้องการให้ AI response ผ่าน schema validation ก่อนใช้งาน เพื่อป้องกันแอปแครชเมื่อ AI ตอบ format ผิด

#### Acceptance Criteria

1. THE AI_Response_Validator SHALL ใช้ Zod library สำหรับ schema definition และ validation
2. WHEN AI response ถูกรับ THE System SHALL validate ผ่าน Zod schema ก่อน update state
3. THE AI_Response_Validator SHALL มี Zod schema สำหรับ ExamResponse
4. WHEN AI สร้าง exam THE System SHALL validate: `{title, subject, summary, topics[], questions[{question, options[4], correct(0-3), explanation}]}`
5. THE AI_Response_Validator SHALL มี Zod schema สำหรับ QuizResponse
6. WHEN AI สร้าง quiz question THE System SHALL validate: `{question, difficulty, options[4], correctIndex(0-3), explanation, hint, wrongExample, steps[], keyPoint, errorType, errorTypeThai}`
7. THE AI_Response_Validator SHALL มี Zod schema สำหรับ TeachBackEvaluation
8. WHEN AI ประเมิน teach-back THE System SHALL validate: `{score(1-10), passed(bool), feedback, conceptGap?, encouragement, severity}`
9. THE AI_Response_Validator SHALL มี Zod schema สำหรับ FlashcardSet
10. WHEN AI สร้าง flashcards THE System SHALL validate: `{cards[6]{front, back, rule, hint, example, difficulty}}`
11. THE AI_Response_Validator SHALL มี Zod schema สำหรับ WrongAnswerExplanation
12. WHEN AI อธิบาย wrong answer THE System SHALL validate: `{steps[2-3], keyPoint, correctAnswer, examples[]?}`
13. THE AI_Response_Validator SHALL implement retry with re-prompt เมื่อ validation ล้มเหลว
14. WHEN schema validation ล้มเหลวครั้งแรก THE System SHALL retry พร้อม additional instruction "ตอบเฉพาะ JSON ไม่มี markdown"
15. THE AI_Response_Validator SHALL สร้าง fallback response เมื่อ retry ล้มเหลว
16. WHEN validation ล้มเหลว 3 ครั้ง THE System SHALL สร้าง graceful error state ไม่ crash
17. THE AI_Response_Validator SHALL log validation errors พร้อม original response
18. WHEN validation ล้มเหลว THE System SHALL log `{schema_name, zod_errors, raw_response}` ไปยัง error service
19. THE AI_Response_Validator SHALL strip markdown fences จาก AI response ก่อน parse
20. WHEN AI ส่ง ```json...``` THE System SHALL strip backticks ก่อน `JSON.parse()`

---

## Phase 13: Prompt Engineering Documentation (ใหม่ — Gap 🔴 Critical)

### Requirement 13.1: Prompt Library และ Version Management

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ AI prompts ทั้ง 6 ตัวที่ documented, tested, และ version controlled เพราะ prompts คือ business logic ที่สำคัญที่สุดของระบบ

#### Acceptance Criteria

1. THE Prompt_Library SHALL เก็บ prompts ทุกตัวใน `src/services/prompts/` directory แยกจาก service logic
2. WHEN prompt ถูกแก้ไข THE System SHALL commit ด้วย conventional commit `feat(prompt): update examGen v1.2`
3. THE Prompt_Library SHALL มี `examGenPrompt.ts` พร้อม system prompt และ user prompt template
4. WHEN exam generator ถูกเรียก THE System SHALL compose prompt จาก template + dynamic content
5. THE Prompt_Library SHALL มี `quizGenPrompt.ts` พร้อม 8 topic-specific instructions
6. WHEN quiz ถูกสร้างสำหรับ Calculus THE System SHALL inject calculus-specific context และ formula examples
7. THE Prompt_Library SHALL มี `teachBackEvalPrompt.ts` พร้อม rubric scoring guide
8. WHEN AI ประเมิน teach-back THE System SHALL include rubric: "คะแนน 1-3 = ไม่เข้าใจ, 4-6 = เข้าใจบางส่วน, 7-10 = เข้าใจดี"
9. THE Prompt_Library SHALL มี `flashcardGenPrompt.ts` พร้อม LaTeX formatting instruction
10. WHEN flashcards ถูกสร้าง THE System SHALL instruct AI ให้ใช้ `$...$` สำหรับ math
11. THE Prompt_Library SHALL มี `wrongAnswerExplainPrompt.ts` พร้อม step template
12. WHEN wrong answer ถูกอธิบาย THE System SHALL prompt AI ให้ explain ใน 2-3 steps พร้อม LaTeX
13. THE Prompt_Library SHALL มี `miniQuizGenPrompt.ts` สำหรับ flashcard mini quiz (3 questions)
14. WHEN mini quiz ถูกสร้าง THE System SHALL prompt AI ให้ create questions จาก flashcard content
15. THE Prompt_Library SHALL มี expected output example ใน JSDoc comment ของแต่ละ prompt file
16. WHEN developer อ่าน prompt file THE System SHALL เห็น example input และ expected JSON output
17. THE Prompt_Library SHALL มี token estimation function สำหรับแต่ละ prompt
18. WHEN prompt ถูก compose THE System SHALL estimate token count และ warn ถ้าเกิน context limit
19. THE Prompt_Library SHALL ทดสอบ prompts ด้วย Jest tests พร้อม mock AI responses
20. WHEN prompt เปลี่ยน THE System SHALL verify output format ยังคง valid ต่อ Zod schema

---

### Requirement 13.2: AI Cost Monitoring System (เพิ่มใหม่ — Gap 🟡 High)

**User Story:** ในฐานะ operator ฉันต้องการ monitor token usage และ API costs เพื่อป้องกัน budget overrun

#### Acceptance Criteria

1. THE AI_Cost_Monitor SHALL track token usage ทุก API call (prompt_tokens + completion_tokens)
2. WHEN AI call เสร็จ THE System SHALL extract token counts จาก API response headers/body
3. THE AI_Cost_Monitor SHALL บันทึก token usage ลงใน IndexedDB `token_usage` object store
4. WHEN token count ถูกบันทึก THE System SHALL store: `{timestamp, provider, operation, prompt_tokens, completion_tokens, estimated_cost_usd}`
5. THE AI_Cost_Monitor SHALL คำนวณ estimated cost ตาม provider pricing
6. WHEN Anthropic claude-sonnet-4 ถูกใช้ THE System SHALL คำนวณ cost: input $3/MTok, output $15/MTok
7. THE AI_Cost_Monitor SHALL แสดง usage summary ใน Settings modal
8. WHEN user เปิด Settings THE System SHALL แสดง "วันนี้: X calls, Y tokens, ~$Z"
9. THE AI_Cost_Monitor SHALL alert เมื่อ daily cost เกิน threshold
10. WHEN daily cost > $1 THE System SHALL แสดง warning toast "ใช้งาน AI มาก วันนี้ประมาณ $X"
11. THE AI_Cost_Monitor SHALL implement token budget ต่อ session
12. WHEN session token ถึง 50,000 tokens THE System SHALL แสดง warning และ suggest saving work
13. THE AI_Cost_Monitor SHALL optimize prompts เพื่อลด token usage
14. WHEN prompt ถูก compose THE System SHALL trim whitespace และ remove redundant instructions
15. THE AI_Cost_Monitor SHALL เปรียบเทียบ cost ระหว่าง providers
16. WHEN user เปิด provider comparison THE System SHALL แสดง estimated cost per operation ของแต่ละ provider
17. THE AI_Cost_Monitor SHALL export usage data เป็น CSV
18. WHEN user ขอ export THE System SHALL download usage data เป็น `flashfix_usage_YYYY-MM.csv`
19. THE AI_Cost_Monitor SHALL reset daily counter ตี 0 ทุกวัน
20. WHEN วันใหม่เริ่ม THE System SHALL reset daily counters ใน IndexedDB

---

## Phase 14: PWA Implementation (ใหม่ — Gap 🟡 High)

### Requirement 14.1: Progressive Web App Setup

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ install FlashFix AI บน home screen ของโทรศัพท์และใช้งาน offline ได้บางส่วน

#### Acceptance Criteria

1. THE PWA SHALL มี `manifest.json` ที่ valid ใน `/public/`
2. WHEN browser check manifest THE System SHALL มี: name, short_name, icons (192px, 512px), theme_color, background_color, display: "standalone", start_url, orientation
3. THE PWA SHALL มี icons ที่ออกแบบสำหรับ FlashFix AI ในทุก required sizes (72, 96, 128, 144, 152, 192, 384, 512px)
4. WHEN user บน Android คลิก "Add to Home Screen" THE System SHALL แสดง FlashFix icon อย่างถูกต้อง
5. THE PWA SHALL ลงทะเบียน Service Worker ผ่าน Vite PWA plugin (`vite-plugin-pwa`)
6. WHEN Service Worker ลงทะเบียนสำเร็จ THE System SHALL log "SW registered" ใน console (dev only)
7. THE Service_Worker SHALL cache static assets ด้วย cache-first strategy
8. WHEN user load ครั้งที่ 2 THE System SHALL serve app shell จาก cache ก่อน
9. THE Service_Worker SHALL cache KaTeX CSS และ fonts เพราะ critical สำหรับ math rendering
10. WHEN offline และ user ดู history THE System SHALL serve cached content จาก IndexedDB
11. THE PWA SHALL แสดง offline banner เมื่อ network ไม่มี
12. WHEN network offline THE System SHALL แสดง orange banner "คุณอยู่ใน offline mode — บางฟีเจอร์ไม่พร้อมใช้งาน"
13. THE PWA SHALL disable AI features อย่าง graceful เมื่อ offline
14. WHEN offline และ user พยายามสร้าง exam THE System SHALL แสดง "ต้องการ internet สำหรับ AI — ลองทบทวน history แทน"
15. THE PWA SHALL implement install prompt
16. WHEN user ใช้งานครั้งที่ 3 THE System SHALL แสดง "เพิ่ม FlashFix ไปที่หน้าจอหลัก?" prompt
17. THE PWA SHALL handle Service Worker updates
18. WHEN SW ใหม่พร้อม THE System SHALL แสดง "มีอัปเดต — รีโหลดเพื่ออัปเดต?" toast
19. THE PWA SHALL pass Lighthouse PWA audit
20. WHEN Lighthouse PWA audit รัน THE System SHALL ผ่านทุก PWA checks (score 100)

---

### Requirement 14.2: Offline-First Data Strategy

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ history และ mastery data ใช้งานได้ตลอด แม้ไม่มี internet

#### Acceptance Criteria

1. THE Offline_Strategy SHALL cache ทุก history entries ใน IndexedDB (ไม่ใช่แค่ localStorage)
2. WHEN history entry ถูก save THE System SHALL เขียนลงทั้ง localStorage (fast access) และ IndexedDB (persistent)
3. THE Offline_Strategy SHALL cache mastery scores ใน IndexedDB ด้วย timestamp
4. WHEN mastery เปลี่ยน THE System SHALL update IndexedDB ทันที
5. THE Offline_Strategy SHALL queue AI requests เมื่อ offline
6. WHEN user ส่ง teach-back ขณะ offline THE System SHALL queue request และ sync เมื่อ online
7. THE Offline_Strategy SHALL sync queued requests เมื่อ online กลับมา
8. WHEN network กลับมา THE System SHALL process queue ตามลำดับและแสดงผล
9. THE Offline_Strategy SHALL serve flashcard content จาก cache
10. WHEN flashcards เคย generate แล้ว THE System SHALL serve จาก IndexedDB `ai_cache` โดยไม่ต้องเรียก AI
11. THE Offline_Strategy SHALL show appropriate UI สำหรับ offline-compatible features
12. WHEN offline THE System SHALL highlight features ที่ใช้ได้: history view, cached flashcards, mastery view
13. THE Offline_Strategy SHALL implement background sync ด้วย Background Sync API
14. WHEN Background Sync API available THE System SHALL register sync event สำหรับ queued requests
15. THE Offline_Strategy SHALL handle IndexedDB quota exceeded
16. WHEN storage เต็ม THE System SHALL ลบ oldest ai_cache entries และแจ้งผู้ใช้
17. THE Offline_Strategy SHALL แสดง storage usage ใน Settings
18. WHEN user เปิด Settings THE System SHALL แสดง "ใช้พื้นที่: X MB / Y MB"
19. THE Offline_Strategy SHALL allow user clear cache
20. WHEN user คลิก "ล้างข้อมูล Cache" THE System SHALL clear IndexedDB ai_cache และ confirm

---

## Phase 15: PDPA Compliance (ใหม่ — Gap 🟡 High)

### Requirement 15.1: Thai PDPA Compliance Implementation

**User Story:** ในฐานะผู้ใช้ชาวไทย ฉันมีสิทธิ์รับรู้ว่าข้อมูลอะไรถูกเก็บ และมีสิทธิ์ลบข้อมูลของตัวเองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562

#### Acceptance Criteria

1. THE PDPA_Compliance SHALL แสดง privacy policy page ที่ `/privacy` (ทั้งไทยและอังกฤษ)
2. WHEN user เข้า `/privacy` THE System SHALL แสดง: ข้อมูลที่เก็บ, วัตถุประสงค์, ระยะเวลาเก็บ, สิทธิ์ผู้ใช้
3. THE PDPA_Compliance SHALL แสดง consent banner ครั้งแรกที่ใช้งาน
4. WHEN user เข้าแอปครั้งแรก THE System SHALL แสดง banner "เราเก็บข้อมูลการเรียนรู้ไว้ในอุปกรณ์ของคุณ — ดูรายละเอียด | ยอมรับ"
5. THE PDPA_Compliance SHALL บันทึก consent timestamp
6. WHEN user กด "ยอมรับ" THE System SHALL บันทึก `{consented: true, timestamp, version: "1.0"}` ใน localStorage
7. THE PDPA_Compliance SHALL มีหน้า data inventory ที่ชัดเจน
8. WHEN user เปิด Settings > ข้อมูลของฉัน THE System SHALL แสดง list: learning history (N entries), mastery scores (8 topics), API settings (provider ชื่อ, key ถูก mask)
9. THE PDPA_Compliance SHALL implement right to erasure (สิทธิ์ลบข้อมูล)
10. WHEN user คลิก "ลบข้อมูลทั้งหมด" THE System SHALL clear localStorage, IndexedDB, และ session data ทั้งหมด
11. THE PDPA_Compliance SHALL confirm deletion ก่อนดำเนินการ
12. WHEN user request deletion THE System SHALL แสดง confirmation dialog พร้อม list ข้อมูลที่จะถูกลบ
13. THE PDPA_Compliance SHALL มี data export feature (right to portability)
14. WHEN user คลิก "ส่งออกข้อมูล" THE System SHALL download JSON ที่มี history, mastery, settings
15. THE PDPA_Compliance SHALL document ว่า API keys ส่งออกนอกอุปกรณ์
16. WHEN user ใช้ Anthropic default THE System SHALL ระบุว่า "เนื้อหาถูกส่งไปยัง Anthropic API เพื่อประมวลผล"
17. THE PDPA_Compliance SHALL ไม่เก็บ personal identifiable information (PII)
18. WHEN system ทำงาน THE System SHALL ไม่เก็บชื่อ, email, หรือข้อมูลส่วนตัวใดๆ
19. THE PDPA_Compliance SHALL version privacy policy
20. WHEN privacy policy เปลี่ยน THE System SHALL แสดง consent banner ใหม่ให้ user ยืนยันอีกครั้ง

---

## Phase 16: Gamification และ User Engagement (ใหม่ — Gap 🟢 Medium)

### Requirement 16.1: Streak System และ Milestone Rewards

**User Story:** ในฐานะผู้ใช้ ฉันต้องการระบบ streak และ achievement ที่กระตุ้นให้ฉันเรียนทุกวัน

#### Acceptance Criteria

1. THE Streak_System SHALL track consecutive days ที่ผู้ใช้ทำกิจกรรมอย่างน้อย 1 ครั้ง
2. WHEN user ทำกิจกรรม THE System SHALL update last_activity_date และคำนวณ streak
3. THE Streak_System SHALL แสดง streak counter ใน AppHeader (🔥 N วัน)
4. WHEN streak >= 1 THE System SHALL แสดง flame icon พร้อม count
5. THE Streak_System SHALL reset streak เมื่อ miss 1 วัน
6. WHEN last_activity_date เกิน 24 ชั่วโมง THE System SHALL reset streak เป็น 0
7. THE Streak_System SHALL มี streak protection (freeze) 1 ครั้งต่อสัปดาห์
8. WHEN user ไม่ได้เรียน 1 วัน THE System SHALL ใช้ freeze อัตโนมัติถ้ามี และแจ้งให้รู้
9. THE Milestone_System SHALL กำหนด milestones: streak 3, 7, 30, 100 วัน และ mastery 25%, 50%, 75%, 100% ต่อ topic
10. WHEN milestone ถูก reach THE System SHALL trigger celebration modal
11. THE Milestone_System SHALL มี celebration animation (confetti) เมื่อ milestone ถูก reach
12. WHEN mastery topic ถึง 100% THE System SHALL แสดง full-screen celebration พร้อม confetti
13. THE Milestone_System SHALL เก็บ earned badges ใน IndexedDB
14. WHEN badge ถูก earn THE System SHALL save และแสดงใน profile section
15. THE Gamification SHALL มี XP (Experience Points) system
16. WHEN user ทำกิจกรรม THE System SHALL award XP: quiz correct +10, teach-back passed +25, flashcards done +15, exam perfect +50
17. THE Gamification SHALL แสดง XP progress bar ไปยัง next level
18. WHEN XP เพิ่ม THE System SHALL animate progress bar
19. THE Gamification SHALL มี level titles ภาษาไทย (มือใหม่, ผู้เรียนรู้, นักเรียนขยัน, ผู้เชี่ยวชาญ, อัจฉริยะ)
20. WHEN user level up THE System SHALL แสดง level-up notification พร้อม new title

---

### Requirement 16.2: Study Session Timer และ Focus Mode

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ study timer เพื่อ track เวลาที่ใช้เรียนและ focus โดยไม่มีสิ่งรบกวน

#### Acceptance Criteria

1. THE Study_Timer SHALL มี Pomodoro-style timer (25 นาทีเรียน, 5 นาทีพัก)
2. WHEN user เริ่ม timer THE System SHALL countdown 25:00 → 0:00 แล้ว notify
3. THE Study_Timer SHALL แสดง timer ใน AppHeader ขณะ active
4. WHEN timer running THE System SHALL แสดง "⏱ 23:45" ใน header
5. THE Study_Timer SHALL play sound notification เมื่อหมด session (ถ้า user อนุญาต)
6. WHEN timer complete THE System SHALL play soft bell sound และแสดง "หยุดพัก 5 นาที!"
7. THE Study_Timer SHALL track total study time ต่อวัน
8. WHEN session เสร็จ THE System SHALL บันทึก study minutes ลงใน IndexedDB
9. THE Study_Timer SHALL แสดง daily study time ใน mastery page
10. WHEN user เปิด mastery page THE System SHALL แสดง "วันนี้เรียนไปแล้ว X นาที"
11. THE Focus_Mode SHALL ซ่อน history sidebar และ header elements ที่ไม่จำเป็น
12. WHEN user เปิด Focus Mode THE System SHALL แสดงเฉพาะ content area และ timer
13. THE Focus_Mode SHALL prevent system sleep ด้วย Wake Lock API
14. WHEN Focus Mode active THE System SHALL request WakeLock เพื่อ screen ไม่ดับ
15. THE Focus_Mode SHALL มี shortcut keyboard (F สำหรับ Focus Mode, ESC สำหรับออก)
16. WHEN user กด F key THE System SHALL toggle Focus Mode
17. THE Study_Timer SHALL รองรับ custom timer duration
18. WHEN user เปลี่ยน Settings THE System SHALL allow set 15/25/45/60 min sessions
19. THE Study_Timer SHALL integrate กับ streak system
20. WHEN Pomodoro session เสร็จ THE System SHALL count เป็น 1 activity สำหรับ streak

---

## Phase 17: Architecture Decision Records (ใหม่ — Gap 🟡 High)

### Requirement 17.1: ADR Documentation System

**User Story:** ในฐานะนักพัฒนา ฉันต้องการ Architecture Decision Records (ADRs) เพื่อ document เหตุผลของการตัดสินใจสำคัญ ทำให้ทีมเข้าใจว่าทำไมถึงเลือก technology นั้นๆ

#### Acceptance Criteria

1. THE ADR_System SHALL เก็บ ADRs ใน `docs/decisions/` directory
2. WHEN ADR ถูกสร้าง THE System SHALL ใช้ format: `ADR-NNN-title-kebab-case.md`
3. THE ADR_System SHALL มี ADR-001: เหตุผลที่เลือก KaTeX แทน MathJax
4. WHEN developer อ่าน ADR-001 THE System SHALL อธิบาย: Context, Decision, Consequences, Alternatives considered
5. THE ADR_System SHALL มี ADR-002: เหตุผลที่เลือก Zustand แทน Redux Toolkit
6. WHEN developer ถาม "ทำไมไม่ใช้ Redux?" THE System SHALL point ไปยัง ADR-002
7. THE ADR_System SHALL มี ADR-003: เหตุผลที่เลือก Vite แทน Webpack
8. WHEN ADR-003 ถูกสร้าง THE System SHALL document: bundle speed comparison, HMR performance, ecosystem
9. THE ADR_System SHALL มี ADR-004: เหตุผลที่เลือก Vitest + Playwright แทน Jest + Cypress
10. WHEN ADR-004 ถูกสร้าง THE System SHALL document: speed comparison, TypeScript integration, cost
11. THE ADR_System SHALL มี ADR-005: เหตุผลที่เลือก Vercel แทน AWS สำหรับ initial deployment
12. WHEN ADR-005 ถูกสร้าง THE System SHALL document: DX, cost, edge functions, migration path to AWS
13. THE ADR_System SHALL มี ADR-006: การตัดสินใจเรื่อง AI provider (Anthropic เป็น default)
14. WHEN ADR-006 ถูกสร้าง THE System SHALL document: API quality, pricing, fallback strategy
15. THE ADR_System SHALL มี ADR-007: เหตุผลที่เลือก IndexedDB แทน localStorage เพียงอย่างเดียว
16. WHEN ADR-007 ถูกสร้าง THE System SHALL document: storage limits, query capabilities, offline support
17. THE ADR_System SHALL update ADR status: Proposed, Accepted, Deprecated, Superseded
18. WHEN ADR ถูก supersede THE System SHALL link ไปยัง ADR ใหม่ที่แทนที่
19. THE ADR_System SHALL link ADRs จาก README
20. WHEN developer อ่าน README THE System SHALL มี section "Architecture Decisions" ที่ link ทุก ADRs

---

## Phase 18: User Experience Enhancements (ใหม่ — Gap 🟢 Medium)

### Requirement 18.1: Onboarding Flow

**User Story:** ในฐานะผู้ใช้ใหม่ ฉันต้องการ onboarding ที่สั้น กระชับ และ interactive เพื่อเข้าใจวิธีใช้งาน FlashFix AI ภายใน 2 นาที

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL ทำงานครั้งแรกที่ user เข้าแอป (ตรวจจับจาก `onboarding_complete` ใน localStorage)
2. WHEN user เข้าแอปครั้งแรก THE System SHALL launch onboarding modal อัตโนมัติ
3. THE Onboarding_Flow SHALL มี 3 steps: "ยินดีต้อนรับ", "เลือกวิธีเรียน", "เริ่มเรียน"
4. WHEN Step 1 แสดง THE System SHALL อธิบาย FlashFix AI ใน 2-3 ประโยค พร้อมภาพประกอบ
5. THE Onboarding_Flow SHALL Step 2: ให้ user เลือก entry mode (อัปโหลดไฟล์ / เลือกหัวข้อ)
6. WHEN user เลือก entry mode THE System SHALL remember preference และ customize home screen
7. THE Onboarding_Flow SHALL Step 3: demo interactive mini-quiz 1 ข้อ สำหรับ topic ที่ user เลือก
8. WHEN user ทำ demo quiz THE System SHALL congratulate และ explain teach-back concept
9. THE Onboarding_Flow SHALL allow skip ได้ตลอดเวลา
10. WHEN user คลิก "ข้าม" THE System SHALL mark onboarding complete และไปหน้า home
11. THE Onboarding_Flow SHALL allow ดูซ้ำได้ใน Settings
12. WHEN user คลิก "ดู Tutorial ใหม่" ใน Settings THE System SHALL reset และ launch onboarding
13. THE Onboarding_Flow SHALL explain AI provider settings อย่างกระชับ
14. WHEN user เห็น API settings ครั้งแรก THE System SHALL tooltip "ใช้ Anthropic ฟรีได้เลย ไม่ต้องใส่ key"
15. THE Onboarding_Flow SHALL accessible ด้วย keyboard
16. WHEN user navigate onboarding ด้วย keyboard THE System SHALL Tab/Enter/Escape ทำงานถูกต้อง
17. THE Onboarding_Flow SHALL complete ภายใน 2 นาที
18. WHEN onboarding design ถูก review THE System SHALL ทดสอบ user ใหม่สามารถ complete ได้ < 120 วินาที
19. THE Onboarding_Flow SHALL track completion rate
20. WHEN onboarding เสร็จหรือถูก skip THE System SHALL log event ไปยัง analytics

---

### Requirement 18.2: User Data Export และ Import

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ export ข้อมูลการเรียนทั้งหมดเพื่อ backup หรือย้ายไปอุปกรณ์ใหม่

#### Acceptance Criteria

1. THE Data_Export SHALL export ข้อมูลทั้งหมดเป็น JSON file
2. WHEN user คลิก "ส่งออกข้อมูล" THE System SHALL download `flashfix_backup_YYYY-MM-DD.json`
3. THE Data_Export SHALL รวม: history (ทุก entry), mastery (8 topics + scores), settings (provider name เท่านั้น, ไม่รวม API key), streak data, XP/level data
4. WHEN export ถูกสร้าง THE System SHALL validate JSON schema ก่อน download
5. THE Data_Import SHALL allow import จาก previously exported JSON file
6. WHEN user เลือกไฟล์ import THE System SHALL validate schema ก่อน import
7. THE Data_Import SHALL merge data แทน overwrite
8. WHEN import data มี history ที่ซ้ำกัน THE System SHALL deduplicate โดยใช้ timestamp
9. THE Data_Import SHALL preview data ก่อน import
10. WHEN user เลือกไฟล์ THE System SHALL แสดง summary: "พบ X history entries, Y topics มี mastery data"
11. THE Data_Export SHALL mask API keys ใน export
12. WHEN export มี API settings THE System SHALL ไม่รวม actual key value (security)
13. THE Data_Import SHALL validate data integrity
14. WHEN import file corrupt THE System SHALL แสดง error message ที่ชัดเจน
15. THE Data_Export SHALL support export ประวัติเฉพาะช่วงเวลา
16. WHEN user เลือก date range THE System SHALL export เฉพาะ history ในช่วงนั้น
17. THE Data_Import SHALL show progress สำหรับ large files
18. WHEN import มี 1000+ entries THE System SHALL แสดง progress bar
19. THE Data_Export SHALL generate export summary report
20. WHEN export เสร็จ THE System SHALL แสดง "ส่งออกสำเร็จ: X entries, Y MB"

---

### Requirement 18.3: Push Notifications สำหรับ Spaced Repetition

**User Story:** ในฐานะผู้ใช้ ฉันต้องการรับ notification เตือนวันทบทวนตาม schedule ที่ตั้งไว้ เพื่อไม่ลืม

#### Acceptance Criteria

1. THE Push_Notification_System SHALL ขอ Notification permission เมื่อ user schedule review
2. WHEN user สร้าง spaced repetition schedule THE System SHALL prompt "อนุญาตให้แจ้งเตือน?"
3. THE Push_Notification_System SHALL schedule local notifications (ไม่ต้องการ server)
4. WHEN user approve notification THE System SHALL ใช้ Notification API + setTimeout (short-term) หรือ Service Worker push (long-term)
5. THE Push_Notification_System SHALL notify ตาม review schedule (0, 1, 4, 11, 25 วัน)
6. WHEN ถึงวันทบทวน THE System SHALL send notification: "⚡ FlashFix: ถึงเวลาทบทวน {topic} ครั้งที่ {n}!"
7. THE Push_Notification_System SHALL allow manage notifications ใน Settings
8. WHEN user เปิด Settings > การแจ้งเตือน THE System SHALL แสดง list ของ scheduled reviews พร้อม enable/disable toggle
9. THE Push_Notification_System SHALL handle notification click
10. WHEN user คลิก notification THE System SHALL open แอปและไปยัง relevant topic directly
11. THE Push_Notification_System SHALL graceful degrade ถ้า Notification API ไม่ supported
12. WHEN Notification API ไม่ available THE System SHALL fallback ไปยัง email reminder link (iCal ที่มีอยู่แล้ว)
13. THE Push_Notification_System SHALL ไม่ส่ง notification ในเวลากลางคืน (22:00-07:00)
14. WHEN scheduled time อยู่นอก window THE System SHALL เลื่อนไป 8:00 ของวันถัดไป
15. THE Push_Notification_System SHALL batch notifications ที่ใกล้กัน
16. WHEN 2 topics มี review วันเดียวกัน THE System SHALL รวมเป็น 1 notification
17. THE Push_Notification_System SHALL track notification click-through rate
18. WHEN notification ถูกคลิก THE System SHALL log engagement event
19. THE Push_Notification_System SHALL ไม่ spam ผู้ใช้
20. WHEN user ignore notification 3 ครั้งติดต่อกัน THE System SHALL reduce frequency

---

### Requirement 18.4: SEO และ Social Sharing

**User Story:** ในฐานะ product owner ฉันต้องการให้ FlashFix AI ถูก discover ผ่าน Google และ share บน social media ได้ดี

#### Acceptance Criteria

1. THE SEO_System SHALL มี meta tags ที่ครบในทุกหน้า (title, description, og:image, og:title, og:description, twitter:card)
2. WHEN page โหลด THE System SHALL set meta tags ตาม page content
3. THE SEO_System SHALL มี structured data (JSON-LD) สำหรับ home page
4. WHEN Google bot crawl THE System SHALL แสดง Organization schema และ WebApplication schema
5. THE SEO_System SHALL มี dynamic og:image generation สำหรับ shared content
6. WHEN user share mastery achievement THE System SHALL generate og:image แสดง "FlashFix AI — ฉันเชี่ยวชาญ {topic} 100%!"
7. THE SEO_System SHALL มี sitemap.xml
8. WHEN sitemap ถูก request THE System SHALL return XML ที่ valid พร้อมทุก routes
9. THE SEO_System SHALL มี robots.txt ที่ถูกต้อง
10. WHEN robots.txt ถูก request THE System SHALL allow all crawlers และ link ไปยัง sitemap
11. THE Social_Sharing SHALL มี share button สำหรับ mastery achievements
12. WHEN user reach 100% mastery THE System SHALL แสดง "แชร์ความสำเร็จ" button
13. THE Social_Sharing SHALL generate shareable image พร้อม score
14. WHEN user คลิก share THE System SHALL generate canvas image พร้อม topic + score
15. THE Social_Sharing SHALL support Web Share API บน mobile
16. WHEN mobile user คลิก share THE System SHALL ใช้ `navigator.share()` API
17. THE SEO_System SHALL มี canonical URLs
18. WHEN duplicate content อาจเกิด THE System SHALL set canonical tag
19. THE SEO_System SHALL มี hreflang tags สำหรับ Thai/English
20. WHEN page มีทั้ง TH และ EN content THE System SHALL set `hreflang="th"` และ `hreflang="en"` appropriately

---

### Requirement 18.5: Print Styles

**User Story:** ในฐานะผู้ใช้ ฉันต้องการ print exam results, mastery report, หรือ flashcards เพื่อเรียนแบบ offline

#### Acceptance Criteria

1. THE Print_Styles SHALL มี `@media print` CSS สำหรับ exam results page
2. WHEN user print exam results THE System SHALL แสดงเฉพาะ questions, answers, และ explanations
3. THE Print_Styles SHALL ซ่อน navigation, history sidebar, และ buttons ขณะ print
4. WHEN print preview แสดง THE System SHALL แสดงเฉพาะ printable content
5. THE Print_Styles SHALL มี print layout สำหรับ mastery report (1 page)
6. WHEN user print mastery THE System SHALL แสดง 8 topic progress bars, scores, และ recommendations
7. THE Print_Styles SHALL render KaTeX math correctly ใน print
8. WHEN math expression ถูก print THE System SHALL render เป็น vector-like output (KaTeX ใช้ HTML/CSS ที่ print ได้ดี)
9. THE Print_Styles SHALL แสดง page header พร้อม "FlashFix AI — {date}" ขณะ print
10. WHEN page ถูก print THE System SHALL include header ที่ทุกหน้า
11. THE Print_Styles SHALL แสดง flashcards สำหรับ print (2 per row, front/back ชัดเจน)
12. WHEN user print flashcards THE System SHALL layout ใน grid 2x3 พร้อม borders
13. THE Print_Styles SHALL ใช้ black-and-white friendly colors
14. WHEN print ใน grayscale THE System SHALL ยังอ่านได้และ contrast เพียงพอ
15. THE Print_Styles SHALL hide interactive elements (buttons, inputs, links)
16. WHEN print THE System SHALL ซ่อน elements ที่ไม่มีความหมายใน printed format
17. THE Print_Styles SHALL add print-specific URL ต่อท้าย links
18. WHEN hyperlink ถูก print THE System SHALL แสดง URL ใน parentheses หลัง link text
19. THE Print_Styles SHALL break pages อย่างเหมาะสม
20. WHEN content ยาว THE System SHALL avoid page break ภายใน question block หรือ flashcard

---

## อัปเดต Phase 3: Performance Optimization

### Requirement 3.11: AI Response Caching Strategy (เพิ่มใหม่)

**User Story:** ในฐานะผู้ใช้ ฉันต้องการให้ AI ไม่สร้าง flashcard ซ้ำสำหรับ content เดิม เพื่อประหยัดเวลาและค่า API

#### Acceptance Criteria

1. THE AI_Cache SHALL hash prompt content (topic + context summary) เป็น cache key
2. WHEN AI request ถูกส่ง THE System SHALL check hash ใน IndexedDB `ai_cache` ก่อน
3. THE AI_Cache SHALL ใช้ SHA-256 (via Web Crypto API) สำหรับ hash generation
4. WHEN hash ถูก generate THE System SHALL ใช้ `{provider}:{operation}:{content_hash}` เป็น key format
5. THE AI_Cache SHALL cache responses พร้อม 24-hour TTL
6. WHEN cache hit THE System SHALL return cached response ทันทีโดยไม่เรียก API
7. THE AI_Cache SHALL invalidate cache เมื่อ provider เปลี่ยน
8. WHEN user เปลี่ยน AI provider THE System SHALL ไม่ใช้ cache จาก old provider
9. THE AI_Cache SHALL แสดง cache hit indicator ใน UI (dev mode)
10. WHEN response มาจาก cache THE System SHALL แสดง "⚡ จาก cache" badge (dev only)
11. THE AI_Cache SHALL implement LRU eviction เมื่อ cache > 100MB
12. WHEN IndexedDB ai_cache เกิน 100MB THE System SHALL ลบ least recently used entries
13. THE AI_Cache SHALL track cache hit rate
14. WHEN AI call ทำงาน THE System SHALL record hit/miss ratio ใน performance metrics
15. THE AI_Cache SHALL allow manual cache clear
16. WHEN user คลิก "ล้าง AI Cache" ใน Settings THE System SHALL delete ทุก entries ใน `ai_cache`
17. THE AI_Cache SHALL skip cache สำหรับ teach-back evaluation
18. WHEN teach-back evaluation ถูกเรียก THE System SHALL ไม่ cache เพราะ context เปลี่ยนทุกครั้ง
19. THE AI_Cache SHALL compress cached responses
20. WHEN response ถูก cache THE System SHALL compress ด้วย CompressionStream API ก่อนเก็บ

---

## Technical Specifications เพิ่มเติม

### Math Rendering Stack
- **Library**: KaTeX 0.16+ (ไม่ใช้ MathJax เพราะ bundle ใหญ่กว่า 10x)
- **Delimiter**: `$...$` สำหรับ inline, `$$...$$` สำหรับ display
- **Fonts**: KaTeX fonts ถูก self-host ใน `/public/fonts/katex/`
- **Performance**: KaTeX render < 1ms ต่อ expression เมื่อ fonts cached
- **Error handling**: `throwOnError: false` — render fallback text แทน crash

### PWA Stack
- **Plugin**: `vite-plugin-pwa` (Workbox-based)
- **Strategy**: Precache app shell, runtime cache API responses, network-first for AI calls
- **Manifest icons**: สร้างจาก master SVG ด้วย `sharp` ใน build script
- **Update flow**: Prompt user → reload → activate new SW

### Token Estimation
| Operation | Estimated Tokens | Cost (Anthropic claude-sonnet-4) |
|-----------|-----------------|----------------------------------|
| Exam generation (PDF 1MB) | ~4,000 in, ~1,000 out | ~$0.027 |
| Quiz question | ~500 in, ~300 out | ~$0.006 |
| Teach-back eval | ~800 in, ~200 out | ~$0.005 |
| Flashcard set (6 cards) | ~600 in, ~800 out | ~$0.014 |
| Wrong answer explain | ~400 in, ~300 out | ~$0.006 |
| **Per learning session** | **~7,000 in, ~3,000 out** | **~$0.066** |

### Design Token Values
```css
/* Light mode */
:root {
  --color-primary: #14b8a6;        /* teal-500 */
  --color-primary-hover: #0d9488;  /* teal-600 */
  --color-surface: #ffffff;
  --color-surface-2: #f8fafc;
  --color-surface-3: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #94a3b8;
  --color-border: #e2e8f0;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Topics */
  --color-topic-calculus: #8b5cf6;
  --color-topic-integral: #ec4899;
  --color-topic-limit: #3b82f6;
  --color-topic-trig: #f97316;
  --color-topic-algebra: #84cc16;
  --color-topic-probability: #06b6d4;
  --color-topic-geometry: #eab308;
  --color-topic-statistics: #10b981;
}

[data-theme="dark"] {
  --color-surface: #0f172a;
  --color-surface-2: #1e293b;
  --color-surface-3: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #64748b;
  --color-border: #334155;
}
```

### IndexedDB Schema v1
```typescript
// db: flashfix_db, version: 1
interface AICache {
  key: string;          // keyPath: "{provider}:{op}:{hash}"
  prompt_hash: string;  // SHA-256 of prompt
  response: string;     // compressed JSON string
  created_at: number;   // Unix timestamp ms
  ttl: number;          // ms until expiry
}

interface LearningHistory {
  id: string;           // keyPath: UUID v4
  type: 'file' | 'quiz' | 'exam' | 'flashcard' | 'teachback';
  data: object;
  timestamp: number;    // Unix timestamp ms (indexed)
  topic?: string;       // indexed
}

interface MasteryScore {
  topic_id: string;     // keyPath
  score: number;        // 0-100
  updated_at: number;   // Unix timestamp ms
  activity_count: number;
}

interface TokenUsage {
  id: string;           // keyPath: UUID v4
  timestamp: number;    // indexed
  provider: 'anthropic' | 'openai' | 'gemini';
  operation: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
}
```

### Prompt Templates (Outline)

#### examGenPrompt
```
System: คุณเป็นครูคณิตศาสตร์ไทย สร้างข้อสอบ 5 ข้อจากเนื้อหาที่ให้ ใช้ LaTeX สำหรับสูตรคณิตศาสตร์ ($...$) ตอบเฉพาะ JSON ตามรูปแบบนี้: {...}

User: [extracted text content, max 8,000 tokens]

Expected: ExamResponse (Zod schema validation)
```

#### quizGenPrompt
```
System: คุณเป็นครูคณิตศาสตร์ไทย สร้างโจทย์ระดับ {difficulty} สำหรับหัวข้อ: {topicThai} ใช้ LaTeX เสมอ ตอบเฉพาะ JSON

User: สร้างโจทย์ 1 ข้อ พร้อม hint, wrongExample, step-by-step, errorType

Expected: QuizResponse (Zod schema validation)
```

#### teachBackEvalPrompt
```
System: ประเมินคำอธิบายนักเรียนแบบ Rubric: [1-3: ไม่เข้าใจ, 4-6: เข้าใจบางส่วน, 7-10: เข้าใจดี] ให้คะแนน, feedback, conceptGap ถ้ามี

User: โจทย์: {question} | คำอธิบายนักเรียน: {explanation}

Expected: TeachBackEvaluation (Zod schema validation)
```

---

## Completion Criteria เพิ่มเติม (จาก Gap Analysis)

### Phase 0: Pre-Development (ต้องทำก่อนเขียนโค้ดบรรทัดแรก)
- ✅ Design token system defined (CSS + TypeScript)
- ✅ All 6 AI prompts written, tested, Zod schemas defined
- ✅ KaTeX selected and documented in ADR-001
- ✅ Browser/device support matrix documented
- ✅ PDPA compliance checklist complete
- ✅ AI cost budget set ($X/month)
- ✅ ADR-001 through ADR-007 written
- ✅ Dark mode color mappings verified for contrast
- ✅ IndexedDB schema v1 finalized
- ✅ Onboarding flow wireframed

### Math Rendering
- ✅ KaTeX renders all 8 topic formulas correctly
- ✅ Math renders in both light and dark mode
- ✅ MathText component handles mixed Thai + math content
- ✅ KaTeX fonts self-hosted (not from CDN)

### AI Reliability
- ✅ All AI responses validated against Zod schemas
- ✅ Streaming implemented for all operations
- ✅ Retry with re-prompt on validation failure
- ✅ Fallback to cached responses when possible

### PWA
- ✅ Lighthouse PWA score: 100
- ✅ Install prompt tested on Android Chrome and iOS Safari
- ✅ Offline: history and cached flashcards work
- ✅ Service Worker update flow tested

### Compliance
- ✅ PDPA consent banner shown on first visit
- ✅ Right to erasure implemented (delete all data)
- ✅ Data export works (JSON download)
- ✅ No PII collected or stored

### Performance (Updated Targets)
- ✅ KaTeX render < 1ms per expression (fonts cached)
- ✅ IndexedDB reads < 10ms
- ✅ AI cache hit rate > 60% for repeated topics
- ✅ Streaming: time-to-first-chunk < 1 second

---

## สรุป Gap Analysis — สิ่งที่เพิ่มเข้ามา

| Gap | ประเภท | Phase ที่เพิ่ม | Requirements ใหม่ |
|-----|--------|---------------|-------------------|
| Math rendering (KaTeX) | 🔴 Critical | Phase 11 | 11.1, 11.2 |
| AI streaming | 🔴 Critical | Phase 12 | 12.1 |
| AI JSON schema validation | 🔴 Critical | Phase 12 | 12.2 |
| Prompt engineering | 🔴 Critical | Phase 13 | 13.1 |
| Design token system | 🟡 High | Phase 1 (update) | 1.11 |
| Dark mode spec | 🟡 High | Phase 1 (update) | 1.12 |
| PDPA compliance | 🟡 High | Phase 15 | 15.1 |
| AI cost monitoring | 🟡 High | Phase 13 | 13.2 |
| IndexedDB schema | 🟡 High | Phase 1 (update) | 1.13 |
| Browser support matrix | 🟡 High | Phase 1 (update) | 1.14 |
| PWA spec | 🟡 High | Phase 14 | 14.1, 14.2 |
| Gamification | 🟢 Medium | Phase 16 | 16.1, 16.2 |
| User data export/import | 🟢 Medium | Phase 18 | 18.2 |
| Onboarding flow | 🟢 Medium | Phase 18 | 18.1 |
| Study session timer | 🟢 Medium | Phase 16 | 16.2 |
| Push notifications | 🟢 Medium | Phase 18 | 18.3 |
| SEO + social sharing | 🟢 Medium | Phase 18 | 18.4 |
| Print styles | 🟢 Medium | Phase 18 | 18.5 |
| ADR documentation | 🟡 High | Phase 17 | 17.1 |
| AI response caching | 🟢 Medium | Phase 3 (update) | 3.11 |

**รวมทั้งหมด: 20 gaps → 24 requirements ใหม่ → 480 acceptance criteria ใหม่**

**ยอดรวมทั้ง document: 50+ requirements เดิม + 24 ใหม่ = 74 requirements, 1,480+ acceptance criteria**
