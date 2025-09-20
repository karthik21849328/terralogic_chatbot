import React, { useEffect, useRef, useState } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Star, 
  Phone, 
  Zap, 
  Wrench, 
  Paintbrush, 
  Hammer, 
  Shield, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Smartphone, 
  PlayCircle,
  MapPin,
  Award,
  Users,
  TrendingUp,
  Home,
  Sparkles,
  Calendar,
  HeadphonesIcon,
  Sun,
  Moon,
  Menu,
  X,
  Search
} from 'lucide-react';

function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [idToken, setIdToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; email?: string; picture?: string } | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState<boolean>(false);
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);
  // Service Provider Request state
  const [spModalOpen, setSpModalOpen] = useState<boolean>(false);
  const [spSubmitting, setSpSubmitting] = useState<boolean>(false);
  const [spError, setSpError] = useState<string | null>(null);
  const [spSuccess, setSpSuccess] = useState<string | null>(null);
  const [spData, setSpData] = useState({
    services: [] as string[],
    contactNumber: '',
    serviceCity: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    selfieDataUrl: '',
    aadharDataUrl: '',
    panDataUrl: '',
  });
  const [spStatus, setSpStatus] = useState<any>(null);
  const [spLoadingStatus, setSpLoadingStatus] = useState<boolean>(false);
  // My Services state
  const [myServices, setMyServices] = useState<any[]>([]);
  const [myServicesLoading, setMyServicesLoading] = useState<boolean>(false);
  const [myServicesError, setMyServicesError] = useState<string | null>(null);
  const [myServicesFilter, setMyServicesFilter] = useState<'all' | 'requested' | 'ongoing' | 'completed'>('all');
  // Career filters state
  const [jobFilters, setJobFilters] = useState({
    department: 'all',
    location: 'all',
    experience: 'all',
    type: 'all',
    search: ''
  });
  
  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hi! I\'m your Servecure assistant. I can help you with information about our services, job opportunities, and general questions. How can I help you today?',
      timestamp: new Date(),
      intent: 'general',
      sources: []
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState(null);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  // booking form service is stored within bookingForm state
  const [bookingForm, setBookingForm] = useState({
    phone: "",
    address: "",
    instruction: "",
    service: "",
    serviceType: "",
    date: "",
    time: ""
  });
  const [isExpertRegistrationModalOpen, setIsExpertRegistrationModalOpen] = useState(false);
  const [expertRegistrationForm, setExpertRegistrationForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceCategory: "",
    experience: "",
    address: "",
    idProof: "",
    idNumber: "",
    availability: "",
    hourlyRate: ""
  });

  // Constants
  const GOOGLE_CLIENT_ID_RAW = '@http://624938212031-sfsp8d13p2453s7slagh63g1n6c59067.apps.googleusercontent.com';
  const GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID_RAW.replace(/^@/, '').replace(/^https?:\/\//, '');
  const CREATE_USER_API = 'https://0ek3p4mqyl.execute-api.ap-southeast-2.amazonaws.com/default/sc02';
  const FETCH_USER_API = 'https://0ek3p4mqyl.execute-api.ap-southeast-2.amazonaws.com/default/sc02?fetchuserdetails=true';
  const SP_BASE_API = 'https://7c2awsljvh.execute-api.ap-southeast-2.amazonaws.com/default/sc03';
  const BOOK_SERVICE_API = 'https://ysaobp9yy4.execute-api.ap-southeast-2.amazonaws.com/default/sc004';
  const MY_SERVICES_API = 'https://ysaobp9yy4.execute-api.ap-southeast-2.amazonaws.com/default/sc004';

  // Auth token helper (extract token from logged-in session)
  const getAuthToken = (): string => {
    return localStorage.getItem('auth:apiToken') || idToken || '';
  };

  // Simple hash-based routing
  const getRouteFromHash = (): 'home' | 'profile' | 'my-services' | 'careers' => {
    const h = window.location.hash.replace('#', '');
    if (h.startsWith('/profile')) return 'profile';
    if (h.startsWith('/my-services')) return 'my-services';
    if (h.startsWith('/careers')) return 'careers';
    return 'home';
  };
  const [route, setRoute] = useState<'home' | 'profile' | 'my-services' | 'careers'>(() => {
    if (typeof window === 'undefined') return 'home';
    return getRouteFromHash();
  });

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goToProfile = () => { window.location.hash = '/profile'; };
  const goToMyServices = () => { window.location.hash = '/my-services'; };
  const goToCareers = () => { window.location.hash = '/careers'; };
  const goHome = () => { window.location.hash = '/'; };

  // Chatbot functions
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setChatError(null);
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    setChatError(null);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          user_id: idToken ? userProfile?.email : 'anonymous',
          session_id: `session_${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: data.response,
        timestamp: new Date(),
        intent: data.intent,
        sources: data.sources || [],
        suggestedActions: data.suggested_actions || []
      };

      setChatMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: 'I apologize, but I\'m having trouble connecting to my backend right now. Please make sure the Python backend is running (python start_server.py) or try asking your question again in a moment.',
        timestamp: new Date(),
        intent: 'error',
        sources: []
      };

      setChatMessages(prev => [...prev, errorMessage]);
      setChatError('Connection failed. Make sure backend is running on port 8000.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendChatMessage(chatInput);
  };

  const handleSuggestedAction = (action: string) => {
    if (action.includes('job') || action.includes('career')) {
      goToCareers();
      setIsChatOpen(false);
    } else if (action.includes('service')) {
      // Scroll to services section
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      setIsChatOpen(false);
    } else if (action.includes('contact') || action.includes('support')) {
      // You can add contact modal or scroll to footer
      document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
      setIsChatOpen(false);
    }
  };

  // Helpers
  const decodeJwtPayload = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const persistAuth = (token: string, profile: any, serverToken?: string) => {
    localStorage.setItem('auth:idToken', token);
    localStorage.setItem('auth:profile', JSON.stringify(profile || {}));
    if (serverToken) localStorage.setItem('auth:apiToken', serverToken);
  };

  const clearAuth = () => {
    localStorage.removeItem('auth:idToken');
    localStorage.removeItem('auth:profile');
    localStorage.removeItem('auth:apiToken');
  };

  // Load persisted auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth:idToken');
    const storedProfile = localStorage.getItem('auth:profile');
    if (storedToken) setIdToken(storedToken);
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
  }, []);

  // Capture public IP
  useEffect(() => {
    const loadIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setIpAddress(data?.ip || '');
      } catch (e) {
        setIpAddress('');
      }
    };
    loadIp();
  }, []);

  // Initialize Google button when auth modal opens
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const google = (window as any).google;
    if (!google || !google.accounts || !google.accounts.id) return;
    try {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          const credential: string | undefined = response?.credential;
          if (!credential) return;
          const payload = decodeJwtPayload(credential) || {};
          const profile = { name: payload?.name, email: payload?.email, picture: payload?.picture };
          setIdToken(credential);
          setUserProfile(profile);
          setIsAuthModalOpen(false);

          // Create user on backend
          try {
            const resp = await fetch(CREATE_USER_API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ auth: credential, ip_address: ipAddress || '' }),
            });
            const data = await resp.json().catch(() => ({}));
            const serverToken = (data?.token as string) || (data?.apiToken as string) || '';
            persistAuth(credential, profile, serverToken);
          } catch (err) {
            persistAuth(credential, profile);
          }
        },
        ux_mode: 'popup',
        auto_select: false,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = '';
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: isDarkMode ? 'filled_black' : 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
          text: 'signin_with',
          logo_alignment: 'left',
        });
      }
    } catch (e) {}
  }, [isAuthModalOpen, isDarkMode, GOOGLE_CLIENT_ID, ipAddress]);

  // Fetch user details for profile page
  useEffect(() => {
    const shouldFetch = route === 'profile' && !!idToken;
    if (!shouldFetch) return;
    setIsLoadingUserDetails(true);
    setUserDetailsError(null);
    const authHeaderToken = getAuthToken();
    fetch(FETCH_USER_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authHeaderToken}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data && (data.message || data.error)) || 'Failed to fetch user');
        }
        setUserDetails(data || null);
      })
      .catch((err) => {
        setUserDetailsError(err?.message || 'Failed to load user');
      })
      .finally(() => setIsLoadingUserDetails(false));
  }, [route, idToken]);

  const formatDateTime = (iso?: string): string => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString();
    } catch {
      return iso || '';
    }
  };

  // Load My Services when on route
  useEffect(() => {
    if (route !== 'my-services' || !idToken) return;
    setMyServicesLoading(true);
    setMyServicesError(null);
    const token = getAuthToken();
    fetch(MY_SERVICES_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Failed to load services');
        setMyServices(Array.isArray(data) ? data : []);
      })
      .catch((err) => setMyServicesError(err?.message || 'Failed to load services'))
      .finally(() => setMyServicesLoading(false));
  }, [route, idToken]);

  // Load Service Provider Request status
  useEffect(() => {
    const shouldFetch = route === 'profile' && !!idToken;
    if (!shouldFetch) return;
    setSpLoadingStatus(true);
    setSpStatus(null);
    const token = getAuthToken();
    fetch(SP_BASE_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Failed to fetch');
        setSpStatus(data || null);
      })
      .catch(() => {})
      .finally(() => setSpLoadingStatus(false));
  }, [route, idToken]);

  const availableServices = [
    'Plumber',
    'Electrician',
    'Painter',
    'AC',
    'Washing machine',
    'Gyser',
    'Pvc & wallpaper',
    'Carpentering',
  ];

  const handleSpCheckbox = (service: string) => {
    setSpData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists ? prev.services.filter((s) => s !== service) : [...prev.services, service],
      };
    });
  };

  const handleSpInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpData((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSpFileChange = async (e: React.ChangeEvent<HTMLInputElement>, key: 'selfieDataUrl' | 'aadharDataUrl' | 'panDataUrl') => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file).catch(() => '');
    if (!dataUrl) return;
    setSpData((prev) => ({ ...prev, [key]: dataUrl }));
  };

  const submitServiceProviderRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSpSubmitting(true);
    setSpError(null);
    setSpSuccess(null);
    try {
      const token = getAuthToken();
      // Build services map: service 1, service 2, ...
      const servicesMap: Record<string, string> = {};
      spData.services.forEach((s, idx) => {
        servicesMap[`service ${idx + 1}`] = s.toLowerCase();
      });
      const body = {
        selfie: spData.selfieDataUrl || 'selfie_image_url',
        aadhar_card: spData.aadharDataUrl || 'aadhar_card_image_url',
        pan_card: spData.panDataUrl || 'pan_card_image_url',
        account_details: {
          'account holder name': spData.accountHolderName,
          'account number': spData.accountNumber,
          'ifsc code': spData.ifscCode,
        },
        services: servicesMap,
        metadata: {
          'contact  number': spData.contactNumber,
          'service city ': spData.serviceCity,
        },
      };

      const resp = await fetch(SP_BASE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error((data && (data.message || data.error)) || 'Failed to submit');
      setSpSuccess('Request submitted successfully.');
      setSpModalOpen(false);
      // Refresh status
      setSpLoadingStatus(true);
      fetch(SP_BASE_API, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json().catch(() => ({})))
        .then((d) => setSpStatus(d || null))
        .finally(() => setSpLoadingStatus(false));
    } catch (err: any) {
      setSpError(err?.message || 'Failed to submit');
    } finally {
      setSpSubmitting(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openBookingModal = (service?: string) => {
    const svc = service || '';
    const types = getServiceTypesFor(svc);
    setBookingError(null);
    setBookingSuccess(null);
    setBookingForm(prev => ({ ...prev, service: svc, serviceType: types[0] || '' }));
    setIsBookingModalOpen(true);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);

  const handleLogout = () => {
    setIdToken(null);
    setUserProfile(null);
    clearAuth();
    const g = (window as any).google;
    if (g && g.accounts && g.accounts.id) {
      try { g.accounts.id.disableAutoSelect(); } catch (e) {}
    }
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingForm({
      phone: "",
      address: "",
      instruction: "",
      service: "",
      serviceType: "",
      date: "",
      time: ""
    });
  };

  const getServiceTypesFor = (serviceTitle: string): string[] => {
    const svc = services.find((s) => s.title.toLowerCase() === (serviceTitle || '').toLowerCase());
    return svc ? svc.subServices : [];
  };

  const formatRequestedSlot = (date: string, time: string): string => {
    if (!date || !time) return '';
    const [hourMin, ampm] = time.split(' ');
    let [hh, mm] = hourMin.split(':').map(Number);
    if (ampm?.toUpperCase() === 'PM' && hh < 12) hh += 12;
    if (ampm?.toUpperCase() === 'AM' && hh === 12) hh = 0;
    const hhStr = String(hh).padStart(2, '0');
    const mmStr = String(mm || 0).padStart(2, '0');
    return `${date} ${hhStr}:${mmStr}:00`;
  };

  const extractServiceCost = (serviceTitle: string): string => {
    const svc = services.find((s) => s.title.toLowerCase() === (serviceTitle || '').toLowerCase());
    const priceText = svc?.startingPrice || '';
    const digits = priceText.replace(/[^0-9]/g, '');
    return digits || '100';
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      setIsAuthModalOpen(true);
      return;
    }
    setBookingSubmitting(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const token = getAuthToken();
      const requested_slot = formatRequestedSlot(bookingForm.date, bookingForm.time);
      const body = {
        category: (bookingForm.service || '').toLowerCase(),
        service_type: bookingForm.serviceType || '',
        requested_slot,
        service_cost: extractServiceCost(bookingForm.service),
        metadata: {
          instruction: bookingForm.instruction || '',
          'phone number': bookingForm.phone || '',
          address: bookingForm.address || '',
        },
      };
      const resp = await fetch(BOOK_SERVICE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error((data && (data.message || data.error)) || 'Failed to book service');
      setBookingSuccess('Your service request has been submitted.');
      closeBookingModal();
    } catch (err: any) {
      setBookingError(err?.message || 'Failed to book service');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const openExpertRegistrationModal = () => {
    setIsExpertRegistrationModalOpen(true);
  };

  const closeExpertRegistrationModal = () => {
    setIsExpertRegistrationModalOpen(false);
    setExpertRegistrationForm({
      fullName: "",
      phone: "",
      email: "",
      serviceCategory: "",
      experience: "",
      address: "",
      idProof: "",
      idNumber: "",
      availability: "",
      hourlyRate: ""
    });
  };

  const handleExpertRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the expert registration data to your backend
    alert(`Expert registration submitted for ${expertRegistrationForm.fullName}! We'll contact you at ${expertRegistrationForm.phone} within 24 hours to verify your documents and complete the onboarding process.`);
    closeExpertRegistrationModal();
  };

  const handleExpertInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setExpertRegistrationForm(prev => ({ ...prev, [name]: value }));
  };

  const services = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Electrician",
      subServices: ["Fan Installation", "Light Fixture", "Wiring Repair", "Switch Installation"],
      startingPrice: "₹299",
      image: "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2"
    },
    {
      icon: <Wrench className="w-8 h-8 text-blue-500" />,
      title: "Plumber",
      subServices: ["RO Repair", "Pipe Leakage", "Faucet Installation", "Toilet Repair"],
      startingPrice: "₹399",
      image: "/download.jpeg"
    },
    {
      icon: <Paintbrush className="w-8 h-8 text-purple-500" />,
      title: "Painter",
      subServices: ["Wall Painting", "Ceiling Paint", "Texture Paint", "Wood Polish"],
      startingPrice: "₹499",
      image: "https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2"
    },
    {
      icon: <Hammer className="w-8 h-8 text-orange-500" />,
      title: "Carpenter",
      subServices: ["Furniture Repair", "Door Installation", "Cabinet Making", "Shelving"],
      startingPrice: "₹349",
      image: "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      title: "House Cleaning",
      subServices: ["Deep Cleaning", "Regular Cleaning", "Kitchen Cleaning", "Bathroom Cleaning"],
      startingPrice: "₹199",
      image: "https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2"
    },
    {
      icon: <Home className="w-8 h-8 text-green-500" />,
      title: "AC Service",
      subServices: ["AC Installation", "AC Repair", "AC Cleaning", "Gas Refill"],
      startingPrice: "₹449",
      image: "https://images.pexels.com/photos/8005394/pexels-photo-8005394.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=2"
    }
  ];

  const jobListings = [
    {
      id: "JOB001",
      title: "Senior Full Stack Developer",
      department: "Engineering",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹12-18 LPA",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      description: "We are looking for a Senior Full Stack Developer to join our engineering team. You will be responsible for developing and maintaining our core platform, working with modern technologies like React, Node.js, and cloud services.",
      requirements: [
        "3+ years of experience in full-stack development",
        "Proficiency in React, Node.js, and databases",
        "Experience with cloud platforms (AWS/Azure)",
        "Strong problem-solving skills",
        "Experience with agile methodologies"
      ],
      responsibilities: [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
        "Participate in code reviews",
        "Optimize applications for performance"
      ],
      postedDate: "2024-01-15",
      isRemote: false
    },
    {
      id: "JOB002",
      title: "Product Manager",
      department: "Product",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹15-22 LPA",
      skills: ["Product Strategy", "Analytics", "User Research", "Agile"],
      description: "Join our product team to drive the strategy and development of our service marketplace platform. You'll work closely with engineering, design, and business teams to deliver exceptional user experiences.",
      requirements: [
        "4+ years of product management experience",
        "Experience with B2C marketplaces",
        "Strong analytical and problem-solving skills",
        "Excellent communication skills",
        "Experience with data-driven decision making"
      ],
      responsibilities: [
        "Define product roadmap and strategy",
        "Collaborate with engineering and design teams",
        "Conduct user research and analysis",
        "Monitor product metrics and KPIs",
        "Manage product launches"
      ],
      postedDate: "2024-01-10",
      isRemote: true
    },
    {
      id: "JOB003",
      title: "UX/UI Designer",
      department: "Design",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹8-12 LPA",
      skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
      description: "We're seeking a talented UX/UI Designer to create intuitive and engaging user experiences for our service platform. You'll work on designing user flows, interfaces, and interactive prototypes.",
      requirements: [
        "2+ years of UX/UI design experience",
        "Proficiency in Figma and design tools",
        "Strong portfolio showcasing design work",
        "Understanding of user-centered design principles",
        "Experience with responsive design"
      ],
      responsibilities: [
        "Create user interface designs and prototypes",
        "Conduct user research and usability testing",
        "Collaborate with product and engineering teams",
        "Maintain design systems and guidelines",
        "Present design concepts to stakeholders"
      ],
      postedDate: "2024-01-08",
      isRemote: false
    },
    {
      id: "JOB004",
      title: "Data Scientist",
      department: "Data & Analytics",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹14-20 LPA",
      skills: ["Python", "Machine Learning", "SQL", "Statistics"],
      description: "Join our data team to build machine learning models and analytics solutions that power our recommendation systems and business intelligence.",
      requirements: [
        "3+ years of data science experience",
        "Strong programming skills in Python/R",
        "Experience with ML frameworks (TensorFlow, PyTorch)",
        "Knowledge of statistical analysis",
        "Experience with big data technologies"
      ],
      responsibilities: [
        "Develop machine learning models",
        "Analyze large datasets for insights",
        "Build recommendation systems",
        "Create data visualizations and reports",
        "Collaborate with engineering teams"
      ],
      postedDate: "2024-01-12",
      isRemote: true
    },
    {
      id: "JOB005",
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "3-6 years",
      salary: "₹12-18 LPA",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      description: "We're looking for a DevOps Engineer to manage our cloud infrastructure and deployment pipelines. You'll work on scaling our platform and ensuring high availability.",
      requirements: [
        "3+ years of DevOps experience",
        "Expertise in cloud platforms (AWS/Azure)",
        "Experience with containerization (Docker, Kubernetes)",
        "Knowledge of CI/CD pipelines",
        "Scripting skills (Bash, Python)"
      ],
      responsibilities: [
        "Manage cloud infrastructure",
        "Set up and maintain CI/CD pipelines",
        "Monitor system performance and reliability",
        "Implement security best practices",
        "Automate deployment processes"
      ],
      postedDate: "2024-01-14",
      isRemote: false
    },
    {
      id: "JOB006",
      title: "Digital Marketing Manager",
      department: "Marketing",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "4-7 years",
      salary: "₹10-15 LPA",
      skills: ["Digital Marketing", "SEO", "SEM", "Analytics"],
      description: "Lead our digital marketing efforts to drive user acquisition and brand awareness. You'll manage campaigns across multiple channels and optimize for growth.",
      requirements: [
        "4+ years of digital marketing experience",
        "Experience with Google Ads and Facebook Ads",
        "Strong analytical skills",
        "Knowledge of SEO and content marketing",
        "Experience with marketing automation tools"
      ],
      responsibilities: [
        "Develop and execute digital marketing strategies",
        "Manage paid advertising campaigns",
        "Optimize website for search engines",
        "Analyze campaign performance and ROI",
        "Collaborate with content and design teams"
      ],
      postedDate: "2024-01-09",
      isRemote: true
    },
    {
      id: "JOB007",
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹6-10 LPA",
      skills: ["Customer Success", "Communication", "CRM", "Analytics"],
      description: "Help our customers achieve success with our platform. You'll work directly with service providers and customers to ensure satisfaction and drive retention.",
      requirements: [
        "2+ years in customer success or account management",
        "Excellent communication and interpersonal skills",
        "Experience with CRM systems",
        "Problem-solving mindset",
        "Understanding of SaaS metrics"
      ],
      responsibilities: [
        "Manage customer relationships and onboarding",
        "Analyze customer health and usage metrics",
        "Develop customer success strategies",
        "Handle escalations and resolve issues",
        "Drive product adoption and expansion"
      ],
      postedDate: "2024-01-11",
      isRemote: false
    },
    {
      id: "JOB008",
      title: "Mobile App Developer (React Native)",
      department: "Engineering",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "2-5 years",
      salary: "₹8-14 LPA",
      skills: ["React Native", "JavaScript", "iOS", "Android"],
      description: "Join our mobile team to build and enhance our React Native applications for iOS and Android platforms.",
      requirements: [
        "2+ years of React Native development",
        "Experience with mobile app deployment",
        "Knowledge of native mobile development",
        "Understanding of mobile UX principles",
        "Experience with app store optimization"
      ],
      responsibilities: [
        "Develop mobile applications using React Native",
        "Optimize app performance and user experience",
        "Collaborate with design and backend teams",
        "Handle app store submissions and updates",
        "Debug and resolve mobile-specific issues"
      ],
      postedDate: "2024-01-13",
      isRemote: true
    },
    {
      id: "JOB009",
      title: "Business Analyst",
      department: "Strategy",
      location: "Gurgaon, Haryana",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹9-13 LPA",
      skills: ["Business Analysis", "SQL", "Excel", "Tableau"],
      description: "Analyze business processes and market trends to drive strategic decisions. You'll work with various teams to identify opportunities and improvements.",
      requirements: [
        "3+ years of business analysis experience",
        "Strong analytical and quantitative skills",
        "Proficiency in SQL and Excel",
        "Experience with data visualization tools",
        "Excellent presentation skills"
      ],
      responsibilities: [
        "Conduct market research and competitive analysis",
        "Analyze business metrics and KPIs",
        "Create reports and presentations for leadership",
        "Identify process improvement opportunities",
        "Support strategic planning initiatives"
      ],
      postedDate: "2024-01-07",
      isRemote: false
    },
    {
      id: "JOB010",
      title: "Quality Assurance Engineer",
      department: "Engineering",
      location: "Noida, Uttar Pradesh",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹6-10 LPA",
      skills: ["Testing", "Automation", "Selenium", "API Testing"],
      description: "Ensure the quality of our software products through comprehensive testing strategies. You'll work on both manual and automated testing.",
      requirements: [
        "2+ years of QA testing experience",
        "Experience with test automation tools",
        "Knowledge of API testing",
        "Understanding of agile testing methodologies",
        "Attention to detail and analytical thinking"
      ],
      responsibilities: [
        "Design and execute test plans and cases",
        "Develop automated test scripts",
        "Perform API and integration testing",
        "Track and report bugs and issues",
        "Collaborate with development teams"
      ],
      postedDate: "2024-01-06",
      isRemote: false
    },
    {
      id: "JOB011",
      title: "HR Business Partner",
      department: "Human Resources",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "5-8 years",
      salary: "₹12-18 LPA",
      skills: ["HR Strategy", "Employee Relations", "Recruitment", "Performance Management"],
      description: "Partner with business leaders to drive HR strategies and initiatives. You'll focus on talent management, employee engagement, and organizational development.",
      requirements: [
        "5+ years of HR experience",
        "Experience as an HR Business Partner",
        "Strong understanding of employment law",
        "Excellent communication and consulting skills",
        "Experience with HRIS systems"
      ],
      responsibilities: [
        "Partner with business leaders on HR strategy",
        "Manage employee relations and performance issues",
        "Drive talent acquisition and retention strategies",
        "Develop and implement HR policies",
        "Support organizational change initiatives"
      ],
      postedDate: "2024-01-05",
      isRemote: true
    },
    {
      id: "JOB012",
      title: "Content Marketing Specialist",
      department: "Marketing",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹5-8 LPA",
      skills: ["Content Writing", "SEO", "Social Media", "Analytics"],
      description: "Create compelling content that drives engagement and supports our marketing goals. You'll work on blog posts, social media, and marketing materials.",
      requirements: [
        "2+ years of content marketing experience",
        "Excellent writing and editing skills",
        "Knowledge of SEO best practices",
        "Experience with content management systems",
        "Understanding of social media platforms"
      ],
      responsibilities: [
        "Create and edit marketing content",
        "Develop content strategies and calendars",
        "Optimize content for search engines",
        "Manage social media content",
        "Analyze content performance metrics"
      ],
      postedDate: "2024-01-04",
      isRemote: true
    },
    {
      id: "JOB013",
      title: "Financial Analyst",
      department: "Finance",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8-12 LPA",
      skills: ["Financial Analysis", "Excel", "Financial Modeling", "SQL"],
      description: "Support financial planning and analysis for the company. You'll work on budgeting, forecasting, and financial reporting.",
      requirements: [
        "3+ years of financial analysis experience",
        "Strong skills in Excel and financial modeling",
        "Knowledge of accounting principles",
        "Experience with financial reporting",
        "Analytical and detail-oriented mindset"
      ],
      responsibilities: [
        "Prepare financial reports and analysis",
        "Support budgeting and forecasting processes",
        "Analyze business performance and metrics",
        "Create financial models and projections",
        "Assist with investor relations activities"
      ],
      postedDate: "2024-01-03",
      isRemote: false
    },
    {
      id: "JOB014",
      title: "Sales Development Representative",
      department: "Sales",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "1-3 years",
      salary: "₹4-7 LPA",
      skills: ["Sales", "Lead Generation", "CRM", "Communication"],
      description: "Generate qualified leads and support our sales team. You'll be responsible for prospecting, qualifying leads, and setting appointments.",
      requirements: [
        "1+ years of sales or lead generation experience",
        "Excellent communication and interpersonal skills",
        "Experience with CRM systems",
        "Goal-oriented and self-motivated",
        "Understanding of B2B sales processes"
      ],
      responsibilities: [
        "Generate and qualify sales leads",
        "Conduct outbound prospecting activities",
        "Set appointments for account executives",
        "Maintain accurate records in CRM",
        "Collaborate with marketing team on campaigns"
      ],
      postedDate: "2024-01-02",
      isRemote: false
    },
    {
      id: "JOB015",
      title: "Backend Developer (Python)",
      department: "Engineering",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹8-12 LPA",
      skills: ["Python", "Django", "PostgreSQL", "API Development"],
      description: "Develop and maintain our backend services and APIs. You'll work with Python, Django, and various databases to build scalable solutions.",
      requirements: [
        "2+ years of Python development experience",
        "Experience with Django or Flask frameworks",
        "Knowledge of database design and optimization",
        "Understanding of API design principles",
        "Experience with version control (Git)"
      ],
      responsibilities: [
        "Develop backend services and APIs",
        "Optimize database queries and performance",
        "Write unit tests and documentation",
        "Collaborate with frontend developers",
        "Participate in code reviews and architecture discussions"
      ],
      postedDate: "2024-01-01",
      isRemote: true
    },
    {
      id: "JOB016",
      title: "Cybersecurity Analyst",
      department: "Security",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "3-6 years",
      salary: "₹10-15 LPA",
      skills: ["Cybersecurity", "Network Security", "SIEM", "Incident Response"],
      description: "Protect our systems and data from security threats. You'll monitor security events, investigate incidents, and implement security measures.",
      requirements: [
        "3+ years of cybersecurity experience",
        "Knowledge of security frameworks and standards",
        "Experience with SIEM tools",
        "Understanding of network security principles",
        "Relevant security certifications preferred"
      ],
      responsibilities: [
        "Monitor security events and alerts",
        "Investigate and respond to security incidents",
        "Implement security policies and procedures",
        "Conduct security assessments and audits",
        "Provide security awareness training"
      ],
      postedDate: "2023-12-30",
      isRemote: false
    },
    {
      id: "JOB017",
      title: "Operations Manager",
      department: "Operations",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "4-7 years",
      salary: "₹12-18 LPA",
      skills: ["Operations Management", "Process Improvement", "Leadership", "Analytics"],
      description: "Lead our operations team to ensure efficient service delivery. You'll focus on process optimization, team management, and operational excellence.",
      requirements: [
        "4+ years of operations management experience",
        "Strong leadership and team management skills",
        "Experience with process improvement methodologies",
        "Analytical and problem-solving abilities",
        "Knowledge of service industry operations"
      ],
      responsibilities: [
        "Manage day-to-day operations",
        "Lead and develop operations team",
        "Optimize processes and workflows",
        "Monitor operational metrics and KPIs",
        "Implement quality assurance programs"
      ],
      postedDate: "2023-12-29",
      isRemote: false
    },
    {
      id: "JOB018",
      title: "Frontend Developer (Vue.js)",
      department: "Engineering",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹7-11 LPA",
      skills: ["Vue.js", "JavaScript", "CSS", "Frontend Development"],
      description: "Build responsive and interactive user interfaces using Vue.js. You'll work closely with our design team to implement modern web applications.",
      requirements: [
        "2+ years of frontend development experience",
        "Proficiency in Vue.js and JavaScript",
        "Experience with CSS frameworks",
        "Understanding of responsive design principles",
        "Knowledge of frontend build tools"
      ],
      responsibilities: [
        "Develop user interfaces using Vue.js",
        "Implement responsive designs",
        "Optimize frontend performance",
        "Collaborate with backend developers on API integration",
        "Participate in design reviews and technical discussions"
      ],
      postedDate: "2023-12-28",
      isRemote: true
    },
    {
      id: "JOB019",
      title: "Legal Counsel",
      department: "Legal",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "5-8 years",
      salary: "₹15-22 LPA",
      skills: ["Corporate Law", "Contract Law", "Compliance", "Risk Management"],
      description: "Provide legal support and guidance for business operations. You'll handle contracts, compliance, and regulatory matters.",
      requirements: [
        "5+ years of legal experience",
        "Law degree from recognized institution",
        "Experience in corporate and contract law",
        "Knowledge of technology and startup legal issues",
        "Strong negotiation and drafting skills"
      ],
      responsibilities: [
        "Draft and review legal documents and contracts",
        "Provide legal advice on business matters",
        "Ensure regulatory compliance",
        "Manage legal risks and disputes",
        "Support corporate governance activities"
      ],
      postedDate: "2023-12-27",
      isRemote: false
    },
    {
      id: "JOB020",
      title: "Business Development Executive",
      department: "Business Development",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "2-5 years",
      salary: "₹6-10 LPA",
      skills: ["Business Development", "Sales", "Relationship Management", "Negotiation"],
      description: "Drive business growth through strategic partnerships and new business opportunities. You'll identify and develop key relationships.",
      requirements: [
        "2+ years of business development experience",
        "Strong sales and negotiation skills",
        "Experience in B2B relationship management",
        "Excellent communication and presentation skills",
        "Understanding of marketplace business models"
      ],
      responsibilities: [
        "Identify new business opportunities",
        "Develop strategic partnerships",
        "Negotiate contracts and agreements",
        "Manage key account relationships",
        "Support market expansion initiatives"
      ],
      postedDate: "2023-12-26",
      isRemote: false
    },
    {
      id: "JOB021",
      title: "Machine Learning Engineer",
      department: "Data & Analytics",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "3-6 years",
      salary: "₹15-25 LPA",
      skills: ["Machine Learning", "Python", "TensorFlow", "MLOps"],
      description: "Build and deploy machine learning models to improve our platform's intelligence. You'll work on recommendation systems, demand forecasting, and optimization algorithms.",
      requirements: [
        "3+ years of ML engineering experience",
        "Strong programming skills in Python",
        "Experience with ML frameworks and libraries",
        "Knowledge of MLOps and model deployment",
        "Understanding of distributed computing"
      ],
      responsibilities: [
        "Design and implement ML models",
        "Deploy models to production systems",
        "Monitor model performance and accuracy",
        "Collaborate with data science team",
        "Optimize algorithms for scale and performance"
      ],
      postedDate: "2023-12-25",
      isRemote: true
    },
    {
      id: "JOB022",
      title: "Graphic Designer",
      department: "Design",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      skills: ["Graphic Design", "Adobe Creative Suite", "Branding", "Typography"],
      description: "Create visual content for marketing campaigns, social media, and brand materials. You'll work on both digital and print designs.",
      requirements: [
        "2+ years of graphic design experience",
        "Proficiency in Adobe Creative Suite",
        "Strong portfolio showcasing design work",
        "Understanding of branding and typography",
        "Knowledge of print and digital design requirements"
      ],
      responsibilities: [
        "Create marketing and promotional materials",
        "Design social media graphics and content",
        "Maintain brand consistency across materials",
        "Collaborate with marketing and product teams",
        "Support event and campaign design needs"
      ],
      postedDate: "2023-12-24",
      isRemote: false
    },
    {
      id: "JOB023",
      title: "Technical Writer",
      department: "Documentation",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹5-9 LPA",
      skills: ["Technical Writing", "Documentation", "API Documentation", "Content Strategy"],
      description: "Create clear and comprehensive technical documentation for our APIs, products, and internal processes.",
      requirements: [
        "2+ years of technical writing experience",
        "Experience with API documentation",
        "Strong writing and editing skills",
        "Understanding of software development processes",
        "Knowledge of documentation tools and platforms"
      ],
      responsibilities: [
        "Write and maintain technical documentation",
        "Create API documentation and guides",
        "Collaborate with engineering teams",
        "Develop content standards and style guides",
        "Update documentation based on product changes"
      ],
      postedDate: "2023-12-23",
      isRemote: true
    },
    {
      id: "JOB024",
      title: "Supply Chain Analyst",
      department: "Operations",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8-12 LPA",
      skills: ["Supply Chain", "Analytics", "Logistics", "Process Optimization"],
      description: "Optimize our supply chain and logistics operations. You'll analyze data to improve efficiency and reduce costs.",
      requirements: [
        "3+ years of supply chain experience",
        "Strong analytical and quantitative skills",
        "Knowledge of logistics and operations",
        "Experience with supply chain software",
        "Understanding of demand planning"
      ],
      responsibilities: [
        "Analyze supply chain performance",
        "Optimize logistics and distribution",
        "Manage vendor relationships",
        "Forecast demand and inventory needs",
        "Implement process improvements"
      ],
      postedDate: "2023-12-22",
      isRemote: false
    },
    {
      id: "JOB025",
      title: "Cloud Architect",
      department: "Engineering",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "6-10 years",
      salary: "₹20-30 LPA",
      skills: ["Cloud Architecture", "AWS", "Microservices", "System Design"],
      description: "Design and implement scalable cloud infrastructure. You'll lead architectural decisions and ensure our platform can scale to millions of users.",
      requirements: [
        "6+ years of cloud architecture experience",
        "Expertise in AWS/Azure cloud platforms",
        "Experience with microservices architecture",
        "Strong system design skills",
        "Knowledge of security and compliance"
      ],
      responsibilities: [
        "Design cloud infrastructure architecture",
        "Lead technical architecture decisions",
        "Ensure scalability and performance",
        "Implement security best practices",
        "Mentor engineering teams"
      ],
      postedDate: "2023-12-21",
      isRemote: true
    },
    {
      id: "JOB026",
      title: "Customer Support Specialist",
      department: "Customer Support",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "1-3 years",
      salary: "₹3-5 LPA",
      skills: ["Customer Support", "Communication", "Problem Solving", "CRM"],
      description: "Provide excellent customer support to our users and service providers. You'll handle inquiries, resolve issues, and ensure customer satisfaction.",
      requirements: [
        "1+ years of customer support experience",
        "Excellent communication skills",
        "Problem-solving mindset",
        "Experience with support ticketing systems",
        "Patience and empathy in customer interactions"
      ],
      responsibilities: [
        "Handle customer inquiries via phone, email, and chat",
        "Resolve customer issues and complaints",
        "Maintain customer records and documentation",
        "Escalate complex issues to appropriate teams",
        "Provide feedback on product improvements"
      ],
      postedDate: "2023-12-20",
      isRemote: false
    },
    {
      id: "JOB027",
      title: "Social Media Manager",
      department: "Marketing",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹5-8 LPA",
      skills: ["Social Media", "Content Creation", "Community Management", "Analytics"],
      description: "Manage our social media presence across all platforms. You'll create engaging content and build our online community.",
      requirements: [
        "2+ years of social media management experience",
        "Experience with major social media platforms",
        "Content creation and copywriting skills",
        "Knowledge of social media analytics",
        "Understanding of social media advertising"
      ],
      responsibilities: [
        "Manage social media accounts and content",
        "Create engaging social media campaigns",
        "Monitor and respond to community feedback",
        "Analyze social media performance metrics",
        "Collaborate with design and marketing teams"
      ],
      postedDate: "2023-12-19",
      isRemote: true
    },
    {
      id: "JOB028",
      title: "iOS Developer",
      department: "Engineering",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹10-15 LPA",
      skills: ["iOS", "Swift", "Objective-C", "Mobile Development"],
      description: "Develop native iOS applications with great user experiences. You'll work on our iOS app and contribute to mobile architecture decisions.",
      requirements: [
        "3+ years of iOS development experience",
        "Proficiency in Swift and Objective-C",
        "Experience with iOS frameworks and APIs",
        "Knowledge of App Store guidelines",
        "Understanding of mobile design principles"
      ],
      responsibilities: [
        "Develop and maintain iOS applications",
        "Implement new features and functionality",
        "Optimize app performance and user experience",
        "Collaborate with design and backend teams",
        "Handle app store submissions and updates"
      ],
      postedDate: "2023-12-18",
      isRemote: false
    },
    {
      id: "JOB029",
      title: "Partnership Manager",
      department: "Business Development",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹12-18 LPA",
      skills: ["Partnership Management", "Business Development", "Negotiation", "Strategy"],
      description: "Build and manage strategic partnerships that drive business growth. You'll work with key partners and develop new relationship opportunities.",
      requirements: [
        "4+ years of partnership management experience",
        "Strong relationship building skills",
        "Experience in B2B negotiations",
        "Strategic thinking and planning abilities",
        "Knowledge of marketplace or platform businesses"
      ],
      responsibilities: [
        "Develop and manage strategic partnerships",
        "Negotiate partnership agreements",
        "Monitor partnership performance and ROI",
        "Identify new partnership opportunities",
        "Collaborate with internal teams on integration"
      ],
      postedDate: "2023-12-17",
      isRemote: false
    },
    {
      id: "JOB030",
      title: "Database Administrator",
      department: "Engineering",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "4-7 years",
      salary: "₹12-18 LPA",
      skills: ["Database Administration", "SQL", "PostgreSQL", "MongoDB"],
      description: "Manage and optimize our database systems. You'll ensure data integrity, performance, and availability across our platform.",
      requirements: [
        "4+ years of database administration experience",
        "Expertise in SQL and database optimization",
        "Experience with PostgreSQL and MongoDB",
        "Knowledge of backup and recovery procedures",
        "Understanding of database security"
      ],
      responsibilities: [
        "Manage database systems and performance",
        "Implement backup and recovery strategies",
        "Monitor database health and security",
        "Optimize queries and database design",
        "Support application development teams"
      ],
      postedDate: "2023-12-16",
      isRemote: true
    },
    {
      id: "JOB031",
      title: "Event Coordinator",
      department: "Marketing",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      skills: ["Event Management", "Project Management", "Vendor Management", "Communication"],
      description: "Plan and execute company events, conferences, and marketing activations. You'll manage all aspects of event planning and execution.",
      requirements: [
        "2+ years of event management experience",
        "Strong project management skills",
        "Experience with vendor coordination",
        "Excellent organizational abilities",
        "Budget management experience"
      ],
      responsibilities: [
        "Plan and coordinate company events",
        "Manage event budgets and timelines",
        "Coordinate with vendors and suppliers",
        "Handle event logistics and setup",
        "Measure event success and ROI"
      ],
      postedDate: "2023-12-15",
      isRemote: false
    },
    {
      id: "JOB032",
      title: "Android Developer",
      department: "Engineering",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹9-14 LPA",
      skills: ["Android", "Kotlin", "Java", "Mobile Development"],
      description: "Build amazing Android applications that delight our users. You'll work on native Android development and mobile architecture.",
      requirements: [
        "3+ years of Android development experience",
        "Proficiency in Kotlin and Java",
        "Experience with Android SDK and frameworks",
        "Knowledge of material design principles",
        "Understanding of mobile app optimization"
      ],
      responsibilities: [
        "Develop and maintain Android applications",
        "Implement new features and improvements",
        "Optimize app performance and battery usage",
        "Collaborate with designers and backend developers",
        "Ensure app quality through testing"
      ],
      postedDate: "2023-12-14",
      isRemote: true
    },
    {
      id: "JOB033",
      title: "Procurement Specialist",
      department: "Finance",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹7-11 LPA",
      skills: ["Procurement", "Vendor Management", "Negotiation", "Cost Analysis"],
      description: "Manage procurement processes and vendor relationships. You'll optimize costs while ensuring quality and compliance.",
      requirements: [
        "3+ years of procurement experience",
        "Strong negotiation skills",
        "Experience with vendor management",
        "Knowledge of procurement processes",
        "Analytical and cost optimization skills"
      ],
      responsibilities: [
        "Manage procurement processes and policies",
        "Negotiate contracts with vendors",
        "Analyze costs and identify savings opportunities",
        "Ensure compliance with procurement guidelines",
        "Maintain vendor relationships and performance"
      ],
      postedDate: "2023-12-13",
      isRemote: false
    },
    {
      id: "JOB034",
      title: "Research Analyst",
      department: "Strategy",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹6-10 LPA",
      skills: ["Market Research", "Data Analysis", "Research Methodology", "Reporting"],
      description: "Conduct market research and competitive analysis to support business decisions. You'll gather insights and present findings to leadership.",
      requirements: [
        "2+ years of research experience",
        "Strong analytical and research skills",
        "Experience with research methodologies",
        "Proficiency in data analysis tools",
        "Excellent written and verbal communication"
      ],
      responsibilities: [
        "Conduct market and competitive research",
        "Analyze industry trends and opportunities",
        "Prepare research reports and presentations",
        "Support strategic planning initiatives",
        "Monitor market developments"
      ],
      postedDate: "2023-12-12",
      isRemote: true
    },
    {
      id: "JOB035",
      title: "Network Engineer",
      department: "IT",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "3-6 years",
      salary: "₹8-13 LPA",
      skills: ["Network Engineering", "Cisco", "Network Security", "Troubleshooting"],
      description: "Design, implement, and maintain our network infrastructure. You'll ensure reliable and secure network connectivity.",
      requirements: [
        "3+ years of network engineering experience",
        "Knowledge of network protocols and technologies",
        "Experience with Cisco and network equipment",
        "Understanding of network security principles",
        "Troubleshooting and problem-solving skills"
      ],
      responsibilities: [
        "Design and maintain network infrastructure",
        "Monitor network performance and security",
        "Troubleshoot network issues and outages",
        "Implement network security measures",
        "Support network upgrades and expansions"
      ],
      postedDate: "2023-12-11",
      isRemote: false
    },
    {
      id: "JOB036",
      title: "Training Specialist",
      department: "Human Resources",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹6-10 LPA",
      skills: ["Training Development", "Adult Learning", "Curriculum Design", "Presentation"],
      description: "Design and deliver training programs for employees and service providers. You'll focus on skill development and knowledge transfer.",
      requirements: [
        "3+ years of training and development experience",
        "Experience in curriculum design",
        "Knowledge of adult learning principles",
        "Strong presentation and facilitation skills",
        "Experience with e-learning platforms"
      ],
      responsibilities: [
        "Design and develop training programs",
        "Deliver training sessions and workshops",
        "Assess training effectiveness and outcomes",
        "Maintain training materials and resources",
        "Support onboarding and skill development"
      ],
      postedDate: "2023-12-10",
      isRemote: false
    },
    {
      id: "JOB037",
      title: "Compliance Officer",
      department: "Legal",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹10-15 LPA",
      skills: ["Compliance", "Risk Management", "Regulatory Affairs", "Audit"],
      description: "Ensure compliance with laws, regulations, and internal policies. You'll develop compliance programs and monitor adherence.",
      requirements: [
        "4+ years of compliance experience",
        "Knowledge of regulatory requirements",
        "Experience with compliance auditing",
        "Strong attention to detail",
        "Risk assessment and management skills"
      ],
      responsibilities: [
        "Develop and implement compliance programs",
        "Monitor compliance with regulations",
        "Conduct compliance audits and assessments",
        "Provide compliance training and guidance",
        "Report on compliance status and issues"
      ],
      postedDate: "2023-12-09",
      isRemote: false
    },
    {
      id: "JOB038",
      title: "Video Editor",
      department: "Marketing",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      skills: ["Video Editing", "Adobe Premiere", "After Effects", "Motion Graphics"],
      description: "Create engaging video content for marketing campaigns and social media. You'll work on promotional videos, tutorials, and brand content.",
      requirements: [
        "2+ years of video editing experience",
        "Proficiency in Adobe Premiere and After Effects",
        "Understanding of video production workflows",
        "Creative storytelling abilities",
        "Knowledge of motion graphics"
      ],
      responsibilities: [
        "Edit marketing and promotional videos",
        "Create motion graphics and animations",
        "Collaborate with creative and marketing teams",
        "Optimize videos for different platforms",
        "Maintain video asset library"
      ],
      postedDate: "2023-12-08",
      isRemote: true
    },
    {
      id: "JOB039",
      title: "System Administrator",
      department: "IT",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹7-11 LPA",
      skills: ["System Administration", "Linux", "Windows Server", "Automation"],
      description: "Manage and maintain our IT systems and infrastructure. You'll ensure system reliability, security, and performance.",
      requirements: [
        "3+ years of system administration experience",
        "Experience with Linux and Windows servers",
        "Knowledge of system monitoring and automation",
        "Understanding of security best practices",
        "Scripting and automation skills"
      ],
      responsibilities: [
        "Manage servers and IT infrastructure",
        "Monitor system performance and availability",
        "Implement security patches and updates",
        "Automate routine administrative tasks",
        "Support user access and permissions"
      ],
      postedDate: "2023-12-07",
      isRemote: false
    },
    {
      id: "JOB040",
      title: "Community Manager",
      department: "Marketing",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      skills: ["Community Management", "Social Media", "Engagement", "Content Creation"],
      description: "Build and engage our online community. You'll foster relationships with users, service providers, and brand advocates.",
      requirements: [
        "2+ years of community management experience",
        "Strong social media and communication skills",
        "Experience with community platforms",
        "Creative content creation abilities",
        "Understanding of community building strategies"
      ],
      responsibilities: [
        "Manage online community platforms",
        "Engage with community members",
        "Create community content and campaigns",
        "Monitor community sentiment and feedback",
        "Organize community events and initiatives"
      ],
      postedDate: "2023-12-06",
      isRemote: true
    },
    {
      id: "JOB041",
      title: "Account Manager",
      department: "Sales",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8-12 LPA",
      skills: ["Account Management", "Relationship Building", "Sales", "CRM"],
      description: "Manage key client relationships and drive account growth. You'll work with enterprise clients to ensure satisfaction and expansion.",
      requirements: [
        "3+ years of account management experience",
        "Strong relationship building skills",
        "Experience with B2B sales",
        "Knowledge of CRM systems",
        "Goal-oriented and results-driven"
      ],
      responsibilities: [
        "Manage key client accounts",
        "Drive account growth and expansion",
        "Maintain strong client relationships",
        "Identify upselling and cross-selling opportunities",
        "Collaborate with internal teams on delivery"
      ],
      postedDate: "2023-12-05",
      isRemote: false
    },
    {
      id: "JOB042",
      title: "Performance Marketing Specialist",
      department: "Marketing",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹6-10 LPA",
      skills: ["Performance Marketing", "Google Ads", "Facebook Ads", "Analytics"],
      description: "Drive customer acquisition through performance marketing campaigns. You'll optimize ad spend and improve conversion rates.",
      requirements: [
        "2+ years of performance marketing experience",
        "Experience with Google Ads and Facebook Ads",
        "Strong analytical and optimization skills",
        "Knowledge of conversion tracking",
        "Understanding of marketing funnels"
      ],
      responsibilities: [
        "Manage performance marketing campaigns",
        "Optimize ad spend and ROI",
        "Analyze campaign performance data",
        "Test and iterate on ad creatives",
        "Report on marketing metrics and KPIs"
      ],
      postedDate: "2023-12-04",
      isRemote: true
    },
    {
      id: "JOB043",
      title: "IT Support Specialist",
      department: "IT",
      location: "Chennai, Tamil Nadu",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹4-7 LPA",
      skills: ["IT Support", "Troubleshooting", "Hardware", "Software"],
      description: "Provide technical support to employees and maintain IT equipment. You'll handle hardware, software, and network support issues.",
      requirements: [
        "2+ years of IT support experience",
        "Knowledge of hardware and software troubleshooting",
        "Experience with Windows and Mac systems",
        "Strong problem-solving skills",
        "Customer service orientation"
      ],
      responsibilities: [
        "Provide technical support to employees",
        "Troubleshoot hardware and software issues",
        "Maintain IT inventory and equipment",
        "Set up new employee workstations",
        "Document support procedures and solutions"
      ],
      postedDate: "2023-12-03",
      isRemote: false
    },
    {
      id: "JOB044",
      title: "Risk Analyst",
      department: "Risk Management",
      location: "Pune, Maharashtra",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹8-12 LPA",
      skills: ["Risk Analysis", "Financial Modeling", "Compliance", "Analytics"],
      description: "Assess and manage various business risks. You'll develop risk models and implement risk mitigation strategies.",
      requirements: [
        "3+ years of risk analysis experience",
        "Strong analytical and modeling skills",
        "Knowledge of risk management frameworks",
        "Experience with financial analysis",
        "Understanding of regulatory requirements"
      ],
      responsibilities: [
        "Assess business and operational risks",
        "Develop risk models and metrics",
        "Monitor risk exposure and trends",
        "Implement risk mitigation strategies",
        "Report on risk status to management"
      ],
      postedDate: "2023-12-02",
      isRemote: false
    },
    {
      id: "JOB045",
      title: "UX Researcher",
      department: "Design",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "2-4 years",
      salary: "₹7-11 LPA",
      skills: ["UX Research", "User Testing", "Research Methods", "Analytics"],
      description: "Conduct user research to inform product decisions. You'll design studies, gather insights, and present findings to product teams.",
      requirements: [
        "2+ years of UX research experience",
        "Experience with research methodologies",
        "Knowledge of user testing and analytics",
        "Strong analytical and presentation skills",
        "Understanding of design thinking"
      ],
      responsibilities: [
        "Design and conduct user research studies",
        "Analyze user behavior and feedback",
        "Present research findings and recommendations",
        "Collaborate with design and product teams",
        "Maintain user research repository"
      ],
      postedDate: "2023-12-01",
      isRemote: true
    },
    {
      id: "JOB046",
      title: "Sales Manager",
      department: "Sales",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "5-8 years",
      salary: "₹15-22 LPA",
      skills: ["Sales Management", "Team Leadership", "B2B Sales", "Strategy"],
      description: "Lead our sales team to achieve revenue targets. You'll develop sales strategies, manage team performance, and drive business growth.",
      requirements: [
        "5+ years of sales management experience",
        "Proven track record of meeting sales targets",
        "Strong leadership and team management skills",
        "Experience in B2B sales",
        "Strategic thinking and planning abilities"
      ],
      responsibilities: [
        "Lead and manage sales team",
        "Develop sales strategies and processes",
        "Monitor sales performance and metrics",
        "Coach and develop sales representatives",
        "Collaborate with marketing and product teams"
      ],
      postedDate: "2023-11-30",
      isRemote: false
    },
    {
      id: "JOB047",
      title: "Brand Manager",
      department: "Marketing",
      location: "Delhi, Delhi",
      type: "Full-time",
      experience: "4-6 years",
      salary: "₹10-15 LPA",
      skills: ["Brand Management", "Marketing Strategy", "Campaign Management", "Analytics"],
      description: "Manage and grow our brand presence. You'll develop brand strategies, oversee campaigns, and ensure consistent brand messaging.",
      requirements: [
        "4+ years of brand management experience",
        "Strong understanding of brand strategy",
        "Experience with campaign management",
        "Creative and strategic thinking",
        "Knowledge of digital marketing"
      ],
      responsibilities: [
        "Develop brand strategies and positioning",
        "Manage brand campaigns and initiatives",
        "Ensure brand consistency across channels",
        "Monitor brand performance and sentiment",
        "Collaborate with creative and marketing teams"
      ],
      postedDate: "2023-11-29",
      isRemote: true
    },
    {
      id: "JOB048",
      title: "API Developer",
      department: "Engineering",
      location: "Hyderabad, Telangana",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹10-15 LPA",
      skills: ["API Development", "REST", "GraphQL", "Microservices"],
      description: "Design and develop APIs that power our platform. You'll work on REST and GraphQL APIs, ensuring scalability and performance.",
      requirements: [
        "3+ years of API development experience",
        "Experience with REST and GraphQL",
        "Knowledge of API design best practices",
        "Understanding of microservices architecture",
        "Experience with API testing and documentation"
      ],
      responsibilities: [
        "Design and develop scalable APIs",
        "Implement API security and authentication",
        "Write API documentation and tests",
        "Optimize API performance",
        "Collaborate with frontend and mobile teams"
      ],
      postedDate: "2023-11-28",
      isRemote: true
    },
    {
      id: "JOB049",
      title: "Talent Acquisition Specialist",
      department: "Human Resources",
      location: "Bangalore, Karnataka",
      type: "Full-time",
      experience: "3-5 years",
      salary: "₹7-11 LPA",
      skills: ["Talent Acquisition", "Recruiting", "Interviewing", "Sourcing"],
      description: "Lead our talent acquisition efforts to build amazing teams. You'll source, screen, and hire top talent across all departments.",
      requirements: [
        "3+ years of talent acquisition experience",
        "Experience with technical and non-technical hiring",
        "Strong sourcing and networking skills",
        "Knowledge of interviewing best practices",
        "Experience with ATS and recruiting tools"
      ],
      responsibilities: [
        "Source and attract top talent",
        "Screen candidates and conduct interviews",
        "Manage the full recruitment cycle",
        "Build talent pipelines for key roles",
        "Collaborate with hiring managers"
      ],
      postedDate: "2023-11-27",
      isRemote: false
    },
    {
      id: "JOB050",
      title: "Growth Product Manager",
      department: "Product",
      location: "Mumbai, Maharashtra",
      type: "Full-time",
      experience: "4-7 years",
      salary: "₹18-25 LPA",
      skills: ["Growth Product Management", "A/B Testing", "Analytics", "User Acquisition"],
      description: "Drive user growth through product experimentation and optimization. You'll focus on acquisition, activation, retention, and monetization.",
      requirements: [
        "4+ years of product management experience",
        "Experience with growth and experimentation",
        "Strong analytical and data-driven mindset",
        "Knowledge of A/B testing and optimization",
        "Understanding of user acquisition funnels"
      ],
      responsibilities: [
        "Drive product-led growth initiatives",
        "Design and run growth experiments",
        "Analyze user behavior and conversion funnels",
        "Optimize onboarding and retention flows",
        "Collaborate with engineering and design teams"
      ],
      postedDate: "2023-11-26",
      isRemote: true
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      rating: 5,
      comment: "Amazing service! The electrician was professional and fixed my fan in 30 minutes. Very satisfied with the quality of work.",
      service: "Electrician",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      location: "Mumbai"
    },
    {
      name: "Raj Patel",
      rating: 5,
      comment: "Quick response and fair pricing. The plumber arrived on time and solved my pipe leakage issue efficiently.",
      service: "Plumber",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      location: "Delhi"
    },
    {
      name: "Anita Gupta",
      rating: 4,
      comment: "Great painting job! They completed my living room in just 2 days. The finish quality is excellent.",
      service: "Painter",
      image: "https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      location: "Bangalore"
    },
    {
      name: "Vikram Singh",
      rating: 5,
      comment: "Professional cleaning service. My house looks spotless now. Will definitely book again for monthly cleaning.",
      service: "House Cleaning",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2",
      location: "Pune"
    }
  ];

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Simply click the 'Book Service' button, fill out our booking form with your details (name, phone, address, preferred date and time), and submit. We'll contact you to confirm the appointment and match you with a verified technician who will arrive at your doorstep."
    },
    {
      question: "What payment options are available?",
      answer: "We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery. All online payments are secure and encrypted with 256-bit SSL protection."
    },
    {
      question: "How are technicians verified?",
      answer: "All technicians undergo rigorous background verification, skill assessment, document verification, and police verification before joining our platform."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We offer 100% satisfaction guarantee. If you're not happy with the service, we'll send another technician for free or provide a full refund within 24 hours."
    },
    {
      question: "Can I reschedule my appointment?",
      answer: "Yes, you can reschedule up to 2 hours before the appointment time without any charges through our app or website."
    },
    {
      question: "Do you provide warranty on services?",
      answer: "Yes, we provide 30-day service warranty on all our services. If any issue occurs within 30 days, we'll fix it for free."
    }
  ];

  const themeClasses = isDarkMode 
    ? 'dark bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* Enhanced Navigation Header */}
      <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-lg border-b sticky top-0 z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <Home className="w-10 h-10 text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                                     <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                     Servecure
                   </span>
                  <div className="text-xs text-gray-500 font-medium">Trusted Services</div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#services" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} font-medium transition-colors duration-200 relative group`}>
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a href="#how-it-works" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} font-medium transition-colors duration-200 relative group`}>
                How it Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </a>
              <a href="#pricing" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} font-medium transition-colors duration-200 relative group`}>
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </a>
              <button onClick={goToCareers} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-blue-600'} font-medium transition-colors duration-200 relative group`}>
                Careers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></span>
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200 group`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-transform duration-300" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Profile + My Services + Login/Logout buttons */}
              {idToken && (
                <button
                  onClick={goToProfile}
                  className={`${route === 'profile' ? 'ring-2 ring-blue-400' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-4 py-2 rounded-full font-medium transition-all duration-200`}
                >
                  Profile
                </button>
              )}
              {idToken && (
                <button
                  onClick={goToMyServices}
                  className={`${route === 'my-services' ? 'ring-2 ring-blue-400' : ''} ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-4 py-2 rounded-full font-medium transition-all duration-200`}
                >
                  My Services
                </button>
              )}
              {idToken ? (
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center group"
                >
                  Logout
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              ) : (
                <button 
                  onClick={openAuthModal}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center group"
                >
                  Login
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-4">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all duration-200`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={toggleMobileMenu}
                className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className={`lg:hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border-t transition-all duration-300`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a href="#services" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} transition-colors duration-200`}>
                  Services
                </a>
                <a href="#how-it-works" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} transition-colors duration-200`}>
                  How it Works
                </a>
                <a href="#pricing" className={`block px-3 py-2 rounded-md text-base font-medium ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'} transition-colors duration-200`}>
                  Pricing
                </a>
                {idToken && (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); goToProfile(); }}
                    className={`w-full mt-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-6 py-3 rounded-full font-semibold transition-all duration-200`}
                  >
                    Profile
                  </button>
                )}
                {idToken && (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); goToMyServices(); }}
                    className={`w-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-6 py-3 rounded-full font-semibold transition-all duration-200`}
                  >
                    My Services
                  </button>
                )}
                {idToken ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={openAuthModal}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      {route === 'home' && (
      <section className={`relative ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-blue-900 to-teal-800' : 'bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600'} text-white overflow-hidden`}>
        <div className="absolute inset-0">
          <img 
            src="https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1" 
            alt="Professional technician working"
            className="w-full h-full object-cover opacity-20"
          />
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-gray-800/90 to-blue-900/90' : 'bg-gradient-to-r from-blue-600/90 to-teal-600/90'}`}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span>Rated 4.8/5 by 50,000+ customers</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Book Trusted Home Services in
                <span className="text-yellow-400"> Minutes</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                Electricians, Plumbers, Cleaners & more at your doorstep. 100% verified professionals, transparent pricing, and instant booking.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => openBookingModal()}
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-200 flex items-center justify-center group shadow-lg hover:shadow-xl"
                >
                  Book a Service Now
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-all duration-200 flex items-center justify-center">
                  <PlayCircle className="mr-2 w-5 h-5" />
                  Watch How It Works
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-400" />
                  <span>100% Verified</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-300" />
                  <span>Same Day Service</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  <span>30-Day Warranty</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <h3 className="text-lg font-semibold mb-6 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Quick Service Booking
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex items-center space-x-3 p-3 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-50'} rounded-lg`}>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Choose your location</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 ${isDarkMode ? 'bg-green-900/50' : 'bg-green-50'} rounded-lg`}>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Select service type</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 ${isDarkMode ? 'bg-purple-900/50' : 'bg-purple-50'} rounded-lg`}>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">Pick time slot</span>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 ${isDarkMode ? 'bg-orange-900/50' : 'bg-orange-50'} rounded-lg`}>
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">Get instant confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* My Services Page */}
      {route === 'my-services' && idToken && (
        <section id="my-services" className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Services</h2>
              <div className="flex items-center gap-3">
                <label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Filter by stage</label>
                <select value={myServicesFilter} onChange={(e) => setMyServicesFilter(e.target.value as any)} className={`${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} border rounded px-3 py-2`}>
                  <option value="all">All</option>
                  <option value="requested">Requested</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {myServicesLoading ? (
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading…</div>
            ) : myServicesError ? (
              <div className="text-red-600">{myServicesError}</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {myServices
                  .filter((s) => {
                    if (myServicesFilter === 'all') return true;
                    if (myServicesFilter === 'completed') return !!s.completed_at;
                    if (myServicesFilter === 'ongoing') return !s.completed_at && s.stage !== 'unassigned';
                    if (myServicesFilter === 'requested') return s.stage === 'unassigned';
                    return true;
                  })
                  .map((svc) => (
                    <div key={svc.service_id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow border p-5`}> 
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold capitalize">{svc.category} — {svc.service_type}</div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${svc.completed_at ? 'bg-green-100 text-green-700' : svc.stage !== 'unassigned' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {svc.completed_at ? 'completed' : (svc.stage !== 'unassigned' ? 'ongoing' : 'requested')}
                        </span>
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        <div>Requested slot: {formatDateTime(svc.requested_slot)}</div>
                        <div>Created at: {formatDateTime(svc.created_at)}</div>
                        <div>Cost: ₹{svc.service_cost}</div>
                        {svc.stage && <div>Stage: {svc.stage}</div>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Profile Page (route) */}
      {route === 'profile' && idToken && (
        <section id="profile" className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-lg border p-6`}> 
              <div className="flex items-center">
                { (userDetails?.user?.picture || userProfile?.picture) && (
                  <img src={userDetails?.user?.picture || userProfile?.picture} alt={(userDetails?.user?.firstname || userProfile?.name) || 'Profile'} className="w-20 h-20 rounded-full mr-6 object-cover" />
                )}
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {(userDetails?.user?.firstname && userDetails?.user?.lastname)
                      ? `${userDetails.user.firstname} ${userDetails.user.lastname}`
                      : (userProfile?.name || '—')}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {userDetails?.user?.email || userProfile?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Last login</div>
                  <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    {isLoadingUserDetails ? 'Loading…' : (formatDateTime(userDetails?.user?.last_login) || '—')}
                  </div>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm`}>Created account at</div>
                  <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                    {isLoadingUserDetails ? 'Loading…' : (formatDateTime(userDetails?.user?.created_at) || '—')}
                  </div>
                </div>
              </div>

              {/* Token UI intentionally removed */}

              {userDetailsError && (
                <div className="mt-4 text-sm text-red-500">{userDetailsError}</div>
              )}
            </div>

            {/* Service Provider Request Section */}
            <div className="mt-10">
              <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SERVICE PROVIDER REQUEST</h4>

              {/* Status Card */}
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow border p-4 mb-4`}>
                {spLoadingStatus ? (
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading status…</div>
                ) : spStatus?.service_provider ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${spStatus.service_provider.status === 'Approved' ? 'bg-green-100 text-green-700' : spStatus.service_provider.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {spStatus.service_provider.status}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Requested at</div>
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDateTime(spStatus.service_provider.requested_at)}</div>
                      </div>
                      <div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Approved at</div>
                        <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDateTime(spStatus.service_provider.approved_at)}</div>
                      </div>
                    </div>
                    {/* Services Chips */}
                    {spStatus.service_provider.services && (
                      <div className="mt-2">
                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Services</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(spStatus.service_provider.services).map((svc: any, idx: number) => (
                            <span key={idx} className={`${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-blue-50 text-blue-700'} px-3 py-1 rounded-full text-sm`}>{String(svc)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No request found.</div>
                )}
              </div>

              <button onClick={() => setSpModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all shadow">
                Request as a Service Provider
              </button>

              {spSuccess && <div className="mt-3 text-green-600 text-sm">{spSuccess}</div>}
              {spError && <div className="mt-3 text-red-600 text-sm">{spError}</div>}
            </div>

            {/* Service Provider Modal */}
            {spModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Provider Request</h3>
                      <button onClick={() => setSpModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <form onSubmit={submitServiceProviderRequest} className="space-y-6">
                      {/* Services multi-select as checkboxes */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Services</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableServices.map((svc) => (
                            <label key={svc} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                              <input type="checkbox" checked={spData.services.includes(svc)} onChange={() => handleSpCheckbox(svc)} />
                              <span>{svc}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact Number</label>
                          <input name="contactNumber" value={spData.contactNumber} onChange={handleSpInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Enter contact number" required />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service City</label>
                          <input name="serviceCity" value={spData.serviceCity} onChange={handleSpInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Enter city" required />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bank Account Details</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <input name="accountHolderName" value={spData.accountHolderName} onChange={handleSpInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Account holder name" required />
                          <input name="accountNumber" value={spData.accountNumber} onChange={handleSpInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Account number" required />
                          <input name="ifscCode" value={spData.ifscCode} onChange={handleSpInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="IFSC code" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Selfie Upload</label>
                          <input type="file" accept="image/*" onChange={(e) => handleSpFileChange(e, 'selfieDataUrl')} className={`w-full`}/>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Aadhar Card Upload</label>
                          <input type="file" accept="image/*" onChange={(e) => handleSpFileChange(e, 'aadharDataUrl')} className={`w-full`}/>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>PAN Card Upload</label>
                          <input type="file" accept="image/*" onChange={(e) => handleSpFileChange(e, 'panDataUrl')} className={`w-full`}/>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setSpModalOpen(false)} className={`px-6 py-3 rounded-lg font-semibold border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}>
                          Cancel
                        </button>
                        <button type="submit" disabled={spSubmitting} className={`px-6 py-3 rounded-lg font-semibold text-white ${spSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}>
                          {spSubmitting ? 'Submitting…' : 'Submit Request'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6">
              <button onClick={goHome} className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}>
                Back to Home
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Careers Page */}
      {route === 'careers' && (
        <section id="careers" className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} min-h-screen`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className={`text-4xl md:text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Join Our Team
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
                Be part of a team that's transforming how people access home services. We're looking for passionate individuals to help us build the future of service delivery.
              </p>
            </div>

            {/* Filters */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl p-6 mb-8 border`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={jobFilters.search}
                    onChange={(e) => setJobFilters(prev => ({...prev, search: e.target.value}))}
                    className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                
                {/* Department Filter */}
                <select
                  value={jobFilters.department}
                  onChange={(e) => setJobFilters(prev => ({...prev, department: e.target.value}))}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Legal">Legal</option>
                  <option value="Security">Security</option>
                  <option value="IT">IT</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Business Development">Business Development</option>
                </select>

                {/* Location Filter */}
                <select
                  value={jobFilters.location}
                  onChange={(e) => setJobFilters(prev => ({...prev, location: e.target.value}))}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Locations</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Gurgaon">Gurgaon</option>
                  <option value="Noida">Noida</option>
                </select>

                {/* Experience Filter */}
                <select
                  value={jobFilters.experience}
                  onChange={(e) => setJobFilters(prev => ({...prev, experience: e.target.value}))}
                  className={`px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="all">All Experience</option>
                  <option value="1-3 years">1-3 years</option>
                  <option value="2-4 years">2-4 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="4-6 years">4-6 years</option>
                  <option value="5-8 years">5-8 years</option>
                  <option value="6-10 years">6+ years</option>
                </select>
              </div>
              
              {/* Clear Filters */}
              <div className="mt-4 flex justify-between items-center">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(() => {
                    const filteredJobs = jobListings.filter(job => {
                      const matchesSearch = jobFilters.search === '' || 
                        job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                        job.description.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                        job.skills.some(skill => skill.toLowerCase().includes(jobFilters.search.toLowerCase()));
                      const matchesDepartment = jobFilters.department === 'all' || job.department === jobFilters.department;
                      const matchesLocation = jobFilters.location === 'all' || job.location.includes(jobFilters.location);
                      const matchesExperience = jobFilters.experience === 'all' || job.experience === jobFilters.experience;
                      return matchesSearch && matchesDepartment && matchesLocation && matchesExperience;
                    });
                    return `${filteredJobs.length} jobs found`;
                  })()}
                </span>
                <button
                  onClick={() => setJobFilters({department: 'all', location: 'all', experience: 'all', type: 'all', search: ''})}
                  className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                >
                  Clear all filters
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className="grid gap-6">
              {(() => {
                const filteredJobs = jobListings.filter(job => {
                  const matchesSearch = jobFilters.search === '' || 
                    job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                    job.description.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                    job.skills.some(skill => skill.toLowerCase().includes(jobFilters.search.toLowerCase()));
                  const matchesDepartment = jobFilters.department === 'all' || job.department === jobFilters.department;
                  const matchesLocation = jobFilters.location === 'all' || job.location.includes(jobFilters.location);
                  const matchesExperience = jobFilters.experience === 'all' || job.experience === jobFilters.experience;
                  return matchesSearch && matchesDepartment && matchesLocation && matchesExperience;
                });

                return filteredJobs.map((job) => (
                  <div key={job.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'} rounded-xl border p-6 transition-all duration-200 hover:shadow-lg`}>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {job.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {job.id}
                          </span>
                          {job.isRemote && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                              Remote
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
                          <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </span>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {job.department}
                          </span>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {job.experience}
                          </span>
                          <span className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            {job.salary}
                          </span>
                        </div>

                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2`}>
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className={`px-3 py-1 rounded-full text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{job.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:ml-6">
                        <button className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} hover:shadow-lg`}>
                          View Details
                        </button>
                        <button className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${isDarkMode ? 'border-2 border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                          Quick Apply
                        </button>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* No Results */}
            {(() => {
              const filteredJobs = jobListings.filter(job => {
                const matchesSearch = jobFilters.search === '' || 
                  job.title.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                  job.description.toLowerCase().includes(jobFilters.search.toLowerCase()) ||
                  job.skills.some(skill => skill.toLowerCase().includes(jobFilters.search.toLowerCase()));
                const matchesDepartment = jobFilters.department === 'all' || job.department === jobFilters.department;
                const matchesLocation = jobFilters.location === 'all' || job.location.includes(jobFilters.location);
                const matchesExperience = jobFilters.experience === 'all' || job.experience === jobFilters.experience;
                return matchesSearch && matchesDepartment && matchesLocation && matchesExperience;
              });

              if (filteredJobs.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className={`text-6xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>🔍</div>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                      No jobs found
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={() => setJobFilters({department: 'all', location: 'all', experience: 'all', type: 'all', search: ''})}
                      className={`px-6 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}
                    >
                      Clear all filters
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Back to Home */}
            <div className="text-center mt-12">
              <button onClick={goHome} className={`px-6 py-3 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} transition-colors`}>
                Back to Home
              </button>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {route === 'home' && (
      <section id="how-it-works" className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              How It Works
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Get your home services sorted in just 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative">
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:${isDarkMode ? 'bg-blue-800' : 'bg-blue-200'} transition-all duration-200 group-hover:scale-110`}>
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Browse Services</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Explore our wide range of professional home services with transparent pricing.</p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:${isDarkMode ? 'bg-green-800' : 'bg-green-200'} transition-all duration-200 group-hover:scale-110`}>
                  <Calendar className="w-10 h-10 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Book Appointment</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fill out our simple booking form with your details and preferred schedule.</p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:${isDarkMode ? 'bg-purple-800' : 'bg-purple-200'} transition-all duration-200 group-hover:scale-110`}>
                  <Phone className="w-10 h-10 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Get Confirmation</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Receive instant confirmation and our team will contact you to finalize details.</p>
            </div>

            <div className="text-center group">
              <div className="relative">
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-orange-900' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:${isDarkMode ? 'bg-orange-800' : 'bg-orange-200'} transition-all duration-200 group-hover:scale-110`}>
                  <Star className="w-10 h-10 text-orange-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  4
                </div>
              </div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Enjoy Service</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Professional service delivery at your doorstep with quality guarantee.</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Services Section */}
      {route === 'home' && (
      <section id="services" className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Our Services
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Professional home services at your fingertips with transparent pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1`}>
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center">
                      {service.icon}
                      <span className="ml-2 font-semibold">{service.title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-blue-600">Starting {service.startingPrice}</p>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {service.subServices.map((subService, subIndex) => (
                      <div key={subIndex} className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{subService}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => openBookingModal(service.title)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center group"
                  >
                    Book Now
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Technician Registration Section */}
      {route === 'home' && (
      <section className={`py-20 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-blue-900' : 'bg-gradient-to-r from-teal-600 to-blue-600'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Join as a Service Expert
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Turn your skills into income. Join thousands of verified professionals earning with us.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-lg">Upload KYC documents for verification</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-lg">Set your service charges and availability</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-lg">Get matched with customers in your area</span>
                </div>
                <div className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-lg">Receive payments instantly after service</span>
                </div>
              </div>

              <button 
                onClick={openExpertRegistrationModal}
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                Register Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors duration-200">
                <TrendingUp className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">₹25,000+</h3>
                <p className="text-blue-100">Average Monthly Earnings</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors duration-200">
                <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">10,000+</h3>
                <p className="text-blue-100">Active Professionals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors duration-200">
                <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">4.9/5</h3>
                <p className="text-blue-100">Professional Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors duration-200">
                <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">100%</h3>
                <p className="text-blue-100">Verified Professionals</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing & Discounts Section */}
      {route === 'home' && (
      <section id="pricing" className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Transparent Pricing
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              No hidden charges, fair pricing for quality service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Installation Services</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">₹299</div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Starting price for basic installations</p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hourly Services</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">₹199</div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Per hour for maintenance work</p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200`}>
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Premium Services</h3>
              <div className="text-3xl font-bold text-purple-600 mb-2">₹599</div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>For complex installations & repairs</p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-blue-800' : 'bg-gradient-to-r from-orange-100 to-yellow-100'} rounded-2xl p-8`}>
            <div className="text-center mb-8">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Special Offers</h3>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Save more with our exclusive discounts</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200`}>
                <div className="text-4xl font-bold text-orange-600 mb-2">20%</div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>First-time Discount</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>New customers get 20% off on first service</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200`}>
                <div className="text-4xl font-bold text-green-600 mb-2">₹200</div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Referral Bonus</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Earn ₹200 for every successful referral</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200`}>
                <div className="text-4xl font-bold text-blue-600 mb-2">30%</div>
                <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Combo Discount</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Book multiple services and save 30%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      {route === 'home' && (
      <section className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              What Our Customers Say
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Real feedback from satisfied customers across India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{testimonial.name}</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} italic mb-3`}>"{testimonial.comment}"</p>
                <div className="text-sm text-blue-600 font-medium">{testimonial.service}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FAQ Section */}
      {route === 'home' && (
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Frequently Asked Questions
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Find answers to common questions about our services
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border hover:shadow-md transition-shadow duration-200`}>
                <button
                  className={`w-full px-6 py-4 text-left flex items-center justify-between hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} transition-colors duration-200 rounded-xl`}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} pr-4`}>{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Get the App Section */}
      {route === 'home' && (
      <section className={`py-20 ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-700'} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get the App for Better Experience
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Download our mobile app for faster bookings, real-time tracking, and exclusive app-only offers.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <span className="text-lg">One-tap booking and rescheduling</span>
                </div>
                <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <span className="text-lg">Real-time technician tracking</span>
                </div>
                <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <span className="text-lg">Exclusive app discounts up to 25%</span>
                </div>
                <div className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                  <span className="text-lg">Instant notifications and updates</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center">
                  <img 
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" 
                    alt="Download on App Store"
                    className="h-8"
                  />
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                    alt="Get it on Google Play"
                    className="h-8"
                  />
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 inline-block">
                <Smartphone className="w-32 h-32 text-white mx-auto mb-6" />
                <p className="text-lg text-blue-100">Coming Soon on Mobile</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Footer (hidden on profile and my-services routes) */}
      {route !== 'profile' && route !== 'my-services' && (
      <footer className={`${isDarkMode ? 'bg-black' : 'bg-gray-900'} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
                             <div className="flex items-center mb-4">
                 <Home className="w-8 h-8 text-blue-400 mr-2" />
                 <h3 className="text-2xl font-bold">Servecure</h3>
               </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Your trusted partner for all home services. Connecting you with verified professionals for quality service delivery across India.
              </p>
              <div className="flex space-x-4">
                <button className={`w-10 h-10 ${isDarkMode ? 'bg-gray-900 hover:bg-blue-600' : 'bg-gray-800 hover:bg-blue-600'} rounded-full flex items-center justify-center transition-colors duration-200`}>
                  <Facebook className="w-5 h-5" />
                </button>
                <button className={`w-10 h-10 ${isDarkMode ? 'bg-gray-900 hover:bg-blue-400' : 'bg-gray-800 hover:bg-blue-400'} rounded-full flex items-center justify-center transition-colors duration-200`}>
                  <Twitter className="w-5 h-5" />
                </button>
                <button className={`w-10 h-10 ${isDarkMode ? 'bg-gray-900 hover:bg-pink-600' : 'bg-gray-800 hover:bg-pink-600'} rounded-full flex items-center justify-center transition-colors duration-200`}>
                  <Instagram className="w-5 h-5" />
                </button>
                <button className={`w-10 h-10 ${isDarkMode ? 'bg-gray-900 hover:bg-red-600' : 'bg-gray-800 hover:bg-red-600'} rounded-full flex items-center justify-center transition-colors duration-200`}>
                  <Youtube className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
                <li><button onClick={goToCareers} className="hover:text-white transition-colors duration-200">Careers</button></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Investor Relations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Safety Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-gray-900' : 'border-gray-800'} mt-12 pt-8`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
                             <p className="text-gray-400 mb-4 md:mb-0">&copy; 2025 Servecure. All rights reserved.</p>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-400">
                <div className="flex items-center space-x-2">
                  <HeadphonesIcon className="w-5 h-5" />
                  <span>24/7 Customer Support: 7056770758</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Email: Servecure@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Login</h2>
                <button onClick={() => setIsAuthModalOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Continue with Google to sign in.</p>
                <div ref={googleButtonRef} className="flex justify-center"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Book a Service
                </h2>
                <button
                  onClick={closeBookingModal}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service</label>
                    <select name="service" value={bookingForm.service} onChange={(e) => {
                      handleInputChange(e);
                      const next = getServiceTypesFor(e.target.value);
                      setBookingForm((prev) => ({ ...prev, serviceType: next[0] || '' }));
                    }} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} required>
                      <option value="">Select a service</option>
                      {services.map((s, idx) => (
                        <option key={idx} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Service Type</label>
                    <select name="serviceType" value={bookingForm.serviceType} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} required>
                      <option value="">Select type</option>
                      {getServiceTypesFor(bookingForm.service).map((t, idx) => (
                        <option key={idx} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preferred Date</label>
                    <input type="date" name="date" value={bookingForm.date} onChange={handleInputChange} required className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preferred Time</label>
                    <select name="time" value={bookingForm.time} onChange={handleInputChange} required className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                      <option value="">Select time</option>
                      {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Instructions</label>
                  <input name="instruction" value={bookingForm.instruction} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="Any specific instructions" />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                  <textarea name="address" value={bookingForm.address} onChange={handleInputChange} required rows={3} className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="Enter your complete address" />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                  <input type="tel" name="phone" value={bookingForm.phone} onChange={handleInputChange} required className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder="Enter your phone number" />
                </div>

                {bookingError && <div className="text-red-600 text-sm">{bookingError}</div>}
                {bookingSuccess && <div className="text-green-600 text-sm">{bookingSuccess}</div>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeBookingModal} className={`flex-1 px-6 py-3 rounded-lg font-semibold border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors duration-200`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingSubmitting} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg">
                    {bookingSubmitting ? 'Submitting…' : 'Book Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expert Registration Modal */}
      {isExpertRegistrationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Join as Service Expert
                </h2>
                <button
                  onClick={closeExpertRegistrationModal}
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleExpertRegistrationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={expertRegistrationForm.fullName}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={expertRegistrationForm.phone}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={expertRegistrationForm.email}
                      onChange={handleExpertInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Service Category *
                    </label>
                    <select
                      name="serviceCategory"
                      value={expertRegistrationForm.serviceCategory}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select your service category</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Painter">Painter</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="House Cleaning">House Cleaning</option>
                      <option value="AC Service">AC Service</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Interior Design">Interior Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Years of Experience *
                    </label>
                    <select
                      name="experience"
                      value={expertRegistrationForm.experience}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select experience</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-3 years">1-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hourly Rate (₹) *
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={expertRegistrationForm.hourlyRate}
                      onChange={handleExpertInputChange}
                      required
                      min="100"
                      max="2000"
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your hourly rate"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={expertRegistrationForm.address}
                    onChange={handleExpertInputChange}
                    required
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ID Proof Type *
                    </label>
                    <select
                      name="idProof"
                      value={expertRegistrationForm.idProof}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select ID proof</option>
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      ID Number *
                    </label>
                    <input
                      type="text"
                      name="idNumber"
                      value={expertRegistrationForm.idNumber}
                      onChange={handleExpertInputChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your ID number"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Availability *
                  </label>
                  <select
                    name="availability"
                    value={expertRegistrationForm.availability}
                    onChange={handleExpertInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  >
                    <option value="">Select availability</option>
                    <option value="Full-time (6+ hours daily)">Full-time (6+ hours daily)</option>
                    <option value="Part-time (3-5 hours daily)">Part-time (3-5 hours daily)</option>
                    <option value="Weekends only">Weekends only</option>
                    <option value="Evenings only">Evenings only</option>
                    <option value="Flexible schedule">Flexible schedule</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• We'll verify your documents within 24 hours</li>
                    <li>• Complete background verification process</li>
                    <li>• Set up your service profile and pricing</li>
                    <li>• Start receiving customer bookings</li>
                  </ul>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeExpertRegistrationModal}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-lg"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Component */}
      <div className={`fixed bottom-6 right-6 z-50 ${isChatOpen ? 'w-96 h-[32rem]' : 'w-auto h-auto'} transition-all duration-300`}>
        {!isChatOpen ? (
          // Chat Toggle Button
          <button
            onClick={toggleChat}
            className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group`}
            aria-label="Open chat"
          >
            <HeadphonesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </button>
        ) : (
          // Chat Window
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl border h-full flex flex-col`}>
            {/* Chat Header */}
            <div className={`${isDarkMode ? 'bg-blue-700' : 'bg-blue-600'} text-white px-6 py-4 rounded-t-2xl flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <HeadphonesIcon className="w-6 h-6" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-semibold">Servecure Assistant</h3>
                  <p className="text-blue-100 text-sm">Always here to help</p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="hover:bg-blue-800 p-1 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-200 rounded-2xl rounded-bl-md'
                        : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                  } px-4 py-3`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    {/* Intent Badge for Bot Messages */}
                    {msg.type === 'bot' && msg.intent && msg.intent !== 'error' && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          msg.intent === 'careers' 
                            ? 'bg-green-100 text-green-800' 
                            : msg.intent === 'services'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {msg.intent}
                        </span>
                      </div>
                    )}
                    
                    {/* Suggested Actions */}
                    {msg.type === 'bot' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.suggestedActions.slice(0, 3).map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestedAction(action)}
                            className={`block w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                              isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      msg.type === 'user' ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl rounded-bl-md px-4 py-3`}>
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`}></div>
                      <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                      <div className={`w-2 h-2 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {chatError && (
              <div className="px-4 py-2">
                <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {chatError}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything about Servecure..."
                  className={`flex-1 px-4 py-2 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isTyping ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {['What services do you offer?', 'Any job openings?', 'How does it work?'].map((quickMsg, index) => (
                  <button
                    key={index}
                    onClick={() => sendChatMessage(quickMsg)}
                    disabled={isTyping}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    } disabled:opacity-50`}
                  >
                    {quickMsg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;