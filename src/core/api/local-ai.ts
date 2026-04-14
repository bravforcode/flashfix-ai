import type { QuizQuestion, QuizSolution, TeachBackEvaluation, Flashcard, MiniQuizItem, FileSummaryData } from '@/core/state/store.types'

type LocalAIRequest = {
  systemPrompt: string
  userContent: string | Array<{
    type: 'text'
    text: string
  } | {
    type: 'image'
    source: {
      type: 'base64'
      media_type: string
      data: string
    }
  }>
  maxTokens?: number
}

type TopicSpec = {
  id: string
  th: string
  aliases: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  quiz: QuizQuestion & { acceptedPatterns: RegExp[] }
  rule: string
  misconception: string
  summary: string
  flashcards: Flashcard[]
  miniQuiz: MiniQuizItem[]
  mcq: FileSummaryData['questions'][number]
  teachBackKeywords: string[]
}

const TOPIC_SPECS: TopicSpec[] = [
  {
    id: 'derivative',
    th: 'อนุพันธ์',
    aliases: ['อนุพันธ์', 'derivative', '微分'],
    difficulty: 'easy',
    quiz: {
      question: 'จงหาอนุพันธ์ของ $f(x)=3x^2+2x-5$',
      answer: "$f'(x)=6x+2$",
      wrongExample: 'ตอบเป็น $6x$ เพราะลืมดิฟฯ พจน์ $2x$',
      difficulty: 'easy',
      hint: 'ใช้กฎยกกำลังทีละพจน์ และค่าคงที่มีอนุพันธ์เป็นศูนย์',
      acceptedPatterns: [/6x\+2/, /2\+6x/],
    },
    rule: 'กฎยกกำลัง: ถ้า $f(x)=ax^n$ แล้ว $f\'(x)=anx^{n-1}$ และค่าคงที่มีอนุพันธ์เป็น 0',
    misconception: 'มักลืมดิฟฯ ทุกพจน์ หรือดิฟฯ ค่าคงที่ไม่เป็น 0',
    summary: 'อนุพันธ์ใช้วัดอัตราการเปลี่ยนแปลงฉับพลันของฟังก์ชัน และต้องดิฟฯ ทีละพจน์ตามกฎที่เหมาะสม',
    flashcards: [
      { front: 'อนุพันธ์ของ $x^n$', back: '$nx^{n-1}$', rule: 'Power Rule', hint: 'คูณเลขชี้กำลังลงมาแล้วลดกำลังลง 1', example: '$\\frac{d}{dx}(x^3)=3x^2$', difficulty: 'easy', color: 'accent' },
      { front: 'อนุพันธ์ของค่าคงที่', back: 'เป็น 0 เสมอ', rule: 'Constant Rule', hint: 'ค่าคงที่ไม่เปลี่ยนเมื่อ x เปลี่ยน', example: '$\\frac{d}{dx}(9)=0$', difficulty: 'easy', color: 'blue' },
      { front: 'อนุพันธ์ของ $2x$', back: 'เท่ากับ 2', rule: 'Linear Term', hint: 'พจน์เชิงเส้นเหลือแค่สัมประสิทธิ์', example: '$\\frac{d}{dx}(7x)=7$', difficulty: 'easy', color: 'teal' },
      { front: 'อนุพันธ์บอกอะไร', back: 'บอกความชันหรืออัตราการเปลี่ยนแปลง ณ จุดนั้น', rule: 'Interpretation', hint: 'เชื่อมกับ slope ของ tangent', example: 'ถ้า $f\'(2)=5$ แปลว่าความชันที่ x=2 คือ 5', difficulty: 'easy', color: 'gold' },
    ],
    miniQuiz: [
      { question: 'หาอนุพันธ์ของ $x^4$', answer: '$4x^3$' },
      { question: 'หาอนุพันธ์ของ $5x$', answer: '5' },
      { question: 'หาอนุพันธ์ของ $-8$', answer: '0' },
    ],
    mcq: {
      q: 'ข้อใดคืออนุพันธ์ของ $4x^3-2x$',
      options: ['$12x^2-2$', '$12x^2$', '$4x^2-2$', '$3x^2-2$'],
      correct: 0,
      explain: 'ดิฟฯ $4x^3$ ได้ $12x^2$ และดิฟฯ $-2x$ ได้ $-2$',
    },
    teachBackKeywords: ['กฎยกกำลัง', 'ค่าคงที่', 'ทีละพจน์', 'ความชัน'],
  },
  {
    id: 'integral',
    th: 'อินทิกรัล',
    aliases: ['อินทิกรัล', 'integral', '積分'],
    difficulty: 'medium',
    quiz: {
      question: 'จงหา $\\int (4x-1)\\,dx$',
      answer: '$2x^2-x+C$',
      wrongExample: 'ตอบเป็น $2x^2-x$ แล้วลืมค่าคงที่ $C$',
      difficulty: 'medium',
      hint: 'อินทิเกรตทีละพจน์ และอย่าลืม +C',
      acceptedPatterns: [/2x\^?2-x\+c/, /2x2-x\+c/, /2x\^?2\+c-x/, /2x2\+c-x/],
    },
    rule: 'อินทิกรัลไม่จำกัดเขตคือกระบวนการย้อนกลับของอนุพันธ์ และต้องบวกค่าคงที่ $C$ เสมอ',
    misconception: 'มักลืม +C หรือบวกลดเลขชี้กำลังผิด',
    summary: 'อินทิกรัลช่วยสะสมพื้นที่หรือย้อนกลับจากอนุพันธ์ โดยเพิ่มเลขชี้กำลังแล้วหารด้วยกำลังใหม่',
    flashcards: [
      { front: '$\\int x^n dx$', back: '$\\frac{x^{n+1}}{n+1}+C$ เมื่อ $n\\neq -1$', rule: 'Reverse Power Rule', hint: 'เพิ่มกำลังก่อนแล้วค่อยหาร', example: '$\\int x^2 dx=\\frac{x^3}{3}+C$', difficulty: 'medium', color: 'blue' },
      { front: 'ทำไมต้องมี $+C$', back: 'เพราะฟังก์ชันหลายตัวมีอนุพันธ์เหมือนกัน ต่างกันแค่ค่าคงที่', rule: 'Constant of Integration', hint: 'ดิฟฯ ค่าคงที่ได้ 0', example: '$x^2$ และ $x^2+7$ มีอนุพันธ์เท่ากัน', difficulty: 'easy', color: 'accent' },
      { front: '$\\int 4x dx$', back: '$2x^2+C$', rule: 'Linearity', hint: 'ดึงค่าสัมประสิทธิ์ออกได้', example: '$\\int 7x dx=\\frac{7x^2}{2}+C$', difficulty: 'medium', color: 'teal' },
      { front: 'อินทิกรัลใช้ทำอะไร', back: 'หาพื้นที่สะสม ปริมาณรวม หรือฟังก์ชันตั้งต้น', rule: 'Meaning', hint: 'คิดเป็นการสะสม', example: 'หาพื้นที่ใต้กราฟจากอัตราเร็ว', difficulty: 'easy', color: 'gold' },
    ],
    miniQuiz: [
      { question: 'หา $\\int 6x\\,dx$', answer: '$3x^2+C$' },
      { question: 'หา $\\int 5\\,dx$', answer: '$5x+C$' },
      { question: 'ในอินทิกรัลไม่จำกัดเขตต้องเพิ่มอะไรเสมอ', answer: '$+C$' },
    ],
    mcq: {
      q: 'ข้อใดคือคำตอบของ $\\int 2x\\,dx$',
      options: ['$x^2+C$', '$2x^2+C$', '$x+C$', '$x^2$'],
      correct: 0,
      explain: 'เพิ่มกำลังเป็น 2 แล้วหารด้วย 2 จึงเหลือ $x^2$ และต้องมี $+C$',
    },
    teachBackKeywords: ['ย้อนกลับ', '+c', 'เพิ่มกำลัง', 'หาร'],
  },
  {
    id: 'limit',
    th: 'ลิมิต',
    aliases: ['ลิมิต', 'limit', '極限'],
    difficulty: 'easy',
    quiz: {
      question: 'จงหา $\\lim_{x\\to 1}\\frac{x^2-1}{x-1}$',
      answer: '2',
      wrongExample: 'แทนค่าแล้วได้ $\\frac{0}{0}$ แล้วสรุปว่าหาค่าไม่ได้',
      difficulty: 'easy',
      hint: 'แยกตัวประกอบตัวเศษก่อนค่อยตัดพจน์ที่ซ้ำกัน',
      acceptedPatterns: [/^2$/, /เท่ากับ2/, /ได้2/],
    },
    rule: 'ถ้าแทนตรง ๆ แล้วเจอรูปไม่กำหนด เช่น $0/0$ ต้องจัดรูปก่อน เช่น แยกตัวประกอบหรือคูณด้วยพจน์ร่วม',
    misconception: 'คิดว่า $0/0$ คือคำตอบสุดท้าย ทั้งที่เป็นเพียงสัญญาณว่าต้องจัดรูป',
    summary: 'ลิมิตดูค่าที่ฟังก์ชันเข้าใกล้เมื่อ x เข้าใกล้ค่าหนึ่ง และมักต้องจัดรูปก่อนประเมิน',
    flashcards: [
      { front: 'รูปไม่กำหนด $0/0$', back: 'ไม่ใช่คำตอบสุดท้าย ต้องจัดรูปก่อน', rule: 'Indeterminate Form', hint: 'เป็นสัญญาณให้แปลงนิพจน์', example: '$\\frac{x^2-1}{x-1}$ ที่ x→1', difficulty: 'easy', color: 'purple' },
      { front: '$x^2-1$', back: 'แยกได้เป็น $(x-1)(x+1)$', rule: 'Factoring', hint: 'ผลต่างกำลังสอง', example: '$a^2-b^2=(a-b)(a+b)$', difficulty: 'easy', color: 'gold' },
      { front: 'เมื่อตัด $(x-1)$ ได้แล้วเหลืออะไร', back: '$x+1$', rule: 'Simplify First', hint: 'ค่อยแทนค่าหลังจัดรูป', example: 'แทน x=1 ได้ 2', difficulty: 'easy', color: 'accent' },
      { front: 'ลิมิตบอกอะไร', back: 'บอกค่าที่ฟังก์ชันเข้าใกล้ ไม่จำเป็นต้องเป็นค่าฟังก์ชันจริง ณ จุดนั้น', rule: 'Meaning', hint: 'สนใจพฤติกรรมรอบจุด', example: 'รูโหว่บนกราฟยังมีลิมิตได้', difficulty: 'medium', color: 'blue' },
    ],
    miniQuiz: [
      { question: 'ลิมิตของ $(x+3)$ เมื่อ x→2 คืออะไร', answer: '5' },
      { question: 'ผลต่างกำลังสองของ $x^2-4$ คืออะไร', answer: '$(x-2)(x+2)$' },
      { question: 'ถ้าได้ $0/0$ ควรทำอะไร', answer: 'จัดรูปนิพจน์ก่อนแล้วค่อยแทนค่า' },
    ],
    mcq: {
      q: 'ถ้าแทนค่าแล้วได้ $0/0$ ในโจทย์ลิมิต ขั้นตอนที่เหมาะสมที่สุดคือข้อใด',
      options: ['สรุปว่าลิมิตไม่มี', 'จัดรูปนิพจน์ก่อน', 'ตอบ 0 ทันที', 'ตอบ 1 ทันที'],
      correct: 1,
      explain: '$0/0$ เป็นรูปไม่กำหนด ต้องจัดรูปก่อน เช่น แยกตัวประกอบ',
    },
    teachBackKeywords: ['0/0', 'จัดรูป', 'แยกตัวประกอบ', 'เข้าใกล้'],
  },
  {
    id: 'trigonometry',
    th: 'ตรีโกณมิติ',
    aliases: ['ตรีโกณมิติ', 'trigonometry', '三角'],
    difficulty: 'easy',
    quiz: {
      question: 'ค่าของ $\\sin^2\\theta + \\cos^2\\theta$ เท่ากับเท่าไร',
      answer: '1',
      wrongExample: 'ตอบเป็น $\\sin\\theta+\\cos\\theta$ เพราะลืมอัตลักษณ์พื้นฐาน',
      difficulty: 'easy',
      hint: 'ใช้อัตลักษณ์ตรีโกณพื้นฐานที่ต้องจำให้ได้',
      acceptedPatterns: [/^1$/, /เท่ากับ1/, /ได้1/],
    },
    rule: 'อัตลักษณ์พื้นฐานคือ $\\sin^2\\theta + \\cos^2\\theta = 1$ ใช้ได้ทุกมุม',
    misconception: 'สับสนระหว่างอัตลักษณ์กับการบวกธรรมดา',
    summary: 'ตรีโกณมิติเน้นความสัมพันธ์ของมุมและอัตราส่วน รวมถึงอัตลักษณ์ที่ใช้แปลงนิพจน์',
    flashcards: [
      { front: '$\\sin^2\\theta + \\cos^2\\theta$', back: '1', rule: 'Pythagorean Identity', hint: 'อัตลักษณ์หลักที่ใช้บ่อยที่สุด', example: 'ถ้า $\\sin\\theta=\\frac{3}{5}$ แล้ว $\\cos\\theta=\\frac{4}{5}$ ก็ยังได้ผลรวมเป็น 1', difficulty: 'easy', color: 'teal' },
      { front: 'sin ในสามเหลี่ยมมุมฉาก', back: 'ด้านตรงข้าม / ด้าน斜', rule: 'SOH', hint: 'SOH-CAH-TOA', example: 'sin θ = opposite/hypotenuse', difficulty: 'easy', color: 'accent' },
      { front: 'cos ในสามเหลี่ยมมุมฉาก', back: 'ด้านประชิด / ด้าน斜', rule: 'CAH', hint: 'จำคู่กับ sin', example: 'cos θ = adjacent/hypotenuse', difficulty: 'easy', color: 'blue' },
      { front: 'tan ในสามเหลี่ยมมุมฉาก', back: 'ด้านตรงข้าม / ด้านประชิด', rule: 'TOA', hint: 'ใช้เมื่ออยากเปรียบเทียบสองด้านที่ไม่ใช่ด้าน斜', example: 'tan θ = opposite/adjacent', difficulty: 'easy', color: 'gold' },
    ],
    miniQuiz: [
      { question: '$\\sin^2\\theta + \\cos^2\\theta$ เท่ากับเท่าไร', answer: '1' },
      { question: 'sin θ คืออัตราส่วนของด้านใด', answer: 'ด้านตรงข้าม / ด้าน斜' },
      { question: 'tan θ คืออัตราส่วนของด้านใด', answer: 'ด้านตรงข้าม / ด้านประชิด' },
    ],
    mcq: {
      q: 'ข้อใดถูกต้องเสมอ',
      options: ['$\\sin^2\\theta + \\cos^2\\theta = 1$', '$\\sin\\theta + \\cos\\theta = 1$', '$\\tan\\theta = 1$ ทุกมุม', '$\\sin\\theta = \\cos\\theta$ ทุกมุม'],
      correct: 0,
      explain: 'อัตลักษณ์นี้เป็นจริงเสมอสำหรับทุกมุมที่นิยามได้',
    },
    teachBackKeywords: ['อัตลักษณ์', 'sin', 'cos', '1'],
  },
  {
    id: 'algebra',
    th: 'พีชคณิต',
    aliases: ['พีชคณิต', 'algebra', '代数'],
    difficulty: 'easy',
    quiz: {
      question: 'แก้สมการ $2x+5=17$',
      answer: '$x=6$',
      wrongExample: 'ตอบเป็น $x=11$ เพราะลบ 5 ถูกแล้วแต่ลืมหาร 2',
      difficulty: 'easy',
      hint: 'ทำทีละขั้น: ย้ายค่าคงที่ก่อน แล้วค่อยหารด้วยสัมประสิทธิ์ของ x',
      acceptedPatterns: [/x=6/, /^6$/, /เท่ากับ6/, /ได้6/],
    },
    rule: 'สมการเชิงเส้นแก้โดยรักษาสมดุลทั้งสองข้างของสมการ และทำย้อนจากสิ่งที่กระทำกับ x',
    misconception: 'ลืมหารด้วยสัมประสิทธิ์ของตัวแปรหลังย้ายข้าง',
    summary: 'พีชคณิตเน้นการจัดรูปนิพจน์และแก้สมการโดยใช้สมบัติการเท่ากันอย่างเป็นระบบ',
    flashcards: [
      { front: 'หลักการแก้สมการ', back: 'ทำสิ่งเดียวกันทั้งสองข้างของสมการเสมอ', rule: 'Balance', hint: 'อย่าแก้แค่ข้างเดียว', example: '$2x+5=17 \\Rightarrow 2x=12$', difficulty: 'easy', color: 'gold' },
      { front: 'ถ้า $2x=12$ แล้ว x เท่ากับเท่าไร', back: '6', rule: 'Isolate x', hint: 'หารด้วย 2', example: '$2x/2=12/2$', difficulty: 'easy', color: 'accent' },
      { front: 'ย้าย +5 ไปอีกข้างทำอย่างไร', back: 'ลบ 5 ทั้งสองข้าง', rule: 'Inverse Operation', hint: 'ใช้การกระทำตรงข้าม', example: '$2x+5=17 \\Rightarrow 2x=12$', difficulty: 'easy', color: 'blue' },
      { front: 'เช็กคำตอบอย่างไร', back: 'แทนค่ากลับเข้าโจทย์เดิม', rule: 'Verification', hint: 'แทนแล้วสองข้างต้องเท่ากัน', example: '$2(6)+5=17$', difficulty: 'easy', color: 'teal' },
    ],
    miniQuiz: [
      { question: 'แก้สมการ $x+9=14$', answer: '$x=5$' },
      { question: 'แก้สมการ $3x=15$', answer: '$x=5$' },
      { question: 'หลังจากได้คำตอบควรทำอะไรต่อ', answer: 'แทนค่ากลับเพื่อตรวจสอบ' },
    ],
    mcq: {
      q: 'ข้อใดเป็นขั้นตอนถัดไปที่ถูกต้องหลังจากได้ $2x+5=17$',
      options: ['$2x=12$', '$x=12$', '$2x=22$', '$x=17$'],
      correct: 0,
      explain: 'ลบ 5 ทั้งสองข้างก่อน จึงได้ $2x=12$',
    },
    teachBackKeywords: ['สมดุล', 'ลบ 5', 'หาร 2', 'ตรวจสอบ'],
  },
  {
    id: 'probability',
    th: 'ความน่าจะเป็น',
    aliases: ['ความน่าจะเป็น', 'probability', '確率'],
    difficulty: 'hard',
    quiz: {
      question: 'ทอยลูกเต๋ามาตรฐาน 1 ลูก 1 ครั้ง ความน่าจะเป็นที่จะได้เลขคู่เท่ากับเท่าไร',
      answer: '$\\frac{1}{2}$',
      wrongExample: 'ตอบเป็น $\\frac{1}{6}$ เพราะนับเฉพาะผลลัพธ์เดียว',
      difficulty: 'hard',
      hint: 'นับผลลัพธ์ที่ต้องการและผลลัพธ์ทั้งหมดก่อน',
      acceptedPatterns: [/1\/2/, /ครึ่ง/, /0\.5/],
    },
    rule: 'ความน่าจะเป็น = จำนวนผลลัพธ์ที่ต้องการ / จำนวนผลลัพธ์ทั้งหมด เมื่อทุกผลลัพธ์มีโอกาสเท่ากัน',
    misconception: 'นับจำนวนผลลัพธ์ที่ต้องการผิด หรือไม่ตั้ง sample space ก่อน',
    summary: 'ความน่าจะเป็นเริ่มจากการระบุ sample space ให้ชัด แล้วจึงนับผลลัพธ์ที่เข้าเงื่อนไข',
    flashcards: [
      { front: 'สูตรพื้นฐานของความน่าจะเป็น', back: 'ผลลัพธ์ที่ต้องการ / ผลลัพธ์ทั้งหมด', rule: 'Basic Formula', hint: 'ใช้เมื่อทุกผลลัพธ์มีโอกาสเท่ากัน', example: 'ได้เลขคู่จากลูกเต๋า = 3/6', difficulty: 'medium', color: 'accent' },
      { front: 'Sample Space ของลูกเต๋า 1 ลูก', back: '{1,2,3,4,5,6}', rule: 'Sample Space', hint: 'เขียนให้ครบก่อนนับ', example: 'ทั้งหมดมี 6 ผลลัพธ์', difficulty: 'easy', color: 'blue' },
      { front: 'เลขคู่บนลูกเต๋า', back: '{2,4,6}', rule: 'Desired Outcomes', hint: 'มี 3 ผลลัพธ์', example: 'จึงได้ 3/6', difficulty: 'easy', color: 'teal' },
      { front: '3/6 ย่อได้เป็นอะไร', back: '$\\frac{1}{2}$', rule: 'Simplify Fraction', hint: 'หารด้วย 3 ทั้งเศษและส่วน', example: '3/6 = 1/2', difficulty: 'easy', color: 'gold' },
    ],
    miniQuiz: [
      { question: 'โยนเหรียญ 1 ครั้ง ความน่าจะเป็นออกหัวเท่าไร', answer: '$\\frac{1}{2}$' },
      { question: 'ลูกเต๋ามีผลลัพธ์ทั้งหมดกี่แบบ', answer: '6 แบบ' },
      { question: 'เลขคู่บนลูกเต๋ามีกี่ผลลัพธ์', answer: '3 ผลลัพธ์' },
    ],
    mcq: {
      q: 'ถ้าทอยลูกเต๋า 1 ลูก ความน่าจะเป็นที่จะได้เลขมากกว่า 4 คือข้อใด',
      options: ['$\\frac{1}{3}$', '$\\frac{1}{2}$', '$\\frac{2}{3}$', '$\\frac{1}{6}$'],
      correct: 0,
      explain: 'เลขมากกว่า 4 คือ 5 และ 6 มี 2 ผลลัพธ์จากทั้งหมด 6 จึงเป็น $2/6=1/3$',
    },
    teachBackKeywords: ['sample space', 'ผลลัพธ์ทั้งหมด', 'ผลลัพธ์ที่ต้องการ', 'เศษส่วน'],
  },
  {
    id: 'geometry',
    th: 'เรขาคณิต',
    aliases: ['เรขาคณิต', 'geometry', '幾何'],
    difficulty: 'easy',
    quiz: {
      question: 'หาพื้นที่สามเหลี่ยมที่มีฐาน 8 หน่วย และสูง 5 หน่วย',
      answer: '20',
      wrongExample: 'ตอบเป็น 40 เพราะลืมหาร 2',
      difficulty: 'easy',
      hint: 'ใช้สูตรพื้นที่สามเหลี่ยม = $\\frac{1}{2}bh$',
      acceptedPatterns: [/^20$/, /20หน่วย/, /20 ตาราง/, /ได้20/],
    },
    rule: 'พื้นที่สามเหลี่ยม = $\\frac{1}{2}\\times ฐาน \\times สูง$',
    misconception: 'ใช้สูตรสี่เหลี่ยมแล้วลืมหาร 2',
    summary: 'เรขาคณิตอาศัยสูตรพื้นที่ มุม และความสัมพันธ์ของรูปทรงเพื่อคำนวณอย่างเป็นระบบ',
    flashcards: [
      { front: 'สูตรพื้นที่สามเหลี่ยม', back: '$\\frac{1}{2}bh$', rule: 'Triangle Area', hint: 'คิดเป็นครึ่งหนึ่งของสี่เหลี่ยมผืนผ้า', example: 'ฐาน 8 สูง 5 ได้ 20', difficulty: 'easy', color: 'blue' },
      { front: 'ถ้าฐาน 8 สูง 5 แล้ว $bh$ เท่ากับเท่าไร', back: '40', rule: 'Multiply First', hint: 'คูณก่อนแล้วหาร 2', example: '$8\\times5=40$', difficulty: 'easy', color: 'accent' },
      { front: 'ทำไมต้องหาร 2', back: 'เพราะสามเหลี่ยมเป็นครึ่งหนึ่งของรูปสี่เหลี่ยมที่ฐานและสูงเท่ากัน', rule: 'Geometric Meaning', hint: 'นึกภาพจับคู่เป็นสี่เหลี่ยม', example: 'สองสามเหลี่ยมเท่ากันประกบกันเป็นสี่เหลี่ยม', difficulty: 'easy', color: 'teal' },
      { front: 'หน่วยของพื้นที่', back: 'ตารางหน่วย', rule: 'Units', hint: 'พื้นที่ไม่ใช่หน่วยยาวธรรมดา', example: '20 ตารางหน่วย', difficulty: 'easy', color: 'gold' },
    ],
    miniQuiz: [
      { question: 'ฐาน 10 สูง 4 พื้นที่สามเหลี่ยมเท่าไร', answer: '20' },
      { question: 'สูตรพื้นที่สามเหลี่ยมคืออะไร', answer: '$\\frac{1}{2}bh$' },
      { question: 'พื้นที่มีหน่วยเป็นอะไร', answer: 'ตารางหน่วย' },
    ],
    mcq: {
      q: 'พื้นที่สามเหลี่ยมฐาน 6 สูง 4 เท่ากับข้อใด',
      options: ['12', '24', '10', '8'],
      correct: 0,
      explain: '$\\frac{1}{2}\\times6\\times4=12$',
    },
    teachBackKeywords: ['ครึ่งหนึ่ง', 'ฐาน', 'สูง', 'หาร 2'],
  },
  {
    id: 'statistics',
    th: 'สถิติ',
    aliases: ['สถิติ', 'statistics', '統計'],
    difficulty: 'medium',
    quiz: {
      question: 'ค่าเฉลี่ยของข้อมูล 4, 6, 8, 10 คือเท่าไร',
      answer: '7',
      wrongExample: 'ตอบเป็น 8 เพราะหยิบค่ากลางแบบไม่คำนวณ',
      difficulty: 'medium',
      hint: 'รวมข้อมูลทั้งหมดแล้วหารด้วยจำนวนข้อมูล',
      acceptedPatterns: [/^7$/, /เท่ากับ7/, /ได้7/],
    },
    rule: 'ค่าเฉลี่ยเลขคณิต = ผลรวมของข้อมูล / จำนวนข้อมูล',
    misconception: 'สับสนค่าเฉลี่ยกับมัธยฐานหรือฐานนิยม',
    summary: 'สถิติช่วยสรุปข้อมูลด้วยค่ากลางและการกระจาย โดยต้องเลือกตัวชี้วัดให้เหมาะกับข้อมูล',
    flashcards: [
      { front: 'สูตรค่าเฉลี่ย', back: 'ผลรวมข้อมูล / จำนวนข้อมูล', rule: 'Mean', hint: 'รวมก่อนหารทีหลัง', example: '(4+6+8+10)/4 = 7', difficulty: 'easy', color: 'purple' },
      { front: 'ผลรวมของ 4,6,8,10', back: '28', rule: 'Sum', hint: 'บวกทีละคู่', example: '4+6=10 และ 8+10=18 รวมเป็น 28', difficulty: 'easy', color: 'blue' },
      { front: 'ข้อมูลชุดนี้มีกี่ตัว', back: '4 ตัว', rule: 'Count', hint: 'อย่าลืมนับจำนวนข้อมูล', example: '4,6,8,10 มี 4 ค่า', difficulty: 'easy', color: 'accent' },
      { front: 'ค่าเฉลี่ยต่างจากมัธยฐานอย่างไร', back: 'ค่าเฉลี่ยใช้ผลรวมทั้งหมด ส่วนมัธยฐานดูค่ากลางหลังเรียงข้อมูล', rule: 'Compare Metrics', hint: 'สองอย่างนี้ไม่เหมือนกันเสมอ', example: 'ข้อมูลมี outlier ค่าเฉลี่ยจะเปลี่ยนมากกว่า', difficulty: 'medium', color: 'gold' },
    ],
    miniQuiz: [
      { question: 'ค่าเฉลี่ยของ 2,4,6 คือเท่าไร', answer: '4' },
      { question: 'ก่อนหาค่าเฉลี่ยต้องทำอะไร', answer: 'รวมข้อมูลทั้งหมดก่อน' },
      { question: 'ค่าเฉลี่ยใช้ตัวหารเป็นอะไร', answer: 'จำนวนข้อมูล' },
    ],
    mcq: {
      q: 'ค่าเฉลี่ยของข้อมูล 5, 5, 7, 9 เท่ากับข้อใด',
      options: ['6.5', '7', '6', '5.5'],
      correct: 0,
      explain: 'ผลรวมคือ 26 แล้วหารด้วย 4 จึงได้ 6.5',
    },
    teachBackKeywords: ['ผลรวม', 'จำนวนข้อมูล', 'ค่าเฉลี่ย', 'หาร'],
  },
]

