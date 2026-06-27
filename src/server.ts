/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';
import { GoogleGenAI, Type } from '@google/genai';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json({ limit: '50mb' })); // support larger image base64 payloads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env['GEMINI_API_KEY'];
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Memory store for full-stack operation
const users = [
  { id: '1', username: 'admin_super', name: 'Super Admin', role: 'Admin', credit: 9999999.00, balance: 9999999.00, discount: 0, active: true },
  { id: '2', username: 'master_bkk', name: 'Master Bangkok', role: 'Master', credit: 500000.00, balance: 500000.00, discount: 10, active: true },
  { id: '3', username: 'agent_007', name: 'Agent Seven', role: 'Agent', credit: 150000.00, balance: 150000.00, discount: 8, active: true },
  { id: '4', username: 'member_vip', name: 'VIP Player', role: 'Member', credit: 25000.00, balance: 25000.00, discount: 5, active: true },
  { id: '5', username: 'member_002', name: 'Normal Player', role: 'Member', credit: 1500.00, balance: 1500.00, discount: 5, active: false }
];

const lotteries = [
  { id: '1', name: 'หวยรัฐบาลไทย', flag: '🇹🇭', period: '16 มี.ค. 67', closeTime: '16 มี.ค. 67 15:20 น.', status: 'open', totalBet: 1250000, limit: 2000000, progress: 62.5 },
  { id: '2', name: 'หวยฮานอย (ปกติ)', flag: '🇻🇳', period: '14 มี.ค. 67', closeTime: 'วันนี้ 18:00 น.', status: 'open', totalBet: 45000, limit: 100000, progress: 45 },
  { id: '3', name: 'หวยลาวพัฒนา', flag: '🇱🇦', period: '15 มี.ค. 67', closeTime: 'พรุ่งนี้ 20:00 น.', status: 'open', totalBet: 85000, limit: 100000, progress: 85 },
  { id: '4', name: 'หวยมาเลย์', flag: '🇲🇾', period: '13 มี.ค. 67', closeTime: 'เมื่อวาน 18:00 น.', status: 'closed', totalBet: 50000, limit: 50000, progress: 100 }
];

const slips = [
  { id: '10293', time: '16 มี.ค. 67 14:30', user: 'admin_super', lotto: 'หวยรัฐบาลไทย', details: '3 ตัวบน [603]', amount: 1500, payout: 1350000, status: 'won' },
  { id: '10292', time: '16 มี.ค. 67 14:25', user: 'master_bkk', lotto: 'หวยรัฐบาลไทย', details: '2 ตัวล่าง [79]', amount: 500, payout: 45000, status: 'won' },
  { id: '10291', time: '16 มี.ค. 67 14:20', user: 'agent_007', lotto: 'หวยรัฐบาลไทย', details: '3 ตัวโต๊ด [306]', amount: 2000, payout: 0, status: 'lost' },
  { id: '10290', time: '16 มี.ค. 67 14:15', user: 'member_vip', lotto: 'หวยฮานอย', details: 'วิ่งบน [6]', amount: 10000, payout: 0, status: 'pending' },
  { id: '10289', time: '16 มี.ค. 67 14:10', user: 'member_002', lotto: 'หวยลาว', details: '2 ตัวบน [03]', amount: 1000, payout: 0, status: 'cancelled' }
];

const blockedNumbers = ['111', '222', '333', '444', '555', '666', '777', '888', '999', '000', '12', '21'];

const reducedNumbers = [
  { number: '987', type: '3 ตัวบน', payRate: 450 },
  { number: '789', type: '3 ตัวบน', payRate: 450 },
  { number: '89', type: '2 ตัวล่าง', payRate: 45 },
  { number: '98', type: '2 ตัวล่าง', payRate: 45 }
];

const links = [
  { id: '1', name: 'ลูกค้า VIP กลุ่ม A', code: 'ref_a9b8c7', url: '/bet/ref_a9b8c7', expires: 'ไม่มีวันหมดอายุ', active: true, totalBet: 150000 },
  { id: '2', name: 'โปรโมชั่น Facebook', code: 'ref_fb2024', url: '/bet/ref_fb2024', expires: '30 เม.ย. 67', active: true, totalBet: 45000 },
  { id: '3', name: 'ลูกค้าใหม่ทดลอง', code: 'ref_test01', url: '/bet/ref_test01', expires: '15 มี.ค. 67', active: false, totalBet: 500 }
];

