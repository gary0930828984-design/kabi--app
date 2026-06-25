import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const EXCHANGE_RATE = 0.21;
const USERS_KEY = 'kabi_users';
const SESSION_KEY = 'kabi_session';
const DATA_PREFIX = 'kabi_data_';
const SHEET_ID = '124cLeWSpnOmYA6qHT2tKbxo9MF697ncR';
const CLIENT_ID =
  '957526226643-8jqf17mg6lsi3crnnagiipgfd5jv8p3t.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const SHEET_NAME = '商品試算表';

const COLORS = {
  chart: [
    '#fb923c',
    '#f59e0b',
    '#4ade80',
    '#34d399',
    '#60a5fa',
    '#a78bfa',
    '#f472b6',
  ],
};
const fmt = (n) => (n == null ? '—' : Math.round(n).toLocaleString());
const fmtPct = (n) => (n == null ? '—' : (n * 100).toFixed(1) + '%');
const genId = () => Math.random().toString(36).slice(2, 9);

const SEED_PRODUCTS = [
  {id:'cuc6oa2',name:'Cx01蒼龍勇氣',price:700,costJpy:2090,costTwd:438.9,stock:8,sold:6,note:''},
  {id:'9oek6la',name:'Cx02魔導至尊',price:700,costJpy:1999,costTwd:419.79,stock:4,sold:4,note:''},
  {id:'c202rl8',name:'Cx03英仙幽冥',price:500,costJpy:1520,costTwd:319.2,stock:9,sold:6,note:''},
  {id:'6xpjilt',name:'Cx05抽抽包',price:0,costJpy:1300,costTwd:273.0,stock:6,sold:0,note:''},
  {id:'4nt4s0f',name:'CX07天馬爆擊',price:900,costJpy:2080,costTwd:436.8,stock:12,sold:2,note:''},
  {id:'f7773qa',name:'Cx09焰神滅世',price:550,costJpy:0,costTwd:0,stock:1,sold:1,note:'⚠️ 缺成本'},
  {id:'wrsbwfm',name:'Cx10銀狼狩獵',price:600,costJpy:1610,costTwd:338.1,stock:8,sold:6,note:''},
  {id:'cxaqboe',name:'CX12鳳凰閃焰',price:600,costJpy:1499,costTwd:314.79,stock:6,sold:3,note:''},
  {id:'71ukzgz',name:'Cx13龍王閃擊',price:600,costJpy:1980,costTwd:415.8,stock:7,sold:0,note:''},
  {id:'tno17gk',name:'Cx14騎士堡壘',price:700,costJpy:2200,costTwd:462.0,stock:8,sold:2,note:''},
  {id:'va0kqny',name:'Cx15邪神狂怒',price:600,costJpy:1399,costTwd:293.79,stock:9,sold:3,note:''},
  {id:'rvngfdo',name:'Cx17-劍心',price:650,costJpy:1480,costTwd:310.8,stock:1,sold:1,note:''},
  {id:'d9p8alc',name:'Cx17抽抽包',price:850,costJpy:1480,costTwd:310.8,stock:4,sold:0,note:''},
  {id:'i1p8d6y',name:'Cx17抽抽包',price:650,costJpy:1480,costTwd:310.8,stock:4,sold:0,note:''},
  {id:'74hlb8w',name:'Bx01蒼龍神劍',price:650,costJpy:1800,costTwd:378.0,stock:1,sold:1,note:''},
  {id:'luugxau',name:'Bx13騎士長槍',price:550,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'4oc9d9c',name:'Bx26獨角劍心',price:550,costJpy:1380,costTwd:289.8,stock:1,sold:0,note:''},
  {id:'v9mvdgi',name:'Bx31暴龍抽抽包',price:600,costJpy:1400,costTwd:294.0,stock:6,sold:5,note:''},
  {id:'x90efvu',name:'Bx33皓戰猛虎',price:500,costJpy:1140,costTwd:239.4,stock:2,sold:2,note:''},
  {id:'nq89hvi',name:'Bx34蒼穹龍騎士',price:900,costJpy:1880,costTwd:394.8,stock:1,sold:0,note:''},
  {id:'bb3cbao',name:'Bx35-藍鳳',price:1500,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'oqg4yki',name:'Bx35-神杖',price:2500,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'ed04pxq',name:'Bx35-神杖',price:3200,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'r2o7525',name:'Bx44三角強襲',price:450,costJpy:1299,costTwd:272.79,stock:4,sold:3,note:''},
  {id:'vd9cglw',name:'Bx48黑色抽抽包',price:1000,costJpy:1700,costTwd:357.0,stock:1,sold:1,note:''},
  {id:'r1y69pe',name:'Bx48黑色抽抽包',price:900,costJpy:1700,costTwd:357.0,stock:1,sold:1,note:''},
  {id:'t8ceeci',name:'Bx48黑色抽抽包',price:0,costJpy:1700,costTwd:357.0,stock:2,sold:0,note:''},
  {id:'y3qou34',name:'Bx49蒼龍突擊',price:1300,costJpy:2199,costTwd:461.79,stock:14,sold:14,note:''},
  {id:'1lhho8y',name:'Bx49蒼龍突擊',price:1600,costJpy:2199,costTwd:461.79,stock:2,sold:2,note:''},
  {id:'8ysgzkv',name:'Bx49蒼龍突擊',price:1500,costJpy:2199,costTwd:461.79,stock:2,sold:2,note:''},
  {id:'h353dh5',name:'Bx49蒼龍突擊',price:1000,costJpy:2199,costTwd:461.79,stock:8,sold:0,note:''},
  {id:'y2ab85u',name:'UX02惡魔重錘',price:800,costJpy:1620,costTwd:340.2,stock:2,sold:0,note:''},
  {id:'j8baxom',name:'Ux09武士星劍',price:1000,costJpy:3300,costTwd:693.0,stock:5,sold:5,note:''},
  {id:'yeicyu6',name:'Ux09武士星劍',price:900,costJpy:3300,costTwd:693.0,stock:1,sold:1,note:''},
  {id:'tyty77c',name:'Ux11衝擊龍神',price:1500,costJpy:2170,costTwd:455.7,stock:5,sold:3,note:''},
  {id:'4r0s6vw',name:'Ux11衝擊龍神',price:1400,costJpy:2170,costTwd:455.7,stock:4,sold:4,note:''},
  {id:'73qg4v2',name:'Ux14天蠍長矛',price:700,costJpy:1880,costTwd:394.8,stock:2,sold:0,note:''},
  {id:'54xmge0',name:'Ux16時鐘抽抽包',price:0,costJpy:0,costTwd:0,stock:0,sold:0,note:''},
  {id:'1pwfy85',name:'UX17隕星龍騎士',price:1100,costJpy:1880,costTwd:394.8,stock:2,sold:2,note:''},
  {id:'6hem4lt',name:'Ux18抽抽包',price:700,costJpy:1600,costTwd:336.0,stock:1,sold:0,note:''},
  {id:'yifhobo',name:'Ux19彈丸獅鷲',price:650,costJpy:2080,costTwd:436.8,stock:1,sold:1,note:''},
  {id:'yp1m537',name:'Ux19彈丸獅鷲',price:950,costJpy:2080,costTwd:436.8,stock:3,sold:3,note:''},
  {id:'vuccazr',name:'Ux19彈丸獅鷲',price:1000,costJpy:2080,costTwd:436.8,stock:20,sold:5,note:''},
  {id:'m1lps7i',name:'Bx09通行證',price:1500,costJpy:2700,costTwd:567.0,stock:3,sold:3,note:''},
  {id:'62dhf2f',name:'Bx09通行證',price:1700,costJpy:3300,costTwd:693.0,stock:4,sold:2,note:''},
  {id:'c65fhbu',name:'Bx09通行證',price:1700,costJpy:4000,costTwd:840.0,stock:2,sold:2,note:''},
  {id:'tt39wir',name:'BX41握把（紅）',price:400,costJpy:1080,costTwd:226.8,stock:3,sold:3,note:''},
  {id:'d9x7dcp',name:'Bx42握把（藍）',price:400,costJpy:1350,costTwd:283.5,stock:2,sold:2,note:''},
  {id:'091g4id',name:'Bx18發射器（黑）',price:400,costJpy:990,costTwd:207.9,stock:7,sold:6,note:''},
  {id:'muzob3y',name:'BX28發射器（白）',price:500,costJpy:990,costTwd:207.9,stock:2,sold:2,note:''},
  {id:'gx8g3j8',name:'BX00發射器（綠）',price:500,costJpy:990,costTwd:207.9,stock:1,sold:1,note:''},
  {id:'2lx4dnl',name:'Bx00發射器（橘）',price:500,costJpy:990,costTwd:207.9,stock:3,sold:3,note:''},
  {id:'7qlppyp',name:'Bx00發射器（粉）',price:500,costJpy:990,costTwd:207.9,stock:1,sold:0,note:''},
  {id:'qxd37yw',name:'Bx25陀螺包（黑）',price:1200,costJpy:3400,costTwd:714.0,stock:2,sold:2,note:''},
  {id:'ce69ym4',name:'Bx25陀螺包（黑）',price:1308,costJpy:3400,costTwd:714.0,stock:4,sold:2,note:''},
  {id:'8fnq53v',name:'BX43陀螺包（白）',price:1100,costJpy:3480,costTwd:730.8,stock:5,sold:2,note:''},
  {id:'afjmej2',name:'BX-00讀賣巨人聯名款',price:2300,costJpy:5500,costTwd:1155.0,stock:1,sold:1,note:''},
  {id:'z50qxqb',name:'BX-00鮫鯊鋒鰭',price:1100,costJpy:4000,costTwd:840.0,stock:1,sold:1,note:''},
  {id:'8ap81su',name:'一番賞發射器',price:1400,costJpy:1350,costTwd:283.5,stock:1,sold:1,note:''},
  {id:'s7753xn',name:'Bx10戰鬥盤',price:1800,costJpy:2250,costTwd:472.5,stock:6,sold:4,note:''},
  {id:'i72za3h',name:'Cx16龍王戰鬥盤',price:3200,costJpy:5980,costTwd:1255.8,stock:1,sold:1,note:''},
  {id:'z7012dh',name:'Cx04戰鬥盤',price:2700,costJpy:6800,costTwd:1428.0,stock:1,sold:1,note:''},
  {id:'y50tmwu',name:'Ux08霜灰銀狼',price:900,costJpy:2200,costTwd:462.0,stock:4,sold:1,note:''},
  {id:'cbi9jhh',name:'Bx00龍騎士',price:0,costJpy:0,costTwd:0,stock:0,sold:0,note:''},
  {id:'6od4ftt',name:'Bx47發射器 左旋（紅）',price:450,costJpy:990,costTwd:207.9,stock:5,sold:0,note:''},
  {id:'w5znctg',name:'Bx-48 黑蒼穹',price:900,costJpy:2200,costTwd:462.0,stock:1,sold:1,note:''},
  {id:'4gzfpaa',name:'Bx-48 黑蒼穹',price:900,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'cye1q54',name:'Bx-35 02',price:350,costJpy:1600,costTwd:336.0,stock:2,sold:2,note:''},
  {id:'yiz3zp3',name:'Bx-35 03',price:350,costJpy:1600,costTwd:336.0,stock:2,sold:2,note:''},
  {id:'cu6tgk3',name:'Bx-35 06',price:350,costJpy:1600,costTwd:336.0,stock:2,sold:2,note:''},
  {id:'zrqn7w9',name:'Cx17 04',price:350,costJpy:1600,costTwd:336.0,stock:1,sold:1,note:''},
  {id:'qtcev05',name:'Cx17 06',price:350,costJpy:1600,costTwd:336.0,stock:2,sold:2,note:''},
  {id:'tkn8n9w',name:'Bx00 紅爆擊天馬',price:2000,costJpy:7000,costTwd:1470.0,stock:1,sold:1,note:''},
  {id:'xuay2de',name:'Cx16龍王戰鬥盤',price:2900,costJpy:5980,costTwd:1255.8,stock:5,sold:1,note:''},
  {id:'p99y4cf',name:'Cx18腕龍鞭打',price:1500,costJpy:1600,costTwd:336.0,stock:7,sold:2,note:''},
  {id:'cmy0ry3',name:'Cx18腕龍鞭打',price:1100,costJpy:1600,costTwd:336.0,stock:5,sold:5,note:''},
  {id:'dpa5gml',name:'UX01 爆刃',price:1600,costJpy:2200,costTwd:462.0,stock:3,sold:1,note:''},
  {id:'i3jzctp',name:'Bx23鳳凰飛翼',price:1500,costJpy:2200,costTwd:462.0,stock:1,sold:1,note:''},
  {id:'dy07l88',name:'Bx23鳳凰飛翼',price:1700,costJpy:2200,costTwd:462.0,stock:1,sold:1,note:''},
  {id:'43crg4t',name:'UX00大蛇',price:8000,costJpy:35000,costTwd:7350.0,stock:1,sold:1,note:''},
  {id:'vfv3lsu',name:'Cx00蒼龍勇氣黑金',price:3000,costJpy:13200,costTwd:2772.0,stock:2,sold:2,note:''},
  {id:'jvfp53v',name:'Bx00絞鯊鋒旗 黑融版',price:8000,costJpy:30000,costTwd:6300.0,stock:1,sold:0,note:''},
  {id:'akjssdv',name:'Bx51發射器（黑綠）',price:650,costJpy:990,costTwd:207.9,stock:9,sold:0,note:''},
  {id:'tqe7rqp',name:'Bx11 黑握把',price:450,costJpy:900,costTwd:189.0,stock:2,sold:0,note:''},
  {id:'uh8bmng',name:'Cx04 蒼龍盤',price:2700,costJpy:5800,costTwd:1218.0,stock:1,sold:1,note:''},
  {id:'g36n3yn',name:'Ux00武士新劍（足球版）',price:4500,costJpy:2200,costTwd:462.0,stock:1,sold:1,note:''},
  {id:'nj2mmtc',name:'Cx00戰神伏特',price:4200,costJpy:15000,costTwd:3150.0,stock:1,sold:1,note:''},
  {id:'0jvud7w',name:'惡魔戰錘 二手',price:0,costJpy:1548,costTwd:325.08,stock:1,sold:0,note:''},
];

