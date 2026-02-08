
import React, { useState, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Loader2, 
  ChevronRight, 
  RefreshCw, 
  LayoutGrid, 
  Edit3, 
  Calendar, 
  Type as TypeIcon,
  Trash2,
  Info,
  Home,
  Share2,
  XCircle
} from 'lucide-react';
import { FactDotLogo } from './components/FactDotLogo';
import { CATEGORIES } from './constants';
import { ReportType, SubCategory, ReportData } from './types';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const toEn = (str: string) => str.split('').map(c => bnDigits.indexOf(c) > -1 ? enDigits[bnDigits.indexOf(c)] : c).join('');
const toBn = (str: string | number) => String(str).split('').map(c => enDigits.indexOf(c) > -1 ? bnDigits[enDigits.indexOf(c)] : c).join('');

const getCurrentDateBn = () => {
  const date = new Date();
  const day = toBn(date.getDate());
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];
  const month = months[date.getMonth()];
  const year = toBn(date.getFullYear());
  return `${day} ${month} ${year}`;
};

const getInitialReportData = (): ReportData => ({
  title: '',
  redTitle: '',
  description: '',
  image1: null,
  image2: null,
  candidateImage1: null,
  candidateImage2: null,
  date: getCurrentDateBn(),
  person1Name: '',
  person1Title: '',
  person1Quote: '',
  person2Name: '',
  person2Title: '',
  person2Quote: '',
  authorName: '',
  subText: '',
  source: 'SOCIAL MEDIA',
  party1Seats: '',
  party1MarkerName: '',
  party2Seats: '',
  party2MarkerName: '',
  candidateName1: '',
  candidateName2: '',
  winnerMarkerName: ''
});

