
import React from 'react';
import { 
  ShieldAlert, 
  XOctagon, 
  MousePointer2, 
  Newspaper, 
  CheckCircle2, 
  AlertTriangle, 
  Mic2, 
  Vote, 
  BarChart3,
  FileWarning,
  Skull,
  Sparkles,
  Zap,
  Clock,
  Layers,
  SearchCode,
  MessagesSquare
} from 'lucide-react';
import { ReportType, SubCategory } from './types';

interface CategoryConfig {
  name: string;
  description: string;
  subCats: SubCategory[];
}

export const CATEGORIES: Record<ReportType, CategoryConfig> = {
  type1: {
    name: "ফটোকর্ড স্টাইল (Type 1)",
    description: "সোশ্যাল মিডিয়া পোস্ট বা একক ছবির ফ্যাক্ট চেক।",
    subCats: [
      { id: 'news_card', label: 'নিউজ', icon: <Newspaper size={20} />, color: '#057a44' },
      { id: 'news_card_2', label: 'নিউজ ২', icon: <Layers size={20} />, color: '#e11d48' },
      { id: 'factcheck', label: 'ফ্যাক্টচেক', icon: <CheckCircle2 size={20} />, color: '#1e3a8a' },
      { id: 'distorted', label: 'বিকৃত প্রচার', icon: <FileWarning size={20} />, color: '#7c3aed' },
      { id: 'satire', label: 'ঠাট্টা / ব্যঙ্গ', icon: <Skull size={20} />, color: '#6366f1' },
      { id: 'rumor', label: 'গুজব', icon: <AlertTriangle size={20} />, color: '#b91c1c' },
      { id: 'fake_claim', label: 'ভুয়া দাবি', icon: <ShieldAlert size={20} />, color: '#991b1b' },
      { id: 'clickbait', label: 'চমকপ্রদ শিরোনাম', icon: <MousePointer2 size={20} />, color: '#ea580c' },
    ]
  },
  type2: {
    name: "তুলনামূলক লেআউট (Type 2)",
    description: "দাবি বনাম সত্য এবং ভুল তথ্য বিশ্লেষণের বিভিন্ন লেআউট।",
    subCats: [
      { id: 'claim_truth', label: 'দাবি বনাম সত্য', icon: <XOctagon size={20} />, color: '#111827' },
      { id: 'misinfo_analysis', label: 'ভুল তথ্য বিশ্লেষণ', icon: <SearchCode size={20} />, color: '#b91c1c' },
      { id: 'ai_gen_1', label: 'এ আই জেনারেটেড', icon: <Sparkles size={20} />, color: '#b91c1c' },
      { id: 'ai_gen_2', label: 'এ আই জেনারেটেড ২', icon: <Sparkles size={20} />, color: '#b91c1c' },
    ]
  },
  type3: {
    name: "উদ্ধৃতি তুলনা (Type 3)",
    description: "বক্তব্য তুলনা। দুইজন ব্যক্তির বক্তব্য পাশাপাশি দেখানোর জন্য।",
    subCats: [
      { id: 'quote_compare', label: 'উক্তি তুলনা', icon: <Mic2 size={20} />, color: '#0369a1' },
      { id: 'quote_compare_2', label: 'উক্তি তুলনা ২', icon: <MessagesSquare size={20} />, color: '#057a44' },
    ]
  },
  type4: {
    name: "নিউজ কার্ড (Type 4)",
    description: "ব্রেকিং নিউজ ও সর্বশেষ আপডেট। জরুরি তথ্যের জন্য ব্যবহৃত হয়।",
    subCats: [
      { id: 'breaking_news', label: 'ব্রেকিং নিউজ', icon: <Zap size={20} />, color: '#b91c1c' },
      { id: 'latest_news', label: 'সর্বশেষ সংবাদ', icon: <Clock size={20} />, color: '#b91c1c' },
      { id: 'result_1', label: 'সারাদেশের ফলাফল', icon: <BarChart3 size={20} />, color: '#1e3a8a' },
      { id: 'result_2', label: 'আসনভিত্তিক ফলাফল', icon: <Vote size={20} />, color: '#1e40af' },
    ]
  }
};