// ── Storage ─────────────────────────────────────────────────────────────────
async function loadUsers() {
  try {
    const r = localStorage.getItem(USERS_KEY);
    return r ? JSON.parse(r) : {};
  } catch {
    return {};
  }
}
async function saveUsers(u) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
async function loadData(uid) {
  try {
    const r = localStorage.getItem(DATA_PREFIX + uid);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
async function saveData(uid, data) {
  localStorage.setItem(DATA_PREFIX + uid, JSON.stringify(data));
}
const emptyData = () => ({
  products: [...SEED_PRODUCTS],
  exchangeRate: EXCHANGE_RATE,
  updatedAt: new Date().toISOString(),
});

// ── Google Sheets API ────────────────────────────────────────────────────────
let gToken = null;

function loadGAPI() {
  return new Promise((resolve) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

async function getGoogleToken() {
  await loadGAPI();
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.error) {
          reject(resp.error);
          return;
        }
        gToken = resp.access_token;
        resolve(resp.access_token);
      },
    });
    client.requestAccessToken();
  });
}

// 讀取 Sheets 資料（商品資料）
async function readFromSheets(token) {
  const range = `${SHEET_NAME}!A4:K500`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
    range
  )}?valueRenderOption=UNFORMATTED_VALUE`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error('Sheets 讀取失敗');
  const data = await resp.json();
  return data.values || [];
}

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  const normalized = (value ?? '').toString().replace(/[^\d.-]/g, '');
  return Number(normalized) || 0;
};

const productToSheetRow = (p) => {
  const stock = toNumber(p.stock);
  const sold = toNumber(p.sold);
  const price = toNumber(p.price);
  const costJpy = toNumber(p.costJpy);
  const costTwd = toNumber(p.costTwd);
  const remain = Math.max(0, stock - sold);
  const revenue = sold * price;
  const soldCost = sold * costTwd;
  const stockCost = remain * costTwd;
  const profit = revenue - soldCost;

  return [
    p.name || '',
    price,
    costJpy,
    costTwd,
    stock,
    sold,
    remain,
    revenue,
    soldCost,
    stockCost,
    profit,
  ];
};

const sheetRowToProduct = (row) => ({
  id: genId(),
  name: (row[0] || '').toString().trim(),
  price: toNumber(row[1]),
  costJpy: toNumber(row[2]),
  costTwd: toNumber(row[3]),
  stock: toNumber(row[4]),
  sold: toNumber(row[5]),
  note: '',
});

const sameProductAndPrice = (p, row) =>
  (p.name || '').trim() === (row[0] || '').toString().trim() &&
  toNumber(p.price) === toNumber(row[1]);

// 把 App 商品資料寫回 Sheets：既有商品更新庫存/賣出，新商品自動新增一列
async function writeToSheets(token, products) {
  const rows = await readFromSheets(token);
  const updates = [];
  const appends = [];
  products.forEach((p) => {
    const idx = rows.findIndex((r) => sameProductAndPrice(p, r));
    if (idx !== -1) {
      const rowNum = idx + 4;
      updates.push({
        range: `${SHEET_NAME}!E${rowNum}:F${rowNum}`,
        values: [[toNumber(p.stock), toNumber(p.sold)]],
      });
    } else {
      appends.push(productToSheetRow(p));
    }
  });
  if (updates.length > 0) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`;
    const r1 = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data: updates }) });
    if (!r1.ok) throw new Error('Sheets 寫入失敗');
  }
  if (appends.length > 0) {
    const appendRange = `${SHEET_NAME}!A3:K`;
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(
      appendRange
    )}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const r2 = await fetch(appendUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: appends }) });
    if (!r2.ok) throw new Error('Sheets 新增失敗');
  }
}