const DEFAULT_TOPIC = TOPIC_SPECS.find((topic) => topic.id === 'algebra') ?? TOPIC_SPECS[0]

const stringifyUserContent = (userContent: LocalAIRequest['userContent']): string => {
  if (typeof userContent === 'string') {
    return userContent
  }

  return userContent
    .map((item) => {
      if (item.type === 'text') {
        return item.text
      }

      return `[image:${item.source.media_type}]`
    })
    .join('\n')
}

const normalizeText = (value: string): string => value
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/\$/g, '')
  .replace(/\\/g, '')

const detectTopics = (text: string): TopicSpec[] => {
  const haystack = text.toLowerCase()
  const matches = TOPIC_SPECS.filter((topic) => topic.aliases.some((alias) => haystack.includes(alias.toLowerCase())))
  return matches.length ? matches : [DEFAULT_TOPIC]
}

const detectTopic = (text: string): TopicSpec => detectTopics(text)[0] ?? DEFAULT_TOPIC

const extractAnswerFromPrompt = (text: string): string => {
  const match = text.match(/คำตอบนักเรียน:\s*([\s\S]*)$/)
  return match?.[1]?.trim() ?? ''
}

const extractExpectedAnswer = (text: string): string => {
  const match = text.match(/เฉลย:\s*([\s\S]*?)\nคำตอบนักเรียน:/)
  return match?.[1]?.trim() ?? ''
}

