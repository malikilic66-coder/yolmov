
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, List, History, Wallet, Settings, LogOut, 
  Bell, ChevronRight, MapPin, Clock, DollarSign, CheckCircle, 
  XCircle, Navigation, Phone, User, Shield, Filter, ArrowRight, Map,
  Camera, MessageSquare, AlertTriangle, Check, Coins, Lock, Unlock,
  Loader2, FileText, Download, Search, Calendar, ChevronDown, X,
  Receipt, Eye, EyeOff, ShieldAlert, TrendingUp, ArrowUpRight, 
  ArrowDownLeft, CreditCard, Banknote, Landmark, Copy, PieChart, Info,
  UserCog, FileCheck, Upload, Trash2, Save, Briefcase, Mail,
  Truck, Headphones, Plus, PenTool, Wrench, LifeBuoy, Route, MoreHorizontal,
  Grid, LayoutList, Zap, Send, Star, ThumbsUp, ThumbsDown, Building, ShieldCheck, CheckCircle2, HelpCircle
} from 'lucide-react';
import { JobRequest, Request } from '../types';
import { MOCK_PARTNER_REQUESTS, CITIES_WITH_DISTRICTS } from '../constants';
import { createOffer, getRequestsByCustomer } from '../services/mockApi';
import { motion, AnimatePresence } from 'framer-motion';
import PartnerOfferHistory from './PartnerOfferHistory';
import PartnerPayments from './PartnerPayments';
import PartnerDocuments from './PartnerDocuments';
import { compressImage, isImageFile, createPreviewUrl } from '../utils/imageCompression';

interface PartnerDashboardProps {
  onLogout: () => void;
}

// MOCK HISTORY DATA
const MOCK_HISTORY = [
  { id: 'JOB-4923', date: '22 Kas, 14:30', service: 'Çekici Hizmeti', route: 'Maslak > Levent', customer: 'Ahmet Yılmaz', price: 850, status: 'completed', earnings: 850 },
  { id: 'JOB-4922', date: '21 Kas, 09:15', service: 'Akü Takviyesi', route: 'Beşiktaş (Yerinde)', customer: 'Selin Kaya', price: 400, status: 'completed', earnings: 400 },
  { id: 'JOB-4921', date: '20 Kas, 23:45', Lastik: 'Lastik Değişimi', route: 'TEM Otoyolu', customer: 'Mehmet Demir', price: 600, status: 'cancelled', earnings: 0 },
  { id: 'JOB-4920', date: '19 Kas, 11:20', service: 'Çekici Hizmeti', route: 'Kadıköy > Ümraniye', customer: 'Caner Erkin', price: 1200, status: 'completed', earnings: 1200 },
  { id: 'JOB-4919', date: '18 Kas, 16:40', service: 'Yakıt Desteği', route: 'E-5 Merter', customer: 'Zeynep A.', price: 350, status: 'refunded', earnings: 0 },
  { id: 'JOB-4918', date: '15 Kas, 10:00', service: 'Çekici Hizmeti', route: 'Bostancı > Kartal', customer: 'Burak Y.', price: 900, status: 'completed', earnings: 900 },
];

// MOCK TRANSACTIONS FOR WALLET
const MOCK_TRANSACTIONS = [
  { id: 'TRX-101', type: 'income', title: 'Nakit Tahsilat (#JOB-4923)', date: '22 Kas 2023, 15:00', amount: 850, status: 'completed' },
  { id: 'TRX-102', type: 'expense', title: 'İş Kabulü (Kredi Kullanımı)', date: '22 Kas 2023, 14:00', amount: 1, isCredit: true, status: 'completed' },
  { id: 'TRX-104', type: 'expense', title: 'Kredi Paketi Satın Alımı', date: '18 Kas 2023, 14:20', amount: 500, status: 'completed' },
  { id: 'TRX-105', type: 'income', title: 'Nakit Tahsilat (#JOB-4920)', date: '19 Kas 2023, 12:30', amount: 1200, status: 'completed' },
  { id: 'TRX-106', type: 'expense', title: 'İş Kabulü (Kredi Kullanımı)', date: '19 Kas 2023, 11:00', amount: 1, isCredit: true, status: 'completed' },
];

const CREDIT_PACKAGES = [
  { id: 1, credits: 10, price: 150, label: 'Başlangıç', recommended: false },
  { id: 2, credits: 50, price: 600, label: 'Profesyonel', recommended: true },
  { id: 3, credits: 100, price: 1000, label: 'Avantajlı', recommended: false },
];

// MOCK FLEET DATA
const MOCK_FLEET = [
  { id: 1, plate: '34 AB 1234', model: '2020 Ford F-Max', type: 'Kayar Kasa', driver: 'Mehmet Y.', status: 'active', image: 'https://images.unsplash.com/photo-1605218427360-6982bc998200?auto=format&fit=crop&q=80&w=300' },
  { id: 2, plate: '34 XY 9988', model: '2018 Isuzu NPR', type: 'Ahtapot Vinç', driver: 'Ali K.', status: 'maintenance', image: 'https://images.unsplash.com/photo-1586015604658-650561417675?auto=format&fit=crop&q=80&w=300' },
];

// MOCK SUPPORT TICKETS
const MOCK_TICKETS = [
  { id: 'TCK-882', subject: 'Ödeme Bildirimi', date: '20 Kas', status: 'open' },
  { id: 'TCK-771', subject: 'Müşteri Şikayeti', date: '15 Kas', status: 'resolved' },
];

// INITIAL MOCK ROUTES
const INITIAL_ROUTES = [
  { id: 1, origin: 'İstanbul', destinations: ['Kocaeli (Gebze)', 'Sakarya', 'Bursa'], date: '2023-11-24', time: '14:00', vehicle: '34 AB 1234', matches: 3 },
];

const POSITIVE_RATING_TAGS = [
  'Kibar Müşteri', 'Sorunsuz Ödeme', 'Bahşiş Bıraktı', 'Konum Doğruydu', 'Anlayışlı', 'İletişim Kolaydı'
];

const NEGATIVE_RATING_TAGS = [
  'İletişim Zor', 'Geç Geldi', 'Ödeme Sorunu', 'Konum Hatalı', 'Kaba Davranış', 'Bekletti'
];

