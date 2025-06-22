import { cx } from 'class-variance-authority';

interface ReportPosterProps {
  title: string;
  subtitle?: string;
  eventId?: string;
  alertLevel?: string;
}

export function ReportPoster({
  title,
  subtitle = 'Humanitarian Response Report',
  eventId,
  alertLevel = 'Green',
}: ReportPosterProps) {
  const alertLevelColor = {
    'Green': '#10B981',
    'Orange': '#F59E0B',
    'Red': '#EF4444'
  }[alertLevel] || '#6B7280';

  return (
    <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background with gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        {/* Alert level indicator */}
        {alertLevel && (
          <div className="mb-8">
            <div 
              className="inline-flex items-center px-6 py-3 rounded-full text-white font-bold text-lg uppercase tracking-wider shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${alertLevelColor} 0%, ${alertLevelColor}dd 100%)`,
                boxShadow: `0 10px 25px -5px ${alertLevelColor}40`
              }}
            >
              <div className="w-3 h-3 bg-white rounded-full mr-3 animate-pulse"></div>
              {alertLevel} Alert Level
            </div>
          </div>
        )}

        {/* Main title */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            {title}
          </span>
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-3xl font-light text-gray-300 mb-8 tracking-wide">
          {subtitle}
        </h2>

        {/* Event ID badge */}
        {eventId && (
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white">
            <span className="text-sm font-mono mr-2">Event ID:</span>
            <span className="font-bold text-lg">{eventId}</span>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="absolute top-0 right-1/4 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 left-1/3 w-px h-32 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
          <div className="absolute bottom-0 right-1/3 w-px h-32 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
        </div>

        {/* Loading animation */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-3">
            <div className="w-4 h-4 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Status text */}
        <p className="mt-6 text-white/60 text-lg font-medium">
          Generating comprehensive report...
        </p>
      </div>

      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ 
          background: `linear-gradient(90deg, transparent 0%, ${alertLevelColor} 50%, transparent 100%)`
        }}
      ></div>
    </div>
  );
} 