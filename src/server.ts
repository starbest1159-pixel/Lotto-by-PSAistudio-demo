/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());

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
  { id: '1', name: 'ลูกค้า VIP กลุ่ม A', url: 'https://lotto.app/bet/ref_a9b8c7', expires: 'ไม่มีวันหมดอายุ', active: true, totalBet: 150000 },
  { id: '2', name: 'โปรโมชั่น Facebook', url: 'https://lotto.app/bet/ref_fb2024', expires: '30 เม.ย. 67', active: true, totalBet: 45000 },
  { id: '3', name: 'ลูกค้าใหม่ทดลอง', url: 'https://lotto.app/bet/ref_test01', expires: '15 มี.ค. 67', active: false, totalBet: 500 }
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
  const { betsList, username } = req.body;
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
      lotto: 'หวยรัฐบาลไทย',
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

app.post('/api/v1/links', (req, res) => {
  const newLink = {
    id: String(links.length + 1),
    name: req.body.name || 'ลิงก์ลูกค้าใหม่',
    url: 'https://lotto.app/bet/ref_' + Math.random().toString(36).substring(4, 10),
    expires: req.body.expires || '30 วัน',
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
