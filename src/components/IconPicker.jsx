import { useState, useMemo } from 'react'
import * as LucideIcons from 'lucide-react'
import { Search, Activity, BarChart3, Calendar, CheckCircle, Clock, Coffee, Heart, Home, Moon, Music, Target, Trophy, Zap, Star, Gift, Smile, Sun, TrendingUp, Users, Settings, Bell, Bookmark, Camera, Car, Code, Database, Eye, FileText, Flag, Globe, Headphones, Image, Key, Laptop, MapPin, MessageCircle, Monitor, Package, Phone, Play, Printer, Shield, ShoppingCart, Smartphone, Speaker, Tag, ThumbsUp, Video, Wifi, Award, Battery, Bluetooth, Box, Briefcase, Building, Calculator, CreditCard, Crown, DollarSign, Download, Edit, ExternalLink, Filter, Folder, Hash, HelpCircle, Info, Link, List, Lock, Mail, Maximize, Minimize, MoreHorizontal, MoreVertical, Navigation, Paperclip, Pause, Percent, Plus, Power, RefreshCw, RefreshCcw, RotateCcw, RotateCw, Save, Scissors, Send, Server, Share, Share2, Shuffle, SkipBack, SkipForward, Slash, Sliders, Square, StopCircle, Trash, Trash2, Upload, Volume, Volume1, Volume2, VolumeX, X, XCircle, XSquare } from 'lucide-react'

// Manual list of icons we know exist
const iconList = [
  'Activity', 'BarChart3', 'Calendar', 'CheckCircle', 'Clock', 'Coffee', 
  'Heart', 'Home', 'Moon', 'Music', 'Target', 'Trophy', 'Zap', 'Star', 
  'Gift', 'Smile', 'Sun', 'TrendingUp', 'Users', 'Settings', 'Bell', 
  'Bookmark', 'Camera', 'Car', 'Code', 'Database', 'Eye', 'FileText', 
  'Flag', 'Globe', 'Headphones', 'Image', 'Key', 'Laptop', 'MapPin', 
  'MessageCircle', 'Monitor', 'Package', 'Phone', 'Play', 'Printer', 
  'Shield', 'ShoppingCart', 'Smartphone', 'Speaker', 'Tag', 'ThumbsUp', 
  'Video', 'Wifi', 'Award', 'Battery', 'Bluetooth', 'Box', 'Briefcase', 
  'Building', 'Calculator', 'CreditCard', 'Crown', 'DollarSign', 
  'Download', 'Edit', 'ExternalLink', 'Filter', 'Folder', 'Hash', 
  'HelpCircle', 'Info', 'Link', 'List', 'Lock', 'Mail', 'Maximize', 
  'Minimize', 'MoreHorizontal', 'MoreVertical', 'Navigation', 'Paperclip', 
  'Pause', 'Percent', 'Plus', 'Power', 'RefreshCw', 'RefreshCcw', 
  'RotateCcw', 'RotateCw', 'Save', 'Scissors', 'Send', 'Server', 'Share', 
  'Share2', 'Shuffle', 'SkipBack', 'SkipForward', 'Slash', 'Sliders', 
  'Square', 'StopCircle', 'Trash', 'Trash2', 'Upload', 'Volume', 
  'Volume1', 'Volume2', 'VolumeX', 'X', 'XCircle', 'XSquare'
]

// Popular icons subset
const popularIcons = [
  'Activity', 'BarChart3', 'Calendar', 'CheckCircle', 'Clock', 'Coffee', 
  'Heart', 'Home', 'Moon', 'Music', 'Target', 'Trophy', 'Zap', 'Star', 
  'Gift', 'Smile', 'Sun', 'TrendingUp', 'Users', 'Settings', 'Bell', 
  'Bookmark', 'Camera', 'Car', 'Code', 'Database', 'Eye', 'FileText', 
  'Flag', 'Globe', 'Headphones', 'Image', 'Key', 'Laptop', 'MapPin', 
  'MessageCircle', 'Monitor', 'Package', 'Phone', 'Play', 'Printer', 
  'Shield', 'ShoppingCart', 'Smartphone', 'Speaker', 'Tag', 'ThumbsUp', 
  'Video', 'Wifi', 'Award', 'Battery', 'Bluetooth', 'Box', 'Briefcase', 
  'Building', 'Calculator', 'CreditCard', 'Crown', 'DollarSign', 
  'Download', 'Edit', 'ExternalLink', 'Filter', 'Folder', 'Hash', 
  'HelpCircle', 'Info', 'Link', 'List', 'Lock', 'Mail', 'Maximize', 
  'Minimize', 'MoreHorizontal', 'MoreVertical', 'Navigation', 'Paperclip', 
  'Pause', 'Percent', 'Plus', 'Power', 'RefreshCw', 'RefreshCcw', 
  'RotateCcw', 'RotateCw', 'Save', 'Scissors', 'Send', 'Server', 'Share', 
  'Share2', 'Shuffle', 'SkipBack', 'SkipForward', 'Slash', 'Sliders', 
  'Square', 'StopCircle', 'Trash', 'Trash2', 'Upload', 'Volume', 
  'Volume1', 'Volume2', 'VolumeX', 'X', 'XCircle', 'XSquare'
]

export default function IconPicker({ value, onChange, onClose }) {
  const [search, setSearch] = useState('')
  
  const filteredIcons = useMemo(() => {
    if (!search) {
      // Show popular icons first, then all others
      const otherIcons = iconList.filter(icon => !popularIcons.includes(icon))
      return [...popularIcons, ...otherIcons]
    }
    return iconList.filter(icon => 
      icon.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="fixed inset-0 z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl card rounded-2xl shadow-xl animate-slide-up">
          <div className="p-6 border-b theme-border">
            <h3 className="text-lg font-semibold theme-text mb-4">Choose an icon</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 theme-text-secondary" />
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 theme-bg-secondary theme-border rounded-xl theme-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent-focus focus:border-accent-border"
              />
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {!search && (
              <div className="mb-4">
                <h4 className="text-sm font-medium theme-text-secondary mb-3">Popular Icons</h4>
                <div className="grid grid-cols-8 gap-2 mb-6">
                  {popularIcons.map(iconName => {
                    const IconComponent = LucideIcons[iconName]
                    const isSelected = value === iconName
                    
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          onChange(iconName)
                          onClose()
                        }}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                          isSelected 
                            ? 'accent-border accent-bg' 
                            : 'theme-border hover:theme-bg-secondary'
                        }`}
                        title={iconName}
                      >
                        <IconComponent className="w-5 h-5 theme-text" />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-8 gap-2">
              {filteredIcons.map(iconName => {
                const IconComponent = LucideIcons[iconName]
                const isSelected = value === iconName
                
                return (
                  <button
                    key={iconName}
                    onClick={() => {
                      onChange(iconName)
                      onClose()
                    }}
                    className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center justify-center ${
                      isSelected 
                        ? 'accent-border accent-bg' 
                        : 'theme-border hover:theme-bg-secondary'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="w-5 h-5 theme-text" />
                  </button>
                )
              })}
            </div>
            
            {filteredIcons.length === 0 && (
              <div className="text-center py-8">
                <div className="theme-text-secondary mb-2">No icons found</div>
                <div className="text-sm text-muted">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