const extractFileName = (text: string): string | null => {
  const quoted = text.match(/from\s+"([^"]+)"/i)
  if (quoted?.[1]) {
    return quoted[1]
  }

  const thaiQuoted = text.match(/จาก\s+"([^"]+)"/i)
  return thaiQuoted?.[1] ?? null
}

const buildLocalExam = (text: string): FileSummaryData => {
  const matchedTopics = detectTopics(text)
  const topicNames = matchedTopics.map((topic) => topic.th)
  const condensedText = text
    .replace(/Analyze this text content from "[^"]+" and generate a comprehensive learning set:\n\n/i, '')
    .replace(/Analyze this image-based study material from "[^"]+" and generate a comprehensive learning set\./i, '')
    .trim()

  const summarySeed = condensedText && !condensedText.startsWith('[image:')
    ? condensedText.slice(0, 320)
    : matchedTopics.map((topic) => topic.summary).join(' ')

  const questions = matchedTopics
    .slice(0, 5)
    .map((topic) => topic.mcq)

  while (questions.length < 5) {
    questions.push(TOPIC_SPECS[questions.length % TOPIC_SPECS.length].mcq)
  }

  return {
    title: extractFileName(text) ?? 'FlashFix Local Study Pack',
    subject: 'Mathematics',
    summary: summarySeed || 'สรุปอัตโนมัติจากโหมด Local: เนื้อหานี้เกี่ยวข้องกับการแก้โจทย์คณิตศาสตร์เชิงแนวคิดและการประยุกต์สูตรพื้นฐาน',
    topics: topicNames,
    questions,
  }
}

