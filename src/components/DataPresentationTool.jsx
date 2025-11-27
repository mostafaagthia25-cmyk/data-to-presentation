'use client';

import React, { useState } from 'react';
import { Upload, FileText, FileSpreadsheet, FileCode, Sparkles, Wand2, Eye, Download, Settings, Zap, ChevronRight, BarChart3, PieChart, TrendingUp, Layout, Maximize2, RotateCw, Calendar, FlipHorizontal, PlayCircle, X, AlertCircle } from 'lucide-react';
import { transformFileToPresentation } from '../utils/geminiAPI';

export default function DataPresentationTool() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedFeatures, setSelectedFeatures] = useState(['expandable', 'bar', 'animations']);
  const [showPreview, setShowPreview] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState(['#9333ea', '#c026d3']);
  const [generatedHTML, setGeneratedHTML] = useState('');
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  const fileTypes = [
    { icon: FileSpreadsheet, name: 'Excel', ext: '.xlsx, .xls', color: 'from-emerald-500 to-teal-600' },
    { icon: FileText, name: 'CSV', ext: '.csv', color: 'from-blue-500 to-cyan-600' },
    { icon: FileCode, name: 'Word', ext: '.docx, .doc', color: 'from-indigo-500 to-blue-600' },
    { icon: FileText, name: 'Text', ext: '.txt', color: 'from-slate-500 to-gray-600' },
  ];

  const stylePresets = [
    { id: 'modern', name: 'Modern', gradient: 'from-violet-600 via-purple-600 to-fuchsia-600' },
    { id: 'minimal', name: 'Minimal', gradient: 'from-slate-700 via-gray-800 to-zinc-900' },
    { id: 'corporate', name: 'Corporate', gradient: 'from-blue-600 via-indigo-600 to-blue-800' },
    { id: 'vibrant', name: 'Vibrant', gradient: 'from-pink-500 via-rose-500 to-orange-500' },
  ];

  const colorPalettes = [
    { id: 'purple-fuchsia', name: 'Purple Fusion', colors: ['#9333ea', '#c026d3'], preview: 'from-purple-600 to-fuchsia-600' },
    { id: 'blue-cyan', name: 'Ocean Breeze', colors: ['#0284c7', '#06b6d4'], preview: 'from-sky-600 to-cyan-500' },
    { id: 'emerald-teal', name: 'Forest Fresh', colors: ['#059669', '#14b8a6'], preview: 'from-emerald-600 to-teal-500' },
    { id: 'orange-red', name: 'Sunset Glow', colors: ['#ea580c', '#dc2626'], preview: 'from-orange-600 to-red-600' },
    { id: 'pink-rose', name: 'Romantic Rose', colors: ['#ec4899', '#f43f5e'], preview: 'from-pink-600 to-rose-600' },
    { id: 'indigo-violet', name: 'Royal Purple', colors: ['#6366f1', '#8b5cf6'], preview: 'from-indigo-600 to-violet-600' },
  ];

  const interactiveFeatures = [
    { id: 'expandable', name: 'Expandable Cards', icon: Maximize2, desc: 'Click to reveal more content' },
    { id: 'flipping', name: 'Flip Cards', icon: FlipHorizontal, desc: 'Interactive card flips' },
    { id: 'popout', name: 'Pop-out Cards', icon: Layout, desc: 'Modal overlays on click' },
    { id: 'timeline', name: 'Timeline Charts', icon: Calendar, desc: 'Chronological data flow' },
    { id: 'pie', name: 'Pie Charts', icon: PieChart, desc: 'Circular data visualization' },
    { id: 'bar', name: 'Bar Charts', icon: BarChart3, desc: 'Comparative bar graphs' },
    { id: 'line', name: 'Line Charts', icon: TrendingUp, desc: 'Trend analysis lines' },
    { id: 'animations', name: 'Scroll Animations', icon: PlayCircle, desc: 'Reveal on scroll' },
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setError('');
    }
  };

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleConvert = async () => {
    if (!uploadedFile) {
      setError('Please upload a file first');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessingStatus('Reading file...');

    try {
      setProcessingStatus('Analyzing content...');
      
      const userSettings = {
        selectedStyle,
        selectedColors,
        selectedFeatures,
        customDescription
      };

      setProcessingStatus('Generating presentation with AI...');
      const htmlOutput = await transformFileToPresentation(uploadedFile, userSettings);
      
      setGeneratedHTML(htmlOutput);
      setShowPreview(true);
      setProcessingStatus('Complete!');
      
    } catch (err) {
      console.error('Conversion error:', err);
      setError(err.message || 'Failed to convert file. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingStatus(''), 2000);
    }
  };

  const handleExport = () => {
    if (!generatedHTML) return;
    
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${uploadedFile.name.split('.')[0]}-presentation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFullPreview = () => {
    if (!generatedHTML) return;
    
    const blob = new Blob([generatedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-1/2 left-1/2 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">
              AI-Powered by Gemini
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-fuchsia-200 bg-clip-text text-transparent leading-tight">
            Transform Data Into Visual Stories
          </h1>
          
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Upload your documents and watch as advanced AI converts them into stunning, interactive HTML presentations
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-1">Error</h4>
              <p className="text-sm text-red-300">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-5 space-y-6">
            <div 
              className={`relative group bg-white/5 backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 ${
                dragActive 
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
                  : 'border-white/10 hover:border-white/20'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!uploadedFile ? (
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 rounded-full">
                      <Upload className="w-12 h-12" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Drop Your Files Here</h3>
                    <p className="text-sm text-slate-400">or click to browse</p>
                  </div>

                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".xlsx,.xls,.csv,.docx,.doc,.txt"
                  />

                  <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                    {fileTypes.map((type, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group/icon">
                        <div className={`bg-gradient-to-br ${type.color} p-2 rounded-lg group-hover/icon:scale-110 transition-transform`}>
                          <type.icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-slate-400">{type.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{uploadedFile.name}</h4>
                      <p className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button 
                      onClick={() => {
                        setUploadedFile(null);
                        setGeneratedHTML('');
                        setShowPreview(false);
                      }}
                      className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>

                  <button 
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-purple-500/50"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-5 h-5 animate-spin" />
                        {processingStatus}
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Transform to Presentation
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDescriptionModal(true)}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Add Custom Instructions
                  </button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full animate-pulse w-full"></div>
                      </div>
                      <p className="text-xs text-center text-slate-400">{processingStatus}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">Style Preset</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {stylePresets.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all group ${
                      selectedStyle === style.id
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className={`h-16 rounded-lg bg-gradient-to-r ${style.gradient} mb-2 group-hover:scale-[1.02] transition-transform`}></div>
                    <p className="text-sm font-semibold">{style.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-lg font-bold">Color Palette</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {colorPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setSelectedColors(palette.colors)}
                    className={`p-3 rounded-xl border-2 transition-all group ${
                      selectedColors[0] === palette.colors[0]
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className={`h-12 rounded-lg bg-gradient-to-r ${palette.preview} mb-2 group-hover:scale-[1.02] transition-transform`}></div>
                    <p className="text-xs font-semibold">{palette.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Layout className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-lg font-bold">Interactive Features</h3>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {interactiveFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${
                      selectedFeatures.includes(feature.id)
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        selectedFeatures.includes(feature.id)
                          ? 'bg-purple-600'
                          : 'bg-white/10 group-hover:bg-white/20'
                      }`}>
                        <feature.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{feature.name}</h4>
                        <p className="text-xs text-slate-400">{feature.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedFeatures.includes(feature.id)
                          ? 'bg-purple-600 border-purple-600'
                          : 'border-white/30'
                      }`}>
                        {selectedFeatures.includes(feature.id) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400 text-center">
                  {selectedFeatures.length} features selected
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold">Preview</h3>
                </div>
                {generatedHTML && (
                  <button 
                    onClick={() => {
                      setGeneratedHTML('');
                      setShowPreview(false);
                    }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="aspect-[9/16] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 overflow-hidden relative group">
                {showPreview && generatedHTML ? (
                  <iframe
                    srcDoc={generatedHTML}
                    className="w-full h-full"
                    title="Preview"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-3 p-6">
                      <Eye className="w-12 h-12 mx-auto text-slate-600" />
                      <p className="text-sm text-slate-500">Upload and convert a file to see preview</p>
                    </div>
                  </div>
                )}

                {showPreview && (
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xl px-3 py-1 rounded-full text-xs">
                    Live
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <button 
                  onClick={handleFullPreview}
                  disabled={!generatedHTML}
                  className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="w-4 h-4" />
                  Full Preview
                </button>
                <button 
                  onClick={handleExport}
                  disabled={!generatedHTML}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export HTML
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-white/20 rounded-3xl max-w-2xl w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Custom Presentation Instructions</h3>
              <button 
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-300">
                  Describe your presentation requirements
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Example: Create a professional sales presentation with emphasis on Q3 revenue growth. Include comparison charts between this quarter and last quarter. Use a corporate style with blue color scheme. Add timeline showing key milestones..."
                  className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-sm mb-2 text-purple-300">💡 Tips for better results:</h4>
                <ul className="text-xs text-slate-300 space-y-1">
                  <li>• Specify the presentation purpose (sales, report, analysis, etc.)</li>
                  <li>• Mention key data points or metrics to highlight</li>
                  <li>• Describe the target audience (executives, clients, team)</li>
                  <li>• Include any specific visualizations you need</li>
                  <li>• Mention preferred tone (formal, casual, technical)</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCustomDescription('');
                    setShowDescriptionModal(false);
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 py-3 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 py-3 rounded-xl font-semibold transition-all"
                >
                  Save Instructions
                </button>
              </div>

              {customDescription && (
                <div className="text-center text-xs text-slate-400">
                  {customDescription.length} characters
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}