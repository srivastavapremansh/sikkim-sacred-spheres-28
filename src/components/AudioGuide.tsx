import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Volume2, 
  MapPin,
  Headphones,
  Languages
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import audioGuideHero from "@/assets/audio-guide-hero.jpg";

const audioGuides = [
  {
    id: 1,
    title: "Your Custom Audio Guide", // Change this to your guide name
    monastery: "Your Monastery Name", // Change this to your monastery
    duration: "45 minutes", // Update duration
    tracks: 12,
    languages: ["English", "Hindi", "Nepali", "Tibetan"],
    description: "Your custom audio guide description here",
    type: "Complete Tour",
    size: "125 MB",
    offline: true,
    youtubeId: "X7tgD2W_cNs", // Keep as fallback
    audioSrc: "/aud_eng.mp3", // Your uploaded webm audio file
    useLocalAudio: true, // Flag to use local audio
  },
  {
    id: 2,
    title: "Gonjang Monastery 360° Experience",
    monastery: "Gonjang Monastery",
    duration: "30 minutes",
    tracks: 8,
    languages: ["English", "Hindi"],
    description: "Immersive 360° audio experience of Gonjang Monastery near Gangtok with architectural insights and prayer spaces.",
    type: "360° Audio",
    size: "85 MB",
    offline: true,
    youtubeId: "YcQ8uLZHjyE",
    audioSrc: "https://www.soundjay.com/misc/sounds/temple-bell-2.wav",
  },
  {
    id: 3,
    title: "Ranka Monastery Sacred Journey",
    monastery: "Ranka Monastery",
    duration: "25 minutes",
    tracks: 6,
    languages: ["English", "Hindi", "Lepcha"],
    description: "Journey through Ranka Monastery with detailed narration about traditional architecture and spiritual significance.",
    type: "Sacred Journey",
    size: "70 MB",
    offline: true,
    youtubeId: "pF8N2rk6yjI",
    audioSrc: "https://www.soundjay.com/misc/sounds/temple-bell-3.wav",
  },
  {
    id: 4,
    title: "Sikkim Monasteries Heritage Walk",
    monastery: "Multiple Monasteries",
    duration: "60 minutes",
    tracks: 15,
    languages: ["English", "Hindi", "Nepali"],
    description: "Comprehensive audio journey through Sikkim's monastery heritage featuring founding stories, reconstruction details, and architectural elegance.",
    type: "Heritage Collection",
    size: "180 MB",
    offline: true,
    youtubeId: "dQw4w9WgXcQ",
    audioSrc: "https://www.soundjay.com/misc/sounds/meditation-1.wav",
  },
];