const buildLocalQuiz = (text: string): QuizQuestion => {
  return detectTopic(text).quiz
}

const buildLocalSolution = (text: string): QuizSolution => {
  const topic = detectTopic(text)
  const studentAnswer = extractAnswerFromPrompt(text)
  const expectedAnswer = extractExpectedAnswer(text) || topic.quiz.answer
  const normalizedStudent = normalizeText(studentAnswer)
  const isCorrect = topic.quiz.acceptedPatterns.some((pattern) => pattern.test(normalizedStudent))

  if (isCorrect) {
    return {
      isCorrect: true,
      studentAnswer,
      steps: [
        {
          num: 1,
          title: 'ระบุหลักการที่ถูกต้อง',
          explain: topic.rule,
        },
        {
          num: 2,
          title: 'คำนวณได้สอดคล้องกับคำตอบมาตรฐาน',
          math: expectedAnswer,
          explain: 'คำตอบของนักเรียนอยู่ในรูปที่ยอมรับได้และสอดคล้องกับผลลัพธ์ที่ควรเป็น',
        },
      ],
      keyRule: topic.rule,
      severity: 'minor',
    }
  }

  return {
    isCorrect: false,
    errorType: topic.id,
    errorTypeThai: `จุดพลาดในหัวข้อ${topic.th}`,
    studentAnswer,
    studentMistake: topic.misconception,
    steps: [
      {
        num: 1,
        title: 'ทบทวนโจทย์และสิ่งที่ต้องหา',
        explain: `โจทย์นี้อยู่ในหัวข้อ ${topic.th} จึงต้องเลือกกฎที่ตรงกับสถานการณ์ก่อนเริ่มคำนวณ`,
      },
      {
        num: 2,
        title: 'ใช้กฎหลักให้ตรง',
        math: expectedAnswer,
        explain: topic.rule,
      },
      {
        num: 3,
        title: 'ตรวจจุดพลาดที่พบบ่อย',
        explain: topic.misconception,
      },
    ],
    keyRule: topic.rule,
    commonTrap: topic.misconception,
    severity: topic.difficulty === 'hard' ? 'fundamental' : 'major',
  }
}

