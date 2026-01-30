import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppContent, Language, TextContent } from './types.ts';
import { INITIAL_CONTENT } from './constants.ts';

// --- Utility Components ---

// Button Component
const Button: React.FC<{ 
  onClick?: () => void; 
  children: React.ReactNode; 
  variant?: 'primary' | 'outline' | 'ghost' | 'hero-outline' | 'magic';
  className?: string;
  disabled?: boolean;
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const base = "px-6 py-3 rounded-full font-bold transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const hoverEffect = disabled ? "" : "hover:scale-105";
  
  const variants = {
    primary: `bg-ice-500 hover:bg-ice-600 text-white shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] ${hoverEffect}`,
    outline: `border-2 border-ice-500 text-ice-600 hover:bg-ice-500 hover:text-white ${hoverEffect}`,
    "hero-outline": `border-2 border-white text-white hover:bg-white hover:text-slate-900 ${hoverEffect}`,
    ghost: `text-slate-500 hover:text-slate-900 ${hoverEffect}`,
    magic: `bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg ${hoverEffect}`
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- Editable Wrapper Component ---
interface EditableProps {
  content: string;
  isEditing: boolean;
  onSave: (newVal: string) => void;
  className?: string;
  multiline?: boolean;
}

const EditableText: React.FC<EditableProps> = ({ content, isEditing, onSave, className = "", multiline = false }) => {
  if (!isEditing) {
    return <span className={className} dangerouslySetInnerHTML={{__html: content}} />;
  }

  const inputClasses = "bg-white border-2 border-ice-300 rounded p-2 text-slate-900 w-full focus:border-ice-500 focus:outline-none shadow-inner";

  return multiline ? (
    <textarea
      className={`${inputClasses} ${className}`}
      defaultValue={content}
      onBlur={(e) => onSave(e.target.value)}
      autoFocus
    />
  ) : (
    <input
      type="text"
      className={`${inputClasses} ${className}`}
      defaultValue={content}
      onBlur={(e) => onSave(e.target.value)}
      autoFocus
    />
  );
};

// --- Image Placeholder / Upload Wrapper ---
const ImageWrapper: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string;
  isEditing: boolean;
  onImageUpdate?: (newSrc: string) => void; 
  onGenerateAI?: () => void;
  isGenerating?: boolean;
  overlayPosition?: 'center' | 'bottom-right';
}> = ({ src, alt, className, isEditing, onImageUpdate, onGenerateAI, isGenerating, overlayPosition = 'center' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [tempUrl, setTempUrl] = useState(src);

  // Sync tempUrl if src prop changes externally
  useEffect(() => {
    setTempUrl(src);
  }, [src]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImageUpdate) {
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        alert("Image is too large! Please choose an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onImageUpdate(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUrlSave = () => {
    if (onImageUpdate && tempUrl) {
      onImageUpdate(tempUrl);
    }
    setUrlMode(false);
  };

  const positionClasses = overlayPosition === 'bottom-right' 
    ? 'items-end justify-end pr-8 pb-32 md:pb-12 md:pr-12' // Extra bottom padding for mobile toolbar clearance
    : 'items-center justify-center p-6';

  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt={alt} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isGenerating ? 'blur-sm scale-110' : ''}`} />
      
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-white text-center">
            <i className="fa-solid fa-spinner fa-spin text-4xl mb-2"></i>
            <p>Creating Magic...</p>
          </div>
        </div>
      )}

      {isEditing && !isGenerating && (
        <div className={`absolute inset-0 bg-black/60 flex flex-col ${positionClasses} opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
          
          {urlMode ? (
            <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col gap-3 w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
               <h4 className="text-sm font-bold text-slate-700 flex justify-between items-center">
                 <span>Image URL</span>
                 <button onClick={() => setUrlMode(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
               </h4>
               <input 
                  type="text" 
                  value={tempUrl} 
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="border border-slate-300 p-2 rounded text-sm text-slate-900 w-full focus:border-ice-500 outline-none"
                  autoFocus
               />
               <div className="flex gap-2 justify-end pt-2">
                   <button onClick={() => setUrlMode(false)} className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2">Cancel</button>
                   <button onClick={handleUrlSave} className="text-xs bg-ice-500 hover:bg-ice-600 text-white px-4 py-2 rounded-full font-bold">Set Image</button>
               </div>
            </div>
          ) : (
            <div className={`flex flex-col gap-3 ${overlayPosition === 'bottom-right' ? 'items-end' : 'items-center'}`}>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-ice-50 transition-colors flex items-center gap-2 shadow-lg min-w-[180px] justify-center"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-ice-500"></i> Upload Photo
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); setUrlMode(true); }}
                  className="bg-black/40 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-white/20 transition-colors flex items-center gap-2 shadow-lg min-w-[180px] justify-center"
                >
                  <i className="fa-solid fa-link"></i> Paste URL
                </button>

                {onGenerateAI && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onGenerateAI(); }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg min-w-[180px] justify-center"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI Generate
                  </button>
                )}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

// --- Video Wrapper Component ---
const VideoWrapper: React.FC<{
  url: string;
  isEditing: boolean;
  onUpdate: (newUrl: string) => void;
  className?: string;
}> = ({ url, isEditing, onUpdate, className }) => {
  const [urlMode, setUrlMode] = useState(false);
  const [tempUrl, setTempUrl] = useState(url);

  useEffect(() => {
    setTempUrl(url);
  }, [url]);

  const handleUrlSave = () => {
    if (onUpdate && tempUrl) {
      onUpdate(tempUrl);
    }
    setUrlMode(false);
  };

  // Basic Helper to convert standard youtube watch links to embed
  const getEmbedUrl = (input: string) => {
    // Regex for YouTube ID
    const ytMatch = input.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    return input;
  };

  const finalUrl = getEmbedUrl(url);

  return (
    <div className={`relative group overflow-hidden bg-black rounded-xl aspect-video shadow-lg ${className}`}>
        {/* Simple iframe for YouTube/Vimeo/etc. */}
        <iframe
          src={finalUrl}
          title="Video player"
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        
        {/* Edit Overlay */}
        {isEditing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 p-6">
                {urlMode ? (
                   <div className="bg-white p-4 rounded-xl shadow-2xl flex flex-col gap-3 w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <h4 className="text-sm font-bold text-slate-700 flex justify-between items-center">
                        <span>Video URL</span>
                        <button onClick={() => setUrlMode(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
                        </h4>
                        <input 
                            type="text" 
                            value={tempUrl} 
                            onChange={(e) => setTempUrl(e.target.value)}
                            placeholder="Paste YouTube or MP4 Link"
                            className="border border-slate-300 p-2 rounded text-sm text-slate-900 w-full focus:border-ice-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setUrlMode(false)} className="text-xs text-slate-500 hover:text-slate-800 px-3 py-2">Cancel</button>
                            <button onClick={handleUrlSave} className="text-xs bg-ice-500 hover:bg-ice-600 text-white px-4 py-2 rounded-full font-bold">Set Video</button>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setUrlMode(true); }}
                        className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-ice-50 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <i className="fa-brands fa-youtube text-red-600"></i> Change Video Link
                    </button>
                )}
            </div>
        )}
    </div>
  )
}

// --- Main App Component ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [content, setContent] = useState<AppContent>(INITIAL_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPublishHelp, setShowPublishHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Settings State
  const [storedPassword, setStoredPassword] = useState(() => localStorage.getItem('site_password') || 'admin');
  const [newPassword, setNewPassword] = useState('');
  
  // AI Gen State
  const [isGeneratingHero, setIsGeneratingHero] = useState(false);

  useEffect(() => {
    try {
      const savedContent = localStorage.getItem('site_content');
      if (savedContent) {
        const parsed = JSON.parse(savedContent);
        // Deep merge logic simplified for this context: 
        // We ensure newer keys from INITIAL_CONTENT exist if missing in storage
        const mergedContent = { 
            ...INITIAL_CONTENT, 
            ...parsed,
            testimonials: parsed.testimonials || INITIAL_CONTENT.testimonials,
            heroImage: parsed.heroImage || INITIAL_CONTENT.heroImage,
            galleryImages: parsed.galleryImages || INITIAL_CONTENT.galleryImages
        };
        setContent(mergedContent);
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  const saveChanges = () => {
    try {
      localStorage.setItem('site_content', JSON.stringify(content));
      alert('Changes saved successfully to your browser!');
      setIsEditing(false);
    } catch (e) {
      alert("Storage full! Try using smaller images or external URLs.");
    }
  };

  const changePassword = () => {
    if (newPassword.length < 3) {
      alert("Password must be at least 3 characters.");
      return;
    }
    localStorage.setItem('site_password', newPassword);
    setStoredPassword(newPassword);
    setNewPassword('');
    alert("Admin password updated successfully!");
    setShowSettings(false);
  };

  const updateContent = (path: string[], value: any) => {
    const newContent = JSON.parse(JSON.stringify(content));
    let current: any = newContent;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setContent(newContent);
  };

  const toggleAdmin = () => {
    if (isEditing) {
      setIsEditing(false);
      return;
    }
    if (adminPassword === storedPassword || localStorage.getItem('isAdmin') === 'true') {
      setIsEditing(true);
      localStorage.setItem('isAdmin', 'true');
      setShowAdminPanel(false);
      setAdminPassword('');
    } else {
      alert('Incorrect password. Default is "admin"');
    }
  };

  // AI Generation Function
  const generateHeroWithAI = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing. Cannot generate AI images.");
      return;
    }

    setIsGeneratingHero(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: "A cinematic, low-angle shot of ice hockey skates carving into the ice, dynamic motion blur, stadium lights reflecting on the ice surface, high contrast, professional sports photography, 8k resolution" }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9", imageSize: "2K" }
        }
      });
      
      let newImageBase64 = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            newImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (newImageBase64) {
        updateContent(['heroImage'], newImageBase64);
      } else {
        alert("AI generated content, but no image data found. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate image. Please try again later.");
    } finally {
      setIsGeneratingHero(false);
    }
  };

  const getFullConfigContent = () => {
     return `import { AppContent } from './types.ts';

export const INITIAL_CONTENT: AppContent = ${JSON.stringify(content, null, 2)};`;
  };

  const downloadConfig = () => {
    const blob = new Blob([getFullConfigContent()], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", "constants.ts");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };
  
  const copyConfig = () => {
      navigator.clipboard.writeText(getFullConfigContent()).then(() => {
          alert("Data copied! You can now replace the ENTIRE content of 'constants.ts' with this.");
      });
  };

  const t = (obj: TextContent) => obj[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* --- Navigation Bar --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="text-2xl font-bold tracking-wider text-ice-600 uppercase">
              {isEditing ? (
                 <EditableText 
                   content={content.hero.title[lang]} 
                   isEditing={true} 
                   onSave={(val) => updateContent(['hero', 'title', lang], val)} 
                 />
              ) : t(content.hero.title)}
            </div>
            
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => setLang(lang === 'en' ? 'cn' : 'en')}
                className="flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-ice-600 transition-colors"
              >
                <i className="fa-solid fa-globe"></i>
                <span>{lang === 'en' ? '中文' : 'English'}</span>
              </button>
              
              <a href="#contact">
                <Button variant="primary" className="hidden sm:block text-sm py-2 px-4">
                  {t(content.hero.cta)}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWrapper 
            src={content.heroImage} 
            alt="Hero Background" 
            className="w-full h-full" 
            isEditing={isEditing}
            onImageUpdate={(val) => updateContent(['heroImage'], val)}
            onGenerateAI={generateHeroWithAI}
            isGenerating={isGeneratingHero}
            overlayPosition="bottom-right"
          />
          {/* Gradient to blend into white body */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/40 to-slate-900/30"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in mt-16">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-xl">
            <EditableText 
              content={content.hero.title[lang]} 
              isEditing={isEditing} 
              onSave={(val) => updateContent(['hero', 'title', lang], val)} 
            />
          </h1>
          <p className="text-xl md:text-3xl text-ice-50 mb-8 font-light tracking-wide drop-shadow-md">
             <EditableText 
              content={content.hero.subtitle[lang]} 
              isEditing={isEditing} 
              onSave={(val) => updateContent(['hero', 'subtitle', lang], val)} 
            />
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <a href="#contact">
              <Button variant="primary">
                 {t(content.hero.cta)}
              </Button>
            </a>
            <a href="#services">
              <Button variant="hero-outline">
                {lang === 'en' ? 'View Programs' : '查看课程'}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* --- About Timeline Section --- */}
      <section id="about" className="py-20 px-4 bg-slate-50 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">
            <EditableText content={content.about.title[lang]} isEditing={isEditing} onSave={(val) => updateContent(['about', 'title', lang], val)} />
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-16 text-lg">
             <EditableText content={content.about.intro[lang]} isEditing={isEditing} multiline onSave={(val) => updateContent(['about', 'intro', lang], val)} />
          </p>

          <div className="relative border-l-2 border-ice-200 ml-4 md:ml-0 md:pl-0 md:border-none space-y-12">
             {/* Desktop Center Line */}
             <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-ice-200 -translate-x-1/2"></div>

             {content.about.timeline.map((item, idx) => (
               <div key={idx} className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  {/* Dot */}
                  <div className="absolute left-[-5px] md:left-1/2 top-0 md:top-1/2 w-4 h-4 rounded-full bg-white border-4 border-ice-500 shadow-md md:-translate-x-1/2 md:-translate-y-1/2 z-10"></div>
                  
                  {/* Content */}
                  <div className="md:w-1/2 pl-8 md:pl-0 md:px-10 mb-4 md:mb-0">
                    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-ice-300 transition-all ${idx % 2 === 0 ? 'text-left' : 'md:text-right text-left'}`}>
                       <span className="text-ice-600 font-bold text-sm tracking-wider uppercase mb-1 block">
                         <EditableText content={item.year} isEditing={isEditing} onSave={(val) => {
                           const newTimeline = [...content.about.timeline];
                           newTimeline[idx].year = val;
                           updateContent(['about', 'timeline'], newTimeline as any);
                         }} />
                       </span>
                       <h3 className="text-xl font-bold text-slate-800 mb-2">
                          <EditableText content={item.title[lang]} isEditing={isEditing} onSave={(val) => {
                             const newTimeline = [...content.about.timeline];
                             newTimeline[idx].title[lang] = val;
                             updateContent(['about', 'timeline'], newTimeline as any);
                           }} />
                       </h3>
                       <p className="text-slate-600 text-sm">
                          <EditableText content={item.description[lang]} isEditing={isEditing} onSave={(val) => {
                             const newTimeline = [...content.about.timeline];
                             newTimeline[idx].description[lang] = val;
                             updateContent(['about', 'timeline'], newTimeline as any);
                           }} />
                       </p>
                    </div>
                  </div>
                  {/* Empty Spacer */}
                  <div className="md:w-1/2"></div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- Services Section --- */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900">
            <EditableText content={content.services.title[lang]} isEditing={isEditing} onSave={(val) => updateContent(['services', 'title', lang], val)} />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.services.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:border-ice-200 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 rounded-full bg-white border border-ice-100 flex items-center justify-center mb-6 text-ice-500 group-hover:bg-ice-500 group-hover:text-white transition-colors shadow-sm">
                  <i className={`fa-solid ${item.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">
                  <EditableText content={item.title[lang]} isEditing={isEditing} onSave={(val) => {
                    const newItems = [...content.services.items];
                    newItems[idx].title[lang] = val;
                    updateContent(['services', 'items'], newItems as any);
                  }} />
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  <EditableText content={item.description[lang]} isEditing={isEditing} multiline onSave={(val) => {
                    const newItems = [...content.services.items];
                    newItems[idx].description[lang] = val;
                    updateContent(['services', 'items'], newItems as any);
                  }} />
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Awards & Gallery Grid --- */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Awards Text */}
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">
                <EditableText content={content.awards.title[lang]} isEditing={isEditing} onSave={(val) => updateContent(['awards', 'title', lang], val)} />
              </h2>
              <ul className="space-y-6">
                {content.awards.items.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-ice-500 flex items-center justify-center mr-4 mt-1 border border-ice-200 shadow-sm">
                      <i className="fa-solid fa-trophy text-sm"></i>
                    </span>
                    <span className="text-lg text-slate-700">
                      <EditableText content={item[lang]} isEditing={isEditing} multiline onSave={(val) => {
                        const newItems = [...content.awards.items];
                        newItems[idx][lang] = val;
                        updateContent(['awards', 'items'], newItems as any);
                      }} />
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="p-6 mt-8 bg-ice-50 border-l-4 border-ice-500 rounded-r-lg">
                <p className="text-ice-800 italic font-medium">
                  "{lang === 'en' ? "I'm not just teaching skills; I'm building confidence on the ice." : "我不只是教技巧，更是建立冰上的自信。"}"
                </p>
              </div>
            </div>

            {/* Photo Grid - Masonry Style */}
            <div className="grid grid-cols-2 gap-4 h-[600px]">
              {/* Image 1 - Tall */}
              <ImageWrapper 
                src={content.galleryImages[0]} 
                alt="Gallery 1" 
                className="col-span-1 row-span-2 rounded-2xl shadow-md border border-slate-200" 
                isEditing={isEditing}
                onImageUpdate={(src) => {
                   const newGallery = [...content.galleryImages];
                   newGallery[0] = src;
                   updateContent(['galleryImages'], newGallery);
                }}
              />
              {/* Image 2 */}
              <ImageWrapper 
                src={content.galleryImages[1]} 
                alt="Gallery 2" 
                className="col-span-1 row-span-1 rounded-2xl shadow-md border border-slate-200"
                isEditing={isEditing}
                onImageUpdate={(src) => {
                   const newGallery = [...content.galleryImages];
                   newGallery[1] = src;
                   updateContent(['galleryImages'], newGallery);
                }}
              />
              {/* Image 3 */}
              <ImageWrapper 
                src={content.galleryImages[2]} 
                alt="Gallery 3" 
                className="col-span-1 row-span-1 rounded-2xl shadow-md border border-slate-200"
                isEditing={isEditing}
                onImageUpdate={(src) => {
                   const newGallery = [...content.galleryImages];
                   newGallery[2] = src;
                   updateContent(['galleryImages'], newGallery);
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- Video Testimonials Section (Moved Here) --- */}
      <section className="py-20 px-4 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-900">
                <EditableText content={content.testimonials.title[lang]} isEditing={isEditing} onSave={(val) => updateContent(['testimonials', 'title', lang], val)} />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.testimonials.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                        <VideoWrapper 
                            url={item.url}
                            isEditing={isEditing}
                            onUpdate={(newUrl) => {
                                const newItems = [...content.testimonials.items];
                                newItems[idx].url = newUrl;
                                updateContent(['testimonials', 'items'], newItems as any);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="py-20 px-4 bg-slate-50 relative border-t border-slate-200">
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">
            <EditableText content={content.contact.title[lang]} isEditing={isEditing} onSave={(val) => updateContent(['contact', 'title', lang], val)} />
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            <EditableText content={content.contact.desc[lang]} isEditing={isEditing} multiline onSave={(val) => updateContent(['contact', 'desc', lang], val)} />
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-12">
            <a href={`mailto:${content.contact.email}`} className="bg-slate-50 p-8 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-slate-100 group w-full md:w-1/3">
              <i className="fa-solid fa-envelope text-4xl text-ice-500 mb-4 group-hover:scale-110 transition-transform"></i>
              <h3 className="text-slate-900 font-bold mb-2">Email</h3>
              <p className="text-slate-600 text-sm break-all">
                <EditableText content={content.contact.email} isEditing={isEditing} onSave={(val) => updateContent(['contact', 'email'], val)} />
              </p>
            </a>
            
            <a href={`tel:${content.contact.phone.replace(/\D/g,'')}`} className="bg-slate-50 p-8 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-slate-100 group w-full md:w-1/3">
              <i className="fa-solid fa-phone text-4xl text-ice-500 mb-4 group-hover:scale-110 transition-transform"></i>
              <h3 className="text-slate-900 font-bold mb-2">Phone / WeChat</h3>
              <p className="text-slate-600 text-sm">
                <EditableText content={content.contact.phone} isEditing={isEditing} onSave={(val) => updateContent(['contact', 'phone'], val)} />
              </p>
            </a>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 w-full md:w-1/3">
              <i className="fa-solid fa-location-dot text-4xl text-ice-500 mb-4"></i>
              <h3 className="text-slate-900 font-bold mb-2">Location</h3>
              <p className="text-slate-600 text-sm">
                <EditableText content={content.contact.location[lang]} isEditing={isEditing} onSave={(val) => updateContent(['contact', 'location', lang], val)} />
              </p>
            </div>
          </div>
          
          <div className="flex justify-center space-x-6">
             {/* Social Placeholders */}
             <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-ice-500 hover:text-white hover:-translate-y-1 transition-all">
               <i className="fa-brands fa-instagram text-xl"></i>
             </a>
             <a href="#" className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-green-500 hover:text-white hover:-translate-y-1 transition-all">
               <i className="fa-brands fa-weixin text-xl"></i>
             </a>
          </div>
        </div>
      </section>

      {/* --- Footer & Edit Trigger --- */}
      <footer className="py-8 bg-slate-100 text-center text-slate-500 text-sm relative border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} Louis Gu. All rights reserved.</p>
        
        {/* Secret Edit Trigger */}
        <button 
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="absolute bottom-4 right-4 text-slate-400 hover:text-slate-800"
          title="Admin Login"
        >
          <i className="fa-solid fa-lock"></i>
        </button>
      </footer>

      {/* --- Admin / Edit Login Panel --- */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-ice-200 shadow-2xl">
             <h3 className="text-2xl font-bold text-slate-900 mb-4">Site Editor Mode</h3>
             <p className="text-slate-600 mb-6 text-sm">
               Enter password to edit text and images directly on the screen.
               <br/><span className="text-xs text-slate-400">(Default: admin)</span>
             </p>
             <input 
               type="password" 
               placeholder="Password"
               className="w-full bg-slate-50 border border-slate-300 rounded p-3 text-slate-900 mb-4 focus:border-ice-500 outline-none"
               value={adminPassword}
               onChange={(e) => setAdminPassword(e.target.value)}
             />
             <div className="flex gap-4">
               <Button onClick={toggleAdmin} className="w-full">
                 Enter Edit Mode
               </Button>
               <button onClick={() => setShowAdminPanel(false)} className="text-slate-500 hover:text-slate-900 px-4">
                 Cancel
               </button>
             </div>
          </div>
        </div>
      )}

      {/* --- Publish Help Modal --- */}
      {showPublishHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full border border-ice-200 shadow-2xl relative overflow-y-auto max-h-[90vh]">
             <button onClick={() => setShowPublishHelp(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <h3 className="text-2xl font-bold text-slate-900 mb-4"><i className="fa-solid fa-rocket text-ice-500 mr-2"></i> Host Forever (Free!)</h3>
             
             <div className="space-y-6 text-slate-600 text-sm">
               <p className="text-lg">Netlify "Drop" deletes sites after 1 hour or 30 days. <br/> To keep your site <strong>forever for free</strong>, use <strong>GitHub Pages</strong>. It is simple!</p>

               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-ice-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-slate-900">Sign Up for GitHub</h4>
                      <p>Go to <a href="https://github.com" target="_blank" className="text-ice-600 underline">github.com</a> and create a free account.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="bg-ice-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                     <div>
                       <h4 className="font-bold text-slate-900">Create a "Repository"</h4>
                       <p>Click the <strong>+</strong> icon (top right) -> <strong>New repository</strong>. Name it <code>my-hockey-site</code>. Check "Add a README file" and click <strong>Create repository</strong>.</p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="bg-ice-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                     <div>
                       <h4 className="font-bold text-slate-900">Upload Your Files</h4>
                       <p>First, click the "Download" button in your AI tool to get your code files.</p>
                       <p className="mt-1">In GitHub, click <strong>Add file</strong> -> <strong>Upload files</strong>. Drag ALL your files there. Click the green <strong>Commit changes</strong> button.</p>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="bg-ice-500 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                     <div>
                       <h4 className="font-bold text-slate-900">Turn on the Website</h4>
                       <p>Go to the <strong>Settings</strong> tab (gear icon). On the left, click <strong>Pages</strong>.</p>
                       <p className="mt-1">Under "Branch", select <strong>main</strong> and click <strong>Save</strong>. Wait 1 minute, refresh, and your link will appear!</p>
                     </div>
                  </div>
               </div>

               <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-lg text-blue-900 mb-2">How to Edit Later?</h4>
                  <p className="mb-2 text-blue-800">
                    If you want to change text or images later:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-blue-800">
                    <li>Make your edits here in "Edit Mode" and click <strong>Save</strong>.</li>
                    <li>Click the <strong>Copy Data</strong> button below.</li>
                    <li>Go to your GitHub repository and find the file named <code>constants.ts</code>.</li>
                    <li>Click the <strong>Pencil Icon</strong> to edit it.</li>
                    <li><strong>Select All</strong> and <strong>Paste</strong> the new code. Click <strong>Commit changes</strong>.</li>
                  </ol>
                  <div className="mt-4 flex gap-2">
                     <Button onClick={copyConfig} className="text-xs py-2 px-3">
                        <i className="fa-solid fa-copy mr-1"></i> Copy Full "constants.ts"
                     </Button>
                     <Button onClick={downloadConfig} variant="outline" className="text-xs py-2 px-3">
                        <i className="fa-solid fa-download mr-1"></i> Download "constants.ts"
                     </Button>
                  </div>
               </div>
             </div>

             <div className="mt-6 flex justify-end">
               <Button onClick={() => setShowPublishHelp(false)}>Close</Button>
             </div>
          </div>
        </div>
      )}

      {/* --- Settings / Password Modal --- */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-ice-200 shadow-2xl relative">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800">
               <i className="fa-solid fa-xmark text-xl"></i>
             </button>
             <h3 className="text-2xl font-bold text-slate-900 mb-4"><i className="fa-solid fa-gear text-ice-500 mr-2"></i> Settings</h3>
             
             <div className="mb-6">
                <label className="block text-slate-600 text-sm font-bold mb-2">Change Admin Password</label>
                <input 
                  type="text" 
                  placeholder="New Password"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-3 text-slate-900 focus:border-ice-500 outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
             </div>
             
             <div className="flex justify-end gap-3">
               <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-slate-500 hover:text-slate-800">Cancel</button>
               <Button onClick={changePassword}>Update Password</Button>
             </div>
          </div>
        </div>
      )}

      {/* --- Edit Mode Toolbar --- */}
      {isEditing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-ice-200 rounded-full px-6 py-3 shadow-2xl z-[100] flex items-center gap-4 animate-slide-up">
           <span className="text-ice-600 font-bold text-sm hidden sm:inline"><i className="fa-solid fa-pen-to-square mr-2"></i>Edit Mode</span>
           <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
           
           <button onClick={saveChanges} className="text-green-600 hover:text-green-500 font-semibold text-sm flex items-center">
             <i className="fa-solid fa-floppy-disk mr-1"></i> <span className="hidden sm:inline">Save</span>
           </button>
           
           <button onClick={downloadConfig} className="text-slate-700 hover:text-ice-600 font-semibold text-sm flex items-center" title="Download content as JSON">
             <i className="fa-solid fa-file-export mr-1"></i> <span className="hidden sm:inline">Backup Data</span>
           </button>

           <button onClick={() => setShowPublishHelp(true)} className="text-ice-600 hover:text-ice-500 font-semibold text-sm flex items-center" title="How to publish">
             <i className="fa-solid fa-circle-question mr-1"></i> <span className="hidden sm:inline">Publish</span>
           </button>

           <button onClick={() => setShowSettings(true)} className="text-slate-500 hover:text-slate-800 font-semibold text-sm flex items-center" title="Settings">
             <i className="fa-solid fa-gear mr-1"></i> <span className="hidden sm:inline">Settings</span>
           </button>
           
           <div className="h-6 w-px bg-slate-200"></div>

           <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-400 font-semibold text-sm">
             Exit
           </button>
        </div>
      )}
    </div>
  );
}