// ── 損益計算 ─────────────────────────────────────────────────────────────────
function calcStats(products, rate) {
  let revenue = 0,
    soldCost = 0,
    stockCost = 0,
    stockRevenue = 0,
    totalSold = 0;
  const profitable = [],
    losing = [];
  products.forEach((p) => {
    const costTwd = p.costJpy ? p.costJpy * rate : p.costTwd || 0;
    const sold = p.sold || 0;
    const remain = Math.max(0, (p.stock || 0) - sold);
    const price = p.price || 0;
    const unitProfit = costTwd ? price - costTwd : null;
    const totalProfit = unitProfit != null ? unitProfit * sold : null;
    revenue += price * sold;
    soldCost += costTwd * sold;
    stockCost += costTwd * remain;
    stockRevenue += price * remain;
    totalSold += sold;
    if (totalProfit != null) {
      if (totalProfit > 0)
        profitable.push({ name: p.name, profit: totalProfit });
      if (totalProfit < 0) losing.push({ name: p.name, profit: totalProfit });
    }
  });
  const realized = revenue - soldCost;
  return {
    revenue,
    soldCost,
    realized,
    stockCost,
    stockRevenue,
    stockPotential: stockRevenue - stockCost,
    netProfit: realized - stockCost,
    totalSold,
    margin: revenue ? realized / revenue : 0,
    recovery: soldCost + stockCost ? soldCost / (soldCost + stockCost) : 0,
    fullProfit: realized + (stockRevenue - stockCost),
    profitable: profitable.sort((a, b) => b.profit - a.profit).slice(0, 5),
    losing: losing.sort((a, b) => a.profit - b.profit).slice(0, 3),
  };
}