const buildTeachBackEvaluation = (text: string): TeachBackEvaluation => {
  const topic = detectTopic(text)
  const lowerText = text.toLowerCase()
  const matchedKeywords = topic.teachBackKeywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()))
  const lengthScore = text.trim().length >= 120 ? 3 : text.trim().length >= 60 ? 2 : text.trim().length >= 20 ? 1 : 0
  const keywordScore = Math.min(4, matchedKeywords.length)
  const structureScore = /(เพราะ|ดังนั้น|ขั้น|ก่อน|แล้ว)/.test(text) ? 2 : 0
  const score = Math.max(1, Math.min(10, lengthScore + keywordScore + structureScore + 1))
  const passed = score >= 6
  const missingKeywords = topic.teachBackKeywords.filter((keyword) => !matchedKeywords.includes(keyword))

  return {
    score,
    passed,
    feedback: passed
      ? `อธิบายได้ค่อนข้างชัดเจนในหัวข้อ ${topic.th} และเชื่อมหลักการกับวิธีทำได้ดี`
      : `คำอธิบายยังไม่พอสำหรับหัวข้อ ${topic.th} ควรอธิบายเหตุผลของแต่ละขั้นให้ชัดขึ้นและย้ำกฎหลัก`,
    conceptGap: missingKeywords.length > 0
      ? `ยังไม่ได้พูดถึง ${missingKeywords.slice(0, 2).join(' และ ')}`
      : null,
    encouragement: passed
      ? 'ต่อยอดได้อีกโดยลองยกตัวอย่างใหม่ด้วยคำของตัวเองอีกหนึ่งข้อ'
      : 'ลองเขียนใหม่โดยเริ่มจากกฎหลักก่อน แล้วตามด้วยขั้นตอนและเหตุผลของแต่ละขั้น',
  }
}

