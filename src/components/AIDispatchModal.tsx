import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Send,
  BookOpen,
  PlusCircle,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  Trash2,
  Edit3,
  RotateCcw,
  Zap,
  HelpCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { User, PlatformHelplinesConfig } from '../types';

export interface KnowledgeItem {
  id: string;
  topic: string;
  keywords: string[];
  responseUrdu: string;
  responseEn: string;
  category: 'DELIVERY' | 'COD' | 'RETURNS' | 'FEES' | 'PRODUCT' | 'CUSTOM';
  requiresHumanEscalation?: boolean;
}

const DEFAULT_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-1',
    topic: 'Delivery Time & Courier Tracking',
    keywords: ['delivery', 'time', 'kab pohnchega', 'kab milega', 'tracking', 'din lagengy', 'tcs', 'trax', 'leopards', 'postex', 'return'],
    responseUrdu:
      'محترم کسٹمر، پاکستان بھر میں پارسل 2 سے 4 کاروباری دنوں میں ٹی سی ایس (TCS)، ٹریکس (Trax) یا پوسٹ ایکس کوریئر کے ذریعے ڈلیور ہوتا ہے۔ بڑے شہروں (کراچی، لاہور، اسلام آباد) میں 24 سے 48 گھنٹوں میں پارسل پہنچ جاتا ہے۔ آپ کو روانگی کا ٹریکنگ نمبر بذریعہ ایس ایم ایس موصول ہوگا۔',
    responseEn:
      'Standard courier delivery across Pakistan takes 2 to 4 working days via TCS, Trax, PostEx, or Leopards Courier. Major hubs (Karachi, Lahore, Islamabad) usually arrive within 24-48 hours. Live tracking SMS is issued upon dispatch.',
    category: 'DELIVERY',
  },
  {
    id: 'kb-2',
    topic: 'Open Parcel / Flyer Seal Inspection Policy',
    keywords: ['khol k dekhna', 'open parcel', 'seal', 'pehle dekh skte', 'flyer check', 'rider', 'inspection'],
    responseUrdu:
      'پاکستان کوریئر پالیسی کے مطابق رائیڈر کیش وصول کرنے سے پہلے سیل فلائر کھولنے کی اجازت نہیں دیتا۔ البتہ اگر پروڈکٹ میں کوئی بھی خرابی، ٹوٹ پھوٹ یا غلط آئٹم نکلے تو 7 دن کی مکمل گارنٹی ہے۔ آپ پارسل کھولتے وقت ویڈیو بنا لیں، مفت ری پلیسمنٹ فوری فراہم کی جائے گی۔',
    responseEn:
      'Under standard courier Cash on Delivery rules in Pakistan, riders cannot open sealed flyers prior to cash collection. However, you are covered by our 7-day hassle-free replacement guarantee. Please record an unboxing video to claim an instant free replacement.',
    category: 'COD',
  },
  {
    id: 'kb-3',
    topic: 'Delivery Charges & Multi-Product Consolidations',
    keywords: ['charges', 'delivery fee', 'shipping', 'kitne paise', 'kharacha', 'cost', 'consolidated', 'bundle'],
    responseUrdu:
      'پورے پاکستان میں فلیٹ ڈلیوری چارجز صرف 200 روپے ہیں۔ اگر آپ ایک ہی اسٹور سے ایک سے زائد پروڈکٹس آرڈر کرتے ہیں تو تمام آئٹمز پر صرف ایک بار ڈلیوری چارجز ہوں گے، الگ الگ ڈلیوری نہیں لگے گی۔',
    responseEn:
      'Consolidated delivery charges start at a flat PKR 200 across Pakistan. Ordering multiple products from the same verified store bundles them into a single parcel barcode.',
    category: 'DELIVERY',
  },
  {
    id: 'kb-4',
    topic: 'Damaged / Broken Product (Urgent Escalation)',
    keywords: ['toota', 'broken', 'damage', 'kharab', 'defective', 'ghalat samaan', 'wrong item', 'nuksan', 'dispute'],
    responseUrdu:
      'ہم معذرت خواہ ہیں کہ آپ کو پروڈکٹ خراب موصول ہوئی۔ یہ اہم شکایت ہے اور سپورٹ ایگزیکٹو کو منتقل کر دی گئی ہے۔ براہ کرم اپنے پارسل کی تصویر/ویڈیو اور آرڈر نمبر ہمارے سپورٹ ای میل support@yourmartglobal.com یا ہیلپ لائن واٹس ایپ پر فوری بھیجیں تاکہ متبادل پارسل فوری روانہ کیا جائے۔',
    responseEn:
      'We deeply apologize for the damaged item. This is flagged as a high-priority issue. Please send an unboxing photo/video along with your order number to support@yourmartglobal.com or our dedicated WhatsApp desk for instant replacement dispatch.',
    category: 'RETURNS',
    requiresHumanEscalation: true,
  },
  {
    id: 'kb-5',
    topic: 'Order Cancellation / Address Modification (Urgent)',
    keywords: ['cancel', 'mansookh', 'address badalna', 'phone number ghalat', 'urgent roko'],
    responseUrdu:
      'اگر آپ کا پارسل ابھی تک فیکٹری سے ڈسپیچ نہیں ہوا تو ایڈریس یا آرڈر فوری کینسل کیا جا سکتا ہے۔ چونکہ یہ فوری نوعیت کا کام ہے، براہ کرم کسٹمر سپورٹ کو براہ راست واٹس ایپ یا ای میل پر اپنا آرڈر نمبر فوری بھیجیں۔',
    responseEn:
      'Orders can be modified or canceled prior to courier dispatch. Because of the urgent dispatch cut-off, please immediately use the Direct Email or WhatsApp helpline button below with your Order ID.',
    category: 'CUSTOM',
    requiresHumanEscalation: true,
  },
  {
    id: 'kb-6',
    topic: '2% Platform Commission, Profit Guard & Weekly Payouts',
    keywords: ['2% fee', 'commission', 'payout', 'kab milega profit', 'jazzcash', 'bank transfer', 'friday', 'profit', 'margin', 'wallet', 'escrow', 'profit guard'],
    responseUrdu:
      'پلیٹ فارم ہر کامیاب ڈلیورڈ آرڈر پر 2 فیصد فلیٹ سروس فیس چارج کرتا ہے۔ تمام ری سیلرز کا منافع اور سپلائرز کی ہول سیل رقم کوریئر کلیئرنس کے بعد براہ راست بینک اکاؤنٹ، جاز کیش یا ایزی پیسہ میں ٹرانسفر کر دی جاتی ہے۔',
    responseEn:
      'A flat 2% platform commission is charged on successfully delivered orders. Reseller profits and Supplier escrow settlements are disbursed directly to Pakistani Bank Accounts, JazzCash, or EasyPaisa.',
    category: 'FEES',
  },
  {
    id: 'kb-7',
    topic: 'Factory Stock Upload, Bulk CSV & Shopify Sync',
    keywords: ['stock', 'upload', 'catalog', 'csv', 'daraz', 'shopify', 'sync', 'export', 'pickup', 'rider'],
    responseUrdu:
      'فیکٹریز اور سپلائرز بلک سی ایس وی کے ذریعے ہزاروں پراڈکٹس بیک وقت لسٹ کر سکتے ہیں اور ری سیلرز ایک کلک سے دراز یا شاپائفائی اسٹور پر پروڈکٹس سنک کر سکتے ہیں۔ روزانہ سہ پہر کوریئر رائیڈرز فیکٹری سے پارسل پک اپ کرتے ہیں۔',
    responseEn:
      'Suppliers can upload up to 5,000+ SKUs via Bulk CSV Uploader, and Resellers can 1-click sync products to Shopify or Daraz. Assigned Trax/PostEx riders perform daily 3:00 PM warehouse pickups.',
    category: 'PRODUCT',
  },
];