// ── 主 App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('loading');
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [sheetsStatus, setSheetsStatus] = useState('disconnected'); // disconnected | connecting | connected | error
  const [sheetsSyncing, setSheetsSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = localStorage.getItem(SESSION_KEY);
        if (!r) throw new Error();
        if (r) {
          const sess = JSON.parse(r);
          const users = await loadUsers();
          if (users[sess.uid]) {
            const d = await loadData(sess.uid);
            setUser(sess);
            setData(d || emptyData());
            setScreen('main');
            return;
          }
        }
      } catch {}
      setScreen('login');
    })();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const persist = useCallback(
    async (newData) => {
      if (!user) return;
      setSaving(true);
      try {
        const d = { ...newData, updatedAt: new Date().toISOString() };
        await saveData(user.uid, d);
        setData(d);
        // 若已連線 Google Sheets，自動同步
        if (gToken && sheetsStatus === 'connected') {
          setSheetsSyncing(true);
          try {
            await writeToSheets(gToken, d.products);
          } catch {
            showToast('⚠️ Sheets 同步失敗', 'error');
          } finally {
            setSheetsSyncing(false);
          }
        }
      } finally {
        setSaving(false);
      }
    },
    [user, sheetsStatus]
  );

  const connectSheets = async () => {
    setSheetsStatus('connecting');
    try {
      const token = await getGoogleToken();
      gToken = token;
      setSheetsStatus('connected');
      showToast('✅ Google Sheets 已連線');
    } catch {
      setSheetsStatus('error');
      showToast('❌ 授權失敗，請重試', 'error');
    }
  };

  const syncFromSheets = async () => {
    if (!gToken) return;
    setSheetsSyncing(true);
    try {
      const rows = (await readFromSheets(gToken)).filter((r) =>
        (r[0] || '').toString().trim()
      );
      const usedSheetRows = new Set();
      const updated = (data.products || []).map((p) => {
        const idx = rows.findIndex((r) => sameProductAndPrice(p, r));
        if (idx === -1) return p;
        usedSheetRows.add(idx);
        const row = rows[idx];
        return {
          ...p,
          price: toNumber(row[1]) || p.price || 0,
          costJpy: toNumber(row[2]) || p.costJpy || 0,
          costTwd: toNumber(row[3]) || p.costTwd || 0,
          stock: toNumber(row[4]),
          sold: toNumber(row[5]),
        };
      });
      const newProducts = rows
        .filter((_, idx) => !usedSheetRows.has(idx))
        .map(sheetRowToProduct);
      await persist({ ...data, products: [...updated, ...newProducts] });
      showToast(`✅ 已從 Sheets 同步，共 ${updated.length + newProducts.length} 件商品`);
    } catch {
      showToast('❌ 讀取 Sheets 失敗', 'error');
    } finally {
      setSheetsSyncing(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setData(null);
    gToken = null;
    setSheetsStatus('disconnected');
    setScreen('login');
  };

  if (screen === 'loading') return <LoadingScreen />;
  if (screen === 'login')
    return (
      <LoginScreen
        onLogin={async (u) => {
          localStorage.setItem(SESSION_KEY, JSON.stringify(u));
          const d = await loadData(u.uid);
          setUser(u);
          setData(d || emptyData());
          setScreen('main');
        }}
      />
    );

  const stats = data ? calcStats(data.products, data.exchangeRate) : null;

  const sheetsColor = {
    disconnected: '#64748b',
    connecting: '#fbbf24',
    connected: '#4ade80',
    error: '#f87171',
  }[sheetsStatus];
  const sheetsLabel = {
    disconnected: '未連線',
    connecting: '連線中...',
    connected: '已連線',
    error: '連線失敗',
  }[sheetsStatus];

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={S.headerLeft}>
          <span style={S.logo}>✨卡比</span>
          <span style={S.subtitle}>代購管理</span>
        </div>
        <div style={S.headerRight}>
          {(saving || sheetsSyncing) && (
            <span style={S.savingBadge}>
              {sheetsSyncing ? 'Sheets同步...' : '儲存中...'}
            </span>
          )}
          <span
            style={{
              ...S.sheetsBadge,
              color: sheetsColor,
              borderColor: sheetsColor,
            }}
            onClick={
              sheetsStatus === 'connected' ? syncFromSheets : connectSheets
            }
          >
            📊 {sheetsLabel}
          </span>
          <span style={S.userBadge} onClick={logout}>
            👤 登出
          </span>
        </div>
      </header>

      {/* Sheets 說明橫幅 */}
      {sheetsStatus === 'disconnected' && (
        <div style={S.sheetsBanner} onClick={connectSheets}>
          🔗 點此連結 Google Sheets，賣出時自動同步庫存
        </div>
      )}
      {sheetsStatus === 'connected' && (
        <div
          style={{
            ...S.sheetsBanner,
            background: '#14532d20',
            borderColor: '#14532d',
            color: '#4ade80',
          }}
          onClick={syncFromSheets}
        >
          ✅ Sheets 已連線｜更新庫存時自動同步．點橫幅從 Sheets 拉取最新資料
        </div>
      )}

      <main style={S.main}>
        {tab === 'dashboard' && stats && (
          <Dashboard stats={stats} data={data} />
        )}
        {tab === 'products' && (
          <ProductList
            data={data}
            persist={persist}
            showToast={showToast}
            rate={data.exchangeRate}
          />
        )}
        {tab === 'add' && (
          <AddProduct
            data={data}
            persist={persist}
            showToast={showToast}
            rate={data.exchangeRate}
            onDone={() => setTab('products')}
          />
        )}
        {tab === 'scan' && (
          <ScanProduct
            data={data}
            persist={persist}
            showToast={showToast}
            rate={data.exchangeRate}
            onDone={() => setTab('products')}
          />
        )}
      </main>
      <nav style={S.nav}>
        {[
          { id: 'dashboard', icon: '📊', label: '總覽' },
          { id: 'products', icon: '📦', label: '商品' },
          { id: 'add', icon: '➕', label: '新增' },
          { id: 'scan', icon: '📷', label: '掃描' },
        ].map((t) => (
          <button
            key={t.id}
            style={{ ...S.navBtn, ...(tab === t.id ? S.navBtnActive : {}) }}
            onClick={() => setTab(t.id)}
          >
            <span style={S.navIcon}>{t.icon}</span>
            <span style={S.navLabel}>{t.label}</span>
          </button>
        ))}
      </nav>
      {toast && (
        <div
          style={{
            ...S.toast,
            background: toast.type === 'error' ? '#ef4444' : '#22c55e',
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ ...S.centerFill, background: '#0f172a' }}>
      <div style={{ fontSize: 52 }}>✨</div>
      <div
        style={{
          color: '#fb923c',
          fontFamily: 'Georgia,serif',
          fontSize: 22,
          marginTop: 12,
        }}
      >
        卡比代購
      </div>
      <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
        載入中...
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!name.trim() || !pwd.trim()) {
      setErr('請填寫帳號和密碼');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const users = await loadUsers();
      if (mode === 'register') {
        if (users[name]) {
          setErr('帳號已存在');
          return;
        }
        const uid = genId();
        users[name] = { uid, name, pwd };
        await saveUsers(users);
        await onLogin({ uid, name });
      } else {
        const u = users[name];
        if (!u || u.pwd !== pwd) {
          setErr('帳號或密碼錯誤');
          return;
        }
        await onLogin({ uid: u.uid, name: u.name });
      }
    } catch {
      setErr('發生錯誤，請重試');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ ...S.centerFill, background: '#0f172a', padding: 24 }}>
      <div style={S.loginCard}>
        <div style={{ fontSize: 44, textAlign: 'center' }}>✨</div>
        <h1 style={S.loginTitle}>卡比代購管理</h1>
        <p style={S.loginSub}>你的專屬代購試算系統</p>
        <div style={S.modeSwitch}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              style={{ ...S.modeBtn, ...(mode === m ? S.modeBtnActive : {}) }}
              onClick={() => setMode(m)}
            >
              {m === 'login' ? '登入' : '註冊'}
            </button>
          ))}
        </div>
        <input
          style={S.input}
          placeholder="帳號"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={{ ...S.input, marginTop: 10 }}
          type="password"
          placeholder="密碼"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handle()}
        />
        {err && <div style={S.errMsg}>{err}</div>}
        <button
          style={{ ...S.primaryBtn, marginTop: 16, width: '100%' }}
          onClick={handle}
          disabled={loading}
        >
          {loading ? '處理中...' : mode === 'login' ? '登入' : '建立帳號'}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ stats, data }) {
  const cards = [
    {
      label: '✅ 已實現損益',
      value: fmt(stats.realized),
      unit: 'NT$',
      color: stats.realized >= 0 ? '#4ade80' : '#f87171',
    },
    {
      label: '💰 整體淨損益',
      value: fmt(stats.netProfit),
      unit: 'NT$',
      color: stats.netProfit >= 0 ? '#4ade80' : '#f87171',
    },
    {
      label: '📈 總銷售收入',
      value: fmt(stats.revenue),
      unit: 'NT$',
      color: '#60a5fa',
    },
    {
      label: '💸 毛利率',
      value: fmtPct(stats.margin),
      unit: '',
      color: '#fb923c',
    },
    {
      label: '🔄 已回本比例',
      value: fmtPct(stats.recovery),
      unit: '',
      color: '#a78bfa',
    },
    {
      label: '🎯 全數售出淨利',
      value: fmt(stats.fullProfit),
      unit: 'NT$',
      color: '#34d399',
    },
  ];
  const pieData = [
    { name: '已賣出利潤', value: Math.max(0, stats.realized) },
    { name: '已賣出成本', value: stats.soldCost },
    { name: '庫存墊出成本', value: stats.stockCost },
  ];
  const barData = stats.profitable.map((p) => ({
    name: p.name.slice(0, 6),
    profit: Math.round(p.profit),
  }));
  const missingCost = data.products.filter(
    (p) => !p.costJpy && !p.costTwd && (p.sold || 0) > 0
  );

  return (
    <div style={{ ...S.page, paddingBottom: 16 }}>
      <h2 style={S.pageTitle}>損益總覽</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>
        匯率 1日幣＝NT${data.exchangeRate}　共 {data.products.length} 件　已售 {stats.totalSold} 件
      </p>
      {missingCost.length > 0 && (
        <div style={S.warnBanner}>
          ⚠️ {missingCost.map((p) => p.name).join('、')} 缺少成本，損益計算不準確
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ ...S.statCard, flex: 1, padding: '16px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>✅ 已實現損益</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: stats.realized >= 0 ? '#4ade80' : '#f87171', letterSpacing: -1 }}>
            NT${fmt(stats.realized)}
          </div>
        </div>
        <div style={{ ...S.statCard, flex: 1, padding: '16px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>🎯 全數售出淨利</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#34d399', letterSpacing: -1 }}>
            NT${fmt(stats.fullProfit)}
          </div>
        </div>
      </div>
      <div style={{ background: '#1e293b', borderRadius: 14, padding: '12px 16px', marginBottom: 10 }}>
        {[
          { label: '📈 總銷售收入', value: 'NT$' + fmt(stats.revenue), color: '#60a5fa' },
          { label: '💸 毛利率', value: fmtPct(stats.margin), color: '#fb923c' },
          { label: '🔄 已回本比例', value: fmtPct(stats.recovery), color: '#a78bfa' },
          { label: '💰 整體淨損益', value: 'NT$' + fmt(stats.netProfit), color: stats.netProfit >= 0 ? '#4ade80' : '#f87171' },
        ].map((c, i, arr) => (
          <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: i === 0 ? 0 : 10, paddingBottom: i === arr.length - 1 ? 0 : 10, borderBottom: i < arr.length - 1 ? '1px solid #334155' : 'none' }}>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>{c.label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</span>
          </div>
        ))}
      </div>
      <div style={S.chartCard}>
        <h3 style={S.chartTitle}>💰 資金分佈</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" label={({ name, percent }) => name + ' ' + (percent * 100).toFixed(0) + '%'} labelLine={false} fontSize={11}>
              {pieData.map((_, i) => (<Cell key={i} fill={COLORS.chart[i]} />))}
            </Pie>
            <Tooltip formatter={(v) => 'NT$ ' + fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {barData.length > 0 && (
        <div style={S.chartCard}>
          <h3 style={S.chartTitle}>🔥 獲利前五商品</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} margin={{ left: 0, right: 0, top: 4, bottom: 4 }}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip formatter={(v) => 'NT$ ' + fmt(v)} />
              <Bar dataKey="profit" fill="#fb923c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {stats.losing.length > 0 && (
        <div style={S.alertCard}>
          <h3 style={{ ...S.chartTitle, color: '#f87171' }}>⚠️ 注意虧損商品</h3>
          {stats.losing.map((p) => (
            <div key={p.name} style={S.alertRow}>
              <span style={{ color: '#e2e8f0', fontSize: 14 }}>{p.name}</span>
              <span style={{ color: '#f87171', fontSize: 14, fontWeight: 700 }}>NT$ {fmt(p.profit)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductList({ data, persist, showToast, rate }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selling, setSelling] = useState(null);

  const filtered = (data.products || []).filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    const remain = (p.stock || 0) - (p.sold || 0);
    const hasCost = p.costJpy || p.costTwd;
    if (filter === 'selling') return matchSearch && remain > 0;
    if (filter === 'sold')
      return matchSearch && remain <= 0 && (p.sold || 0) > 0;
    if (filter === 'missing') return matchSearch && !hasCost;
    return matchSearch;
  });

  const del = async (id) => {
    if (!confirm('確定刪除此商品？')) return;
    await persist({
      ...data,
      products: data.products.filter((p) => p.id !== id),
    });
    showToast('已刪除');
  };
  const update = async (product) => {
    await persist({
      ...data,
      products: data.products.map((p) => (p.id === product.id ? product : p)),
    });
    setEditing(null);
    showToast('已更新');
  };

  const quickSell = async (p, delta) => {
    const newSold = Math.min(p.stock || 0, Math.max(0, (p.sold || 0) + delta));
    if (newSold === (p.sold || 0)) return;
    const updated = { ...p, sold: newSold };
    await persist({
      ...data,
      products: data.products.map((x) => (x.id === p.id ? updated : x)),
    });
    const costTwd = p.costJpy ? p.costJpy * rate : p.costTwd || 0;
    const unitProfit = costTwd ? p.price - costTwd : null;
    if (delta > 0 && unitProfit != null)
      showToast(`✅ 賣出 +1｜本次利潤 NT$${fmt(unitProfit)}`);
    else showToast(delta > 0 ? '✅ 已更新' : '↩️ 已撤銷');
  };

  const confirmSell = async (p, qty) => {
    const newSold = Math.min(p.stock || 0, (p.sold || 0) + qty);
    const updated = { ...p, sold: newSold };
    await persist({
      ...data,
      products: data.products.map((x) => (x.id === p.id ? updated : x)),
    });
    setSelling(null);
    const costTwd = p.costJpy ? p.costJpy * rate : p.costTwd || 0;
    const unitProfit = costTwd ? p.price - costTwd : null;
    showToast(
      `✅ 賣出 ${qty} 件${
        unitProfit != null ? `｜利潤 NT$${fmt(unitProfit * qty)}` : ''
      }`
    );
  };

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>
        商品管理{' '}
        <span style={{ fontSize: 14, color: '#64748b' }}>
          ({data.products.length}件)
        </span>
      </h2>
      <input
        style={{ ...S.input, marginBottom: 10 }}
        placeholder="🔍 搜尋商品名稱..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={S.filterRow}>
        {[
          { k: 'all', l: '全部' },
          { k: 'selling', l: '庫存中' },
          { k: 'sold', l: '已售完' },
          { k: 'missing', l: '缺成本' },
        ].map((f) => (
          <button
            key={f.k}
            style={{
              ...S.filterBtn,
              ...(filter === f.k ? S.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f.k)}
          >
            {f.l}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div style={S.empty}>沒有符合條件的商品</div>}
      {filtered.map((p) => {
        const costTwd = p.costJpy ? p.costJpy * rate : p.costTwd || 0;
        const remain = (p.stock || 0) - (p.sold || 0);
        const unitProfit = costTwd ? p.price - costTwd : null;
        const totalProfit =
          unitProfit != null ? unitProfit * (p.sold || 0) : null;
        const profitColor =
          totalProfit == null
            ? '#94a3b8'
            : totalProfit >= 0
            ? '#4ade80'
            : '#f87171';
        const isSelling = selling?.id === p.id;
        return (
          <div key={p.id} style={S.productCard}>
            <div style={S.productHeader}>
              <span style={S.productName}>{p.name}</span>
              <span
                style={{
                  ...S.profitBadge,
                  background:
                    totalProfit == null
                      ? '#1e293b'
                      : totalProfit >= 0
                      ? '#14532d'
                      : '#450a0a',
                  color: profitColor,
                }}
              >
                {totalProfit == null
                  ? '未填成本'
                  : `${totalProfit >= 0 ? '+' : ''}NT$${fmt(totalProfit)}`}
              </span>
            </div>
            <div style={S.productMeta}>
              <span>售 NT${fmt(p.price)}</span>
              <span>
                成本{' '}
                {p.costJpy
                  ? `¥${fmt(p.costJpy)}`
                  : costTwd
                  ? `NT$${fmt(costTwd)}`
                  : '未填'}
              </span>
              {unitProfit != null && (
                <span style={{ color: profitColor }}>
                  單品 NT${fmt(unitProfit)}
                </span>
              )}
            </div>
            <div style={S.sellRow}>
              <div style={S.stockInfo}>
                <span style={{ color: '#64748b', fontSize: 12 }}>剩餘庫存</span>
                <span
                  style={{
                    color:
                      remain <= 0
                        ? '#f87171'
                        : remain <= 2
                        ? '#fbbf24'
                        : '#4ade80',
                    fontWeight: 700,
                    fontSize: 18,
                    marginLeft: 6,
                  }}
                >
                  {remain}
                </span>
                <span style={{ color: '#475569', fontSize: 11, marginLeft: 4 }}>
                  / {p.stock || 0}
                </span>
              </div>
              <div style={S.sellControls}>
                <button
                  style={S.sellMinusBtn}
                  onClick={() => quickSell(p, -1)}
                  disabled={p.sold <= 0}
                >
                  －
                </button>
                <span style={S.soldCount}>{p.sold || 0} 賣出</span>
                <button
                  style={{ ...S.sellPlusBtn, opacity: remain <= 0 ? 0.3 : 1 }}
                  onClick={() => quickSell(p, 1)}
                  disabled={remain <= 0}
                >
                  ＋
                </button>
                <button
                  style={S.sellMultiBtn}
                  onClick={() =>
                    setSelling(isSelling ? null : { id: p.id, qty: 1 })
                  }
                >
                  {isSelling ? '收起' : '多件'}
                </button>
              </div>
            </div>
            {isSelling && (
              <div style={S.multiSellRow}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>
                  賣出數量：
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 5, 10]
                    .filter((n) => n <= remain)
                    .map((n) => (
                      <button
                        key={n}
                        style={S.qtyBtn}
                        onClick={() => confirmSell(p, n)}
                      >
                        +{n}
                      </button>
                    ))}
                  {remain > 0 && (
                    <button
                      style={{
                        ...S.qtyBtn,
                        background: '#1e3a5f',
                        color: '#60a5fa',
                      }}
                      onClick={() => confirmSell(p, remain)}
                    >
                      全部({remain})
                    </button>
                  )}
                </div>
                {unitProfit != null && (
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    單品利潤 NT${fmt(unitProfit)}，售完可再賺 NT$
                    {fmt(unitProfit * remain)}
                  </div>
                )}
              </div>
            )}
            {p.note && <div style={S.productNote}>{p.note}</div>}
            <div style={S.productActions}>
              <button style={S.editBtn} onClick={() => setEditing(p)}>
                ✏️ 編輯
              </button>
              <button style={S.delBtn} onClick={() => del(p.id)}>
                🗑️ 刪除
              </button>
            </div>
          </div>
        );
      })}
      {editing && (
        <EditModal
          product={editing}
          rate={rate}
          onSave={update}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditModal({ product, rate, onSave, onClose }) {
  const [form, setForm] = useState({ ...product });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div
      style={S.modalOverlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={S.modal}>
        <h3 style={{ color: '#f1f5f9', marginBottom: 16 }}>✏️ 編輯商品</h3>
        <ProductForm form={form} set={set} rate={rate} />
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            style={{ ...S.primaryBtn, flex: 1 }}
            onClick={() =>
              onSave({
                ...form,
                price: +form.price || 0,
                costJpy: +form.costJpy || 0,
                costTwd: +form.costTwd || 0,
                stock: +form.stock || 0,
                sold: +form.sold || 0,
              })
            }
          >
            儲存
          </button>
          <button
            style={{ ...S.primaryBtn, flex: 1, background: '#334155' }}
            onClick={onClose}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProduct({ data, persist, showToast, rate, onDone }) {
  const [form, setForm] = useState({
    name: '',
    price: '',
    costJpy: '',
    costTwd: '',
    stock: '',
    sold: '',
    note: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.name.trim()) {
      showToast('請填寫商品名稱', 'error');
      return;
    }
    const product = {
      ...form,
      id: genId(),
      price: +form.price || 0,
      costJpy: +form.costJpy || 0,
      costTwd: +form.costTwd || 0,
      stock: +form.stock || 0,
      sold: +form.sold || 0,
    };
    await persist({ ...data, products: [...(data.products || []), product] });
    showToast('✅ 已新增 ' + product.name);
    onDone();
  };
  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>新增商品</h2>
      <ProductForm form={form} set={set} rate={rate} />
      <button
        style={{ ...S.primaryBtn, marginTop: 16, width: '100%' }}
        onClick={submit}
      >
        新增商品
      </button>
    </div>
  );
}

function ProductForm({ form, set, rate }) {
  const costTwd = form.costJpy
    ? (form.costJpy * rate).toFixed(2)
    : form.costTwd || '';
  const unitProfit =
    form.price && costTwd ? (+form.price - +costTwd).toFixed(1) : null;
  const fields = [
    {
      k: 'name',
      label: '商品名稱',
      placeholder: '例：Bx49蒼龍突擊',
      type: 'text',
    },
    {
      k: 'price',
      label: '售價 (NT$)',
      placeholder: '例：1300',
      type: 'number',
    },
    {
      k: 'costJpy',
      label: '成本（日幣 ¥）',
      placeholder: '例：2199',
      type: 'number',
    },
    {
      k: 'costTwd',
      label: '成本（台幣，若無日幣）',
      placeholder: '自動換算或手填',
      type: 'number',
    },
    { k: 'stock', label: '庫存數量', placeholder: '例：5', type: 'number' },
    { k: 'sold', label: '已賣出數量', placeholder: '例：3', type: 'number' },
    { k: 'note', label: '備註', placeholder: '例：5/28補貨', type: 'text' },
  ];
  return (
    <div>
      {fields.map((f) => (
        <div key={f.k} style={{ marginBottom: 10 }}>
          <label style={S.formLabel}>{f.label}</label>
          <input
            style={S.input}
            type={f.type}
            placeholder={f.placeholder}
            value={form[f.k] || ''}
            onChange={(e) => set(f.k, e.target.value)}
          />
        </div>
      ))}
      {form.costJpy && (
        <div style={S.calcHint}>
          換算成本：NT$ {(+form.costJpy * rate).toFixed(2)}
          {unitProfit && (
            <span
              style={{
                marginLeft: 12,
                color: +unitProfit >= 0 ? '#4ade80' : '#f87171',
              }}
            >
              單品利潤：NT$ {unitProfit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ScanProduct({ data, persist, showToast, rate, onDone }) {
  const [step, setStep] = useState('idle');
  const [form, setForm] = useState({});
  const fileRef = useRef();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const analyze = async (file) => {
    setStep('scanning');
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: file.type || 'image/jpeg',
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: `這是一個代購商品的照片或標籤。請從圖片中提取以下資訊，只回傳 JSON（不要有任何其他文字或 markdown backtick）：{"name":"商品名稱","price":售價數字,"costJpy":日幣成本數字,"stock":數量,"note":"其他備註"}。看不出來的欄位填 0 或空字串。`,
                },
              ],
            },
          ],
        }),
      });
      const d = await resp.json();
      const text = d.content?.map((c) => c.text || '').join('') || '';
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
      setForm({
        ...parsed,
        costJpy: parsed.costJpy || '',
        price: parsed.price || '',
        stock: parsed.stock || 1,
        sold: 0,
        note: parsed.note || '',
      });
      setStep('confirm');
    } catch {
      showToast('辨識失敗，請手動輸入', 'error');
      setStep('idle');
    }
  };

  const submit = async () => {
    if (!form.name?.trim()) {
      showToast('請填寫商品名稱', 'error');
      return;
    }
    const product = {
      ...form,
      id: genId(),
      price: +form.price || 0,
      costJpy: +form.costJpy || 0,
      costTwd: +form.costTwd || 0,
      stock: +form.stock || 0,
      sold: +form.sold || 0,
    };
    await persist({ ...data, products: [...(data.products || []), product] });
    showToast('✅ 已新增 ' + product.name);
    onDone();
  };

  return (
    <div style={S.page}>
      <h2 style={S.pageTitle}>📷 掃描新增商品</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
        拍攝商品照片、標籤、收據，AI 自動辨識填入
      </p>
      {step === 'idle' && (
        <div>
          <div style={S.scanZone} onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: 48 }}>📷</div>
            <div style={{ color: '#94a3b8', marginTop: 8 }}>
              點擊拍照或選擇圖片
            </div>
            <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>
              支援 JPG、PNG、HEIC
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && analyze(e.target.files[0])}
          />
        </div>
      )}
      {step === 'scanning' && (
        <div style={S.scanZone}>
          <div style={{ fontSize: 40 }}>🔍</div>
          <div style={{ color: '#fb923c', marginTop: 12 }}>AI 辨識中...</div>
        </div>
      )}
      {step === 'confirm' && (
        <div>
          <div style={S.aiResult}>✅ AI 辨識完成，請確認或修改：</div>
          <ProductForm form={form} set={set} rate={rate} />
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button style={{ ...S.primaryBtn, flex: 1 }} onClick={submit}>
              確認新增
            </button>
            <button
              style={{ ...S.primaryBtn, flex: 1, background: '#334155' }}
              onClick={() => setStep('idle')}
            >
              重新掃描
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    maxWidth: 600,
    margin: '0 auto',
    background: '#0f172a',
    fontFamily: "'Noto Sans TC',system-ui,sans-serif",
    color: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#0f172a',
    borderBottom: '1px solid #1e293b',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'baseline', gap: 6 },
  logo: { fontSize: 20, fontFamily: 'Georgia,serif', color: '#fb923c' },
  subtitle: { fontSize: 12, color: '#64748b' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 6 },
  savingBadge: {
    fontSize: 10,
    color: '#60a5fa',
    background: '#1e3a5f',
    padding: '2px 8px',
    borderRadius: 99,
  },
  sheetsBadge: {
    fontSize: 11,
    padding: '3px 8px',
    borderRadius: 99,
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: 600,
  },
  userBadge: {
    fontSize: 11,
    color: '#94a3b8',
    background: '#1e293b',
    padding: '3px 8px',
    borderRadius: 99,
    cursor: 'pointer',
  },
  sheetsBanner: {
    padding: '8px 16px',
    fontSize: 12,
    color: '#fbbf24',
    background: '#451a0320',
    borderBottom: '1px solid #92400e',
    cursor: 'pointer',
    textAlign: 'center',
    flexShrink: 0,
  },
  main: { flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 },
  nav: {
    display: 'flex',
    borderTop: '1px solid #1e293b',
    background: '#0f172a',
    flexShrink: 0,
  },
  navBtn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#475569',
  },
  navBtnActive: { color: '#fb923c' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, marginTop: 2 },
  toast: {
    position: 'fixed',
    bottom: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 20px',
    borderRadius: 99,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  centerFill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
  },
  loginCard: {
    background: '#1e293b',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 360,
  },
  loginTitle: {
    fontFamily: 'Georgia,serif',
    color: '#fb923c',
    textAlign: 'center',
    fontSize: 22,
    margin: '8px 0 4px',
  },
  loginSub: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  modeSwitch: {
    display: 'flex',
    background: '#0f172a',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    background: 'none',
    color: '#64748b',
    fontSize: 14,
  },
  modeBtnActive: { background: '#fb923c', color: '#0f172a', fontWeight: 700 },
  input: {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e2e8f0',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
  errMsg: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    margin: '8px 0',
  },
  primaryBtn: {
    padding: '12px',
    background: '#fb923c',
    border: 'none',
    borderRadius: 12,
    color: '#0f172a',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  page: { padding: '16px', paddingBottom: 16 },
  pageTitle: {
    fontFamily: 'Georgia,serif',
    color: '#fb923c',
    fontSize: 20,
    marginBottom: 8,
  },
  warnBanner: {
    background: '#451a03',
    border: '1px solid #92400e',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    color: '#fbbf24',
    marginBottom: 12,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 16,
  },
  statCard: { background: '#1e293b', borderRadius: 14, padding: '14px 16px' },
  statLabel: { fontSize: 11, color: '#64748b', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 700, letterSpacing: -0.5 },
  statUnit: { fontSize: 12, fontWeight: 400, color: '#64748b' },
  chartCard: {
    background: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
  },
  alertCard: {
    background: '#1e1a1a',
    border: '1px solid #450a0a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  alertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #2d1515',
  },
  filterRow: { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  filterBtn: {
    padding: '5px 12px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 99,
    color: '#64748b',
    fontSize: 12,
    cursor: 'pointer',
  },
  filterBtnActive: {
    background: '#fb923c20',
    borderColor: '#fb923c',
    color: '#fb923c',
  },
  productCard: {
    background: '#1e293b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontWeight: 600,
    fontSize: 14,
    color: '#f1f5f9',
    flex: 1,
    marginRight: 8,
  },
  profitBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 99,
    whiteSpace: 'nowrap',
  },
  productMeta: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  productNote: {
    fontSize: 12,
    color: '#94a3b8',
    background: '#0f172a',
    borderRadius: 6,
    padding: '4px 8px',
    marginBottom: 8,
  },
  productActions: { display: 'flex', gap: 8 },
  editBtn: {
    flex: 1,
    padding: '6px',
    background: '#1e3a5f',
    border: 'none',
    borderRadius: 8,
    color: '#60a5fa',
    cursor: 'pointer',
    fontSize: 13,
  },
  delBtn: {
    flex: 1,
    padding: '6px',
    background: '#450a0a',
    border: 'none',
    borderRadius: 8,
    color: '#f87171',
    cursor: 'pointer',
    fontSize: 13,
  },
  sellRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
    background: '#0f172a',
    borderRadius: 10,
    padding: '6px 10px',
  },
  stockInfo: { display: 'flex', alignItems: 'center' },
  sellControls: { display: 'flex', alignItems: 'center', gap: 6 },
  sellMinusBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #334155',
    background: '#1e293b',
    color: '#94a3b8',
    fontSize: 18,
    cursor: 'pointer',
  },
  sellPlusBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: 'none',
    background: '#fb923c',
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
  },
  soldCount: {
    fontSize: 13,
    color: '#94a3b8',
    minWidth: 44,
    textAlign: 'center',
  },
  sellMultiBtn: {
    padding: '4px 10px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#60a5fa',
    fontSize: 12,
    cursor: 'pointer',
  },
  multiSellRow: {
    background: '#0f172a',
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 8,
  },
  qtyBtn: {
    padding: '6px 14px',
    background: '#fb923c20',
    border: '1px solid #fb923c',
    borderRadius: 8,
    color: '#fb923c',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: '#475569', padding: 40, fontSize: 14 },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#1e293b',
    borderRadius: '20px 20px 0 0',
    padding: 24,
    width: '100%',
    maxWidth: 600,
    maxHeight: '85vh',
    overflowY: 'auto',
  },
  formLabel: {
    display: 'block',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  calcHint: {
    background: '#0f172a',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  scanZone: {
    border: '2px dashed #334155',
    borderRadius: 16,
    padding: 40,
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: 20,
  },
  aiResult: {
    background: '#14532d20',
    border: '1px solid #14532d',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
};