const notifications = [
  { id: '1', title: 'ผู้ใช้งานใหม่ผ่านลิงก์', message: 'มีโพยแทงจาก ลิงก์ลูกค้า VIP กลุ่ม A ยอดรวม ฿15,000', time: '5 นาทีที่แล้ว', read: false },
  { id: '2', title: 'แจ้งเตือนระบบ', message: 'ระบบหลังบ้านและเซิร์ฟเวอร์พร้อมเชื่อมต่อธนาคารพาณิชย์ 24 ชม.', time: '1 ชั่วโมงที่แล้ว', read: true }
];

const resultsHistory = [
  { id: '1', period: '1 มีนาคม 2567', time: '15:30 น.', prize1: '253603', top3: '603', top2: '03', bottom2: '79' },
  { id: '2', period: '16 กุมภาพันธ์ 2567', time: '15:30 น.', prize1: '941395', top3: '395', top2: '95', bottom2: '43' },
  { id: '3', period: '1 กุมภาพันธ์ 2567', time: '15:30 น.', prize1: '607063', top3: '063', top2: '63', bottom2: '09' }
];

const recentActivities = [
  { id: '1', title: 'แทงหวยรัฐบาล', description: 'admin_super • โพย #10293', time: '2 นาทีที่แล้ว', amount: '฿1,500', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' },
  { id: '2', title: 'เติมเครดิต', description: 'agent_007 • โอนผ่านธนาคาร', time: '15 นาทีที่แล้ว', amount: '+฿10,000', colorClass: 'bg-emerald-500', amountClass: 'text-emerald-600' },
  { id: '3', title: 'แทงหวยฮานอย', description: 'member_vip • โพย #10292', time: '32 นาทีที่แล้ว', amount: '฿500', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' },
  { id: '4', title: 'ถอนเงิน', description: 'admin_super • โอนผ่านธนาคาร', time: '1 ชั่วโมงที่แล้ว', amount: '-฿5,000', colorClass: 'bg-red-500', amountClass: 'text-red-600' },
  { id: '5', title: 'แทงหวยลาว', description: 'member_bkk • โพย #10291', time: '2 ชั่วโมงที่แล้ว', amount: '฿2,000', colorClass: 'bg-blue-500', amountClass: 'text-slate-900' }
];

// --- AUTH API ---
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const foundUser = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
  
  if ((username === 'admin' && password === 'demo') || (foundUser && password === 'demo')) {
    const userObj = foundUser || users[0];
    res.status(200).json({
      access_token: 'mock-jwt-token-express-' + Math.random(),
      refresh_token: 'mock-refresh-token-express-' + Math.random(),
      user: {
        id: userObj.id,
        username: userObj.username,
        email: `${userObj.username}@lotto.com`,
        role: userObj.role.toLowerCase() as any,
        balance: userObj.credit,
        createdAt: new Date().toISOString()
      },
      expiresIn: 3600
    });
  } else {
    res.status(401).json({ message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' });
  }
});

app.post('/api/v1/auth/refresh', (req, res) => {
  res.status(200).json({
    access_token: 'mock-jwt-token-refreshed-' + Math.random(),
    refresh_token: 'mock-refresh-token-new-' + Math.random(),
    user: users[0],
    expiresIn: 3600
  });
});

// --- USERS API ---
app.get('/api/v1/users', (req, res) => {
  res.status(200).json(users);
});

app.post('/api/v1/users', (req, res) => {
  const newUser = {
    id: String(users.length + 1),
    username: req.body.username || 'user_' + Math.random().toString(36).substring(7),
    name: req.body.name || 'New Member',
    role: req.body.role || 'Member',
    credit: Number(req.body.credit) || 1000.00,
    balance: Number(req.body.credit) || 1000.00,
    discount: Number(req.body.discount) || 5,
    active: true
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/v1/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    if (req.body.active !== undefined) user.active = req.body.active;
    if (req.body.credit !== undefined) {
      user.credit = Number(req.body.credit);
      user.balance = Number(req.body.credit);
    }
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.role !== undefined) user.role = req.body.role;
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// --- LOTTERIES API ---
app.get('/api/v1/lotteries', (req, res) => {
  res.status(200).json(lotteries);
});

app.post('/api/v1/lotteries', (req, res) => {
  const newLotto = {
    id: String(lotteries.length + 1),
    name: req.body.name || 'หวยใหม่',
    flag: req.body.flag || '🎲',
    period: req.body.period || '30 มี.ค. 67',
    closeTime: req.body.closeTime || '15:20 น.',
    status: 'open',
    totalBet: 0,
    limit: Number(req.body.limit) || 100000,
    progress: 0
  };
  lotteries.push(newLotto as any);
  res.status(201).json(newLotto);
});

app.put('/api/v1/lotteries/:id', (req, res) => {
  const lotto = lotteries.find(l => l.id === req.params.id);
  if (lotto) {
    if (req.body.status !== undefined) lotto.status = req.body.status;
    if (req.body.totalBet !== undefined) {
      lotto.totalBet = Number(req.body.totalBet);
      lotto.progress = Number(((lotto.totalBet / lotto.limit) * 100).toFixed(1));
    }
    res.status(200).json(lotto);
  } else {
    res.status(404).json({ message: 'Lottery not found' });
  }
});

// --- BETS API ---
app.get('/api/v1/bets', (req, res) => {
  res.status(200).json(slips);
});

app.post('/api/v1/bets', (req, res) => {
  const { betsList, username, lottoName } = req.body;
  if (!betsList || !Array.isArray(betsList)) {
    return res.status(400).json({ message: 'Invalid bets list' });
  }

  const total = betsList.reduce((sum, b) => sum + b.amount, 0);
  const discountAmount = total * 0.05;
  const netAmount = total - discountAmount;

  // Deduct user balance
  const activeUser = users.find(u => u.username === username) || users[0];
  if (activeUser.credit < netAmount) {
    return res.status(400).json({ message: 'ยอดเครดิตคงเหลือไม่เพียงพอ' });
  }

  activeUser.credit -= netAmount;
  activeUser.balance = activeUser.credit;

  // Append new slips
  betsList.forEach(b => {
    const newSlip = {
      id: String(Math.floor(10000 + Math.random() * 90000)),
      time: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      user: activeUser.username,
      lotto: lottoName || 'หวยรัฐบาลไทย',
      details: `${b.typeName || b.type} [${b.number}]`,
      amount: b.amount,
      payout: 0,
      status: 'pending'
    };
    slips.unshift(newSlip);
    
    // update lotto stats
    const thaiLotto = lotteries.find(l => l.id === '1');
    if (thaiLotto) {
      thaiLotto.totalBet += b.amount;
      thaiLotto.progress = Number(((thaiLotto.totalBet / thaiLotto.limit) * 100).toFixed(1));
    }

    // record activity
    recentActivities.unshift({
      id: String(Date.now() + Math.random()),
      title: 'แทงหวยรัฐบาล',
      description: `${activeUser.username} • โพย #${newSlip.id}`,
      time: 'เมื่อสักครู่',
      amount: `฿${b.amount}`,
      colorClass: 'bg-blue-500',
      amountClass: 'text-slate-900'
    });
  });

  return res.status(201).json({ success: true, balance: activeUser.credit });
});

// --- RISK API ---
app.get('/api/v1/risk', (req, res) => {
  return res.status(200).json({ blockedNumbers, reducedNumbers });
});

app.post(['/api/v1/risk/block', '/api/v1/risk/blocked'], (req, res) => {
  const { number } = req.body;
  if (number && !blockedNumbers.includes(number)) {
    blockedNumbers.push(number);
  }
  return res.status(200).json({ blockedNumbers });
});

app.post(['/api/v1/risk/reduce', '/api/v1/risk/reduced'], (req, res) => {
  const { number, type, payRate } = req.body;
  const existing = reducedNumbers.find(r => r.number === number);
  if (existing) {
    existing.payRate = Number(payRate);
    existing.type = type;
  } else {
    reducedNumbers.push({ number, type, payRate: Number(payRate) });
  }
  return res.status(200).json({ reducedNumbers });
});

app.delete(['/api/v1/risk/block/:num', '/api/v1/risk/blocked/:num'], (req, res) => {
  const num = req.params['num'] as string;
  const index = blockedNumbers.indexOf(num);
  if (index > -1) {
    blockedNumbers.splice(index, 1);
  }
  return res.status(200).json({ blockedNumbers });
});

app.delete(['/api/v1/risk/reduce/:num', '/api/v1/risk/reduced/:num'], (req, res) => {
  const num = req.params['num'] as string;
  const index = reducedNumbers.findIndex(r => r.number === num);
  if (index > -1) {
    reducedNumbers.splice(index, 1);
  }
  return res.status(200).json({ reducedNumbers });
});

// --- RESULTS API ---
app.get('/api/v1/results', (req, res) => {
  res.status(200).json(resultsHistory);
});

app.post('/api/v1/results', (req, res) => {
  const { period, prize1, top3, top2, bottom2 } = req.body;
  const newResult = {
    id: String(resultsHistory.length + 1),
    period: period || '16 มีนาคม 2567',
    time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    prize1: prize1 || '000000',
    top3: top3 || prize1.slice(-3),
    top2: top2 || prize1.slice(-2),
    bottom2: bottom2 || '00'
  };
  resultsHistory.unshift(newResult);
  res.status(201).json(newResult);
});

// --- LINKS API ---
app.get('/api/v1/links', (req, res) => {
  res.status(200).json(links);
});

app.get('/api/v1/links/:code', (req, res) => {
  const code = req.params.code;
  const link = links.find(l => l.code === code);
  if (!link) {
    return res.status(404).json({ message: 'ไม่พบลิงก์นี้ในระบบ' });
  }
  return res.status(200).json({
    link,
    lotteries: lotteries.filter(l => l.status === 'open')
  });
});

app.post('/api/v1/links', (req, res) => {
  const code = 'ref_' + Math.random().toString(36).substring(4, 10);
  const newLink = {
    id: String(links.length + 1),
    name: req.body.name || 'ลิงก์ลูกค้าใหม่',
    code: code,
    url: '/bet/' + code,
    expires: req.body.duration || 'ไม่มีวันหมดอายุ',
    active: true,
    totalBet: 0
  };
  links.push(newLink);
  res.status(201).json(newLink);
});

app.delete('/api/v1/links/:id', (req, res) => {
  const index = links.findIndex(l => l.id === req.params.id);
  if (index > -1) {
    links.splice(index, 1);
  }
  res.status(200).json(links);
});

// --- NOTIFICATIONS API ---
app.get('/api/v1/notifications', (req, res) => {
  res.status(200).json(notifications);
});

app.post('/api/v1/notifications/read-all', (req, res) => {
  notifications.forEach(n => n.read = true);
  res.status(200).json({ success: true, notifications });
});

// --- PUBLIC BET VIA LINK API ---
app.post('/api/v1/bet-via-link', (req, res) => {
  const { linkCode, playerName, betsList } = req.body;
  const link = links.find(l => l.code === linkCode);
  
  if (!link) {
    return res.status(404).json({ message: 'ไม่พบลิงก์รับแทงนี้ หรือลิงก์อาจถูกลบไปแล้ว' });
  }
  if (!link.active) {
    return res.status(400).json({ message: 'ลิงก์รับแทงนี้ปิดการใช้งานแล้ว' });
  }
  if (!betsList || !Array.isArray(betsList) || betsList.length === 0) {
    return res.status(400).json({ message: 'รายการแทงไม่ถูกต้อง' });
  }

  const totalAmount = betsList.reduce((sum: number, b: any) => sum + Number(b.amount || 0), 0);
  link.totalBet += totalAmount;

  // Append new slips to global history
  betsList.forEach((b: any) => {
    const newSlip = {
      id: String(Math.floor(10000 + Math.random() * 90000)),
      time: new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      user: `ลิงก์: ${link.name} (${playerName || 'ลูกค้าทั่วไป'})`,
      lotto: b.lottoName || 'หวยรัฐบาลไทย',
      details: `${b.typeName || b.type} [${b.number}]`,
      amount: Number(b.amount),
      payout: 0,
      status: 'pending'
    };
    slips.unshift(newSlip);

    // Update progress of corresponding lottery
    const targetLotto = lotteries.find(l => l.name === b.lottoName);
    if (targetLotto) {
      targetLotto.totalBet += Number(b.amount);
      targetLotto.progress = Number(((targetLotto.totalBet / targetLotto.limit) * 100).toFixed(1));
    }

    // Record activity
    recentActivities.unshift({
      id: String(Date.now() + Math.random()),
      title: `แทงผ่านลิงก์: ${link.name}`,
      description: `${playerName || 'ลูกค้าทั่วไป'} • โพย #${newSlip.id}`,
      time: 'เมื่อสักครู่',
      amount: `฿${b.amount}`,
      colorClass: 'bg-indigo-500',
      amountClass: 'text-indigo-600 font-bold'
    });
  });

  // Create notifications
  notifications.unshift({
    id: String(Date.now()),
    title: `แทงผ่านลิงก์ [${link.name}]`,
    message: `มีผู้แทงจากลิงก์เข้ามาใหม่โดยคุณ ${playerName || 'ทั่วไป'} ยอดแทงรวม ฿${totalAmount.toLocaleString()}`,
    time: 'เมื่อสักครู่',
    read: false
  });

  return res.status(201).json({ success: true, totalAmount, totalBet: link.totalBet });
});

// --- OCR & SMART LOTTERY PARSER API ---
app.post('/api/v1/betting/ocr-parse', async (req, res) => {
  try {
    const { imageBase64, mimeType, textInput } = req.body;
    const ai = getGeminiClient();

    const contents: any[] = [];
    const systemInstruction = `You are an expert Thai lottery slip parser.
Your task is to parse Thai handwritten or typed lottery slips (from images or pasted text) and extract the list of bets.
Translate colloquial terms to standard types:
- 3 ตัวบน -> '3up'
- 3 ตัวโต๊ด -> '3tod'
- 2 ตัวบน -> '2up'
- 2 ตัวล่าง -> '2down'
- วิ่งบน / วิ่ง บ -> 'runup'
- วิ่งล่าง / วิ่ง ล -> 'rundown'

If a line has a 3-digit number and specifies "=100" or similar without a type, assume '3up' (3 ตัวบน). If it says "=100x100" or similar, the first is '3up' with amount 100, and the second is '3tod' with secondaryAmount 100.
If a line has a 2-digit number, assume '2up' and '2down' if both are mentioned, or map 'บ' to '2up' and 'ล' to '2down'. If both are mentioned (e.g. บ-ล or บนล่าง), set type as '2up' and amount, and set secondaryAmount or flag so it can be handled.
If '19 ประตู' or 'รูด' is mentioned for a number, set is19Doors to true.
If 'กลับ' or 'ก' or 'x6' is mentioned, set isReverse to true.

Always return a valid JSON array of bets. Keep numbers as strings (since they can have leading zeros like '05' or '003').`;

    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64
        }
      });
      contents.push({
        text: "Please perform OCR on this lottery slip image and extract all bets in JSON format according to the schema."
      });
    } else if (textInput) {
      contents.push({
        text: `Please parse this lottery slip text and extract all bets in JSON format according to the schema:\n\n${textInput}`
      });
    } else {
      return res.status(400).json({ message: "กรุณาระบุรูปภาพหรือข้อความเพื่อประมวลผล" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rawText: {
              type: Type.STRING,
              description: "Transcribed raw text from the image."
            },
            bets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING },
                  type: { 
                    type: Type.STRING,
                    description: "strictly '3up', '3tod', '2up', '2down', 'runup', or 'rundown'"
                  },
                  amount: { type: Type.NUMBER },
                  secondaryAmount: { type: Type.NUMBER },
                  isReverse: { type: Type.BOOLEAN },
                  is19Doors: { type: Type.BOOLEAN }
                },
                required: ["number", "type", "amount"]
              }
            }
          },
          required: ["bets"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{"bets":[]}');
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error("OCR Parse error:", error);
    return res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในการประมวลผลด้วย AI", 
      details: error.message 
    });
  }
});

// --- DASHBOARD API ---
app.get('/api/v1/dashboard/stats', (req, res) => {
  const totalUsers = users.length;
  const todayBets = slips.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0);
  const totalRevenue = slips.reduce((sum, s) => sum + s.amount, 0);
  const totalPayout = slips.reduce((sum, s) => sum + s.payout, 0);
  const netProfit = totalRevenue - totalPayout;

  res.status(200).json({
    totalUsers,
    todayBets,
    totalRevenue,
    totalPayout,
    netProfit,
    activeLotteries: lotteries,
    recentActivities: recentActivities.slice(0, 5)
  });
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