// MOCK REVIEWS DATA - Müşteri değerlendirmeleri
const MOCK_REVIEWS = [
  {
    id: 'REV-001',
    jobId: 'JOB-4923',
    customerName: 'Ahmet Yılmaz',
    customerPhone: '0555 123 45 67',
    service: 'Çekici Hizmeti',
    date: '22 Kas 2023, 15:30',
    rating: 5,
    comment: 'Çok hızlı geldi, işini profesyonelce yaptı. Teşekkürler!',
    tags: ['Kibar Müşteri', 'Sorunsuz Ödeme', 'Bahşiş Bıraktı']
  },
  {
    id: 'REV-002',
    jobId: 'JOB-4920',
    customerName: 'Mehmet K.',
    customerPhone: '0532 987 65 43',
    service: 'Akü Takviyesi',
    date: '19 Kas 2023, 10:15',
    rating: 2,
    comment: 'Geç geldi, müşteri hizmetleri vasat.',
    tags: ['Geç Geldi', 'İletişim Zor']
  },
  {
    id: 'REV-003',
    jobId: 'JOB-4918',
    customerName: 'Selin Kaya',
    customerPhone: '0532 456 78 90',
    service: 'Çekici Hizmeti',
    date: '15 Kas 2023, 14:00',
    rating: 4,
    comment: 'Gayet iyiydi, fiyat biraz yüksek geldi ama memnunum.',
    tags: ['Anlayışlı', 'İletişim Kolaydı']
  },
  {
    id: 'REV-004',
    jobId: 'JOB-4915',
    customerName: 'Burak Y.',
    customerPhone: '0545 321 98 76',
    service: 'Çekici Hizmeti',
    date: '12 Kas 2023, 09:30',
    rating: 1,
    comment: 'Çok kötü bir deneyimdi, asla tavsiye etmem.',
    tags: ['Kaba Davranış', 'Ödeme Sorunu']
  },
  {
    id: 'REV-005',
    jobId: 'JOB-4912',
    customerName: 'Zeynep Aydın',
    customerPhone: '0544 789 01 23',
    service: 'Lastik Değişimi',
    date: '10 Kas 2023, 16:45',
    rating: 5,
    comment: 'Hayat kurtardınız! Çok teşekkürler, kesinlikle tavsiye ederim.',
    tags: ['Konum Doğruydu', 'Sorunsuz Ödeme']
  },
  {
    id: 'REV-006',
    jobId: 'JOB-4910',
    customerName: 'Caner Erkin',
    customerPhone: '0533 654 32 10',
    service: 'Yakıt Desteği',
    date: '08 Kas 2023, 11:20',
    rating: 5,
    comment: 'Çok hızlı ve profesyonel hizmet. Teşekkürler!',
    tags: ['Kibar Müşteri', 'Konum Doğruydu']
  },
  {
    id: 'REV-007',
    jobId: 'JOB-4908',
    customerName: 'Elif Demir',
    customerPhone: '0542 111 22 33',
    service: 'Çekici Hizmeti',
    date: '05 Kas 2023, 08:45',
    rating: 3,
    comment: 'İdare eder, fiyat biraz yüksek.',
    tags: ['Ödeme Sorunu']
  },
  {
    id: 'REV-008',
    jobId: 'JOB-4905',
    customerName: 'Deniz Yıldız',
    customerPhone: '0535 999 88 77',
    service: 'Lastik Değişimi',
    date: '02 Kas 2023, 17:30',
    rating: 4,
    comment: 'Güzel hizmet, memnun kaldım.',
    tags: ['Sorunsuz Ödeme', 'İletişim Kolaydı']
  }
];

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ onLogout }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [requests, setRequests] = useState<JobRequest[]>(MOCK_PARTNER_REQUESTS);
  const [activeJob, setActiveJob] = useState<JobRequest | null>(null);
  
  // Credit & Unlock System State
  const [credits, setCredits] = useState(25);
  const [unlockedJobs, setUnlockedJobs] = useState<string[]>([]);

  // Navigation & Location State
  const [testLocation, setTestLocation] = useState({ lat: 41.0082, lng: 28.9784, name: 'Taksim Meydanı, İstanbul' }); // Test konumu
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);

  // Quote / Offer State
  const [selectedJobForQuote, setSelectedJobForQuote] = useState<JobRequest | null>(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  
  const [offeringJobId, setOfferingJobId] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);

   // Customer Requests (B2C) offer flow demo
   const DEMO_CUSTOMER_ID = 'demo-customer';
   const [customerRequests, setCustomerRequests] = useState<Request[]>([]);
   const [selectedRequestForOffer, setSelectedRequestForOffer] = useState<Request | null>(null);
   const [offerPrice, setOfferPrice] = useState('');
   const [offerEta, setOfferEta] = useState('');
   const [offerMessage, setOfferMessage] = useState('');

  // Active Job Workflow State
  const [jobStage, setJobStage] = useState<0 | 1 | 2 | 3 | 4>(0); 
  const [hasStartProof, setHasStartProof] = useState(false);
  const [hasEndProof, setHasEndProof] = useState(false);
  const [startProofImage, setStartProofImage] = useState<File | null>(null);
  const [endProofImage, setEndProofImage] = useState<File | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  // Rating State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Review Objection State
  const [showObjectionModal, setShowObjectionModal] = useState(false);
  const [showObjectionPage, setShowObjectionPage] = useState(false); // Tam sayfa modu için
  const [selectedReviewForObjection, setSelectedReviewForObjection] = useState<typeof MOCK_REVIEWS[0] | null>(null);
  const [objectionReason, setObjectionReason] = useState('');
  const [objectionDetails, setObjectionDetails] = useState('');

  // Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'nearest' | 'highest_price' | 'urgent'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // History State
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('month');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<typeof MOCK_HISTORY[0] | null>(null);

  // Wallet State
  const [walletFilter, setWalletFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);

  // Settings State
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'services' | 'documents' | 'security'>('profile');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [isCompressingLogo, setIsCompressingLogo] = useState(false);
  const [isCompressingProfile, setIsCompressingProfile] = useState(false);

  // Document Upload Modal State
  const [showDocumentUploadModal, setShowDocumentUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  // Document Detail Modal State
  const [showDocumentDetailModal, setShowDocumentDetailModal] = useState(false);
  const [selectedDocumentDetail, setSelectedDocumentDetail] = useState<{
    title: string;
    type: string;
    status: 'uploaded' | 'pending' | 'not_uploaded';
    uploadDate?: string;
    expiryDate?: string;
    fileSize?: string;
    fileName?: string;
    count?: number;
  } | null>(null);

  // Support State - Yeni Talep Oluşturma
  const [showNewTicketPage, setShowNewTicketPage] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Fleet State - Yeni Araç Ekleme
  const [showNewVehiclePage, setShowNewVehiclePage] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Document Upload Handler
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedDocType) {
      setDocumentUploadError('Lütfen önce belge türünü seçin.');
      return;
    }
    if (!e.target.files || !e.target.files.length) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setDocumentUploadError('Dosya boyutu 5MB\'den büyük olamaz.');
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
      return;
    }
    
    setUploadingDocument(true);
    setDocumentUploadError(null);
    
    try {
      let finalFile = file;
      
      // Eğer görsel dosyası ise sıkıştır
      if (isImageFile(file)) {
        const result = await compressImage(file);
        finalFile = result.compressedFile;
        console.log(`📄 Belge sıkıştırıldı: ${result.compressionRatio.toFixed(1)}% küçültüldü`);
      }
      
      // Simüle upload
      setTimeout(() => {
        alert(`✅ ${selectedDocType} başarıyla yüklendi!\n\nDosya: ${finalFile.name}\nBoyut: ${(finalFile.size / 1024 / 1024).toFixed(2)} MB\n\nBelgeniz admin onayına gönderildi.`);
        setUploadingDocument(false);
        setShowDocumentUploadModal(false);
        setSelectedDocType('');
        if (documentInputRef.current) {
          documentInputRef.current.value = '';
        }
      }, 1500);
    } catch (error) {
      console.error('Belge yükleme hatası:', error);
      setDocumentUploadError('Belge yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      setUploadingDocument(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleDriver, setVehicleDriver] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [isCompressingVehicle, setIsCompressingVehicle] = useState(false);

  // Route / Empty Leg State
  const [activeRoutes, setActiveRoutes] = useState(INITIAL_ROUTES);
  
  // Route Autocomplete States
  const [routeOrigin, setRouteOrigin] = useState('');
  const [originSearch, setOriginSearch] = useState('');
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  
  const [routeDestinations, setRouteDestinations] = useState<string[]>([]);
  const [destSearch, setDestSearch] = useState('');
  const [isDestOpen, setIsDestOpen] = useState(false);
  
  const [routeDate, setRouteDate] = useState('');
  const [routeTime, setRouteTime] = useState('');
  
  const [routeVehicle, setRouteVehicle] = useState('');
  const [isVehicleOpen, setIsVehicleOpen] = useState(false);
  
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);

  // Empty Trucks State
  const [emptyTruckType, setEmptyTruckType] = useState<'intercity' | 'intracity'>('intercity');
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [selectedTruckForMatches, setSelectedTruckForMatches] = useState<any | null>(null);
  const [emptyTruckOrigin, setEmptyTruckOrigin] = useState('');
  const [emptyTruckDestination, setEmptyTruckDestination] = useState('');
  const [emptyTruckDate, setEmptyTruckDate] = useState('');
  const [emptyTruckTime, setEmptyTruckTime] = useState('');
  const [emptyTruckVehicle, setEmptyTruckVehicle] = useState('');
  const [emptyTrucks, setEmptyTrucks] = useState(INITIAL_ROUTES);

  // New Jobs State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobRequest | null>(null);
  const [newJobsFilter, setNewJobsFilter] = useState<'all' | 'nearest' | 'urgent'>('all');

  const cityList = Object.keys(CITIES_WITH_DISTRICTS);

  // Refs for click-outside detection in Custom Dropdowns
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setIsOriginOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setIsDestOpen(false);
      }
      if (vehicleRef.current && !vehicleRef.current.contains(event.target as Node)) {
        setIsVehicleOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   // Load demo customer open requests
   useEffect(() => {
      const reqs = getRequestsByCustomer(DEMO_CUSTOMER_ID).filter(r => r.status === 'open');
      setCustomerRequests(reqs);
   }, []);

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    if (filterMode === 'urgent') return req.urgency === 'high';
    return true;
  }).sort((a, b) => {
    if (filterMode === 'highest_price') return b.price - a.price;
    if (filterMode === 'nearest') return parseFloat(a.distance) - parseFloat(b.distance);
    return 0;
  });

  const filteredHistory = MOCK_HISTORY.filter(item => 
    (item.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.customer.toLowerCase().includes(historySearch.toLowerCase())) &&
    item.status === 'completed'
  );

  // Step 1: Open Modal
  const handleOpenQuoteModal = (job: JobRequest) => {
    if (credits <= 0) {
      alert("Yetersiz bakiye! Teklif vermek için kredi yükleyiniz.");
      return;
    }
    setSelectedJobForQuote(job);
    setQuotePrice('');
    setQuoteNote('');
  };

   const handleOpenCustomerOfferModal = (req: Request) => {
      if (credits <= 0) {
         alert('Yetersiz bakiye! Teklif vermek için kredi yükleyiniz.');
         return;
      }
      setSelectedRequestForOffer(req);
      setOfferPrice('');
      setOfferEta('');
      setOfferMessage('');
   };

  // Step 2: Submit Quote -> Start Simulation
  const handleSubmitQuote = () => {
     if (!selectedJobForQuote || !quotePrice) return;

     const jobId = selectedJobForQuote.id;
     
     // Close modal
     setSelectedJobForQuote(null);

     // Start loading state on card
     setOfferingJobId(jobId);
     setOfferError(null);

     // Simulation: Customer Reviewing Offer
    setTimeout(() => {
      const isOfferAccepted = Math.random() > 0.3; // 70% chance of acceptance
      if (isOfferAccepted) {
        setCredits(prev => prev - 1);
        setUnlockedJobs(prev => [...prev, jobId]);
        setOfferingJobId(null);
      } else {
        setOfferError(jobId);
        setOfferingJobId(null);
        setTimeout(() => {
           // Remove job from list after rejection (simulating customer chose someone else)
           setRequests(prev => prev.filter(r => r.id !== jobId));
           setOfferError(null);
        }, 3000);
      }
    }, 2500);
  };

   const handleSubmitCustomerOffer = () => {
      if (!selectedRequestForOffer || !offerPrice) return;
      // Persist offer to localStorage so B2C panel can see it
      createOffer('PARTNER-DEMO', selectedRequestForOffer.id, {
         price: parseFloat(offerPrice),
         etaMinutes: offerEta ? parseInt(offerEta) : 30,
         message: offerMessage
      });
      alert('Teklif gönderildi. Müşteri yanıtını bekleyebilirsiniz.');
      setSelectedRequestForOffer(null);
      setOfferPrice('');
      setOfferEta('');
      setOfferMessage('');
   };

  const handleStartOperation = (job: JobRequest) => {
    setActiveJob(job);
    setRequests(prev => prev.filter(r => r.id !== job.id));
    setJobStage(0);
    setHasStartProof(false);
    setHasEndProof(false);
    setActiveTab('active');
    // Test konumu ayarla
    setTestLocation({ lat: 41.0082, lng: 28.9784, name: 'Taksim Meydanı, İstanbul' });
    setNavigationStarted(false);
  };

  const advanceJobStage = () => {
    // Stage 0: Navigasyon başlatma kontrolü
    if (jobStage === 0 && !navigationStarted) {
      handleStartNavigation();
      return;
    }
    if (jobStage === 2 && !hasStartProof) {
       alert("Lütfen hizmete başlamadan önce kanıt fotoğrafı yükleyin.");
       return;
    }
    if (jobStage === 3 && !hasEndProof) {
       alert("Lütfen görevi tamamlamadan önce bitiş fotoğrafı yükleyin.");
       return;
    }
    if (jobStage === 3) {
       // Stage 3 is "Görevi Tamamla". After this, show rating modal instead of resetting immediately
       setShowRatingModal(true);
       return;
    }
    if (jobStage < 4) {
      setJobStage((prev) => (prev + 1) as any);
    }
  };

  const handleFinishJob = () => {
    setShowRatingModal(false);
    setActiveJob(null);
    setActiveTab('requests');
    setJobStage(0);
    setRatingScore(0);
    setSelectedTags([]);
  };

  const handleOpenObjection = (review: typeof MOCK_REVIEWS[0]) => {
    setSelectedReviewForObjection(review);
    setShowObjectionPage(true); // Modal yerine tam sayfa
    setObjectionReason('');
    setObjectionDetails('');
  };

  const handleSubmitObjection = () => {
    if (!objectionReason || !objectionDetails.trim()) {
      alert('Lütfen itiraz nedenini seçin ve detayları yazın.');
      return;
    }
    
    // Burada backend'e gönderilecek
    console.log('İtiraz Gönderildi:', {
      reviewId: selectedReviewForObjection?.id,
      jobId: selectedReviewForObjection?.jobId,
      reason: objectionReason,
      details: objectionDetails
    });
    
    alert('✅ İtirazınız başarıyla gönderildi. En kısa sürede incelenecektir.');
    setShowObjectionPage(false);
    setSelectedReviewForObjection(null);
    setObjectionReason('');
    setObjectionDetails('');
  };

  // Fotoğraf yükleme ve sıkıştırma fonksiyonları
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'start' | 'end'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert('Lütfen sadece görsel dosyası yükleyin (JPG, PNG, vb.)');
      return;
    }

    setIsCompressingImage(true);

    try {
      const result = await compressImage(file);
      
      if (type === 'start') {
        setStartProofImage(result.compressedFile);
        setHasStartProof(true);
      } else {
        setEndProofImage(result.compressedFile);
        setHasEndProof(true);
      }

      alert(`✅ Fotoğraf yüklendi ve %${result.compressionRatio.toFixed(1)} oranında küçültüldü.`);
    } catch (error) {
      alert('❌ Fotoğraf yüklenirken hata oluştu. Lütfen tekrar deneyin.');
      console.error(error);
    } finally {
      setIsCompressingImage(false);
    }
  };

  // Company logo upload handler
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert('Lütfen sadece görsel dosyası yükleyin (JPG, PNG, vb.)');
      return;
    }

    try {
      setIsCompressingLogo(true);
      const result = await compressImage(file);
      setCompanyLogo(result.compressedFile);

      alert(`✅ Logo yüklendi ve %${result.compressionRatio.toFixed(1)} oranında küçültüldü.`);
    } catch (error) {
      console.error('Logo compression error:', error);
      alert('❌ Logo işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCompressingLogo(false);
    }
  };

  // Profile photo upload handler
  const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert('Lütfen sadece görsel dosyası yükleyin (JPG, PNG, vb.)');
      return;
    }

    try {
      setIsCompressingProfile(true);
      const result = await compressImage(file);
      setProfilePhoto(result.compressedFile);

      alert(`✅ Profil fotoğrafı yüklendi ve %${result.compressionRatio.toFixed(1)} oranında küçültüldü.`);
    } catch (error) {
      console.error('Profile photo compression error:', error);
      alert('❌ Profil fotoğrafı işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCompressingProfile(false);
    }
  };

  // Vehicle photo upload handler
  const handleVehiclePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isImageFile(file)) {
      alert('Lütfen sadece görsel dosyası yükleyin (JPG, PNG, vb.)');
      return;
    }

    try {
      setIsCompressingVehicle(true);
      const result = await compressImage(file);
      setVehiclePhoto(result.compressedFile);

      alert(`✅ Araç fotoğrafı yüklendi ve %${result.compressionRatio.toFixed(1)} oranında küçültüldü.`);
    } catch (error) {
      console.error('Vehicle photo compression error:', error);
      alert('❌ Araç fotoğrafı işlenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsCompressingVehicle(false);
    }
  };

  const handleStartNavigation = () => {
    // Cihaz konumunu al (simulasyon)
    const deviceLoc = { 
      lat: 41.0082 + (Math.random() - 0.5) * 0.05, 
      lng: 28.9784 + (Math.random() - 0.5) * 0.05, 
      name: 'Mevcut Konumunuz' 
    };
    setDeviceLocation(deviceLoc);
    setNavigationStarted(true);
    setShowNavigationModal(true);
  };

  const handleOpenInGoogleMaps = () => {
    const destination = `${testLocation.lat},${testLocation.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const getStageLabel = () => {
    switch(jobStage) {
      case 0: return navigationStarted ? "Konuma Vardım" : "Navigasyonu Başlat";
      case 1: return "Konuma Vardım";
      case 2: return "Hizmeti Başlat";
      case 3: return "Görevi Tamamla";
      default: return "";
    }
  };

  const addDestination = (dest: string) => {
    if (dest && !routeDestinations.includes(dest)) {
      setRouteDestinations([...routeDestinations, dest]);
      setDestSearch('');
      setIsDestOpen(false);
    }
  };

  const removeDestination = (dest: string) => {
    setRouteDestinations(routeDestinations.filter(d => d !== dest));
  };

  const handleEditRoute = (route: any) => {
    setEditingRouteId(route.id);
    setRouteOrigin(route.origin);
    setOriginSearch(route.origin);
    setRouteDestinations(route.destinations);
    setRouteDate(route.date);
    setRouteTime(route.time);
    setRouteVehicle(route.vehicle);
  };

  const cancelEdit = () => {
    setEditingRouteId(null);
    setRouteOrigin('');
    setOriginSearch('');
    setRouteDestinations([]);
    setRouteDate('');
    setRouteTime('');
    setRouteVehicle('');
    setDestSearch('');
  };

  const handleAddRoute = () => {
     if (!routeOrigin || routeDestinations.length === 0 || !routeDate || !routeTime || !routeVehicle) {
        alert("Lütfen güzergah, tarih, saat ve araç bilgilerini eksiksiz doldurun.");
        return;
     }

     if (editingRouteId) {
        setActiveRoutes(prev => prev.map(r => r.id === editingRouteId ? {
            ...r,
            origin: routeOrigin,
            destinations: routeDestinations,
            date: routeDate,
            time: routeTime,
            vehicle: routeVehicle
        } : r));
        setEditingRouteId(null);
        alert("Rota başarıyla güncellendi.");
     } else {
        const newRoute = {
            id: Date.now(),
            origin: routeOrigin,
            destinations: routeDestinations,
            date: routeDate,
            time: routeTime,
            vehicle: routeVehicle,
            matches: Math.floor(Math.random() * 5) // Mock matching jobs
        };
        setActiveRoutes([newRoute, ...activeRoutes]);
        alert("Yeni rota oluşturuldu.");
     }
     
     // Reset
     cancelEdit();
  };

  const handleRemoveRoute = (id: number) => {
     setActiveRoutes(activeRoutes.filter(r => r.id !== id));
  };

  // --- RENDERERS ---

  const renderRatingModal = () => {
    const activeTags = ratingScore >= 4 ? POSITIVE_RATING_TAGS : NEGATIVE_RATING_TAGS;
    
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} 
         animate={{ opacity: 1, scale: 1 }} 
         className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-3 shadow-inner">
              {activeJob?.customerName.charAt(0)}
           </div>
           <h2 className="text-xl font-bold text-slate-800">Görevi Tamamladın!</h2>
           <p className="text-slate-500 text-sm">Müşteriyi değerlendirerek sistemi iyileştirmemize yardım et.</p>
        </div>
        
        <div className="p-6 flex flex-col items-center">
           <div className="flex gap-2 mb-6">
              {[1,2,3,4,5].map(score => (
                 <button 
                   key={score} 
                   onClick={() => {
                      setRatingScore(score);
                      setSelectedTags([]); // Reset tags when score changes
                   }}
                   className="transition-transform hover:scale-110 focus:outline-none"
                 >
                    <Star 
                      size={36} 
                      className={`${score <= ratingScore ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'}`} 
                      strokeWidth={1.5}
                    />
                 </button>
              ))}
           </div>
           
           {ratingScore > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                 {activeTags.map(tag => (
                    <button
                       key={tag}
                       onClick={() => {
                          if(selectedTags.includes(tag)) setSelectedTags(selectedTags.filter(t => t !== tag));
                          else setSelectedTags([...selectedTags, tag]);
                       }}
                       className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTags.includes(tag) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}
                    >
                       {tag}
                    </button>
                 ))}
              </div>
           )}

           <textarea 
              placeholder="Müşteri veya süreç hakkında eklemek istediklerin..."
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-6 resize-none h-24"
           ></textarea>

           <button 
              onClick={handleFinishJob}
              disabled={ratingScore === 0}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
           >
              <Check size={18} /> Değerlendir ve Bitir
           </button>
        </div>
      </motion.div>
    </div>
  );
  };

  const renderNavigationModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Route size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Navigasyon Başlatıldı</h2>
                  <p className="text-sm text-blue-100">Müşteri konumuna gidiyorsunuz</p>
                </div>
              </div>
              <button
                onClick={() => setShowNavigationModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Location Info */}
            <div className="space-y-3">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Navigation size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-600 uppercase">Başlangıç Noktanız</p>
                    <p className="font-bold text-slate-900">{deviceLocation?.name || 'Konum alınıyor...'}</p>
                    {deviceLocation && (
                      <p className="text-xs text-slate-500 mt-1">
                        {deviceLocation.lat.toFixed(6)}, {deviceLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-300 to-blue-300"></div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-600 uppercase">Hedef Konum</p>
                    <p className="font-bold text-slate-900">{testLocation.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {testLocation.lat.toFixed(6)}, {testLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distance Info */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-1">Tahmini Mesafe</p>
                <p className="text-2xl font-black text-slate-900">{activeJob?.distance || '2.5 km'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Tahmini Süre</p>
                <p className="text-2xl font-black text-blue-600">8-12 dk</p>
              </div>
            </div>

            {/* Navigation Options */}
            <div className="space-y-3">
              <button
                onClick={handleOpenInGoogleMaps}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-lg"
              >
                <Navigation size={20} /> Google Haritalar'da Aç
              </button>
              
              <button
                onClick={() => {
                  setShowNavigationModal(false);
                  // Navigasyon başlatıldı olarak işaretle
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Yerleşik Haritayı Kullan
              </button>

              <button
                onClick={() => setShowNavigationModal(false)}
                className="w-full py-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  const renderDocumentUploadModal = () => {
    const DOCUMENT_TYPES = [
      { value: 'trade_registry', label: 'Ticaret Sicil Belgesi' },
      { value: 'signature', label: 'İmza Sirküleri' },
      { value: 'vehicle_registration', label: 'Araç Ruhsatı' },
      { value: 'insurance', label: 'Sorumluluk Sigortası' },
      { value: 'tax_plate', label: 'Vergi Levhası' },
      { value: 'other', label: 'Diğer' },
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Belge Yükle</h2>
                  <p className="text-sm text-blue-100">Evraklarınızı yükleyin</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDocumentUploadModal(false);
                  setSelectedDocType('');
                  setDocumentUploadError(null);
                  if (documentInputRef.current) {
                    documentInputRef.current.value = '';
                  }
                }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Belge Türü <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => {
                  setSelectedDocType(e.target.value);
                  setDocumentUploadError(null);
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="">Belge türünü seçin</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type.value} value={type.label}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Dosya Seçin
              </label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                selectedDocType 
                  ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer' 
                  : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              }`}>
                {uploadingDocument ? (
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 size={40} className="text-blue-600 animate-spin" />
                    <p className="text-sm font-bold text-blue-700">Yükleniyor...</p>
                    <p className="text-xs text-slate-500">Lütfen bekleyin</p>
                  </div>
                ) : (
                  <label className={selectedDocType ? 'cursor-pointer' : 'cursor-not-allowed'}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <FileText size={32} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-1">
                          Dosya seçmek için tıklayın
                        </p>
                        <p className="text-xs text-slate-500">
                          PDF, JPG, PNG • Maksimum 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentUpload}
                      disabled={!selectedDocType || uploadingDocument}
                      className="hidden"
                      ref={documentInputRef}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Error Message */}
            {documentUploadError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 mb-1">Hata</p>
                  <p className="text-xs text-red-600">{documentUploadError}</p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-800 mb-1">Önemli Notlar</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Belgeleriniz 24 saat içinde incelenecektir</li>
                    <li>• Fotoğraflar net ve okunaklı olmalıdır</li>
                    <li>• Geçerlilik tarihi güncel olmalıdır</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDocumentUploadModal(false);
                  setSelectedDocType('');
                  setDocumentUploadError(null);
                  if (documentInputRef.current) {
                    documentInputRef.current.value = '';
                  }
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  const renderDocumentDetailModal = () => {
    if (!selectedDocumentDetail) return null;

    const getStatusBadge = () => {
      switch (selectedDocumentDetail.status) {
        case 'uploaded':
          return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border-2 border-green-200 rounded-xl">
              <CheckCircle2 size={18} className="text-green-600" />
              <span className="text-sm font-bold text-green-700">Yüklendi ve Onaylandı</span>
            </div>
          );
        case 'pending':
          return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
              <Clock size={18} className="text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">İnceleme Bekliyor</span>
            </div>
          );
        case 'not_uploaded':
          return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border-2 border-red-200 rounded-xl">
              <AlertTriangle size={18} className="text-red-600" />
              <span className="text-sm font-bold text-red-700">Henüz Yüklenmedi</span>
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileCheck size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedDocumentDetail.title}</h2>
                  <p className="text-sm text-white/80">Belge Detayları</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDocumentDetailModal(false);
                  setSelectedDocumentDetail(null);
                }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              {getStatusBadge()}
            </div>

            {/* Document Info */}
            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold mb-1">Belge Türü</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDocumentDetail.title}</p>
                </div>
                {selectedDocumentDetail.uploadDate && (
                  <div>
                    <p className="text-xs text-slate-500 font-bold mb-1">Yüklenme Tarihi</p>
                    <p className="text-sm font-bold text-slate-900">{selectedDocumentDetail.uploadDate}</p>
                  </div>
                )}
              </div>

              {selectedDocumentDetail.expiryDate && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-bold mb-1">Son Geçerlilik Tarihi</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDocumentDetail.expiryDate}</p>
                </div>
              )}

              {selectedDocumentDetail.fileName && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-bold mb-1">Dosya Adı</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText size={16} className="text-slate-400" />
                    {selectedDocumentDetail.fileName}
                  </p>
                </div>
              )}

              {selectedDocumentDetail.fileSize && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-bold mb-1">Dosya Boyutu</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDocumentDetail.fileSize}</p>
                </div>
              )}

              {selectedDocumentDetail.count && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-bold mb-1">Yüklenen Belge Sayısı</p>
                  <p className="text-sm font-bold text-slate-900">{selectedDocumentDetail.count} Adet</p>
                </div>
              )}
            </div>

            {/* Info Messages */}
            {selectedDocumentDetail.status === 'uploaded' && selectedDocumentDetail.expiryDate && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800 mb-1">Belge Aktif</p>
                    <p className="text-xs text-green-700">
                      Bu belge {selectedDocumentDetail.expiryDate} tarihine kadar geçerlidir. Süre dolmadan yenilemeyi unutmayın.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDocumentDetail.status === 'not_uploaded' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800 mb-1">Belge Eksik</p>
                    <p className="text-xs text-red-700">
                      Bu belgenin yüklenmesi zorunludur. Lütfen en kısa sürede yükleyiniz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDocumentDetail.status === 'pending' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">İnceleme Aşamasında</p>
                    <p className="text-xs text-yellow-700">
                      Belgeniz admin ekibi tarafından inceleniyor. 24 saat içinde sonuç bildirilecektir.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {selectedDocumentDetail.status === 'uploaded' && (
                <>
                  <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Eye size={18} /> Görüntüle
                  </button>
                  <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Download size={18} /> İndir
                  </button>
                  <button 
                    onClick={() => {
                      setShowDocumentDetailModal(false);
                      setSelectedDocumentDetail(null);
                      setShowDocumentUploadModal(true);
                      setSelectedDocType(selectedDocumentDetail.title);
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Upload size={18} /> Yenile
                  </button>
                </>
              )}
              
              {selectedDocumentDetail.status === 'not_uploaded' && (
                <button 
                  onClick={() => {
                    setShowDocumentDetailModal(false);
                    setSelectedDocumentDetail(null);
                    setShowDocumentUploadModal(true);
                    setSelectedDocType(selectedDocumentDetail.title);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={18} /> Hemen Yükle
                </button>
              )}

              {selectedDocumentDetail.status === 'pending' && (
                <button 
                  onClick={() => {
                    setShowDocumentDetailModal(false);
                    setSelectedDocumentDetail(null);
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Tamam
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  const renderJobDetailModal = () => {
    if (!selectedJobForDetail) return null;
    const job = selectedJobForDetail;
    const isUnlocked = unlockedJobs.includes(job.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">{job.serviceType}</h2>
              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-white/80">İş Detayları - #{job.id}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Location Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <MapPin size={20} className="text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Alınacak Konum</p>
                  <p className="font-bold text-slate-800 text-lg">{job.location}</p>
                  <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                    <Navigation size={14} /> {job.distance} uzaklıkta
                  </p>
                </div>
              </div>

              {job.dropoffLocation && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                  <Navigation size={20} className="text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Teslim Noktası</p>
                    <p className="font-bold text-slate-800 text-lg">{job.dropoffLocation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Hizmet Türü</p>
                <p className="font-bold text-slate-800">{job.serviceType}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Araç Bilgisi</p>
                <p className="font-bold text-slate-800">{job.vehicleInfo}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Zaman</p>
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={16} /> {job.timestamp}
                </p>
              </div>
              {job.estimatedPrice && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase mb-2">Tahmini Ücret</p>
                  <p className="font-black text-green-700 text-2xl">₺{job.estimatedPrice}</p>
                </div>
              )}
            </div>

            {/* Urgency Badge */}
            {job.urgency === 'high' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle size={24} className="text-red-600" />
                <div>
                  <p className="font-bold text-red-800">ACİL TALEP</p>
                  <p className="text-sm text-red-600">Bu iş için hızlı yanıt bekleniyor</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs font-bold text-yellow-800 uppercase mb-2">Notlar</p>
                <p className="text-sm text-slate-700">{job.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {isUnlocked ? (
                <button
                  onClick={() => {
                    setSelectedJobForDetail(null);
                    setSelectedJobForQuote(job);
                    setQuotePrice(job.estimatedPrice?.toString() || '');
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Teklif Ver
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedJobForQuote(job);
                    setQuotePrice(job.estimatedPrice?.toString() || '');
                    setSelectedJobForDetail(null);
                  }}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Teklif Gönder
                </button>
              )}
              <button
                onClick={() => setSelectedJobForDetail(null)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  const renderQuoteModal = () => {
    if (!selectedJobForQuote) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6"
         >
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h2 className="text-xl font-bold text-slate-800">Teklif Ver</h2>
                  <p className="text-xs text-slate-500">#{selectedJobForQuote.id} - {selectedJobForQuote.serviceType}</p>
               </div>
               <button onClick={() => setSelectedJobForQuote(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shrink-0 shadow-sm"><MapPin size={20} /></div>
                  <div>
                     <p className="text-xs font-bold text-blue-400 uppercase">Mesafe</p>
                     <p className="text-sm font-bold text-slate-800">{selectedJobForQuote.distance} uzaklıkta</p>
                  </div>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Bu iş için müşteriye sunacağınız KDV dahil toplam tutarı giriniz.
               </p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Teklif Tutarı (₺)</label>
                  <div className="relative">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                        type="number" 
                        autoFocus
                        placeholder="0.00" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-xl font-bold text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                        value={quotePrice}
                        onChange={(e) => setQuotePrice(e.target.value)}
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Not (Opsiyonel)</label>
                  <textarea 
                     placeholder="Örn: 15 dk içinde araç başında olurum." 
                     className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-0 outline-none resize-none h-24"
                     value={quoteNote}
                     onChange={(e) => setQuoteNote(e.target.value)}
                  ></textarea>
               </div>
            </div>

            <div className="mt-8 flex gap-3">
               <button onClick={() => setSelectedJobForQuote(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">İptal</button>
               <button 
                  onClick={handleSubmitQuote}
                  disabled={!quotePrice}
                  className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                  Teklifi Gönder
               </button>
            </div>
         </motion.div>
      </div>
    );
  };

   const renderCustomerOfferModal = () => {
      if (!selectedRequestForOffer) return null;
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6"
            >
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-xl font-bold text-slate-800">Müşteri Talebine Teklif Ver</h2>
                     <p className="text-xs text-slate-500">#{selectedRequestForOffer.id} - {selectedRequestForOffer.serviceType}</p>
                  </div>
                  <button onClick={() => setSelectedRequestForOffer(null)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600"><X size={20} /></button>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Teklif Tutarı (₺)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                           type="number"
                           autoFocus
                           placeholder="0.00"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-xl font-bold text-slate-900 focus:border-blue-500 focus:ring-0 outline-none transition-colors"
                           value={offerPrice}
                           onChange={(e) => setOfferPrice(e.target.value)}
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ETA (dk)</label>
                        <input
                           type="number"
                           placeholder="30"
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                           value={offerEta}
                           onChange={(e) => setOfferEta(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Hizmet Türü</label>
                        <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700">{selectedRequestForOffer.serviceType}</div>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Mesaj (Opsiyonel)</label>
                     <textarea
                        placeholder="Örn: 20 dk içinde araç başında olurum."
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-0 outline-none resize-none h-24"
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                     ></textarea>
                  </div>
               </div>

               <div className="mt-8 flex gap-3">
                  <button onClick={() => setSelectedRequestForOffer(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">İptal</button>
                  <button
                     onClick={handleSubmitCustomerOffer}
                     disabled={!offerPrice}
                     className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     Teklifi Gönder
                  </button>
               </div>
            </motion.div>
         </div>
      );
   };

  const renderAddCreditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6">
         <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800">Kredi Yükle</h3><button onClick={() => setShowAddCreditModal(false)}><X size={24} className="text-slate-400" /></button></div>
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-sm text-blue-800 flex gap-3"><Info size={20} className="shrink-0" /><p>1 Kredi = 1 İş Kabulü. Kredileriniz hesabınıza anında tanımlanır ve süresizdir.</p></div>
         <div className="space-y-3 mb-6">
            {CREDIT_PACKAGES.map(pkg => (
               <div key={pkg.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${pkg.recommended ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                  <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${pkg.recommended ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}><Coins size={20} /></div><div><p className="font-bold text-slate-900">{pkg.label}</p><p className="text-xs text-slate-500">{pkg.credits} Kredi</p></div></div>
                  <div className="text-right"><p className="font-bold text-lg text-slate-900">₺{pkg.price}</p>{pkg.recommended && <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full">Önerilen</span>}</div>
               </div>
            ))}
         </div>
         <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2"><CreditCard size={18} /> Ödeme Yap ve Yükle</button>
      </motion.div>
    </div>
  );

  const renderHistoryTab = () => {
    // Eğer detay seçiliyse, detay view göster
    if (selectedHistoryItem) {
      const item = selectedHistoryItem;
      return (
        <div className="p-4 md:p-6 space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setSelectedHistoryItem(null)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4"
          >
            <ChevronRight size={20} className="rotate-180" /> Geri Dön
          </button>

          {/* Detail View */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  İş Detayı <span className="text-blue-600">#{item.id}</span>
                </h2>
                <p className="text-sm text-slate-500">{item.date}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold ${item.status === 'completed' ? 'bg-green-50 text-green-700' : item.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'}`}>
                {item.status === 'completed' ? '✓ Tamamlandı' : item.status === 'cancelled' ? '✗ İptal' : '↩ İade'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Finansal Detaylar</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Hizmet Bedeli</span><span className="font-bold text-slate-900">₺{item.price}</span></div>
                  <div className="flex justify-between text-base pt-3 border-t border-slate-100"><span className="font-bold text-slate-800">Toplam Kazanç</span><span className="font-bold text-green-600 text-lg">₺{item.earnings}</span></div>
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800"><Info size={14} className="inline mr-1 mb-0.5" />Bu işlem için <strong>1 Kredi</strong> kullanılmıştır.</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Müşteri & Rota</h3>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">{item.customer.charAt(0)}</div>
                    <div><p className="font-bold text-slate-800">{item.customer}</p><p className="text-xs text-slate-500">Platin Üye</p></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-white/50 p-2 rounded-lg"><ShieldAlert size={16} className="text-orange-500" /><span>05** *** ** 12</span><span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded ml-auto">Gizli</span></div>
                </div>
                <div>
                  <div className="flex items-start gap-3 mb-3"><div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div><div><p className="text-xs text-slate-400 font-bold">BAŞLANGIÇ</p><p className="text-sm font-medium text-slate-800">{item.route.split('>')[0]}</p></div></div>
                  <div className="flex items-start gap-3"><div className="mt-1 w-2 h-2 rounded-full bg-slate-800"></div><div><p className="text-xs text-slate-400 font-bold">VARIŞ</p><p className="text-sm font-medium text-slate-800">{item.route.split('>')[1] || 'Yerinde Hizmet'}</p></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Liste view
    return (
    <div className="p-4 md:p-6 space-y-6">
       <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text" 
               placeholder="İş No, Müşteri Adı veya Plaka ara..." 
               className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={historySearch}
               onChange={(e) => setHistorySearch(e.target.value)}
             />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shrink-0">
             {['week', 'month', 'year'].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${historyFilter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                   {f === 'week' ? 'Bu Hafta' : f === 'month' ? 'Bu Ay' : 'Bu Yıl'}
                </button>
             ))}
          </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-400 font-bold">
                      <th className="p-4 pl-6">İş No / Tarih</th>
                      <th className="p-4">Hizmet & Rota</th>
                      <th className="p-4">Müşteri</th>
                      <th className="p-4">Tutar</th>
                      <th className="p-4">Durum</th>
                      <th className="p-4"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {filteredHistory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer group" onClick={() => setSelectedHistoryItem(item)}>
                         <td className="p-4 pl-6">
                            <p className="font-bold text-slate-800 text-sm">#{item.id}</p>
                            <p className="text-xs text-slate-400">{item.date}</p>
                         </td>
                         <td className="p-4">
                            <p className="font-bold text-slate-800 text-sm">{item.service}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={10} /> {item.route}</p>
                         </td>
                         <td className="p-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{item.customer.charAt(0)}</div>
                               <span className="text-sm text-slate-600">{item.customer}</span>
                            </div>
                         </td>
                         <td className="p-4">
                            <span className="font-bold text-slate-800">₺{item.price}</span>
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${item.status === 'completed' ? 'bg-green-50 text-green-700' : item.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                               {item.status === 'completed' ? 'Tamamlandı' : item.status === 'cancelled' ? 'İptal' : 'İade'}
                            </span>
                         </td>
                         <td className="p-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
    );
  };

  const renderWalletTab = () => (
    <div className="p-4 md:p-6 space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} /></div>
             <p className="text-slate-400 text-sm font-medium mb-1">Toplam Bakiye (Kredi)</p>
             <h2 className="text-4xl font-bold mb-4">{credits} <span className="text-lg font-normal text-slate-400">Kredi</span></h2>
             <button onClick={() => setShowAddCreditModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-900/50 flex items-center gap-2">
                <Plus size={16} /> Kredi Yükle
             </button>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                <span className="text-slate-500 text-sm font-bold">Bu Ay Kazanç</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">₺12,450.00</h3>
             <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><ArrowUpRight size={12} /> %12 artış</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                <span className="text-slate-500 text-sm font-bold">Tamamlanan İş</span>
             </div>
             <h3 className="text-2xl font-bold text-slate-800">42 Adet</h3>
             <p className="text-xs text-slate-400 font-bold mt-1">Son 30 gün</p>
          </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-lg text-slate-800">Hesap Hareketleri</h3>
             <div className="flex gap-2">
                {['all', 'income', 'expense'].map(f => (
                   <button key={f} onClick={() => setWalletFilter(f as any)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${walletFilter === f ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
                      {f === 'all' ? 'Tümü' : f === 'income' ? 'Gelirler' : 'Giderler'}
                   </button>
                ))}
             </div>
          </div>
          <div className="space-y-4">
             {MOCK_TRANSACTIONS.filter(t => walletFilter === 'all' || t.type === walletFilter).map(trx => (
                <div key={trx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {trx.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                         <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{trx.title}</p>
                         <p className="text-xs text-slate-400">{trx.date}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className={`font-bold ${trx.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                         {trx.type === 'income' ? '+' : '-'}{trx.isCredit ? `${trx.amount} Kredi` : `₺${trx.amount}`}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{trx.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  const renderFleetTab = () => {
    // Yeni araç ekleme sayfası
    if (showNewVehiclePage) {
      return (
        <div className="p-4 md:p-6 h-full">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
              <button
                onClick={() => {
                  setShowNewVehiclePage(false);
                  setVehiclePlate('');
                  setVehicleModel('');
                  setVehicleType('');
                  setVehicleDriver('');
                  setVehicleYear('');
                }}
                className="mb-4 text-sm flex items-center gap-2 hover:text-slate-200 transition-colors"
              >
                <ChevronDown size={16} className="rotate-90" /> Geri Dön
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Truck size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Yeni Araç Ekle</h2>
                  <p className="text-sm text-slate-300">Filonuza yeni araç tanımlayın</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Plate */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Plaka *</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="Örn: 34 AB 1234"
                  maxLength={15}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                />
              </div>

              {/* Model & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Marka & Model *</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Örn: 2020 Ford F-Max"
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Model Yılı *</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Araç Tipi *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                >
                  <option value="">Seçiniz...</option>
                  <option value="Kayar Kasa">Kayar Kasa</option>
                  <option value="Ahtapot Vinç">Ahtapot Vinç</option>
                  <option value="Platform">Platform</option>
                  <option value="Kurtarıcı">Kurtarıcı</option>
                  <option value="Yol Yardım">Yol Yardım Aracı</option>
                </select>
              </div>

              {/* Driver */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sürücü</label>
                <input
                  type="text"
                  value={vehicleDriver}
                  onChange={(e) => setVehicleDriver(e.target.value)}
                  placeholder="Örn: Mehmet Y."
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">Opsiyonel - Sonra da ekleyebilirsiniz</p>
              </div>

              {/* Araç Fotoğrafı */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Araç Fotoğrafı</label>
                <div className="flex items-center gap-6 p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200">
                  <div className="w-28 h-28 rounded-xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                    {vehiclePhoto ? (
                      <img 
                        src={createPreviewUrl(vehiclePhoto)} 
                        alt="Araç" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={36} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-3">Aracınızın fotoğrafını çekin veya yükleyin</p>
                    <label className="bg-slate-700 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg transition-all cursor-pointer inline-flex items-center gap-2">
                      {isCompressingVehicle ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <Camera size={16} />
                          Fotoğraf Çek
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden" 
                        onChange={handleVehiclePhotoUpload}
                        disabled={isCompressingVehicle}
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-2">Fotoğraf otomatik olarak optimize edilecek</p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Araç Belgelerini Unutmayın</p>
                  <p className="text-xs text-blue-700">
                    Aracınızı ekledikten sonra "Belgelerim" bölümünden ruhsat, sigorta ve diğer gerekli belgeleri yüklemeyi unutmayın.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewVehiclePage(false);
                    setVehiclePlate('');
                    setVehicleModel('');
                    setVehicleType('');
                    setVehicleDriver('');
                    setVehicleYear('');
                    setVehiclePhoto(null);
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (!vehiclePlate.trim() || !vehicleModel.trim() || !vehicleType || !vehicleYear) {
                      alert('Lütfen zorunlu alanları doldurun (Plaka, Model, Tip, Yıl).');
                      return;
                    }
                    console.log('Yeni Araç:', {
                      plate: vehiclePlate,
                      model: vehicleModel,
                      type: vehicleType,
                      driver: vehicleDriver,
                      year: vehicleYear,
                      photo: vehiclePhoto ? 'Yüklendi' : 'Yok',
                      timestamp: new Date().toISOString()
                    });
                    alert('✅ Araç başarıyla filonuza eklendi! Belge yüklemek için "Belgelerim" bölümüne gidin.');
                    setShowNewVehiclePage(false);
                    setVehiclePlate('');
                    setVehicleModel('');
                    setVehicleType('');
                    setVehicleDriver('');
                    setVehicleYear('');
                    setVehiclePhoto(null);
                  }}
                  disabled={!vehiclePlate.trim() || !vehicleModel.trim() || !vehicleType || !vehicleYear}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Aracı Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Ana filo sayfası
    return (
    <div className="p-4 md:p-6 space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-slate-800">Araç Filosu</h2>
             <p className="text-sm text-slate-500">Kayıtlı araçlarınızı yönetin ve durumlarını izleyin.</p>
          </div>
          <button
             onClick={() => setShowNewVehiclePage(true)}
             className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
          >
             <Plus size={16} /> Yeni Araç Ekle
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_FLEET.map(vehicle => (
             <div key={vehicle.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-40 bg-slate-100 relative">
                   <img src={vehicle.image} alt={vehicle.plate} className="w-full h-full object-cover" />
                   <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold shadow-sm ${vehicle.status === 'active' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                      {vehicle.status === 'active' ? 'Aktif' : 'Bakımda'}
                   </div>
                </div>
                <div className="p-5">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="font-bold text-slate-900 text-lg">{vehicle.plate}</h3>
                         <p className="text-sm text-slate-500">{vehicle.model}</p>
                      </div>
                      <button onClick={() => alert(`${vehicle.plate} için ayarlar açılıyor.`)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"><Settings size={16} /></button>
                   </div>
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-slate-50">
                         <span className="text-slate-500">Araç Tipi</span>
                         <span className="font-medium text-slate-800">{vehicle.type}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                         <span className="text-slate-500">Sürücü</span>
                         <span className="font-medium text-slate-800 flex items-center gap-1"><User size={14} /> {vehicle.driver}</span>
                      </div>
                   </div>
                   <div className="mt-4 pt-2 flex gap-2">
                      <button onClick={() => alert(`${vehicle.plate} için geçmiş görüntüleniyor.`)} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">Geçmiş</button>
                   </div>
                </div>
             </div>
          ))}
          {/* Add New Card Placeholder */}
          <button 
            onClick={() => setShowNewVehiclePage(true)}
            className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all min-h-[300px] gap-3"
          >
             <div className="w-12 h-12 rounded-full bg-white border-2 border-current flex items-center justify-center"><Plus size={24} /></div>
             <span className="font-bold">Yeni Araç Tanımla</span>
          </button>
       </div>
    </div>
    );
  };

  const renderServiceRoutesTab = () => {
      const filteredOriginCities = cityList.filter(c => c.toLowerCase().includes(originSearch.toLowerCase()));
      const filteredDestCities = cityList.filter(c => c.toLowerCase().includes(destSearch.toLowerCase()));
      const selectedVehicleData = MOCK_FLEET.find(v => v.plate === routeVehicle);

      return (
         <div className="p-4 md:p-6 space-y-6">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
               <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">{editingRouteId ? 'Rotayı Düzenle' : 'Boş Dönüş & Hizmet Rotaları'}</h2>
                  <p className="text-slate-100 max-w-xl text-sm mb-6">
                     {editingRouteId 
                        ? 'Mevcut rotadaki bilgileri güncelleyin.' 
                        : 'Dönüş yolunda veya belirli tarihlerde gideceğiniz güzergahları ekleyin, o rotadaki iş fırsatlarını size öncelikli olarak ve indirimli sunalım.'}
                  </p>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 grid grid-cols-1 md:grid-cols-4 gap-4">
                     
                     {/* Origin Autocomplete */}
                     <div className="space-y-1 relative" ref={originRef}>
                        <label className="text-[10px] font-bold uppercase text-blue-200 flex items-center gap-1">
                           <MapPin size={10} /> Kalkış (Nereden)
                        </label>
                        <div className="relative group">
                           <input 
                              type="text"
                              className="w-full bg-white/90 hover:bg-white border-0 rounded-xl text-slate-900 text-sm py-3 px-4 pl-10 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm transition-all placeholder-slate-400 font-medium"
                              placeholder="Şehir Ara..."
                              value={originSearch}
                              onChange={(e) => {
                                 setOriginSearch(e.target.value);
                                 if (!isOriginOpen) setIsOriginOpen(true);
                              }}
                              onFocus={() => setIsOriginOpen(true)}
                           />
                           <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 opacity-50 group-focus-within:opacity-100 transition-opacity" size={16} />
                           {originSearch && (
                               <button onClick={() => { setOriginSearch(''); setRouteOrigin(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 p-1 bg-white/50 rounded-full transition-colors">
                                   <X size={14} />
                               </button>
                           )}
                        </div>
                        <AnimatePresence>
                           {isOriginOpen && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                 className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                              >
                                 {filteredOriginCities.length > 0 ? filteredOriginCities.map(city => (
                                    <button 
                                       key={city}
                                       onClick={() => {
                                          setRouteOrigin(city);
                                          setOriginSearch(city);
                                          setIsOriginOpen(false);
                                       }}
                                       className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0 flex items-center gap-2"
                                    >
                                       <MapPin size={14} className="text-slate-300" />
                                       {city}
                                    </button>
                                 )) : (
                                     <div className="p-4 text-center text-xs text-slate-400">Şehir bulunamadı.</div>
                                 )}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Vehicle Selector (Custom) */}
                     <div className="space-y-1 relative" ref={vehicleRef}>
                        <label className="text-[10px] font-bold uppercase text-blue-200 flex items-center gap-1">
                           <Truck size={10} /> Araç Seçimi
                        </label>
                        <button 
                           onClick={() => setIsVehicleOpen(!isVehicleOpen)}
                           className="w-full bg-white/90 hover:bg-white border-0 rounded-xl text-slate-900 text-sm py-2.5 px-4 focus:ring-2 focus:ring-blue-400 outline-none flex items-center justify-between shadow-sm transition-all h-[46px]"
                        >
                            {selectedVehicleData ? (
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <img src={selectedVehicleData.image} alt="v" className="w-6 h-6 rounded-md object-cover ring-1 ring-slate-200" />
                                    <div className="flex flex-col items-start leading-none">
                                       <span className="truncate font-bold text-xs">{selectedVehicleData.plate}</span>
                                       <span className="text-[10px] text-slate-500">{selectedVehicleData.model}</span>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-sm">Araç Seçiniz</span>
                            )}
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isVehicleOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                           {isVehicleOpen && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                 className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-50"
                              >
                                 {MOCK_FLEET.map(v => (
                                    <button 
                                       key={v.id}
                                       onClick={() => {
                                          setRouteVehicle(v.plate);
                                          setIsVehicleOpen(false);
                                       }}
                                       className={`w-full text-left p-2.5 flex items-center gap-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors ${routeVehicle === v.plate ? 'bg-blue-50' : ''}`}
                                    >
                                        <img src={v.image} alt={v.plate} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-100" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{v.plate}</p>
                                            <p className="text-xs text-slate-500">{v.model}</p>
                                        </div>
                                        {routeVehicle === v.plate && <Check size={16} className="ml-auto text-blue-600" />}
                                    </button>
                                 ))}
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     {/* Date & Time */}
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-blue-200 flex items-center gap-1">
                           <Calendar size={10} /> Tarih & Saat
                        </label>
                        <input 
                           type="datetime-local" 
                           className="w-full bg-white/90 hover:bg-white border-0 rounded-xl text-slate-900 text-sm py-3 px-4 focus:ring-2 focus:ring-blue-400 outline-none shadow-sm transition-all font-medium h-[46px]"
                           value={routeDate && routeTime ? `${routeDate}T${routeTime}` : ''}
                           onChange={(e) => {
                              const val = e.target.value;
                              if(val) {
                                    setRouteDate(val.split('T')[0]);
                                    setRouteTime(val.split('T')[1]);
                              }
                           }}
                        />
                     </div>

                     {/* Destinations Autocomplete */}
                     <div className="space-y-1 md:col-span-4 relative" ref={destRef}>
                        <label className="text-[10px] font-bold uppercase text-blue-200 flex items-center gap-1">
                           <Navigation size={10} /> Güzergah / Varışlar (Nereye)
                        </label>
                        <div className="flex gap-2 relative group">
                           <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    placeholder="Şehir ekle..." 
                                    className="w-full bg-white/90 hover:bg-white border-0 rounded-xl text-slate-900 text-sm py-3 px-4 pl-10 focus:ring-2 focus:ring-blue-400 outline-none placeholder-slate-400 shadow-sm transition-all font-medium"
                                    value={destSearch}
                                    onChange={(e) => {
                                        setDestSearch(e.target.value);
                                        if (!isDestOpen) setIsDestOpen(true);
                                    }}
                                    onFocus={() => setIsDestOpen(true)}
                                />
                                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 opacity-50 group-focus-within:opacity-100 transition-opacity" size={16} />
                                 <AnimatePresence>
                                    {isDestOpen && destSearch && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                            className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl overflow-hidden z-50 max-h-48 overflow-y-auto"
                                        >
                                            {filteredDestCities.length > 0 ? filteredDestCities.map(city => (
                                                <button 
                                                    key={city}
                                                    onClick={() => addDestination(city)}
                                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center group"
                                                >
                                                    <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> {city}</span>
                                                    <Plus size={14} className="text-slate-300 group-hover:text-blue-500" />
                                                </button>
                                            )) : (
                                                <div className="p-4 text-center text-xs text-slate-400">Şehir bulunamadı.</div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                           </div>
                        </div>
                        {routeDestinations.length > 0 && (
                           <div className="flex flex-wrap gap-2 mt-2">
                              {routeDestinations.map(d => (
                                 <span key={d} className="bg-blue-800/50 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 border border-blue-400/30 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                                    {d} <button onClick={() => removeDestination(d)} className="hover:text-red-300 transition-colors bg-black/10 rounded-full p-0.5"><X size={10} /></button>
                                 </span>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Actions */}
                     <div className="md:col-span-4 flex justify-end pt-4 gap-3 border-t border-white/10 mt-2">
                        {editingRouteId && (
                           <button onClick={cancelEdit} className="bg-white/10 border border-white/30 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
                                 İptal
                           </button>
                        )}
                        <button onClick={handleAddRoute} className="bg-white text-blue-700 px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-50 shadow-lg transition-all transform active:scale-95 flex items-center gap-2">
                           <Save size={18} /> {editingRouteId ? 'Değişiklikleri Kaydet' : 'Rotayı Kaydet'}
                        </button>
                     </div>
                  </div>
               </div>
               <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Map size={300} />
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="font-bold text-slate-800 text-lg ml-1 flex items-center gap-2">
                  <Route size={20} className="text-blue-600" /> Aktif Rotalarım
               </h3>
               {activeRoutes.length > 0 ? (
                  activeRoutes.map(route => (
                     <div key={route.id} className={`bg-white rounded-2xl border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-all group hover:shadow-md ${editingRouteId === route.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                        <div className="flex items-start gap-4">
                           <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
                                 <Route size={24} />
                           </div>
                           <div>
                                 <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <h4 className="font-bold text-slate-900 text-lg">{route.origin}</h4>
                                    <ArrowRight size={16} className="text-slate-300" />
                                    <div className="flex flex-wrap gap-1">
                                       {route.destinations.map((d, i) => (
                                          <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-sm font-medium">{d}</span>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded"><Calendar size={12} className="text-slate-400" /> {route.date}</span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded"><Clock size={12} className="text-slate-400" /> {route.time}</span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded"><Truck size={12} className="text-slate-400" /> {route.vehicle}</span>
                                 </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-50 pt-3 md:pt-0 mt-1 md:mt-0">
                           {route.matches > 0 && (
                                 <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                    <Zap size={14} fill="currentColor" /> {route.matches} İş Eşleşti
                                 </div>
                           )}
                           <div className="flex ml-auto md:ml-0 gap-2">
                                 <button onClick={() => handleEditRoute(route)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                                    <PenTool size={18} />
                                 </button>
                                 <button onClick={() => handleRemoveRoute(route.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100">
                                    <Trash2 size={18} />
                                 </button>
                           </div>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                     <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Route size={32} className="opacity-50" />
                     </div>
                     <p className="font-medium text-slate-500">Henüz kayıtlı rota bulunmuyor.</p>
                     <p className="text-xs mt-1 text-slate-400">Yeni rota ekleyerek iş fırsatlarını yakalayın.</p>
                  </div>
               )}
            </div>
         </div>
      );
  };

  // ============== DEĞERLENDİRMELER TAB ==============
  const renderReviewsTab = () => {
    // İtiraz Et Tam Sayfa
    if (showObjectionPage && selectedReviewForObjection) {
      return (
        <div className="p-4 md:p-6 h-full">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
              <button
                onClick={() => {
                  setShowObjectionPage(false);
                  setSelectedReviewForObjection(null);
                  setObjectionReason('');
                  setObjectionDetails('');
                }}
                className="mb-4 text-sm flex items-center gap-2 hover:text-red-100 transition-colors"
              >
                <ChevronDown size={16} className="rotate-90" /> Geri Dön
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Değerlendirmeye İtiraz</h2>
                  <p className="text-sm text-red-100">İş No: #{selectedReviewForObjection.jobId}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Review Info */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                    ?
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <h3 className="font-bold text-slate-900 text-lg">Müşteri ***</h3>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={18} 
                            fill={i < selectedReviewForObjection.rating ? "#ef4444" : "none"} 
                            className={i < selectedReviewForObjection.rating ? "text-red-500" : "text-slate-300"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 mb-3 leading-relaxed bg-white p-3 rounded-lg">
                      "{selectedReviewForObjection.comment}"
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="text-slate-500">{selectedReviewForObjection.date}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium">{selectedReviewForObjection.service}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objection Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">İtiraz Nedeni *</label>
                <select
                  value={objectionReason}
                  onChange={(e) => setObjectionReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                >
                  <option value="">Seçiniz...</option>
                  <option value="wrong_job">Yanlış İş Kaydı</option>
                  <option value="false_claim">Haksız İddia</option>
                  <option value="customer_mistake">Müşteri Hatası</option>
                  <option value="technical_issue">Teknik Sorun</option>
                  <option value="unfair_rating">Adaletsiz Puanlama</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              {/* Objection Details */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama & Kanıtlar *</label>
                <textarea
                  value={objectionDetails}
                  onChange={(e) => setObjectionDetails(e.target.value)}
                  placeholder="İtirazınızı detaylı olarak açıklayın. Varsa fotoğraf, mesaj ekran görüntüsü gibi kanıtlarınızı açıklayın."
                  rows={10}
                  maxLength={500}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{objectionDetails.length}/500 karakter</p>
              </div>

              {/* Warning Box */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 flex items-start gap-3">
                <Info size={22} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900 mb-2">⚠️ Önemli Bilgilendirme</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    İtirazınız ekibimiz tarafından <strong>3 iş günü içinde</strong> incelenecektir. İtiraz haklı bulunursa değerlendirme ortalamanızdan çıkarılır. Ancak haksız itirazlar hesabınıza uyarı olarak işlenir.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowObjectionPage(false);
                    setSelectedReviewForObjection(null);
                    setObjectionReason('');
                    setObjectionDetails('');
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={handleSubmitObjection}
                  disabled={!objectionReason || !objectionDetails.trim()}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> İtiraz Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Ana değerlendirmeler sayfası
    const avgRating = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;
    
    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Müşteri Değerlendirmeleri</h2>
            <p className="text-sm text-slate-500">Aldığınız puanlar ve yorumlar</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Star size={24} fill="currentColor" className="text-yellow-400" />
              <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-slate-300">{MOCK_REVIEWS.length} Değerlendirme</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} fill="#22c55e" className="text-green-500" />
              <span className="text-xs font-bold text-slate-500">5 Yıldız</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{MOCK_REVIEWS.filter(r => r.rating === 5).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} fill="#3b82f6" className="text-blue-500" />
              <span className="text-xs font-bold text-slate-500">4 Yıldız</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{MOCK_REVIEWS.filter(r => r.rating === 4).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} fill="#f59e0b" className="text-amber-500" />
              <span className="text-xs font-bold text-slate-500">3 Yıldız</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{MOCK_REVIEWS.filter(r => r.rating === 3).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} fill="#ef4444" className="text-red-500" />
              <span className="text-xs font-bold text-slate-500">≤2 Yıldız</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{MOCK_REVIEWS.filter(r => r.rating <= 2).length}</p>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {MOCK_REVIEWS.map(review => {
            const isLowRating = review.rating < 3;
            const displayName = isLowRating ? 'Müşteri ***' : review.customerName;
            const displayPhone = isLowRating ? '**********' : review.customerPhone;
            
            return (
              <motion.div 
                key={review.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border-2 p-4 md:p-6 transition-all hover:shadow-md ${
                  isLowRating ? 'border-red-200 bg-red-50/30' : 'border-slate-200'
                }`}
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                      isLowRating ? 'bg-red-500' : 'bg-slate-700'
                    }`}>
                      {isLowRating ? '?' : review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{displayName}</h3>
                      <p className="text-xs text-slate-500">{review.date} • {review.service}</p>
                      {isLowRating ? (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                          <ShieldAlert size={12} />
                          Bilgiler gizlendi
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">{displayPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < review.rating ? "#FFA500" : "none"} 
                        className={i < review.rating ? "text-orange-500" : "text-slate-300"}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Layout - Avatar üstte */}
                <div className="md:hidden flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md shrink-0 ${
                    isLowRating ? 'bg-red-500' : 'bg-slate-700'
                  }`}>
                    {isLowRating ? '?' : review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{review.date} • {review.service}</p>
                    {isLowRating && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <ShieldAlert size={12} />
                        Bilgiler gizlendi
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-4 leading-relaxed">{review.comment}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                        POSITIVE_RATING_TAGS.includes(tag)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Mobile - İsim, telefon ve yıldızlar alt kısımda */}
                <div className="md:hidden space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{displayName}</h3>
                      {!isLowRating && (
                        <p className="text-xs text-slate-400 mt-0.5">{displayPhone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < review.rating ? "#FFA500" : "none"} 
                          className={i < review.rating ? "text-orange-500" : "text-slate-300"}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* İş No ve İtiraz Et butonu */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 md:border-t-0 md:pt-0 mt-4 md:mt-0">
                  <span className="text-xs text-slate-400 font-mono">İş No: #{review.jobId}</span>
                  {isLowRating && (
                    <button 
                      onClick={() => handleOpenObjection(review)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <HelpCircle size={14} /> İtiraz Et
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <Info size={22} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-2">📋 Düşük Puanlı Değerlendirmeler Hakkında</p>
              <p className="leading-relaxed">3 yıldız ve altı puan alan işlerde müşteri bilgileri (isim ve telefon) gizlenir. Bu puanlar ortalamanıza dahildir ancak iletişim bilgilerine erişiminiz kısıtlanır. Bu, her iki tarafın da güvenliği için alınan bir önlemdir.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSupportTab = () => {
    // Yeni talep oluşturma sayfası
    if (showNewTicketPage) {
      return (
        <div className="p-4 md:p-6 h-full">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <button
                onClick={() => {
                  setShowNewTicketPage(false);
                  setTicketSubject('');
                  setTicketCategory('');
                  setTicketDescription('');
                }}
                className="mb-4 text-sm flex items-center gap-2 hover:text-blue-100 transition-colors"
              >
                <ChevronDown size={16} className="rotate-90" /> Geri Dön
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Yeni Destek Talebi</h2>
                  <p className="text-sm text-blue-100">Sorununuzu detaylı olarak açıklayın</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori *</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Seçiniz...</option>
                  <option value="technical">Teknik Sorun</option>
                  <option value="customer_complaint">Müşteri Şikayeti</option>
                  <option value="account">Hesap İşlemleri</option>
                  <option value="document">Belge & Onay</option>
                  <option value="other">Diğer</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Konu *</label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Örn: Uygulamada teknik bir sorun yaşıyorum"
                  maxLength={100}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{ticketSubject.length}/100 karakter</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Açıklama *</label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Sorununuzu detaylı olarak açıklayın. Gerekirse iş numarası, tarih gibi bilgileri ekleyin."
                  rows={8}
                  maxLength={1000}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 mt-1">{ticketDescription.length}/1000 karakter</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Info size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-900 mb-1">Destek Süresi</p>
                  <p className="text-xs text-blue-700">
                    Talepler genellikle 2-4 iş saati içinde yanıtlanır. Acil durumlar için canlı destek hattımızı kullanın.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowNewTicketPage(false);
                    setTicketSubject('');
                    setTicketCategory('');
                    setTicketDescription('');
                  }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (!ticketCategory || !ticketSubject.trim() || !ticketDescription.trim()) {
                      alert('Lütfen tüm zorunlu alanları doldurun.');
                      return;
                    }
                    console.log('Yeni Destek Talebi:', {
                      category: ticketCategory,
                      subject: ticketSubject,
                      description: ticketDescription,
                      timestamp: new Date().toISOString()
                    });
                    setShowNewTicketPage(false);
                    setTicketSubject('');
                    setTicketCategory('');
                    setTicketDescription('');
                    alert('Mesajınız başarılı bir şekilde alındı.');
                  }}
                  disabled={!ticketCategory || !ticketSubject.trim() || !ticketDescription.trim()}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Talep Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const renderTicketDetailModal = () => {
        if (!selectedTicket) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Destek Talebi Detayı</h2>
                                <p className="text-sm text-white/80">Talep No: #{selectedTicket.id}</p>
                            </div>
                            <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <p><span className="font-bold">Konu:</span> {selectedTicket.subject}</p>
                        <p><span className="font-bold">Tarih:</span> {selectedTicket.date}</p>
                        <p><span className="font-bold">Durum:</span> {selectedTicket.status}</p>
                        <p className="mt-4 pt-4 border-t border-slate-200"><span className="font-bold">Detaylar:</span></p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>
                    </div>
                </motion.div>
            </div>
        );
    };

    // Ana destek sayfası
    return (
     <div className="p-4 md:p-6 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><Headphones size={24} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Canlı Destek</h3>
              <p className="text-slate-500 text-sm mb-6">Operasyonel sorunlar için 7/24 temsilcilerimize bağlanın.</p>
              <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Sohbeti Başlat</button>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><FileText size={24} /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Talep Oluştur</h3>
              <p className="text-slate-500 text-sm mb-6">Finansal konular veya şikayetler için bilet oluşturun.</p>
              <button
                 onClick={() => setShowNewTicketPage(true)}
                 className="w-full py-3 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:border-blue-200 hover:text-blue-600 transition-colors"
              >
                 Yeni Bilet Aç
              </button>
           </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-4">Geçmiş Taleplerim</h3>
           <div className="space-y-2">
              {MOCK_TICKETS.map(ticket => (
                 <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                       <div>
                          <p className="font-bold text-slate-800 text-sm">{ticket.subject} <span className="text-slate-400 font-normal">#{ticket.id}</span></p>
                          <p className="text-xs text-slate-500">{ticket.date}</p>
                       </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                       {ticket.status === 'open' ? 'Açık' : 'Çözüldü'}
                    </div>
                 </div>
              ))}
           </div>
        </div>
        <AnimatePresence>
            {selectedTicket && renderTicketDetailModal()}
        </AnimatePresence>
     </div>
    );
  };

  // ============== YENİ İŞLER TAB ==============
  const renderNewJobsTab = () => {
    const filteredNewJobs = requests.filter(req => {
      if (newJobsFilter === 'nearest') return parseFloat(req.distance) < 10;
      if (newJobsFilter === 'urgent') return req.urgency === 'high';
      return true;
    });

    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Tümü', icon: LayoutList },
              { id: 'nearest', label: 'En Yakın', icon: Navigation },
              { id: 'urgent', label: 'Acil İşler', icon: AlertTriangle },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setNewJobsFilter(filter.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  newJobsFilter === filter.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                <filter.icon size={16} /> {filter.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} />
            <span>{filteredNewJobs.length} Yeni İş</span>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNewJobs.map(job => {
            const isUnlocked = unlockedJobs.includes(job.id);
            const isOffering = offeringJobId === job.id;
            const hasError = offerError === job.id;
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                  isUnlocked ? 'border-green-300 bg-green-50/50' : hasError ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isUnlocked ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {job.serviceType.includes('Çekici') ? <Truck size={24} /> : <Wrench size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{job.serviceType}</h3>
                      <p className="text-xs text-slate-500">#{job.id}</p>
                    </div>
                  </div>
                  {job.urgency === 'high' && (
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} /> ACİL
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-3 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Alınacak Konum</p>
                      <p className="font-bold text-slate-800">{job.location}</p>
                      <p className="text-xs text-blue-600 mt-1">📍 {job.distance} uzakta</p>
                    </div>
                  </div>
                  {job.dropoffLocation && (
                    <div className="flex items-start gap-2">
                      <Navigation size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500">Teslim Noktası</p>
                        <p className="font-bold text-slate-800">{job.dropoffLocation}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-slate-600">{job.timestamp}</span>
                  </div>
                  {job.estimatedPrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign size={14} className="text-green-600" />
                      <span className="font-bold text-green-600">~₺{job.estimatedPrice}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedJobForDetail(job)}
                    className="flex-1 py-2 border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-blue-300 hover:text-blue-600 transition-all"
                  >
                    İncele
                  </button>
                  {isUnlocked ? (
                    <button
                      onClick={() => handleStartOperation(job)}
                      className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Operasyonu Başlat <ArrowRight size={16} />
                    </button>
                  ) : isOffering ? (
                    <div className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-blue-100">
                      <Loader2 size={14} className="animate-spin" /> Değerlendiriliyor...
                    </div>
                  ) : hasError ? (
                    <div className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-red-100">
                      <AlertTriangle size={14} /> Ret Edildi
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedJobForQuote(job);
                        setQuotePrice(job.estimatedPrice?.toString() || '');
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={16} /> Teklif Ver
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredNewJobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Yeni İş Bulunamadı</h3>
            <p className="text-slate-500">Seçili filtreye uygun iş talebi yok</p>
          </div>
        )}
      </div>
    );
  };

  // ============== BOŞ DÖNEN ARAÇLAR TAB ==============
  const renderEmptyTrucksTab = () => {

    const handleOpenMatchesModal = (truck: any) => {
        setSelectedTruckForMatches(truck);
        setShowMatchesModal(true);
    };

    const renderMatchesModal = () => {
        if (!selectedTruckForMatches) return null;

        // Mock data for matches - replace with real data later
        const MOCK_MATCHES = [
            { id: 'MATCH-001', customerName: 'Ayşe Yıldız', route: `${selectedTruckForMatches.origin} -> ${selectedTruckForMatches.destinations[0]}`, price: 750 },
            { id: 'MATCH-002', customerName: 'Fatma Demir', route: `${selectedTruckForMatches.origin} -> ${selectedTruckForMatches.destinations[0]}`, price: 800 },
            { id: 'MATCH-003', customerName: 'Hayriye Kaya', route: `${selectedTruckForMatches.origin} -> Bir ara nokta`, price: 600 },
        ];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Eşleşen Talepler</h2>
                                <p className="text-sm text-green-100">{selectedTruckForMatches.origin} → {selectedTruckForMatches.destinations[0]}</p>
                            </div>
                            <button onClick={() => setShowMatchesModal(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {MOCK_MATCHES.map(match => (
                            <div key={match.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-green-300 transition-colors">
                                <div>
                                    <p className="font-bold text-slate-800">{match.customerName}</p>
                                    <p className="text-sm text-slate-500">{match.route}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600">₺{match.price}</p>
                                    <button className="text-xs text-blue-600 font-bold hover:underline">Teklif Ver</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    };

    const handleAddEmptyTruck = () => {
      if (!emptyTruckOrigin || !emptyTruckDate || !emptyTruckTime || !emptyTruckVehicle) {
        alert('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      const newTruck = {
        id: emptyTrucks.length + 1,
        origin: emptyTruckOrigin,
        destinations: emptyTruckType === 'intercity' ? [emptyTruckDestination] : [emptyTruckDestination],
        date: emptyTruckDate,
        time: emptyTruckTime,
        vehicle: emptyTruckVehicle,
        matches: 0,
        type: emptyTruckType,
      };

      setEmptyTrucks([...emptyTrucks, newTruck]);
      
      // Reset form
      setEmptyTruckOrigin('');
      setEmptyTruckDestination('');
      setEmptyTruckDate('');
      setEmptyTruckTime('');
      setEmptyTruckVehicle('');
    };

    const handleDeleteTruck = (id: number) => {
      setEmptyTrucks(emptyTrucks.filter(t => t.id !== id));
    };

    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Type Selector */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-2 border-2 border-slate-200 w-fit">
          <button
            onClick={() => setEmptyTruckType('intercity')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              emptyTruckType === 'intercity'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Şehirler Arası
          </button>
          <button
            onClick={() => setEmptyTruckType('intracity')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              emptyTruckType === 'intracity'
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Şehir İçi
          </button>
        </div>

        {/* Add Form */}
        <div className="bg-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Truck size={28} /> Boş Araç İlanı Oluştur
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Origin */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase">Nereden *</label>
              <select
                value={emptyTruckOrigin}
                onChange={(e) => setEmptyTruckOrigin(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white focus:bg-white/20 transition-all outline-none"
              >
                <option value="" className="text-slate-800">Şehir Seçin</option>
                {cityList.map(city => (
                  <option key={city} value={city} className="text-slate-800">{city}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase">
                {emptyTruckType === 'intercity' ? 'Nereye *' : 'İlçe *'}
              </label>
              {emptyTruckType === 'intercity' ? (
                <select
                  value={emptyTruckDestination}
                  onChange={(e) => setEmptyTruckDestination(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white focus:bg-white/20 transition-all outline-none"
                >
                  <option value="" className="text-slate-800">Şehir Seçin</option>
                  {cityList.map(city => (
                    <option key={city} value={city} className="text-slate-800">{city}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={emptyTruckDestination}
                  onChange={(e) => setEmptyTruckDestination(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white focus:bg-white/20 transition-all outline-none"
                  disabled={!emptyTruckOrigin}
                >
                  <option value="" className="text-slate-800">İlçe Seçin</option>
                  {emptyTruckOrigin && CITIES_WITH_DISTRICTS[emptyTruckOrigin]?.map(district => (
                    <option key={district} value={district} className="text-slate-800">{district}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Vehicle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase">Araç Plakası *</label>
              <select
                value={emptyTruckVehicle}
                onChange={(e) => setEmptyTruckVehicle(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white placeholder-white/50 focus:border-white focus:bg-white/20 transition-all outline-none"
              >
                <option value="" className="text-slate-800">Araç Seçin</option>
                {MOCK_FLEET.map(v => (
                  <option key={v.id} value={v.plate} className="text-slate-800">
                    {v.name} - {v.plate}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase">Tarih *</label>
              <input
                type="date"
                value={emptyTruckDate}
                onChange={(e) => setEmptyTruckDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-white focus:bg-white/20 transition-all outline-none"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/80 uppercase">Saat *</label>
              <input
                type="time"
                value={emptyTruckTime}
                onChange={(e) => setEmptyTruckTime(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 border-2 border-white/20 text-white focus:border-white focus:bg-white/20 transition-all outline-none"
              />
            </div>

            {/* Add Button */}
            <div className="space-y-2 flex items-end">
              <button
                onClick={handleAddEmptyTruck}
                className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> İlan Ver
              </button>
            </div>
          </div>
        </div>

        {/* Active Trucks List */}
        <div>
          <h3 className="font-bold text-slate-800 text-xl mb-4 flex items-center gap-2">
            <Route size={24} className="text-blue-600" /> Boş Dönen Araçlar
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {emptyTrucks.slice().reverse().map(truck => (
              <motion.div
                key={truck.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border-2 border-slate-200 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <Truck size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{truck.vehicle}</p>
                      <p className="text-xs text-slate-500">
                        {truck.type === 'intercity' ? 'Şehirler Arası' : 'Şehir İçi'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTruck(truck.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-green-600" />
                    <span className="font-bold text-slate-800">{truck.origin}</span>
                    <ArrowRight size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-800">{truck.destinations[0]}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {truck.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {truck.time}
                    </span>
                  </div>
                </div>

                {truck.matches > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-green-700">
                      ✅ {truck.matches} Eşleşme Bulundu
                    </span>
                    <button onClick={() => handleOpenMatchesModal(truck)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-green-700">
                      Görüntüle
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {emptyTrucks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz Boş Araç İlanı Yok</h3>
              <p className="text-slate-500">Yukarıdaki formu kullanarak ilk ilanınızı oluşturun</p>
            </div>
          )}
        </div>
        <AnimatePresence>
            {showMatchesModal && renderMatchesModal()}
        </AnimatePresence>
      </div>
    );
  };

  // ============== ANA SAYFA TAB ==============
  const renderHomeTab = () => (
    <div className="p-4 md:p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('requests')}
          className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <Bell size={24} className="opacity-80" />
            <span className="text-3xl font-black">{requests.length}</span>
          </div>
          <p className="text-sm font-bold opacity-80">Yeni İş Talebi</p>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="bg-slate-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} className="opacity-80" />
            <span className="text-3xl font-black">{MOCK_HISTORY.filter(h => h.status === 'completed').length}</span>
          </div>
          <p className="text-sm font-bold opacity-80">Tamamlanan İş</p>
        </button>

        <button
          onClick={() => setActiveTab('emptyTrucks')}
          className="bg-slate-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <Truck size={24} className="opacity-80" />
            <span className="text-3xl font-black">{emptyTrucks.length}</span>
          </div>
          <p className="text-sm font-bold opacity-80">Boş Araç</p>
        </button>

        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Star size={24} className="opacity-80" fill="currentColor" />
            <span className="text-3xl font-black">4.9</span>
          </div>
          <p className="text-sm font-bold opacity-80">Ortalama Puan</p>
        </div>
      </div>

      {/* Recent Jobs & Empty Trucks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Star size={20} className="text-yellow-500" fill="currentColor" /> Yeni İşler
            </h3>
            <button
              onClick={() => setActiveTab('newJobs')}
              className="text-sm text-blue-600 font-bold hover:text-blue-700"
            >
              Tümünü Gör →
            </button>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 3).map(job => (
              <div key={job.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-sm">{job.serviceType}</span>
                  <span className="text-xs text-slate-500">{job.distance}</span>
                </div>
                <p className="text-xs text-slate-600">{job.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Empty Trucks */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Truck size={20} className="text-orange-600" /> Boş Dönen Araçlar
            </h3>
            <button
              onClick={() => setActiveTab('emptyTrucks')}
              className="text-sm text-blue-600 font-bold hover:text-blue-700"
            >
              Tümünü Gör →
            </button>
          </div>
          <div className="space-y-3">
            {emptyTrucks.slice(0, 3).map(truck => (
              <div key={truck.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-orange-300 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-sm">{truck.vehicle}</span>
                  <span className="text-xs text-slate-500">{truck.date}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {truck.origin} → {truck.destinations[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('newJobs')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-center"
          >
            <Star size={32} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-sm font-bold">Yeni İşler</p>
          </button>
          <button
            onClick={() => setActiveTab('emptyTrucks')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-center"
          >
            <Truck size={32} className="mx-auto mb-2 text-orange-400" />
            <p className="text-sm font-bold">Boş Araç Ekle</p>
          </button>
          <button
            onClick={() => setShowAddCreditModal(true)}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-center"
          >
            <Coins size={32} className="mx-auto mb-2 text-green-400" />
            <p className="text-sm font-bold">Kredi Yükle</p>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-4 transition-all text-center"
          >
            <Settings size={32} className="mx-auto mb-2 text-purple-400" />
            <p className="text-sm font-bold">Ayarlar</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
     <div className="p-4 md:p-6 space-y-6">
        {/* Profil Özeti Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Firma Adı Kartı */}
           <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold opacity-80">Firma Adı</p>
                    <p className="text-lg font-black">Yılmaz Oto</p>
                 </div>
              </div>
           </div>

           {/* İletişim Kartı */}
           <div className="bg-slate-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold opacity-80">İletişim</p>
                    <p className="text-sm font-bold">+90 555 123 45 67</p>
                    <p className="text-xs opacity-80 truncate">info@yilmazoto.com</p>
                 </div>
              </div>
           </div>

           {/* Kredi Kartı */}
           <div className="bg-slate-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold opacity-80">Kredi Hakkı</p>
                    <p className="text-2xl font-black">{credits}</p>
                 </div>
              </div>
           </div>

           {/* Puan Kartı */}
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Star size={20} fill="currentColor" />
                 </div>
                 <div className="flex-1">
                    <p className="text-xs font-bold opacity-80">Firma Puanı</p>
                    <div className="flex items-center gap-2">
                       <p className="text-2xl font-black">4.9</p>
                       <div className="flex">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={12} fill={i < 5 ? "currentColor" : "none"} className="opacity-80" />
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Ana İçerik: Sidebar + Detay */}
        <div className="flex flex-col md:flex-row gap-6">
           {/* Sol Sidebar - Menü */}
           <div className="w-full md:w-64 shrink-0 space-y-1">
              {[
                 { id: 'profile', label: 'Firma Bilgileri', icon: Briefcase },
                 { id: 'notifications', label: 'Bildirim Ayarları', icon: Bell },
                 { id: 'security', label: 'Şifre Değiştir', icon: Lock },
                 { id: 'company', label: 'Şirket Bilgileri', icon: Building },
                 { id: 'vehicles', label: 'Araç Bilgileri', icon: Truck },
                 { id: 'contact', label: 'İletişim Bilgileri', icon: Phone },
                 { id: 'services', label: 'Hizmet Ayarları', icon: Wrench },
                 { id: 'documents', label: 'Belgeler', icon: FileCheck },
              ].map(item => (
                 <button 
                   key={item.id}
                   onClick={() => setSettingsSubTab(item.id as any)}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${settingsSubTab === item.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}
                 >
                    <item.icon size={18} /> {item.label}
                 </button>
              ))}
           </div>

           {/* Sağ İçerik Alanı */}
           <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
              {settingsSubTab === 'profile' && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-bold text-slate-800">Firma Profil Bilgileri</h2>
                       <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                          <CheckCircle2 size={16} /> Doğrulanmış
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                       <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shadow-md">
                          {companyLogo ? (
                            <img 
                              src={createPreviewUrl(companyLogo)} 
                              alt="Firma Logosu" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera size={32} className="text-slate-400" />
                          )}
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800 mb-1">Firma Logosu</h3>
                          <p className="text-sm text-slate-500 mb-3">Profesyonel bir görünüm için firma logonuzu yükleyin</p>
                          <label className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer inline-flex items-center gap-2">
                            {isCompressingLogo ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                İşleniyor...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Logo Yükle
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleLogoUpload}
                              disabled={isCompressingLogo}
                            />
                          </label>
                          <p className="text-xs text-slate-400 mt-2">PNG, JPG (Max. 2MB)</p>
                       </div>
                    </div>

                    {/* Profil Fotoğrafı Alanı */}
                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl border border-slate-200">
                       <div className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 overflow-hidden shadow-md">
                          {profilePhoto ? (
                            <img 
                              src={createPreviewUrl(profilePhoto)} 
                              alt="Profil Fotoğrafı" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={32} className="text-slate-400" />
                          )}
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-800 mb-1">Profil Fotoğrafı</h3>
                          <p className="text-sm text-slate-500 mb-3">Hesabınız için profil fotoğrafı ekleyin</p>
                          <label className="bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all cursor-pointer inline-flex items-center gap-2">
                            {isCompressingProfile ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                İşleniyor...
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Fotoğraf Yükle
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleProfilePhotoUpload}
                              disabled={isCompressingProfile}
                            />
                          </label>
                          <p className="text-xs text-slate-400 mt-2">PNG, JPG (Max. 2MB)</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Firma Adı *</label>
                          <input type="text" defaultValue="Yılmaz Oto Kurtarma Ltd. Şti." className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vergi/TC Numarası *</label>
                          <input type="text" defaultValue="1234567890" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-Posta Adresi *</label>
                          <input type="email" defaultValue="info@yilmazoto.com" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefon Numarası *</label>
                          <input type="tel" defaultValue="+90 555 123 45 67" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adres</label>
                          <textarea rows={3} defaultValue="Atatürk Cad. No: 123, Kadıköy / İstanbul" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                       <button className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all">İptal</button>
                       <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Check size={18} /> Değişiklikleri Kaydet
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'notifications' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Bildirim Tercihleri</h2>
                    <p className="text-sm text-slate-500">Hangi durumlarda bildirim almak istediğinizi seçin</p>

                    <div className="space-y-4">
                       {/* Yeni İş Bildirimleri */}
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-md">
                                   <Bell size={20} />
                                </div>
                                <div>
                                   <h3 className="font-bold text-slate-800">Yeni İş Talepleri</h3>
                                   <p className="text-xs text-slate-600">Konumunuza yakın yeni işler için anlık bildirim</p>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-3 ml-15">
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">Push Bildirimi</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                             </label>
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">SMS Bildirimi</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                             </label>
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">E-posta Bildirimi</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                             </label>
                          </div>
                       </div>

                       {/* Teklif Durumu */}
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-md">
                                   <CheckCircle2 size={20} />
                                </div>
                                <div>
                                   <h3 className="font-bold text-slate-800">Teklif Kabul/Red</h3>
                                   <p className="text-xs text-slate-600">Tekliflerinizin durumu değiştiğinde</p>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-3 ml-15">
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">Push Bildirimi</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                             </label>
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">SMS Bildirimi</span>
                                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-slate-600 focus:ring-slate-500" />
                             </label>
                          </div>
                       </div>

                       {/* Ödeme Bildirimleri */}
                       <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-md">
                                   <DollarSign size={20} />
                                </div>
                                <div>
                                   <h3 className="font-bold text-slate-800">Ödeme & Cüzdan</h3>
                                   <p className="text-xs text-slate-600">Ödeme alındığında veya kredi değişiminde</p>
                                </div>
                             </div>
                          </div>
                          <div className="space-y-3 ml-15">
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                <span className="text-sm font-bold text-slate-700">Push Bildirimi</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                             </label>
                             <label className="flex items-center justify-between p-3 bg-white rounded-xl cursor-pointer hover:bg-purple-50 transition-colors">
                                <span className="text-sm font-bold text-slate-700">E-posta Bildirimi</span>
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                             </label>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Check size={18} /> Tercihleri Kaydet
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'security' && (
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                          <Lock size={24} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-bold text-slate-800">Şifre Değiştir</h2>
                          <p className="text-sm text-slate-500">Hesap güvenliğiniz için düzenli olarak şifrenizi güncelleyin</p>
                       </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3 text-sm text-yellow-800">
                       <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                       <div>
                          <p className="font-bold mb-1">Güçlü Şifre Önerileri:</p>
                          <ul className="text-xs space-y-1 ml-4 list-disc">
                             <li>En az 8 karakter uzunluğunda olmalı</li>
                             <li>Büyük ve küçük harf içermeli</li>
                             <li>En az 1 rakam ve 1 özel karakter bulunmalı</li>
                          </ul>
                       </div>
                    </div>

                    <div className="space-y-4 max-w-md">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mevcut Şifre *</label>
                          <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yeni Şifre *</label>
                          <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yeni Şifre Tekrar *</label>
                          <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                       <button className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all">İptal</button>
                       <button className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center gap-2">
                          <Lock size={18} /> Şifreyi Güncelle
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'company' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Şirket Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticaret Sicil No</label>
                          <input type="text" placeholder="12345/6789" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mersis No</label>
                          <input type="text" placeholder="0123456789012345" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vergi Dairesi</label>
                          <input type="text" placeholder="Kadıköy" defaultValue="Kadıköy" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faaliyet Alanı</label>
                          <select className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                             <option>Oto Kurtarma & Yol Yardım</option>
                             <option>Çekici Hizmeti</option>
                             <option>Genel Araç Servisi</option>
                          </select>
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kuruluş Yılı</label>
                          <input type="number" placeholder="2015" defaultValue="2015" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Check size={18} /> Bilgileri Kaydet
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'vehicles' && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-bold text-slate-800">Araç Filosu Bilgileri</h2>
                       <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Plus size={16} /> Yeni Araç Ekle
                       </button>
                    </div>
                    <p className="text-sm text-slate-500">Filo yönetimi için "Filo Yönetimi" sekmesini kullanın. Burada sadece resmi kayıtlı araçlarınızı listeleyebilirsiniz.</p>
                    
                    <div className="space-y-3">
                       {MOCK_FLEET.map(vehicle => (
                          <div key={vehicle.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:shadow-md transition-all">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                   <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                      <Truck size={24} />
                                   </div>
                                   <div>
                                      <h3 className="font-bold text-slate-800">{vehicle.name}</h3>
                                      <p className="text-sm text-slate-500">{vehicle.plate}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${vehicle.status === 'active' ? 'bg-green-100 text-green-700' : vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {vehicle.status === 'active' ? 'Aktif' : vehicle.status === 'maintenance' ? 'Bakımda' : 'Pasif'}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                                <button className="text-blue-600 hover:text-blue-700 font-bold text-sm">Düzenle</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {settingsSubTab === 'contact' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">İletişim Bilgileri</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yetkili Kişi Adı *</label>
                          <input type="text" defaultValue="Ahmet Yılmaz" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cep Telefonu *</label>
                          <input type="tel" defaultValue="+90 555 123 45 67" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sabit Telefon</label>
                          <input type="tel" placeholder="+90 216 XXX XX XX" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acil Durum Telefonu</label>
                          <input type="tel" placeholder="+90 5XX XXX XX XX" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-posta Adresi *</label>
                          <input type="email" defaultValue="info@yilmazoto.com" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">İş Yeri Adresi *</label>
                          <textarea rows={3} defaultValue="Atatürk Cad. No: 123, Kadıköy / İstanbul" className="w-full p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Check size={18} /> Bilgileri Kaydet
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'services' && (
                 <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Hizmet Ayarları</h2>
                    <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex gap-3 text-sm text-yellow-800">
                       <AlertTriangle className="shrink-0" size={20} />
                       <p>Burada belirlediğiniz taban fiyatlar müşteriye gösterilen "Başlangıç Fiyatı"dır. Kesin fiyat teklif sırasında belirlenir.</p>
                    </div>
                    <div className="space-y-4">
                       {['Oto Çekici', 'Akü Takviye', 'Lastik Değişimi', 'Yakıt İkmali', 'Oto Çilingir'].map(srv => (
                          <div key={srv} className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-all">
                             <div className="flex items-center gap-3">
                                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="font-bold text-slate-700">{srv}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                       <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
                          <Check size={18} /> Ayarları Kaydet
                       </button>
                    </div>
                 </div>
              )}

              {settingsSubTab === 'documents' && (
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h2 className="text-2xl font-bold text-slate-800">Belgeler & Dökümanlar</h2>
                       <button 
                          onClick={() => setShowDocumentUploadModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                       >
                          <Upload size={16} /> Belge Yükle
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Ticari Sicil */}
                       <div 
                          onClick={() => {
                            setSelectedDocumentDetail({
                              title: 'Ticaret Sicil Belgesi',
                              type: 'trade_registry',
                              status: 'uploaded',
                              uploadDate: '15.01.2024',
                              fileName: 'ticaret_sicil_2024.pdf',
                              fileSize: '2.1 MB'
                            });
                            setShowDocumentDetailModal(true);
                          }}
                          className="p-5 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                       >
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <FileCheck size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-800">Ticaret Sicil Belgesi</h3>
                                <p className="text-xs text-slate-500">PDF, JPG (Max. 5MB)</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                             <CheckCircle2 size={16} className="text-green-600" />
                             <span className="text-xs font-bold text-green-600">Yüklendi (15.01.2024)</span>
                          </div>
                       </div>

                       {/* İmza Sirküleri */}
                       <div 
                          onClick={() => {
                            setSelectedDocumentDetail({
                              title: 'İmza Sirküleri',
                              type: 'signature',
                              status: 'not_uploaded'
                            });
                            setShowDocumentDetailModal(true);
                          }}
                          className="p-5 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                       >
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                <FileCheck size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-800">İmza Sirküleri</h3>
                                <p className="text-xs text-slate-500">PDF, JPG (Max. 5MB)</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                             <Upload size={16} className="text-slate-400" />
                             <span className="text-xs font-bold text-slate-400">Henüz yüklenmedi</span>
                          </div>
                       </div>

                       {/* Araç Ruhsatları */}
                       <div 
                          onClick={() => {
                            setSelectedDocumentDetail({
                              title: 'Araç Ruhsatları',
                              type: 'vehicle_registration',
                              status: 'uploaded',
                              count: 2,
                              uploadDate: '10.02.2024'
                            });
                            setShowDocumentDetailModal(true);
                          }}
                          className="p-5 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                       >
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                                <Truck size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-800">Araç Ruhsatları</h3>
                                <p className="text-xs text-slate-500">Her araç için ayrı</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                             <CheckCircle2 size={16} className="text-green-600" />
                             <span className="text-xs font-bold text-green-600">2 Belge Yüklendi</span>
                          </div>
                       </div>

                       {/* Sigorta Poliçesi */}
                       <div 
                          onClick={() => {
                            setSelectedDocumentDetail({
                              title: 'Sorumluluk Sigortası',
                              type: 'insurance',
                              status: 'uploaded',
                              uploadDate: '05.01.2024',
                              expiryDate: '31.12.2025',
                              fileName: 'sigorta_policesi_2024.pdf',
                              fileSize: '1.5 MB'
                            });
                            setShowDocumentDetailModal(true);
                          }}
                          className="p-5 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                       >
                          <div className="flex items-center gap-3 mb-2">
                             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                <ShieldCheck size={20} />
                             </div>
                             <div>
                                <h3 className="font-bold text-slate-800">Sorumluluk Sigortası</h3>
                                <p className="text-xs text-slate-500">Aktif poliçe gerekli</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                             <CheckCircle2 size={16} className="text-green-600" />
                             <span className="text-xs font-bold text-green-600">Geçerli (31.12.2025)</span>
                          </div>
                       </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                       <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                          <Info size={18} /> Önemli Bilgi
                       </h3>
                       <p className="text-sm text-blue-700">Tüm belgelerinizin güncel ve okunaklı olduğundan emin olun. Eksik belge durumunda hesabınız askıya alınabilir.</p>
                    </div>
                 </div>
              )}
           </div>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-20 lg:w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 transition-all duration-300 sticky top-0 h-screen z-30 overflow-y-auto">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
            <img src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/yolmov-logo-cutter-beyaz.png" alt="Yolmov Partner" className="hidden lg:block h-8 w-auto object-contain" />
            <img src="https://raw.githubusercontent.com/yosoyorhan/repo2/refs/heads/main/yolmov-icon-beyaz-removebg-preview.png" alt="Yolmov Icon" className="lg:hidden h-8 w-auto object-contain" />
          </div>

          <nav className="mt-8 px-2 space-y-2 pb-4">
            {[
              { id: 'home', label: 'Ana Sayfa', icon: LayoutDashboard },
              { id: 'requests', label: 'İş Talepleri', icon: Bell },
              { id: 'active', label: 'Aktif Görev', icon: Navigation },
              { id: 'emptyTrucks', label: 'Boş Dönen Araçlar', icon: Truck },
              { id: 'offer_history', label: 'Teklif Geçmişim', icon: FileText },
              { id: 'payments', label: 'Ödemeler', icon: Receipt },
              { id: 'documents', label: 'Belgelerim', icon: FileCheck },
              { id: 'history', label: 'Geçmiş İşler', icon: History },
              { id: 'reviews', label: 'Değerlendirmeler', icon: Star },
              { id: 'wallet', label: 'Finansal Durum', icon: Wallet },
              { id: 'fleet', label: 'Filo Yönetimi', icon: Truck },
              { id: 'support', label: 'Destek Merkezi', icon: Headphones },
              { id: 'settings', label: 'Ayarlar', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon size={20} />
                <span className="hidden lg:block ml-3 font-medium">{item.label}</span>
                {item.id === 'requests' && requests.length > 0 && <span className="hidden lg:flex ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{requests.length}</span>}
                {item.id === 'active' && activeJob && <span className="hidden lg:flex ml-auto w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>}
              </button>
            ))}
          </nav>
        </div>
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-xl p-2 lg:p-3 mb-4 border border-slate-700 flex flex-col items-center lg:block">
            <div className="hidden lg:block">
                <p className="text-xs text-slate-400 mb-1">Bakiye</p>
                <div className="flex items-center justify-between"><span className="text-lg font-bold text-white flex items-center gap-2"><Coins size={16} className="text-yellow-400" /> {credits} Kredi</span><button onClick={() => setShowAddCreditModal(true)} className="text-xs bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-500 transition-colors">Yükle</button></div>
            </div>
            <div className="lg:hidden flex flex-col items-center gap-1">
                <div className="p-1.5 bg-slate-700 rounded-full text-yellow-400"><Coins size={16} /></div>
                <span className="text-[10px] font-bold text-white text-center leading-tight">{credits} Kr</span>
                <button onClick={() => setShowAddCreditModal(true)} className="w-full py-1 bg-blue-600 text-[10px] rounded text-white font-bold leading-none flex items-center justify-center">+</button>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('settings');
              setSettingsSubTab('profile');
            }}
            className="w-full text-left flex items-center gap-3 mb-4 px-2 justify-center lg:justify-start hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 shrink-0"><img src="https://i.pravatar.cc/150?img=11" alt="Profile" /></div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold truncate">Yılmaz Oto Kurtarma</p>
              <div className="flex items-center text-xs text-yellow-500">
                <span>★ 4.9</span><span className="text-slate-500 ml-1">(128 İş)</span>
              </div>
            </div>
          </button>
          <button onClick={onLogout} className="w-full flex items-center justify-center lg:justify-start p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={18} /><span className="hidden lg:block ml-2 text-sm font-medium">Çıkış Yap</span></button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOP HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-20">
          <h1 className="text-lg lg:text-xl font-bold text-slate-800 flex items-center gap-2 lg:gap-3 truncate">
            {activeTab === 'home' && 'Dashboard Ana Sayfa'}
            {activeTab === 'newJobs' && 'Yeni İş Talepleri'}
            {activeTab === 'requests' && 'İş Talepleri'}
            {activeTab === 'active' && 'Aktif Operasyon'}
            {activeTab === 'emptyTrucks' && 'Boş Dönen Araçlar'}
            {activeTab === 'offer_history' && 'Teklif Geçmişim'}
            {activeTab === 'payments' && 'Ödemeler & Komisyon'}
            {activeTab === 'documents' && 'Belgelerim'}
            {activeTab === 'wallet' && 'Finansal Durum'}
            {activeTab === 'history' && 'İş Geçmişi'}
            {activeTab === 'reviews' && 'Müşteri Değerlendirmeleri'}
            {activeTab === 'settings' && 'Hesap Ayarları'}
            {activeTab === 'fleet' && 'Filo Yönetimi'}
            {activeTab === 'support' && 'Destek Merkezi'}
            {activeTab === 'service_routes' && 'Hizmet Rotaları'}
          </h1>
          <div className="flex items-center gap-4 shrink-0">
            <div className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 rounded-full border transition-colors ${isOnline ? 'bg-green-50 border-green-200' : 'bg-slate-100 border-slate-200'}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span className={`text-xs lg:text-sm font-bold ${isOnline ? 'text-green-700' : 'text-slate-500'}`}>
                <span className="hidden sm:inline">{isOnline ? 'Müsaitsiniz' : 'Meşgulsünüz'}</span>
                <span className="sm:hidden">{isOnline ? 'Aktif' : 'Pasif'}</span>
              </span>
              <button onClick={() => setIsOnline(!isOnline)} className="ml-1 lg:ml-2 text-xs underline text-slate-500 hover:text-slate-800">Değiştir</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-0 lg:p-6 relative">
          {/* Render Content Based on Active Tab */}
          {activeTab === 'home' && renderHomeTab()}
          {activeTab === 'requests' && renderNewJobsTab()}
          {activeTab === 'newJobs' && renderNewJobsTab()}
          {activeTab === 'emptyTrucks' && renderEmptyTrucksTab()}
          {activeTab === 'active' && (
            <div className="h-full flex flex-col lg:flex-row">
               {activeJob ? (
                 <>
                  <div className="flex-1 bg-slate-900 relative overflow-hidden min-h-[400px]">
                     <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-0"><path d="M 200 150 Q 400 100 600 300 T 900 400" fill="none" stroke="#3B82F6" strokeWidth="6" strokeDasharray="10 5" className="animate-pulse" /><circle cx="200" cy="150" r="80" fill="#3B82F6" fillOpacity="0.1" className="animate-ping" /></svg>
                     <div className="absolute top-[150px] left-[200px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"><div className="w-12 h-12 bg-blue-600 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center text-white z-10"><Navigation size={20} fill="currentColor" /></div><div className="bg-slate-900 text-white text-xs px-2 py-1 rounded mt-2 font-bold">Siz</div></div>
                     <div className="absolute top-[300px] left-[600px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"><div className="w-10 h-10 bg-orange-500 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center text-white z-10"><User size={18} fill="currentColor" /></div><div className="bg-slate-900 text-white text-xs px-2 py-1 rounded mt-2 font-bold">{activeJob.customerName}</div></div>
                     {activeJob.dropoffLocation && (<div className="absolute top-[400px] left-[900px] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"><div className="w-10 h-10 bg-green-500 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center text-white z-10"><MapPin size={18} fill="currentColor" /></div><div className="bg-slate-900 text-white text-xs px-2 py-1 rounded mt-2 font-bold">Varış</div></div>)}
                  </div>
                  <div className="w-full lg:w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-2xl z-20">
                     <div className="p-6 border-b border-slate-100"><div className="flex justify-between items-start mb-2"><h2 className="text-xl font-bold text-slate-900">{activeJob.serviceType}</h2><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">#{activeJob.id}</span></div><p className="text-sm text-slate-500">{activeJob.location} {activeJob.dropoffLocation && `➔ ${activeJob.dropoffLocation}`}</p></div>
                     <div className="p-6 bg-blue-50 border-y border-blue-100"><div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm">{activeJob.customerName.charAt(0)}</div><div><h3 className="font-bold text-slate-900">{activeJob.customerName}</h3><p className="text-sm text-slate-500">{activeJob.vehicleInfo}</p></div></div><div className="grid grid-cols-2 gap-3"><button className="flex items-center justify-center gap-2 bg-white py-3 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><Phone size={16} className="text-green-600" /> Ara</button><button className="flex items-center justify-center gap-2 bg-white py-3 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><MessageSquare size={16} className="text-blue-600" /> Mesaj</button></div></div>
                     <div className="flex-1 p-6 overflow-y-auto">
                        <div className="relative space-y-8 pl-6 border-l-2 border-slate-100 ml-3 mb-8">{[{ id: 0, label: 'Kabul Edildi', time: '10:30' }, { id: 1, label: 'Yola Çıkıldı', time: jobStage >= 1 ? '10:32' : '-' }, { id: 2, label: 'Konuma Varıldı', time: jobStage >= 2 ? '10:45' : '-' }, { id: 3, label: 'Hizmet Tamamlandı', time: jobStage >= 3 ? '11:15' : '-' }].map((step) => (<div key={step.id} className="relative"><div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-[3px] border-white shadow-sm transition-colors ${jobStage >= step.id ? 'bg-green-500' : 'bg-slate-200'}`}></div><div className="flex justify-between items-center"><p className={`text-sm font-bold ${jobStage >= step.id ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p><span className="text-xs text-slate-400">{step.time}</span></div></div>))}</div>
                        
                        {jobStage === 2 && !hasStartProof && (
                          <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-dashed border-orange-300 text-center animate-pulse">
                            <Camera className="mx-auto text-orange-400 mb-2" size={24} />
                            <p className="text-sm font-bold text-orange-700 mb-1">Başlangıç Fotoğrafı Zorunlu</p>
                            <p className="text-xs text-orange-600 mb-3">Hizmete başlamadan önce aracın durumunu belgeleyin.</p>
                            {isCompressingImage ? (
                              <div className="flex items-center justify-center gap-2 text-orange-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-bold">İşleniyor...</span>
                              </div>
                            ) : (
                              <label className="inline-block bg-white border border-orange-200 text-orange-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-50 shadow-sm cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => handleImageUpload(e, 'start')}
                                  className="hidden"
                                />
                                <Camera size={14} className="inline mr-1" /> Fotoğraf Çek / Yükle
                              </label>
                            )}
                          </div>
                        )}
                        
                        {jobStage === 3 && !hasEndProof && (
                          <div className="mb-6 bg-green-50 p-4 rounded-xl border border-dashed border-green-300 text-center animate-pulse">
                            <Camera className="mx-auto text-green-400 mb-2" size={24} />
                            <p className="text-sm font-bold text-green-700 mb-1">Hizmet Kanıtı Zorunlu</p>
                            <p className="text-xs text-green-600 mb-3">Tamamlamadan önce bitmiş işin fotoğrafını yükleyin.</p>
                            {isCompressingImage ? (
                              <div className="flex items-center justify-center gap-2 text-green-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-bold">İşleniyor...</span>
                              </div>
                            ) : (
                              <label className="inline-block bg-white border border-green-200 text-green-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-50 shadow-sm cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => handleImageUpload(e, 'end')}
                                  className="hidden"
                                />
                                <Camera size={14} className="inline mr-1" /> Fotoğraf Çek / Yükle
                              </label>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-auto"><button onClick={advanceJobStage} className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${jobStage === 0 ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : jobStage === 1 ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : jobStage === 2 ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}`}>{getStageLabel()} <ArrowRight size={20} /></button><button onClick={() => setActiveJob(null)} className="w-full mt-3 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">Acil Durum / İptal</button></div>
                     </div>
                  </div>
                 </>
               ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-white"><div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><Navigation size={40} className="text-slate-300" /></div><h2 className="text-2xl font-bold text-slate-700">Aktif Görev Bulunamadı</h2><p className="text-slate-400 mt-2 mb-8">Lütfen talep havuzundan bir iş kabul edin.</p><button onClick={() => setActiveTab('requests')} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">İş Listesine Dön</button></div>
               )}
            </div>
          )}
          {activeTab === 'offer_history' && <PartnerOfferHistory />}
          {activeTab === 'payments' && <PartnerPayments />}
          {activeTab === 'documents' && <PartnerDocuments />}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'wallet' && renderWalletTab()}
          {activeTab === 'settings' && renderSettingsTab()}
          {activeTab === 'fleet' && renderFleetTab()}
          {activeTab === 'support' && renderSupportTab()}
        </main>
      </div>
      <AnimatePresence>{showAddCreditModal && renderAddCreditModal()}</AnimatePresence>
      <AnimatePresence>{selectedJobForQuote && renderQuoteModal()}</AnimatePresence>
      <AnimatePresence>{selectedRequestForOffer && renderCustomerOfferModal()}</AnimatePresence>
      <AnimatePresence>{showRatingModal && renderRatingModal()}</AnimatePresence>
      <AnimatePresence>{selectedJobForDetail && renderJobDetailModal()}</AnimatePresence>
      <AnimatePresence>{showNavigationModal && renderNavigationModal()}</AnimatePresence>
      <AnimatePresence>{showDocumentUploadModal && renderDocumentUploadModal()}</AnimatePresence>
      <AnimatePresence>{showDocumentDetailModal && renderDocumentDetailModal()}</AnimatePresence>
    </div>
  );
};

export default PartnerDashboard;