const buildFlashcards = (text: string) => {
  const topic = detectTopic(text)
  return {
    flashcards: topic.flashcards,
    miniQuiz: topic.miniQuiz,
  }
}

const buildAssistantReply = (text: string): { response: string } => {
  const topic = detectTopic(text)
  const wantsExample = /ตัวอย่าง|example|explain|อธิบาย/.test(text.toLowerCase())
  const example = topic.flashcards[0]?.example ? `ตัวอย่างเร็ว: ${topic.flashcards[0].example}` : ''

  return {
    response: [
      `หัวข้อหลักตอนนี้คือ ${topic.th}`,
      topic.summary,
      `กฎที่ควรจำ: ${topic.rule}`,
      wantsExample && example ? example : 'ถ้ายังสับสน ให้เริ่มจากโจทย์ง่ายหนึ่งข้อแล้วเช็กว่าคุณใช้กฎถูกตัวหรือไม่',
      'Actionable takeaway: ลองอธิบายกฎนี้ด้วยคำของตัวเอง 1 ประโยค แล้วค่อยทำโจทย์ใหม่อีกข้อ',
    ].filter(Boolean).join('\n\n'),
  }
}

export const generateLocalAIResponse = (request: LocalAIRequest): unknown => {
  const systemPrompt = request.systemPrompt
  const flattenedContent = stringifyUserContent(request.userContent)

  if (systemPrompt.includes('Diagnostic Quiz')) {
    return buildLocalQuiz(`${systemPrompt}\n${flattenedContent}`)
  }

  if (systemPrompt.includes('Error Analysis') || systemPrompt.includes('ตรวจคำตอบของนักเรียน')) {
    return buildLocalSolution(flattenedContent)
  }

  if (systemPrompt.includes('Teach-Back') || systemPrompt.includes('สอนกลับ')) {
    return buildTeachBackEvaluation(flattenedContent)
  }

  if (systemPrompt.includes('Flashcards') || systemPrompt.includes('Spaced Repetition')) {
    return buildFlashcards(flattenedContent)
  }

  if (systemPrompt.includes('FlashFix AI Assistant')) {
    return buildAssistantReply(flattenedContent)
  }

  if (systemPrompt.includes('วิเคราะห์เนื้อหาจากการเรียนการสอน') || systemPrompt.includes('สร้างข้อสอบคุณภาพสูง')) {
    return buildLocalExam(flattenedContent)
  }

  return {
    response: 'FlashFix Local mode พร้อมตอบคำถามพื้นฐานได้ แต่คำสั่งนี้ยังไม่อยู่ในชุด fallback ที่กำหนดไว้',
  }
}