const App: React.FC = () => {
  const [step, setStep] = useState<'typeSelection' | 'subCategorySelection' | 'editor'>('typeSelection');
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<SubCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const [reportData, setReportData] = useState<ReportData>(getInitialReportData());

  const resetApp = useCallback((goToHome: boolean) => {
    setReportData(getInitialReportData());
    setResetCounter(prev => prev + 1);
    if (goToHome) {
      setStep('typeSelection');
      setSelectedType(null);
      setSelectedSubCat(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleHomeClick = () => {
    if (step === 'typeSelection') return;
    if (window.confirm("আপনি কি হোম স্ক্রিনে ফিরতে চান? আপনার বর্তমান কাজ মুছে যাবে।")) {
      resetApp(true);
    }
  };

  const handleClearClick = () => {
    if (window.confirm("আপনি কি সব তথ্য মুছে ফেলে নতুন করে শুরু করতে চান?")) {
      resetApp(false);
    }
  };

  const isFactCheck = selectedType === 'type1' && selectedSubCat?.id === 'factcheck';
  const isType1News = selectedType === 'type1' && selectedSubCat?.id === 'news_card';
  const isType1News2 = selectedType === 'type1' && selectedSubCat?.id === 'news_card_2';
  const isType2 = selectedType === 'type2';
  const isType2TwoImages = isType2 && (selectedSubCat?.id === 'claim_truth' || selectedSubCat?.id === 'ai_gen_2');
  const isQuoteCompare2 = selectedType === 'type3' && selectedSubCat?.id === 'quote_compare_2';
  const isType4 = selectedType === 'type4';
  const isNewsCardType4 = isType4 && (selectedSubCat?.id === 'breaking_news' || selectedSubCat?.id === 'latest_news');
  const isResultType = isType4 && (selectedSubCat?.id === 'result_1' || selectedSubCat?.id === 'result_2');
  const isResult1 = isType4 && selectedSubCat?.id === 'result_1';
  const isResult2 = isType4 && selectedSubCat?.id === 'result_2';

  const isSingleImageOverall = selectedSubCat && (
    ['satire', 'rumor', 'fake_claim', 'clickbait', 'distorted'].includes(selectedSubCat.id) || 
    isType1News || isType1News2 || isQuoteCompare2 || 
    (selectedType === 'type2' && (selectedSubCat.id === 'misinfo_analysis' || selectedSubCat.id === 'ai_gen_1')) || 
    isNewsCardType4
  );

  const voteDiff = useMemo(() => {
    const v1 = parseInt(toEn(reportData.party1Seats || '0')) || 0;
    const v2 = parseInt(toEn(reportData.party2Seats || '0')) || 0;
    return toBn(Math.abs(v1 - v2));
  }, [reportData.party1Seats, reportData.party2Seats]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof ReportData) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportData(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (key: keyof ReportData) => {
    setReportData(prev => ({ ...prev, [key]: null }));
  };

  const generateCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const preview = document.getElementById('report-preview');
    // @ts-ignore
    if (!preview || !window.html2canvas) {
      alert("সিস্টেম লোড হচ্ছে, আবার চেষ্টা করুন।");
      return null;
    }

    setIsProcessing(true);
    try {
      // @ts-ignore
      const canvas = await window.html2canvas(preview, {
        scale: 4, 
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FFFFFF',
        logging: false,
        width: 400,
        height: 500,
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.getElementById('report-preview');
          if (el) {
              // Reset all potential problematic transforms and positioning
              el.style.transform = 'none';
              el.style.webkitTransform = 'none';
              el.style.margin = '0';
              el.style.padding = '0';
              el.style.width = '400px';
              el.style.height = '500px';
              el.style.position = 'static';
              el.style.display = 'flex';
              el.style.flexDirection = 'column';
              el.style.overflow = 'hidden';

              // Force image containment in cloned document
              const imgs = el.getElementsByTagName('img');
              for (let i = 0; i < imgs.length; i++) {
                const img = imgs[i] as HTMLImageElement;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '100%';
                img.style.objectFit = 'contain';
                
                // If the parent is a picture container, ensure it clips
                if (img.parentElement) {
                  img.parentElement.style.overflow = 'hidden';
                  img.parentElement.style.display = 'flex';
                  img.parentElement.style.alignItems = 'center';
                  img.parentElement.style.justifyContent = 'center';
                }
              }
          }
        }
      });
      return canvas;
    } catch (err) {
      console.error(err);
      alert("ইমেজ জেনারেশন ব্যর্থ হয়েছে।");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = async () => {
    const canvas = await generateCanvas();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `FactDot_${selectedSubCat?.label || 'Report'}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    }
  };

  const shareReport = async () => {
    const canvas = await generateCanvas();
    if (canvas) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const fileName = `FactDot_${selectedSubCat?.label || 'Report'}_${Date.now()}.png`;
          const file = new File([blob], fileName, { type: 'image/png' });
          
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'FactDot Report',
              text: 'Check out this FactDot report!',
            });
          } else {
            alert("আপনার ব্রাউজারে সরাসরি সেয়ার অপশনটি নেই। অনুগ্রহ করে ইমেজটি ডাউনলোড করে সেয়ার করুন।");
            downloadReport();
          }
        }, 'image/png');
      } catch (err) {
        console.error("Sharing failed", err);
        alert("সেয়ার করতে সমস্যা হয়েছে। অনুগ্রহ করে ডাউনলোড করে ট্রাই করুন।");
      }
    }
  };

  const clearField = (key: keyof ReportData) => {
    setReportData(prev => ({ ...prev, [key]: '' }));
  };

  const inputClasses = "w-full px-5 py-3 pr-10 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 bg-white placeholder-slate-400 font-medium";
  const inputClassesWithIcon = "w-full px-5 py-3 pl-12 pr-10 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 bg-white placeholder-slate-400 font-medium";
  const textareaClasses = "w-full px-5 py-3 pr-10 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-900 bg-white placeholder-slate-400 font-medium text-lg leading-relaxed";

  const ClearButton = ({ field }: { field: keyof ReportData }) => {
    if (!reportData[field]) return null;
    return (
      <button 
        type="button" 
        onClick={() => clearField(field)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors z-10 p-1"
      >
        <XCircle size={18} />
      </button>
    );
  };

  const TextareaClearButton = ({ field }: { field: keyof ReportData }) => {
    if (!reportData[field]) return null;
    return (
      <button 
        type="button" 
        onClick={() => clearField(field)}
        className="absolute right-3 top-4 text-slate-300 hover:text-red-500 transition-colors z-10 p-1"
      >
        <XCircle size={18} />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden flex flex-col selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center shadow-sm">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step !== 'typeSelection' && (
              <button 
                type="button"
                onClick={() => step === 'editor' ? setStep('subCategorySelection') : setStep('typeSelection')}
                className="p-2.5 hover:bg-slate-100 rounded-full transition-all group"
              >
                <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
            <div 
              className="flex items-center gap-2 cursor-pointer select-none group" 
              onClick={handleHomeClick}
            >
              <div className="text-indigo-600 group-hover:scale-110 transition-transform">
                <FactDotLogo size={32} />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tight">FactDot</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {step !== 'typeSelection' && (
              <div className="flex items-center bg-blue-50/50 border border-blue-100 rounded-2xl p-0.5 shadow-sm">
                <button 
                  onClick={handleHomeClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all active:scale-95"
                >
                  <Home size={14} /> <span>হোম</span>
                </button>
                <div className="w-px h-4 bg-blue-100"></div>
                <button 
                  onClick={handleClearClick}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-red-500 hover:bg-white hover:text-red-600 hover:shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} /> <span>ক্লিয়ার</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 md:py-12">
        {step === 'typeSelection' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-black mb-4 uppercase tracking-widest border border-indigo-100">
                পেশাদার রিপোর্ট মেকার
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">আপনার রিপোর্ট কার্ড তৈরি করুন</h1>
              <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                ফ্যাক্ট-চেক, নিউজ এবং নির্বাচনী ফলাফলের জন্য সোশ্যাল মিডিয়া ফ্রেন্ডলি লেআউট।
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(CATEGORIES) as [ReportType, typeof CATEGORIES.type1][]).map(([key, category], index) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => { setSelectedType(key); setStep('subCategorySelection'); }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group text-left relative flex flex-col items-start min-h-[360px] animate-in duration-700"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
                     <LayoutGrid size={28} className="text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-slate-800 tracking-tight">{category.name}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">
                    {category.description}
                  </p>
                  <div className="mt-auto flex items-center text-indigo-600 font-black text-sm uppercase tracking-wider">
                    শুরু করুন <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'subCategorySelection' && selectedType && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in duration-500">
             <div className="text-center">
              <h2 className="text-4xl font-black text-slate-900 mb-2">ক্যাটাগরি নির্বাচন করুন</h2>
              <p className="text-slate-500 font-medium text-lg">{CATEGORIES[selectedType].name} এর অন্তর্ভুক্ত টপিকগুলো দেখুন</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {CATEGORIES[selectedType].subCats.map((cat, idx) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => { setSelectedSubCat(cat); setStep('editor'); }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-5 group shadow-sm"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-all">
                    {React.cloneElement(cat.icon as React.ReactElement<any>, { className: "text-indigo-600", size: 28 })}
                  </div>
                  <span className="font-black text-xl text-slate-800">{cat.label}</span>
                  <ChevronRight size={24} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'editor' && selectedType && selectedSubCat && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in zoom-in-95 duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-2xl border-slate-200 space-y-8 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b pb-6">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                     <Edit3 size={24} className="text-indigo-600" /> তথ্য ইনপুট
                   </h2>
                   <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-wider">{CATEGORIES[selectedType].name}</p>
                 </div>
                 <div style={{ color: selectedSubCat.color, backgroundColor: selectedSubCat.color + '15' }} className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full border border-current/20 flex-shrink-0">
                    {selectedSubCat.label}
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">তারিখ (অটোমেটিক সেট করা)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`${inputClassesWithIcon} h-12 text-sm`}
                      value={reportData.date} 
                      onChange={(e) => setReportData({...reportData, date: e.target.value})} 
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <ClearButton field="date" />
                  </div>
                </div>

                {isResultType ? (
                   <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">
                           {isResult1 ? 'শিরোনাম (যেমন: বাংলাদেশ)' : 'আসন নাম (যেমন: নড়াইল-২)'}
                        </label>
                        <div className="relative">
                          <input type="text" className={inputClasses} value={reportData.title} onChange={(e) => setReportData({...reportData, title: e.target.value})} />
                          <ClearButton field="title" />
                        </div>
                      </div>
                      
                      {isResult2 && (
                         <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <label className="block text-xs font-black text-indigo-800 mb-2 uppercase tracking-widest">বিজয়ী মার্কার নাম</label>
                            <div className="relative">
                              <input type="text" className={inputClasses} placeholder="যেমন: নৌকা / ধানের শীষ" value={reportData.winnerMarkerName} onChange={(e) => setReportData({...reportData, winnerMarkerName: e.target.value})} />
                              <ClearButton field="winnerMarkerName" />
                            </div>
                         </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100 space-y-4">
                           <span className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">তথ্য ১ (বাম)</span>
                           {isResult2 ? null : (
                              <div className="relative">
                                <input type="text" className={inputClasses} placeholder="প্রার্থীর নাম" value={reportData.candidateName1} onChange={(e) => setReportData({...reportData, candidateName1: e.target.value})} />
                                <ClearButton field="candidateName1" />
                              </div>
                           )}
                           <div className="relative">
                             <input type="text" className={inputClasses} placeholder={isResult1 ? "আসন সংখ্যা" : "ভোট সংখ্যা"} value={reportData.party1Seats} onChange={(e) => setReportData({...reportData, party1Seats: e.target.value})} />
                             <ClearButton field="party1Seats" />
                           </div>
                           <div className="relative">
                             <input type="text" className={inputClasses} placeholder="মার্কার নাম" value={reportData.party1MarkerName} onChange={(e) => setReportData({...reportData, party1MarkerName: e.target.value})} />
                             <ClearButton field="party1MarkerName" />
                           </div>
                           
                           <div className="space-y-2">
                              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-white hover:border-blue-400 overflow-hidden relative group">
                                 {reportData.image1 ? (
                                   <>
                                     <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain" />
                                     <button type="button" onClick={() => removeImage('image1')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Trash2 size={12} />
                                     </button>
                                   </>
                                 ) : <div className="text-[10px] font-black text-slate-300 text-center uppercase">ছবি ১</div>}
                                 <input key={`file-1-${resetCounter}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image1')} />
                              </label>
                           </div>
                        </div>
                        <div className="p-6 bg-red-50/30 rounded-2xl border border-red-100 space-y-4">
                           <span className="text-[10px] font-black text-red-800 uppercase tracking-tighter">তথ্য ২ (ডান)</span>
                           {isResult2 ? null : (
                              <div className="relative">
                                <input type="text" className={inputClasses} placeholder="প্রার্থীর নাম" value={reportData.candidateName2} onChange={(e) => setReportData({...reportData, candidateName2: e.target.value})} />
                                <ClearButton field="candidateName2" />
                              </div>
                           )}
                           <div className="relative">
                             <input type="text" className={inputClasses} placeholder={isResult1 ? "আসন সংখ্যা" : "ভোট সংখ্যা"} value={reportData.party2Seats} onChange={(e) => setReportData({...reportData, party2Seats: e.target.value})} />
                             <ClearButton field="party2Seats" />
                           </div>
                           <div className="relative">
                             <input type="text" className={inputClasses} placeholder="মার্কার নাম" value={reportData.party2MarkerName} onChange={(e) => setReportData({...reportData, party2MarkerName: e.target.value})} />
                             <ClearButton field="party2MarkerName" />
                           </div>
                           
                           <div className="space-y-2">
                              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-red-200 rounded-xl cursor-pointer bg-white hover:border-blue-400 overflow-hidden relative group">
                                 {reportData.image2 ? (
                                   <>
                                     <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain" />
                                     <button type="button" onClick={() => removeImage('image2')} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Trash2 size={12} />
                                     </button>
                                   </>
                                 ) : <div className="text-[10px] font-black text-slate-300 text-center uppercase">ছবি ২</div>}
                                 <input key={`file-2-${resetCounter}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image2')} />
                              </label>
                           </div>
                        </div>
                      </div>
                   </div>
                ) : (
                  <>
                    {selectedType !== 'type3' && (
                      <div className="relative">
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">শিরোনাম ১ (কালো রঙ)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="শিরোনাম লিখুন..."
                            className={inputClassesWithIcon} 
                            value={reportData.title} 
                            onChange={(e) => setReportData({...reportData, title: e.target.value})} 
                          />
                          <TypeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <ClearButton field="title" />
                        </div>
                      </div>
                    )}

                    {isType1News2 && (
                       <div>
                         <label className="block text-xs font-black text-red-500 mb-2 uppercase tracking-widest">শিরোনাম ২ (লাল রঙ)</label>
                         <div className="relative">
                            <input type="text" className={`${inputClasses} border-red-100 text-red-600 font-bold`} value={reportData.redTitle} onChange={(e) => setReportData({...reportData, redTitle: e.target.value})} />
                            <ClearButton field="redTitle" />
                         </div>
                       </div>
                    )}

                    {!isType1News2 && !isNewsCardType4 && selectedType !== 'type3' && (
                       <div className="relative">
                        <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">বিস্তারিত বিবরণ</label>
                        <div className="relative">
                          <textarea rows={4} className={textareaClasses} value={reportData.description} onChange={(e) => setReportData({...reportData, description: e.target.value})} />
                          <TextareaClearButton field="description" />
                        </div>
                      </div>
                    )}

                    {(isType1News || isType1News2) && (
                       <div>
                         <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">সোর্স (Source)</label>
                         <div className="relative">
                           <input type="text" className={`${inputClasses} uppercase text-sm`} value={reportData.source} onChange={(e) => setReportData({...reportData, source: e.target.value})} />
                           <ClearButton field="source" />
                         </div>
                       </div>
                    )}

                    {isType1News && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">প্রবক্তার নাম</label>
                          <div className="relative">
                            <input type="text" className={inputClasses} value={reportData.person1Name} onChange={(e) => setReportData({...reportData, person1Name: e.target.value})} />
                            <ClearButton field="person1Name" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">পদবি/বিবরণ</label>
                          <div className="relative">
                            <input type="text" className={inputClasses} value={reportData.person1Title} onChange={(e) => setReportData({...reportData, person1Title: e.target.value})} />
                            <ClearButton field="person1Title" />
                          </div>
                        </div>
                      </div>
                    )}

                    {(selectedType === 'type3') && (
                       <div className="space-y-6">
                         <div className={`p-6 rounded-2xl border space-y-4 ${isQuoteCompare2 ? 'bg-emerald-50/20 border-emerald-100' : 'bg-emerald-50/40 border-emerald-100'}`}>
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">
                               {isQuoteCompare2 ? 'আগে যা বলেছিলেন' : 'ব্যক্তি ১ (বাম)'}
                            </span>
                            {!isQuoteCompare2 && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                  <input type="text" placeholder="নাম" className={inputClasses} value={reportData.person1Name} onChange={(e) => setReportData({...reportData, person1Name: e.target.value})} />
                                  <ClearButton field="person1Name" />
                                </div>
                                <div className="relative">
                                  <input type="text" placeholder="পদবি/বিবরণ" className={inputClasses} value={reportData.person1Title} onChange={(e) => setReportData({...reportData, person1Title: e.target.value})} />
                                  <ClearButton field="person1Title" />
                                </div>
                              </div>
                            )}
                            <div className="relative">
                              <textarea placeholder="উক্তি..." rows={3} className={textareaClasses} value={reportData.person1Quote} onChange={(e) => setReportData({...reportData, person1Quote: e.target.value})} />
                              <TextareaClearButton field="person1Quote" />
                            </div>
                         </div>
                         <div className={`p-6 rounded-2xl border space-y-4 ${isQuoteCompare2 ? 'bg-indigo-50/20 border-indigo-100' : 'bg-indigo-50/40 border-indigo-100'}`}>
                            <span className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">
                               {isQuoteCompare2 ? 'এখন যা বলছেন' : 'ব্যক্তি ২ (ডান)'}
                            </span>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                <input type="text" placeholder="নাম" className={inputClasses} value={reportData.person2Name} onChange={(e) => setReportData({...reportData, person2Name: e.target.value})} />
                                <ClearButton field="person2Name" />
                              </div>
                              <div className="relative">
                                <input type="text" placeholder="পদবি/বিবরণ" className={inputClasses} value={reportData.person2Title} onChange={(e) => setReportData({...reportData, person2Title: e.target.value})} />
                                <ClearButton field="person2Title" />
                              </div>
                            </div>
                            <div className="relative">
                              <textarea placeholder="উক্তি..." rows={3} className={textareaClasses} value={reportData.person2Quote} onChange={(e) => setReportData({...reportData, person2Quote: e.target.value})} />
                              <TextareaClearButton field="person2Quote" />
                            </div>
                         </div>
                       </div>
                    )}

                    {!isNewsCardType4 && (
                      <div className={`grid ${isSingleImageOverall ? 'grid-cols-1' : 'grid-cols-2'} gap-6 pt-4`}>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                               {isQuoteCompare2 ? 'ব্যক্তির ছবি' : 'ছবি ১ আপলোড'}
                            </label>
                            <label className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-white overflow-hidden relative group">
                              {reportData.image1 ? (
                                <>
                                  <img crossOrigin="anonymous" src={reportData.image1} className="h-full w-full object-contain" />
                                  <button type="button" onClick={() => removeImage('image1')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full">
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              ) : <Upload className="text-slate-300" size={28} />}
                              <input key={`main-file-1-${resetCounter}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image1')} />
                            </label>
                        </div>
                        {!isSingleImageOverall && (
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                ছবি ২ আপলোড
                              </label>
                              <label className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-white overflow-hidden relative group">
                                {reportData.image2 ? (
                                  <>
                                    <img crossOrigin="anonymous" src={reportData.image2} className="h-full w-full object-contain" />
                                    <button type="button" onClick={() => removeImage('image2')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full">
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                ) : <Upload className="text-slate-300" size={28} />}
                                <input key={`main-file-2-${resetCounter}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'image2')} />
                              </label>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center space-y-8">
               <div className="flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
                  <Info size={14} /> লাইভ প্রিভিউ
               </div>
               <div className="relative group perspective-1000">
                  <div 
                    id="report-preview" 
                    key={resetCounter}
                    className={`w-[400px] h-[500px] bg-white shadow-2xl overflow-hidden flex flex-col origin-top transform scale-90 sm:scale-100 ${isType1News || isType1News2 ? '' : 'border border-slate-100 rounded-sm'}`}
                  >
                    {/* TOP STATUS BAR / LABEL */}
                    {isFactCheck ? (
                        <div className="w-full h-16 flex z-30 shrink-0">
                           <div className="flex-1 bg-[#b91c1c] flex items-center justify-center py-2">
                              <h4 className="text-white text-3xl font-black">গুজব</h4>
                           </div>
                           <div className="flex-1 bg-[#057a44] flex items-center justify-center py-2">
                              <h4 className="text-white text-3xl font-black">মূল ঘটনা</h4>
                           </div>
                        </div>
                    ) : isNewsCardType4 ? (
                        <div className="w-full h-16 bg-[#b91c1c] flex items-center justify-center relative z-30 shrink-0">
                           <h4 className="text-white text-[28px] font-black">{selectedSubCat.label}</h4>
                        </div>
                    ) : isResultType ? (
                        <div className="w-full h-16 bg-[#1e3a8a] flex items-center justify-center relative z-30 shrink-0">
                           <h4 className="text-white text-[28px] font-black tracking-tight">নির্বাচনী ফলাফল ২০২৬</h4>
                        </div>
                    ) : (selectedType !== 'type3' && !isType1News && !isType1News2) && (
                        <div style={{ backgroundColor: selectedSubCat.color }} className="w-full min-h-[56px] flex items-center justify-center relative z-30 px-4 py-3 shrink-0">
                           <h4 className="text-white text-[28px] font-black uppercase tracking-widest leading-[1.4] text-center">
                              {selectedSubCat.label}
                           </h4>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col overflow-hidden relative bg-white z-0">
                        {/* DATE STAMP */}
                        {(isType2 || isNewsCardType4 || isResultType) && (
                            <div className="absolute top-2 right-4 z-40">
                              <span className="text-[11px] font-bold text-slate-400">{reportData.date || 'তারিখ নেই'}</span>
                           </div>
                        )}
                        {isFactCheck && (
                            <div className="w-full flex justify-end px-6 py-2 h-8 z-40">
                              <span className="text-[12px] font-bold text-slate-400">{reportData.date || 'তারিখ নেই'}</span>
                           </div>
                        )}
                        {(selectedType === 'type3' || (!isType1News && !isType1News2 && !isFactCheck && !isType2 && !isNewsCardType4 && !isResultType)) && (
                           <div className="absolute top-2 right-4 z-40">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reportData.date || 'তারিখ নেই'}</span>
                           </div>
                        )}

                        {/* LAYOUTS */}
                        {isNewsCardType4 ? (
                           <div className="flex-1 flex items-center justify-center px-6 z-10">
                              <div className="w-full bg-white rounded-[1.5rem] border-2 border-[#1e293b] p-8 text-center relative">
                                 <h2 className="text-[30px] font-black text-[#1e293b] leading-[1.3] tracking-tight">
                                    {reportData.title || 'শিরোনাম এখানে দেখা যাবে'}
                                 </h2>
                              </div>
                           </div>
                        ) : isResult1 ? (
                           <div className="flex-1 flex flex-col items-center pt-4 h-full z-10">
                              <div className="w-[85%] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center mb-6 relative z-20">
                                 <h2 className="text-[28px] font-black text-slate-900 leading-tight">{reportData.title || "দেশ/সংস্থা"}</h2>
                              </div>
                              <div className="flex-1 w-full grid grid-cols-2 px-4 gap-8">
                                 <div className="flex flex-col items-center space-y-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-slate-50 shadow-md flex items-center justify-center overflow-hidden bg-white shrink-0">
                                       {reportData.image1 ? <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain" /> : <div className="text-slate-100 italic">M1</div>}
                                    </div>
                                    <span className="text-[18px] font-black text-slate-800">{reportData.party1MarkerName || "মার্কার নাম"}</span>
                                    <div className="flex flex-col items-center pt-2">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">আসন সংখ্যা</span>
                                       <span className="text-[52px] font-black text-[#1e3a8a] leading-none">{reportData.party1Seats || toBn(0)}</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center space-y-4">
                                    <div className="w-24 h-24 rounded-full border-2 border-slate-50 shadow-md flex items-center justify-center overflow-hidden bg-white shrink-0">
                                       {reportData.image2 ? <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain" /> : <div className="text-slate-100 italic">M2</div>}
                                    </div>
                                    <span className="text-[18px] font-black text-slate-800">{reportData.party2MarkerName || "মার্কার নাম"}</span>
                                    <div className="flex flex-col items-center pt-2">
                                       <span className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">আসন সংখ্যা</span>
                                       <span className="text-[52px] font-black text-[#dc2626] leading-none">{reportData.party2Seats || toBn(0)}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ) : isResult2 ? (
                           <div className="flex-1 flex flex-col items-center pt-4 h-full px-4 pb-2 z-10">
                              <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-3 text-center mb-4 shrink-0 relative z-20">
                                 <h2 className="text-[24px] font-black text-slate-900 leading-tight">{reportData.title || "আসন নাম"}</h2>
                              </div>
                              <div className="flex-1 w-full grid grid-cols-2 divide-x divide-slate-100 mb-2">
                                 <div className="flex flex-col items-center p-2 space-y-3">
                                    <span className="text-[18px] font-black text-slate-800 text-center h-10 flex items-center leading-tight line-clamp-2">{reportData.party1MarkerName || "মার্কার নাম"}</span>
                                    <div className="w-20 h-20 rounded-2xl bg-white border p-1 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                       {reportData.image1 ? <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain" /> : <div className="text-slate-100 italic text-[10px]">IMG</div>}
                                    </div>
                                    <div className="flex flex-col items-center leading-none">
                                       <span className="text-[42px] font-black text-[#1e3a8a] leading-none">{reportData.party1Seats || toBn(0)}</span>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">প্রাপ্ত ভোট</span>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-center p-2 space-y-3">
                                    <span className="text-[18px] font-black text-slate-800 text-center h-10 flex items-center leading-tight line-clamp-2">{reportData.party2MarkerName || "মার্কার নাম"}</span>
                                    <div className="w-20 h-20 rounded-2xl bg-white border p-1 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                                       {reportData.image2 ? <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain" /> : <div className="text-slate-100 italic text-[10px]">IMG</div>}
                                    </div>
                                    <div className="flex flex-col items-center leading-none">
                                       <span className="text-[42px] font-black text-[#dc2626] leading-none">{reportData.party2Seats || toBn(0)}</span>
                                       <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">প্রাপ্ত ভোট</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="w-full px-4 py-3 text-center border-t border-slate-50 mt-auto shrink-0 relative z-20 bg-white/90">
                                 <h3 className="text-[20px] font-black text-slate-900 leading-tight">
                                    {reportData.winnerMarkerName || reportData.party1MarkerName || "বিজয়ী দল"} এগিয়ে আছে {voteDiff} ভোটে
                                 </h3>
                              </div>
                           </div>
                        ) : isFactCheck ? (
                           <div className="flex-1 flex flex-col p-4 space-y-6 z-10">
                              <div className="grid grid-cols-2 gap-4 h-48 items-center shrink-0">
                                  <div className="bg-white h-full rounded-sm shadow-md border border-slate-100 flex items-center justify-center overflow-hidden relative">
                                      {reportData.image1 ? <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain" /> : <div className="text-slate-100 font-black text-3xl italic">IMG 1</div>}
                                  </div>
                                  <div className="bg-white h-full rounded-sm shadow-md border border-slate-100 flex items-center justify-center overflow-hidden relative">
                                      {reportData.image2 ? <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain" /> : <div className="text-slate-100 font-black text-3xl italic">IMG 2</div>}
                                  </div>
                              </div>
                              <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-20">
                                  <h2 className="text-[30px] font-black text-[#b91c1c] leading-[1.3] text-center py-2">
                                     {reportData.title || 'শিরোনাম এখানে দেখা যাবে'}
                                  </h2>
                              </div>
                           </div>
                        ) : isType1News ? (
                           <div className="flex-1 flex flex-col p-6 h-full relative z-10">
                              <div className="flex justify-between items-center mb-6 relative z-30">
                                 <div className="flex items-center gap-2">
                                    <div className="text-[#057a44]">
                                       <FactDotLogo size={32} />
                                    </div>
                                    <span className="text-[22px] font-black text-[#057a44] tracking-tighter">FactDot</span>
                                 </div>
                                 <div className="text-right border-l pl-3 border-slate-200">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">COURTESY: {reportData.source || 'SOURCE'}</span>
                                    <span className="block text-[10px] font-black pt-0.5">{reportData.date || 'তারিখ'}</span>
                                 </div>
                              </div>
                              <div className="z-30 space-y-3 mb-4">
                                 <h2 className="text-[24px] font-black text-slate-800 leading-[1.3]">"{reportData.title || 'শিরোনাম'}"</h2>
                                 <p className="text-[16px] font-bold text-slate-600 leading-[1.4]">{reportData.description || 'বিস্তারিত বিবরণ...'}</p>
                              </div>
                              <div className="flex-1 min-h-0 relative z-10 mt-auto flex">
                                 <div className="mt-auto pb-4 w-[60%] z-40">
                                    <span className="text-lg font-black text-slate-800 block leading-tight">- {reportData.person1Name || 'নাম'}</span>
                                    <span className="text-[11px] font-bold text-slate-500 block leading-[1.3]">{reportData.person1Title || 'পদবি'}</span>
                                 </div>
                                 <div className="absolute bottom-0 right-0 h-full w-[65%] flex items-end justify-end z-20 overflow-hidden">
                                    {reportData.image1 && <img crossOrigin="anonymous" src={reportData.image1} className="max-h-full max-w-full object-contain object-bottom" />}
                                 </div>
                              </div>
                           </div>
                        ) : isType1News2 ? (
                           <div className="flex-1 flex flex-col h-full bg-white relative z-10">
                              <div className="flex justify-between p-6 pb-2 items-start relative z-30">
                                 <div className="flex items-center gap-2">
                                    <div className="text-[#057a44]">
                                       <FactDotLogo size={32} />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-[20px] font-black tracking-tighter text-[#057a44] leading-none">FactDot</span>
                                       <span className="text-[9px] font-black tracking-widest text-[#057a44] opacity-80 leading-none">REPORT</span>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">COURTESY: {reportData.source || 'SOURCE'}</span>
                                    <span className="block text-[11px] font-black pt-1.5 text-slate-800">{reportData.date || 'তারিখ'}</span>
                                 </div>
                              </div>

                              <div className="px-6 py-8 text-center flex flex-col justify-center gap-2 relative z-30">
                                 <h2 className="text-[32px] font-black text-slate-800 leading-[1.2] tracking-tight">
                                    "{reportData.title || 'প্রথম শিরোনাম'}"
                                 </h2>
                                 {reportData.redTitle && (
                                    <h3 className="text-[32px] font-black text-[#e11d48] leading-[1.1] tracking-tight mt-1">
                                       {reportData.redTitle}
                                    </h3>
                                 )}
                              </div>

                              <div className="flex-1 w-full px-6 pb-8 mt-auto z-10 overflow-hidden">
                                 <div className="bg-slate-50 border border-slate-100 rounded-sm overflow-hidden flex items-center justify-center h-48 w-full relative">
                                    {reportData.image1 ? <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain" /> : <div className="text-slate-100 text-4xl font-black italic opacity-20">FactDot IMAGE</div>}
                                 </div>
                              </div>
                           </div>
                        ) : selectedType === 'type3' ? (
                           <div className="flex-1 flex h-full relative z-10">
                              <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: selectedSubCat.color }}>
                                 <div className="p-5 pt-12 text-white flex-1 space-y-5 z-20">
                                    <h2 className="text-[20px] font-bold leading-[1.4] drop-shadow-sm">"{reportData.person1Quote || 'উক্তি'}"</h2>
                                    <div className="border-t border-white/20 pt-3">
                                       <span className="text-sm font-black block leading-[1.4]">- {isQuoteCompare2 ? (reportData.person2Name || 'নাম') : (reportData.person1Name || 'নাম')}</span>
                                       <span className="text-[10px] opacity-70 font-bold uppercase block leading-[1.4]">{isQuoteCompare2 ? reportData.person2Title : reportData.person1Title || 'পদবি'}</span>
                                    </div>
                                 </div>
                                 {!isQuoteCompare2 && (
                                   <div className="h-40 w-full flex items-end relative z-10 overflow-hidden">
                                      {reportData.image1 && <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain object-bottom" />}
                                   </div>
                                 )}
                              </div>
                              <div className="flex-1 flex flex-col relative bg-white border-l border-slate-100 overflow-hidden">
                                 <div className="p-5 pt-12 text-slate-800 flex-1 space-y-5 z-20">
                                    <h2 className="text-[20px] font-bold leading-[1.4]">"{reportData.person2Quote || 'উক্তি'}"</h2>
                                    <div className="border-t border-slate-100 pt-3">
                                       <span className="text-sm font-black block leading-[1.4] text-red-600">- {reportData.person2Name || 'নাম'}</span>
                                       <span className="text-[10px] text-slate-400 font-bold uppercase block leading-[1.4]">{reportData.person2Title || 'পদবি'}</span>
                                    </div>
                                 </div>
                                 {!isQuoteCompare2 && (
                                   <div className="h-40 w-full flex items-end relative z-10 overflow-hidden">
                                      {reportData.image2 && <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain object-bottom" />}
                                   </div>
                                 )}
                              </div>
                              {isQuoteCompare2 && (
                                <div className="absolute bottom-0 left-0 w-full h-[55%] flex items-end justify-center pointer-events-none z-30 overflow-hidden">
                                  {reportData.image1 && (
                                    <img 
                                      crossOrigin="anonymous"
                                      src={reportData.image1} 
                                      className="max-h-full max-w-[90%] object-contain object-bottom drop-shadow-xl" 
                                      alt="Person"
                                    />
                                  )}
                                </div>
                              )}
                           </div>
                        ) : isType2 ? (
                           <div className="flex-1 flex flex-col pt-6 space-y-6 z-10">
                              <div className={`grid ${isType2TwoImages ? 'grid-cols-2 gap-3 px-4' : 'grid-cols-1 px-8'} h-48 relative z-10`}>
                                 <div className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center relative">
                                    {reportData.image1 ? <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain p-2" /> : <div className="text-slate-100 font-black text-3xl italic">IMG 1</div>}
                                    {selectedSubCat.id === 'claim_truth' && <span className="absolute top-3 left-3 bg-[#e11d48] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase z-20">দাবি</span>}
                                 </div>
                                 {isType2TwoImages && (
                                    <div className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center relative">
                                       {reportData.image2 ? <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain p-2" /> : <div className="text-slate-100 font-black text-3xl italic">IMG 2</div>}
                                       {selectedSubCat.id === 'claim_truth' && <span className="absolute top-3 left-3 bg-[#10b981] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase z-20">বাস্তবতা</span>}
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 flex flex-col justify-start items-center px-8 pt-4 relative z-20">
                                  <div className="bg-white p-6 rounded-[2rem] border border-slate-50 w-full text-center space-y-4">
                                      <h2 className="text-[26px] font-black text-[#b91c1c] leading-[1.4]">
                                         {reportData.title || 'শিরোনাম'}
                                      </h2>
                                      <p className="text-[14px] font-bold text-slate-500 leading-[1.6] italic">
                                         {reportData.description || 'রিপোর্টের বিস্তারিত ব্যাখ্যা এখানে থাকবে।'}
                                      </p>
                                  </div>
                              </div>
                           </div>
                        ) : (
                           <div className="flex-1 flex flex-col p-6 space-y-6 z-10">
                              <div className={`grid ${reportData.image2 ? 'grid-cols-2 gap-3' : 'grid-cols-1'} h-48 relative z-10`}>
                                 <div className="bg-white rounded-xl overflow-hidden border shadow-md flex items-center justify-center relative">
                                    {reportData.image1 && <img crossOrigin="anonymous" src={reportData.image1} className="w-full h-full object-contain p-1" />}
                                 </div>
                                 {reportData.image2 && (
                                    <div className="bg-white rounded-xl overflow-hidden border shadow-md flex items-center justify-center relative">
                                       {reportData.image2 && <img crossOrigin="anonymous" src={reportData.image2} className="w-full h-full object-contain p-1" />}
                                    </div>
                                 )}
                              </div>
                              <div className="text-center space-y-3 flex-1 flex flex-col justify-center relative z-20">
                                 <h2 style={{ color: selectedSubCat.color }} className="text-[22px] font-black leading-[1.6] py-2">
                                    {reportData.title || 'শিরোনাম'}
                                 </h2>
                                 <p className="text-[13px] font-bold text-slate-700 leading-[1.6] italic opacity-80 line-clamp-3">
                                    {reportData.description || 'বিস্তারিত এখানে থাকবে।'}
                                 </p>
                              </div>
                           </div>
                        )}
                    </div>
                    
                    <div className="w-full h-16 bg-[#FFD700] flex flex-col items-center justify-center border-t border-black/5 relative z-40 flex-shrink-0">
                       <span className="text-[16px] font-black tracking-widest text-black uppercase">FACTDOT</span>
                       <span className="text-[10px] font-bold text-black/80 uppercase tracking-[0.2em] leading-normal">WWW.FACTDOT.COM</span>
                    </div>
                  </div>
               </div>

               <div className="w-full max-w-[400px] space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                       type="button"
                       onClick={downloadReport} 
                       disabled={isProcessing}
                       className="flex items-center justify-center gap-2 px-4 py-5 bg-slate-900 text-white rounded-[1.25rem] font-black text-lg shadow-xl hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                     >
                       {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                       ডাউনলোড
                     </button>
                     <button 
                       type="button"
                       onClick={shareReport} 
                       disabled={isProcessing}
                       className="flex items-center justify-center gap-2 px-4 py-5 bg-indigo-600 text-white rounded-[1.25rem] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                     >
                       {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
                       সেয়ার করুন
                     </button>
                  </div>
                  <p className="text-xs text-center text-slate-400 font-bold uppercase tracking-wider">ইমেজটি সরাসরি সোশ্যাল মিডিয়ায় পোস্ট করার জন্য প্রস্তুত</p>
               </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 bg-white border-t border-slate-100 mt-auto">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
           <div 
             className="flex items-center gap-2 opacity-30 group hover:opacity-100 transition-all cursor-pointer" 
             onClick={handleHomeClick}
           >
              <FactDotLogo size={24} className="text-indigo-600" />
              <span className="font-black text-sm uppercase tracking-widest text-slate-900">FactDot</span>
           </div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Authenticity Empowered • © 2026</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .perspective-1000 { perspective: 1000px; }
      ` }} />
    </div>
  );
};

export default App;