export const AudioGuide = () => {
  const [selectedGuide, setSelectedGuide] = useState<typeof audioGuides[0] | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  // Generate audio URL with monastery-specific content
  const getAudioUrl = () => {
    if (!selectedGuide) return '';
    
    // Use local webm audio if available, otherwise fallback to online source
    if (selectedGuide.useLocalAudio && selectedGuide.audioSrc.startsWith('/audio/')) {
      return selectedGuide.audioSrc;
    }
    
    // Fallback to external audio source
    return selectedGuide.audioSrc || 'https://www.soundjay.com/misc/sounds/temple-bell-1.wav';
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedGuide) return;

    const handleLoadedData = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const total = audio.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      // Auto advance to next track
      if (currentTrack < selectedGuide.tracks) {
        setCurrentTrack(currentTrack + 1);
      }
    };

    const handleError = () => {
      toast({
        title: "Audio Error",
        description: "Unable to load audio. Playing demo sound instead.",
        variant: "destructive",
      });
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [selectedGuide, currentTrack, toast]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        await audio.pause();
        setIsPlaying(false);
        toast({
          title: "Audio Paused",
          description: `Track ${currentTrack} paused`,
        });
      } else {
        await audio.play();
        setIsPlaying(true);
        toast({
          title: "Audio Playing",
          description: `Track ${currentTrack} of ${selectedGuide?.tracks} - ${selectedLanguage}`,
        });
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Playback Error",
        description: "Unable to play audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (guide: typeof audioGuides[0]) => {
    toast({
      title: "Download Started",
      description: `Downloading ${guide.title} (${guide.size})`,
    });
  };

  const handleTrackChange = (direction: "prev" | "next") => {
    if (!selectedGuide) return;
    
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    if (direction === "next" && currentTrack < selectedGuide.tracks) {
      setCurrentTrack(currentTrack + 1);
    } else if (direction === "prev" && currentTrack > 1) {
      setCurrentTrack(currentTrack - 1);
    }
    setProgress(0);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (selectedGuide) {
    return (
      <div className="w-full min-h-screen bg-gradient-mountain text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Audio Player Header */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setSelectedGuide(null)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ← Back to Guides
              </Button>
              <div className="flex space-x-2">
                {selectedGuide.languages.map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang)}
                    className="text-xs !text-black"
                  >
                    {lang}
                  </Button>
                ))}
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{selectedGuide.title}</h1>
            <p className="text-gray-300 mb-4">{selectedGuide.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Monastery:</span>
                <p className="font-medium">{selectedGuide.monastery}</p>
              </div>
              <div>
                <span className="text-gray-400">Duration:</span>
                <p className="font-medium">{selectedGuide.duration}</p>
              </div>
              <div>
                <span className="text-gray-400">Tracks:</span>
                <p className="font-medium">{selectedGuide.tracks}</p>
              </div>
              <div>
                <span className="text-gray-400">Language:</span>
                <p className="font-medium">{selectedLanguage}</p>
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={getAudioUrl()}
            preload="metadata"
            loop
          />

          {/* YouTube Audio Source (for reference) */}
          {selectedGuide?.youtubeId && (
            <div className="hidden">
              <iframe
                src={`https://www.youtube.com/embed/${selectedGuide.youtubeId}?enablejsapi=1&controls=0&modestbranding=1&loop=1&playlist=${selectedGuide.youtubeId}`}
                title={`${selectedGuide.title} Audio Source`}
                allow="autoplay"
              />
            </div>
          )}

          {/* Audio Player */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Track {currentTrack} of {selectedGuide.tracks}</h3>
              <p className="text-gray-300">
                {currentTrack === 1 ? "Introduction to Sacred Spaces" :
                 currentTrack === 2 ? "History and Architecture" :
                 currentTrack === 3 ? "Prayer Halls and Artifacts" :
                 currentTrack === 4 ? "Monk Quarters and Daily Life" :
                 "Buddhist Traditions and Rituals"}
              </p>
            </div>

            <div className="mb-6">
              <Progress value={progress} className="w-full h-2 bg-white/20" />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 0)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTrackChange("prev")}
                disabled={currentTrack === 1}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="bg-primary hover:bg-primary/80 w-16 h-16 rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTrackChange("next")}
                disabled={currentTrack === selectedGuide.tracks}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const audio = audioRef.current;
                  if (audio) {
                    audio.muted = !audio.muted;
                    toast({
                      title: audio.muted ? "Audio Muted" : "Audio Unmuted",
                      description: audio.muted ? "Audio is now muted" : "Audio is now playing",
                    });
                  }
                }}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Track List */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Track List</h3>
            <div className="space-y-2">
              {Array.from({ length: selectedGuide.tracks }, (_, i) => (
                <div
                  key={i + 1}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack === i + 1 
                      ? "bg-primary/20 text-primary" 
                      : "hover:bg-white/10"
                  }`}
                  onClick={() => setCurrentTrack(i + 1)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <span>Track {i + 1}: {
                      i === 0 ? "Introduction to Sacred Spaces" :
                      i === 1 ? "History and Foundation" :
                      i === 2 ? "Architecture and Design" :
                      i === 3 ? "Prayer Halls and Artifacts" :
                      i === 4 ? "Monk Quarters and Daily Life" :
                      i === 5 ? "Buddhist Traditions" :
                      i === 6 ? "Cultural Significance" :
                      i === 7 ? "Spiritual Practices" :
                      i === 8 ? "Festival Celebrations" :
                      i === 9 ? "Restoration and Conservation" :
                      i === 10 ? "Community and Pilgrimage" :
                      "Sacred Teachings and Wisdom"
                    }</span>
                  </div>
                  <span className="text-sm text-gray-400">{Math.floor(Math.random() * 5) + 2}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${audioGuideHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Audio <span className="text-primary">Guide</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in">
            Professional Narration in Multiple Languages
          </p>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto animate-fade-in">
            Enhance your monastery visits with our intelligent audio guides. Available in multiple languages with offline capability for remote locations.
          </p>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-float opacity-60" />
        <div className="absolute top-32 right-16 w-6 h-6 bg-primary-glow rounded-full animate-float opacity-40" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-accent rounded-full animate-float opacity-50" style={{ animationDelay: "2s" }} />
      </section>
      
      {/* Content Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-morphism">
          <CardContent className="p-6 text-center">
            <Headphones className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">High Quality Audio</h3>
            <p className="text-sm text-muted-foreground">
              Professional narration by monks and cultural experts
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism">
          <CardContent className="p-6 text-center">
            <Languages className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Multiple Languages</h3>
            <p className="text-sm text-muted-foreground">
              Available in English, Hindi, Nepali and Tibetan
            </p>
          </CardContent>
        </Card>
        <Card className="glass-morphism">
          <CardContent className="p-6 text-center">
            <Download className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-bold mb-2">Offline Access</h3>
            <p className="text-sm text-muted-foreground">
              Download guides for use in remote monastery locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Audio Guides Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {audioGuides.map((guide) => (
          <Card key={guide.id} className="group hover:shadow-heritage transition-all duration-300 glass-morphism">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{guide.title}</CardTitle>
                <Badge variant="secondary">{guide.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{guide.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{guide.duration}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tracks:</span>
                  <p className="font-medium">{guide.tracks}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <p className="font-medium">{guide.size}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">Offline Ready</span>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Languages:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {guide.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={() => setSelectedGuide(guide)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Guide
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownload(guide)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
        </div>
      </section>
    </div>
  );
};
