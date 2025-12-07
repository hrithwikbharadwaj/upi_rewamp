import * as pdfjsLib from 'pdfjs-dist';
import { AnalysisResult, Transaction } from '../types';

// Set up the worker - use the CDN version that matches the installed package
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const EXCLUDED_KEYWORDS = ['payment', 'transfer', 'deposit', 'interest', 'balance', 'opening', 'closing', 'atm withdrawal', 'beginning balance'];

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, x, y]
  width: number;
  height: number;
}

// Helper to determine aura
const determineAura = (total: number, count: number, topMerchant: string): string => {
  const avg = total / (count || 1);
  const name = topMerchant.toLowerCase();
  
  if (name.includes('uber') || name.includes('lyft') || name.includes('taxi')) return 'The Jetsetter';
  if (name.includes('amazon') || name.includes('amzn')) return 'Prime Citizen';
  if (name.includes('doordash') || name.includes('eats') || name.includes('grubhub')) return 'Late Night Snacker';
  if (name.includes('starbucks') || name.includes('coffee')) return 'Caffeine Powered';
  if (name.includes('target') || name.includes('walmart')) return 'Impulse Buyer';
  if (name.includes('apple') || name.includes('google')) return 'Tech Subscriber';
  
  if (avg > 150) return 'High Roller';
  if (count > 80 && avg < 30) return 'Chaotic Spender';
  if (total < 1000) return 'The Saver';
  return 'Mindful Minimalist';
};

export const parseBankPDF = async (file: File): Promise<AnalysisResult> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const transactions: Transaction[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    // 1. Group items by Y-coordinate to reconstruct rows
    const linesMap = new Map<number, TextItem[]>();
    const Y_TOLERANCE = 5; // Pixels

    items.forEach(item => {
      if (!item.str.trim()) return;

      const y = item.transform[5];
      let foundKey: number | null = null;
      
      for (const key of linesMap.keys()) {
        if (Math.abs(key - y) < Y_TOLERANCE) {
          foundKey = key;
          break;
        }
      }

      const key = foundKey !== null ? foundKey : y;
      if (!linesMap.has(key)) linesMap.set(key, []);
      linesMap.get(key)?.push(item);
    });

    const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);

    for (const y of sortedY) {
      const lineItems = linesMap.get(y) || [];
      lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
      
      const lineText = lineItems.map(item => item.str).join(' ');
      
      const dateRegex = /(\d{1,2}[/-]\d{1,2}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/;
      const moneyRegex = /(-?\$?[\d,]+\.\d{2})/;

      const dateMatch = lineText.match(dateRegex);
      const moneyMatch = lineText.match(moneyRegex);

      if (dateMatch && moneyMatch) {
        let rawAmount = moneyMatch[0].replace(/[$,]/g, '');
        if (rawAmount.includes('(') && rawAmount.includes(')')) {
          rawAmount = '-' + rawAmount.replace(/[()]/g, '');
        }
        const amount = parseFloat(rawAmount);

        if (isNaN(amount) || amount === 0) continue;

        let description = lineText
          .replace(dateMatch[0], '')
          .replace(moneyMatch[0], '')
          .trim();

        description = description.replace(/^\d+/, ''); 
        description = description.trim();

        const isExcluded = EXCLUDED_KEYWORDS.some(k => description.toLowerCase().includes(k));
        
        if (!isExcluded && description.length > 2) {
             description = description.replace(/PURCHASE AUTHORIZED ON \d{2}\/\d{2}/, '');
             
             transactions.push({
               date: dateMatch[0],
               description: description,
               amount: Math.abs(amount)
             });
        }
      }
    }
  }

  if (transactions.length === 0) {
    throw new Error("No transactions found. Please ensure it's a standard text PDF bank statement.");
  }

  // --- ANALYSIS LOGIC ---

  const totalSpend = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Merchant Analysis
  const merchantMap: Record<string, {count: number, amount: number}> = {};
  
  // Monthly Analysis
  const monthMap: Record<string, number> = {};

  transactions.forEach(t => {
    // Merchant Normalization
    let name = t.description.toUpperCase();
    name = name.replace(/[\d#*]+$/, '');
    name = name.replace(/(LLC|INC|LTD|CORP|US|USA)$/g, '');
    name = name.replace(/Payment to/i, '');
    name = name.replace(/Recurring Card Purchase/i, '');
    name = name.replace(/Check card purchase/i, '');
    name = name.trim();

    if (name.startsWith('AMZN') || name.startsWith('AMAZON')) name = 'AMAZON';
    if (name.startsWith('UBER')) name = 'UBER';
    if (name.startsWith('LYFT')) name = 'LYFT';
    if (name.startsWith('DOORDASH')) name = 'DOORDASH';
    if (name.startsWith('APPLE.COM')) name = 'APPLE';
    if (name.startsWith('SQ *')) name = name.replace('SQ *', ''); 

    if (name.length > 1) {
        if (!merchantMap[name]) merchantMap[name] = { count: 0, amount: 0 };
        merchantMap[name].count++;
        merchantMap[name].amount += t.amount;
    }

    // Monthly Normalization (Simple heuristic based on MM/ or /MM format)
    // Try to parse date
    try {
        const d = new Date(t.date);
        // If date parsing fails (common with MM/DD formats without year), use string manipulation
        let monthIndex = -1;
        if (!isNaN(d.getTime())) {
            monthIndex = d.getMonth();
        } else {
             // Fallback for MM/DD
             const parts = t.date.split(/[/-]/);
             if (parts.length >= 2) {
                 const p1 = parseInt(parts[0]);
                 const p2 = parseInt(parts[1]);
                 // Assume first part is month if <= 12
                 if (p1 <= 12) monthIndex = p1 - 1;
                 else if (p2 <= 12) monthIndex = p2 - 1;
             }
        }

        if (monthIndex >= 0) {
            const monthName = new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'short' }).toUpperCase();
            if (!monthMap[monthName]) monthMap[monthName] = 0;
            monthMap[monthName] += t.amount;
        }
    } catch (e) {
        // ignore date errors
    }
  });

  const sortedMerchants = Object.entries(merchantMap).sort(([, a], [, b]) => b.amount - a.amount);
  const topMerchantEntry = sortedMerchants[0] || ['Unknown', { count: 0, amount: 0 }];

  const sortedByAmount = [...transactions].sort((a, b) => b.amount - a.amount);

  // Convert month map to array
  const monthsOrder = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthlySpend = monthsOrder
    .map(m => ({ month: m, amount: monthMap[m] || 0 }))
    .filter(m => m.amount > 0); // Only return months with data

  return {
    totalSpend,
    transactionCount: transactions.length,
    topMerchant: {
      name: topMerchantEntry[0],
      count: topMerchantEntry[1].count,
      amount: topMerchantEntry[1].amount
    },
    mostExpensiveItem: sortedByAmount[0] || { date: '', description: 'None', amount: 0 },
    monthlySpend,
    aura: determineAura(totalSpend, transactions.length, topMerchantEntry[0])
  };
};