interface AIDispatchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentUser?: User;
  helplinesConfig?: PlatformHelplinesConfig;
  initialRole?: 'RESELLER' | 'SUPPLIER' | 'BUYER';
  embedded?: boolean;
}

export const AIDispatchModal: React.FC<AIDispatchModalProps> = ({
  isOpen = true,
  onClose,
  currentUser,
  helplinesConfig,
  initialRole,
  embedded = false,
}) => {
  const [activeAudience, setActiveAudience] = useState<'RESELLER' | 'SUPPLIER' | 'BUYER'>(
    initialRole || (currentUser?.role === 'SUPPLIER' ? 'SUPPLIER' : 'RESELLER')
  );

  useEffect(() => {
    if (initialRole) setActiveAudience(initialRole);
  }, [initialRole]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>(() => {
    const saved = localStorage.getItem('ym_ai_dispatch_knowledge');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_KNOWLEDGE_BASE;
  });

  const [activeTab, setActiveTab] = useState<'CHAT' | 'KNOWLEDGE'>('CHAT');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

  // Chat simulator state
  const [chatMessages, setChatMessages] = useState<
    {
      id: string;
      sender: 'CUSTOMER' | 'AI_DISPATCH';
      text: string;
      urduText?: string;
      timestamp: string;
      isEscalated?: boolean;
      matchedTopic?: string;
    }[]
  >([
    {
      id: 'init-1',
      sender: 'AI_DISPATCH',
      text: 'Hello! I am the YourMart AI Dispatch & Customer Query Assistant. Ask any question regarding deliveries, COD inspection, returns, or 2% platform policies.',
      urduText:
        'السلام علیکم! میں یور مارٹ اے آئی ڈسپیچ اسسٹنٹ ہوں۔ ڈلیوری، کوریئر پارسل اوپننگ، ریٹرن یا پالیسی سے متعلق کوئی بھی سوال پوچھیں۔',
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Add Knowledge Form state
  const [newTopic, setNewTopic] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [newResponseUrdu, setNewResponseUrdu] = useState('');
  const [newResponseEn, setNewResponseEn] = useState('');
  const [newCategory, setNewCategory] = useState<KnowledgeItem['category']>('CUSTOM');
  const [newRequiresEscalation, setNewRequiresEscalation] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    localStorage.setItem('ym_ai_dispatch_knowledge', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  if (!isOpen) return null;

  // Process User Query and Match Knowledge
  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsgId = `usr-${Date.now()}`;
    const newCustomerMsg = {
      id: userMsgId,
      sender: 'CUSTOMER' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newCustomerMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      // Find match in knowledge base
      const lowerQuery = query.toLowerCase();
      
      // Check for urgent escalation keywords
      const urgentWords = ['toota', 'damage', 'kharab', 'cancel', 'dhoka', 'fraud', 'complaint', 'refund', 'ghalat', 'urgent', 'police', 'scam', 'wrong item'];
      const hasUrgentKeywords = urgentWords.some((w) => lowerQuery.includes(w));

      let matchedItem = knowledgeBase.find((item) =>
        item.keywords.some((k) => lowerQuery.includes(k.toLowerCase()))
      );

      // Default fallback if no match
      let aiText = '';
      let aiUrduText = '';
      let isEscalated = false;
      let matchedTopic = '';

      if (matchedItem) {
        aiText = matchedItem.responseEn;
        aiUrduText = matchedItem.responseUrdu;
        isEscalated = Boolean(matchedItem.requiresHumanEscalation || hasUrgentKeywords);
        matchedTopic = matchedItem.topic;
      } else if (hasUrgentKeywords) {
        aiText =
          'This appears to be an urgent customer matter requiring human executive intervention. Our automated dispatch system has escalated your request to direct email and WhatsApp desks for immediate handling.';
        aiUrduText =
          'یہ ایک انتہائی اہم اور فوری مسئلہ معلوم ہوتا ہے جس میں انسانی نمائندے کی مدد درکار ہے۔ آپ کی شکایت کو آفیشل ای میل اور واٹس ایپ ہیلپ لائن ڈیسک پر منتقل کر دیا گیا ہے۔';
        isEscalated = true;
        matchedTopic = 'Urgent Escalation';
      } else {
        aiText =
          'Thank you for your question. Standard deliveries take 2-4 working days via TCS/Trax across Pakistan with PKR 200 flat shipping. Reseller COD profits are transferred every Friday with a flat 2% platform fee.';
        aiUrduText =
          'آپ کے سوال کا شکریہ۔ پاکستان بھر میں ڈلیوری 2 سے 4 دن میں 200 روپے چارجز کے ساتھ کی جاتی ہے۔ تمام ری سیلر منافع جات 2 فیصد سروس فیس کے بعد ہر جمعہ کو ادا کیے جاتے ہیں۔ مزید معلومات کے لیے کسٹمر کیئر سے رابطہ کریں۔';
        matchedTopic = 'General Policy Clearance';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'AI_DISPATCH',
          text: aiText,
          urduText: aiUrduText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEscalated,
          matchedTopic,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  // Add new Knowledge Base Entry
  const handleAddKnowledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newResponseUrdu.trim()) return;

    const keywordsArray = newKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const newItem: KnowledgeItem = {
      id: `kb-${Date.now()}`,
      topic: newTopic.trim(),
      keywords: keywordsArray.length > 0 ? keywordsArray : [newTopic.toLowerCase()],
      responseUrdu: newResponseUrdu.trim(),
      responseEn: newResponseEn.trim() || newResponseUrdu.trim(),
      category: newCategory,
      requiresHumanEscalation: newRequiresEscalation,
    };

    setKnowledgeBase((prev) => [newItem, ...prev]);
    setNewTopic('');
    setNewKeywords('');
    setNewResponseUrdu('');
    setNewResponseEn('');
    setNewRequiresEscalation(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleDeleteKnowledge = (id: string) => {
    if (confirm('Delete this knowledge entry?')) {
      setKnowledgeBase((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const handleResetKnowledge = () => {
    if (confirm('Restore default knowledge base?')) {
      setKnowledgeBase(DEFAULT_KNOWLEDGE_BASE);
      localStorage.removeItem('ym_ai_dispatch_knowledge');
    }
  };

  const currentHelpline =
    activeAudience === 'SUPPLIER'
      ? helplinesConfig?.manufacturersHelpline
      : activeAudience === 'BUYER'
      ? helplinesConfig?.buyersHelpline
      : helplinesConfig?.resellersHelpline;

  const cleanWaNumber = (currentHelpline?.whatsapp || currentHelpline?.phone || '923001234567').replace(
    /[^0-9]/g,
    ''
  );

  const content = (
    <div className={embedded ? 'flex flex-col w-full rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden' : 'flex max-h-[94vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Bot className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                AI Dispatch & Customer Query Auto-Reply Engine
              </h3>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                اے آئی ڈسپیچ و آٹو ریپلائی
              </span>
            </div>
            <p className="text-xs text-slate-400">
              کسٹمر، ری سیلر اور سپلائر کے سوالات خودکار حل کرے اور فوری ہیلپ لائن فراہم کرے
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-[11px] font-bold">
            {(['RESELLER', 'SUPPLIER', 'BUYER'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveAudience(role)}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeAudience === role
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

        {/* Status Bar & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-6 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition ${
                activeTab === 'CHAT'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Auto-Reply Chat Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('KNOWLEDGE')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-bold transition ${
                activeTab === 'KNOWLEDGE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Knowledge Base ({knowledgeBase.length} Topics)</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-bold">Auto-Dispatch Active</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Escalation Support: <b className="text-white">Email & WhatsApp</b>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {embedded && helplinesConfig && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex items-center gap-1.5">
                {(['RESELLER', 'SUPPLIER', 'BUYER'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setActiveAudience(role)}
                    className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${
                      activeAudience === role
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {role === 'RESELLER' ? 'Reseller' : role === 'SUPPLIER' ? 'Manufacturer' : 'Buyer'}
                  </button>
                ))}
              </div>
              {cleanWaNumber && (
                <a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Direct WhatsApp ({currentHelpline?.phone})
                </a>
              )}
            </div>
          )}

          {activeTab === 'CHAT' ? (
            <div className="flex flex-col h-[520px]">
              {/* Quick Prompt Pills */}
              <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 text-[11px] whitespace-nowrap">Quick Test Questions:</span>
                {[
                  'Mera parcel kab tak pohnchega?',
                  'Can I check parcel before paying cash?',
                  'Delivery charges kitnay hain?',
                  'Mujhe toota hua product mila hai! (Urgent)',
                  'Mera order cancel karwana hai bohat zaroori hai (Urgent)',
                  '2% platform fee aur reseller payout kab hota hai?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuery(q)}
                    className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white transition"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3.5">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'CUSTOMER' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2.5 ${
                        msg.sender === 'CUSTOMER'
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                          : msg.isEscalated
                          ? 'border border-amber-500/50 bg-amber-950/40 text-amber-100 rounded-bl-none shadow-lg'
                          : 'border border-slate-800 bg-slate-900 text-slate-200 rounded-bl-none shadow'
                      }`}
                    >
                      {/* Sender and Topic Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 text-[10px]">
                        <span className="font-extrabold tracking-wide uppercase flex items-center gap-1">
                          {msg.sender === 'CUSTOMER' ? (
                            'Customer Query'
                          ) : msg.isEscalated ? (
                            <span className="text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Critical Human Escalation Required
                            </span>
                          ) : (
                            <span className="text-indigo-300 flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              AI Dispatch Clearance
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400">{msg.timestamp}</span>
                      </div>

                      {/* English Text */}
                      <p className="leading-relaxed">{msg.text}</p>

                      {/* Urdu Translation / Explanation */}
                      {msg.urduText && (
                        <div
                          className={`rounded-xl p-2.5 text-right font-sans text-xs leading-relaxed ${
                            msg.isEscalated
                              ? 'bg-amber-900/40 border border-amber-600/40 text-amber-200'
                              : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                          }`}
                          dir="rtl"
                        >
                          {msg.urduText}
                        </div>
                      )}

                      {/* Escalation Options (Direct Email & WhatsApp buttons) */}
                      {msg.isEscalated && (
                        <div className="pt-2 border-t border-amber-500/30 space-y-2">
                          <p className="text-[11px] font-bold text-amber-300">
                            ⚠️ Bohot zaroori kaam ke liye direct rabtay ke options:
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href="mailto:support@yourmartglobal.com?subject=Urgent Customer Query - Order Support"
                              className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-[11px] font-bold shadow transition"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              <span>Direct Email (support@yourmartglobal.com)</span>
                            </a>
                            <a
                              href="https://wa.me/923001234567?text=Assalam-o-Alaikum, I need urgent support regarding my order."
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-[11px] font-bold shadow transition"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>WhatsApp Helpline Desk</span>
                            </a>
                            <a
                              href="tel:+9221111222333"
                              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-[11px] font-bold transition"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Direct Call Desk</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                    <Bot className="h-4 w-4" />
                    <span>AI Dispatch knowledge base scan kar raha hai...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Customer question type karein (Urdu, Roman Urdu ya English)..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendQuery();
                  }}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSendQuery()}
                  disabled={!inputQuery.trim() || isTyping}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          ) : (
            /* Knowledge Base Manager */
            <div className="space-y-5">
              {saveToast && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-3 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Knowledge base entry saved successfully!</span>
                </div>
              )}

              {/* Add Knowledge Form */}
              <form
                onSubmit={handleAddKnowledge}
                className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-indigo-300 uppercase tracking-wider">
                    <PlusCircle className="h-4 w-4 text-indigo-400" />
                    <span>Add New Knowledge Entry (نالج بیس میں نیا موضوع شامل کریں)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetKnowledge}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Topic / Question Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Courier Flyer Opening & Seal Policy"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Trigger Keywords (Comma separated) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. seal, open, flyer, khol ke dekhna"
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Auto-Reply Content in Urdu / Roman Urdu (اردو جواب) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="کسٹمر کو دیا جانے والا خودکار جواب..."
                    value={newResponseUrdu}
                    onChange={(e) => setNewResponseUrdu(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none text-right"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    English Explanation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="English translation or secondary policy reference..."
                    value={newResponseEn}
                    onChange={(e) => setNewResponseEn(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-amber-300">
                    <input
                      type="checkbox"
                      checked={newRequiresEscalation}
                      onChange={(e) => setNewRequiresEscalation(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Requires Human Escalation (Bohot Zaroori - Direct Email/WhatsApp dega)</span>
                  </label>

                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                  >
                    Save to AI Knowledge Base
                  </button>
                </div>
              </form>

              {/* Existing Knowledge Cards List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Knowledge Base Topics ({knowledgeBase.length})
                </h4>

                {knowledgeBase.map((kb) => (
                  <div
                    key={kb.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{kb.topic}</span>
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                            {kb.category}
                          </span>
                          {kb.requiresHumanEscalation && (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/40">
                              Escalates to Email/Desk
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 mt-1">
                          <span className="text-slate-500">Keywords:</span>
                          <span>{kb.keywords.join(', ')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteKnowledge(kb.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans text-right" dir="rtl">
                      {kb.responseUrdu}
                    </p>

                    {kb.responseEn && (
                      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                        {kb.responseEn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-6 py-3 text-xs text-slate-500">
          <span>AI Auto-Reply cuts 80%+ repetitive customer queries. Critical issues trigger instant fallback.</span>
          {!embedded && onClose && (
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Close Engine
            </button>
          )}
        </div>
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md animate-fadeIn">
      {content}
    </div>
  );
};
